import React, { useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Home, Map, MessageSquare, User } from 'lucide-react';

const DynamicScannerIcon = ({ size = 32, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <motion.g {...props} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* Animated Corner Viewfinder Brackets */}
      <motion.g
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        style={{ originX: '50%', originY: '50%' }}
      >
        <path d="M4 7V5C4 4.44772 4.44772 4 5 4H7" />
        <path d="M17 4H19C19.5523 4 20 4.44772 20 5V7" />
        <path d="M20 17V19C20 19.5523 19.5523 20 19 20H17" />
        <path d="M7 20H5C4.44772 20 4 19.5523 4 19V17" />
      </motion.g>

      {/* Inner Pulsing Agri-Tech Core (Leaves) */}
      <motion.g
        animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        style={{ originX: '50%', originY: '50%' }}
      >
        {/* Stem */}
        <path d="M12 15.5V12" strokeWidth="1.5" />
        {/* Left Leaf */}
        <path d="M12 13.5C10 13.5 8.5 12 8.5 10.5C10.5 10.5 12 12 12 13.5Z" fill="currentColor" stroke="none" />
        {/* Right Leaf */}
        <path d="M12 12C14.5 12 15.5 9.5 15.5 8.5C13 8.5 12 10.5 12 12Z" fill="currentColor" stroke="none" />
      </motion.g>

      {/* Sweeping Laser Line */}
      <motion.path 
        d="M4 12H20" 
        strokeWidth="1.5"
        animate={{ 
          y: [-7, 7],
          opacity: [0, 1, 1, 0]
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity, 
          ease: "linear",
          times: [0, 0.2, 0.8, 1]
        }}
      />
    </motion.g>
  </svg>
);

const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const mouseX = useMotionValue(Infinity);

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
      {/* Curved Glassmorphism Dock */}
      <motion.div 
        onMouseMove={(e) => mouseX.set(e.nativeEvent.x)}
        onMouseLeave={() => mouseX.set(Infinity)}
        style={styles.dockContainer}
      >
        {navItems.map((item, i) => (
          <NavItem key={i} mouseX={mouseX} item={item} />
        ))}
      </motion.div>
    </div>
  );
};

const NavItem = ({ mouseX, item }) => {
  const ref = useRef(null);

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const scale = useTransform(distance, [-120, 0, 120], [1, 1.4, 1], { clamp: true });
  const y = useTransform(distance, [-120, 0, 120], [0, -15, 0], { clamp: true });

  const Icon = item.icon;
  const isCenter = item.isCenter || false;

  const buttonStyle = isCenter ? styles.lensButton : styles.navItem;
  const activeStyle = item.active ? styles.navItemActive : {};

  return (
    <motion.button
      ref={ref}
      style={{ 
        ...buttonStyle, 
        ...activeStyle,
        scale,
        y
      }}
      whileTap={isCenter ? { scale: 0.9 } : { scale: 0.85 }}
      onClick={item.onClick}
      animate={isCenter ? { boxShadow: ['0 4px 10px rgba(74, 222, 128, 0.2)', '0 4px 20px rgba(74, 222, 128, 0.5)', '0 4px 10px rgba(74, 222, 128, 0.2)'] } : {}}
      transition={isCenter ? { repeat: Infinity, duration: 2.5 } : {}}
    >
      <Icon size={isCenter ? 30 : 26} strokeWidth={isCenter ? 2 : 2.5} />
    </motion.button>
  );
};

const styles = {
  wrapper: {
    position: 'fixed',
    bottom: '10px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '92%',
    maxWidth: '420px',
    height: '70px',
    zIndex: 1000,
  },
  dockContainer: {
    width: '100%',
    height: '100%',
    background: 'transparent',
    backdropFilter: 'blur(12px) saturate(120%)',
    WebkitBackdropFilter: 'blur(12px) saturate(120%)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderTop: '1.5px solid rgba(255, 255, 255, 0.9)',
    borderLeft: '1.5px solid rgba(255, 255, 255, 0.5)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '40px',
    boxShadow: 'inset 0 2px 3px rgba(255, 255, 255, 0.8), inset 0 -2px 5px rgba(0, 0, 0, 0.2), 0 10px 30px rgba(0, 0, 0, 0.15)',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: '0 20px',
    boxSizing: 'border-box'
  },
  navItem: {
    background: 'none',
    border: 'none',
    color: '#E3E3E3',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px',
    transition: 'color 0.3s ease',
    WebkitFontSmoothing: 'antialiased',
    WebkitBackfaceVisibility: 'hidden',
    backfaceVisibility: 'hidden',
  },
  navItemActive: {
    color: '#4ade80',
    filter: 'drop-shadow(0 0 8px rgba(74, 222, 128, 0.4))'
  },
  lensButton: {
    width: '56px',
    height: '56px',
    borderRadius: '18px',
    background: 'linear-gradient(145deg, rgba(74, 222, 128, 0.15), rgba(22, 101, 52, 0.1))',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    border: '1.5px solid rgba(74, 222, 128, 0.4)',
    color: '#4ade80',
    WebkitFontSmoothing: 'antialiased',
    WebkitBackfaceVisibility: 'hidden',
    backfaceVisibility: 'hidden',
  }
};

export default BottomNavigation;