import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, useMap, useMapEvents, Marker } from 'react-leaflet';
import { ArrowLeft, Navigation, Layers, Heart, MapPin, User, Clock, ChevronDown, Check, Camera } from 'lucide-react';
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
  
  // Accordion State
  const [expandedCard, setExpandedCard] = useState('address'); // default open first card

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
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
      
      * { font-family: 'Outfit', sans-serif; box-sizing: border-box; }
      
      @keyframes heartBeat { 0% { transform: scale(1); } 50% { transform: scale(1.15); } 100% { transform: scale(1); } }
      .heart-pulse { animation: heartBeat 0.8s infinite cubic-bezier(0.215, 0.61, 0.355, 1); }
      .gps-dot { width: 12px; height: 12px; background: #4285F4; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.3); position: absolute; top: 4px; left: 4px; z-index: 2; }
      .gps-pulse { position: absolute; top: 0; left: 0; width: 20px; height: 20px; border-radius: 50%; background: rgba(66, 133, 244, 0.4); animation: pulseRing 1.5s infinite; z-index: 1; }
      .blink-indicator { width: 8px; height: 8px; border-radius: 50%; display: inline-block; animation: blink 1.5s infinite; }
      @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
      .no-scrollbar::-webkit-scrollbar { display: none; }
      .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      
      input:focus, textarea:focus { outline: none !important; border-color: #F84464 !important; background: #fff !important; box-shadow: 0 0 0 4px rgba(248, 68, 100, 0.1); }
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
    <div style={styles.pageBackground}>
        {/* TOP HEADER */}
        <div style={styles.headerGlass}>
            <div style={styles.headerLeft}>
                <div onClick={() => navigate(-1)} style={styles.backCircle}><ArrowLeft size={20} color="#1e293b" strokeWidth={2.5} /></div>
                <div style={{display:'flex', flexDirection:'column'}}>
                    <span style={styles.headerTitleLarge}>Master Setup</span>
                    <span style={styles.headerSubtitle}>Configure your storefront</span>
                </div>
            </div>
            <div style={styles.saveBtnTop}>Save</div>
        </div>

        {/* MAIN SCROLLABLE CONTENT */}
        <div style={styles.scrollableContent} className="no-scrollbar">
            
            {/* CARD 1: ADDRESS */}
            <div style={expandedCard === 'address' ? styles.cardActive : styles.card} onClick={() => setExpandedCard(expandedCard === 'address' ? null : 'address')}>
                <div style={styles.cardHeader}>
                    <div style={styles.cardTitleGroup}>
                        <div style={{...styles.iconBox, background: expandedCard === 'address' ? '#F84464' : '#fff0f2'}}>
                            <MapPin size={22} color={expandedCard === 'address' ? '#FFF' : '#F84464'} />
                        </div>
                        <div>
                            <div style={styles.cardTitle}>Address & Location</div>
                            <div style={styles.cardSub}>Pinpoint your physical store</div>
                        </div>
                    </div>
                    <ChevronDown size={22} color="#cbd5e1" style={{ transform: expandedCard === 'address' ? 'rotate(180deg)' : 'none', transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                </div>
                
                {expandedCard === 'address' && (
                    <div style={styles.cardBody} onClick={e => e.stopPropagation()}>
                        
                        {/* EMBEDDED MAP INSIDE THE CARD */}
                        <div style={styles.mapContainerBox}>
                            <MapContainer center={[coords.lat, coords.lng]} zoom={18} zoomControl={false} style={{height:'100%', width:'100%', borderRadius:'20px'}}>
                                <TileLayer url={getGoogleTileUrl(mapType)} />
                                <MapController coords={coords} isFlying={isFlying} />
                                <MapEventsHandler onMoveStart={handleMapMoveStart} onMoveEnd={handleMapMoveEnd} />
                                {deviceLoc && <Marker position={[deviceLoc.lat, deviceLoc.lng]} icon={gpsIcon} />}
                            </MapContainer>
                            
                            <div style={{ ...styles.centerPin, transform: isDragging ? 'translate(-50%, -120%) scale(1.1)' : 'translate(-50%, -100%) scale(1)' }}>
                                <div className={isDragging ? "heart-pulse" : ""}><Heart size={42} color="#F84464" fill="#F84464" strokeWidth={1} style={styles.heartShadowFilter} /></div>
                                <div style={{ ...styles.pinShadow, transform: isDragging ? 'scale(0.3)' : 'scale(1)', opacity: isDragging ? 0.1 : 0.4 }}></div>
                            </div>

                            <div style={styles.mapControls}>
                                <div style={styles.mapBtnSquare} onClick={(e) => { e.stopPropagation(); setMapType(prev => prev === 'basic' ? 'hybrid' : 'basic'); }}>
                                    <Layers size={18} color="#333" />
                                </div>
                                <div style={styles.mapBtnPill} onClick={(e) => { e.stopPropagation(); handleResetToCurrentLocation(); }}>
                                    <Navigation size={16} color="#F84464" fill="#F84464"/> GPS
                                </div>
                            </div>
                        </div>
                        {/* END MAP */}

                        <div style={styles.formLabel}>EXACT ADDRESS</div>
                        <input style={styles.inputField} placeholder="House / Plot / Farm No.*" />
                        <input style={styles.inputField} placeholder="Landmark (Optional)" />
                        <input style={styles.inputField} placeholder="Village / Area" />
                        
                        <div style={styles.inputRow}>
                            <input style={styles.inputFieldHalf} placeholder="Mandal" />
                            <input style={styles.inputFieldHalf} placeholder="City" />
                        </div>
                        <input style={styles.inputField} placeholder="Pincode" />

                        <div style={styles.formLabel}>STOREFRONT PHOTO</div>
                        <div style={styles.photoUploadBox}>
                            <div style={styles.photoIconCircle}><Camera size={20} color="#F84464" /></div>
                            <div style={{flex:1}}>
                                <div style={styles.photoInstructionsTitle}>Add Location Photo</div>
                                <div style={styles.photoInstructionsSub}>Helps buyers recognize your location</div>
                            </div>
                        </div>

                    </div>
                )}
            </div>

            {/* CARD 2: OWNER */}
            <div style={expandedCard === 'owner' ? styles.cardActive : styles.card} onClick={() => setExpandedCard(expandedCard === 'owner' ? null : 'owner')}>
                <div style={styles.cardHeader}>
                    <div style={styles.cardTitleGroup}>
                        <div style={{...styles.iconBox, background: expandedCard === 'owner' ? '#3b82f6' : '#eff6ff'}}>
                            <User size={22} color={expandedCard === 'owner' ? '#FFF' : '#3b82f6'} />
                        </div>
                        <div>
                            <div style={styles.cardTitle}>Owner & Contact</div>
                            <div style={styles.cardSub}>Names, phone numbers, email</div>
                        </div>
                    </div>
                    <ChevronDown size={22} color="#cbd5e1" style={{ transform: expandedCard === 'owner' ? 'rotate(180deg)' : 'none', transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                </div>
                
                {expandedCard === 'owner' && (
                    <div style={styles.cardBody} onClick={e => e.stopPropagation()}>
                        <div style={styles.formLabel}>BUSINESS TYPE</div>
                        <div style={{display:'flex', gap:'12px', marginBottom:'20px'}}>
                            <div style={styles.chipActive}>Individual</div>
                            <div style={styles.chip}>Organisation</div>
                        </div>
                        
                        <div style={styles.formLabel}>PRIMARY INFO</div>
                        <input style={styles.inputField} placeholder="Shop / Brand Name" />
                        <input style={styles.inputField} placeholder="Owner / Representative Name" />

                        <div style={styles.formLabel}>CONTACT INFO</div>
                        <input style={styles.inputField} placeholder="Primary Phone Number" type="tel" />
                        <input style={styles.inputField} placeholder="Alternate Phone (Optional)" type="tel" />
                        <input style={styles.inputField} placeholder="Email Address (Optional)" type="email" />
                    </div>
                )}
            </div>

            {/* CARD 3: OPERATIONS */}
            <div style={expandedCard === 'operations' ? styles.cardActive : styles.card} onClick={() => setExpandedCard(expandedCard === 'operations' ? null : 'operations')}>
                <div style={styles.cardHeader}>
                    <div style={styles.cardTitleGroup}>
                        <div style={{...styles.iconBox, background: expandedCard === 'operations' ? '#10b981' : '#ecfdf5'}}>
                            <Clock size={22} color={expandedCard === 'operations' ? '#FFF' : '#10b981'} />
                        </div>
                        <div>
                            <div style={styles.cardTitle}>Operations & Delivery</div>
                            <div style={styles.cardSub}>Timings and delivery reach</div>
                        </div>
                    </div>
                    <ChevronDown size={22} color="#cbd5e1" style={{ transform: expandedCard === 'operations' ? 'rotate(180deg)' : 'none', transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                </div>
                
                {expandedCard === 'operations' && (
                    <div style={styles.cardBody} onClick={e => e.stopPropagation()}>
                        <div style={styles.formLabel}>DELIVERY CAPABILITY</div>
                        <div style={{display:'flex', gap:'12px', marginBottom:'20px'}}>
                            <div style={styles.hugeChipActive}>We Deliver</div>
                            <div style={styles.hugeChip}>Pickup Only</div>
                        </div>
                        
                        <div style={styles.formLabel}>OPERATING HOURS</div>
                        <div style={styles.inputRow}>
                            <input style={styles.inputFieldHalf} placeholder="Opens At (e.g. 09:00 AM)" />
                            <input style={styles.inputFieldHalf} placeholder="Closes At (e.g. 08:00 PM)" />
                        </div>
                        
                        <div style={styles.formLabel}>ADDITIONAL DETAILS</div>
                        <textarea style={{...styles.inputField, height:'100px', resize:'none'}} placeholder="Any special instructions or descriptions for your buyers..." />
                    </div>
                )}
            </div>

            <div style={{height: '40px'}}></div>
        </div>
    </div>
  );
};

const styles = {
  pageBackground: { background: '#FAFAFB', height: '100vh', overflow:'hidden', display: 'flex', flexDirection: 'column' },
  
  headerGlass: { background: '#fff', padding:'20px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', zIndex:10, borderBottom:'1px solid rgba(0,0,0,0.03)', boxShadow:'0 4px 20px rgba(0,0,0,0.02)' },
  headerLeft: { display:'flex', alignItems:'center', gap:'14px' },
  backCircle: { width:'38px', height:'38px', borderRadius:'50%', background:'#f1f5f9', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', transition:'0.2s' },
  headerTitleLarge: { fontSize:'20px', fontWeight:'800', color:'#0f172a', letterSpacing:'-0.5px' },
  headerSubtitle: { fontSize:'13px', fontWeight:'600', color:'#64748b' },
  saveBtnTop: { background:'#F84464', color:'white', padding:'8px 16px', borderRadius:'100px', fontSize:'13px', fontWeight:'800', cursor:'pointer', boxShadow:'0 4px 12px rgba(248,68,100,0.2)' },
  
  scrollableContent: { flex:1, overflowY:'auto', padding:'24px 20px' },
  
  card: { background:'#fff', borderRadius:'24px', padding:'22px', marginBottom:'16px', cursor:'pointer', border:'1px solid rgba(0,0,0,0.03)', boxShadow:'0 4px 15px rgba(0,0,0,0.02)', transition:'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' },
  cardActive: { background:'#fff', borderRadius:'24px', padding:'24px', marginBottom:'20px', cursor:'pointer', border:'1px solid rgba(0,0,0,0.05)', boxShadow:'0 12px 35px rgba(0,0,0,0.06)', transition:'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' },
  
  cardHeader: { display:'flex', justifyContent:'space-between', alignItems:'center' },
  cardTitleGroup: { display:'flex', alignItems:'center', gap:'16px' },
  iconBox: { width:'46px', height:'46px', borderRadius:'14px', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.3s' },
  cardTitle: { fontSize:'18px', fontWeight:'800', color:'#0f172a', marginBottom:'2px', letterSpacing:'-0.3px' },
  cardSub: { fontSize:'13px', fontWeight:'500', color:'#64748b' },
  
  cardBody: { marginTop:'24px', cursor:'default', animation:'fadeIn 0.4s ease' },
  
  // MAP STYLES INSIDE CARD
  mapContainerBox: { width:'100%', height:'280px', borderRadius:'20px', position:'relative', overflow:'hidden', marginBottom:'24px', border:'1px solid rgba(0,0,0,0.05)', boxShadow:'0 4px 12px rgba(0,0,0,0.03)' },
  centerPin: { position:'absolute', top:'50%', left:'50%', zIndex:1000, display:'flex', flexDirection:'column', alignItems:'center', pointerEvents:'none', transition:'all 0.3s' },
  heartShadowFilter: { filter: 'drop-shadow(0 6px 12px rgba(248, 68, 100, 0.4))' },
  pinShadow: { width:'16px', height:'6px', background:'rgba(0,0,0,0.15)', borderRadius:'50%', marginTop:'-4px', transition: 'all 0.3s' },
  mapControls: { position:'absolute', bottom:'14px', right:'14px', display:'flex', gap:'10px', zIndex:1000 },
  mapBtnSquare: { background:'rgba(255, 255, 255, 0.95)', backdropFilter:'blur(8px)', width:'40px', height:'40px', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 15px rgba(0,0,0,0.1)', cursor:'pointer' },
  mapBtnPill: { background:'rgba(255, 255, 255, 0.95)', backdropFilter:'blur(8px)', color:'#F84464', padding:'0 16px', borderRadius:'12px', display:'flex', alignItems:'center', gap:'6px', fontSize:'13px', fontWeight:'800', boxShadow:'0 4px 15px rgba(0,0,0,0.1)', cursor:'pointer' },

  // FORM ELEMENTS
  formLabel: { fontSize:'11px', fontWeight:'800', color:'#94a3b8', letterSpacing:'1.5px', marginBottom:'12px', marginTop:'24px' },
  inputField: { width:'100%', background:'#f8fafc', border:'1.5px solid #f1f5f9', borderRadius:'16px', padding:'16px 20px', fontSize:'15px', fontWeight:'600', color:'#0f172a', marginBottom:'12px', transition:'all 0.2s' },
  inputRow: { display:'flex', gap:'12px', marginBottom:'12px' },
  inputFieldHalf: { flex:1, background:'#f8fafc', border:'1.5px solid #f1f5f9', borderRadius:'16px', padding:'16px 20px', fontSize:'15px', fontWeight:'600', color:'#0f172a', transition:'all 0.2s', width:'100%' },
  
  photoUploadBox: { border:'2px dashed #e2e8f0', borderRadius:'20px', padding:'20px', display:'flex', alignItems:'center', gap:'16px', background:'#f8fafc', cursor:'pointer', transition:'0.2s' },
  photoIconCircle: { width:'46px', height:'46px', borderRadius:'50%', background:'#FFF0F2', display:'flex', alignItems:'center', justifyContent:'center' },
  photoInstructionsTitle: { fontSize:'15px', fontWeight:'800', color:'#0f172a', marginBottom:'2px' },
  photoInstructionsSub: { fontSize:'13px', fontWeight:'500', color:'#64748b' },

  chipActive: { flex:1, padding:'14px', borderRadius:'16px', border:'2px solid #F84464', background:'#FFF0F2', fontSize:'14px', fontWeight:'800', color:'#F84464', textAlign:'center', cursor:'pointer' },
  chip: { flex:1, padding:'14px', borderRadius:'16px', border:'2px solid #f1f5f9', background:'#f8fafc', fontSize:'14px', fontWeight:'700', color:'#64748b', textAlign:'center', cursor:'pointer' },

  hugeChipActive: { flex:1, padding:'20px 16px', borderRadius:'16px', border:'2px solid #10b981', background:'#ecfdf5', fontSize:'15px', fontWeight:'800', color:'#10b981', textAlign:'center', cursor:'pointer' },
  hugeChip: { flex:1, padding:'20px 16px', borderRadius:'16px', border:'2px solid #f1f5f9', background:'#f8fafc', fontSize:'15px', fontWeight:'700', color:'#64748b', textAlign:'center', cursor:'pointer' }
};

export default Seller_StorefrontSetup;