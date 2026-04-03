import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  WiHumidity, WiThermometer, WiRain, WiBarometer, WiTime3 
} from 'react-icons/wi';
import { 
  IoMdAdd, IoMdSearch, IoMdClose, IoMdNavigate, IoMdArrowBack, IoMdRefresh
} from 'react-icons/io';
import { MdLocationOn, MdDelete, MdGpsFixed } from 'react-icons/md';
import { FaMaskFace } from 'react-icons/fa6'; 
import { FaWind } from 'react-icons/fa';

// --- WEATHER IMAGE ASSETS (URLs) ---
const weatherImages = {
  clearDay: 'https://images.pexels.com/photos/296234/pexels-photo-296234.jpeg',
  clearNight: 'https://images.pexels.com/photos/11752993/pexels-photo-11752993.jpeg',
  cloudyDay: 'https://images.pexels.com/photos/158163/clouds-cloudporn-weather-lookup-158163.jpeg',
  cloudyNight: 'https://images.pexels.com/photos/29473893/pexels-photo-29473893.jpeg',
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
  drizzle: 'https://images.pexels.com/photos/804474/pexels-photo-804474.jpeg',
  defaultFallback: 'https://images.pexels.com/photos/1107717/pexels-photo-1107717.jpeg' 
};

// --- SMART TEXT MATCHER AS SECONDARY FALLBACK ---
const getBackgroundImage = (conditionText, isDay) => {
  if (!conditionText) return weatherImages.defaultFallback;
  const text = conditionText.toLowerCase();
  
  if (text.includes('overcast') || text.includes('cloud')) return isDay ? weatherImages.cloudyDay : weatherImages.cloudyNight; 
  if (text.includes('rain') || text.includes('shower')) return isDay ? weatherImages.rainDay : weatherImages.rainNight;
  if (text.includes('drizzle')) return isDay ? weatherImages.drizzle : weatherImages.rainNight;
  if (text.includes('clear') || text.includes('sun')) return isDay ? weatherImages.clearDay : weatherImages.clearNight;
  if (text.includes('mist') || text.includes('fog')) return isDay ? weatherImages.mistDay : weatherImages.mistNight;
  if (text.includes('thunder') || text.includes('storm')) return weatherImages.storm;
  
  return weatherImages.defaultFallback;
};

// --- HELPER COMPONENTS ---
const SkeletonLoader = () => (
  <div style={styles.skeletonContainer}>
    <div style={{...styles.skeletonBox, height: '40px', width: '60%', marginBottom: '20px'}}></div>
    <div style={{...styles.skeletonBox, height: '150px', width: '150px', borderRadius: '50%', marginBottom: '20px'}}></div>
    <div style={{...styles.skeletonBox, height: '30px', width: '40%', marginBottom: '40px'}}></div>
    <div style={{...styles.skeletonBox, height: '200px', width: '100%', borderRadius: '24px'}}></div>
    <style>{`
      @keyframes shimmer { 0% { background-position: -200px 0; } 100% { background-position: 200px 0; } }
    `}</style>
  </div>
);

const Toast = ({ message, show }) => (
  <div style={{
    ...styles.toast,
    opacity: show ? 1 : 0,
    transform: show ? 'translate(-50%, 0)' : 'translate(-50%, 20px)',
    pointerEvents: 'none'
  }}>
    {message}
  </div>
);

