import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Import Pages
import Home from './pages/Home';
import Service from './pages/Service';
import Enquiry from './pages/Enquiry';
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
        <Route path="/enquiry" element={<Enquiry />} />
        <Route path="/business" element={<Business />} />
        
        {/* Secret Admin Route */}
        <Route path="/admin" element={<Admin />} />

        {/* --- NEW: THE 404 CATCH-ALL ROUTE --- */}
        {/* If the URL doesn't match anything above, it shows this: */}
        <Route path="*" element={
          <div style={{textAlign: 'center', marginTop: '50px'}}>
            <h1>❌ 404: Page Not Found</h1>
            <p>Check your URL or go back home.</p>
          </div>
        } />
      </Routes>
    </div>
  );
}

export default App;