import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore'; 

// 🚨 IMPORT OF OUTSOURCED COMPONENTS
import MyListingsPage from './MyListingsPage';
import OrderHistoryPage from './OrderHistoryPage'; 
import NotificationsPage from './NotificationsPage'; 
import SettingsPage from './SettingsPage'; 

// --- STYLING HELPERS (Fixed for Mobile Overlap & One Card Flow) ---
const pageStyle = { 
    position: 'fixed', 
    top: 0, 
    left: 0, 
    width: '100%', 
    height: '100%', 
    background: '#f8f8f8', 
    overflowY: 'auto', // The scrollable viewport
    WebkitOverflowScrolling: 'touch',
    zIndex: 2000,
    // FIX: 'flex-start' ensures the card grows downwards and background doesn't cut off
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start' 
};

// Menu card background set to match page background for smooth transition
const menuCard = { width: '100%', maxWidth: '480px', background: '#f8f8f8', padding: '20px', minHeight: '100%', boxSizing:'border-box' };

// Sub page card retains white background and clean padding
const subPageCard = { 
    width: '100%', 
    maxWidth: '480px', 
    background: '#fff', 
    padding: '25px', 
    paddingBottom: '150px', 
    minHeight: '100%', 
    boxSizing:'border-box', 
    boxShadow:'0 0 15px rgba(0,0,0,0.05)',
    position: 'relative', 
    zIndex: 2001
};

const headerRow = { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'30px', marginTop: '10px' };
const closeBtn = { background:'none', border:'none', fontSize:'24px', color:'#333', cursor:'pointer' };
const backBtn = { background:'none', border:'none', fontSize:'16px', color:'#2E7D32', cursor:'pointer', marginBottom:'25px', padding:0, fontWeight:'700', marginTop: '10px' };
const sectionTitle = { margin:'0 0 25px 0', color:'#333', fontSize:'24px', fontWeight:'800' };
const subSectionTitle = { margin:'20px 0 15px 0', color:'#444', fontSize:'17px', borderLeft:'4px solid #FFC107', paddingLeft:'12px', fontWeight:'700' }; 

const idCard = { display:'flex', alignItems:'center', background:'linear-gradient(135deg, #2E7D32, #4CAF50)', color:'white', padding:'30px', borderRadius:'15px', marginBottom:'35px', boxShadow:'0 8px 25px rgba(46, 125, 50, 0.5)', position:'relative' };
const profileHeader = { textAlign:'center', marginBottom:'30px', paddingBottom:'20px', borderBottom:'1px solid #eee' };

