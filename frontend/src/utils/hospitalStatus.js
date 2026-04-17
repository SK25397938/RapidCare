export function getHospitalStatus(beds) {
  if (beds <= 0) {
    return {
      key: "full",
      label: "No Beds",
      shortLabel: "Full",
      ring: "#ff4d6d",
      glow: "#ff4d6d",
      shadow: "rgba(255,77,109,0.55)",
    };
  }

  if (beds <= 4) {
    return {
      key: "limited",
      label: "Limited",
      shortLabel: "Low",
      ring: "#fb923c",
      glow: "#fb923c",
      shadow: "rgba(251,146,60,0.55)",
    };
  }

  return {
    key: "available",
    label: "Beds Open",
    shortLabel: "Open",
    ring: "#22c55e",
    glow: "#22c55e",
    shadow: "rgba(34,197,94,0.55)",
  };
}

export function sortHospitalsByAvailability(hospitals) {
  return [...hospitals].sort((left, right) => {
    const leftScore = left.beds <= 0 ? -1 : left.beds <= 4 ? 1 : 2;
    const rightScore = right.beds <= 0 ? -1 : right.beds <= 4 ? 1 : 2;
    if (rightScore !== leftScore) return rightScore - leftScore;
    return right.beds - left.beds;
  });
}
