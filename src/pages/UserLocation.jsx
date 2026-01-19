import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, useMap, useMapEvents, Marker } from 'react-leaflet';
import { ArrowLeft, Search, Plus, Briefcase, Home, MapPin, LocateFixed, MoreVertical, Share2, Trash2, Edit2, X, Camera, ChevronRight, Layers, Check, AlertCircle } from 'lucide-react';
import L from 'leaflet'; 
import 'leaflet/dist/leaflet.css';

const TOMTOM_KEY = import.meta.env.VITE_TOMTOM_API_KEY;

// --- CUSTOM ICONS ---
const gpsIcon = L.divIcon({
  className: 'gps-pulse-icon',
  html: '<div class="gps-dot"></div><div class="gps-pulse"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

// --- UTILS ---
const updateDashboardLocation = (address, title, lat, lng) => {
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
  return `${(meters / 1000).toFixed(1)} km`;
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

// --- MAP COMPONENTS ---

const MapController = ({ coords, isFlying }) => {
  const map = useMap();
  useEffect(() => { 
    // FIXED: Zoom set to 18 (Safe level that prevents blank tiles)
    if(isFlying) map.flyTo([coords.lat, coords.lng], 18, { animate: true, duration: 1.5 }); 
  }, [coords, isFlying, map]);
  
  useEffect(() => {
      setTimeout(() => { map.invalidateSize(); }, 400); 
  }, [coords]); 

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
    width, height, 
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    borderRadius: '4px',
    animation: 'shimmer 1.5s infinite',
    marginBottom: '5px'
  }} />
);

const UserLocation = () => {
  const navigate = useNavigate();
  const [view, setView] = useState('list'); 
  const [deviceLoc, setDeviceLoc] = useState(null); 
  const [gpsStatus, setGpsStatus] = useState('checking'); // 'active', 'denied', 'checking'
  const [currentLocName, setCurrentLocName] = useState("Detecting location...");
  
  // Visual States
  const [mapType, setMapType] = useState('basic'); 
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false); 
  
  // Data
  const [savedAddresses, setSavedAddresses] = useState(() => {
    const saved = localStorage.getItem('my_saved_addresses');
    return saved ? JSON.parse(saved) : []; 
  });
  const [nearbyLocs, setNearbyLocs] = useState([]);
  const [activeMenuId, setActiveMenuId] = useState(null); 

  // Core State
  const [editingId, setEditingId] = useState(null);
  const [coords, setCoords] = useState({ lat: 12.92, lng: 80.22 }); 
  const [isFlying, setIsFlying] = useState(false);
  const [isAddressLoading, setIsAddressLoading] = useState(false);
  
  const [pinDetails, setPinDetails] = useState({ name: '', city: '', full: '' });
  const [addressType, setAddressType] = useState('Home');
  const [distanceWarning, setDistanceWarning] = useState(null);
  
  const [formData, setFormData] = useState({ 
      houseNo: '', landmark: '', receiverName: '', phone: '', 
      village: '', mandal: '', city: '', pincode: '' 
  });
  
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);
  const [isMapShrunk, setIsMapShrunk] = useState(false);

  // --- API ---
  const fetchAddressFromCoords = async (lat, lng) => {
    if (!TOMTOM_KEY) return { name: "Key Missing", city: "", full: "" };
    try {
        const url = `https://api.tomtom.com/search/2/reverseGeocode/${lat},${lng}.json?key=${TOMTOM_KEY}&radius=50`; 
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.addresses && data.addresses.length > 0) {
            const addr = data.addresses[0].address;
            return { 
                name: addr.streetName || addr.municipalitySubdivision || addr.municipality || "Unknown Location",
                city: addr.municipality || addr.countrySubdivision || "",
                full: data.addresses[0].address.freeformAddress,
                autoVillage: addr.municipalitySubdivision || addr.neighbourhood || addr.streetName || '',
                autoMandal: addr.municipality || addr.countrySecondarySubdivision || '',
                autoCity: addr.city || addr.countrySubdivision || '',
                autoPin: addr.postalCode || addr.postcode || ''
            };
        }
        return { name: "Unknown Location", city: "", full: "Location not found" };
    } catch (e) { return { name: "Network Error", city: "", full: "" }; }
  };

  const searchPlaces = async (query) => {
    if (!query || query.length < 2 || !TOMTOM_KEY) return [];
    try {
        const url = `https://api.tomtom.com/search/2/search/${encodeURIComponent(query)}.json?key=${TOMTOM_KEY}&countrySet=IN&limit=10&typeahead=true`;
        const res = await fetch(url);
        const data = await res.json();
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
    if (!TOMTOM_KEY) return [];
    const cats = "7320,7321,9361,9376,7373"; 
    const radii = [500, 1000, 3000];
    for (let r of radii) {
        try {
            const url = `https://api.tomtom.com/search/2/nearbySearch/.json?lat=${lat}&lon=${lng}&radius=${r}&limit=15&categorySet=${cats}&key=${TOMTOM_KEY}`;
            const res = await fetch(url);
            const data = await res.json();
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

  // --- GPS LOGIC ---
  const requestGPS = () => {
    if (!navigator.geolocation) {
        setGpsStatus('denied');
        return;
    }
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
            
            // Only center initially if we don't have coords set
            if(!coords.lat) setCoords({ lat: latitude, lng: longitude });
        }, 
        (err) => { 
            console.log("GPS Error", err); 
            setGpsStatus('denied');
        },
        { enableHighAccuracy: true }
    );
  };

  // --- INITIAL LOAD ---
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
      @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
      @keyframes pulseRing { 0% { transform: scale(0.33); opacity: 1; } 80%, 100% { transform: scale(2); opacity: 0; } }
      .gps-dot { width: 12px; height: 12px; background: #4285F4; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.3); position: absolute; top: 4px; left: 4px; z-index: 2; }
      .gps-pulse { position: absolute; top: 0; left: 0; width: 20px; height: 20px; border-radius: 50%; background: rgba(66, 133, 244, 0.4); animation: pulseRing 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite; z-index: 1; }
      .blink-indicator { width: 8px; height: 8px; border-radius: 50%; display: inline-block; animation: blink 1.5s infinite; }
      @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
    `;
    document.head.appendChild(styleSheet);
    
    requestGPS(); // Try to get GPS on mount

    return () => document.head.removeChild(styleSheet);
  }, []);

  useEffect(() => {
    localStorage.setItem('my_saved_addresses', JSON.stringify(savedAddresses));
  }, [savedAddresses]);

  useEffect(() => {
    const timer = setTimeout(async () => {
        if(searchQuery.length > 1) setSearchResults(await searchPlaces(searchQuery));
        else setSearchResults([]);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // --- HANDLERS ---
  const handleDirectCurrentLocation = () => {
    requestGPS(); // Re-trigger permission request if needed
    if (!navigator.geolocation) return;
    
    navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        const details = await fetchAddressFromCoords(latitude, longitude);
        const finalAddress = details.full || `${details.name}, ${details.city}`;
        updateDashboardLocation(finalAddress, "Current Location", latitude, longitude);
        navigate('/dashboard');
    }, () => { alert("Please enable location services"); });
  };

  const handleMapMoveStart = () => {
    setIsDragging(true);
  };

  const handleMapMoveEnd = async (center) => {
      setIsDragging(false); 
      setCoords({ lat: center.lat, lng: center.lng });
      setIsAddressLoading(true);
      
      const details = await fetchAddressFromCoords(center.lat, center.lng);
      setPinDetails(details);
      setIsAddressLoading(false);
      
      setFormData(prev => ({
          ...prev,
          village: details.autoVillage || prev.village,
          mandal: details.autoMandal || prev.mandal,
          city: details.autoCity || prev.city,
          pincode: details.autoPin || prev.pincode
      }));

      if (deviceLoc) {
          const meters = getDistanceMeters(deviceLoc.lat, deviceLoc.lng, center.lat, center.lng);
          if (meters > 250) { 
             setDistanceWarning(meters > 1000 ? `${(meters/1000).toFixed(1)} km` : `${Math.round(meters)} m`);
          } else {
             setDistanceWarning(null);
          }
      }
  };

  const handleResetToCurrentLocation = () => {
      requestGPS(); // Ensure we have latest
      if(deviceLoc) {
          setCoords(deviceLoc);
          setIsFlying(true);
          setTimeout(() => setIsFlying(false), 1500); 
          handleMapMoveEnd(deviceLoc);
      } else {
          // Force permission prompt
          navigator.geolocation.getCurrentPosition((pos) => {
              const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
              setDeviceLoc(loc);
              setCoords(loc);
              setIsFlying(true);
              setTimeout(() => setIsFlying(false), 1500);
              handleMapMoveEnd(loc);
          });
      }
  };

  const handleScroll = (e) => {
      const scrollTop = e.target.scrollTop;
      if (scrollTop > 20) { if (!isMapShrunk) setIsMapShrunk(true); } 
      else { if (isMapShrunk) setIsMapShrunk(false); }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) setSelectedImage(URL.createObjectURL(file));
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

  const startEditAddress = (addr) => {
    setEditingId(addr.id);
    setFormData(addr.details);
    setAddressType(addr.type);
    setSelectedImage(addr.image || null);
    setCoords({ lat: addr.lat, lng: addr.lng });
    setIsFlying(true);
    setTimeout(() => setIsFlying(false), 1500);
    fetchAddressFromCoords(addr.lat, addr.lng).then(setPinDetails);
    setView('map');
  };

  const deleteAddress = (id) => {
    if(window.confirm("Delete this address?")) setSavedAddresses(prev => prev.filter(a => a.id !== id));
  };

  const saveAddress = () => {
    setIsSaving(true); 
    setTimeout(() => {
        const parts = [formData.houseNo, pinDetails.name, pinDetails.city].filter(p => p && p.trim().length > 0);
        const fullAddress = parts.join(', ');
        const newEntry = {
            id: editingId || Date.now(),
            type: addressType,
            address: fullAddress,
            details: formData,
            lat: coords.lat,
            lng: coords.lng,
            gps_accuracy: 'high',
            image: selectedImage 
        };
        if (editingId) setSavedAddresses(prev => prev.map(a => a.id === editingId ? newEntry : a));
        else setSavedAddresses(prev => [newEntry, ...prev]);
        
        updateDashboardLocation(fullAddress, addressType, coords.lat, coords.lng);
        setIsSaving(false);
        setView('list'); 
    }, 800); 
  };

  const handleSelectPlace = (address, title, lat, lng) => {
      updateDashboardLocation(address, title, lat, lng);
      navigate('/dashboard');
  };

  // --- RENDER 1: LIST VIEW ---
  if (view === 'list') {
    return (
      <div style={styles.pageGray} onClick={() => setActiveMenuId(null)}>
        <div style={styles.header}>
          <ArrowLeft onClick={() => navigate(-1)} style={{cursor:'pointer'}} color="#1C1C1C" />
          <span style={styles.headerTitle}>Select a location</span>
        </div>
        <div style={{padding:'15px 15px 10px 15px'}}>
            <div style={styles.searchBar}>
                <Search color="#E23744" size={20} />
                <input type="text" placeholder="Search for area, street name..." style={styles.searchInput} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                {searchQuery && <X size={18} color="#999" onClick={() => setSearchQuery('')} style={{cursor:'pointer'}} />}
            </div>
        </div>
        <div style={styles.scrollArea}>
            {searchQuery.length > 1 ? (
                searchResults.map(result => (
                    <div key={result.id} style={styles.searchResultRow} onClick={() => handleSelectPlace(result.sub, result.name, result.lat, result.lng)}>
                        <div style={styles.pinCircle}><MapPin size={18} color="#555"/></div>
                        <div><div style={styles.nearbyTitle}>{result.name}</div><div style={styles.nearbySub}>{result.sub}</div></div>
                    </div>
                ))
            ) : (
                <>
                    <div style={{padding: '0 15px'}}>
                        <div style={styles.capsuleCard} onClick={handleDirectCurrentLocation}>
                            <div style={styles.iconCircleRed}><LocateFixed size={22} color="#E23744" strokeWidth={2.5} /></div>
                            <div style={{flex:1}}><div style={styles.actionTitle}>Use current location</div><div style={styles.actionSub}>{currentLocName}</div></div>
                            <span style={{color:'#ccc'}}>›</span>
                        </div>
                        <div style={styles.capsuleCard} onClick={startAddAddress}>
                            <div style={styles.iconCircleRed}><Plus size={22} color="#E23744" /></div>
                            <div style={{flex:1}}><div style={styles.actionTitle}>Add Address</div></div>
                            <span style={{color:'#ccc'}}>›</span>
                        </div>
                    </div>
                    {savedAddresses.length > 0 && <div style={styles.sectionTitle}>SAVED ADDRESSES</div>}
                    {savedAddresses.map(addr => (
                        <div key={addr.id} style={styles.addressCard}>
                            <div style={styles.cardLeft}>
                                <div style={styles.iconBox}>{addr.type === 'Work' ? <Briefcase size={18} color="#555"/> : <Home size={18} color="#555"/>}</div>
                            </div>
                            <div style={styles.cardRight} onClick={() => handleSelectPlace(addr.address, addr.type, addr.lat, addr.lng)}>
                                <div style={styles.cardType}>{addr.type}</div>
                                <div style={styles.cardAddress}>{addr.address}</div>
                                <div style={styles.cardPhone}>Phone: {addr.details.phone || "N/A"}</div>
                            </div>
                            <div style={{position:'relative'}}>
                                <div style={styles.menuIcon} onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === addr.id ? null : addr.id); }}>
                                    <MoreVertical size={20} color="#333" />
                                </div>
                                {activeMenuId === addr.id && (
                                    <div style={styles.popupMenu}>
                                        <div style={styles.menuItem} onClick={() => startEditAddress(addr)}><Edit2 size={14}/> Edit</div>
                                        <div style={styles.menuItem} onClick={() => alert("Link Copied!")}><Share2 size={14}/> Share</div>
                                        <div style={{...styles.menuItem, color:'#E23744'}} onClick={() => deleteAddress(addr.id)}><Trash2 size={14}/> Delete</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    <div style={styles.sectionTitle}>NEARBY PLACES</div>
                    {nearbyLocs.map(loc => (
                        <div key={loc.id} style={styles.nearbyRow} onClick={() => handleSelectPlace(loc.address, loc.name, loc.lat, loc.lng)}>
                            <div style={styles.pinCircle}><MapPin size={18} color="#555" /></div>
                            <div>
                                <div style={styles.nearbyTitle}>{loc.name}</div>
                                <div style={styles.nearbySub}>{loc.address} • <span style={{color:'#E23744', fontWeight:600}}>{formatDistance(loc.meters)}</span></div>
                            </div>
                        </div>
                    ))}
                    <div style={{height:'30px'}}></div>
                </>
            )}
        </div>
      </div>
    );
  }

  // --- RENDER 2: MAP & SAVE VIEW ---
  const tileUrl = mapType === 'basic' 
    ? `https://api.tomtom.com/map/1/tile/basic/main/{z}/{x}/{y}.png?key=${TOMTOM_KEY}`
    : `https://api.tomtom.com/map/1/tile/sat/main/{z}/{x}/{y}.jpg?key=${TOMTOM_KEY}`;

  return (
    <div style={styles.pageWhite}>
        <div style={{ ...styles.topSection, height: isMapShrunk ? '30vh' : '60vh' }}>
            
            <div style={styles.headerGlass}>
                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px'}}>
                    <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                        <ArrowLeft onClick={() => setView('list')} style={{cursor:'pointer'}} color="#1C1C1C" strokeWidth={2.5} size={22} />
                        <span style={styles.headerTitleLarge}>Select delivery location</span>
                    </div>
                    
                    {/* SMART GPS STATUS BUTTON */}
                    <div 
                        style={{
                            ...styles.statusBadge, 
                            background: gpsStatus === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            border: gpsStatus === 'active' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)',
                            cursor: 'pointer' 
                        }}
                        onClick={requestGPS}
                    >
                        <div className="blink-indicator" style={{ background: gpsStatus === 'active' ? '#10B981' : '#EF4444' }}></div>
                        <span style={{
                            fontSize:'11px', 
                            fontWeight:'700', 
                            color: gpsStatus === 'active' ? '#10B981' : '#EF4444'
                        }}>
                            {gpsStatus === 'active' ? 'GPS Active' : 'Enable GPS'}
                        </span>
                    </div>

                </div>
                <div style={styles.searchTriggerGlass} onClick={() => setIsSearchOpen(true)}>
                    <Search size={18} color="#E23744" />
                    <span style={{color:'#555', fontSize:'14px', fontWeight:'500'}}>Search for area, street name...</span>
                </div>
            </div>

            <div style={{flex:1, position:'relative'}}>
                {/* FIXED ZOOM: Reduced to 18 to fix blank map */}
                <MapContainer center={[coords.lat, coords.lng]} zoom={18} zoomControl={false} style={{height:'100%', width:'100%'}}>
                    <TileLayer url={tileUrl} />
                    <MapController coords={coords} isFlying={isFlying} />
                    <MapEventsHandler onMoveStart={handleMapMoveStart} onMoveEnd={handleMapMoveEnd} />
                    
                    {deviceLoc && <Marker position={[deviceLoc.lat, deviceLoc.lng]} icon={gpsIcon} />}
                </MapContainer>
                
                <div style={{
                    ...styles.centerPin, 
                    opacity: isMapShrunk ? 0 : 1, 
                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', 
                    transform: isDragging ? 'translate(-50%, -120%) scale(1.1)' : 'translate(-50%, -100%) scale(1)' 
                }}>
                    <div style={{...styles.blackTooltip, opacity: isDragging ? 0 : 1, transition:'opacity 0.2s'}}>Order will be delivered here<div style={styles.blackArrow}></div></div>
                    <div style={styles.pinWrapper}>
                        <svg width="46" height="46" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.4))'}}>
                            <path d="M12 0C7.58 0 4 3.58 4 8C4 13.5 12 24 12 24C12 24 20 13.5 20 8C20 3.58 16.42 0 12 0ZM12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11Z" fill="#E23744"/>
                        </svg>
                        <div style={{
                            ...styles.pinShadow,
                            transform: isDragging ? 'scale(0.6)' : 'scale(1)', 
                            opacity: isDragging ? 0.3 : 0.6
                        }}></div>
                    </div>
                </div>
                
                <div style={{...styles.controlsContainer, opacity: isMapShrunk ? 0 : 1}}>
                    <button style={styles.glassBtnSquare} onClick={() => setMapType(prev => prev === 'basic' ? 'sat' : 'basic')}>
                        <Layers size={20} color="#333" />
                    </button>
                    <button style={styles.glassBtnPill} onClick={handleResetToCurrentLocation}>
                        <LocateFixed size={18} color="#E23744" /> Use current location
                    </button>
                </div>
            </div>
        </div>

        <div style={styles.sheetFlexContainer}>
            <div style={styles.sheetHandle}></div>
            <div style={{padding:'0 20px', fontSize:'13px', fontWeight:'600', color:'#333', marginBottom:'15px'}}>Delivery details</div>

            <div style={styles.scrollableFormContent} onScroll={handleScroll}>
                <div style={{marginBottom:'20px'}}>
                    <div style={{display:'flex', gap:'10px', alignItems:'flex-start'}} onClick={() => setIsSearchOpen(true)}>
                        <div style={{marginTop:'3px'}}><MapPin size={24} color="#E23744" fill="#E23744"/></div>
                        <div style={{flex:1}}>
                            {isAddressLoading ? (
                                <>
                                    <Skeleton width="60%" height="24px" />
                                    <Skeleton width="90%" height="16px" />
                                </>
                            ) : (
                                <>
                                    <div style={styles.locTitle}>{pinDetails.name || "Unknown Location"}</div>
                                    <div style={styles.locSub}>{pinDetails.full}</div>
                                </>
                            )}
                        </div>
                        <div style={styles.changeBtn}><ChevronRight size={18} color="#E23744" /></div>
                    </div>
                    {distanceWarning && (
                        <div style={styles.distanceWarningBox}>
                            <div style={{color:'#4F4F4F', fontWeight:'500', marginBottom:'4px'}}>This address is {distanceWarning} away from your current location</div>
                            <div style={styles.warningActionLink} onClick={(e) => { e.stopPropagation(); handleResetToCurrentLocation(); }}>Use current location ›</div>
                        </div>
                    )}
                </div>

                <div style={styles.inputBoxFull}>
                    <input style={styles.inputRaw} placeholder="Address details*" value={formData.houseNo} onChange={e => setFormData({...formData, houseNo: e.target.value})} />
                </div>
                <div style={{fontSize:'11px', color:'#999', margin:'-10px 0 15px 5px'}}>E.g. Floor, House no.</div>
                <div style={styles.inputBoxFull}>
                    <input style={styles.inputRaw} placeholder="Landmark (Optional)" value={formData.landmark} onChange={e => setFormData({...formData, landmark: e.target.value})} />
                </div>

                <div style={styles.label}>AUTO-FILLED DETAILS</div>
                <div style={styles.inputBoxFull}><input style={styles.inputRaw} placeholder="Village / Area" value={formData.village} readOnly /></div>
                <div style={styles.inputRow}>
                    <input style={styles.inputBox} placeholder="Mandal" value={formData.mandal} readOnly />
                    <input style={styles.inputBox} placeholder="City" value={formData.city} readOnly />
                </div>
                <div style={styles.inputBoxFull}><input style={styles.inputRaw} placeholder="Pincode" value={formData.pincode} readOnly /></div>

                <div style={styles.label}>RECEIVER DETAILS</div>
                <div style={styles.inputBoxFull}><input style={styles.inputRaw} placeholder="Receiver Name" value={formData.receiverName} onChange={e => setFormData({...formData, receiverName: e.target.value})} /></div>
                <div style={styles.inputBoxFull}><input style={styles.inputRaw} placeholder="Phone Number" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>

                <div style={{fontSize:'12px', color:'#999', marginTop:'15px', marginBottom:'10px', fontWeight:'600', letterSpacing:'0.5px'}}>SAVE AS</div>
                <div style={styles.chips}>
                    {['Home', 'Work', 'Other'].map(type => (
                        <button key={type} style={addressType === type ? styles.chipActive : styles.chip} onClick={() => setAddressType(type)}>{type}</button>
                    ))}
                </div>

                <div>
                    <input type="file" ref={fileInputRef} style={{display: 'none'}} accept="image/*" onChange={handleImageUpload} />
                    <div style={styles.photoUploadBox} onClick={() => fileInputRef.current.click()}>
                        {selectedImage ? (
                            <div style={{display:'flex', alignItems:'center', gap:'12px', width:'100%'}}>
                                <img src={selectedImage} alt="Preview" style={{width:'40px', height:'40px', borderRadius:'8px', objectFit:'cover'}}/>
                                <div style={{flex:1}}>
                                    <div style={{fontSize:'13px', fontWeight:'600', color:'#333'}}>Photo added</div>
                                    <div style={{fontSize:'11px', color:'#E23744', marginTop:'2px'}}>Tap to change</div>
                                </div>
                                <Camera size={20} color="#E23744" />
                            </div>
                        ) : (
                            <>
                                <div style={styles.photoIconCircle}><Camera size={20} color="#E23744" /></div>
                                <div style={{flex:1}}>
                                    <div style={{fontSize:'13px', color:'#333', fontWeight:'600'}}>Add helpful photo</div>
                                    <div style={{fontSize:'11px', color:'#999'}}>E.g. Building front, gate, etc. (Optional)</div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
                <div style={{height:'100px'}}></div>
            </div>
            <div style={styles.fixedFooter}>
                <button 
                    style={{...styles.saveBtn, width: isSaving ? '55px' : '100%', borderRadius: isSaving ? '50px' : '10px', background: isSaving ? '#10B981' : '#F84464'}} 
                    onClick={saveAddress}
                >
                    {isSaving ? <Check color="white" size={24} /> : 'Save address'}
                </button>
            </div>
        </div>

        {isSearchOpen && (
            <>
                <div style={styles.backdrop} onClick={() => setIsSearchOpen(false)}></div>
                <div style={styles.searchOverlayBottom}>
                    <div style={styles.searchHeader}>
                        <div style={styles.searchBoxActive}>
                            <Search size={20} color="#E23744" />
                            <input autoFocus placeholder="Search for area, street name..." style={styles.searchInputActive} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                            <X size={20} color="#333" onClick={() => setIsSearchOpen(false)} />
                        </div>
                    </div>
                    <div style={styles.searchResultsList}>
                        <div style={styles.searchOptionRow} onClick={() => { handleResetToCurrentLocation(); setIsSearchOpen(false); }}>
                            <div style={{color:'#E23744'}}><LocateFixed size={20}/></div>
                            <div style={{fontWeight:'700', color:'#E23744'}}>Use current location</div>
                            <div style={{fontSize:'12px', color:'#999', marginLeft:'auto'}}>Using GPS</div>
                        </div>
                        {searchResults.map(res => (
                            <div key={res.id} style={styles.searchResultRow} onClick={() => {
                                setCoords({ lat: res.lat, lng: res.lng });
                                setIsFlying(true);
                                setTimeout(() => setIsFlying(false), 1500);
                                setIsSearchOpen(false);
                                setSearchQuery('');
                            }}>
                                <div style={styles.pinCircle}><MapPin size={16} color="#555"/></div>
                                <div><div style={styles.nearbyTitle}>{res.name}</div><div style={styles.nearbySub}>{res.sub}</div></div>
                            </div>
                        ))}
                    </div>
                </div>
            </>
        )}
    </div>
  );
};

// --- STYLES ---
const styles = {
  pageGray: { background: '#F4F5F7', height: '100vh', overflow:'hidden', display: 'flex', flexDirection: 'column', fontFamily:'sans-serif' },
  pageWhite: { background: '#FFF', height: '100vh', overflow:'hidden', display: 'flex', flexDirection: 'column', fontFamily:'sans-serif', position:'relative' },
  
  header: { background:'white', padding:'15px 20px', display:'flex', alignItems:'center', gap:'15px', borderBottom:'1px solid #eee', flexShrink: 0 },
  headerTitle: { fontSize:'18px', fontWeight:'700', color:'#1C1C1C' },
  searchBar: { background:'white', border:'1px solid #E0E0E0', borderRadius:'12px', padding:'12px 15px', display:'flex', alignItems:'center', gap:'10px' },
  searchInput: { border:'none', outline:'none', fontSize:'15px', color:'#1C1C1C', width:'100%', fontWeight:'500', background:'transparent' },
  scrollArea: { flex:1, overflowY:'auto', padding:'0', WebkitOverflowScrolling: 'touch' },
  capsuleCard: { background: 'white', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', borderRadius: '16px', marginBottom: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' },
  iconCircleRed: { width:'24px', height:'24px', display:'flex', alignItems:'center', justifyContent:'center' },
  actionTitle: { fontSize:'16px', fontWeight:'600', color:'#E23744', marginBottom:'2px' },
  actionSub: { fontSize:'12px', color:'#333', fontWeight:'500', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:'220px' }, 
  sectionTitle: { padding:'25px 20px 10px 20px', fontSize:'11px', fontWeight:'700', color:'#9CA3AF', letterSpacing:'0.8px', textTransform:'uppercase' },
  addressCard: { background:'white', padding:'20px', margin:'0 15px 15px 15px', borderRadius:'16px', display:'flex', gap:'15px', boxShadow:'0 2px 8px rgba(0,0,0,0.04)', position:'relative' },
  cardLeft: { display:'flex', flexDirection: 'column', alignItems: 'center', gap:'5px' },
  iconBox: { width:'30px', height:'30px', borderRadius:'50%', background:'#f5f5f5', display:'flex', alignItems:'center', justifyContent:'center' },
  cardRight: { flex:1, cursor:'pointer' },
  cardType: { fontSize:'16px', fontWeight:'700', color:'#1C1C1C', textTransform:'capitalize' },
  cardAddress: { fontSize:'13px', color:'#666', margin:'4px 0 8px 0', lineHeight:'1.4' },
  cardPhone: { fontSize:'13px', color:'#333', fontWeight:'500' },
  menuIcon: { padding:'5px', cursor:'pointer' },
  popupMenu: { position:'absolute', top:'35px', right:'0', background:'white', boxShadow:'0 4px 15px rgba(0,0,0,0.15)', borderRadius:'8px', zIndex:10, minWidth:'120px', overflow:'hidden', border:'1px solid #eee' },
  menuItem: { padding:'12px 15px', fontSize:'13px', fontWeight:'600', cursor:'pointer', borderBottom:'1px solid #f9f9f9', color:'#333', display:'flex', gap:'8px', alignItems:'center' },
  nearbyRow: { background:'white', padding:'15px 20px', display:'flex', alignItems:'center', gap:'15px', borderBottom:'1px solid #f5f5f5', cursor:'pointer', margin: '0 15px' },
  pinCircle: { width:'32px', height:'32px', borderRadius:'50%', background:'#f0f0f0', display:'flex', alignItems:'center', justifyContent:'center' },
  nearbyTitle: { fontSize:'14px', fontWeight:'700', color:'#333' },
  nearbySub: { fontSize:'12px', color:'#888', textTransform:'capitalize' },
  searchResultRow: { background:'white', padding:'15px 20px', display:'flex', alignItems:'center', gap:'15px', borderBottom:'1px solid #f5f5f5', cursor:'pointer' },

  topSection: { width:'100%', display:'flex', flexDirection:'column', transition:'height 0.3s ease-in-out', flexShrink:0 },
  
  headerGlass: { 
    background: 'rgba(255, 255, 255, 0.85)', 
    backdropFilter: 'blur(10px)', 
    padding:'20px 20px 10px 20px', 
    flexShrink: 0, 
    zIndex:10,
    borderBottom:'1px solid rgba(0,0,0,0.05)'
  },
  headerTitleLarge: { fontSize:'18px', fontWeight:'800', color:'#1C1C1C' },
  statusBadge: { display:'flex', alignItems:'center', gap:'6px', padding:'4px 8px', borderRadius:'12px', transition:'all 0.3s ease' },
  
  searchTriggerGlass: { 
    background: 'rgba(255, 255, 255, 0.6)', 
    border:'1px solid rgba(0,0,0,0.1)', 
    borderRadius:'12px', 
    padding:'12px 15px', 
    display:'flex', 
    alignItems:'center', 
    gap:'10px', 
    boxShadow:'0 4px 20px rgba(0,0,0,0.05)', 
    cursor:'pointer', 
    marginBottom:'10px' 
  },

  centerPin: { position:'absolute', top:'50%', left:'50%', zIndex:1000, display:'flex', flexDirection:'column', alignItems:'center', pointerEvents:'none' },
  pinWrapper: { position:'relative', display:'flex', flexDirection:'column', alignItems:'center' },
  pinShadow: { width:'10px', height:'4px', background:'rgba(0,0,0,0.3)', borderRadius:'50%', marginTop:'-2px', transition: 'all 0.3s ease' },
  blackTooltip: { background:'#1C1C1C', color:'white', fontSize:'11px', padding:'8px 12px', borderRadius:'8px', marginBottom:'12px', fontWeight:'600', position:'relative', whiteSpace:'nowrap', boxShadow:'0 4px 15px rgba(0,0,0,0.3)' },
  blackArrow: { position:'absolute', bottom:'-5px', left:'50%', transform:'translateX(-50%)', width:0, height:0, borderLeft:'5px solid transparent', borderRight:'5px solid transparent', borderTop:'5px solid #1C1C1C' },
  
  controlsContainer: { position:'absolute', bottom:'20px', right:'20px', left:'20px', display:'flex', justifyContent:'space-between', alignItems:'flex-end', zIndex:1000, transition: 'opacity 0.3s' },
  glassBtnPill: { 
    background:'rgba(255, 255, 255, 0.95)', 
    backdropFilter:'blur(5px)',
    border:'1px solid rgba(0,0,0,0.05)', 
    color:'#E23744', 
    padding:'10px 20px', 
    borderRadius:'25px', 
    display:'flex', 
    alignItems:'center', 
    gap:'6px', 
    fontSize:'13px', 
    fontWeight:'700', 
    boxShadow:'0 4px 15px rgba(0,0,0,0.1)',
    cursor:'pointer'
  },
  glassBtnSquare: {
    background:'rgba(255, 255, 255, 0.95)', 
    backdropFilter:'blur(5px)',
    border:'1px solid rgba(0,0,0,0.05)', 
    width:'44px',
    height:'44px',
    borderRadius:'12px', 
    display:'flex', 
    alignItems:'center', 
    justifyContent:'center', 
    boxShadow:'0 4px 15px rgba(0,0,0,0.1)',
    cursor:'pointer'
  },

  sheetFlexContainer: { flex:1, display:'flex', flexDirection:'column', background:'white', borderTopLeftRadius:'24px', borderTopRightRadius:'24px', marginTop:'-15px', position:'relative', zIndex:1001, boxShadow:'0 -5px 30px rgba(0,0,0,0.1)', overflow:'hidden' },
  sheetHandle: { width:'40px', height:'4px', background:'#E0E0E0', borderRadius:'10px', margin:'12px auto 12px auto', flexShrink:0 },
  locTitle: { fontSize:'20px', fontWeight:'800', color:'#1C1C1C', marginBottom:'4px', lineHeight:'1.2' },
  locSub: { fontSize:'13px', color:'#666', lineHeight:'1.4' },
  changeBtn: { border:'none', background:'none', padding:'0' },
  
  distanceWarningBox: { background:'#FFF9E5', border:'1px solid #F5E0B0', padding:'15px', borderRadius:'12px', marginTop:'15px', fontSize:'13px', lineHeight:'1.5', color:'#1C1C1C' },
  warningActionLink: { color:'#E23744', fontWeight:'700', marginTop:'2px', cursor:'pointer', display:'inline-block' },

  scrollableFormContent: { flex:1, overflowY:'auto', padding:'10px 20px' },
  inputBoxFull: { border: '1px solid #E0E0E0', borderRadius:'10px', padding: '14px', marginBottom:'15px', background:'white', display:'flex', alignItems:'center' },
  inputRaw: { border:'none', outline:'none', fontSize:'14px', width:'100%', color:'#1C1C1C', background:'transparent' },
  chips: { display:'flex', gap:'10px', marginBottom:'25px' },
  chip: { padding:'8px 18px', borderRadius:'20px', border:'1px solid #E0E0E0', background:'white', fontSize:'13px', fontWeight:'600', color:'#555', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px' },
  chipActive: { padding:'8px 18px', borderRadius:'20px', border:'1px solid #E23744', background:'#FFF0F0', fontSize:'13px', fontWeight:'600', color:'#E23744', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px' },
  
  photoUploadBox: { border:'1px dashed #E0E0E0', borderRadius:'12px', padding:'15px', display:'flex', alignItems:'center', gap:'15px', marginTop:'10px', cursor:'pointer', background:'#FAFAFA' },
  photoIconCircle: { width:'36px', height:'36px', borderRadius:'50%', background:'#FFF0F0', display:'flex', alignItems:'center', justifyContent:'center' },

  fixedFooter: { padding:'15px 20px', background:'white', borderTop:'1px solid #f9f9f9', flexShrink:0, position:'absolute', bottom:0, width:'100%', boxSizing:'border-box', zIndex:1002, display:'flex', justifyContent:'center' },
  saveBtn: { background:'#F84464', color:'white', border:'none', padding:'16px', fontSize:'16px', fontWeight:'700', cursor:'pointer', letterSpacing:'0.5px', transition:'all 0.3s ease', display:'flex', alignItems:'center', justifyContent:'center' },

  backdrop: { position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.5)', zIndex:1999 },
  searchOverlayBottom: { position:'fixed', bottom:0, left:0, width:'100%', height:'85%', background:'white', zIndex:2000, borderTopLeftRadius:'24px', borderTopRightRadius:'24px', display:'flex', flexDirection:'column', animation:'slideUp 0.3s ease-out' },
  searchHeader: { padding:'20px', borderBottom:'1px solid #f0f0f0' },
  searchBoxActive: { display:'flex', alignItems:'center', gap:'10px', border:'1px solid #E23744', borderRadius:'12px', padding:'12px 15px', background:'white' }, 
  searchInputActive: { flex:1, border:'none', outline:'none', fontSize:'16px', color:'#1C1C1C', background:'white' }, 
  searchResultsList: { flex:1, overflowY:'auto', padding:'10px 0' },
  searchOptionRow: { display:'flex', alignItems:'center', gap:'15px', padding:'15px 20px', cursor:'pointer', borderBottom:'1px solid #f9f9f9' },
  inputRow: { display:'flex', gap:'15px', marginBottom:'20px' },
  inputBox: { flex:1, border: '1px solid #E0E0E0', borderRadius:'10px', padding: '14px', fontSize: '14px', outline: 'none', background:'white', color:'#1C1C1C' },
  label: { fontSize:'11px', fontWeight:'800', color:'#9CA3AF', marginTop:'5px', marginBottom:'12px', letterSpacing:'0.6px' },
};

export default UserLocation;