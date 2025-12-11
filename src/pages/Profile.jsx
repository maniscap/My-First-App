import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeView, setActiveView] = useState('menu'); // 'menu', 'personal', 'seller', 'listings', 'notifs', 'settings'
  const [loading, setLoading] = useState(true);
  
  // Data State
  const [profileData, setProfileData] = useState({
    name: '', phone: '', address: '', lat: null, lng: null, photo: '', sellerName: '', rating: 4.8
  });

  // 1. Load User & Data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) setProfileData(docSnap.data());
        else setProfileData(prev => ({...prev, name: currentUser.displayName || ''}));
      } else {
        navigate('/login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  // 2. Helper: Save Data
  const saveData = async (newData) => {
    if (!user) return;
    try {
      const updated = { ...profileData, ...newData };
      setProfileData(updated);
      await setDoc(doc(db, "users", user.uid), updated, { merge: true });
      alert("✅ Saved Successfully!");
    } catch (e) { alert("Error saving."); }
  };

  // 3. Helper: Share Location
  const shareLocation = () => {
    if (profileData.lat && profileData.lng) {
      const url = `https://www.google.com/maps?q=${profileData.lat},${profileData.lng}`;
      if (navigator.share) {
        navigator.share({ title: 'My Farm Location', url: url });
      } else {
        navigator.clipboard.writeText(url);
        alert("📍 Location Link Copied to Clipboard!");
      }
    } else {
      alert("Please set your GPS location first!");
    }
  };

  const handleLogout = async () => { await signOut(auth); navigate('/login'); };

  if (loading) return <div style={{color:'white', textAlign:'center', paddingTop:'50px'}}>Loading...</div>;

  // --- VIEW 1: MAIN MENU (Control Center) ---
  if (activeView === 'menu') {
    return (
      <div style={pageStyle}>
        <div style={menuCard}>
          <div style={headerRow}>
            <Link to="/dashboard" style={closeBtn}>✕</Link>
            <h2 style={{margin:0, color:'#2E7D32'}}>Control Center</h2>
            <div style={{width:'30px'}}></div>{/* Spacer */}
          </div>

          {/* User ID Card */}
          <div style={idCard}>
            <img src={profileData.photo || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} style={avatarSmall} alt="Profile" />
            <div>
              <div style={{fontWeight:'bold', fontSize:'18px'}}>{profileData.name || "Farmer"}</div>
              <div style={{fontSize:'12px', opacity:0.8}}>{user?.email || user?.phoneNumber}</div>
            </div>
          </div>

          {/* MENU OPTIONS */}
          <div style={menuGrid}>
            <button onClick={() => setActiveView('personal')} style={menuItem}>
              <span style={iconStyle}>👤</span>
              <div>
                <div style={menuTitle}>My Profile</div>
                <div style={menuDesc}>Personal details & Address</div>
              </div>
              <span style={arrow}>›</span>
            </button>

            <button onClick={() => setActiveView('seller')} style={menuItem}>
              <span style={iconStyle}>🏪</span>
              <div>
                <div style={menuTitle}>Seller Profile</div>
                <div style={menuDesc}>Shop settings & Ratings</div>
              </div>
              <span style={arrow}>›</span>
            </button>

            <button onClick={() => setActiveView('listings')} style={menuItem}>
              <span style={iconStyle}>📋</span>
              <div>
                <div style={menuTitle}>My Listings</div>
                <div style={menuDesc}>Manage your products</div>
              </div>
              <span style={arrow}>›</span>
            </button>

            <button onClick={() => setActiveView('notifs')} style={menuItem}>
              <span style={iconStyle}>🔔</span>
              <div>
                <div style={menuTitle}>Notifications</div>
                <div style={menuDesc}>Orders & Hiring requests</div>
              </div>
              <span style={arrow}>›</span>
            </button>

            <button onClick={() => setActiveView('settings')} style={menuItem}>
              <span style={iconStyle}>⚙️</span>
              <div>
                <div style={menuTitle}>Settings</div>
                <div style={menuDesc}>Language & Logout</div>
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
          <button onClick={() => setActiveView('menu')} style={backBtn}>⬅ Back</button>
          <h2 style={sectionTitle}>👤 My Personal Profile</h2>
          
          <div style={formGroup}>
            <label style={label}>Full Name</label>
            <input type="text" value={profileData.name} onChange={e=>setProfileData({...profileData, name:e.target.value})} style={input} />
          </div>
          
          <div style={formGroup}>
            <label style={label}>Phone Number</label>
            <input type="tel" value={profileData.phone} onChange={e=>setProfileData({...profileData, phone:e.target.value})} style={input} />
          </div>

          <div style={gpsBox}>
            <label style={{...label, color:'#1565C0'}}>🏠 Permanent Home/Garage Address</label>
            <p style={{fontSize:'11px', color:'#666', marginBottom:'5px'}}>Share this so tractors/workers can find you easily.</p>
            <div style={{display:'flex', gap:'5px', marginBottom:'10px'}}>
              <input type="text" value={profileData.address} readOnly placeholder="No GPS set" style={{...input, flex:1}} />
              <button onClick={() => {
                 if(!navigator.geolocation) return alert("No GPS");
                 navigator.geolocation.getCurrentPosition(async p => {
                   const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${p.coords.latitude}&longitude=${p.coords.longitude}&localityLanguage=en`);
                   const d = await res.json();
                   saveData({address: `${d.locality}, ${d.principalSubdivision}`, lat: p.coords.latitude, lng: p.coords.longitude});
                 });
              }} style={actionBtn}>📍 Set</button>
            </div>
            <button onClick={shareLocation} style={shareBtn}>🔗 Share My Location</button>
          </div>

          <button onClick={() => saveData({})} style={mainSaveBtn}>Save Changes</button>
        </div>
      </div>
    );
  }

  // --- VIEW 3: SELLER PROFILE ---
  if (activeView === 'seller') {
    return (
      <div style={pageStyle}>
        <div style={subPageCard}>
          <button onClick={() => setActiveView('menu')} style={backBtn}>⬅ Back</button>
          <h2 style={sectionTitle}>🏪 Seller Profile</h2>
          
          <div style={{textAlign:'center', padding:'20px 0'}}>
             <div style={{fontSize:'40px'}}>⭐ {profileData.rating || 4.8}</div>
             <p style={{color:'#666', fontSize:'12px'}}>Seller Rating (Based on 12 reviews)</p>
          </div>

          <div style={formGroup}>
            <label style={label}>Shop / Business Name</label>
            <input type="text" placeholder="e.g. Raju Tractors" value={profileData.sellerName} onChange={e=>setProfileData({...profileData, sellerName:e.target.value})} style={input} />
          </div>

          <div style={{padding:'15px', background:'#e8f5e9', borderRadius:'10px', fontSize:'12px', color:'#2e7d32'}}>
            <strong>💡 Tip:</strong> This name and rating will appear on your cards in the Business Zone. Listings will automatically use your Home Base location.
          </div>

          <button onClick={() => saveData({})} style={mainSaveBtn}>Update Seller Info</button>
        </div>
      </div>
    );
  }

  // --- VIEW 4: NOTIFICATIONS ---
  if (activeView === 'notifs') {
    return (
      <div style={pageStyle}>
        <div style={subPageCard}>
          <button onClick={() => setActiveView('menu')} style={backBtn}>⬅ Back</button>
          <h2 style={sectionTitle}>🔔 Notifications</h2>
          <div style={listContainer}>
            {/* Mock Data for UI */}
            <div style={notifItem}>
              <div style={{fontWeight:'bold'}}>🚜 Tractor Request</div>
              <div style={{fontSize:'12px'}}>User "Ramesh" wants to hire your tractor.</div>
              <div style={{marginTop:'5px'}}>
                <button style={acceptBtn}>Accept</button>
                <button style={declineBtn}>Decline</button>
              </div>
            </div>
            <div style={notifItem}>
              <div style={{fontWeight:'bold'}}>💰 Crop Sold</div>
              <div style={{fontSize:'12px'}}>Your "Cotton" listing was viewed 15 times today.</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW 5: SETTINGS ---
  if (activeView === 'settings') {
    return (
      <div style={pageStyle}>
        <div style={subPageCard}>
          <button onClick={() => setActiveView('menu')} style={backBtn}>⬅ Back</button>
          <h2 style={sectionTitle}>⚙️ Settings</h2>
          
          <div style={menuItem}>
            <div>Language</div>
            <select style={{padding:'5px'}}>
              <option>English</option>
              <option>Telugu</option>
              <option>Hindi</option>
            </select>
          </div>

          <div style={menuItem}>
            <div>Privacy Policy</div>
            <span>›</span>
          </div>

          <button onClick={handleLogout} style={{...mainSaveBtn, background:'#d32f2f', marginTop:'30px'}}>Log Out</button>
        </div>
      </div>
    );
  }

  // --- VIEW 6: MY LISTINGS (Placeholder) ---
  if (activeView === 'listings') {
    return (
      <div style={pageStyle}>
        <div style={subPageCard}>
          <button onClick={() => setActiveView('menu')} style={backBtn}>⬅ Back</button>
          <h2 style={sectionTitle}>📋 My Listings</h2>
          <p style={{textAlign:'center', color:'#666'}}>Your active products & services.</p>
          
          {/* Mock Listing */}
          <div style={listingItem}>
             <div style={{fontWeight:'bold', color:'#E65100'}}>Mahindra Tractor</div>
             <div style={{fontSize:'12px'}}>Status: <span style={{color:'green'}}>Active</span></div>
             <div style={{marginTop:'5px', fontSize:'12px'}}>
                <span style={{textDecoration:'underline', marginRight:'10px'}}>Edit</span>
                <span style={{color:'red'}}>Delete</span>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// --- STYLES ---
const pageStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: '#f0f2f5', display:'flex', justifyContent:'center', overflowY:'auto' };
const menuCard = { width: '100%', maxWidth: '450px', background: '#fff', padding: '20px', minHeight: '100vh', boxSizing:'border-box' };
const subPageCard = { width: '100%', maxWidth: '450px', background: '#fff', padding: '20px', minHeight: '100vh', boxSizing:'border-box' };
const headerRow = { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' };
const closeBtn = { textDecoration:'none', fontSize:'20px', color:'#333', fontWeight:'bold' };
const backBtn = { background:'none', border:'none', fontSize:'14px', color:'#555', cursor:'pointer', marginBottom:'15px', padding:0 };
const sectionTitle = { margin:'0 0 20px 0', color:'#333' };

const idCard = { display:'flex', alignItems:'center', background:'linear-gradient(135deg, #2E7D32, #4CAF50)', color:'white', padding:'20px', borderRadius:'15px', marginBottom:'25px', boxShadow:'0 4px 15px rgba(46, 125, 50, 0.3)' };
const avatarSmall = { width:'60px', height:'60px', borderRadius:'50%', marginRight:'15px', border:'2px solid white', objectFit:'cover' };

const menuGrid = { display:'flex', flexDirection:'column', gap:'15px' };
const menuItem = { display:'flex', alignItems:'center', background:'#fff', border:'1px solid #eee', padding:'15px', borderRadius:'12px', cursor:'pointer', textAlign:'left', boxShadow:'0 2px 5px rgba(0,0,0,0.05)' };
const iconStyle = { fontSize:'24px', marginRight:'15px' };
const menuTitle = { fontWeight:'bold', fontSize:'16px', color:'#333' };
const menuDesc = { fontSize:'12px', color:'#888' };
const arrow = { marginLeft:'auto', fontSize:'20px', color:'#ccc' };

const formGroup = { marginBottom:'15px' };
const label = { display:'block', fontSize:'12px', fontWeight:'bold', color:'#555', marginBottom:'5px' };
const input = { width:'100%', padding:'12px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'15px', boxSizing:'border-box' };
const gpsBox = { background:'#e3f2fd', padding:'15px', borderRadius:'10px', marginBottom:'20px', border:'1px solid #90caf9' };
const actionBtn = { background:'#1976D2', color:'white', border:'none', padding:'0 15px', borderRadius:'8px', cursor:'pointer', fontWeight:'bold' };
const shareBtn = { width:'100%', background:'white', color:'#1976D2', border:'1px solid #1976D2', padding:'10px', borderRadius:'8px', cursor:'pointer', fontWeight:'bold', marginTop:'5px' };
const mainSaveBtn = { width:'100%', background:'#2E7D32', color:'white', border:'none', padding:'15px', borderRadius:'10px', fontSize:'16px', fontWeight:'bold', cursor:'pointer' };

const listContainer = { display:'flex', flexDirection:'column', gap:'10px' };
const notifItem = { padding:'15px', border:'1px solid #eee', borderRadius:'10px', background:'#fafafa' };
const acceptBtn = { background:'#4CAF50', color:'white', border:'none', padding:'5px 15px', borderRadius:'5px', marginRight:'10px', cursor:'pointer' };
const declineBtn = { background:'#f44336', color:'white', border:'none', padding:'5px 15px', borderRadius:'5px', cursor:'pointer' };
const listingItem = { padding:'15px', border:'1px solid #eee', borderRadius:'10px', background:'#fff', borderLeft:'4px solid #E65100' };

export default Profile;