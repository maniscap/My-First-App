import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore'; 
import { useUserMode } from '../../UserModeContext';
import BrandedTransition3D from '../../🛠️Shared_Components/BrandedTransition3D';

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
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start' 
};

// Menu card background set to match page background for smooth transition
const menuCard = { width: '100%', maxWidth: '480px', background: '#f8f8f8', padding: '20px', minHeight: '100%', boxSizing:'border-box', display: 'flex', flexDirection: 'column' };

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

const idCard = { display:'flex', alignItems:'center', background:'linear-gradient(135deg, #2E7D32, #4CAF50)', color:'white', padding:'30px', borderRadius:'15px', marginBottom:'35px', boxShadow:'0 8px 25px rgba(46, 125, 50, 0.5)', position:'relative' };

const avatarContainer = { width:'70px', height:'70px', borderRadius:'50%', background:'white', marginRight:'18px', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', flexShrink:0, position:'relative' };
const avatarImg = { width:'100%', height:'100%', objectFit:'cover' };

const miniUploadBtn = { position:'absolute', bottom:0, right:0, background:'#FFC107', color:'#333', borderRadius:'50%', width:'24px', height:'24px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', cursor:'pointer', border:'2px solid #fff' };

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


// --- MAIN PROFILE COMPONENT ---
function Consumer_Profile() {
    const navigate = useNavigate(); 
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [isSaving, setIsSaving] = useState(false);
    
    // Sub-Page Navigation
    const [activeSubPage, setActiveSubPage] = useState(null); // 'address' or null
    const [detecting, setDetecting] = useState(false);

    const { toggleUserMode } = useUserMode();
    const [isTransforming, setIsTransforming] = useState(false);

    const handleSwitchToSeller = () => {
        setIsTransforming(true);
        setTimeout(() => {
            toggleUserMode();
            navigate('/Seller_HomePage');
        }, 3500);
    };

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

    // --- Geolocation & Reverse Geocoding via OSM Nominatim ---
    const handleDetectLocation = () => {
        if (!navigator.geolocation) {
            showNotification("GPS not supported by your browser.", "error");
            return;
        }

        setDetecting(true);
        showNotification("Fetching GPS coordinates...", "loading");

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                
                try {
                    // Fetch reverse geocode details from OpenStreetMap Nominatim API
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
                        { headers: { 'User-Agent': 'FarmCap-App/1.0' } }
                    );
                    const data = await response.json();
                    
                    if (data && data.address) {
                        const addr = data.address;
                        
                        // Smart address mapping from Nominatim's response
                        const pincode = addr.postcode || '';
                        const state = addr.state || '';
                        const locality = addr.village || addr.suburb || addr.neighbourhood || addr.road || addr.hamlet || '';
                        const city = addr.city || addr.town || addr.municipality || addr.state_district || '';
                        const building = addr.building || addr.amenity || addr.house_number || addr.residential || '';
                        const landmark = addr.attraction || addr.natural || addr.tourism || '';

                        setProfileData(prev => ({
                            ...prev,
                            homeAddress: {
                                ...prev.homeAddress,
                                lat: parseFloat(latitude.toFixed(6)),
                                lng: parseFloat(longitude.toFixed(6)),
                                pincode,
                                state,
                                locality,
                                city,
                                building,
                                landmark
                            }
                        }));
                        showNotification("Location detected successfully! 📍", "success");
                    } else {
                        // Fallback: Just update lat/lng
                        setProfileData(prev => ({
                            ...prev,
                            homeAddress: {
                                ...prev.homeAddress,
                                lat: parseFloat(latitude.toFixed(6)),
                                lng: parseFloat(longitude.toFixed(6))
                            }
                        }));
                        showNotification("Coordinates detected. Failed to retrieve address labels.", "warning");
                    }
                } catch (error) {
                    console.error("OSM Geocoding Error:", error);
                    setProfileData(prev => ({
                        ...prev,
                        homeAddress: {
                            ...prev.homeAddress,
                            lat: parseFloat(latitude.toFixed(6)),
                            lng: parseFloat(longitude.toFixed(6))
                        }
                    }));
                    showNotification("Coordinates saved. Nominatim API unreachable.", "warning");
                } finally {
                    setDetecting(false);
                }
            },
            (error) => {
                console.error("GPS Access Error:", error);
                showNotification(`GPS Access Denied: ${error.message}`, "error");
                setDetecting(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    // --- Data Loading Logic (Improved Error Handling) ---
    useEffect(() => { 
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                try {
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
                } catch (err) {
                    console.error("Firestore Permission Error:", err);
                    setProfileData(prev => ({...prev, name: currentUser.displayName || 'New User'}));
                    showNotification("Database permission required (Check Rules)", 'error');
                }
            }
            setLoading(false);
        });
        return () => unsubscribe(); 
    }, [navigate]);

    const saveData = async (newData = {}) => { 
        if (!user) { showNotification("Authentication required to save.", 'error'); return; }

        setIsSaving(true);
        showNotification("Saving to Cloud...", 'loading');

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
            
            showNotification("Profile saved successfully! 🎉", 'success');
        } catch (e) { 
            showNotification("Error saving (Check Permissions): " + e.message, 'error'); 
        } finally {
            setIsSaving(false);
        }
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

    if (loading) {
        return (
            <div style={pageStyle}>
                <div style={{...menuCard, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <div style={{color:'#666', fontSize:'18px', fontWeight: 'bold'}}>Loading Profile...</div>
                </div>
            </div>
        );
    }

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

    const inputStyle = {
        width: '100%',
        padding: '12px 14px',
        borderRadius: '10px',
        border: '1px solid #ddd',
        fontSize: '14px',
        boxSizing: 'border-box',
        outline: 'none',
        background: '#fff',
        color: '#333',
        marginTop: '5px'
    };

    // --- SWAP TO GPS ADDRESS SUB-PAGE IF ACTIVE ---
    if (activeSubPage === 'address') {
        return (
            <div style={pageStyle}>
                <NotificationBar />
                
                {/* CSS keyframe injected directly for animation */}
                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>

                <div style={subPageCard}>
                    <button onClick={() => setActiveSubPage(null)} style={backBtn}>⬅ Back to Control Center</button>
                    
                    <h2 style={{ ...sectionTitle, marginBottom: '6px' }}>📍 Delivery Address & GPS</h2>
                    <p style={{ color: '#666', fontSize: '13px', lineHeight: '1.4', marginBottom: '25px' }}>
                        Provide your delivery address and precise coordinates. To guarantee maximum privacy, this data is <strong>only</strong> shared with the specific seller when you express interest in renting or purchasing their items.
                    </p>

                    {/* Auto-Detect GPS Button */}
                    <button 
                        onClick={handleDetectLocation} 
                        disabled={detecting}
                        style={{
                            width: '100%',
                            padding: '14px',
                            background: 'linear-gradient(135deg, #1E88E5, #1565C0)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontWeight: 'bold',
                            fontSize: '15px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            boxShadow: '0 4px 15px rgba(21, 101, 192, 0.3)',
                            marginBottom: '25px',
                            transition: 'all 0.2s ease',
                            opacity: detecting ? 0.8 : 1
                        }}
                    >
                        {detecting ? (
                            <>
                                <svg 
                                    style={{
                                        animation: 'spin 1s linear infinite', 
                                        width: '18px', 
                                        height: '18px', 
                                        fill: 'none', 
                                        stroke: 'currentColor', 
                                        strokeWidth: '3'
                                    }} 
                                    viewBox="0 0 24 24"
                                >
                                    <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="8" />
                                </svg>
                                Detecting Location...
                            </>
                        ) : (
                            <>📍 Auto-Detect Location (GPS)</>
                        )}
                    </button>

                    {/* Form Layout */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div>
                            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555' }}>Receiver Name</label>
                            <input 
                                type="text" 
                                value={profileData.name} 
                                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })} 
                                placeholder="Receiver's full name" 
                                style={inputStyle} 
                            />
                        </div>

                        <div>
                            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555' }}>Primary Phone Number</label>
                            <input 
                                type="tel" 
                                value={profileData.phone} 
                                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })} 
                                placeholder="Phone number (e.g. +91 9876543210)" 
                                style={inputStyle} 
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555' }}>House / Field No</label>
                                <input 
                                    type="text" 
                                    value={profileData.homeAddress.building} 
                                    onChange={(e) => setProfileData({
                                        ...profileData,
                                        homeAddress: { ...profileData.homeAddress, building: e.target.value }
                                    })} 
                                    placeholder="e.g. House 42" 
                                    style={inputStyle} 
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555' }}>Landmark</label>
                                <input 
                                    type="text" 
                                    value={profileData.homeAddress.landmark} 
                                    onChange={(e) => setProfileData({
                                        ...profileData,
                                        homeAddress: { ...profileData.homeAddress, landmark: e.target.value }
                                    })} 
                                    placeholder="e.g. Near Big Well" 
                                    style={inputStyle} 
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555' }}>Village / Locality</label>
                            <input 
                                type="text" 
                                value={profileData.homeAddress.locality} 
                                onChange={(e) => setProfileData({
                                    ...profileData,
                                    homeAddress: { ...profileData.homeAddress, locality: e.target.value }
                                })} 
                                placeholder="Enter village or locality name" 
                                style={inputStyle} 
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555' }}>Town / Nearest City</label>
                                <input 
                                    type="text" 
                                    value={profileData.homeAddress.city} 
                                    onChange={(e) => setProfileData({
                                        ...profileData,
                                        homeAddress: { ...profileData.homeAddress, city: e.target.value }
                                    })} 
                                    placeholder="City/Town" 
                                    style={inputStyle} 
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555' }}>State</label>
                                <input 
                                    type="text" 
                                    value={profileData.homeAddress.state} 
                                    onChange={(e) => setProfileData({
                                        ...profileData,
                                        homeAddress: { ...profileData.homeAddress, state: e.target.value }
                                    })} 
                                    placeholder="State" 
                                    style={inputStyle} 
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555' }}>Pincode</label>
                            <input 
                                type="text" 
                                value={profileData.homeAddress.pincode} 
                                onChange={(e) => setProfileData({
                                    ...profileData,
                                    homeAddress: { ...profileData.homeAddress, pincode: e.target.value }
                                })} 
                                placeholder="6-digit PIN code" 
                                style={inputStyle} 
                            />
                        </div>

                        {/* Read-Only Coordinates */}
                        <div>
                            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                🔒 Precise Coordinates (Auto-Locked)
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <input 
                                    type="text" 
                                    readOnly 
                                    value={profileData.homeAddress.lat !== null ? `Lat: ${profileData.homeAddress.lat}` : ''} 
                                    placeholder="Latitude" 
                                    style={{ ...inputStyle, background: '#f5f5f5', cursor: 'not-allowed', color: '#666', border: '1px solid #ccc' }} 
                                />
                                <input 
                                    type="text" 
                                    readOnly 
                                    value={profileData.homeAddress.lng !== null ? `Lng: ${profileData.homeAddress.lng}` : ''} 
                                    placeholder="Longitude" 
                                    style={{ ...inputStyle, background: '#f5f5f5', cursor: 'not-allowed', color: '#666', border: '1px solid #ccc' }} 
                                />
                            </div>
                        </div>

                        {/* Save Button */}
                        <button 
                            onClick={() => saveData()} 
                            disabled={isSaving}
                            style={{
                                width: '100%',
                                padding: '15px',
                                backgroundColor: '#2E7D32',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontWeight: 'bold',
                                fontSize: '16px',
                                cursor: 'pointer',
                                marginTop: '10px',
                                boxShadow: '0 4px 15px rgba(46, 125, 50, 0.3)',
                                transition: 'all 0.2s ease',
                                opacity: isSaving ? 0.8 : 1
                            }}
                        >
                            {isSaving ? "Saving..." : "Save Delivery Profile 💾"}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={pageStyle}>
            <NotificationBar />
            <div style={menuCard}>
                <div style={headerRow}>
                    <button onClick={() => navigate('/Consumer_HomePage')} style={closeBtn}>✕</button>
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
                    <button 
                        onClick={() => setActiveSubPage('address')} 
                        style={menuItem}
                    >
                        <span style={iconStyle}>📍</span>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={menuTitle}>Delivery Address & GPS</span>
                            <span style={menuDesc}>Configure your precise location details for direct seller routing</span>
                        </div>
                        <span style={arrow}>›</span>
                    </button>

                    <button 
                        onClick={handleLogout} 
                        style={{ ...menuItem, border: '1px solid rgba(244, 67, 54, 0.2)', background: 'rgba(244, 67, 54, 0.03)' }}
                    >
                        <span style={iconStyle}>🚪</span>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ ...menuTitle, color: '#D32F2F' }}>Sign Out</span>
                            <span style={menuDesc}>Disconnect from your account securely</span>
                        </div>
                        <span style={arrow}>›</span>
                    </button>
                </div>

                {/* BOTTOM ACTION SWITCH BUTTON */}
                <button
                    onClick={handleSwitchToSeller}
                    style={{
                        width: '100%',
                        padding: '16px',
                        background: 'linear-gradient(135deg, #2c3e50, #1a252f)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontWeight: '800',
                        fontSize: '15px',
                        cursor: 'pointer',
                        marginTop: 'auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        boxShadow: '0 4px 15px rgba(44, 62, 80, 0.25)',
                        transition: 'all 0.2s ease',
                        marginBottom: '10px'
                    }}
                >
                    Switch to Seller Mode 💼
                </button>
            </div>

            {/* SLEEK BRANDED WORKSPACE TRANSFORMATION OVERLAY */}
            <BrandedTransition3D isVisible={isTransforming} targetMode="seller" />
        </div>
    );
}

export default Consumer_Profile;