import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div style={pageStyle}>
      
      {/* Top Bar */}
      <nav style={navStyle}>
        {/* NEW LOGO: Cap Symbol */}
        <div style={logoStyle}>🧢 Farm Cap</div>
        
        {/* NEW LOGIN: Farmer Symbol */}
        <Link to="/login" style={loginBtnStyle}>
          <span style={{fontSize: '18px'}}>👨‍🌾</span> Login
        </Link>
      </nav>

      {/* NEW HERO SECTION: Powerful Quotes */}
      <div style={heroStyle}>
        <h1 style={titleStyle}>Cultivating the Future,<br/>Together.</h1>
        <p style={subtitleStyle}>"The farmer is the only man in our economy who buys everything at retail, sells everything at wholesale, and pays the freight both ways." – We are here to change that.</p>
        <p style={{marginTop: '10px', fontSize: '1.1rem', color: '#333', fontWeight: 'bold'}}>Knowledge • Machinery • Trade</p>
      </div>

      {/* The 3 Main Pillars (New Image Cards) */}
      <div style={gridContainer}>
        
        {/* Card 1: Agri-Insights */}
        <Link to="/agri-insights" style={cardLinkStyle}>
          <div className="feature-card card-agri">
            <div style={iconStyle}>📈</div>
            <h3>Agri-Insights</h3>
            <p>Master the market. Access daily rates, library books, and expert video guides.</p>
          </div>
        </Link>

        {/* Card 2: Service Hub */}
        <Link to="/service" style={cardLinkStyle}>
          <div className="feature-card card-service">
            <div style={iconStyle}>🚜</div>
            <h3>Service Hub</h3>
            <p>Power up your farm. Rent advanced machinery and hire skilled labor instantly.</p>
          </div>
        </Link>

        {/* Card 3: Business Zone */}
        <Link to="/business" style={cardLinkStyle}>
          <div className="feature-card card-business">
            <div style={iconStyle}>💰</div>
            <h3>Business Zone</h3>
            <p>Your harvest, your price. Sell crops directly to buyers and maximize profits.</p>
          </div>
        </Link>

      </div>
    </div>
  );
}

// --- STYLES ---
const pageStyle = { paddingBottom: '50px' };

const navStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px' };
const logoStyle = { fontSize: '28px', fontWeight: '900', color: '#1B5E20', textShadow: '0 2px 4px rgba(255,255,255,0.8)', letterSpacing: '1px' };

const loginBtnStyle = { 
  textDecoration: 'none', 
  backgroundColor: 'white', 
  color: '#1B5E20', 
  padding: '8px 20px', 
  borderRadius: '30px', 
  fontWeight: 'bold', 
  boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  transition: 'transform 0.2s'
};

const heroStyle = { textAlign: 'center', marginTop: '40px', marginBottom: '60px', padding: '0 20px' };
const titleStyle = { fontSize: '4rem', color: '#1B5E20', margin: 0, lineHeight: '1.1', textShadow: '0 2px 15px rgba(255,255,255,0.6)', fontWeight: '800' };
const subtitleStyle = { fontSize: '1.3rem', color: '#222', marginTop: '15px', fontWeight: '500', textShadow: '0 1px 2px rgba(255,255,255,0.8)', maxWidth: '800px', marginInline: 'auto', fontStyle: 'italic' };

const gridContainer = { 
  display: 'grid', 
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
  gap: '30px', 
  padding: '0 30px', 
  maxWidth: '1200px', 
  margin: '0 auto' 
};

const cardLinkStyle = { textDecoration: 'none', color: 'inherit' };
const iconStyle = { fontSize: '60px', marginBottom: '15px', textShadow: '0 4px 8px rgba(0,0,0,0.5)' };

export default Home;