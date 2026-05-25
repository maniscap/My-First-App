import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import LocationSheet from '../../🔧components/LocationSheet'; 
import { ChevronDown, Radio, Map, Briefcase, TrendingUp, Newspaper, BookOpen, Rocket, Search } from 'lucide-react'; 
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';

// --- WEATHER IMAGE ASSETS (URLs) ---
const weatherImages = {
  clearDay: 'https://images.pexels.com/photos/296234/pexels-photo-296234.jpeg?auto=compress&cs=tinysrgb&w=600',
  clearNight: 'https://images.pexels.com/photos/11752993/pexels-photo-11752993.jpeg?auto=compress&cs=tinysrgb&w=600',
  cloudyDay: 'https://images.pexels.com/photos/158163/clouds-cloudporn-weather-lookup-158163.jpeg?auto=compress&cs=tinysrgb&w=600',
  cloudyNight: 'https://images.pexels.com/photos/29473893/pexels-photo-29473893.jpeg?auto=compress&cs=tinysrgb&w=600', 
  partlyCloudyDay: 'https://images.pexels.com/photos/13958707/pexels-photo-13958707.jpeg?auto=compress&cs=tinysrgb&w=600',
  partlyCloudyNight: 'https://images.pexels.com/photos/5489557/pexels-photo-5489557.jpeg?auto=compress&cs=tinysrgb&w=600',
  mistDay: 'https://images.pexels.com/photos/6745483/pexels-photo-6745483.jpeg?auto=compress&cs=tinysrgb&w=600',
  mistNight: 'https://images.pexels.com/photos/1529881/pexels-photo-1529881.jpeg?auto=compress&cs=tinysrgb&w=600',
  rainDay: 'https://images.pexels.com/photos/30345921/pexels-photo-30345921.jpeg?auto=compress&cs=tinysrgb&w=600',
  rainEvening: 'https://images.pexels.com/photos/8590614/pexels-photo-8590614.jpeg?auto=compress&cs=tinysrgb&w=600',
  rainNight: 'https://images.pexels.com/photos/850488/pexels-photo-850488.png?auto=compress&cs=tinysrgb&w=600',
  storm: 'https://images.pexels.com/photos/16218619/pexels-photo-16218619.jpeg?auto=compress&cs=tinysrgb&w=600',
  sunrise: 'https://images.pexels.com/photos/10248028/pexels-photo-10248028.jpeg?auto=compress&cs=tinysrgb&w=600',
  sunset: 'https://images.pexels.com/photos/539282/pexels-photo-539282.jpeg?auto=compress&cs=tinysrgb&w=600',
  drizzle: 'https://images.pexels.com/photos/804474/pexels-photo-804474.jpeg?auto=compress&cs=tinysrgb&w=600',
  defaultFallback: 'https://images.pexels.com/photos/1107717/pexels-photo-1107717.jpeg?auto=compress&cs=tinysrgb&w=600' 
};

// --- ADDED: SMART TEXT MATCHER AS SECONDARY FALLBACK ---
const getBackgroundImage = (conditionText) => {
  if (!conditionText) return weatherImages.defaultFallback;
  const text = conditionText.toLowerCase();
  
  if (text.includes('overcast') || text.includes('cloud')) return weatherImages.cloudyDay; 
  if (text.includes('rain') || text.includes('shower')) return weatherImages.rainDay;
  if (text.includes('drizzle')) return weatherImages.drizzle;
  if (text.includes('clear') || text.includes('sun')) return weatherImages.clearDay;
  if (text.includes('mist') || text.includes('fog')) return weatherImages.mistDay;
  if (text.includes('thunder') || text.includes('storm')) return weatherImages.storm;
  
  return weatherImages.defaultFallback;
};

