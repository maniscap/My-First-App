import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ModeSwitch from '../🛠️Shared_Components/ModeSwitch';

function Seller_Profile() {
    const navigate = useNavigate();

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', minHeight: '100vh', backgroundColor: '#f4f7f6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div 
                        onClick={() => navigate('/Seller_HomePage')} 
                        style={{ cursor: 'pointer', fontSize: '24px', backgroundColor: '#fff', width: '40px', height: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '50%', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
                    >
                        ⬅️
                    </div>
                    <h1 style={{ margin: 0 }}>Seller Profile</h1>
                </div>
                {/* Here is the switch to go back to Consumer Mode */}
                <ModeSwitch />
            </div>
            <div style={{ background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                <h2>Shop Information</h2>
                <p><strong>Shop Name:</strong> My Awesome Shop</p>
                <p><strong>Contact Email:</strong> seller@example.com</p>
                <p>This is where you will manage your seller-specific settings and store details.</p>
                
                {/* Link to the Setup Form */}
                <Link to="/seller-setup" style={{ textDecoration: 'none' }}>
                    <button style={{ marginTop: '15px', padding: '10px 20px', backgroundColor: '#2c3e50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                        Edit Shop Details ✏️
                    </button>
                </Link>
            </div>
        </div>
    );
}

export default Seller_Profile;