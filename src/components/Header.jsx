import React from 'react';
import { Activity, Key, Sliders } from 'lucide-react';

export default function Header({ gridStatus, onOpenKeyModal, hasApiKey }) {
  const getStatusColorClass = () => {
    switch (gridStatus) {
      case 'CRITICAL':
        return 'text-danger-rose';
      case 'WARNING':
        return 'text-warn-orange';
      default:
        return 'text-accent-green';
    }
  };

  return (
    <header className="glass-panel header-bar">
      <div className="brand-section">
        <div className="brand-logo">
          <Activity size={28} />
        </div>
        <div>
          <h1 className="brand-title">GridPulse</h1>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Smart Energy Decision Engine
          </span>
        </div>
      </div>

      <div className="header-actions">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-muted)' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>GRID STATUS:</span>
          <span className={`pulse-active ${getStatusColorClass()}`} style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.05em' }}>
            ● {gridStatus}
          </span>
        </div>

        <button 
          className={`btn ${hasApiKey ? 'btn-secondary' : 'btn-primary'}`} 
          onClick={onOpenKeyModal}
        >
          <Key size={16} />
          {hasApiKey ? 'Update API Key' : 'Configure API Key'}
        </button>
      </div>
    </header>
  );
}
