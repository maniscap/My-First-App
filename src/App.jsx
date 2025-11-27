import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Import our pages
import Home from './pages/Home';
import Service from './pages/Service';
import Enquiry from './pages/Enquiry';
import Business from './pages/Business';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/service" element={<Service />} />
      <Route path="/enquiry" element={<Enquiry />} />
      <Route path="/business" element={<Business />} />
    </Routes>
  );
}

export default App;