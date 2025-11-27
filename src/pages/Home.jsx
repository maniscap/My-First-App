import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>Welcome to Farm Cap 🚜</h1>
      <p>Empowering Farmers. Connecting Communities.</p>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '30px' }}>
        <Link to="/enquiry" style={btnStyle}>Enquiry 📖</Link>
        <Link to="/service" style={btnStyle}>Service 🛠️</Link>
        <Link to="/business" style={btnStyle}>Business 💰</Link>
      </div>
    </div>
  );
}

const btnStyle = {
  padding: '15px 30px',
  backgroundColor: '#4CAF50',
  color: 'white',
  textDecoration: 'none',
  fontSize: '18px',
  borderRadius: '8px',
  border: 'none',
  cursor: 'pointer'
};

export default Home;