// src/components/TrafficLights.js
import React from 'react';
import './TrafficLights.css';
import Tooltip from '@mui/material/Tooltip';

const TrafficLights = ({ status, onChange, isClickable }) => {
  const statuses = [
    { label: 'Pending', color: 'red', value: 'pending' },
    { label: 'Acknowledged', color: 'gray', value: 'acknowledged' },
    { label: 'In Progress', color: 'yellow', value: 'in-progress' },
    { label: 'Resolved', color: 'green', value: 'resolved' },
  ];

  return (
    <div className="traffic-lights">
      {statuses.map(({ label, color, value }) => (
        <Tooltip key={value} title={label} arrow>
          <div
            className={`traffic-circle ${color} ${status === value ? 'active' : ''}`}
            onClick={isClickable ? () => onChange(value) : undefined}
            style={isClickable ? { cursor: 'pointer' } : {}}
          />
        </Tooltip>
      ))}
    </div>
  );
};

export default TrafficLights;
