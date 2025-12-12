import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeView, setActiveView] = useState('menu'); // 'menu', 'personal', 'seller', 'listings', 'history', 'notifs', 'settings'
  const [loading, setLoading] = useState(true);
  
  // Data State
  const [profileData, setProfileData] = useState({
    name: '', phone: '', address: '', lat: null, lng: null, photo: '', sellerName: 'Unnamed Shop', rating: 4.8
  });

  // 1. Load User & Data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Load saved profile from Firestore
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfileData(prev => ({ ...prev, ...docSnap.data() }));
        } else {
          // Default to Google data if no profile exists
          setProfileData(prev => ({...prev, name: currentUser.displayName || 'New User', photo: currentUser.photoURL || prev.photo}));
        }
      } else {
        // Redirect to login if not authenticated
        // navigate('/login'); 
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  // 2. Helper: Save Data
  const saveData = async (newData = {}) => {
    if (!user) { alert("Authentication required to save."); return; }
    try {
      const updated = { ...profileData, ...newData };
      setProfileData(updated);
      await setDoc(doc(db, "users", user.uid), updated, { merge: true });
      // Go back to the main menu after saving personal/seller data
      if (activeView !== 'menu') setActiveView('menu'); 
    } catch (e) { alert("Error saving profile: " + e.message); }
  };

  // 3. Helper: Set Base Location (GPS)
  const setBaseLocation = () => {
    if (!navigator.geolocation) { alert("GPS not supported"); return; }
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
        const data = await response.json();
        // Construct detailed address: Village, District, State, Pincode (Mocked)
        const fullLoc = `${data.locality || data.city}, ${data.principalSubdivision}, 518002`;
        
        saveData({ address: fullLoc, lat: latitude, lng: longitude });
      } catch (error) { alert("GPS Address Failed"); }
    }, () => alert("Permission denied"), {enableHighAccuracy:true});
  };

  // 4. Helper: Share Location
  const shareLocation = () => {
    if (profileData.lat && profileData.lng) {
      const url = `https://www.google.com/maps?q=${profileData.lat},${profileData.lng}`;
      if (navigator.share) {
        navigator.share({ title: 'My Home Base Location', url: url });
      } else {
        navigator.clipboard.writeText(url);
        alert("🔗 Location Link Copied to Clipboard!");
      }
    } else {
      alert("Please set your GPS location first!");
    }
  };
  
  // 5. Photo Upload Handler
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) { alert("Photo must be under 1MB"); return; }
      const reader = new FileReader();
      reader.onloadend = () => saveData({ photo: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = async () => { await signOut(auth); navigate('/login'); };

  if (loading) return <div style={{color:'black', textAlign:'center', paddingTop:'50px'}}>Loading Profile...</div>;

  // --- VIEW 1: MAIN MENU (Control Center) ---
  if (activeView === 'menu') {
    return (
      <div style={pageStyle}>
        <div style={menuCard}>
          <div style={headerRow}>
            <button onClick={() => navigate('/dashboard')} style={closeBtn}>✕</button>
            <h2 style={{margin:0, color:'#2E7D32', fontSize:'22px', fontWeight:'800'}}>Control Center</h2>
            <div style={{width:'32px'}}></div>{/* Spacer */}
          </div>

          {/* User ID Card (Always visible at the top) */}
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
                <div style={menuDesc}>Personal details & Home Address</div>
              </div>
              <span style={arrow}>›</span>
            </button>

            <button onClick={() => setActiveView('seller')} style={menuItem}>
              <span style={iconStyle}>🏪</span>
              <div>
                <div style={menuTitle}>Seller Profile</div>
                <div style={menuDesc}>Shop setup, Ratings ({profileData.rating})</div>
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

            {/* NEW: Order History */}
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
        <div style={subPageCard}>
          <button onClick={() => setActiveView('menu')} style={backBtn}>⬅ Back to Menu</button>
          <h2 style={sectionTitle}>👤 Personal Details</h2>
          
          <div style={formGroup}>
            <label style={label}>Account Name</label>
            <input type="text" value={profileData.name} onChange={e=>setProfileData({...profileData, name:e.target.value})} style={input} />
          </div>
          
          <div style={formGroup}>
            <label style={label}>Phone Number</label>
            <input type="tel" placeholder="e.g. 919876543210" value={profileData.phone} onChange={e=>setProfileData({...profileData, phone:e.target.value})} style={input} />
          </div>

          <div style={gpsBox}>
            <label style={{...label, color:'#1976D2'}}>🏠 Home Base Address</label>
            <p style={{fontSize:'12px', color:'#333', marginBottom:'15px', fontWeight:'600'}}>
              Location: **{profileData.address || 'Not Set'}**
              <br/>
              GPS: {profileData.lat && profileData.lng ? 'Set' : 'Missing'}
            </p>
            <div style={{display:'flex', gap:'10px', marginBottom:'10px'}}>
              <input type="text" value={profileData.address || 'Set address via GPS'} readOnly style={{...input, flex:1, margin:0}} />
              <button onClick={setBaseLocation} style={actionBtn}>📍 Set GPS</button>
            </div>
            {profileData.address && 
              <button onClick={shareLocation} style={shareBtn}>🔗 Share This Location</button>
            }
            <p style={{fontSize:'10px', color:'#666', marginTop:'10px'}}>This location is automatically used for nearby search and directions.</p>
          </div>

          <button onClick={() => saveData()} style={mainSaveBtn}>💾 Save Personal Profile</button>
        </div>
      </div>
    );
  }

  // --- VIEW 3: SELLER PROFILE ---
  if (activeView === 'seller') {
    return (
      <div style={pageStyle}>
        <div style={subPageCard}>
          <button onClick={() => setActiveView('menu')} style={backBtn}>⬅ Back to Menu</button>
          <h2 style={sectionTitle}>🏪 Seller Profile</h2>
          
          <div style={{textAlign:'center', padding:'20px 0', borderBottom:'1px solid #eee', marginBottom:'20px'}}>
             <div style={{fontSize:'45px', color:'#FFC107', fontWeight:'900'}}>⭐ {profileData.rating}</div>
             <p style={{color:'#666', fontSize:'12px'}}>Average Rating (Based on 12 reviews)</p>
          </div>

          <div style={formGroup}>
            <label style={label}>Shop / Business Name (Public)</label>
            <input type="text" placeholder="e.g. Raju Tractors & Services" value={profileData.sellerName} onChange={e=>setProfileData({...profileData, sellerName:e.target.value})} style={input} />
          </div>

          <div style={{padding:'15px', background:'#e8f5e9', borderRadius:'10px', fontSize:'12px', color:'#2e7d32', border:'1px solid #c8e6c9'}}>
            <strong style={{fontWeight:'bold'}}>💡 Info:</strong> Your listings (crops, machines) will use this name and your **Home Base GPS** for location filtering.
          </div>

          <button onClick={() => saveData()} style={mainSaveBtn}>Update Seller Profile</button>
        </div>
      </div>
    );
  }
  
  // --- VIEW 4: MY LISTINGS ---
  if (activeView === 'listings') {
    return (
      <div style={pageStyle}>
        <div style={subPageCard}>
          <button onClick={() => setActiveView('menu')} style={backBtn}>⬅ Back to Menu</button>
          <h2 style={sectionTitle}>📋 My Listings</h2>
          <div style={{padding:'15px', background:'#fff3e0', borderRadius:'10px', marginBottom:'20px', fontSize:'13px', color:'#E65100', border:'1px solid #ffcc80'}}>
            Feature coming soon: Live status, Edit/Delete options, and Buyer inquiries will appear here.
          </div>
          
          <div style={listingItem}>
             <div style={{fontWeight:'bold', color:'#333'}}>Tractor (Model 550)</div>
             <div style={{fontSize:'12px'}}>Status: <span style={{color:'green', fontWeight:'bold'}}>Active</span> | Location: {profileData.address || 'Home Base'}</div>
             <div style={{marginTop:'10px'}}>
                <button style={listActionBtn}>Edit</button>
                <button style={{...listActionBtn, background:'#d32f2f'}}>Delete</button>
             </div>
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW 5: ORDER HISTORY (NEW) ---
  if (activeView === 'history') {
    return (
      <div style={pageStyle}>
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

// --- STYLES ---
const pageStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: '#f8f8f8', display:'flex', justifyContent:'center', overflowY:'auto' };
const menuCard = { width: '100%', maxWidth: '480px', background: '#fff', padding: '20px', minHeight: '100vh', boxSizing:'border-box', boxShadow:'0 0 10px rgba(0,0,0,0.05)' };
const subPageCard = { width: '100%', maxWidth: '480px', background: '#fff', padding: '20px', minHeight: '100vh', boxSizing:'border-box', boxShadow:'0 0 10px rgba(0,0,0,0.05)' };
const headerRow = { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'30px' };
const closeBtn = { background:'none', border:'none', fontSize:'24px', color:'#333', cursor:'pointer' };
const backBtn = { background:'none', border:'none', fontSize:'14px', color:'#555', cursor:'pointer', marginBottom:'20px', padding:0, fontWeight:'600' };
const sectionTitle = { margin:'0 0 25px 0', color:'#333', fontSize:'22px' };

const idCard = { display:'flex', alignItems:'center', background:'linear-gradient(135deg, #2E7D32, #4CAF50)', color:'white', padding:'25px', borderRadius:'18px', marginBottom:'30px', boxShadow:'0 6px 20px rgba(46, 125, 50, 0.4)', position:'relative' };
const avatarContainer = { width:'65px', height:'65px', borderRadius:'50%', background:'white', marginRight:'15px', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', flexShrink:0, position:'relative' };
const avatarImg = { width:'100%', height:'100%', objectFit:'cover' };
const avatarLargeContainer = { width:'100px', height:'100px', borderRadius:'50%', background:'white', margin:'0 auto 10px', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', border:'3px solid #2E7D32' };

const miniUploadBtn = { position:'absolute', bottom:0, right:0, background:'#fff', color:'#333', borderRadius:'50%', width:'20px', height:'20px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', cursor:'pointer', border:'1px solid #ddd' };
const uploadBtn = { color:'#2196F3', fontSize:'14px', fontWeight:'bold', cursor:'pointer' };

const menuGrid = { display:'flex', flexDirection:'column', gap:'12px' };
const menuItem = { display:'flex', alignItems:'center', background:'#fff', border:'1px solid #f0f0f0', padding:'18px', borderRadius:'15px', cursor:'pointer', textAlign:'left', boxShadow:'0 4px 10px rgba(0,0,0,0.05)' };
const iconStyle = { fontSize:'28px', marginRight:'15px', width:'30px', flexShrink:0 };
const menuTitle = { fontWeight:'700', fontSize:'16px', color:'#333' };
const menuDesc = { fontSize:'12px', color:'#888', marginTop:'2px' };
const arrow = { marginLeft:'auto', fontSize:'20px', color:'#ccc' };

const formGroup = { marginBottom:'20px' };
const label = { display:'block', fontSize:'13px', fontWeight:'600', color:'#555', marginBottom:'8px' };
const input = { width:'100%', padding: '14px 12px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '15px', boxSizing: 'border-box' };
const gpsBox = { background:'#f3f8fe', padding:'15px', borderRadius:'15px', marginBottom:'20px', border:'1px solid #b3d4fc' };
const actionBtn = { background:'#1976D2', color:'white', border:'none', padding:'12px 18px', borderRadius:'10px', cursor:'pointer', fontWeight:'bold', fontSize:'15px' };
const shareBtn = { width:'100%', background:'#fff', color:'#1976D2', border:'1px solid #1976D2', padding:'10px', borderRadius:'10px', cursor:'pointer', fontWeight:'bold', marginTop:'5px' };
const mainSaveBtn = { width:'100%', background:'#2E7D32', color:'white', border:'none', padding:'16px', borderRadius:'12px', fontSize:'17px', fontWeight:'bold', cursor:'pointer', marginTop:'10px' };
const logoutBtn = { width:'100%', background:'#d32f2f', color:'white', border:'none', padding:'16px', borderRadius:'12px', fontSize:'17px', fontWeight:'bold', cursor:'pointer', marginTop:'30px' };

const listActionBtn = { background:'#FF9800', color:'white', border:'none', padding:'8px 12px', borderRadius:'8px', cursor:'pointer', fontSize:'13px', marginRight:'10px' };
const listingItem = { padding:'15px', border:'1px solid #f0f0f0', borderRadius:'12px', background:'#fff', marginBottom:'10px' };
const notifItem = { padding:'15px', border:'1px solid #e0e0e0', borderRadius:'12px', background:'#fff', marginBottom:'10px', borderLeft:'4px solid #FFC107' };
const settingsItem = { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'15px 0', borderBottom:'1px solid #f0f0f0' };

export default Profile;