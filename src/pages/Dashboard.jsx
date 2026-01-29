import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import LocationSheet from '../components/LocationSheet'; 
import BottomNavigation from '../components/BottomNavigation'; 
import { ChevronDown, Radio, Map, Briefcase } from 'lucide-react'; 

// --- WEATHER IMAGE ASSETS (URLs) ---
const weatherImages = {
 clearDay: 'https://images.pexels.com/photos/296234/pexels-photo-296234.jpeg',
  clearNight: 'https://images.pexels.com/photos/11752993/pexels-photo-11752993.jpeg',
  cloudyDay: 'https://images.pexels.com/photos/158163/clouds-cloudporn-weather-lookup-158163.jpeg',
  cloudyNight: 'https://www.pexels.com/photo/dramatic-storm-cloud-formation-at-dusk-29473893/',
  partlyCloudyDay: 'https://images.pexels.com/photos/13958707/pexels-photo-13958707.jpeg',
  partlyCloudyNight: 'https://images.pexels.com/photos/5489557/pexels-photo-5489557.jpeg',
  mistDay: 'https://images.pexels.com/photos/6745483/pexels-photo-6745483.jpeg',
  mistNight: 'https://images.pexels.com/photos/1529881/pexels-photo-1529881.jpeg',
  rainDay: 'https://images.pexels.com/photos/30345921/pexels-photo-30345921.jpeg',
  rainEvening: 'https://images.pexels.com/photos/8590614/pexels-photo-8590614.jpeg',
  rainNight: 'https://images.pexels.com/photos/850488/pexels-photo-850488.png',
  storm: 'https://images.pexels.com/photos/16218619/pexels-photo-16218619.jpeg',
  sunrise: 'https://images.pexels.com/photos/10248028/pexels-photo-10248028.jpeg',
  sunset: 'https://images.pexels.com/photos/539282/pexels-photo-539282.jpeg',
  drizzle: 'https://images.pexels.com/photos/804474/pexels-photo-804474.jpeg'
};

