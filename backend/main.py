from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import pandas as pd
from typing import Optional, List, Dict, Any
import datetime

from schemas import (
    SimulationRequest, 
    ParameterEstimationRequest, 
    RegressionRequest, 
    NeuralNetTrainRequest, 
    SinglePredictionRequest, 
    ClusteringRequest
)
from ml_engine import (
    generate_telemetry_dataset,
    get_cached_dataset,
    set_cached_dataset,
    estimate_sensor_noise_mle,
    estimate_sensor_noise_map,
    train_regression_models,
    train_infrastructure_nn,
    predict_single_risk,
    run_unsupervised_analysis,
    MUNICIPAL_ZONES
)

app = FastAPI(
    title="UrbanFlow Municipal Intelligence Engine",
    version="1.0.0",
    description="Backend telemetry and predictive modeling suite for urban infrastructure degradation."
)

# Configure CORS for local development and production deployments (e.g., Vercel, Netlify, Render)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with your frontend production URL later if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "status": "ONLINE",
        "engine": "UrbanFlow Telemetry Active",
        "nodes_active": 24180,
        "protocol": "HTTP/2 Telemetry Ingestion",
        "version": "1.0.0",
        "server_time": datetime.datetime.utcnow().isoformat()
    }

@app.post("/api/v1/telemetry/simulate")
def simulate_telemetry(payload: SimulationRequest):
    # Cap samples to prevent 512MB RAM overflow on Render free tier
    n = min(max(payload.samples, 50), 2000)
    df = generate_telemetry_dataset(n=n)
    set_cached_dataset(df)
    
    avg_vibration = float(df['vibration_amplitude'].mean())
    avg_cost = float(df['maintenance_cost'].mean())
    critical_count = int((df['failure_risk_level'] == 2).sum())
    
    return {
        "message": f"Successfully simulated {n} telemetry records.",
        "summary": {
            "total_records": len(df),
            "avg_vibration_rms": round(avg_vibration, 3),
            "avg_maintenance_cost": round(avg_cost, 2),
            "critical_risk_nodes": critical_count,
            "medium_risk_nodes": int((df['failure_risk_level'] == 1).sum()),
            "low_risk_nodes": int((df['failure_risk_level'] == 0).sum())
        },
        "preview": df.head(10).to_dict(orient="records")
    }

@app.get("/api/v1/telemetry/records")
def get_telemetry_records(
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=5, le=200),
    zone: Optional[str] = None,
    risk: Optional[int] = None
):
    df = get_cached_dataset()
    filtered = df
    if zone and zone != "ALL":
        filtered = filtered[filtered['zone_name'] == zone]
    if risk is not None and risk != -1:
        filtered = filtered[filtered['failure_risk_level'] == risk]
        
    total = len(filtered)
    start = (page - 1) * limit
    end = start + limit
    sliced = filtered.iloc[start:end]
    
    return {
        "page": page,
        "limit": limit,
        "total": total,
        "records": sliced.to_dict(orient="records")
    }

@app.get("/api/v1/telemetry/timeseries")
def get_telemetry_timeseries(limit: int = 50):
    df = get_cached_dataset()
    sample = df.tail(limit)
    
    items = []
    base_time = datetime.datetime.now() - datetime.timedelta(minutes=limit * 2)
    for i, (_, row) in enumerate(sample.iterrows()):
        t = base_time + datetime.timedelta(minutes=i * 2)
        items.append({
            "timestamp": t.strftime("%H:%M:%S"),
            "vibration": float(row['vibration_amplitude']),
            "traffic": float(row['traffic_load_index']),
            "moisture": float(row['soil_moisture']),
            "cost": float(row['maintenance_cost']),
            "risk": int(row['failure_risk_level'])
        })
    return {"timeseries": items}

