import { useEffect, useMemo, useState } from "react";
import { mockHospitals } from "../data/mockHospitals";
import { getConfidenceState } from "../utils/hospitalStatus";

const freshnessOffsets = {
  h1: 18_000,
  h2: 84_000,
  h3: 365_000,
  h4: 28_000,
  h5: 148_000,
  h6: 46_000,
  h7: 332_000,
  h8: 58_000,
};

function normalizeHospital(hospital, index) {
  const fallbackHospital = mockHospitals[index % mockHospitals.length];
  const updatedAt = hospital.updatedAt ?? new Date(Date.now() - (freshnessOffsets[hospital.id] ?? 45_000)).toISOString();

  return {
    id: String(hospital.id ?? `hospital-${index + 1}`),
    name: hospital.name ?? `Hospital ${index + 1}`,
    beds: Number.isFinite(Number(hospital.beds)) ? Number(hospital.beds) : 0,
    type: hospital.type ?? "General",
    lat: Number(hospital.lat) || fallbackHospital.lat,
    lng: Number(hospital.lng) || fallbackHospital.lng,
    updatedAt,
  };
}

function formatUpdatedTime(date) {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

export function useHospitalFeed() {
  const [hospitals, setHospitals] = useState(mockHospitals.map(normalizeHospital));
  const [connectionState, setConnectionState] = useState("connecting");
  const [lastUpdatedAt, setLastUpdatedAt] = useState(new Date());

  useEffect(() => {
    let socket;

    try {
      socket = new WebSocket("ws://127.0.0.1:8000/ws");

      socket.onopen = () => {
        setConnectionState("live");
      };

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (Array.isArray(payload) && payload.length) {
            const now = Date.now();
            setHospitals(
              payload.map((hospital, index) =>
                normalizeHospital({
                  ...hospital,
                  updatedAt: new Date(now - (freshnessOffsets[hospital.id] ?? 40_000)).toISOString(),
                }, index)
              )
            );
            setLastUpdatedAt(new Date());
          }
        } catch {
          setConnectionState("sync error");
        }
      };

      socket.onerror = () => {
        setConnectionState("mock mode");
      };

      socket.onclose = () => {
        setConnectionState((current) => (current === "live" ? "reconnecting" : "mock mode"));
      };
    } catch {
      setConnectionState("mock mode");
    }

    const intervalId = window.setInterval(() => {
      const now = Date.now();

      setHospitals((currentHospitals) =>
        currentHospitals.map((hospital, index) => {
          const offset = Math.floor(Math.random() * 3) - 1;
          const freshnessBias = (freshnessOffsets[hospital.id] ?? 30_000) + ((now / 1000 + index * 17) % 24) * 1000;

          return normalizeHospital({
            ...hospital,
            beds: Math.max(0, hospital.beds + offset),
            updatedAt: new Date(now - freshnessBias).toISOString(),
          }, index);
        })
      );
      setLastUpdatedAt(new Date());
    }, 12000);

    return () => {
      window.clearInterval(intervalId);
      if (socket && socket.readyState <= 1) {
        socket.close();
      }
    };
  }, []);

  return useMemo(() => {
    const freshestHospital = hospitals.reduce((latest, hospital) => {
      if (!latest) {
        return hospital;
      }

      return new Date(hospital.updatedAt).getTime() > new Date(latest.updatedAt).getTime() ? hospital : latest;
    }, null);

    return {
      hospitals,
      connectionState,
      lastUpdated: formatUpdatedTime(lastUpdatedAt),
      latestUpdateHealth: freshestHospital ? getConfidenceState(freshestHospital.updatedAt) : getConfidenceState(new Date().toISOString()),
    };
  }, [connectionState, hospitals, lastUpdatedAt]);
}
