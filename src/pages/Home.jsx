import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Home() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [bgImage, setBgImage] = useState('');

  // --- 1. THE FINAL IMAGES (Watermark Free) ---
  
  // Day: Bright Green Field with Sun
  const dayBg = 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2940&auto=format&fit=crop';
  
  // Night: Dark Field with Glowing Night Sky (Real "Village Night" Vibe)
  const nightBg = 'https://images.unsplash.com/photo-1509773896068-7fd415d91e2e?q=80&w=2940&auto=format&fit=crop';

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now);
      const hour = now.getHours();
      
      // Auto-switch: Night is from 6 PM (18) to 6 AM (6)
      if (hour >= 18 || hour < 6) {
        setBgImage(nightBg);
      } else {
        setBgImage(dayBg);
      }
    };

    updateTime(); 
    const timer = setInterval(updateTime, 1000); 
    return () => clearInterval(timer);
  }, []);

  const dateString = currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const timeString = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    // This container holds the Background Image
    // backgroundColor: 'black' prevents the white flash
    <div style={{
      ...pageStyle, 
      backgroundImage: `url('${bgImage}')`
    }}>
      
      {/* Date & Time - FIXED FONT (Arial = Normal Zero) */}
      <div style={dateTimeContainer}>
        <div style={timeText}>{timeString}</div>
        <div style={dateText}>{dateString}</div>
      </div>

      {/* Content Box */}
      <div style={overlayStyle}>
        <div style={logoContainer}>
          <span style={{fontSize: '50px', display: 'block', marginBottom: '10px'}}>🧢</span>
          <h1 style={cleanTitleStyle}>FARM CAP</h1>
        </div>
        
        <p style={subtitleStyle}>Growing Smarter Together.</p>
        
        <div style={{marginTop: '25px'}}>
          <Link to="/login" style={mainBtn}>🌱 Get Started</Link>
        </div>
      </div>

    </div>
  );
}

// --- STYLES ---
const pageStyle = { 
  position: 'fixed', 
  top: 0, 
  left: 0, 
  width: '100vw', 
  height: '100vh',
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center', 
  textAlign: 'center',
  backgroundColor: 'black', // Kills the white flash
  backgroundSize: 'cover', 
  backgroundPosition: 'center', 
  backgroundRepeat: 'no-repeat',
  transition: 'background-image 1s ease-in-out',
  zIndex: 0 
};

const dateTimeContainer = { 
  position: 'absolute', 
  top: '20px', 
  right: '20px', 
  textAlign: 'right', 
  color: 'white', 
  textShadow: '0 2px 4px rgba(0,0,0,0.8)',
  fontFamily: 'Arial, sans-serif', // Normal Zero (0)
  zIndex: 10 
};

const timeText = { fontSize: '1.5rem', fontWeight: 'bold' };
const dateText = { fontSize: '1rem', opacity: 0.9, marginTop: '5px' };

const overlayStyle = { background: 'rgba(0, 0, 0, 0.6)', padding: '30px 20px', borderRadius: '20px', backdropFilter: 'blur(5px)', border: '1px solid rgba(255,255,255,0.2)', width: '85%', maxWidth: '320px', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)' };
const logoContainer = { marginBottom: '5px' };
const cleanTitleStyle = { fontFamily: "sans-serif", fontSize: '2.8rem', color: '#ffffff', margin: 0, fontWeight: '800', letterSpacing: '3px', textTransform: 'uppercase', textShadow: '0 4px 6px rgba(0,0,0,0.5)' };
const subtitleStyle = { fontSize: '1rem', color: '#ddd', marginTop: '5px', fontWeight: '400', letterSpacing: '0.5px' };
const mainBtn = { textDecoration: 'none', backgroundColor: '#4CAF50', color: 'white', padding: '12px 30px', borderRadius: '50px', fontWeight: '600', fontSize: '16px', boxShadow: '0 4px 15px rgba(76, 175, 80, 0.4)', display: 'inline-block' };

export default Home;