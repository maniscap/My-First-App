import React, { Suspense } from 'react';
import Spline from '@splinetool/react-spline';

/**
 * LivingFarm Component - Integrated 3D Version
 * This replaces the old SVG animation while keeping the same filename and location.
 */
const LivingFarm = () => {
  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100%', 
      height: '100%', 
      zIndex: 0, 
      backgroundColor: '#050505', 
      overflow: 'hidden' 
    }}>
      
      {/* 1. 3D DANCING ROBOT LAYER */}
      <div style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          zIndex: 1,
          pointerEvents: 'none' // Allows you to click your login buttons through the 3D scene
      }}>
        <Suspense fallback={
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%', 
            color: '#00d2ff',
            fontFamily: 'monospace'
          }}>
            CALIBRATING DANCE_MODULE...
          </div>
        }>
          <Spline 
            // The direct .splinecode link for the Danding Boy
            scene="https://prod.spline.design/LoHI2YYFWDHzgcjB/scene.splinecode" 
            onLoad={() => console.log("INTEGRATION SUCCESS: DANDING BOY ONLINE")}
          />
        </Suspense>
      </div>

      {/* 2. OPTIONAL OVERLAY (Makes the Glassmorphism look better) */}
      <div style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          zIndex: 2,
          background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.5) 100%)',
          pointerEvents: 'none'
      }} />

    </div>
  );
};

export default LivingFarm;