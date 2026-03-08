import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Float, PresentationControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import LivingFarm from '../components/LivingFarm';

// --- THE FIXED MOTOR (Massive Scale & Assembly Physics) ---
const Motor3D = ({ isExplored }) => {
  const { nodes } = useGLTF('/models/motor.glb');
  
  const groupRef = useRef();
  const topRef = useRef();
  const bottomRef = useRef();
  const glassRef = useRef();
  const hologramRef = useRef();

  const [isAssembled, setIsAssembled] = useState(false);
  useEffect(() => {
    // Snaps the pieces together after load
    const timer = setTimeout(() => setIsAssembled(true), 400);
    return () => clearTimeout(timer);
  }, []);

  useFrame((state, delta) => {
    // 1. The wheel rotates continuously "outside"
    groupRef.current.rotation.y += delta * 0.5;
    // Tilting it so you can see the gorgeous inside of the motor
    groupRef.current.rotation.x = 0.3;

    // 2. The Physics (Explodes apart when clicked)
    const topTargetY = !isAssembled ? 150 : (isExplored ? 40 : 0); 
    const bottomTargetY = !isAssembled ? -150 : (isExplored ? -40 : 0);
    const glassTargetY = !isAssembled ? 250 : (isExplored ? 80 : 20); 

    topRef.current.position.y = THREE.MathUtils.lerp(topRef.current.position.y, topTargetY, delta * 5);
    bottomRef.current.position.y = THREE.MathUtils.lerp(bottomRef.current.position.y, bottomTargetY, delta * 5);
    glassRef.current.position.y = THREE.MathUtils.lerp(glassRef.current.position.y, glassTargetY, delta * 5);

    if (hologramRef.current) {
      hologramRef.current.scale.setScalar(
        isExplored ? 1.5 + Math.sin(state.clock.elapsedTime * 4) * 0.1 : 0.5
      );
    }
  });

  // Custom Premium Materials to replace the broken Sketchfab ones
  const ironMaterial = new THREE.MeshStandardMaterial({ color: '#a0a0b0', metalness: 0.9, roughness: 0.2 });
  const copperMaterial = new THREE.MeshStandardMaterial({ color: '#c86540', metalness: 0.7, roughness: 0.3 });
  const plasticMaterial = new THREE.MeshStandardMaterial({ color: '#111111', metalness: 0.5, roughness: 0.8 });

  return (
    // 🚨 THE FIX: Scaled up 40x so it's no longer a tiny dot! 🚨
    <group ref={groupRef} dispose={null} scale={40}> 
      <group scale={0.01}>
        
        {/* TOP LAYER */}
        <group ref={topRef}>
          <mesh geometry={nodes.Rotor_Iron_MAT001_0.geometry} material={ironMaterial} scale={100} />
          <mesh geometry={nodes.Hub_BlackPlast_MAT001_0.geometry} material={plasticMaterial} scale={100} />
        </group>

        {/* BOTTOM LAYER */}
        <group ref={bottomRef}>
          <mesh geometry={nodes.Coils_Coil_MAT001_0.geometry} material={copperMaterial} scale={100} />
          <mesh geometry={nodes.Cores_Iron_MAT001_0.geometry} material={ironMaterial} scale={100} />
          <mesh geometry={nodes.Spools_BlackPlast_MAT001_0.geometry} material={plasticMaterial} scale={100} />
        </group>

        {/* GLASS TOP */}
        <mesh ref={glassRef} scale={100}>
          <cylinderGeometry args={[1.4, 1.4, 0.05, 64]} />
          <meshPhysicalMaterial 
            color="#ffffff" transmission={0.9} opacity={1} metalness={0.1} roughness={0.1} ior={1.5} thickness={0.5} 
          />
        </mesh>

        {/* GLOWING CENTER */}
        <mesh ref={hologramRef} position={[0, 0, 0]} scale={100}>
          <icosahedronGeometry args={[0.5, 1]} />
          <meshBasicMaterial color="#00ff77" wireframe={true} />
        </mesh>

      </group>
    </group>
  );
};

useGLTF.preload('/models/motor.glb');


