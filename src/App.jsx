import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// --- IMPORT PAGES ---
import Dashboard from './pages/Dashboard';
import HireMachinery from './pages/HireMachinery';
import HireWorkers from './pages/HireWorkers';
import MarketRates from './pages/MarketRates'; 
import NewsUpdates from './pages/NewsUpdates';       
import DigitalLibrary from './pages/DigitalLibrary'; 
import Business from './pages/Business';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import FarmFresh from './pages/FarmFresh';
import Weather from './pages/Weather';
import SearchResults from './pages/SearchResults';
import Expenditure from './pages/Expenditure';
import CropExpenses from './pages/CropExpenses'; 
import UserLocation from './pages/UserLocation'; 
import ModernTech from './pages/ModernTech';

// --- NEW PAGES ---
import Radio from './pages/Radio';
import Freelancing from './pages/Freelancing';

// --- FIXED IMPORT ---
import GPSMeasurement from './pages/GPSMeasurement';

// --- IMPORT COMPONENTS ---
import ChatBot from './components/ChatBot';
import FloatingCalculator from './components/FloatingCalculator'; 
import SplashScreen from './components/SplashScreen';

function App() {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showSplash, setShowSplash] = useState(true); 
  const SPLASH_DURATION = 4500; // 4500 = 4.5 seconds. Change this easily anytime.

  // --- GLOBAL NATIVE ZOOM PREVENTION ---
  useEffect(() => {
    const preventNativeZoom = (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };
    
    document.addEventListener('touchmove', preventNativeZoom, { passive: false });
    return () => document.removeEventListener('touchmove', preventNativeZoom);
  }, []);

  // --- FIREBASE AUTHENTICATION CHECKER ---
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsCheckingAuth(false);
    });

    // Forced Splash Timer
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, SPLASH_DURATION);

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  return (
    <div style={{ width: '100%', height: '100vh', backgroundColor: '#000' }}>
      
      {/* --- THE SHIELD: Splash Screen sits on top --- */}
      {(isCheckingAuth || showSplash) && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999 }}>
          <SplashScreen />
        </div>
      )}

      {/* --- THE ENGINE: Dashboard builds and paints invisibly in the background --- */}
      {!isCheckingAuth && (
        <div style={{ height: '100%', width: '100%', overflow: showSplash ? 'hidden' : 'auto' }}>
          
          {/* --- GLOBAL COMPONENTS --- */}
          <FloatingCalculator /> 

          {/* --- MAIN PAGE CONTENT --- */}
          <Routes>
            {/* SMART ROUTING: Redirects instantly based on login status */}
            <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
            <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
            
            {/* Main Dashboard */}
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Location Management Page */}
            <Route path="/user-location" element={<UserLocation />} /> 
            
            {/* Expenditure Section */}
            <Route path="/expenditure" element={<Expenditure />} />
            <Route path="/expenditure/:folderId" element={<CropExpenses />} />
            
            {/* Feature Pages */}
            <Route path="/profile" element={<Profile />} />
            
            {/* --- AGRI INSIGHTS & SUB-PAGES --- */}
            <Route path="/market-rates" element={<MarketRates />} /> 
            <Route path="/NewsUpdates" element={<NewsUpdates />} />         
            <Route path="/library" element={<DigitalLibrary />} />   
            <Route path="/modern-tech" element={<ModernTech />} />
            
            <Route path="/service" element={<HireMachinery />} />
            <Route path="/hire-workers" element={<HireWorkers />} />
            <Route path="/business" element={<Business />} />
            <Route path="/farm-fresh" element={<FarmFresh />} />
            <Route path="/weather" element={<Weather />} />

            {/* --- NEW FEATURE ROUTES --- */}
            <Route path="/radio" element={<Radio />} />
            <Route path="/freelancing" element={<Freelancing />} />
            
            {/* GPS ROUTE */}
            <Route path="/gps-measurement" element={<GPSMeasurement />} />
            
            {/* Utilities & Admin */}
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
      )}
    </div>
  );
}

export default App;