const avatarContainer = { width:'70px', height:'70px', borderRadius:'50%', background:'white', marginRight:'18px', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', flexShrink:0, position:'relative' };
const avatarImg = { width:'100%', height:'100%', objectFit:'cover' };
const avatarLargeContainer = { width:'110px', height:'110px', borderRadius:'50%', background:'white', margin:'0 auto 15px', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', border:'4px solid #FF9800', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' };

const miniUploadBtn = { position:'absolute', bottom:0, right:0, background:'#FFC107', color:'#333', borderRadius:'50%', width:'24px', height:'24px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', cursor:'pointer', border:'2px solid #fff' };
const uploadBtn = { color:'#2196F3', fontSize:'14px', fontWeight:'bold', cursor:'pointer', marginTop:'10px', display:'inline-block' };

const menuGrid = { display:'flex', flexDirection:'column', gap:'10px' }; 
const menuItem = { 
    display:'flex', 
    alignItems:'center', 
    background:'#fff', 
    border:'none', 
    padding:'20px', 
    borderRadius:'12px', 
    cursor:'pointer', 
    textAlign:'left', 
    boxShadow:'0 2px 10px rgba(0,0,0,0.05)', 
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
};
const iconStyle = { fontSize:'30px', marginRight:'15px', width:'35px', flexShrink:0 };
const menuTitle = { fontWeight:'700', fontSize:'17px', color:'#333' };
const menuDesc = { fontSize:'13px', color:'#666', marginTop:'2px' }; 
const arrow = { marginLeft:'auto', fontSize:'24px', color:'#ccc' };

// FIX: Added positioning to formGroup to prevent vertical overlap
const formGroup = { marginBottom:'25px', position: 'relative' }; 
const formRow = { display:'flex', gap:'15px' };
const label = { display:'block', fontSize:'12px', fontWeight:'600', color:'#888', marginBottom:'5px', textTransform:'uppercase' }; 

// FIX: Changed background to white to prevent transparency bleed-through
const ajioInput = { width:'100%', padding: '12px 0', borderRadius: '0', border: 'none', borderBottom: '1px solid #ddd', fontSize: '15px', boxSizing: 'border-box', background: '#fff', color: '#333', outline:'none' }; 

// 🚨 STUNNING GPS SECTION OVERHAUL
const gpsBox = { 
    background:'linear-gradient(135deg, #1976D2, #2196F3)', 
    padding: '20px', 
    borderRadius: '12px', 
    marginBottom: '30px', 
    boxShadow: '0 4px 15px rgba(33, 150, 243, 0.4)',
    display:'flex', 
    flexDirection: 'column',
    color: 'white'
};
const gpsToolHeader = { fontSize: '18px', fontWeight: '800', marginBottom: '10px', display: 'flex', alignItems: 'center' };
const gpsStatus = (status) => ({
    fontSize: '14px', 
    color: status === 'Missing' ? '#FFC107' : '#E0E0E0', 
    marginTop: '5px', 
    fontWeight: '600'
});

const actionBtn = { 
    background:'#FFC107', 
    color:'#333', 
    border:'none', 
    padding:'12px 18px', 
    borderRadius:'8px', 
    cursor:'pointer', 
    fontWeight:'bold', 
    fontSize:'14px', 
    flexShrink: 0,
    marginTop: '15px',
    transition: 'background 0.2s ease'
};

const mainSaveBtn = { 
    width:'100%', 
    background:'#2E7D32', 
    color:'white', 
    border:'none', 
    padding:'16px', 
    borderRadius:'12px', 
    fontSize:'17px', 
    fontWeight:'bold', 
    cursor:'pointer', 
    marginTop:'20px',
    marginBottom: '80px', 
    boxShadow: '0 4px 15px rgba(46, 125, 50, 0.3)'
};

const blackSaveBtn = { 
    width:'100%', 
    background:'#000', 
    color:'white', 
    border:'none', 
    padding:'16px', 
    borderRadius:'12px', 
    fontSize:'16px', 
    fontWeight:'bold', 
    cursor:'pointer', 
    marginTop:'20px',
    marginBottom: '80px', 
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
};

const logoutBtn = { width:'100%', background:'#d32f2f', color:'white', border:'none', padding:'16px', borderRadius:'12px', fontSize:'17px', fontWeight:'bold', cursor:'pointer', marginTop:'30px' };

const settingsItem = { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'15px 0', borderBottom:'1px solid #f0f0f0' };


// We keep the rating rendering helpers as they are used in the Seller Profile view (View 3)
const renderStars = (rating) => {
    const stars = [];
    const roundedRating = Math.max(0, Math.min(5, Math.round(rating)));
    for (let i = 1; i <= 5; i++) {
        stars.push(<span key={i} style={{color: i <= roundedRating ? '#FFC107' : '#E0E0E0', fontSize:'24px'}}>★</span>);
    }
    return stars;
};

const renderRatingBreakdown = () => {
    const breakdown = { '5': 25, '4': 15, '3': 20, '2': 10, '1': 30 }; // Mock data
    const keys = ['5', '4', '3', '2', '1'];
    return (
        <div style={{width: '100%'}}>
            {keys.map(star => (
                <div key={star} style={{display: 'flex', alignItems: 'center', margin: '6px 0'}}>
                    <span style={{fontSize: '13px', color: '#333', width: '20px', fontWeight: '600'}}>{star}★</span>
                    <div style={{flexGrow: 1, height: '8px', background: '#F0F0F0', borderRadius: '4px', margin: '0 10px'}}>
                        <div 
                            style={{
                                width: `${breakdown[star] || 0}%`, 
                                height: '100%', 
                                background: '#4CAF50', 
                                borderRadius: '4px'
                            }}
                        ></div>
                    </div>
                    <span style={{fontSize: '13px', color: '#666', width: '40px', textAlign: 'right'}}>{breakdown[star] || 0}%</span>
                </div>
            ))}
        </div>
    );
};

const renderCategoryRating = (title, score, maxScore = 5) => (
    <div style={{ marginBottom: '15px' }}>
        <div style={{ fontSize: '14px', color: '#333', fontWeight: '600', marginBottom: '4px' }}>{title}</div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '16px', color: '#333', fontWeight: 'bold', width: '30px' }}>{score.toFixed(1)}</span>
            <div style={{ flexGrow: 1, height: '8px', background: '#F0F0F0', borderRadius: '4px', margin: '0 10px' }}>
                <div 
                    style={{
                        width: `${(score / maxScore) * 100}%`, 
                        height: '100%', 
                        background: '#FFC107', 
                        borderRadius: '4px'
                    }}
                ></div>
            </div>
        </div>
    </div>
);