const AgriInsights = () => {
  const [isExplored, setIsExplored] = useState(false);
  const [activeNode, setActiveNode] = useState(null); 
  const [pulseTrigger, setPulseTrigger] = useState(0); 
  
  const [isMuted, setIsMuted] = useState(true);
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
    { id: 1, title: 'Market Pulse', icon: '📈', desc: 'Live Mandi Rates & Trends', path: "M 60,-220 Q -20,-220 -90,-150 L -90, 90 L 0, 90", pos: { x: 60, y: -220 }, route: '/market-rates' },
    { id: 2, title: 'Agri News', icon: '📰', desc: 'Global Farming Updates', path: "M 100,-130 Q 0,-130 -90,-150 L -90, 90 L 0, 90", pos: { x: 100, y: -130 }, route: '/news' },
    { id: 3, title: 'Library', icon: '📚', desc: 'Expert Guides & Manuals', path: "M 100,-40 Q 0,-40 -90,-150 L -90, 90 L 0, 90", pos: { x: 100, y: -40 }, route: '/library' },
    { id: 4, title: 'Modern Tech', icon: '🚀', desc: 'Drones & AI Precision', path: "M 60,50 Q -20,50 -90,-150 L -90, 90 L 0, 90", pos: { x: 60, y: 50 }, route: '/modern-tech' }
  ];

  const handleNodeClick = (node) => {
    setActiveNode(node);
    setPulseTrigger(prev => prev + 1); 
  };

  return (
    <>
      <LivingFarm isMuted={isMuted} />

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
          <svg style={{ position: 'absolute', top: '50%', left: '50%', overflow: 'visible', zIndex: 1, pointerEvents: 'none' }}>
            <AnimatePresence>
              {isExplored && nodes.map((n) => (
                <motion.path 
                  key={`base-${n.id}`} d={n.path} stroke="rgba(255,255,255,0.15)" strokeWidth="2" fill="none"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: "easeInOut" }}
                />
              ))}
            </AnimatePresence>
            <AnimatePresence mode="wait">
              {activeNode && (
                <motion.path
                  key={`pulse-${activeNode.id}-${pulseTrigger}`}
                  d={activeNode.path} stroke="#00ff77" strokeWidth="3" fill="none"
                  initial={{ pathLength: 0, opacity: 1 }} animate={{ pathLength: 1, opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  style={{ filter: 'drop-shadow(0 0 8px #00ff77)' }}
                />
              )}
            </AnimatePresence>
          </svg>

          {/* 🚨 THE FIX: I made the background transparent and removed the hidden overflow so the motor floats freely 🚨 */}
          <motion.div 
            style={{
              width: '250px', height: '250px', position: 'absolute', top: '50%', left: '50%', 
              marginLeft: '-125px', marginTop: '-125px', cursor: 'pointer', zIndex: 10,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
            }}
            onClick={() => setIsExplored(true)}
            initial={{ y: 0, x: 0, scale: 1 }}
            animate={{ 
              y: isExplored ? -150 : 0, 
              x: isExplored ? -90 : 0, 
              scale: isExplored ? 0.6 : 1
            }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            {/* The 3D Canvas is now completely exposed and massive */}
            <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
              <Canvas camera={{ position: [0, 4, 12], fov: 45 }}>
                <ambientLight intensity={1.5} />
                <directionalLight position={[10, 10, 10]} intensity={3} color="#ffffff" />
                <directionalLight position={[-10, -10, -10]} intensity={1} color="#00ff77" />
                <Environment preset="city" />
                
                <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
                  <PresentationControls global polar={[-0.4, 0.2]} azimuth={[-0.4, 0.2]}>
                    <Suspense fallback={null}>
                      <Motor3D isExplored={isExplored} />
                    </Suspense>
                  </PresentationControls>
                </Float>
              </Canvas>
            </div>
            {!isExplored && <p style={styles.tapText}>TAP TO EXPAND</p>}
          </motion.div>

          {/* Orbiting Cards & Lines */}
          <AnimatePresence>
            {isExplored && nodes.map((node, i) => (
              <motion.div 
                key={node.id} style={{...styles.smallNode, position: 'absolute', top: '50%', left: '50%', marginLeft: '-35px', marginTop: '-35px'}}
                initial={{ x: -90, y: -150, scale: 0, opacity: 0 }}
                animate={{ x: node.pos.x, y: node.pos.y, scale: 1, opacity: 1, boxShadow: activeNode?.id === node.id ? "0px 0px 20px rgba(0,255,119,0.5)" : "0px 10px 20px rgba(0,0,0,0.5)" }}
                transition={{ type: 'spring', stiffness: 260, damping: 20, delay: i * 0.1 }}
                whileHover={{ scale: 1.15 }}
                onClick={() => handleNodeClick(node)}
              >
                <div style={styles.nodeIconSmall}>{node.icon}</div>
              </motion.div>
            ))}
          </AnimatePresence>

          <AnimatePresence>
            {isExplored && (
              <motion.div
                style={{...styles.displayScreen, position: 'absolute', top: '50%', left: '50%', marginLeft: '-170px', marginTop: '90px'}}
                initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', delay: 0.6 }}
              >
                {!activeNode ? (
                  <div style={styles.waitingState}>
                    <div style={styles.blinkingDot}></div>
                    <p style={{margin: 0, color: '#888'}}>Waiting for node selection...</p>
                  </div>
                ) : (
                  <motion.div key={activeNode.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} style={styles.activeContent}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                      <span style={{fontSize: '40px'}}>{activeNode.icon}</span>
                      <div>
                        <h3 style={{margin: '0 0 5px 0', fontSize: '20px', color: 'white'}}>{activeNode.title}</h3>
                        <p style={{margin: 0, fontSize: '13px', color: '#ccc'}}>{activeNode.desc}</p>
                      </div>
                    </div>
                    <button style={styles.launchBtn} onClick={() => navigate(activeNode.route)}>Launch Module ➔</button>
                  </motion.div>
                )}
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
  page: { position: 'relative', zIndex: 1, padding: '20px', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: 'system-ui, sans-serif' },
  header: { background: 'rgba(20,20,20,0.6)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', width: '100%', maxWidth: '400px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderRadius: '24px', marginBottom: '10px', color: 'white', boxSizing: 'border-box', border: '1px solid rgba(255,255,255,0.1)', zIndex: 50 },
  headerTextContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  title: { margin: 0, fontSize: '18px', fontWeight: '600' },
  dateText: { margin: '4px 0 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
  iconBtn: { background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' },
  
  stage: { position: 'relative', width: '100%', maxWidth: '400px', height: '600px', overflow: 'visible' },

  tapText: { position: 'absolute', bottom: '-30px', zIndex: 20, color: '#00ff77', fontSize: '11px', fontWeight: 'bold', letterSpacing: '2px', margin: 0, textShadow: '0 0 10px rgba(0,255,119,0.8)', background: 'rgba(0,0,0,0.6)', padding: '4px 10px', borderRadius: '10px' },

  smallNode: { width: '70px', height: '70px', background: 'rgba(20, 20, 25, 0.8)', backdropFilter: 'blur(15px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 },
  nodeIconSmall: { fontSize: '30px', filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.5))' },

  displayScreen: { width: '340px', height: '160px', background: 'rgba(15, 15, 20, 0.75)', backdropFilter: 'blur(30px)', border: '1px solid rgba(255,255,255,0.1)', borderTop: '1px solid rgba(255,255,255,0.3)', borderRadius: '24px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 10, boxShadow: '0 20px 40px rgba(0,0,0,0.4)', boxSizing: 'border-box' },
  
  waitingState: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', height: '100%' },
  blinkingDot: { width: '8px', height: '8px', background: '#00ff77', borderRadius: '50%', animation: 'blink 1.5s infinite', boxShadow: '0 0 10px #00ff77' },

  activeContent: { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' },
  launchBtn: { background: 'rgba(0, 255, 119, 0.15)', border: '1px solid rgba(0, 255, 119, 0.5)', color: '#00ff77', padding: '12px', borderRadius: '14px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: '0.2s', marginTop: '15px' },

  '@keyframes blink': { '0%': { opacity: 0.2 }, '50%': { opacity: 1 }, '100%': { opacity: 0.2 } }
};

export default AgriInsights;