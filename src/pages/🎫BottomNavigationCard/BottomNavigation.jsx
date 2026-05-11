import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Bell, ShoppingCart, Menu } from 'lucide-react';

const DynamicScannerIcon = ({ size = 32, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <motion.g {...props} style={{ originX: '50%', originY: '50%' }}>
      {/* Viewfinder Brackets */}
      <motion.g
        stroke="rgba(255,255,255,0.7)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <path d="M4 7V5C4 4.44772 4.44772 4 5 4H7" />
        <path d="M17 4H19C19.5523 4 20 4.44772 20 5V7" />
        <path d="M20 17V19C20 19.5523 19.5523 20 19 20H17" />
        <path d="M7 20H5C4.44772 20 4 19.5523 4 19V17" />
      </motion.g>

      {/* Central Plant / Sprout */}
      <motion.g
        animate={{ scale: [0.95, 1.05, 0.95] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        style={{ originX: '50%', originY: '50%' }}
      >
        {/* Stem */}
        <path d="M12 19V9" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" />
        {/* Left Leaf */}
        <path d="M12 14c-3.5 0-5.5-2.5-5.5-5.5C9.5 8.5 12 11 12 14z" fill="rgba(74, 222, 128, 0.3)" stroke="#4ade80" strokeWidth="1.5" strokeLinejoin="round" />
        {/* Right Leaf */}
        <path d="M12 11c3.5 0-5.5-2.5 5.5-5.5C14.5 5.5 12 8 12 11z" fill="rgba(74, 222, 128, 0.3)" stroke="#4ade80" strokeWidth="1.5" strokeLinejoin="round" />
      </motion.g>

      {/* Sweeping Laser Line & Glow */}
      <motion.g
        animate={{ y: [4, 19, 4] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
      >
        <line x1="4" y1="0" x2="20" y2="0" stroke="#38bdf8" strokeWidth="1.5" style={{ filter: 'drop-shadow(0 0 3px #38bdf8)' }} />
        <rect x="4" y="0" width="16" height="5" fill="url(#laser-gradient)" />
      </motion.g>

      <defs>
        <linearGradient id="laser-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(56, 189, 248, 0.4)" />
          <stop offset="100%" stopColor="rgba(56, 189, 248, 0)" />
        </linearGradient>
      </defs>
    </motion.g>
  </svg>
);

const NotificationBellIcon = ({ size, strokeWidth, count }) => (
  <div style={{ position: 'relative', display: 'flex' }}>
    <Bell size={size} strokeWidth={strokeWidth} />
    {count > 0 && (
      <div style={{
        position: 'absolute',
        top: '-4px',
        right: '-4px',
        minWidth: '14px',
        height: '14px',
        backgroundColor: '#ef4444',
        color: 'white',
        fontSize: '9px',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '7px',
        padding: '0 2px',
      }}>
        {count > 99 ? '99+' : count}
      </div>
    )}
  </div>
);

const StyledCartIcon = ({ size, strokeWidth, count }) => (
  <div style={{ position: 'relative', display: 'flex' }}>
    <ShoppingCart size={size} strokeWidth={strokeWidth} />
    {count > 0 && (
      <div style={{
        position: 'absolute',
        top: '-4px',
        right: '-4px',
        minWidth: '14px',
        height: '14px',
        backgroundColor: '#3b82f6',
        color: 'white',
        fontSize: '9px',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '7px',
        padding: '0 2px',
      }}>
        {count > 99 ? '99+' : count}
      </div>
    )}
  </div>
);

const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // --- STRICT VIEW LOGIC ---
  // Show the bottom navigation on the main tabs
  const allowedPaths = ['/dashboard', '/notifications', '/cart', '/profile', '/scanner', '/more'];
  if (!allowedPaths.includes(location.pathname)) {
    return null;
  }

  const navItems = [
    { icon: Home, path: '/dashboard', active: location.pathname === '/dashboard', onClick: () => navigate('/dashboard') },
    { icon: StyledCartIcon, path: '/cart', count: 0, active: location.pathname === '/cart', onClick: () => navigate('/cart') },
    { icon: DynamicScannerIcon, path: '/scanner', isCenter: true, onClick: () => navigate('/scanner') },
    { icon: NotificationBellIcon, path: '/notifications', count: 0, active: location.pathname === '/notifications', onClick: () => navigate('/notifications') },
    { icon: Menu, path: '/more', active: location.pathname === '/more', onClick: () => navigate('/more') }
  ];

  return (
    <div style={styles.wrapper}>
      {/* Liquid Water Dock */}
      <div style={styles.dockContainer}>
        {navItems.map((item, i) => (
          <NavItem key={i} item={item} index={i} />
        ))}
      </div>
    </div>
  );
};

const NavItem = ({ item, index }) => {
  const Icon = item.icon;
  const isCenter = item.isCenter || false;

  const buttonStyle = isCenter ? styles.lensButton : styles.navItem;
  const activeStyle = item.active ? styles.navItemActive : {};

  return (
    <motion.button
      style={{ 
        ...buttonStyle, 
        ...activeStyle
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.85 }}
      onClick={item.onClick}
      animate={isCenter ? { 
        y: [0, -4, 0],
        boxShadow: [
          '0 10px 24px rgba(0, 0, 0, 0.4), inset 0 2px 5px rgba(255, 255, 255, 0.3)',
          '0 15px 32px rgba(74, 222, 128, 0.35), inset 0 2px 5px rgba(255, 255, 255, 0.5)',
          '0 10px 24px rgba(0, 0, 0, 0.4), inset 0 2px 5px rgba(255, 255, 255, 0.3)'
        ]
      } : {
        y: [0, -3, 0]
      }}
      transition={{ 
        repeat: Infinity, 
        duration: isCenter ? 3 : 3 + (index % 2) * 0.5, 
        ease: "easeInOut",
        delay: index * 0.2
      }}
    >
      <Icon size={isCenter ? 24 : 22} strokeWidth={isCenter ? 2 : 2.5} count={item.count} />
    </motion.button>
  );
};

const styles = {
  wrapper: {
    position: 'fixed',
    bottom: '0',
    left: '0',
    width: '100%',
    zIndex: 1000,
  },
  dockContainer: {
    width: '100%',
    background: 'rgba(249, 249, 249, 0.9)',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    borderTop: '1px solid rgba(0, 0, 0, 0.1)',
    borderRadius: '24px 24px 0 0',
    boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: '6px 12px',
    paddingBottom: 'calc(6px + env(safe-area-inset-bottom))',
    boxSizing: 'border-box'
  },
  navItem: {
    background: 'transparent',
    border: '1px solid transparent',
    borderRadius: '50%',
    color: '#1C1C1E',
    filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.25))',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    padding: '0',
    transition: 'all 0.4s ease',
    WebkitFontSmoothing: 'antialiased',
    WebkitBackfaceVisibility: 'hidden',
    backfaceVisibility: 'hidden',
    position: 'relative',
  },
  navItemActive: {
    color: '#FFFFFF',
    background: 'linear-gradient(145deg, #3a3a3c, #111111)',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.2)',
    border: '1px solid #000000',
    filter: 'none',
  },
  lensButton: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'linear-gradient(145deg, #2c2c2e, #000000)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    border: '1px solid rgba(0, 0, 0, 0.9)',
    boxShadow: '0 10px 24px rgba(0, 0, 0, 0.4), inset 0 2px 5px rgba(255, 255, 255, 0.3)',
    color: '#FFFFFF',
    WebkitFontSmoothing: 'antialiased',
    WebkitBackfaceVisibility: 'hidden',
    backfaceVisibility: 'hidden',
    position: 'relative',
  }
};

export default BottomNavigation;