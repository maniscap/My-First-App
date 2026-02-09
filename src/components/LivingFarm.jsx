import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- 1. PROFESSIONAL VECTOR ASSETS (Redesigned) ---

// Detailed Farmer Silhouette
const FarmerActor = ({ action }) => (
  <svg width="80" height="100" viewBox="0 0 80 100">
    <defs>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
        <feOffset dx="2" dy="2" result="offsetblur" />
        <feComponentTransfer>
          <feFuncA type="linear" slope="0.3" />
        </feComponentTransfer>
        <feMerge>
          <feMergeNode in="offsetblur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <g filter="url(#shadow)">
      {/* Turban/Pagdi */}
      <path d="M25,15 Q20,5 35,5 Q50,5 55,15 Q60,25 40,25 Q30,25 25,15" fill="#D84315" />
      {/* Head */}
      <circle cx="40" cy="20" r="12" fill="#FFCCBC" />
      {/* Body/Kurta */}
      <path d="M25,30 Q15,35 15,50 L20,80 L60,80 L65,50 Q65,35 55,30 Z" fill="#F5F5F5" />
      {/* Dhoti/Legs */}
      <path d="M20,80 L25,100 M60,80 L55,100" stroke="#5D4037" strokeWidth="6" strokeLinecap="round" />
      {/* Arm Action */}
      {action === 'sow' ? (
         <path d="M55,40 Q70,30 75,50" stroke="#FFCCBC" strokeWidth="5" strokeLinecap="round" fill="none" />
      ) : (
         <path d="M55,40 L75,50" stroke="#FFCCBC" strokeWidth="5" strokeLinecap="round" />
      )}
    </g>
  </svg>
);

// Detailed Bullocks Plough
const BullocksPlough = () => (
  <svg width="160" height="80" viewBox="0 0 160 80">
    <g filter="url(#shadow)">
      {/* Bull 1 */}
      <path d="M30,40 Q20,30 30,20 Q40,10 50,20 L80,30 L80,60 L50,60 L50,50" fill="#A1887F" />
      <path d="M30,20 L35,10" stroke="#5D4037" strokeWidth="3" /> {/* Horn */}
      {/* Bull 2 (Behind) */}
      <path d="M40,35 Q30,25 40,15 Q50,5 60,15 L90,25 L90,55 L60,55 L60,45" fill="#8D6E63" />
      {/* Plough */}
      <line x1="80" y1="40" x2="140" y2="70" stroke="#3E2723" strokeWidth="4" />
      <rect x="130" y="65" width="20" height="10" fill="#5D4037" />
    </g>
  </svg>
);

// Modern Tractor Design
const Tractor = () => (
  <svg width="140" height="100" viewBox="0 0 140 100">
    <g filter="url(#shadow)">
       {/* Big Rear Wheel */}
       <circle cx="40" cy="75" r="22" fill="#212121" stroke="#424242" strokeWidth="4" />
       <circle cx="40" cy="75" r="10" fill="#BDBDBD" />
       {/* Small Front Wheel */}
       <circle cx="110" cy="85" r="12" fill="#212121" stroke="#424242" strokeWidth="3" />
       <circle cx="110" cy="85" r="5" fill="#BDBDBD" />
       {/* Chassis */}
       <path d="M30,40 L90,40 L120,60 L100,80 L50,80 Z" fill="#2E7D32" />
       {/* Engine Grill */}
       <rect x="120" y="50" width="10" height="20" fill="#1B5E20" />
       {/* Cabin/Seat */}
       <path d="M30,40 L30,10 L70,10 L70,40" fill="none" stroke="#2E7D32" strokeWidth="4" />
       <rect x="35" y="40" width="30" height="10" fill="#1B5E20" /> {/* Seat */}
       {/* Exhaust */}
       <rect x="90" y="20" width="5" height="20" fill="#424242" />
       <path d="M90,20 L80,15" stroke="#424242" strokeWidth="4" strokeLinecap="round" />
    </g>
  </svg>
);

// Bullock Cart (Sunset Scene)
const BullockCart = () => (
  <svg width="160" height="90" viewBox="0 0 160 90">
     {/* Cart */}
     <rect x="80" y="40" width="70" height="10" fill="#5D4037" />
     <path d="M100,40 L110,20 L130,20 L140,40" fill="#8D6E63" /> {/* Grain Sacks pile */}
     <circle cx="115" cy="50" r="18" fill="none" stroke="#3E2723" strokeWidth="4" /> {/* Wheel */}
     <circle cx="115" cy="50" r="3" fill="#3E2723" />
     {/* Bull */}
     <path d="M30,50 Q20,40 30,30 Q40,20 60,30 L80,40 L80,70 L50,70" fill="#A1887F" />
     <line x1="60" y1="35" x2="80" y2="40" stroke="#3E2723" strokeWidth="3" /> {/* Yoke */}
  </svg>
);


// --- 2. SCENE LOGIC ---

const LivingFarm = () => {
  const [scene, setScene] = useState(0);

  // Scene Timeline
  useEffect(() => {
    const timeline = [
        { id: 0, time: 6000 }, // Ploughing
        { id: 1, time: 4000 }, // Sowing
        { id: 2, time: 5000 }, // Rain/Growth
        { id: 3, time: 5000 }, // Harvest
        { id: 4, time: 6000 }, // Transport
    ];
    let cur = 0;
    const next = () => {
        setScene(cur);
        cur = (cur + 1) % timeline.length;
        setTimeout(next, timeline[cur].time || 4000);
    };
    next();
  }, []);

  // Sky Colors
  const skyColors = [
      'linear-gradient(180deg, #4FC3F7 0%, #E1F5FE 100%)', // Morning Blue
      'linear-gradient(180deg, #81D4FA 0%, #E1F5FE 100%)', // Bright
      'linear-gradient(180deg, #607D8B 0%, #CFD8DC 100%)', // Grey/Rain
      'linear-gradient(180deg, #FFF176 0%, #FFFFFF 100%)', // Sunny/Harvest
      'linear-gradient(180deg, #FF9800 0%, #FFCCBC 100%)', // Sunset
  ];

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
      
      {/* 1. FULL SCREEN SKY */}
      <motion.div 
         animate={{ background: skyColors[scene] || skyColors[0] }}
         transition={{ duration: 2 }}
         style={{ width: '100%', height: '100%' }}
      />

      {/* 2. SUN/MOON (Top Right - Behind Cards) */}
      <motion.div 
         animate={{ 
             y: scene === 2 ? -100 : scene === 4 ? 100 : 40, 
             x: scene === 4 ? 200 : 40,
             backgroundColor: scene === 4 ? '#FF5722' : '#FFD700',
             boxShadow: scene === 4 ? '0 0 50px #FF5722' : '0 0 50px #FFD700'
         }}
         transition={{ duration: 3 }}
         style={{ 
             position: 'absolute', top: '5%', right: '10%', 
             width: '80px', height: '80px', borderRadius: '50%' 
         }}
      />

      {/* 3. ROLLING HILLS (Background Layer) */}
      <div style={{ position: 'absolute', bottom: 0, width: '100%', height: '40%', overflow: 'hidden' }}>
         {/* Far Hill */}
         <motion.div 
            animate={{ background: scene === 2 ? '#4E342E' : '#7CB342' }}
            transition={{ duration: 2 }}
            style={{ 
                position: 'absolute', bottom: 0, left: '-20%', width: '140%', height: '80%', 
                borderRadius: '50% 50% 0 0', opacity: 0.8 
            }}
         />
         {/* Near Hill (The Stage) */}
         <motion.div 
            animate={{ background: scene === 2 ? '#3E2723' : scene === 3 ? '#FDD835' : '#558B2F' }}
            transition={{ duration: 2 }}
            style={{ 
                position: 'absolute', bottom: -50, width: '100%', height: '60%', 
                borderRadius: '100% 100% 0 0', borderTop: '4px solid rgba(0,0,0,0.1)' 
            }}
         />
      </div>

      {/* 4. THE NARRATIVE STAGE (Bottom 25%) */}
      <div style={{ position: 'absolute', bottom: '10%', width: '100%', height: '200px', overflow: 'hidden' }}>
         <AnimatePresence mode='wait'>
            
            {/* SCENE 0: PLOUGHING */}
            {scene === 0 && (
                <motion.div
                    key="scene0"
                    initial={{ x: -200 }} animate={{ x: 400 }} exit={{ opacity: 0 }}
                    transition={{ duration: 6, ease: "linear" }}
                    style={{ position: 'absolute', bottom: 20 }}
                >
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '-20px' }}>
                        <BullocksPlough />
                        <div style={{ marginLeft: '-30px', zIndex: 2 }}><FarmerActor action="plough" /></div>
                    </div>
                </motion.div>
            )}

            {/* SCENE 1: SOWING */}
            {scene === 1 && (
                <motion.div
                    key="scene1"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ position: 'absolute', left: '40%', bottom: 30 }}
                >
                    <FarmerActor action="sow" />
                    {/* Seeds Falling */}
                    {Array.from({length: 8}).map((_,i) => (
                        <motion.div 
                           key={i}
                           animate={{ y: [0, 60], opacity: [1, 0] }}
                           transition={{ duration: 0.6, repeat: Infinity, delay: i*0.1 }}
                           style={{ 
                               position: 'absolute', left: 60 + Math.random()*10, top: 40, 
                               width: 4, height: 4, background: '#FFD700', borderRadius: '50%' 
                           }}
                        />
                    ))}
                </motion.div>
            )}

            {/* SCENE 2: RAIN & GROWTH */}
            {scene === 2 && (
                <div style={{ width: '100%', height: '100%' }}>
                    {/* Rain */}
                    {Array.from({length: 30}).map((_,i) => (
                        <motion.div 
                           key={`rain-${i}`}
                           animate={{ y: [0, 300] }}
                           transition={{ duration: 0.5, repeat: Infinity, delay: Math.random() }}
                           style={{ 
                               position: 'absolute', left: `${Math.random()*100}%`, top: -50,
                               width: 2, height: 15, background: '#81D4FA', opacity: 0.6
                           }}
                        />
                    ))}
                    {/* Growing Plants */}
                    {Array.from({length: 15}).map((_,i) => (
                         <motion.div
                            key={`plant-${i}`}
                            initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
                            transition={{ duration: 4, delay: i*0.1 }}
                            style={{ 
                                position: 'absolute', bottom: 20, left: `${10 + i*6}%`,
                                width: 4, height: 40, background: '#4CAF50', transformOrigin: 'bottom'
                            }}
                         />
                    ))}
                </div>
            )}

            {/* SCENE 3: HARVEST */}
            {scene === 3 && (
                <motion.div
                    key="scene3"
                    initial={{ x: 400 }} animate={{ x: -200 }}
                    transition={{ duration: 5, ease: "linear" }}
                    style={{ position: 'absolute', bottom: 20 }}
                >
                    <Tractor />
                </motion.div>
            )}

            {/* SCENE 4: TRANSPORT SUNSET */}
            {scene === 4 && (
                <motion.div
                    key="scene4"
                    initial={{ x: -200 }} animate={{ x: 200 }}
                    transition={{ duration: 6, ease: "linear" }}
                    style={{ position: 'absolute', bottom: 20, left: '20%' }}
                >
                    <BullockCart />
                </motion.div>
            )}

         </AnimatePresence>
      </div>

    </div>
  );
};

export default LivingFarm;