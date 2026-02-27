import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IoMdArrowBack } from 'react-icons/io';
import { FaChartLine, FaNewspaper, FaBook, FaArrowRight } from 'react-icons/fa';
import { motion } from 'framer-motion'; 
import LivingFarm from '../components/LivingFarm'; 

const AgriInsights = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      {/* BACKGROUND VIDEO LAYER */}
      <LivingFarm />

      {/* HEADER */}
      <div style={styles.headerWrapper}>
        <div style={styles.headerGlass}>
            <button onClick={() => navigate('/dashboard')} style={styles.iconBtn}>
              <IoMdArrowBack size={22} color="#fff"/>
            </button>
            <span style={styles.headerTitle}>Agri Insights</span>
            <div style={{width: 40}}></div> 
        </div>
      </div>

      {/* BENTO GRID LAYOUT */}
      <div style={styles.gridContainer}>
          
          {/* 1. HERO CARD: MARKET PULSE (Full Width) */}
          <motion.div 
            style={{...styles.glassCard, gridColumn: '1 / -1', height: '160px'}} 
            onClick={() => navigate('/market-rates')}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          >
              <div style={styles.cardInternal}>
                  <div style={styles.textColumn}>
                      <div style={styles.badgeRow}>
                          <span style={{...styles.pulseDot, background: '#00e676'}}></span> 
                          <span style={styles.badgeText}>LIVE FEED</span>
                      </div>
                      <h2 style={styles.bigTitle}>Market Pulse 📈</h2>
                      <p style={styles.subText}>3,000+ Mandis • Real-time</p>
                  </div>
                  <div style={styles.actionGlassButton}>
                      <FaArrowRight color="#fff" size={16} />
                  </div>
              </div>
          </motion.div>

          {/* 2. SIDEKICK CARD: NEWS (Left Half) */}
          <motion.div 
            style={{...styles.glassCard, height: '140px', padding: '20px'}} 
            onClick={() => navigate('/news')}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          >
              <div style={{display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between'}}>
                  <FaNewspaper size={24} color="#29b6f6" />
                  <div>
                      <h3 style={styles.smallTitle}>Agri News 🌍</h3>
                      <p style={styles.subText}>Global Updates</p>
                  </div>
              </div>
          </motion.div>

          {/* 3. SIDEKICK CARD: LIBRARY (Right Half) */}
          <motion.div 
            style={{...styles.glassCard, height: '140px', padding: '20px'}} 
            onClick={() => navigate('/library')}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          >
              <div style={{display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between'}}>
                  <FaBook size={24} color="#ffab00" />
                  <div>
                      <h3 style={styles.smallTitle}>Library 📚</h3>
                      <p style={styles.subText}>Expert Guides</p>
                  </div>
              </div>
          </motion.div>

      </div>
    </div>
  );
};

const styles = {
  page: { minHeight: '100vh', fontFamily: '"Poppins", sans-serif', position: 'relative' },
  
  headerWrapper: { padding: '20px 20px 5px 20px', zIndex: 10, position: 'relative' },
  headerGlass: { 
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
    padding: '12px 15px', 
    background: 'rgba(0, 0, 0, 0.5)', 
    backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
    borderRadius: '24px', 
    border: '1px solid rgba(255, 255, 255, 0.15)', 
  },
  headerTitle: { fontSize: '18px', fontWeight: '600', color: '#fff' },
  iconBtn: { 
    background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', 
    width: '40px', height: '40px', borderRadius: '50%', 
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
  },
  
  // --- NEW: CSS Grid for Bento Layout ---
  gridContainer: { 
    padding: '20px', zIndex: 10, position: 'relative',
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' // 2 Columns, 15px spacing
  },

  // --- DARK GLASS CARDS ---
  glassCard: {
    background: 'rgba(0, 0, 0, 0.5)', // Deep translucent base
    backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', 
    borderRadius: '24px', 
    border: '1px solid rgba(255, 255, 255, 0.15)', // Thin white rim
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    cursor: 'pointer',
    overflow: 'hidden',
    position: 'relative'
  },
  
  cardInternal: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    height: '100%', padding: '0 25px', position: 'relative', zIndex: 2
  },
  textColumn: { display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  
  badgeRow: { 
    display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px',
    background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.15)',
    padding: '4px 12px', borderRadius: '15px', width: 'fit-content'
  },
  pulseDot: { width: '6px', height: '6px', borderRadius: '50%', boxShadow: '0 0 8px #00e676' },
  badgeText: { fontSize: '10px', color: '#fff', fontWeight: '600' },
  
  bigTitle: { fontSize: '24px', fontWeight: '700', color: '#fff', margin: '0 0 4px 0' },
  smallTitle: { fontSize: '18px', fontWeight: '600', color: '#fff', margin: '0 0 4px 0' },
  subText: { fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: '400', margin: 0 },

  actionGlassButton: {
    width: '40px', height: '40px', borderRadius: '50%', 
    background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }
};

export default AgriInsights;