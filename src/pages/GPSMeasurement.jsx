import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents, Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import { 
  FiMenu, FiLayers, FiPlus, FiMinus, FiX,
  FiDownload, FiMapPin, FiSearch, FiArrowLeft, FiMaximize, 
  FiRotateCcw
} from 'react-icons/fi';
import { MdGpsFixed } from 'react-icons/md';
import { FaMapMarkedAlt, FaDrawPolygon, FaRulerHorizontal } from 'react-icons/fa';
import 'leaflet/dist/leaflet.css';

// --- IMPORT EXTENSION ---
// Ensure GpsExtension.jsx is in the same folder
import { MeasureTool, FileManager, SaveScreen, GroupScreen, MenuOption, ImportMenu, MeasureMenu } from './GpsExtension'; 

// Fix Leaflet Icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

const MAP_LAYERS = {
  normal: { url: 'http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', attr: 'Google Maps' },
  hybrid: { url: 'http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', attr: 'Google Hybrid' },
  satellite: { url: 'http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', attr: 'Google Satellite' },
  terrain: { url: 'http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}', attr: 'Google Terrain' }
};

const MapController = ({ setMap }) => {
  const map = useMap();
  useEffect(() => { setMap(map); }, [map, setMap]);
  return null;
};

// --- HELPER: COORDINATE FORMATTER ---
const formatCoordinate = (value, type) => {
    if (value === null || value === undefined) return '--.------° -';
    const direction = type === 'lat' ? (value >= 0 ? 'N' : 'S') : (value >= 0 ? 'E' : 'W');
    return `${Math.abs(value).toFixed(6)}° ${direction}`;
};

