import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUserMode } from '../../UserModeContext';
import BrandedTransition3D from '../../🛠️Shared_Components/BrandedTransition3D';

function Seller_Profile() {
    const navigate = useNavigate();
    const { toggleUserMode } = useUserMode();
    const [isTransforming, setIsTransforming] = useState(false);

    const handleSwitchToConsumer = () => {
        setIsTransforming(true);
        setTimeout(() => {
            toggleUserMode();
            navigate('/Consumer_HomePage');
        }, 3500);
    };

    return (
        <div style={{ padding: '20px', paddingBottom: '40px', maxWidth: '480px', margin: '0 auto', minHeight: '100dvh', backgroundColor: '#f4f7f6', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div 
                        onClick={() => navigate('/Seller_HomePage')} 
                        style={{ cursor: 'pointer', fontSize: '24px', backgroundColor: '#fff', width: '40px', height: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '50%', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
                    >
                        ⬅️
                    </div>
                    <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: '#2c3e50' }}>Seller Profile</h1>
                </div>
            </div>

            <div style={{ background: '#fff', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#333', marginBottom: '15px' }}>Shop Information</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: '#555', marginBottom: '25px' }}>
                    <p style={{ margin: 0 }}><strong>Shop Name:</strong> My Awesome Shop</p>
                    <p style={{ margin: 0 }}><strong>Contact Email:</strong> seller@example.com</p>
                    <p style={{ margin: 0, color: '#777', lineHeight: '1.4' }}>This is your business console. Manage inventory, coordinate worker bookings, list rental machinery, and fulfill farm-fresh crop orders here.</p>
                </div>
                
                {/* Link to the Setup Form */}
                <Link to="/seller-setup" style={{ textDecoration: 'none' }}>
                    <button style={{ width: '100%', padding: '12px', backgroundColor: '#2c3e50', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', transition: 'all 0.2s ease' }}>
                        Edit Shop Details ✏️
                    </button>
                </Link>
            </div>

            {/* BOTTOM ALTERNATIVE WORKSPACE SWITCH BUTTON - ANCHORED AT ABSOLUTE BOTTOM OF VIEWPORT */}
            <button
                onClick={handleSwitchToConsumer}
                disabled={isTransforming}
                style={{
                    width: '100%',
                    padding: '16px',
                    background: isTransforming ? '#7f8c8d' : 'linear-gradient(135deg, #2E7D32, #4CAF50)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: '800',
                    fontSize: '15px',
                    cursor: 'pointer',
                    marginTop: 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    boxShadow: '0 4px 15px rgba(46, 125, 50, 0.25)',
                    transition: 'all 0.2s ease',
                    marginBottom: '10px',
                    opacity: isTransforming ? 0.8 : 1
                }}
            >
                {isTransforming ? 'Switching Workspace...' : 'Switch to Consumer Mode 🌾'}
            </button>

            {/* SLEEK BRANDED WORKSPACE TRANSFORMATION OVERLAY */}
            <BrandedTransition3D isVisible={isTransforming} targetMode="consumer" />
        </div>
    );
}

export default Seller_Profile;