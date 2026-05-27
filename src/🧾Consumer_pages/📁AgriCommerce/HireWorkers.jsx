import React from 'react';
import { Link } from 'react-router-dom';

function HireWorkers() {
  return (
    <div style={pageStyle}>
      <div style={contentContainer}>
        <Link to="/Consumer_HomePage" style={backLink}>⬅ Consumer_HomePage</Link>
        <div style={messageContainer}>
          <h1 style={titleStyle}>👷‍♀️ Hire Workers</h1>
          <p style={subtitleStyle}>This feature is coming soon.</p>
          <p style={subTextStyle}>We are preparing the platform to receive real data. Stay tuned!</p>
        </div>
      </div>
    </div>
  );
}

const pageStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#111', overflowY: 'auto' };
const contentContainer = { padding: '20px', maxWidth: '800px', margin: '0 auto', height: '100%' };
const backLink = { color: 'white', textDecoration: 'none', fontSize: '14px', background: 'rgba(255,255,255,0.1)', padding: '8px 15px', borderRadius: '20px' };
const messageContainer = { textAlign: 'center', marginTop: '40vh', transform: 'translateY(-50%)' };
const titleStyle = { color: '#2196F3', fontSize: '28px', marginBottom: '10px' };
const subtitleStyle = { color: 'white', fontSize: '18px', margin: '0' };
const subTextStyle = { color: '#aaa', fontSize: '14px', marginTop: '10px' };

export default HireWorkers;