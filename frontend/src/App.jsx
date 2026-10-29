import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ExplorerView from './components/ExplorerView';
import CorridorsView from './components/CorridorsView';
import TopologyView from './components/TopologyView';
import SandboxView from './components/SandboxView';
import { api } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('EXPLORER');
  const [telemetryCount, setTelemetryCount] = useState(24180);
  const [simulationStatus, setSimulationStatus] = useState('STANDBY');
  const [isLive, setIsLive] = useState(false);

  // Check backend server connection
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const root = await api.checkRoot();
        if (root && root.status === 'ONLINE') {
          setIsLive(true);
          if (root.nodes_active) {
            setTelemetryCount(root.nodes_active);
          }
        }
      } catch (err) {
        setIsLive(false);
      }
    };
    checkConnection();
    const interval = setInterval(checkConnection, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#fafafa] text-neutral-900 font-sans selection:bg-black selection:text-white relative overflow-x-hidden">
      {/* Background Precision Engineering Grid Pattern */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-60 z-0" 
      />

      {/* Top Header Navigation */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isLive={isLive}
        activeNodes={telemetryCount}
      />

      {/* Main View Router */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-6 pb-16">
        {activeTab === 'EXPLORER' && (
          <ExplorerView 
            telemetryCount={telemetryCount}
            setTelemetryCount={setTelemetryCount}
            simulationStatus={simulationStatus}
            setSimulationStatus={setSimulationStatus}
            api={api}
          />
        )}

        {activeTab === 'CORRIDORS' && (
          <CorridorsView api={api} />
        )}

        {activeTab === 'TOPOLOGY' && (
          <TopologyView api={api} />
        )}

        {activeTab === 'SANDBOX' && (
          <SandboxView api={api} />
        )}
      </main>

      {/* Footer matching Master Specification */}
      <footer className="relative z-10 max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between border-t border-neutral-200/60 mt-12 text-xs font-mono text-neutral-400 gap-4">
        <div className="flex items-center gap-2">
          <p>© 2026 URBANFLOW SYSTEMS. ALL RIGHTS RESERVED.</p>
          <span className="text-neutral-300">•</span>
          <span className="text-neutral-500">MUNICIPAL INFRASTRUCTURE TELEMETRY SUITE</span>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-neutral-200 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-red-500"></span>
          <span className="text-neutral-800 font-semibold">Engineered with Precision</span>
        </div>
      </footer>
    </div>
  );
}
