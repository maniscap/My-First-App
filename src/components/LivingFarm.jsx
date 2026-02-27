import React from 'react';

const LivingFarm = () => {
  // Your custom GitHub Raw Video Link pointing to your new assets folder!
  const videoUrl = 'https://github.com/maniscap/My-First-App/raw/refs/heads/main/src/assets/Peaceful_Indian_Village_Sunrise_Animation.mp4';

  return (
    <div style={styles.backgroundContainer}>
      {/* THE VIDEO ENGINE */}
      <video
        src={videoUrl}
        autoPlay
        loop
        muted
        playsInline // CRITICAL: Stops iOS/Android from opening it in full-screen
        style={styles.video}
      />
      
      {/* THE DARK GLASS OVERLAY: Pushes video back, makes UI text readable */}
      <div style={styles.overlay} />
    </div>
  );
};

const styles = {
  backgroundContainer: {
    position: 'fixed',
    top: 0, left: 0,
    width: '100vw', height: '100vh',
    zIndex: 0,
    backgroundColor: '#0f172a', // Dark fallback color
    overflow: 'hidden'
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover', // Ensures the video fills the screen beautifully
    opacity: 0.85
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.45)', // Darkens the video
    backdropFilter: 'blur(12px)', // Adds that premium frosted glass blur
    WebkitBackdropFilter: 'blur(12px)'
  }
};

export default LivingFarm;