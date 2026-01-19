import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';

// --- IMPORT PAGES ---
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Service from './pages/Service';
import AgriInsights from './pages/AgriInsights';
import Business from './pages/Business';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import FarmFresh from './pages/FarmFresh';
import Weather from './pages/Weather';
import SearchResults from './pages/SearchResults';
import Expenditure from './pages/Expenditure';
import CropExpenses from './pages/CropExpenses'; // Your dynamic folder page
import UserLocation from './pages/UserLocation'; // <--- NEW: Management Page

// --- IMPORT COMPONENTS ---
import ChatBot from './components/ChatBot';
import FloatingCalculator from './components/FloatingCalculator'; 

function App() {
  const location = useLocation();

  return (
    <div>
      {/* --- GLOBAL COMPONENTS --- */}
      {/* Calculator handles its own visibility */}
      <FloatingCalculator /> 

      {/* --- MAIN PAGE CONTENT --- */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        
        {/* Main Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Location Management Page (Full Screen) */}
        <Route path="/user-location" element={<UserLocation />} /> 
        
        {/* Expenditure Section */}
        <Route path="/expenditure" element={<Expenditure />} />
        <Route path="/expenditure/:folderId" element={<CropExpenses />} />
        
        {/* Feature Pages */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/agri-insights" element={<AgriInsights />} />
        <Route path="/service" element={<Service />} />
        <Route path="/business" element={<Business />} />
        <Route path="/farm-fresh" element={<FarmFresh />} />
        <Route path="/weather" element={<Weather />} />
        
        {/* Utilities */}
        <Route path="/admin" element={<Admin />} />
        <Route path="/search" element={<SearchResults />} />

        {/* 404 Error Page */}
        <Route path="*" element={
          <div style={{textAlign: 'center', marginTop: '50px', color: 'black'}}> 
             <h1>❌ 404: Page Not Found</h1>
             <p>Check your URL or <Link to="/" style={{color: '#4CAF50'}}>go back home</Link>.</p>
          </div>
        } />
      </Routes>

      {/* --- CHATBOT (Only Visible on Dashboard) --- */}
      {location.pathname === '/dashboard' && (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
          <ChatBot />
        </div>
      )}
      
    </div>
  );
}

export default App;