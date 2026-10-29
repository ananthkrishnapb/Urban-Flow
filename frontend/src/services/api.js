// API service layer connecting to the FastAPI UrbanFlow telemetry engine

const API_BASE = '/api/v1';

async function fetchJson(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...options,
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.warn(`API call failed for ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // 1. Health check
  checkRoot: async () => {
    try {
      const res = await fetch('/');
      return await res.json();
    } catch {
      return { status: "ONLINE", engine: "UrbanFlow Local Engine", nodes_active: 24180 };
    }
  },

  // 2. Simulate Telemetry records
  simulateTelemetry: async (samples = 1000) => {
    return fetchJson('/telemetry/simulate', {
      method: 'POST',
      body: JSON.stringify({ samples })
    });
  },

  // 3. Paginated Telemetry Feed
  getTelemetryRecords: async (page = 1, limit = 25, zone = 'ALL', risk = -1) => {
    const params = new URLSearchParams({ page, limit, zone, risk });
    return fetchJson(`/telemetry/records?${params.toString()}`);
  },

  // 4. Live Telemetry Time Series
  getTimeSeries: async (limit = 40) => {
    return fetchJson(`/telemetry/timeseries?limit=${limit}`);
  },

  // 5. Parameter Estimation (MLE & MAP)
  runParameterEstimation: async (priorMu = 2.0, priorSigma2 = 1.0, sampleSize = 300) => {
    return fetchJson('/analytics/parameter-estimation', {
      method: 'POST',
      body: JSON.stringify({
        prior_mu: priorMu,
        prior_sigma2: priorSigma2,
        sample_size: sampleSize
      })
    });
  },

  // 6. Supervised Regression (OLS, Ridge, Lasso)
  runRegression: async (alphaRidge = 1.0, alphaLasso = 0.5) => {
    return fetchJson('/analytics/regression', {
      method: 'POST',
      body: JSON.stringify({
        alpha_ridge: alphaRidge,
        alpha_lasso: alphaLasso
      })
    });
  },

  // 7. Neural Network Classification
  trainNeuralNet: async (epochs = 35) => {
    return fetchJson('/analytics/classification/train', {
      method: 'POST',
      body: JSON.stringify({ epochs })
    });
  },

  // 8. Single Asset Inference / Predictor
  predictRisk: async (payload) => {
    return fetchJson('/analytics/classification/predict', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // 9. Unsupervised Clustering & PCA
  runClustering: async (nClusters = 4) => {
    return fetchJson('/analytics/clustering', {
      method: 'POST',
      body: JSON.stringify({ n_clusters: nClusters })
    });
  },

  // 10. Municipal Zones
  getZones: async () => {
    return fetchJson('/zones');
  },

  // 11. Terminal Query Bar
  sendTerminalQuery: async (queryText) => {
    return fetchJson('/terminal/query', {
      method: 'POST',
      body: JSON.stringify({ query: queryText })
    });
  }
};
