import React from 'react';
import { Link } from 'react-router-dom';

function Dashboard() {
  return (
    <div style={pageStyle}>
      <nav style={navStyle}>
        <div style={logoStyle}>🧢 Farm Cap</div>
        <div style={{display: 'flex', gap: '15px', alignItems: 'center'}}>
           <span style={{color: 'white', fontWeight: 'bold'}}>Welcome, Farmer!</span>
           <Link to="/profile" style={profileBtn}>👤 My Profile</Link>
        </div>
      </nav>

      <div style={heroStyle}>
        <h1 style={titleStyle}>Your Command Center</h1>
        <p style={subtitleStyle}>Select a tool to get started.</p>
      </div>

      {/* THE 3 CARDS MOVED HERE */}
      <div style={gridContainer}>
        
        <Link to="/agri-insights" style={cardLinkStyle}>
          <div className="feature-card card-agri">
            <div style={iconStyle}>📈</div>
            <h3>Agri-Insights</h3>
            <p>Rates & Guides</p>
          </div>
        </Link>

        <Link to="/service" style={cardLinkStyle}>
          <div className="feature-card card-service">
            <div style={iconStyle}>🚜</div>
            <h3>Service Hub</h3>
            <p>Rent & Hire</p>
          </div>
        </Link>

        <Link to="/business" style={cardLinkStyle}>
          <div className="feature-card card-business">
            <div style={iconStyle}>💰</div>
            <h3>Business Zone</h3>
            <p>Sell Crops</p>
          </div>
        </Link>

      </div>
    </div>
  );
}

// STYLES (Copied from Home)
const pageStyle = { paddingBottom: '20px', minHeight: '100vh' };
const navStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)' };
const logoStyle = { fontSize: '20px', fontWeight: '900', color: 'white' };
const profileBtn = { textDecoration: 'none', backgroundColor: 'white', color: '#1B5E20', padding: '6px 15px', borderRadius: '20px', fontWeight: 'bold', fontSize: '14px' };
const heroStyle = { textAlign: 'center', marginTop: '30px', marginBottom: '30px' };
const titleStyle = { fontSize: '2.5rem', color: 'white', margin: 0, fontWeight: '800', textShadow: '0 2px 10px rgba(0,0,0,0.8)' };
const subtitleStyle = { fontSize: '1.2rem', color: '#eee', marginTop: '5px', fontWeight: '500', textShadow: '0 1px 2px rgba(0,0,0,0.8)' };
const gridContainer = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', padding: '0 15px', maxWidth: '800px', margin: '0 auto' };
const cardLinkStyle = { textDecoration: 'none', color: 'inherit', display: 'block' };
const iconStyle = { fontSize: '30px', marginBottom: '5px' };

export default Dashboard;