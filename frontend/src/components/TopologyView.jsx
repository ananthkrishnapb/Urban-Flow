import React, { useState, useEffect } from 'react';
import { 
  Cpu, Sliders, Play, RefreshCw, BarChart2, TrendingUp, 
  Layers, CheckCircle, AlertCircle, Info, Zap, Target
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, BarChart, Bar, 
  ScatterChart, Scatter, XAxis, YAxis, Tooltip, Legend, CartesianGrid 
} from 'recharts';

export default function TopologyView({ api }) {
  const [activeModule, setActiveModule] = useState('MLE_MAP'); // MLE_MAP, REGRESSION, NEURAL_NET, CLUSTERING

  // Module A State: Parameter Estimation
  const [priorMu, setPriorMu] = useState(2.0);
  const [priorSigma2, setPriorSigma2] = useState(1.0);
  const [paramResult, setParamResult] = useState(null);
  const [isLoadingParam, setIsLoadingParam] = useState(false);

  // Module B State: Regression
  const [alphaRidge, setAlphaRidge] = useState(1.0);
  const [alphaLasso, setAlphaLasso] = useState(0.5);
  const [regressionResult, setRegressionResult] = useState(null);
  const [isLoadingReg, setIsLoadingReg] = useState(false);

  // Module C State: Neural Network
  const [nnEpochs, setNnEpochs] = useState(30);
  const [nnResult, setNnResult] = useState(null);
  const [isTrainingNN, setIsTrainingNN] = useState(false);

  // Module D State: Clustering
  const [nClusters, setNClusters] = useState(4);
  const [clusteringResult, setClusteringResult] = useState(null);
  const [isLoadingCluster, setIsLoadingCluster] = useState(false);

  // Fetch initial states
  useEffect(() => {
    runParamEst();
    runReg();
    runClustering();
  }, []);

  const runParamEst = async () => {
    setIsLoadingParam(true);
    try {
      const res = await api.runParameterEstimation(Number(priorMu), Number(priorSigma2));
      setParamResult(res);
    } catch (e) {
      console.warn("Param estimation error:", e);
    } finally {
      setIsLoadingParam(false);
    }
  };

  const runReg = async () => {
    setIsLoadingReg(true);
    try {
      const res = await api.runRegression(Number(alphaRidge), Number(alphaLasso));
      setRegressionResult(res);
    } catch (e) {
      console.warn("Regression error:", e);
    } finally {
      setIsLoadingReg(false);
    }
  };

  const runNNTrain = async () => {
    setIsTrainingNN(true);
    try {
      const res = await api.trainNeuralNet(Number(nnEpochs));
      setNnResult(res);
    } catch (e) {
      console.warn("NN training error:", e);
    } finally {
      setIsTrainingNN(false);
    }
  };

  const runClustering = async () => {
    setIsLoadingCluster(true);
    try {
      const res = await api.runClustering(Number(nClusters));
      setClusteringResult(res);
    } catch (e) {
      console.warn("Clustering error:", e);
    } finally {
      setIsLoadingCluster(false);
    }
  };

  // Format coefficient data for bar chart
  const getCoefBarData = () => {
    if (!regressionResult?.models) return [];
    const features = regressionResult.features || [];
    return features.map(f => ({
      feature: f.replace('_', ' '),
      OLS: regressionResult.models.OLS.coefficients[f] || 0,
      Ridge: regressionResult.models.Ridge.coefficients[f] || 0,
      Lasso: regressionResult.models.Lasso.coefficients[f] || 0
    }));
  };

  const modules = [
    { id: 'MLE_MAP', label: 'MODULE A: PARAMETER ESTIMATION (MLE & MAP)' },
    { id: 'REGRESSION', label: 'MODULE B: REGULARIZATION (RIDGE & LASSO)' },
    { id: 'NEURAL_NET', label: 'MODULE C: PYTORCH NEURAL NETWORK' },
    { id: 'CLUSTERING', label: 'MODULE D: CLUSTERING & PCA REDUCTION' },
  ];

  return (
    <div className="space-y-8">
      {/* Module Selector Header */}
      <div className="bg-white rounded-[2.5rem] p-8 border border-neutral-200/80 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-neutral-400 mb-2">
            <Cpu className="w-4 h-4 text-neutral-600" />
            <span>MATHEMATICAL & ML PIPELINE RIG</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">
            Computational Analytics Topology
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 font-mono mt-1">
            Real-time parameter estimation, regularized cost modeling, deep neural classification, and spatial clustering.
          </p>
        </div>

        {/* Module switcher buttons */}
        <div className="flex flex-wrap gap-2">
          {modules.map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveModule(m.id)}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all border ${
                activeModule === m.id
                  ? 'bg-neutral-900 text-white border-neutral-900 shadow-md'
                  : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-600 border-neutral-200'
              }`}
            >
              {m.label.split(':')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODULE A: PARAMETER ESTIMATION (MLE & MAP) */}
      {/* ========================================================================= */}
      {activeModule === 'MLE_MAP' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Controls & Metrics (1 col) */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-neutral-200/80 shadow-xl flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-neutral-400 uppercase mb-2">
                <span>PRIOR HYPERPARAMETERS</span>
              </div>
              <h2 className="text-xl font-bold text-neutral-900">Sensor Noise Modeling</h2>
              <p className="text-xs font-mono text-neutral-500 mt-1">
                Gaussian conjugate prior for RMS vibration sensor telemetry noise.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-neutral-500">Prior Mean (μ₀):</span>
                  <span className="font-bold text-neutral-900">{priorMu.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="5.0"
                  step="0.1"
                  value={priorMu}
                  onChange={(e) => setPriorMu(parseFloat(e.target.value))}
                  className="w-full accent-black cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-neutral-500">Prior Variance (σ₀²):</span>
                  <span className="font-bold text-neutral-900">{priorSigma2.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="3.0"
                  step="0.1"
                  value={priorSigma2}
                  onChange={(e) => setPriorSigma2(parseFloat(e.target.value))}
                  className="w-full accent-black cursor-pointer"
                />
              </div>

              <button
                onClick={runParamEst}
                disabled={isLoadingParam}
                className="w-full bg-black text-white py-3 rounded-2xl font-mono text-xs font-bold flex items-center justify-center gap-2 hover:bg-neutral-800 transition-all cursor-pointer shadow-md"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{isLoadingParam ? 'Computing...' : 'Recalculate MLE & MAP'}</span>
              </button>
            </div>

            {/* Results cards */}
            {paramResult && (
              <div className="space-y-3 pt-4 border-t border-neutral-100 font-mono text-xs">
                <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200">
                  <div className="flex justify-between items-center text-neutral-500 text-[10px] uppercase">
                    <span>Maximum Likelihood (MLE)</span>
                    <span className="text-blue-600 font-bold">Unregularized</span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-neutral-900">{paramResult.mle.mu_mle}</span>
                    <span className="text-xs text-neutral-400">mm/s² (σ²: {paramResult.mle.sigma2_mle})</span>
                  </div>
                </div>

                <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200">
                  <div className="flex justify-between items-center text-neutral-500 text-[10px] uppercase">
                    <span>Maximum A Posteriori (MAP)</span>
                    <span className="text-emerald-600 font-bold">Prior Informed</span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-neutral-900">{paramResult.map.mu_map}</span>
                    <span className="text-xs text-neutral-400">mm/s² (σ²: {paramResult.map.post_variance})</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Visualization (2 cols) */}
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 border border-neutral-200/80 shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-neutral-100">
              <div className="font-mono text-xs font-bold tracking-widest text-neutral-800 uppercase">
                PROBABILITY DENSITY CURVES: PRIOR VS LIKELIHOOD VS POSTERIOR
              </div>
              <span className="text-[10px] font-mono text-neutral-400">
                Gaussian Conjugate Formulation
              </span>
            </div>

            <div className="h-80 w-full">
              {paramResult?.map?.distribution_curves ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={paramResult.map.distribution_curves} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="param_val" stroke="#94a3b8" fontSize={11} fontStyle="mono" />
                    <YAxis stroke="#94a3b8" fontSize={11} fontStyle="mono" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#262626', borderRadius: '12px', fontSize: '11px', color: '#fff' }} 
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', fontFamily: 'JetBrains Mono', paddingTop: '10px' }} />
                    <Line type="monotone" dataKey="prior" stroke="#94a3b8" strokeDasharray="4 4" strokeWidth={2} name="Prior p(μ)" dot={false} />
                    <Line type="monotone" dataKey="likelihood" stroke="#3b82f6" strokeWidth={2} name="Likelihood p(D|μ)" dot={false} />
                    <Line type="monotone" dataKey="posterior" stroke="#10b981" strokeWidth={3} name="Posterior p(μ|D) [MAP]" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-xs font-mono text-neutral-400">
                  Loading curves...
                </div>
              )}
            </div>

            <div className="mt-4 p-4 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs font-mono text-neutral-600">
              <span className="font-bold text-neutral-900 block mb-1">Mathematical Derivation:</span>
              <p className="leading-relaxed">
                {paramResult?.interpretation || "The MAP estimate balances empirical sensor evidence against domain prior belief, preventing overfitting to transient sensor spikes."}
              </p>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODULE B: SUPERVISED REGRESSION & REGULARIZATION */}
      {/* ========================================================================= */}
      {activeModule === 'REGRESSION' && (
        <div className="space-y-8">
          {/* Controls Bar */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-neutral-200/80 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-neutral-500 font-bold">Ridge Regularization (α L2):</span>
                <span className="font-black text-neutral-900">{alphaRidge.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.01"
                max="20.0"
                step="0.2"
                value={alphaRidge}
                onChange={(e) => setAlphaRidge(parseFloat(e.target.value))}
                className="w-full accent-black cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-neutral-500 font-bold">Lasso Regularization (α L1):</span>
                <span className="font-black text-neutral-900">{alphaLasso.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.01"
                max="10.0"
                step="0.1"
                value={alphaLasso}
                onChange={(e) => setAlphaLasso(parseFloat(e.target.value))}
                className="w-full accent-black cursor-pointer"
              />
            </div>

            <div>
              <button
                onClick={runReg}
                disabled={isLoadingReg}
                className="w-full bg-black text-white py-3 rounded-2xl font-mono text-xs font-bold flex items-center justify-center gap-2 hover:bg-neutral-800 transition-all cursor-pointer shadow-md"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{isLoadingReg ? 'Fitting Models...' : 'Re-fit OLS, Ridge & Lasso'}</span>
              </button>
            </div>
          </div>

          {/* Model Metrics Comparison Cards */}
          {regressionResult?.models && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
              {['OLS', 'Ridge', 'Lasso'].map((modelName) => {
                const m = regressionResult.models[modelName];
                return (
                  <div key={modelName} className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-md">
                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-neutral-100">
                      <span className="font-black text-neutral-900 text-sm tracking-wider">{modelName} REGRESSION</span>
                      <span className="text-[10px] text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded">
                        {modelName === 'OLS' ? 'No Penalty' : modelName === 'Ridge' ? 'L2 Shrinkage' : 'L1 Sparsity'}
                      </span>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-500">Mean Abs Error (MAE):</span>
                        <span className="font-bold text-neutral-900">${m.metrics.MAE}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-500">Root Mean Sq Error (RMSE):</span>
                        <span className="font-bold text-neutral-900">${m.metrics.RMSE}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-500">R² Coefficient:</span>
                        <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                          {m.metrics.R2}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Coefficients & Parity Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Coefficients Bar Chart */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-neutral-200/80 shadow-xl">
              <div className="font-mono text-xs font-bold tracking-widest text-neutral-800 uppercase mb-4 pb-2 border-b border-neutral-100">
                FEATURE WEIGHT SHRINKAGE (OLS VS RIDGE VS LASSO)
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getCoefBarData()} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="feature" stroke="#94a3b8" fontSize={10} fontStyle="mono" angle={-15} textAnchor="end" />
                    <YAxis stroke="#94a3b8" fontSize={11} fontStyle="mono" />
                    <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#262626', borderRadius: '12px', fontSize: '11px', color: '#fff' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'JetBrains Mono', paddingTop: '10px' }} />
                    <Bar dataKey="OLS" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Ridge" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Lasso" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Parity Scatter Plot */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-neutral-200/80 shadow-xl">
              <div className="font-mono text-xs font-bold tracking-widest text-neutral-800 uppercase mb-4 pb-2 border-b border-neutral-100">
                ACTUAL VS PREDICTED COST (PARITY PLOT)
              </div>
              <div className="h-72 w-full">
                {regressionResult?.parity_scatter ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis type="number" dataKey="actual" name="Actual Cost ($)" stroke="#94a3b8" fontSize={11} fontStyle="mono" />
                      <YAxis type="number" dataKey="predicted" name="Predicted Cost ($)" stroke="#94a3b8" fontSize={11} fontStyle="mono" />
                      <Tooltip 
                        cursor={{ strokeDasharray: '3 3' }} 
                        contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#262626', borderRadius: '12px', fontSize: '11px', color: '#fff' }} 
                      />
                      <Scatter name="Ridge Preds" data={regressionResult.parity_scatter} fill="#0a0a0a" />
                    </ScatterChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-xs font-mono text-neutral-400">
                    Loading scatter...
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODULE C: PYTORCH NEURAL NETWORK & RISK CLASSIFIER */}
      {/* ========================================================================= */}
      {activeModule === 'NEURAL_NET' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Architecture & Training Panel (1 col) */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-neutral-200/80 shadow-xl flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-neutral-400 uppercase mb-2">
                <span>PYTORCH NN TOPOLOGY</span>
              </div>
              <h2 className="text-xl font-bold text-neutral-900">InfrastructureNN</h2>
              <p className="text-xs font-mono text-neutral-500 mt-1">
                Multi-layer Perceptron for 3-class structural failure risk classification.
              </p>
            </div>

            {/* Neural Net Architecture schematic */}
            <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 font-mono text-xs space-y-2">
              <div className="flex justify-between text-neutral-600">
                <span>Input Layer:</span>
                <span className="font-bold text-neutral-900">5 Telemetry Features</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Hidden 1:</span>
                <span className="font-bold text-neutral-900">Linear(64) + ReLU + Dropout(0.2)</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Hidden 2:</span>
                <span className="font-bold text-neutral-900">Linear(32) + Tanh</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Output Layer:</span>
                <span className="font-bold text-emerald-600">Linear(3) Softmax (Low/Med/Crit)</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-neutral-500">Training Epochs:</span>
                  <span className="font-bold text-neutral-900">{nnEpochs}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="60"
                  step="5"
                  value={nnEpochs}
                  onChange={(e) => setNnEpochs(parseInt(e.target.value))}
                  className="w-full accent-black cursor-pointer"
                />
              </div>

              <button
                onClick={runNNTrain}
                disabled={isTrainingNN}
                className="w-full bg-black text-white py-3 rounded-2xl font-mono text-xs font-bold flex items-center justify-center gap-2 hover:bg-neutral-800 transition-all cursor-pointer shadow-md"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{isTrainingNN ? 'Training PyTorch Model...' : 'Train Neural Network'}</span>
              </button>
            </div>

            {/* Accuracy comparisons */}
            {nnResult && (
              <div className="space-y-3 font-mono text-xs pt-4 border-t border-neutral-100">
                <div className="flex justify-between items-center bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-200">
                  <span>NN Test Accuracy:</span>
                  <span className="font-black text-base">{(nnResult.nn_accuracy * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center bg-neutral-50 text-neutral-700 p-3 rounded-xl border border-neutral-200">
                  <span>Logistic Baseline:</span>
                  <span className="font-bold">{(nnResult.logistic_baseline_accuracy * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center text-neutral-500 px-1">
                  <span>ROC-AUC (OvR):</span>
                  <span className="font-bold text-neutral-900">{nnResult.roc_auc_ovr}</span>
                </div>
              </div>
            )}
          </div>

          {/* Loss Curve & Confusion Matrix (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Loss curve */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-neutral-200/80 shadow-xl">
              <div className="font-mono text-xs font-bold tracking-widest text-neutral-800 uppercase mb-4 pb-2 border-b border-neutral-100">
                CROSS-ENTROPY LOSS CONVERGENCE
              </div>
              <div className="h-56 w-full">
                {nnResult?.loss_history ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={nnResult.loss_history} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="epoch" stroke="#94a3b8" fontSize={11} fontStyle="mono" />
                      <YAxis stroke="#94a3b8" fontSize={11} fontStyle="mono" />
                      <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#262626', borderRadius: '12px', fontSize: '11px', color: '#fff' }} />
                      <Line type="monotone" dataKey="loss" stroke="#0a0a0a" strokeWidth={2.5} dot={{ r: 3 }} name="CrossEntropy Loss" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-xs font-mono text-neutral-400">
                    Click "Train Neural Network" to generate loss telemetry.
                  </div>
                )}
              </div>
            </div>

            {/* Confusion Matrix Table */}
            {nnResult?.confusion_matrix && (
              <div className="bg-white rounded-[2.5rem] p-8 border border-neutral-200/80 shadow-xl">
                <div className="font-mono text-xs font-bold tracking-widest text-neutral-800 uppercase mb-4 pb-2 border-b border-neutral-100">
                  EVALUATION CONFUSION MATRIX (TEST SPLIT)
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-center font-mono text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-neutral-200 text-neutral-400 text-[10px] tracking-wider uppercase">
                        <th className="py-2 text-left">Actual \ Predicted</th>
                        <th className="py-2 text-emerald-600">Pred Low (0)</th>
                        <th className="py-2 text-amber-600">Pred Med (1)</th>
                        <th className="py-2 text-red-600">Pred Crit (2)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {['Actual Low', 'Actual Medium', 'Actual Critical'].map((label, rIdx) => (
                        <tr key={label}>
                          <td className="py-3 text-left font-bold text-neutral-700">{label}</td>
                          {nnResult.confusion_matrix[rIdx].map((val, cIdx) => {
                            const isDiagonal = rIdx === cIdx;
                            return (
                              <td key={cIdx} className="py-3">
                                <span className={`inline-block px-3 py-1 rounded-lg font-bold ${
                                  isDiagonal ? 'bg-neutral-900 text-white' : 'text-neutral-400'
                                }`}>
                                  {val}
                                </span>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODULE D: UNSUPERVISED CLUSTERING & PCA */}
      {/* ========================================================================= */}
      {activeModule === 'CLUSTERING' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Controls & Explained Variance (1 col) */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-neutral-200/80 shadow-xl flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-neutral-400 uppercase mb-2">
                <span>UNSUPERVISED ZONING</span>
              </div>
              <h2 className="text-xl font-bold text-neutral-900">K-Means & PCA</h2>
              <p className="text-xs font-mono text-neutral-500 mt-1">
                2D Principal Component Projection of 5-dimensional infrastructure degradation features.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-neutral-500">Clusters (k):</span>
                  <span className="font-bold text-neutral-900">{nClusters}</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="6"
                  step="1"
                  value={nClusters}
                  onChange={(e) => setNClusters(parseInt(e.target.value))}
                  className="w-full accent-black cursor-pointer"
                />
              </div>

              <button
                onClick={runClustering}
                disabled={isLoadingCluster}
                className="w-full bg-black text-white py-3 rounded-2xl font-mono text-xs font-bold flex items-center justify-center gap-2 hover:bg-neutral-800 transition-all cursor-pointer shadow-md"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{isLoadingCluster ? 'Clustering...' : 'Run K-Means & PCA'}</span>
              </button>
            </div>

            {/* Explained Variance Cards */}
            {clusteringResult && (
              <div className="space-y-3 font-mono text-xs pt-4 border-t border-neutral-100">
                <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200">
                  <span className="text-[10px] text-neutral-400 uppercase block mb-1">TOTAL EXPLAINED VARIANCE</span>
                  <span className="text-2xl font-black text-neutral-900">
                    {(clusteringResult.total_explained_variance * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="flex justify-between text-neutral-500 text-xs px-1">
                  <span>PC 1 (Axis 1): {((clusteringResult.explained_variance_ratio[0] || 0) * 100).toFixed(1)}%</span>
                  <span>PC 2 (Axis 2): {((clusteringResult.explained_variance_ratio[1] || 0) * 100).toFixed(1)}%</span>
                </div>
              </div>
            )}
          </div>

          {/* PCA 2D Scatter Projection (2 cols) */}
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 border border-neutral-200/80 shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-neutral-100">
              <div className="font-mono text-xs font-bold tracking-widest text-neutral-800 uppercase">
                2D PCA TELEMETRY EMBEDDING (POINTS COLORED BY CLUSTER)
              </div>
              <span className="text-[10px] font-mono text-neutral-400">
                Sample: 150 Nodes
              </span>
            </div>

            <div className="h-80 w-full">
              {clusteringResult?.points ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" dataKey="pca_x" name="Principal Component 1" stroke="#94a3b8" fontSize={11} fontStyle="mono" />
                    <YAxis type="number" dataKey="pca_y" name="Principal Component 2" stroke="#94a3b8" fontSize={11} fontStyle="mono" />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      content={({ payload }) => {
                        if (!payload || payload.length === 0) return null;
                        const data = payload[0].payload;
                        return (
                          <div className="bg-neutral-950 text-white p-3 rounded-xl font-mono text-xs border border-neutral-800 shadow-xl">
                            <div className="font-bold text-emerald-400 mb-1">Node #{data.id} • {data.zone}</div>
                            <div>Cluster: {data.cluster + 1}</div>
                            <div>Age: {data.age} yrs | RMS Vib: {data.vibration} mm/s²</div>
                            <div>Risk Class: {data.risk === 2 ? 'Critical' : data.risk === 1 ? 'Medium' : 'Low'}</div>
                          </div>
                        );
                      }}
                    />
                    <Scatter name="Telemetry Nodes" data={clusteringResult.points} fill="#0a0a0a" />
                  </ScatterChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-xs font-mono text-neutral-400">
                  Loading PCA projection...
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-mono text-neutral-500 pt-2 border-t border-neutral-100">
              <span className="font-bold text-neutral-800">Cluster Zones:</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Zone A (Low Load)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Zone B (Resilient)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Zone C (Fatigued)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Zone D (Critical Anomaly)</span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
