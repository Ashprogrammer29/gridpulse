import React, { useState } from 'react';
import { Sliders, Cpu, ShieldAlert, CheckCircle, HelpCircle } from 'lucide-react';
import { generateSimulationReport } from '../services/gemini';

export default function SimulationPanel({ metrics, onMetricChange, apiKey, hasApiKey, onOpenKeyModal }) {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState('');
  const [error, setError] = useState('');

  const handleSliderChange = (key, value) => {
    onMetricChange(key, value);
  };

  const handleRunDiagnostic = async () => {
    if (!hasApiKey) {
      onOpenKeyModal();
      return;
    }

    setLoading(true);
    setError('');
    setReport('');

    try {
      const reportText = await generateSimulationReport(apiKey, metrics);
      setReport(reportText);
    } catch (err) {
      setError(err.message || 'An error occurred during analysis.');
    } finally {
      setLoading(false);
    }
  };

  // Determine standard alert thresholds
  const totalGen = metrics.solarGen + metrics.windGen + (metrics.gridCapacity * 0.4);
  const isOverload = metrics.consumerDemand > totalGen;

  return (
    <div className="panel-container">
      <div className="panel-header">
        <h2 className="panel-title">
          <Sliders size={20} className="text-accent-cyan" />
          Grid Control Simulator
        </h2>
        {isOverload ? (
          <span style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(244,63,94,0.1)', padding: '4px 8px', borderRadius: '6px', color: 'var(--accent-rose)', border: '1px solid rgba(244,63,94,0.2)', fontWeight: 600 }}>
            <ShieldAlert size={12} />
            CRITICAL GAP
          </span>
        ) : (
          <span style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(16,185,129,0.1)', padding: '4px 8px', borderRadius: '6px', color: 'var(--accent-green)', border: '1px solid rgba(16,185,129,0.2)', fontWeight: 600 }}>
            <CheckCircle size={12} />
            SURPLUS LOAD
          </span>
        )}
      </div>

      <div className="panel-content" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="simulation-grid">
          
          <div className="slider-group">
            <div className="slider-label-row">
              <span className="slider-title">Grid Thermal Capacity Limit</span>
              <span className="slider-value">{metrics.gridCapacity} MW</span>
            </div>
            <input 
              type="range" 
              min="500" 
              max="1500" 
              value={metrics.gridCapacity} 
              onChange={(e) => handleSliderChange('gridCapacity', parseInt(e.target.value))}
            />
          </div>

          <div className="slider-group">
            <div className="slider-label-row">
              <span className="slider-title">Peak Consumer Demand Base</span>
              <span className="slider-value">{metrics.consumerDemand} MW</span>
            </div>
            <input 
              type="range" 
              min="400" 
              max="1200" 
              value={metrics.consumerDemand} 
              onChange={(e) => handleSliderChange('consumerDemand', parseInt(e.target.value))}
            />
          </div>

          <div className="slider-group">
            <div className="slider-label-row">
              <span className="slider-title">Solar Gen Peak Capacity</span>
              <span className="slider-value">{metrics.solarGen} MW</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="600" 
              value={metrics.solarGen} 
              onChange={(e) => handleSliderChange('solarGen', parseInt(e.target.value))}
            />
          </div>

          <div className="slider-group">
            <div className="slider-label-row">
              <span className="slider-title">Wind Gen Average Load</span>
              <span className="slider-value">{metrics.windGen} MW</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="400" 
              value={metrics.windGen} 
              onChange={(e) => handleSliderChange('windGen', parseInt(e.target.value))}
            />
          </div>

          <div className="slider-group">
            <div className="slider-label-row">
              <span className="slider-title">Battery SoC Start Charge</span>
              <span className="slider-value">{metrics.batteryCharge}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={metrics.batteryCharge} 
              onChange={(e) => handleSliderChange('batteryCharge', parseInt(e.target.value))}
            />
          </div>

          <div className="slider-group">
            <div className="slider-label-row">
              <span className="slider-title">Ambient Temperature</span>
              <span className="slider-value" style={{ color: metrics.ambientTemp > 35 ? 'var(--accent-rose)' : 'var(--accent-cyan)' }}>
                {metrics.ambientTemp}°C
              </span>
            </div>
            <input 
              type="range" 
              min="10" 
              max="48" 
              value={metrics.ambientTemp} 
              onChange={(e) => handleSliderChange('ambientTemp', parseInt(e.target.value))}
            />
          </div>

          <div className="slider-group">
            <div className="slider-label-row">
              <span className="slider-title">EV Coincident Charging Rate</span>
              <span className="slider-value">{metrics.evLoad}x</span>
            </div>
            <input 
              type="range" 
              min="1.0" 
              max="2.5" 
              step="0.1" 
              value={metrics.evLoad} 
              onChange={(e) => handleSliderChange('evLoad', parseFloat(e.target.value))}
            />
          </div>

        </div>

        <button 
          className="btn btn-primary" 
          onClick={handleRunDiagnostic}
          disabled={loading}
          style={{ width: '100%', justifyContent: 'center', padding: '12px 18px', display: 'flex', alignItems: 'center' }}
        >
          <Cpu size={16} />
          {loading ? 'AI Dispatch Running...' : 'Generate AI Dispatch Assessment'}
        </button>

        {loading && (
          <div className="recommendations-box" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '24px' }}>
            <div className="loading-container">
              <span className="pulse-loader"></span>
              <span className="pulse-loader"></span>
              <span className="pulse-loader"></span>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Gemini is synthesizing grid loads, temperatures, and EV factors...</span>
          </div>
        )}

        {error && (
          <div style={{ padding: '12px', background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: '8px', fontSize: '13px', color: 'var(--accent-rose)' }}>
            {error}
          </div>
        )}

        {report && !loading && (
          <div className="recommendations-box markdown-body" style={{ maxHeight: '350px', overflowY: 'auto' }}>
            <div className="ai-glow-header">
              <Cpu size={14} />
              Gemini Decision Report
            </div>
            <div 
              style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.6' }}
              dangerouslySetInnerHTML={{ 
                __html: report
                  .replace(/### (.*)/g, '<h4 style="margin: 12px 0 6px 0; color: var(--accent-cyan)">$1</h4>')
                  .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                  .replace(/- \[\s*\] (.*)/g, '<li style="list-style-type: none; margin-left: -10px;">⬜ $1</li>')
                  .replace(/- \[\s*x\s*\] (.*)/g, '<li style="list-style-type: none; margin-left: -10px;">✅ $1</li>')
                  .replace(/- (.*)/g, '<li>$1</li>')
                  .replace(/\n/g, '<br/>')
              }} 
            />
          </div>
        )}
      </div>
    </div>
  );
}
