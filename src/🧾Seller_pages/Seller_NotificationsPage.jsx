import React from 'react';
import { useNavigate } from 'react-router-dom';

function Seller_NotificationsPage() {
    const navigate = useNavigate();

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
            
            {/* Header with Back Button */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '15px' }}>
                <div 
                    onClick={() => navigate('/Seller_HomePage')} 
                    style={{ cursor: 'pointer', fontSize: '24px', backgroundColor: '#fff', width: '40px', height: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '50%', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
                >
                    ⬅️
                </div>
                <h1 style={{ margin: 0, fontSize: '22px', color: '#2c3e50' }}>Notifications</h1>
            </div>

            <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                <p style={{ textAlign: 'center', color: '#7f8c8d' }}>You have no new notifications.</p>
            </div>
        </div>
    );
}

export default Seller_NotificationsPage;