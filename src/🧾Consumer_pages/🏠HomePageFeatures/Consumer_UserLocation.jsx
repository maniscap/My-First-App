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
const updateConsumer_HomePageLocation = (address, title, lat, lng) => {
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
const Consumer_UserLocation = () => {
  const navigate = useNavigate();
  const dragTimeoutRef = useRef(null);
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
      houseNo: '', landmark: '', village: '', nearerCity: '', mandal: '', city: '', district: '', pincode: '', state: '',
      receiverName: '', phone: '' 
  });
  
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);
  const [isMapShrunk, setIsMapShrunk] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

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
    setFormData({ houseNo: '', landmark: '', village: '', nearerCity: '', mandal: '', city: '', district: '', pincode: '', state: '', receiverName: '', phone: '' });
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
                autoNearerCity: addr.municipality || '',
                autoDistrict: addr.countrySecondarySubdivision || addr.municipality || '',
                autoState: addr.countrySubdivision || '',
                autoPin: addr.postalCode || addr.postcode || ''
            };
        }
        throw new Error("No results from TomTom");
    } catch (e) { 
        console.warn("TomTom failed/limit reached. Falling back to OpenStreetMap...", e);
        try {
            const osmRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
            const osmData = await osmRes.json();
            const addr = osmData.address || {};
            const locationLabel = addr.village || addr.suburb || addr.town || addr.city || "Unknown Area";
            return {
                name: locationLabel,
                city: addr.city || addr.county || "",
                full: osmData.display_name || "Location found",
                autoVillage: addr.village || addr.suburb || '',
                autoMandal: addr.county || addr.state_district || '',
                autoCity: addr.city || addr.town || '',
                autoNearerCity: addr.city || addr.county || '',
                autoDistrict: addr.state_district || '',
                autoState: addr.state || '',
                autoPin: addr.postcode || ''
            };
        } catch (osmError) {
            return { name: "Network Error", city: "", full: "" }; 
        }
    }
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
    const initialCheck = setTimeout(() => requestGPS(), 0);
    return () => {
      document.head.removeChild(styleSheet);
      clearTimeout(initialCheck);
    };
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      if (searchQuery.trim().length > 2) {
        const results = await searchPlaces(searchQuery);
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    };
    const timer = setTimeout(fetchResults, 800);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleDirectCurrentLocation = () => {
    // 1. If GPS and address were already fetched in the background on page load, use them INSTANTLY.
    if (deviceLoc && currentLocName && currentLocName !== "Detecting location...") {
        updateConsumer_HomePageLocation(currentLocName, "Current Location", deviceLoc.lat, deviceLoc.lng);
        navigate('/Consumer_HomePage');
        return;
    }

    // 2. Fallback: If clicked before background load finished, fetch it now.
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        const details = await fetchAddressFromCoords(latitude, longitude);
        updateConsumer_HomePageLocation(details.full || `${details.name}, ${details.city}`, "Current Location", latitude, longitude);
        navigate('/Consumer_HomePage');
    }, (err) => console.error(err), { enableHighAccuracy: true });
  };

  const handleMapMoveStart = () => { setIsDragging(true); };
  const handleMapMoveEnd = (center) => {
      setIsDragging(false); 
      setCoords({ lat: center.lat, lng: center.lng });
      
      // DEBOUNCE: Clear previous timer so it only fetches 1.5s AFTER they completely stop dragging
      if (dragTimeoutRef.current) clearTimeout(dragTimeoutRef.current);
      
      dragTimeoutRef.current = setTimeout(async () => {
          setIsAddressLoading(true);
          const details = await fetchAddressFromCoords(center.lat, center.lng);
          setPinDetails(details);
          setIsAddressLoading(false);
          setFormData(prev => ({ 
              ...prev, 
              village: details.autoVillage || prev.village, 
              mandal: details.autoMandal || prev.mandal, 
              city: details.autoCity || prev.city, 
              nearerCity: details.autoNearerCity || prev.nearerCity, 
              district: details.autoDistrict || prev.district, 
              state: details.autoState || prev.state, 
              pincode: details.autoPin || prev.pincode 
          }));
      }, 1500);
  };

  const handleResetToCurrentLocation = () => {
      requestGPS();
      if(deviceLoc) { setCoords(deviceLoc); setIsFlying(true); setTimeout(() => setIsFlying(false), 1500); handleMapMoveEnd(deviceLoc); }
  };

  const saveAddress = () => {
    setAttemptedSubmit(true);
    const reqFields = ['houseNo', 'receiverName', 'phone'];
    for (const field of reqFields) {
      if (!formData[field]) {
        const el = document.getElementById('input-' + field);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.focus();
        }
        return;
      }
    }
    
    setIsSaving(true); 
    setTimeout(() => {
        const parts = [formData.houseNo, pinDetails.name, pinDetails.city].filter(p => p && p.trim().length > 0);
        const fullAddress = parts.join(', ');
        const newEntry = { id: editingId || Date.now(), type: addressType, address: fullAddress, details: formData, lat: coords.lat, lng: coords.lng, image: selectedImage };
        let updatedList = editingId ? savedAddresses.map(a => a.id === editingId ? newEntry : a) : [newEntry, ...savedAddresses];
        setSavedAddresses(updatedList);
        localStorage.setItem('my_saved_addresses', JSON.stringify(updatedList));
        updateConsumer_HomePageLocation(fullAddress, addressType, coords.lat, coords.lng);
        setIsSaving(false);
        setView('list'); 
    }, 800); 
  };

  const handleSelectPlace = (address, title, lat, lng) => {
      addToHistory(title); 
      updateConsumer_HomePageLocation(address, title, lat, lng);
      navigate('/Consumer_HomePage');
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
    const defaultData = { houseNo: '', landmark: '', village: '', nearerCity: '', mandal: '', city: '', district: '', pincode: '', state: '', receiverName: '', phone: '' };
    setFormData({ ...defaultData, ...(addressToEdit.details || {}) });
    
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
          <ArrowLeft onClick={() => navigate(-1)} style={{cursor:'pointer'}} color="#111827" />
          <span style={styles.headerTitle}>Select a location</span>
        </div>
        
        <div style={styles.searchSectionWrapper}>
            <div style={styles.searchBar}>
                <Search color="#3B82F6" size={20} />
                <input type="text" placeholder="Search area, street..." style={styles.searchInput} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                {searchQuery && <X size={18} color="#9CA3AF" onClick={() => setSearchQuery('')} style={{cursor:'pointer'}} />}
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
                    <div style={styles.iconCircleBlue}><LocateFixed size={22} color="#3B82F6" strokeWidth={2.5} /></div>
                    <div style={{flex:1}}><div style={styles.actionTitle}>Use current location</div><div style={styles.actionSub}>{currentLocName}</div></div>
                    <span style={{color:'#D1D5DB'}}>›</span>
                </div>
                <div style={styles.capsuleCard} onClick={startAddAddress}>
                    <div style={styles.iconCircleBlue}><Plus size={22} color="#3B82F6" /></div>
                    <div style={{flex:1}}><div style={styles.actionTitle}>Add Address</div></div>
                    <span style={{color:'#D1D5DB'}}>›</span>
                </div>
            </div>
            
            {savedAddresses.length > 0 && <div style={styles.sectionTitle}>SAVED ADDRESSES</div>}
            
            {savedAddresses.map(addr => (
                <div key={addr.id} style={styles.addressCard}>
                    <div style={styles.cardLeft}><div style={styles.iconBox}>{addr.type === 'Work' ? <Briefcase size={18} color="#4B5563"/> : <Home size={18} color="#4B5563"/>}</div></div>
                    <div style={styles.cardRight} onClick={() => handleSelectPlace(addr.address, addr.type, addr.lat, addr.lng)}>
                        <div style={styles.cardType}>{addr.type}</div>
                        <div style={styles.cardAddress}>{addr.address}</div>
                        <div style={styles.cardPhone}>Phone: {addr.details?.phone || "N/A"}</div>
                    </div>
                    <div style={{position:'relative'}}>
                        <div style={styles.menuIcon} onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === addr.id ? null : addr.id); }}><MoreVertical size={20} color="#374151" /></div>
                        {activeMenuId === addr.id && (
                            <div style={styles.popupMenu}>
                                <div style={styles.menuItem} onClick={() => startEditAddress(addr)}><Edit2 size={14} color="#374151"/> Edit</div>
                                <div style={styles.menuItem} onClick={() => handleShareAddress(addr)}><Share2 size={14} color="#374151"/> Share</div>
                                <div style={{...styles.menuItem, color:'#EF4444'}} onClick={() => deleteAddress(addr.id)}><Trash2 size={14}/> Delete</div>
                            </div>
                        )}
                    </div>
                </div>
            ))}

            <div style={styles.sectionTitle}>NEARBY PLACES</div>
            {nearbyLocs.map(loc => (
                <div key={loc.id} style={styles.nearbyRow} onClick={() => handleSelectPlace(loc.address, loc.name, loc.lat, loc.lng)}>
                    <div style={styles.pinCircle}><MapPin size={18} color="#4B5563" /></div>
                    <div><div style={styles.nearbyTitle}>{loc.name}</div><div style={styles.nearbySub}>{loc.address} • <span style={{color:'#3B82F6', fontWeight:600}}>{formatDistance(loc.meters)}</span></div></div>
                </div>
            ))}
            <div style={{height:'30px'}}></div>
        </div>
      </div>
    );
  }

  // --- RENDERING MAP VIEW ---
  return (
    <div style={{ background: '#F9FAFB', height: '100vh', overflow:'auto', display: 'flex', flexDirection: 'column', position:'relative', fontFamily: '"Inter", sans-serif' }}>
        <header style={{ background:'white', padding:'16px 20px', display:'flex', alignItems:'center', gap:'16px', borderBottom:'1px solid #E5E7EB', position: 'sticky', top: 0, zIndex: 100 }}>
          <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center' }} onClick={() => setView('list')}>
            <ArrowLeft size={24} color="#111827" />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={24} color="#111827" />
            <h1 style={{ fontSize:'18px', fontWeight:'900', color:'#111827', margin: 0 }}>Location Details</h1>
          </div>
        </header>

        <main style={{ flex: 1, padding: '20px' }}>
          
          <div style={{ marginBottom: '32px', backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '20px', boxShadow: '0 8px 30px rgba(0,0,0,0.04)', border: '1px solid #E5E7EB' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#111827' }}>Location GPS</h3>
                  {gpsStatus === 'active' ? (
                    <div style={{ padding: '4px 10px', backgroundColor: '#D1FAE5', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #10B981' }}>
                       <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981', animation: 'pulse 2s infinite' }} />
                       <span style={{ fontSize: '11px', fontWeight: '800', color: '#065F46' }}>LOCKED</span>
                    </div>
                  ) : (
                    <div style={{ padding: '4px 10px', backgroundColor: '#FEE2E2', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #EF4444' }}>
                       <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
                       <span style={{ fontSize: '11px', fontWeight: '800', color: '#991B1B' }}>NO GPS</span>
                    </div>
                  )}
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6B7280' }}>Pinpoint your exact delivery location.</p>
              </div>
              <div style={{ display: 'flex', backgroundColor: '#F3F4F6', borderRadius: '10px', padding: '4px' }}>
                 <button onClick={() => setMapType('basic')} style={{ padding: '8px 14px', fontSize: '13px', fontWeight: '800', border: 'none', borderRadius: '8px', backgroundColor: mapType === 'basic' ? '#FFFFFF' : 'transparent', color: mapType === 'basic' ? '#111827' : '#6B7280', cursor: 'pointer', boxShadow: mapType === 'basic' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.2s' }}>Map</button>
                 <button onClick={() => setMapType('hybrid')} style={{ padding: '8px 14px', fontSize: '13px', fontWeight: '800', border: 'none', borderRadius: '8px', backgroundColor: mapType === 'hybrid' ? '#FFFFFF' : 'transparent', color: mapType === 'hybrid' ? '#111827' : '#6B7280', cursor: 'pointer', boxShadow: mapType === 'hybrid' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.2s' }}>Satellite</button>
              </div>
            </div>

            <div style={{ borderRadius: '16px', overflow: 'hidden', height: '280px', position: 'relative', backgroundColor: '#E5E7EB', border: '1px solid #D1D5DB' }}>
              <iframe 
                width="100%" 
                height="100%" 
                frameBorder="0" 
                scrolling="no" 
                marginHeight="0" 
                marginWidth="0" 
                src={`https://maps.google.com/maps?q=${coords.lat || 12.92},${coords.lng || 80.22}&t=${mapType === 'hybrid' ? 'k' : 'm'}&z=18&ie=UTF8&iwloc=&output=embed`}
                style={{ display: 'block' }}
                title="Delivery Location Map"
              />
            </div>

            <button 
              type="button" 
              onClick={handleResetToCurrentLocation} 
              style={{ width: '100%', marginTop: '20px', padding: '16px', background: '#EFF6FF', color: '#3B82F6', border: '1px dashed #3B82F6', borderRadius: '14px', fontWeight: '800', fontSize: '15px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <LocateFixed size={20} />
              Auto-Detect with GPS
            </button>
            
            <button 
              type="button" 
              onClick={() => setIsSearchOpen(true)} 
              style={{ width: '100%', marginTop: '12px', padding: '16px', background: '#FFFFFF', color: '#6B7280', border: '1px solid #E5E7EB', borderRadius: '14px', fontWeight: '800', fontSize: '15px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <Search size={20} color="#9CA3AF" />
              {pinDetails.name ? pinDetails.name : 'Search for a landmark...'}
            </button>
          </div>
          
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '20px', boxShadow: '0 8px 30px rgba(0,0,0,0.04)', border: '1px solid #E5E7EB', marginBottom: '40px' }}>
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#111827' }}>Delivery Address</h3>
              <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#6B7280' }}>Please fill out the details below.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#374151', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Latitude <span style={{color: '#EF4444'}}>*</span></label>
                  <input type="text" readOnly value={coords.lat.toFixed(6)} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #D1D5DB', fontSize: '16px', color: '#6B7280', backgroundColor: '#F3F4F6', outline: 'none', boxSizing: 'border-box' }} placeholder="Auto-filled" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#374151', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Longitude <span style={{color: '#EF4444'}}>*</span></label>
                  <input type="text" readOnly value={coords.lng.toFixed(6)} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #D1D5DB', fontSize: '16px', color: '#6B7280', backgroundColor: '#F3F4F6', outline: 'none', boxSizing: 'border-box' }} placeholder="Auto-filled" />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#374151', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>House / Flat / Block No. <span style={{color: '#EF4444'}}>*</span></label>
                <input id="input-houseNo" type="text" value={formData.houseNo} onChange={e => setFormData({...formData, houseNo: e.target.value})} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: (attemptedSubmit && !formData.houseNo) ? '1px solid #EF4444' : '1px solid #D1D5DB', fontSize: '16px', color: '#111827', backgroundColor: '#FFFFFF', outline: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', boxSizing: 'border-box' }} placeholder="E.g. Flat 402" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#374151', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Landmark (Optional)</label>
                <input id="input-landmark" type="text" value={formData.landmark} onChange={e => setFormData({...formData, landmark: e.target.value})} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #D1D5DB', fontSize: '16px', color: '#111827', backgroundColor: '#FFFFFF', outline: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', boxSizing: 'border-box' }} placeholder="Near Apollo Pharmacy" />
              </div>
              
              <div style={{ marginTop: '8px', padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '16px', border: '1px dashed #D1D5DB' }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#9CA3AF', marginBottom: '16px', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={14} /> AUTO-FILLED BY GPS
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#6B7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Village / City</label>
                        <input id="input-village" type="text" value={formData.village || ''} readOnly style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: '16px', color: '#6B7280', backgroundColor: '#F3F4F6', outline: 'none', boxSizing: 'border-box' }} placeholder="Village / Area" />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#6B7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nearer City</label>
                        <input id="input-nearerCity" type="text" value={formData.nearerCity || ''} readOnly style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: '16px', color: '#6B7280', backgroundColor: '#F3F4F6', outline: 'none', boxSizing: 'border-box' }} placeholder="Nearer City" />
                      </div>
                      <div style={{ display: 'flex', gap: '16px' }}>
                          <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#6B7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Mandal</label>
                            <input id="input-mandal" type="text" value={formData.mandal || ''} readOnly style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: '16px', color: '#6B7280', backgroundColor: '#F3F4F6', outline: 'none', boxSizing: 'border-box' }} placeholder="Mandal" />
                          </div>
                          <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#6B7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>District</label>
                            <input id="input-district" type="text" value={formData.district || ''} readOnly style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: '16px', color: '#6B7280', backgroundColor: '#F3F4F6', outline: 'none', boxSizing: 'border-box' }} placeholder="District" />
                          </div>
                      </div>
                      <div style={{ display: 'flex', gap: '16px' }}>
                          <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#6B7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>State</label>
                            <input id="input-state" type="text" value={formData.state || ''} readOnly style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: '16px', color: '#6B7280', backgroundColor: '#F3F4F6', outline: 'none', boxSizing: 'border-box' }} placeholder="State" />
                          </div>
                          <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#6B7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pincode</label>
                            <input id="input-pincode" type="text" value={formData.pincode || ''} readOnly style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: '16px', color: '#6B7280', backgroundColor: '#F3F4F6', outline: 'none', boxSizing: 'border-box' }} placeholder="Pincode" />
                          </div>
                      </div>
                  </div>
              </div>

              <div style={{ marginTop: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#374151', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Receiver's Name <span style={{color: '#EF4444'}}>*</span></label>
                <input id="input-receiverName" type="text" value={formData.receiverName} onChange={e => setFormData({...formData, receiverName: e.target.value})} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: (attemptedSubmit && !formData.receiverName) ? '1px solid #EF4444' : '1px solid #D1D5DB', fontSize: '16px', color: '#111827', backgroundColor: '#FFFFFF', outline: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', boxSizing: 'border-box' }} placeholder="John Doe" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#374151', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phone Number <span style={{color: '#EF4444'}}>*</span></label>
                <input id="input-phone" type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: (attemptedSubmit && !formData.phone) ? '1px solid #EF4444' : '1px solid #D1D5DB', fontSize: '16px', color: '#111827', backgroundColor: '#FFFFFF', outline: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', boxSizing: 'border-box' }} placeholder="+91 00000 00000" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#374151', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Save As</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                    {[ {t:'Home', i:<Home size={16}/>}, {t:'Work', i:<Briefcase size={16}/>}, {t:'Other', i:<Bookmark size={16}/>} ].map(item => (
                        <button key={item.t} onClick={() => setAddressType(item.t)} style={{ flex: 1, padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: '800', fontSize: '14px', border: addressType === item.t ? '2px solid #3B82F6' : '1px solid #D1D5DB', backgroundColor: addressType === item.t ? '#EFF6FF' : '#FFFFFF', color: addressType === item.t ? '#3B82F6' : '#6B7280', cursor: 'pointer', transition: 'all 0.2s' }}>
                            {item.i} {item.t}
                        </button>
                    ))}
                </div>
              </div>

              <div style={{ marginTop: '16px', border: '1px dashed #D1D5DB', borderRadius: '16px', padding: '20px', backgroundColor: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px' }} onClick={() => fileInputRef.current.click()}>
                  <input type="file" ref={fileInputRef} style={{display: 'none'}} accept="image/*" onChange={handleImageUpload} />
                  {selectedImage ? (
                      <>
                          <img src={selectedImage} alt="Addr" style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover' }}/>
                          <div style={{flex:1}}><div style={{ fontSize: '15px', fontWeight: '800', color: '#111827' }}>Photo Added</div><div style={{ fontSize: '13px', color: '#6B7280' }}>Tap to change</div></div>
                          <Check size={24} color="#10B981" />
                      </>
                  ) : (
                      <>
                          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Camera size={24} color="#3B82F6" /></div>
                          <div style={{flex:1}}><div style={{ fontSize: '15px', fontWeight: '800', color: '#111827' }}>Add building photo</div><div style={{ fontSize: '13px', color: '#6B7280' }}>Helps delivery worker find you</div></div>
                      </>
                  )}
              </div>

              <div style={{ marginTop: '16px', backgroundColor: '#FEF2F2', border: '1px dashed #EF4444', borderRadius: '12px', padding: '16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <AlertCircle size={20} color="#DC2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                <p style={{ margin: 0, fontSize: '13px', color: '#991B1B', lineHeight: '1.5', fontWeight: '600' }}>
                  <strong style={{ fontWeight: '800' }}>Note:</strong> Check the details thoroughly. Ensure your GPS pin is perfectly placed so the delivery driver can easily navigate to your exact doorstep!
                </p>
              </div>

              <button 
                onClick={saveAddress}
                disabled={isSaving}
                style={{ marginTop: '16px', marginBottom: '8px', width: '100%', padding: '18px', backgroundColor: isSaving ? '#10B981' : '#3B82F6', color: '#FFFFFF', border: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: '800', cursor: isSaving ? 'not-allowed' : 'pointer', boxShadow: isSaving ? 'none' : '0 6px 16px rgba(59, 130, 246, 0.25)', transition: 'all 0.3s' }}
              >
                {isSaving ? 'Address Saved ✓' : 'Save Address & Proceed'}
              </button>

            </div>
          </div>
        </main>

        {isSearchOpen && (
            <>
                <div style={styles.backdrop} onClick={() => setIsSearchOpen(false)}></div>
                <div style={styles.searchOverlayBottom}>
                    <div style={styles.searchHeader}>
                        <div style={styles.searchBoxActive}><Search size={20} color="#3B82F6" /><input autoFocus placeholder="Search landmarks, area..." style={styles.searchInputActive} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /><X size={20} color="#374151" onClick={() => setIsSearchOpen(false)} /></div>
                        
                        <div style={styles.historyRowOverlay}>
                            {searchHistory.map((tag, i) => (
                                <div key={i} onClick={() => {setSearchQuery(tag); setIsSearchOpen(false);}} style={styles.tagBtn}><Clock size={12}/> {tag}</div>
                            ))}
                        </div>
                    </div>
                    <div style={styles.searchResultsList}>
                        <div style={styles.searchOptionRow} onClick={() => { handleResetToCurrentLocation(); setIsSearchOpen(false); }}><LocateFixed size={20} color="#3B82F6"/><div style={styles.gpsUseText}>Use Current GPS</div></div>
                        {searchResults.map(res => (
                            <div key={res.id} style={styles.searchResultRow} onClick={() => { setCoords({ lat: res.lat, lng: res.lng }); addToHistory(res.name); setIsFlying(true); setTimeout(() => setIsFlying(false), 1500); setIsSearchOpen(false); setSearchQuery(''); }}>
                                <div style={styles.pinCircle}><MapPin size={16} color="#4B5563"/></div><div><div style={styles.nearbyTitle}>{res.name}</div><div style={styles.nearbySub}>{res.sub}</div></div>
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
  pageGray: { background: '#F9FAFB', height: '100vh', overflow:'hidden', display: 'flex', flexDirection: 'column', fontFamily:'"Inter", sans-serif' },
  pageWhite: { background: '#FFF', height: '100vh', overflow:'hidden', display: 'flex', flexDirection: 'column', position:'relative' },
  header: { background:'white', padding:'16px 20px', display:'flex', alignItems:'center', gap:'16px', borderBottom:'1px solid #E5E7EB' },
  headerTitle: { fontSize:'18px', fontWeight:'900', color:'#111827' },
  searchSectionWrapper: { padding:'15px 15px 10px 15px' },
  searchBar: { background:'#fff', border:'1px solid #E5E7EB', borderRadius:'16px', padding:'12px 16px', display:'flex', alignItems:'center', gap:'12px', boxShadow:'0 8px 30px rgba(0,0,0,0.04)' },
  searchInput: { border:'none', outline:'none', fontSize:'15px', color:'#111827', width:'100%', fontWeight:'600', background:'transparent' },
  historyRow: { display:'flex', gap:'8px', marginTop:'12px', overflowX:'auto', paddingBottom:'4px' },
  historyRowOverlay: { display:'flex', gap:'8px', marginTop:'12px', overflowX:'auto', paddingBottom:'4px' },
  scrollArea: { flex:1, overflowY:'auto' },
  tagBtn: { background:'#fff', border:'1px solid #E5E7EB', borderRadius:'10px', padding:'6px 12px', fontSize:'11px', fontWeight:'700', color:'#6B7280', display:'flex', alignItems:'center', gap:'6px', whiteSpace:'nowrap' },
  actionsWrapper: { padding: '0 15px' },
  capsuleCard: { background: 'white', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', borderRadius: '24px', marginBottom: '14px', border: '1px solid #E5E7EB', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' },
  iconCircleBlue: { width:'36px', height:'36px', borderRadius:'12px', background:'#EFF6FF', display:'flex', alignItems:'center', justifyContent:'center' },
  actionTitle: { fontSize:'16px', fontWeight:'800', color:'#111827' },
  actionSub: { fontSize:'12px', color:'#6B7280', marginTop:'3px', maxWidth:'200px', overflow:'hidden', textOverflow:'ellipsis' }, 
  sectionTitle: { padding:'24px 20px 12px 20px', fontSize:'11px', fontWeight:'900', color:'#9CA3AF', letterSpacing:'1.2px' },
  addressCard: { background:'white', padding:'22px', margin:'0 16px 16px 16px', borderRadius:'24px', display:'flex', gap:'16px', border:'1px solid #E5E7EB', boxShadow:'0 8px 30px rgba(0,0,0,0.04)', position:'relative' },
  cardLeft: { width:'36px' },
  iconBox: { width:'36px', height:'36px', borderRadius:'12px', background:'#F3F4F6', display:'flex', alignItems:'center', justifyContent:'center' },
  cardRight: { flex:1 },
  cardType: { fontSize:'16px', fontWeight:'900', color:'#111827' },
  cardAddress: { fontSize:'13px', color:'#6B7280', margin:'6px 0 12px 0', lineHeight:'1.5' },
  cardPhone: { fontSize:'12px', color:'#111827', fontWeight:'700' },
  menuIcon: { padding:'4px', cursor:'pointer' },
  popupMenu: { position:'absolute', top:'45px', right:'0', background:'white', boxShadow:'0 10px 30px rgba(0,0,0,0.15)', borderRadius:'14px', zIndex:100, minWidth:'140px', border:'1px solid #E5E7EB', overflow:'hidden' },
  menuItem: { padding:'15px 18px', fontSize:'13px', fontWeight:'800', cursor:'pointer', display:'flex', gap:'10px', alignItems:'center', color:'#374151' },
  nearbyRow: { background:'white', padding:'18px 20px', display:'flex', alignItems:'center', gap:'16px', borderBottom:'1px solid #E5E7EB' },
  pinCircle: { width:'36px', height:'36px', borderRadius:'50%', background:'#F3F4F6', display:'flex', alignItems:'center', justifyContent:'center' },
  nearbyTitle: { fontSize:'14px', fontWeight:'800', color:'#111827' },
  nearbySub: { fontSize:'12px', color:'#6B7280' },
  searchResultRow: { background:'white', padding:'18px 24px', display:'flex', alignItems:'center', gap:'16px', borderBottom:'1px solid #E5E7EB' },
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
  searchBoxActive: { display:'flex', alignItems:'center', gap:'14px', border:'2.5px solid #3B82F6', borderRadius:'20px', padding:'16px 20px' }, 
  searchInputActive: { flex:1, border:'none', outline:'none', fontSize:'16px', fontWeight:'700' }, 
  searchResultsList: { flex:1, overflowY:'auto' },
  searchOptionRow: { display:'flex', alignItems:'center', gap:'16px', padding:'20px 24px', borderBottom:'1px solid #E5E7EB' },
  gpsUseText: { fontWeight:'800', color:'#3B82F6' }
};

export default Consumer_UserLocation;