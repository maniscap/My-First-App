import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';

// Import Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
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
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        
        {/* Private */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        
        {/* Features */}
        <Route path="/agri-insights" element={<AgriInsights />} />
        <Route path="/service" element={<Service />} />
        <Route path="/business" element={<Business />} />
        
        {/* Admin */}
        <Route path="/admin" element={<Admin />} />

        {/* 404 */}
        <Route path="*" element={
          <div style={{textAlign: 'center', marginTop: '50px', color: 'white'}}>
            <h1>❌ 404: Page Not Found</h1>
            <p>Check your URL or <Link to="/" style={{color: '#4CAF50'}}>go back home</Link>.</p>
          </div>
        } />
      </Routes>
    </div>
  );
}

export default App;