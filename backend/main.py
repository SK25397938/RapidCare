from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from backend.database import SessionLocal, engine
import backend.models as models
from pydantic import BaseModel

class PatientCreate(BaseModel):
    hospital_id: int
    name: str
    age: str
    gender: str
    phone: str
    relative: str | None = None
    relation: str | None = None
    witness: str | None = None
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.on_event("startup")
def seed_data():
    db = SessionLocal()

    if db.query(models.Hospital).count() == 0:
        hospitals = [
    models.Hospital(name="Lilavati Hospital", location="Bandra, Mumbai", admin_email="lilavati@admin.rapidcare.com", cardiac=5, neuro=3, surgical=2, neonatal=1, general=6, total_ambulances=4, available_ambulances=2, lat="19.0500", lng="72.8295", specialization="Cardiac,General"),
    models.Hospital(name="Fortis Hospital", location="Mulund, Mumbai", admin_email="fortis@admin.rapidcare.com", cardiac=3, neuro=5, surgical=2, neonatal=1, general=4, total_ambulances=3, available_ambulances=1, lat="19.1726", lng="72.9566", specialization="Neuro,Cardiac"),
    models.Hospital(name="Kokilaben Hospital", location="Andheri, Mumbai", admin_email="kokilaben@admin.rapidcare.com", cardiac=4, neuro=4, surgical=3, neonatal=2, general=5, total_ambulances=6, available_ambulances=4, lat="19.1136", lng="72.8697", specialization="Cardiac,Neuro"),
    models.Hospital(name="Nanavati Hospital", location="Vile Parle, Mumbai", admin_email="nanavati@admin.rapidcare.com", cardiac=6, neuro=4, surgical=3, neonatal=2, general=7, total_ambulances=5, available_ambulances=3, lat="19.0955", lng="72.8400", specialization="Cardiac,Surgical"),
    models.Hospital(name="Hiranandani Hospital", location="Powai, Mumbai", admin_email="hiranandani@admin.rapidcare.com", cardiac=5, neuro=3, surgical=3, neonatal=2, general=6, total_ambulances=4, available_ambulances=2, lat="19.1197", lng="72.9050", specialization="Cardiac,General"),
    models.Hospital(name="Apollo Hospital", location="Navi Mumbai", admin_email="apollo@admin.rapidcare.com", cardiac=2, neuro=2, surgical=5, neonatal=1, general=3, total_ambulances=5, available_ambulances=3, lat="19.0330", lng="73.0297", specialization="Surgical,Trauma"),
    models.Hospital(name="Reliance Hospital", location="Koparkhairane", admin_email="reliance@admin.rapidcare.com", cardiac=5, neuro=4, surgical=3, neonatal=2, general=6, total_ambulances=6, available_ambulances=4, lat="19.1030", lng="73.0076", specialization="Cardiac,Neuro"),
    models.Hospital(name="DY Patil Hospital", location="Nerul", admin_email="dypatil@admin.rapidcare.com", cardiac=3, neuro=3, surgical=3, neonatal=1, general=4, total_ambulances=3, available_ambulances=2, lat="19.0330", lng="73.0168", specialization="General,Neuro"),
    models.Hospital(name="MGM Hospital", location="Belapur", admin_email="mgm@admin.rapidcare.com", cardiac=4, neuro=2, surgical=3, neonatal=2, general=5, total_ambulances=4, available_ambulances=2, lat="19.0176", lng="73.0347", specialization="General,Cardiac"),
    models.Hospital(name="Fortis Vashi", location="Vashi", admin_email="fortisvashi@admin.rapidcare.com", cardiac=3, neuro=3, surgical=4, neonatal=2, general=5, total_ambulances=4, available_ambulances=2, lat="19.0759", lng="72.9987", specialization="Neuro,Surgical"),

    models.Hospital(name="Ruby Hall Clinic", location="Shivajinagar, Pune", admin_email="rubyhall@admin.rapidcare.com", cardiac=6, neuro=4, surgical=3, neonatal=2, general=7, total_ambulances=5, available_ambulances=3, lat="18.5308", lng="73.8470", specialization="Cardiac,General"),
    models.Hospital(name="Jehangir Hospital", location="Bund Garden, Pune", admin_email="jehangir@admin.rapidcare.com", cardiac=4, neuro=3, surgical=2, neonatal=1, general=5, total_ambulances=4, available_ambulances=2, lat="18.5362", lng="73.8840", specialization="General,Neuro"),
    models.Hospital(name="Sahyadri Hospital", location="Deccan, Pune", admin_email="sahyadri@admin.rapidcare.com", cardiac=3, neuro=4, surgical=3, neonatal=2, general=6, total_ambulances=6, available_ambulances=4, lat="18.5204", lng="73.8567", specialization="Neuro,Cardiac"),
    models.Hospital(name="Aditya Birla Hospital", location="Chinchwad, Pune", admin_email="adityabirla@admin.rapidcare.com", cardiac=5, neuro=3, surgical=4, neonatal=2, general=6, total_ambulances=5, available_ambulances=3, lat="18.6279", lng="73.7997", specialization="Cardiac,Surgical"),
    models.Hospital(name="Columbia Asia", location="Kharadi, Pune", admin_email="columbia@admin.rapidcare.com", cardiac=4, neuro=3, surgical=3, neonatal=2, general=5, total_ambulances=4, available_ambulances=2, lat="18.5519", lng="73.9475", specialization="General,Cardiac"),
    models.Hospital(name="Noble Hospital", location="Hadapsar, Pune", admin_email="noble@admin.rapidcare.com", cardiac=3, neuro=2, surgical=4, neonatal=1, general=4, total_ambulances=3, available_ambulances=2, lat="18.5089", lng="73.9260", specialization="Surgical,General"),
    models.Hospital(name="Deenanath Hospital", location="Erandwane, Pune", admin_email="deenanath@admin.rapidcare.com", cardiac=5, neuro=4, surgical=3, neonatal=2, general=6, total_ambulances=5, available_ambulances=3, lat="18.5037", lng="73.8077", specialization="Cardiac,Neuro"),
    models.Hospital(name="Manipal Hospital", location="Baner, Pune", admin_email="manipal@admin.rapidcare.com", cardiac=4, neuro=3, surgical=3, neonatal=2, general=5, total_ambulances=4, available_ambulances=2, lat="18.5590", lng="73.7868", specialization="General,Cardiac"),
    models.Hospital(name="Cloudnine Hospital", location="SB Road, Pune", admin_email="cloudnine@admin.rapidcare.com", cardiac=2, neuro=1, surgical=2, neonatal=5, general=3, total_ambulances=3, available_ambulances=2, lat="18.5340", lng="73.8290", specialization="Neonatal,General"),
    models.Hospital(name="Lokmanya Hospital", location="Nigdi, Pune", admin_email="lokmanya@admin.rapidcare.com", cardiac=3, neuro=3, surgical=4, neonatal=1, general=5, total_ambulances=4, available_ambulances=2, lat="18.6510", lng="73.7680", specialization="Surgical,General")
]

        db.add_all(hospitals)
        db.commit()

    db.close()