// --- MAIN PROFILE COMPONENT ---
function Profile() {
    const navigate = useNavigate(); 
    const [user, setUser] = useState(null);
    const [activeView, setActiveView] = useState('menu'); 
    const [loading, setLoading] = useState(true);
    
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [isSaving, setIsSaving] = useState(false);
    
    // Data State
    const [profileData, setProfileData] = useState({
        name: '', sellerName: 'Unnamed Shop', phone: '', alternatePhone: '', photo: '', rating: 4.8, bio: 'Dedicated local farmer/machinery provider.', ordersCompleted: 0,
        serviceOrders: 15, productOrders: 25, serviceRating: 4.6, productRating: 4.4, ratingBreakdown: { '5': 25, '4': 15, '3': 20, '2': 10, '1': 30 },
        serviceMetrics: [ { title: "Work Skills", score: 4.8 }, { title: "Punctuality", score: 4.3 }, { title: "Communication", score: 4.6 } ],
        productMetrics: [ { title: "Product Quality", score: 4.7 }, { title: "Freshness", score: 4.4 }, { title: "Packaging", score: 4.0 } ],
        
        homeAddress: { pincode: '', city: '', state: '', locality: '', building: '', landmark: '', lat: null, lng: null },
        businessAddress: { pincode: '', city: '', state: '', locality: '', building: '', landmark: '', lat: null, lng: null }
    });

    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => setNotification({ message: '', type: '' }), 4000);
    };

    // --- Data Loading and Saving Logic ---
    useEffect(() => { 
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                const docRef = doc(db, "users", currentUser.uid);
                const docSnap = await getDoc(docRef);
                
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    
                    const extractAddress = (source) => ({
                          pincode: source.pincode || '', city: source.city || '', state: source.state || '', 
                          locality: source.locality || '', building: source.building || '', landmark: source.landmark || '',
                          lat: source.lat || null, lng: source.lng || null
                    });

                    setProfileData(prev => ({ 
                        ...prev, 
                        ...data,
                        homeAddress: data.homeAddress ? extractAddress(data.homeAddress) : prev.homeAddress,
                        businessAddress: data.businessAddress ? extractAddress(data.businessAddress) : prev.businessAddress,
                        
                        phone: data.phone || '', alternatePhone: data.alternatePhone || '', 
                        sellerName: data.sellerName || 'Unnamed Shop', bio: data.bio || prev.bio,
                        ordersCompleted: data.ordersCompleted || 0, rating: data.rating || 4.8,
                        ratingBreakdown: data.ratingBreakdown || prev.ratingBreakdown, 
                        serviceOrders: data.serviceOrders || 15, productOrders: data.productOrders || 25, 
                        serviceRating: data.serviceRating || 4.6, productRating: data.productRating || 4.4, 
                        serviceMetrics: data.serviceMetrics || prev.serviceMetrics, productMetrics: data.productMetrics || prev.productMetrics,
                    }));
                } else {
                    setProfileData(prev => ({...prev, name: currentUser.displayName || 'New User', photo: currentUser.photoURL || prev.photo}));
                }
            }
            setLoading(false);
        });
        return () => unsubscribe(); 
    }, [navigate]);

    const saveData = async (newData = {}) => { 
        if (!user) { showNotification("Authentication required to save.", 'error'); return; }

        setIsSaving(true);
        showNotification("Saving...", 'loading');

        try {
            const updated = { ...profileData, ...newData };
            
            if (!/^\+?(\d[\d\s-]{6,}\d)$/.test(updated.phone)) {
                 showNotification("Invalid primary phone number format.", 'error');
                 setIsSaving(false);
                 return;
            }
            
            const dataToSave = {
                ...updated,
                phone: updated.phone, alternatePhone: updated.alternatePhone, 
                name: updated.name, sellerName: updated.sellerName, bio: updated.bio,
                
                homeAddress: updated.homeAddress,
                businessAddress: updated.businessAddress,

                ordersCompleted: updated.ordersCompleted, 
                rating: updated.rating, 
            };
            
            setProfileData(updated); 
            await setDoc(doc(db, "users", user.uid), dataToSave, { merge: true });
            
            showNotification("Profile saved successfully!", 'success');
        } catch (e) { 
            showNotification("Error saving profile: " + e.message, 'error'); 
        } finally {
            setIsSaving(false);
        }
    };

    const setBaseLocation = (addressType) => { 
        if (!navigator.geolocation) { showNotification("GPS not supported by your browser.", 'error'); return; }
        
        showNotification(`Fetching GPS coordinates for ${addressType === 'homeAddress' ? 'Home' : 'Business'}...`, 'loading');
        
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
                const data = await response.json();
                
                const newAddress = {
                    lat: latitude, lng: longitude,
                    pincode: data.postcode || data.localityInfo?.administrative[7]?.name || '', 
                    city: data.city || data.locality || '', 
                    state: data.principalSubdivision || '',
                    locality: data.localityName || data.street || data.locality || '',
                    building: profileData[addressType].building || data.street || '', 
                    landmark: profileData[addressType].landmark || '' 
                };

                setProfileData(prev => ({
                    ...prev,
                    [addressType]: newAddress 
                }));
                
                showNotification(`✅ GPS Coordinates saved. Pincode: ${newAddress.pincode}. Address fields pre-filled for ${addressType === 'homeAddress' ? 'Home' : 'Business'}. Please verify and Save.`, 'success');

            } catch (error) { 
                showNotification("GPS captured, but address lookup failed. Please fill details manually.", 'error'); 
            }
        }, () => showNotification("GPS Permission denied or timeout.", 'error'), {enableHighAccuracy:true, timeout: 10000});
    };
    
    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 1024 * 1024) { showNotification("Photo must be under 1MB", 'error'); return; }
            const reader = new FileReader();
            reader.onloadend = () => saveData({ photo: reader.result });
            reader.readAsDataURL(file);
        }
    };
    
    const handleLogout = async () => { 
        showNotification("Logging out...", 'loading');
        await signOut(auth); 
        navigate('/login'); 
    };

    if (loading) return <div style={{color:'black', textAlign:'center', paddingTop:'50px'}}>Loading...</div>;

    const NotificationBar = () => {
        if (!notification.message) return null;
        
        const style = {
            position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', padding: '12px 20px', borderRadius: '10px', color: 'white', fontWeight: 'bold', zIndex: 3000, maxWidth: '90%', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', transition: 'opacity 0.3s ease',
        };

        let bgColor = '#333';
        if (notification.type === 'success') bgColor = '#4CAF50';
        if (notification.type === 'error') bgColor = '#F44336';
        if (notification.type === 'loading') bgColor = '#2196F3';

        return (
            <div style={{ ...style, background: bgColor }}>
                {notification.message}
            </div>
        );
    };


    // --- VIEW 1: MAIN MENU (Control Center) ---
    if (activeView === 'menu') {
        return (
            <div style={pageStyle}>
                <NotificationBar />
                <div style={menuCard}>
                    <div style={headerRow}>
                        <button onClick={() => navigate('/dashboard')} style={closeBtn}>✕</button>
                        <h2 style={sectionTitle}>Control Center</h2>
                        <div style={{width:'32px'}}></div>
                    </div>

                    {/* User ID Card */}
                    <div style={idCard}>
                        <div style={avatarContainer}>
                            <img src={profileData.photo || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} style={avatarImg} alt="Profile" />
                            <label style={miniUploadBtn}>
                                ✎ <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{display:'none'}} />
                            </label>
                        </div>
                        <div>
                            <div style={{fontWeight:'bold', fontSize:'18px'}}>{profileData.name}</div> 
                            <div style={{fontSize:'13px', opacity:0.9, color:'white'}}>{user?.email || profileData.phone || "Account Contact"}</div>
                        </div>
                    </div>

                    {/* MENU OPTIONS GRID */}
                    <div style={menuGrid}>
                        <button onClick={() => setActiveView('personal')} style={menuItem}>
                            <span style={iconStyle}>👤</span>
                            <div>
                                <div style={menuTitle}>My Profile</div>
                                <div style={menuDesc}>Personal Details</div>
                            </div>
                            <span style={arrow}>›</span>
                        </button>

                        <button onClick={() => setActiveView('seller')} style={menuItem}>
                            <span style={iconStyle}>🏪</span>
                            <div>
                                <div style={menuTitle}>Seller Profile</div>
                                <div style={menuDesc}>Shop setup, Location & Contact ({profileData.rating.toFixed(1)})</div>
                            </div>
                            <span style={arrow}>›</span>
                        </button>
                        
                        <button onClick={() => setActiveView('listings')} style={menuItem}>
                            <span style={iconStyle}>📋</span>
                            <div>
                                <div style={menuTitle}>My Listings</div>
                                <div style={menuDesc}>Manage active products & services</div>
                            </div>
                            <span style={arrow}>›</span>
                        </button>

                        <button onClick={() => setActiveView('history')} style={menuItem}>
                            <span style={iconStyle}>📦</span>
                            <div>
                                <div style={menuTitle}>Order History</div>
                                <div style={menuDesc}>View past purchases & hires</div>
                            </div>
                            <span style={arrow}>›</span>
                        </button>

                        <button onClick={() => setActiveView('notifs')} style={menuItem}>
                            <span style={iconStyle}>🔔</span>
                            <div>
                                <div style={menuTitle}>Notifications</div>
                                <div style={menuDesc}>Orders & Hiring requests status</div>
                            </div>
                            <span style={arrow}>›</span>
                        </button>

                        <button onClick={() => setActiveView('settings')} style={menuItem}>
                            <span style={iconStyle}>⚙️</span>
                            <div>
                                <div style={menuTitle}>Settings</div>
                                <div style={menuDesc}>Language, Privacy & Logout</div>
                            </div>
                            <span style={arrow}>›</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- VIEW 2: MY PERSONAL PROFILE (Embedded/FIXED) ---
    if (activeView === 'personal') {
        const { homeAddress } = profileData; 

        const handleHomeAddressChange = (key, value) => {
            setProfileData(prev => ({
                ...prev,
                homeAddress: { ...prev.homeAddress, [key]: value }
            }));
        };

        return (
            <div style={pageStyle}>
                <NotificationBar />
                <div style={subPageCard}>
                    <button onClick={() => setActiveView('menu')} style={backBtn}>⬅ Back to Menu</button>
                    <h2 style={sectionTitle}>👤 Personal Details</h2>
                    
                    {/* ORIGINAL INPUT LAYOUT RESTORED */}
                    <div style={formGroup}>
                        <label style={label}>Account Name</label>
                        <input type="text" value={profileData.name} onChange={e=>setProfileData({...profileData, name:e.target.value})} style={ajioInput} />
                    </div>
                    
                    <div style={formGroup}>
                        <label style={label}>Primary Phone Number</label>
                        <input type="tel" placeholder="e.g. 919876543210" value={profileData.phone} onChange={e=>setProfileData({...profileData, phone:e.target.value})} style={ajioInput} />
                    </div>

                    <hr style={{margin:'25px 0', borderColor:'#eee'}}/>
                    <h3 style={subSectionTitle}>🏠 Primary Home Address</h3>

                    {/* **STUNNING GPS TOOL OVERHAUL** */}
                    <div style={gpsBox}>
                         <div style={gpsToolHeader}>
                             <span style={{marginRight: '8px'}}>🛰️</span> GPS Tool
                         </div>
                        <p style={gpsStatus(homeAddress.lat ? 'Active' : 'Missing')}>
                             Status: {homeAddress.lat ? `Active: ${homeAddress.lat.toFixed(4)}, ${homeAddress.lng.toFixed(4)}` : 'Missing'}
                         </p>
                        <button onClick={() => setBaseLocation('homeAddress')} style={actionBtn}>Get Current GPS & Pre-fill</button>
                    </div>

                    {/* ADDRESS FIELDS (Ajio Style Inputs) - NOW CORRECTLY LINKED to homeAddress */}
                    <div style={formRow}>
                        <div style={{...formGroup, flex:1}}>
                            <label style={label}>Pincode</label>
                            <input type="text" value={homeAddress.pincode} onChange={e=>handleHomeAddressChange('pincode', e.target.value)} style={ajioInput} />
                        </div>
                        <div style={{...formGroup, flex:1}}>
                            <label style={label}>City</label>
                            <input type="text" value={homeAddress.city} onChange={e=>handleHomeAddressChange('city', e.target.value)} style={ajioInput} />
                        </div>
                    </div>

                    <div style={formGroup}>
                        <label style={label}>State</label>
                        <input type="text" value={homeAddress.state} onChange={e=>handleHomeAddressChange('state', e.target.value)} style={ajioInput} />
                    </div>

                    <div style={formGroup}>
                        <label style={label}>Locality / Area / Street</label>
                        <input type="text" value={homeAddress.locality} onChange={e=>handleHomeAddressChange('locality', e.target.value)} style={ajioInput} />
                    </div>

                    <div style={formGroup}>
                        <label style={label}>Flat no / Building Name</label>
                        <input type="text" value={homeAddress.building} onChange={e=>handleHomeAddressChange('building', e.target.value)} style={ajioInput} />
                    </div>

                    <div style={formGroup}>
                        <label style={label}>Landmark (optional)</label>
                        <input type="text" value={homeAddress.landmark} onChange={e=>handleHomeAddressChange('landmark', e.target.value)} style={ajioInput} />
                    </div>

                    <button onClick={() => saveData()} style={mainSaveBtn} disabled={isSaving}>
                        {isSaving ? 'Saving...' : '💾 Save Personal Profile'}
                    </button>
                </div>
            </div>
        );
    }

    // --- VIEW 3: SELLER PROFILE (Embedded/FIXED) ---
    if (activeView === 'seller') {
        const { businessAddress } = profileData; 

        const handleBusinessAddressChange = (key, value) => {
            setProfileData(prev => ({
                ...prev,
                businessAddress: { ...prev.businessAddress, [key]: value }
            }));
        };

        return (
            <div style={pageStyle}>
                <NotificationBar />
                <div style={subPageCard}>
                    <button onClick={() => setActiveView('menu')} style={backBtn}>⬅ Back to Menu</button>
                    <h2 style={sectionTitle}>🏪 Seller Profile Management</h2>
                    
                    {/* PROFILE PICTURE & NAME */}
                    <div style={profileHeader}>
                        <div style={avatarLargeContainer}>
                            <img src={profileData.photo || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} style={avatarImg} alt="Seller Photo" />
                        </div>
                        <label style={uploadBtn}>
                            📷 Edit Profile Picture
                            <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{display:'none'}} />
                        </label>
                    </div>
                    
                    {/* Shop Name Input */}
                    <div style={formGroup}>
                        <label style={label}>Shop / Business Name (Public)</label>
                        <input type="text" placeholder="e.g. Raju Tractors & Services" value={profileData.sellerName} onChange={e=>setProfileData({...profileData, sellerName:e.target.value})} style={ajioInput} />
                    </div>

                    {/* Seller Name Input */}
                    <div style={formGroup}>
                        <label style={label}>Seller Name (Owner)</label>
                        <input type="text" placeholder="e.g. Arjun Reddy" value={profileData.name} onChange={e=>setProfileData({...profileData, name:e.target.value})} style={ajioInput} />
                    </div>
                    
                    <hr style={{margin:'25px 0', borderColor:'#eee'}}/>

                    {/* CONTACT INFORMATION */}
                    <h3 style={subSectionTitle}>Contact & Public Location</h3>
                    
                    <div style={formGroup}>
                        <label style={label}>Primary Phone (Used for Listings)</label>
                        <input type="tel" placeholder="e.g. 919876543210" value={profileData.phone} onChange={e=>setProfileData({...profileData, phone:e.target.value})} style={ajioInput} />
                    </div>

                    <div style={formGroup}>
                        <label style={label}>Alternate Mobile Number (Optional)</label>
                        <input type="tel" placeholder="Optional Backup Number" value={profileData.alternatePhone} onChange={e=>setProfileData({...profileData, alternatePhone:e.target.value})} style={ajioInput} />
                    </div>

                    {/* **BUSINESS ADDRESS INPUT - NOW LINKED TO businessAddress** */}
                    <h3 style={subSectionTitle}>Home Base Address (For Directions/Filtering)</h3>
                    
                    {/* **STUNNING GPS TOOL OVERHAUL** */}
                    <div style={gpsBox}>
                         <div style={gpsToolHeader}>
                             <span style={{marginRight: '8px'}}>🛰️</span> GPS Tool
                         </div>
                        <p style={gpsStatus(businessAddress.lat ? 'Active' : 'Missing')}>
                             Status: {businessAddress.lat ? `Active: ${businessAddress.lat.toFixed(4)}, ${businessAddress.lng.toFixed(4)}` : 'Missing'}
                         </p>
                        <button onClick={() => setBaseLocation('businessAddress')} style={actionBtn}>Get Current GPS & Pre-fill</button>
                    </div>

                    {/* ADDRESS FIELDS (Ajio Style Inputs) - NOW CORRECTLY LINKED to businessAddress */}
                    <div style={formRow}>
                        <div style={{...formGroup, flex:1}}>
                            <label style={label}>Pincode</label>
                            <input type="text" value={businessAddress.pincode} onChange={e=>handleBusinessAddressChange('pincode', e.target.value)} style={ajioInput} />
                        </div>
                        <div style={{...formGroup, flex:1}}>
                            <label style={label}>City</label>
                            <input type="text" value={businessAddress.city} onChange={e=>handleBusinessAddressChange('city', e.target.value)} style={ajioInput} />
                        </div>
                    </div>

                    <div style={formGroup}>
                        <label style={label}>State</label>
                        <input type="text" value={businessAddress.state} onChange={e=>handleBusinessAddressChange('state', e.target.value)} style={ajioInput} />
                    </div>

                    <div style={formGroup}>
                        <label style={label}>Locality / Area / Street</label>
                        <input type="text" value={businessAddress.locality} onChange={e=>handleBusinessAddressChange('locality', e.target.value)} style={ajioInput} />
                    </div>

                    <div style={formGroup}>
                        <label style={label}>Flat no / Building Name</label>
                        <input type="text" value={businessAddress.building} onChange={e=>handleBusinessAddressChange('building', e.target.value)} style={ajioInput} />
                    </div>

                    <div style={formGroup}>
                        <label style={label}>Landmark (optional)</label>
                        <input type="text" value={businessAddress.landmark} onChange={e=>handleBusinessAddressChange('landmark', e.target.value)} style={ajioInput} />
                    </div>

                    
                    <hr style={{margin:'25px 0', borderColor:'#eee'}}/>
                    
                    {/* TRACK RECORD & BIO - ADVANCED RATING UI */}
                    <h3 style={subSectionTitle}>Track Record & Bio</h3>

                    <div style={{ border: '1px solid #eee', borderRadius:'10px', marginBottom:'20px', background:'#f9f9f9', padding:'15px' }}>
                        
                        {/* OVERALL RATING HEADER */}
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #ddd', paddingBottom:'10px', marginBottom:'15px'}}>
                            <div style={{textAlign:'left'}}>
                                <div style={{fontSize:'45px', color:'#FFC107', fontWeight:'900', lineHeight:1}}>{profileData.rating.toFixed(1)}</div>
                                <div style={{fontSize:'12px', color:'#666'}}>Overall Rating</div>
                            </div>
                            <div style={{textAlign:'right'}}>
                                <div style={{fontSize:'35px', color:'#2196F3', fontWeight:'900', lineHeight:1}}>{profileData.ordersCompleted}+</div>
                                <div style={{fontSize:'12px', color:'#666'}}>Total Orders Completed</div>
                            </div>
                        </div>

                        {/* RATING BREAKDOWN BARS */}
                        <h4 style={{margin:'0 0 10px 0', color:'#333', fontSize:'15px', fontWeight:'700'}}>User Rating Breakdown</h4>
                        {renderRatingBreakdown()}
                        
                        <hr style={{margin:'20px 0'}}/>

                        {/* SERVICE RATING METRICS */}
                        <h4 style={{margin:'0 0 10px 0', color:'#333', fontSize:'15px', fontWeight:'700'}}>Service Quality ({profileData.serviceRating.toFixed(1)})</h4>
                        <p style={{fontSize:'11px', color:'#999', marginBottom:'10px'}}>Service Orders: {profileData.serviceOrders}</p>
                        {profileData.serviceMetrics.map((metric, index) => <div key={'s'+index}>{renderCategoryRating(metric.title, metric.score)}</div>)}

                        <hr style={{margin:'20px 0'}}/>

                        {/* PRODUCT RATING METRICS */}
                        <h4 style={{margin:'0 0 10px 0', color:'#333', fontSize:'15px', fontWeight:'700'}}>Product Quality ({profileData.productRating.toFixed(1)})</h4>
                        <p style={{fontSize:'11px', color:'#999', marginBottom:'10px'}}>Product Orders: {profileData.productOrders}</p>
                        {profileData.productMetrics.map((metric, index) => <div key={'p'+index}>{renderCategoryRating(metric.title, metric.score)}</div>)}

                    </div>
                    
                    <div style={formGroup}>
                        <label style={label}>Seller Bio</label>
                        <textarea value={profileData.bio} onChange={e=>setProfileData({...profileData, bio:e.target.value})} style={{...ajioInput, minHeight:'100px'}} placeholder="Describe your experience..."></textarea>
                    </div>

                    {/* AJIO STYLE BLACK BUTTON */}
                    <button onClick={() => saveData()} style={blackSaveBtn} disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save Seller Details'}
                    </button>
                </div>
            </div>
        );
    }
    
    // --- Outsourced View Renders (Unchanged) ---
    if (activeView === 'listings') {
        return (
            <MyListingsPage 
                user={user} 
                profileData={profileData} 
                setActiveView={setActiveView} 
                showNotification={showNotification}
            />
        );
    }
    
    if (activeView === 'history') {
        return (
            <OrderHistoryPage 
                setActiveView={setActiveView} 
                NotificationBar={NotificationBar}
            />
        );
    }

    if (activeView === 'notifs') {
        return (
            <NotificationsPage 
                setActiveView={setActiveView} 
                NotificationBar={NotificationBar}
            />
        );
    }

    if (activeView === 'settings') {
        return (
            <SettingsPage 
                setActiveView={setActiveView} 
                NotificationBar={NotificationBar} 
                handleLogout={handleLogout} 
            />
        );
    }

    return null;
}

export default Profile;