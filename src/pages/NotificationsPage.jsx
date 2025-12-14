import React from 'react';
// Note: We use the Profile's setActiveView function to return to the main menu.

// --- STYLING HELPERS (Extracted from Profile.jsx) ---
const pageStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: '#f8f8f8', display:'flex', justifyContent:'center', overflowY:'auto' };
const subPageCard = { width: '100%', maxWidth: '480px', background: '#fff', padding: '20px', minHeight: '100vh', boxSizing:'border-box', boxShadow:'0 0 10px rgba(0,0,0,0.05)' };
const backBtn = { background:'none', border:'none', fontSize:'14px', color:'#555', cursor:'pointer', marginBottom:'20px', padding:0, fontWeight:'600' };
const sectionTitle = { margin:'0 0 25px 0', color:'#333', fontSize:'22px' };
const notifItem = { padding:'15px', border:'1px solid #e0e0e0', borderRadius:'12px', background:'#fff', marginBottom:'10px', borderLeft:'4px solid #FFC107' };

function NotificationsPage({ setActiveView, NotificationBar }) {
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
                
                {/* Future implementation will involve complex state management here */}
            </div>
        </div>
    );
}

export default NotificationsPage;