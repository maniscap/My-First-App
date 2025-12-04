import React from 'react';
import { Link } from 'react-router-dom';

function Weather() {
  return (
    <div style={{ padding: '20px', textAlign: 'center', paddingTop: '100px', color: 'white' }}>
      <Link to="/dashboard" style={{color: '#4CAF50', fontSize: '18px', textDecoration: 'none'}}>⬅ Back to Dashboard</Link>
      <h1 style={{fontSize: '2.5rem', marginTop: '20px'}}>🌦️ Crop Weather</h1>
      <p>Live rain, humidity, and temperature updates.</p>
      <p style={{opacity: 0.7}}>(Page under construction)</p>
    </div>
  );
}
export default Weather;