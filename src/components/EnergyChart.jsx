import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import { BarChart, Bar } from 'recharts';

export default function EnergyChart({ metrics }) {
  // Generate a dynamic 24-hour simulation data based on the current slider configurations
  const hourlyData = useMemo(() => {
    const data = [];
    const baseDemandPattern = [
      320, 300, 290, 280, 310, 360, 480, 580, 620, 600, 580, 570, 
      560, 550, 560, 590, 650, 740, 800, 780, 720, 610, 480, 380
    ]; // typical double-peak grid load curve in MW

    const solarPattern = [
      0, 0, 0, 0, 0, 10, 35, 60, 85, 95, 100, 100,
      95, 80, 60, 40, 15, 2, 0, 0, 0, 0, 0, 0
    ]; // solar profile (percentage of peak capacity)

    let currentBatteryCharge = metrics.batteryCharge;

    for (let hour = 0; hour < 24; hour++) {
      const hourStr = `${hour.toString().padStart(2, '0')}:00`;
      
      // Calculate demand scaled by slider and ambient temp (heatwave = higher AC load)
      const tempFactor = Math.max(1, 1 + (metrics.ambientTemp - 25) * 0.025);
      const demand = Math.round(baseDemandPattern[hour] * (metrics.consumerDemand / 500) * tempFactor * metrics.evLoad);
      
      // Calculate renewable supply
      const solarSupply = Math.round((solarPattern[hour] / 100) * metrics.solarGen);
      const windSupply = Math.round(metrics.windGen * (0.8 + Math.sin(hour / 3) * 0.2)); // slight wind oscillation
      const renewableSupply = solarSupply + windSupply;
      
      // Grid baseline capacity
      const thermalBase = Math.round(metrics.gridCapacity * 0.4); // 40% of grid limit is base generation
      const totalAvailableSupply = renewableSupply + thermalBase;
      
      // Battery math
      let batteryAction = 0; // positive = discharging to grid, negative = charging from grid
      const supplyDeficit = demand - totalAvailableSupply;
      
      if (supplyDeficit > 0) {
        // Discharging
        const maxDischargeRate = 120; // MW max discharge
        const draw = Math.min(supplyDeficit, maxDischargeRate, (currentBatteryCharge / 100) * 400); // 400MWh max storage
        batteryAction = Math.round(draw);
        currentBatteryCharge = Math.max(0, currentBatteryCharge - (draw / 4)); // subtract charge (4h factor)
      } else if (supplyDeficit < -50 && currentBatteryCharge < 100) {
        // Charging using excess renewable power
        const chargeRate = Math.min(80, Math.abs(supplyDeficit) - 20);
        batteryAction = -Math.round(chargeRate);
        currentBatteryCharge = Math.min(100, currentBatteryCharge + (chargeRate / 4));
      }

      data.push({
        time: hourStr,
        Demand: demand,
        RenewableSupply: renewableSupply,
        GridBaseline: thermalBase,
        TotalSupply: renewableSupply + thermalBase + Math.max(0, batteryAction),
        BatteryCharge: Math.round(currentBatteryCharge),
        BatteryAction: batteryAction
      });
    }

    return data;
  }, [metrics]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ 
          background: 'var(--bg-glass-solid)', 
          border: '1px solid var(--border-glow-hover)', 
          padding: '12px', 
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          fontSize: '12px'
        }}>
          <p style={{ fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>Time: {label}</p>
          <p style={{ color: '#06b6d4' }}>Demand: {payload[0]?.value} MW</p>
          <p style={{ color: '#10b981' }}>Renewable: {payload[1]?.value} MW</p>
          <p style={{ color: '#f59e0b' }}>Total Supply: {payload[2]?.value} MW</p>
          <p style={{ color: '#a78bfa', marginTop: '4px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '4px' }}>
            Battery SoC: {payload[3]?.value}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
      {/* 24h Supply vs Demand Curves */}
      <div style={{ flex: 1, minHeight: '260px' }}>
        <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          24h Power Supply & Demand Balance
        </h3>
        <ResponsiveContainer width="100%" height="88%">
          <AreaChart data={hourlyData}>
            <defs>
              <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent-cyan)" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="var(--accent-cyan)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorRen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent-green)" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="var(--accent-green)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.02)" strokeDasharray="3 3" />
            <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={11} />
            <YAxis stroke="var(--text-muted)" fontSize={11} unit="MW" />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            <Area type="monotone" dataKey="Demand" stroke="var(--accent-cyan)" strokeWidth={2} fillOpacity={1} fill="url(#colorDemand)" />
            <Area type="monotone" dataKey="RenewableSupply" stroke="var(--accent-green)" strokeWidth={1.5} fillOpacity={1} fill="url(#colorRen)" name="Renewable Generation" />
            <Area type="monotone" dataKey="TotalSupply" stroke="var(--accent-orange)" strokeWidth={1.5} fill="none" name="Active Net Supply" strokeDasharray="4 4" />
            {/* Invisible battery value just for tooltip capture */}
            <Area type="monotone" dataKey="BatteryCharge" stroke="none" fill="none" legendType="none" name="Battery SoC" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Battery State of Charge & Charger Actions */}
      <div style={{ height: '140px', borderTop: '1px solid var(--border-muted)', paddingTop: '16px' }}>
        <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Simulated Battery Reserves (State of Charge %)
        </h3>
        <ResponsiveContainer width="100%" height="80%">
          <BarChart data={hourlyData}>
            <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={9} />
            <YAxis stroke="var(--text-muted)" fontSize={9} unit="%" domain={[0, 100]} />
            <Tooltip formatter={(value) => [`${value}% SoC`, 'Battery Level']} />
            <Bar dataKey="BatteryCharge" fill="rgba(167, 139, 250, 0.45)" radius={[4, 4, 0, 0]}>
              {hourlyData.map((entry, index) => {
                // Color bar red if charge drops below 20%, green if fully charged
                let barColor = 'rgba(167, 139, 250, 0.45)';
                if (entry.BatteryCharge < 20) barColor = 'rgba(244, 63, 94, 0.6)';
                else if (entry.BatteryCharge > 85) barColor = 'rgba(16, 185, 129, 0.6)';
                return <cell key={`cell-${index}`} fill={barColor} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
