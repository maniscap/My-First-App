import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Profile() {
  const navigate = useNavigate();

  // MOCK DATA: Pretend this is the user who just logged in
  const user = {
    name: "Maniscap Farmer",
    role: "Farmer 🌾",
    phone: "9876543210",
    location: "Nellore, AP",
    joined: "Nov 2025"
  };

  const handleLogout = () => {
    // Simulate logging out
    alert("Logged out successfully!");
    navigate('/'); // Go back to Home
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={{ color: '#2E7D32', margin: '0 0 10px 0' }}>My Profile</h1>
        
        {/* User Icon */}
        <div style={{ fontSize: '60px', marginBottom: '10px' }}>👨‍🌾</div>

        {/* User Details */}
        <h2 style={{ margin: '5px 0' }}>{user.name}</h2>
        <p style={{ color: '#555', fontStyle: 'italic' }}>{user.role}</p>
        
        <div style={{ textAlign: 'left', marginTop: '20px', background: '#f9f9f9', padding: '15px', borderRadius: '10px' }}>
          <p><strong>📞 Phone:</strong> {user.phone}</p>
          <p><strong>📍 Location:</strong> {user.location}</p>
          <p><strong>📅 Joined:</strong> {user.joined}</p>
        </div>

        {/* Buttons */}
        <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button style={editBtnStyle}>✏️ Edit Profile</button>
          <button onClick={handleLogout} style={logoutBtnStyle}>🚪 Logout</button>
        </div>

        <Link to="/" style={{ display: 'block', marginTop: '20px', color: '#888', textDecoration: 'none' }}>⬅ Back to Home</Link>
      </div>
    </div>
  );
}

// Styles
const containerStyle = {
  padding: '40px', display: 'flex', justifyContent: 'center', backgroundColor: '#f4f4f4', minHeight: '80vh'
};

const cardStyle = {
  backgroundColor: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', width: '350px', textAlign: 'center'
};

const editBtnStyle = {
  padding: '12px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px'
};

const logoutBtnStyle = {
  padding: '12px', backgroundColor: '#d32f2f', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px'
};

export default Profile;