const Weather = () => {
  const navigate = useNavigate();

  // --- STATE ---
  const [savedWeatherList, setSavedWeatherList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0); 
  const [loading, setLoading] = useState(true);
  const [unit, setUnit] = useState('C'); 
  
  const [showCityManager, setShowCityManager] = useState(false);
  const [showSearchOverlay, setShowSearchOverlay] = useState(false); 
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]); 
  const [gpsResult, setGpsResult] = useState(null); 
  const [isSearchingGPS, setIsSearchingGPS] = useState(false);
  const [showFullForecast, setShowFullForecast] = useState(false);
  
  // --- SEARCH HISTORY STATE ---
  const [searchHistory, setSearchHistory] = useState([]);

  // UX States
  const [toastMsg, setToastMsg] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Touch Logic
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);
  const [touchStartY, setTouchStartY] = useState(null);
  const [touchEndY, setTouchEndY] = useState(null);

  const popularCities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Jaipur'];

  // --- INITIAL LOAD ---
  useEffect(() => { 
      loadAllCities(); 
      // Load History
      const savedHistory = localStorage.getItem('farmBuddy_searchHistory');
      if (savedHistory) setSearchHistory(JSON.parse(savedHistory));
  }, []);

  // --- SYNC LAST CITY ---
  useEffect(() => {
    if (savedWeatherList.length > 0) {
      const currentCity = savedWeatherList[currentIndex];
      localStorage.setItem('farmBuddy_lastCity', JSON.stringify({ 
          name: currentCity.location.name, 
          lat: currentCity.location.lat, 
          lon: currentCity.location.lon 
      }));
    }
  }, [currentIndex, savedWeatherList]);

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const getTemp = (celsius) => unit === 'C' ? Math.round(celsius) : Math.round((celsius * 9/5) + 32);

  const getAqiInfo = (airQuality) => {
      if (!airQuality || !airQuality['us-epa-index']) return { text: 'Unknown', color: 'rgba(255,255,255,0.2)' };
      const index = airQuality['us-epa-index'];
      switch(index) {
          case 1: return { text: 'Good', color: 'rgba(76, 175, 80, 0.4)' };
          case 2: return { text: 'Moderate', color: 'rgba(255, 235, 59, 0.4)' };
          case 3: return { text: 'Sensitive', color: 'rgba(255, 152, 0, 0.4)' };
          case 4: return { text: 'Unhealthy', color: 'rgba(244, 67, 54, 0.4)' };
          case 5: return { text: 'Very Unhealthy', color: 'rgba(156, 39, 176, 0.4)' };
          case 6: return { text: 'Hazardous', color: 'rgba(183, 28, 28, 0.4)' };
          default: return { text: 'Unknown', color: 'rgba(255,255,255,0.2)' };
      }
  };

  const getUvText = (uv) => {
      if (uv <= 2) return 'Low';
      if (uv <= 5) return 'Moderate';
      if (uv <= 7) return 'High';
      if (uv <= 10) return 'Very High';
      return 'Extreme';
  };

  const formatCityTime = (timeString) => {
      if(!timeString) return "--:--";
      const [date, time] = timeString.split(' ');
      let [hr, min] = time.split(':');
      let ampm = 'AM';
      hr = parseInt(hr);
      if(hr >= 12) { ampm = 'PM'; if(hr > 12) hr -= 12; }
      if(hr === 0) hr = 12;
      return `${hr}:${min} ${ampm}`;
  };

  const getSunPosition = (sunriseStr, sunsetStr, localTimeStr) => {
      try {
          const localDateStr = localTimeStr.split(' ')[0];
          const parseTime = (str) => {
             const [time, modifier] = str.split(' ');
             let [hours, minutes] = time.split(':');
             if (hours === '12') hours = '00';
             if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
             return new Date(`${localDateStr.replace(/-/g, '/')} ${hours}:${minutes}:00`);
          };
          const now = new Date(localTimeStr.replace(/-/g, '/'));
          const sunrise = parseTime(sunriseStr);
          const sunset = parseTime(sunsetStr);
          if (now < sunrise) return 0;
          if (now > sunset) return 100;
          const totalDuration = sunset - sunrise;
          const elapsed = now - sunrise;
          return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
      } catch (e) { return 50; } 
  };

  const loadAllCities = async () => {
    setLoading(true);
    const saved = localStorage.getItem('farmBuddy_cities');
    let citiesToFetch = saved ? JSON.parse(saved) : [];

    if(citiesToFetch.length === 0) {
        const lastCity = localStorage.getItem('farmBuddy_lastCity');
        if(lastCity) citiesToFetch.push(JSON.parse(lastCity));
    }

    if (citiesToFetch.length === 0) {
        if (navigator.geolocation) {
             navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    const data = await fetchSingleCity(`${pos.coords.latitude},${pos.coords.longitude}`);
                    if(data) {
                        setSavedWeatherList([data]);
                        saveCityToLocal(data, data.location.name); 
                        triggerToast(`Located: ${data.location.name}`);
                    }
                    setLoading(false);
                },
                (err) => { setLoading(false); triggerToast("GPS Failed. Please search manually."); },
                { enableHighAccuracy: true } 
            );
        } else { setLoading(false); }
    } else {
        const promises = citiesToFetch.map(async (city) => {
            const data = await fetchSingleCity(`${city.lat},${city.lon}`);
            if (data) {
                data.location.name = city.name; 
                return data;
            }
            return null;
        });
        const results = await Promise.all(promises);
        setSavedWeatherList(results.filter(item => item !== null));
        setLoading(false);
    }
  };

  const fetchSingleCity = async (query) => {
    try {
      const apiKey = import.meta.env.VITE_WEATHER_KEY;
      const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${query}&days=7&aqi=yes&alerts=yes`;
      const response = await axios.get(url);
      return response.data;
    } catch (err) { 
        triggerToast("Network Error");
        return null; 
    }
  };

  const handleRefresh = async () => {
      setIsRefreshing(true);
      await loadAllCities();
      setIsRefreshing(false);
      triggerToast("Data Updated");
  };

  const getAssetLogic = (currentCityData) => {
    if (!currentCityData) return weatherImages.clearDay;
    const code = currentCityData.current.condition.code;
    const text = currentCityData.current.condition.text; 
    const isDay = currentCityData.current.is_day;
    const hour = new Date().getHours();

    if ([1087, 1273, 1276, 1279, 1282].includes(code)) return weatherImages.storm;
    if ([1063, 1150, 1153, 1180, 1183, 1186, 1189, 1240].includes(code)) {
        return isDay ? weatherImages.drizzle : weatherImages.rainNight;
    }
    if ([1192, 1195, 1198, 1201, 1243, 1246, 1249, 1252].includes(code)) {
        if (hour >= 16 && hour <= 19) return weatherImages.rainEvening;
        return isDay ? weatherImages.rainDay : weatherImages.rainNight;
    }
    if ([1030, 1135, 1147].includes(code)) return isDay ? weatherImages.mistDay : weatherImages.mistNight;
    if ([1006, 1009].includes(code)) return isDay ? weatherImages.cloudyDay : weatherImages.cloudyNight;
    if (code === 1003) return isDay ? weatherImages.partlyCloudyDay : weatherImages.partlyCloudyNight;
    
    const smartMatch = getBackgroundImage(text);
    if (smartMatch !== weatherImages.defaultFallback) return smartMatch;

    if (isDay) {
        if (hour === 6) return weatherImages.sunrise;
        if (hour >= 17 && hour <= 18) return weatherImages.sunset;
        return weatherImages.clearDay;
    } 
    return weatherImages.clearNight;
  };

  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setGpsResult(null); 
    if (query.length > 2) {
        try {
            const apiKey = import.meta.env.VITE_WEATHER_KEY;
            const url = `https://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${query}`;
            const res = await axios.get(url);
            setSuggestions(res.data);
        } catch (error) {}
    } else { setSuggestions([]); }
  };

  const handleGPSClick = () => {
      setIsSearchingGPS(true);
      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(async (pos) => {
              const data = await fetchSingleCity(`${pos.coords.latitude},${pos.coords.longitude}`);
              setGpsResult(data);
              setIsSearchingGPS(false);
              triggerToast("Precise Location Found");
          }, (err) => {
              triggerToast("GPS Permission Denied");
              setIsSearchingGPS(false);
          }, { enableHighAccuracy: true, timeout: 10000 });
      }
  };

  // --- HANDLE SELECT SUGGESTION LOGIC FOR GEOGRAPHY ---
  const handleSelectSuggestion = async (placeOrData) => {
    let newWeatherData;
    let selectedName = "";

    if (placeOrData.current) {
        newWeatherData = placeOrData;
        selectedName = placeOrData.location.name;
    } else if (typeof placeOrData === 'string') {
        selectedName = placeOrData;
        const searchTarget = popularCities.includes(placeOrData) ? `${placeOrData}, India` : placeOrData;
        newWeatherData = await fetchSingleCity(searchTarget); 
    } else {
        selectedName = placeOrData.name; 
        newWeatherData = await fetchSingleCity(placeOrData.url || placeOrData.name); 
    }
    
    if (!newWeatherData) return;
    
    newWeatherData.location.name = selectedName;
    
    const exists = savedWeatherList.findIndex(w => w.location.name === selectedName);
    if (exists === -1) {
        const updatedList = [...savedWeatherList, newWeatherData];
        setSavedWeatherList(updatedList);
        saveCityToLocal(newWeatherData, selectedName);
        setCurrentIndex(updatedList.length - 1); 
    } else {
        setCurrentIndex(exists);
    }

    const updatedHistory = [selectedName, ...searchHistory.filter(item => item !== selectedName)].slice(0, 5);
    setSearchHistory(updatedHistory);
    localStorage.setItem('farmBuddy_searchHistory', JSON.stringify(updatedHistory));

    setSearchQuery("");
    setSuggestions([]);
    setGpsResult(null);
    setShowSearchOverlay(false); 
    setShowCityManager(false);
    triggerToast(`Added ${selectedName}`);
  };

  const saveCityToLocal = (weatherData, forceName) => {
      const saved = localStorage.getItem('farmBuddy_cities');
      const currentList = saved ? JSON.parse(saved) : [];
      const nameToSave = forceName || weatherData.location.name;

      if (!currentList.some(c => c.name === nameToSave)) {
          const newEntry = { 
              name: nameToSave, 
              lat: weatherData.location.lat, 
              lon: weatherData.location.lon 
          };
          localStorage.setItem('farmBuddy_cities', JSON.stringify([...currentList, newEntry]));
      }
  };

  const handleRemoveCity = (e, indexToRemove) => {
      e.stopPropagation();
      const newList = savedWeatherList.filter((_, i) => i !== indexToRemove);
      setSavedWeatherList(newList);
      
      const simpleList = newList.map(w => ({ 
          name: w.location.name, 
          lat: w.location.lat, 
          lon: w.location.lon 
      }));
      localStorage.setItem('farmBuddy_cities', JSON.stringify(simpleList));
      
      if (currentIndex >= newList.length) setCurrentIndex(Math.max(0, newList.length - 1));
  };

  const onTouchStart = (e) => { 
      setTouchEndX(null); 
      setTouchStartX(e.targetTouches[0].clientX); 
      setTouchEndY(null);
      setTouchStartY(e.targetTouches[0].clientY);
  };
  
  const onTouchMove = (e) => {
      setTouchEndX(e.targetTouches[0].clientX);
      setTouchEndY(e.targetTouches[0].clientY);
  };
  
  const onTouchEnd = () => {
    if (!touchStartX || !touchEndX || !touchStartY || !touchEndY) return;
    const xDiff = touchStartX - touchEndX;
    const yDiff = touchStartY - touchEndY; 

    if (Math.abs(xDiff) > 50 && Math.abs(yDiff) < 30) {
        if (xDiff > 50 && currentIndex < savedWeatherList.length - 1) setCurrentIndex(currentIndex + 1);
        if (xDiff < -50 && currentIndex > 0) setCurrentIndex(currentIndex - 1);
    }
    if (yDiff < -100 && Math.abs(xDiff) < 40) handleRefresh();
  };

  if (loading) return <div style={styles.loadingContainer}><SkeletonLoader /></div>;
  if (savedWeatherList.length === 0) return <div style={styles.loading}>No locations found.</div>;

  const weather = savedWeatherList[currentIndex]; 
  const { current, location, forecast } = weather;
  const image = getAssetLogic(weather);
  const visibleDays = showFullForecast ? forecast.forecastday : forecast.forecastday.slice(0, 3);
  const sunPosition = getSunPosition(forecast.forecastday[0].astro.sunrise, forecast.forecastday[0].astro.sunset, location.localtime);
  const aqiInfo = getAqiInfo(current.air_quality);

  // STITCH 24-HOUR FORECAST USING THE CITY'S EXACT LOCAL TIME
  const allHours = forecast.forecastday.flatMap(day => day.hour);
  const currentCityEpoch = location.localtime_epoch;
  // Get the next 24 hours of data starting from roughly the current local hour
  const next24Hours = allHours.filter(h => h.time_epoch >= currentCityEpoch - 3600).slice(0, 24);

  return (
    <div style={styles.container} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      <img src={image} alt="Weather Background" style={styles.videoBg} />
      <div style={styles.overlay}></div>
      
      <div style={styles.appWrapper}>
      {isRefreshing && <div style={styles.refreshIndicator}><div style={styles.spinner}></div></div>}
      <Toast message={toastMsg} show={showToast} />

      {/* HEADER */}
      <div style={styles.topBar}>
         <button onClick={() => navigate('/dashboard')} style={styles.iconBtn}><IoMdArrowBack size={24}/></button>
         <div style={styles.locationText}>
           <span style={styles.cityTitle}>{location.name}</span>
           <span style={styles.regionTitle}>
              {location.region} • {formatCityTime(location.localtime)}
           </span>
         </div>
         <div style={styles.topRight}>
            <button onClick={handleRefresh} style={styles.iconBtn}><IoMdRefresh size={22}/></button>
            <button onClick={() => setUnit(unit === 'C' ? 'F' : 'C')} style={styles.unitBtn}>°{unit}</button>
            <button onClick={() => setShowCityManager(true)} style={styles.iconBtn}><IoMdAdd size={24}/></button>
         </div>
      </div>
      
      {savedWeatherList.length > 1 && (
          <div style={styles.dotsContainer}>
              {savedWeatherList.map((_, idx) => (
                  <div key={idx} style={{...styles.dot, width: idx === currentIndex ? '18px' : '6px', opacity: idx === currentIndex ? 1 : 0.4, background: idx === currentIndex ? '#fff' : '#aaa'}}></div>
              ))}
          </div>
      )}

      {/* MANAGER MODAL */}
      {showCityManager && (
          <div style={styles.modalOverlay}>
              <div style={styles.modalContent}>
                  
                  {/* --- NEW STYLED SEARCH OVERLAY --- */}
                  {showSearchOverlay ? (
                      <div style={styles.searchOverlay}>
                          <div style={styles.searchHeader}>
                              <IoMdArrowBack size={24} onClick={() => {setShowSearchOverlay(false); setGpsResult(null);}} style={{cursor:'pointer', color: '#ccc'}} />
                              <input 
                                autoFocus type="text" placeholder="Search for a city..." 
                                value={searchQuery} onChange={handleSearchChange} style={styles.searchInputBig}
                              />
                              {searchQuery && (
                                  <IoMdClose size={22} color="#888" style={{cursor:'pointer'}} onClick={() => setSearchQuery("")} />
                              )}
                          </div>
                          
                          <div style={styles.suggestionsList}>
                              {searchQuery.length === 0 && !gpsResult && (
                                  <>
                                     <div style={styles.gpsRow} onClick={handleGPSClick}>
                                         {isSearchingGPS ? <span style={styles.spinner}></span> : <MdLocationOn size={22} color="#4CAF50"/>}
                                         {isSearchingGPS ? "Pinpointing Location..." : "Use Precise GPS"}
                                     </div>

                                     {/* SEARCH HISTORY SECTION */}
                                     {searchHistory.length > 0 && (
                                         <>
                                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '25px', marginBottom: '10px'}}>
                                                <p style={{...styles.popularLabel, margin: 0}}>RECENT SEARCHES</p>
                                                <span style={styles.clearBtn} onClick={() => {setSearchHistory([]); localStorage.removeItem('farmBuddy_searchHistory')}}>Clear</span>
                                            </div>
                                            {searchHistory.map((historyItem, idx) => (
                                                <div key={`hist-${idx}`} style={styles.historyRow} onClick={() => handleSelectSuggestion(historyItem)}>
                                                    <WiTime3 size={20} color="#888" />
                                                    <span>{historyItem}</span>
                                                </div>
                                            ))}
                                         </>
                                     )}

                                     <p style={styles.popularLabel}>POPULAR CITIES</p>
                                     <div style={styles.popularGrid}>
                                         {popularCities.map(city => (
                                              <div key={city} style={styles.popularChip} onClick={() => handleSelectSuggestion(city)}>{city}</div>
                                         ))}
                                     </div>
                                  </>
                              )}
                              
                              {/* GPS & Live Suggestion Results */}
                              {gpsResult && (
                                <div style={styles.gpsResultCard} onClick={() => handleSelectSuggestion(gpsResult)}>
                                    <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
                                        <MdGpsFixed color="#4CAF50" size={24} />
                                        <div>
                                            <div style={{fontWeight:'bold', fontSize:'16px'}}>{gpsResult.location.name}</div>
                                            <div style={{fontSize:'12px', opacity:0.7}}>{gpsResult.location.region} (Detected)</div>
                                        </div>
                                    </div>
                                    <IoMdAdd size={24} color="#4CAF50"/>
                                </div>
                              )}
                              {suggestions.map((place, idx) => (
                                  <div key={idx} style={styles.suggestionItem} onClick={() => handleSelectSuggestion(place)}>
                                      <span>{place.name}, <span style={{opacity: 0.6, fontSize: '14px'}}>{place.region}</span></span>
                                      <IoMdAdd size={20} color="#aaa"/>
                                  </div>
                              ))}
                          </div>
                      </div>
                  ) : (
                      <>
                          <div style={styles.modalHeader}>
                              <h3>Manage cities</h3>
                              <button onClick={() => setShowCityManager(false)} style={styles.closeModal}><IoMdClose size={24}/></button>
                          </div>
                          <div style={styles.searchBarTrigger} onClick={() => setShowSearchOverlay(true)}>
                              <IoMdSearch size={20} color="#888" />
                              <span style={{color:'#888', marginLeft:'10px'}}>Search for a city...</span>
                          </div>
                          <div style={styles.savedList}>
                              {savedWeatherList.map((city, idx) => (
                                  <div key={idx} style={styles.cityCard} onClick={() => { setCurrentIndex(idx); setShowCityManager(false); }}>
                                      <div style={styles.cardLeft}>
                                          <span style={styles.cardCityName}>{city.location.name}</span>
                                          <span style={{...styles.cardAqi, color: getAqiInfo(city.current.air_quality).color.replace('0.4','1')}}>
                                              AQI: {getAqiInfo(city.current.air_quality).text}
                                          </span>
                                      </div>
                                      <div style={styles.cardRight}>
                                          <span style={styles.cardTemp}>{getTemp(city.current.temp_c)}°</span>
                                          <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
                                              <span style={styles.cardHighLow}>{getTemp(city.forecast.forecastday[0].day.maxtemp_c)}° / {getTemp(city.forecast.forecastday[0].day.mintemp_c)}°</span>
                                              {savedWeatherList.length > 1 && <MdDelete size={20} color="#ff6b6b" onClick={(e) => handleRemoveCity(e, idx)} />}
                                          </div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </>
                  )}
              </div>
          </div>
      )}

      {/* MAIN CONTENT */}
      <div style={styles.scrollContent}>
          <div style={styles.hero}>
              <div style={styles.tempWrapper}>
                  <h1 style={styles.bigTemp}>{getTemp(current.temp_c)}</h1>
                  <span style={styles.celcius}>°{unit}</span>
              </div>
              <p style={styles.condition}>{current.condition.text}</p>
          <div style={{...styles.aqiPill, background: 'transparent' }}>
                  <FaMaskFace /> Air Quality: {aqiInfo.text}
              </div>
          </div>

          <div style={styles.glassSection}>
              <div style={styles.sectionHeader}>
                  <span>Forecast</span>
                  <button onClick={() => setShowFullForecast(!showFullForecast)} style={styles.capsuleBtn}>{showFullForecast ? 'Show Less' : `${forecast.forecastday.length}-Day Forecast`}</button>
              </div>
              {visibleDays.map((day, i) => (
                  <div key={i} style={styles.dailyRow}>
                      <span style={styles.dayName}>{i === 0 ? 'Today' : new Date(day.date).toLocaleDateString('en-US', {weekday:'short'})}</span>
                      <div style={styles.iconGroup}>
                          <img src={day.day.condition.icon} style={{width:'28px'}} alt=""/>
                          {day.day.daily_chance_of_rain > 30 && <span style={styles.rainChance}>{day.day.daily_chance_of_rain}%</span>}
                      </div>
                      <div style={styles.tempRange}>
                          <span style={{fontWeight:'600'}}>{getTemp(day.day.maxtemp_c)}°</span>
                          <span style={{opacity:0.6}}>{getTemp(day.day.mintemp_c)}°</span>
                      </div>
                  </div>
              ))}
          </div>

          <div style={styles.glassSection}>
              <p style={{fontSize:'12px', opacity:0.7, marginBottom:'15px', display:'flex', alignItems:'center', gap:'5px', fontWeight:'600', letterSpacing:'0.5px'}}>
                  <WiTime3 size={18}/> 24-HOUR FORECAST
              </p>
              <div style={styles.hourlyScroll}>
                  {next24Hours.map((h, i) => (
                      <div key={i} style={styles.hourItem}>
                          {/* Extracts just the "HH:mm" from "YYYY-MM-DD HH:mm" safely! */}
                          <span>{i === 0 ? 'Now' : h.time.split(' ')[1]}</span>
                          <img src={h.condition.icon} style={{width:'32px'}} alt=""/>
                          <span style={{fontWeight:'bold'}}>{getTemp(h.temp_c)}°</span>
                      </div>
                  ))}
              </div>
          </div>

          <div style={styles.gridContainer}>
              <div style={styles.leftColumn}>
                  <div style={styles.modernCard}>
                      <div style={styles.cardLabel}><FaWind/> Wind</div>
                      <div style={styles.compassContainer}>
                          <div style={styles.compassCircle}>
                              <div style={{transform: `rotate(${current.wind_degree}deg)`, transition: '1s'}}>
                                 <IoMdNavigate size={24} color="#fff" />
                              </div>
                          </div>
                          <div style={styles.windSpeed}>{current.wind_kph} <span style={{fontSize:'12px'}}>km/h</span></div>
                          <div style={{fontSize:'11px', opacity:0.7, marginTop:'4px', fontWeight:'600'}}>{current.wind_dir} Wind</div>
                      </div>
                  </div>
                  <div style={styles.modernCard}>
                      <div style={styles.cardLabel}>Sun & Moon</div>
                      <div style={styles.sunArcWrapper}>
                          <div style={styles.sunArc}></div>
                          <div style={{
                              position: 'absolute', top: 0, left: '50%', width: '100%', height: '70px',
                              transform: `translateX(-50%) rotate(${(sunPosition / 100 * 180) - 90}deg)`
                          }}>
                              <div style={{
                                  width: '12px', height: '12px', background: '#FFD700', borderRadius: '50%',
                                  position: 'absolute', top: '-6px', left: '50%', transform: 'translateX(-50%)',
                                  boxShadow: '0 0 10px #FFD700'
                              }}></div>
                          </div>
                          <div style={styles.sunTimes}>
                              <div style={{fontSize:'10px', opacity:0.8}}>Sunrise</div>
                              <div style={{fontWeight:'bold'}}>{forecast.forecastday[0].astro.sunrise}</div>
                          </div>
                      </div>
                      <div style={{textAlign:'center', fontSize:'11px', marginTop:'8px', opacity:0.7}}>
                          Sunset: {forecast.forecastday[0].astro.sunset} <br/> Moon: {forecast.forecastday[0].astro.moon_phase}
                      </div>
                  </div>
              </div>

              <div style={styles.rightColumn}>
                  <div style={styles.modernBigCard}>
                      <div style={styles.detailItem}>
                          <div style={styles.cardLabel}><WiHumidity size={22}/> Humidity</div>
                          <div style={styles.cardValue}>{current.humidity}%</div>
                          <div style={{fontSize:'12px', opacity:0.7, marginTop:'2px'}}>Dew point {getTemp(current.dewpoint_c || current.temp_c - 2)}°</div>
                      </div>
                      <div style={styles.detailItem}>
                           <div style={styles.cardLabel}><WiThermometer size={22}/> Real Feel</div>
                           <div style={styles.cardValue}>{getTemp(current.feelslike_c)}°</div>
                           <div style={{fontSize:'12px', opacity:0.7, marginTop:'2px'}}>{current.feelslike_c > current.temp_c ? 'Feels warmer' : 'Similar to actual'}</div>
                      </div>
                      <div style={styles.detailItem}>
                           <div style={styles.cardLabel}>UV Index</div>
                           <div style={styles.cardValue}>{current.uv}</div>
                           <div style={{fontSize:'12px', opacity:0.7, marginTop:'2px'}}>{getUvText(current.uv)}</div>
                      </div>
                      <div style={styles.detailItem}>
                           <div style={styles.cardLabel}><WiBarometer size={22}/> Pressure</div>
                           <div style={styles.cardValue}>{current.pressure_mb}</div>
                           <div style={{fontSize:'12px', opacity:0.7, marginTop:'2px'}}>hPa</div>
                      </div>
                  </div>
              </div>

              <div style={styles.fullWidthCard}>
                    <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                        <div style={styles.cardLabel}><WiRain size={24}/> Chance of Rain</div>
                        <div style={{textAlign:'right', marginLeft:'auto'}}>
                            <div style={{fontSize:'24px', fontWeight:'bold'}}>
                                {forecast.forecastday[0].day.daily_chance_of_rain}%
                            </div>
                            {forecast.forecastday[0].day.totalprecip_mm > 0 && (
                                <div style={{fontSize:'12px', color:'#63c5da', fontWeight:'bold', marginTop:'-2px'}}>
                                    {forecast.forecastday[0].day.totalprecip_mm} mm expected
                                </div>
                            )}
                        </div>
                    </div>
                    <div style={{fontSize:'11px', opacity:0.6, marginTop:'5px'}}>
                        {forecast.forecastday[0].day.daily_chance_of_rain < 10 ? "No rain expected today." :
                         forecast.forecastday[0].day.daily_chance_of_rain < 40 ? "Low chance of rain." :
                         forecast.forecastday[0].day.daily_chance_of_rain < 70 ? "You might need an umbrella." :
                         "High chance of rain. Plan accordingly."}
                    </div>
              </div>
          </div>

          <div style={{height:'100px'}}></div>
      </div>
      </div>
    </div>
  );
};

