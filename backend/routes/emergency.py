from fastapi import APIRouter
from pydantic import BaseModel

from backend.services.emergency_service import (
    assign_ambulance,
    confirm_reservation,
    reserve_bed,
    search_hospitals,
)

router = APIRouter(tags=["rapidcare"])


class SearchHospitalsRequest(BaseModel):
    lat: float
    lng: float
    emergency_type: str


class ReserveBedRequest(BaseModel):
    hospital_id: str


class AssignAmbulanceRequest(BaseModel):
    lat: float
    lng: float


class ConfirmReservationRequest(BaseModel):
    reservation_id: str


@router.post("/search-hospitals")
def search_hospitals_route(payload: SearchHospitalsRequest):
    hospitals = search_hospitals(payload.lat, payload.lng, payload.emergency_type)
    return {"hospitals": hospitals}


@router.post("/reserve-bed")
def reserve_bed_route(payload: ReserveBedRequest):
    return reserve_bed(payload.hospital_id)


@router.post("/assign-ambulance")
def assign_ambulance_route(payload: AssignAmbulanceRequest):
    return assign_ambulance(payload.lat, payload.lng)


@router.post("/confirm-reservation")
def confirm_reservation_route(payload: ConfirmReservationRequest):
    return confirm_reservation(payload.reservation_id)
