import React from 'react';

function Seller_Messages() {
    return (
        <div style={{ padding: '20px', backgroundColor: '#f4f7f6', minHeight: '100vh', paddingBottom: '100px' }}>
            <h1 style={{ fontSize: '24px', color: '#2c3e50', marginBottom: '20px' }}>💬 Messages</h1>
            
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>📭</div>
                <h2 style={{ fontSize: '18px', color: '#7f8c8d' }}>No new messages</h2>
                <p style={{ color: '#95a5a6' }}>When buyers contact you, their messages will appear here.</p>
            </div>
        </div>
    );
}

export default Seller_Messages;
