import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Float, PresentationControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import farmBg from '../assets/farm-bg.mp4';

// --- THE FIXED MOTOR (No Gyro Rings, Restored Falling Assembly Physics) ---
const Motor3D = ({ isExplored }) => {
  const { nodes } = useGLTF('/models/motor.glb');
  
  const groupRef = useRef();
  const topRef = useRef();
  const bottomRef = useRef();
  const glassRef = useRef();
  const hologramRef = useRef();
  const lightRef = useRef();
  
  const particlesRef = useRef();

  const particleData = React.useMemo(() => Array.from({ length: 400 }, () => ({
    x: (Math.random() - 0.5) * 4,
    y: (Math.random() - 0.5) * 6,
    z: (Math.random() - 0.5) * 4,
    speed: Math.random() * 2.0 + 0.5,
    factor: Math.random() * 100
  })), []);

  const [isAssembled, setIsAssembled] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsAssembled(true), 400);
    return () => clearTimeout(timer);
  }, []);

  const materials = React.useMemo(() => ({
    iron: new THREE.MeshPhysicalMaterial({ color: '#b0b0c0', metalness: 0.9, roughness: 0.15, clearcoat: 0.8 }),
    copper: new THREE.MeshPhysicalMaterial({ color: '#ff5500', metalness: 0.7, roughness: 0.2, emissive: new THREE.Color('#ff2200'), emissiveIntensity: 0 }),
    plastic: new THREE.MeshPhysicalMaterial({ color: '#0a0a0a', metalness: 0.9, roughness: 0.2, clearcoat: 1.0 })
  }), []);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    groupRef.current.rotation.y += delta * 0.1; 
    groupRef.current.rotation.x = 0.15; 

    // 🚨 THE FIX: When explored, pieces fly to 150. When closing, they fall back to 0.
    const topTargetY = (!isAssembled || isExplored) ? 150 : 0; 
    const bottomTargetY = (!isAssembled || isExplored) ? -150 : 0;
    const glassTargetY = (!isAssembled || isExplored) ? 250 : 20; 

    topRef.current.position.y = THREE.MathUtils.lerp(topRef.current.position.y, topTargetY, delta * 2.5);
    bottomRef.current.position.y = THREE.MathUtils.lerp(bottomRef.current.position.y, bottomTargetY, delta * 2.5);
    glassRef.current.position.y = THREE.MathUtils.lerp(glassRef.current.position.y, glassTargetY, delta * 2.5);

    const hue = (time * 0.2) % 1; 
    
    materials.copper.emissive.setHSL(hue, 1, 0.5);
    materials.copper.emissiveIntensity = 1.5 + Math.sin(time * 5) * 0.5;

    if (hologramRef.current) {
      hologramRef.current.children[0].material.color.setHSL(hue, 1, 0.5);
      hologramRef.current.children[1].material.emissive.setHSL(hue, 1, 0.8);
      hologramRef.current.scale.setScalar(0.5);
      hologramRef.current.rotation.x += delta * 1;
      hologramRef.current.rotation.z += delta * 1;
    }

    if (particlesRef.current) {
      particlesRef.current.children.forEach((p, i) => {
        p.position.y += delta * particleData[i].speed * 0.5;
        p.position.x += Math.sin(time * 2 + particleData[i].factor) * 0.002;
        p.position.z += Math.cos(time * 2 + particleData[i].factor) * 0.002;
        if (p.position.y > 3) p.position.y = -3; 
        
        p.material.color.setHSL((hue + particleData[i].factor) % 1, 1, 0.6);
        p.material.opacity = THREE.MathUtils.lerp(p.material.opacity, 0.8, delta * 2);
      });
    }

    if (lightRef.current) {
      lightRef.current.color.setHSL(hue, 1, 0.5);
      lightRef.current.intensity = 8 + Math.sin(time * 5) * 2;
    }
  });

  return (
    <group ref={groupRef} dispose={null} scale={40}> 
      <group scale={0.01}>
        <group ref={topRef}>
          <mesh geometry={nodes.Rotor_Iron_MAT001_0.geometry} material={materials.iron} scale={100} />
          <mesh geometry={nodes.Hub_BlackPlast_MAT001_0.geometry} material={materials.plastic} scale={100} />
        </group>
        <group ref={bottomRef}>
          <mesh geometry={nodes.Coils_Coil_MAT001_0.geometry} material={materials.copper} scale={100} />
          <mesh geometry={nodes.Cores_Iron_MAT001_0.geometry} material={materials.iron} scale={100} />
          <mesh geometry={nodes.Spools_BlackPlast_MAT001_0.geometry} material={materials.plastic} scale={100} />
        </group>
        <mesh ref={glassRef} scale={100}>
          <cylinderGeometry args={[1.4, 1.4, 0.05, 64]} />
          <meshPhysicalMaterial color="#ffffff" transmission={0.9} opacity={1} metalness={0.1} roughness={0.1} ior={1.5} thickness={0.5} />
        </mesh>
        <group ref={hologramRef} position={[0, 0, 0]} scale={100}>
          <mesh>
            <icosahedronGeometry args={[0.5, 1]} />
            <meshBasicMaterial wireframe={true} />
          </mesh>
          <mesh>
            <octahedronGeometry args={[0.2, 0]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} />
          </mesh>
          <pointLight ref={lightRef} distance={200} decay={2} />
        </group>
        
        {/* GYRO RINGS COMPLETELY REMOVED */}

        <group ref={particlesRef} scale={100}>
          {particleData.map((p, i) => (
            <mesh key={i} position={[p.x, p.y, p.z]}>
              <sphereGeometry args={[0.015, 8, 8]} />
              <meshBasicMaterial color="#00ff77" transparent opacity={0} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
};

useGLTF.preload('/models/motor.glb');

const AgriInsights = () => {
  const [isExplored, setIsExplored] = useState(false);
  const [activeNode, setActiveNode] = useState(null); 
  
  const [signalState, setSignalState] = useState({ active: false, node: null, step: 0 });
  const [isMuted, setIsMuted] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const navigate = useNavigate();
  const videoRef = useRef(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting('Good Morning 🌅');
    else if (hour >= 12 && hour < 17) setGreeting('Good Afternoon ☀️');
    else if (hour >= 17 && hour < 21) setGreeting('Good Evening 🌙');
    else setGreeting('Good Night 🌌');

    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    setCurrentDate(new Date().toLocaleDateString('en-IN', options));

    if (videoRef.current) {
      videoRef.current.muted = isMuted;
      videoRef.current.play().catch(err => {
        console.log("Autoplay with sound blocked, falling back to muted:", err);
        setIsMuted(true); // Update the UI toggle to reflect it's muted
        videoRef.current.muted = true; // Instantly mute the DOM element
        videoRef.current.play().catch(e => console.log("Muted autoplay also blocked:", e));
      });
    }
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const nodes = [
    { id: 1, title: 'Market Pulse', icon: '📈', desc: 'Live Mandi Rates & Trends', route: '/market-rates', angle: -35 },
    { id: 2, title: 'Agri News', icon: '📰', desc: 'Global Farming Updates', route: '/news', angle: -145 },
    { id: 3, title: 'Library', icon: '📚', desc: 'Expert Guides & Manuals', route: '/library', angle: 145 },
    { id: 4, title: 'Modern Tech', icon: '🚀', desc: 'Drones & AI Precision', route: '/modern-tech', angle: 35 }
  ];

  const handleNodeClick = (node) => {
    if (signalState.active) return; // Prevent double clicks
    setActiveNode(null); // Hide current display
    setSignalState({ active: true, node: node, step: 1 });
    
    setTimeout(() => {
      setSignalState({ active: true, node: node, step: 2 });
      setTimeout(() => {
        setSignalState({ active: false, node: null, step: 0 });
        setActiveNode(node); // Show data display
      }, 500);
    }, 500);
  };

  const closeMenu = () => {
    setIsExplored(false);
    setActiveNode(null);
    setSignalState({ active: false, node: null, step: 0 });
  };

  return (
    <>
      <div style={styles.bg}>
        <video ref={videoRef} autoPlay loop muted={isMuted} playsInline crossOrigin="anonymous" style={styles.vid}>
          <source src={farmBg} type="video/mp4" />
        </video>
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
          <button style={styles.iconBtn} onClick={() => setIsMuted(!isMuted)}>
            {isMuted ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
            )}
          </button>
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

          <svg style={{ position: 'absolute', top: '50%', left: '50%', width: 1, height: 1, overflow: 'visible', zIndex: 1, pointerEvents: 'none' }}>
            <AnimatePresence>
              {isExplored && (
                <motion.g key="main-pipeline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
                  {/* Holographic Vertical Data Link */}
                  <line x1="0" y1="-80" x2="0" y2="145" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="4 4" />
                  
                  {/* HUD Brackets / Tech Accents */}
                  <path d="M -10 145 L 0 155 L 10 145" fill="none" stroke="rgba(0,255,119,0.5)" strokeWidth="2" />
                  <circle cx="0" cy="-80" r="15" fill="none" stroke="rgba(0,255,119,0.3)" strokeWidth="1" strokeDasharray="2 4" />

                  {(activeNode || signalState.active) && (
                    <line x1="0" y1="-80" x2="0" y2="145" stroke="#00ff77" strokeWidth="2" filter="url(#glow)" />
                  )}

                  {signalState.active && signalState.step === 2 && (
                     <motion.line 
                       x1="0" x2="0"
                       stroke="#00ff77" strokeWidth="4" strokeLinecap="round" filter="url(#glow)"
                       initial={{ y1: -80, y2: -80 }}
                       animate={{ y1: [-80, -80, 145], y2: [-80, 145, 145] }}
                       transition={{ duration: 0.5, ease: "easeInOut" }}
                     />
                  )}
                </motion.g>
              )}
            </AnimatePresence>
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
            <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
              <Canvas camera={{ position: [0, 4, 12], fov: 45 }}>
                <ambientLight intensity={1.5} />
                <directionalLight position={[10, 10, 10]} intensity={3} color="#ffffff" />
                <directionalLight position={[-10, -10, -10]} intensity={1} color="#00ff77" />
                <Environment preset="city" />
                
                <Float speed={1} rotationIntensity={0.5} floatIntensity={1}>
                  <PresentationControls global polar={[-0.4, 0.2]} azimuth={[-0.4, 0.2]}>
                    <Suspense fallback={null}>
                      {/* Passing isExplored so the parts know when to fall */}
                      <Motor3D isExplored={isExplored} /> 
                    </Suspense>
                  </PresentationControls>
                </Float>
              </Canvas>
            </div>
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
                <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.6))', padding: '2px' }}>
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
                <motion.div
                  style={{ width: 0, height: 0, position: 'absolute' }}
                  animate={{ scale: [1, 1.03, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <svg style={{ position: 'absolute', overflow: 'visible', width: 1, height: 1, left: 0, top: 0 }}>
                    {/* Futuristic HUD Orbital Rings */}
                    <motion.g
                      animate={{ rotate: 360 }}
                      transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                    >
                      <circle cx="0" cy="0" r="85" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 8" />
                      <circle cx="0" cy="0" r="100" fill="none" stroke="rgba(0,255,119,0.1)" strokeWidth="1" strokeDasharray="20 10 5 10" />
                    </motion.g>
                    <motion.g
                      animate={{ rotate: -360 }}
                      transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                    >
                      <circle cx="0" cy="0" r="120" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                    </motion.g>

                    {nodes.map(node => {
                      const isActiveNode = activeNode?.id === node.id || signalState.node?.id === node.id;

                      return (
                        <g key={`pipe-${node.id}`} transform={`rotate(${node.angle})`}>
                          {/* Holographic Fiber Optic Link */}
                          <line x1="135" y1="0" x2="0" y2="0" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                          
                          {/* Laser Data Stream */}
                          <motion.line 
                            x1="135" y1="0" x2="0" y2="0" 
                            stroke="rgba(0,255,119,0.6)" strokeWidth="1.5" strokeDasharray="3 10"
                            animate={{ strokeDashoffset: [0, -26] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                          />

                          {/* Node Connector Ring */}
                          <circle cx="135" cy="0" r="10" fill="none" stroke="rgba(0,255,119,0.2)" strokeWidth="1" />

                          {isActiveNode && (
                            <>
                              <line x1="135" y1="0" x2="0" y2="0" stroke="#00ff77" strokeWidth="2" filter="url(#glow)" />
                              <circle cx="135" cy="0" r="12" fill="none" stroke="#00ff77" strokeWidth="2" filter="url(#glow)" />
                            </>
                          )}
                          {signalState.active && signalState.step === 1 && signalState.node.id === node.id && (
                            <motion.line 
                              y1="0" y2="0"
                              stroke="#00ff77" strokeWidth="4" strokeLinecap="round" filter="url(#glow)"
                              initial={{ x1: 135, x2: 135 }}
                              animate={{ x1: [135, 135, 0], x2: [135, 0, 0] }}
                              transition={{ duration: 0.5, ease: "easeInOut" }}
                            />
                          )}
                        </g>
                      );
                    })}
                  </svg>

                  {nodes.map((node, index) => {
                    const rad = (node.angle * Math.PI) / 180;
                    const radius = 135;
                    const xPos = Math.cos(rad) * radius;
                    const yPos = Math.sin(rad) * radius;
                    const isActiveNode = activeNode?.id === node.id || signalState.node?.id === node.id;

                    return (
                      <motion.div
                        key={node.id}
                        style={{
                          position: 'absolute', left: -33, top: -33,
                          x: xPos, y: yPos, width: 66, height: 66
                        }}
                        animate={{ y: [yPos - 4, yPos + 4, yPos - 4] }}
                        transition={{ duration: 3 + index * 0.5, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <motion.div
                          style={{
                            ...styles.smallNode, width: '100%', height: '100%',
                            boxShadow: isActiveNode ? "0px 0px 25px rgba(0,255,119,0.8)" : "0 8px 32px 0 rgba(0, 0, 0, 0.3)",
                            border: isActiveNode ? "2px solid #00ff77" : "1px solid rgba(255,255,255,0.2)"
                          }}
                          onClick={(e) => { e.stopPropagation(); handleNodeClick(node); }}
                          whileHover={{ scale: 1.15, rotateX: 25, rotateY: -25, zIndex: 50, backgroundColor: "rgba(0,255,119,0.15)", boxShadow: "0 15px 35px rgba(0,255,119,0.4)" }} 
                          whileTap={{ scale: 0.95, rotateX: 0, rotateY: 0 }}
                        >
                          <div style={styles.nodeIconSmall}>{node.icon}</div>
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isExplored && (
              <motion.div
                style={{
                  ...styles.displayScreen, 
                  position: 'absolute', top: '50%', left: '50%', marginLeft: '-160px', marginTop: '145px',
                  boxShadow: activeNode ? '0 15px 35px rgba(0,255,119,0.15)' : '0 20px 40px rgba(0,0,0,0.4)',
                  borderColor: activeNode ? 'rgba(0,255,119,0.4)' : 'rgba(255,255,255,0.1)'
                }}
                initial={{ y: 50, opacity: 0, scale: 0.9 }} 
                animate={{ y: 0, opacity: 1, scale: 1 }} 
                exit={{ y: 20, opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', bounce: 0.4, duration: 0.6 }}
              >
                <AnimatePresence mode="wait">
                  {activeNode ? (
                    <motion.div 
                      key={activeNode.id} 
                      initial={{ opacity: 0, rotateX: -90, y: 20 }} 
                      animate={{ opacity: 1, rotateX: 0, y: 0 }} 
                      exit={{ opacity: 0, rotateX: 90, y: -20 }} 
                      transition={{ type: 'spring', damping: 15, stiffness: 200 }} 
                      style={styles.activeContent}
                    >
                      <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                        <span style={{fontSize: '32px'}}>{activeNode.icon}</span>
                        <div>
                          <h3 style={{margin: '0 0 5px 0', fontSize: '18px', color: 'white'}}>{activeNode.title}</h3>
                          <p style={{margin: 0, fontSize: '12px', color: '#ccc'}}>{activeNode.desc}</p>
                        </div>
                      </div>
                      <button style={styles.launchBtn} onClick={() => navigate(activeNode.route)}>Launch Module ➔</button>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="waiting" 
                      initial={{ opacity: 0, scale: 0.8 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      exit={{ opacity: 0, scale: 0.8 }} 
                      transition={{ duration: 0.2 }}
                      style={styles.waitingState}
                    >
                      <div style={styles.blinkingDot} />
                      <p style={{ color: '#00ff77', fontSize: '14px', margin: 0, fontWeight: '500', letterSpacing: '1px' }}>SYSTEM READY. SELECT A MODULE.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
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
  vid: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: '55% center', filter: 'brightness(1.15)' },
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
    background: 'linear-gradient(135deg, rgba(40,40,40,0.9), rgba(10,10,10,0.95))', 
    borderRadius: '16px',
    boxShadow: '0 15px 35px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.3), inset 0 -2px 4px rgba(0,0,0,0.5)',
    border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', zIndex: 20,
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
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

  displayScreen: { width: '320px', height: '125px', background: 'rgba(15, 15, 20, 0.75)', backdropFilter: 'blur(30px)', border: '1px solid rgba(255,255,255,0.1)', borderTop: '1px solid rgba(255,255,255,0.3)', borderRadius: '24px', padding: '15px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 10, boxShadow: '0 20px 40px rgba(0,0,0,0.4)', boxSizing: 'border-box' },
  
  waitingState: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', height: '100%' },
  blinkingDot: { width: '8px', height: '8px', background: '#00ff77', borderRadius: '50%', animation: 'blink 1.5s infinite', boxShadow: '0 0 10px #00ff77' },

  activeContent: { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' },
  launchBtn: { background: 'rgba(0, 255, 119, 0.15)', border: '1px solid rgba(0, 255, 119, 0.5)', color: '#00ff77', padding: '8px', borderRadius: '12px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: '0.2s', marginTop: '10px' },

  '@keyframes blink': { '0%': { opacity: 0.2 }, '50%': { opacity: 1 }, '100%': { opacity: 0.2 } }
};

export default AgriInsights;