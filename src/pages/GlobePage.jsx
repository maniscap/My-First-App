import React, { useRef, useEffect, useState, useMemo } from 'react';
import Globe from 'react-globe.gl';
import { useLocation, useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { 
  IoMdArrowBack, IoMdPlay, IoMdPause, 
  IoMdLocate
} from 'react-icons/io';

// --- ASSETS ---
// NIGHT MODE TEXTURES
const EARTH_NIGHT = "//unpkg.com/three-globe/example/img/earth-night.jpg"; 
const STAR_BG = "//unpkg.com/three-globe/example/img/night-sky.png";
const DEFAULT_ICON = "https://cdn-icons-png.flaticon.com/512/9043/9043296.png";

const globalAudio = window.globalAudio || new Audio(); 

const GlobePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const globeEl = useRef();
  
  const initialActive = location.state?.activeStation || null;
  const [activeStation, setActiveStation] = useState(initialActive);
  const [isPlaying, setIsPlaying] = useState(!globalAudio.paused);

  // --- ANIMATION REFS ---
  // We need references to the 3D objects to animate them manually
  const beamRef = useRef(null); 
  const animationFrameId = useRef(null);

  // --- AUDIO SYNC ---
  useEffect(() => {
      const onPlay = () => setIsPlaying(true);
      const onPause = () => setIsPlaying(false);
      globalAudio.addEventListener('play', onPlay);
      globalAudio.addEventListener('pause', onPause);
      return () => {
          globalAudio.removeEventListener('play', onPlay);
          globalAudio.removeEventListener('pause', onPause);
      };
  }, []);

  // --- CUSTOM LIGHTHOUSE OBJECT ---
  const customObjectsData = useMemo(() => {
      if (!activeStation) return [];
      return [activeStation];
  }, [activeStation]);

  const getLighthouseObj = () => {
      const group = new THREE.Group();

      // --- TOWER (Red & White Stripes) ---
      const radius = 0.5; // Visible size
      const height = 4.0; 

      // Create striped pole
      const geometry = new THREE.CylinderGeometry(radius, radius * 1.2, height, 32);
      const material = new THREE.MeshPhongMaterial({ color: 0xffffff }); // Base white

      // Paint stripes manually on geometry faces would be complex, 
      // so we just stack cylinders for simplicity and reliability.
      
      const segHeight = height / 4;
      
      const c1 = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius*1.1, segHeight, 16), new THREE.MeshLambertMaterial({ color: 0xffffff }));
      c1.position.y = segHeight * 0.5;
      
      const c2 = new THREE.Mesh(new THREE.CylinderGeometry(radius*0.9, radius, segHeight, 16), new THREE.MeshLambertMaterial({ color: 0xff0000 }));
      c2.position.y = segHeight * 1.5;
      
      const c3 = new THREE.Mesh(new THREE.CylinderGeometry(radius*0.8, radius*0.9, segHeight, 16), new THREE.MeshLambertMaterial({ color: 0xffffff }));
      c3.position.y = segHeight * 2.5;

      const c4 = new THREE.Mesh(new THREE.CylinderGeometry(radius*0.6, radius*0.8, segHeight, 16), new THREE.MeshLambertMaterial({ color: 0xff0000 }));
      c4.position.y = segHeight * 3.5;

      group.add(c1, c2, c3, c4);

      // --- LANTERN ---
      const lantern = new THREE.Mesh(
          new THREE.DodecahedronGeometry(radius * 1.2),
          new THREE.MeshBasicMaterial({ color: 0xffffaa, transparent: true, opacity: 0.9 })
      );
      lantern.position.y = height + 0.2;
      group.add(lantern);

      // --- ROTATING BEAM (The animated part) ---
      // We create a container for the beam to rotate around the center
      const beamPivot = new THREE.Group();
      beamPivot.position.y = height + 0.2; // Pivot at the lantern height

      // The actual beam shape (Cone laying flat)
      const beamGeo = new THREE.ConeGeometry(1.5, 15, 32, 1, true);
      beamGeo.translate(0, 7.5, 0); // Shift so the tip is at 0,0,0
      beamGeo.rotateZ(-Math.PI / 2); // Lay flat to point outward

      const beamMat = new THREE.MeshBasicMaterial({ 
          color: 0xffff00, 
          transparent: true, 
          opacity: 0.3,
          side: THREE.DoubleSide,
          depthWrite: false,
          blending: THREE.AdditiveBlending
      });

      const beamMesh = new THREE.Mesh(beamGeo, beamMat);
      
      // Double sided beam (Like a lighthouse scanning both ways)
      const beamMesh2 = beamMesh.clone();
      beamMesh2.rotation.y = Math.PI;

      beamPivot.add(beamMesh);
      beamPivot.add(beamMesh2);
      
      group.add(beamPivot);

      // Save reference for animation
      beamRef.current = beamPivot;

      return group;
  };

  // --- ANIMATION LOOP ---
  useEffect(() => {
    const animate = () => {
        if (beamRef.current) {
            // Rotate the beam
            beamRef.current.rotation.y -= 0.05; // Adjust speed here
        }
        animationFrameId.current = requestAnimationFrame(animate);
    };
    
    animate();

    return () => {
        if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, []);

  // --- CAMERA FOCUS ---
  useEffect(() => {
    if (globeEl.current && activeStation) {
        const globe = globeEl.current;
        globe.controls().autoRotate = true; 
        globe.controls().autoRotateSpeed = 0.2; // Slow earth rotation

        globe.pointOfView({
            lat: activeStation.lat,
            lng: activeStation.lng,
            altitude: 1.8 // Height
        }, 1500);
    }
  }, [activeStation]);

  const togglePlay = (e) => {
      e.stopPropagation();
      if (isPlaying) globalAudio.pause();
      else globalAudio.play().catch(err => console.error(err));
  };

  return (
    <div style={styles.page}>
      
      <div style={styles.glassHeader}>
          <button onClick={() => navigate(-1)} style={styles.glassBtn}>
              <IoMdArrowBack size={24} />
          </button>
          <div style={styles.headerTitle}>LIGHTHOUSE MODE</div>
      </div>

      <Globe
        ref={globeEl}
        backgroundColor="#000000" // PURE BLACK BACKGROUND
        backgroundImageUrl={STAR_BG}
        globeImageUrl={EARTH_NIGHT} // NIGHT TEXTURE ENFORCED
        
        // Remove standard points
        pointsData={[]} 
        
        // Add Lighthouse
        objectsData={customObjectsData}
        objectLat="lat"
        objectLng="lng"
        objectAltitude={0}
        objectThreeObject={getLighthouseObj}
        
        // Atmosphere Glow
        atmosphereColor="#1e3a8a" // Deep Night Blue
        atmosphereAltitude={0.2}
      />

      {/* MINI PLAYER */}
      {activeStation && (
          <div style={styles.miniPlayer}>
              <div style={styles.miniContent}>
                  <img 
                    src={activeStation.icon} 
                    onError={(e)=>e.target.src=DEFAULT_ICON} 
                    style={styles.miniImg} 
                  />
                  <div style={styles.miniText}>
                      <div style={styles.miniTitle}>{activeStation.name}</div>
                      <div style={styles.miniSub}>
                          <IoMdLocate size={10} style={{marginRight:4}}/>
                          {activeStation.normalizedState || 'Unknown Location'}
                      </div>
                  </div>
              </div>

              <div style={styles.miniControls}>
                  <button onClick={(e) => togglePlay(e)} style={styles.playBtn}>
                      {isPlaying ? <IoMdPause size={24} color="#000"/> : <IoMdPlay size={24} color="#000" style={{marginLeft:2}}/>}
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};

// --- STYLES ---
const styles = {
  page: { 
      width: '100vw', height: '100vh', 
      background: '#000', overflow: 'hidden', 
      fontFamily: "'Inter', sans-serif", position: 'relative' 
  },
  glassHeader: { 
      position: 'absolute', top: 20, left: 20, zIndex: 10,
      display: 'flex', alignItems: 'center', gap: 15
  },
  headerTitle: {
      fontSize: 14, fontWeight: '800', letterSpacing: 3, 
      color: '#fff', textShadow: '0 0 10px rgba(255,255,255,0.5)'
  },
  glassBtn: { 
      width: 50, height: 50, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', 
      background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', 
      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', 
      cursor: 'pointer', boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
  },
  miniPlayer: {
      position: 'absolute', bottom: 30, left: 20, right: 20,
      height: 80, background: 'rgba(20, 20, 20, 0.8)',
      backdropFilter: 'blur(20px)', borderRadius: '20px',
      border: '1px solid rgba(255,255,255,0.1)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 15px', zIndex: 50,
      boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
  },
  miniContent: { display: 'flex', alignItems: 'center', gap: 12, overflow: 'hidden' },
  miniImg: { width: 50, height: 50, borderRadius: '12px', objectFit: 'cover', background: '#000', border: '1px solid rgba(255,255,255,0.1)' },
  miniText: { display: 'flex', flexDirection: 'column' },
  miniTitle: { color: '#fff', fontWeight: '700', fontSize: 14, whiteSpace: 'nowrap', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis' },
  miniSub: { color: '#a1a1aa', fontSize: 11, display:'flex', alignItems:'center' },
  miniControls: { display: 'flex', alignItems: 'center', gap: 15 },
  playBtn: { 
      width: 45, height: 45, borderRadius: '50%', background: '#4ade80', 
      border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', 
      cursor: 'pointer', boxShadow: '0 5px 15px rgba(74, 222, 128, 0.3)' 
  }
};

export default GlobePage;