const GPSMeasurement = () => {
  const [map, setMap] = useState(null);
  const [activeLayer, setActiveLayer] = useState('hybrid');
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  
  // --- STATES ---
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('main'); 
  const [activeMode, setActiveMode] = useState('default'); // 'default', 'marker', 'field', 'distance'
  
  // Extension States
  const [savedFiles, setSavedFiles] = useState([]);
  const [tempMeasureData, setTempMeasureData] = useState(null); 
  const [showSaveScreen, setShowSaveScreen] = useState(false);
  const [showFileManager, setShowFileManager] = useState(false);
  const [showGroupScreen, setShowGroupScreen] = useState(false);

  // Data states
  const [poiData, setPoiData] = useState({
      title: '', description: '', group: { name: 'Without group', color: 'transparent' }, date: new Date().toLocaleDateString()
  });
  const [groups, setGroups] = useState([
      { name: 'Without group', color: 'transparent' },
      { name: 'My Farm', color: '#4ade80' }
  ]);

  // Search
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Marker Logic State
  const [markerPoints, setMarkerPoints] = useState([]); 

  const handleLocationClick = () => {
    if (!map || !navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
        (pos) => {
            map.flyTo([pos.coords.latitude, pos.coords.longitude], 18);
            setIsLocating(false);
        },
        () => setIsLocating(false),
        { enableHighAccuracy: true } 
    );
  };

  const handleFitBounds = () => {
    if (activeMode === 'marker' && markerPoints.length > 0 && map) {
       const group = new L.featureGroup(markerPoints.map(p => L.marker([p.lat, p.lng])));
       map.fitBounds(group.getBounds().pad(0.1));
    } else {
        alert("No marked points to zoom to.");
    }
  };

  // --- SEARCH LOGIC (FIXED: Uses Photon + Fast Debounce) ---
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 2) { 
        try {
          // Using Photon API (No API Key required, very fast)
          // limit=5: Shows top 5 results
          const response = await fetch(
            `https://photon.komoot.io/api/?q=${searchQuery}&limit=5`
          );
          if (response.ok) {
            const data = await response.json();
            setSearchResults(data.features || []);
          }
        } catch (error) {
          console.error("Search failed:", error);
        }
      } else {
        setSearchResults([]);
      }
    }, 300); // Wait only 300ms (Fast response)
    
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]); 

  // --- SAVE FLOW HANDLERS ---
  const handleSaveInit = (dataFromExtension) => {
      if (dataFromExtension) {
          setTempMeasureData(dataFromExtension);
      } else if (activeMode === 'marker') {
          if (markerPoints.length === 0) { alert("Place marker first."); return; }
          setTempMeasureData({ points: markerPoints, type: 'marker' });
      }
      setPoiData({ ...poiData, title: '', description: '', date: new Date().toLocaleDateString() });
      setShowSaveScreen(true);
  };

  const handleFinalSave = (finalPoiData) => {
      const newFile = {
          id: Date.now(),
          type: activeMode,
          geometry: tempMeasureData,
          details: finalPoiData 
      };
      setSavedFiles([...savedFiles, newFile]);
      setShowSaveScreen(false);
      setMarkerPoints([]);
      setTempMeasureData(null);
      setActiveMode('default');
      alert("Saved successfully!");
  };

  const handleCreateGroup = (newGroup) => {
      setGroups([...groups, newGroup]);
  };

  // --- RENDERERS ---
  const renderTopBar = () => {
    // 1. MARKER MODE BAR (White + Black Strip)
    if (activeMode === 'marker') {
        const lastPoint = markerPoints[markerPoints.length - 1];
        return (
            <>
            <div style={styles.whiteTopBar}> 
                <button onClick={() => { setActiveMode('default'); setMarkerPoints([]); }} style={styles.iconBtnBlack}>
                    <FiArrowLeft size={24} color="#000" />
                </button>
                <span style={styles.centeredTitle}>Marker</span>
                <button onClick={() => handleSaveInit(null)} style={styles.headerTextBtnBlack}>NEXT</button>
            </div>
            <div style={styles.blackCoordStrip}>
                <div style={styles.coordItem}>
                    <span style={styles.coordLabel}>Latitude</span>
                    <span style={styles.coordValue}>{formatCoordinate(lastPoint?.lat, 'lat')}</span>
                </div>
                <div style={styles.coordItem}>
                    <span style={styles.coordLabel}>Longitude</span>
                    <span style={styles.coordValue}>{formatCoordinate(lastPoint?.lng, 'lng')}</span>
                </div>
            </div>
            </>
        );
    }
    // 2. SEARCH BAR
    if (isSearchOpen) {
        return (
            <div style={styles.whiteTopBar}>
                <div style={{width: '100%', display: 'flex', alignItems: 'center'}}>
                    <button onClick={() => setIsSearchOpen(false)} style={styles.iconBtnBlack}><FiArrowLeft size={24} /></button>
                    <div style={styles.searchContainer}>
                        <FiSearch size={20} color="#666" style={{minWidth: '24px'}}/>
                        <input type="text" placeholder="Search village..." style={styles.searchInput} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} autoFocus />
                        {searchQuery && <button onClick={() => {setSearchQuery(''); setSearchResults([]);}} style={styles.clearBtn}><FiX size={18} /></button>}
                    </div>
                </div>
            </div>
        );
    }
    // 3. DEFAULT BAR (REMOVED SAVED BUTTON)
    return (
        <div style={styles.whiteTopBar}>
            <button style={styles.iconBtnBlack}><FiMenu size={24} /></button>
            <span style={styles.centeredTitle}>Map</span>
            <div style={{display:'flex', gap: 10}}>
                <button onClick={() => setIsSearchOpen(true)} style={styles.iconBtnBlack}><FiSearch size={24}/></button>
            </div>
        </div>
    );
  };

  // --- MAIN RENDER ---
  if (showSaveScreen) {
      if (showGroupScreen) return <GroupScreen groups={groups} onSelect={(grp) => { setPoiData({...poiData, group: grp}); setShowGroupScreen(false); }} onBack={() => setShowGroupScreen(false)} onCreateGroup={handleCreateGroup}/>;
      return <SaveScreen poiData={poiData} setPoiData={setPoiData} onBack={() => setShowSaveScreen(false)} onSave={handleFinalSave} onOpenGroupBtn={() => setShowGroupScreen(true)}/>;
  }

  if (showFileManager) return <FileManager onClose={() => setShowFileManager(false)} files={savedFiles} />;

  return (
    <div style={styles.page}>
      
      {/* EXTENSION: MeasureTool has its own top bar, so we only render ours if MeasureTool is inactive */}
      {activeMode !== 'field' && activeMode !== 'distance' && renderTopBar()}

      {/* --- SEARCH RESULTS --- */}
      {isSearchOpen && searchResults.length > 0 && (
          <div style={styles.searchResultsList}>
            {searchResults.map((feature, index) => (
              <div key={index} style={styles.searchResultItem} onClick={() => {
                  if (map) map.flyTo([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], 18);
                  setSearchResults([]); setIsSearchOpen(false);
              }}>
                <div style={{fontWeight: 'bold', color: '#000'}}>{feature.properties.name}</div>
                <div style={{fontSize: '12px', color: '#666'}}>
                    {[
                        feature.properties.city,
                        feature.properties.state, 
                        feature.properties.country
                    ].filter(Boolean).join(', ')}
                </div>
              </div>
            ))}
          </div>
      )}

      {/* --- MAP --- */}
      <MapContainer center={[20.5937, 78.9629]} zoom={5} style={styles.map} zoomControl={false}>
        <TileLayer url={MAP_LAYERS[activeLayer].url} subdomains={['mt0','mt1','mt2','mt3']} />
        <MapController setMap={setMap} />
        
        {/* EXTENSION: Measure Tool (Handles Drawing Logic) */}
        <MeasureTool mode={activeMode} active={activeMode === 'field' || activeMode === 'distance'} onExit={() => setActiveMode('default')} onSave={handleSaveInit}/>
        
        {/* Marker Logic (Local) */}
        {activeMode === 'marker' && <MarkerClickLogic addPoint={(p) => setMarkerPoints([...markerPoints, p])} />}
        {markerPoints.map((p, i) => <Marker key={i} position={p}><Popup>{formatCoordinate(p.lat, 'lat')}, {formatCoordinate(p.lng, 'lng')}</Popup></Marker>)}
      </MapContainer>

      {/* --- CONTROLS --- */}
      {/* Left Controls */}
      <div style={styles.leftControls}>
          {activeMode === 'marker' && <button onClick={() => setMarkerPoints(prev => prev.slice(0, -1))} style={styles.controlBtnWhite}><FiRotateCcw size={22} color="#d32f2f" /></button>}
          {/* Zoom: Push down if marker strip is visible */}
          <div style={{...styles.zoomGroupWhite, marginTop: activeMode === 'marker' ? '40px' : '0'}}>
                <button onClick={() => map && map.zoomIn()} style={styles.zoomBtnTopWhite}><FiPlus size={24} color="#000" /></button>
                <div style={styles.dividerWhite}></div>
                <button onClick={() => map && map.zoomOut()} style={styles.zoomBtnBottomWhite}><FiMinus size={24} color="#000" /></button>
          </div>
      </div>

      {/* Right Controls */}
      {/* Hide right controls if Create Menu or Measure Tool is active */}
      {!isCreateMenuOpen && activeMode !== 'field' && activeMode !== 'distance' && (
      <div style={{...styles.rightControlsTop, top: activeMode === 'marker' ? '120px' : '80px'}}>
        <button onClick={handleFitBounds} style={styles.controlBtnWhite}><FiMaximize size={24} color="#000" /></button>
        <div style={{position: 'relative'}}>
          <button onClick={() => setShowLayerMenu(!showLayerMenu)} style={styles.controlBtnWhite}><FiLayers size={22} color="#000" /></button>
          {showLayerMenu && (
            <div style={styles.layerMenu}>
                 <div style={styles.layerMenuItem} onClick={() => {setActiveLayer('hybrid'); setShowLayerMenu(false)}}>Hybrid</div>
                 <div style={styles.layerMenuItem} onClick={() => {setActiveLayer('normal'); setShowLayerMenu(false)}}>Normal</div>
                 <div style={styles.layerMenuItem} onClick={() => {setActiveLayer('satellite'); setShowLayerMenu(false)}}>Satellite</div>
            </div>
          )}
        </div>
        <button onClick={handleLocationClick} style={styles.controlBtnWhite}><MdGpsFixed size={24} color={isLocating ? '#d97706' : '#000'} /></button>
      </div>
      )}

      {/* Bottom Button */}
      {!isCreateMenuOpen && activeMode === 'default' && (
      <div style={styles.bottomContainer}>
        <button onClick={() => { setIsCreateMenuOpen(true); setActiveMenu('main'); }} style={{...styles.createNewBtnWhite, ...styles.pulsatingBtn}}>
          <FaMapMarkedAlt size={20} style={{marginRight: 8}} /> Create new
        </button>
      </div>
      )}

      {/* Side Menu */}
      {isCreateMenuOpen && ( 
          <>
            <div style={styles.sideMenuContainer}>
                {activeMenu === 'main' && (
                    <>
                        <MenuOption icon={<FiDownload size={24} />} label="Import" onClick={() => setActiveMenu('import')} />
                        <MenuOption icon={<FaDrawPolygon size={24} />} label="Field" onClick={() => setActiveMenu('field')} />
                        <MenuOption icon={<FaRulerHorizontal size={24} />} label="Distance" onClick={() => setActiveMenu('distance')} />
                        <MenuOption icon={<FiMapPin size={24} />} label="Marker" onClick={() => { setIsCreateMenuOpen(false); setActiveMode('marker'); setIsSearchOpen(false); }} />
                    </>
                )}
                {activeMenu === 'import' && <ImportMenu onBack={() => setActiveMenu('main')} />}
                {activeMenu === 'field' && <MeasureMenu type="field" onBack={() => setActiveMenu('main')} onStart={(method) => { setIsCreateMenuOpen(false); setActiveMode('field'); }} />}
                {activeMenu === 'distance' && <MeasureMenu type="distance" onBack={() => setActiveMenu('main')} onStart={(method) => { setIsCreateMenuOpen(false); setActiveMode('distance'); }} />}
            </div>
            <button onClick={() => setIsCreateMenuOpen(false)} style={styles.closeMenuBtn}><FiX size={28} color="#fff"/></button>
        </>
      )}
    </div>
  );
};

