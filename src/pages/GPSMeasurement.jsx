import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents, Marker, Popup, ImageOverlay, Circle, Polyline, Polygon } from 'react-leaflet';
import L from 'leaflet';
import { 
  FiMenu, FiLayers, FiPlus, FiMinus, FiX, FiDownload, FiMapPin, FiSearch, FiArrowLeft, FiMaximize, FiRotateCcw, FiClock
} from 'react-icons/fi';
import { MdGpsFixed } from 'react-icons/md';
import { FaMapMarkedAlt, FaDrawPolygon, FaRulerHorizontal } from 'react-icons/fa';
import 'leaflet/dist/leaflet.css';

import { MeasureTool, FileManager, SaveScreen, GroupScreen, MenuOption, ImportMenu, MeasureMenu, PinMenu, MainMenu, GeoTagCamera, ProfileEditScreen, SettingsScreen, HelpScreen, ImageViewer } from './GpsExtension'; 

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

// Custom icon for user location
const UserLocationIcon = L.divIcon({ className: 'google-loc-pin', html: '', iconSize: [16, 16], iconAnchor: [8, 8] });

const MAP_LAYERS = {
  normal: { url: 'https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', attr: 'Google Maps' },
  hybrid: { url: 'https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', attr: 'Google Hybrid' },
  satellite: { url: 'https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', attr: 'Google Satellite' },
  terrain: { url: 'https://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}', attr: 'Google Terrain' }
};

// --- GLOBAL LOCATION CONTROLLER ---
const LocationController = ({ isLocating, onLocationFound }) => {
    const map = useMap();
    const [pos, setPos] = useState(null);
    const [hasCentered, setHasCentered] = useState(false); 

    useEffect(() => {
        if (!navigator.geolocation) { alert("GPS is not supported on this device."); return; }
        navigator.permissions.query({ name: 'geolocation' }).then((result) => { if (result.state === 'denied') alert("Location access is turned off. Please enable GPS in your browser settings to use measurement features."); });

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude, accuracy } = position.coords;
                const newPos = { lat: latitude, lng: longitude, accuracy };
                setPos(newPos);
                if (!hasCentered) { map.flyTo([latitude, longitude], 18); setHasCentered(true); }
                if (onLocationFound) onLocationFound(newPos);
            },
            (err) => { if (err.code === 1) alert("Location access denied. Please turn on GPS."); },
            { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
        );
        return () => navigator.geolocation.clearWatch(watchId);
    }, [map, hasCentered]); 

    useEffect(() => { if (isLocating && pos) { map.flyTo([pos.lat, pos.lng], 18, { animate: true }); } }, [isLocating, pos, map]);

    if (!pos) return null;
    return ( <><Circle center={[pos.lat, pos.lng]} radius={pos.accuracy} pathOptions={{ color: '#4285F4', fillColor: '#4285F4', fillOpacity: 0.15, weight: 1 }} /><Marker position={[pos.lat, pos.lng]} icon={UserLocationIcon} /></> );
};

