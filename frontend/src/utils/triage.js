import { getHospitalOperationalState } from "./hospitalStatus";

export const COMMAND_CENTER = {
  lat: 19.0728,
  lng: 72.8826,
};

export const AMBULANCE_ORIGIN = {
  lat: 19.0458,
  lng: 72.8475,
};

function haversineDistanceKm(start, end) {
  const toRadians = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const deltaLat = toRadians(end.lat - start.lat);
  const deltaLng = toRadians(end.lng - start.lng);
  const lat1 = toRadians(start.lat);
  const lat2 = toRadians(end.lat);

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function enrichHospitalMetrics(hospital, options = {}) {
  const origin = options.origin ?? COMMAND_CENTER;
  const surgeMode = options.surgeMode ?? false;
  const distanceKm = haversineDistanceKm(origin, hospital);
  const cruiseSpeedKmh = surgeMode ? 44 : 34;
  const dispatchBuffer = surgeMode ? 3 : 5;
  const etaMinutes = Math.max(4, Math.round((distanceKm / cruiseSpeedKmh) * 60 + dispatchBuffer));

  return {
    ...hospital,
    distanceKm,
    etaMinutes,
  };
}

export function formatEta(etaMinutes) {
  return `${etaMinutes} min`;
}

export function formatDistance(distanceKm) {
  return `${distanceKm.toFixed(1)} km`;
}

function getRankingWeight(stateKey) {
  switch (stateKey) {
    case "reserved":
      return 5;
    case "held":
      return 4;
    case "available":
      return 3;
    case "limited":
      return 2;
    default:
      return 0;
  }
}

export function rankHospitals(hospitals, options = {}) {
  const reservation = options.reservation ?? null;

  return [...hospitals].sort((left, right) => {
    const leftState = getHospitalOperationalState(left, reservation);
    const rightState = getHospitalOperationalState(right, reservation);
    const priorityDelta = getRankingWeight(rightState.key) - getRankingWeight(leftState.key);

    if (priorityDelta !== 0) {
      return priorityDelta;
    }

    if (left.etaMinutes !== right.etaMinutes) {
      return left.etaMinutes - right.etaMinutes;
    }

    return right.beds - left.beds;
  });
}

export function pickBestHospital(hospitals, options = {}) {
  const ranked = rankHospitals(hospitals, options);
  return ranked.find((hospital) => {
    const state = getHospitalOperationalState(hospital, options.reservation ?? null);
    return state.key !== "full";
  }) ?? null;
}

export function getFallbackHospitals(hospitals, count = 3) {
  return [...hospitals]
    .sort((left, right) => left.etaMinutes - right.etaMinutes)
    .slice(0, count);
}

export function interpolatePosition(progress, start, end) {
  return {
    lat: start.lat + (end.lat - start.lat) * progress,
    lng: start.lng + (end.lng - start.lng) * progress,
  };
}
