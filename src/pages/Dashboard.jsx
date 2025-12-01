import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Dashboard() {
  const [bgImage, setBgImage] = useState('');
  const dayBg = 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2940&auto=format&fit=crop';
  // SAME PREMIUM NIGHT IMAGE
  const nightBg = 'https://images.unsplash.com/photo-1509773896068-7fd415d91e2e?q=80&w=2940&auto=format&fit=crop';

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 18 || hour < 6) setBgImage(nightBg);
    else setBgImage(dayBg);
  }, []);

  return (
    <div style={{...pageStyle, backgroundImage: `url('${bgImage}')`}}>
      <nav style={navStyle}>
        <div style={logoStyle}>🧢</div>
        <Link to="/profile" style={profileBtn}>
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginRight: '8px'}}>
             <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="#2E7D32"/>
             <path d="M12 2C13.1 2 14 2.9 14 4V5H10V4C10 2.9 10.9 2 12 2Z" fill="#FFA000"/> 
           </svg>
           My Profile
        </Link>
      </nav>

      <div style={heroStyle}>
        <p style={subHeaderStyle}>Namaste, Partner 🙏</p>
        <h1 style={titleStyle}>Your Farm, Your Control.</h1>
        <p style={descStyle}>Access tools, market data, and services instantly.</p>
      </div>

      <div style={gridContainer}>
        <Link to="/agri-insights" style={cardLinkStyle}>
          <div className="feature-card" style={{...cardBaseStyle, backgroundImage: "url('https://images.unsplash.com/photo-1592982537447-6f2a6a0c7c18?auto=format&fit=crop&w=800&q=80')"}}>
            <div style={overlayCard}><div style={iconStyle}>📈</div><h3>Agri-Insights</h3><p>Daily Rates & Guides</p></div>
          </div>
        </Link>
        <Link to="/service" style={cardLinkStyle}>
          <div className="feature-card" style={{...cardBaseStyle, backgroundImage: "url('https://images.unsplash.com/photo-1530267981375-f0de937f5f13?auto=format&fit=crop&w=800&q=80')"}}>
            <div style={overlayCard}><div style={iconStyle}>🚜</div><h3>Service Hub</h3><p>Rent Machinery</p></div>
          </div>
        </Link>
        <Link to="/business" style={cardLinkStyle}>
          <div className="feature-card" style={{...cardBaseStyle, backgroundImage: "url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=800&q=80')"}}>
            <div style={overlayCard}><div style={iconStyle}>💰</div><h3>Business Zone</h3><p>Sell Harvest</p></div>
          </div>
        </Link>
      </div>
    </div>
  );
}

// STYLES
const pageStyle = { minHeight: '100vh', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed', paddingBottom: '40px', backgroundColor: 'black' };
const navStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 25px', background: 'transparent', position: 'relative', zIndex: 10 };
const logoStyle = { fontSize: '45px', cursor: 'default', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.4))' };
const profileBtn = { textDecoration: 'none', backgroundColor: 'rgba(255,255,255,0.95)', color: '#1B5E20', padding: '10px 18px', borderRadius: '50px', fontWeight: 'bold', fontSize: '14px', display: 'flex', alignItems: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' };
const heroStyle = { textAlign: 'center', marginTop: '20px', marginBottom: '40px', padding: '0 20px' };
const titleStyle = { fontSize: '2.5rem', color: 'white', margin: '5px 0', fontWeight: '800', textShadow: '0 2px 15px rgba(0,0,0,0.7)' };
const subHeaderStyle = { fontSize: '1rem', color: '#a5d6a7', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold', textShadow: '0 1px 4px rgba(0,0,0,0.8)' };
const descStyle = { fontSize: '1.1rem', color: '#eee', marginTop: '5px', textShadow: '0 1px 4px rgba(0,0,0,0.8)' };
const gridContainer = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', padding: '0 20px', maxWidth: '1000px', margin: '0 auto' };
const cardLinkStyle = { textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' };
const cardBaseStyle = { borderRadius: '20px', overflow: 'hidden', backgroundSize: 'cover', backgroundPosition: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.2)', height: '200px', transition: 'transform 0.3s ease' };
const overlayCard = { width: '100%', height: '100%', background: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.7))', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'white', textAlign: 'center' };
const iconStyle = { fontSize: '40px', marginBottom: '10px', textShadow: '0 2px 4px rgba(0,0,0,0.5)' };

export default Dashboard;