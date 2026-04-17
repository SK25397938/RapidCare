from collections import defaultdict
from datetime import UTC, datetime, timedelta

from fastapi import HTTPException

from backend.services.supabase_service import get_supabase_client
from backend.utils.geo import distance_to_eta_minutes, haversine_distance_km
from backend.utils.mappings import specialization_matches


def _pick(record: dict, *keys: str, default=None):
    for key in keys:
        value = record.get(key)
        if value not in (None, ""):
            return value
    return default


def _count_available_beds(beds: list[dict]) -> int:
    now = datetime.now(UTC)
    available_count = 0

    for bed in beds:
        status = _pick(bed, "status", default="available")
        hold_until = _pick(bed, "hold_until")
        is_expired_hold = False

        if hold_until:
            try:
                hold_until_datetime = datetime.fromisoformat(str(hold_until).replace("Z", "+00:00"))
                is_expired_hold = hold_until_datetime < now
            except ValueError:
                is_expired_hold = False

        if status == "available" or (status == "held" and is_expired_hold):
            available_count += 1

    return available_count


def search_hospitals(lat: float, lng: float, emergency_type: str) -> list[dict]:
    supabase = get_supabase_client()
    hospitals_response = supabase.table("hospitals").select("*").execute()
    beds_response = supabase.table("beds").select("*").execute()

    hospitals = hospitals_response.data or []
    beds = beds_response.data or []
    beds_by_hospital = defaultdict(list)

    for bed in beds:
        beds_by_hospital[str(_pick(bed, "hospital_id", "hospitalId", default=""))].append(bed)

    ranked_hospitals = []

    for hospital in hospitals:
        hospital_id = str(_pick(hospital, "id", "hospital_id"))
        specialization = _pick(hospital, "specialization", "icu_specialization", "icu_type", "type", default="General")

        if not specialization_matches(emergency_type, specialization):
            continue

        hospital_lat = float(_pick(hospital, "lat", "latitude", default=0))
        hospital_lng = float(_pick(hospital, "lng", "longitude", default=0))
        distance_km = haversine_distance_km(lat, lng, hospital_lat, hospital_lng)
        available_beds = _count_available_beds(beds_by_hospital[hospital_id])
        status = "full"

        if available_beds > 4:
            status = "available"
        elif available_beds > 0:
            status = "limited"

        ranked_hospitals.append(
            {
                "id": hospital_id,
                "name": _pick(hospital, "name", "hospital_name", default=f"Hospital {hospital_id}"),
                "specialization": specialization,
                "lat": hospital_lat,
                "lng": hospital_lng,
                "available_beds": available_beds,
                "distance_km": round(distance_km, 2),
                "eta_minutes": distance_to_eta_minutes(distance_km),
                "status": status,
                "updated_at": _pick(hospital, "updated_at", "created_at"),
            }
        )

    ranked_hospitals.sort(key=lambda item: (item["distance_km"], -item["available_beds"]))
    return ranked_hospitals[:3]


def reserve_bed(hospital_id: str) -> dict:
    supabase = get_supabase_client()
    beds_response = (
        supabase.table("beds")
        .select("*")
        .eq("hospital_id", hospital_id)
        .execute()
    )
    beds = beds_response.data or []
    now = datetime.now(UTC)
    available_bed = None

    for bed in beds:
        status = _pick(bed, "status", default="available")
        hold_until = _pick(bed, "hold_until")
        is_expired_hold = False

        if hold_until:
            try:
                is_expired_hold = datetime.fromisoformat(str(hold_until).replace("Z", "+00:00")) < now
            except ValueError:
                is_expired_hold = False

        if status == "available" or (status == "held" and is_expired_hold):
            available_bed = bed
            break

    if not available_bed:
        raise HTTPException(status_code=404, detail="No available beds found for this hospital.")

    hold_until = now + timedelta(minutes=5)
    bed_id = str(_pick(available_bed, "id", "bed_id"))

    supabase.table("beds").update(
        {
            "status": "held",
            "hold_until": hold_until.isoformat(),
            "updated_at": now.isoformat(),
        }
    ).eq("id", bed_id).execute()

    reservation_response = supabase.table("reservations").insert(
        {
            "hospital_id": hospital_id,
            "bed_id": bed_id,
            "status": "held",
            "hold_until": hold_until.isoformat(),
            "created_at": now.isoformat(),
            "updated_at": now.isoformat(),
        }
    ).execute()

    reservation = (reservation_response.data or [{}])[0]
    return {
        "reservation_id": _pick(reservation, "id", "reservation_id"),
        "bed_id": bed_id,
        "hospital_id": hospital_id,
        "hold_until": hold_until.isoformat(),
        "status": "held",
    }


def assign_ambulance(lat: float, lng: float) -> dict:
    supabase = get_supabase_client()
    ambulances_response = supabase.table("ambulances").select("*").execute()
    ambulances = ambulances_response.data or []

    available_ambulances = [
        ambulance
        for ambulance in ambulances
        if _pick(ambulance, "status", default="available") == "available"
    ]

    if not available_ambulances:
        raise HTTPException(status_code=404, detail="No available ambulances found.")

    nearest_ambulance = min(
        available_ambulances,
        key=lambda ambulance: haversine_distance_km(
            lat,
            lng,
            float(_pick(ambulance, "current_lat", "lat", "latitude", default=0)),
            float(_pick(ambulance, "current_lng", "lng", "longitude", default=0)),
        ),
    )

    ambulance_id = str(_pick(nearest_ambulance, "id", "ambulance_id"))
    current_lat = float(_pick(nearest_ambulance, "current_lat", "lat", "latitude", default=0))
    current_lng = float(_pick(nearest_ambulance, "current_lng", "lng", "longitude", default=0))
    distance_km = haversine_distance_km(lat, lng, current_lat, current_lng)
    now = datetime.now(UTC)

    supabase.table("ambulances").update(
        {
            "status": "assigned",
            "updated_at": now.isoformat(),
        }
    ).eq("id", ambulance_id).execute()

    return {
        "ambulance_id": ambulance_id,
        "status": "assigned",
        "current_lat": current_lat,
        "current_lng": current_lng,
        "distance_km": round(distance_km, 2),
        "eta_minutes": distance_to_eta_minutes(distance_km),
    }


def confirm_reservation(reservation_id: str) -> dict:
    supabase = get_supabase_client()
    reservation_response = (
        supabase.table("reservations")
        .select("*")
        .eq("id", reservation_id)
        .limit(1)
        .execute()
    )
    reservation = (reservation_response.data or [None])[0]

    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found.")

    now = datetime.now(UTC)
    bed_id = str(_pick(reservation, "bed_id"))

    supabase.table("reservations").update(
        {
            "status": "reserved",
            "updated_at": now.isoformat(),
        }
    ).eq("id", reservation_id).execute()

    if bed_id:
        supabase.table("beds").update(
            {
                "status": "reserved",
                "updated_at": now.isoformat(),
            }
        ).eq("id", bed_id).execute()

    return {
        "reservation_id": reservation_id,
        "status": "reserved",
        "bed_id": bed_id,
    }
