import React from 'react';
import { useLocation } from 'react-router-dom';

const BottomNavigation = () => {
  const location = useLocation();

  // --- STRICT VIEW LOGIC ---
  // If the current path is NOT '/dashboard', do not render anything.
  if (location.pathname !== '/dashboard') {
    return null;
  }

  return (
    <div style={styles.dockContainer}>
      {/* Currently Empty & Sleek. 
          Ready for future icons/features.
      */}
    </div>
  );
};

const styles = {
  dockContainer: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '60px', 
    background: '#000000', 
    borderTop: '1px solid #1A1A1A', 
    zIndex: 1000,
    boxShadow: '0 -5px 20px rgba(0,0,0,0.5)', 
    paddingBottom: '10px' 
  }
};

export default BottomNavigation;