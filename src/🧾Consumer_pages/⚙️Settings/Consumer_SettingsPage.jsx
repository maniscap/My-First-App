import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';

// --- STYLING HELPERS (Extracted from Consumer_Profile.jsx) ---
const pageStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'var(--bg-color)', display:'flex', justifyContent:'center', overflowY:'auto' };
const subPageCard = { width: '100%', maxWidth: '480px', background: 'var(--card-color)', padding: '20px', minHeight: '100vh', boxSizing:'border-box', boxShadow:'0 0 10px rgba(0,0,0,0.05)' };
const backBtn = { background:'none', border:'none', fontSize:'14px', color:'var(--subtle-text)', cursor:'pointer', marginBottom:'20px', padding:0, fontWeight:'600' };
const sectionTitle = { margin:'0 0 25px 0', color:'var(--text-color)', fontSize:'22px' };

const settingsItem = { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'15px 0', borderBottom:'1px solid var(--border-color)', color: 'var(--text-color)' };
const logoutBtn = { width:'100%', background:'#d32f2f', color:'white', border:'none', padding:'16px', borderRadius:'12px', fontSize:'17px', fontWeight:'bold', cursor:'pointer', marginTop:'30px' };
const arrow = { marginLeft:'auto', fontSize:'20px', color:'var(--subtle-text)' };


function Consumer_SettingsPage({ NotificationBar, handleLogout }) {
    const navigate = useNavigate();
    
    // NOTE: Language state management can be implemented here later.
    
    const doLogout = () => {
        if (handleLogout) {
            handleLogout();
        } else {
            const auth = getAuth();
            signOut(auth).then(() => {
                navigate('/login');
            }).catch((err) => console.error("Logout Error:", err));
        }
    };

    return (
        <div style={pageStyle}>
            {NotificationBar && <NotificationBar />}
            <div style={subPageCard}>
                <button onClick={() => navigate(-1)} style={backBtn}>⬅ Back</button>
                <h2 style={sectionTitle}>⚙️ Settings</h2>
                
                <div style={settingsItem}>
                    <div>Language</div>
                    <select style={{padding:'8px', borderRadius:'6px', border:'1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)'}}>
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

                {/* Triggers either passed prop or direct Firebase logout */}
                <button onClick={doLogout} style={logoutBtn}>Log Out</button>
            </div>
        </div>
    );
}

export default Consumer_SettingsPage;