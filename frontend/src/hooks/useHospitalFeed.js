import { useEffect, useMemo, useState } from "react";
import { mockHospitals } from "../data/mockHospitals";

function normalizeHospital(hospital, index) {
  return {
    id: String(hospital.id ?? `hospital-${index + 1}`),
    name: hospital.name ?? `Hospital ${index + 1}`,
    beds: Number.isFinite(Number(hospital.beds)) ? Number(hospital.beds) : 0,
    type: hospital.type ?? "General",
    lat: Number(hospital.lat) || mockHospitals[index % mockHospitals.length].lat,
    lng: Number(hospital.lng) || mockHospitals[index % mockHospitals.length].lng,
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
  const [hospitals, setHospitals] = useState(mockHospitals);
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
            setHospitals(payload.map(normalizeHospital));
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
      setHospitals((currentHospitals) =>
        currentHospitals.map((hospital) => {
          const offset = Math.floor(Math.random() * 3) - 1;
          return {
            ...hospital,
            beds: Math.max(0, hospital.beds + offset),
          };
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

  return useMemo(
    () => ({
      hospitals,
      connectionState,
      lastUpdated: formatUpdatedTime(lastUpdatedAt),
    }),
    [connectionState, hospitals, lastUpdatedAt]
  );
}