function Dashboard() {
  const navigate = useNavigate(); 
  const [bgImage, setBgImage] = useState('');
  
  // Weather & UI State
  const [weatherData, setWeatherData] = useState(null);
  const [weatherImage, setWeatherImage] = useState(weatherImages.clearDay); 
  const [globalSearch, setGlobalSearch] = useState('');
  
  // Location State
  const [userLocation, setUserLocation] = useState('Select Location'); 
  const [locationTitle, setLocationTitle] = useState('Home'); 
  const [showLocModal, setShowLocModal] = useState(false); 

  // --- INITIALIZATION & LISTENER ---
  useEffect(() => {
    const hour = new Date().getHours();
    setBgImage(hour >= 18 || hour < 6 
      ? 'https://images.unsplash.com/photo-1652454159675-11ead6275680?q=80&w=1170&auto=format&fit=crop' 
      : 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2940&auto=format&fit=crop');

    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            () => {}, 
            (error) => {
                console.warn("GPS is Off/Denied:", error.message);
                setShowLocModal(true);
            },
            { timeout: 4000 }
        );
    } else {
        setShowLocModal(true);
    }

    const loadData = () => {
        const savedLoc = localStorage.getItem('userLocation'); 
        const savedTitle = localStorage.getItem('locationTitle');
        const isValidLoc = savedLoc && savedLoc.replace(/, /g, '').trim().length > 0;

        if (!isValidLoc) {
            setShowLocModal(true);
            setUserLocation("Select Location");
        } else {
            setUserLocation(savedLoc);
            if(savedTitle) setLocationTitle(savedTitle); 
        }

        const lastWeatherCity = localStorage.getItem('farmBuddy_lastCity');
        if (lastWeatherCity) {
            const cityData = JSON.parse(lastWeatherCity);
            if (cityData.lat && cityData.lon) {
                fetchLiveWeather(`${cityData.lat},${cityData.lon}`);
            } else {
                fetchLiveWeather(cityData.name);
            }
        } else {
            const savedLat = localStorage.getItem('userLat');
            const savedLng = localStorage.getItem('userLng');
            if (savedLat && savedLng && savedLat !== 'undefined') {
                fetchLiveWeather(`${savedLat},${savedLng}`);
            } else if (savedLoc) {
                fetchLiveWeather(savedLoc);
            }
        }
    };

    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);

  }, []);

  const fetchLiveWeather = async (query) => {
      try {
          const apiKey = import.meta.env.VITE_WEATHER_KEY;
          if(!query || query.includes('undefined')) return;
          const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${query}&days=1&aqi=no&alerts=no`;
          const response = await axios.get(url);
          setWeatherData(response.data);
          setWeatherImage(getAssetLogic(response.data));
      } catch (err) { console.error("Weather Fetch Error:", err); }
  };

  const getAssetLogic = (data) => {
    const code = data.current.condition.code;
    const isDay = data.current.is_day === 1;
    const hour = new Date().getHours();
    
    // Storm
    if ([1087, 1273, 1276, 1279, 1282].includes(code)) return weatherImages.storm;
    
    // Rain/Drizzle
    if ([1063, 1150, 1153, 1180, 1183, 1186, 1189, 1240].includes(code)) {
        return isDay ? weatherImages.drizzle : weatherImages.rainNight;
    }
    
    // Heavy Rain
    if ([1192, 1195, 1198, 1201, 1243, 1246].includes(code)) {
        if (hour >= 16 && hour <= 19) return weatherImages.rainEvening;
        return isDay ? weatherImages.rainDay : weatherImages.rainNight;
    }
    
    // Mist/Fog
    if ([1030, 1135, 1147].includes(code)) return isDay ? weatherImages.mistDay : weatherImages.mistNight;
    
    // Cloudy
    if ([1006, 1009].includes(code)) return isDay ? weatherImages.cloudyDay : weatherImages.cloudyNight;
    
    // Partly Cloudy
    if (code === 1003) return isDay ? weatherImages.partlyCloudyDay : weatherImages.partlyCloudyNight;
    
    // Clear / Sun
    if (isDay) {
        if (hour === 6) return weatherImages.sunrise;
        if (hour >= 17 && hour <= 18) return weatherImages.sunset;
        return weatherImages.clearDay;
    } 
    return weatherImages.clearNight;
  };

  const handleLocationSelect = (title, fullAddress, lat, lng) => {
    setLocationTitle(title);
    setUserLocation(fullAddress);
    localStorage.setItem('userLocation', fullAddress);
    localStorage.setItem('locationTitle', title);
    if (lat && lng) {
      localStorage.setItem('userLat', lat);
      localStorage.setItem('userLng', lng);
      if (!localStorage.getItem('farmBuddy_lastCity')) {
          fetchLiveWeather(`${lat},${lng}`);
      }
    }
    setShowLocModal(false); 
  };

  const goToManagementPage = () => {
    navigate('/user-location');
  };

  return (
    <div style={{...pageStyle, backgroundImage: `url('${bgImage}')`}}>
      
      {/* 1. HEADER */}
      <div style={headerWrapper}>
        <div style={topRow}>
           <div style={locationClickableArea} onClick={goToManagementPage}>
              <div style={{display:'flex', alignItems:'center'}}>
                  <div style={{fontSize:'20px', fontWeight:'800', color:'white', textShadow:'0 2px 4px rgba(0,0,0,0.6)', textTransform:'capitalize'}}>
                      <span style={{color:'#ff5252', marginRight:'6px'}}>📍</span>{locationTitle} 
                  </div>
                  <ChevronDown size={20} color="white" style={{marginLeft:'2px', marginTop:'2px', opacity:0.9}} />
              </div>
              <div style={{
                  color:'rgba(255,255,255,0.85)', fontSize:'12px', marginTop:'2px', maxWidth:'280px', 
                  whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', textShadow:'0 1px 2px rgba(0,0,0,0.8)', fontWeight:'500', paddingLeft:'2px' 
              }}>
                {userLocation}
              </div>
           </div>
           <Link to="/profile" style={profileCircle}><span style={{fontSize:'24px'}}>🧢</span></Link>
        </div>
        
        <div style={searchBar}>
           <span style={{fontSize:'18px', color:'rgba(255,255,255,0.7)', marginRight:'10px'}}>🔍</span>
           <input type="text" placeholder="Search 'cotton', 'workers'..." style={searchInput} value={globalSearch} onChange={(e) => setGlobalSearch(e.target.value)} />
        </div>
      </div>

      <div style={heroSection}><h1 style={fadedHeroTitle}>Growing Smarter Together</h1></div>

      {/* 2. BENTO GRID */}
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

        <Link to="/expenditure" style={cardLink}>
           <div className="glass-card" style={{...cardStyle, backgroundImage: "url('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=1000')"}}>
              <div style={cardTopOverlay}>
                 <div><h3 style={{...cardTitle}}>Crop Exp.</h3><p style={cardSubtitle}>Track Expenses</p></div>
                 <div style={whiteIconBox}><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line></svg></div>
              </div>
           </div>
        </Link>

        <Link to="/radio" style={cardLink}>
           <div className="glass-card" style={{...cardStyle, backgroundImage: "url('https://images.unsplash.com/photo-1584677626993-e45f9e236592?q=80&w=600')"}}>
              <div style={cardTopOverlay}>
                 <div><h3 style={cardTitle}>Farm Radio</h3><p style={cardSubtitle}>News & Songs</p></div>
                 <div style={whiteIconBox}><Radio size={28} color="white"/></div>
              </div>
           </div>
        </Link>

        <Link to="/freelancing" style={cardLink}>
           <div className="glass-card" style={{...cardStyle, backgroundImage: "url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=600')"}}>
              <div style={cardTopOverlay}>
                 <div><h3 style={cardTitle}>Freelancing</h3><p style={cardSubtitle}>Hire & Work</p></div>
                 <div style={whiteIconBox}><Briefcase size={28} color="white"/></div>
              </div>
           </div>
        </Link>

        <Link to="/gps-measurement" style={cardLink}>
           <div className="glass-card" style={{...cardStyle, backgroundImage: "url('https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?q=80&w=600')"}}>
              <div style={cardTopOverlay}>
                 <div><h3 style={cardTitle}>GPS Area</h3><p style={cardSubtitle}>Measure Land</p></div>
                 <div style={whiteIconBox}><Map size={28} color="white"/></div>
              </div>
           </div>
        </Link>

        {/* --- ROW 5: Weather (Wide) --- */}
        <Link to="/weather" style={{...cardLink, gridColumn: 'span 2'}}>
           <div className="glass-card" style={{...wideCardStyle, position: 'relative', overflow: 'hidden'}}>
              
              {/* FIXED IMAGE STYLE FOR DASHBOARD */}
              <img 
                 src={weatherImage} 
                 alt="Weather Background" 
                 style={{
                     width: '100%',
                     height: '100%',
                     objectFit: 'cover',
                     position: 'absolute',
                     top: 0,
                     left: 0,
                     zIndex: -1 
                 }} 
               />
              
              <div style={darkOverlay}></div>
              <div style={cardTopOverlay}>
                  <div style={{display:'flex', flexDirection:'column', justifyContent:'space-between', height:'100%', width:'100%'}}>
                    <div style={{display:'flex', justifyContent:'space-between', width:'100%'}}>
                        <h3 style={{...cardTitle, margin:0, fontSize:'13px', opacity:0.8, textTransform:'uppercase'}}>Weather View</h3>
                        <div style={whiteIconBox}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M20 12h2"/><path d="m19.07 4.93-1.41 1.41"/><path d="M15.947 12.65a4 4 0 0 0-5.925-4.128"/><path d="M13 22H7a4 4 0 1 1 0-8h1"/></svg></div>
                    </div>
                    {weatherData ? (
                        <div style={{display:'flex', flexDirection:'column', marginTop:'10px'}}>
                            <div style={{fontSize:'22px', fontWeight:'700', lineHeight:'1.2'}}>
                                {weatherData.location.name}
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

      <BottomNavigation />

      {showLocModal && (
        <LocationSheet 
          onLocationSelect={handleLocationSelect} 
          onClose={() => setShowLocModal(false)} 
        />
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
const searchInput = { border: 'none', outline: 'none', background: 'transparent', fontSize: '16px', width: '100%', color: 'white', '::placeholder': { color: 'rgba(255,255,255,0.5)' } };
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
const darkOverlay = { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.3)', zIndex: 1 }; // Adjusted Z-index

export default Dashboard;