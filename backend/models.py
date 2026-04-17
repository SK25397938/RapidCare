from sqlalchemy import Column, Integer, String
from backend.database import Base

class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    location = Column(String)
    admin_email = Column(String, unique=True)

    cardiac = Column(Integer)
    neuro = Column(Integer)
    surgical = Column(Integer)
    neonatal = Column(Integer)
    general = Column(Integer)

    total_ambulances = Column(Integer)
    available_ambulances = Column(Integer)

    lat = Column(String)
    lng = Column(String)
    specialization = Column(String)