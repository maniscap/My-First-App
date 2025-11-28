import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      
      {/* --- THIS IS THE NEW PART: The Login Button --- */}
      <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
        <Link to="/login" style={loginBtnStyle}>👤 Login</Link>
      </div>
      {/* ---------------------------------------------- */}

      <h1 style={{ fontSize: '3rem', color: '#2E7D32' }}>Welcome to Farm Cap 🚜</h1>
      <p style={{ fontSize: '1.2rem', color: '#555' }}>Empowering Farmers. Connecting Communities.</p>
      
      {/* The 3 Main Pillars */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '50px', flexWrap: 'wrap' }}>
        <Link to="/enquiry" style={btnStyle}>Enquiry 📖</Link>
        <Link to="/service" style={btnStyle}>Service 🛠️</Link>
        <Link to="/business" style={btnStyle}>Business 💰</Link>
      </div>
    </div>
  );
}

// Styling for the big buttons
const btnStyle = {
  padding: '20px 40px',
  backgroundColor: '#4CAF50',
  color: 'white',
  textDecoration: 'none',
  fontSize: '20px',
  borderRadius: '12px',
  border: 'none',
  cursor: 'pointer',
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
};

// Styling for the new Login button (Small & Grey)
const loginBtnStyle = {
  padding: '10px 20px',
  backgroundColor: '#333',
  color: 'white',
  textDecoration: 'none',
  borderRadius: '20px',
  fontSize: '14px',
  fontWeight: 'bold'
};

export default Home;