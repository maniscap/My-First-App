import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Import Pages
import Home from './pages/Home';
import Service from './pages/Service';
import Enquiry from './pages/Enquiry';
import Business from './pages/Business';
import Login from './pages/Login';
import Profile from './pages/Profile';

// Import Components
import ChatBot from './components/ChatBot'; // <--- NEW IMPORT

function App() {
  return (
    <div>
      {/* The ChatBot sits here, outside the Routes, so it appears everywhere */}
      <ChatBot />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/service" element={<Service />} />
        <Route path="/enquiry" element={<Enquiry />} />
        <Route path="/business" element={<Business />} />
      </Routes>
    </div>
  );
}

export default App;