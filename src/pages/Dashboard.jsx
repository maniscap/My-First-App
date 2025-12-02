import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Dashboard() {
  // --- BACKGROUND LOGIC ---
  const [bgImage, setBgImage] = useState('');
  const dayBg = 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2940&auto=format&fit=crop';
  const nightBg = 'https://images.unsplash.com/photo-1504333638930-c8787321eee0?q=80&w=2070&auto=format&fit=crop'; // Correct Moon Image

  useEffect(() => {
    const updateTime = () => {
      const hour = new Date().getHours();
      if (hour >= 18 || hour < 6) setBgImage(nightBg);
      else setBgImage(dayBg);
    };
    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  // --- LOCATION STATE ---
  const [userLocation, setUserLocation] = useState("Detecting Location...");
  const [showLocModal, setShowLocModal] = useState(false);
  const [savedLocations, setSavedLocations] = useState(["Home", "Farm 1", "Market Yard"]); // Example saved spots

  useEffect(() => {
    // Simulate GPS Fetch
    const savedLoc = localStorage.getItem('farmCapCity');
    if (savedLoc) setUserLocation(savedLoc);
    else setUserLocation("Sathyadeva mens pg, Sholing..."); // Default from your screenshot style
  }, []);

  return (
    <div style={{...pageStyle, backgroundImage: `url('${bgImage}')`}}>
      
      {/* --- NEW "SUPER APP" HEADER --- */}
      <nav style={headerContainer}>
        
        {/* LEFT: Home & Address Dropdown */}
        <div style={locationSection} onClick={() => setShowLocModal(!showLocModal)}>
          <div style={locationTitle}>
            <span style={{fontSize:'18px', marginRight:'5px'}}>☁️</span> 
            <span style={{fontWeight:'800', fontSize:'18px'}}>Home</span>
            <span style={{marginLeft:'5px', fontSize:'12px'}}>▼</span>
          </div>
          <div style={addressText}>
            {userLocation}
          </div>
        </div>

        {/* RIGHT: Profile Circle (Cap Icon) */}
        <Link to="/profile" style={profileCircle}>
           <span style={{fontSize: '24px'}}>🧢</span>
        </Link>
      </nav>

      {/* --- SEARCH BAR --- */}
      <div style={searchContainer}>
        <div style={searchBar}>
          <span style={{fontSize:'18px', color:'#e53935', marginRight:'10px'}}>🔍</span>
          <input type="text" placeholder='Search "tractors" or "rice"...' style={searchInput} />
          <span style={{fontSize:'18px', color:'#e53935', borderLeft:'1px solid #ddd', paddingLeft:'10px'}}>🎤</span>
        </div>
      </div>

      {/* --- LOCATION MODAL (Hidden) --- */}
      {showLocModal && (
        <div style={dropdownMenu}>
          <h4 style={{margin:'0 0 10px 0', color:'#333'}}>Select Location</h4>
          {savedLocations.map((loc, i) => (
            <div key={i} style={dropdownItem} onClick={() => {setUserLocation(loc); setShowLocModal(false);}}>
              📍 {loc}
            </div>
          ))}
          <div style={{...dropdownItem, color:'#E65100', fontWeight:'bold'}}>+ Add New Address</div>
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

// New Header Styles
const headerContainer = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '15px 20px', paddingTop: '20px', position: 'relative', zIndex: 20 };

const locationSection = { display: 'flex', flexDirection: 'column', cursor: 'pointer', textShadow: '0 2px 4px rgba(0,0,0,0.8)' };
const locationTitle = { display: 'flex', alignItems: 'center', color: 'white', marginBottom: '2px' };
const addressText = { color: '#ddd', fontSize: '12px', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' };

const profileCircle = { 
  width: '45px', height: '45px', backgroundColor: 'rgba(255,255,255,0.2)', 
  backdropFilter: 'blur(10px)', borderRadius: '50%', 
  display: 'flex', alignItems: 'center', justifyContent: 'center', 
  border: '1px solid rgba(255,255,255,0.3)', textDecoration: 'none',
  boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
};

// Search Bar Styles
const searchContainer = { padding: '0 20px', marginBottom: '20px' };
const searchBar = { 
  display: 'flex', alignItems: 'center', backgroundColor: 'white', 
  padding: '12px 15px', borderRadius: '15px', 
  boxShadow: '0 4px 15px rgba(0,0,0,0.2)' 
};
const searchInput = { border: 'none', outline: 'none', flex: 1, fontSize: '16px', color: '#333', marginLeft: '10px' };

// Dropdown Modal
const dropdownMenu = { position: 'absolute', top: '60px', left: '20px', background: 'white', padding: '15px', borderRadius: '15px', boxShadow: '0 5px 20px rgba(0,0,0,0.3)', zIndex: 100, minWidth: '200px' };
const dropdownItem = { padding: '10px', borderBottom: '1px solid #eee', cursor: 'pointer', fontSize: '14px', color: '#333' };

// Grid & Cards (Same as before)
const heroStyle = { textAlign: 'center', marginTop: '10px', marginBottom: '30px', padding: '0 20px' };
const titleStyle = { fontSize: '2.2rem', color: 'white', margin: '0', fontWeight: '800', textShadow: '0 2px 15px rgba(0,0,0,0.7)' };
const gridContainer = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', padding: '0 20px', maxWidth: '1000px', margin: '0 auto 100px auto' };
const cardLinkStyle = { textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' };
const cardBaseStyle = { borderRadius: '20px', overflow: 'hidden', backgroundSize: 'cover', backgroundPosition: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.2)', height: '180px', transition: 'transform 0.3s ease' };
const overlayCard = { width: '100%', height: '100%', background: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.7))', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'white', textAlign: 'center' };
const iconStyle = { fontSize: '40px', marginBottom: '10px', textShadow: '0 2px 4px rgba(0,0,0,0.5)' };

export default Dashboard;