import React, { useState } from 'react';
import { Key, Eye, EyeOff, Check, X, AlertTriangle } from 'lucide-react';

export default function ApiKeyModal({ isOpen, onClose, onSave, currentKey }) {
  const [key, setKey] = useState(currentKey || '');
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    onSave(key);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="modal-overlay">
      <div className="glass-panel modal-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="modal-title">
            <Key size={20} />
            Gemini API Setup
          </h2>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
          GridPulse relies on the official <strong>Gemini API</strong> to run simulations, forecast risks, and suggest real-time mitigation checklists. Your key is stored locally in your browser.
        </p>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Google AI Studio API Key
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input 
                type={showKey ? 'text' : 'password'}
                className="modal-input"
                placeholder="AIzaSy..."
                value={key}
                onChange={(e) => setKey(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                style={{ 
                  position: 'absolute', 
                  right: '12px', 
                  background: 'none', 
                  border: 'none', 
                  color: 'var(--text-secondary)', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', padding: '10px 14px', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.15)', borderRadius: '8px', fontSize: '12px', color: 'var(--accent-orange)' }}>
            <AlertTriangle size={16} style={{ flexShrink: 0 }} />
            <span>Don't have a key? Grab a free API key instantly at <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-cyan)', textDecoration: 'underline' }}>Google AI Studio</a>.</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ minWidth: '100px' }}>
              {saved ? (
                <>
                  <Check size={16} />
                  Saved!
                </>
              ) : (
                'Save Settings'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
