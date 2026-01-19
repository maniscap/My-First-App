import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function GPSMeasure() {
  const navigate = useNavigate();
  const [points, setPoints] = useState([]);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [area, setArea] = useState(0);

  const addPoint = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const newPoint = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          id: Date.now()
        };
        setPoints([...points, newPoint]);
      });
    } else {
      alert("GPS not available");
    }
  };

  const reset = () => {
    setPoints([]);
    setArea(0);
    setIsMeasuring(false);
  };

  // Mock calculation for display purposes
  const calculateArea = () => {
    // In a real app, use the 'turf.js' library or Shoelace formula here
    if (points.length < 3) {
      alert("Need at least 3 points to calculate area");
      return;
    }
    setArea((Math.random() * 2.5).toFixed(2)); // Mock result for demo
  };

  return (
    <div style={pageStyle}>
      <div style={header}>
        <button onClick={() => navigate('/')} style={backBtn}>← Back</button>
        <h2 style={{margin:0}}>Field Measure</h2>
      </div>

      <div style={mapPlaceholder}>
        <div style={{color:'#666'}}>
           🛰️ Map View Loading... <br/>
           <span style={{fontSize:'12px'}}>(Integrate Google Maps Here)</span>
        </div>
      </div>

      <div style={controls}>
         <div style={statBox}>
            <div style={{fontSize:'12px', color:'#888'}}>Points Taken</div>
            <div style={{fontSize:'24px', fontWeight:'bold'}}>{points.length}</div>
         </div>
         <div style={statBox}>
            <div style={{fontSize:'12px', color:'#888'}}>Est. Area</div>
            <div style={{fontSize:'24px', fontWeight:'bold', color:'#2E7D32'}}>{area} <span style={{fontSize:'14px'}}>Acres</span></div>
         </div>
      </div>

      <div style={actionRow}>
        {!isMeasuring ? (
           <button onClick={() => setIsMeasuring(true)} style={primaryBtn}>Start Measuring</button>
        ) : (
           <>
             <button onClick={addPoint} style={actionBtn}>📍 Add Point</button>
             <button onClick={calculateArea} style={successBtn}>✅ Calculate</button>
           </>
        )}
      </div>

      {isMeasuring && <button onClick={reset} style={resetText}>Reset Measurement</button>}

    </div>
  );
}

const pageStyle = { position:'fixed', width:'100%', height:'100%', background:'#f5f5f5', display:'flex', flexDirection:'column' };
const header = { padding:'20px', background:'white', display:'flex', alignItems:'center', gap:'15px', boxShadow:'0 2px 10px rgba(0,0,0,0.1)' };
const backBtn = { border:'none', background:'transparent', fontSize:'16px', cursor:'pointer' };
const mapPlaceholder = { flex:1, background:'#e0e0e0', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', fontWeight:'bold' };
const controls = { padding:'20px', display:'flex', gap:'10px' };
const statBox = { flex:1, background:'white', padding:'15px', borderRadius:'12px', textAlign:'center', boxShadow:'0 2px 5px rgba(0,0,0,0.05)' };
const actionRow = { padding:'0 20px 20px 20px', display:'flex', gap:'10px' };
const primaryBtn = { flex:1, padding:'18px', borderRadius:'14px', background:'#2196F3', color:'white', border:'none', fontSize:'16px', fontWeight:'bold' };
const actionBtn = { flex:1, padding:'18px', borderRadius:'14px', background:'#333', color:'white', border:'none', fontSize:'16px', fontWeight:'bold' };
const successBtn = { flex:1, padding:'18px', borderRadius:'14px', background:'#4CAF50', color:'white', border:'none', fontSize:'16px', fontWeight:'bold' };
const resetText = { background:'none', border:'none', color:'red', paddingBottom:'20px', cursor:'pointer' };

export default GPSMeasure;