const MapController = ({ setMap }) => {
  const map = useMap();
  useEffect(() => { setMap(map); }, [map, setMap]);
  return null;
};

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
  
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const [isMainMenuOpen, setIsMainMenuOpen] = useState(false);
  
  const [showGeoCam, setShowGeoCam] = useState(false);
  const [showProfileScreen, setShowProfileScreen] = useState(false);
  const [showSettingsScreen, setShowSettingsScreen] = useState(false);
  const [showHelpScreen, setShowHelpScreen] = useState(false);

  // --- NEW STATE FOR IMAGE PREVIEW MODAL ---
  const [viewImage, setViewImage] = useState(null);

  const [activeMenu, setActiveMenu] = useState('main'); 
  const [activeMode, setActiveMode] = useState('default'); 
  const [measureMethod, setMeasureMethod] = useState('manual'); 

  // --- PERSISTENT SAVED FILES ---
  const [savedFiles, setSavedFiles] = useState(() => {
      const saved = localStorage.getItem('savedFiles');
      return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => { localStorage.setItem('savedFiles', JSON.stringify(savedFiles)); }, [savedFiles]);

  const [tempMeasureData, setTempMeasureData] = useState(null); 
  const [showSaveScreen, setShowSaveScreen] = useState(false);
  const [showFileManager, setShowFileManager] = useState(false);
  const [showGroupScreen, setShowGroupScreen] = useState(false);

  const [userProfile, setUserProfile] = useState({ name: '', photo: null });
  const [appSettings, setAppSettings] = useState({ distanceUnit: 'm', areaUnit: 'm2' });
  const [currentUserLoc, setCurrentUserLoc] = useState(null);

  const [searchHistory, setSearchHistory] = useState([]);

  // --- LIFTED STATE FOR MEASURE POINTS ---
  const [measurePoints, setMeasurePoints] = useState([]);
  const [markerPoints, setMarkerPoints] = useState([]); 
  const [previewData, setPreviewData] = useState(null);

  useEffect(() => {
      const savedProfile = localStorage.getItem('userProfile');
      if (savedProfile) setUserProfile(JSON.parse(savedProfile));
      const savedSettings = localStorage.getItem('appSettings');
      if (savedSettings) setAppSettings(JSON.parse(savedSettings));
      const savedHistory = localStorage.getItem('searchHistory');
      if (savedHistory) setSearchHistory(JSON.parse(savedHistory));
  }, []);

  // --- FIX: CLEAR POINTS ON MODE SWITCH ---
  useEffect(() => {
      setMeasurePoints([]);
      setMarkerPoints([]);
      setPreviewData(null);
  }, [activeMode]);

  const handleSaveProfile = (newProfile) => { setUserProfile(newProfile); localStorage.setItem('userProfile', JSON.stringify(newProfile)); setShowProfileScreen(false); };
  const handleSaveSettings = (newSettings) => { const updated = { ...appSettings, ...newSettings }; setAppSettings(updated); localStorage.setItem('appSettings', JSON.stringify(updated)); setShowSettingsScreen(false); };
  const handleLiveSettingUpdate = (updatedSettings) => { const newSet = { ...appSettings, ...updatedSettings }; setAppSettings(newSet); localStorage.setItem('appSettings', JSON.stringify(newSet)); };

  const addToHistory = (feature) => {
      const newItem = {
          name: feature.properties.name,
          city: [feature.properties.city, feature.properties.state, feature.properties.country].filter(Boolean).join(', '),
          coords: feature.geometry.coordinates
      };
      const updatedHistory = [newItem, ...searchHistory.filter(item => item.name !== newItem.name)].slice(0, 5);
      setSearchHistory(updatedHistory);
      localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
  };

  const fileInputRef = useRef(null);
  const [overlayImage, setOverlayImage] = useState(null);

  const [poiData, setPoiData] = useState({ title: '', description: '', group: { name: 'Without group', color: 'transparent' }, date: new Date().toLocaleDateString() });
  const [groups, setGroups] = useState([ { name: 'Without group', color: 'transparent' }, { name: 'My Farm', color: '#4ade80' } ]);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleLocationClick = () => { if (!map) return; setIsLocating(true); setTimeout(() => setIsLocating(false), 2000); };

  const handleGpsPin = () => {
      if (currentUserLoc) {
          const newPoint = L.latLng(currentUserLoc.lat, currentUserLoc.lng);
          setMarkerPoints(prev => [...prev, newPoint]); 
          setActiveMode('marker');
          setIsCreateMenuOpen(false);
          if (map) map.setView(newPoint, 18);
      } else { alert("Waiting for GPS signal... Make sure location is on."); }
  };

  // --- FIXED FIT BOUNDS LOGIC ---
  const handleFitBounds = () => {
    let pointsToFit = [];
    if (previewData) {
         if (previewData.type === 'marker') pointsToFit = previewData.points;
         else if (previewData.type === 'field' || previewData.type === 'distance') pointsToFit = previewData.points;
    } else if (activeMode === 'marker') {
        pointsToFit = markerPoints;
    } else if (activeMode === 'field' || activeMode === 'distance') {
        pointsToFit = measurePoints;
    }

    if (pointsToFit && pointsToFit.length > 0 && map) {
       const group = new L.featureGroup(pointsToFit.map(p => L.marker([p.lat, p.lng])));
       map.fitBounds(group.getBounds().pad(0.1));
    }
  };

  const handleImportClick = (type) => { if (fileInputRef.current) { if (type === 'image') fileInputRef.current.accept = "image/*"; else if (type === 'pdf') fileInputRef.current.accept = ".pdf"; else if (type === 'geo') fileInputRef.current.accept = ".json,.geojson,.kml"; fileInputRef.current.click(); } };

  const handleFileSelect = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (event) => {
              if (map) {
                  const bounds = map.getBounds().pad(-0.2); 
                  setOverlayImage({ url: event.target.result, bounds: bounds });
                  setIsCreateMenuOpen(false);
                  const newFileEntry = { id: Date.now(), type: 'import', details: { title: file.name, fileType: 'image', date: new Date().toLocaleDateString(), photo: event.target.result }, geometry: { value: (file.size / 1024).toFixed(2) + ' KB' } };
                  setSavedFiles(prev => [newFileEntry, ...prev]);
                  alert("Image Imported to Map & Saved Records.");
              }
          };
          reader.readAsDataURL(file);
      } else {
          const newFileEntry = { id: Date.now(), type: 'import', details: { title: file.name, fileType: 'document', date: new Date().toLocaleDateString(), photo: null }, geometry: { value: (file.size / 1024).toFixed(2) + ' KB' } };
          setSavedFiles(prev => [newFileEntry, ...prev]);
          alert(`File '${file.name}' imported to Saved Records.`);
          setIsCreateMenuOpen(false);
      }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 2) { 
        try { const response = await fetch(`https://photon.komoot.io/api/?q=${searchQuery}&limit=5`); if (response.ok) { const data = await response.json(); setSearchResults(data.features || []); } } catch (error) { }
      } else { setSearchResults([]); }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]); 

  const handleSaveInit = (dataFromExtension) => {
      if (dataFromExtension) setTempMeasureData(dataFromExtension);
      else if (activeMode === 'marker') { if (markerPoints.length === 0) { alert("Place marker first."); return; } setTempMeasureData({ points: markerPoints, type: 'marker' }); }
      setPoiData({ ...poiData, title: '', description: '', date: new Date().toLocaleDateString() });
      setShowSaveScreen(true);
  };

  const handleGeoTagSave = (photoDataUrl, locDetails) => { 
      const newFileEntry = { id: Date.now(), type: 'geo-photo', details: { title: 'Geo-Tagged Photo', fileType: 'image', date: locDetails.date, photo: photoDataUrl }, geometry: { value: `${locDetails.lat.toFixed(4)}, ${locDetails.lng.toFixed(4)}` } }; 
      setSavedFiles(prev => [newFileEntry, ...prev]); 
      alert("Geo-Tagged Photo Saved!"); 
  };
  
  const handleFinalSave = (finalPoiData) => { 
      // If editing, remove old file first
      if (tempMeasureData && tempMeasureData.id) {
           setSavedFiles(prev => prev.filter(f => f.id !== tempMeasureData.id));
      }
      const newFile = { id: tempMeasureData?.id || Date.now(), type: activeMode, geometry: tempMeasureData, details: finalPoiData }; 
      setSavedFiles(prev => [newFile, ...prev]); 
      setShowSaveScreen(false); setMarkerPoints([]); setTempMeasureData(null); setActiveMode('default'); setOverlayImage(null); alert("Saved successfully!"); 
  };
  
  const handleCreateGroup = (newGroup) => { setGroups([...groups, newGroup]); };

  const handleDeleteFile = (id) => {
      if (window.confirm("Are you sure you want to delete this record?")) {
          setSavedFiles(prev => prev.filter(f => f.id !== id));
      }
  };

  const handleEditFile = (file) => {
      setPoiData(file.details);
      setTempMeasureData({ ...file.geometry, id: file.id }); // Include ID to know it's an edit
      setActiveMode(file.type);
      setShowFileManager(false);
      setShowSaveScreen(true);
  };

  const handlePreviewFile = (file) => {
      if (file.type === 'field' || file.type === 'distance' || file.type === 'marker') {
          setPreviewData({ type: file.type, points: file.geometry.points });
          setShowFileManager(false);
          // Auto-zoom to preview after state update
          setTimeout(handleFitBounds, 100); 
      } else if (file.type === 'geo-photo' || (file.type === 'import' && file.details.fileType === 'image')) {
           // Show full screen image
           setViewImage(file.details.photo);
      }
  };

  const renderTopBar = () => {
    if (activeMode === 'marker') {
        const lastPoint = markerPoints[markerPoints.length - 1];
        return ( <><div style={styles.whiteTopBar}> <button onClick={() => { setActiveMode('default'); setMarkerPoints([]); }} style={styles.iconBtnBlack}><FiArrowLeft size={24} color="#000" /></button> <span style={styles.centeredTitle}>Pin Location</span> <button onClick={() => handleSaveInit(null)} style={styles.headerTextBtnBlack}>NEXT</button> </div> <div style={styles.blackCoordStrip}> <div style={styles.coordItem}><span style={styles.coordLabel}>Latitude</span><span style={styles.coordValue}>{formatCoordinate(lastPoint?.lat, 'lat')}</span></div> <div style={styles.coordItem}><span style={styles.coordLabel}>Longitude</span><span style={styles.coordValue}>{formatCoordinate(lastPoint?.lng, 'lng')}</span></div> </div></> );
    }
    if (isSearchOpen) {
        return (
            <div style={styles.whiteTopBar}>
                <div style={{width: '100%', display: 'flex', alignItems: 'center'}}>
                    <button onClick={() => setIsSearchOpen(false)} style={styles.iconBtnBlack}><FiArrowLeft size={24} /></button>
                    <div style={styles.searchContainer}>
                        <FiSearch size={20} color="#666" style={{minWidth: '24px'}}/><input type="text" placeholder="Search village..." style={styles.searchInput} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} autoFocus />{searchQuery && <button onClick={() => {setSearchQuery(''); setSearchResults([]);}} style={styles.clearBtn}><FiX size={18} /></button>}
                    </div>
                </div>
            </div>
        );
    }
    return ( <div style={styles.whiteTopBar}> <button style={styles.iconBtnBlack} onClick={() => previewData ? setPreviewData(null) : setIsMainMenuOpen(true)}>{previewData ? <FiArrowLeft size={24} /> : <FiMenu size={24} />}</button> <span style={styles.centeredTitle}>{previewData ? "Preview" : "Map"}</span> <div style={{display:'flex', gap: 10}}><button onClick={() => setIsSearchOpen(true)} style={styles.iconBtnBlack}><FiSearch size={24}/></button></div> </div> );
  };

  if (showSaveScreen) {
      if (showGroupScreen) return <GroupScreen groups={groups} onSelect={(grp) => { setPoiData({...poiData, group: grp}); setShowGroupScreen(false); }} onBack={() => setShowGroupScreen(false)} onCreateGroup={handleCreateGroup}/>;
      return <SaveScreen poiData={poiData} setPoiData={setPoiData} onBack={() => setShowSaveScreen(false)} onSave={handleFinalSave} onOpenGroupBtn={() => setShowGroupScreen(true)} geometryData={tempMeasureData} />;
  }

  // --- RENDER MODALS & SCREENS ---
  if (viewImage) return <ImageViewer imageSrc={viewImage} onClose={() => setViewImage(null)} />;
  if (showFileManager) return <FileManager onClose={() => setShowFileManager(false)} files={savedFiles} onDelete={handleDeleteFile} onEdit={handleEditFile} onPreview={handlePreviewFile} />;
  if (showGeoCam) return <GeoTagCamera onSave={handleGeoTagSave} onClose={() => setShowGeoCam(false)} />;
  if (showProfileScreen) return <ProfileEditScreen profile={userProfile} onSave={handleSaveProfile} onBack={() => setShowProfileScreen(false)} />;
  if (showSettingsScreen) return <SettingsScreen settings={appSettings} onSave={handleSaveSettings} onBack={() => setShowSettingsScreen(false)} />;
  if (showHelpScreen) return <HelpScreen onBack={() => setShowHelpScreen(false)} />;

  return (
    <div style={styles.page}>
      <MainMenu isOpen={isMainMenuOpen} onClose={() => setIsMainMenuOpen(false)} profile={userProfile} onOpenProfile={() => setShowProfileScreen(true)} onOpenFiles={() => setShowFileManager(true)} onOpenGeoCam={() => setShowGeoCam(true)} onOpenSettings={() => setShowSettingsScreen(true)} onOpenHelp={() => setShowHelpScreen(true)} />
      <input type="file" ref={fileInputRef} style={{display:'none'}} onChange={handleFileSelect} />
      {activeMode !== 'field' && activeMode !== 'distance' && renderTopBar()}

      {isSearchOpen && (
          <div style={styles.searchResultsList}>
            {searchQuery.length === 0 && searchHistory.length > 0 && (
                <>
                    <div style={{padding: '10px 20px', fontSize: '12px', color: '#999', fontWeight: 'bold'}}>RECENT SEARCHES</div>
                    {searchHistory.map((item, index) => (
                        <div key={`hist-${index}`} style={styles.searchResultItem} onClick={() => { if(map) map.flyTo([item.coords[1], item.coords[0]], 18); setIsSearchOpen(false); }}>
                            <div style={{display:'flex', alignItems:'center'}}>
                                <FiClock size={16} color="#999" style={{marginRight: 10}}/>
                                <div><div style={{fontWeight: 'bold', color: '#000'}}>{item.name}</div><div style={{fontSize: '12px', color: '#666'}}>{item.city}</div></div>
                            </div>
                        </div>
                    ))}
                </>
            )}
            {searchResults.map((feature, index) => (
              <div key={index} style={styles.searchResultItem} onClick={() => { 
                  if (map) map.flyTo([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], 18);
                  addToHistory(feature); 
                  setSearchResults([]); 
                  setIsSearchOpen(false);
              }}>
                <div style={{fontWeight: 'bold', color: '#000'}}>{feature.properties.name}</div>
                <div style={{fontSize: '12px', color: '#666'}}>{[feature.properties.city, feature.properties.state, feature.properties.country].filter(Boolean).join(', ')}</div>
              </div>
            ))}
          </div>
      )}

      <MapContainer center={[20.5937, 78.9629]} zoom={5} style={styles.map} zoomControl={false}>
        <TileLayer url={MAP_LAYERS[activeLayer].url} subdomains={['mt0','mt1','mt2','mt3']} />
        <MapController setMap={setMap} />
        
        <LocationController isLocating={isLocating} onLocationFound={setCurrentUserLoc} />

        {overlayImage && <ImageOverlay url={overlayImage.url} bounds={overlayImage.bounds} opacity={0.7} />}

        {/* --- MEASURE TOOL --- */}
        <MeasureTool 
            key={`${activeMode}-${measureMethod}`} 
            mode={activeMode} 
            method={measureMethod} 
            active={activeMode === 'field' || activeMode === 'distance'} 
            settings={appSettings}
            currentUserLoc={currentUserLoc}
            onUpdateSettings={handleLiveSettingUpdate}
            onExit={() => { setActiveMode('default'); setMeasurePoints([]); }}
            onSave={handleSaveInit}
            points={measurePoints}
            setPoints={setMeasurePoints}
        />
        
        {activeMode === 'marker' && <MarkerClickLogic addPoint={(p) => setMarkerPoints(prev => [...prev, p])} />}
        {markerPoints.map((p, i) => <Marker key={i} position={p}><Popup>{formatCoordinate(p.lat, 'lat')}, {formatCoordinate(p.lng, 'lng')}</Popup></Marker>)}

        {/* --- PREVIEW LAYER --- */}
        {previewData && previewData.type === 'marker' && previewData.points.map((p, i) => <Marker key={`prev-${i}`} position={p} />)}
        {previewData && previewData.type === 'distance' && <Polyline positions={previewData.points} pathOptions={{ color: '#00e5ff', weight: 5 }} />}
        {previewData && previewData.type === 'field' && <Polygon positions={previewData.points} pathOptions={{ color: '#fff', weight: 2, fillColor: '#00e5ff', fillOpacity: 0.4 }} />}

      </MapContainer>

      <div style={styles.leftControls}>
          {activeMode === 'marker' && <button onClick={() => setMarkerPoints(prev => prev.slice(0, -1))} style={styles.controlBtnWhite}><FiRotateCcw size={22} color="#d32f2f" /></button>}
          <div style={{...styles.zoomGroupWhite, marginTop: activeMode === 'marker' ? '40px' : '0'}}>
                <button onClick={() => map && map.zoomIn()} style={styles.zoomBtnTopWhite}><FiPlus size={24} color="#000" /></button>
                <div style={styles.dividerWhite}></div>
                <button onClick={() => map && map.zoomOut()} style={styles.zoomBtnBottomWhite}><FiMinus size={24} color="#000" /></button>
          </div>
      </div>

      {!isCreateMenuOpen && (
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

      {!isCreateMenuOpen && activeMode === 'default' && !previewData && (
      <div style={styles.bottomContainer}>
        <button onClick={() => { setIsCreateMenuOpen(true); setActiveMenu('main'); }} style={{...styles.createNewBtnWhite, ...styles.pulsatingBtn}}>
          <FaMapMarkedAlt size={20} style={{marginRight: 8}} /> Create new
        </button>
      </div>
      )}

      {isCreateMenuOpen && ( 
          <>
            <div style={styles.sideMenuContainer}>
                {activeMenu === 'main' && (
                    <>
                        <MenuOption icon={<FiDownload size={24} />} label="Import" onClick={() => setActiveMenu('import')} />
                        <MenuOption icon={<FaDrawPolygon size={24} />} label="Field" onClick={() => setActiveMenu('field')} />
                        <MenuOption icon={<FaRulerHorizontal size={24} />} label="Distance" onClick={() => setActiveMenu('distance')} />
                        <MenuOption icon={<FiMapPin size={24} />} label="Pin Location" onClick={() => setActiveMenu('pin')} />
                    </>
                )}
                {activeMenu === 'import' && <ImportMenu onBack={() => setActiveMenu('main')} onImport={handleImportClick} />}
                
                {activeMenu === 'field' && <MeasureMenu type="field" onBack={() => setActiveMenu('main')} onStart={(method) => { setIsCreateMenuOpen(false); setMeasureMethod(method); setActiveMode('field'); }} />}
                {activeMenu === 'distance' && <MeasureMenu type="distance" onBack={() => setActiveMenu('main')} onStart={(method) => { setIsCreateMenuOpen(false); setMeasureMethod(method); setActiveMode('distance'); }} />}
                
                {activeMenu === 'pin' && ( <PinMenu onBack={() => setActiveMenu('main')} onStartManual={() => { setIsCreateMenuOpen(false); setActiveMode('marker'); setIsSearchOpen(false); }} onStartGPS={handleGpsPin} /> )}
            </div>
            <button onClick={() => setIsCreateMenuOpen(false)} style={styles.closeMenuBtn}><FiX size={28} color="#fff"/></button>
        </>
      )}
    </div>
  );
};

const MarkerClickLogic = ({ addPoint }) => { useMapEvents({ click(e) { addPoint(e.latlng); } }); return null; };

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