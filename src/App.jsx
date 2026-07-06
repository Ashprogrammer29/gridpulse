import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Activity, 
  BatteryCharging, 
  AlertTriangle, 
  Thermometer, 
  Cpu, 
  ArrowUpRight 
} from 'lucide-react';
import Header from './components/Header';
import MetricCard from './components/MetricCard';
import EnergyChart from './components/EnergyChart';
import SimulationPanel from './components/SimulationPanel';
import AlertPanel from './components/AlertPanel';
import CopilotChat from './components/CopilotChat';
import ApiKeyModal from './components/ApiKeyModal';

export default function App() {
  // Telemetry state
  const [metrics, setMetrics] = useState({
    gridCapacity: 1000,
    consumerDemand: 720,
    solarGen: 180,
    windGen: 120,
    batteryCharge: 55,
    ambientTemp: 24,
    evLoad: 1.2
  });

  // API Key State
  const [apiKey, setApiKey] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);

  // Initialize API Key from localStorage
  useEffect(() => {
    const savedKey = localStorage.getItem('GRIDPULSE_GEMINI_KEY');
    if (savedKey) {
      setApiKey(savedKey);
      setHasApiKey(true);
    } else {
      setIsKeyModalOpen(true); // Open modal on first load if no key exists
    }
  }, []);

  const handleSaveApiKey = (newKey) => {
    localStorage.setItem('GRIDPULSE_GEMINI_KEY', newKey);
    setApiKey(newKey);
    setHasApiKey(!!newKey);
  };

  const handleMetricChange = (key, value) => {
    setMetrics(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Derived Grid Metrics
  const baseThermalGen = Math.round(metrics.gridCapacity * 0.4);
  const totalRenewables = metrics.solarGen + metrics.windGen;
  const currentTotalSupply = baseThermalGen + totalRenewables;

  // Calculate actual demand adjusted for ambient temperature cooling loads & EV load
  const tempFactor = Math.max(1, 1 + (metrics.ambientTemp - 25) * 0.025);
  const currentAdjustedDemand = Math.round(metrics.consumerDemand * tempFactor * metrics.evLoad);

  // Load factor is percentage of grid capacity used by demand
  const capacityUsedPercent = Math.round((currentAdjustedDemand / metrics.gridCapacity) * 100);

  // Renewable mix percentage
  const renewableMixPercent = currentTotalSupply > 0 
    ? Math.round((totalRenewables / currentTotalSupply) * 100)
    : 0;

  // Grid Status calculations
  let gridStatus = 'STABLE';
  if (capacityUsedPercent > 105 || metrics.ambientTemp > 43) {
    gridStatus = 'CRITICAL';
  } else if (capacityUsedPercent > 90 || metrics.batteryCharge < 20 || metrics.ambientTemp > 36) {
    gridStatus = 'WARNING';
  }

  // Active Warnings Counter
  let anomalyCount = 0;
  if (capacityUsedPercent > 95) anomalyCount++;
  if (metrics.ambientTemp > 38) anomalyCount++;
  if (metrics.batteryCharge < 20) anomalyCount++;

  return (
    <div className="app-container">
      {/* Header bar */}
      <Header 
        gridStatus={gridStatus} 
        onOpenKeyModal={() => setIsKeyModalOpen(true)}
        hasApiKey={hasApiKey}
      />

      {/* Metrics Row */}
      <div className="metrics-row">
        <MetricCard 
          title="Current Demand Load" 
          value={`${currentAdjustedDemand} MW`} 
          icon={Zap}
          type={gridStatus === 'CRITICAL' ? 'danger' : gridStatus === 'WARNING' ? 'warning' : 'info'}
          trend={`${capacityUsedPercent}% capacity in use`}
          trendType={capacityUsedPercent > 90 ? 'up' : 'neutral'}
        />
        <MetricCard 
          title="Renewable Generation Mix" 
          value={`${renewableMixPercent}%`} 
          icon={BatteryCharging}
          type="success"
          trend={`${totalRenewables} MW active green output`}
          trendType="up"
        />
        <MetricCard 
          title="Active System Anomalies" 
          value={anomalyCount.toString()} 
          icon={AlertTriangle}
          type={anomalyCount > 0 ? (gridStatus === 'CRITICAL' ? 'danger' : 'warning') : 'success'}
          trend={anomalyCount > 0 ? 'Urgent attention required' : 'All systems normal'}
          trendType={anomalyCount > 0 ? 'up' : 'neutral'}
        />
        <MetricCard 
          title="Ambient temperature factor" 
          value={`${metrics.ambientTemp}°C`} 
          icon={Thermometer}
          type={metrics.ambientTemp > 38 ? 'danger' : metrics.ambientTemp > 30 ? 'warning' : 'info'}
          trend={metrics.ambientTemp > 30 ? 'High thermal AC demand' : 'Nominal cooling load'}
          trendType={metrics.ambientTemp > 30 ? 'up' : 'neutral'}
        />
      </div>

      {/* Main Dashboard Layout */}
      <main className="dashboard-grid">
        {/* Left Side: Analytics and Action centers */}
        <div className="col-8" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Chart Panel */}
          <div className="glass-panel panel-container" style={{ padding: '24px 0' }}>
            <div style={{ padding: '0 24px 16px 24px', borderBottom: '1px solid var(--border-muted)', marginBottom: '16px' }}>
              <h2 className="panel-title">
                <Activity size={20} className="text-accent-cyan" />
                Live Power Balancing Curve
              </h2>
            </div>
            <div style={{ padding: '0 24px' }}>
              <EnergyChart metrics={metrics} />
            </div>
          </div>

          {/* Sub-grid: Alerts on left, Copilot on right */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            
            {/* Active Alerts Panel */}
            <div className="glass-panel" style={{ height: '100%' }}>
              <AlertPanel 
                apiKey={apiKey}
                hasApiKey={hasApiKey}
                onOpenKeyModal={() => setIsKeyModalOpen(true)}
              />
            </div>

            {/* AI Advisor Panel */}
            <div className="glass-panel" style={{ height: '100%' }}>
              <CopilotChat 
                apiKey={apiKey}
                hasApiKey={hasApiKey}
                onOpenKeyModal={() => setIsKeyModalOpen(true)}
              />
            </div>

          </div>

        </div>

        {/* Right Side: Simulation Panel */}
        <div className="col-4">
          <div className="glass-panel" style={{ height: '100%' }}>
            <SimulationPanel 
              metrics={metrics}
              onMetricChange={handleMetricChange}
              apiKey={apiKey}
              hasApiKey={hasApiKey}
              onOpenKeyModal={() => setIsKeyModalOpen(true)}
            />
          </div>
        </div>
      </main>

      {/* API Config Modal */}
      <ApiKeyModal 
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        onSave={handleSaveApiKey}
        currentKey={apiKey}
      />
    </div>
  );
}
