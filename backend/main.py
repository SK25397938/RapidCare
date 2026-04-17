from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from backend.database import SessionLocal, engine
import backend.models as models

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
    models.Hospital(name="Lilavati Hospital", location="Bandra, Mumbai", cardiac=5, neuro=3, surgical=2, neonatal=1, general=6, total_ambulances=4, available_ambulances=2, lat="19.0500", lng="72.8295", specialization="Cardiac,General"),
    models.Hospital(name="Fortis Hospital", location="Mulund, Mumbai", cardiac=3, neuro=5, surgical=2, neonatal=1, general=4, total_ambulances=3, available_ambulances=1, lat="19.1726", lng="72.9566", specialization="Neuro,Cardiac"),
    models.Hospital(name="Kokilaben Hospital", location="Andheri, Mumbai", cardiac=4, neuro=4, surgical=3, neonatal=2, general=5, total_ambulances=6, available_ambulances=4, lat="19.1136", lng="72.8697", specialization="Cardiac,Neuro"),
    models.Hospital(name="Nanavati Hospital", location="Vile Parle, Mumbai", cardiac=6, neuro=4, surgical=3, neonatal=2, general=7, total_ambulances=5, available_ambulances=3, lat="19.0955", lng="72.8400", specialization="Cardiac,Surgical"),
    models.Hospital(name="Hiranandani Hospital", location="Powai, Mumbai", cardiac=5, neuro=3, surgical=3, neonatal=2, general=6, total_ambulances=4, available_ambulances=2, lat="19.1197", lng="72.9050", specialization="Cardiac,General"),
    models.Hospital(name="Apollo Hospital", location="Navi Mumbai", cardiac=2, neuro=2, surgical=5, neonatal=1, general=3, total_ambulances=5, available_ambulances=3, lat="19.0330", lng="73.0297", specialization="Surgical,Trauma"),
    models.Hospital(name="Reliance Hospital", location="Koparkhairane", cardiac=5, neuro=4, surgical=3, neonatal=2, general=6, total_ambulances=6, available_ambulances=4, lat="19.1030", lng="73.0076", specialization="Cardiac,Neuro"),
    models.Hospital(name="DY Patil Hospital", location="Nerul", cardiac=3, neuro=3, surgical=3, neonatal=1, general=4, total_ambulances=3, available_ambulances=2, lat="19.0330", lng="73.0168", specialization="General,Neuro"),
    models.Hospital(name="MGM Hospital", location="Belapur", cardiac=4, neuro=2, surgical=3, neonatal=2, general=5, total_ambulances=4, available_ambulances=2, lat="19.0176", lng="73.0347", specialization="General,Cardiac"),
    models.Hospital(name="Fortis Vashi", location="Vashi", cardiac=3, neuro=3, surgical=4, neonatal=2, general=5, total_ambulances=4, available_ambulances=2, lat="19.0759", lng="72.9987", specialization="Neuro,Surgical"),

    models.Hospital(name="Ruby Hall Clinic", location="Shivajinagar, Pune", cardiac=6, neuro=4, surgical=3, neonatal=2, general=7, total_ambulances=5, available_ambulances=3, lat="18.5308", lng="73.8470", specialization="Cardiac,General"),
    models.Hospital(name="Jehangir Hospital", location="Bund Garden, Pune", cardiac=4, neuro=3, surgical=2, neonatal=1, general=5, total_ambulances=4, available_ambulances=2, lat="18.5362", lng="73.8840", specialization="General,Neuro"),
    models.Hospital(name="Sahyadri Hospital", location="Deccan, Pune", cardiac=3, neuro=4, surgical=3, neonatal=2, general=6, total_ambulances=6, available_ambulances=4, lat="18.5204", lng="73.8567", specialization="Neuro,Cardiac"),
    models.Hospital(name="Aditya Birla Hospital", location="Chinchwad, Pune", cardiac=5, neuro=3, surgical=4, neonatal=2, general=6, total_ambulances=5, available_ambulances=3, lat="18.6279", lng="73.7997", specialization="Cardiac,Surgical"),
    models.Hospital(name="Columbia Asia", location="Kharadi, Pune", cardiac=4, neuro=3, surgical=3, neonatal=2, general=5, total_ambulances=4, available_ambulances=2, lat="18.5519", lng="73.9475", specialization="General,Cardiac"),
    models.Hospital(name="Noble Hospital", location="Hadapsar, Pune", cardiac=3, neuro=2, surgical=4, neonatal=1, general=4, total_ambulances=3, available_ambulances=2, lat="18.5089", lng="73.9260", specialization="Surgical,General"),
    models.Hospital(name="Deenanath Hospital", location="Erandwane, Pune", cardiac=5, neuro=4, surgical=3, neonatal=2, general=6, total_ambulances=5, available_ambulances=3, lat="18.5037", lng="73.8077", specialization="Cardiac,Neuro"),
    models.Hospital(name="Manipal Hospital", location="Baner, Pune", cardiac=4, neuro=3, surgical=3, neonatal=2, general=5, total_ambulances=4, available_ambulances=2, lat="18.5590", lng="73.7868", specialization="General,Cardiac"),
    models.Hospital(name="Cloudnine Hospital", location="SB Road, Pune", cardiac=2, neuro=1, surgical=2, neonatal=5, general=3, total_ambulances=3, available_ambulances=2, lat="18.5340", lng="73.8290", specialization="Neonatal,General"),
    models.Hospital(name="Lokmanya Hospital", location="Nigdi, Pune", cardiac=3, neuro=3, surgical=4, neonatal=1, general=5, total_ambulances=4, available_ambulances=2, lat="18.6510", lng="73.7680", specialization="Surgical,General")
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