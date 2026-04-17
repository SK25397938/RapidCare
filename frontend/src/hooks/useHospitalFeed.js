import { useEffect, useMemo, useState } from "react";
import { mockHospitals } from "../data/mockHospitals";
import { getConfidenceState } from "../utils/hospitalStatus";
import { supabase } from "../lib/supabase";
import { supabaseConfigured } from "../lib/runtimeConfig";

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

function resolveHospitalType(hospital) {
  return (
    hospital.specialization ??
    hospital.icu_specialization ??
    hospital.icu_type ??
    hospital.type ??
    "General"
  );
}

function getBedAvailabilityCounts(beds) {
  const now = Date.now();

  return beds.reduce(
    (summary, bed) => {
      const holdUntil = bed.hold_until ? new Date(bed.hold_until).getTime() : null;
      const isExpiredHold = bed.status === "held" && holdUntil && holdUntil < now;

      if (bed.status === "available" || isExpiredHold) {
        summary.available += 1;
      }

      summary.updatedAt = [summary.updatedAt, bed.updated_at, bed.hold_until]
        .filter(Boolean)
        .sort()
        .at(-1) ?? summary.updatedAt;

      return summary;
    },
    { available: 0, updatedAt: null }
  );
}

function createSupabaseSnapshot(hospitalRows, bedRows) {
  const bedsByHospitalId = bedRows.reduce((lookup, bed) => {
    const hospitalId = String(bed.hospital_id ?? bed.hospitalId ?? "");
    if (!lookup[hospitalId]) {
      lookup[hospitalId] = [];
    }

    lookup[hospitalId].push(bed);
    return lookup;
  }, {});

  return hospitalRows.map((hospital, index) => {
    const hospitalId = String(hospital.id ?? hospital.hospital_id ?? `hospital-${index + 1}`);
    const bedSummary = getBedAvailabilityCounts(bedsByHospitalId[hospitalId] ?? []);

    return normalizeHospital(
      {
        id: hospitalId,
        name: hospital.name ?? hospital.hospital_name ?? `Hospital ${index + 1}`,
        beds: bedSummary.available || hospital.available_beds || 0,
        type: resolveHospitalType(hospital),
        lat: hospital.lat ?? hospital.latitude,
        lng: hospital.lng ?? hospital.longitude,
        updatedAt: bedSummary.updatedAt ?? hospital.updated_at ?? hospital.updatedAt,
      },
      index
    );
  });
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
    if (!supabaseConfigured || !supabase) {
      setConnectionState("mock mode");

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
      };
    }

    let cancelled = false;
    let hospitalChannel;
    let bedChannel;

    async function loadSnapshot() {
      try {
        const [hospitalResponse, bedResponse] = await Promise.all([
          supabase.from("hospitals").select("*"),
          supabase.from("beds").select("*"),
        ]);

        if (hospitalResponse.error) {
          throw hospitalResponse.error;
        }

        if (bedResponse.error) {
          throw bedResponse.error;
        }

        if (!cancelled) {
          setHospitals(createSupabaseSnapshot(hospitalResponse.data ?? [], bedResponse.data ?? []));
          setConnectionState("live");
          setLastUpdatedAt(new Date());
        }
      } catch {
        if (!cancelled) {
          setConnectionState("sync error");
        }
      }
    }

    loadSnapshot();

    hospitalChannel = supabase
      .channel("rapidcare-hospitals")
      .on("postgres_changes", { event: "*", schema: "public", table: "hospitals" }, loadSnapshot)
      .subscribe();

    bedChannel = supabase
      .channel("rapidcare-beds")
      .on("postgres_changes", { event: "*", schema: "public", table: "beds" }, loadSnapshot)
      .subscribe();

    return () => {
      cancelled = true;
      if (hospitalChannel) {
        supabase.removeChannel(hospitalChannel);
      }
      if (bedChannel) {
        supabase.removeChannel(bedChannel);
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
