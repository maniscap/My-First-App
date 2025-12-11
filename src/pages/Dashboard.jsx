import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Dashboard() {
  // --- BACKGROUND ---
  const [bgImage, setBgImage] = useState('');
  const dayBg = 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2940&auto=format&fit=crop';
  const nightBg = 'https://images.unsplash.com/photo-1504333638930-c8787321eee0?q=80&w=2070&auto=format&fit=crop';

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 18 || hour < 6) setBgImage(nightBg);
    else setBgImage(dayBg);
  }, []);

  // --- 📍 SMART LOCATION LOGIC ---
  const [userLocation, setUserLocation] = useState('Select Location'); 
  const [showLocModal, setShowLocModal] = useState(false);
  
  // Search State
  const [manualInput, setManualInput] = useState('');
  const [suggestions, setSuggestions] = useState([]); // List of search results
  const [isGpsLoading, setIsGpsLoading] = useState(false);

  // 1. Load saved location on startup
  useEffect(() => {
    const savedLoc = localStorage.getItem('userLocation');
    if (savedLoc) setUserLocation(savedLoc);
    else detectLocation(); // Auto-ask GPS on first load
  }, []);

  // 2. Save Location & Refresh App
  const updateLocation = (name, lat, lng) => {
    setUserLocation(name);
    localStorage.setItem('userLocation', name); // Save Name
    
    // Save Coordinates for 50km Logic
    if (lat && lng) {
      localStorage.setItem('userLat', lat);
      localStorage.setItem('userLng', lng);
    }
    
    setShowLocModal(false);
    setSuggestions([]); // Clear search
    setManualInput('');
    
    // FORCE REFRESH to update Service/Business lists
    setTimeout(() => {
      window.location.reload(); 
    }, 300);
  };

  // 3. SEARCH AUTOCOMPLETE (Using Open-Meteo API)
  const handleSearch = async (query) => {
    setManualInput(query);
    if (query.length < 3) { setSuggestions([]); return; }

    try {
      // Free Geocoding API (No Key Needed, No Blocking)
      const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=10&language=en&format=json`);
      const data = await response.json();
      
      if (data.results) {
        setSuggestions(data.results);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error("Search Error", error);
    }
  };

  // 4. GPS Auto-Detect
  const detectLocation = () => {
    if (!navigator.geolocation) { alert("GPS not supported"); return; }
    setIsGpsLoading(true);
    
    const options = { enableHighAccuracy: true, timeout: 10000 };

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        // Reverse Geocoding
        const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
        const data = await response.json();
        
        // Construct Address
        const village = data.locality || data.city || "";
        const district = data.principalSubdivision || "";
        const fullLoc = `${village}, ${district}`;
        
        updateLocation(fullLoc, latitude, longitude);
        alert(`Location Found: ${fullLoc}`);
      } catch (error) { alert("GPS Error. Try Manual Search."); }
      setIsGpsLoading(false);
    }, () => { 
      // Silent fail on auto-detect, alert on manual click
      if(showLocModal) alert("Permission denied. Enable GPS."); 
      setIsGpsLoading(false); 
    }, options);
  };

  return (
    <div style={{...pageStyle, backgroundImage: `url('${bgImage}')`}}>
      
      {/* --- HEADER --- */}
      <div style={headerWrapper}>
        <div style={topRow}>
           <div style={locationClickableArea} onClick={() => setShowLocModal(true)}>
              <div style={{fontSize:'22px', fontWeight:'800', color:'white', lineHeight:'1'}}>Home</div>
              <div style={{color:'rgba(255,255,255,0.9)', fontSize:'14px', marginTop:'4px', display:'flex', alignItems:'center', textShadow:'0 2px 4px black'}}>
                📍 <span style={{borderBottom:'1px dashed white', paddingBottom:'2px', maxWidth:'200px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{userLocation}</span> ✏️
              </div>
           </div>
           <Link to="/profile" style={profileCircle}><span style={{fontSize:'26px'}}>🧢</span></Link>
        </div>
        <div style={searchBar}>
           <span style={{fontSize:'18px', color:'rgba(255,255,255,0.6)'}}>🔍</span>
           <input type="text" placeholder="Search 'tractors' or 'rice'..." style={searchInput}/>
        </div>
      </div>

      <div style={heroSection}><h1 style={fadedHeroTitle}>Growing Smarter Together</h1></div>

      {/* --- BENTO GRID --- */}
      <div style={bentoGrid}>
        <Link to="/agri-insights" style={cardLink}><div className="glass-card" style={{...cardStyle, backgroundImage: "url('https://img.freepik.com/premium-photo/hand-holding-plant-with-sun-it_1174726-1291.jpg')"}}><div style={cardTopOverlay}><div><h3 style={cardTitle}>Agri-Insights</h3><p style={cardSubtitle}>Rates & Guides</p></div><div style={whiteIconBox}><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg></div></div></div></Link>
        <Link to="/service" style={cardLink}><div className="glass-card" style={{...cardStyle, backgroundImage: "url('https://th.bing.com/th/id/R.e2c73dbf8a8f512a95ee3a2ec35f5d72?rik=DuUew48QLbwHzw&riu=http%3a%2f%2fvnmanpower.com%2fupload_images%2fimages%2fall%2ffarm-workers-from-vmst.jpg&ehk=s1NXBhEe0wVXkZGBnlrnXcEoGY1R4UtFvQ9kW7HVQ0Y%3d&risl=&pid=ImgRaw&r=0')"}}><div style={cardTopOverlay}><div><h3 style={cardTitle}>Service Hub</h3><p style={cardSubtitle}>Machinery&Workers</p></div><div style={whiteIconBox}><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h3l1-3h4l1 3h8"/><circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="M15 5h4l2 7h-6z"/></svg></div></div></div></Link>
        <Link to="/business" style={cardLink}><div className="glass-card" style={{...cardStyle, backgroundImage: "url('https://www.deere.ca/assets/images/region-4/products/harvesting/cornhead-R4A057928_RRD_1-1920x1080.jpg')"}}><div style={cardTopOverlay}><div><h3 style={cardTitle}>Business Zone</h3><p style={cardSubtitle}>Sell Harvest</p></div><div style={whiteIconBox}><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/><path d="M19 5H5"/></svg></div></div></div></Link>
        <Link to="/farm-fresh" style={cardLink}><div className="glass-card" style={{...cardStyle, backgroundImage: "url('https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=500')"}}><div style={cardTopOverlay}><div><h3 style={cardTitle}>Farm Fresh</h3><p style={cardSubtitle}>Daily Essentials</p></div><div style={whiteIconBox}><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 11-1 9"/><path d="m19 11-4-7"/><path d="M2 11h20"/><path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.7-7.4"/><path d="M4.5 15.5h15"/><path d="m5 11 4-7"/><path d="m9 11 1 9"/></svg></div></div></div></Link>
        <Link to="/weather" style={{...cardLink, gridColumn: 'span 2'}}><div className="glass-card" style={{...wideCardStyle, backgroundImage: "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800')"}}><div style={cardTopOverlay}><div><h3 style={{...cardTitle, margin:0}}>Crop Weather</h3><p style={cardSubtitle}>28°C, Rain: 40%, Humidity: 65%</p></div><div style={whiteIconBox}><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M20 12h2"/><path d="m19.07 4.93-1.41 1.41"/><path d="M15.947 12.65a4 4 0 0 0-5.925-4.128"/><path d="M13 22H7a4 4 0 1 1 0-8h1"/></svg></div></div></div></Link>
      </div>

      {/* --- PROFESSIONAL LOCATION DRAWER --- */}
      {showLocModal && (
        <div style={modalOverlay}>
          <div style={modalCard}>
            {/* Header */}
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px'}}>
              <h3 style={{margin:0, fontSize:'18px', color:'#333'}}>📍 Set Location</h3>
              <button onClick={() => setShowLocModal(false)} style={closeIcon}>✕</button>
            </div>

            {/* GPS Button */}
            <div onClick={detectLocation} style={gpsRow}>
              <span style={{fontSize:'18px', marginRight:'10px'}}>📡</span>
              <div>
                <div style={{color:'#E65100', fontWeight:'bold', fontSize:'14px'}}>{isGpsLoading ? "Detecting..." : "Use Current Location"}</div>
                <div style={{color:'#888', fontSize:'11px'}}>Using GPS</div>
              </div>
            </div>

            <div style={{borderBottom:'1px solid #eee', margin:'10px 0'}}></div>

            {/* Search Input */}
            <div style={searchContainer}>
              <span style={{fontSize:'16px', color:'#888'}}>🔍</span>
              <input 
                type="text" 
                placeholder="Search Village, District..." 
                value={manualInput}
                onChange={(e) => handleSearch(e.target.value)}
                style={modalSearchInput} 
              />
            </div>

            {/* Search Results List (Zomato Style) */}
            <div style={suggestionsBox}>
              {suggestions.map((place) => (
                <div 
                  key={place.id} 
                  onClick={() => updateLocation(`${place.name}, ${place.admin1 || ''}`, place.latitude, place.longitude)}
                  style={suggestionItem}
                >
                  <div style={{fontWeight:'bold', color:'#333', fontSize:'14px'}}>{place.name}</div>
                  <div style={{fontSize:'11px', color:'#888'}}>
                    {place.admin1}, {place.country}
                  </div>
                </div>
              ))}
              {manualInput.length > 2 && suggestions.length === 0 && (
                <div style={{padding:'15px', textAlign:'center', color:'#999', fontSize:'13px'}}>No results found.</div>
              )}
            </div>

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
const fadedHeroTitle = { fontSize: '1.4rem', margin: 0, fontWeight: '800', letterSpacing: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', background: 'linear-gradient(to right, #ffffff 0%, #e0e0e0 50%, rgba(255,255,255,0.2) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block', textTransform: 'uppercase' };
const bentoGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: '0 20px 100px 20px', maxWidth: '1000px', margin: '0 auto' };
const cardLink = { textDecoration: 'none', color: 'white', display: 'block', width: '100%', height: '100%' };
const cardStyle = { borderRadius: '18px', height: '185px', position: 'relative', overflow: 'hidden', backgroundSize: 'cover', backgroundPosition: 'center', border: '1px solid rgba(255,255,255,0.15)' };
const wideCardStyle = { gridColumn: 'span 2', height: '180px', borderRadius: '18px', position: 'relative', overflow: 'hidden', backgroundSize: 'cover', backgroundPosition: 'center', border: '1px solid rgba(255,255,255,0.15)' };
const cardTopOverlay = { position: 'absolute', top: 0, left: 0, width: '100%', padding: '15px', background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%)', color: 'white', textAlign: 'left', boxSizing: 'border-box', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 1 };
const whiteIconBox = { filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' };
const cardTitle = { margin: '0 0 4px 0', fontSize: '17px', fontWeight: '700', textShadow: '0 2px 4px rgba(0,0,0,0.5)' };
const cardSubtitle = { margin: 0, fontSize: '13px', opacity: 0.9, fontWeight: '500', textShadow: '0 1px 2px rgba(0,0,0,0.5)' };

const modalOverlay = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', zIndex: 1000 };
const modalCard = { background: 'white', width: '100%', maxWidth: '500px', borderRadius: '20px 20px 0 0', padding: '20px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' };
const closeIcon = { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#666' };
const gpsRow = { display: 'flex', alignItems: 'center', padding: '10px 0', cursor: 'pointer' };
const searchContainer = { display: 'flex', alignItems: 'center', background: '#f2f2f2', borderRadius: '10px', padding: '10px 15px', marginBottom: '10px' };
const modalSearchInput = { border: 'none', background: 'transparent', outline: 'none', marginLeft: '10px', width: '100%', fontSize: '15px' };
const suggestionsBox = { flex: 1, overflowY: 'auto' };
const suggestionItem = { padding: '15px 0', borderBottom: '1px solid #f0f0f0', cursor: 'pointer' };

export default Dashboard;