const MarkerClickLogic = ({ addPoint }) => {
    useMapEvents({ click(e) { addPoint(e.latlng); } });
    return null;
};

// --- STYLES ---
const styles = {
  page: { position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', backgroundColor: '#fff' },
  whiteTopBar: { position: 'absolute', top: 0, left: 0, right: 0, height: '60px', backgroundColor: '#fff', zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 15px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
  blackCoordStrip: { position: 'absolute', top: '60px', left: 0, right: 0, height: '40px', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 19, display: 'flex', alignItems: 'center', justifyContent: 'space-around', color: '#fff', fontSize: '14px', backdropFilter: 'blur(5px)' },
  coordItem: { display: 'flex', gap: '10px' },
  coordLabel: { color: '#aaa', fontSize: '12px', fontWeight: 'normal' },
  coordValue: { color: '#fff', fontWeight: 'bold' },
  headerTextBtnBlack: { background: 'none', border: 'none', color: '#000', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' },
  centeredTitle: { position: 'absolute', left: '50%', transform: 'translateX(-50%)', color: '#000', fontSize: '20px', fontWeight: 'bold' },
  iconBtnBlack: { background: 'none', border: 'none', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 5, zIndex: 21 },
  map: { flex: 1, zIndex: 0 },
  leftControls: { position: 'absolute', bottom: '30px', left: '15px', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '15px' },
  rightControlsTop: { position: 'absolute', right: '15px', display: 'flex', flexDirection: 'column', gap: '15px', zIndex: 10, alignItems: 'flex-end', transition: 'top 0.3s ease' },
  controlBtnWhite: { width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.15)', cursor: 'pointer' },
  zoomGroupWhite: { display: 'flex', flexDirection: 'column', borderRadius: '12px', backgroundColor: '#fff', border: 'none', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.15)', transition: 'margin-top 0.3s ease' },
  zoomBtnTopWhite: { width: '50px', height: '50px', background: 'transparent', border: 'none', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', borderBottom: '1px solid #f0f0f0' },
  zoomBtnBottomWhite: { width: '50px', height: '50px', background: 'transparent', border: 'none', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  dividerWhite: { height: '1px', backgroundColor: '#eee', width: '30px', margin: '0 auto' },
  bottomContainer: { position: 'absolute', bottom: '30px', left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 10, pointerEvents: 'none' },
  createNewBtnWhite: { backgroundColor: '#fff', color: '#000', border: 'none', borderRadius: '12px', padding: '12px 30px', fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', pointerEvents: 'auto', cursor: 'pointer' },
  pulsatingBtn: { animation: 'pulse 1.5s infinite ease-in-out' },
  sideMenuContainer: { position: 'absolute', bottom: '100px', right: '15px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', zIndex: 20, maxHeight: '400px', overflowY: 'auto' },
  closeMenuBtn: { position: 'absolute', bottom: '30px', right: '15px', width: '50px', height: '50px', backgroundColor: '#4285F4', borderRadius: '12px', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 20 },
  layerMenu: { position: 'absolute', top: 0, right: '60px', backgroundColor: 'rgba(30,30,30,0.95)', padding: '10px', borderRadius: '12px', width: '150px' },
  layerMenuItem: { color: '#fff', padding: '10px', cursor: 'pointer' },
  // Search
  searchContainer: { display: 'flex', alignItems: 'center', backgroundColor: '#f1f1f1', borderRadius: '8px', padding: '0 10px', height: '40px', flex: 1, border: '1px solid #ddd', marginLeft: '10px' },
  searchInput: { border: 'none', background: 'transparent', outline: 'none', fontSize: '16px', width: '100%', color: '#000', marginLeft: '8px' },
  clearBtn: { background: 'transparent', border: 'none', color: '#666', cursor: 'pointer' },
  searchResultsList: { position: 'absolute', top: '60px', left: 0, right: 0, backgroundColor: '#fff', borderBottom: '1px solid #eee', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', zIndex: 50, maxHeight: '40vh', overflowY: 'auto' },
  searchResultItem: { padding: '15px 20px', borderBottom: '1px solid #f0f0f0', cursor: 'pointer' },
};

const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  @keyframes pulse {
    0% { transform: scale(1); box-shadow: 0 4px 20px rgba(0,0,0,0.15); }
    50% { transform: scale(1.05); box-shadow: 0 8px 30px rgba(0,0,0,0.25); }
    100% { transform: scale(1); box-shadow: 0 4px 20px rgba(0,0,0,0.15); }
  }
`;
document.head.appendChild(styleSheet);

export default GPSMeasurement;