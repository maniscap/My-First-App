import React, { useState, useEffect, useRef } from 'react';
import { Marker, Polyline, Polygon, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { 
  FiArrowLeft, FiCalendar, FiImage, FiCamera, FiMoreVertical, FiPlus, FiSearch, FiCheck,
  FiRotateCcw, FiTrash2, FiChevronRight, FiMapPin, FiLoader, FiPause, FiPlay, FiSquare, FiFileText,
  FiUser, FiSettings, FiHelpCircle, FiShare2, FiX, FiFolder, FiEdit2, FiCheckCircle, FiChevronDown, FiZoomIn
} from 'react-icons/fi';
import { FaDrawPolygon, FaRulerCombined, FaMap } from 'react-icons/fa';
import { MdTouchApp, MdDirectionsWalk, MdGpsFixed, MdCameraAlt, MdFlipCameraIos } from 'react-icons/md';

// --- STYLES ---
const glassStyles = `
  .glass-marker-icon { background: transparent; border: none; }
  .glass-marker-inner { width: 14px; height: 14px; background: #fff; border: 2px solid #00e5ff; border-radius: 50%; box-shadow: 0 0 4px rgba(0,0,0,0.4); }
  .ghost-marker-icon { background: transparent; border: none; opacity: 0.8; }
  .ghost-marker-inner { width: 12px; height: 12px; background: rgba(255, 255, 255, 0.7); border: 2px dashed #00e5ff; border-radius: 50%; cursor: pointer; }
  .ghost-marker-icon:hover .ghost-marker-inner { background: #fff; transform: scale(1.2); border-style: solid; }
  .google-loc-pin { width: 16px; height: 16px; background-color: #4285F4; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 0 15px rgba(66, 133, 244, 0.3); animation: pulse-halo 2s infinite; }
  @keyframes pulse-halo { 0% { box-shadow: 0 0 0 0 rgba(66, 133, 244, 0.6); } 70% { box-shadow: 0 0 0 15px rgba(66, 133, 244, 0); } 100% { box-shadow: 0 0 0 0 rgba(66, 133, 244, 0); } }
  .slide-in-left { animation: slideIn 0.3s forwards; }
  @keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
`;
const styleSheet = document.createElement("style");
styleSheet.innerText = glassStyles;
document.head.appendChild(styleSheet);

// Icons
const MainIcon = L.divIcon({ className: 'glass-marker-icon', html: '<div class="glass-marker-inner"></div>', iconSize: [14, 14], iconAnchor: [7, 7] });
const GhostIcon = L.divIcon({ className: 'ghost-marker-icon', html: '<div class="ghost-marker-inner"></div>', iconSize: [12, 12], iconAnchor: [6, 6] });
const CurrentLocIcon = L.divIcon({ className: 'current-loc-icon', html: '<div class="google-loc-pin"></div>', iconSize: [20, 20], iconAnchor: [10, 10] });

const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

const formatCoord = (lat, lng) => {
    if (!lat || !lng) return '';
    const latDir = lat >= 0 ? 'N' : 'S';
    const lngDir = lng >= 0 ? 'E' : 'W';
    return `${Math.abs(lat).toFixed(6)}° ${latDir}, ${Math.abs(lng).toFixed(6)}° ${lngDir}`;
};

const fetchAddress = async (lat, lng) => {
    try {
        const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
        if (!response.ok) return null;
        const data = await response.json();
        return {
            city: data.city || data.locality || "",
            state: data.principalSubdivision || "",
            country: data.countryName || "",
            full: [data.locality, data.city, data.principalSubdivision, data.countryName].filter(Boolean).join(', ')
        };
    } catch (error) { return null; }
};

// --- UNIT CONVERSION ---
const UNITS = {
    distance: { 
        metric: [{ key: 'm', label: 'Meter (m)', factor: 1 }, { key: 'km', label: 'Kilometer (km)', factor: 0.001 }, { key: 'cm', label: 'Centimeter (cm)', factor: 100 }], 
        imperial: [{ key: 'ft', label: 'Foot (ft)', factor: 3.28084 }, { key: 'mi', label: 'Mile (mi)', factor: 0.000621371 }, { key: 'yd', label: 'Yard (yd)', factor: 1.09361 }] 
    },
    area: { 
        metric: [{ key: 'm2', label: 'Square Meter (m²)', factor: 1 }, { key: 'ha', label: 'Hectare (ha)', factor: 0.0001 }, { key: 'km2', label: 'Square KM (km²)', factor: 0.000001 }], 
        imperial: [{ key: 'ac', label: 'Acre (ac)', factor: 0.000247105 }, { key: 'ft2', label: 'Square Foot (ft²)', factor: 10.7639 }, { key: 'mi2', label: 'Square Mile (mi²)', factor: 3.861e-7 }] 
    }
};

const calculateDistance = (points) => { if (points.length < 2) return 0; let totalDistance = 0; for (let i = 0; i < points.length - 1; i++) { totalDistance += L.latLng(points[i]).distanceTo(points[i+1]); } return totalDistance; };
const calculateArea = (points) => { if (points.length < 3) return 0; const earthRadius = 6378137; let area = 0; if (points.length > 2) { for (var i = 0; i < points.length; i++) { var j = (i + 1) % points.length; area += (points[j].lng - points[i].lng) * (2 + Math.sin(points[i].lat * Math.PI / 180) + Math.sin(points[j].lat * Math.PI / 180)); } area = Math.abs(area * earthRadius * earthRadius * Math.PI / 360); } return area; };
const formatDistance = (meters, unitKey = 'm') => { let unit = [...UNITS.distance.metric, ...UNITS.distance.imperial].find(u => u.key === unitKey) || UNITS.distance.metric[0]; return `${(meters * unit.factor).toFixed(2)} ${unit.key}`; };
const formatArea = (sqMeters, unitKey = 'm2') => { let unit = [...UNITS.area.metric, ...UNITS.area.imperial].find(u => u.key === unitKey) || UNITS.area.metric[0]; return `${(sqMeters * unit.factor).toFixed(2)} ${unit.key}`; };
const getMidPoint = (p1, p2) => { return { lat: (p1.lat + p2.lat) / 2, lng: (p1.lng + p2.lng) / 2 }; };

export const MenuOption = ({ icon, label, onClick, subLabel }) => ( <div style={styles.menuOptionContainer} onClick={onClick}> <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end'}}> <span style={styles.menuLabel}>{label}</span> {subLabel && <span style={styles.menuSubLabel}>{subLabel}</span>} </div> <div style={styles.menuIconContainer}> {icon} </div> </div> );

// --- 1. MAIN MENU ---
export const MainMenu = ({ isOpen, onClose, profile, onOpenProfile, onOpenFiles, onOpenGeoCam, onOpenSettings, onOpenHelp }) => {
    if (!isOpen) return null;
    return (
        <div style={styles.menuOverlay} onClick={onClose}>
            <div style={styles.menuSidebar} className="slide-in-left" onClick={(e) => e.stopPropagation()}>
                <div style={styles.menuHeader}>
                    <div style={styles.profileSection} onClick={() => {onOpenProfile(); onClose();}}>
                        {profile?.photo ? <img src={profile.photo} style={styles.avatarImg} alt="Profile"/> : <div style={styles.avatar}><FiUser size={24}/></div>}
                        <div style={{marginLeft: 15}}><div style={{fontWeight:'bold', fontSize:'16px'}}>{profile?.name || 'Guest User'}</div><div style={{fontSize:'12px', color:'#7B5E00'}}>Tap to edit profile</div></div>
                    </div>
                    <button onClick={onClose} style={styles.iconBtnBox}><FiX size={20} color="#555"/></button>
                </div>
                <div style={styles.menuList}>
                    <div style={styles.menuItem} onClick={() => { onOpenFiles(); onClose(); }}><FiFolder size={20} style={{marginRight: 15, color:'#555'}}/> Saved Records</div>
                    <div style={styles.menuItem} onClick={() => { onOpenGeoCam(); onClose(); }}><MdCameraAlt size={20} style={{marginRight: 15, color:'#555'}}/> Geo-Tag Camera</div>
                    <div style={styles.menuItem} onClick={() => { onOpenSettings(); onClose(); }}><FiSettings size={20} style={{marginRight: 15, color:'#555'}}/> Settings</div>
                    <div style={styles.menuItem} onClick={() => { onOpenHelp(); onClose(); }}><FiHelpCircle size={20} style={{marginRight: 15, color:'#555'}}/> Help & Guide</div>
                </div>
                <div style={styles.menuFooter}>FarmCap v2.4</div>
            </div>
        </div>
    );
};

// --- 2. GEO-TAG CAMERA (REDESIGNED WATERMARK) ---
export const GeoTagCamera = ({ onSave, onClose }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const [locData, setLocData] = useState(null);
    const [cameraMode, setCameraMode] = useState('environment'); 
    const [mapTile, setMapTile] = useState(null);

    useEffect(() => {
        startCamera();
        const locInterval = setInterval(() => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(async (pos) => {
                    const { latitude, longitude } = pos.coords;
                    const addrData = await fetchAddress(latitude, longitude);
                    
                    const city = addrData ? `${addrData.city}, ${addrData.state}` : 'Unknown Location';
                    const fullAddr = addrData ? addrData.full : 'Fetching Address...';
                    const dateStr = new Date().toLocaleString('en-GB', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });

                    setLocData({ lat: latitude, lng: longitude, city, address: fullAddr, date: dateStr });

                    if (!mapTile) {
                        const zoom = 15;
                        const tileX = Math.floor((longitude + 180) / 360 * Math.pow(2, zoom));
                        const tileY = Math.floor((1 - Math.log(Math.tan(latitude * Math.PI / 180) + 1 / Math.cos(latitude * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
                        const mapImg = new Image();
                        mapImg.crossOrigin = "Anonymous";
                        mapImg.src = `https://tile.openstreetmap.org/${zoom}/${tileX}/${tileY}.png`;
                        mapImg.onload = () => setMapTile(mapImg);
                    }
                }, (err) => console.warn("Loc Error", err), {enableHighAccuracy: true});
            }
        }, 3000); 

        return () => { stopCamera(); clearInterval(locInterval); };
    }, [cameraMode]);

    const startCamera = async () => {
        stopCamera();
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: cameraMode } });
            setStream(mediaStream);
            if (videoRef.current) videoRef.current.srcObject = mediaStream;
        } catch (err) { alert("Camera access denied."); onClose(); }
    };

    const stopCamera = () => { if (stream) { stream.getTracks().forEach(track => track.stop()); setStream(null); } };

    const takePicture = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // --- UPDATED WATERMARK (Matches Reference) ---
        if (locData) {
            const barHeight = canvas.height * 0.22; // Height of black bar
            const bottomY = canvas.height - barHeight;
            const padding = canvas.width * 0.04;

            // 1. Dark Background Bar
            ctx.fillStyle = "rgba(0, 0, 0, 0.7)"; 
            ctx.fillRect(0, bottomY, canvas.width, barHeight);

            // 2. Map on Left
            if (mapTile) {
                const mapSize = barHeight * 0.8;
                const mapY = bottomY + (barHeight - mapSize)/2;
                const mapX = padding;
                
                ctx.save();
                ctx.beginPath();
                ctx.rect(mapX, mapY, mapSize, mapSize);
                ctx.clip();
                ctx.drawImage(mapTile, mapX, mapY, mapSize, mapSize);
                ctx.restore();
                
                // White Border for Map
                ctx.strokeStyle = "#fff";
                ctx.lineWidth = 3;
                ctx.strokeRect(mapX, mapY, mapSize, mapSize);

                // Red Pin Center
                ctx.fillStyle = "red";
                ctx.beginPath();
                ctx.arc(mapX + mapSize/2, mapY + mapSize/2, mapSize*0.08, 0, Math.PI*2);
                ctx.fill();
            }

            // 3. Text on Right
            const mapWidth = (barHeight * 0.8) + padding;
            const textX = padding + mapWidth + 10;
            let textY = bottomY + padding + (canvas.width * 0.015);

            ctx.textAlign = "left";
            ctx.fillStyle = "white";

            // Title: City (Large)
            ctx.font = `bold ${canvas.width * 0.045}px sans-serif`;
            ctx.fillText(locData.city, textX, textY);
            
            // Full Address (Medium, Multiline check)
            textY += (canvas.width * 0.06);
            ctx.font = `${canvas.width * 0.025}px sans-serif`;
            const addrWords = locData.address.split(' ');
            let line = '';
            for(let n=0; n<addrWords.length; n++) {
                if ((line + addrWords[n]).length > 40) { // Simple wrap
                    ctx.fillText(line, textX, textY);
                    line = addrWords[n] + ' ';
                    textY += (canvas.width * 0.035);
                } else {
                    line += addrWords[n] + ' ';
                }
            }
            ctx.fillText(line, textX, textY);

            // Coordinates & Date (Small)
            textY += (canvas.width * 0.05);
            ctx.font = `${canvas.width * 0.022}px monospace`;
            ctx.fillStyle = "#ddd";
            ctx.fillText(`Lat ${locData.lat.toFixed(6)}  Long ${locData.lng.toFixed(6)}`, textX, textY);
            textY += (canvas.width * 0.035);
            ctx.fillText(locData.date, textX, textY);

            // 4. Logo (Right Side)
            const logoX = canvas.width - padding;
            const logoY = bottomY + padding + 10;
            ctx.textAlign = "right";
            ctx.font = `${canvas.width * 0.06}px serif`;
            ctx.fillText("🧢", logoX, logoY); 
            ctx.font = `bold ${canvas.width * 0.022}px sans-serif`;
            ctx.fillStyle = "#4ade80"; // FarmCap Green/Blue
            ctx.fillText("FarmCap", logoX, logoY + (canvas.width * 0.04));
        }

        setCapturedImage(canvas.toDataURL('image/jpeg', 0.9));
        stopCamera();
    };

    const retake = () => { setCapturedImage(null); startCamera(); };
    const saveImage = () => { onSave(capturedImage, locData || { lat: 0, lng: 0, date: new Date().toLocaleString() }); onClose(); };
    const handleClose = () => { stopCamera(); onClose(); };

    return (
        <div style={styles.fullScreenBlack}>
            <canvas ref={canvasRef} style={{display:'none'}} />
            {!capturedImage ? (
                <>
                    <video ref={videoRef} autoPlay playsInline style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                    <div style={styles.camOverlayContainer}>
                        <div style={styles.camTopBar}>
                            <button onClick={handleClose} style={styles.iconBtn}><FiX size={28}/></button>
                            <span style={{color:'#fff', fontWeight:'bold'}}>FarmCap Cam</span>
                            <div style={{width:28}}></div>
                        </div>
                        <div style={styles.camBottomBar}>
                            <div style={{color:'#fff', marginBottom:20, textAlign:'center'}}>
                                {locData ? <><FiMapPin style={{display:'inline'}}/> {locData.address}</> : <><FiLoader className="loading-spinner"/> Finding Location...</>}
                            </div>
                            <button onClick={takePicture} style={styles.shutterBtn}></button>
                        </div>
                    </div>
                </>
            ) : (
                <div style={{width: '100%', height: '100%', display:'flex', flexDirection:'column', backgroundColor:'#000', position: 'relative'}}>
                    <img src={capturedImage} alt="Captured" style={{width:'100%', height:'100%', objectFit:'contain'}} />
                    <div style={{position: 'absolute', bottom: 30, left: 0, right: 0, display:'flex', gap: 30, justifyContent:'center', zIndex: 50}}>
                        <button onClick={retake} style={{...styles.roundBtn, width: 'auto', padding: '12px 24px', borderRadius: 30, fontWeight:'bold', boxShadow:'0 4px 12px rgba(0,0,0,0.3)'}}>Retake</button>
                        <button onClick={saveImage} style={{...styles.roundBtnGreen, width: 'auto', padding: '12px 36px', borderRadius: 30, fontWeight:'bold', boxShadow:'0 4px 12px rgba(0,0,0,0.3)'}}>Save</button>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- NEW: FULL SCREEN IMAGE VIEWER ---
export const ImageViewer = ({ imageSrc, onClose }) => (
    <div style={{position:'fixed', inset:0, backgroundColor:'#000', zIndex:4000, display:'flex', flexDirection:'column'}}>
        <div style={{padding:20, display:'flex', justifyContent:'flex-end'}}>
            <button onClick={onClose} style={styles.iconBtn}><FiX size={30} color="#fff"/></button>
        </div>
        <div style={{flex:1, display:'flex', alignItems:'center', justifyContent:'center'}}>
            <img src={imageSrc} style={{maxWidth:'100%', maxHeight:'100%', objectFit:'contain'}} alt="Full Preview"/>
        </div>
    </div>
);

// --- UNIT PICKER MODAL (Fixed Z-Index & Visibility) ---
export const UnitPickerModal = ({ type, currentUnit, onClose, onSelect }) => {
    const allUnits = [...UNITS[type].metric, ...UNITS[type].imperial];
    return (
        <div style={{...styles.modalOverlay, zIndex: 9999}}> 
            <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                <div style={styles.modalTitle}>Select Unit</div>
                <div style={{maxHeight: '300px', overflowY: 'auto'}}>
                    {allUnits.map(u => (
                        <div key={u.key} style={styles.settingOption} onClick={() => onSelect(u.key)}>
                            <span style={{color: '#000', fontWeight: '500'}}>{u.label}</span>
                            {currentUnit === u.key && <FiCheckCircle size={20} color="#4ade80"/>}
                        </div>
                    ))}
                </div>
                <div style={styles.modalActions}><button onClick={onClose} style={styles.modalCancelBtn}>Cancel</button></div>
            </div>
        </div>
    );
};

// --- MEASURE TOOL (UPDATED: Dropdown Arrow + Clickable) ---
export const MeasureTool = ({ mode, method, active, onExit, onSave, settings, onUpdateSettings, points, setPoints }) => {
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  
  useMapEvents({ click(e) { const target = e.originalEvent.target; if (target.closest('button') || target.closest('.control-ignore-map') || target.closest('.readout-click')) return; if (active && method === 'manual') setPoints(prev => [...prev, e.latlng]); } });

  const updatePoint = (index, newPos) => { const newPoints = [...points]; newPoints[index] = newPos; setPoints(newPoints); };
  const insertPoint = (index, newPoint) => { const newPoints = [...points]; newPoints.splice(index + 1, 0, newPoint); setPoints(newPoints); };
  const undo = (e) => { if(e) { e.preventDefault(); e.stopPropagation(); } setPoints(prev => prev.slice(0, -1)); }; 
  const clear = (e) => { if(e) { e.preventDefault(); e.stopPropagation(); } setPoints([]); };

  const activeUnit = mode === 'field' ? (settings?.areaUnit || 'm2') : (settings?.distanceUnit || 'm');
  const rawValue = mode === 'field' ? calculateArea(points) : calculateDistance(points);
  const resultText = mode === 'field' ? formatArea(rawValue, activeUnit) : formatDistance(rawValue, activeUnit);
  // Split for nicer formatting
  const [val, ...unitArr] = resultText.split(' ');
  const unitLabel = unitArr.join(' ');

  const handleNext = () => { if (points.length === 0) return; onSave({ points, type: mode, value: resultText }); };

  if (!active) return null;

  return (
    <>
      {mode === 'distance' && points.length > 0 && ( <><Polyline positions={points} pathOptions={{ color: '#00e5ff', weight: 5, opacity: 0.8 }} />{points.map((p, i) => (<Marker key={`v-${i}`} position={p} icon={MainIcon} draggable={true} eventHandlers={{ drag: (e) => updatePoint(i, e.target.getLatLng()), click: (e) => L.DomEvent.stopPropagation(e) }} />))}{points.length > 1 && points.map((p, i) => { if (i === points.length - 1) return null; const nextP = points[i+1]; const mid = getMidPoint(p, nextP); return <Marker key={`m-${i}`} position={mid} icon={GhostIcon} eventHandlers={{ click: (e) => { L.DomEvent.stopPropagation(e); insertPoint(i, mid); } }} />; })}</> )}
      {mode === 'field' && points.length > 0 && ( <><Polygon positions={points} pathOptions={{ color: '#fff', weight: 2, opacity: 1, fillColor: '#00e5ff', fillOpacity: 0.2 }} />{points.map((p, i) => (<Marker key={`v-${i}`} position={p} icon={MainIcon} draggable={true} eventHandlers={{ drag: (e) => updatePoint(i, e.target.getLatLng()), click: (e) => L.DomEvent.stopPropagation(e) }} />))}{points.length > 1 && points.map((p, i) => { const nextP = points[(i + 1) % points.length]; const mid = getMidPoint(p, nextP); if (points.length < 3 && i === points.length - 1) return null; return <Marker key={`m-${i}`} position={mid} icon={GhostIcon} eventHandlers={{ click: (e) => { L.DomEvent.stopPropagation(e); insertPoint(i, mid); } }} />; })}</> )}

      {/* TOP BAR - CLICKABLE UNIT */}
      <div style={styles.measureTopBar}>
          <button onClick={onExit} style={styles.iconBtn}><FiArrowLeft size={24} /></button>
          
          <div style={styles.readout} className="readout-click" onClick={(e) => { e.stopPropagation(); setShowUnitPicker(true); }}>
              <span style={{fontSize: '10px', color: '#aaa', textTransform:'uppercase'}}>MANUAL {mode === 'field' ? 'AREA' : 'DISTANCE'}</span>
              <div style={{display:'flex', alignItems:'center'}}>
                  <span style={{fontSize: '22px', fontWeight: 'bold', color: '#fff', marginRight: 5}}>{val}</span>
                  <span style={{fontSize: '14px', color: '#4ade80', fontWeight: 'bold'}}>{unitLabel}</span>
                  <FiChevronDown color="#aaa" size={18} style={{marginLeft: 5}}/>
              </div>
          </div>

          <button onClick={handleNext} style={styles.saveBtn}>NEXT</button>
      </div>
      
      {showUnitPicker && ( 
          <UnitPickerModal 
              type={mode === 'field' ? 'area' : 'distance'} 
              currentUnit={activeUnit} 
              onClose={() => setShowUnitPicker(false)} 
              onSelect={(newUnit) => { 
                  onUpdateSettings({ ...settings, [mode === 'field' ? 'areaUnit' : 'distanceUnit']: newUnit }); 
                  setShowUnitPicker(false); 
              }} 
          /> 
      )}

      <div style={styles.controlsContainer} className="control-ignore-map" onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
          <button onClick={(e) => undo(e)} style={styles.roundBtn}><FiRotateCcw size={22} color="#000"/></button>
          <button onClick={(e) => clear(e)} style={styles.roundBtnRed}><FiTrash2 size={22}/></button>
      </div>
    </>
  );
};

// --- EXPORTS ---
export const GroupScreen = ({ groups, onSelect, onBack, onCreateGroup }) => { const [searchTerm, setSearchTerm] = useState(''); const [showCreate, setShowCreate] = useState(false); const [newGroupName, setNewGroupName] = useState(''); const filteredGroups = groups.filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase())); const handleCreate = () => { if (!newGroupName.trim()) return; const colors = ['#f87171', '#fbbf24', '#34d399', '#60a5fa']; const randomColor = colors[Math.floor(Math.random() * colors.length)]; onCreateGroup({ name: newGroupName, color: randomColor }); setNewGroupName(''); setShowCreate(false); }; return ( <div style={styles.fullScreenWhite}> <div style={styles.saveHeader}><button onClick={onBack} style={styles.iconBtnWhite}><FiArrowLeft size={24}/></button><span style={styles.headerTitleGold}>Select Group</span><button onClick={() => setShowCreate(true)} style={styles.iconBtnWhite}><FiPlus size={24}/></button></div> <div style={{padding: '15px', backgroundColor: '#fff', borderBottom: '1px solid #eee'}}><div style={{display:'flex', alignItems:'center', backgroundColor: '#f3f4f6', borderRadius: 10, padding: '10px 15px', border: '1px solid #e5e7eb'}}><FiSearch size={20} color="#888"/><input type="text" placeholder="Search groups..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{border:'none', outline:'none', marginLeft: 10, flex: 1, fontSize:'16px', color: '#000', backgroundColor: 'transparent'}}/></div></div> <div style={styles.groupList}> {filteredGroups.map((grp, idx) => ( <div key={idx} style={styles.groupItem} onClick={() => onSelect(grp)}> <div style={{...styles.colorDotLarge, backgroundColor: grp.color, border: grp.name === 'Without group' ? '1px solid #ccc' : 'none'}}></div> <span style={styles.groupName}>{grp.name}</span> </div> ))} </div> {showCreate && ( <div style={styles.modalOverlay}> <div style={styles.modalContent}> <div style={styles.modalTitle}>New Group</div> <input type="text" autoFocus placeholder="Group Name" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} style={styles.modalInput} /> <div style={styles.modalActions}> <button onClick={() => setShowCreate(false)} style={styles.modalCancelBtn}>Cancel</button> <button onClick={handleCreate} style={styles.modalSaveBtn}>Create</button> </div> </div> </div> )} </div> ); };
export const SettingsScreen = ({ settings, onSave, onBack }) => { const [tab, setTab] = useState('metric'); const [distUnit, setDistUnit] = useState(settings?.distanceUnit || 'm'); const [areaUnit, setAreaUnit] = useState(settings?.areaUnit || 'm2'); return ( <div style={styles.fullScreenWhite}> <div style={styles.saveHeader}><button onClick={onBack} style={styles.iconBtnWhite}><FiArrowLeft size={24}/></button><span style={styles.headerTitleGold}>Settings</span><button onClick={() => onSave({distanceUnit: distUnit, areaUnit: areaUnit})} style={styles.headerTextBtn}>SAVE</button></div> <div style={{padding: 20, overflowY:'auto'}}> <div style={styles.tabContainer}> <div style={tab === 'metric' ? styles.tabActive : styles.tabInactive} onClick={() => setTab('metric')}>METRIC</div> <div style={tab === 'imperial' ? styles.tabActive : styles.tabInactive} onClick={() => setTab('imperial')}>IMPERIAL</div> </div> <div style={styles.sectionTitle}>Area Units</div> {UNITS.area[tab].map(u => ( <div key={u.key} style={styles.settingOption} onClick={() => setAreaUnit(u.key)}> <span style={{color: '#000', fontWeight: '500'}}>{u.label}</span> {areaUnit === u.key ? <FiCheckCircle size={22} color="#4ade80"/> : <div style={styles.checkboxEmpty}></div>} </div> ))} <div style={{marginTop: 30, ...styles.sectionTitle}}>Distance Units</div> {UNITS.distance[tab].map(u => ( <div key={u.key} style={styles.settingOption} onClick={() => setDistUnit(u.key)}> <span style={{color: '#000', fontWeight: '500'}}>{u.label}</span> {distUnit === u.key ? <FiCheckCircle size={22} color="#4ade80"/> : <div style={styles.checkboxEmpty}></div>} </div> ))} </div> </div> ); };
export const HelpScreen = ({ onBack }) => { const HelpItem = ({ icon, title, text }) => ( <div style={{display:'flex', marginBottom: 25}}> <div style={{minWidth: 40, height: 40, borderRadius: 8, backgroundColor: '#f0f0f0', display:'flex', alignItems:'center', justifyContent:'center', marginRight: 15}}>{icon}</div> <div><div style={{fontWeight:'bold', marginBottom: 5}}>{title}</div><div style={{fontSize:'14px', color:'#555', lineHeight:'1.4'}}>{text}</div></div> </div> ); return ( <div style={styles.fullScreenWhite}> <div style={styles.saveHeader}><button onClick={onBack} style={styles.iconBtnWhite}><FiArrowLeft size={24}/></button><span style={styles.headerTitleGold}>Help & Guide</span><div style={{width:24}}></div></div> <div style={{padding: 25, overflowY:'auto'}}> <HelpItem icon={<FaRuler size={20} color="#3b82f6"/>} title="Units & Settings" text="Go to Settings to choose between Metric and Imperial systems. You can also tap the measurement text while measuring to quickly switch units."/> <HelpItem icon={<FaRulerCombined size={20} color="#3b82f6"/>} title="Measure" text="Use Manual mode to tap points. Drag points to adjust. Click small ghost points to create new corners. Undo points using the rotate arrow."/> <HelpItem icon={<FiMapPin size={20} color="#ef4444"/>} title="Pin Locations" text="Mark locations using GPS or map tap. Add photos and descriptions."/> <HelpItem icon={<MdCameraAlt size={20} color="#f59e0b"/>} title="Geo-Tag Camera" text="Take photos stamped with location address, coords, and date."/> </div> </div> ); };
export const ProfileEditScreen = ({ profile, onSave, onBack }) => { const [name, setName] = useState(profile?.name || ''); const [photo, setPhoto] = useState(profile?.photo); const fileInputRef = useRef(null); const handlePhotoSelect = async (e) => { if (e.target.files?.[0]) { try { const base64 = await fileToBase64(e.target.files[0]); setPhoto(base64); } catch (err) { alert("Error loading photo"); } } }; return ( <div style={styles.fullScreenWhite}> <div style={styles.saveHeader}><button onClick={onBack} style={styles.iconBtnWhite}><FiArrowLeft size={24}/></button><span style={styles.headerTitleGold}>Edit Profile</span><button onClick={() => onSave({name, photo})} style={styles.headerTextBtn}>SAVE</button></div> <div style={{padding: 30, display: 'flex', flexDirection: 'column', alignItems: 'center'}}> <div style={{position: 'relative', marginBottom: 30}} onClick={() => fileInputRef.current.click()}> {photo ? <img src={photo} style={{width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', border:'4px solid #ddd'}} /> : <div style={{width: 120, height: 120, borderRadius: '50%', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', border:'4px solid #ddd'}}><FiUser size={60} color="#aaa"/></div>} <div style={{position: 'absolute', bottom: 0, right: 0, backgroundColor: '#7B5E00', padding: 8, borderRadius: '50%', color: '#fff'}}><FiEdit2 size={16}/></div> </div> <input type="file" ref={fileInputRef} accept="image/*" style={{display: 'none'}} onChange={handlePhotoSelect}/> <div style={{width: '100%'}}> <label style={styles.inputLabel}>Your Name</label> <div style={styles.fieldContainer}><input type="text" style={styles.inputField} value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your Name" /></div> </div> </div> </div> ); };
export const ImportMenu = ({ onBack, onImport }) => ( <><div style={styles.subMenuHeader}><button onClick={onBack} style={styles.backBtn}><FiArrowLeft size={20} color="#000"/></button><span style={{...styles.subMenuTitle, color:'#000'}}>Select Format</span></div><MenuOption icon={<FiImage size={24} />} label="Image (JPG/PNG)" subLabel="Save to File Manager" onClick={() => onImport('image')} /><MenuOption icon={<FiFileText size={24} />} label="PDF Document" subLabel="Save to File Manager" onClick={() => onImport('pdf')} /><MenuOption icon={<FaMap size={24} />} label="GeoJSON / KML" subLabel="Save to File Manager" onClick={() => onImport('geo')} /></> );
export const MeasureMenu = ({ type, onBack, onStart }) => ( <><div style={styles.subMenuHeader}><button onClick={onBack} style={styles.backBtn}><FiArrowLeft size={20} color="#000"/></button><span style={{...styles.subMenuTitle, color:'#000'}}>{type === 'field' ? "Area Measurement" : "Distance Measurement"}</span></div><MenuOption icon={<MdTouchApp size={24} />} label="Manual Measuring" subLabel="Tap on map" onClick={() => onStart('manual')} /></> );
export const PinMenu = ({ onBack, onStartManual, onStartGPS }) => ( <><div style={styles.subMenuHeader}><button onClick={onBack} style={styles.backBtn}><FiArrowLeft size={20} color="#000"/></button><span style={{...styles.subMenuTitle, color:'#000'}}>Pin Location</span></div><MenuOption icon={<MdTouchApp size={24} />} label="Manual Pin" subLabel="Tap on map to place" onClick={onStartManual} /><MenuOption icon={<MdGpsFixed size={24} />} label="GPS Location" subLabel="Use current device location" onClick={onStartGPS} /></> );
export const FileManager = ({ onClose, files = [], onDelete, onEdit, onPreview }) => { const handleShare = async (file) => { if (navigator.share) { try { let shareData = { title: file.details.title, text: `Location: ${file.details.title}` }; if (file.details.photo) { const blob = await (await fetch(file.details.photo)).blob(); const imageFile = new File([blob], "geo-tag.jpg", { type: blob.type }); if (navigator.canShare && navigator.canShare({ files: [imageFile] })) { shareData.files = [imageFile]; } } await navigator.share(shareData); } catch (err) { console.log("Share cancelled"); } } else { alert("Sharing not supported."); } }; return ( <div style={styles.fullScreenWhite}> <div style={styles.saveHeader}><button onClick={onClose} style={styles.iconBtnWhite}><FiArrowLeft size={24}/></button><span style={styles.headerTitleGold}>Saved Records</span><div style={{width: 24}}></div></div> <div style={styles.listContainer}> {files.length === 0 ? <div style={{textAlign:'center', color:'#666', marginTop:50}}>No files saved yet.</div> : files.map((file, i) => ( <div key={i} style={styles.fileItem} onClick={() => onPreview(file)}> <div style={styles.fileIcon}>{file.type === 'import' || file.type === 'geo-photo' ? (file.details.fileType === 'image' ? <FiImage color="#3b82f6"/> : <FiFileText color="#f59e0b"/>) : (file.details?.photo ? <img src={file.details.photo} alt="Map" style={styles.thumbImg}/> : (file.type === 'field' ? <FaDrawPolygon color="#4ade80"/> : (file.type === 'marker' ? <FiMapPin color="#f87171"/> : <FaRulerCombined color="#60a5fa"/>)))}</div> <div style={{flex: 1}}><div style={styles.fileName}>{file.details?.title || 'Untitled'}</div><div style={styles.fileDetail}>{file.details?.date} • {file.geometry?.value || 'File'}</div></div> <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}> {onEdit && (file.type === 'field' || file.type === 'distance' || file.type === 'marker') && <button onClick={(e) => { e.stopPropagation(); onEdit(file); }} style={styles.iconBtnGray}><FiEdit2 size={18}/></button>} {onDelete && <button onClick={(e) => { e.stopPropagation(); onDelete(file.id); }} style={styles.iconBtnGray}><FiTrash2 size={18} color="#ef4444"/></button>} <button onClick={(e) => { e.stopPropagation(); handleShare(file); }} style={styles.iconBtnGray}><FiShare2 size={18}/></button> </div> </div> ))} </div> </div> ); };
export const SaveScreen = ({ poiData, setPoiData, onBack, onSave, onOpenGroupBtn, geometryData }) => { const [photoPreview, setPhotoPreview] = useState(null); const [addressText, setAddressText] = useState(null); const [loadingAddresses, setLoadingAddresses] = useState(false); const [currentTime, setCurrentTime] = useState(new Date()); const fileInputRef = useRef(null); const pointsList = geometryData?.points || (geometryData?.type === 'marker' ? geometryData.points : []); useEffect(() => { const timer = setInterval(() => setCurrentTime(new Date()), 60000); return () => clearInterval(timer); }, []); useEffect(() => { if (pointsList.length > 0) { setLoadingAddresses(true); const loadAddress = async () => { if(pointsList[0]) { const addr = await fetchAddress(pointsList[0].lat, pointsList[0].lng); if (addr) { const formatted = [ addr.village || addr.town || addr.suburb, addr.county || addr.state_district, addr.state, addr.country ].filter(Boolean).join(', '); setAddressText(formatted); } else { setAddressText("Location details unavailable"); } } setLoadingAddresses(false); }; loadAddress(); } }, [geometryData]); const handlePhotoSelect = async (e) => { if (e.target.files && e.target.files[0]) { const file = e.target.files[0]; try { const base64String = await fileToBase64(file); setPhotoPreview(base64String); setPoiData({ ...poiData, photo: base64String }); } catch (err) { alert("Error processing photo"); } } }; const formattedDate = currentTime.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); const formattedTime = currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}); return ( <div style={styles.fullScreenWhite}> <div style={styles.saveHeader}><button onClick={onBack} style={styles.iconBtnWhite}><FiArrowLeft size={24}/></button><span style={styles.headerTitleGold}>Save POI</span><button onClick={() => onSave(poiData)} style={styles.headerTextBtn}>SAVE</button></div> <div style={styles.formContainer}> <div style={styles.inputGroup}><label style={styles.inputLabel}>Title</label><div style={styles.fieldContainer}><input type="text" style={styles.inputField} placeholder="Enter title" value={poiData.title} onChange={(e) => setPoiData({...poiData, title: e.target.value})}/></div></div> <div style={styles.inputGroup}><label style={styles.inputLabel}>Description</label><div style={styles.fieldContainer}><input type="text" style={styles.inputField} placeholder="Optional description" value={poiData.description} onChange={(e) => setPoiData({...poiData, description: e.target.value})}/></div></div> <div style={styles.inputGroup}><label style={styles.inputLabel}>Group</label><div style={{...styles.fieldContainer, justifyContent: 'space-between', cursor: 'pointer'}} onClick={onOpenGroupBtn}><div style={{display:'flex', alignItems:'center'}}><div style={{...styles.colorDot, backgroundColor: poiData.group.color, border: poiData.group.color === 'transparent' ? '1px solid #ccc' : 'none'}}></div><span style={{color: '#000'}}>{poiData.group.name}</span></div><FiChevronRight size={20} color="#888" /></div></div> <div style={styles.inputGroup}><label style={styles.inputLabel}>Date & Time</label><div style={styles.fieldContainer}><FiCalendar size={20} style={{marginRight: 12, color: '#7B5E00'}}/><span style={{marginRight: 'auto', color: '#000'}}>{formattedDate}</span><span style={{fontSize:'14px', color: '#666'}}>{formattedTime}</span></div></div> <div style={styles.inputGroup}><label style={styles.inputLabel}>Photo</label><div style={styles.photoContainer} onClick={() => fileInputRef.current.click()}><input type="file" accept="image/*" ref={fileInputRef} style={{display: 'none'}} onChange={handlePhotoSelect}/>{photoPreview ? (<div style={{width: '100%', height: '100%', position: 'relative'}}><img src={photoPreview} alt="Preview" style={styles.thumbImg} /><button style={styles.removePhotoBtn} onClick={(e) => { e.stopPropagation(); setPhotoPreview(null); setPoiData({...poiData, photo: null}); }}>X</button></div>) : (<div style={styles.photoPlaceholder}><FiCamera size={30} color="#888" style={{marginBottom: 10}} /><span style={styles.photoText}>Tap to add photo</span></div>)}</div></div> {pointsList.length > 0 && (<div style={styles.inputGroup}><label style={styles.inputLabel}>Location Details ({pointsList.length} points)</label><div style={styles.mainAddressCard}><div style={{display:'flex', alignItems:'center', marginBottom:'5px'}}><FiMapPin size={18} color="#7B5E00" style={{marginRight:8}}/><span style={{fontWeight:'600', color:'#7B5E00'}}>Primary Location</span></div>{loadingAddresses ? (<div style={{display:'flex', alignItems:'center', color:'#666'}}><FiLoader className="loading-spinner" style={{marginRight:8}}/> Fetching address...</div>) : (<div style={{fontSize:'15px', fontWeight:'500', minHeight:'20px', color:'#333'}}>{addressText || "Address unavailable"}</div>)}</div><div style={styles.coordListContainer}>{pointsList.map((pt, idx) => (<div key={idx} style={styles.coordListItem}><div style={{fontWeight:'600', fontSize:'14px', marginBottom:'2px'}}>Point {idx + 1}</div><div style={{fontSize:'13px', color:'#333', fontFamily:'monospace'}}>{formatCoord(pt.lat, pt.lng)}</div></div>))}</div></div>)} </div> </div> ); };

const styles = {
  // ... (Styles same as previous) ...
  fullScreenBlack: { position: 'fixed', inset: 0, backgroundColor: '#000', zIndex: 3000, display: 'flex', flexDirection: 'column' },
  cameraOverlay: { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', zIndex: 10 },
  camTopBar: { padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)' },
  camBottomBar: { padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' },
  shutterBtn: { width: 70, height: 70, borderRadius: '50%', backgroundColor: '#fff', border: '4px solid rgba(255,255,255,0.5)', cursor: 'pointer' },
  menuOptionContainer: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: '15px', cursor: 'pointer' },
  menuLabel: { backgroundColor: '#fff', color: '#000', padding: '8px 12px', borderRadius: '8px', marginRight: '10px', fontWeight: '600', fontSize: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' },
  menuSubLabel: { backgroundColor: 'rgba(255,255,255,0.8)', color: '#555', padding: '4px 8px', borderRadius: '6px', marginRight: '10px', marginTop: '4px', fontWeight: '400', fontSize: '11px', textAlign: 'right' },
  menuIconContainer: { width: '50px', height: '50px', backgroundColor: '#fff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' },
  tabContainer: { display: 'flex', backgroundColor: '#f0f0f0', borderRadius: 12, padding: 4, marginBottom: 25 },
  tabActive: { flex: 1, textAlign: 'center', padding: '10px', backgroundColor: '#7B5E00', color: '#fff', borderRadius: 10, fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' },
  tabInactive: { flex: 1, textAlign: 'center', padding: '10px', color: '#666', cursor: 'pointer' },
  sectionTitle: { fontSize: '14px', fontWeight: 'bold', color: '#888', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '1px' },
  settingOption: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'15px', borderBottom:'1px solid #eee', cursor:'pointer', fontSize: '16px' },
  checkboxEmpty: { width: 22, height: 22, border: '2px solid #ddd', borderRadius: 4 },
  menuOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 3000 },
  menuSidebar: { position: 'absolute', top: 0, left: 0, bottom: 0, width: '280px', backgroundColor: '#fff', boxShadow: '2px 0 10px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column' },
  menuHeader: { padding: '20px', backgroundColor: '#f8f9fa', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  profileSection: { display: 'flex', alignItems: 'center', cursor:'pointer' },
  avatar: { width: 50, height: 50, borderRadius: '50%', backgroundColor: '#ccc', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold' },
  avatarImg: { width: 50, height: 50, borderRadius: '50%', objectFit: 'cover' },
  iconBtnBox: { background: 'none', border: 'none', cursor: 'pointer', padding: 5 },
  menuList: { padding: '20px', flex: 1 },
  menuItem: { display: 'flex', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #f0f0f0', color: '#333', cursor: 'pointer', fontSize: '16px' },
  menuFooter: { padding: '20px', textAlign: 'center', color: '#999', fontSize: '12px', borderTop: '1px solid #eee' },
  measureTopBar: { position: 'absolute', top: 0, left: 0, right: 0, height: '60px', backgroundColor: '#222', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 15px', boxShadow: '0 2px 10px rgba(0,0,0,0.3)' },
  readout: { display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }, 
  saveBtn: { backgroundColor: '#4ade80', border: 'none', borderRadius: '4px', padding: '6px 15px', fontWeight: 'bold', cursor: 'pointer' },
  controlsContainer: { position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999, display: 'flex', gap: '20px', pointerEvents: 'auto', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.95)', padding: '10px 20px', borderRadius: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' },
  roundBtn: { width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#fff', border: '1px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#000' },
  roundBtnRed: { width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#ef4444', color:'#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  roundBtnGreen: { width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#4ade80', color:'#000', border: '4px solid #fff', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  roundBtnYellow: { width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#facc15', color:'#000', border: '4px solid #fff', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  roundBtnSmall: { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#f3f4f6', border: '1px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  roundBtnRedSmall: { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#fee2e2', color:'#ef4444', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  iconBtn: { background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display:'flex', alignItems:'center' },
  iconBtnGray: { background: 'none', border: 'none', color: '#666', cursor: 'pointer', display:'flex', alignItems:'center', padding: 5 },
  subMenuHeader: { display: 'flex', alignItems: 'center', marginBottom: '20px', marginRight: '5px', backgroundColor: '#fff', padding: '5px 10px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
  backBtn: { background: 'none', border: 'none', cursor: 'pointer', display:'flex', alignItems:'center', marginRight: '10px' },
  subMenuTitle: { fontWeight: 'bold', fontSize: '14px', color: '#000' },
  fullScreenWhite: { position: 'fixed', inset: 0, backgroundColor: '#fff', zIndex: 2000, display: 'flex', flexDirection: 'column' },
  saveHeader: { height: '60px', backgroundColor: '#7B5E00', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 15px' },
  iconBtnWhite: { background: 'transparent', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: '5px' },
  headerTitleGold: { color: '#fff', fontSize: '18px', fontWeight: 'bold' },
  headerTextBtn: { background: 'none', border: 'none', color: '#fff', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' },
  listContainer: { padding: '20px', overflowY: 'auto' },
  fileItem: { display: 'flex', alignItems: 'center', padding: '15px', backgroundColor: '#F3F4F6', marginBottom: '10px', borderRadius: '8px', border: '1px solid #e5e7eb', cursor: 'pointer' },
  fileIcon: { width: '50px', height: '50px', borderRadius: '8px', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '15px', border: '1px solid #ddd', overflow: 'hidden' },
  thumbImg: { width:'100%', height:'100%', objectFit:'cover' },
  fileName: { color: '#000', fontWeight: 'bold' },
  fileDetail: { color: '#666', fontSize: '12px' },
  formContainer: { padding: '20px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  inputLabel: { color: '#333', fontSize: '14px', fontWeight: '600', marginLeft: '4px' },
  fieldContainer: { backgroundColor: '#F3F4F6', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', border: '1px solid #E5E7EB', fontSize: '16px', color: '#000' },
  inputField: { flex: 1, backgroundColor: 'transparent', border: 'none', color: '#000', fontSize: '16px', outline: 'none' },
  colorDot: { width: '18px', height: '18px', borderRadius: '50%', marginRight: '12px' },
  photoContainer: { backgroundColor: '#F3F4F6', borderRadius: '12px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', border: '2px dashed #CBD5E1' },
  mainAddressCard: { backgroundColor: '#fff', border: '1px solid #7B5E00', borderRadius: '12px', padding: '15px', marginBottom: '10px', boxShadow: '0 2px 5px rgba(123, 94, 0, 0.1)' },
  coordListContainer: { backgroundColor: '#F3F4F6', borderRadius: '12px', border: '1px solid #E5E7EB', maxHeight: '250px', overflowY: 'auto' },
  coordListItem: { padding: '12px 15px', borderBottom: '1px solid #e5e7eb', display:'flex', flexDirection:'column' },
  photoPlaceholder: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  photoText: { color: '#666', fontSize: '14px', marginTop: '10px' },
  removePhotoBtn: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' },
  groupList: { padding: '20px', flex: 1 },
  groupItem: { display: 'flex', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #E5E7EB', cursor: 'pointer' },
  colorDotLarge: { width: '40px', height: '40px', borderRadius: '50%', marginRight: '15px' },
  groupName: { color: '#000', fontSize: '16px', fontWeight: '500' },
  modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60 },
  modalContent: { backgroundColor: '#fff', borderRadius: '16px', padding: '25px', width: '85%', maxWidth: '320px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' },
  modalTitle: { color: '#000', fontSize: '20px', fontWeight: 'bold', marginBottom: '25px' },
  modalLabel: { display: 'block', color: '#666', fontSize: '14px', marginBottom: '8px' },
  modalInput: { width: '100%', backgroundColor: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: '8px', color: '#000', fontSize: '16px', padding: '10px 12px', marginBottom: '20px', outline: 'none' },
  colorGrid: { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px', marginBottom: '30px' },
  colorSwatch: { width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s ease' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '15px' },
  modalCancelBtn: { background: 'none', border: 'none', color: '#666', fontSize: '16px', cursor: 'pointer', padding: '8px 12px' },
  modalSaveBtn: { backgroundColor: '#7B5E00', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', padding: '8px 20px' },
};