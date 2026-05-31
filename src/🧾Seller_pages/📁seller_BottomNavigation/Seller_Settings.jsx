import React from 'react';

function Seller_Settings() {
    return (
        <div style={{ padding: '20px', backgroundColor: '#f4f7f6', minHeight: '100vh', paddingBottom: '100px' }}>
            <h1 style={{ fontSize: '24px', color: '#2c3e50', marginBottom: '20px' }}>⚙️ Settings</h1>
            
            <div style={{ display: 'grid', gap: '15px' }}>
                <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '16px', color: '#2c3e50', fontWeight: 'bold' }}>👤 Account Settings</span>
                    <span style={{ color: '#95a5a6' }}>➔</span>
                </div>
                
                <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '16px', color: '#2c3e50', fontWeight: 'bold' }}>💳 Payment Methods</span>
                    <span style={{ color: '#95a5a6' }}>➔</span>
                </div>

                <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '16px', color: '#2c3e50', fontWeight: 'bold' }}>🚚 Shipping Options</span>
                    <span style={{ color: '#95a5a6' }}>➔</span>
                </div>
                
                <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '16px', color: '#e74c3c', fontWeight: 'bold' }}>🚪 Logout</span>
                </div>
            </div>
        </div>
    );
}

export default Seller_Settings;
