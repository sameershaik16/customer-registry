import React from 'react';

const StatCard = ({ icon, label, value, color = '#2f5d8a' }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ background: color }}>
      {icon}
    </div>
    <div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  </div>
);

export default StatCard;
