import React, { useState, useEffect } from 'react';
import { ArrowLeft, Store, Building2, User, AlertCircle, ShieldCheck, Info, MapPin, Truck, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { db, auth } from '../../firebase';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Seller_StorefrontSetup() {
  const navigate = useNavigate();
  const [appStatus, setAppStatus] = useState('loading');
  const [accountType, setAccountType] = useState('shop');
  const [expandedCard, setExpandedCard] = useState(null); // 'details', 'location', 'operations'
  const [sellerName, setSellerName] = useState('');
  const [sellerId, setSellerId] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [fullAppData, setFullAppData] = useState(null);
  const [detailsForm, setDetailsForm] = useState(null);

  // Location Form State
  const [locationForm, setLocationForm] = useState({
    houseNumber: '', landmark: '', village: '', mandal: '', nearerCity: '', district: '', state: '', pincode: '', lat: '', lng: '', serviceRadius: ''
  });
  const [isSavingLocation, setIsSavingLocation] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [mapLayer, setMapLayer] = useState('k'); // 'm' for map, 'k' for satellite
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  
  // Operations & Logistics State
  const [operationsForm, setOperationsForm] = useState({
    openTime: '',
    closeTime: '',
    closedDays: [], // e.g., ['Sunday']
    customMessage: '',
    deliveryMode: 'home_delivery', // 'home_delivery' or 'store_pickup'
    deliveryRadius: '', // in km
    deliveryFee: '',
    freeDeliveryThreshold: '',
    minOrderValue: ''
  });
  const [isSavingOperations, setIsSavingOperations] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [savedLocationForm, setSavedLocationForm] = useState(null);
  const [savedOperationsForm, setSavedOperationsForm] = useState(null);
  const [isSavedToCloud, setIsSavedToCloud] = useState(false);
  const [isSavingToCloud, setIsSavingToCloud] = useState(false);


  const allLocKeys = ['lat', 'lng', 'houseNumber', 'landmark', 'village', 'nearerCity', 'mandal', 'district', 'pincode', 'state', 'serviceRadius'];
  const isLocationDirty = savedLocationForm && allLocKeys.some(key => locationForm[key] !== savedLocationForm[key]);

  const allOpKeys = ['openTime', 'closeTime', 'customMessage', 'deliveryMode', 'deliveryRadius', 'deliveryFee', 'freeDeliveryThreshold', 'minOrderValue'];
  const isOperationsDirty = savedOperationsForm && (
    allOpKeys.some(key => operationsForm[key] !== savedOperationsForm[key]) ||
    JSON.stringify(operationsForm.closedDays || []) !== JSON.stringify(savedOperationsForm.closedDays || [])
  );



  useEffect(() => {
    // 1. Try local storage first to show data immediately
    const localType = localStorage.getItem('seller_account_type');
    const localName = localStorage.getItem('seller_name');
    const localId = localStorage.getItem('seller_app_id');
    const localOwner = localStorage.getItem('seller_owner_name');
    
    if (localType && localName) {
      setAccountType(localType);
      setSellerName(localName);
      if (localId) setSellerId(localId);
      if (localOwner) setOwnerName(localOwner);
    }

    // 2. Fallback / Verification with Firebase
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setAppStatus('none');
        return;
      }

      try {
        let appId = localStorage.getItem('seller_app_id');
        let appData = null;

        if (!appId) {
          const q = query(collection(db, 'seller_applications'), where("userId", "==", user.uid));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            appData = querySnapshot.docs[0].data();
            appId = querySnapshot.docs[0].id;
            localStorage.setItem('seller_app_id', appId);
          }
        } else {
          const docRef = doc(db, 'seller_applications', appId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            appData = docSnap.data();
          }
        }

        if (appData) {
          setFullAppData(appData);
          setAppStatus(appData.status);

          setAccountType(appData.accountType);
          const nameToUse = appData.accountType === 'organisation' ? appData.companyName : (appData.shopName || appData.fullName);
          const ownerToUse = appData.ownerName || appData.fullName;
          
          const newDetails = {
            accountType: appData.accountType || '',
            sellerName: nameToUse || '',
            ownerName: ownerToUse || '',
            primaryPhone: appData.phone || '',
            emergencyPhone: appData.emergencyPhone || '',
            email: appData.email || '',
            registrationId: appData.accountType === 'organisation' ? (appData.gstNumber || '') : (appData.aadharNumber || ''),
            sellerId: appId || ''
          };
          setDetailsForm(newDetails);
          localStorage.setItem('seller_details_form', JSON.stringify(newDetails));
          
          const collectionName = appData.accountType === 'organisation' ? 'organisation_storefront' : 'individual_storefront';
          const sfRef = doc(db, collectionName, appId);
          const sfSnap = await getDoc(sfRef);
          
          let storefrontData = null;
          if (sfSnap.exists()) {
             storefrontData = sfSnap.data();
             setIsSavedToCloud(true);
          }

          if (storefrontData && storefrontData.storefrontLocation) {
            setLocationForm(storefrontData.storefrontLocation);
            setSavedLocationForm(storefrontData.storefrontLocation);
          } else {
            const localLoc = localStorage.getItem('seller_location_form');
            if (localLoc) {
               setLocationForm(JSON.parse(localLoc));
               setSavedLocationForm(JSON.parse(localLoc));
            } else {
               setSavedLocationForm({ houseNumber: '', landmark: '', village: '', mandal: '', nearerCity: '', district: '', state: '', pincode: '', lat: '', lng: '', serviceRadius: '' });
            }
          }
          
          if (storefrontData && storefrontData.storeOperations) {
            setOperationsForm(storefrontData.storeOperations);
            setSavedOperationsForm(storefrontData.storeOperations);
          } else {
            const localOp = localStorage.getItem('seller_operations_form');
            if (localOp) {
              setOperationsForm(JSON.parse(localOp));
              setSavedOperationsForm(JSON.parse(localOp));
            } else {
              setSavedOperationsForm({ openTime: '', closeTime: '', closedDays: [], customMessage: '', deliveryMode: 'home_delivery', deliveryRadius: '', deliveryFee: '', freeDeliveryThreshold: '', minOrderValue: '' });
            }
          }
          
          setSellerName(nameToUse);
          setSellerId(appId);
          setOwnerName(ownerToUse);
          
          localStorage.setItem('seller_account_type', appData.accountType);
          localStorage.setItem('seller_name', nameToUse);
          localStorage.setItem('seller_owner_name', ownerToUse);
        } else {
          setAppStatus('none');
        }
      } catch (error) {
        console.error("Error fetching app status:", error);
        setAppStatus('error');
      }
    });

    return () => unsubscribe();
  }, []);

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    let str = timeStr.toString().trim().toLowerCase();
    let isPM = str.includes('pm') || str.includes('p') || str.includes('afternoon') || str.includes('night');
    str = str.replace(/[^\d:]/g, '');
    if (!str) return timeStr;
    
    let hours = 0, minutes = 0;
    if (str.includes(':')) {
      let parts = str.split(':');
      hours = parseInt(parts[0]) || 0;
      minutes = parseInt(parts[1]) || 0;
    } else {
      let val = parseInt(str) || 0;
      if (val > 24) { 
         hours = Math.floor(val / 100);
         minutes = val % 100;
      } else {
         hours = val;
      }
    }
  
    if (hours > 12 && hours < 24) {
      hours -= 12;
      isPM = true;
    } else if (hours === 12) {
      isPM = true;
    } else if (hours === 24 || hours === 0) {
      hours = 12;
      isPM = false;
    } else if (hours < 12 && !isPM && str.includes('p')) {
      isPM = true;
    }
  
    let hStr = hours.toString().padStart(2, '0');
    let mStr = minutes.toString().padStart(2, '0');
    return `${hStr}:${mStr} ${isPM ? 'PM' : 'AM'}`;
  };

  const formatRadius = (val) => {
    if (!val) return '';
    let str = val.toString().toLowerCase().replace(/[^\d]/g, '');
    if (!str) return val;
    return `${str} km`;
  };


  if (appStatus === 'loading') {
    return (
      <div style={{ ...styles.container, alignItems: 'center', justifyContent: 'center' }}>
        <motion.div 
          animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.7, 1, 0.7] }} 
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          style={{ 
            width: '80px', height: '80px', backgroundColor: '#FFFFFF', borderRadius: '24px', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            boxShadow: '0 12px 32px rgba(30, 58, 138, 0.08)', marginBottom: '24px' 
          }}
        >
          <Store size={40} color="#1E3A8A" strokeWidth={1.5} />
        </motion.div>
        
        <h2 style={{ color: '#111827', fontSize: '18px', fontWeight: '700', margin: '0 0 8px 0', letterSpacing: '0.5px' }}>
          Loading Storefront
        </h2>
        <p style={{ color: '#8E8E93', fontSize: '14px', margin: 0, fontWeight: '500' }}>
          Preparing your seller workspace...
        </p>

        {/* Custom Bouncing Loader Dots */}
        <div style={{ display: 'flex', gap: '6px', marginTop: '24px' }}>
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 1, delay: i * 0.15, ease: "easeInOut" }}
              style={{ width: '6px', height: '6px', backgroundColor: '#3B82F6', borderRadius: '50%' }}
            />
          ))}
        </div>
      </div>
    );
  }

  // 3. Security Guard: Only Approved profiles get in
  if (appStatus !== 'approved' && appStatus !== 'loading') {
    return (
      <div style={{...styles.container, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC', padding: '24px'}}>
        
        {/* Top Back Button */}
        <div style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 50 }}>
          <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '44px', height: '44px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <ArrowLeft size={22} color="#0F172A" />
          </button>
        </div>

        {/* Minimalist 3D Block Card */}
        <div style={{ 
            backgroundColor: '#FFFFFF', 
            borderRadius: '32px', 
            padding: '40px 32px', 
            width: '100%', 
            maxWidth: '400px', 
            boxSizing: 'border-box',
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            textAlign: 'center', 
            border: '8px solid #F1F5F9',
            boxShadow: '0 12px 0 #E2E8F0, 0 24px 40px rgba(0,0,0,0.06)'
        }}>
            
            <div style={{ width: '64px', height: '64px', backgroundColor: '#EFF6FF', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', border: '2px solid #DBEAFE', boxShadow: '0 6px 0 #BFDBFE' }}>
               <AlertCircle size={32} color="#3B82F6" strokeWidth={2.5} />
            </div>
            
            <h2 style={{color: '#0F172A', fontSize: '24px', fontWeight: '800', marginBottom: '12px', letterSpacing: '-0.3px'}}>Storefront Locked</h2>
            
            <p style={{color: '#475569', margin: 0, fontSize: '15px', lineHeight: '1.6', fontWeight: '600'}}>
                Go to the <span style={{color: '#0F172A', fontWeight: '800', backgroundColor: '#F1F5F9', padding: '2px 8px', borderRadius: '6px'}}>Seller Registration</span> and send your application. 
            </p>
            
            <div style={{ width: '40px', height: '3px', backgroundColor: '#E2E8F0', margin: '24px 0', borderRadius: '4px' }}></div>
            
            <p style={{color: '#64748B', margin: 0, fontSize: '14px', lineHeight: '1.6', fontWeight: '500'}}>
                Once verified by our admin team, this section will automatically unlock for you to design your storefront.
            </p>
        </div>
      </div>
    );
  }

  // 4. Details Full Page View
  if (expandedCard === 'details') {
    return (
      <div style={styles.container}>
        <header style={styles.header}>
          <button style={styles.iconButton} onClick={() => setExpandedCard(null)}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </button>
          <div style={styles.headerTitleContainer}>
            {accountType === 'organisation' ? <Building2 size={26} color="#FFFFFF" /> : <User size={26} color="#FFFFFF" />}
            <h1 style={styles.headerTitle}>{accountType === 'organisation' ? 'Organisation Details' : 'Shop Details'}</h1>
          </div>
          <div style={{ width: '42px' }}></div>
        </header>

        <main style={{ flex: 1, overflowY: 'auto', padding: '12px', backgroundColor: '#F9FAFB', overscrollBehavior: 'none' }}>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #E5E7EB' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

              {/* Shop/Org Name */}
              <div style={{ backgroundColor: '#F0FDF4', padding: '14px', borderRadius: '12px', border: '1px solid #DCFCE7', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ backgroundColor: '#FFFFFF', padding: '10px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(22,163,74,0.12)' }}>
                  {accountType === 'organisation' ? <Building2 size={24} color="#16A34A" strokeWidth={2.5} /> : <Store size={24} color="#16A34A" strokeWidth={2.5} />}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <p style={{ margin: '0 0 2px 0', fontSize: '10px', fontWeight: '800', color: '#16A34A', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{accountType === 'organisation' ? 'Organisation Name' : 'Shop Name'}</p>
                  <p style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#14532D', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sellerName || 'N/A'}</p>
                </div>
              </div>

              {/* Seller ID (Full Width) */}
              <div style={{ backgroundColor: '#EFF6FF', padding: '12px', borderRadius: '12px', border: '1px solid #DBEAFE' }}>
                <p style={{ margin: '0 0 2px 0', fontSize: '10px', fontWeight: '800', color: '#3B82F6', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Seller ID</p>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: '800', color: '#1E3A8A', fontFamily: 'monospace', wordBreak: 'break-all' }}>{sellerId || 'N/A'}</p>
              </div>

              {/* Account Type (Full Width) */}
              <div style={{ backgroundColor: '#F3E8FF', padding: '12px', borderRadius: '12px', border: '1px solid #E9D5FF' }}>
                <p style={{ margin: '0 0 2px 0', fontSize: '10px', fontWeight: '800', color: '#A855F7', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Account Type</p>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#581C87' }}>{accountType === 'organisation' ? 'Organisation' : 'Individual Shop'}</p>
              </div>

              {/* Owner Name */}
              <div style={{ backgroundColor: '#FFF7ED', padding: '14px', borderRadius: '12px', border: '1px solid #FFEDD5', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ backgroundColor: '#FFFFFF', padding: '10px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(249,115,22,0.12)' }}>
                  <User size={24} color="#EA580C" strokeWidth={2.5} />
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <p style={{ margin: '0 0 2px 0', fontSize: '10px', fontWeight: '800', color: '#EA580C', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Owner Legal Name</p>
                  <p style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#7C2D12', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ownerName || 'N/A'}</p>
                </div>
              </div>

              {/* Primary Phone (Full Width) */}
              <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <p style={{ margin: '0 0 2px 0', fontSize: '10px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Primary Phone</p>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#0F172A' }}>{fullAppData?.phone || 'N/A'}</p>
              </div>

              {/* Emergency Phone (Full Width) */}
              <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <p style={{ margin: '0 0 2px 0', fontSize: '10px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Emergency Phone</p>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#0F172A' }}>{fullAppData?.emergencyPhone || 'N/A'}</p>
              </div>

              {/* Email */}
              <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <p style={{ margin: '0 0 2px 0', fontSize: '10px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Business Email</p>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#0F172A' }}>{fullAppData?.email || 'N/A'}</p>
              </div>

              {/* Extra Details */}
              <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <p style={{ margin: '0 0 2px 0', fontSize: '10px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {accountType === 'organisation' ? 'GST / Registration No.' : 'Aadhar / Govt ID'}
                </p>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#0F172A' }}>
                  {accountType === 'organisation' ? (fullAppData?.gstNumber || 'N/A') : (fullAppData?.aadharNumber || 'N/A')}
                </p>
              </div>

              {/* The Red Edit Warning & Button */}
              <div style={{ backgroundColor: '#FEF2F2', border: '1px dashed #F87171', borderRadius: '12px', padding: '14px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <AlertCircle size={18} color="#DC2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <p style={{ margin: 0, fontSize: '12px', color: '#991B1B', fontWeight: '500', lineHeight: '1.5' }}>
                    <strong style={{ fontWeight: '800' }}>Auto-Filled Data:</strong> These details are auto-filled from your application data. If you want to make changes, you can go to the application, edit the details, and apply for changes. Once approved by an admin, the data will be automatically updated here.
                  </p>
                </div>
                <button onClick={() => navigate('/seller-setup')} style={{ width: '100%', padding: '12px', backgroundColor: '#FFFFFF', color: '#DC2626', border: '1px solid #FECACA', borderRadius: '8px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 2px 8px rgba(220,38,38,0.08)', transition: 'background-color 0.2s' }}>
                  Go to Application Edit
                </button>
              </div>

            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  // 5. Location Details Full Page View
  if (expandedCard === 'location') {
    const handleAutoDetectLocation = () => {
      if (!navigator.geolocation) {
        alert("GPS not supported by your browser.");
        return;
      }
      setIsDetecting(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const res = await axios.post('/api/UserLocation', { action: 'reverseGeocode', lat: latitude, lng: longitude });
            const data = res.data;
            if (data.addresses && data.addresses.length > 0) {
              const addr = data.addresses[0].address;
              setLocationForm(prev => ({
                ...prev,
                lat: latitude.toFixed(6),
                lng: longitude.toFixed(6),
                pincode: addr.postalCode || addr.postcode || prev.pincode,
                state: addr.countrySubdivision || prev.state,
                district: addr.countrySecondarySubdivision || addr.municipality || prev.district,
                nearerCity: addr.municipality || prev.nearerCity,
                mandal: addr.municipality || prev.mandal || '',
                village: addr.municipalitySubdivision || prev.village,
                houseNumber: prev.houseNumber || '',
                landmark: addr.streetName || prev.landmark || ''
              }));
            } else {
              throw new Error("No results from TomTom");
            }
          } catch (tomTomError) {
            console.warn("TomTom failed. Falling back to OpenStreetMap...", tomTomError);
            try {
              const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`, {
                headers: {
                  'Accept-Language': 'en-US,en;q=0.9',
                  'User-Agent': 'FarmCapApp/1.0'
                }
              });
              const data = await response.json();
              if (data && data.address) {
                const addr = data.address;
                setLocationForm(prev => ({
                  ...prev,
                  lat: latitude.toFixed(6),
                  lng: longitude.toFixed(6),
                  pincode: addr.postcode || prev.pincode,
                  state: addr.state || prev.state,
                  district: addr.state_district || addr.county || prev.district,
                  nearerCity: addr.city || addr.town || addr.municipality || prev.nearerCity,
                  mandal: addr.county || addr.subregion || addr.city_district || addr.suburb || prev.mandal || '',
                  village: addr.village || addr.suburb || addr.neighbourhood || addr.hamlet || prev.village,
                  houseNumber: addr.house_number || prev.houseNumber || '',
                  landmark: addr.attraction || addr.tourism || addr.amenity || addr.road || prev.landmark || ''
                }));
              }
            } catch (osmError) {
              console.error("Geocoding failed entirely", osmError);
              alert("Failed to auto-detect full address. Please enter manually.");
            }
          } finally {
            setIsDetecting(false);
          }
        },
        (error) => { 
          setIsDetecting(false);
          if (error.code === error.PERMISSION_DENIED) {
            alert("Location access denied! Please TURN ON GPS / Location services in your device settings and allow permission.");
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            alert("GPS location is unavailable right now. Please check if your GPS is turned on.");
          } else {
            alert("Failed to access GPS. Please ensure Location is turned ON.");
          }
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    };
    const handleSaveLocation = async () => {
      setAttemptedSubmit(true);
      
      // Auto-format before validation
      let formattedLoc = { ...locationForm };
      if (formattedLoc.serviceRadius) formattedLoc.serviceRadius = formatRadius(formattedLoc.serviceRadius);
      setLocationForm(formattedLoc);
      
      // Strict validation blocks any empty fields

      const reqFields = ['lat', 'lng', 'houseNumber', 'landmark', 'village', 'nearerCity', 'mandal', 'district', 'pincode', 'state', 'serviceRadius'];
      for (const field of reqFields) {
        if (!locationForm[field]) {
          alert("Please fill all the details completely and ensure GPS location is detected. Empty field found.");
          const el = document.getElementById('input-' + field);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.focus();
          }
          return;
        }
      }
      setIsSavingLocation(true);
      try {
        localStorage.setItem('seller_location_form', JSON.stringify(formattedLoc));
          setSavedLocationForm(formattedLoc);
        setIsSavedToCloud(false);
        // Update local state so it reflects instantly
        setFullAppData(prev => ({ ...prev, storefrontLocation: locationForm }));
        alert("Location details saved locally!");
        setExpandedCard(null); // Go back to main menu
      } catch (e) {
        console.error(e);
        alert("Failed to save location details.");
      }
      setIsSavingLocation(false);
    };

    const handleBack = () => {
      if (isLocationDirty) {
        setShowUnsavedModal(true);
      } else {
        setExpandedCard(null);
      }
    };

    return (
      <div style={styles.container}>
        <header style={styles.header}>
          <button style={styles.iconButton} onClick={handleBack}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </button>
          <div style={styles.headerTitleContainer}>
            <MapPin size={26} color="#FFFFFF" />
            <h1 style={styles.headerTitle}>Location Details</h1>
          </div>
          <div style={{ width: '42px' }}></div>
        </header>

        <main style={{ flex: 1, overflowY: 'auto', padding: '20px', backgroundColor: '#F9FAFB' }}>
          
          <div style={{ margin: '0 -10px 32px -10px', backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '20px', boxShadow: '0 8px 30px rgba(0,0,0,0.04)', border: '1px solid #E5E7EB' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#111827' }}>Location GPS</h3>
                  {(locationForm.lat && locationForm.lng) && (
                    <div style={{ padding: '4px 10px', backgroundColor: '#D1FAE5', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #10B981' }}>
                       <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981', animation: 'pulse 2s infinite' }} />
                       <span style={{ fontSize: '11px', fontWeight: '800', color: '#065F46' }}>LOCKED</span>
                    </div>
                  )}
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6B7280' }}>Pinpoint your exact shop location.</p>
              </div>
              <div style={{ display: 'flex', backgroundColor: '#F3F4F6', borderRadius: '10px', padding: '4px' }}>
                 <button onClick={() => setMapLayer('m')} style={{ padding: '8px 14px', fontSize: '13px', fontWeight: '800', border: 'none', borderRadius: '8px', backgroundColor: mapLayer === 'm' ? '#FFFFFF' : 'transparent', color: mapLayer === 'm' ? '#111827' : '#6B7280', cursor: 'pointer', boxShadow: mapLayer === 'm' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.2s' }}>Map</button>
                 <button onClick={() => setMapLayer('k')} style={{ padding: '8px 14px', fontSize: '13px', fontWeight: '800', border: 'none', borderRadius: '8px', backgroundColor: mapLayer === 'k' ? '#FFFFFF' : 'transparent', color: mapLayer === 'k' ? '#111827' : '#6B7280', cursor: 'pointer', boxShadow: mapLayer === 'k' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.2s' }}>Satellite</button>
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
                src={`https://maps.google.com/maps?q=${locationForm.lat || 'Andhra Pradesh'},${locationForm.lng || ''}&t=${mapLayer}&z=${locationForm.lat ? 18 : 6}&ie=UTF8&iwloc=&output=embed`}
                style={{ display: 'block' }}
                title="Storefront Map"
              />
            </div>

            <button 
              type="button" 
              onClick={handleAutoDetectLocation} 
              disabled={isDetecting} 
              style={{ width: '100%', marginTop: '20px', padding: '16px', background: '#EFF6FF', color: '#3B82F6', border: '1px dashed #3B82F6', borderRadius: '14px', fontWeight: '800', fontSize: '15px', cursor: isDetecting ? 'not-allowed' : 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <MapPin size={20} />
              {isDetecting ? 'Detecting...' : 'Auto-Detect with GPS'}
            </button>
          </div>
          
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#111827' }}>Storefront Address</h3>
            <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#6B7280' }}>Please fill out all the address details below.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#374151', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Latitude <span style={{color: '#EF4444'}}>*</span></label>
                <input id="input-lat" type="text" readOnly value={locationForm.lat} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: (attemptedSubmit && !locationForm.lat) ? '1px solid #EF4444' : '1px solid #D1D5DB', fontSize: '16px', color: '#6B7280', backgroundColor: '#F3F4F6', outline: 'none', boxSizing: 'border-box' }} placeholder="Auto-filled" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#374151', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Longitude <span style={{color: '#EF4444'}}>*</span></label>
                <input id="input-lng" type="text" readOnly value={locationForm.lng} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: (attemptedSubmit && !locationForm.lng) ? '1px solid #EF4444' : '1px solid #D1D5DB', fontSize: '16px', color: '#6B7280', backgroundColor: '#F3F4F6', outline: 'none', boxSizing: 'border-box' }} placeholder="Auto-filled" />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#374151', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>House / Door No. <span style={{color: '#EF4444'}}>*</span></label>
              <input id="input-houseNumber" type="text" value={locationForm.houseNumber} onChange={(e) => setLocationForm({...locationForm, houseNumber: e.target.value})} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: (attemptedSubmit && !locationForm.houseNumber) ? '1px solid #EF4444' : '1px solid #D1D5DB', fontSize: '16px', color: '#111827', backgroundColor: '#FFFFFF', outline: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', boxSizing: 'border-box' }} placeholder="1-23/A" />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#374151', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Landmark <span style={{color: '#EF4444'}}>*</span></label>
              <input id="input-landmark" type="text" value={locationForm.landmark} onChange={(e) => setLocationForm({...locationForm, landmark: e.target.value})} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: (attemptedSubmit && !locationForm.landmark) ? '1px solid #EF4444' : '1px solid #D1D5DB', fontSize: '16px', color: '#111827', backgroundColor: '#FFFFFF', outline: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', boxSizing: 'border-box' }} placeholder="Near Temple" />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#374151', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Village / City <span style={{color: '#EF4444'}}>*</span></label>
              <input id="input-village" type="text" value={locationForm.village} onChange={(e) => setLocationForm({...locationForm, village: e.target.value})} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: (attemptedSubmit && !locationForm.village) ? '1px solid #EF4444' : '1px solid #D1D5DB', fontSize: '16px', color: '#111827', backgroundColor: '#FFFFFF', outline: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', boxSizing: 'border-box' }} placeholder="E.g. Palasa" />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#374151', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nearer City <span style={{color: '#EF4444'}}>*</span></label>
              <input id="input-nearerCity" type="text" value={locationForm.nearerCity} onChange={(e) => setLocationForm({...locationForm, nearerCity: e.target.value})} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: (attemptedSubmit && !locationForm.nearerCity) ? '1px solid #EF4444' : '1px solid #D1D5DB', fontSize: '16px', color: '#111827', backgroundColor: '#FFFFFF', outline: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', boxSizing: 'border-box' }} placeholder="Srikakulam" />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#374151', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Mandal <span style={{color: '#EF4444'}}>*</span></label>
              <input id="input-mandal" type="text" value={locationForm.mandal} onChange={(e) => setLocationForm({...locationForm, mandal: e.target.value})} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: (attemptedSubmit && !locationForm.mandal) ? '1px solid #EF4444' : '1px solid #D1D5DB', fontSize: '16px', color: '#111827', backgroundColor: '#FFFFFF', outline: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', boxSizing: 'border-box' }} placeholder="Kasibugga Mandal" />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#374151', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>District <span style={{color: '#EF4444'}}>*</span></label>
              <input id="input-district" type="text" value={locationForm.district} onChange={(e) => setLocationForm({...locationForm, district: e.target.value})} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: (attemptedSubmit && !locationForm.district) ? '1px solid #EF4444' : '1px solid #D1D5DB', fontSize: '16px', color: '#111827', backgroundColor: '#FFFFFF', outline: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', boxSizing: 'border-box' }} placeholder="E.g. Srikakulam" />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#374151', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pincode <span style={{color: '#EF4444'}}>*</span></label>
              <input id="input-pincode" type="text" maxLength="6" value={locationForm.pincode} onChange={(e) => setLocationForm({...locationForm, pincode: e.target.value.replace(/\D/g, '')})} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: (attemptedSubmit && !locationForm.pincode) ? '1px solid #EF4444' : '1px solid #D1D5DB', fontSize: '16px', color: '#111827', backgroundColor: '#FFFFFF', outline: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', letterSpacing: '2px', boxSizing: 'border-box' }} placeholder="000000" />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#374151', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>State <span style={{color: '#EF4444'}}>*</span></label>
              <input id="input-state" type="text" value={locationForm.state} onChange={(e) => setLocationForm({...locationForm, state: e.target.value})} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: (attemptedSubmit && !locationForm.state) ? '1px solid #EF4444' : '1px solid #D1D5DB', fontSize: '16px', color: '#111827', backgroundColor: '#FFFFFF', outline: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', boxSizing: 'border-box' }} placeholder="Andhra Pradesh" />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#374151', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Service Radius (in km) <span style={{color: '#EF4444'}}>*</span></label>
              <input id="input-serviceRadius" type="text" value={locationForm.serviceRadius} onChange={(e) => setLocationForm({...locationForm, serviceRadius: e.target.value})} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: (attemptedSubmit && !locationForm.serviceRadius) ? '1px solid #EF4444' : '1px solid #D1D5DB', fontSize: '16px', color: '#111827', backgroundColor: '#FFFFFF', outline: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', boxSizing: 'border-box' }} placeholder="e.g. 15km or Statewide" />
            </div>

            {/* Remove GPS Coordinates locked UI, map acts as confirmation */}

            <div style={{ marginTop: '16px', backgroundColor: '#FEF2F2', border: '1px dashed #EF4444', borderRadius: '12px', padding: '16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <AlertCircle size={20} color="#DC2626" style={{ flexShrink: 0, marginTop: '2px' }} />
              <p style={{ margin: 0, fontSize: '13px', color: '#991B1B', lineHeight: '1.5', fontWeight: '600' }}>
                <strong style={{ fontWeight: '800' }}>Note:</strong> Check the details thoroughly and use the Auto GPS for an easy way. Before submitting, ensure these are your exact shop details, otherwise consumers may be misled!
              </p>
            </div>

            <button 
              onClick={handleSaveLocation}
              disabled={isSavingLocation}
              style={{ marginTop: '24px', marginBottom: '40px', width: '100%', padding: '18px', backgroundColor: '#1E3A8A', color: '#FFFFFF', border: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: '800', cursor: isSavingLocation ? 'not-allowed' : 'pointer', boxShadow: '0 6px 16px rgba(30, 58, 138, 0.25)', opacity: isSavingLocation ? 0.7 : 1 }}
            >
              {isSavingLocation ? 'Saving Details...' : 'Save Location Details'}
            </button>

          </div>
        </main>
        {showUnsavedModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ backgroundColor: '#FFF', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '340px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: '800', color: '#111827' }}>Unsaved Changes</h3>
              <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#4B5563', lineHeight: '1.5' }}>
                You have unsaved Location changes. What would you like to do?
              </p>
              <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
                <button 
                  onClick={() => { setShowUnsavedModal(false); handleSaveLocation(); }}
                  style={{ padding: '14px', backgroundColor: '#1E3A8A', color: '#FFF', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '800', cursor: 'pointer' }}
                >
                  Save & Exit
                </button>
                <button 
                  onClick={() => { setShowUnsavedModal(false); setLocationForm(savedLocationForm); setExpandedCard(null); }}
                  style={{ padding: '14px', backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', borderRadius: '10px', fontSize: '15px', fontWeight: '800', cursor: 'pointer' }}
                >
                  Discard
                </button>
                <button 
                  onClick={() => setShowUnsavedModal(false)}
                  style={{ padding: '10px', backgroundColor: 'transparent', color: '#6B7280', border: 'none', fontSize: '14px', fontWeight: '600', cursor: 'pointer', marginTop: '4px' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 6. Operations & Logistics Full Page View
  if (expandedCard === 'operations') {
    const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const toggleClosedDay = (day) => {
      setOperationsForm(prev => {
        if (prev.closedDays.includes(day)) {
          return { ...prev, closedDays: prev.closedDays.filter(d => d !== day) };
        } else {
          return { ...prev, closedDays: [...prev.closedDays, day] };
        }
      });
    };

    const handleSaveOperations = async () => {
      // Auto-format before validation
      let formattedOp = { ...operationsForm };
      if (operationsForm.openTime) operationsForm.openTime = formatTime(operationsForm.openTime);
      if (operationsForm.closeTime) operationsForm.closeTime = formatTime(operationsForm.closeTime);
      setOperationsForm(formattedOp);

      // --- STRICT VALIDATION ---
      if (!operationsForm.openTime || !operationsForm.closeTime) {
        alert("Please specify your Shop Opening and Closing times.");
        return;
      }
      if (operationsForm.deliveryMode === 'home_delivery') {
        if (!operationsForm.deliveryRadius || !operationsForm.deliveryFee || !operationsForm.minOrderValue) {
          alert("Please fill out all Home Delivery details (Radius, Fee, Min Order).");
          return;
        }
      }

      setIsSavingOperations(true);
      try {
        localStorage.setItem('seller_operations_form', JSON.stringify(formattedOp));
        setSavedOperationsForm(formattedOp);
        setIsSavedToCloud(false);
        alert("Operations & Logistics saved locally!");
        setExpandedCard(null); // Return to main setup menu
      } catch (error) {
        console.error("Error saving operations", error);
        alert("Failed to save operations details.");
      } finally {
        setIsSavingOperations(false);
      }
    };

    const handleBack = () => {
      if (isOperationsDirty) {
        setShowUnsavedModal(true);
      } else {
        setExpandedCard(null);
      }
    };

    return (
      <div style={styles.container}>
        <header style={styles.header}>
          <button style={styles.iconButton} onClick={handleBack}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </button>
          <h1 style={styles.headerTitle}>Operating Hours</h1>
          <div style={{ width: '42px' }}></div>
        </header>

        <main style={{ flex: 1, padding: '24px 20px', overflowY: 'auto', backgroundColor: '#F9FAFB' }}>
          
          {/* Operating Hours Section */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#111827' }}>Shop Timings</h3>
            <p style={{ margin: '6px 0 20px', fontSize: '13px', color: '#6B7280' }}>Set your daily opening and closing hours.</p>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#374151', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Opens At</label>
                <input 
                  type="text" 
                  placeholder="e.g. 09:00 AM"
                  value={operationsForm.openTime} 
                  onChange={(e) => setOperationsForm({...operationsForm, openTime: e.target.value})} 
                  style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #D1D5DB', fontSize: '16px', color: '#111827', backgroundColor: '#FFFFFF', outline: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', boxSizing: 'border-box' }} 
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#374151', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Closes At</label>
                <input 
                  type="text" 
                  placeholder="e.g. 09:00 PM"
                  value={operationsForm.closeTime} 
                  onChange={(e) => setOperationsForm({...operationsForm, closeTime: e.target.value})} 
                  style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #D1D5DB', fontSize: '16px', color: '#111827', backgroundColor: '#FFFFFF', outline: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', boxSizing: 'border-box' }} 
                />
              </div>
            </div>

            <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#374151', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Mark Closed Days</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {DAYS_OF_WEEK.map(day => {
                const isClosed = operationsForm.closedDays.includes(day);
                return (
                  <button 
                    key={day}
                    onClick={() => toggleClosedDay(day)}
                    style={{ 
                      padding: '8px 16px', 
                      borderRadius: '20px', 
                      border: isClosed ? '1px solid #EF4444' : '1px solid #D1D5DB', 
                      backgroundColor: isClosed ? '#FEF2F2' : '#FFFFFF', 
                      color: isClosed ? '#EF4444' : '#4B5563', 
                      fontSize: '13px', 
                      fontWeight: '700', 
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {day.substring(0, 3)}
                  </button>
                )
              })}
            </div>
          </div>

          <div style={{ height: '1px', backgroundColor: '#E5E7EB', margin: '32px 0' }}></div>

          {/* Logistics & Delivery Section */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#111827' }}>Logistics & Delivery</h3>
            <p style={{ margin: '6px 0 20px', fontSize: '13px', color: '#6B7280' }}>How do you want to serve your customers?</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Toggle: Store Pickup */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: '#FFFFFF', borderRadius: '16px', border: operationsForm.deliveryMode === 'store_pickup' ? '2px solid #10B981' : '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '800', color: '#111827' }}>Store Pickup Only</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#6B7280' }}>Customers collect orders directly.</p>
                </div>
                <button 
                  onClick={() => setOperationsForm({...operationsForm, deliveryMode: 'store_pickup'})}
                  style={{ width: '50px', height: '28px', backgroundColor: operationsForm.deliveryMode === 'store_pickup' ? '#10B981' : '#D1D5DB', borderRadius: '30px', position: 'relative', border: 'none', cursor: 'pointer', transition: 'background-color 0.3s' }}
                >
                  <div style={{ width: '22px', height: '22px', backgroundColor: '#FFF', borderRadius: '50%', position: 'absolute', top: '3px', left: operationsForm.deliveryMode === 'store_pickup' ? '25px' : '3px', transition: 'left 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
                </button>
              </div>

              {/* Toggle: Home Delivery */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: '#FFFFFF', borderRadius: '16px', border: operationsForm.deliveryMode === 'home_delivery' ? '2px solid #3B82F6' : '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '800', color: '#111827' }}>Home Delivery</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#6B7280' }}>You deliver directly to them.</p>
                </div>
                <button 
                  onClick={() => setOperationsForm({...operationsForm, deliveryMode: 'home_delivery'})}
                  style={{ width: '50px', height: '28px', backgroundColor: operationsForm.deliveryMode === 'home_delivery' ? '#3B82F6' : '#D1D5DB', borderRadius: '30px', position: 'relative', border: 'none', cursor: 'pointer', transition: 'background-color 0.3s' }}
                >
                  <div style={{ width: '22px', height: '22px', backgroundColor: '#FFF', borderRadius: '50%', position: 'absolute', top: '3px', left: operationsForm.deliveryMode === 'home_delivery' ? '25px' : '3px', transition: 'left 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
                </button>
              </div>

              {/* Conditional Delivery Settings */}
              {operationsForm.deliveryMode === 'home_delivery' && (
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '20px', border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: '16px', animation: 'fadeIn 0.3s ease' }}>
                  
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#374151', marginBottom: '8px' }}>Delivery Radius (km)</label>
                      <input 
                        type="text" 
                        inputMode="numeric"
                        value={operationsForm.deliveryRadius} 
                        onChange={(e) => setOperationsForm({...operationsForm, deliveryRadius: e.target.value})} 
                        style={{ width: '100%', padding: '14px 16px', borderRadius: '10px', border: '1px solid #D1D5DB', fontSize: '16px', color: '#111827', backgroundColor: '#FFFFFF', outline: 'none', boxSizing: 'border-box' }} 
                        placeholder="e.g. 5"
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#374151', marginBottom: '8px' }}>Min Order Value (₹)</label>
                      <input 
                        type="text" 
                        inputMode="numeric"
                        value={operationsForm.minOrderValue} 
                        onChange={(e) => setOperationsForm({...operationsForm, minOrderValue: e.target.value})} 
                        style={{ width: '100%', padding: '14px 16px', borderRadius: '10px', border: '1px solid #D1D5DB', fontSize: '16px', color: '#111827', backgroundColor: '#FFFFFF', outline: 'none', boxSizing: 'border-box' }} 
                        placeholder="e.g. 100"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#374151', marginBottom: '8px' }}>Delivery Fee per km (₹) </label>
                      <input 
                        type="text" 
                        inputMode="numeric"
                        value={operationsForm.deliveryFee} 
                        onChange={(e) => setOperationsForm({...operationsForm, deliveryFee: e.target.value})} 
                        style={{ width: '100%', padding: '14px 16px', borderRadius: '10px', border: '1px solid #D1D5DB', fontSize: '16px', color: '#111827', backgroundColor: '#FFFFFF', outline: 'none', boxSizing: 'border-box' }} 
                        placeholder="0 for free"
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#374151', marginBottom: '8px' }}>Free Above (₹)</label>
                      <input 
                        type="text" 
                        inputMode="numeric"
                        value={operationsForm.freeDeliveryThreshold} 
                        onChange={(e) => setOperationsForm({...operationsForm, freeDeliveryThreshold: e.target.value})} 
                        style={{ width: '100%', padding: '14px 16px', borderRadius: '10px', border: '1px solid #D1D5DB', fontSize: '16px', color: '#111827', backgroundColor: '#FFFFFF', outline: 'none', boxSizing: 'border-box' }} 
                        placeholder="e.g. 500"
                      />
                    </div>
                  </div>

                </div>
              )}

            </div>
          </div>

          <div style={{ height: '1px', backgroundColor: '#E5E7EB', margin: '32px 0' }}></div>

          {/* Custom Message Section */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#111827' }}>Custom Notice</h3>
            <p style={{ margin: '6px 0 20px', fontSize: '13px', color: '#6B7280' }}>Visible to all customers visiting your shop.</p>

            <textarea 
              value={operationsForm.customMessage}
              onChange={(e) => setOperationsForm({...operationsForm, customMessage: e.target.value})}
              rows={3}
              style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #D1D5DB', fontSize: '15px', color: '#111827', backgroundColor: '#FFFFFF', outline: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', boxSizing: 'border-box', resize: 'vertical' }}
              placeholder="e.g. Get 10% extra discount for regular customers! Fresh stock arriving every Monday."
            />
          </div>

          <button 
            type="button" 
            onClick={handleSaveOperations} 
            disabled={isSavingOperations}
            style={{ marginTop: '10px', marginBottom: '40px', width: '100%', padding: '18px', backgroundColor: '#1E3A8A', color: '#FFFFFF', border: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: '800', cursor: isSavingOperations ? 'not-allowed' : 'pointer', boxShadow: '0 6px 16px rgba(30, 58, 138, 0.25)', opacity: isSavingOperations ? 0.7 : 1 }}
          >
            {isSavingOperations ? 'Saving Details...' : 'Save Logistics Details'}
          </button>

        </main>
        {showUnsavedModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ backgroundColor: '#FFF', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '340px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: '800', color: '#111827' }}>Unsaved Changes</h3>
              <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#4B5563', lineHeight: '1.5' }}>
                You have unsaved Logistics changes. What would you like to do?
              </p>
              <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
                <button 
                  onClick={() => { setShowUnsavedModal(false); handleSaveOperations(); }}
                  style={{ padding: '14px', backgroundColor: '#1E3A8A', color: '#FFF', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '800', cursor: 'pointer' }}
                >
                  Save & Exit
                </button>
                <button 
                  onClick={() => { setShowUnsavedModal(false); setOperationsForm(savedOperationsForm); setExpandedCard(null); }}
                  style={{ padding: '14px', backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', borderRadius: '10px', fontSize: '15px', fontWeight: '800', cursor: 'pointer' }}
                >
                  Discard
                </button>
                <button 
                  onClick={() => setShowUnsavedModal(false)}
                  style={{ padding: '10px', backgroundColor: 'transparent', color: '#6B7280', border: 'none', fontSize: '14px', fontWeight: '600', cursor: 'pointer', marginTop: '4px' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- Progress Calculation ---
  
  const handleSaveToCloud = async () => {
    setIsSavingToCloud(true);
    try {
      const collectionName = accountType === 'organisation' ? 'organisation_storefront' : 'individual_storefront';
      const docRef = doc(db, collectionName, sellerId);
      await setDoc(docRef, {
        storefrontDetails: detailsForm,
        storefrontLocation: locationForm,
        storeOperations: operationsForm,
        setupStepOperationsCompleted: true
      }, { merge: true });
      setIsSavedToCloud(true);
      alert("All details successfully saved to the cloud!");
    } catch (e) {
      console.error(e);
      alert("Failed to save to cloud.");
    }
    setIsSavingToCloud(false);
  };


  const detailsProgress = 100; // Registration already captured basic details

  // Location Progress - Only base it on required fields (exclude lat/lng from the strict 100% requirement)
  const requiredLocFields = ['houseNumber', 'landmark', 'village', 'nearerCity', 'mandal', 'district', 'pincode', 'state', 'serviceRadius'];
  const filledLoc = requiredLocFields.filter(f => locationForm[f] && locationForm[f].toString().trim() !== '').length;
  let locationProgress = Math.round((filledLoc / requiredLocFields.length) * 100);
  if (isLocationDirty && locationProgress > 80) locationProgress = 80; // Cap at 80% if not saved locally

  // Operations Progress
  const opFields = ['openTime', 'closeTime'];
  if (operationsForm.deliveryMode === 'home_delivery') {
    opFields.push('deliveryRadius', 'deliveryFee', 'minOrderValue');
  }
  const filledOp = opFields.filter(f => operationsForm[f] && operationsForm[f].toString().trim() !== '').length;
  let operationsProgress = Math.round((filledOp / opFields.length) * 100);
  if (isOperationsDirty && operationsProgress > 80) operationsProgress = 80; // Cap at 80% if not saved locally

  const overallProgress = Math.round((detailsProgress + locationProgress + operationsProgress) / 3);

  return (
    <div style={styles.container}>
      {/* Top Header */}
      <header style={styles.header}>
        <button style={styles.iconButton} onClick={() => navigate(-1)}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </button>
        <div style={styles.headerTitleContainer}>
          <Store size={26} color="#FFFFFF" />
          <h1 style={styles.headerTitle}>Storefront Setup</h1>
        </div>
        <div style={{ width: '42px' }}></div> {/* Spacer to perfectly center the title */}
      </header>

      {/* Main Content Area */}
      <main style={styles.mainContent}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={styles.contentOutline}
        >
          
          {isSavedToCloud && (
            <div style={{ backgroundColor: '#D1FAE5', color: '#065F46', padding: '14px', borderRadius: '16px', marginBottom: '24px', textAlign: 'center', fontWeight: '800', border: '1px solid #10B981', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)' }}>
              <ShieldCheck size={24} /> SAVED TO CLOUD - SYNCED
            </div>
          )}
          <div style={styles.stepContainer}>
            {/* The Verified Profile ID Card */}
            <div style={{ display: 'flex', justifyContent: 'center', margin: '0 0 24px 0' }}>
              <div style={{ 
                width: '340px', 
                height: '215px', 
                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%)', 
                borderRadius: '16px', 
                boxShadow: '0 24px 48px rgba(22, 163, 74, 0.18), 0 8px 16px rgba(22, 163, 74, 0.1), inset 0 2px 0 rgba(255,255,255,0.8), inset 0 -2px 0 rgba(0,0,0,0.05)', 
                border: '1px solid rgba(34, 197, 94, 0.4)', 
                display: 'flex', 
                flexDirection: 'column', 
                overflow: 'hidden',
                position: 'relative',
                transform: 'translateZ(0)'
              }}>
                {/* ID Card Header */}
                <div style={{ backgroundColor: '#16a34a', padding: '8px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '14px' }}>🧢</span>
                    <span style={{ fontSize: '13px', fontWeight: '800', letterSpacing: '0.5px' }}>FarmCap</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ShieldCheck size={12} />
                    <span style={{ fontSize: '9px', fontWeight: '800', letterSpacing: '1px' }}>VERIFIED SELLER</span>
                  </div>
                </div>

                {/* ID Card Body */}
                <div style={{ display: 'flex', padding: '16px 20px', gap: '20px', flex: 1, alignItems: 'center' }}>
                  {/* Icon Section (Laid directly on the card) */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#166534', opacity: 0.9, flexShrink: 0 }}>
                    {accountType === 'organisation' ? (
                      <Building2 size={64} strokeWidth={1.5} />
                    ) : (
                      <User size={64} strokeWidth={1.5} />
                    )}
                  </div>

                  {/* Details Section */}
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
                    <p style={{ margin: '0 0 2px 0', fontSize: '8px', color: '#166534', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Account Type
                    </p>
                    <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#111827', fontWeight: '800' }}>
                      {accountType === 'organisation' ? 'Organisation' : 'Individual Shop'}
                    </p>

                    <p style={{ margin: '0 0 2px 0', fontSize: '8px', color: '#166534', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {accountType === 'organisation' ? 'Company Name' : 'Shop Name'}
                    </p>
                    <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#111827', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>
                      {sellerName || 'Loading...'}
                    </p>

                    <p style={{ margin: '0 0 2px 0', fontSize: '8px', color: '#166534', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Owner Name
                    </p>
                    <p style={{ margin: '0 0 0 0', fontSize: '12px', color: '#111827', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>
                      {ownerName || 'Loading...'}
                    </p>
                  </div>
                </div>

                {/* ID Card Footer */}
                <div style={{ backgroundColor: 'rgba(255,255,255,0.7)', padding: '6px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(22, 163, 74, 0.1)' }}>
                  <p style={{ margin: 0, fontSize: '9px', color: '#166534', fontWeight: '800' }}>SELLER ID NO.</p>
                  <p style={{ margin: 0, fontSize: '11px', color: '#111827', fontFamily: 'monospace', fontWeight: '800' }}>{sellerId || 'Loading...'}</p>
                </div>
              </div>
            </div>

            {/* Overall Progress Bar */}
            <div style={{ margin: '0 0 24px 0', backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #E5E7EB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: '800', color: '#111827' }}>Storefront Readiness</span>
                <span style={{ fontSize: '14px', fontWeight: '900', color: overallProgress === 100 ? '#10B981' : '#3B82F6' }}>{overallProgress}%</span>
              </div>
              <div style={{ height: '8px', backgroundColor: '#F3F4F6', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${overallProgress}%`, height: '100%', backgroundColor: overallProgress === 100 ? '#10B981' : '#3B82F6', borderRadius: '4px', transition: 'width 0.5s ease-out' }}></div>
              </div>
            </div>

            {/* Visual Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '32px 0 16px 0' }}>
              <div style={{ flex: 1, height: '2px', background: 'linear-gradient(to right, transparent, #E5E7EB)' }}></div>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                Setup Steps
              </span>
              <div style={{ flex: 1, height: '2px', background: 'linear-gradient(to left, transparent, #E5E7EB)' }}></div>
            </div>

            {/* The 3 Setup Option Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Card 1: Details */}
              <div 
                onClick={() => setExpandedCard('details')}
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderLeft: '6px solid #3B82F6', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '18px', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}
              >
                <div style={{ backgroundColor: '#EFF6FF', padding: '12px', borderRadius: '10px', color: '#3B82F6', flexShrink: 0 }}>
                  {accountType === 'organisation' ? <Building2 size={24} strokeWidth={2.5} /> : <User size={24} strokeWidth={2.5} />}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '800', color: '#111827' }}>
                    {accountType === 'organisation' ? 'Organisation Details' : 'Shop Details'}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <p style={{ margin: 0, fontSize: '13px', color: '#6B7280', fontWeight: '500' }}>Setup your profile</p>
                    <span style={{ fontSize: '10px', fontWeight: '800', color: detailsProgress === 100 ? '#10B981' : '#3B82F6', backgroundColor: detailsProgress === 100 ? '#D1FAE5' : '#DBEAFE', padding: '2px 6px', borderRadius: '6px' }}>{detailsProgress}% DONE</span>
                  </div>
                </div>
                <ChevronRight size={20} color="#D1D5DB" strokeWidth={3} style={{ flexShrink: 0 }} />
              </div>

              {/* Card 2: Location */}
              <div 
                onClick={() => setExpandedCard('location')}
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderLeft: '6px solid #F59E0B', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '18px', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}
              >
                <div style={{ backgroundColor: '#FFF7ED', padding: '12px', borderRadius: '10px', color: '#F59E0B', flexShrink: 0 }}>
                  <MapPin size={24} strokeWidth={2.5} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '800', color: '#111827' }}>
                    Location & Address
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <p style={{ margin: 0, fontSize: '13px', color: '#6B7280', fontWeight: '500' }}>Pinpoint location</p>
                    <span style={{ fontSize: '10px', fontWeight: '800', color: locationProgress === 100 ? '#10B981' : (locationProgress > 0 ? '#F59E0B' : '#6B7280'), backgroundColor: locationProgress === 100 ? '#D1FAE5' : (locationProgress > 0 ? '#FEF3C7' : '#F3F4F6'), padding: '2px 6px', borderRadius: '6px' }}>{locationProgress}% DONE</span>
                  </div>
                </div>
                <ChevronRight size={20} color="#D1D5DB" strokeWidth={3} style={{ flexShrink: 0 }} />
              </div>

              {/* Card 3: Operations & Delivery */}
              <div 
                onClick={() => setExpandedCard('operations')}
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderLeft: '6px solid #EC4899', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '18px', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}
              >
                <div style={{ backgroundColor: '#FDF2F8', padding: '12px', borderRadius: '10px', color: '#EC4899', flexShrink: 0 }}>
                  <Truck size={24} strokeWidth={2.5} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '800', color: '#111827' }}>
                    Operating Hours
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <p style={{ margin: 0, fontSize: '13px', color: '#6B7280', fontWeight: '500' }}>Set timings & fees</p>
                    <span style={{ fontSize: '10px', fontWeight: '800', color: operationsProgress === 100 ? '#10B981' : (operationsProgress > 0 ? '#EC4899' : '#6B7280'), backgroundColor: operationsProgress === 100 ? '#D1FAE5' : (operationsProgress > 0 ? '#FCE7F3' : '#F3F4F6'), padding: '2px 6px', borderRadius: '6px' }}>{operationsProgress}% DONE</span>
                  </div>
                </div>
                <ChevronRight size={20} color="#D1D5DB" strokeWidth={3} style={{ flexShrink: 0 }} />
              </div>

            </div>

            
            {/* Master Save Button */}
            <div style={{ marginTop: '32px' }}>
              
              <button 
                onClick={handleSaveToCloud}
                disabled={overallProgress < 100 || isSavingToCloud || isSavedToCloud || isLocationDirty || isOperationsDirty}
                style={{ 
                  width: '100%', 
                  padding: '20px', 
                  backgroundColor: (overallProgress === 100 && !isSavedToCloud && !isLocationDirty && !isOperationsDirty) ? '#1E3A8A' : '#9CA3AF', 
                  color: '#FFFFFF', 
                  border: 'none', 
                  borderRadius: '16px', 
                  fontSize: '18px', 
                  fontWeight: '800', 
                  cursor: (overallProgress === 100 && !isSavedToCloud && !isLocationDirty && !isOperationsDirty) ? 'pointer' : 'not-allowed', 
                  boxShadow: (overallProgress === 100 && !isSavedToCloud && !isLocationDirty && !isOperationsDirty) ? '0 8px 24px rgba(30, 58, 138, 0.3)' : 'none', 
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                {isSavingToCloud ? 'Saving to Cloud...' : (isSavedToCloud ? 'Up to date in Cloud' : 'Save All to Cloud')}
              </button>
              {overallProgress < 100 ? (
                <p style={{ textAlign: 'center', color: '#EF4444', fontSize: '13px', marginTop: '12px', fontWeight: '800' }}>⚠️ Please complete all 3 sections to 100%.</p>
              ) : (isLocationDirty || isOperationsDirty) ? (
                <p style={{ textAlign: 'center', color: '#F59E0B', fontSize: '13px', marginTop: '12px', fontWeight: '800' }}>⚠️ You have unsaved changes! Please enter the cards and Save them internally first.</p>
              ) : null}
            </div>

            {/* Professional Footer for spacing and premium feel */}
            <div style={{ textAlign: 'center', marginTop: '40px', paddingTop: '24px', paddingBottom: '24px', borderTop: '1px dashed #E5E7EB' }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748B', fontWeight: '600', letterSpacing: '0.5px' }}>
                <ShieldCheck size={14} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '6px', color: '#10B981' }} />
                Secure Setup Environment • FarmCap 2026
              </p>
            </div>

          </div>
        </motion.div>
      </main>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#F9FAFB', // Clean, crisp unified background
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    overscrollBehavior: 'none',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  header: {
    backgroundColor: '#1E3A8A',
    height: '72px',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    borderBottomLeftRadius: '24px',
    borderBottomRightRadius: '24px',
    boxShadow: '0 6px 16px rgba(30, 58, 138, 0.15)',
    zIndex: 100,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
  },
  iconButton: {
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    transition: 'background-color 0.2s, transform 0.1s',
  },
  headerTitleContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  headerTitle: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#FFFFFF',
    margin: 0,
    letterSpacing: '0px',
    lineHeight: '1',
  },
  mainContent: {
    flex: 1,
    padding: '24px 24px',
    display: 'flex',
    justifyContent: 'center',
    overflowY: 'auto',
    overscrollBehavior: 'none',
    position: 'relative',
    zIndex: 1,
  },
  contentOutline: {
    width: '100%',
    maxWidth: '700px',
    backgroundColor: 'transparent',
    padding: '0 0 40px 0',
  },
  stepContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  stepHeader: {
    borderBottom: '1px solid #F3F4F6',
    paddingBottom: '20px',
  },
  stepBadge: {
    display: 'inline-block',
    padding: '4px 10px',
    backgroundColor: '#EEF2FF',
    color: '#4F46E5',
    fontWeight: '700',
    fontSize: '12px',
    borderRadius: '20px',
    marginBottom: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  stepTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#111827',
    margin: '0 0 8px 0',
  },
  stepSubTitle: {
    fontSize: '15px',
    color: '#6B7280',
    margin: 0,
  },
  profileCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '24px',
    backgroundColor: '#F9FAFB',
    borderRadius: '12px',
    border: '1px solid #E5E7EB',
    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
  },
  profileIconBox: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  },
  profileTypeLabel: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: '1px',
    margin: '0 0 4px 0',
  },
  profileName: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#111827',
    margin: '0 0 8px 0',
  },
  approvedBadge: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#059669',
    backgroundColor: '#D1FAE5',
    padding: '4px 10px',
    borderRadius: '20px',
    display: 'inline-block',
  },
  primaryButton: {
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
};