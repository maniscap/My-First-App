import React, { useState, useEffect } from 'react';
import { ArrowLeft, Store, Building2, User, AlertCircle, ShieldCheck, Info, MapPin, Truck, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { db, auth } from '../../firebase';
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
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

  // Location Form State
  const [locationForm, setLocationForm] = useState({
    houseNumber: '', landmark: '', village: '', mandal: '', nearerCity: '', district: '', state: 'Andhra Pradesh', pincode: '', lat: '', lng: '', serviceRadius: '20km'
  });
  const [isSavingLocation, setIsSavingLocation] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [mapLayer, setMapLayer] = useState('k'); // 'm' for map, 'k' for satellite
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

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

          // Pre-fill location form from existing storefront data OR fallback to blank
          setLocationForm(appData.storefrontLocation || {
            houseNumber: '', landmark: '', village: '', mandal: '', nearerCity: '', district: '', state: 'Andhra Pradesh', pincode: '', lat: '', lng: '', serviceRadius: '20km'
          });
          
          setAccountType(appData.accountType);
          const nameToUse = appData.accountType === 'organisation' ? appData.companyName : (appData.shopName || appData.fullName);
          const ownerToUse = appData.ownerName || appData.fullName;
          
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
      <div style={styles.container}>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1}}>
           <AlertCircle size={64} color="#EF4444" style={{ marginBottom: '16px' }} />
           <h2 style={{color: '#111827', fontSize: '24px', fontWeight: '700', marginBottom: '8px'}}>Access Denied</h2>
           <p style={{color: '#6B7280', marginBottom: '24px'}}>Your profile must be approved before setting up the storefront.</p>
           <button onClick={() => navigate('/seller-setup')} style={{ ...styles.primaryButton, background: '#0066FF', color: '#FFF', padding: '12px 24px' }}>
             Go to Application Setup
           </button>
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
        const appId = localStorage.getItem('seller_app_id');
        await updateDoc(doc(db, 'seller_applications', appId), {
          storefrontLocation: locationForm
        });
        // Update local state so it reflects instantly
        setFullAppData(prev => ({ ...prev, storefrontLocation: locationForm }));
        alert("Location details saved successfully!");
        setExpandedCard(null); // Go back to main menu
      } catch (e) {
        console.error(e);
        alert("Failed to save location details.");
      }
      setIsSavingLocation(false);
    };

    return (
      <div style={styles.container}>
        <header style={styles.header}>
          <button style={styles.iconButton} onClick={() => setExpandedCard(null)}>
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
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Top Header */}
      <header style={styles.header}>
        <button style={styles.iconButton} onClick={() => navigate('/Seller_HomePage')}>
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
                  <p style={{ margin: 0, fontSize: '13px', color: '#6B7280', fontWeight: '500' }}>Setup your basic profile and description</p>
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
                    {accountType === 'organisation' ? 'Location & Address' : 'Location & Address'}
                  </h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#6B7280', fontWeight: '500' }}>Pinpoint your exact physical location</p>
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
                    Operating Hours & Logistics
                  </h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#6B7280', fontWeight: '500' }}>Set timings, pickup, and delivery fees</p>
                </div>
                <ChevronRight size={20} color="#D1D5DB" strokeWidth={3} style={{ flexShrink: 0 }} />
              </div>

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