import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

const SplashScreen = () => {
  const sequenceDuration = 4.5; // 4.5 seconds to match App.jsx

  useEffect(() => {
    // 100% exact URL matches from Dashboard.jsx to guarantee cache hits
    const imagesToPreload = [
      'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2940&auto=format&fit=crop', // Day BG
      'https://images.unsplash.com/photo-1652454159675-11ead6275680?q=80&w=1170&auto=format&fit=crop', // Night BG
      'https://img.freepik.com/premium-photo/smart-farming-digital-technology-agriculture-app_974729-144300.jpg', // Agri-Insights
      'https://th.bing.com/th/id/R.e2c73dbf8a8f512a95ee3a2ec35f5d72?rik=DuUew48QLbwHzw&riu=http%3a%2f%2fvnmanpower.com%2fupload_images%2fimages%2fall%2ffarm-workers-from-vmst.jpg&ehk=s1NXBhEe0wVXkZGBnlrnXcEoGY1R4UtFvQ9kW7HVQ0Y%3d&risl=&pid=ImgRaw&r=0', // Service Hub
      'https://www.deere.ca/assets/images/region-4/products/harvesting/cornhead-R4A057928_RRD_1-1920x1080.jpg', // Business Zone
      'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=500', // Farm Fresh
      'https://img.freepik.com/premium-photo/agronomist-with-tablet-taking-sample-his-crops-ar-23-v-61-job-id-619beb4c01e54b488b59fcdc87c74efc_1204450-66335.jpg', // Crop Exp
      'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Farm Radio
      'https://img.freepik.com/premium-photo/farmers-shake-hands-cornfield-partnership-agreement_875825-141614.jpg', // Freelancing
      'https://static.eos.com/wp-content/uploads/2021/06/interface-tablet.jpg' // GPS Area
    ];
    
    imagesToPreload.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // --- ANIMATION TIMELINES ---
  const slashAnim = {
    scaleX: [0, 0, 1.5, 0, 0],
    opacity: [0, 0, 1, 0, 0],
  };

  const leftFruitAnim = {
    y: [-50, 40, 40, 180, 180],
    x: [0, 0, -10, -50, -50],
    rotate: [0, 0, -20, -100, -100],
    opacity: [0, 1, 1, 0, 0],
  };

  const rightFruitAnim = {
    y: [-50, 40, 40, 180, 180],
    x: [0, 0, 10, 30, 30],
    rotate: [0, 0, 20, -60, -60],
    opacity: [0, 1, 1, 0, 0],
  };

  const mixerAnim = {
    rotate: [0, 0, -8, 8, -8, 8, 0, 0, 35, 35, 0],
  };
  const mixerShakeTimes = [0, 0.35, 0.38, 0.41, 0.44, 0.47, 0.5, 0.55, 0.6, 0.8, 1];

  const mixerJuiceAnim = {
    scaleY: [0, 0, 0.9, 0.9, 0.1, 0.1],
  };
  const juiceFillTimes = [0, 0.35, 0.5, 0.6, 0.8, 1];

  const streamAnim = {
    pathLength: [0, 0, 1, 1, 0],
    pathOffset: [0, 0, 0, 0, 1],
    opacity: [0, 0, 1, 1, 0],
  };
  const streamTimes = [0, 0.58, 0.65, 0.75, 0.82];

  const glassJuiceAnim = {
    scaleY: [0, 0, 0.95, 0.95],
  };
  const glassFillTimes = [0, 0.62, 0.82, 1];

  return (
    <div style={styles.container}>
      
      {/* Animation Stage */}
      <div style={styles.stage}>
        
        {/* --- THE FRUIT --- */}
        <motion.div
          animate={leftFruitAnim}
          transition={{ duration: sequenceDuration, times: [0, 0.15, 0.2, 0.35, 1], ease: "easeInOut", repeat: Infinity, repeatDelay: 1 }}
          style={styles.leftFruit}
        />
        <motion.div
          animate={rightFruitAnim}
          transition={{ duration: sequenceDuration, times: [0, 0.15, 0.2, 0.35, 1], ease: "easeInOut", repeat: Infinity, repeatDelay: 1 }}
          style={styles.rightFruit}
        />

        {/* --- THE SLICE --- */}
        <motion.div
          animate={slashAnim}
          transition={{ duration: sequenceDuration, times: [0, 0.15, 0.17, 0.2, 1], repeat: Infinity, repeatDelay: 1 }}
          style={styles.slash}
        />

        {/* --- THE MIXER --- */}
        <motion.div
          animate={mixerAnim}
          transition={{ duration: sequenceDuration, times: mixerShakeTimes, repeat: Infinity, repeatDelay: 1 }}
          style={styles.mixerWrapper}
        >
          <div style={styles.mixerJar}>
            <motion.div
              animate={mixerJuiceAnim}
              transition={{ duration: sequenceDuration, times: juiceFillTimes, repeat: Infinity, repeatDelay: 1 }}
              style={styles.mixerJuice}
            />
          </div>
          <div style={styles.mixerBase} />
        </motion.div>

        {/* --- THE POURING STREAM --- */}
        <svg style={styles.svgContainer} viewBox="0 0 300 300">
          <motion.path
            d="M 90 190 Q 150 130 230 220"
            fill="transparent"
            stroke="#4ade80"
            strokeWidth="6"
            strokeLinecap="round"
            style={{ filter: 'drop-shadow(0 0 5px rgba(74,222,128,0.8))' }}
            animate={streamAnim}
            transition={{ duration: sequenceDuration, times: streamTimes, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 }}
          />
        </svg>

        {/* --- THE GLASS --- */}
        <div style={styles.glassWrapper}>
          <div style={styles.glassJar}>
            <motion.div
              animate={glassJuiceAnim}
              transition={{ duration: sequenceDuration, times: glassFillTimes, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 }}
              style={styles.glassJuice}
            />
          </div>
        </div>
      </div>

      {/* --- TEXT --- */}
      <div style={styles.textContainer}>
        <motion.h2 
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={styles.mainText}
        >
          EXTRACTING DATA...
        </motion.h2>
        <p style={styles.subText}>
          Processing Farm Insights • V107.0
        </p>
      </div>
      
    </div>
  );
};

// --- STYLES OBJECT (No Tailwind Required) ---
const styles = {
  container: { backgroundColor: '#000000', display: 'flex', flexDirection: 'column', height: '100vh', width: '100%', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative', fontFamily: '"Inter", sans-serif' },
  stage: { width: '300px', height: '300px', position: 'relative' },
  leftFruit: { position: 'absolute', top: '20px', left: '118px', width: '32px', height: '64px', backgroundColor: '#4ade80', borderTopLeftRadius: '64px', borderBottomLeftRadius: '64px', transformOrigin: 'right', boxShadow: '0 0 15px rgba(74,222,128,0.4)', zIndex: 10 },
  rightFruit: { position: 'absolute', top: '20px', left: '150px', width: '32px', height: '64px', backgroundColor: '#4ade80', borderTopRightRadius: '64px', borderBottomRightRadius: '64px', transformOrigin: 'left', boxShadow: '0 0 15px rgba(74,222,128,0.4)', zIndex: 10 },
  slash: { position: 'absolute', top: '50px', left: '80px', width: '140px', height: '2px', backgroundColor: '#ffffff', boxShadow: '0 0 15px white', borderRadius: '2px', transform: 'rotate(15deg)', zIndex: 20 },
  mixerWrapper: { position: 'absolute', bottom: '20px', left: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', transformOrigin: 'bottom', zIndex: 20 },
  mixerJar: { width: '60px', height: '80px', borderLeft: '2px solid rgba(255,255,255,0.3)', borderRight: '2px solid rgba(255,255,255,0.3)', borderBottom: '2px solid rgba(255,255,255,0.3)', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px', backgroundColor: 'rgba(255,255,255,0.05)', position: 'relative', display: 'flex', alignItems: 'flex-end', overflow: 'hidden' },
  mixerJuice: { width: '100%', backgroundColor: '#4ade80', transformOrigin: 'bottom' },
  mixerBase: { width: '50px', height: '16px', backgroundColor: '#1f1f1f', borderBottomLeftRadius: '6px', borderBottomRightRadius: '6px', marginTop: '2px', borderTop: '1px solid rgba(255,255,255,0.2)' },
  svgContainer: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 },
  glassWrapper: { position: 'absolute', bottom: '20px', right: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 0 },
  glassJar: { width: '45px', height: '70px', borderLeft: '2px solid rgba(255,255,255,0.2)', borderRight: '2px solid rgba(255,255,255,0.2)', borderBottom: '2px solid rgba(255,255,255,0.2)', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px', backgroundColor: 'rgba(255,255,255,0.05)', position: 'relative', display: 'flex', alignItems: 'flex-end', overflow: 'hidden' },
  glassJuice: { width: '100%', backgroundColor: '#4ade80', transformOrigin: 'bottom', boxShadow: '0 0 15px rgba(74,222,128,0.4)' },
  textContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '32px', backgroundColor: 'rgba(255,255,255,0.05)', padding: '16px 32px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' },
  mainText: { color: '#4ade80', letterSpacing: '0.25em', fontSize: '14px', fontWeight: 'bold', margin: '0 0 8px 0' },
  subText: { fontSize: '10px', color: '#888888', fontWeight: '500', letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }
};

export default SplashScreen;