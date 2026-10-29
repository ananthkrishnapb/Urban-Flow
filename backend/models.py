from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
import datetime
from database import Base

class UrbanZone(Base):
    __tablename__ = "urban_zones"

    zone_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    zone_name = Column(String(100), unique=True, nullable=False, index=True)
    geometry_geojson = Column(Text, nullable=False) # GeoJSON polygon string representation
    population_density = Column(Float, nullable=False)
    avg_annual_rainfall = Column(Float, nullable=False)

    telemetry_records = relationship("InfrastructureTelemetry", back_populates="zone", cascade="all, delete-orphan")

class InfrastructureTelemetry(Base):
    __tablename__ = "infrastructure_telemetry"

    record_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    zone_id = Column(Integer, ForeignKey("urban_zones.zone_id", ondelete="CASCADE"), nullable=False, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    asset_age_years = Column(Float, nullable=False)
    material_quality_index = Column(Float, nullable=False) # 0.0 to 1.0
    traffic_load_index = Column(Float, nullable=False)     # Daily vehicle throughput
    soil_moisture = Column(Float, nullable=False)          # Volumetric water content (%)
    vibration_amplitude = Column(Float, nullable=False)    # RMS acceleration (mm/s^2)
    maintenance_cost = Column(Float, nullable=False)       # Continuous target variable
    failure_risk_level = Column(Integer, nullable=False)   # 0: Low, 1: Medium, 2: Critical

    zone = relationship("UrbanZone", back_populates="telemetry_records")
