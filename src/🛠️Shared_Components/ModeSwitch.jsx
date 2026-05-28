import React from 'react';
import { useUserMode } from '../UserModeContext';
import { useNavigate } from 'react-router-dom';

function ModeSwitch() {
    const { isSellerMode, toggleUserMode } = useUserMode();
    const navigate = useNavigate();

    const handleToggle = () => {
        toggleUserMode(); // Switch the state in Context
        
        // Navigate to the correct home page depending on what the mode is changing to
        if (isSellerMode) {
            // Changing from Seller to Consumer
            navigate('/Consumer_HomePage');
        } else {
            // Changing from Consumer to Seller
            navigate('/Seller_HomePage');
        }
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
                {isSellerMode ? 'Seller Mode' : 'Consumer Mode'}
            </span>
            <div onClick={handleToggle} style={{ width: '50px', height: '28px', background: isSellerMode ? '#4CAF50' : '#2196F3', borderRadius: '30px', position: 'relative', cursor: 'pointer', transition: 'background 0.3s' }}>
                <div style={{ width: '24px', height: '24px', background: 'white', borderRadius: '50%', position: 'absolute', top: '2px', left: isSellerMode ? '24px' : '2px', transition: 'left 0.3s', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}></div>
            </div>
        </div>
    );
}

export default ModeSwitch;