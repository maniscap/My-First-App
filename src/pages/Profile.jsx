import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase'; // Import Auth
import { signOut, onAuthStateChanged } from 'firebase/auth';

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null); // Starts empty
  const [loading, setLoading] = useState(true);

  // --- 1. CHECK WHO IS LOGGED IN ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // User is signed in
        setUser(currentUser);
      } else {
        // User is NOT signed in -> Send to Login
        navigate('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup listener
  }, [navigate]);

  // --- 2. LOGOUT FUNCTION ---
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/'); // Go back home
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (loading) return <div style={{textAlign: 'center', padding: '50px'}}>⏳ Loading Profile...</div>;

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={{ color: '#2E7D32', margin: '0 0 20px 0' }}>My Profile</h1>
        
        {/* Real User Photo (or default icon if none) */}
        {user?.photoURL ? (
          <img src={user.photoURL} alt="Profile" style={avatarStyle} />
        ) : (
          <div style={{ fontSize: '60px', marginBottom: '10px' }}>👨‍🌾</div>
        )}

        {/* Real User Details */}
        <h2 style={{ margin: '10px 0' }}>{user?.displayName || "Farmer"}</h2>
        <p style={{ color: '#555' }}>{user?.email}</p>
        <p style={{ fontSize: '12px', color: '#888' }}>User ID: {user?.uid.slice(0, 5)}...</p>
        
        <div style={{ textAlign: 'left', marginTop: '20px', background: '#f9f9f9', padding: '15px', borderRadius: '10px' }}>
          <p><strong>📞 Phone:</strong> {user?.phoneNumber || "Not Linked"}</p>
          <p><strong>✅ Status:</strong> Verified Member</p>
        </div>

        {/* Buttons */}
        <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button onClick={handleLogout} style={logoutBtnStyle}>🚪 Logout</button>
        </div>

        <Link to="/" style={{ display: 'block', marginTop: '20px', color: '#888', textDecoration: 'none' }}>⬅ Back to Home</Link>
      </div>
    </div>
  );
}

// Styles
const containerStyle = { padding: '40px', display: 'flex', justifyContent: 'center', backgroundColor: '#f4f4f4', minHeight: '80vh' };
const cardStyle = { backgroundColor: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', width: '350px', textAlign: 'center' };
const avatarStyle = { width: '100px', height: '100px', borderRadius: '50%', marginBottom: '10px', border: '3px solid #2E7D32' };
const logoutBtnStyle = { padding: '12px', backgroundColor: '#d32f2f', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px' };

export default Profile;