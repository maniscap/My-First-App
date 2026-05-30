import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// --- IMPORT PAGES ---
import Consumer_HomePage from './🧾Consumer_pages/🏠HomePageFeatures/Consumer_HomePage';
import MarketRates from './🧾Consumer_pages/📁AgriInsights/MarketRates'; 
import NewsUpdates from './🧾Consumer_pages/📁AgriInsights/NewsUpdates';       
import DigitalLibrary from './🧾Consumer_pages/📁AgriInsights/DigitalLibrary'; 
import Login from './🧾Consumer_pages/🪪Authentication&Terms/Login';
import Consumer_Profile from './🧾Consumer_pages/📁ConsumerProfile/Consumer_Profile';
import Consumer_NotificationsPage from './🧾Consumer_pages/🎫BottomNavigationCard/Consumer_NotificationsPage';
import Consumer_MoreMenuPage from './🧾Consumer_pages/🎫BottomNavigationCard/Consumer_MoreMenuPage';
import CartPage from './🧾Consumer_pages/🎫BottomNavigationCard/CartPage';
import Consumer_SettingsPage from './🧾Consumer_pages/⚙️Settings/Consumer_SettingsPage';
import Consumer_ThemeSettings from './🧾Consumer_pages/⚙️Settings/Consumer_ThemeSettings';
import Admin from './🧑‍💻Admin_Page/Admin';
import Weather from './🧾Consumer_pages/📁Tools&utils/Weather';
import SearchResults from './🧾Consumer_pages/🏠HomePageFeatures/SearchResults';
import Expenditure from './🧾Consumer_pages/📁Tools&utils/Expenditure';
import CropExpenses from './🧾Consumer_pages/📁Tools&utils/CropExpenses'; 
import Consumer_UserLocation from './🧾Consumer_pages/🏠HomePageFeatures/Consumer_UserLocation'; 
import BannerPromo from './🧾Consumer_pages/🏠HomePageFeatures/BannerPromo';
import ModernTech from './🧾Consumer_pages/📁AgriInsights/ModernTech';

// --- NEW PAGES ---
import Radio from './🧾Consumer_pages/📁Tools&utils/Radio';

// --- AGRICOMMERCE PAGES ---
import HireMachinery from './🧾Consumer_pages/📁AgriCommerce/HireMachinery';
import HireWorkers from './🧾Consumer_pages/📁AgriCommerce/HireWorkers';
import Business from './🧾Consumer_pages/📁AgriCommerce/Business';
import FarmFresh from './🧾Consumer_pages/📁AgriCommerce/FarmFresh';
import Freelancing from './🧾Consumer_pages/📁AgriCommerce/Freelancing';

// --- FIXED IMPORT ---
import GPSMeasurement from './🧾Consumer_pages/📁Tools&utils/GPSMeasurement';

// --- SELLER PAGES ---
import Seller_HomePage from './🧾Seller_pages/Seller_HomePage';
import Seller_Profile from './🧾Seller_pages/Seller_Profile';
import SellerProfile_Setup from './🧾Seller_pages/SellerProfile_Setup';
import Seller_NotificationsPage from './🧾Seller_pages/Seller_NotificationsPage';

// --- IMPORT COMPONENTS ---
import ChatBot from './🔧Consumer_Components/ChatBot';
import FloatingCalculator from './🔧Consumer_Components/FloatingCalculator'; 
import SplashScreen from './🔧Consumer_Components/SplashScreen';
import Consumer_BottomNavigation from './🧾Consumer_pages/🎫BottomNavigationCard/Consumer_BottomNavigation';
import SmartLens from './🧾Consumer_pages/🎫BottomNavigationCard/SmartLens';
import { useTheme } from './🧾Consumer_pages/⚙️Settings/Consumer_ThemeSettings';
import { useUserMode } from './UserModeContext';

