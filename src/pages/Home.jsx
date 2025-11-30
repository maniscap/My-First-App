import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div style={pageStyle}>
      <div style={overlayStyle}>
        <h1 style={titleStyle}>Farm Cap 🧢</h1>
        <p style={subtitleStyle}>The Future of Indian Agriculture.</p>
        
        <div style={{marginTop: '40px'}}>
          <Link to="/login" style={mainBtn}>🚀 Get Started</Link>
        </div>
      </div>
    </div>
  );
}

const pageStyle = { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' };
const overlayStyle = { background: 'rgba(0,0,0,0.4)', padding: '40px', borderRadius: '20px', backdropFilter: 'blur(5px)', border: '1px solid rgba(255,255,255,0.2)' };
const titleStyle = { fontSize: '4rem', color: 'white', margin: 0, fontWeight: '900' };
const subtitleStyle = { fontSize: '1.5rem', color: '#eee', marginTop: '10px' };
const mainBtn = { textDecoration: 'none', backgroundColor: '#4CAF50', color: 'white', padding: '15px 40px', borderRadius: '30px', fontWeight: 'bold', fontSize: '20px', boxShadow: '0 5px 15px rgba(0,0,0,0.3)' };

export default Home;