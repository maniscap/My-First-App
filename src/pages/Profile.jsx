import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore'; 

// 🚨 NEW IMPORT: Bring in the separate Listings component
import MyListingsPage from './MyListingsPage';

// --- STYLING HELPERS (Simplified - only what is needed here) ---
const itemTypeBadgeStyle = { /* ... */ }; // Not strictly needed here but kept for consistency
// ... (Keep only the minimum styles required for views: menu, personal, seller, history, notifs, settings)
// For simplicity, I'll keep the styles you already had.

const pageStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: '#f8f8f8', display:'flex', justifyContent:'center', overflowY:'auto' };
const menuCard = { width: '100%', maxWidth: '480px', background: '#fff', padding: '20px', minHeight: '100vh', boxSizing:'border-box', boxShadow:'0 0 10px rgba(0,0,0,0.05)' };
const subPageCard = { width: '100%', maxWidth: '480px', background: '#fff', padding: '20px', minHeight: '100vh', boxSizing:'border-box', boxShadow:'0 0 10px rgba(0,0,0,0.05)' };
const headerRow = { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'30px' };
const closeBtn = { background:'none', border:'none', fontSize:'24px', color:'#333', cursor:'pointer' };
const backBtn = { background:'none', border:'none', fontSize:'14px', color:'#555', cursor:'pointer', marginBottom:'20px', padding:0, fontWeight:'600' };
const sectionTitle = { margin:'0 0 25px 0', color:'#333', fontSize:'22px' };
const subSectionTitle = { margin:'0 0 15px 0', color:'#444', fontSize:'17px', borderLeft:'3px solid #FFC107', paddingLeft:'10px', fontWeight:'700' };

const idCard = { display:'flex', alignItems:'center', background:'linear-gradient(135deg, #2E7D32, #4CAF50)', color:'white', padding:'25px', borderRadius:'18px', marginBottom:'30px', boxShadow:'0 6px 20px rgba(46, 125, 50, 0.4)', position:'relative' };
const profileHeader = { textAlign:'center', marginBottom:'30px', paddingBottom:'20px', borderBottom:'1px solid #eee' };

