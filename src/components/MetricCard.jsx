import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export default function MetricCard({ title, value, icon: Icon, type = 'info', trend, trendType }) {
  const getTrendIcon = () => {
    if (trendType === 'up') return <ArrowUpRight size={14} />;
    if (trendType === 'down') return <ArrowDownRight size={14} />;
    return <Minus size={14} />;
  };

  const getMetricClass = () => {
    if (type === 'success') return 'success';
    if (type === 'warning') return 'warning';
    if (type === 'danger') return 'danger';
    return 'info';
  };

  return (
    <div className={`glass-panel metric-card ${getMetricClass()}`}>
      <div className="metric-header">
        <span>{title}</span>
        <div className="metric-icon-box">
          {Icon && <Icon size={18} className={`text-${getMetricClass()}`} style={{ color: `var(--accent-${getMetricClass() === 'info' ? 'cyan' : getMetricClass()})` }} />}
        </div>
      </div>
      <div className="metric-value">{value}</div>
      {trend && (
        <div className={`metric-trend ${trendType}`}>
          {getTrendIcon()}
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
}
