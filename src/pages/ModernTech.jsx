import React from 'react';
import { useNavigate } from 'react-router-dom';
import LivingFarm from '../components/LivingFarm'; // Keep the cool background!

const ModernTech = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* Background Video muted by default on this page */}
      <LivingFarm isMuted={true} />
      
      <div style={styles.page}>
        <div style={styles.header}>
          <button style={styles.iconBtn} onClick={() => navigate(-1)}>
             ← 
          </button>
          <h2 style={styles.title}>Modern Technology</h2>
          <div style={{width: '40px'}}></div>
        </div>

        <div style={styles.contentCard}>
          <h3 style={{marginTop: 0}}>Coming Soon!</h3>
          <p>This page will feature cutting-edge farming tech like Drones, AI soil analysis, and IoT sensors.</p>
        </div>
      </div>
    </>
  );
};

const premiumGlass = {
  background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.01) 100%)',
  backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: '24px', color: 'white', padding: '20px'
};

const styles = {
  page: { position: 'relative', zIndex: 1, padding: '20px', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: 'system-ui, sans-serif' },
  header: { ...premiumGlass, width: '100%', maxWidth: '400px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px' },
  iconBtn: { background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer' },
  title: { margin: 0, fontSize: '18px', fontWeight: '600' },
  contentCard: { ...premiumGlass, width: '100%', maxWidth: '400px' }
};

export default ModernTech;