const avatarContainer = { width:'65px', height:'65px', borderRadius:'50%', background:'white', marginRight:'15px', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', flexShrink:0, position:'relative' };
const avatarImg = { width:'100%', height:'100%', objectFit:'cover' };
const avatarLargeContainer = { width:'100px', height:'100px', borderRadius:'50%', background:'white', margin:'0 auto 10px', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', border:'3px solid #FF9800' };

const miniUploadBtn = { position:'absolute', bottom:0, right:0, background:'#fff', color:'#333', borderRadius:'50%', width:'20px', height:'20px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', cursor:'pointer', border:'1px solid #ddd' };
const uploadBtn = { color:'#2196F3', fontSize:'14px', fontWeight:'bold', cursor:'pointer', marginTop:'10px', display:'inline-block' };

const menuGrid = { display:'flex', flexDirection:'column', gap:'12px' };
const menuItem = { display:'flex', alignItems:'center', background:'#fff', border:'1px solid #f0f0f0', padding:'18px', borderRadius:'15px', cursor:'pointer', textAlign:'left', boxShadow:'0 4px 10px rgba(0,0,0,0.05)' };
const iconStyle = { fontSize:'28px', marginRight:'15px', width:'30px', flexShrink:0 };
const menuTitle = { fontWeight:'700', fontSize:'16px', color:'#333' };
const menuDesc = { fontSize:'13px', color:'#666', marginTop:'4px' }; 
const arrow = { marginLeft:'auto', fontSize:'20px', color:'#ccc' };

const formGroup = { marginBottom:'20px' };
const formRow = { display:'flex', gap:'15px' };
const label = { display:'block', fontSize:'12px', fontWeight:'600', color:'#888', marginBottom:'5px', textTransform:'uppercase' }; 
const ajioInput = { width:'100%', padding: '12px 0', borderRadius: '0', border: 'none', borderBottom: '1px solid #ddd', fontSize: '15px', boxSizing: 'border-box', background: 'transparent', color: '#333', outline:'none' }; 

const gpsBox = { background:'#E3F2FD', padding:'15px', borderRadius:'12px', marginBottom:'20px', border:'1px solid #90CAF9', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap: 'wrap' };
const actionBtn = { background:'#1976D2', color:'white', border:'none', padding:'8px 12px', borderRadius:'6px', cursor:'pointer', fontWeight:'bold', fontSize:'12px', flexShrink: 0 };

const mainSaveBtn = { width:'100%', background:'#2E7D32', color:'white', border:'none', padding:'16px', borderRadius:'12px', fontSize:'17px', fontWeight:'bold', cursor:'pointer', marginTop:'10px' };
const blackSaveBtn = { width:'100%', background:'#000', color:'white', border:'none', padding:'16px', borderRadius:'12px', fontSize:'16px', fontWeight:'bold', cursor:'pointer', marginTop:'20px' };
const logoutBtn = { width:'100%', background:'#d32f2f', color:'white', border:'none', padding:'16px', borderRadius:'12px', fontSize:'17px', fontWeight:'bold', cursor:'pointer', marginTop:'30px' };

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
    // ... (rest of function logic)
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
const notifItem = { padding:'15px', border:'1px solid #e0e0e0', borderRadius:'12px', background:'#fff', marginBottom:'10px', borderLeft:'4px solid #FFC107' };
const settingsItem = { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'15px 0', borderBottom:'1px solid #f0f0f0' };

// --- MAIN PROFILE COMPONENT ---
function Profile() {
    const navigate = useNavigate(); 
    const [user, setUser] = useState(null);
    const [activeView, setActiveView] = useState('menu'); 
    const [loading, setLoading] = useState(true);
    
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [isSaving, setIsSaving] = useState(false);
    
    // Data State (Simplified - Listings state is GONE)
    const [profileData, setProfileData] = useState({
        name: '', sellerName: 'Unnamed Shop', phone: '', alternatePhone: '', address: '', lat: null, lng: null, photo: '', rating: 4.8, bio: 'Dedicated local farmer/machinery provider.', ordersCompleted: 0,
        serviceOrders: 15, productOrders: 25, serviceRating: 4.6, productRating: 4.4, ratingBreakdown: { '5': 25, '4': 15, '3': 20, '2': 10, '1': 30 },
        serviceMetrics: [ { title: "Work Skills", score: 4.8 }, { title: "Punctuality", score: 4.3 }, { title: "Communication", score: 4.6 } ],
        productMetrics: [ { title: "Product Quality", score: 4.7 }, { title: "Freshness", score: 4.4 }, { title: "Packaging", score: 4.0 } ],
        pincode: '', city: '', state: '', locality: '', building: '', landmark: '' 
    });

    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => setNotification({ message: '', type: '' }), 4000);
    };

    // --- Data Loading, Saving, Geolocation, Photo Upload (REMAINS THE SAME) ---
    useEffect(() => { /* ... loading logic remains ... */ 
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                const docRef = doc(db, "users", currentUser.uid);
                const docSnap = await getDoc(docRef);
                
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setProfileData(prev => ({ 
                        ...prev, ...data,
                        pincode: data.pincode || '', city: data.city || '', state: data.state || '', locality: data.locality || '', 
                        building: data.building || '', landmark: data.landmark || '', phone: data.phone || '', alternatePhone: data.alternatePhone || '', 
                        sellerName: data.sellerName || 'Unnamed Shop', bio: data.bio || 'Dedicated local farmer/machinery provider.', ordersCompleted: data.ordersCompleted || 0, 
                        rating: data.rating || 4.8, ratingBreakdown: data.ratingBreakdown || prev.ratingBreakdown, 
                        serviceOrders: data.serviceOrders || 15, productOrders: data.productOrders || 25, serviceRating: data.serviceRating || 4.6, 
                        productRating: data.productRating || 4.4, serviceMetrics: data.serviceMetrics || prev.serviceMetrics, productMetrics: data.productMetrics || prev.productMetrics,
                    }));
                } else {
                    setProfileData(prev => ({...prev, name: currentUser.displayName || 'New User', photo: currentUser.photoURL || prev.photo}));
                }
            }
            setLoading(false);
        });
        return () => unsubscribe(); 
    }, [navigate]);

    const saveData = async (newData = {}) => { /* ... save logic remains ... */
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
                pincode: updated.pincode, city: updated.city, state: updated.state, locality: updated.locality, 
                building: updated.building, landmark: updated.landmark, lat: updated.lat, lng: updated.lng,
                name: updated.name, sellerName: updated.sellerName, phone: updated.phone, alternatePhone: updated.alternatePhone, bio: updated.bio,
            };
            
            dataToSave.address = `${updated.building}, ${updated.locality}, ${updated.city}, ${updated.state} - ${updated.pincode}`;
            
            setProfileData(dataToSave);
            await setDoc(doc(db, "users", user.uid), dataToSave, { merge: true });
            
            showNotification("Profile saved successfully!", 'success');
            if (activeView !== 'menu') setActiveView('menu'); 
        } catch (e) { 
            showNotification("Error saving profile: " + e.message, 'error'); 
        } finally {
            setIsSaving(false);
        }
    };

    const setBaseLocation = () => { /* ... geolocation logic remains ... */
        if (!navigator.geolocation) { showNotification("GPS not supported by your browser.", 'error'); return; }
        
        showNotification("Fetching GPS coordinates...", 'loading');
        
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
                const data = await response.json();
                
                const newState = {
                    lat: latitude, lng: longitude,
                    pincode: data.postcode || data.localityInfo?.administrative[7]?.name || profileData.pincode || '',
                    city: data.city || data.locality || profileData.city || '', state: data.principalSubdivision || profileData.state || '',
                    locality: data.localityName || data.street || data.locality || profileData.locality || '',
                    building: profileData.building || data.street || '', landmark: profileData.landmark || '' 
                };
                
                setProfileData(prev => ({ ...prev, ...newState }));
                showNotification(`✅ GPS Coordinates saved. Pincode: ${newState.pincode}. Address fields pre-filled. Please verify and Save.`, 'success');

            } catch (error) { showNotification("GPS captured, but address lookup failed. Please fill details manually.", 'error'); }
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
            position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', padding: '12px 20px', borderRadius: '10px', color: 'white', fontWeight: 'bold', zIndex: 1000, maxWidth: '90%', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', transition: 'opacity 0.3s ease',
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
                                <div style={menuDesc}>Shop setup, Location & Contact ({profileData.rating})</div>
                            </div>
                            <span style={arrow}>›</span>
                        </button>
                        
                        {/* 🚨 UPDATED ACTION: Calls the new external component when activeView is 'listings' */}
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

    // --- VIEW 2: MY PERSONAL PROFILE ---
    if (activeView === 'personal') {
        return (
            <div style={pageStyle}>
                <NotificationBar />
                <div style={subPageCard}>
                    <button onClick={() => setActiveView('menu')} style={backBtn}>⬅ Back to Menu</button>
                    <h2 style={sectionTitle}>👤 Personal Details</h2>
                    
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

                    {/* **GPS TOOL FOR COORDINATES** */}
                    <div style={gpsBox}>
                        <div style={{flexGrow: 1}}>
                            <label style={{...label, color:'#1976D2', marginBottom:'10px'}}>🛰️ GPS Tool</label>
                            <p style={{fontSize:'12px', color:'#333', marginTop:'5px', fontWeight:'600'}}>
                                GPS: {profileData.lat && profileData.lng ? `Active: ${profileData.lat.toFixed(4)}, ${profileData.lng.toFixed(4)}` : 'Missing'}
                            </p>
                        </div>
                        <button onClick={setBaseLocation} style={actionBtn}>Get Current GPS & Pre-fill</button>
                    </div>

                    {/* ADDRESS FIELDS (Ajio Style Inputs) */}
                    <div style={formRow}>
                        <div style={{...formGroup, flex:1}}>
                            <label style={label}>Pincode</label>
                            <input type="text" value={profileData.pincode} onChange={e=>setProfileData({...profileData, pincode:e.target.value})} style={ajioInput} />
                        </div>
                        <div style={{...formGroup, flex:1}}>
                            <label style={label}>City</label>
                            <input type="text" value={profileData.city} onChange={e=>setProfileData({...profileData, city:e.target.value})} style={ajioInput} />
                        </div>
                    </div>

                    <div style={formGroup}>
                        <label style={label}>State</label>
                        <input type="text" value={profileData.state} onChange={e=>setProfileData({...profileData, state:e.target.value})} style={ajioInput} />
                    </div>

                    <div style={formGroup}>
                        <label style={label}>Locality / Area / Street</label>
                        <input type="text" value={profileData.locality} onChange={e=>setProfileData({...profileData, locality:e.target.value})} style={ajioInput} />
                    </div>

                    <div style={formGroup}>
                        <label style={label}>Flat no / Building Name</label>
                        <input type="text" value={profileData.building} onChange={e=>setProfileData({...profileData, building:e.target.value})} style={ajioInput} />
                    </div>

                    <div style={formGroup}>
                        <label style={label}>Landmark (optional)</label>
                        <input type="text" value={profileData.landmark} onChange={e=>setProfileData({...profileData, landmark:e.target.value})} style={ajioInput} />
                    </div>

                    <button onClick={() => saveData()} style={mainSaveBtn} disabled={isSaving}>
                        {isSaving ? 'Saving...' : '💾 Save Personal Profile'}
                    </button>
                </div>
            </div>
        );
    }

    // --- VIEW 3: SELLER PROFILE ---
    if (activeView === 'seller') {
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

                    {/* **AJIO STYLE ADDRESS INPUT - SYNCED FROM VIEW 2** */}
                    <h3 style={subSectionTitle}>Home Base Address (For Directions/Filtering)</h3>
                    
                    {/* GPS TOOL FOR COORDINATES */}
                    <div style={gpsBox}>
                        <div style={{flexGrow: 1}}>
                            <label style={{...label, color:'#1976D2', marginBottom:'10px'}}>🛰️ GPS Tool</label>
                            <p style={{fontSize:'12px', color:'#333', marginTop:'5px', fontWeight:'600'}}>
                                GPS: {profileData.lat && profileData.lng ? `Active: ${profileData.lat.toFixed(4)}, ${profileData.lng.toFixed(4)}` : 'Missing'}
                            </p>
                        </div>
                        <button onClick={setBaseLocation} style={actionBtn}>Get Current GPS & Pre-fill</button>
                    </div>

                    {/* ADDRESS FIELDS (Ajio Style Inputs) */}
                    <div style={formRow}>
                        <div style={{...formGroup, flex:1}}>
                            <label style={label}>Pincode</label>
                            <input type="text" value={profileData.pincode} onChange={e=>setProfileData({...profileData, pincode:e.target.value})} style={ajioInput} />
                        </div>
                        <div style={{...formGroup, flex:1}}>
                            <label style={label}>City</label>
                            <input type="text" value={profileData.city} onChange={e=>setProfileData({...profileData, city:e.target.value})} style={ajioInput} />
                        </div>
                    </div>

                    <div style={formGroup}>
                        <label style={label}>State</label>
                        <input type="text" value={profileData.state} onChange={e=>setProfileData({...profileData, state:e.target.value})} style={ajioInput} />
                    </div>

                    <div style={formGroup}>
                        <label style={label}>Locality / Area / Street</label>
                        <input type="text" value={profileData.locality} onChange={e=>setProfileData({...profileData, locality:e.target.value})} style={ajioInput} />
                    </div>

                    <div style={formGroup}>
                        <label style={label}>Flat no / Building Name</label>
                        <input type="text" value={profileData.building} onChange={e=>setProfileData({...profileData, building:e.target.value})} style={ajioInput} />
                    </div>

                    <div style={formGroup}>
                        <label style={label}>Landmark (optional)</label>
                        <input type="text" value={profileData.landmark} onChange={e=>setProfileData({...profileData, landmark:e.target.value})} style={ajioInput} />
                    </div>

                    <hr style={{margin:'25px 0', borderColor:'#eee'}}/>
                    
                    {/* TRACK RECORD & BIO - ADVANCED RATING UI (Kept from original) */}
                    <h3 style={subSectionTitle}>Track Record & Bio</h3>

                    <div style={{ border: '1px solid #eee', borderRadius:'10px', marginBottom:'20px', background:'#fff', padding:'15px' }}>
                        
                        {/* OVERALL RATING HEADER */}
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #eee', paddingBottom:'10px', marginBottom:'15px'}}>
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
    
    // 🚨 UPDATED RENDER: Render the dedicated MyListingsPage component
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
    
    // --- VIEW 5: ORDER HISTORY --- 
    if (activeView === 'history') {
        return (
            <div style={pageStyle}>
                <NotificationBar />
                <div style={subPageCard}>
                    <button onClick={() => setActiveView('menu')} style={backBtn}>⬅ Back to Menu</button>
                    <h2 style={sectionTitle}>📦 Order History</h2>
                    <p style={{textAlign:'center', color:'#666'}}>Your past transactions.</p>
                    
                    <div style={notifItem}>
                        <div style={{fontWeight:'bold'}}>✅ Purchased: 5L Milk</div>
                        <div style={{fontSize:'12px', color:'#555'}}>From: Lakshmi Dairy | ₹300</div>
                        <div style={{fontSize:'10px', color:'#999', marginTop:'2px'}}>Dec 10, 2025</div>
                    </div>
                </div>
            </div>
        );
    }

    // --- VIEW 6: NOTIFICATIONS --- 
    if (activeView === 'notifs') {
        return (
            <div style={pageStyle}>
                <NotificationBar />
                <div style={subPageCard}>
                    <button onClick={() => setActiveView('menu')} style={backBtn}>⬅ Back to Menu</button>
                    <h2 style={sectionTitle}>🔔 Notifications</h2>
                    
                    <div style={notifItem}>
                        <div style={{fontWeight:'bold'}}>🟢 HIRE REQUEST ACCEPTED</div>
                        <div style={{fontSize:'12px', color:'#555'}}>Raju Tractors confirmed your booking for tomorrow at 8 AM.</div>
                    </div>
                    <div style={notifItem}>
                        <div style={{fontWeight:'bold'}}>⭐ NEW RATING</div>
                        <div style={{fontSize:'12px', color:'#555'}}>You received a 5-star rating for your Farm Fresh delivery.</div>
                    </div>
                    <div style={{textAlign:'center', color:'#999', marginTop:'40px'}}>No new notifications.</div>
                    
                </div>
            </div>
        );
    }

    // --- VIEW 7: SETTINGS ---
    if (activeView === 'settings') {
        return (
            <div style={pageStyle}>
                <NotificationBar />
                <div style={subPageCard}>
                    <button onClick={() => setActiveView('menu')} style={backBtn}>⬅ Back to Menu</button>
                    <h2 style={sectionTitle}>⚙️ Settings</h2>
                    
                    <div style={settingsItem}>
                        <div>Language</div>
                        <select style={{padding:'8px', borderRadius:'6px', border:'1px solid #ccc'}}>
                            <option>English</option>
                            <option>Telugu</option>
                            <option>Hindi</option>
                        </select>
                    </div>

                    <div style={settingsItem}>
                        <div style={{fontWeight:'bold'}}>Privacy Policy</div>
                        <span style={arrow}>›</span>
                    </div>

                    <div style={settingsItem}>
                        <div style={{fontWeight:'bold'}}>App Version</div>
                        <span>1.0.0</span>
                    </div>

                    <button onClick={handleLogout} style={logoutBtn}>Log Out</button>
                </div>
            </div>
        );
    }

    return null;
}

export default Profile;