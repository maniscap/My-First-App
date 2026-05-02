import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

// Floating cinematic snow particles
const dustParticles = Array.from({ length: 80 }).map((_, i) => ({
  id: i,
  size: Math.random() * 3 + 1.5,
  left: `${Math.random() * 100}vw`,
  drift: Math.random() * 40 - 20,
  dur: Math.random() * 5 + 4,
  delay: Math.random() * 4,
}));

const SplashScreen = () => {

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

  // Cinematic spotlight configuration: flicker on, then continuously sweep
  const flickerOpacity = [0, 0.6, 0.1, 0.9];
  const opacityTransition = { duration: 1.2, times: [0, 0.15, 0.3, 1], ease: "easeOut", delay: 0.8 };
  
  const sweepRotate = [0, 45, -45, 0]; // Wide angles so the text becomes completely invisible
  const rotateTransition = { duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2.5 };

  return (
    <div style={styles.container}>
      {/* LAYER 0.5: Cinematic Dust Particles */}
      <div style={styles.dustLayer}>
        {dustParticles.map((p) => (
          <motion.div
            key={p.id}
            style={{
              position: 'absolute',
              left: p.left,
              bottom: '-5vh',
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: '#ffffff',
              borderRadius: '50%',
              boxShadow: '0 0 6px rgba(255,255,255,0.9)',
            }}
            animate={{
              y: ['0vh', '-110vh'],
              x: [0, p.drift, -p.drift, 0],
              opacity: [0, 0.9, 0.9, 0]
            }}
            transition={{
              duration: p.dur,
              repeat: Infinity,
              delay: p.delay,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* LAYER 1 & 2: Static Content (100% Invisible in the dark until light hits) */}
      <motion.div 
        style={styles.contentWrapper}
        initial={{ scale: 0.95, y: 15 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ duration: 12, ease: "easeOut" }}
      >
        {/* 3D TEXT WITH EMOJI & TAGLINE */}
        <div style={styles.textContainer}>
          <motion.h1 
            style={styles.dabur3DTitle}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.5, delay: 0.8, ease: "easeOut" }}
          >
            🧢 FARM<span style={styles.dabur3DGreen}>CAP</span>
          </motion.h1>
          <motion.p 
            style={styles.subText}
            initial={{ letterSpacing: '0.05em', opacity: 0, y: 10 }}
            animate={{ letterSpacing: '0.2em', opacity: 1, y: 0 }}
            transition={{ 
              opacity: { duration: 1.5, delay: 1.2, ease: "easeOut" },
              y: { duration: 1.5, delay: 1.2, ease: "easeOut" },
              letterSpacing: { duration: 10, ease: "easeOut" }
            }}
          >
            — GROWING SMARTER TOGETHER —
          </motion.p>
        </div>
      </motion.div>

      {/* LAYER 3: THE DARKNESS MULTIPLY MASK (Hides everything outside the light beam) */}
      <div style={styles.maskLayer}>
        <motion.div 
          style={styles.multiplyCone}
          initial={{ opacity: 0, rotate: 0 }}
          animate={{ opacity: flickerOpacity, rotate: sweepRotate }}
          transition={{ opacity: opacityTransition, rotate: rotateTransition }}
        />
        {/* Forces the bottom of the screen to remain pitch black so light doesn't leak down */}
        <div style={styles.darknessFloor} />
      </div>

      {/* LAYER 3.5: VOLUMETRIC LIGHT RAYS (The visible, dusty beam cutting through the air) */}
      <div style={styles.rayLayer}>
        <motion.div 
          style={styles.rayCone}
          initial={{ opacity: 0, rotate: 0 }}
          animate={{ opacity: flickerOpacity, rotate: sweepRotate }}
          transition={{ opacity: opacityTransition, rotate: rotateTransition }}
        />
      </div>

      {/* LAYER 4: The Physical Spotlight Fixture (Visible above mask) */}
      <div style={styles.fixtureWrapper}>
        <div style={styles.fixtureMount}></div>
        <motion.div 
          style={styles.fixtureBody}
          initial={{ rotate: 0 }}
          animate={{ rotate: sweepRotate }}
          transition={rotateTransition}
        >
          <motion.div 
            style={styles.fixtureBulb} 
            initial={{ opacity: 0 }}
            animate={{ opacity: flickerOpacity }}
            transition={opacityTransition}
          />
        </motion.div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#000000',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
  },
  dustLayer: {
    position: 'absolute',
    inset: 0,
    zIndex: 5,
    pointerEvents: 'none',
  },
  fixtureWrapper: {
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 60, // Keep fixture visible above the darkness mask
  },
  fixtureMount: {
    width: '16px',
    height: '14px',
    background: 'linear-gradient(to bottom, #0a0a0a, #333)',
    borderBottomLeftRadius: '4px',
    borderBottomRightRadius: '4px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.5)',
  },
  fixtureBody: {
    width: '34px',
    height: '45px',
    background: 'linear-gradient(90deg, #111 0%, #444 50%, #111 100%)',
    borderTopLeftRadius: '8px',
    borderTopRightRadius: '8px',
    borderBottomLeftRadius: '2px',
    borderBottomRightRadius: '2px',
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    transformOrigin: 'top center',
    boxShadow: '0 5px 15px rgba(0,0,0,0.8)',
  },
  fixtureBulb: {
    position: 'absolute',
    bottom: '-2px',
    width: '26px',
    height: '6px',
    background: '#ffffff',
    borderRadius: '50%',
    boxShadow: '0 0 15px 3px rgba(255, 255, 255, 0.7), 0 0 30px 10px rgba(255, 255, 255, 0.3)',
    zIndex: 62,
  },
  maskLayer: {
    position: 'fixed',
    inset: 0,
    backgroundColor: '#000000',
    mixBlendMode: 'multiply',
    pointerEvents: 'none',
    zIndex: 50,
    overflow: 'hidden'
  },
  darknessFloor: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '35vh',
    background: 'linear-gradient(to top, #000000 0%, #000000 50%, transparent 100%)',
  },
  multiplyCone: {
    position: 'absolute',
    top: 0,
    left: '-100vw',
    width: '300vw',
    height: '200vh',
    transformOrigin: 'top center',
    // Pitch black outside, bright pure white inside the beam. Multiply mode hides content perfectly.
    background: 'conic-gradient(at 50% 0%, #000000 0deg, #000000 147deg, #ffffff 155deg, #ffffff 205deg, #000000 213deg, #000000 360deg)',
  },
  rayLayer: {
    position: 'fixed',
    inset: 0,
    mixBlendMode: 'screen',
    pointerEvents: 'none',
    zIndex: 51,
    overflow: 'hidden',
    // Sharp fade out below the text so the beam doesn't continue infinitely
    WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 75%)',
    maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 75%)',
  },
  rayCone: {
    position: 'absolute',
    top: 0,
    left: '-100vw',
    width: '300vw',
    height: '200vh',
    transformOrigin: 'top center',
    // Beautiful, translucent glowing white rays in the air
    background: 'conic-gradient(at 50% 0%, transparent 0deg, transparent 147deg, rgba(255,255,255,0.02) 150deg, rgba(255,255,255,0.2) 157deg, rgba(255,255,255,0.2) 203deg, rgba(255,255,255,0.02) 210deg, transparent 213deg, transparent 360deg)',
  },
  contentWrapper: {
    zIndex: 10,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: '30px', // Push content down slightly so beam catches it beautifully
  },
  textContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '40px',
  },
  dabur3DTitle: {
    fontSize: '2.8rem',
    fontWeight: '900',
    fontFamily: '"Georgia", "Times New Roman", serif',
    lineHeight: 1,
    color: '#ffffff',
    margin: 0,
    letterSpacing: '0.05em',
    textShadow: '0px 1px 0px #ccc, 0px 2px 0px #bbb, 0px 3px 0px #aaa, 0px 4px 0px #999, 0px 5px 0px #888, 0px 12px 15px rgba(0,0,0,0.8)',
  },
  dabur3DGreen: {
    color: '#22c55e',
    textShadow: '0px 1px 0px #16a34a, 0px 2px 0px #15803d, 0px 3px 0px #166534, 0px 4px 0px #14532d, 0px 5px 0px #064e3b, 0px 12px 15px rgba(0,0,0,0.8)',
    marginLeft: '6px',
  },
  subText: {
    color: '#ffffff',
    fontSize: '0.65rem',
    fontWeight: '700',
    margin: 0,
    textShadow: '0 2px 4px rgba(0,0,0,0.8)',
  },
};

export default SplashScreen;