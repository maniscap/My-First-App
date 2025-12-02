import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Dashboard() {
  // --- 1. BACKGROUND LOGIC (Standardized) ---
  const [bgImage, setBgImage] = useState('');
  const dayBg = 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2940&auto=format&fit=crop';
  const nightBg = 'https://images.unsplash.com/photo-1504333638930-c8787321eee0?q=80&w=2070&auto=format&fit=crop';

  useEffect(() => {
    const updateTime = () => {
      const hour = new Date().getHours();
      if (hour >= 18 || hour < 6) setBgImage(nightBg);
      else setBgImage(dayBg);
    };
    updateTime();
  }, []);

  // --- 2. LOCATION STATE (Fail-Safe) ---
  // Default to "India" or "Set Location" if nothing found, never blank.
  const [userLocation, setUserLocation] = useState(() => {
    return localStorage.getItem('farmCapCity') || "Set Location";
  });
  
  const [showLocModal, setShowLocModal] = useState(false);
  const [manualInput, setManualInput] = useState('');

  // GPS Logic (Runs once on mount)
  useEffect(() => {
    if (userLocation === "Set Location" || userLocation === "Detecting...") {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
          const data = await response.json();
          const city = data.locality || data.city || "India";
          
          setUserLocation(city);
          localStorage.setItem('farmCapCity', city);
        } catch (error) { 
          console.warn("GPS Failed, keeping default");
        }
      }, () => console.warn("GPS Denied"));
    }
  }, []);

  const saveManualLocation = () => {
    if(manualInput.trim()) {
      setUserLocation(manualInput);
      localStorage.setItem('farmCapCity', manualInput);
      setShowLocModal(false);
    }
  };

  return (
    <div style={{...pageStyle, backgroundImage: `url('${bgImage}')`}}>
      
      {/* --- HEADER (Zomato Style) - ALWAYS VISIBLE --- */}
      <nav style={headerContainer}>
        
        {/* LEFT: Home & Address Dropdown */}
        <div style={locationSection} onClick={() => setShowLocModal(true)}>
          <div style={locationTitle}>
            <span style={{fontSize:'20px', marginRight:'5px'}}>🛖</span> 
            <span style={{fontWeight:'800', fontSize:'20px', color:'white'}}>Home</span>
            <span style={{marginLeft:'5px', fontSize:'12px', color:'white'}}>▼</span>
          </div>
          <div style={addressText}>
            {userLocation}
          </div>
        </div>

        {/* RIGHT: Profile Circle (Cap Icon) */}
        <Link to="/profile" style={profileCircle}>
           <span style={{fontSize: '26px'}}>🧢</span>
        </Link>
      </nav>

      {/* --- SEARCH BAR - ALWAYS VISIBLE --- */}
      <div style={searchContainer}>
        <div style={searchBar}>
          <span style={{fontSize:'18px', color:'#e53935', marginRight:'10px'}}>🔍</span>
          <input type="text" placeholder='Search "tractors" or "rice"...' style={searchInput} />
          <span style={{fontSize:'18px', color:'#555', borderLeft:'1px solid #ddd', paddingLeft:'10px'}}>🎤</span>
        </div>
      </div>

      {/* --- LOCATION POPUP --- */}
      {showLocModal && (
        <div style={modalOverlay}>
          <div style={modalCard}>
            <h3>📍 Set Location</h3>
            <input type="text" placeholder="Enter City / Village" style={inputStyle} onChange={(e) => setManualInput(e.target.value)} />
            <button onClick={saveManualLocation} style={saveBtn}>Update</button>
            <button onClick={() => setShowLocModal(false)} style={closeBtn}>Close</button>
          </div>
        </div>
      )}

      {/* --- HERO TEXT --- */}
      <div style={heroStyle}>
        <h1 style={titleStyle}>Your Farm, Your Control.</h1>
      </div>

      {/* --- GLASS CARDS GRID --- */}
      <div style={gridContainer}>
        <Link to="/agri-insights" style={cardLinkStyle}>
          <div className="feature-card" style={{...cardBaseStyle, backgroundImage: "url('https://images.unsplash.com/photo-1592982537447-6f2a6a0c7c18?auto=format&fit=crop&w=800&q=80')"}}>
            <div style={overlayCard}><div style={iconStyle}>📈</div><h3>Agri-Insights</h3><p>Rates & Guides</p></div>
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

// --- STYLES ---
const pageStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: 'black', overflowY: 'auto' };
const headerContainer = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '15px 20px', paddingTop: '20px', position: 'relative', zIndex: 20 };
const locationSection = { display: 'flex', flexDirection: 'column', cursor: 'pointer', textShadow: '0 2px 4px rgba(0,0,0,0.8)' };
const locationTitle = { display: 'flex', alignItems: 'center', color: 'white', marginBottom: '2px' };
const addressText = { color: '#ddd', fontSize: '13px', maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: '500' };
const profileCircle = { width: '45px', height: '45px', backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.3)', textDecoration: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' };
const searchContainer = { padding: '0 20px', marginBottom: '20px' };
const searchBar = { display: 'flex', alignItems: 'center', backgroundColor: 'white', padding: '12px 15px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' };
const searchInput = { border: 'none', outline: 'none', flex: 1, fontSize: '16px', color: '#333', marginLeft: '10px' };
const modalOverlay = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalCard = { background: 'white', padding: '20px', borderRadius: '15px', width: '80%', maxWidth: '300px', textAlign: 'center' };
const inputStyle = { padding: '10px', width: '100%', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing:'border-box' };
const saveBtn = { padding: '10px', background: '#2E7D32', color: 'white', border: 'none', borderRadius: '5px', width: '100%', marginBottom: '5px' };
const closeBtn = { background: 'none', border: 'none', color: '#888', textDecoration: 'underline', cursor: 'pointer' };
const heroStyle = { textAlign: 'center', marginTop: '10px', marginBottom: '30px', padding: '0 20px' };
const titleStyle = { fontSize: '2.2rem', color: 'white', margin: '0', fontWeight: '800', textShadow: '0 2px 15px rgba(0,0,0,0.7)' };
const gridContainer = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', padding: '0 20px', maxWidth: '1000px', margin: '0 auto 100px auto' };
const cardLinkStyle = { textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' };
const cardBaseStyle = { borderRadius: '20px', overflow: 'hidden', backgroundSize: 'cover', backgroundPosition: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.2)', height: '180px', transition: 'transform 0.3s ease' };
const overlayCard = { width: '100%', height: '100%', background: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.7))', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'white', textAlign: 'center' };
const iconStyle = { fontSize: '40px', marginBottom: '10px', textShadow: '0 2px 4px rgba(0,0,0,0.5)' };

export default Dashboard;