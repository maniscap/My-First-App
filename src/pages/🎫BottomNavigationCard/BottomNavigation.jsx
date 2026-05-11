import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Map, MessageSquare, User } from 'lucide-react';

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
        <path d="M12 11c3.5 0 5.5-2.5 5.5-5.5C14.5 5.5 12 8 12 11z" fill="rgba(74, 222, 128, 0.3)" stroke="#4ade80" strokeWidth="1.5" strokeLinejoin="round" />
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

const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // --- STRICT VIEW LOGIC ---
  // Only show the bottom navigation on the dashboard
  if (location.pathname !== '/dashboard') {
    return null;
  }

  const navItems = [
    { icon: Home, path: '/dashboard', active: location.pathname === '/dashboard', onClick: () => navigate('/dashboard') },
    { icon: Map, path: '/map', active: location.pathname === '/map', onClick: () => navigate('/map') },
    { icon: DynamicScannerIcon, path: '/scanner', isCenter: true, onClick: () => navigate('/scanner') },
    { icon: MessageSquare, path: '/messages', active: location.pathname === '/messages', onClick: () => navigate('/messages') },
    { icon: User, path: '/profile', active: location.pathname === '/profile', onClick: () => navigate('/profile') }
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
        y: [0, -6, 0],
        boxShadow: [
          '0 4px 15px rgba(0, 0, 0, 0.15)',
          '0 8px 25px rgba(74, 222, 128, 0.35)',
          '0 4px 15px rgba(0, 0, 0, 0.15)'
        ]
      } : {
        y: [0, -4, 0]
      }}
      transition={{ 
        repeat: Infinity, 
        duration: isCenter ? 3 : 3 + (index % 2) * 0.5, 
        ease: "easeInOut",
        delay: index * 0.2
      }}
    >
      <Icon size={isCenter ? 28 : 24} strokeWidth={isCenter ? 2 : 2.5} />
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
    background: 'transparent',
    backdropFilter: 'blur(6px) saturate(110%)',
    WebkitBackdropFilter: 'blur(6px) saturate(110%)',
    borderTop: '1px solid rgba(255, 255, 255, 0.25)',
    borderLeft: '1px solid rgba(255, 255, 255, 0.05)',
    borderRight: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '32px 32px 0 0',
    boxShadow: '0 -8px 24px rgba(0, 0, 0, 0.15)',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: '8px 16px',
    paddingBottom: 'calc(8px + env(safe-area-inset-bottom))',
    boxSizing: 'border-box'
  },
  navItem: {
    background: 'transparent',
    border: '1px solid transparent',
    borderRadius: '50%',
    color: '#A1A1A6',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '46px',
    height: '46px',
    padding: '0',
    transition: 'all 0.4s ease',
    WebkitFontSmoothing: 'antialiased',
    WebkitBackfaceVisibility: 'hidden',
    backfaceVisibility: 'hidden',
    position: 'relative',
  },
  navItemActive: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    color: '#FFFFFF',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },
  lensButton: {
    width: '54px',
    height: '54px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(8px) saturate(110%)',
    WebkitBackdropFilter: 'blur(8px) saturate(110%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    border: '1px solid rgba(255, 255, 255, 0.35)',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)',
    color: '#FFFFFF',
    WebkitFontSmoothing: 'antialiased',
    WebkitBackfaceVisibility: 'hidden',
    backfaceVisibility: 'hidden',
    position: 'relative',
  }
};

export default BottomNavigation;