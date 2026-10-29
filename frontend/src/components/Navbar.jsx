import React from 'react';
import { Database, Radio, Activity, Cpu, Layers, Sliders, MapPin } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, isLive, activeNodes }) {
  const tabs = [
    { id: 'EXPLORER', label: 'EXPLORER', icon: Activity },
    { id: 'CORRIDORS', label: 'CORRIDORS & SPATIAL', icon: MapPin },
    { id: 'TOPOLOGY', label: 'ML TOPOLOGY', icon: Cpu },
    { id: 'SANDBOX', label: 'PREDICTOR SANDBOX', icon: Sliders }
  ];

  return (
    <header className="relative z-20 max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Brand & telemetry badge */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 bg-white px-4 py-2 rounded-full border border-neutral-200/90 shadow-sm">
          <div className="w-6 h-6 rounded-lg bg-neutral-900 flex items-center justify-center text-white">
            <Database className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-xs font-black tracking-widest uppercase text-neutral-900 leading-none">URBANFLOW</span>
            <span className="font-mono text-[9px] tracking-wider text-neutral-400">TELEMETRY ENGINE v1.0</span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full border border-neutral-200/70 text-xs font-mono text-neutral-600 shadow-sm">
          <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          <span className="text-[11px] font-semibold">{isLive ? 'SYSTEM ONLINE' : 'LOCAL CACHED'}</span>
          <span className="text-neutral-300">|</span>
          <span className="text-[10px] text-neutral-500">{activeNodes.toLocaleString()} NODES</span>
        </div>
      </div>

      {/* Tabs Pill Navigation */}
      <nav className="flex items-center bg-neutral-950 p-1.5 rounded-full shadow-xl border border-neutral-800">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 md:px-5 py-2 rounded-full text-xs font-mono font-bold tracking-wider transition-all duration-200 ${
                isActive 
                  ? 'bg-white text-black shadow-md scale-100' 
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
}
