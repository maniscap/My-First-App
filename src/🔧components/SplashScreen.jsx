import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const treeVariants = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.9, ease: 'easeOut' } },
};

const ringVariants = {
  pulse: {
    scale: [1, 1.04, 1],
    opacity: [0.15, 0.42, 0.15],
    transition: { duration: 3.4, ease: 'easeInOut', repeat: Infinity },
  },
};

const leafVariants = {
  hidden: { scale: 0.2, opacity: 0 },
  visible: (i) => ({
    scale: 1,
    opacity: 1,
    transition: { duration: 0.8, ease: 'easeOut', delay: 0.8 + i * 0.12 },
  }),
};

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

  // --- TYPEWRITER STATE ---
  const brandName = "FARMCAP";
  const [typedBrand, setTypedBrand] = useState('');
  const [typingStarted, setTypingStarted] = useState(false);

  // Delay the start of the animation + typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setTypingStarted(true);
    }, 1500); // Start typing after 1.5s
    return () => clearTimeout(timer);
  }, []);

  // Typewriter effect logic
  useEffect(() => {
    if (typingStarted && typedBrand.length < brandName.length) {
      const timeoutId = setTimeout(() => {
        setTypedBrand(brandName.slice(0, typedBrand.length + 1));
      }, 150); // Typing speed in ms
      return () => clearTimeout(timeoutId);
    }
  }, [typingStarted, typedBrand]);

  return (
    <div style={styles.container}>
      <motion.div
        style={styles.glowRing}
        animate="pulse"
        variants={ringVariants}
      />

      <motion.div
        style={styles.treeWrapper}
        initial="hidden"
        animate="visible"
        variants={treeVariants}
      >
        <svg width="220" height="220" viewBox="0 0 220 220" style={styles.svgContainer}>
          <defs>
            <linearGradient id="treeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#86efac" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
            <filter id="treeGlow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <motion.path
            d="M110 195 C110 195, 108 135, 110 94"
            stroke="#d9f99d"
            strokeWidth="12"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.1, ease: 'easeInOut' }}
          />

          <motion.path
            d="M110 90 C110 90, 96 80, 90 66"
            fill="none"
            stroke="url(#treeGradient)"
            strokeWidth="10"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.6, ease: 'easeOut' }}
          />

          <motion.path
            d="M110 90 C110 90, 124 80, 130 66"
            fill="none"
            stroke="url(#treeGradient)"
            strokeWidth="10"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.7, ease: 'easeOut' }}
          />

          {[0, 1, 2, 3, 4].map((index) => (
            <motion.circle
              key={index}
              cx={92 + index * 7}
              cy={62 - (index % 2) * 10}
              r="12"
              fill="url(#treeGradient)"
              style={{ filter: 'url(#treeGlow)' }}
              custom={index}
              variants={leafVariants}
              initial="hidden"
              animate="visible"
            />
          ))}

          <motion.line
            x1="60"
            y1="199"
            x2="160"
            y2="199"
            stroke="#4ade80"
            strokeWidth="6"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.9, ease: 'easeOut' }}
          />
        </svg>
      </motion.div>

      <div style={styles.textContainer}>
        <motion.h1
          style={styles.brandTitle}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.8, ease: 'easeOut' }}
        >
          <span>{typedBrand.slice(0, 4)}</span>
          <span style={styles.capHighlight}>{typedBrand.slice(4)}</span>
          {typedBrand.length < brandName.length && (
            <motion.span
              style={styles.cursor}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 0.75, repeat: Infinity }}
            >
              |
            </motion.span>
          )}
        </motion.h1>
        {typedBrand.length === brandName.length && (
          <motion.p
            style={styles.subText}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.05, ease: 'easeOut' }}
          >
            MODERN FARMING PLATFORM
          </motion.p>
        )}
      </div>
    </div>
  );
};

// --- STYLES OBJECT (No Tailwind Required) ---
const styles = {
  container: {
    backgroundColor: '#050816',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    fontFamily: '"SF Pro Display", "Inter", sans-serif',
    color: '#f8fafc',
  },
  glowRing: {
    position: 'absolute',
    width: '360px',
    height: '360px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(34,197,94,0.22) 0%, rgba(34,197,94,0) 68%)',
    zIndex: 1,
  },
  treeWrapper: {
    zIndex: 2,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '24px',
    width: '240px',
    height: '240px',
  },
  svgContainer: {
    pointerEvents: 'none',
    width: '100%',
    height: '100%',
  },
  textContainer: {
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: '12px',
    textAlign: 'center',
  },
  brandTitle: {
    fontSize: '3.8rem',
    fontWeight: '700',
    letterSpacing: '0.18em',
    color: '#f8fafc',
    margin: 0,
    padding: 0,
    lineHeight: 1,
  },
  capHighlight: {
    color: '#7cfc00',
    textShadow: '0 0 18px rgba(124, 252, 0, 0.24)',
  },
  cursor: {
    fontWeight: '600',
    color: '#a7f3d0',
    marginLeft: '6px',
  },
  subText: {
    fontSize: '0.95rem',
    color: '#cbd5e1',
    fontWeight: '500',
    letterSpacing: '0.18em',
    margin: '18px 0 0 0',
    textTransform: 'uppercase',
  },
};

export default SplashScreen;