function App() {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showSplash, setShowSplash] = useState(true); 
  const SPLASH_DURATION = 4500; // 4500 = 4.5 seconds. Change this easily anytime.
  const { theme } = useTheme();
  const { isSellerMode } = useUserMode();

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

      {/* --- THE ENGINE: Consumer_HomePage builds and paints invisibly in the background --- */}
      {!isCheckingAuth && (
        <div style={{ height: '100%', width: '100%', overflow: showSplash ? 'hidden' : 'auto' }}>
          
          {/* --- GLOBAL COMPONENTS --- */}
          <FloatingCalculator /> 

          {/* --- MAIN PAGE CONTENT --- */}
          {isSellerMode ? (
            <Routes>
              {/* SMART ROUTING: Redirects for Seller Mode */}
              <Route path="/" element={user ? <Navigate to="/Seller_HomePage" replace /> : <Navigate to="/login" replace />} />
              <Route path="/login" element={user ? <Navigate to="/Seller_HomePage" replace /> : <Login />} />
              <Route path="/Consumer_HomePage" element={<Navigate to="/Seller_HomePage" replace />} />
              
              {/* --- SELLER MAIN PAGES --- */}
              <Route path="/Seller_HomePage" element={<Seller_HomePage />} />
              <Route path="/profile" element={<Seller_Profile />} />
              <Route path="/seller-setup" element={<SellerProfile_Setup />} />
              <Route path="/seller-notifications" element={<Seller_NotificationsPage />} />

              <Route path="*" element={
                <div style={{ textAlign: 'center', marginTop: '100px', color: theme.colors.text }}>
                  <h1>Seller Mode 🚀</h1>
                  <p>Page coming soon!</p>
                  <Link to="/Seller_HomePage" style={{color: '#4CAF50'}}>Go to Seller Dashboard</Link>
                </div>
              } />
            </Routes>
          ) : (
            <Routes>
              {/* SMART ROUTING: Redirects instantly based on login status */}
              <Route path="/" element={user ? <Navigate to="/Consumer_HomePage" replace /> : <Navigate to="/login" replace />} />
              <Route path="/login" element={user ? <Navigate to="/Consumer_HomePage" replace /> : <Login />} />
              <Route path="/Seller_HomePage" element={<Navigate to="/Consumer_HomePage" replace />} />
              
              {/* Main Consumer_HomePage */}
              <Route path="/Consumer_HomePage" element={<Consumer_HomePage />} />
              
              {/* Location Management Page */}
              <Route path="/user-location" element={<Consumer_UserLocation />} /> 
              
              {/* Expenditure Section */}
              <Route path="/expenditure" element={<Expenditure />} />
              <Route path="/expenditure/:folderId" element={<CropExpenses />} />
              
              {/* Feature Pages */}
              <Route path="/profile" element={<Consumer_Profile />} />
              <Route path="/more" element={<Consumer_MoreMenuPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/settings" element={<Consumer_SettingsPage />} />
              <Route path="/settings/theme" element={<Consumer_ThemeSettings />} />
              
              {/* Notifications */}
              <Route path="/notifications" element={<Consumer_NotificationsPage />} />
              
              {/* --- AGRI INSIGHTS & SUB-PAGES --- */}
              <Route path="/market-rates" element={<MarketRates />} /> 
              <Route path="/NewsUpdates" element={<NewsUpdates />} />         
              <Route path="/library" element={<DigitalLibrary />} />   
              <Route path="/modern-tech" element={<ModernTech />} />
              
              <Route path="/rent-machinery" element={<HireMachinery />} />
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
              <Route path="/banner-promo" element={<BannerPromo />} />
              
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
          )}

          {/* --- CHATBOT (Only Visible on Consumer_HomePage) --- */}
          {!isSellerMode && location.pathname === '/Consumer_HomePage' && (
            <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999 }}>
              <ChatBot />
            </div>
          )}

          {/* --- BOTTOM NAVIGATION DOCK --- */}
          {!isSellerMode && <Consumer_BottomNavigation />}
          
        </div>
      )}
    </div>
  );
}

export default App;