import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';

// Import Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard'; // <--- RESTORED THIS IMPORT
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
        {/* Public Landing Page */}
        <Route path="/" element={<Home />} />
        
        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        
        {/* Main App Area */}
        <Route path="/dashboard" element={<Dashboard />} /> {/* <--- RESTORED THIS ROUTE */}
        <Route path="/profile" element={<Profile />} />
        
        {/* Features */}
        <Route path="/agri-insights" element={<AgriInsights />} />
        <Route path="/service" element={<Service />} />
        <Route path="/business" element={<Business />} />
        
        {/* Admin */}
        <Route path="/admin" element={<Admin />} />

        {/* 404 Page */}
        <Route path="*" element={
          <div style={{textAlign: 'center', marginTop: '50px'}}>
            <h1>❌ 404: Page Not Found</h1>
            <p>Check your URL or <Link to="/" style={{color: '#2E7D32', fontWeight: 'bold', textDecoration: 'underline'}}>go back home</Link>.</p>
          </div>
        } />
      </Routes>
    </div>
  );
}

export default App;