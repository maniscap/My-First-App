import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function SellerProfile_Setup() {
    const navigate = useNavigate();
    
    // State to hold the form data
    const [formData, setFormData] = useState({
        shopName: '',
        ownerName: '',
        email: '',
        phone: '',
        address: '',
        description: ''
    });

    // Handle input changes
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Seller Profile Data:", formData);
        // TODO: Later we will add Firebase logic here to actually save this data!
        
        alert("Shop profile updated successfully!");
        navigate('/profile'); // Send user back to the profile hub
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
            
            {/* Header with Back Button */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '15px' }}>
                <div 
                    onClick={() => navigate('/profile')} 
                    style={{ cursor: 'pointer', fontSize: '24px', backgroundColor: '#fff', width: '40px', height: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '50%', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
                >
                    ⬅️
                </div>
                <h1 style={{ margin: 0, fontSize: '22px', color: '#2c3e50' }}>Shop Setup</h1>
            </div>

            {/* The Form */}
            <form onSubmit={handleSubmit} style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>Shop Name</label>
                    <input type="text" name="shopName" value={formData.shopName} onChange={handleChange} required placeholder="e.g. Green Acres Farm" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>Owner Name</label>
                    <input type="text" name="ownerName" value={formData.ownerName} onChange={handleChange} required placeholder="Your full name" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>Business Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="shop@example.com" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>Phone Number</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="+1 234 567 8900" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>Business Address</label>
                    <input type="text" name="address" value={formData.address} onChange={handleChange} required placeholder="123 Farm Lane, City, State" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                </div>

                <div style={{ marginBottom: '25px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>Shop Description</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} rows="4" placeholder="Tell customers about what you sell..." style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box', resize: 'vertical' }}></textarea>
                </div>

                <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.3s' }}>
                    Save Shop Profile
                </button>

            </form>
        </div>
    );
}

export default SellerProfile_Setup;