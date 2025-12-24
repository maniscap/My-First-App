import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'; 

// --- ASSET IMPORTS (FIXED TO MATCH YOUR FILES) ---
import clearDayVideo from '../assets/weather-videos/clear-day.mp4';
import clearNightVideo from '../assets/weather-videos/clear-night.mp4';
import cloudyDayVideo from '../assets/weather-videos/cloudy-day.mp4';
import cloudyNightVideo from '../assets/weather-videos/cloudy-night.mp4'; // New
import partlyCloudyDayVideo from '../assets/weather-videos/partly-cloudy-day.mp4'; // Fixed Name
import partlyCloudyNightVideo from '../assets/weather-videos/partly-cloudy-night.mp4'; // New
import drizzleDayVideo from '../assets/weather-videos/drizzle-day.mp4'; // Fixed Name
import mistDayVideo from '../assets/weather-videos/mist-day.mp4'; // Fixed Name
import mistNightVideo from '../assets/weather-videos/mist-night.mp4'; // New
import rainDayVideo from '../assets/weather-videos/rain-day.mp4';
import rainEveningVideo from '../assets/weather-videos/rain-evening.mp4';
import rainNightVideo from '../assets/weather-videos/rain-night.mp4';
import stormVideo from '../assets/weather-videos/thunder.mp4'; // Fixed Name
import sunriseVideo from '../assets/weather-videos/sunrise.mp4';
import sunsetVideo from '../assets/weather-videos/sunset.mp4';

