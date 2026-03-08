import React from 'react';

// Notice we added { isMuted } here so it can receive commands from the buttons!
const LivingFarm = ({ isMuted }) => {
  const videoUrl = 'https://raw.githubusercontent.com/maniscap/Farm_cap_assets/main/Peaceful_Indian_Village_Sunrise_Animation.mp4';

  return (
    <div style={styles.bg}>
      <video 
        src={videoUrl} 
        autoPlay loop muted={isMuted} playsInline 
        style={styles.vid} 
      />
      <div style={styles.overlay} />
    </div>
  );
};

const styles = {
  bg: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1, backgroundColor: '#000' },
  vid: { width: '100%', height: '100%', objectFit: 'cover', filter: 'none', WebkitFilter: 'none' },
  overlay: { position: 'absolute', inset: 0, background: 'rgba(0, 0, 0, 0.3)' }
};

export default LivingFarm;