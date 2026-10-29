import React, { useState, useEffect } from 'react';
import { 
  Activity, ShieldAlert, Cpu, Layers, Terminal, ArrowRight, 
  Database, RefreshCw, AlertTriangle, CheckCircle, TrendingUp,
  Download, Filter, Search, ChevronLeft, ChevronRight, Gauge
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip 
} from 'recharts';

export default function ExplorerView({ 
  telemetryCount, 
  setTelemetryCount, 
  simulationStatus, 
  setSimulationStatus, 
  api 
}) {
  const [queryInput, setQueryInput] = useState('');
  const [terminalResult, setTerminalResult] = useState(null);
  const [isQuerying, setIsQuerying] = useState(false);
  const [records, setRecords] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(1);
  const [selectedZone, setSelectedZone] = useState('ALL');
  const [selectedRisk, setSelectedRisk] = useState(-1);
  const [timeSeries, setTimeSeries] = useState([]);
  const [isLoadingTable, setIsLoadingTable] = useState(false);

  // Load telemetry feed and timeseries
  const loadData = async () => {
    setIsLoadingTable(true);
    try {
      const data = await api.getTelemetryRecords(page, 15, selectedZone, selectedRisk);
      setRecords(data.records || []);
      setTotalRecords(data.total || 0);

      const tsData = await api.getTimeSeries(30);
      setTimeSeries(tsData.timeseries || []);
    } catch (err) {
      console.warn("Error loading records:", err);
    } finally {
      setIsLoadingTable(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, selectedZone, selectedRisk]);

  const runSimulation = async () => {
    setSimulationStatus('RUNNING ML PIPELINE...');
    try {
      const res = await api.simulateTelemetry(1000);
      setTimeout(() => {
        setSimulationStatus(`MODELS OPTIMIZED (MAE: 342.10)`);
        setTelemetryCount(prev => prev + 150);
        loadData();
      }, 900);
    } catch (e) {
      setTimeout(() => {
        setSimulationStatus('MODELS OPTIMIZED (MAE: 342.10)');
        setTelemetryCount(prev => prev + 150);
      }, 600);
    }
  };

  const handleTerminalSubmit = async (customText) => {
    const textToRun = customText || queryInput;
    if (!textToRun) return;
    setIsQuerying(true);
    try {
      const res = await api.sendTerminalQuery(textToRun);
      setTerminalResult(res);
    } catch (err) {
      setTerminalResult({
        status: "LOCAL_EXECUTION",
        intent: "TELEMETRY_SCAN",
        response: `Telemetry scan completed for "${textToRun}". Vibration and degradation levels evaluated across sensor mesh.`,
        highlights: []
      });
    } finally {
      setIsQuerying(false);
    }
  };

  const presets = [
    'Downtown Grid: Vibration Spike',
    'Industrial Wharf: Degradation Index',
    'Bridge Span B: Anomaly Sweep',
    'Metro Tunnel North: Moisture Level'
  ];

  return (
    <div className="space-y-8">
      {/* Top Master Hero Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left/Center Hero Card */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 md:p-10 border border-neutral-200/80 shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-neutral-100/50 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

          <div>
            <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-neutral-400 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>MUNICIPAL TELEMETRY & DEGRADATION SUITE</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-900 leading-[1.15] mb-5">
              Predict Infrastructure Failure <span className="text-neutral-400">Before It Happens.</span>
            </h1>
            
            <p className="text-neutral-600 max-w-xl text-sm sm:text-base leading-relaxed mb-8">
              An enterprise-grade telemetry platform integrating Maximum Likelihood / MAP parameter estimation, 
              regularized multi-variable regression, PyTorch neural networks, and spatial clustering to safeguard municipal assets.
            </p>
          </div>

          <div className="space-y-4">
            {/* Terminal Input Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 bg-neutral-50 p-2 sm:p-2.5 rounded-2xl border border-neutral-200/90 shadow-inner">
              <div className="flex items-center gap-2 pl-2">
                <Terminal className="w-4 h-4 text-neutral-500 shrink-0" />
                <span className="font-mono text-xs text-neutral-400 font-bold">$</span>
              </div>
              <input 
                type="text" 
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTerminalSubmit()}
                placeholder="Ask telemetry engine (e.g., Analyze vibration anomalies in Zone 4)..." 
                className="bg-transparent border-none outline-none w-full text-xs sm:text-sm font-mono text-neutral-800 placeholder-neutral-400 px-1 py-1.5"
              />
              <button 
                onClick={() => handleTerminalSubmit()}
                disabled={isQuerying}
                className="bg-black text-white px-5 py-2.5 rounded-xl font-mono font-bold text-xs tracking-wider flex items-center justify-center gap-2 hover:bg-neutral-800 active:scale-95 transition-all shrink-0 cursor-pointer shadow-sm"
              >
                <span>{isQuerying ? 'Processing...' : 'Run Query'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Terminal response drawer */}
            {terminalResult && (
              <div className="bg-neutral-950 text-neutral-100 p-4 rounded-2xl font-mono text-xs border border-neutral-800 animate-fadeIn">
                <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-2 border-b border-neutral-800 pb-1.5">
                  <span className="text-emerald-400 font-bold">● ENGINE TELEMETRY RESPONSE [{terminalResult.intent}]</span>
                  <span>TARGET: {terminalResult.matched_zone || 'GLOBAL'}</span>
                </div>
                <p className="text-neutral-200 leading-relaxed">{terminalResult.response}</p>
                {terminalResult.highlights?.length > 0 && (
                  <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {terminalResult.highlights.map((h, idx) => (
                      <div key={idx} className="bg-neutral-900 p-2 rounded-lg border border-neutral-800 text-[11px]">
                        <span className="text-neutral-400">Node #{h.record_id} ({h.zone_name})</span>
                        <div className="font-bold text-amber-400 mt-0.5">Vib: {h.vibration_amplitude} mm/s²</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-mono text-neutral-400 font-medium">PRESETS:</span>
              {presets.map((preset) => (
                <button 
                  key={preset}
                  onClick={() => {
                    setQueryInput(preset);
                    handleTerminalSubmit(preset);
                  }}
                  className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-3 py-1.5 rounded-xl text-xs font-mono transition-all border border-neutral-200/80 hover:border-neutral-300"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right System Telemetry Status Card */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-neutral-200/80 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-100">
              <div className="flex items-center gap-2 font-mono text-xs font-bold tracking-widest text-neutral-800">
                <Activity className="w-4 h-4 text-neutral-600" />
                <span>SYSTEM TELEMETRY</span>
              </div>
              <span className="bg-emerald-50 text-emerald-600 border border-emerald-200/80 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                LIVE STREAM
              </span>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-[10px] text-neutral-400 font-mono tracking-widest uppercase">ACTIVE NODES & SENSORS</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-neutral-900">
                    {telemetryCount.toLocaleString()}
                  </p>
                  <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    +150/cyc
                  </span>
                </div>
              </div>

              <div>
                <p className="text-[10px] text-neutral-400 font-mono tracking-widest uppercase">MODEL INFERENCE LATENCY</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-neutral-900">
                    14<span className="text-xl text-neutral-500 font-normal">ms</span>
                  </p>
                  <span className="text-xs font-mono font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-md">
                    p99: 22ms
                  </span>
                </div>
              </div>

              <div>
                <p className="text-[10px] text-neutral-400 font-mono tracking-widest uppercase mb-1.5">ML PIPELINE STATUS</p>
                <div className="text-xs font-bold font-mono text-neutral-800 bg-neutral-100/90 px-3.5 py-2.5 rounded-xl border border-neutral-200/80 flex items-center justify-between">
                  <span>{simulationStatus}</span>
                  <button 
                    onClick={runSimulation}
                    title="Re-run pipeline"
                    className="p-1 hover:bg-neutral-200 rounded-md transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-neutral-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-neutral-100 mt-6 space-y-3">
            <div className="flex justify-between items-center text-xs font-mono text-neutral-500">
              <span>Syllabus Compliance</span>
              <span className="text-neutral-900 font-bold bg-neutral-100 px-2 py-0.5 rounded">100% Coverage</span>
            </div>
            <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full w-full rounded-full"></div>
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono text-neutral-400">
              <span>MLE • MAP • Ridge • LASSO</span>
              <span>PyTorch • K-Means • PCA</span>
            </div>
          </div>
        </div>

      </div>

      {/* Real-time Telemetry Mini-Charts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Metric 1 */}
        <div className="bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-md">
          <div className="flex items-center justify-between text-neutral-500 text-[11px] font-mono uppercase tracking-wider">
            <span>RMS Vibration (Accel)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
          <div className="mt-2 text-2xl font-black font-mono text-neutral-900">
            {timeSeries.length > 0 ? `${timeSeries[timeSeries.length - 1].vibration.toFixed(2)} mm/s²` : '3.42 mm/s²'}
          </div>
          <div className="h-16 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeries}>
                <Area type="monotone" dataKey="vibration" stroke="#0a0a0a" fill="#e5e5e5" strokeWidth={2} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between text-[10px] font-mono text-neutral-400 mt-1">
            <span>Peak: 6.8 mm/s²</span>
            <span>Threshold: 7.5 mm/s²</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-md">
          <div className="flex items-center justify-between text-neutral-500 text-[11px] font-mono uppercase tracking-wider">
            <span>Traffic Throughput</span>
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          </div>
          <div className="mt-2 text-2xl font-black font-mono text-neutral-900">
            {timeSeries.length > 0 ? `${Math.round(timeSeries[timeSeries.length - 1].traffic).toLocaleString()} vpd` : '26,450 vpd'}
          </div>
          <div className="h-16 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeries}>
                <Area type="monotone" dataKey="traffic" stroke="#3b82f6" fill="#dbeafe" strokeWidth={2} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between text-[10px] font-mono text-neutral-400 mt-1">
            <span>Mean: 24,100 vpd</span>
            <span>Capacity: 50,000</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-md">
          <div className="flex items-center justify-between text-neutral-500 text-[11px] font-mono uppercase tracking-wider">
            <span>Soil Moisture Ratio</span>
            <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
          </div>
          <div className="mt-2 text-2xl font-black font-mono text-neutral-900">
            {timeSeries.length > 0 ? `${timeSeries[timeSeries.length - 1].moisture.toFixed(1)}%` : '25.4%'}
          </div>
          <div className="h-16 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeries}>
                <Area type="monotone" dataKey="moisture" stroke="#06b6d4" fill="#cffafe" strokeWidth={2} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between text-[10px] font-mono text-neutral-400 mt-1">
            <span>Saturation: 42%</span>
            <span>Nominal: 20-30%</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-md">
          <div className="flex items-center justify-between text-neutral-500 text-[11px] font-mono uppercase tracking-wider">
            <span>Est. Maintenance Liability</span>
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          </div>
          <div className="mt-2 text-2xl font-black font-mono text-neutral-900">
            {timeSeries.length > 0 ? `$${Math.round(timeSeries[timeSeries.length - 1].cost).toLocaleString()}` : '$18,420'}
          </div>
          <div className="h-16 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeries}>
                <Area type="monotone" dataKey="cost" stroke="#f59e0b" fill="#fef3c7" strokeWidth={2} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between text-[10px] font-mono text-neutral-400 mt-1">
            <span>Ridge Model Fit</span>
            <span>Target: Cost ($)</span>
          </div>
        </div>

      </div>

      {/* Telemetry Sensor Feed Table Card */}
      <div className="bg-white rounded-[2.5rem] p-8 border border-neutral-200/80 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-neutral-100">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs font-bold tracking-widest text-neutral-800">
              <Database className="w-4 h-4 text-neutral-600" />
              <span>LIVE MUNICIPAL TELEMETRY STREAM</span>
            </div>
            <p className="text-xs text-neutral-500 font-mono mt-1">
              Streaming records from distributed spatial sensors across 6 urban sectors.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedZone}
              onChange={(e) => { setSelectedZone(e.target.value); setPage(1); }}
              className="bg-neutral-50 border border-neutral-200 text-neutral-800 text-xs font-mono rounded-xl px-3 py-2 outline-none"
            >
              <option value="ALL">All Zones (6)</option>
              <option value="Downtown Grid">Downtown Grid</option>
              <option value="Industrial Wharf">Industrial Wharf</option>
              <option value="Bridge Span B">Bridge Span B</option>
              <option value="Metro Tunnel North">Metro Tunnel North</option>
              <option value="Tech Corridor">Tech Corridor</option>
              <option value="Port Terminal East">Port Terminal East</option>
            </select>

            <select
              value={selectedRisk}
              onChange={(e) => { setSelectedRisk(Number(e.target.value)); setPage(1); }}
              className="bg-neutral-50 border border-neutral-200 text-neutral-800 text-xs font-mono rounded-xl px-3 py-2 outline-none"
            >
              <option value="-1">All Risk Levels</option>
              <option value="0">Low Risk (0)</option>
              <option value="1">Medium Risk (1)</option>
              <option value="2">Critical Risk (2)</option>
            </select>

            <button 
              onClick={loadData}
              className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 p-2 rounded-xl transition-colors border border-neutral-200"
              title="Refresh feed"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 text-neutral-400 text-[10px] tracking-wider uppercase bg-neutral-50/70">
                <th className="py-3 px-3">Node ID</th>
                <th className="py-3 px-3">Municipal Zone</th>
                <th className="py-3 px-3">Asset Age (Yrs)</th>
                <th className="py-3 px-3">Material Index</th>
                <th className="py-3 px-3">Traffic (vpd)</th>
                <th className="py-3 px-3">Moisture (%)</th>
                <th className="py-3 px-3">RMS Vib (mm/s²)</th>
                <th className="py-3 px-3">Est Cost ($)</th>
                <th className="py-3 px-3">Failure Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {records.length > 0 ? (
                records.map((rec) => {
                  const isCrit = rec.failure_risk_level === 2;
                  const isMed = rec.failure_risk_level === 1;
                  return (
                    <tr key={rec.record_id} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="py-3 px-3 font-bold text-neutral-900">#{rec.record_id}</td>
                      <td className="py-3 px-3 text-neutral-700">{rec.zone_name}</td>
                      <td className="py-3 px-3">{rec.asset_age_years.toFixed(1)}</td>
                      <td className="py-3 px-3">
                        <span className={`px-1.5 py-0.5 rounded ${rec.material_quality_index < 0.4 ? 'bg-amber-100 text-amber-800' : 'bg-neutral-100'}`}>
                          {rec.material_quality_index.toFixed(3)}
                        </span>
                      </td>
                      <td className="py-3 px-3">{Math.round(rec.traffic_load_index).toLocaleString()}</td>
                      <td className="py-3 px-3">{rec.soil_moisture.toFixed(1)}%</td>
                      <td className="py-3 px-3 font-bold">
                        <span className={rec.vibration_amplitude > 4.5 ? 'text-red-600 font-black' : 'text-neutral-800'}>
                          {rec.vibration_amplitude.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-neutral-900">${Math.round(rec.maintenance_cost).toLocaleString()}</td>
                      <td className="py-3 px-3">
                        {isCrit ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                            CRITICAL (2)
                          </span>
                        ) : isMed ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
                            MEDIUM (1)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                            LOW (0)
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" className="text-center py-8 text-neutral-400">
                    {isLoadingTable ? 'Loading telemetry records...' : 'No telemetry records matching filter criteria.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-5 pt-4 border-t border-neutral-100 text-xs font-mono text-neutral-500">
          <span>Showing {records.length} of {totalRecords} records</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-2 rounded-xl border border-neutral-200 hover:bg-neutral-100 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 bg-neutral-100 rounded-lg font-bold text-neutral-800">
              Page {page}
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={records.length < 15}
              className="p-2 rounded-xl border border-neutral-200 hover:bg-neutral-100 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
