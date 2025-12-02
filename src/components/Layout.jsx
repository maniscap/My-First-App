import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Layout({ children }) {
  // --- BACKGROUND LOGIC ---
  const [bgImage, setBgImage] = useState('');
  const dayBg = 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2940&auto=format&fit=crop';
  const nightBg = 'https://images.unsplash.com/photo-1504333638930-c8787321eee0?q=80&w=2070&auto=format&fit=crop';

  // --- LOCATION STATE ---
  const [userLocation, setUserLocation] = useState("Detecting...");
  const [showLocModal, setShowLocModal] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const location = useLocation(); // To check current page

  useEffect(() => {
    const updateTime = () => {
      const hour = new Date().getHours();
      if (hour >= 18 || hour < 6) setBgImage(nightBg);
      else setBgImage(dayBg);
    };
    updateTime();
    
    // GPS Logic
    const savedLoc = localStorage.getItem('farmCapCity');
    if (savedLoc) setUserLocation(savedLoc);
    else {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
          const data = await response.json();
          const city = data.locality || data.city || "India";
          setUserLocation(city);
          localStorage.setItem('farmCapCity', city);
        } catch (error) { setUserLocation("Set Location"); }
      });
    }
  }, []);

  const saveManualLocation = () => {
    if(manualInput.trim()) {
      setUserLocation(manualInput);
      localStorage.setItem('farmCapCity', manualInput);
      setShowLocModal(false);
    }
  };

  // Don't show Header on Login or Home (Landing) pages
  if (location.pathname === '/' || location.pathname === '/login') {
    return <>{children}</>; 
  }

  return (
    <div style={{...pageStyle, backgroundImage: `url('${bgImage}')`}}>
      
      {/* --- GLOBAL HEADER --- */}
      <nav style={headerContainer}>
        <div style={locationSection} onClick={() => setShowLocModal(true)}>
          <div style={locationTitle}>
            <span style={{fontSize:'20px', marginRight:'5px'}}>📍</span> 
            <span style={{fontWeight:'800', fontSize:'18px', color:'white'}}>Home</span>
            <span style={{marginLeft:'5px', fontSize:'12px', color:'white'}}>▼</span>
          </div>
          <div style={addressText}>{userLocation}</div>
        </div>

        <Link to="/profile" style={profileCircle}>
           <span style={{fontSize: '24px'}}>🧢</span>
        </Link>
      </nav>

      {/* --- LOCATION MODAL --- */}
      {showLocModal && (
        <div style={modalOverlay}>
          <div style={modalCard}>
            <h3>📍 Change Location</h3>
            <input type="text" placeholder="Enter City / Area" style={inputStyle} onChange={(e) => setManualInput(e.target.value)} />
            <button onClick={saveManualLocation} style={saveBtn}>Update</button>
            <button onClick={() => setShowLocModal(false)} style={closeBtn}>Close</button>
          </div>
        </div>
      )}

      {/* --- PAGE CONTENT GOES HERE --- */}
      <div style={contentScroll}>
        {children}
      </div>

    </div>
  );
}

// STYLES
const pageStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: 'black' };
const headerContainer = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '15px 20px', paddingTop: '20px', position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 50, boxSizing: 'border-box', background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)' };
const locationSection = { display: 'flex', flexDirection: 'column', cursor: 'pointer', textShadow: '0 2px 4px rgba(0,0,0,0.8)' };
const locationTitle = { display: 'flex', alignItems: 'center', marginBottom: '2px' };
const addressText = { color: '#ddd', fontSize: '12px', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' };
const profileCircle = { width: '45px', height: '45px', backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.3)', textDecoration: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' };
const contentScroll = { height: '100vh', overflowY: 'auto', padding: '0', boxSizing: 'border-box' }; // Allows scrolling below header

// Modal
const modalOverlay = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalCard = { background: 'white', padding: '20px', borderRadius: '15px', width: '80%', maxWidth: '300px', textAlign: 'center' };
const inputStyle = { padding: '10px', width: '100%', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing:'border-box' };
const saveBtn = { padding: '10px', background: '#2E7D32', color: 'white', border: 'none', borderRadius: '5px', width: '100%', marginBottom: '5px' };
const closeBtn = { background: 'none', border: 'none', color: '#888', textDecoration: 'underline', cursor: 'pointer' };

export default Layout;