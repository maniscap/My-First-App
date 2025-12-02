import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [bgImage, setBgImage] = useState('');
  
  // Background Logic
  const dayBg = 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2940&auto=format&fit=crop';
  const nightBg = 'https://images.unsplash.com/photo-1509773896068-7fd415d91e2e?q=80&w=2940&auto=format&fit=crop';

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 18 || hour < 6) setBgImage(nightBg);
    else setBgImage(dayBg);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) setUser(currentUser);
      else navigate('/login');
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try { await signOut(auth); navigate('/'); } catch (error) { console.error(error); }
  };

  return (
    <div style={{...pageStyle, backgroundImage: `url('${bgImage}')`}}>
      
      {/* Back Button */}
      <Link to="/dashboard" style={backBtn}>⬅ Dashboard</Link>

      <div style={glassContainer}>
        
        {/* HEADER SECTION */}
        <div style={profileHeader}>
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Profile" style={avatarStyle} />
          ) : (
             // Simple Turban Icon
            <div style={avatarPlaceholder}>👳🏾‍♂️</div>
          )}
          <div>
            <h2 style={{margin: '0', color: '#1B5E20'}}>{user?.displayName || "Farm Partner"}</h2>
            <p style={{margin: '0', fontSize: '14px', color: '#555'}}>{user?.email}</p>
            <span style={badgeStyle}>✅ Verified Farmer</span>
          </div>
        </div>

        <hr style={{border: '0', borderTop: '1px solid #ddd', margin: '20px 0'}} />

        {/* MENU OPTIONS */}
        <div style={menuList}>
            
            {/* Option 1 */}
            <div style={menuItem}>
                <div style={iconBox}>🚜</div>
                <div style={{flex:1}}>
                    <h4 style={menuTitle}>My Listings</h4>
                    <p style={menuDesc}>Manage your crops & machinery posts</p>
                </div>
                <div style={arrow}>›</div>
            </div>

            {/* Option 2 */}
            <div style={menuItem}>
                <div style={iconBox}>📍</div>
                <div style={{flex:1}}>
                    <h4 style={menuTitle}>My Addresses</h4>
                    <p style={menuDesc}>Saved farm locations</p>
                </div>
                <div style={arrow}>›</div>
            </div>

            {/* Option 3 */}
            <div style={menuItem}>
                <div style={iconBox}>⚙️</div>
                <div style={{flex:1}}>
                    <h4 style={menuTitle}>Settings</h4>
                    <p style={menuDesc}>Language, Notifications, Privacy</p>
                </div>
                <div style={arrow}>›</div>
            </div>

        </div>

        {/* LOGOUT BUTTON */}
        <button onClick={handleLogout} style={logoutBtn}>🚪 Log Out</button>

      </div>
    </div>
  );
}

// STYLES
const pageStyle = { minHeight: '100vh', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed', padding: '20px', backgroundColor: 'black', display: 'flex', flexDirection: 'column', alignItems: 'center' };
const backBtn = { position: 'absolute', top: '20px', left: '20px', textDecoration: 'none', color: 'white', background: 'rgba(0,0,0,0.5)', padding: '8px 15px', borderRadius: '20px', fontSize: '14px', backdropFilter: 'blur(5px)', zIndex: 10 };

const glassContainer = { width: '100%', maxWidth: '400px', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(15px)', borderRadius: '20px', padding: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', marginTop: '60px' };

const profileHeader = { display: 'flex', alignItems: 'center', gap: '15px' };
const avatarStyle = { width: '60px', height: '60px', borderRadius: '50%', border: '2px solid #1B5E20' };
const avatarPlaceholder = { fontSize: '40px', width: '60px', height: '60px', background: '#eee', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const badgeStyle = { display: 'inline-block', fontSize: '12px', background: '#e8f5e9', color: '#2e7d32', padding: '2px 8px', borderRadius: '10px', marginTop: '5px', fontWeight: 'bold' };

const menuList = { display: 'flex', flexDirection: 'column', gap: '15px' };
const menuItem = { display: 'flex', alignItems: 'center', gap: '15px', padding: '10px', borderRadius: '10px', cursor: 'pointer', transition: '0.2s', backgroundColor: 'white', border: '1px solid #eee' };
const iconBox = { width: '40px', height: '40px', background: '#f1f8e9', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' };
const menuTitle = { margin: '0', fontSize: '16px', color: '#333' };
const menuDesc = { margin: '0', fontSize: '12px', color: '#888' };
const arrow = { color: '#ccc', fontSize: '20px', fontWeight: 'bold' };

const logoutBtn = { width: '100%', marginTop: '30px', padding: '12px', background: '#ffebee', color: '#d32f2f', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' };

export default Profile;