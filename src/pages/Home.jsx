import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      
      {/* Top Bar with Login Button */}
      <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
        <Link to="/login" style={loginBtnStyle}>👤 Login</Link>
      </div>

      <h1 style={{ fontSize: '3rem', color: '#2E7D32' }}>Welcome to Farm Cap 🚜</h1>
      <p style={{ fontSize: '1.2rem', color: '#555' }}>Empowering Farmers. Connecting Communities.</p>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '50px', flexWrap: 'wrap' }}>
        
        {/* ✅ THIS IS THE FIX: Changed from "/enquiry" to "/agri-insights" */}
        <Link to="/agri-insights" style={btnStyle}>Agri-Insights 📊</Link>
        
        <Link to="/service" style={btnStyle}>Service 🛠️</Link>
        <Link to="/business" style={btnStyle}>Business 💰</Link>
      </div>
    </div>
  );
}

// Styling
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