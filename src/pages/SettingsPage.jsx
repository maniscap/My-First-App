import React from 'react';

// --- STYLING HELPERS (Extracted from Profile.jsx) ---
const pageStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: '#f8f8f8', display:'flex', justifyContent:'center', overflowY:'auto' };
const subPageCard = { width: '100%', maxWidth: '480px', background: '#fff', padding: '20px', minHeight: '100vh', boxSizing:'border-box', boxShadow:'0 0 10px rgba(0,0,0,0.05)' };
const backBtn = { background:'none', border:'none', fontSize:'14px', color:'#555', cursor:'pointer', marginBottom:'20px', padding:0, fontWeight:'600' };
const sectionTitle = { margin:'0 0 25px 0', color:'#333', fontSize:'22px' };

const settingsItem = { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'15px 0', borderBottom:'1px solid #f0f0f0' };
const logoutBtn = { width:'100%', background:'#d32f2f', color:'white', border:'none', padding:'16px', borderRadius:'12px', fontSize:'17px', fontWeight:'bold', cursor:'pointer', marginTop:'30px' };
const arrow = { marginLeft:'auto', fontSize:'20px', color:'#ccc' };


function SettingsPage({ setActiveView, NotificationBar, handleLogout }) {
    
    // NOTE: Language state management can be implemented here later.
    
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

                {/* The handleLogout function is passed down from Profile.jsx as a prop */}
                <button onClick={handleLogout} style={logoutBtn}>Log Out</button>
            </div>
        </div>
    );
}

export default SettingsPage;