// --- UPDATED: PADDING FIX & TRANSPARENCY ADDED ONLY TO MODAL/SEARCH UI ---
const styles = {
  container: { position:'fixed', top:0, left:0, width:'100%', height:'100%', color:'white', fontFamily:'"SF Pro Display", sans-serif', background:'#111', textShadow: '0 2px 8px rgba(0,0,0,0.3)', display: 'flex', justifyContent: 'center' },
  videoBg: { position:'absolute', top:0, left:0, width:'100%', height:'100%', objectFit:'cover', zIndex:-2 },
  overlay: { position:'absolute', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.1)', zIndex:-1 },
  appWrapper: { position: 'relative', width: '100%', maxWidth: '500px', height: '100%', display: 'flex', flexDirection: 'column' },
  loadingContainer: { height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#111' },
  skeletonContainer: { width: '80%', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  skeletonBox: { background: '#333', borderRadius: '12px', animation: 'shimmer 1.5s infinite linear', backgroundSize: '400px 100%', backgroundImage: 'linear-gradient(to right, #333 0%, #444 20%, #333 40%, #333 100%)' },

  refreshIndicator: { position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 99, background: 'rgba(0,0,0,0.7)', borderRadius: '50%', padding: '10px' },
  toast: { position: 'absolute', bottom: '80px', left: '50%', background: '#333', color: '#fff', padding: '10px 20px', borderRadius: '25px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', transition: 'all 0.3s ease', zIndex: 1000, whiteSpace: 'nowrap', fontSize: '14px', fontWeight: '500' },
  
  topBar: { display:'flex', justifyContent:'space-between', alignItems:'center', background: 'transparent', backdropFilter: 'blur(12px) saturate(120%) brightness(110%)', WebkitBackdropFilter: 'blur(12px) saturate(120%) brightness(110%)', border: '1px solid rgba(255, 255, 255, 0.1)', borderTop: '1px solid rgba(255, 255, 255, 0.3)', borderLeft: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '40px', padding: '8px 15px', margin: '15px 20px', boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.3), 0 8px 32px rgba(0,0,0,0.15)', zIndex: 10 },
  locationText: { display:'flex', flexDirection:'column', alignItems:'center', flex: 1, overflow: 'hidden', padding: '0 10px', textAlign: 'center' },
  cityTitle: { fontSize:'18px', fontWeight:'700', textShadow:'0 2px 5px rgba(0,0,0,0.5)', letterSpacing:'0.5px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', width:'100%' },
  regionTitle: { fontSize:'11px', opacity:0.9, marginTop:'2px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', width:'100%' },
  iconBtn: { background:'transparent', border:'none', color:'white', cursor:'pointer', padding:'5px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' },
  unitBtn: { background:'rgba(255,255,255,0.2)', border:'1px solid rgba(255,255,255,0.3)', borderRadius:'50%', width:'30px', height:'30px', color:'white', cursor:'pointer', fontSize:'14px', fontWeight:'bold', backdropFilter:'blur(5px)' },
  topRight: { display:'flex', gap:'10px', alignItems: 'center' },
  dotsContainer: { display: 'flex', justifyContent: 'center', gap: '6px', width: '100%', zIndex: 5, marginTop: '-5px', marginBottom: '10px' },
  dot: { height: '6px', borderRadius: '3px', transition: 'all 0.3s ease' },

  hero: { textAlign:'center', marginTop:'20px', marginBottom:'30px' },
  tempWrapper: { display:'flex', justifyContent:'center', alignItems:'flex-start', marginLeft:'15px' },
  bigTemp: { fontSize:'96px', fontWeight:'200', lineHeight:'1', margin:0, letterSpacing: '-2px', textShadow:'0 10px 30px rgba(0,0,0,0.35)' },
  celcius: { fontSize:'30px', fontWeight:'400', marginTop:'15px' },
  condition: { fontSize:'24px', textTransform:'capitalize', margin:'5px 0 15px', fontWeight:'500' },
  aqiPill: { display:'inline-flex', alignItems:'center', gap:'8px', padding:'6px 16px', borderRadius:'30px', fontSize:'14px', backdropFilter:'blur(12px) saturate(120%) brightness(110%)', WebkitBackdropFilter:'blur(12px) saturate(120%) brightness(110%)', border: '1px solid rgba(255, 255, 255, 0.1)', borderTop: '1px solid rgba(255, 255, 255, 0.3)', borderLeft: '1px solid rgba(255, 255, 255, 0.2)', boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.3), 0 4px 15px rgba(0,0,0,0.1)', transition: 'background 0.5s' },

  scrollContent: { flex: 1, overflowY:'auto', padding:'0 20px', scrollbarWidth:'none' },
  
  glassSection: { 
      background: 'transparent', 
      borderRadius:'36px', padding:'20px', marginBottom:'15px', 
      backdropFilter:'blur(12px) saturate(120%) brightness(110%)', WebkitBackdropFilter:'blur(12px) saturate(120%) brightness(110%)', 
      border: '1px solid rgba(255, 255, 255, 0.1)', borderTop: '1px solid rgba(255, 255, 255, 0.3)', borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.3), 0 8px 32px rgba(0, 0, 0, 0.15)'
  },
  sectionHeader: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' },
  capsuleBtn: { background:'rgba(255,255,255,0.15)', border:'none', borderRadius:'20px', padding:'6px 14px', color:'#fff', fontSize:'11px', cursor:'pointer', fontWeight:'600' },

  dailyRow: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' },
  dayName: { flex:1, fontSize:'16px', fontWeight:'500' },
  iconGroup: { flex:1, display:'flex', gap:'5px', alignItems:'center', justifyContent:'center' },
  rainChance: { fontSize:'11px', color:'#63c5da', fontWeight:'bold' },
  tempRange: { flex:1, textAlign:'right', display:'flex', gap:'12px', justifyContent:'flex-end' },

  hourlyScroll: { display:'flex', overflowX:'auto', gap:'25px', paddingBottom:'5px' },
  hourItem: { display:'flex', flexDirection:'column', alignItems:'center', minWidth:'55px', fontSize:'14px' },

  gridContainer: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' },
  leftColumn: { display:'flex', flexDirection:'column', gap:'12px' },
  rightColumn: { display:'flex' },
  
  modernCard: { 
      background: 'transparent', 
      backdropFilter:'blur(12px) saturate(120%) brightness(110%)', WebkitBackdropFilter:'blur(12px) saturate(120%) brightness(110%)', borderRadius:'36px', 
      padding:'18px', aspectRatio:'1/1', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'space-between',
      border: '1px solid rgba(255, 255, 255, 0.1)', borderTop: '1px solid rgba(255, 255, 255, 0.3)', borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.3), 0 8px 32px rgba(0, 0, 0, 0.15)', position: 'relative'
  },
  
  modernBigCard: {
      background: 'transparent',
      backdropFilter:'blur(12px) saturate(120%) brightness(110%)', WebkitBackdropFilter:'blur(12px) saturate(120%) brightness(110%)', borderRadius:'36px', 
      padding:'20px', width:'100%', display:'grid', gridTemplateColumns:'1fr 1fr', gridTemplateRows:'1fr 1fr', gap:'20px',
      border: '1px solid rgba(255, 255, 255, 0.1)', borderTop: '1px solid rgba(255, 255, 255, 0.3)', borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.3), 0 8px 32px rgba(0, 0, 0, 0.15)'
  },
  
  detailItem: { display:'flex', flexDirection:'column', justifyContent:'center' },
  
  fullWidthCard: {
      gridColumn: '1 / -1', background: 'transparent',
      backdropFilter:'blur(12px) saturate(120%) brightness(110%)', WebkitBackdropFilter:'blur(12px) saturate(120%) brightness(110%)', borderRadius:'36px', padding:'20px', 
      border: '1px solid rgba(255, 255, 255, 0.1)', borderTop: '1px solid rgba(255, 255, 255, 0.3)', borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
      marginBottom:'10px', boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.3), 0 8px 32px rgba(0, 0, 0, 0.15)'
  },

  cardLabel: { fontSize:'13px', opacity:0.7, display:'flex', gap:'6px', alignItems:'center', width:'100%', fontWeight:'500' },
  cardValue: { fontSize:'26px', fontWeight:'700', marginTop:'6px' },
  
  compassContainer: { position:'relative', display:'flex', flexDirection:'column', alignItems:'center' },
  compassCircle: { width:'55px', height:'55px', borderRadius:'50%', border:'2px solid rgba(255,255,255,0.3)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'5px' },
  windSpeed: { fontSize:'18px', fontWeight:'bold' },
  sunArcWrapper: { position:'relative', width:'100%', height:'50px', marginTop:'10px', display:'flex', justifyContent:'center' },
  sunArc: { width:'80%', height:'70px', borderTop:'2px solid rgba(255,255,255,0.5)', borderLeft:'2px solid transparent', borderRight:'2px solid transparent', borderRadius:'50% 50% 0 0', position:'absolute', top:0 },
  sunTimes: { textAlign:'center', paddingTop:'15px', fontSize:'12px' },

  // --- FIXED: ADDED boxSizing & DECREASED BACKGROUND OPACITY ---
  modalOverlay: { position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.2)', backdropFilter:'blur(10px)', WebkitBackdropFilter:'blur(10px)', zIndex:100, display:'flex', flexDirection:'column', boxSizing: 'border-box' },
  modalContent: { flex:1, padding:'20px', background:'rgba(0, 0, 0, 0.2)', backdropFilter:'blur(30px) saturate(150%) brightness(115%)', WebkitBackdropFilter:'blur(30px) saturate(150%) brightness(115%)', overflowY:'auto', boxSizing: 'border-box', overflowX: 'hidden' },
  modalHeader: { display:'flex', justifyContent:'center', alignItems:'center', marginBottom:'20px', position:'relative' },
  closeModal: { background:'none', border:'none', color:'#fff', cursor:'pointer', position:'absolute', right:0 },
  
  searchBarTrigger: { 
      background: 'transparent', padding:'14px 20px', borderRadius:'30px', display:'flex', alignItems:'center', marginBottom:'25px', cursor:'pointer',
      border: '1px solid rgba(255, 255, 255, 0.1)', borderTop: '1px solid rgba(255, 255, 255, 0.3)', borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.3), 0 4px 15px rgba(0, 0, 0, 0.1)', backdropFilter:'blur(12px) saturate(120%) brightness(110%)', WebkitBackdropFilter:'blur(12px) saturate(120%) brightness(110%)', boxSizing: 'border-box'
  },
  savedList: { display:'flex', flexDirection:'column', gap:'15px' },
  cityCard: { 
      background: 'transparent', backdropFilter:'blur(12px) saturate(120%) brightness(110%)', WebkitBackdropFilter:'blur(12px) saturate(120%) brightness(110%)', borderRadius:'36px', padding:'25px', 
      display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer', 
      border: '1px solid rgba(255, 255, 255, 0.1)', borderTop: '1px solid rgba(255, 255, 255, 0.3)', borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.3), 0 8px 32px rgba(0, 0, 0, 0.15)', boxSizing: 'border-box'
  },
  cardLeft: { display:'flex', flexDirection: 'column', gap:'5px' },
  cardCityName: { fontSize:'20px', fontWeight:'700' },
  cardAqi: { fontSize:'13px', fontWeight:'bold' },
  cardRight: { display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'5px' },
  cardTemp: { fontSize:'32px', fontWeight:'600' },
  cardHighLow: { fontSize:'13px', opacity:0.6 },

  // --- FIXED: ADDED boxSizing & DECREASED BACKGROUND OPACITY ---
  searchOverlay: { position:'absolute', top:0, left:0, width:'100%', height:'100%', background:'rgba(0, 0, 0, 0.2)', backdropFilter:'blur(30px) saturate(150%) brightness(115%)', WebkitBackdropFilter:'blur(30px) saturate(150%) brightness(115%)', zIndex:200, padding:'20px', boxSizing: 'border-box', overflowX: 'hidden' },
  searchHeader: { display:'flex', alignItems:'center', gap:'15px', marginBottom:'25px', background: 'rgba(255,255,255,0.08)', padding: '12px 20px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', boxSizing: 'border-box' },
  searchInputBig: { flex:1, background:'transparent', border:'none', color:'#fff', fontSize:'18px', outline:'none' },
  suggestionsList: { marginTop:'10px' },
  suggestionItem: { padding:'18px', borderBottom:'1px solid rgba(255,255,255,0.05)', cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:'16px' },
  
  gpsRow: { display:'flex', alignItems:'center', gap:'15px', padding:'15px 20px', background: 'rgba(76, 175, 80, 0.15)', color:'#4CAF50', cursor:'pointer', borderRadius: '16px', fontSize:'16px', fontWeight:'600', border: '1px solid rgba(76, 175, 80, 0.3)', boxSizing: 'border-box' },
  gpsResultCard: { marginTop: '15px', padding: '15px', background: 'rgba(76, 175, 80, 0.1)', borderRadius: '15px', border: '1px solid #4CAF50', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', boxSizing: 'border-box' },
  spinner: { width:'20px', height:'20px', border:'2px solid #fff', borderTop:'2px solid transparent', borderRadius:'50%', animation:'spin 1s linear infinite' },
  
  historyRow: { display:'flex', alignItems:'center', gap:'12px', padding:'15px', color:'#ddd', cursor:'pointer', borderBottom:'1px solid rgba(255,255,255,0.05)', fontSize:'16px', boxSizing: 'border-box' },
  clearBtn: { fontSize: '12px', color: '#ff6b6b', cursor: 'pointer', fontWeight: 'bold' },
  
  popularLabel: { fontSize:'12px', color: '#ddd', marginTop:'30px', marginBottom:'15px', letterSpacing:'1px', fontWeight: 'bold' },
  popularGrid: { display:'flex', flexWrap:'wrap', gap:'10px' },
  popularChip: { background:'rgba(255,255,255,0.1)', padding:'10px 18px', borderRadius:'25px', fontSize:'14px', cursor:'pointer', border:'1px solid rgba(255,255,255,0.2)', color: '#fff', backdropFilter: 'blur(10px)', boxSizing: 'border-box' }
};

export default Weather;