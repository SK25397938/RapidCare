import { useEffect, useMemo, useRef, useState } from "react";
import { getHospitalOperationalState } from "../utils/hospitalStatus";
import {
  AMBULANCE_ORIGIN,
  COMMAND_CENTER,
  enrichHospitalMetrics,
  getFallbackHospitals,
  interpolatePosition,
  pickBestHospital,
  rankHospitals,
} from "../utils/triage";
import {
  assignAmbulance as assignAmbulanceRequest,
  confirmReservation as confirmReservationRequest,
  reserveBed as reserveBedRequest,
  searchHospitals as searchHospitalsRequest,
} from "../api/rapidcareApi";

const HOLD_WINDOW_MS = 5 * 60 * 1000;

function buildMockShareLink(reservationId, hospitalId) {
  const token = reservationId || hospitalId || "rapidcare";
  return `https://rapidcare.app/share/${token}`;
}

export function useEmergencyFlow(hospitals, options = {}) {
  const surgeMode = options.surgeMode ?? false;
  const [selectedHospitalId, setSelectedHospitalId] = useState(null);
  const [searchState, setSearchState] = useState("idle");
  const [searchMessage, setSearchMessage] = useState("Waiting for patient routing request.");
  const [reservation, setReservation] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [holdClock, setHoldClock] = useState(Date.now());
  const [bestMatchId, setBestMatchId] = useState(null);
  const [searchOverrides, setSearchOverrides] = useState({});
  const [ambulanceOrigin, setAmbulanceOrigin] = useState(AMBULANCE_ORIGIN);
  const searchTimeoutRef = useRef(null);

  const enrichedHospitals = useMemo(
    () =>
      hospitals.map((hospital) =>
        enrichHospitalMetrics(
          {
            ...hospital,
            ...(searchOverrides[hospital.id] ?? {}),
          },
          { origin: COMMAND_CENTER, surgeMode }
        )
      ),
    [hospitals, searchOverrides, surgeMode]
  );

  const rankedHospitals = useMemo(
    () => rankHospitals(enrichedHospitals, { reservation }),
    [enrichedHospitals, reservation]
  );

  const selectedHospital =
    rankedHospitals.find((hospital) => hospital.id === selectedHospitalId) ?? rankedHospitals[0] ?? null;

  const bestHospital = useMemo(
    () => pickBestHospital(enrichedHospitals, { reservation }),
    [enrichedHospitals, reservation]
  );

  const fallbackHospitals = useMemo(() => getFallbackHospitals(enrichedHospitals), [enrichedHospitals]);

  useEffect(() => {
    if (!rankedHospitals.length) {
      setSelectedHospitalId(null);
      return;
    }

    setSelectedHospitalId((current) => {
      if (current && rankedHospitals.some((hospital) => hospital.id === current)) {
        return current;
      }

      return rankedHospitals[0].id;
    });
  }, [rankedHospitals]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setHoldClock(Date.now());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!reservation || reservation.status !== "held") {
      return;
    }

    if (reservation.expiresAt <= holdClock) {
      setReservation(null);
      setSearchState("selected");
      setSearchMessage("Temporary hold expired. Reconfirm a hospital to continue.");
    }
  }, [holdClock, reservation]);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        window.clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const activeHospital =
    rankedHospitals.find((hospital) => hospital.id === reservation?.hospitalId) ?? selectedHospital ?? null;

  const currentState = activeHospital ? getHospitalOperationalState(activeHospital, reservation) : null;

  const holdTimeRemaining = reservation?.status === "held"
    ? Math.max(0, Math.ceil((reservation.expiresAt - holdClock) / 1000))
    : 0;

  const noBedsAvailable = !bestHospital;

  const emergencySearch = async () => {
    if (searchTimeoutRef.current) {
      window.clearTimeout(searchTimeoutRef.current);
    }

    setPanelOpen(true);
    setSearchState("searching");
    setSearchMessage("Finding best ICU...");
    setReservation(null);
    setBestMatchId(null);

    searchTimeoutRef.current = window.setTimeout(async () => {
      try {
        const response = await searchHospitalsRequest({
          lat: COMMAND_CENTER.lat,
          lng: COMMAND_CENTER.lng,
          emergency_type: "trauma",
        });

        const rankedMatches = response.hospitals ?? [];

        if (rankedMatches.length > 0) {
          const overrideMap = rankedMatches.reduce((lookup, hospital, index) => {
            lookup[String(hospital.id)] = {
              beds: hospital.available_beds,
              etaMinutes: hospital.eta_minutes,
              distanceKm: hospital.distance_km,
              type: hospital.specialization ?? hospital.type,
              bestMatch: index === 0,
              updatedAt: hospital.updated_at ?? new Date().toISOString(),
            };
            return lookup;
          }, {});

          setSearchOverrides((current) => ({
            ...current,
            ...overrideMap,
          }));
          setBestMatchId(String(rankedMatches[0].id));
          setSelectedHospitalId(String(rankedMatches[0].id));
          setSearchState("selected");
          setSearchMessage("Best-fit ICU found. Review the recommendation and reserve the bed.");
          return;
        }
      } catch {
        // Fall back to the client-side ranking for demo reliability.
      }

      if (bestHospital) {
        setSelectedHospitalId(bestHospital.id);
        setBestMatchId(bestHospital.id);
        setSearchState("selected");
        setSearchMessage("Best-fit ICU found. Review the recommendation and reserve the bed.");
      } else {
        setSearchState("expanded");
        setSearchMessage("Expanding search radius...");
      }
    }, 1800);
  };

  const selectHospital = (hospitalId) => {
    setSelectedHospitalId(hospitalId);
    setPanelOpen(true);
    setSearchState((current) => (current === "idle" ? "selected" : current));
    setSearchMessage("Hospital selected. Review routing and reserve if appropriate.");
  };

  const reserveHospital = async (hospitalId) => {
    setSelectedHospitalId(hospitalId);
    setPanelOpen(true);
    setSearchState("searching");
    setSearchMessage("Placing temporary bed hold...");

    try {
      const response = await reserveBedRequest({ hospital_id: hospitalId });

      setReservation({
        hospitalId,
        reservationId: response.reservation_id,
        status: "held",
        source: "manual",
        shareLink: buildMockShareLink(response.reservation_id, hospitalId),
        expiresAt: new Date(response.hold_until).getTime(),
        createdAt: Date.now(),
      });
      setSearchState("held");
      setSearchMessage("Bed temporarily reserved. Confirm to lock dispatch.");
      return;
    } catch {
      setReservation({
        hospitalId,
        status: "held",
        source: "manual",
        shareLink: buildMockShareLink(null, hospitalId),
        expiresAt: Date.now() + HOLD_WINDOW_MS,
        createdAt: Date.now(),
      });
      setSearchState("held");
      setSearchMessage("Bed temporarily reserved. Confirm to lock dispatch.");
    }
  };

  const confirmReservation = async () => {
    if (!reservation) {
      return;
    }

    let updatedReservation = {
      ...reservation,
      status: "reserved",
    };

    try {
      if (reservation.reservationId) {
        const response = await confirmReservationRequest({
          reservation_id: reservation.reservationId,
        });

        updatedReservation = {
          ...updatedReservation,
          shareLink: buildMockShareLink(response.reservation_id, reservation.hospitalId),
        };
      }
    } catch {
      // Keep the local demo flow responsive even if the backend is offline.
    }

    setReservation((current) =>
      current
        ? {
            ...updatedReservation,
          }
        : current
    );
    setSearchState("reserved");
    setSearchMessage("Bed reserved. Ambulance route is being tracked live.");

    try {
      const ambulanceResponse = await assignAmbulanceRequest({
        lat: COMMAND_CENTER.lat,
        lng: COMMAND_CENTER.lng,
      });

      setAmbulanceOrigin({
        lat: ambulanceResponse.current_lat ?? ambulanceResponse.lat ?? AMBULANCE_ORIGIN.lat,
        lng: ambulanceResponse.current_lng ?? ambulanceResponse.lng ?? AMBULANCE_ORIGIN.lng,
      });
    } catch {
      setAmbulanceOrigin(AMBULANCE_ORIGIN);
    }
  };

  const workflowSteps = [
    {
      id: "search",
      label: "Search",
      active: searchState === "searching",
      completed: ["selected", "held", "reserved", "tracking"].includes(searchState),
    },
    {
      id: "select",
      label: "Select",
      active: searchState === "selected",
      completed: ["held", "reserved", "tracking"].includes(searchState),
    },
    {
      id: "reserve",
      label: "Reserve",
      active: searchState === "held",
      completed: ["reserved", "tracking"].includes(searchState),
    },
    {
      id: "track",
      label: "Track",
      active: ["reserved", "tracking"].includes(searchState),
      completed: false,
    },
  ];

  const [ambulanceSnapshot, setAmbulanceSnapshot] = useState({
    active: false,
    phase: "idle",
    progress: 0,
    position: AMBULANCE_ORIGIN,
    etaMinutes: 0,
    distanceKm: 0,
  });

  useEffect(() => {
    if (!activeHospital || !reservation) {
      setAmbulanceSnapshot({
        active: false,
        phase: "idle",
        progress: 0,
        position: ambulanceOrigin,
        etaMinutes: 0,
        distanceKm: 0,
      });
      return;
    }

    const totalDistanceKm = Math.max(1.2, enrichHospitalMetrics(activeHospital, { origin: ambulanceOrigin, surgeMode }).distanceKm);
    const totalSeconds = Math.max(45, activeHospital.etaMinutes * 6);
    const startedAt = Date.now();

    const intervalId = window.setInterval(() => {
      const elapsedSeconds = (Date.now() - startedAt) / 1000;
      const progress = Math.min(1, elapsedSeconds / totalSeconds);
      const phase = progress < 0.2 ? "assigned" : progress < 0.85 ? "en_route" : "arriving";

      setAmbulanceSnapshot({
        active: true,
        phase,
        progress,
        position: interpolatePosition(progress, ambulanceOrigin, activeHospital),
        etaMinutes: Math.max(1, Math.ceil((1 - progress) * activeHospital.etaMinutes)),
        distanceKm: Math.max(0, Number((totalDistanceKm * (1 - progress)).toFixed(1))),
      });

      if (progress >= 0.15 && reservation.status === "reserved") {
        setSearchState("tracking");
      }
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [activeHospital, ambulanceOrigin, reservation, surgeMode]);

  return {
    activeHospital,
    ambulanceSnapshot,
    bestMatchId,
    currentState,
    fallbackHospitals,
    holdTimeRemaining,
    noBedsAvailable,
    panelOpen,
    rankedHospitals,
    reservation,
    searchMessage,
    searchState,
    selectHospital,
    shareLink: reservation?.shareLink ?? buildMockShareLink(null, selectedHospitalId),
    reserveHospital,
    confirmReservation,
    selectedHospital,
    selectedHospitalId,
    setPanelOpen,
    startEmergencySearch: emergencySearch,
    workflowSteps,
  };
}
