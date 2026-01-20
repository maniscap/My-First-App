import React from 'react';

const BottomNavigation = () => {
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
    height: '60px', // Decreased from 80px for a sleeker look
    background: '#000000', // Pitch Black Professional Background
    borderTop: '1px solid #1A1A1A', // Very subtle separator
    zIndex: 1000,
    boxShadow: '0 -5px 20px rgba(0,0,0,0.5)', // Deep shadow blending upwards
    paddingBottom: '10px' // Space for iPhone home bar area
  }
};

export default BottomNavigation;