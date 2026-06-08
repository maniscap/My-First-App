import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, useMap, useMapEvents, Marker } from 'react-leaflet';
import { ArrowLeft, Navigation, Layers, Heart, MapPin, User, Clock, ChevronDown } from 'lucide-react';
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
  const [expandedCard, setExpandedCard] = useState(null); // 'address', 'owner', 'operations'

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
      .no-scrollbar::-webkit-scrollbar { display: none; }
      .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
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
                        <span style={styles.headerTitleLarge}>Storefront Setup</span>
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

        {/* BOTTOM SHEET WITH 3 CARDS */}
        <div style={styles.sheetFlexContainer}>
            <div style={styles.sheetHandle}></div>
            <div style={styles.scrollableFormContent} className="no-scrollbar">
                
                <h4 style={styles.sectionTitleHeader}>STOREFRONT DETAILS</h4>

                {/* CARD 1: ADDRESS */}
                <div style={expandedCard === 'address' ? styles.sectionCardActive : styles.sectionCard} onClick={() => setExpandedCard(expandedCard === 'address' ? null : 'address')}>
                    <div style={styles.cardHeader}>
                        <div style={styles.cardTitleGroup}>
                            <div style={{...styles.iconBox, background: '#FFF0F2'}}><MapPin size={20} color="#F84464" /></div>
                            <div>
                                <div style={styles.cardTitle}>1. Address Details</div>
                                <div style={styles.cardSub}>Shop or Organisation location</div>
                            </div>
                        </div>
                        <ChevronDown size={20} color="#94a3b8" style={{ transform: expandedCard === 'address' ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s ease' }} />
                    </div>
                    {expandedCard === 'address' && (
                        <div style={styles.cardBody} onClick={e => e.stopPropagation()}>
                            <div style={styles.placeholderText}>Address fields will be added here...</div>
                        </div>
                    )}
                </div>

                {/* CARD 2: OWNER */}
                <div style={expandedCard === 'owner' ? styles.sectionCardActive : styles.sectionCard} onClick={() => setExpandedCard(expandedCard === 'owner' ? null : 'owner')}>
                    <div style={styles.cardHeader}>
                        <div style={styles.cardTitleGroup}>
                            <div style={{...styles.iconBox, background: '#eff6ff'}}><User size={20} color="#3b82f6" /></div>
                            <div>
                                <div style={styles.cardTitle}>2. Owner & Contact</div>
                                <div style={styles.cardSub}>Names, phone numbers, email</div>
                            </div>
                        </div>
                        <ChevronDown size={20} color="#94a3b8" style={{ transform: expandedCard === 'owner' ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s ease' }} />
                    </div>
                    {expandedCard === 'owner' && (
                        <div style={styles.cardBody} onClick={e => e.stopPropagation()}>
                            <div style={styles.placeholderText}>Owner contact fields will be added here...</div>
                        </div>
                    )}
                </div>

                {/* CARD 3: OPERATIONS */}
                <div style={expandedCard === 'operations' ? styles.sectionCardActive : styles.sectionCard} onClick={() => setExpandedCard(expandedCard === 'operations' ? null : 'operations')}>
                    <div style={styles.cardHeader}>
                        <div style={styles.cardTitleGroup}>
                            <div style={{...styles.iconBox, background: '#ecfdf5'}}><Clock size={20} color="#10b981" /></div>
                            <div>
                                <div style={styles.cardTitle}>3. Operations & Delivery</div>
                                <div style={styles.cardSub}>Timings and delivery reach</div>
                            </div>
                        </div>
                        <ChevronDown size={20} color="#94a3b8" style={{ transform: expandedCard === 'operations' ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s ease' }} />
                    </div>
                    {expandedCard === 'operations' && (
                        <div style={styles.cardBody} onClick={e => e.stopPropagation()}>
                            <div style={styles.placeholderText}>Operations fields will be added here...</div>
                        </div>
                    )}
                </div>

                <div style={{height: '40px'}}></div>
            </div>
        </div>
    </div>
  );
};

const styles = {
  pageWhite: { background: '#FFF', height: '100vh', overflow:'hidden', display: 'flex', flexDirection: 'column', position:'relative', fontFamily:'"Inter", sans-serif' },
  topSection: { width:'100%', height:'45vh', display:'flex', flexDirection:'column', position:'relative', overflow:'hidden', flexShrink: 0 },
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
  
  sheetFlexContainer: { flex:1, display:'flex', flexDirection:'column', background:'#f8fafc', borderTopLeftRadius:'32px', borderTopRightRadius:'32px', marginTop:'-24px', position:'relative', zIndex:10, boxShadow:'0 -10px 40px rgba(0,0,0,0.08)', overflow:'hidden' },
  sheetHandle: { width:'40px', height:'5px', background:'#e2e8f0', borderRadius:'10px', margin:'16px auto', flexShrink:0 },
  scrollableFormContent: { flex:1, overflowY:'auto', padding:'10px 24px 24px 24px', width:'100%', boxSizing:'border-box' },
  
  sectionTitleHeader: { fontSize:'11px', fontWeight:'900', color:'#94a3b8', letterSpacing:'1.5px', marginBottom:'16px', marginTop: '0' },
  
  sectionCard: { background:'#fff', borderRadius:'20px', padding:'18px 20px', marginBottom:'16px', cursor:'pointer', border:'1px solid #e2e8f0', boxShadow:'0 2px 10px rgba(0,0,0,0.02)', transition:'all 0.3s ease' },
  sectionCardActive: { background:'#fff', borderRadius:'20px', padding:'18px 20px', marginBottom:'16px', cursor:'pointer', border:'2px solid #cbd5e1', boxShadow:'0 8px 20px rgba(0,0,0,0.05)', transition:'all 0.3s ease' },
  
  cardHeader: { display:'flex', justifyContent:'space-between', alignItems:'center' },
  cardTitleGroup: { display:'flex', alignItems:'center', gap:'14px' },
  iconBox: { width:'42px', height:'42px', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center' },
  cardTitle: { fontSize:'16px', fontWeight:'800', color:'#1e293b', marginBottom:'2px' },
  cardSub: { fontSize:'13px', fontWeight:'600', color:'#64748b' },
  
  cardBody: { marginTop:'20px', paddingTop:'20px', borderTop:'1px dashed #e2e8f0', cursor:'default' },
  placeholderText: { fontSize:'14px', color:'#94a3b8', fontStyle:'italic', textAlign:'center', padding:'20px 0' }
};

export default Seller_StorefrontSetup;