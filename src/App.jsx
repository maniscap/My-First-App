import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// --- IMPORT PAGES ---
import Dashboard from './pages/🏠HomePageFeatures/Dashboard';
import MarketRates from './pages/📁AgriInsights/MarketRates'; 
import NewsUpdates from './pages/📁AgriInsights/NewsUpdates';       
import DigitalLibrary from './pages/📁AgriInsights/DigitalLibrary'; 
import Login from './pages/🪪Authentication&Terms/Login';
import Profile from './pages/📁Profile/Profile';
import NotificationsPage from './pages/🎫BottomNavigationCard/NotificationsPage';
import MoreMenuPage from './pages/🎫BottomNavigationCard/MoreMenuPage';
import CartPage from './pages/🎫BottomNavigationCard/CartPage';
import SettingsPage from './pages/⚙️Settings/SettingsPage';
import ThemeSettingsPage from './pages/🎫BottomNavigationCard/ThemeSettings';
import Admin from './pages/🔰AdminPage/Admin';
import Weather from './pages/📁Tools&utils/Weather';
import SearchResults from './pages/🏠HomePageFeatures/SearchResults';
import Expenditure from './pages/📁Tools&utils/Expenditure';
import CropExpenses from './pages/📁Tools&utils/CropExpenses'; 
import UserLocation from './pages/🏠HomePageFeatures/UserLocation'; 
import ModernTech from './pages/📁AgriInsights/ModernTech';

// --- NEW PAGES ---
import Radio from './pages/📁Tools&utils/Radio';

// --- AGRICOMMERCE PAGES ---
import RentMachinery from './pages/📁AgriCommerce/HireMachinery';
import HireWorkers from './pages/📁AgriCommerce/HireWorkers';
import Business from './pages/📁AgriCommerce/Business';
import FarmFresh from './pages/📁AgriCommerce/FarmFresh';
import Freelancing from './pages/📁AgriCommerce/Freelancing';

// --- FIXED IMPORT ---
import GPSMeasurement from './pages/📁Tools&utils/GPSMeasurement';

// --- IMPORT COMPONENTS ---
import ChatBot from './🔧components/ChatBot';
import FloatingCalculator from './🔧components/FloatingCalculator'; 
import SplashScreen from './🔧components/SplashScreen';
import BottomNavigation from './pages/🎫BottomNavigationCard/BottomNavigation';
import SmartLens from './pages/🎫BottomNavigationCard/SmartLens';
import { useTheme } from './pages/🎫BottomNavigationCard/ThemeSettings';

function App() {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showSplash, setShowSplash] = useState(true); 
  const SPLASH_DURATION = 4500; // 4500 = 4.5 seconds. Change this easily anytime.
  const { theme } = useTheme();

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
    <div style={{ width: '100%', height: '100vh', backgroundColor: theme.colors.background, color: theme.colors.text, transition: 'background-color 0.3s ease, color 0.3s ease' }}>
      
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
            <Route path="/more" element={<MoreMenuPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/settings/theme" element={<ThemeSettingsPage />} />
            
            {/* Notifications */}
            <Route path="/notifications" element={<NotificationsPage />} />
            
            {/* --- AGRI INSIGHTS & SUB-PAGES --- */}
            <Route path="/market-rates" element={<MarketRates />} /> 
            <Route path="/NewsUpdates" element={<NewsUpdates />} />         
            <Route path="/library" element={<DigitalLibrary />} />   
            <Route path="/modern-tech" element={<ModernTech />} />
            
            <Route path="/rent-machinery" element={<RentMachinery />} />
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
            
            {/* SmartLens Scanner */}
            <Route path="/scanner" element={<SmartLens />} />

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
            <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999 }}>
              <ChatBot />
            </div>
          )}

          {/* --- BOTTOM NAVIGATION DOCK --- */}
          <BottomNavigation />
          
        </div>
      )}
    </div>
  );
}

export default App;