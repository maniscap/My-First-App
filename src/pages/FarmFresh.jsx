import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';

// Import Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Service from './pages/Service';
import AgriInsights from './pages/AgriInsights';
import Business from './pages/Business';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import FarmFresh from './pages/FarmFresh'; // <--- This line caused the crash before
import Weather from './pages/Weather';     // <--- This line caused the crash before

// Import Components
import ChatBot from './components/ChatBot';

function App() {
  const location = useLocation();

  return (
    <div>
      <ChatBot />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        
        <Route path="/dashboard" element={<Dashboard />} />
        
        <Route path="/profile" element={<Profile />} />
        <Route path="/agri-insights" element={<AgriInsights />} />
        <Route path="/service" element={<Service />} />
        <Route path="/business" element={<Business />} />
        
        {/* New Routes */}
        <Route path="/farm-fresh" element={<FarmFresh />} />
        <Route path="/weather" element={<Weather />} />
        
        <Route path="/admin" element={<Admin />} />

        {/* 404 Page */}
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