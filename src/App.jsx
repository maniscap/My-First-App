import React from 'react';
import { Routes, Route, Link } from 'react-router-dom'; // <--- Added 'Link' here

// Import Pages
import Home from './pages/Home';
import Service from './pages/Service';
import AgriInsights from './pages/AgriInsights';
import Business from './pages/Business';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Admin from './pages/Admin';

// Import Components
import ChatBot from './components/ChatBot';

function App() {
  return (
    <div>
      <ChatBot />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/service" element={<Service />} />
        
        <Route path="/agri-insights" element={<AgriInsights />} />
        
        <Route path="/business" element={<Business />} />
        
        <Route path="/admin" element={<Admin />} />

        {/* --- FIXED 404 PAGE --- */}
        <Route path="*" element={
          <div style={{textAlign: 'center', marginTop: '50px'}}>
            <h1>❌ 404: Page Not Found</h1>
            {/* Now this is a clickable Link */}
            <p>Check your URL or <Link to="/" style={{color: '#2E7D32', fontWeight: 'bold', textDecoration: 'underline'}}>go back home</Link>.</p>
          </div>
        } />
      </Routes>
    </div>
  );
}

export default App;