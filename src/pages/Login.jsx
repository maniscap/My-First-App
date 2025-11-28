import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    alert("Login Successful! Welcome back.");
    navigate('/profile'); // <--- CHANGED: Now goes to Profile
  };

  const handleSignup = (e) => {
    e.preventDefault();
    alert("Account Created! Welcome to Farm Cap.");
    navigate('/profile'); // <--- CHANGED: Now goes to Profile
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={{ color: '#2E7D32', marginBottom: '20px' }}>
          {isSignup ? 'Create Account 🌾' : 'Welcome Back 🚜'}
        </h2>

        <form onSubmit={isSignup ? handleSignup : handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          {isSignup && (
            <input type="text" placeholder="Full Name" required style={inputStyle} />
          )}

          <input type="tel" placeholder="Phone Number" required style={inputStyle} />
          <input type="password" placeholder="Password" required style={inputStyle} />

          {isSignup && (
            <select style={inputStyle}>
              <option value="farmer">I am a Farmer</option>
              <option value="provider">I provide Machinery/Labor</option>
              <option value="buyer">I am a Buyer</option>
            </select>
          )}

          <button type="submit" style={btnStyle}>
            {isSignup ? 'Sign Up' : 'Login'}
          </button>
        </form>

        <p style={{ marginTop: '20px', fontSize: '14px' }}>
          {isSignup ? "Already have an account?" : "New to Farm Cap?"} 
          <span 
            onClick={() => setIsSignup(!isSignup)} 
            style={{ color: '#2E7D32', fontWeight: 'bold', cursor: 'pointer', marginLeft: '5px' }}
          >
            {isSignup ? 'Login here' : 'Create Account'}
          </span>
        </p>
        
        <Link to="/" style={{ fontSize: '12px', color: '#666', marginTop: '10px', display: 'block' }}>Skip for now →</Link>
      </div>
    </div>
  );
}

// Styles
const containerStyle = {
  display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', backgroundColor: '#f0f4c3'
};

const cardStyle = {
  backgroundColor: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', width: '300px', textAlign: 'center'
};

const inputStyle = {
  padding: '10px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '16px'
};

const btnStyle = {
  padding: '12px', backgroundColor: '#2E7D32', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold'
};

export default Login;