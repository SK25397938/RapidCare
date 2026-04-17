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

const HOLD_WINDOW_MS = 4 * 60 * 1000;

export function useEmergencyFlow(hospitals, options = {}) {
  const surgeMode = options.surgeMode ?? false;
  const [selectedHospitalId, setSelectedHospitalId] = useState(null);
  const [searchState, setSearchState] = useState("idle");
  const [searchMessage, setSearchMessage] = useState("Waiting for patient routing request.");
  const [reservation, setReservation] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [holdClock, setHoldClock] = useState(Date.now());
  const searchTimeoutRef = useRef(null);

  const enrichedHospitals = useMemo(
    () => hospitals.map((hospital) => enrichHospitalMetrics(hospital, { origin: COMMAND_CENTER, surgeMode })),
    [hospitals, surgeMode]
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

  const emergencySearch = () => {
    if (searchTimeoutRef.current) {
      window.clearTimeout(searchTimeoutRef.current);
    }

    setPanelOpen(true);
    setSearchState("searching");
    setSearchMessage("Finding best ICU...");
    setReservation(null);

    searchTimeoutRef.current = window.setTimeout(() => {
      if (bestHospital) {
        setSelectedHospitalId(bestHospital.id);
        setReservation({
          hospitalId: bestHospital.id,
          status: "held",
          source: "auto",
          expiresAt: Date.now() + HOLD_WINDOW_MS,
          createdAt: Date.now(),
        });
        setSearchState("held");
        setSearchMessage("Best-fit ICU found. Temporary hold active while dispatch is assigned.");
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

  const reserveHospital = (hospitalId) => {
    setSelectedHospitalId(hospitalId);
    setPanelOpen(true);
    setReservation({
      hospitalId,
      status: "held",
      source: "manual",
      expiresAt: Date.now() + HOLD_WINDOW_MS,
      createdAt: Date.now(),
    });
    setSearchState("held");
    setSearchMessage("Temporary hold placed. Confirm reservation to secure dispatch.");
  };

  const confirmReservation = () => {
    if (!reservation) {
      return;
    }

    setReservation((current) =>
      current
        ? {
            ...current,
            status: "reserved",
          }
        : current
    );
    setSearchState("reserved");
    setSearchMessage("Bed reserved. Ambulance route is being tracked live.");
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
        position: AMBULANCE_ORIGIN,
        etaMinutes: 0,
        distanceKm: 0,
      });
      return;
    }

    const totalDistanceKm = Math.max(1.2, enrichHospitalMetrics(activeHospital, { origin: AMBULANCE_ORIGIN, surgeMode }).distanceKm);
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
        position: interpolatePosition(progress, AMBULANCE_ORIGIN, activeHospital),
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
  }, [activeHospital, reservation, surgeMode]);

  return {
    activeHospital,
    ambulanceSnapshot,
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
    reserveHospital,
    confirmReservation,
    selectedHospital,
    selectedHospitalId,
    setPanelOpen,
    startEmergencySearch: emergencySearch,
    workflowSteps,
  };
}
