import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Dashboard() {
  // --- BACKGROUND ---
  const [bgImage, setBgImage] = useState('');
  const dayBg = 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2940&auto=format&fit=crop';
  const nightBg = 'https://images.unsplash.com/photo-1652454159675-11ead6275680?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 18 || hour < 6) setBgImage(nightBg);
    else setBgImage(dayBg);
  }, []);

  // --- LOCATION STATE ---
  const userLocation = "Pune, India";
  const [showLocModal, setShowLocModal] = useState(false);

  return (
    <div style={{...pageStyle, backgroundImage: `url('${bgImage}')`}}>
      
      {/* --- 1. HEADER SECTION --- */}
      <div style={headerWrapper}>
        <div style={topRow}>
           {/* Left: Home + Location (Clickable) */}
           <div style={locationClickableArea} onClick={() => setShowLocModal(true)}>
              <div style={{fontSize:'22px', fontWeight:'800', color:'white', lineHeight:'1'}}>
                Home
              </div>
              <div style={{color:'rgba(255,255,255,0.8)', fontSize:'13px', marginTop:'4px', display:'flex', alignItems:'center'}}>
                📍 {userLocation}
              </div>
           </div>
           
           {/* Right: Profile Circle */}
           <Link to="/profile" style={profileCircle}>
              <span style={{fontSize:'26px'}}>🧢</span>
           </Link>
        </div>

        {/* Search Bar */}
        <div style={searchBar}>
           <span style={{fontSize:'18px', color:'rgba(255,255,255,0.6)'}}>🔍</span>
           <input type="text" placeholder="Search 'tractors' or 'rice'..." style={searchInput}/>
        </div>
      </div>

      {/* --- 2. HERO TITLE (UPDATED TEXT & STYLE) --- */}
      <div style={heroSection}>
        {/* New Text, Single Line, Faded End */}
        <h1 style={fadedHeroTitle}>Growing Smarter Together</h1>
      </div>

      {/* --- 3. BENTO GRID --- */}
      <div style={bentoGrid}>
        
        {/* Row 1, Left: Agri-Insights */}
        <Link to="/agri-insights" style={cardLink}>
           <div className="glass-card" style={{...cardStyle, backgroundImage: "url('https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?q=80&w=500')"}}>
              <div style={topIconContainer}><div style={iconCircleStyle}>📊</div></div>
              <div style={cardBottomTextOverlay}>
                 <h3 style={cardTitle}>Agri-Insights</h3>
                 <p style={cardSubtitle}>Rates & Guides</p>
              </div>
           </div>
        </Link>

        {/* Row 1, Right: Service Hub */}
        <Link to="/service" style={cardLink}>
           <div className="glass-card" style={{...cardStyle, backgroundImage: "url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=500')"}}>
              <div style={topIconContainer}><div style={iconCircleStyle}>🚜</div></div>
              <div style={cardBottomTextOverlay}>
                 <h3 style={cardTitle}>Service Hub</h3>
                 <p style={cardSubtitle}>Rent Machinery</p>
              </div>
           </div>
        </Link>

        {/* Row 2, Left: Business Zone */}
        <Link to="/business" style={cardLink}>
           <div className="glass-card" style={{...cardStyle, backgroundImage: "url('https://images.unsplash.com/photo-1471193945509-9ad0617afabf?q=80&w=500')"}}>
              <div style={topIconContainer}><div style={iconCircleStyle}>💰</div></div>
              <div style={cardBottomTextOverlay}>
                 <h3 style={cardTitle}>Business Zone</h3>
                 <p style={cardSubtitle}>Sell Harvest</p>
              </div>
           </div>
        </Link>

        {/* Row 2, Right: Farm Fresh */}
        <div className="glass-card" style={{...cardStyle, backgroundImage: "url('https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=500')"}}>
           <div style={topIconContainer}><div style={iconCircleStyle}>🧺</div></div>
           <div style={cardBottomTextOverlay}>
              <h3 style={cardTitle}>Farm Fresh</h3>
              <p style={cardSubtitle}>Daily Essentials</p>
           </div>
        </div>

        {/* Row 3: WIDE WEATHER CARD (INCREASED HEIGHT) */}
        <div className="glass-card" style={{...wideCardStyle, backgroundImage: "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800')"}}>
           <div style={topIconContainer}><div style={iconCircleStyle}>🌦️</div></div>
           <div style={cardBottomTextOverlay}>
               <h3 style={{...cardTitle, margin:0}}>Crop Weather</h3>
               {/* Placeholder for more details later */}
               <p style={cardSubtitle}>28°C, Rain: 40%, Humidity: 65%</p>
               <p style={{fontSize:'11px', opacity:0.6, marginTop:'4px'}}>More details coming soon...</p>
           </div>
        </div>

      </div>

      {/* Temporary Modal for Location Click */}
      {showLocModal && (
        <div style={modalOverlay}>
          <div style={modalCard}>
            <h3>📍 Location</h3>
            <p>Location selection coming soon!</p>
            <button onClick={() => setShowLocModal(false)} style={closeBtn}>Close</button>
          </div>
        </div>
      )}

    </div>
  );
}

