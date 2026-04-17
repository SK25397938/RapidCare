const STATUS_META = {
  available: {
    key: "available",
    label: "Beds Available",
    shortLabel: "Open",
    ring: "#22c55e",
    glow: "#22c55e",
    shadow: "rgba(34,197,94,0.45)",
    pill: "border-emerald-400/30 bg-emerald-500/15 text-emerald-100",
  },
  limited: {
    key: "limited",
    label: "Limited",
    shortLabel: "Low",
    ring: "#f59e0b",
    glow: "#f59e0b",
    shadow: "rgba(245,158,11,0.45)",
    pill: "border-amber-400/30 bg-amber-500/15 text-amber-100",
  },
  full: {
    key: "full",
    label: "Full",
    shortLabel: "Full",
    ring: "#f43f5e",
    glow: "#f43f5e",
    shadow: "rgba(244,63,94,0.45)",
    pill: "border-rose-400/30 bg-rose-500/15 text-rose-100",
  },
  held: {
    key: "held",
    label: "Bed Held",
    shortLabel: "Hold",
    ring: "#38bdf8",
    glow: "#38bdf8",
    shadow: "rgba(56,189,248,0.45)",
    pill: "border-sky-400/30 bg-sky-500/15 text-sky-100",
  },
  reserved: {
    key: "reserved",
    label: "Reserved",
    shortLabel: "Reserved",
    ring: "#a855f7",
    glow: "#a855f7",
    shadow: "rgba(168,85,247,0.45)",
    pill: "border-fuchsia-400/30 bg-fuchsia-500/15 text-fuchsia-100",
  },
};

export function getHospitalOperationalState(hospital, reservation) {
  if (reservation?.hospitalId === hospital.id) {
    if (reservation.status === "reserved") {
      return STATUS_META.reserved;
    }

    if (reservation.status === "held") {
      return STATUS_META.held;
    }
  }

  if (hospital.beds <= 0) {
    return STATUS_META.full;
  }

  if (hospital.beds <= 4) {
    return STATUS_META.limited;
  }

  return STATUS_META.available;
}

export function getHospitalStatus(beds) {
  return getHospitalOperationalState({ id: "__preview__", beds }, null);
}

export function getConfidenceState(updatedAt) {
  const ageMinutes = Math.max(0, (Date.now() - new Date(updatedAt).getTime()) / 60000);

  if (ageMinutes < 1) {
    return {
      key: "live",
      label: "Live",
      tone: "text-emerald-100",
      dot: "bg-emerald-300",
      pill: "border-emerald-400/30 bg-emerald-500/15 text-emerald-100",
      description: "Updated < 1 min",
    };
  }

  if (ageMinutes <= 5) {
    return {
      key: "recent",
      label: "Recent",
      tone: "text-amber-100",
      dot: "bg-amber-300",
      pill: "border-amber-400/30 bg-amber-500/15 text-amber-100",
      description: "Updated 1-5 min",
    };
  }

  return {
    key: "stale",
    label: "Stale",
    tone: "text-rose-100",
    dot: "bg-rose-300",
    pill: "border-rose-400/30 bg-rose-500/15 text-rose-100",
    description: "Updated > 5 min",
  };
}

export function formatFreshness(updatedAt) {
  const ageSeconds = Math.max(0, Math.floor((Date.now() - new Date(updatedAt).getTime()) / 1000));

  if (ageSeconds < 60) {
    return `${ageSeconds}s ago`;
  }

  const ageMinutes = Math.floor(ageSeconds / 60);
  return `${ageMinutes}m ago`;
}

export function sortHospitalsByAvailability(hospitals) {
  return [...hospitals].sort((left, right) => right.beds - left.beds);
}