// --- DYNAMIC THEME DEFINITIONS ---
const getThemeColors = (tab) => {
  if (tab === 'AgriInsights') return { 
    topHeader: '#38BDF8', 
    bottomMain: 'var(--bg-color)', 
    topImg: 'linear-gradient(180deg, #38BDF8 0%, #E0F2FE 100%)' 
  }; // Blue Sky & Green Trees Theme
  if (tab === 'Agri commerce') return { 
    topHeader: '#1A0B2E', 
    bottomMain: 'var(--bg-color)', 
    topImg: 'radial-gradient(circle at top right, rgba(120, 30, 200, 0.35), transparent 60%), radial-gradient(circle at bottom left, rgba(255, 107, 107, 0.15), transparent 60%)' 
  }; // Deep Space Nebula Theme
  if (tab === 'tools and utils') return { 
    topHeader: '#38bdf8', 
    bottomMain: 'var(--bg-color)', 
    topImg: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 100%)'
  }; // Realistic Sky Blue + White Atmospheric Haze
  return { topHeader: '#0F172A', bottomMain: 'var(--bg-color)', topImg: 'none' };
};

function Dashboard() {
  const navigate = useNavigate(); 
  
  // Weather & UI State
  const [weatherData, setWeatherData] = useState(null);
  const [weatherImage, setWeatherImage] = useState(weatherImages.clearDay); 
  
  // Location State
  const [userLocation, setUserLocation] = useState('Select Location'); 
  const [locationTitle, setLocationTitle] = useState('Home'); 
  const [showLocModal, setShowLocModal] = useState(false); 

  const [activeTab, setActiveTab] = useState(() => sessionStorage.getItem('dashboard_active_tab') || 'AgriInsights');
  const [direction, setDirection] = useState(1);
  const TABS = ['AgriInsights', 'Agri commerce', 'tools and utils'];
  const [searchVal, setSearchVal] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // --- INITIALIZATION & LISTENER (ZOMATO STYLE FIX) ---
  useEffect(() => {
    const loadData = () => {
        const savedLoc = localStorage.getItem('userLocation'); 
        const savedTitle = localStorage.getItem('locationTitle');
        const isSessionActive = sessionStorage.getItem('app_session_active'); 
        const hasValidSavedLoc = savedLoc && savedLoc.replace(/, /g, '').trim().length > 0;

        // 1. ALWAYS DEFAULT TO THE LAST SAVED ADDRESS IMMEDIATELY
        if (hasValidSavedLoc) {
            setUserLocation(savedLoc);
            if(savedTitle) setLocationTitle(savedTitle); 
        } else {
            setUserLocation("Select Location");
        }

        // 2. MODAL DISPLAY LOGIC (Only runs on fresh app open)
        if (!isSessionActive) {
            // Mark session as active so it NEVER prompts again when returning from other pages
            sessionStorage.setItem('app_session_active', 'true');

            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    () => {
                        // GPS is ON, keep modal closed
                        setShowLocModal(false);
                    }, 
                    (error) => {
                        // GPS is OFF. Show the modal because it's a fresh app open!
                        console.warn("GPS is Off/Denied:", error.message);
                        setShowLocModal(true);
                    },
                    { timeout: 4000 }
                );
            } else {
                setShowLocModal(true);
            }
        } else {
            // User is just returning from Agri-Insights/Features. KEEP MODAL CLOSED.
            setShowLocModal(false);
        }

        // 3. WEATHER FETCHING (Unchanged)
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

  // --- TAB & SWIPE LOGIC ---
  const changeTab = (newTab) => {
    const currentIndex = TABS.indexOf(activeTab);
    const newIndex = TABS.indexOf(newTab);
    setDirection(newIndex > currentIndex ? 1 : -1);
    setActiveTab(newTab);
    sessionStorage.setItem('dashboard_active_tab', newTab);
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      const idx = TABS.indexOf(activeTab);
      if (idx < TABS.length - 1) changeTab(TABS[idx + 1]);
    },
    onSwipedRight: () => {
      const idx = TABS.indexOf(activeTab);
      if (idx > 0) changeTab(TABS[idx - 1]);
    },
    trackMouse: true
  });

  const fetchLiveWeather = async (query) => {
      try {
          if(!query || query.includes('undefined')) return;
          
          const response = await axios.post('/api/Dashboard', {
              query: query,
              days: 1,
              aqi: 'no'
          });
          setWeatherData(response.data);
          
          const assetUrl = getAssetLogic(response.data) || getBackgroundImage(response.data.current.condition.text);
          setWeatherImage(assetUrl);
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

  const activeTheme = getThemeColors(activeTab);

  return (
    <div style={{...pageStyle, background: 'var(--theme-bottom-bg)', transition: 'background-color 0.5s ease', '--theme-bottom-bg': activeTheme.bottomMain, '--theme-top-bg': activeTheme.topHeader, '--theme-top-img': activeTheme.topImg}}>
      
      {/* 1. TOP SECTION (Dynamic Header) */}
      <div style={{...topSectionWrapper, backgroundColor: 'var(--theme-top-bg)', backgroundImage: 'var(--theme-top-img)', backgroundSize: 'cover', transition: 'background-color 0.5s ease'}}>
        
        {/* PURE CSS SKY ART */}
        <AnimatePresence>
          {activeTab === 'AgriInsights' && (
            <motion.div 
              key="agri-nature"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}
            >
               {/* Sun - Positioned on the right but spaced away from the profile icon */}
               <div className="css-sun" style={{ top: '25px', right: '25%' }}></div>

               {/* Clouds */}
               <div className="css-cloud" style={{ top: '25px', left: '20%', transform: 'scale(0.6)', opacity: 0.85 }}></div>
               
               {/* Elegant Rolling Farm Hills at the bottom */}
               <div className="css-hill" style={{ width: '600px', height: '200px', left: '-100px', bottom: '-120px', background: '#2E7D32', zIndex: 1 }}></div>
               <div className="css-hill" style={{ width: '500px', height: '180px', right: '-100px', bottom: '-100px', background: '#388E3C', zIndex: 2 }}></div>
               <div className="css-hill" style={{ width: '700px', height: '150px', left: '-150px', bottom: '-80px', background: '#4CAF50', zIndex: 3 }}></div>
            </motion.div>
          )}

          {activeTab === 'Agri commerce' && (
            <motion.div 
              key="deep-space"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}
            >
               <div className="css-star" style={{ top: '20px', left: '15%', animationDelay: '0s' }}></div>
               <div className="css-star" style={{ top: '50px', left: '30%', animationDelay: '1s' }}></div>
               <div className="css-star" style={{ top: '15px', right: '40%', animationDelay: '0.5s' }}></div>
               <div className="css-shooting-star" style={{ top: '10px', left: '50%', animationDelay: '0s' }}></div>
               <div className="css-shooting-star" style={{ top: '40px', right: '10%', animationDelay: '2s' }}></div>
               <div className="css-full-moon" style={{ top: '28px', right: '24%' }}></div>
            </motion.div>
          )}

          {activeTab === 'tools and utils' && (
            <motion.div 
              key="day-sky"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}
            >
               <div className="css-cloud" style={{ top: '30px', right: '15%', transform: 'scale(0.8)', opacity: 0.9 }}></div>
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{...topSectionOverlay, position: 'relative', zIndex: 1}}>
          {/* HEADER */}
          <div style={headerWrapper}>
            <div style={topRow}>
               <div style={locationClickableArea} onClick={goToManagementPage}>
                  <div style={{display:'flex', alignItems:'center'}}>
                      <div style={{fontSize:'20px', fontWeight:'900', color: '#ffffff', textTransform:'capitalize', transition: 'color 0.5s ease'}}>
                          <span style={{color:'#ff5252', marginRight:'6px'}}>📍</span>{locationTitle} 
                      </div>
                      <ChevronDown size={20} color="#ffffff" style={{marginLeft:'2px', marginTop:'2px', opacity:0.9, transition: 'color 0.5s ease'}} />
                  </div>
                  <div style={{
                      color: 'rgba(255,255,255,0.8)', fontSize:'13px', marginTop:'2px', maxWidth:'280px', 
                      whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', fontWeight:'600', paddingLeft:'2px', transition: 'color 0.5s ease'
                  }}>
                    {userLocation}
                  </div>
               </div>
               <Link to="/profile" style={profileCircle}><span style={{fontSize:'24px'}}>🧢</span></Link>
            </div>
          </div>
        </div>

        {/* BROWSER-LIKE TABS */}
        <div style={{ paddingTop: '8px', paddingBottom: '0', position: 'relative', zIndex: 1 }}>
          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@700;800;900&display=swap');
            .css-cloud {
              position: absolute;
              width: 120px;
              height: 35px;
              background: #ffffff;
              border-radius: 50px;
              box-shadow: inset 0px -4px 6px rgba(0,0,0,0.05);
            }
            .css-cloud::before, .css-cloud::after {
              content: '';
              position: absolute;
              background: #ffffff;
              border-radius: 50%;
            }
            .css-cloud::before {
              width: 60px;
              height: 60px;
              top: -30px;
              left: 20px;
              box-shadow: inset 2px 4px 6px rgba(255,255,255,0.8);
            }
            .css-cloud::after {
              width: 45px;
              height: 45px;
              top: -15px;
              right: 15px;
            }
            .css-star {
              position: absolute;
              width: 3px; height: 3px;
              background: #ffffff;
              border-radius: 50%;
              box-shadow: 0 0 6px #ffffff;
              animation: twinkle 2s infinite ease-in-out alternate;
              will-change: transform, opacity;
            }
            @keyframes twinkle {
              0% { opacity: 0.3; transform: scale(0.8); }
              100% { opacity: 1; transform: scale(1.2); }
            }
            .css-sun {
              position: absolute;
              width: 36px; height: 36px;
              border-radius: 50%;
              background: #FDE047;
              box-shadow: 0 0 20px rgba(253, 224, 71, 0.8);
              opacity: 0.9;
            }
            .css-hill {
              position: absolute;
              border-radius: 50%;
              box-shadow: inset 0px 8px 16px rgba(255,255,255,0.15);
            }
            .css-full-moon {
              position: absolute;
              width: 36px; height: 36px;
              border-radius: 50%;
              background: #E9D5FF;
              box-shadow: 0 0 15px 2px rgba(233, 213, 255, 0.5);
              opacity: 0.9;
            }
            .css-shooting-star {
              position: absolute;
              width: 40px; height: 2px;
              background: linear-gradient(90deg, rgba(255,255,255,0.8), transparent);
              border-radius: 50%;
              animation: shoot 4s infinite linear;
              will-change: transform, opacity;
            }
            @keyframes shoot {
              0% { transform: translateX(0) translateY(0) rotate(-35deg); opacity: 1; }
              20% { transform: translateX(-150px) translateY(100px) rotate(-35deg); opacity: 0; }
              100% { transform: translateX(-150px) translateY(100px) rotate(-35deg); opacity: 0; }
            }
            .active-tab-bg {
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: var(--theme-bottom-bg);
              border-radius: 16px 16px 0 0;
              z-index: 0;
              transition: background-color 0.5s ease;
            }
            .active-tab-bg::before {
              content: "";
              position: absolute;
              left: -16px;
              bottom: 0;
              width: 16px;
              height: 16px;
              border-bottom-right-radius: 16px;
              box-shadow: 10px 10px 0 10px var(--theme-bottom-bg);
              pointer-events: none;
              transition: box-shadow 0.5s ease;
            }
            .active-tab-bg::after {
              content: "";
              position: absolute;
              right: -16px;
              bottom: 0;
              width: 16px;
              height: 16px;
              border-bottom-left-radius: 16px;
              box-shadow: -10px 10px 0 10px var(--theme-bottom-bg);
              pointer-events: none;
              transition: box-shadow 0.5s ease;
            }
          `}</style>
          <div style={tabCardsContainer}>
            {TABS.map(tab => {
              const isActive = activeTab === tab;
              const tabName = tab === 'AgriInsights' ? '🌱 Insights' : tab === 'Agri commerce' ? '🛒 Commerce' : '🔧 Tools';
              
              return (
                <button 
                  key={tab}
                  onClick={() => changeTab(tab)} 
                  style={{
                    flex: 1,
                    height: '70px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: 'none',
                    outline: 'none',
                    fontFamily: '"Fredoka One", cursive',
                    position: 'relative',
                    background: 'transparent',
                    padding: 0,
                    WebkitTapHighlightColor: 'transparent',
                    zIndex: isActive ? 10 : 1
                  }}
                >
                  {/* INACTIVE BACKGROUND (Isolated layer, strictly smaller to give the float effect) */}
                <div style={{ position: 'absolute', top: '10px', left: 0, right: 0, bottom: '8px', background: 'var(--card-color)', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', opacity: isActive ? 0 : 1, transition: 'opacity 0.3s ease', zIndex: 0 }} />

                  {/* ACTIVE BACKGROUND (FRAMER MOTION) */}
                  {isActive && <motion.div layoutId="activeTabIndicator" className="active-tab-bg" transition={{ type: "spring", stiffness: 300, damping: 30 }} />}

                  {/* TEXT CONTENT */}
                  <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: '1.1', position: 'relative', zIndex: 1, marginTop: isActive ? '2px' : '-2px' }}>
                     <span style={getTopTextStyle(tab, isActive)}>Agri</span>
                     <span style={getBottomTextStyle(tab, isActive)}>{tabName}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. BOTTOM CONTENT AREA (Browser Window) */}
      <div style={{...bottomContentContainer, background: 'var(--theme-bottom-bg)', transition: 'background-color 0.5s ease'}}>
        {/* CUSTOM MULTI-COLOR SEARCH BAR */}
        <div style={{ padding: '24px 10px 24px 10px', maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', background: 'var(--card-color)', borderRadius: '16px', padding: '10px 16px', border: '1px solid var(--border-color)', boxShadow: '0 6px 16px rgba(0, 0, 0, 0.05)', color: 'var(--text-color)', width: '85%', maxWidth: '400px' }}>
             <Search size={20} color="var(--subtle-text)" style={{marginRight: '10px'}} />
             <input 
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-color)', fontSize: '15px', position: 'relative', zIndex: 2, padding: 0, fontWeight: '600' }}
             />
             {(!isSearchFocused && searchVal === '') && (
               <div style={{ position: 'absolute', left: '48px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: '15px', fontWeight: '800', zIndex: 1, color: '#777', whiteSpace: 'nowrap' }}>
                 Search for <span style={{color: '#EA580C'}}>Summer</span> <span style={{color: '#06B6D4'}}>Cool</span>
               </div>
             )}
          </div>
        </div>

        {/* SWIPEABLE BENTO GRID AREA */}
        <div {...swipeHandlers} style={{ overflowX: 'hidden', width: '100%', minHeight: '350px' }}>
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, x: direction * 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -30 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              style={bentoGrid}
            >

        {activeTab === 'AgriInsights' && (
          <>
            <Link to="/market-rates" style={cardLink}>
               <div className="glass-card" style={{...cardStyle, backgroundImage: "url('https://img.freepik.com/premium-photo/graph-with-green-arrow-pointing-up-top-it_884497-464.jpg')"}}>
                  <div style={cardTopOverlay}>
                     <div><h3 style={cardTitle}>Market Pulse</h3><p style={cardSubtitle}>Mandi Rates</p></div>
                     <div style={whiteIconBox}><TrendingUp size={28} color="white"/></div>
                  </div>
               </div>
            </Link>

            <Link to="/NewsUpdates" style={cardLink}>
               <div className="glass-card" style={{...cardStyle, backgroundImage: "url('https://static.vecteezy.com/system/resources/previews/011/643/706/non_2x/business-newspaper-isolated-on-white-background-daily-newspaper-mock-up-concept-photo.jpg')"}}>
                  <div style={cardTopOverlay}>
                     <div><h3 style={cardTitle}>Agri News</h3><p style={cardSubtitle}>Daily Updates</p></div>
                     <div style={whiteIconBox}><Newspaper size={28} color="white"/></div>
                  </div>
               </div>
            </Link>

            <Link to="/library" style={cardLink}>
               <div className="glass-card" style={{...cardStyle, backgroundImage: "url('https://static.vecteezy.com/system/resources/thumbnails/023/256/819/small_2x/happy-farmer-is-standing-in-his-pepper-plantation-photo.jpg')"}}>
                  <div style={cardTopOverlay}>
                     <div><h3 style={cardTitle}>Library</h3><p style={cardSubtitle}>Expert Guides</p></div>
                     <div style={whiteIconBox}><BookOpen size={28} color="white"/></div>
                  </div>
               </div>
            </Link>

            <Link to="/modern-tech" style={cardLink}>
               <div className="glass-card" style={{...cardStyle, backgroundImage: "url('https://img.freepik.com/premium-photo/smart-agriculture-specialist-monitoring-drone-data_1280275-166272.jpg')"}}>
                  <div style={cardTopOverlay}>
                     <div><h3 style={cardTitle}>Modern Tech</h3><p style={cardSubtitle}>Drones & AI</p></div>
                     <div style={whiteIconBox}><Rocket size={28} color="white"/></div>
                  </div>
               </div>
            </Link>
          </>
        )}

        {activeTab === 'Agri commerce' && (
          <>
            <Link to="/freelancing" style={cardLink}>
               <div className="glass-card" style={{...cardStyle, backgroundImage: "url('https://img.freepik.com/premium-photo/farmers-shake-hands-cornfield-partnership-agreement_875825-141614.jpg')"}}>
                  <div style={cardTopOverlay}>
                     <div><h3 style={cardTitle}>Freelancing</h3><p style={cardSubtitle}>Hire Professionals & Experts</p></div>
                     <div style={whiteIconBox}><Briefcase size={28} color="white"/></div>
                  </div>
               </div>
            </Link>

            <Link to="/rent-machinery" style={cardLink}>
               <div className="glass-card" style={{...cardStyle, backgroundImage: "url('https://img.freepik.com/premium-photo/tractor-watering-tractor-spraying-field-farm-landscape-agricultural-beautiful-countryside_114016-69.jpg')"}}>
                  <div style={cardTopOverlay}>
                     <div><h3 style={cardTitle}>Hire Machinery</h3><p style={cardSubtitle}>Tractors & Tools</p></div>
                     <div style={whiteIconBox}><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h3l1-3h4l1 3h8"/><circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="M15 5h4l2 7h-6z"/></svg></div>
                  </div>
               </div>
            </Link>

            <Link to="/business" style={cardLink}>
               <div className="glass-card" style={{...cardStyle, backgroundImage: "url('https://www.deere.ca/assets/images/region-4/products/harvesting/cornhead-R4A057928_RRD_1-1920x1080.jpg')"}}>
                  <div style={cardTopOverlay}>
                     <div><h3 style={cardTitle}>Business Zone</h3><p style={cardSubtitle}>Buy Harvest</p></div>
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

            <Link to="/hire-workers" style={cardLink}>
               <div className="glass-card" style={{...cardStyle, backgroundImage: "url('https://th.bing.com/th/id/R.e2c73dbf8a8f512a95ee3a2ec35f5d72?rik=DuUew48QLbwHzw&riu=http%3a%2f%2fvnmanpower.com%2fupload_images%2fimages%2fall%2ffarm-workers-from-vmst.jpg&ehk=s1NXBhEe0wVXkZGBnlrnXcEoGY1R4UtFvQ9kW7HVQ0Y%3d&risl=&pid=ImgRaw&r=0')"}}>
                  <div style={cardTopOverlay}>
                     <div><h3 style={cardTitle}>Hire Workers</h3><p style={cardSubtitle}>Farm Labor</p></div>
                     <div style={whiteIconBox}><Briefcase size={28} color="white"/></div>
                  </div>
               </div>
            </Link>
          </>
        )}

        {activeTab === 'tools and utils' && (
          <>
            <Link to="/expenditure" style={cardLink}>
               <div className="glass-card" style={{...cardStyle, backgroundImage: "url('https://img.freepik.com/premium-photo/agronomist-with-tablet-taking-sample-his-crops-ar-23-v-61-job-id-619beb4c01e54b488b59fcdc87c74efc_1204450-66335.jpg')"}}>
                  <div style={cardTopOverlay}>
                     <div><h3 style={{...cardTitle}}>Crop Exp.</h3><p style={cardSubtitle}>Track Expenses</p></div>
                     <div style={whiteIconBox}><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line></svg></div>
                  </div>
               </div>
            </Link>

            <Link to="/gps-measurement" style={cardLink}>
               <div className="glass-card" style={{...cardStyle, backgroundImage: "url('https://static.eos.com/wp-content/uploads/2021/06/interface-tablet.jpg')"}}>
                  <div style={cardTopOverlay}>
                     <div><h3 style={cardTitle}>GPS Area</h3><p style={cardSubtitle}>Measure Land</p></div>
                     <div style={whiteIconBox}><Map size={28} color="white"/></div>
                  </div>
               </div>
            </Link>

            <Link to="/radio" style={cardLink}>
               <div className="glass-card" style={{...cardStyle, backgroundImage: "url('https://images.unsplash.com/photo-1478737270239-2f02b77fc618?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')"}}>
                  <div style={cardTopOverlay}>
                     <div><h3 style={cardTitle}>Farm Radio</h3><p style={cardSubtitle}>News & Songs</p></div>
                     <div style={whiteIconBox}><Radio size={28} color="white"/></div>
                  </div>
               </div>
            </Link>
          </>
        )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 4. WEATHER BANNER (Always Visible) */}
      <div style={weatherContainer}>
        <Link to="/weather" style={{...cardLink, display: 'block'}}>
           <div className="glass-card" style={{...wideCardStyle, position: 'relative', overflow: 'hidden'}}>
              
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
      </div>

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
const pageStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'var(--bg-color)', backgroundSize: 'cover', backgroundPosition: 'center', overflowY: 'auto', touchAction: 'pan-y', overscrollBehavior: 'none' };
const topSectionWrapper = { position: 'relative', paddingBottom: 0 };
const topSectionOverlay = { paddingTop: 'env(safe-area-inset-top)', paddingBottom: '0' };
const headerWrapper = { padding: '25px 20px 10px 20px' };
const topRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' };
const locationClickableArea = { display:'flex', flexDirection:'column', justifyContent:'center', cursor: 'pointer' };
const profileCircle = { width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(0,0,0,0.05)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', border: '1px solid rgba(0,0,0,0.1)' };
const tabCardsContainer = { display: 'flex', gap: '10px', padding: '0 10px', maxWidth: '1000px', margin: '0 auto', alignItems: 'flex-end' };
const inactiveCardTabStyle = { flex: 1, height: '75px', background: 'var(--card-color)', color: 'var(--text-color)', border: '2px solid transparent', borderRadius: '20px', padding: '8px 4px', cursor: 'pointer', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', whiteSpace: 'normal', lineHeight: '1.2', transition: 'all 0.3s ease', boxShadow: 'none' };
const bottomContentContainer = { background: 'var(--bg-color)', flex: 1, minHeight: '60vh', paddingTop: '0', position: 'relative', zIndex: 9 };
const bentoGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: '0 10px 24px 10px', maxWidth: '1000px', margin: '0 auto' };
const cardLink = { textDecoration: 'none', color: 'white', display: 'block', width: '100%', height: '100%' };
const cardStyle = { borderRadius: '18px', height: '185px', position: 'relative', overflow: 'hidden', backgroundSize: 'cover', backgroundPosition: 'center', border: '1px solid rgba(255,255,255,0.15)' };
const wideCardStyle = { gridColumn: 'span 2', height: '180px', borderRadius: '18px', position: 'relative', overflow: 'hidden', backgroundSize: 'cover', backgroundPosition: 'center', border: '1px solid rgba(255,255,255,0.15)' };
const cardTopOverlay = { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', padding: '15px', background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.05) 100%)', color: 'white', textAlign: 'left', boxSizing: 'border-box', zIndex: 1 };
const whiteIconBox = { filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' };
const cardTitle = { margin: '0 0 4px 0', fontSize: '17px', fontWeight: '700', textShadow: '0 2px 6px rgba(0,0,0,0.8)' };
const cardSubtitle = { margin: 0, fontSize: '13px', opacity: 0.9, fontWeight: '500', textShadow: '0 1px 4px rgba(0,0,0,0.8)' };
const darkOverlay = { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.15)', zIndex: 1 }; 
const weatherContainer = { padding: '0 10px 100px 10px', maxWidth: '1000px', margin: '0 auto' };

const getTopTextStyle = (tab, isActive) => {
  return {
    color: 'var(--subtle-text)', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', transition: 'color 0.5s ease',
    fontFamily: '"Nunito", sans-serif'
  };
};

const getBottomTextStyle = (tab, isActive) => {
  return {
    color: 'var(--text-color)',
    fontSize: isActive ? '18px' : '15px', fontWeight: 'normal', letterSpacing: '0.5px', 
    transition: 'all 0.5s ease',
    textShadow: 'none'
  };
};

export default Dashboard;