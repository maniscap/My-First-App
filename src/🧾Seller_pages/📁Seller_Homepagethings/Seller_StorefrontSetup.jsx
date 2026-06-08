import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, useMap, useMapEvents, Marker } from 'react-leaflet';
import { 
  ArrowLeft, Search, MapPin, LocateFixed, X, Camera, ChevronRight, 
  Layers, Check, Clock, Heart, Navigation, Store, Map, Phone, Info,
  Truck, Package, Watch
} from 'lucide-react';
import L from 'leaflet'; 
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { db } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

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

const Skeleton = ({ width, height }) => (
  <div style={{
    width: width, height: height, 
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%', borderRadius: '12px',
    animation: 'shimmer 1.5s infinite', marginBottom: '8px'
  }} />
);

// --- MAIN COMPONENT ---
const Seller_StorefrontSetup = () => {
  const navigate = useNavigate();
  const [deviceLoc, setDeviceLoc] = useState(null); 
  const [gpsStatus, setGpsStatus] = useState('checking'); 
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

  const sellerId = localStorage.getItem('seller_app_id');
  const [coords, setCoords] = useState({ lat: 12.92, lng: 80.22 }); 
  const [isFlying, setIsFlying] = useState(false);
  const [isAddressLoading, setIsAddressLoading] = useState(false);
  const [pinDetails, setPinDetails] = useState({ name: '', city: '', full: '' });
  const [isMapShrunk, setIsMapShrunk] = useState(false);

  // --- TABS & FORM STATE ---
  const [activeTab, setActiveTab] = useState('location'); // 'location', 'details', 'operations'
  
  const [formData, setFormData] = useState({ 
      houseNo: '', landmark: '', village: '', mandal: '', city: '', pincode: ''
  });
  
  const [storeDetails, setStoreDetails] = useState({
      accountType: 'single', shopName: '', ownerName: '', primaryPhone: '', altPhone: '', email: ''
  });
  
  const [operations, setOperations] = useState({
      openTime: '09:00', closeTime: '21:00', workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      deliveryMode: 'delivery', deliveryRadius: '5', additionalInfo: ''
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);

  // --- DATA LOADING ---
  useEffect(() => {
    const loadMasterData = async () => {
        // 1. Check LocalStorage Cache
        const localData = localStorage.getItem('master_storefront_data');
        if (localData) {
            populateState(JSON.parse(localData));
        }

        // 2. Sync with Firebase (in background or if no cache)
        if (sellerId && sellerId !== 'Unknown_ID') {
            try {
                const docRef = doc(db, 'seller_profiles', sellerId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data.storefront) {
                        localStorage.setItem('master_storefront_data', JSON.stringify(data.storefront));
                        if (!localData) populateState(data.storefront);
                    } else if (!localData) {
                        // Pre-fill from registration profile if no storefront setup yet
                        setStoreDetails({
                            accountType: data.accountType || 'single',
                            shopName: data.companyName || data.fullName || '',
                            ownerName: data.representativeName || data.fullName || '',
                            primaryPhone: data.phoneNumber || '',
                            altPhone: '',
                            email: data.email || ''
                        });
                    }
                }
            } catch (err) {
                console.error("Error fetching master data:", err);
            }
        }
    };
    loadMasterData();
  }, [sellerId]);

  const populateState = (data) => {
    if (data.location) {
        setCoords({ lat: data.location.lat, lng: data.location.lng });
        setFormData({
            houseNo: data.location.houseNo || '', landmark: data.location.landmark || '',
            village: data.location.village || '', mandal: data.location.mandal || '',
            city: data.location.city || '', pincode: data.location.pincode || ''
        });
        setPinDetails(prev => ({ ...prev, name: data.location.landmark || data.location.houseNo || 'Stored Location' }));
    }
    if (data.storeDetails) setStoreDetails(data.storeDetails);
    if (data.operations) setOperations(data.operations);
    if (data.shopImage) setSelectedImage(data.shopImage);
  };

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
    if (file) setSelectedImage(URL.createObjectURL(file));
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

  const requestGPS = () => {
    if (!navigator.geolocation) { setGpsStatus('denied'); return; }
    setGpsStatus('checking');
    navigator.geolocation.getCurrentPosition(
        async (pos) => {
            const { latitude, longitude } = pos.coords;
            setDeviceLoc({ lat: latitude, lng: longitude });
            setGpsStatus('active');
            if(!coords.lat) {
                setCoords({ lat: latitude, lng: longitude });
                handleMapMoveEnd({lat: latitude, lng: longitude});
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
      input:focus, textarea:focus { border-color: #F84464 !important; background: #fff !important; outline: none !important; }
      input, textarea { color: #111 !important; }
    `;
    document.head.appendChild(styleSheet);
    const initialCheck = setTimeout(() => requestGPS(), 0);
    return () => { document.head.removeChild(styleSheet); clearTimeout(initialCheck); };
  }, []);

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

  const saveStorefront = async () => {
    if (!sellerId || sellerId === 'Unknown_ID') return alert("Seller ID missing");
    setIsSaving(true); 
    
    const masterData = {
        location: { lat: coords.lat, lng: coords.lng, ...formData },
        storeDetails,
        operations,
        shopImage: selectedImage || null
    };

    try {
        await setDoc(doc(db, 'seller_profiles', sellerId), { storefront: masterData }, { merge: true });
        localStorage.setItem('master_storefront_data', JSON.stringify(masterData));
        
        const fullAddress = [formData.houseNo, formData.village, formData.city].filter(p => p && p.trim().length > 0).join(', ');
        updateSeller_HomePageLocation(fullAddress, "Store Location", coords.lat, coords.lng);
        
        setIsSaving(false);
        navigate('/Seller_HomePage');
    } catch (err) {
        console.error(err);
        setIsSaving(false);
    }
  };

  const getGoogleTileUrl = (type) => type === 'hybrid' ? "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" : "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}";
  
  const toggleWorkingDay = (day) => {
      setOperations(prev => ({
          ...prev,
          workingDays: prev.workingDays.includes(day) ? prev.workingDays.filter(d => d !== day) : [...prev.workingDays, day]
      }));
  };

  const mapHeight = activeTab === 'location' ? (isMapShrunk ? '25vh' : '45vh') : '15vh';

  return (
    <div style={styles.pageWhite}>
        <div style={{ ...styles.topSection, height: mapHeight }}>
            <div style={styles.headerGlass}>
                <div style={styles.mapHeaderTop}>
                    <div style={styles.mapHeaderLeft}>
                        <div onClick={() => navigate(-1)} style={styles.backCircle}><ArrowLeft size={18} color="#1C1C1C" strokeWidth={3} /></div>
                        <span style={styles.headerTitleLarge}>Master Setup</span>
                    </div>
                    <div style={{ ...styles.statusBadge, background: gpsStatus === 'active' ? '#E7F9F2' : '#FFF0F0' }} onClick={requestGPS}>
                        <div className="blink-indicator" style={{ background: gpsStatus === 'active' ? '#10B981' : '#F84464' }}></div>
                        <span style={{ fontSize:'10px', fontWeight:'900', color: gpsStatus === 'active' ? '#10B981' : '#F84464' }}> {gpsStatus === 'active' ? 'GPS ACTIVE' : 'NO GPS'} </span>
                    </div>
                </div>
            </div>

            <div style={{...styles.mapFrameWrapper, opacity: activeTab === 'location' ? 1 : 0.6}}>
                <MapContainer center={[coords.lat, coords.lng]} zoom={18} zoomControl={false} style={{height:'100%', width:'100%'}}>
                    <TileLayer url={getGoogleTileUrl(mapType)} />
                    <MapController coords={coords} isFlying={isFlying} />
                    <MapEventsHandler onMoveStart={handleMapMoveStart} onMoveEnd={handleMapMoveEnd} />
                    {deviceLoc && <Marker position={[deviceLoc.lat, deviceLoc.lng]} icon={gpsIcon} />}
                </MapContainer>
                
                <div style={{ ...styles.centerPin, opacity: (isMapShrunk || activeTab !== 'location') ? 0 : 1, transform: isDragging ? 'translate(-50%, -120%) scale(1.15)' : 'translate(-50%, -100%) scale(1)' }}>
                    <div style={{...styles.blackTooltip, opacity: isDragging ? 0 : 1}}>Storefront Location<div style={styles.blackArrow}></div></div>
                    <div className={isDragging ? "heart-pulse" : ""}><Heart size={48} color="#F84464" fill="#F84464" strokeWidth={1} style={styles.heartShadowFilter} /></div>
                    <div style={{ ...styles.pinShadow, transform: isDragging ? 'scale(0.3)' : 'scale(1)', opacity: isDragging ? 0.1 : 0.4 }}></div>
                </div>
                
                <div style={{...styles.controlsContainer, opacity: (isMapShrunk || activeTab !== 'location') ? 0 : 1}}>
                    <button style={styles.glassBtnSquare} onClick={() => setMapType(prev => prev === 'basic' ? 'hybrid' : 'basic')}>
                       <Layers size={18} color="#333" />
                       <div style={styles.layerLabel}>{mapType === 'basic' ? 'Hybrid' : 'Map'}</div>
                    </button>
                    <button style={styles.glassBtnPill} onClick={handleResetToCurrentLocation}><Navigation size={16} color="#F84464" fill="#F84464"/> Use Current GPS</button>
                </div>
            </div>
        </div>

        <div style={styles.sheetFlexContainer}>
            <div style={styles.tabsContainer} className="no-scrollbar">
                <div style={activeTab === 'location' ? styles.tabActive : styles.tab} onClick={() => setActiveTab('location')}><Map size={18} /> Location</div>
                <div style={activeTab === 'details' ? styles.tabActive : styles.tab} onClick={() => setActiveTab('details')}><Store size={18} /> Details</div>
                <div style={activeTab === 'operations' ? styles.tabActive : styles.tab} onClick={() => setActiveTab('operations')}><Clock size={18} /> Operations</div>
            </div>

            <div style={styles.scrollableFormContent} onScroll={e => { if(activeTab === 'location') setIsMapShrunk(e.target.scrollTop > 5); }}>
                
                {/* LOCATION TAB */}
                <div style={{ display: activeTab === 'location' ? 'block' : 'none' }}>
                    <div style={styles.searchTriggerInline} onClick={() => setIsSearchOpen(true)}>
                        <Search size={18} color="#F84464" />
                        <span style={{color:'#888', fontSize:'14px', fontWeight:'600'}}>Search area, landmarks...</span>
                    </div>

                    <div style={styles.locCardWrapper}>
                        <div style={styles.locCardFlex} onClick={() => setIsSearchOpen(true)}>
                            <div style={styles.locIconBox}><MapPin size={22} color="#fff" fill="#fff"/></div>
                            <div style={{flex:1}}>
                                {isAddressLoading ? ( <> <Skeleton width="50%" height="20px" /> <Skeleton width="80%" height="14px" /> </> ) : ( <> <div style={styles.locTitle}>{pinDetails.name || "Select Location"}</div> <div style={styles.locSub}>{pinDetails.full}</div> </> )}
                            </div>
                            <div style={styles.changeBtn}><ChevronRight size={18} color="#F84464" /></div>
                        </div>
                    </div>

                    <div style={styles.label}>EXACT ADDRESS</div>
                    <div style={styles.inputBoxFull}><input style={styles.inputRaw} placeholder="House / Plot / Farm No.*" value={formData.houseNo} onChange={e => setFormData({...formData, houseNo: e.target.value})} /></div>
                    <div style={styles.inputBoxFull}><input style={styles.inputRaw} placeholder="Landmark (Optional)" value={formData.landmark} onChange={e => setFormData({...formData, landmark: e.target.value})} /></div>
                    <div style={styles.inputBoxFull}><input style={styles.inputRaw} placeholder="Village" value={formData.village} onChange={e => setFormData({...formData, village: e.target.value})} /></div>
                    <div style={styles.inputRow}>
                        <div style={styles.inputBoxHalf}><input style={styles.inputRaw} placeholder="Mandal" value={formData.mandal} onChange={e => setFormData({...formData, mandal: e.target.value})} /></div>
                        <div style={styles.inputBoxHalf}><input style={styles.inputRaw} placeholder="City" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} /></div>
                    </div>
                    <div style={styles.inputBoxFull}><input style={styles.inputRaw} placeholder="Pincode" value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} /></div>

                    <div style={styles.label}>STOREFRONT PHOTO</div>
                    <div style={styles.photoUploadBox} onClick={() => fileInputRef.current.click()}>
                        <input type="file" ref={fileInputRef} style={{display: 'none'}} accept="image/*" onChange={handleImageUpload} />
                        {selectedImage ? (
                            <div style={styles.photoPreviewWrapper}>
                                <img src={selectedImage} alt="Location" style={styles.photoPreview}/><div style={{flex:1}}><div style={styles.photoAddedTitle}>Photo Added</div><div style={styles.photoChangeText}>Tap to change</div></div><Check size={20} color="#10B981" />
                            </div>
                        ) : (
                            <>
                                <div style={styles.photoIconCircle}><Camera size={20} color="#F84464" /></div>
                                <div style={{flex:1}}><div style={styles.photoInstructionsTitle}>Add Location Photo</div><div style={styles.photoInstructionsSub}>Helps buyers recognize your location</div></div>
                            </>
                        )}
                    </div>
                </div>

                {/* DETAILS TAB */}
                <div style={{ display: activeTab === 'details' ? 'block' : 'none' }}>
                    <div style={styles.label}>BUSINESS TYPE</div>
                    <div style={styles.chips}>
                        <div style={storeDetails.accountType === 'single' ? styles.chipActive : styles.chip} onClick={() => setStoreDetails({...storeDetails, accountType: 'single'})}>Individual</div>
                        <div style={storeDetails.accountType === 'organisation' ? styles.chipActive : styles.chip} onClick={() => setStoreDetails({...storeDetails, accountType: 'organisation'})}>Organisation</div>
                    </div>

                    <div style={styles.label}>PRIMARY INFO</div>
                    <div style={styles.inputBoxFull}><input style={styles.inputRaw} placeholder={storeDetails.accountType === 'organisation' ? "Organisation Name" : "Shop / Brand Name"} value={storeDetails.shopName} onChange={e => setStoreDetails({...storeDetails, shopName: e.target.value})} /></div>
                    <div style={styles.inputBoxFull}><input style={styles.inputRaw} placeholder="Owner / Representative Name" value={storeDetails.ownerName} onChange={e => setStoreDetails({...storeDetails, ownerName: e.target.value})} /></div>

                    <div style={styles.label}>CONTACT INFO</div>
                    <div style={styles.inputBoxFull}>
                        <div style={{display:'flex', alignItems:'center', gap:'10px'}}><Phone size={16} color="#999"/><input style={styles.inputRaw} placeholder="Primary Phone Number" type="tel" value={storeDetails.primaryPhone} onChange={e => setStoreDetails({...storeDetails, primaryPhone: e.target.value})} /></div>
                    </div>
                    <div style={styles.inputBoxFull}>
                        <div style={{display:'flex', alignItems:'center', gap:'10px'}}><Phone size={16} color="#999"/><input style={styles.inputRaw} placeholder="Alternate Phone (Optional)" type="tel" value={storeDetails.altPhone} onChange={e => setStoreDetails({...storeDetails, altPhone: e.target.value})} /></div>
                    </div>
                    <div style={styles.inputBoxFull}>
                        <div style={{display:'flex', alignItems:'center', gap:'10px'}}><Info size={16} color="#999"/><input style={styles.inputRaw} placeholder="Email Address (Optional)" type="email" value={storeDetails.email} onChange={e => setStoreDetails({...storeDetails, email: e.target.value})} /></div>
                    </div>
                </div>

                {/* OPERATIONS TAB */}
                <div style={{ display: activeTab === 'operations' ? 'block' : 'none' }}>
                    <div style={styles.label}>DELIVERY CAPABILITY</div>
                    <div style={{display:'flex', gap:'12px', marginBottom:'24px'}}>
                        <div style={operations.deliveryMode === 'delivery' ? styles.hugeChipActive : styles.hugeChip} onClick={() => setOperations({...operations, deliveryMode: 'delivery'})}>
                            <Truck size={28} color={operations.deliveryMode === 'delivery' ? '#F84464' : '#999'} />
                            <div style={styles.hugeChipTitle}>We Deliver</div>
                            <div style={styles.hugeChipSub}>Items sent to buyer</div>
                        </div>
                        <div style={operations.deliveryMode === 'pickup' ? styles.hugeChipActive : styles.hugeChip} onClick={() => setOperations({...operations, deliveryMode: 'pickup'})}>
                            <Package size={28} color={operations.deliveryMode === 'pickup' ? '#F84464' : '#999'} />
                            <div style={styles.hugeChipTitle}>Pickup Only</div>
                            <div style={styles.hugeChipSub}>Buyer must visit</div>
                        </div>
                    </div>

                    {operations.deliveryMode === 'delivery' && (
                        <>
                            <div style={styles.label}>DELIVERY RADIUS (KM)</div>
                            <div style={styles.inputBoxFull}><input style={styles.inputRaw} type="number" placeholder="e.g. 5" value={operations.deliveryRadius} onChange={e => setOperations({...operations, deliveryRadius: e.target.value})} /></div>
                        </>
                    )}

                    <div style={styles.label}>WORKING DAYS</div>
                    <div style={styles.daysGrid}>
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                            <div key={day} onClick={() => toggleWorkingDay(day)} style={operations.workingDays.includes(day) ? styles.dayChipActive : styles.dayChip}>{day}</div>
                        ))}
                    </div>

                    <div style={styles.label}>OPERATING HOURS</div>
                    <div style={styles.inputRow}>
                        <div style={styles.inputBoxHalf}><span style={{fontSize:'12px', color:'#888', display:'block', marginBottom:'4px'}}>Opens at</span><input style={styles.inputRaw} type="time" value={operations.openTime} onChange={e => setOperations({...operations, openTime: e.target.value})} /></div>
                        <div style={styles.inputBoxHalf}><span style={{fontSize:'12px', color:'#888', display:'block', marginBottom:'4px'}}>Closes at</span><input style={styles.inputRaw} type="time" value={operations.closeTime} onChange={e => setOperations({...operations, closeTime: e.target.value})} /></div>
                    </div>

                    <div style={styles.label}>ADDITIONAL DETAILS</div>
                    <div style={styles.inputBoxFull}><textarea style={{...styles.inputRaw, height:'80px', resize:'none'}} placeholder="Any special instructions or descriptions for your buyers..." value={operations.additionalInfo} onChange={e => setOperations({...operations, additionalInfo: e.target.value})} /></div>
                </div>

                <div style={styles.saveActionWrapper}>
                    <button style={{...styles.saveBtn, background: isSaving ? '#10B981' : '#F84464'}} onClick={saveStorefront} disabled={isSaving}>
                        {isSaving ? <Check color="white" size={24} /> : 'Save Master Template'}
                    </button>
                </div>
            </div>
        </div>

        {/* SEARCH OVERLAY */}
        {isSearchOpen && (
            <>
                <div style={styles.backdrop} onClick={() => setIsSearchOpen(false)}></div>
                <div style={styles.searchOverlayBottom}>
                    <div style={styles.searchHeader}>
                        <div style={styles.searchBoxActive}><Search size={20} color="#F84464" /><input autoFocus placeholder="Search landmarks, area..." style={styles.searchInputActive} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /><X size={20} color="#333" onClick={() => setIsSearchOpen(false)} /></div>
                        <div style={styles.historyRowOverlay}>
                            {searchHistory.map((tag, i) => (
                                <div key={i} onClick={() => {setSearchQuery(tag); setIsSearchOpen(false);}} style={styles.tagBtn}><Watch size={12}/> {tag}</div>
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

// --- STYLES OBJECT ---
const styles = {
  pageWhite: { background: '#FFF', height: '100vh', overflow:'hidden', display: 'flex', flexDirection: 'column', position:'relative', fontFamily:'"Inter", sans-serif' },
  topSection: { width:'100%', display:'flex', flexDirection:'column', transition:'all 0.5s cubic-bezier(0.2, 1, 0.3, 1)', flexShrink:0, position:'relative', overflow:'hidden', background:'#f8fafc' },
  headerGlass: { background: '#fff', padding:'16px 20px 12px 20px', flexShrink: 0, zIndex:10, borderBottom:'1px solid #F2F2F2' },
  mapHeaderTop: { display:'flex', alignItems:'center', justifyContent:'space-between' },
  mapHeaderLeft: { display:'flex', alignItems:'center', gap:'12px' },
  backCircle: { width:'34px', height:'34px', borderRadius:'50%', background:'#F7F7F7', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' },
  headerTitleLarge: { fontSize:'18px', fontWeight:'900', color:'#111' },
  statusBadge: { display:'flex', alignItems:'center', gap:'6px', padding:'6px 12px', borderRadius:'12px', cursor:'pointer' },
  mapFrameWrapper: { flex:1, position:'relative', overflow:'hidden', transition: 'opacity 0.3s ease' },
  centerPin: { position:'absolute', top:'50%', left:'50%', zIndex:1000, display:'flex', flexDirection:'column', alignItems:'center', pointerEvents:'none', transition:'all 0.4s' },
  heartShadowFilter: { filter: 'drop-shadow(0 8px 16px rgba(248, 68, 100, 0.4))' },
  pinShadow: { width:'16px', height:'6px', background:'rgba(0,0,0,0.12)', borderRadius:'50%', marginTop:'-4px', transition: 'all 0.3s' },
  blackTooltip: { background:'#1C1C1C', color:'white', fontSize:'10px', padding:'6px 10px', borderRadius:'8px', marginBottom:'8px', fontWeight:'900' },
  blackArrow: { position:'absolute', bottom:'-4px', left:'50%', transform:'translateX(-50%)', width:0, height:0, borderLeft:'4px solid transparent', borderRight:'4px solid transparent', borderTop:'4px solid #1C1C1C' },
  controlsContainer: { position:'absolute', bottom:'35px', right:'18px', left:'18px', display:'flex', justifyContent:'space-between', alignItems:'flex-end', zIndex:1000 },
  glassBtnPill: { background:'rgba(255, 255, 255, 0.95)', backdropFilter:'blur(10px)', color:'#F84464', padding:'12px 18px', borderRadius:'14px', display:'flex', alignItems:'center', gap:'8px', fontSize:'13px', fontWeight:'900', boxShadow:'0 8px 24px rgba(0,0,0,0.08)', border:'none', cursor:'pointer' },
  glassBtnSquare: { background:'rgba(255, 255, 255, 0.95)', backdropFilter:'blur(10px)', width:'46px', height:'46px', borderRadius:'12px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', boxShadow:'0 8px 24px rgba(0,0,0,0.08)', border:'none', cursor:'pointer' },
  layerLabel: { fontSize:'7px', fontWeight:'900', marginTop:'2px', textTransform:'uppercase' },
  sheetFlexContainer: { flex:1, display:'flex', flexDirection:'column', background:'white', borderTopLeftRadius:'36px', borderTopRightRadius:'36px', marginTop:'-35px', position:'relative', zIndex:10, boxShadow:'0 -15px 45px rgba(0,0,0,0.1)', overflow:'hidden' },
  
  tabsContainer: { display:'flex', gap:'12px', padding:'20px 24px 10px 24px', overflowX:'auto', borderBottom:'1px solid #f1f5f9' },
  tab: { padding:'12px 20px', fontSize:'14px', fontWeight:'700', color:'#64748b', cursor:'pointer', whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:'8px', borderRadius:'12px', transition:'0.2s', border:'1.5px solid transparent' },
  tabActive: { padding:'12px 20px', fontSize:'14px', fontWeight:'800', color:'#F84464', background:'#fff0f2', cursor:'pointer', whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:'8px', borderRadius:'12px', border:'1.5px solid #F84464', boxShadow:'0 4px 12px rgba(248, 68, 100, 0.1)' },
  
  scrollableFormContent: { flex:1, overflowY:'auto', padding:'20px 24px', background:'#fff', width:'100%', boxSizing:'border-box' },
  searchTriggerInline: { background: '#f8fafc', border:'1.5px solid #e2e8f0', borderRadius:'16px', padding:'16px 20px', display:'flex', alignItems:'center', gap:'12px', marginBottom:'20px', cursor:'pointer' },
  locCardWrapper: { marginBottom:'24px', background:'#FAFAFA', padding:'20px', borderRadius:'22px', border:'1px solid #F0F0F0' },
  locCardFlex: { display:'flex', gap:'12px', alignItems:'flex-start', cursor:'pointer' },
  locIconBox: { width:'46px', height:'46px', borderRadius:'18px', background:'#F84464', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  locTitle: { fontSize:'20px', fontWeight:'900', color:'#111', marginBottom:'3px' },
  locSub: { fontSize:'13px', color:'#888', lineHeight:'1.5' },
  changeBtn: { background:'none', border:'none' },
  
  inputBoxFull: { border: '1.5px solid #e2e8f0', borderRadius:'18px', padding: '16px 20px', marginBottom:'16px', background:'#f8fafc', boxSizing:'border-box', width:'100%', transition:'all 0.2s' },
  inputRow: { display:'flex', gap:'12px', marginBottom:'16px', width:'100%', boxSizing:'border-box' },
  inputBoxHalf: { flex:1, border: '1.5px solid #e2e8f0', borderRadius:'18px', padding: '16px 20px', background:'#f8fafc', boxSizing:'border-box', transition:'all 0.2s' },
  inputRaw: { border:'none', outline:'none', fontSize:'15px', width:'100%', background:'transparent', color:'#111', fontWeight:'700', padding:0 },
  label: { fontSize:'11px', fontWeight:'900', color:'#94a3b8', marginTop:'16px', marginBottom:'16px', letterSpacing:'1.5px' },
  
  chips: { display:'flex', gap:'10px', marginBottom:'24px' },
  chip: { flex:1, padding:'14px 10px', borderRadius:'16px', border:'1.5px solid #e2e8f0', background:'#f8fafc', fontSize:'14px', fontWeight:'800', color:'#64748b', display:'flex', justifyContent:'center', cursor:'pointer', transition:'0.2s' },
  chipActive: { flex:1, padding:'14px 10px', borderRadius:'16px', border:'2px solid #F84464', background:'#FFF2F4', fontSize:'14px', fontWeight:'900', color:'#F84464', display:'flex', justifyContent:'center', cursor:'pointer', boxShadow:'0 4px 12px rgba(248,68,100,0.1)' },
  
  hugeChip: { flex:1, padding:'24px 16px', borderRadius:'20px', border:'2px solid #e2e8f0', background:'#f8fafc', display:'flex', flexDirection:'column', alignItems:'center', gap:'10px', cursor:'pointer', transition:'0.2s' },
  hugeChipActive: { flex:1, padding:'24px 16px', borderRadius:'20px', border:'2px solid #F84464', background:'#fff0f2', display:'flex', flexDirection:'column', alignItems:'center', gap:'10px', cursor:'pointer', boxShadow:'0 8px 20px rgba(248,68,100,0.1)' },
  hugeChipTitle: { fontSize:'16px', fontWeight:'900', color:'#1e293b' },
  hugeChipSub: { fontSize:'12px', fontWeight:'600', color:'#64748b', textAlign:'center' },
  
  daysGrid: { display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'10px', marginBottom:'24px' },
  dayChip: { padding:'12px', borderRadius:'14px', background:'#f8fafc', border:'1.5px solid #e2e8f0', fontSize:'13px', fontWeight:'800', color:'#64748b', textAlign:'center', cursor:'pointer' },
  dayChipActive: { padding:'12px', borderRadius:'14px', background:'#10B981', border:'1.5px solid #10B981', fontSize:'13px', fontWeight:'800', color:'#fff', textAlign:'center', cursor:'pointer', boxShadow:'0 4px 10px rgba(16,185,129,0.2)' },
  
  photoUploadBox: { border:'2px dashed #cbd5e1', borderRadius:'24px', padding:'22px', display:'flex', alignItems:'center', gap:'16px', background:'#f8fafc', cursor:'pointer', transition:'0.2s' },
  photoIconCircle: { width:'44px', height:'44px', borderRadius:'50%', background:'#FFF0F2', display:'flex', alignItems:'center', justifyContent:'center' },
  photoPreviewWrapper: { display:'flex', alignItems:'center', gap:'12px', width:'100%' },
  photoPreview: { width:'50px', height:'50px', borderRadius:'14px', objectFit:'cover' },
  photoAddedTitle: { fontSize:'14px', fontWeight:'800', color:'#1e293b' },
  photoChangeText: { fontSize:'12px', fontWeight:'700', color:'#10B981' },
  photoInstructionsTitle: { fontSize:'14px', fontWeight:'800', color:'#1e293b' },
  photoInstructionsSub: { fontSize:'12px', fontWeight:'600', color:'#64748b' },
  
  saveActionWrapper: { padding:'30px 0 60px 0' },
  saveBtn: { background:'#F84464', color:'white', border:'none', padding:'20px', fontSize:'16px', fontWeight:'900', cursor:'pointer', letterSpacing:'0.5px', borderRadius:'18px', transition:'all 0.3s', boxShadow:'0 12px 28px rgba(248, 68, 100, 0.3)', width:'100%', display:'flex', justifyContent:'center', alignItems:'center' },
  
  backdrop: { position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.6)', zIndex:1999 },
  searchOverlayBottom: { position:'fixed', bottom:0, left:0, width:'100%', height:'94%', background:'white', zIndex:2000, borderTopLeftRadius:'36px', borderTopRightRadius:'36px', display:'flex', flexDirection:'column', overflow:'hidden' },
  searchHeader: { padding:'24px', borderBottom:'1px solid #F2F2F2' },
  searchBoxActive: { display:'flex', alignItems:'center', gap:'14px', border:'2.5px solid #F84464', borderRadius:'20px', padding:'16px 20px' }, 
  searchInputActive: { flex:1, border:'none', outline:'none', fontSize:'16px', fontWeight:'700' }, 
  historyRowOverlay: { display:'flex', gap:'8px', marginTop:'16px', overflowX:'auto', paddingBottom:'4px' },
  tagBtn: { background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:'10px', padding:'8px 14px', fontSize:'12px', fontWeight:'700', color:'#475569', display:'flex', alignItems:'center', gap:'6px', whiteSpace:'nowrap', cursor:'pointer' },
  searchResultsList: { flex:1, overflowY:'auto' },
  searchOptionRow: { display:'flex', alignItems:'center', gap:'16px', padding:'20px 24px', borderBottom:'1px solid #f1f5f9', cursor:'pointer' },
  searchResultRow: { display:'flex', alignItems:'center', gap:'16px', padding:'20px 24px', borderBottom:'1px solid #f1f5f9', cursor:'pointer' },
  pinCircle: { width:'40px', height:'40px', borderRadius:'50%', background:'#f1f5f9', display:'flex', alignItems:'center', justifyContent:'center' },
  nearbyTitle: { fontSize:'15px', fontWeight:'800', color:'#1e293b', marginBottom:'4px' },
  nearbySub: { fontSize:'13px', fontWeight:'600', color:'#64748b' },
  gpsUseText: { fontWeight:'800', color:'#F84464', fontSize:'15px' }
};

export default Seller_StorefrontSetup;