import React, { useState, useEffect } from 'react';
import { 
  Sliders, ArrowRight, ShieldAlert, CheckCircle, AlertTriangle, 
  Download, Zap, TrendingUp, DollarSign, Calendar, RefreshCw
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';

export default function SandboxView({ api }) {
  const [assetAge, setAssetAge] = useState(14.5);
  const [materialQuality, setMaterialQuality] = useState(0.82);
  const [trafficLoad, setTrafficLoad] = useState(22000);
  const [soilMoisture, setSoilMoisture] = useState(26.0);
  const [vibrationAmp, setVibrationAmp] = useState(3.4);

  const [prediction, setPrediction] = useState(null);
  const [isInferring, setIsInferring] = useState(false);

  const runPrediction = async () => {
    setIsInferring(true);
    try {
      const res = await api.predictRisk({
        asset_age_years: parseFloat(assetAge),
        material_quality_index: parseFloat(materialQuality),
        traffic_load_index: parseFloat(trafficLoad),
        soil_moisture: parseFloat(soilMoisture),
        vibration_amplitude: parseFloat(vibrationAmp)
      });
      setPrediction(res);
    } catch (e) {
      console.warn("Prediction error:", e);
    } finally {
      setIsInferring(false);
    }
  };

  useEffect(() => {
    runPrediction();
  }, [assetAge, materialQuality, trafficLoad, soilMoisture, vibrationAmp]);

  // Generate 10-year forward projection data
  const getProjectionData = () => {
    const data = [];
    const baseCost = prediction?.predicted_cost || 14000;
    for (let yr = 0; yr <= 10; yr++) {
      // Compounding degradation
      const projectedCost = Math.round(baseCost * Math.pow(1 + 0.08, yr) + (yr * 650));
      const projectedRisk = Math.min(100, Math.round(30 + (yr * 6.5) + (vibrationAmp * 3)));
      data.push({
        year: `+${yr} Yr`,
        cost: projectedCost,
        riskScore: projectedRisk
      });
    }
    return data;
  };

  // Export batch CSV
  const exportSyntheticCsv = async () => {
    try {
      const sim = await api.simulateTelemetry(500);
      const rows = sim.preview || [];
      if (rows.length === 0) return;
      
      const headers = Object.keys(rows[0]).join(',');
      const csvContent = "data:text/csv;charset=utf-8," + 
        [headers, ...rows.map(r => Object.values(r).join(','))].join('\n');
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `urbanflow_telemetry_batch_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.warn("Export failed:", err);
    }
  };

  const getStatusBadge = (classId) => {
    if (classId === 0) {
      return {
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        dot: 'bg-emerald-500',
        text: 'LOW STRUCTURAL RISK'
      };
    } else if (classId === 1) {
      return {
        bg: 'bg-amber-50 text-amber-800 border-amber-200',
        dot: 'bg-amber-500',
        text: 'ELEVATED FATIGUE (MEDIUM)'
      };
    } else {
      return {
        bg: 'bg-red-50 text-red-800 border-red-200',
        dot: 'bg-red-500 animate-pulse',
        text: 'CRITICAL FAILURE THREAT'
      };
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-[2.5rem] p-8 border border-neutral-200/80 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-neutral-400 mb-2">
            <Sliders className="w-4 h-4 text-neutral-600" />
            <span>INTERACTIVE ASSET DEGRADATION SIMULATOR</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">
            Predictive Asset Sandbox
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 font-mono mt-1">
            Simulate custom multi-variable stress conditions to evaluate neural network risk predictions in real-time.
          </p>
        </div>

        <button
          onClick={exportSyntheticCsv}
          className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white px-5 py-3 rounded-2xl font-mono text-xs font-bold transition-all shadow-md cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export Synthetic Batch (CSV)</span>
        </button>
      </div>

      {/* Main Grid: Controls vs Live Inference */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sliders Panel (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-[2.5rem] p-8 border border-neutral-200/80 shadow-xl flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[10px] tracking-widest text-neutral-400 uppercase">
                TELEMETRIC STRESS FACTORS
              </span>
              <span className="text-[10px] font-mono text-neutral-400">
                Live Parameter Binding
              </span>
            </div>
            <h2 className="text-xl font-bold text-neutral-900">Asset Parameters</h2>
          </div>

          <div className="space-y-5 font-mono text-xs">
            {/* Slider 1 */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-neutral-500">Asset Age (Years):</span>
                <span className="font-black text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded">{assetAge.toFixed(1)} yrs</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="30.0"
                step="0.5"
                value={assetAge}
                onChange={(e) => setAssetAge(parseFloat(e.target.value))}
                className="w-full accent-black cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-400 mt-0.5">
                <span>1 yr (New)</span>
                <span>30 yrs (Historic)</span>
              </div>
            </div>

            {/* Slider 2 */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-neutral-500">Material Quality Index:</span>
                <span className="font-black text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded">{materialQuality.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="1.0"
                step="0.02"
                value={materialQuality}
                onChange={(e) => setMaterialQuality(parseFloat(e.target.value))}
                className="w-full accent-black cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-400 mt-0.5">
                <span>0.20 (Fatigued)</span>
                <span>1.00 (Reinforced)</span>
              </div>
            </div>

            {/* Slider 3 */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-neutral-500">Daily Traffic Load:</span>
                <span className="font-black text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded">{Math.round(trafficLoad).toLocaleString()} vpd</span>
              </div>
              <input
                type="range"
                min="1000"
                max="50000"
                step="1000"
                value={trafficLoad}
                onChange={(e) => setTrafficLoad(parseFloat(e.target.value))}
                className="w-full accent-black cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-400 mt-0.5">
                <span>1,000 vpd</span>
                <span>50,000 vpd</span>
              </div>
            </div>

            {/* Slider 4 */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-neutral-500">Soil Moisture Content:</span>
                <span className="font-black text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded">{soilMoisture.toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min="5.0"
                max="60.0"
                step="1.0"
                value={soilMoisture}
                onChange={(e) => setSoilMoisture(parseFloat(e.target.value))}
                className="w-full accent-black cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-400 mt-0.5">
                <span>5% (Arid)</span>
                <span>60% (Saturated)</span>
              </div>
            </div>

            {/* Slider 5 */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-neutral-500">RMS Vibration (Amplitude):</span>
                <span className="font-black text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded">{vibrationAmp.toFixed(2)} mm/s²</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="12.0"
                step="0.1"
                value={vibrationAmp}
                onChange={(e) => setVibrationAmp(parseFloat(e.target.value))}
                className="w-full accent-black cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-400 mt-0.5">
                <span>0.5 mm/s² (Normal)</span>
                <span>12.0 mm/s² (Extreme)</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                setAssetAge(5.0);
                setMaterialQuality(0.95);
                setTrafficLoad(12000);
                setSoilMoisture(20.0);
                setVibrationAmp(1.5);
              }}
              className="text-xs font-mono text-neutral-500 hover:text-neutral-800 underline transition-colors"
            >
              Reset to Pristine Baseline
            </button>
          </div>
        </div>

        {/* Inference & Projection (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Main Inference Card */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-neutral-200/80 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <span className="font-mono text-xs font-bold tracking-widest text-neutral-800 uppercase">
                REAL-TIME NEURAL CLASSIFIER INFERENCE
              </span>
              <span className="text-[10px] font-mono text-neutral-400">
                PyTorch Feedforward Pass
              </span>
            </div>

            {prediction && (
              <div className="space-y-6">
                {/* Status Hero */}
                <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${getStatusBadge(prediction.predicted_class_id).bg}`}>
                  <div className="flex items-center gap-3">
                    <span className={`w-3.5 h-3.5 rounded-full ${getStatusBadge(prediction.predicted_class_id).dot}`}></span>
                    <div>
                      <span className="text-xs font-mono font-bold block uppercase tracking-wider">
                        {prediction.predicted_label}
                      </span>
                      <span className="text-[11px] font-mono opacity-80">
                        Confidence: {(prediction.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div className="font-mono text-right">
                    <span className="text-[10px] opacity-70 block uppercase">Projected Annual Cost</span>
                    <span className="text-2xl font-black">${prediction.predicted_cost.toLocaleString()}</span>
                  </div>
                </div>

                {/* Class Probabilities Bar */}
                <div className="space-y-2 font-mono text-xs">
                  <div className="flex justify-between text-neutral-500 text-[11px]">
                    <span>SOFTMAX CLASS PROBABILITIES</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-200 text-center">
                      <span className="text-[10px] text-neutral-400 block">LOW</span>
                      <span className="font-bold text-emerald-600">
                        {((prediction.class_probabilities?.Low || 0) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-200 text-center">
                      <span className="text-[10px] text-neutral-400 block">MEDIUM</span>
                      <span className="font-bold text-amber-600">
                        {((prediction.class_probabilities?.Medium || 0) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-200 text-center">
                      <span className="text-[10px] text-neutral-400 block">CRITICAL</span>
                      <span className="font-bold text-red-600">
                        {((prediction.class_probabilities?.Critical || 0) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Recommendation box */}
                <div className="bg-neutral-950 text-neutral-200 p-4 rounded-2xl font-mono text-xs border border-neutral-800">
                  <span className="text-[10px] text-emerald-400 font-bold block mb-1 uppercase tracking-wider">
                    ● ACTIONABLE PROTOCOL DIRECTIVE
                  </span>
                  <p className="leading-relaxed">
                    {prediction.recommendation}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 10-Year Forward Degradation Projection */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-neutral-200/80 shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-neutral-100">
              <div className="font-mono text-xs font-bold tracking-widest text-neutral-800 uppercase">
                10-YEAR FORWARD DEGRADATION & LIABILITY FORECAST
              </div>
              <span className="text-[10px] font-mono text-neutral-400">
                Without Preventive Damping
              </span>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={getProjectionData()} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} fontStyle="mono" />
                  <YAxis stroke="#94a3b8" fontSize={11} fontStyle="mono" tickFormatter={(v) => `$${v / 1000}k`} />
                  <Tooltip 
                    formatter={(value) => [`$${value.toLocaleString()}`, 'Projected Cost']}
                    contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#262626', borderRadius: '12px', fontSize: '11px', color: '#fff' }} 
                  />
                  <Area type="monotone" dataKey="cost" stroke="#0a0a0a" fill="#e5e5e5" strokeWidth={2.5} name="Cost ($)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
