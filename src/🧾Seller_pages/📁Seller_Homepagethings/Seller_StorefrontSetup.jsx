import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, useMap, useMapEvents, Marker } from 'react-leaflet';
import { ArrowLeft, Navigation, Layers, Heart } from 'lucide-react';
import L from 'leaflet'; 
import 'leaflet/dist/leaflet.css';

// --- CUSTOM ICONS ---
const gpsIcon = L.divIcon({
  className: 'gps-pulse-icon',
  html: '<div class="gps-dot"></div><div class="gps-pulse"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

// --- MAP SUB-COMPONENTS ---
const MapController = ({ coords, isFlying }) => {
  const map = useMap();
  useEffect(() => { 
    if(isFlying) {
      map.flyTo([coords.lat, coords.lng], 19, { animate: true, duration: 1.5 }); 
    }
  }, [coords, isFlying, map]);
  useEffect(() => {
      const timer = setTimeout(() => { map.invalidateSize(); }, 400); 
      return () => clearTimeout(timer);
  }, [coords, map]); 
  return null;
};

const MapEventsHandler = ({ onMoveStart, onMoveEnd }) => {
  const map = useMapEvents({
    movestart: () => onMoveStart(),
    moveend: () => onMoveEnd(map.getCenter()),
  });
  return null;
};

const Seller_StorefrontSetup = () => {
  const navigate = useNavigate();
  const [deviceLoc, setDeviceLoc] = useState(null); 
  const [gpsStatus, setGpsStatus] = useState('checking'); 
  const [mapType, setMapType] = useState('basic'); 
  const [isDragging, setIsDragging] = useState(false);
  const [coords, setCoords] = useState({ lat: 12.92, lng: 80.22 }); 
  const [isFlying, setIsFlying] = useState(false);

  const requestGPS = () => {
    if (!navigator.geolocation) { setGpsStatus('denied'); return; }
    setGpsStatus('checking');
    navigator.geolocation.getCurrentPosition(
        (pos) => {
            const { latitude, longitude } = pos.coords;
            setDeviceLoc({ lat: latitude, lng: longitude });
            setGpsStatus('active');
            if(!coords.lat) {
                setCoords({ lat: latitude, lng: longitude });
            }
        }, 
        () => { setGpsStatus('denied'); },
        { enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
      @keyframes heartBeat { 0% { transform: scale(1); } 50% { transform: scale(1.15); } 100% { transform: scale(1); } }
      .heart-pulse { animation: heartBeat 0.8s infinite cubic-bezier(0.215, 0.61, 0.355, 1); }
      .gps-dot { width: 12px; height: 12px; background: #4285F4; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.3); position: absolute; top: 4px; left: 4px; z-index: 2; }
      .gps-pulse { position: absolute; top: 0; left: 0; width: 20px; height: 20px; border-radius: 50%; background: rgba(66, 133, 244, 0.4); animation: pulseRing 1.5s infinite; z-index: 1; }
      .blink-indicator { width: 8px; height: 8px; border-radius: 50%; display: inline-block; animation: blink 1.5s infinite; }
      @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
    `;
    document.head.appendChild(styleSheet);
    requestGPS();
    return () => { document.head.removeChild(styleSheet); };
  }, []);

  const handleMapMoveStart = () => { setIsDragging(true); };
  const handleMapMoveEnd = (center) => {
      setIsDragging(false); 
      setCoords({ lat: center.lat, lng: center.lng });
  };

  const handleResetToCurrentLocation = () => {
      requestGPS();
      if(deviceLoc) { 
        setCoords(deviceLoc); 
        setIsFlying(true); 
        setTimeout(() => setIsFlying(false), 1500); 
      }
  };

  const getGoogleTileUrl = (type) => type === 'hybrid' ? "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" : "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}";

  return (
    <div style={styles.pageWhite}>
        <div style={styles.topSection}>
            <div style={styles.headerGlass}>
                <div style={styles.mapHeaderTop}>
                    <div style={styles.mapHeaderLeft}>
                        <div onClick={() => navigate(-1)} style={styles.backCircle}><ArrowLeft size={18} color="#1C1C1C" strokeWidth={3} /></div>
                        <span style={styles.headerTitleLarge}>Storefront Map</span>
                    </div>
                    <div style={{ ...styles.statusBadge, background: gpsStatus === 'active' ? '#E7F9F2' : '#FFF0F0' }} onClick={requestGPS}>
                        <div className="blink-indicator" style={{ background: gpsStatus === 'active' ? '#10B981' : '#F84464' }}></div>
                        <span style={{ fontSize:'10px', fontWeight:'900', color: gpsStatus === 'active' ? '#10B981' : '#F84464' }}> {gpsStatus === 'active' ? 'GPS ACTIVE' : 'NO GPS'} </span>
                    </div>
                </div>
            </div>

            <div style={styles.mapFrameWrapper}>
                <MapContainer center={[coords.lat, coords.lng]} zoom={18} zoomControl={false} style={{height:'100%', width:'100%'}}>
                    <TileLayer url={getGoogleTileUrl(mapType)} />
                    <MapController coords={coords} isFlying={isFlying} />
                    <MapEventsHandler onMoveStart={handleMapMoveStart} onMoveEnd={handleMapMoveEnd} />
                    {deviceLoc && <Marker position={[deviceLoc.lat, deviceLoc.lng]} icon={gpsIcon} />}
                </MapContainer>
                
                <div style={{ ...styles.centerPin, transform: isDragging ? 'translate(-50%, -120%) scale(1.15)' : 'translate(-50%, -100%) scale(1)' }}>
                    <div style={{...styles.blackTooltip, opacity: isDragging ? 0 : 1}}>Storefront Location<div style={styles.blackArrow}></div></div>
                    <div className={isDragging ? "heart-pulse" : ""}><Heart size={48} color="#F84464" fill="#F84464" strokeWidth={1} style={styles.heartShadowFilter} /></div>
                    <div style={{ ...styles.pinShadow, transform: isDragging ? 'scale(0.3)' : 'scale(1)', opacity: isDragging ? 0.1 : 0.4 }}></div>
                </div>
                
                <div style={styles.controlsContainer}>
                    <button style={styles.glassBtnSquare} onClick={() => setMapType(prev => prev === 'basic' ? 'hybrid' : 'basic')}>
                       <Layers size={18} color="#333" />
                       <div style={styles.layerLabel}>{mapType === 'basic' ? 'Hybrid' : 'Map'}</div>
                    </button>
                    <button style={styles.glassBtnPill} onClick={handleResetToCurrentLocation}><Navigation size={16} color="#F84464" fill="#F84464"/> Use Current GPS</button>
                </div>
            </div>
        </div>
    </div>
  );
};

const styles = {
  pageWhite: { background: '#FFF', height: '100vh', overflow:'hidden', display: 'flex', flexDirection: 'column', position:'relative', fontFamily:'"Inter", sans-serif' },
  topSection: { width:'100%', height:'100%', display:'flex', flexDirection:'column', position:'relative', overflow:'hidden' },
  headerGlass: { background: '#fff', padding:'16px 20px 12px 20px', flexShrink: 0, zIndex:10, borderBottom:'1px solid #F2F2F2' },
  mapHeaderTop: { display:'flex', alignItems:'center', justifyContent:'space-between' },
  mapHeaderLeft: { display:'flex', alignItems:'center', gap:'12px' },
  backCircle: { width:'34px', height:'34px', borderRadius:'50%', background:'#F7F7F7', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' },
  headerTitleLarge: { fontSize:'18px', fontWeight:'900', color:'#111' },
  statusBadge: { display:'flex', alignItems:'center', gap:'6px', padding:'6px 12px', borderRadius:'12px', cursor:'pointer' },
  mapFrameWrapper: { flex:1, position:'relative', overflow:'hidden' },
  centerPin: { position:'absolute', top:'50%', left:'50%', zIndex:1000, display:'flex', flexDirection:'column', alignItems:'center', pointerEvents:'none', transition:'all 0.4s' },
  heartShadowFilter: { filter: 'drop-shadow(0 8px 16px rgba(248, 68, 100, 0.4))' },
  pinShadow: { width:'16px', height:'6px', background:'rgba(0,0,0,0.12)', borderRadius:'50%', marginTop:'-4px', transition: 'all 0.3s' },
  blackTooltip: { background:'#1C1C1C', color:'white', fontSize:'10px', padding:'6px 10px', borderRadius:'8px', marginBottom:'8px', fontWeight:'900' },
  blackArrow: { position:'absolute', bottom:'-4px', left:'50%', transform:'translateX(-50%)', width:0, height:0, borderLeft:'4px solid transparent', borderRight:'4px solid transparent', borderTop:'4px solid #1C1C1C' },
  controlsContainer: { position:'absolute', bottom:'35px', right:'18px', left:'18px', display:'flex', justifyContent:'space-between', alignItems:'flex-end', zIndex:1000 },
  glassBtnPill: { background:'rgba(255, 255, 255, 0.95)', backdropFilter:'blur(10px)', color:'#F84464', padding:'12px 18px', borderRadius:'14px', display:'flex', alignItems:'center', gap:'8px', fontSize:'13px', fontWeight:'900', boxShadow:'0 8px 24px rgba(0,0,0,0.08)', border:'none', cursor:'pointer' },
  glassBtnSquare: { background:'rgba(255, 255, 255, 0.95)', backdropFilter:'blur(10px)', width:'46px', height:'46px', borderRadius:'12px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', boxShadow:'0 8px 24px rgba(0,0,0,0.08)', border:'none', cursor:'pointer' },
  layerLabel: { fontSize:'7px', fontWeight:'900', marginTop:'2px', textTransform:'uppercase' },
};

export default Seller_StorefrontSetup;