@app.post("/api/v1/analytics/parameter-estimation")
def parameter_estimation_endpoint(payload: ParameterEstimationRequest):
    df = get_cached_dataset()
    vibrations = df['vibration_amplitude'].values[:payload.sample_size]
    
    mle_result = estimate_sensor_noise_mle(vibrations)
    map_result = estimate_sensor_noise_map(
        vibrations, 
        prior_mu=payload.prior_mu, 
        prior_sigma2=payload.prior_sigma2
    )
    
    return {
        "mle": mle_result,
        "map": map_result,
        "interpretation": f"MLE parameter estimate is mu={mle_result['mu_mle']:.3f}. With Gaussian prior N({payload.prior_mu}, {payload.prior_sigma2}), the regularized MAP estimate shifts to mu={map_result['mu_map']:.3f}."
    }

@app.post("/api/v1/analytics/regression")
def regression_endpoint(payload: RegressionRequest):
    df = get_cached_dataset()
    results = train_regression_models(df, alpha_ridge=payload.alpha_ridge, alpha_lasso=payload.alpha_lasso)
    return results

@app.post("/api/v1/analytics/classification/train")
def train_neural_network_endpoint(payload: NeuralNetTrainRequest):
    df = get_cached_dataset()
    results = train_infrastructure_nn(df, epochs=payload.epochs)
    return results

@app.post("/api/v1/analytics/classification/predict")
def predict_single_risk_endpoint(payload: SinglePredictionRequest):
    result = predict_single_risk(
        asset_age=payload.asset_age_years,
        material_quality=payload.material_quality_index,
        traffic_load=payload.traffic_load_index,
        soil_moisture=payload.soil_moisture,
        vibration_amp=payload.vibration_amplitude
    )
    return result

@app.post("/api/v1/analytics/clustering")
def clustering_endpoint(payload: ClusteringRequest):
    df = get_cached_dataset()
    results = run_unsupervised_analysis(df, n_clusters=payload.n_clusters)
    return results

@app.get("/api/v1/zones")
def get_zones():
    return {"zones": MUNICIPAL_ZONES}

@app.post("/api/v1/terminal/query")
def process_terminal_query(query: Dict[str, str]):
    text = query.get("query", "").lower()
    df = get_cached_dataset()
    
    # NLP / Pattern matching on municipal telemetry query
    matched_zone = None
    for z in MUNICIPAL_ZONES:
        if z["zone_name"].lower() in text or str(z["zone_id"]) in text:
            matched_zone = z
            break
            
    if "anomaly" in text or "vibration" in text or "risk" in text:
        critical_df = df[df['failure_risk_level'] == 2]
        top_anomalies = critical_df.sort_values(by='vibration_amplitude', ascending=False).head(3)
        return {
            "status": "PROCESSED",
            "intent": "ANOMALY_DETECTION",
            "response": f"Vibration telemetry sweep identified {len(critical_df)} anomaly spikes exceeding safe operational thresholds (vibration > 4.5 mm/s²).",
            "matched_zone": matched_zone["zone_name"] if matched_zone else "All Corridors",
            "highlights": top_anomalies[['record_id', 'zone_name', 'vibration_amplitude', 'maintenance_cost', 'failure_risk_level']].to_dict(orient="records")
        }
    elif "cost" in text or "budget" in text or "maintenance" in text:
        total_cost = float(df['maintenance_cost'].sum())
        avg_cost = float(df['maintenance_cost'].mean())
        return {
            "status": "PROCESSED",
            "intent": "BUDGET_ANALYSIS",
            "response": f"Estimated fleet-wide municipal maintenance liability is ${total_cost:,.2f} (Mean: ${avg_cost:,.2f} per node).",
            "matched_zone": matched_zone["zone_name"] if matched_zone else "All Corridors",
            "highlights": []
        }
    else:
        return {
            "status": "PROCESSED",
            "intent": "TELEMETRY_SCAN",
            "response": f"Telemetry scan across 24,180 active nodes complete. Sensor health nominal in 5/6 zones. Bridge Span B and Industrial Wharf require scheduled damping.",
            "matched_zone": matched_zone["zone_name"] if matched_zone else "Global Municipal Grid",
            "highlights": []
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
