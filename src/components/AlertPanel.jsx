import React, { useState } from 'react';
import { AlertCircle, HelpCircle, ShieldAlert, CheckSquare, Sparkles, X } from 'lucide-react';
import { generateMitigationSteps } from '../services/gemini';

export default function AlertPanel({ apiKey, hasApiKey, onOpenKeyModal }) {
  const [activeAlerts, setActiveAlerts] = useState([
    {
      id: 'alt-001',
      title: 'Phase-A Transformer Over-temperature',
      source: 'Oakridge Substation 4B',
      severity: 'danger',
      value: '114°C (Limit: 95°C)',
      duration: '18 minutes'
    },
    {
      id: 'alt-002',
      title: 'Solar Bus Tie Volts Drop',
      source: 'Greenway PV Array C',
      severity: 'warning',
      value: '280V (Limit: 320V)',
      duration: '4 minutes'
    },
    {
      id: 'alt-003',
      title: 'EV Fast-Charge Cluster Peak Spike',
      source: 'Metro Plaza Hub',
      severity: 'warning',
      value: '480 kW demand surge',
      duration: '12 minutes'
    }
  ]);

  const [loadingId, setLoadingId] = useState(null);
  const [mitigations, setMitigations] = useState({});
  const [activeTab, setActiveTab] = useState(null);

  const handleInvestigate = async (alert) => {
    if (!hasApiKey) {
      onOpenKeyModal();
      return;
    }

    setLoadingId(alert.id);
    setActiveTab(alert.id);

    try {
      const sopReport = await generateMitigationSteps(apiKey, alert);
      setMitigations(prev => ({
        ...prev,
        [alert.id]: sopReport
      }));
    } catch (err) {
      setMitigations(prev => ({
        ...prev,
        [alert.id]: `Error: ${err.message || 'Could not fetch mitigation guidelines.'}`
      }));
    } finally {
      setLoadingId(null);
    }
  };

  const handleClearAlert = (id) => {
    setActiveAlerts(prev => prev.filter(a => a.id !== id));
    if (activeTab === id) setActiveTab(null);
  };

  return (
    <div className="panel-container">
      <div className="panel-header">
        <h2 className="panel-title">
          <AlertCircle size={20} className="text-accent-rose" />
          Active Grid Anomalies
        </h2>
        <span style={{ fontSize: '11px', background: 'rgba(244,63,94,0.1)', color: 'var(--accent-rose)', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
          {activeAlerts.length} Warnings
        </span>
      </div>

      <div className="panel-content" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {activeAlerts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
            <div style={{ color: 'var(--accent-green)', marginBottom: '8px' }}>✓</div>
            <p style={{ fontSize: '14px' }}>All substations report operational parity. No active anomalies.</p>
          </div>
        ) : (
          <div className="alerts-list">
            {activeAlerts.map((alert) => (
              <div key={alert.id} className="alerts-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className={`alert-item ${alert.severity}`}>
                  <div className="alert-info">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="alert-name">{alert.title}</span>
                      <span style={{ 
                        fontSize: '9px', 
                        padding: '1px 5px', 
                        borderRadius: '3px',
                        background: alert.severity === 'danger' ? 'rgba(244,63,94,0.1)' : 'rgba(245,158,11,0.1)',
                        color: alert.severity === 'danger' ? 'var(--accent-rose)' : 'var(--accent-orange)',
                        textTransform: 'uppercase',
                        fontWeight: 700
                      }}>
                        {alert.severity}
                      </span>
                    </div>
                    <span className="alert-meta">{alert.source} • Threshold Alert: {alert.value} • Duration: {alert.duration}</span>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                      onClick={() => handleInvestigate(alert)}
                      disabled={loadingId === alert.id}
                    >
                      <Sparkles size={12} className="text-accent-cyan" />
                      {loadingId === alert.id ? 'Running SOP...' : 'SOP Dispatch'}
                    </button>
                    <button 
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      onClick={() => handleClearAlert(alert.id)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                {activeTab === alert.id && (
                  <div className="recommendations-box markdown-body" style={{ marginTop: '0', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-glow)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div className="ai-glow-header">
                        <CheckSquare size={14} />
                        Gemini Actionable SOP Checklists
                      </div>
                      <button 
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '11px' }}
                        onClick={() => setActiveTab(null)}
                      >
                        Hide
                      </button>
                    </div>

                    {loadingId === alert.id ? (
                      <div className="loading-container">
                        <span className="pulse-loader"></span>
                        <span className="pulse-loader"></span>
                        <span className="pulse-loader"></span>
                      </div>
                    ) : (
                      <div 
                        style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.6' }}
                        dangerouslySetInnerHTML={{ 
                          __html: (mitigations[alert.id] || '')
                            .replace(/### (.*)/g, '<h4 style="margin: 12px 0 6px 0; color: var(--accent-cyan)">$1</h4>')
                            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                            .replace(/- \[\s*\] (.*)/g, '<li style="list-style-type: none; margin-left: -10px; display: flex; align-items: flex-start; gap: 8px; margin-bottom: 6px;"><input type="checkbox" style="margin-top: 4px; pointer-events: none;" /> <span>$1</span></li>')
                            .replace(/- \[\s*x\s*\] (.*)/g, '<li style="list-style-type: none; margin-left: -10px; display: flex; align-items: flex-start; gap: 8px; margin-bottom: 6px;"><input type="checkbox" checked style="margin-top: 4px; pointer-events: none;" /> <span style="text-decoration: line-through; color: var(--text-muted)">$1</span></li>')
                            .replace(/- (.*)/g, '<li>$1</li>')
                            .replace(/\n/g, '<br/>')
                        }} 
                      />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
