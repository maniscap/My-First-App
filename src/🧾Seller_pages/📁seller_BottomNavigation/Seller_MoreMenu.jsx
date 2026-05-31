import React from 'react';
import { Link } from 'react-router-dom';

function Seller_MoreMenu() {
    return (
        <div style={{ padding: '20px', backgroundColor: '#f4f7f6', minHeight: '100vh', paddingBottom: '100px' }}>
            <h1 style={{ fontSize: '24px', color: '#2c3e50', marginBottom: '20px', fontWeight: '800' }}>☰ More Options</h1>
            
            <div style={{ display: 'grid', gap: '15px' }}>
                
                {/* General Settings */}
                <Link to="/seller-settings" style={{ textDecoration: 'none' }}>
                    <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <span style={{ fontSize: '20px' }}>⚙️</span>
                            <span style={{ fontSize: '16px', color: '#2c3e50', fontWeight: 'bold' }}>Settings</span>
                        </div>
                        <span style={{ color: '#95a5a6' }}>➔</span>
                    </div>
                </Link>

                {/* Business Analytics */}
                <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span style={{ fontSize: '20px' }}>📈</span>
                        <span style={{ fontSize: '16px', color: '#2c3e50', fontWeight: 'bold' }}>Business Analytics</span>
                    </div>
                    <span style={{ color: '#95a5a6' }}>➔</span>
                </div>

                {/* Help & Support */}
                <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span style={{ fontSize: '20px' }}>🎧</span>
                        <span style={{ fontSize: '16px', color: '#2c3e50', fontWeight: 'bold' }}>Help & Support</span>
                    </div>
                    <span style={{ color: '#95a5a6' }}>➔</span>
                </div>
                
                {/* Logout */}
                <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginTop: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span style={{ fontSize: '20px' }}>🚪</span>
                        <span style={{ fontSize: '16px', color: '#e74c3c', fontWeight: 'bold' }}>Logout</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Seller_MoreMenu;
