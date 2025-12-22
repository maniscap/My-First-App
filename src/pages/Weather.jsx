import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Weather = () => {
  const navigate = useNavigate();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0); // Force scroll to top
    if (!navigator.geolocation) {
      setError("Geolocation is not supported");
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => fetchWeatherData(position.coords.latitude, position.coords.longitude),
      (err) => { setError("Enable Location Access"); setLoading(false); }
    );
  }, []);

  const fetchWeatherData = async (lat, lon) => {
    try {
      const apiKey = import.meta.env.VITE_WEATHER_KEY;
      const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${lat},${lon}&days=3&aqi=yes&alerts=no`;
      const response = await axios.get(url);
      setWeather(response.data);
      setLoading(false);
    } catch (err) {
      setError("Network Error");
      setLoading(false);
    }
  };

  // --- INLINE BACKGROUND LOGIC ---
  const getBackgroundStyle = () => {
    const baseStyle = {
      position: 'fixed', // 🔒 THIS LOCKS IT TO THE SCREEN
      top: 0, 
      left: 0, 
      width: '100%', 
      height: '100%', 
      zIndex: -1, // Puts it behind everything
      transition: 'background 1s ease'
    };

    if (!weather) return { ...baseStyle, background: '#1a1a1a' };
    
    const isDay = weather.current.is_day;
    const text = weather.current.condition.text.toLowerCase();

    if (!isDay) return { ...baseStyle, background: 'linear-gradient(180deg, #0f2027, #203a43, #2c5364)' };
    if (text.includes('rain')) return { ...baseStyle, background: 'linear-gradient(180deg, #373B44, #4286f4)' };
    if (text.includes('cloud')) return { ...baseStyle, background: 'linear-gradient(180deg, #606c88, #3f4c6b)' };
    return { ...baseStyle, background: 'linear-gradient(180deg, #2980b9, #6dd5fa, #ffffff)' };
  };

  if (loading) return <div style={{height:'100vh', display:'flex', justifyContent:'center', alignItems:'center', color:'white', background:'#222'}}>📡 Loading...</div>;
  if (error) return <div style={{height:'100vh', display:'flex', justifyContent:'center', alignItems:'center', color:'white', background:'#222'}}>⚠️ {error}</div>;
  if (!weather) return null;

  const { current, location, forecast } = weather;

  return (
    <>
      {/* 🔴 1. FIXED BACKGROUND LAYER (INLINE STYLED) */}
      <div style={getBackgroundStyle()}></div>

      {/* 🔴 2. CONTENT LAYER */}
      <div style={styles.contentWrapper}>
        
        {/* Header */}
        <div style={styles.header}>
          <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>← Back</button>
          <div style={{textAlign:'right', color:'white'}}>
            <h2 style={{margin:0}}>{location.name}</h2>
            <p style={{margin:0, fontSize:'12px', opacity:0.8}}>{location.region}</p>
          </div>
        </div>

        {/* Main Temp */}
        <div style={styles.hero}>
          <img src={current.condition.icon} style={{width:'80px'}} alt="icon" />
          <h1 style={{fontSize:'60px', margin:0, color:'white'}}>{Math.round(current.temp_c)}°</h1>
          <p style={{color:'white', margin:0}}>{current.condition.text}</p>
        </div>

        {/* Details Grid */}
        <div style={styles.grid}>
           <DetailBox label="Humidity" value={`${current.humidity}%`} />
           <DetailBox label="Wind" value={`${current.wind_kph} km/h`} />
           <DetailBox label="UV Index" value={current.uv} />
           <DetailBox label="Rain Chance" value={`${forecast.forecastday[0].day.daily_chance_of_rain}%`} />
        </div>

        {/* Hourly Scroll */}
        <div style={styles.scrollBox}>
           <p style={{color:'white', margin:'0 0 10px 0', fontSize:'12px'}}>Hourly Forecast</p>
           <div style={styles.scroller}>
             {forecast.forecastday[0].hour.map((h, i) => {
               if (new Date(h.time).getHours() < new Date().getHours()) return null;
               return (
                 <div key={i} style={styles.hourCard}>
                   <span style={{fontSize:'10px'}}>{new Date(h.time).getHours()}:00</span>
                   <img src={h.condition.icon} style={{width:'30px'}} alt=""/>
                   <strong>{Math.round(h.temp_c)}°</strong>
                 </div>
               )
             })}
           </div>
        </div>

      </div>
    </>
  );
};

const DetailBox = ({ label, value }) => (
  <div style={{background:'rgba(0,0,0,0.2)', padding:'15px', borderRadius:'15px', color:'white', textAlign:'center'}}>
    <div style={{fontSize:'12px', opacity:0.7}}>{label}</div>
    <div style={{fontSize:'18px', fontWeight:'bold'}}>{value}</div>
  </div>
);

const styles = {
  contentWrapper: { padding: '20px', position: 'relative', zIndex: 1 },
  header: { display: 'flex', justifyContent: 'space-between', marginBottom: '30px' },
  backBtn: { background: 'rgba(255,255,255,0.2)', border:'none', color:'white', padding:'8px 15px', borderRadius:'20px' },
  hero: { textAlign: 'center', marginBottom: '30px' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' },
  scrollBox: { background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '20px' },
  scroller: { display: 'flex', overflowX: 'auto', gap: '15px', paddingBottom: '5px' },
  hourCard: { minWidth: '50px', display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'white' }
};

export default Weather;