function Dashboard() {
  const navigate = useNavigate(); 

  // --- BACKGROUND ---
  const [bgImage, setBgImage] = useState('');
  const dayBg = 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2940&auto=format&fit=crop';
  const nightBg = 'https://images.unsplash.com/photo-1652454159675-11ead6275680?q=80&w=1170&auto=format&fit=crop';

  // --- WEATHER STATE ---
  const [weatherData, setWeatherData] = useState(null);
  const [weatherVideo, setWeatherVideo] = useState(clearDayVideo); 
  const [customLocationName, setCustomLocationName] = useState(""); 

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 18 || hour < 6) setBgImage(nightBg);
    else setBgImage(dayBg);
  }, []);

  // --- 📍 SMART LOCATION & SYNC LOGIC ---
  const [userLocation, setUserLocation] = useState('Select Location'); 
  const [showLocModal, setShowLocModal] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [suggestions, setSuggestions] = useState([]); 
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  useEffect(() => {
    // 1. SYNC: Check if user just swiped to a new city in Weather Page
    const lastViewed = localStorage.getItem('farmBuddy_lastCity');
    const savedLoc = localStorage.getItem('userLocation');

    if (lastViewed) {
        const { lat, lon, name } = JSON.parse(lastViewed);
        setCustomLocationName(name); // Use saved name
        fetchLiveWeather(`${lat},${lon}`);
    } 
    else if (savedLoc) {
        setUserLocation(savedLoc);
        const savedLat = localStorage.getItem('userLat');
        const savedLng = localStorage.getItem('userLng');
        if (savedLat && savedLng) {
            fetchLiveWeather(`${savedLat},${savedLng}`);
        } else {
            fetchLiveWeather(savedLoc);
        }
    } 
    else {
        detectLocation(); 
    }
    
    if (savedLoc) setUserLocation(savedLoc);

  }, []);

  // --- API: FETCH WEATHER ---
  const fetchLiveWeather = async (query) => {
      try {
          const apiKey = import.meta.env.VITE_WEATHER_KEY;
          const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${query}&days=1&aqi=no&alerts=no`;
          const response = await axios.get(url);
          setWeatherData(response.data);
          
          const video = getAssetLogic(response.data);
          setWeatherVideo(video);
      } catch (err) {
          console.error("Weather Fetch Error:", err);
      }
  };

  // --- ASSET LOGIC (UPDATED) ---
  const getAssetLogic = (data) => {
    const code = data.current.condition.code;
    const isDay = data.current.is_day === 1;
    const hour = new Date().getHours();

    // 1. Thunder
    if ([1087, 1273, 1276, 1279, 1282].includes(code)) {
        return stormVideo;
    }

    // 2. Drizzle
    if ([1063, 1150, 1153, 1180, 1183, 1186, 1189, 1240].includes(code)) {
        return isDay ? drizzleDayVideo : rainNightVideo;
    }

    // 3. Rain
    if ([1192, 1195, 1198, 1201, 1243, 1246].includes(code)) {
        if (hour >= 16 && hour <= 19) return rainEveningVideo;
        return isDay ? rainDayVideo : rainNightVideo;
    }

    // 4. Mist / Fog
    if ([1030, 1135, 1147].includes(code)) {
        return isDay ? mistDayVideo : mistNightVideo;
    }

    // 5. Cloudy
    if ([1006, 1009].includes(code)) {
        return isDay ? cloudyDayVideo : cloudyNightVideo;
    }

    // 6. Partly Cloudy
    if (code === 1003) {
        return isDay ? partlyCloudyDayVideo : partlyCloudyNightVideo;
    }

    // 7. Clear / Sunny
    if (isDay) {
        if (hour === 6) return sunriseVideo;
        if (hour >= 17 && hour <= 18) return sunsetVideo;
        return clearDayVideo;
    } 
    return clearNightVideo;
  };

  const handleGlobalSearch = (e) => {
    if (e.key === 'Enter' && globalSearch.trim() !== '') {
      navigate(`/search?q=${encodeURIComponent(globalSearch.trim())}`);
    }
  };

  const updateLocation = (name, lat, lng) => {
    setUserLocation(name);
    localStorage.setItem('userLocation', name);
    if (lat && lng) {
      localStorage.setItem('userLat', lat);
      localStorage.setItem('userLng', lng);
      fetchLiveWeather(`${lat},${lng}`);
    }
    setShowLocModal(false);
    setSuggestions([]);
    setManualInput('');
  };

  const handleLocSearch = async (query) => {
    setManualInput(query);
    if (query.length < 3) { setSuggestions([]); return; }
    try {
      const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=10&language=en&format=json`);
      const data = await response.json();
      if (data.results) setSuggestions(data.results);
      else setSuggestions([]);
    } catch (error) { console.error("Search Error", error); }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) { alert("GPS not supported"); return; }
    setIsGpsLoading(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
        const data = await response.json();
        const village = data.locality || data.city || "";
        const district = data.principalSubdivision || "";
        const fullLoc = `${village}, ${district}`;
        updateLocation(fullLoc, latitude, longitude);
      } catch (error) { alert("GPS worked, but address lookup failed."); }
      setIsGpsLoading(false);
    }, () => { 
        if(showLocModal) alert("Permission denied. Enable GPS."); 
        setIsGpsLoading(false); 
    });
  };

  return (
    <div style={{...pageStyle, backgroundImage: `url('${bgImage}')`}}>
      
      {/* HEADER */}
      <div style={headerWrapper}>
        <div style={topRow}>
           <div style={locationClickableArea} onClick={() => setShowLocModal(true)}>
              <div style={{fontSize:'22px', fontWeight:'800', color:'white', lineHeight:'1'}}>Home</div>
              <div style={{color:'rgba(255,255,255,0.9)', fontSize:'13px', marginTop:'4px', display:'flex', alignItems:'center', textShadow:'0 2px 4px black'}}>
                📍 <span style={{borderBottom:'1px dashed white', paddingBottom:'2px', maxWidth:'200px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{userLocation}</span> ✏️
              </div>
           </div>
           <Link to="/profile" style={profileCircle}><span style={{fontSize:'26px'}}>🧢</span></Link>
        </div>
        
        <div style={searchBar}>
           <span style={{fontSize:'18px', color:'rgba(255,255,255,0.6)'}}>🔍</span>
           <input 
             type="text" 
             placeholder="Search 'cotton', 'workers'..." 
             style={searchInput}
             value={globalSearch}
             onChange={(e) => setGlobalSearch(e.target.value)}
             onKeyDown={handleGlobalSearch} 
           />
        </div>
      </div>

      <div style={heroSection}><h1 style={fadedHeroTitle}>Growing Smarter Together</h1></div>

      {/* BENTO GRID */}
      <div style={bentoGrid}>
        
        <Link to="/agri-insights" style={cardLink}>
           <div className="glass-card" style={{...cardStyle, backgroundImage: "url('https://img.freepik.com/premium-photo/hand-holding-plant-with-sun-it_1174726-1291.jpg')"}}>
              <div style={cardTopOverlay}>
                 <div><h3 style={cardTitle}>Agri-Insights</h3><p style={cardSubtitle}>Rates & Guides</p></div>
                 <div style={whiteIconBox}><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg></div>
              </div>
           </div>
        </Link>

        <Link to="/service" style={cardLink}>
           <div className="glass-card" style={{...cardStyle, backgroundImage: "url('https://th.bing.com/th/id/R.e2c73dbf8a8f512a95ee3a2ec35f5d72?rik=DuUew48QLbwHzw&riu=http%3a%2f%2fvnmanpower.com%2fupload_images%2fimages%2fall%2ffarm-workers-from-vmst.jpg&ehk=s1NXBhEe0wVXkZGBnlrnXcEoGY1R4UtFvQ9kW7HVQ0Y%3d&risl=&pid=ImgRaw&r=0')"}}>
              <div style={cardTopOverlay}>
                 <div><h3 style={cardTitle}>Service Hub</h3><p style={cardSubtitle}>Machinery&Workers</p></div>
                 <div style={whiteIconBox}><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h3l1-3h4l1 3h8"/><circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="M15 5h4l2 7h-6z"/></svg></div>
              </div>
           </div>
        </Link>

        <Link to="/business" style={cardLink}>
           <div className="glass-card" style={{...cardStyle, backgroundImage: "url('https://www.deere.ca/assets/images/region-4/products/harvesting/cornhead-R4A057928_RRD_1-1920x1080.jpg')"}}>
              <div style={cardTopOverlay}>
                 <div><h3 style={cardTitle}>Business Zone</h3><p style={cardSubtitle}>Sell Harvest</p></div>
                 <div style={whiteIconBox}><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/><path d="M19 5H5"/></svg></div>
              </div>
           </div>
        </Link>

        <Link to="/farm-fresh" style={cardLink}>
           <div className="glass-card" style={{...cardStyle, backgroundImage: "url('https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=500')"}}>
              <div style={cardTopOverlay}>
                 <div><h3 style={cardTitle}>Farm Fresh</h3><p style={cardSubtitle}>Daily Essentials</p></div>
                 <div style={whiteIconBox}><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 11-1 9"/><path d="m19 11-4-7"/><path d="M2 11h20"/><path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.7-7.4"/><path d="M4.5 15.5h15"/><path d="m5 11 4-7"/><path d="m9 11 1 9"/></svg></div>
              </div>
           </div>
        </Link>

        <Link to="/expenditure" style={{...cardLink, gridColumn: 'span 2'}}>
           <div className="glass-card" style={{...wideCardStyle, backgroundImage: "url('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=1000&auto=format&fit=crop')"}}>
              <div style={cardTopOverlay}>
                  <div><h3 style={{...cardTitle, margin:0}}>Crop Expenditure</h3><p style={cardSubtitle}>Track Expenses & Bills</p></div>
                  <div style={whiteIconBox}><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg></div>
              </div>
           </div>
        </Link>

        {/* 6. --- LIVE WEATHER CARD (Vertical & Modern) --- */}
        <Link to="/weather" style={{...cardLink, gridColumn: 'span 2'}}>
           <div className="glass-card" style={{...wideCardStyle, position: 'relative', overflow: 'hidden'}}>
              
              <video key={weatherVideo} autoPlay loop muted playsInline style={videoBgStyle}>
                  <source src={weatherVideo} type="video/mp4" />
              </video>
              <div style={darkOverlay}></div>

              <div style={cardTopOverlay}>
                  <div style={{display:'flex', flexDirection:'column', justifyContent:'space-between', height:'100%', width:'100%'}}>
                    {/* Header */}
                    <div style={{display:'flex', justifyContent:'space-between', width:'100%'}}>
                        <h3 style={{...cardTitle, margin:0, fontSize:'13px', opacity:0.8, textTransform:'uppercase'}}>Weather View</h3>
                        <div style={whiteIconBox}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M20 12h2"/><path d="m19.07 4.93-1.41 1.41"/><path d="M15.947 12.65a4 4 0 0 0-5.925-4.128"/><path d="M13 22H7a4 4 0 1 1 0-8h1"/></svg></div>
                    </div>

                    {/* Vertical Content */}
                    {weatherData ? (
                        <div style={{display:'flex', flexDirection:'column', marginTop:'10px'}}>
                            {/* Force the name "Parumanchala" if saved in localStorage */}
                            <div style={{fontSize:'22px', fontWeight:'700', lineHeight:'1.2'}}>
                                {customLocationName || weatherData.location.name}
                            </div>
                            <div style={{fontSize:'42px', fontWeight:'300', margin:'2px 0'}}>{Math.round(weatherData.current.temp_c)}°</div>
                            <div style={{display:'flex', gap:'15px', fontSize:'13px', opacity:0.9, marginTop:'5px'}}>
                                <span>🌧 Rain: {weatherData.forecast.forecastday[0].day.daily_chance_of_rain}%</span>
                                <span>💧 Hum: {weatherData.current.humidity}%</span>
                            </div>
                        </div>
                    ) : (
                        <p style={{marginTop:'20px'}}>Loading Weather...</p>
                    )}
                  </div>
              </div>
           </div>
        </Link>

      </div>

      {/* --- MODAL (UNCHANGED) --- */}
      {showLocModal && (
        <div style={modalOverlay}>
          <div style={modalCard}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
              <h3 style={{margin:0, fontSize:'20px', color:'#2E7D32', fontWeight:'800'}}>📍 Set Location</h3>
              <button onClick={() => setShowLocModal(false)} style={closeIcon}>✕</button>
            </div>
            <div onClick={detectLocation} style={gpsBox}>
              <div style={{background:'#E8F5E9', padding:'10px', borderRadius:'50%', marginRight:'15px', display:'flex'}}>
                <span style={{fontSize:'20px'}}>🛰️</span>
              </div>
              <div>
                <div style={{color:'#2E7D32', fontWeight:'bold', fontSize:'15px'}}>
                  {isGpsLoading ? "Detecting..." : "Use Current Location"}
                </div>
                <div style={{color:'#888', fontSize:'12px'}}>Using GPS</div>
              </div>
            </div>
            <div style={{textAlign:'center', margin:'20px 0 10px 0', color:'#ccc', fontSize:'11px', fontWeight:'bold', letterSpacing:'1px'}}>- OR SEARCH MANUALLY -</div>
            <div style={searchContainer}>
              <span style={{fontSize:'18px', color:'#888'}}>🔍</span>
              <input 
                type="text" 
                placeholder="Search Village, Mandal..." 
                value={manualInput}
                onChange={(e) => handleLocSearch(e.target.value)}
                style={modalSearchInput} 
                autoFocus
              />
            </div>
            <div style={suggestionsBox}>
              {suggestions.map((place) => (
                <div 
                  key={place.id} 
                  onClick={() => updateLocation(`${place.name}, ${place.admin1 || ''}`, place.latitude, place.longitude)}
                  style={suggestionItem}
                >
                  <span style={{marginRight:'12px', fontSize:'16px'}}>🏙️</span>
                  <div>
                    <div style={{fontWeight:'600', color:'#333', fontSize:'15px'}}>{place.name}</div>
                    <div style={{fontSize:'11px', color:'#888'}}>{place.admin1}, {place.country}</div>
                  </div>
                </div>
              ))}
              {manualInput.length > 2 && suggestions.length === 0 && (
                <div style={{padding:'20px', textAlign:'center', color:'#999', fontSize:'13px'}}>No results found.</div>
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
const cardTopOverlay = { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', padding: '15px', background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 100%)', color: 'white', textAlign: 'left', boxSizing: 'border-box', zIndex: 1 };
const whiteIconBox = { filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' };
const cardTitle = { margin: '0 0 4px 0', fontSize: '17px', fontWeight: '700', textShadow: '0 2px 4px rgba(0,0,0,0.5)' };
const cardSubtitle = { margin: 0, fontSize: '13px', opacity: 0.9, fontWeight: '500', textShadow: '0 1px 2px rgba(0,0,0,0.5)' };

const videoBgStyle = { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: -2 };
const darkOverlay = { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.3)', zIndex: -1 };

const modalOverlay = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 };
const modalCard = { background: 'white', width: '90%', maxWidth: '400px', borderRadius: '24px', padding: '25px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', animation: 'popIn 0.3s ease' };
const closeIcon = { background: '#f5f5f5', border: 'none', width:'32px', height:'32px', borderRadius:'50%', fontSize: '16px', cursor: 'pointer', color: '#333', display:'flex', alignItems:'center', justifyContent:'center' };
const gpsBox = { display: 'flex', alignItems: 'center', padding: '12px', borderRadius: '16px', border: '1px solid #eee', cursor: 'pointer', transition:'0.2s', background:'#fff', boxShadow:'0 4px 10px rgba(0,0,0,0.05)' };
const searchContainer = { display: 'flex', alignItems: 'center', background: '#F5F5F5', borderRadius: '14px', padding: '12px 15px', marginBottom: '10px' };
const modalSearchInput = { border: 'none', background: 'transparent', outline: 'none', marginLeft: '10px', width: '100%', fontSize: '16px', color:'#333' };
const suggestionsBox = { maxHeight: '220px', overflowY: 'auto', marginTop:'10px' };
const suggestionItem = { padding: '12px 5px', borderBottom: '1px solid #f0f0f0', cursor: 'pointer', display:'flex', alignItems:'center', transition:'0.2s' };

export default Dashboard;