# UrbanFlow — Municipal Intelligence & Infrastructure Telemetry Engine

UrbanFlow is an intelligent municipal analytics and infrastructure degradation platform designed to predict structural failure across city assets before catastrophic breakdown occurs.

The user interface follows a **Technical Telemetry / Precision Monochromatic** design system:
- **Canvas:** Subtle engineering coordinate grid (`blueprint-grid`) overlay.
- **Components:** High-contrast monochromatic cards (`rounded-3xl` / `rounded-[2.5rem]`), clean zinc borders, and live emerald telemetry status beacons.
- **Typography:** Geometric sans-serif headers paired with JetBrains Mono tracking counters.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                 React + Vite Frontend (UI)                  │
│  - Tailwind CSS / Blueprint Grid / Recharts Live Telemetry  │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST / JSON / Timeseries
┌──────────────────────────────▼──────────────────────────────┐
│                    FastAPI Backend (Async)                  │
│  - Parameter Estimation (MLE/MAP) & ML Engines (Sklearn/PyTorch)│
└──────────────────────────────┬──────────────────────────────┘
                               │ SQLAlchemy & GeoAlchemy2
┌──────────────────────────────▼──────────────────────────────┐
│                PostgreSQL + PostGIS Database                │
│  - Spatial Indexing / Zone Polygons / Telemetry Logs        │
└─────────────────────────────────────────────────────────────┘
```

---

## Core Computational Modules

1. **Module A: Parameter Estimation (MLE & MAP)**
   - **Maximum Likelihood Estimation (MLE):** Closed-form Gaussian estimation of RMS sensor vibration noise:
     $$\mu_{MLE} = \frac{1}{n}\sum_{i=1}^n x_i, \quad \sigma^2_{MLE} = \frac{1}{n}\sum_{i=1}^n (x_i - \mu)^2$$
   - **Maximum A Posteriori (MAP):** Conjugate Gaussian prior regularizer incorporating engineering domain priors to resist noise spikes.
   - Interactive probability density curves comparing Prior $p(\mu)$, Sensor Likelihood $p(D|\mu)$, and Conjugate Posterior $p(\mu|D)$.

2. **Module B: Supervised Regression & Regularization (Ridge / LASSO)**
   - Models maintenance liability cost (\$) against age, material quality, traffic load, soil moisture, and vibration.
   - Dynamic comparison between Ordinary Least Squares (OLS), Ridge (L2 penalty), and Lasso (L1 feature shrinkage).
   - Live metrics ($MAE$, $RMSE$, $R^2$) and feature weight shrinkage charts.

3. **Module C: PyTorch Deep Neural Network (`InfrastructureNN`)**
   - Architecture:
     `Input (5) -> Linear(64) -> ReLU -> Dropout(0.2) -> Linear(32) -> Tanh -> Linear(3)`
   - 3-Class structural failure classification: Low (0), Medium (1), Critical (2).
   - Real-time cross-entropy loss convergence monitoring, confusion matrix, ROC-AUC score, and Logistic Regression baseline comparisons.

4. **Module D: Unsupervised Spatial Zoning & PCA**
   - K-Means multi-cluster zoning based on multi-variate telemetry features.
   - 2D Principal Component Analysis (PCA) projection with explained variance ratio.

---

## Quickstart Guide

### 1. Backend Setup (FastAPI)

```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
*Backend API docs are available at `http://127.0.0.1:8000/docs`.*

### 2. Frontend Setup (React + Vite + Tailwind)

```bash
cd frontend
npm install
npm run dev
```
*Frontend dashboard launches on `http://localhost:5173/`.*

### 3. Database Schema (PostgreSQL + PostGIS)

If deploying with PostgreSQL/PostGIS, execute the SQL script in `backend/init_db.sql`:
```bash
psql -U postgres -d urbanflow -f backend/init_db.sql
```
*(By default, UrbanFlow includes automatic local SQLite fallback for out-of-the-box local testing without requiring an external PostgreSQL instance).*
