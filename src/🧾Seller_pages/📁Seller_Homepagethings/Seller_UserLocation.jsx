import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, useMap, useMapEvents, Marker } from 'react-leaflet';
import { 
  ArrowLeft, Search, Plus, Briefcase, Home, MapPin, LocateFixed, 
  MoreVertical, Share2, Trash2, Edit2, X, Camera, ChevronRight, 
  Layers, Check, AlertCircle, Bookmark, Navigation, Heart, Clock 
} from 'lucide-react';
import L from 'leaflet'; 
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

// --- CUSTOM ICONS ---
const gpsIcon = L.divIcon({
  className: 'gps-pulse-icon',
  html: '<div class="gps-dot"></div><div class="gps-pulse"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

// --- UTILITY FUNCTIONS ---
const updateSeller_HomePageLocation = (address, title, lat, lng) => {
  if (!address || address.trim() === '') return;
  localStorage.setItem('userLocation', address);
  localStorage.setItem('locationTitle', title);
  localStorage.setItem('userLat', lat);
  localStorage.setItem('userLng', lng);
  window.dispatchEvent(new Event('storage'));
};

const formatDistance = (meters) => {
  if (!meters) return '';
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${((meters / 1000)).toFixed(1)} km`;
};

const getDistanceMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; 
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// --- MAP SUB-COMPONENTS ---
const MapController = ({ coords, isFlying }) => {
  const map = useMap();
  useEffect(() => { 
    if(isFlying) {
      map.flyTo([coords.lat, coords.lng], 19, {
        animate: true,
        duration: 1.5
      }); 
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

const Skeleton = ({ width, height }) => (
  <div style={{
    width: width,
    height: height, 
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    borderRadius: '12px',
    animation: 'shimmer 1.5s infinite',
    marginBottom: '8px'
  }} />
);

// --- MAIN COMPONENT ---
const Seller_UserLocation = () => {
  const navigate = useNavigate();
  const [view, setView] = useState('list'); 
  const [deviceLoc, setDeviceLoc] = useState(null); 
  const [gpsStatus, setGpsStatus] = useState('checking'); 
  const [currentLocName, setCurrentLocName] = useState("Detecting location...");
  
  const [mapType, setMapType] = useState('basic'); 
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false); 

  const [searchHistory, setSearchHistory] = useState(() => {
    const saved = localStorage.getItem('search_history_v2');
    return saved ? JSON.parse(saved) : [];
  });

  const [savedAddresses, setSavedAddresses] = useState(() => {
    const saved = localStorage.getItem('my_saved_addresses');
    return saved ? JSON.parse(saved) : []; 
  });
  
  const [nearbyLocs, setNearbyLocs] = useState([]);
  const [activeMenuId, setActiveMenuId] = useState(null); 

  const [editingId, setEditingId] = useState(null);
  const [coords, setCoords] = useState({ lat: 12.92, lng: 80.22 }); 
  const [isFlying, setIsFlying] = useState(false);
  const [isAddressLoading, setIsAddressLoading] = useState(false);
  
  const [pinDetails, setPinDetails] = useState({ name: '', city: '', full: '' });
  const [addressType, setAddressType] = useState('Home');
  
  const [formData, setFormData] = useState({ 
      houseNo: '', landmark: '', receiverName: '', phone: '', 
      village: '', mandal: '', city: '', pincode: '' 
  });
  
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);
  const [isMapShrunk, setIsMapShrunk] = useState(false);

  // --- CORE FUNCTIONS ---
  const addToHistory = (name) => {
    if (!name) return;
    const filtered = searchHistory.filter(h => h !== name);
    const updated = [name, ...filtered].slice(0, 5);
    setSearchHistory(updated);
    localStorage.setItem('search_history_v2', JSON.stringify(updated));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
    }
  };

  const startAddAddress = () => {
    setEditingId(null);
    setFormData({ houseNo: '', landmark: '', receiverName: '', phone: '', village: '', mandal: '', city: '', pincode: '' });
    setSelectedImage(null);
    if (deviceLoc) {
        setCoords(deviceLoc);
        setIsFlying(true);
        setTimeout(() => setIsFlying(false), 1500);
        handleMapMoveEnd(deviceLoc);
    }
    setView('map');
  };

  // NATIVE SHARING FEATURE
  const handleShareAddress = async (addr) => {
    const shareText = `Check out my address: ${addr.address}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Location',
          text: shareText,
          url: window.location.href
        });
      } catch (err) {
        console.log("Error sharing", err);
      }
    } else {
      // Fallback: Just open WhatsApp if Web Share API is missing
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
    }
  };

  const fetchAddressFromCoords = async (lat, lng) => {
    try {
        const res = await axios.post('/api/UserLocation', { action: 'reverseGeocode', lat, lng });
        const data = res.data;
        if (data.addresses && data.addresses.length > 0) {
            const addr = data.addresses[0].address;
            return { 
                name: addr.streetName || addr.municipalitySubdivision || "Unknown",
                city: addr.municipality || "", 
                full: data.addresses[0].address.freeformAddress,
                autoVillage: addr.municipalitySubdivision || '',
                autoMandal: addr.municipality || '',
                autoCity: addr.city || addr.countrySubdivision || '',
                autoPin: addr.postalCode || addr.postcode || ''
            };
        }
        return { name: "Unknown", city: "", full: "Location not found" };
    } catch (e) { return { name: "Network Error", city: "", full: "" }; }
  };

  const searchPlaces = async (query) => {
    if (!query || query.length < 2) return [];
    try {
        const res = await axios.post('/api/UserLocation', { action: 'search', query });
        const data = res.data;
        return data.results.map(place => ({
            id: place.id,
            name: place.poi ? place.poi.name : (place.address.municipality || place.address.freeformAddress),
            sub: place.address.freeformAddress,
            lat: place.position.lat,
            lng: place.position.lon,
            dist: place.dist 
        }));
    } catch (e) { return []; }
  };

  const fetchSmartNearbyPlaces = async (lat, lng) => {
    const cats = "7320,7321,9361,9376,7373"; 
    const radii = [500, 1000, 3000];
    for (let r of radii) {
        try {
            const res = await axios.post('/api/UserLocation', { action: 'nearby', lat, lng, radius: r, categorySet: cats });
            const data = res.data;
            if (data.results && data.results.length >= 5) {
                return data.results.map(place => ({
                    id: place.id,
                    name: place.poi.name,
                    address: place.address.freeformAddress, 
                    lat: place.position.lat,
                    lng: place.position.lon,
                    meters: place.dist 
                }));
            }
        } catch (e) { console.error(e); }
    }
    return [];
  };

  const requestGPS = () => {
    if (!navigator.geolocation) { setGpsStatus('denied'); return; }
    setGpsStatus('checking');
    navigator.geolocation.getCurrentPosition(
        async (pos) => {
            const { latitude, longitude } = pos.coords;
            setDeviceLoc({ lat: latitude, lng: longitude });
            setGpsStatus('active');
            const addrData = await fetchAddressFromCoords(latitude, longitude);
            setCurrentLocName(addrData.full || `${addrData.name}, ${addrData.city}`);
            const places = await fetchSmartNearbyPlaces(latitude, longitude);
            setNearbyLocs(places);
            if(!coords.lat) setCoords({ lat: latitude, lng: longitude });
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
      input:focus { border-color: #F84464 !important; background: #fff !important; outline: none !important; }
      input { color: #111 !important; }
    `;
    document.head.appendChild(styleSheet);
    requestGPS();
    return () => document.head.removeChild(styleSheet);
  }, []);

  const handleDirectCurrentLocation = () => {
    requestGPS();
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        const details = await fetchAddressFromCoords(latitude, longitude);
        updateSeller_HomePageLocation(details.full || `${details.name}, ${details.city}`, "Current Location", latitude, longitude);
        navigate('/Seller_HomePage');
    });
  };

  const handleMapMoveStart = () => { setIsDragging(true); };
  const handleMapMoveEnd = async (center) => {
      setIsDragging(false); 
      setCoords({ lat: center.lat, lng: center.lng });
      setIsAddressLoading(true);
      const details = await fetchAddressFromCoords(center.lat, center.lng);
      setPinDetails(details);
      setIsAddressLoading(false);
      setFormData(prev => ({ ...prev, village: details.autoVillage || prev.village, mandal: details.autoMandal || prev.mandal, city: details.autoCity || prev.city, pincode: details.autoPin || prev.pincode }));
  };

  const handleResetToCurrentLocation = () => {
      requestGPS();
      if(deviceLoc) { setCoords(deviceLoc); setIsFlying(true); setTimeout(() => setIsFlying(false), 1500); handleMapMoveEnd(deviceLoc); }
  };

  const saveAddress = () => {
    setIsSaving(true); 
    setTimeout(() => {
        const parts = [formData.houseNo, pinDetails.name, pinDetails.city].filter(p => p && p.trim().length > 0);
        const fullAddress = parts.join(', ');
        const newEntry = { id: editingId || Date.now(), type: addressType, address: fullAddress, details: formData, lat: coords.lat, lng: coords.lng, image: selectedImage };
        let updatedList = editingId ? savedAddresses.map(a => a.id === editingId ? newEntry : a) : [newEntry, ...savedAddresses];
        setSavedAddresses(updatedList);
        localStorage.setItem('my_saved_addresses', JSON.stringify(updatedList));
        updateSeller_HomePageLocation(fullAddress, addressType, coords.lat, coords.lng);
        setIsSaving(false);
        setView('list'); 
    }, 800); 
  };

  const handleSelectPlace = (address, title, lat, lng) => {
      addToHistory(title); 
      updateSeller_HomePageLocation(address, title, lat, lng);
      navigate('/Seller_HomePage');
  };

  const deleteAddress = (idToDelete) => {
    // 1. Filter out the address with the matching ID
    const updatedList = savedAddresses.filter(addr => addr.id !== idToDelete);
    
    // 2. Update the state
    setSavedAddresses(updatedList);
    
    // 3. Update local storage so the deletion persists
    localStorage.setItem('my_saved_addresses', JSON.stringify(updatedList));
    
    // 4. Close the popup menu
    setActiveMenuId(null);
  };

  const startEditAddress = (addressToEdit) => {
    // 1. Close the popup menu
    setActiveMenuId(null);
    
    // 2. Set the editing ID so the app knows we are updating, not creating new
    setEditingId(addressToEdit.id);
    
    // 3. Populate the form data with the saved details
    setFormData(addressToEdit.details || { 
      houseNo: '', landmark: '', receiverName: '', phone: '', 
      village: '', mandal: '', city: '', pincode: '' 
    });
    
    // 4. Set the address type (Home, Work, Other)
    setAddressType(addressToEdit.type || 'Home');
    
    // 5. Set the coordinates and trigger the map view
    if (addressToEdit.lat && addressToEdit.lng) {
      setCoords({ lat: addressToEdit.lat, lng: addressToEdit.lng });
      setIsFlying(true);
      setTimeout(() => setIsFlying(false), 1500);
    }
    
    // 6. Switch to the map view to allow editing
    setView('map');
  };

  const getGoogleTileUrl = (type) => {
    return type === 'hybrid' 
      ? "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" 
      : "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}";
  };

  // --- RENDERING LIST VIEW ---
  if (view === 'list') {
    return (
      <div style={styles.pageGray} onClick={() => setActiveMenuId(null)}>
        <div style={styles.header}>
          <ArrowLeft onClick={() => navigate(-1)} style={{cursor:'pointer'}} color="#1C1C1C" />
          <span style={styles.headerTitle}>Select a location</span>
        </div>
        
        <div style={styles.searchSectionWrapper}>
            <div style={styles.searchBar}>
                <Search color="#F84464" size={20} />
                <input type="text" placeholder="Search area, street..." style={styles.searchInput} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                {searchQuery && <X size={18} color="#999" onClick={() => setSearchQuery('')} style={{cursor:'pointer'}} />}
            </div>
            
            <div style={styles.historyRow}>
               {(searchHistory.length > 0 ? searchHistory : ['Chennai', 'Salem']).map((tag, i) => (
                 <div key={i} onClick={() => setSearchQuery(tag)} style={styles.tagBtn}>
                   <Clock size={12}/> {tag}
                 </div>
               ))}
            </div>
        </div>

        <div style={styles.scrollArea}>
            <div style={styles.actionsWrapper}>
                <div style={styles.capsuleCard} onClick={handleDirectCurrentLocation}>
                    <div style={styles.iconCircleRed}><LocateFixed size={22} color="#F84464" strokeWidth={2.5} /></div>
                    <div style={{flex:1}}><div style={styles.actionTitle}>Use current location</div><div style={styles.actionSub}>{currentLocName}</div></div>
                    <span style={{color:'#ccc'}}>›</span>
                </div>
                <div style={styles.capsuleCard} onClick={startAddAddress}>
                    <div style={styles.iconCircleRed}><Plus size={22} color="#F84464" /></div>
                    <div style={{flex:1}}><div style={styles.actionTitle}>Add Address</div></div>
                    <span style={{color:'#ccc'}}>›</span>
                </div>
            </div>
            
            {savedAddresses.length > 0 && <div style={styles.sectionTitle}>SAVED ADDRESSES</div>}
            
            {savedAddresses.map(addr => (
                <div key={addr.id} style={styles.addressCard}>
                    <div style={styles.cardLeft}><div style={styles.iconBox}>{addr.type === 'Work' ? <Briefcase size={18} color="#555"/> : <Home size={18} color="#555"/>}</div></div>
                    <div style={styles.cardRight} onClick={() => handleSelectPlace(addr.address, addr.type, addr.lat, addr.lng)}>
                        <div style={styles.cardType}>{addr.type}</div>
                        <div style={styles.cardAddress}>{addr.address}</div>
                        <div style={styles.cardPhone}>Phone: {addr.details?.phone || "N/A"}</div>
                    </div>
                    <div style={{position:'relative'}}>
                        <div style={styles.menuIcon} onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === addr.id ? null : addr.id); }}><MoreVertical size={20} color="#333" /></div>
                        {activeMenuId === addr.id && (
                            <div style={styles.popupMenu}>
                                <div style={styles.menuItem} onClick={() => startEditAddress(addr)}><Edit2 size={14} color="#333"/> Edit</div>
                                <div style={styles.menuItem} onClick={() => handleShareAddress(addr)}><Share2 size={14} color="#333"/> Share</div>
                                <div style={{...styles.menuItem, color:'#F84464'}} onClick={() => deleteAddress(addr.id)}><Trash2 size={14}/> Delete</div>
                            </div>
                        )}
                    </div>
                </div>
            ))}

            <div style={styles.sectionTitle}>NEARBY PLACES</div>
            {nearbyLocs.map(loc => (
                <div key={loc.id} style={styles.nearbyRow} onClick={() => handleSelectPlace(loc.address, loc.name, loc.lat, loc.lng)}>
                    <div style={styles.pinCircle}><MapPin size={18} color="#555" /></div>
                    <div><div style={styles.nearbyTitle}>{loc.name}</div><div style={styles.nearbySub}>{loc.address} • <span style={{color:'#F84464', fontWeight:600}}>{formatDistance(loc.meters)}</span></div></div>
                </div>
            ))}
            <div style={{height:'30px'}}></div>
        </div>
      </div>
    );
  }

  // --- RENDERING MAP VIEW ---
  return (
    <div style={styles.pageWhite}>
        <div style={{ ...styles.topSection, height: isMapShrunk ? '22vh' : '58vh' }}>
            <div style={styles.headerGlass}>
                <div style={styles.mapHeaderTop}>
                    <div style={styles.mapHeaderLeft}>
                        <div onClick={() => setView('list')} style={styles.backCircle}><ArrowLeft size={18} color="#1C1C1C" strokeWidth={3} /></div>
                        <span style={styles.headerTitleLarge}>Set Location</span>
                    </div>
                    <div style={{ ...styles.statusBadge, background: gpsStatus === 'active' ? '#E7F9F2' : '#FFF0F0' }} onClick={requestGPS}>
                        <div className="blink-indicator" style={{ background: gpsStatus === 'active' ? '#10B981' : '#F84464' }}></div>
                        <span style={{ fontSize:'10px', fontWeight:'900', color: gpsStatus === 'active' ? '#10B981' : '#F84464' }}> {gpsStatus === 'active' ? 'GPS ACTIVE' : 'NO GPS'} </span>
                    </div>
                </div>
                <div style={styles.searchTriggerGlass} onClick={() => setIsSearchOpen(true)}>
                    <Search size={18} color="#F84464" />
                    <span style={{color:'#999', fontSize:'14px', fontWeight:'500'}}>Search area, landmarks...</span>
                </div>
            </div>

            <div style={styles.mapFrameWrapper}>
                <MapContainer center={[coords.lat, coords.lng]} zoom={18} zoomControl={false} style={{height:'100%', width:'100%'}}>
                    <TileLayer url={getGoogleTileUrl(mapType)} />
                    <MapController coords={coords} isFlying={isFlying} />
                    <MapEventsHandler onMoveStart={handleMapMoveStart} onMoveEnd={handleMapMoveEnd} />
                    {deviceLoc && <Marker position={[deviceLoc.lat, deviceLoc.lng]} icon={gpsIcon} />}
                </MapContainer>
                
                <div style={{ ...styles.centerPin, opacity: isMapShrunk ? 0 : 1, transform: isDragging ? 'translate(-50%, -120%) scale(1.15)' : 'translate(-50%, -100%) scale(1)' }}>
                    <div style={{...styles.blackTooltip, opacity: isDragging ? 0 : 1}}>Delivery location<div style={styles.blackArrow}></div></div>
                    <div className={isDragging ? "heart-pulse" : ""}>
                        <Heart size={48} color="#F84464" fill="#F84464" strokeWidth={1} style={styles.heartShadowFilter} />
                    </div>
                    <div style={{ ...styles.pinShadow, transform: isDragging ? 'scale(0.3)' : 'scale(1)', opacity: isDragging ? 0.1 : 0.4 }}></div>
                </div>
                
                <div style={{...styles.controlsContainer, opacity: isMapShrunk ? 0 : 1}}>
                    <button style={styles.glassBtnSquare} onClick={() => setMapType(prev => prev === 'basic' ? 'hybrid' : 'basic')}>
                       <Layers size={18} color="#333" />
                       <div style={styles.layerLabel}>{mapType === 'basic' ? 'Hybrid' : 'Map'}</div>
                    </button>
                    <button style={styles.glassBtnPill} onClick={handleResetToCurrentLocation}><Navigation size={16} color="#F84464" fill="#F84464"/> Use Current GPS</button>
                </div>
            </div>
        </div>

        <div style={styles.sheetFlexContainer}>
            <div style={styles.sheetHandle}></div>
            <div style={styles.scrollableFormContent} onScroll={e => setIsMapShrunk(e.target.scrollTop > 5)} className="sheet-content">
                <div style={styles.locCardWrapper}>
                    <div style={styles.locCardFlex} onClick={() => setIsSearchOpen(true)}>
                        <div style={styles.locIconBox}><Heart size={22} color="#fff" fill="#fff"/></div>
                        <div style={{flex:1}}>
                            {isAddressLoading ? ( <> <Skeleton width="50%" height="20px" /> <Skeleton width="80%" height="14px" /> </> ) : ( <> <div style={styles.locTitle}>{pinDetails.name || "Select Location"}</div> <div style={styles.locSub}>{pinDetails.full}</div> </> )}
                        </div>
                        <div style={styles.changeBtn}><ChevronRight size={18} color="#F84464" /></div>
                    </div>
                </div>

                <div style={styles.inputBoxFull}><input style={styles.inputRaw} placeholder="House / Flat / Block No.*" value={formData.houseNo} onChange={e => setFormData({...formData, houseNo: e.target.value})} /></div>
                <div style={styles.inputBoxFull}><input style={styles.inputRaw} placeholder="Landmark (Optional)" value={formData.landmark} onChange={e => setFormData({...formData, landmark: e.target.value})} /></div>

                <div style={styles.label}>AUTO-FILLED</div>
                <div style={styles.inputBoxFull}><input style={styles.inputRaw} placeholder="Village" value={formData.village} readOnly /></div>
                <div style={styles.inputRow}>
                    <div style={styles.inputBoxHalf}><input style={styles.inputRaw} placeholder="Mandal" value={formData.mandal} readOnly /></div>
                    <div style={styles.inputBoxHalf}><input style={styles.inputRaw} placeholder="City" value={formData.city} readOnly /></div>
                </div>
                <div style={styles.inputBoxFull}><input style={styles.inputRaw} placeholder="Pincode" value={formData.pincode} readOnly /></div>

                <div style={styles.label}>CONTACT INFO</div>
                <div style={styles.inputBoxFull}><input style={styles.inputRaw} placeholder="Receiver's Name" value={formData.receiverName} onChange={e => setFormData({...formData, receiverName: e.target.value})} /></div>
                <div style={styles.inputBoxFull}><input style={styles.inputRaw} placeholder="Phone Number" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>

                <div style={styles.label}>SAVE AS</div>
                <div style={styles.chips}>
                    {[ {t:'Home', i:<Home size={14}/>}, {t:'Work', i:<Briefcase size={14}/>}, {t:'Other', i:<Bookmark size={14}/>} ].map(item => (
                        <button key={item.t} style={addressType === item.t ? styles.chipActive : styles.chip} onClick={() => setAddressType(item.t)}>{item.i} {item.t}</button>
                    ))}
                </div>

                <div style={styles.photoUploadBox} onClick={() => fileInputRef.current.click()}>
                    <input type="file" ref={fileInputRef} style={{display: 'none'}} accept="image/*" onChange={handleImageUpload} />
                    {selectedImage ? (
                        <div style={styles.photoPreviewWrapper}>
                            <img src={selectedImage} alt="Addr" style={styles.photoPreview}/><div style={{flex:1}}><div style={styles.photoAddedTitle}>Photo Added</div><div style={styles.photoChangeText}>Tap to change</div></div><Check size={20} color="#10B981" />
                        </div>
                    ) : (
                        <>
                            <div style={styles.photoIconCircle}><Camera size={20} color="#F84464" /></div>
                            <div style={{flex:1}}><div style={styles.photoInstructionsTitle}>Add building photo</div><div style={styles.photoInstructionsSub}>Helps delivery worker find location</div></div>
                        </>
                    )}
                </div>

                <div style={styles.saveActionWrapper}>
                    <button style={{...styles.saveBtn, opacity: (formData.houseNo && formData.receiverName) ? 1 : 0.7, background: isSaving ? '#10B981' : '#F84464'}} onClick={saveAddress}>
                        {isSaving ? <Check color="white" size={24} /> : 'Save Address & Proceed'}
                    </button>
                </div>
            </div>
        </div>

        {isSearchOpen && (
            <>
                <div style={styles.backdrop} onClick={() => setIsSearchOpen(false)}></div>
                <div style={styles.searchOverlayBottom}>
                    <div style={styles.searchHeader}>
                        <div style={styles.searchBoxActive}><Search size={20} color="#F84464" /><input autoFocus placeholder="Search landmarks, area..." style={styles.searchInputActive} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /><X size={20} color="#333" onClick={() => setIsSearchOpen(false)} /></div>
                        
                        <div style={styles.historyRowOverlay}>
                            {searchHistory.map((tag, i) => (
                                <div key={i} onClick={() => {setSearchQuery(tag); setIsSearchOpen(false);}} style={styles.tagBtn}><Clock size={12}/> {tag}</div>
                            ))}
                        </div>
                    </div>
                    <div style={styles.searchResultsList}>
                        <div style={styles.searchOptionRow} onClick={() => { handleResetToCurrentLocation(); setIsSearchOpen(false); }}><LocateFixed size={20} color="#F84464"/><div style={styles.gpsUseText}>Use Current GPS</div></div>
                        {searchResults.map(res => (
                            <div key={res.id} style={styles.searchResultRow} onClick={() => { setCoords({ lat: res.lat, lng: res.lng }); addToHistory(res.name); setIsFlying(true); setTimeout(() => setIsFlying(false), 1500); setIsSearchOpen(false); setSearchQuery(''); }}>
                                <div style={styles.pinCircle}><MapPin size={16} color="#555"/></div><div><div style={styles.nearbyTitle}>{res.name}</div><div style={styles.nearbySub}>{res.sub}</div></div>
                            </div>
                        ))}
                    </div>
                </div>
            </>
        )}
    </div>
  );
};

// --- MASSIVE STYLES OBJECT ---
const styles = {
  pageGray: { background: '#F8F9FB', height: '100vh', overflow:'hidden', display: 'flex', flexDirection: 'column', fontFamily:'"Inter", sans-serif' },
  pageWhite: { background: '#FFF', height: '100vh', overflow:'hidden', display: 'flex', flexDirection: 'column', position:'relative' },
  header: { background:'white', padding:'16px 20px', display:'flex', alignItems:'center', gap:'16px', borderBottom:'1px solid #F2F2F2' },
  headerTitle: { fontSize:'18px', fontWeight:'900', color:'#111' },
  searchSectionWrapper: { padding:'15px 15px 10px 15px' },
  searchBar: { background:'#fff', border:'1px solid #EDEDED', borderRadius:'16px', padding:'12px 16px', display:'flex', alignItems:'center', gap:'12px', boxShadow:'0 2px 10px rgba(0,0,0,0.03)' },
  searchInput: { border:'none', outline:'none', fontSize:'15px', color:'#111', width:'100%', fontWeight:'600', background:'transparent' },
  historyRow: { display:'flex', gap:'8px', marginTop:'12px', overflowX:'auto', paddingBottom:'4px' },
  historyRowOverlay: { display:'flex', gap:'8px', marginTop:'12px', overflowX:'auto', paddingBottom:'4px' },
  scrollArea: { flex:1, overflowY:'auto' },
  tagBtn: { background:'#fff', border:'1px solid #F0F0F0', borderRadius:'10px', padding:'6px 12px', fontSize:'11px', fontWeight:'700', color:'#666', display:'flex', alignItems:'center', gap:'6px', whiteSpace:'nowrap' },
  actionsWrapper: { padding: '0 15px' },
  capsuleCard: { background: 'white', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', borderRadius: '22px', marginBottom: '14px', boxShadow: '0 4px 15px rgba(0,0,0,0.04)' },
  iconCircleRed: { width:'24px', height:'24px', display:'flex', alignItems:'center', justifyContent:'center' },
  actionTitle: { fontSize:'16px', fontWeight:'800', color:'#F84464' },
  actionSub: { fontSize:'12px', color:'#777', marginTop:'3px', maxWidth:'200px', overflow:'hidden', textOverflow:'ellipsis' }, 
  sectionTitle: { padding:'24px 20px 12px 20px', fontSize:'10px', fontWeight:'900', color:'#BBB', letterSpacing:'1.2px' },
  addressCard: { background:'white', padding:'22px', margin:'0 16px 16px 16px', borderRadius:'22px', display:'flex', gap:'16px', boxShadow:'0 4px 15px rgba(0,0,0,0.05)', position:'relative' },
  cardLeft: { width:'36px' },
  iconBox: { width:'36px', height:'36px', borderRadius:'12px', background:'#F8F8F8', display:'flex', alignItems:'center', justifyContent:'center' },
  cardRight: { flex:1 },
  cardType: { fontSize:'16px', fontWeight:'900', color:'#111' },
  cardAddress: { fontSize:'13px', color:'#888', margin:'6px 0 12px 0', lineHeight:'1.5' },
  cardPhone: { fontSize:'12px', color:'#111', fontWeight:'700' },
  menuIcon: { padding:'4px', cursor:'pointer' },
  popupMenu: { position:'absolute', top:'45px', right:'0', background:'white', boxShadow:'0 10px 30px rgba(0,0,0,0.15)', borderRadius:'14px', zIndex:100, minWidth:'140px', border:'1px solid #F5F5F5', overflow:'hidden' },
  menuItem: { padding:'15px 18px', fontSize:'13px', fontWeight:'800', cursor:'pointer', display:'flex', gap:'10px', alignItems:'center', color:'#333' },
  nearbyRow: { background:'white', padding:'18px 20px', display:'flex', alignItems:'center', gap:'16px', borderBottom:'1px solid #F9F9F9' },
  pinCircle: { width:'36px', height:'36px', borderRadius:'50%', background:'#F5F5F5', display:'flex', alignItems:'center', justifyContent:'center' },
  nearbyTitle: { fontSize:'14px', fontWeight:'800', color:'#111' },
  nearbySub: { fontSize:'12px', color:'#999' },
  searchResultRow: { background:'white', padding:'18px 24px', display:'flex', alignItems:'center', gap:'16px', borderBottom:'1px solid #F5F5F5' },
  topSection: { width:'100%', display:'flex', flexDirection:'column', transition:'all 0.5s cubic-bezier(0.2, 1, 0.3, 1)', flexShrink:0, position:'relative', overflow:'hidden' },
  headerGlass: { background: '#fff', padding:'16px 20px 12px 20px', flexShrink: 0, zIndex:10, borderBottom:'1px solid #F2F2F2' },
  mapHeaderTop: { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px' },
  mapHeaderLeft: { display:'flex', alignItems:'center', gap:'12px' },
  backCircle: { width:'34px', height:'34px', borderRadius:'50%', background:'#F7F7F7', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' },
  headerTitleLarge: { fontSize:'18px', fontWeight:'900', color:'#111' },
  statusBadge: { display:'flex', alignItems:'center', gap:'6px', padding:'6px 12px', borderRadius:'12px' },
  statusText: { fontSize:'10px', fontWeight:'900', letterSpacing:'0.5px' },
  searchTriggerGlass: { background: 'rgba(255, 255, 255, 0.9)', backdropFilter:'blur(5px)', border:'1.5px solid #F2F2F2', borderRadius:'16px', padding:'12px 18px', display:'flex', alignItems:'center', gap:'10px', marginTop:'16px' },
  mapSearchPlaceholder: { color:'#999', fontSize:'14px', fontWeight:'500' },
  mapFrameWrapper: { flex:1, position:'relative', overflow:'hidden' },
  centerPin: { position:'absolute', top:'50%', left:'50%', zIndex:1000, display:'flex', flexDirection:'column', alignItems:'center', pointerEvents:'none', transition:'all 0.4s' },
  heartShadowFilter: { filter: 'drop-shadow(0 8px 16px rgba(248, 68, 100, 0.4))' },
  pinShadow: { width:'16px', height:'6px', background:'rgba(0,0,0,0.12)', borderRadius:'50%', marginTop:'-4px', transition: 'all 0.3s' },
  blackTooltip: { background:'#1C1C1C', color:'white', fontSize:'10px', padding:'6px 10px', borderRadius:'8px', marginBottom:'8px', fontWeight:'900' },
  blackArrow: { position:'absolute', bottom:'-4px', left:'50%', transform:'translateX(-50%)', width:0, height:0, borderLeft:'4px solid transparent', borderRight:'4px solid transparent', borderTop:'4px solid #1C1C1C' },
  controlsContainer: { position:'absolute', bottom:'35px', right:'18px', left:'18px', display:'flex', justifyContent:'space-between', alignItems:'flex-end', zIndex:1000 },
  glassBtnPill: { background:'rgba(255, 255, 255, 0.95)', backdropFilter:'blur(10px)', color:'#F84464', padding:'12px 18px', borderRadius:'14px', display:'flex', alignItems:'center', gap:'8px', fontSize:'13px', fontWeight:'900', boxShadow:'0 8px 24px rgba(0,0,0,0.08)', border:'none' },
  glassBtnSquare: { background:'rgba(255, 255, 255, 0.95)', backdropFilter:'blur(10px)', width:'46px', height:'46px', borderRadius:'12px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', boxShadow:'0 8px 24px rgba(0,0,0,0.08)', border:'none' },
  layerLabel: { fontSize:'7px', fontWeight:'900', marginTop:'2px', textTransform:'uppercase' },
  sheetFlexContainer: { flex:1, display:'flex', flexDirection:'column', background:'white', borderTopLeftRadius:'36px', borderTopRightRadius:'36px', marginTop:'-35px', position:'relative', zIndex:10, boxShadow:'0 -15px 45px rgba(0,0,0,0.1)', overflow:'hidden' },
  sheetHandle: { width:'36px', height:'5px', background:'#E5E5E5', borderRadius:'10px', margin:'12px auto', flexShrink:0 },
  scrollableFormContent: { flex:1, overflowY:'auto', padding:'0 24px', background:'#fff', width:'100%', boxSizing:'border-box' },
  locCardWrapper: { marginBottom:'24px', background:'#FAFAFA', padding:'20px', borderRadius:'22px', border:'1px solid #F0F0F0' },
  locCardFlex: { display:'flex', gap:'12px', alignItems:'flex-start' },
  locIconBox: { width:'46px', height:'46px', borderRadius:'18px', background:'#F84464', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  locTitle: { fontSize:'20px', fontWeight:'900', color:'#111', marginBottom:'3px' },
  locSub: { fontSize:'13px', color:'#888', lineHeight:'1.5' },
  changeBtn: { background:'none', border:'none' },
  inputBoxFull: { border: '1.5px solid #F5F5F5', borderRadius:'18px', padding: '16px 20px', marginBottom:'16px', background:'#FAFAFA', boxSizing:'border-box', width:'100%' },
  inputRow: { display:'flex', gap:'12px', marginBottom:'16px', width:'100%', boxSizing:'border-box' },
  inputBoxHalf: { flex:1, border: '1.5px solid #F5F5F5', borderRadius:'18px', padding: '16px 20px', background:'#FAFAFA', boxSizing:'border-box' },
  inputRaw: { border:'none', outline:'none', fontSize:'14px', width:'100%', background:'transparent', color:'#111', fontWeight:'700', padding:0 },
  label: { fontSize:'10px', fontWeight:'900', color:'#CCC', marginTop:'12px', marginBottom:'16px', letterSpacing:'1.5px' },
  chips: { display:'flex', gap:'10px', marginBottom:'32px' },
  chip: { padding:'12px 20px', borderRadius:'16px', border:'1.5px solid #F5F5F5', background:'white', fontSize:'13px', fontWeight:'800', color:'#777', display:'flex', gap:'8px', alignItems:'center' },
  chipActive: { padding:'12px 20px', borderRadius:'16px', border:'2px solid #F84464', background:'#FFF2F4', fontSize:'13px', fontWeight:'900', color:'#F84464', display:'flex', gap:'8px', alignItems:'center' },
  photoUploadBox: { border:'2.5px dashed #F2F2F2', borderRadius:'24px', padding:'22px', display:'flex', alignItems:'center', gap:'16px', background:'#FAFAFA', cursor:'pointer' },
  photoIconCircle: { width:'44px', height:'44px', borderRadius:'50%', background:'#FFF0F2', display:'flex', alignItems:'center', justifyContent:'center' },
  photoPreviewWrapper: { display:'flex', alignItems:'center', gap:'12px', width:'100%' },
  photoPreview: { width:'50px', height:'50px', borderRadius:'14px', objectFit:'cover' },
  photoAddedTitle: { fontSize:'13px', fontWeight:'800' },
  photoChangeText: { fontSize:'11px', color:'#10B981' },
  photoInstructionsTitle: { fontSize:'13px', fontWeight:'800' },
  photoInstructionsSub: { fontSize:'11px', color:'#888' },
  saveActionWrapper: { padding:'40px 0 60px 0' },
  saveBtn: { background:'#F84464', color:'white', border:'none', padding:'20px', fontSize:'16px', fontWeight:'900', cursor:'pointer', letterSpacing:'0.5px', borderRadius:'18px', transition:'all 0.3s', boxShadow:'0 12px 28px rgba(248, 68, 100, 0.3)', width:'100%' },
  backdrop: { position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.6)', zIndex:1999 },
  searchOverlayBottom: { position:'fixed', bottom:0, left:0, width:'100%', height:'94%', background:'white', zIndex:2000, borderTopLeftRadius:'36px', borderTopRightRadius:'36px', display:'flex', flexDirection:'column', overflow:'hidden' },
  searchHeader: { padding:'24px', borderBottom:'1px solid #F2F2F2' },
  searchBoxActive: { display:'flex', alignItems:'center', gap:'14px', border:'2.5px solid #F84464', borderRadius:'20px', padding:'16px 20px' }, 
  searchInputActive: { flex:1, border:'none', outline:'none', fontSize:'16px', fontWeight:'700' }, 
  searchResultsList: { flex:1, overflowY:'auto' },
  searchOptionRow: { display:'flex', alignItems:'center', gap:'16px', padding:'20px 24px', borderBottom:'1px solid #F9F9F9' },
  gpsUseText: { fontWeight:'800', color:'#F84464' }
};

export default Seller_UserLocation;