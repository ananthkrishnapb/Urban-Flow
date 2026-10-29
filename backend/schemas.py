from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class SimulationRequest(BaseModel):
    samples: int = Field(default=1000, ge=100, le=10000, description="Number of telemetry records to simulate")

class ParameterEstimationRequest(BaseModel):
    prior_mu: float = Field(default=2.0, description="Prior mean for sensor vibration noise")
    prior_sigma2: float = Field(default=1.0, gt=0.01, description="Prior variance")
    sample_size: int = Field(default=300, ge=10, le=2000)

class RegressionRequest(BaseModel):
    alpha_ridge: float = Field(default=1.0, ge=0.0001, le=100.0)
    alpha_lasso: float = Field(default=0.5, ge=0.0001, le=100.0)

class NeuralNetTrainRequest(BaseModel):
    epochs: int = Field(default=40, ge=5, le=100)

class SinglePredictionRequest(BaseModel):
    asset_age_years: float = Field(default=12.5, ge=0.5, le=50.0)
    material_quality_index: float = Field(default=0.82, ge=0.1, le=1.0)
    traffic_load_index: float = Field(default=18500.0, ge=500.0, le=100000.0)
    soil_moisture: float = Field(default=24.5, ge=0.0, le=100.0)
    vibration_amplitude: float = Field(default=2.65, ge=0.1, le=25.0)

class ClusteringRequest(BaseModel):
    n_clusters: int = Field(default=4, ge=2, le=8)
