import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore'; 
import ModeSwitch from '../../🛠️Shared_Components/ModeSwitch';

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
                    // Don't block UI on error, just let them edit
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

                {/* SHARED SELLER MODE TOGGLE */}
                <ModeSwitch />

                {/* MENU OPTIONS GRID */}
                <div style={menuGrid}>
                    {/* Features have been temporarily removed so we can add them back one by one */}
                </div>
            </div>
        </div>
    );
}

export default Consumer_Profile;