@app.get("/hospitals")
def get_hospitals(db: Session = Depends(get_db)):
    return db.query(models.Hospital).all()


@app.post("/update-bed/{hospital_id}")
def update_bed(hospital_id: int, type: str, change: int, db: Session = Depends(get_db)):
    hospital = db.query(models.Hospital).filter(models.Hospital.id == hospital_id).first()

    if not hospital:
        return {"error": "Not found"}

    if not hasattr(hospital, type):
        return {"error": "Invalid ICU type"}

    current = getattr(hospital, type)
    new_value = max(0, current + change)

    setattr(hospital, type, new_value)
    db.commit()

    return {"success": True}


@app.post("/update-ambulance/{hospital_id}")
def update_ambulance(hospital_id: int, change: int, db: Session = Depends(get_db)):
    hospital = db.query(models.Hospital).filter(models.Hospital.id == hospital_id).first()

    if not hospital:
        return {"error": "Not found"}

    hospital.total_ambulances += change
    if hospital.total_ambulances < 0:
        hospital.total_ambulances = 0

    db.commit()
    return {"success": True}

@app.get("/admin-hospital")
def get_admin_hospital(email: str, db: Session = Depends(get_db)):
    hospital = db.query(models.Hospital).filter(models.Hospital.admin_email == email).first()

    if not hospital:
        return {"error": "Not found"}

    return hospital

@app.post("/add-patient")
def add_patient(data: PatientCreate, db: Session = Depends(get_db)):
    patient = models.Patient(**data.dict())
    db.add(patient)
    db.commit()
    return {"success": True}

@app.delete("/patient/{id}")
def delete_patient(id: int, db: Session = Depends(get_db)):
    p = db.query(models.Patient).filter(models.Patient.id == id).first()
    if p:
        db.delete(p)
        db.commit()
    return {"success": True}

@app.get("/patients")
def get_patients(email: str, db: Session = Depends(get_db)):
    hospital = db.query(models.Hospital).filter(models.Hospital.admin_email == email).first()

    if not hospital:
        return []

    patients = db.query(models.Patient).filter(models.Patient.hospital_id == hospital.id).all()

    return patients