import React, { useState, useEffect } from 'react';
import { 
  MapPin, ShieldAlert, Activity, Droplets, Users, Compass, 
  Layers, ArrowUpRight, AlertTriangle, CheckCircle, Database, BarChart3
} from 'lucide-react';

export default function CorridorsView({ api }) {
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);
  const [hoveredZone, setHoveredZone] = useState(null);

  useEffect(() => {
    const fetchZones = async () => {
      try {
        const data = await api.getZones();
        if (data.zones && data.zones.length > 0) {
          setZones(data.zones);
          setSelectedZone(data.zones[0]);
        }
      } catch (err) {
        console.warn("Error fetching zones:", err);
      }
    };
    fetchZones();
  }, []);

  // Map coordinate transformation to SVG viewport (viewBox 0 0 800 500)
  // Longitude range: -74.03 to -73.92 (width: 0.11)
  // Latitude range: 40.69 to 40.80 (height: 0.11)
  const toSvgX = (lon) => {
    const minLon = -74.03;
    const maxLon = -73.92;
    return ((lon - minLon) / (maxLon - minLon)) * 740 + 30;
  };

  const toSvgY = (lat) => {
    const minLat = 40.69;
    const maxLat = 40.80;
    // Invert Y for SVG coordinates
    return 470 - (((lat - minLat) / (maxLat - minLat)) * 440);
  };

  const getPointsString = (coords) => {
    return coords.map(c => `${toSvgX(c[0])},${toSvgY(c[1])}`).join(' ');
  };

  const getRiskColor = (healthIndex) => {
    if (healthIndex >= 75) return { fill: 'rgba(16, 185, 129, 0.15)', stroke: '#10b981', badge: 'bg-emerald-100 text-emerald-800' };
    if (healthIndex >= 60) return { fill: 'rgba(245, 158, 11, 0.15)', stroke: '#f59e0b', badge: 'bg-amber-100 text-amber-800' };
    return { fill: 'rgba(239, 68, 68, 0.18)', stroke: '#ef4444', badge: 'bg-red-100 text-red-800' };
  };

  return (
    <div className="space-y-8">
      {/* Top Header Card */}
      <div className="bg-white rounded-[2.5rem] p-8 border border-neutral-200/80 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-neutral-400 mb-2">
            <Compass className="w-4 h-4 text-neutral-600" />
            <span>POSTGIS SPATIAL TOPOLOGY & CORRIDOR INDEXING</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">
            Municipal Zone Sensor Grid
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 font-mono mt-1">
            Spatial polygons with high-resolution telemetry, environmental degradation stressors, and active corridors.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-neutral-50 px-4 py-2.5 rounded-2xl border border-neutral-200">
          <Database className="w-4 h-4 text-neutral-500" />
          <div className="font-mono text-xs">
            <span className="text-neutral-400 block text-[10px]">SPATIAL ENGINE</span>
            <span className="font-bold text-neutral-800">PostGIS 3.4 / SRID:4326</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Map + Inspection Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Map Container (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-6 border border-neutral-200/80 shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-neutral-100">
            <div className="flex items-center gap-2 font-mono text-xs font-bold tracking-widest text-neutral-800">
              <Layers className="w-4 h-4 text-neutral-600" />
              <span>INTERACTIVE SPATIAL POLYGONS</span>
            </div>
            <span className="text-[11px] font-mono text-neutral-400">
              Click polygon to inspect telemetry
            </span>
          </div>

          {/* SVG Map Canvas */}
          <div className="relative w-full aspect-[16/10] bg-[#f9fafb] rounded-2xl border border-neutral-200 overflow-hidden shadow-inner blueprint-grid-dense">
            <svg 
              viewBox="0 0 800 500" 
              className="w-full h-full select-none"
            >
              {/* Coordinate Grid lines */}
              <g stroke="#e5e7eb" strokeWidth="0.8" strokeDasharray="4 4">
                <line x1="30" y1="50" x2="770" y2="50" />
                <line x1="30" y1="150" x2="770" y2="150" />
                <line x1="30" y1="250" x2="770" y2="250" />
                <line x1="30" y1="350" x2="770" y2="350" />
                <line x1="30" y1="450" x2="770" y2="450" />

                <line x1="150" y1="30" x2="150" y2="470" />
                <line x1="300" y1="30" x2="300" y2="470" />
                <line x1="450" y1="30" x2="450" y2="470" />
                <line x1="600" y1="30" x2="600" y2="470" />
              </g>

              {/* Waterway / River background shape */}
              <path
                d="M 460 30 Q 420 180, 480 280 T 510 470 L 440 470 Q 380 280, 400 180 T 400 30 Z"
                fill="rgba(59, 130, 246, 0.08)"
                stroke="rgba(59, 130, 246, 0.25)"
                strokeWidth="1"
              />
              <text x="440" y="240" fill="#93c5fd" fontSize="10" fontFamily="JetBrains Mono" transform="rotate(70, 440, 240)">
                EAST RIVER ARTERY
              </text>

              {/* Polygons */}
              {zones.map((zone) => {
                const isSelected = selectedZone?.zone_id === zone.zone_id;
                const isHovered = hoveredZone?.zone_id === zone.zone_id;
                const colors = getRiskColor(zone.composite_health_index);
                const points = getPointsString(zone.coordinates);

                // Calculate center point for text
                const avgLon = zone.coordinates.reduce((acc, curr) => acc + curr[0], 0) / zone.coordinates.length;
                const avgLat = zone.coordinates.reduce((acc, curr) => acc + curr[1], 0) / zone.coordinates.length;
                const cx = toSvgX(avgLon);
                const cy = toSvgY(avgLat);

                return (
                  <g 
                    key={zone.zone_id}
                    onClick={() => setSelectedZone(zone)}
                    onMouseEnter={() => setHoveredZone(zone)}
                    onMouseLeave={() => setHoveredZone(null)}
                    className="cursor-pointer transition-all duration-300"
                  >
                    <polygon
                      points={points}
                      fill={isSelected ? colors.stroke : colors.fill}
                      fillOpacity={isSelected ? 0.35 : 0.2}
                      stroke={colors.stroke}
                      strokeWidth={isSelected || isHovered ? "2.5" : "1.5"}
                      strokeDasharray={isSelected ? "none" : "2 2"}
                      className="transition-all duration-200"
                    />

                    {/* Sensor Node Beacons in this polygon */}
                    <circle 
                      cx={cx} 
                      cy={cy} 
                      r={isSelected ? "6" : "4"} 
                      fill={colors.stroke}
                    />
                    <circle 
                      cx={cx} 
                      cy={cy} 
                      r={isSelected ? "14" : "9"} 
                      fill="none" 
                      stroke={colors.stroke} 
                      strokeWidth="1" 
                      className="animate-ping"
                      opacity="0.4"
                    />

                    {/* Zone Label */}
                    <text
                      x={cx}
                      y={cy - 12}
                      textAnchor="middle"
                      fill="#171717"
                      fontSize="10"
                      fontWeight="bold"
                      fontFamily="JetBrains Mono"
                      className="pointer-events-none drop-shadow-sm"
                    >
                      {zone.zone_name}
                    </text>
                    
                    <text
                      x={cx}
                      y={cy + 18}
                      textAnchor="middle"
                      fill="#737373"
                      fontSize="9"
                      fontFamily="JetBrains Mono"
                      className="pointer-events-none"
                    >
                      Health: {zone.composite_health_index}%
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Map Legend */}
            <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-neutral-200/80 shadow-md font-mono text-[10px] text-neutral-600 flex items-center gap-4">
              <span className="font-bold text-neutral-800">HEALTH INDEX:</span>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>Nominal (&gt;75%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>Elevated (60-75%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                <span>Critical (&lt;60%)</span>
              </div>
            </div>

            <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-neutral-200/80 text-[10px] font-mono text-neutral-500">
              EPSG:4326 • Lat: 40.75°N, Lon: -73.98°W
            </div>
          </div>
        </div>

        {/* Zone Details Drawer (1 col) */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-neutral-200/80 shadow-xl flex flex-col justify-between">
          {selectedZone ? (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] tracking-widest text-neutral-400 uppercase">
                    ZONE TELEMETRY DOSSIER
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${getRiskColor(selectedZone.composite_health_index).badge}`}>
                    ZONE #{selectedZone.zone_id}
                  </span>
                </div>
                <h2 className="text-2xl font-black text-neutral-900 font-sans tracking-tight">
                  {selectedZone.zone_name}
                </h2>
                <p className="text-xs font-mono text-neutral-500 mt-0.5">
                  Corridor: {selectedZone.corridor}
                </p>
              </div>

              {/* Health Gauge Card */}
              <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200">
                <div className="flex justify-between items-center text-xs font-mono mb-2">
                  <span className="text-neutral-500">COMPOSITE HEALTH INDEX</span>
                  <span className="text-neutral-900 font-bold text-base">{selectedZone.composite_health_index}%</span>
                </div>
                <div className="w-full bg-neutral-200 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      selectedZone.composite_health_index >= 75 ? 'bg-emerald-500' :
                      selectedZone.composite_health_index >= 60 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${selectedZone.composite_health_index}%` }}
                  />
                </div>
              </div>

              {/* Telemetry Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                  <div className="flex items-center gap-1.5 text-neutral-400 text-[10px] mb-1">
                    <Users className="w-3 h-3" />
                    <span>POP DENSITY</span>
                  </div>
                  <div className="font-bold text-neutral-800 text-sm">
                    {selectedZone.population_density.toLocaleString()} /km²
                  </div>
                </div>

                <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                  <div className="flex items-center gap-1.5 text-neutral-400 text-[10px] mb-1">
                    <Droplets className="w-3 h-3" />
                    <span>ANNUAL RAIN</span>
                  </div>
                  <div className="font-bold text-neutral-800 text-sm">
                    {selectedZone.avg_annual_rainfall} mm
                  </div>
                </div>

                <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                  <div className="flex items-center gap-1.5 text-neutral-400 text-[10px] mb-1">
                    <Activity className="w-3 h-3" />
                    <span>AVG RMS VIBRATION</span>
                  </div>
                  <div className="font-bold text-neutral-800 text-sm">
                    {selectedZone.avg_vibration} mm/s²
                  </div>
                </div>

                <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                  <div className="flex items-center gap-1.5 text-neutral-400 text-[10px] mb-1">
                    <Layers className="w-3 h-3" />
                    <span>AVG ASSET AGE</span>
                  </div>
                  <div className="font-bold text-neutral-800 text-sm">
                    {selectedZone.avg_asset_age} yrs
                  </div>
                </div>
              </div>

              {/* Risk Distribution Breakdown */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase">
                  NODE RISK LEVEL PROFILE
                </span>
                <div className="space-y-1.5 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Low Risk
                    </span>
                    <span className="font-bold">{selectedZone.risk_summary.low}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-amber-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      Medium Risk
                    </span>
                    <span className="font-bold">{selectedZone.risk_summary.medium}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-red-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      Critical
                    </span>
                    <span className="font-bold">{selectedZone.risk_summary.critical}%</span>
                  </div>
                </div>
              </div>

              {/* Spatial PostGIS Query Snippet */}
              <div className="bg-neutral-950 text-neutral-300 p-3.5 rounded-2xl font-mono text-[11px] border border-neutral-800">
                <div className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">PostGIS Query</div>
                <div className="text-emerald-400">
                  SELECT * FROM infrastructure_telemetry<br/>
                  WHERE ST_Contains(zone.geometry, sensor_geom)<br/>
                  AND zone_id = {selectedZone.zone_id};
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-neutral-400 font-mono text-xs">
              Select a zone polygon to load telemetry.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