// --- STYLES ---
const pageStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: 'black', overflowY: 'auto' };

const headerWrapper = { padding: '25px 20px 0 20px' };
const topRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' };
const locationClickableArea = { display:'flex', flexDirection:'column', justifyContent:'center', cursor: 'pointer' };
const profileCircle = { width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.25)' };
const searchBar = { background: 'rgba(0, 0, 0, 0.2)', backdropFilter: 'blur(10px)', borderRadius: '12px', padding: '12px 15px', display: 'flex', alignItems: 'center', border: '1px solid rgba(255,255,255,0.1)' };
const searchInput = { border: 'none', outline: 'none', background: 'transparent', marginLeft: '10px', fontSize: '16px', width: '100%', color: 'white', '::placeholder': { color: 'rgba(255,255,255,0.5)' } };

const heroSection = { padding: '0 20px', marginTop: '25px', marginBottom: '20px' };

// UPDATED: Faded Title Style
const fadedHeroTitle = {
  fontSize: '1.6rem', // Decreased font size to fit single line
  margin: 0, fontWeight: '800', letterSpacing: '0.5px',
  whiteSpace: 'nowrap', // Forces single line
  overflow: 'hidden', textOverflow: 'ellipsis', // Safety for very small screens
  // The faded gradient effect (white to transparent)
  background: 'linear-gradient(to right, white 60%, rgba(255,255,255,0.2))',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  display: 'block'
};

const bentoGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: '0 20px 100px 20px' };
const cardLink = { textDecoration: 'none', color: 'white', display: 'block' };

// Square Card Style (Height kept tall as per previous request)
const cardStyle = {
  borderRadius: '18px',
  height: '185px',
  position: 'relative', overflow: 'hidden',
  backgroundSize: 'cover', backgroundPosition: 'center',
  border: '1px solid rgba(255,255,255,0.15)'
};

// UPDATED: Wide Card Style (INCREASED VERTICAL HEIGHT)
const wideCardStyle = {
  gridColumn: 'span 2',
  height: '180px', // INCREASED HEIGHT significantly (was 140px)
  borderRadius: '18px', position: 'relative', overflow: 'hidden',
  backgroundSize: 'cover', backgroundPosition: 'center',
  border: '1px solid rgba(255,255,255,0.15)'
};

const topIconContainer = { position: 'absolute', top: '15px', left: '15px', zIndex: 2 };
const iconCircleStyle = { width: '32px', height: '32px', backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(5px)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' };
const cardBottomTextOverlay = { position: 'absolute', bottom: 0, left: 0, width: '100%', padding: '15px', background: 'linear-gradient(to top, rgba(0,0,0,0.9) 10%, transparent)', color: 'white', textAlign: 'left', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', zIndex: 1 };
const cardTitle = { margin: '0 0 4px 0', fontSize: '16px', fontWeight: '700' };
const cardSubtitle = { margin: 0, fontSize: '12px', opacity: 0.8 };

const modalOverlay = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalCard = { background: 'white', padding: '20px', borderRadius: '15px', width: '80%', maxWidth: '300px', textAlign: 'center', color: 'black' };
const closeBtn = { background: 'none', border: '1px solid black', color: 'black', padding: '5px 10px', marginTop:'10px', cursor: 'pointer', borderRadius:'5px' };

export default Dashboard;