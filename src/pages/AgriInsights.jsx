import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const AgriInsights = () => {
  const location = useLocation();
  const [isExplored, setIsExplored] = useState(location.state?.explored || false);
  const [activeNode, setActiveNode] = useState(null); 
  
  const [signalState, setSignalState] = useState({ active: false, node: null });
  const [greeting, setGreeting] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting('Good Morning 🌅');
    else if (hour >= 12 && hour < 17) setGreeting('Good Afternoon ☀️');
    else if (hour >= 17 && hour < 21) setGreeting('Good Evening 🌙');
    else setGreeting('Good Night 🌌');

    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    setCurrentDate(new Date().toLocaleDateString('en-IN', options));
  }, []);

  const nodes = [
    { id: 1, title: 'Market Pulse', icon: '📈', desc: 'Live Mandi Rates & Trends', route: '/market-rates', angle: -45, color: '#00E676' }, // GREEN
    { id: 2, title: 'Agri News', icon: '📰', desc: 'Global Farming Updates', route: '/news', angle: -135, color: '#00BFFF' }, // SKY BLUE
    { id: 3, title: 'Library', icon: '📚', desc: 'Expert Guides & Manuals', route: '/library', angle: 135, color: '#9D00FF' }, // VIOLET
    { id: 4, title: 'Modern Tech', icon: '🚀', desc: 'Drones & AI Precision', route: '/modern-tech', angle: 45, color: '#FF9800' } // ORANGE
  ];

  const handleNodeClick = (node) => {
    if (signalState.active) return; // Prevent double clicks
    setActiveNode(null); // Hide current display
    setSignalState({ active: true, node: node });
    
    setTimeout(() => {
      setSignalState({ active: false, node: null });
      setActiveNode(node); // Show data display
    }, 600);
  };

  const closeMenu = () => {
    setIsExplored(false);
    setActiveNode(null);
    setSignalState({ active: false, node: null });
  };

  return (
    <>
      <style>{`
        @keyframes orbit-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes orbit-spin-reverse { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
        @keyframes border-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
      <div style={styles.bg}>
        <div style={styles.overlay} />
      </div>

      <div style={styles.page}>
        <div style={styles.header}>
          <button style={styles.iconBtn} onClick={() => navigate('/dashboard')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          </button>
          <div style={styles.headerTextContainer}>
            <h2 style={styles.title}>Agri Insights</h2>
            <p style={styles.dateText}>{greeting} • {currentDate}</p>
          </div>
          <div style={{ width: '40px' }} />
        </div>

        <div style={styles.stage}>
          
          <svg style={{ position: 'absolute', width: 0, height: 0 }}>
            <defs>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
          </svg>

          <motion.div 
            style={{
              width: '250px', height: '250px', position: 'absolute', top: '50%', left: '50%', 
              marginLeft: '-125px', marginTop: '-125px', cursor: 'pointer', zIndex: 10,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              pointerEvents: isExplored ? 'none' : 'auto' 
            }}
            onClick={() => {
              if (!isExplored) setIsExplored(true);
            }}
            initial={{ scale: 1, opacity: 1, y: 40 }}
            animate={{ 
              scale: 1, 
              opacity: isExplored ? 0 : 1, // Smoothly fades out while the motor parts fly away
              y: isExplored ? -80 : 40 // Glides upward to perfectly match the menu's position
            }}
            transition={{ duration: 0.6, ease: "easeInOut" }} 
          >
            {!isExplored && (
              <div style={{ fontSize: '60px', filter: 'drop-shadow(0 0 20px rgba(0,255,119,0.3))' }}>🌾</div>
            )}
            {!isExplored && <p style={styles.tapText}>TAP TO EXPLORE</p>}
          </motion.div>

          <AnimatePresence>
            {isExplored && (
              <motion.div
                style={styles.centerBox}
                initial={{ scale: 0, opacity: 0, rotate: 90 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0, opacity: 0, rotate: -90 }}
                transition={{ type: 'spring', bounce: 0.5, delay: 0.1 }}
                onClick={closeMenu}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
              >
                {/* Spinning Border Gradient */}
                <div
                  style={{
                    position: 'absolute', top: '50%', left: '50%',
                    width: '150px', height: '150px', marginLeft: '-75px', marginTop: '-75px',
                    background: 'conic-gradient(from 0deg, transparent 40%, #00E676 55%, #00BFFF 70%, #9D00FF 85%, #FF9800 100%)',
                    zIndex: 0,
                    animation: 'border-spin 2.5s linear infinite',
                  }}
                />

                {/* Inner Container */}
                <div style={{
                  position: 'relative', zIndex: 1,
                  width: '100%', height: '100%',
                  background: 'rgba(15,15,20,0.95)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  boxShadow: 'inset 0 0 10px rgba(255,255,255,0.05)',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                {/* COLORFUL PARTICLES EFFECT */}
                <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: '14px', pointerEvents: 'none', zIndex: 0 }}>
                  {[...Array(20)].map((_, i) => {
                    const colors = ['#FF5252', '#4CAF50', '#FFEB3B', '#E040FB', '#2196F3', '#FF9800'];
                    const color = colors[Math.floor(Math.random() * colors.length)];
                    return (
                      <motion.div
                        key={`particle-${i}`}
                        style={{
                          position: 'absolute',
                          width: `${Math.random() * 3 + 2}px`,
                          height: `${Math.random() * 3 + 2}px`,
                          borderRadius: '50%',
                          backgroundColor: color,
                          boxShadow: `0 0 4px ${color}`,
                          left: `${Math.random() * 80 + 10}%`,
                          bottom: '-10px',
                        }}
                        animate={{
                          y: [0, -120],
                          x: [0, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40],
                          opacity: [0, 1, 0],
                          scale: [0, 1, 0.5]
                        }}
                        transition={{ duration: Math.random() * 2 + 1.5, repeat: Infinity, ease: 'linear', delay: Math.random() * 2 }}
                      />
                    );
                  })}
                </div>

                <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.6))', padding: '2px', position: 'relative', zIndex: 1 }}>
                  <defs>
                    <linearGradient id="coneGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#D84315" />
                      <stop offset="60%" stopColor="#FFB74D" />
                      <stop offset="100%" stopColor="#FF9800" />
                    </linearGradient>
                  </defs>
                  
                  {/* Tiny Chibi Waffle Cone Base */}
                  <path d="M 28 68 Q 50 75 72 68 L 54 95 Q 50 98 46 95 Z" fill="url(#coneGrad)" stroke="#E65100" strokeWidth="1" strokeLinejoin="round" />
                  
                  {/* Tiny 3D Waffle Cone Grid */}
                  <g stroke="#E65100" strokeWidth="1" fill="none" opacity="0.6">
                    <path d="M 34 70 Q 42 80 48 90" />
                    <path d="M 42 71 Q 48 80 52 87" />
                    <path d="M 50 72 Q 54 78 56 83" />
                    <path d="M 66 70 Q 58 80 52 90" />
                    <path d="M 58 71 Q 52 80 48 87" />
                    <path d="M 50 72 Q 46 78 44 83" />
                    <path d="M 32 75 Q 50 82 68 75" />
                    <path d="M 38 83 Q 50 88 62 83" />
                  </g>

                  {/* Ice Cream Scoop (Massive Fluffy Chibi Head) */}
                  <path d="M 18 45 C 18 10, 82 10, 82 45 C 88 48, 88 55, 78 68 C 72 75, 62 70, 60 74 C 55 80, 45 80, 42 74 C 38 70, 32 77, 24 68 C 15 70, 12 55, 18 45 Z" fill="#FFFFFF" />
                  <path d="M 18 45 C 18 10, 82 10, 82 45 C 88 48, 88 55, 78 68 C 72 75, 62 70, 60 74 C 55 80, 45 80, 42 74 C 38 70, 32 77, 24 68 C 15 70, 12 55, 18 45 Z" fill="none" stroke="#EEEEEE" strokeWidth="1.5" />
                  
                  {/* 3D Shading on Chibi Head */}
                  <path d="M 18 45 C 18 20, 50 15, 50 15 C 28 25, 24 45, 26 55 C 26 62, 24 68, 24 68 C 15 70, 12 55, 18 45 Z" fill="#E0E0E0" opacity="0.6" />
                  
                  {/* Sprinkles (Wrapped to 3/4 perspective) */}
                  <rect x="35" y="38" width="5" height="2" fill="#FF5252" rx="1" transform="rotate(30, 37, 38)" />
                  <rect x="65" y="35" width="5" height="2" fill="#4CAF50" rx="1" transform="rotate(-45, 67, 35)" />
                  <rect x="42" y="50" width="5" height="2" fill="#FFEB3B" rx="1" transform="rotate(15, 44, 50)" />
                  <rect x="75" y="50" width="5" height="2" fill="#E040FB" rx="1" transform="rotate(-20, 77, 50)" />
                  <rect x="66" y="68" width="5" height="2" fill="#2196F3" rx="1" transform="rotate(40, 66, 68)" />
                  <rect x="25" y="48" width="5" height="2" fill="#FF9800" rx="1" transform="rotate(-15, 27, 48)" />
                  <rect x="24" y="66" width="5" height="2" fill="#FF5252" rx="1" transform="rotate(45, 24, 66)" />

                  {/* Big Glistening Kawaii Eyes */}
                  <ellipse cx="36" cy="56" rx="5" ry="7.5" fill="#111111" />
                  <circle cx="37" cy="53" r="2.5" fill="#FFFFFF" />
                  <circle cx="35" cy="59" r="1.2" fill="#FFFFFF" />
                  
                  <ellipse cx="64" cy="56" rx="5" ry="7.5" fill="#111111" />
                  <circle cx="65" cy="53" r="2.5" fill="#FFFFFF" />
                  <circle cx="62" cy="59" r="1.2" fill="#FFFFFF" />

                  {/* Soft Plump Blush with Highlights */}
                  <ellipse cx="26" cy="62" rx="5.5" ry="3" fill="#FF8A80" opacity="0.8" />
                  <ellipse cx="25" cy="61" rx="1.5" ry="0.8" fill="#FFFFFF" opacity="0.6" />
                  <ellipse cx="74" cy="62" rx="5.5" ry="3" fill="#FF8A80" opacity="0.8" />
                  <ellipse cx="73" cy="61" rx="1.5" ry="0.8" fill="#FFFFFF" opacity="0.6" />

                  {/* Adorable Kitty Smile & Double-toned Tongue */}
                  <path d="M 44 58 Q 47 62 50 58 Q 53 62 56 58" fill="none" stroke="#111111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M 47 59.5 Q 50 66 53 59.5 Z" fill="#FF5252" />
                  <path d="M 48 60 Q 50 64 52 60 Z" fill="#FFCDD2" />

                  {/* The Perfect Oversized Chibi Cap (Rests cutely over the eyes, zero gaps) */}
                  <g>
                    {/* Visor/Brim (Drawn FIRST, wide bounds) */}
                    <path d="M 14 36 L 86 28 C 102 38, 90 52, 60 52 C 38 52, 22 46, 14 36 Z" fill="#1565C0" />
                    
                    {/* Visor 3D Thickness Lip */}
                    <path d="M 86 28 C 102 38, 90 52, 60 52 C 38 52, 22 46, 14 36 C 22 48, 38 54, 60 54 C 90 54, 102 40, 86 28 Z" fill="#0D47A1" />
                    
                    {/* Visor Stitching Details */}
                    <path d="M 30 40 C 45 45, 70 44, 80 36" stroke="#1976D2" strokeWidth="1" fill="none" opacity="0.8" />
                    <path d="M 32 42 C 45 47, 68 46, 78 38" stroke="#1976D2" strokeWidth="1" fill="none" opacity="0.8" />

                    {/* Cap Crown (Oversized puff overlapping the brim base flawlessly) */}
                    <path d="M 12 42 C 12 8, 42 2, 55 2 C 72 2, 88 12, 88 28 C 70 38, 35 44, 12 42 Z" fill="#2196F3" />
                    
                    {/* Crown Oversized 3D Highlight */}
                    <path d="M 15 39 C 15 12, 45 6, 50 6 C 35 10, 24 24, 15 39 Z" fill="#64B5F6" opacity="0.5" />
                    
                    {/* Realistic Cap Panels & Seams */}
                    <path d="M 55 2 Q 42 16 25 40" stroke="#1565C0" strokeWidth="1.5" fill="none" />
                    <path d="M 55 2 L 62 36" stroke="#1565C0" strokeWidth="1.5" fill="none" />
                    <path d="M 55 2 Q 72 12 82 28" stroke="#1565C0" strokeWidth="1.5" fill="none" />
                    
                    {/* Ventilation Eyelets */}
                    <circle cx="40" cy="18" r="1.5" fill="#0D47A1" opacity="0.6" />
                    <circle cx="68" cy="18" r="1.5" fill="#0D47A1" opacity="0.6" />
                    <circle cx="53" cy="14" r="1.5" fill="#0D47A1" opacity="0.6" />

                    {/* Top Button */}
                    <ellipse cx="55" cy="2" rx="5" ry="3.5" fill="#0D47A1" />
                    <ellipse cx="55" cy="1" rx="2.5" ry="1.5" fill="#64B5F6" opacity="0.8" />
                  </g>
                </svg>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isExplored && (
              <motion.div
                style={{
                  position: 'absolute', top: '50%', left: '50%',
                  x: 0, width: 0, height: 0, zIndex: 15
                }}
                initial={{ y: -80, scale: 0, opacity: 0 }}
                animate={{ y: -80, scale: 1, opacity: 1 }}
                exit={{ y: -80, scale: 0, opacity: 0 }}
                transition={{
                  y: { type: 'spring', stiffness: 300, damping: 25 },
                  scale: { type: 'spring', stiffness: 260, damping: 20 },
                  opacity: { duration: 0.3 }
                }}
              >
                <div
                  style={{ width: 0, height: 0, position: 'absolute', animation: 'orbit-spin 40s linear infinite' }}
                >
                  <svg style={{ position: 'absolute', overflow: 'visible', width: 1, height: 1, left: 0, top: 0 }}>
                    {/* Futuristic HUD Orbital Rings */}
                    <g
                      style={{ transformOrigin: 'center', animation: 'orbit-spin 40s linear infinite' }}
                    >
                      <circle cx="0" cy="0" r="85" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 8" />
                      <circle cx="0" cy="0" r="100" fill="none" stroke="rgba(0,255,119,0.1)" strokeWidth="1" strokeDasharray="20 10 5 10" />
                    </g>
                    <g
                      style={{ transformOrigin: 'center', animation: 'orbit-spin-reverse 60s linear infinite' }}
                    >
                      <circle cx="0" cy="0" r="120" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                    </g>
                  </svg>

                  {nodes.map((node, index) => {
                    const rad = (node.angle * Math.PI) / 180;
                    const radius = 145;
                    const xPos = Math.cos(rad) * radius;
                    const yPos = Math.sin(rad) * radius;
                    const isActiveNode = activeNode?.id === node.id || signalState.node?.id === node.id;

                    return (
                      <motion.div
                        key={node.id}
                        style={{
                          position: 'absolute', left: -33, top: -33,
                          width: 66, height: 66
                        }}
                        initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                        animate={{ x: xPos, y: yPos, scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: index * 0.15 }}
                      >
                        <div
                          style={{ width: '100%', height: '100%', perspective: '500px', animation: 'orbit-spin-reverse 40s linear infinite' }}
                        >
                          <motion.div
                            style={{
                              ...styles.smallNode, width: '100%', height: '100%',
                              position: 'relative',
                              overflow: 'hidden',
                              boxSizing: 'border-box'
                            }}
                            onClick={(e) => { e.stopPropagation(); handleNodeClick(node); }}
                            whileHover="hover"
                            whileTap="tap"
                            animate={isActiveNode ? "active" : "inactive"}
                            variants={{
                              hover: { 
                                scale: 1, rotateX: 0, rotateY: 0, zIndex: 50, 
                                backgroundColor: "rgba(15,15,20,0.95)", 
                                boxShadow: `0 15px 35px ${node.color}99`,
                                border: `0px solid transparent`,
                                padding: '2px'
                              },
                              tap: { scale: 1, rotateX: 0, rotateY: 0 },
                              active: {
                                scale: 1, rotateX: 0, rotateY: 0, zIndex: 50,
                                backgroundColor: "rgba(15,15,20,0.95)",
                                boxShadow: `0 0 30px ${node.color}aa`,
                                border: `0px solid transparent`,
                                padding: '2px',
                                transition: { duration: 0.3 }
                              },
                              inactive: {
                                scale: 1, rotateX: 0, rotateY: 0,
                                backgroundColor: "rgba(15,15,20,0.95)",
                                boxShadow: "0 10px 20px rgba(0,0,0,0.8)",
                                border: "0px solid transparent",
                                padding: '2px',
                                transition: { duration: 0.3 }
                              }
                            }}
                          >

                            {/* Google AI Studio Rotating Border (Active Only) */}
                            <AnimatePresence>
                              {isActiveNode && (
                                <motion.div
                                  style={{
                                    position: 'absolute', top: '50%', left: '50%',
                                    width: '150px', height: '150px', marginLeft: '-75px', marginTop: '-75px',
                                    background: 'conic-gradient(from 0deg, transparent 40%, #00E676 55%, #00BFFF 70%, #9D00FF 85%, #FF9800 100%)',
                                    zIndex: 0,
                                    animation: 'border-spin 2.5s linear infinite',
                                  }}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                />
                              )}
                            </AnimatePresence>

                            {/* Inner Card Screen (Masks the center of the gradient) */}
                            <div style={{
                              position: 'relative', zIndex: 1,
                              width: '100%', height: '100%',
                              backgroundColor: 'rgba(15,15,20,0.95)',
                              backdropFilter: 'blur(20px)',
                              WebkitBackdropFilter: 'blur(20px)',
                              borderRadius: isActiveNode ? '13px' : '15px',
                              overflow: 'hidden',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              transition: 'border-radius 0.3s'
                            }}>
                              {/* Light Glassmorphism Color Fill */}
                              <motion.div
                                variants={{ hover: { opacity: 1 }, active: { opacity: 1 }, inactive: { opacity: 0 } }}
                                style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}
                              >
                              <motion.div
                                style={{
                                  position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%',
                                  background: `conic-gradient(from 0deg, transparent, ${node.color}55, transparent, ${node.color}55, transparent)`,
                                  filter: 'blur(10px)'
                                }}
                                animate={{ rotate: [0, 360] }}
                                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                              />
                              <div style={{
                                position: 'absolute', inset: 0,
                                background: 'rgba(255, 255, 255, 0.05)',
                                backdropFilter: 'blur(8px)',
                                WebkitBackdropFilter: 'blur(8px)'
                              }} />
                            </motion.div>

                            <div style={{ ...styles.nodeIconSmall, position: 'relative', zIndex: 2 }}>{node.icon}</div>
                            </div>
                          </motion.div>

                          {/* Node Title Below */}
                          <motion.div
                            initial={{ opacity: 0, y: -10, x: "-50%" }}
                            animate={isActiveNode ? { opacity: 1, y: 0, x: "-50%" } : { opacity: 0, y: -10, x: "-50%" }}
                            transition={{ duration: 0.3 }}
                            style={{
                              position: 'absolute',
                              top: '100%',
                              left: '50%',
                              marginTop: '12px',
                              color: node.color,
                              fontSize: '11px',
                              fontWeight: 'bold',
                              whiteSpace: 'nowrap',
                              textShadow: `0 0 10px ${node.color}`,
                              pointerEvents: 'none',
                              zIndex: 10,
                              background: 'rgba(0,0,0,0.6)',
                              padding: '4px 8px',
                              borderRadius: '8px',
                              border: `1px solid ${node.color}`,
                              backdropFilter: 'blur(5px)',
                              WebkitBackdropFilter: 'blur(5px)'
                            }}
                          >
                            {node.title}
                          </motion.div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isExplored && (
              <motion.div
                style={{
                  width: '320px', height: '125px',
                  position: 'absolute', top: '50%', left: '50%', marginLeft: '-160px', marginTop: '145px',
                  zIndex: 10,
                  transformOrigin: 'top center',
                  perspective: '800px'
                }}
                initial={{ opacity: 0, rotateX: 20, y: 20, scale: 0.9 }} 
                animate={{ opacity: 1, rotateX: 5, y: 0, scale: 1 }} 
                exit={{ opacity: 0, rotateX: 20, y: 20, scale: 0.9 }}
                transition={{ duration: 0.4, type: 'spring', bounce: 0.3 }}
              >
                {/* 2. Border Masking Container */}
                <div style={{
                  position: 'absolute', inset: 0,
                  borderRadius: '24px', padding: '2px', overflow: 'hidden',
                  background: 'rgba(255,255,255,0.05)',
                  zIndex: 1,
                  boxShadow: '0 20px 40px rgba(0,0,0,0.9)',
                  boxSizing: 'border-box'
                }}>
                  {/* 3. Core Sharp Border Snake */}
                  <motion.div
                    style={{
                      position: 'absolute', top: '50%', left: '50%', 
                      width: '500px', height: '500px', marginLeft: '-250px', marginTop: '-250px',
                      background: 'conic-gradient(from 0deg, transparent 40%, #00E676 55%, #00BFFF 70%, #9D00FF 85%, #FF9800 100%)',
                      zIndex: 0
                    }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                  />

                  {/* 4. Inner Black Terminal Screen */}
                  <div style={{
                    background: 'linear-gradient(145deg, rgba(15,15,20,0.95), rgba(5,5,5,0.95))',
                    width: '100%', height: '100%',
                    borderRadius: '22px',
                    position: 'relative',
                    zIndex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: '15px 20px',
                    boxSizing: 'border-box',
                    boxShadow: 'inset 0 5px 20px rgba(0,0,0,0.8), inset 0 0 10px rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    overflow: 'hidden'
                  }}>
                    
                    {/* Smoke & Snow Atmospheric Effect */}
                    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
                      {/* Gentle Smoke / Fog */}
                      {[...Array(4)].map((_, i) => (
                        <motion.div
                          key={`smoke-${i}`}
                          style={{
                            position: 'absolute',
                            width: '80px', height: '80px',
                            background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
                            filter: 'blur(10px)',
                            left: `${Math.random() * 100 - 10}%`,
                            bottom: '-40px'
                          }}
                          animate={{
                            y: [0, -160],
                            x: [0, (Math.random() - 0.5) * 60],
                            opacity: [0, 1, 0],
                            scale: [1, 2.5]
                          }}
                          transition={{ duration: Math.random() * 5 + 5, repeat: Infinity, ease: 'linear', delay: Math.random() * 3 }}
                        />
                      ))}
                      {/* Digital Snow */}
                      {[...Array(25)].map((_, i) => (
                        <motion.div
                          key={`snow-${i}`}
                          style={{
                            position: 'absolute',
                            width: `${Math.random() * 2 + 1}px`, height: `${Math.random() * 2 + 1}px`,
                            backgroundColor: 'rgba(255,255,255,0.8)',
                            borderRadius: '50%',
                            boxShadow: '0 0 5px #fff',
                            left: `${Math.random() * 100}%`,
                            top: '-10px',
                          }}
                          animate={{
                            y: [0, 150],
                            x: [0, (Math.random() - 0.5) * 40],
                            opacity: [0, 1, 0]
                          }}
                          transition={{ duration: Math.random() * 3 + 2, repeat: Infinity, ease: 'linear', delay: Math.random() * 3 }}
                        />
                      ))}
                    </div>

                    <AnimatePresence mode="wait">
                      {activeNode ? (
                        <motion.div 
                          key={activeNode.id} 
                          initial={{ opacity: 1 }} 
                          animate={{ opacity: 1 }} 
                          exit={{ opacity: 0 }} 
                          transition={{ duration: 0.2 }} 
                          style={{ ...styles.activeContent, position: 'relative', zIndex: 2 }}
                        >
                          <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                            <motion.span 
                              initial={{ opacity: 0 }} 
                              animate={{ opacity: 1 }} 
                              style={{fontSize: '32px', filter: `drop-shadow(0 0 8px ${activeNode.color})`}}
                            >
                              {activeNode.icon}
                            </motion.span>
                            <div>
                              <h3 style={{margin: '0 0 4px 0', fontSize: '14px', color: '#fff', fontFamily: "'SFMono-Regular', Consolas, monospace", fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase'}}>
                                {activeNode.title.split('').map((char, i) => (
                                  <motion.span key={i} initial={{opacity: 0}} animate={{opacity: 1}} transition={{delay: i * 0.05}}>{char === ' ' ? '\u00A0' : char}</motion.span>
                                ))}
                              </h3>
                              <p style={{margin: 0, fontSize: '11px', color: '#a1a1aa', fontFamily: 'system-ui, -apple-system, sans-serif', lineHeight: '1.4', letterSpacing: '0.5px'}}>
                                {activeNode.desc.split('').map((char, i) => (
                                  <motion.span key={i} initial={{opacity: 0}} animate={{opacity: 1}} transition={{delay: (activeNode.title.length * 0.05) + (i * 0.03)}}>{char === ' ' ? '\u00A0' : char}</motion.span>
                                ))}
                              </p>
                            </div>
                          </div>
                          <motion.button 
                            style={{
                              ...styles.launchBtn, 
                              fontFamily: "'SFMono-Regular', Consolas, monospace", 
                              background: `${activeNode.color}1a`, 
                              border: `1px solid ${activeNode.color}4d`, 
                              color: activeNode.color, 
                              borderRadius: '6px', 
                              letterSpacing: '2px', 
                              fontSize: '11px',
                              textTransform: 'uppercase',
                              padding: '10px',
                              boxShadow: `inset 0 0 10px ${activeNode.color}1a`,
                              textShadow: 'none'
                            }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: (activeNode.title.length * 0.05) + (activeNode.desc.length * 0.03) + 0.1 }}
                            whileHover={{ scale: 1.02, backgroundColor: `${activeNode.color}26`, borderColor: activeNode.color, boxShadow: `0 0 15px ${activeNode.color}33` }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate(activeNode.route)}
                          >{">"} LAUNCH_MODULE</motion.button>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="idle"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', position: 'relative', zIndex: 2 }}
                        >
                          <motion.span
                            animate={{ opacity: [1, 0, 1] }}
                            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                            style={{ color: '#00ff77', fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace", fontSize: '20px', fontWeight: 'bold' }}
                          >
                            _
                          </motion.span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </>
  );
};

// --- STYLES ---
const styles = {
  bg: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, backgroundColor: '#000', overflow: 'hidden' },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.15)', zIndex: 1 },
  page: { position: 'relative', zIndex: 10, padding: '20px', height: '100dvh', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: 'system-ui, sans-serif', boxSizing: 'border-box' },
  header: { background: 'rgba(20,20,20,0.6)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', width: '100%', maxWidth: '400px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderRadius: '24px', marginBottom: '10px', color: 'white', boxSizing: 'border-box', border: '1px solid rgba(255,255,255,0.1)', zIndex: 50 },
  headerTextContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  title: { margin: 0, fontSize: '18px', fontWeight: '600' },
  dateText: { margin: '4px 0 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
  iconBtn: { background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' },
  
  stage: { position: 'relative', flex: 1, width: '100%', maxWidth: '400px', overflow: 'visible', display: 'flex', alignItems: 'center', justifyContent: 'center' },

  tapText: { position: 'absolute', bottom: '-30px', zIndex: 20, color: '#00ff77', fontSize: '11px', fontWeight: 'bold', letterSpacing: '2px', margin: 0, textShadow: '0 0 10px rgba(0,255,119,0.8)', background: 'rgba(0,0,0,0.6)', padding: '4px 10px', borderRadius: '10px' },

  centerBox: {
    position: 'absolute', top: '50%', left: '50%',
    width: '72px', height: '72px', marginLeft: '-36px', marginTop: '-116px', 
    borderRadius: '16px',
    boxShadow: '0 15px 35px rgba(0,0,0,0.6)',
    cursor: 'pointer', zIndex: 20,
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', padding: '2px', boxSizing: 'border-box'
  },

  smallNode: { 
    width: '66px', height: '66px', 
    background: 'rgba(255, 255, 255, 0.05)', 
    backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', 
    borderTop: '1px solid rgba(255,255,255,0.4)', borderLeft: '1px solid rgba(255,255,255,0.4)', 
    borderRadius: '15px', 
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 
  },
  nodeIconSmall: { fontSize: '28px', filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.5))' },

  displayScreen: { width: '320px', height: '125px', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)', borderRadius: '24px', padding: '15px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 10, boxSizing: 'border-box' },
  
  activeContent: { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' },
  launchBtn: { background: 'linear-gradient(90deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#fff', textShadow: '0 0 8px rgba(255,255,255,0.5)', padding: '8px', borderRadius: '12px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: 'all 0.3s ease', marginTop: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' },

};

export default AgriInsights;