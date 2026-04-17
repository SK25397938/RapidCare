from math import atan2, cos, radians, sin, sqrt


AVERAGE_AMBULANCE_SPEED_KMH = 40


def haversine_distance_km(start_lat: float, start_lng: float, end_lat: float, end_lng: float) -> float:
    earth_radius_km = 6371

    delta_lat = radians(end_lat - start_lat)
    delta_lng = radians(end_lng - start_lng)
    lat1 = radians(start_lat)
    lat2 = radians(end_lat)

    haversine = sin(delta_lat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(delta_lng / 2) ** 2
    return earth_radius_km * 2 * atan2(sqrt(haversine), sqrt(1 - haversine))


def distance_to_eta_minutes(distance_km: float) -> int:
    return max(1, round((distance_km / AVERAGE_AMBULANCE_SPEED_KMH) * 60))
