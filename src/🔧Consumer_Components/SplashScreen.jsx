import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

// Minimal floating particles
const fireflies = Array.from({ length: 50 }).map((_, i) => ({
  id: i,
  size: Math.random() * 3 + 1,
  left: `${Math.random() * 100}vw`,
  bottom: `${Math.random() * -20 - 10}vh`,
  xOffset: Math.random() * 40 - 20,
  duration: Math.random() * 8 + 6,
  delay: Math.random() * 5,
  opacity: Math.random() * 0.4 + 0.1,
}));

// Custom growing sprout animation
const GrowingSprout = ({ size = 52, color = "#4ade80", strokeWidth = 1.5 }) => {
  const stemVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: { duration: 1.2, ease: "easeInOut" }
    }
  };

  const leafVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: { duration: 1.2, ease: "easeOut", delay: 0.6 }
    }
  };

  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      initial="hidden"
      animate="visible"
    >
      {/* Dirt and Stem */}
      <motion.path d="M7 20h10" variants={stemVariants} />
      <motion.path d="M10 20c5.5-2.5.8-6.4 3-10" variants={stemVariants} />
      {/* Left and Right Leaves */}
      <motion.path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" variants={leafVariants} />
      <motion.path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" variants={leafVariants} />
    </motion.svg>
  );
};

const SplashScreen = () => {

  useEffect(() => {
    const imagesToPreload = [
      'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=1200&auto=format&fit=crop', // Day BG
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

  return (
    <div style={styles.container}>

      {/* LAYER 1: Floating Particles */}
      <div style={styles.particlesContainer}>
        {fireflies.map((f) => (
          <motion.div
            key={f.id}
            style={{
              position: 'absolute',
              left: f.left,
              bottom: f.bottom,
              width: `${f.size}px`,
              height: `${f.size}px`,
              backgroundColor: '#ffffff',
              borderRadius: '50%',
            }}
            animate={{
              y: ['0vh', '-110vh'],
              x: [0, f.xOffset, -f.xOffset, 0],
              opacity: [0, f.opacity, f.opacity, 0]
            }}
            transition={{
              duration: f.duration,
              repeat: Infinity,
              delay: f.delay,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* LAYER 2: Main Content */}
      <div style={styles.content}>
        
        <motion.div
          initial={{ scale: 0.5, opacity: 0, rotate: -15 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          style={styles.iconWrapper}
        >
          <GrowingSprout size={64} color="#4ade80" strokeWidth={1.5} />
        </motion.div>

        <motion.h1
          style={styles.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
        >
          🧢 FARM<span style={styles.titleHighlight}>CAP</span>
        </motion.h1>

        <motion.div
          style={styles.divider}
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: '60px', opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
        />

        <motion.p
          style={styles.subtitle}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 0.9, ease: "easeOut" }}
        >
          GROWING SMARTER TOGETHER
        </motion.p>

      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#020617', // Very dark slate, almost black
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Inter", sans-serif',
  },
  particlesContainer: {
    position: 'absolute',
    inset: 0,
    zIndex: 1,
    pointerEvents: 'none',
  },
  content: {
    zIndex: 10,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: '3.5rem',
    fontWeight: '800',
    color: '#ffffff',
    margin: '0',
    letterSpacing: '0.02em',
  },
  titleHighlight: {
    color: '#4ade80',
  },
  divider: {
    height: '2px',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
    margin: '1.5rem 0 1rem 0',
    borderRadius: '2px',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: '0.8rem',
    fontWeight: '600',
    margin: 0,
    textTransform: 'uppercase',
    letterSpacing: '0.25em',
  },
};

export default SplashScreen;