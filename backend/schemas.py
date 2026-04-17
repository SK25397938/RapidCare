from pydantic import BaseModel

class HospitalBase(BaseModel):
    name: str
    location: str

class HospitalUpdate(BaseModel):
    type: str
    change: int

class AmbulanceUpdate(BaseModel):
    change: int