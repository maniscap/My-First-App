import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Map, ScanLine, MessageSquare, User } from 'lucide-react';

const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // --- STRICT VIEW LOGIC ---
  // If the current path is NOT '/dashboard', do not render anything.
  if (location.pathname !== '/dashboard') {
    return null;
  }

  return (
    <div style={styles.wrapper}>
      {/* Curved Glassmorphism Dock */}
      <div style={styles.dockContainer}>
        <motion.button whileTap={{ scale: 0.85 }} style={{...styles.navItem, ...styles.navItemActive}}>
          <Home size={26} strokeWidth={2.5} />
        </motion.button>
        <motion.button whileTap={{ scale: 0.85 }} style={styles.navItem}>
          <Map size={26} strokeWidth={2.5} />
        </motion.button>

        {/* Empty space for the floating center button */}
        <div style={styles.spacer} />

        <motion.button whileTap={{ scale: 0.85 }} style={styles.navItem}>
          <MessageSquare size={26} strokeWidth={2.5} />
        </motion.button>
        <motion.button whileTap={{ scale: 0.85 }} style={styles.navItem}>
          <User size={26} strokeWidth={2.5} />
        </motion.button>
      </div>

      {/* Google Lens Style Scanner Button */}
      <div style={styles.lensContainer}>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{ 
            boxShadow: [
              '0 0px 0px rgba(74, 222, 128, 0)', 
              '0 0px 20px rgba(74, 222, 128, 0.5)', 
              '0 0px 0px rgba(74, 222, 128, 0)'
            ] 
          }}
          transition={{ repeat: Infinity, duration: 2.5 }}
          style={styles.lensButton}
          onClick={() => console.log('Open Google Lens style scanner!')}
        >
          <ScanLine size={26} strokeWidth={2.5} />
        </motion.button>
      </div>
    </div>
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
    backdropFilter: 'blur(2px) saturate(100%)',
    WebkitBackdropFilter: 'blur(2px) saturate(100%)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderTop: '1.5px solid rgba(255, 255, 255, 0.9)',
    borderLeft: '1.5px solid rgba(255, 255, 255, 0.5)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '40px',
    boxShadow: 'inset 0 2px 3px rgba(255, 255, 255, 0.8), inset 0 -2px 5px rgba(0, 0, 0, 0.2), 0 10px 30px rgba(0, 0, 0, 0.15)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 25px',
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
    transition: 'all 0.3s ease',
  },
  navItemActive: {
    color: '#4ade80',
    filter: 'drop-shadow(0 0 8px rgba(74, 222, 128, 0.4))'
  },
  lensContainer: {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    top: '-26px', 
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'transparent',
    backdropFilter: 'blur(2px) saturate(100%)',
    WebkitBackdropFilter: 'blur(2px) saturate(100%)',
    padding: '8px',
    borderRadius: '50%',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderTop: '1.5px solid rgba(255, 255, 255, 0.9)',
    borderLeft: '1.5px solid rgba(255, 255, 255, 0.5)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    boxShadow: 'inset 0 2px 3px rgba(255, 255, 255, 0.8), inset 0 -2px 5px rgba(0, 0, 0, 0.2), 0 8px 25px rgba(0, 0, 0, 0.15)',
  },
  lensButton: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: 'radial-gradient(circle at 30% 30%, #a7f3d0 0%, #4ade80 40%, #166534 100%)', // 3D Sphere effect
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#ffffff',
    border: 'none',
    boxShadow: '0 10px 25px rgba(74, 222, 128, 0.5), inset 0 4px 6px rgba(255, 255, 255, 0.6), inset 0 -4px 6px rgba(0, 0, 0, 0.3)'
  },
  spacer: {
    width: '80px'
  }
};

export default BottomNavigation;