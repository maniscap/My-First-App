import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import LocationSheet from '../../🔧Consumer_Components/LocationSheet';
import { ChevronDown, Radio, Map, Briefcase, TrendingUp, Newspaper, BookOpen, Rocket, Search, Tractor, IndianRupee, ShoppingBasket, FileText, CloudSun } from 'lucide-react'; 
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import { BannerWidget } from './BannerPromo';

// --- WEATHER IMAGE ASSETS (URLs) ---
const weatherImages = {
  clearDay: '/assets/images/weather_clearDay.webp',
  clearNight: '/assets/images/weather_clearNight.webp',
  cloudyDay: '/assets/images/weather_cloudyDay.webp',
  cloudyNight: '/assets/images/weather_cloudyNight.webp', 
  partlyCloudyDay: '/assets/images/weather_partlyCloudyDay.webp',
  partlyCloudyNight: '/assets/images/weather_partlyCloudyNight.webp',
  mistDay: '/assets/images/weather_mistDay.webp',
  mistNight: '/assets/images/weather_mistNight.webp',
  rainDay: '/assets/images/weather_rainDay.webp',
  rainEvening: '/assets/images/weather_rainEvening.webp',
  rainNight: '/assets/images/weather_rainNight.webp',
  storm: '/assets/images/weather_storm.webp',
  sunrise: '/assets/images/weather_sunrise.webp',
  sunset: '/assets/images/weather_sunset.webp',
  drizzle: '/assets/images/weather_drizzle.webp',
  defaultFallback: '/assets/images/weather_defaultFallback.webp' 
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

// --- STATIC CSS BLOCK TO PREVENT RE-RENDERS ---
const ConsumerGlobalStyles = (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@700;800;900&display=swap');
    
    /* --- NEW SUNNY DAY PREMIUM DESIGN --- */
    .sky-header {
      position: absolute;
      top: 0; left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(150deg, #1ea2ff 0%, #7ed3ff 45%, #d0f0ff 100%);
      overflow: hidden;
      isolation: isolate;
    }

    /* --- WINTER THEME (Tools & Utils) --- */
    .winter-svg-bg {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      z-index: 2;
      opacity: 0.95;
    }

    @keyframes bokeh-drift {
      0% { transform: translate(0, 0) scale(1); opacity: 0.6; }
      100% { transform: translate(-10px, 10px) scale(1.05); opacity: 0.9; }
    }
    .sun-core {
      position: absolute;
      top: 20px;
      right: 120px;
      width: 35px;
      height: 35px;
      background: #ffffff;
      border-radius: 50%;
      filter: none;
      box-shadow: 0 0 20px 8px rgba(255, 255, 255, 1), 0 0 40px 15px rgba(255, 255, 255, 0.5);
      mix-blend-mode: screen;
      animation: sun-breathe 4s ease-in-out infinite;
      z-index: 10;
    }
    .sun-halo {
      position: absolute;
      top: 15px;
      right: 115px;
      width: 45px;
      height: 45px;
      background: rgba(255, 255, 255, 0.7);
      border-radius: 50%;
      filter: blur(8px);
      mix-blend-mode: screen;
      animation: sun-breathe 5s ease-in-out infinite;
    }
    .sun-ambient {
      position: absolute;
      top: 5px;
      right: 105px;
      width: 65px;
      height: 65px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      filter: blur(15px);
      mix-blend-mode: overlay;
    }
    .bokeh {
      position: absolute;
      border-radius: 50%;
      pointer-events: none;
      mix-blend-mode: screen;
      animation: bokeh-drift 8s ease-in-out infinite alternate;
    }
    .bokeh-1 {
      top: 30px; right: 140px;
      width: 45px; height: 45px;
      background: rgba(255, 255, 255, 0.08);
      border: 1.5px solid rgba(255, 255, 255, 0.25);
      filter: blur(0.5px);
    }
    .bokeh-2 {
      top: 50px; right: 160px;
      width: 30px; height: 30px;
      background: rgba(255, 255, 255, 0.15);
      border: 1.5px solid rgba(255, 255, 255, 0.25);
      filter: blur(0.5px);
      animation-delay: -2s;
    }
    .bokeh-3 {
      top: 70px; right: 180px;
      width: 20px; height: 20px;
      background: rgba(255, 255, 255, 0.25);
      border: 1.5px solid rgba(255, 255, 255, 0.35);
      animation-delay: -4s;
    }
    .bokeh-4 {
      top: 90px; right: 200px;
      width: 15px; height: 15px;
      background: rgba(255, 255, 255, 0.4);
      box-shadow: 0 0 6px rgba(255, 255, 255, 0.7);
      animation-delay: -6s;
    }
    .bokeh-5 {
      top: 5px; right: 105px;
      width: 80px; height: 80px;
      border: 2.5px solid rgba(255, 255, 255, 0.08);
      background: transparent;
      animation-delay: -1s;
    }
    .real-bird {
      background-image: url('https://s3-us-west-2.amazonaws.com/s.cdpn.io/174479/bird-cells-new.svg');
      background-size: auto 100%;
      width: 88px;
      height: 125px;
      will-change: background-position;
      animation-name: fly-cycle;
      animation-timing-function: steps(10);
      animation-iteration-count: infinite;
    }
    @keyframes fly-cycle {
      100% {
        background-position: -900px 0;
      }
    }
    .content {
      position: relative;
      z-index: 10;
    }
    /* ------------------------------------ */

    .css-star {
      position: absolute;
      width: 3px; height: 3px;
      background: #ffffff;
      border-radius: 50%;
      box-shadow: 0 0 8px 2px rgba(255,255,255,0.8);
      animation: twinkle 2s infinite ease-in-out alternate;
    }
    @keyframes twinkle {
      0% { opacity: 0.2; transform: scale(0.5); box-shadow: 0 0 2px rgba(255,255,255,0.2); }
      100% { opacity: 1; transform: scale(1.2); box-shadow: 0 0 12px 3px rgba(255,255,255,1); }
    }
    .css-sun {
      position: absolute;
      width: 50px; height: 50px;
      border-radius: 50%;
      background: linear-gradient(135deg, #FFFBEB 0%, #FDE047 100%);
      box-shadow: 0 0 40px 10px rgba(253, 224, 71, 0.6), 0 0 80px 30px rgba(253, 224, 71, 0.3);
      animation: sun-pulse 4s infinite alternate ease-in-out;
    }
    @keyframes sun-pulse {
      0% { box-shadow: 0 0 40px 10px rgba(253, 224, 71, 0.6), 0 0 80px 30px rgba(253, 224, 71, 0.3); }
      100% { box-shadow: 0 0 50px 15px rgba(253, 224, 71, 0.8), 0 0 100px 40px rgba(253, 224, 71, 0.4); }
    }
    .css-hill {
      position: absolute;
      border-radius: 50%;
    }

    /* --- WORLD-CLASS CINEMATIC NIGHT SKY ARCHITECTURE --- */
    
    /* 1. NEBULAS / ATMOSPHERIC GLOW */
    .cine-nebula {
      position: absolute; border-radius: 50%; filter: blur(60px); 
      opacity: 0.3; mix-blend-mode: screen; pointer-events: none;
      animation: cine-breathe 12s ease-in-out infinite alternate;
    }
    .purple-nebula { top: -20%; left: 0%; width: 70vw; height: 50vh; background: rgba(45, 16, 91, 0.2); }
    .blue-nebula { bottom: 10%; right: -10%; width: 80vw; height: 60vh; background: rgba(7, 82, 116, 0.15); animation-delay: -6s; }
    @keyframes cine-breathe { 0% { opacity: 0.3; transform: scale(0.9); } 100% { opacity: 0.7; transform: scale(1.1); } }

    /* 2. STAR SHAPES */
    .night-star-shape {
      position: absolute;
      color: white;
      text-shadow: 0 0 8px rgba(255, 255, 255, 0.8);
    }
    .twinkling {
      animation: twinkle-star-shape 3s infinite ease-in-out alternate;
    }
    .glowing {
      opacity: 0.8;
    }
    @keyframes twinkle-star-shape {
      0% { opacity: 0.1; transform: scale(0.6); }
      100% { opacity: 1; transform: scale(1.2); text-shadow: 0 0 12px rgba(255, 255, 255, 1); }
    }

    /* 3. RADIANT POETIC MOON */
    .cine-moon-wrapper {
      position: absolute; top: 15%; right: 22%; width: 45px; height: 45px;
    }
    .cine-moon {
      width: 100%; height: 100%; border-radius: 50%;
      background: radial-gradient(circle at 35% 35%, #FFF9E6 0%, #FFF5CD 60%, #d4c89a 100%);
      box-shadow: 0 0 6px 1px rgba(255, 249, 230, 0.1), inset -3px -3px 8px rgba(0, 0, 0, 0.4), inset 2px 2px 6px rgba(255, 249, 230, 0.8);
      position: relative; z-index: 2;
    }
    .cine-moon-halo {
      position: absolute; top: -15%; left: -15%; width: 130%; height: 130%;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255, 249, 230, 0.05) 0%, transparent 60%);
      filter: blur(4px); z-index: 1;
      animation: cine-halo-pulse 6s ease-in-out infinite alternate;
    }
    @keyframes cine-halo-pulse { 0% { transform: scale(0.95); opacity: 0.8; } 100% { transform: scale(1.05); opacity: 1; } }
    
    /* 4. HIGH-VELOCITY SHOOTING STARS */
    .cine-shooting-star {
      position: absolute; width: 120px; height: 1.5px;
      transform: rotate(-45deg); opacity: 0;
    }
    .streak-1 { 
      top: 15%; right: 25%; animation: cine-shoot 7s linear infinite; animation-delay: 1s; 
      background: linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(56, 189, 248, 0.8) 30%, transparent 100%);
      filter: drop-shadow(0 0 6px rgba(56, 189, 248, 0.8));
    }
    .streak-2 { 
      top: 40%; right: 5%; animation: cine-shoot 10s linear infinite; animation-delay: 4.5s; 
      background: linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(253, 224, 71, 0.8) 30%, transparent 100%);
      filter: drop-shadow(0 0 8px rgba(253, 224, 71, 0.6));
    }
    .streak-3 { 
      top: 5%; right: 50%; animation: cine-shoot 15s linear infinite; animation-delay: 9s; transform: rotate(-45deg) scale(0.7); 
      background: linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(255, 255, 255, 0.5) 30%, transparent 100%);
      filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.6));
    }
    @keyframes cine-shoot {
       0% { transform: translate(0, 0) rotate(-45deg) scale(0); opacity: 0; }
       2% { opacity: 1; transform: translate(-30px, 30px) rotate(-45deg) scale(1); }
       10% { opacity: 0; transform: translate(-250px, 250px) rotate(-45deg) scale(0.2); }
       100% { opacity: 0; }
    }

    /* 5. LIGHT DARK CLOUDS */
    .cine-dark-cloud {
      position: absolute;
      background: radial-gradient(ellipse at center, #375A6C 0%, #1C3B4D 60%, transparent 100%);
      border-radius: 50px;
      filter: blur(12px);
      opacity: 0.85;
      z-index: 1;
      pointer-events: none;
    }

    /* 6. ETHEREAL HORIZON MIST */
    .cine-mist { 
      position: absolute; bottom: 0; left: -25%; width: 150%; height: 120px; 
      filter: blur(40px); pointer-events: none;
      animation: cine-mist-drift 25s ease-in-out infinite alternate; 
    }
    .back-mist { bottom: -20px; background: rgba(56, 189, 248, 0.05); z-index: 1; }
    .front-mist { bottom: -40px; background: rgba(226, 232, 240, 0.02); z-index: 3; animation-duration: 35s; animation-direction: alternate-reverse; }
    @keyframes cine-mist-drift {
       0% { transform: translateX(-5%); }
       100% { transform: translateX(5%); }
    }

    .active-tab-bg {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: var(--active-tab-gradient);
      border-radius: 16px 16px 0 0;
      z-index: 0;
      transition: background 0.6s cubic-bezier(0.25, 1, 0.5, 1), background-color 0.6s cubic-bezier(0.25, 1, 0.5, 1);
    }
    .active-tab-bg::before {
      content: "";
      position: absolute;
      left: -16px;
      bottom: 0;
      width: 16px;
      height: 16px;
      border-bottom-right-radius: 16px;
      box-shadow: 10px 10px 0 10px var(--active-tab-solid-color);
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
      box-shadow: -10px 10px 0 10px var(--active-tab-solid-color);
      pointer-events: none;
      transition: box-shadow 0.5s ease;
    }
  `}</style>
);

// --- DYNAMIC THEME DEFINITIONS ---
const getThemeColors = (tab) => {
  if (tab === 'AgriInsights') return { 
    topHeader: '#0EA5E9', 
    bottomMain: 'var(--bg-color)', 
    topImg: 'linear-gradient(180deg, #0EA5E9 0%, #38BDF8 40%, #BAE6FD 100%)',
    tabGradient: '#0EA5E9',
    tabColor: '#0EA5E9'
  }; // Vibrant Sky Blue Theme
  if (tab === 'Agri commerce') return { 
    topHeader: '#000000', 
    bottomMain: 'var(--bg-color)', 
    topImg: 'linear-gradient(180deg, #000000 0%, #020202 50%, #050505 100%)',
    tabGradient: '#0B0F19',
    tabColor: '#0B0F19'
  }; // Night Sky Theme
  if (tab === 'tools and utils') return { 
    topHeader: '#022C22', 
    bottomMain: 'var(--bg-color)', 
    topImg: 'linear-gradient(180deg, #1E3A8A 0%, #064E3B 60%, #022C22 100%)',
    tabGradient: '#022C22',
    tabColor: '#022C22'
  }; 
  return { 
    topHeader: '#0F172A', 
    bottomMain: 'var(--bg-color)', 
    topImg: 'none',
    tabGradient: '#1A2E26',
    tabColor: '#1A2E26'
  };
};

function Consumer_HomePage() {
  const navigate = useNavigate(); 
  
  // Weather & UI State
  const [weatherData, setWeatherData] = useState(null);
  const [weatherImage, setWeatherImage] = useState(weatherImages.clearDay); 
  const [weatherStatus, setWeatherStatus] = useState('loading'); // 'live' | 'cached' | 'offline' | 'demo'
  
  // Location State
  const [userLocation, setUserLocation] = useState('Select Location'); 
  const [locationTitle, setLocationTitle] = useState('Home'); 
  const [showLocModal, setShowLocModal] = useState(false); 

  const [activeTab, setActiveTab] = useState(() => sessionStorage.getItem('Consumer_HomePage_active_tab') || 'AgriInsights');
  const [direction, setDirection] = useState(1);
  const TABS = ['AgriInsights', 'Agri commerce', 'tools and utils'];
  const [searchVal, setSearchVal] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const isValidWeatherData = (data) => {
    return !!(data && data.location && data.current && data.current.condition && data.forecast && data.forecast.forecastday && data.forecast.forecastday[0] && data.forecast.forecastday[0].day);
  };

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

        // Load Cached Weather Data Immediately for Instant Rendering & Zero Spinner UX
        const cached = localStorage.getItem('farmBuddy_cachedHomePageWeather');
        const cachedTime = localStorage.getItem('farmBuddy_cachedHomePageWeatherTime');
        let useCacheOnly = false;

        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                if (isValidWeatherData(parsed)) {
                    setWeatherData(parsed);
                    setWeatherStatus('cached');
                    const assetUrl = getAssetLogic(parsed) || getBackgroundImage(parsed.current.condition.text);
                    setWeatherImage(assetUrl);

                    if (cachedTime) {
                        const diffMins = (new Date() - new Date(cachedTime)) / 60000;
                        if (diffMins < 30) {
                            useCacheOnly = true; // Data is fresh, don't spam the API
                        }
                    }
                }
            } catch(e) {
                console.error("Error loading cached home weather", e);
            }
        }

        if (useCacheOnly) return; // Exit early to prevent infinite loops

        // 3. WEATHER FETCHING
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
    // Intentionally omitting 'storage' event listener for loadData to prevent cross-tab infinite API ping-pong loop.

  }, []);

  // --- TAB & SWIPE LOGIC ---
  const changeTab = (newTab) => {
    const currentIndex = TABS.indexOf(activeTab);
    const newIndex = TABS.indexOf(newTab);
    setDirection(newIndex > currentIndex ? 1 : -1);
    setActiveTab(newTab);
    sessionStorage.setItem('Consumer_HomePage_active_tab', newTab);
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
    trackMouse: true,
    delta: 15
  });

  const fetchLiveWeather = async (query) => {
      try {
          if(!query || query.includes('undefined')) return;
          
          const response = await axios.post('/api/Consumer_HomePage', {
              query: query,
              days: 1,
              aqi: 'no'
          });
          
          const data = response.data;
          if (isValidWeatherData(data)) {
              setWeatherData(data);
              setWeatherStatus('live');
              localStorage.setItem('farmBuddy_cachedHomePageWeather', JSON.stringify(data));
              localStorage.setItem('farmBuddy_cachedHomePageWeatherTime', new Date().toISOString());
              const assetUrl = getAssetLogic(data) || getBackgroundImage(data.current.condition.text);
              setWeatherImage(assetUrl);
          } else {
              console.warn("Weather API returned incomplete schema:", data);
              if (localStorage.getItem('farmBuddy_cachedHomePageWeather')) {
                  setWeatherStatus('cached');
              } else {
                  setWeatherData(null);
                  setWeatherStatus('offline');
              }
          }
      } catch (err) { 
          console.error("Weather Fetch Error:", err); 
          if (localStorage.getItem('farmBuddy_cachedHomePageWeather')) {
              setWeatherStatus('cached');
          } else {
              setWeatherData(null);
              setWeatherStatus('offline');
          }
      }
  };

  const getAssetLogic = (data) => {
    if (!data || !data.current || !data.current.condition) return weatherImages.defaultFallback;
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
  const activeIndex = TABS.indexOf(activeTab);

  return (
    <div style={{...pageStyle, background: 'var(--theme-bottom-bg)', transition: 'background-color 0.5s ease', '--theme-bottom-bg': activeTheme.bottomMain, '--theme-top-bg': activeTheme.topHeader, '--theme-top-img': activeTheme.topImg, '--active-tab-gradient': activeTheme.tabGradient, '--active-tab-solid-color': activeTheme.tabColor}}>
      
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
              <div className="sky-header">
                {/* Sun and atmospheric glow */}
                <div className="sun-ambient"></div>
                <div className="sun-halo"></div>
                <div className="sun-core"></div>
                
                {/* Camera Lens Bokeh Bubbles */}
                <div className="bokeh bokeh-1"></div>
                <div className="bokeh bokeh-2"></div>
                <div className="bokeh bokeh-3"></div>
                <div className="bokeh bokeh-4"></div>
                <div className="bokeh bokeh-5"></div>
                
                {/* Static Painted Birds */}
                <div style={{ position: 'absolute', top: '15%', left: '20%', opacity: 0.85, transform: 'scale(0.5) rotate(-5deg)' }}>
                  <svg width="40" height="20" viewBox="0 0 40 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 10 Q10 0 20 10 Q30 0 40 10 Q30 5 20 15 Q10 5 0 10 Z" fill="#2c3e50"/>
                  </svg>
                </div>
                <div style={{ position: 'absolute', top: '22%', left: '35%', opacity: 0.7, transform: 'scale(0.35) rotate(-10deg)' }}>
                  <svg width="40" height="20" viewBox="0 0 40 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 10 Q10 0 20 10 Q30 0 40 10 Q30 5 20 15 Q10 5 0 10 Z" fill="#2c3e50"/>
                  </svg>
                </div>
                <div style={{ position: 'absolute', top: '12%', left: '55%', opacity: 0.6, transform: 'scale(0.3) rotate(5deg)' }}>
                  <svg width="40" height="20" viewBox="0 0 40 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 10 Q10 0 20 10 Q30 0 40 10 Q30 5 20 15 Q10 5 0 10 Z" fill="#2c3e50"/>
                  </svg>
                </div>
                <div style={{ position: 'absolute', top: '28%', left: '75%', opacity: 0.5, transform: 'scale(0.25) rotate(-2deg)' }}>
                  <svg width="40" height="20" viewBox="0 0 40 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 10 Q10 0 20 10 Q30 0 40 10 Q30 5 20 15 Q10 5 0 10 Z" fill="#2c3e50"/>
                  </svg>
                </div>

              </div>
            </motion.div>
          )}

          {activeTab === 'Agri commerce' && (
            <motion.div 
              key="deep-space"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}
            >
              {/* 1. Ambient Deep Space Nebula */}
              <div className="cine-nebula purple-nebula"></div>
              <div className="cine-nebula blue-nebula"></div>

              {/* 2. Star Shapes (Static) */}
              {/* 2. Star Shapes (Static) - Enhanced Density */}
              <div className="night-star-shape glowing" style={{ top: '25%', left: '35%', fontSize: '9px' }}>★</div>
              <div className="night-star-shape glowing" style={{ top: '60%', left: '75%', fontSize: '12px', color: '#FDE047' }}>★</div>
              <div className="night-star-shape glowing" style={{ top: '15%', left: '65%', fontSize: '8px' }}>★</div>
              <div className="night-star-shape glowing" style={{ top: '85%', left: '15%', fontSize: '10px', color: '#FFD700' }}>★</div>
              <div className="night-star-shape glowing" style={{ top: '5%', left: '45%', fontSize: '7px' }}>★</div>
              <div className="night-star-shape glowing" style={{ top: '90%', left: '85%', fontSize: '11px' }}>★</div>
              {/* Additional New Stars */}
              <div className="night-star-shape glowing" style={{ top: '12%', left: '20%', fontSize: '6px' }}>★</div>
              <div className="night-star-shape glowing" style={{ top: '35%', left: '80%', fontSize: '10px', color: '#FDE047' }}>★</div>
              <div className="night-star-shape glowing" style={{ top: '55%', left: '25%', fontSize: '8px' }}>★</div>
              <div className="night-star-shape glowing" style={{ top: '75%', left: '50%', fontSize: '14px', color: '#FFF9E6' }}>★</div>
              <div className="night-star-shape glowing" style={{ top: '45%', left: '10%', fontSize: '9px' }}>★</div>
              <div className="night-star-shape glowing" style={{ top: '80%', left: '95%', fontSize: '7px' }}>★</div>
              <div className="night-star-shape glowing" style={{ top: '20%', left: '50%', fontSize: '11px', color: '#FFD700' }}>★</div>
              <div className="night-star-shape glowing" style={{ top: '70%', left: '35%', fontSize: '8px' }}>★</div>

              {/* 3. Crisp Modern Moon */}
              <div style={{ position: 'absolute', top: '15%', right: '22%', width: '60px', height: '60px' }}>
                {/* Clean outer glow */}
                <div style={{ position: 'absolute', top: '-10px', left: '-10px', width: '80px', height: '80px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255, 249, 230, 0.2) 0%, transparent 70%)', zIndex: 1 }}></div>
                {/* Sharp crescent illusion using box-shadow inset trick */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: '50%', background: '#FFF9E6', boxShadow: 'inset -8px -4px 0 0px rgba(0,0,0,0.1), 0 0 15px rgba(255, 255, 255, 0.8)', zIndex: 2 }}></div>
              </div>
            </motion.div>
          )}

          {activeTab === 'tools and utils' && (
            <motion.div 
              key="tools-winter"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}
            >
              {/* MASTERPIECE REALISTIC SUNSET MOUNTAINS */}
              <svg className="winter-svg-bg" viewBox="0 0 400 180" fill="none" preserveAspectRatio="xMidYMax slice">
                <defs>
                  {/* Sky Gradient: Deep Blue to Blazing Orange */}
                  <linearGradient id="eveningSky" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1E3A8A"/>   
                    <stop offset="40%" stopColor="#3B82F6"/>  
                    <stop offset="70%" stopColor="#F59E0B"/>  
                    <stop offset="100%" stopColor="#EA580C"/> 
                  </linearGradient>

                  {/* Intense Sun Glow */}
                  <radialGradient id="sunsetGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FEF08A" stopOpacity="1"/>
                    <stop offset="40%" stopColor="#F59E0B" stopOpacity="0.8"/>
                    <stop offset="100%" stopColor="#EA580C" stopOpacity="0"/>
                  </radialGradient>
                </defs>

                {/* 1. Sky Background */}
                <rect width="400" height="180" fill="url(#eveningSky)" opacity="1"/>

                {/* 2. Distant Hazy Mountains (Teal/Green) */}
                <polygon points="10,180 90,95 180,180" fill="#166534" opacity="0.8"/>
                <polygon points="250,180 350,85 430,180" fill="#166534" opacity="0.8"/>

                {/* 3. The Sunset Orb (Nestled behind the main valley) */}
                <circle cx="200" cy="115" r="50" fill="url(#sunsetGlow)"/>
                <circle cx="200" cy="115" r="16" fill="#FFFBEB"/>

                {/* 4. Left Majestic Snow Peak Mountain (Lowered) */}
                <polygon points="-50,180 110,90 250,180" fill="#022C22"/>
                {/* Left Snowcap (Sunset tinted) */}
                <polygon points="74,110 85,115 95,105 105,118 115,108 130,118 140,110 110,90" fill="#FED7AA" opacity="0.85"/>

                {/* 5. Right Majestic Snow Peak Mountain (Lowered) */}
                <polygon points="150,180 310,75 450,180" fill="#011F18"/>
                {/* Right Snowcap (Sunset tinted) */}
                <polygon points="280,95 290,105 300,95 315,108 325,95 336,95 310,75" fill="#FED7AA" opacity="0.8"/>

                {/* 6. Birds Flying IN FRONT OF THE SUN */}
                <g fill="#020617" opacity="0.85">
                  <path d="M 190 115 Q 194 111 198 115 Q 202 111 206 115 Q 202 112 198 116 Q 194 112 190 115 Z" transform="scale(1.2) translate(-38, -20)"/>
                  <path d="M 190 115 Q 194 111 198 115 Q 202 111 206 115 Q 202 112 198 116 Q 194 112 190 115 Z" transform="scale(0.8) translate(55, 30)"/>
                  <path d="M 190 115 Q 194 111 198 115 Q 202 111 206 115 Q 202 112 198 116 Q 194 112 190 115 Z" transform="scale(1) translate(-10, -10)"/>
                  <path d="M 190 115 Q 194 111 198 115 Q 202 111 206 115 Q 202 112 198 116 Q 194 112 190 115 Z" transform="scale(0.6) translate(80, 45)"/>
                  <path d="M 190 115 Q 194 111 198 115 Q 202 111 206 115 Q 202 112 198 116 Q 194 112 190 115 Z" transform="scale(0.9) translate(15, 10)"/>
                </g>
              </svg>
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
        <div style={{ paddingTop: '8px', paddingBottom: '0', position: 'relative', zIndex: 10 }}>
          {ConsumerGlobalStyles}
          <div 
            style={tabCardsContainer}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const zoneIndex = Math.min(2, Math.max(0, Math.floor((clickX / rect.width) * 3)));
              changeTab(TABS[zoneIndex]);
            }}
          >
            {/* SINGLE PERSISTENT SLIDING ACTIVE INDICATOR (Zero-Stretch Spring Slide) */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, padding: '0 10px', pointerEvents: 'none', zIndex: 0 }}>
              <motion.div 
                className="active-tab-bg" 
                animate={{ 
                  x: `calc(${activeIndex} * (100% + 10px))`,
                  background: activeTheme.tabGradient
                }}
                transition={{ type: "spring", stiffness: 250, damping: 28, mass: 0.8 }}
                style={{
                  width: 'calc((100% - 20px) / 3)',
                  height: '100%',
                  position: 'relative'
                }}
              />
            </div>

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
        {/* --- DYNAMIC TAB BANNERS WITH INTEGRATED SEARCH BAR (Zepto Style - Managed in BannerPromo.jsx) --- */}
        <BannerWidget 
          activeTab={activeTab} 
          direction={direction} 
          searchVal={searchVal}
          setSearchVal={setSearchVal}
          isSearchFocused={isSearchFocused}
          setIsSearchFocused={setIsSearchFocused}
        />

        {/* SWIPEABLE BENTO GRID AREA (CAROUSEL ARCHITECTURE) */}
        <div {...swipeHandlers} style={{ overflowX: 'hidden', width: '100%', minHeight: '350px', touchAction: 'pan-y', overscrollBehaviorX: 'none' }}>
          <motion.div 
            style={{ 
              display: 'flex', 
              width: '300%', 
              willChange: 'transform'
            }}
            animate={{ x: `-${activeIndex * 33.33333}%` }}
            transition={{ type: 'spring', stiffness: 280, damping: 28, mass: 0.8 }}
          >
            {/* 1. AgriInsights Tab */}
            <div style={{ width: '33.33333%', flexShrink: 0, padding: '0 0 100px 0' }}>
              <div style={{...bentoGrid, willChange: 'transform'}}>
                <Link to="/market-rates" style={cardLink}>
                   <div className="glass-card" style={{...cardStyle, backgroundImage: "url('/assets/images/market-pulse.webp')"}}>
                      <div style={cardTopOverlay}>
                         <div><h3 style={cardTitle}>Market Pulse</h3><p style={cardSubtitle}>Mandi Rates</p></div>
                         <div style={{ opacity: 0.9 }}><TrendingUp size={28} color="white"/></div>
                      </div>
                   </div>
                </Link>

                <Link to="/NewsUpdates" style={cardLink}>
                   <div className="glass-card" style={{...cardStyle, backgroundImage: "url('/assets/images/agri-news.webp')"}}>
                      <div style={cardTopOverlay}>
                         <div><h3 style={cardTitle}>Agri News</h3><p style={cardSubtitle}>Daily Updates</p></div>
                         <div style={{ opacity: 0.9 }}><Newspaper size={28} color="white"/></div>
                      </div>
                   </div>
                </Link>

                <Link to="/library" style={cardLink}>
                   <div className="glass-card" style={{...cardStyle, backgroundImage: "url('/assets/images/library.webp')"}}>
                      <div style={cardTopOverlay}>
                         <div><h3 style={cardTitle}>Library</h3><p style={cardSubtitle}>Expert Guides</p></div>
                         <div style={{ opacity: 0.9 }}><BookOpen size={28} color="white"/></div>
                      </div>
                   </div>
                </Link>

                <Link to="/modern-tech" style={cardLink}>
                   <div className="glass-card" style={{...cardStyle, backgroundImage: "url('/assets/images/modern-tech.webp')"}}>
                      <div style={cardTopOverlay}>
                         <div><h3 style={cardTitle}>Modern Tech</h3><p style={cardSubtitle}>Drones & AI</p></div>
                         <div style={{ opacity: 0.9 }}><Rocket size={28} color="white"/></div>
                      </div>
                   </div>
                </Link>

                {/* WEATHER CARD MOVED TO TAB 1 */}
                <Link to="/weather" style={{...cardLink, display: 'block', gridColumn: 'span 2'}}>
                   <div className="glass-card" style={{...wideCardStyle, position: 'relative', overflow: 'hidden'}}>
                      <img 
                         src={weatherImage} 
                         alt="Weather Background" 
                         style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0, zIndex: -1 }} 
                       />
                      <div style={darkOverlay}></div>
                      <div style={cardTopOverlay}>
                          <div style={{display:'flex', flexDirection:'column', justifyContent:'space-between', height:'100%', width:'100%'}}>
                            <div style={{display:'flex', justifyContent:'space-between', width:'100%'}}>
                                <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                                    <h3 style={{...cardTitle, margin:0, fontSize:'13px', opacity:0.8, textTransform:'uppercase'}}>Weather View</h3>
                                    {isValidWeatherData(weatherData) && (
                                        <>
                                            {weatherStatus === 'live' && (
                                                <span style={{background:'rgba(16, 185, 129, 0.25)', border:'1px solid rgba(16, 185, 129, 0.6)', color:'#10B981', fontSize:'9px', padding:'1px 6px', borderRadius:'10px', fontWeight:'900', textTransform:'uppercase', letterSpacing:'0.5px'}}>Live 🟢</span>
                                            )}
                                            {weatherStatus === 'cached' && (
                                                <span style={{background:'rgba(245, 158, 11, 0.25)', border:'1px solid rgba(245, 158, 11, 0.6)', color:'#F59E0B', fontSize:'9px', padding:'1px 6px', borderRadius:'10px', fontWeight:'900', textTransform:'uppercase', letterSpacing:'0.5px'}}>Offline Cache ⚠️</span>
                                            )}
                                            {weatherStatus === 'demo' && (
                                                <span style={{background:'rgba(59, 130, 246, 0.25)', border:'1px solid rgba(59, 130, 246, 0.6)', color:'#3B82F6', fontSize:'9px', padding:'1px 6px', borderRadius:'10px', fontWeight:'900', textTransform:'uppercase', letterSpacing:'0.5px'}}>Demo Mode 🧪</span>
                                            )}
                                        </>
                                    )}
                                </div>
                                <div style={whiteIconBox}><CloudSun size={24} color="white"/></div>
                            </div>
                            {isValidWeatherData(weatherData) ? (
                                <div style={{display:'flex', flexDirection:'column', marginTop:'10px'}}>
                                    <div style={{fontSize:'22px', fontWeight:'700', lineHeight:'1.2'}}>
                                        {weatherData.location.name}
                                    </div>
                                    <div style={{fontSize:'42px', fontWeight:'300', margin:'2px 0'}}>{Math.round(weatherData.current.temp_c)}°</div>
                                    <div style={{display:'flex', gap:'15px', fontSize:'13px', opacity:0.9, marginTop:'5px'}}>
                                        <span>🌧 Rain: {weatherData.forecast.forecastday[0].day.daily_chance_of_rain}%</span>
                                        <span>💧 Hum: {weatherData.current.humidity}%</span>
                                    </div>
                                    {weatherStatus === 'cached' && (
                                        <div style={{fontSize:'10px', color:'#F59E0B', marginTop:'6px', display:'flex', alignItems:'center', gap:'4px', fontWeight:'bold'}}>
                                            ⚠️ Stale Data. Cached: {(() => {
                                                const cachedTime = localStorage.getItem('farmBuddy_cachedHomePageWeatherTime');
                                                return cachedTime ? new Date(cachedTime).toLocaleDateString([], {month:'short', day:'numeric'}) + ' ' + new Date(cachedTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Offline';
                                            })()}
                                        </div>
                                    )}
                                    {weatherStatus === 'live' && (
                                        <div style={{fontSize:'10px', color:'#10B981', marginTop:'6px', display:'flex', alignItems:'center', gap:'4px', opacity:0.8, fontWeight:'bold'}}>
                                            ✓ Verified Live Satellite Telemetry
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div style={{display:'flex', flexDirection:'column', marginTop:'15px'}}>
                                    <div style={{fontSize:'20px', fontWeight:'700', lineHeight:'1.2', color: '#fff'}}>
                                        {locationTitle && locationTitle !== "Select Location" ? locationTitle : "Select Location"}
                                    </div>
                                    <div style={{fontSize:'13px', opacity:0.8, marginTop:'4px', color: '#ff8a80', fontWeight: 'bold'}}>
                                        Weather Service Offline (Tap to Configure)
                                    </div>
                                </div>
                            )}
                          </div>
                      </div>
                   </div>
                </Link>
              </div>
            </div>

            {/* 2. Agri commerce Tab */}
            <div style={{ width: '33.33333%', flexShrink: 0, padding: '0 0 100px 0' }}>
              <div style={{...bentoGrid, willChange: 'transform'}}>
                <Link to="/freelancing" style={cardLink}>
                   <div className="glass-card" style={{...cardStyle, backgroundImage: "url('/assets/images/freelancing.webp')"}}>
                      <div style={cardTopOverlay}>
                         <div><h3 style={cardTitle}>Freelancing</h3><p style={cardSubtitle}>Hire Professionals</p></div>
                         <div style={{ opacity: 0.9 }}><Briefcase size={28} color="white"/></div>
                      </div>
                   </div>
                </Link>

                <Link to="/rent-machinery" style={cardLink}>
                   <div className="glass-card" style={{...cardStyle, backgroundImage: "url('/assets/images/agri-inputs.webp')"}}>
                      <div style={cardTopOverlay}>
                         <div><h3 style={cardTitle}>Hire Machinery</h3><p style={cardSubtitle}>Tractors & Tools</p></div>
                         <div style={{ opacity: 0.9 }}><Tractor size={28} color="white"/></div>
                      </div>
                   </div>
                </Link>

                <Link to="/business" style={cardLink}>
                   <div className="glass-card" style={{...cardStyle, backgroundImage: "url('/assets/images/machinery.webp')"}}>
                      <div style={cardTopOverlay}>
                         <div><h3 style={cardTitle}>Business Zone</h3><p style={cardSubtitle}>Buy Harvest</p></div>
                         <div style={{ opacity: 0.9 }}><IndianRupee size={28} color="white"/></div>
                      </div>
                   </div>
                </Link>

                <Link to="/farm-fresh" style={cardLink}>
                   <div className="glass-card" style={{...cardStyle, backgroundImage: "url('/assets/images/local-goods.webp')"}}>
                      <div style={cardTopOverlay}>
                         <div><h3 style={cardTitle}>Farm Fresh</h3><p style={cardSubtitle}>Daily Essentials</p></div>
                         <div style={{ opacity: 0.9 }}><ShoppingBasket size={28} color="white"/></div>
                      </div>
                   </div>
                </Link>

                <Link to="/hire-workers" style={cardLink}>
                   <div className="glass-card" style={{...cardStyle, backgroundImage: "url('/assets/images/farm-workers.webp')"}}>
                      <div style={cardTopOverlay}>
                         <div><h3 style={cardTitle}>Hire Workers</h3><p style={cardSubtitle}>Farm Labor</p></div>
                         <div style={{ opacity: 0.9 }}><Briefcase size={28} color="white"/></div>
                      </div>
                   </div>
                </Link>

                <Link to="/agri-goods" style={cardLink}>
                   <div className="glass-card" style={{...cardStyle, backgroundImage: "url('/assets/images/business-zone.webp')"}}>
                      <div style={cardTopOverlay}>
                         <div><h3 style={cardTitle}>Local Goods</h3><p style={cardSubtitle}>Handmade & Tools</p></div>
                         <div style={{ opacity: 0.9 }}><Briefcase size={28} color="white"/></div>
                      </div>
                   </div>
                </Link>
              </div>
            </div>

            {/* 3. tools and utils Tab */}
            <div style={{ width: '33.33333%', flexShrink: 0, padding: '0 0 100px 0' }}>
              <div style={{...bentoGrid, willChange: 'transform'}}>
                <Link to="/expenditure" style={cardLink}>
                   <div className="glass-card" style={{...cardStyle, backgroundImage: "url('/assets/images/expenditure.webp')"}}>
                      <div style={cardTopOverlay}>
                         <div><h3 style={{...cardTitle}}>Crop Exp.</h3><p style={cardSubtitle}>Track Expenses</p></div>
                         <div style={{ opacity: 0.9 }}><FileText size={28} color="white"/></div>
                      </div>
                   </div>
                </Link>

                <Link to="/gps-measurement" style={cardLink}>
                   <div className="glass-card" style={{...cardStyle, backgroundImage: "url('/assets/images/digital-diary.webp')"}}>
                      <div style={cardTopOverlay}>
                         <div><h3 style={cardTitle}>GPS Area</h3><p style={cardSubtitle}>Measure Land</p></div>
                         <div style={{ opacity: 0.9 }}><Map size={28} color="white"/></div>
                      </div>
                   </div>
                </Link>

                <Link to="/radio" style={cardLink}>
                   <div className="glass-card" style={{...cardStyle, backgroundImage: "url('/assets/images/bidding-zone.webp')"}}>
                      <div style={cardTopOverlay}>
                         <div><h3 style={cardTitle}>Farm Radio</h3><p style={cardSubtitle}>News & Songs</p></div>
                         <div style={{ opacity: 0.9 }}><Radio size={28} color="white"/></div>
                      </div>
                   </div>
                </Link>
              </div>
            </div>
          </motion.div>
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
const pageStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100dvh', backgroundColor: 'var(--bg-color)', backgroundSize: 'cover', backgroundPosition: 'center', overflowY: 'auto', overflowX: 'hidden', touchAction: 'pan-y', overscrollBehavior: 'none', WebkitOverflowScrolling: 'touch', scrollBehavior: 'smooth' };
const topSectionWrapper = { position: 'relative', paddingBottom: 0 };
const topSectionOverlay = { paddingTop: 'env(safe-area-inset-top)', paddingBottom: '0' };
const headerWrapper = { padding: '25px 20px 10px 20px' };
const topRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' };
const locationClickableArea = { display:'flex', flexDirection:'column', justifyContent:'center', cursor: 'pointer' };
const profileCircle = { width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(0,0,0,0.05)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', border: '1px solid rgba(0,0,0,0.1)' };
const tabCardsContainer = { display: 'flex', gap: '10px', padding: '0 10px', maxWidth: '1000px', margin: '0 auto', alignItems: 'flex-end', position: 'relative' };
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
    color: isActive ? 'rgba(255, 255, 255, 0.85)' : 'var(--subtle-text)', 
    fontSize: '10px', 
    fontWeight: '900', 
    textTransform: 'uppercase', 
    letterSpacing: '1px', 
    transition: 'color 0.5s ease',
    fontFamily: '"Nunito", sans-serif'
  };
};

const getBottomTextStyle = (tab, isActive) => {
  return {
    color: isActive ? '#ffffff' : 'var(--text-color)',
    fontSize: isActive ? '18px' : '15px', 
    fontWeight: isActive ? '800' : 'normal', 
    letterSpacing: '0.5px', 
    transition: 'all 0.5s ease',
    textShadow: isActive ? '0 1px 3px rgba(0,0,0,0.2)' : 'none'
  };
};

export default Consumer_HomePage;