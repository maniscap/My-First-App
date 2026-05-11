import React from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';

// --- STYLING HELPERS (Extracted from Profile.jsx) ---
const pageStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'var(--bg-color)', display:'flex', justifyContent:'center', overflowY:'auto' };
const subPageCard = { width: '100%', maxWidth: '480px', background: 'var(--card-color)', padding: '20px', minHeight: '100vh', boxSizing:'border-box', boxShadow:'0 0 10px rgba(0,0,0,0.05)' };
const backBtn = { background:'none', border:'none', fontSize:'14px', color:'var(--subtle-text)', cursor:'pointer', marginBottom:'20px', padding:0, fontWeight:'600' };
const sectionTitle = { margin:'0 0 25px 0', color:'var(--text-color)', fontSize:'22px' };
const notifItem = { padding:'15px', border:'1px solid var(--border-color)', borderRadius:'12px', background:'var(--card-color)', marginBottom:'10px', borderLeft:'4px solid var(--primary-color)' };

function NotificationsPage({ NotificationBar }) {
    const navigate = useNavigate();

    return (
        <div style={pageStyle}>
            {NotificationBar && <NotificationBar />}
            <div style={subPageCard}>
                <button onClick={() => navigate(-1)} style={backBtn}>⬅ Back</button>
                <h2 style={sectionTitle}>🔔 Notifications</h2>
                
                <div style={notifItem}>
                    <div style={{fontWeight:'bold', color: 'var(--text-color)'}}>🟢 HIRE REQUEST ACCEPTED</div>
                    <div style={{fontSize:'12px', color:'var(--subtle-text)'}}>Raju Tractors confirmed your booking for tomorrow at 8 AM.</div>
                </div>
                <div style={notifItem}>
                    <div style={{fontWeight:'bold', color: 'var(--text-color)'}}>⭐ NEW RATING</div>
                    <div style={{fontSize:'12px', color:'var(--subtle-text)'}}>You received a 5-star rating for your Farm Fresh delivery.</div>
                </div>
                <div style={{textAlign:'center', color:'var(--subtle-text)', marginTop:'40px'}}>No new notifications.</div>
                
                {/* Future implementation will involve complex state management here */}
            </div>
            
            <BottomNavigation />
        </div>
    );
}

export default NotificationsPage;