import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoMdArrowBack } from 'react-icons/io';
import { FaChartLine, FaNewspaper, FaBook, FaArrowRight, FaLeaf } from 'react-icons/fa';
import { motion } from 'framer-motion'; 
import LivingFarm from '../components/LivingFarm'; 

const AgriInsights = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('market'); 

  return (
    <div style={styles.page}>
      
      {/* BACKGROUND ATMOSPHERE */}
      <LivingFarm mode={activeTab} />

      {/* HEADER */}
      <div style={styles.header}>
          <button onClick={() => navigate('/dashboard')} style={styles.iconBtn}>
            <IoMdArrowBack size={24} color="#1b5e20"/>
          </button>
          <span style={styles.headerTitle}>Agri Insights</span>
          <div style={{width: 24}}></div>
      </div>

      {/* NAVIGATION TABS */}
      <div style={styles.navContainer}>
          <div style={styles.glassNav}>
            <button onClick={() => setActiveTab('market')} style={activeTab === 'market' ? styles.navItemActive : styles.navItem}>
                <FaChartLine size={16}/> Market
            </button>
            <button onClick={() => setActiveTab('news')} style={activeTab === 'news' ? styles.navItemActive : styles.navItem}>
                <FaNewspaper size={16}/> News
            </button>
            <button onClick={() => setActiveTab('library')} style={activeTab === 'library' ? styles.navItemActive : styles.navItem}>
                <FaBook size={16}/> Library
            </button>
          </div>
      </div>

      <div style={styles.contentContainer}>
          
          {/* --- ULTRA-MODERN COMPACT CARDS --- */}

          {/* 1. MARKET CARD (Cyber Green Theme) */}
          {activeTab === 'market' && (
              <motion.div 
                style={styles.glassCard} 
                onClick={() => navigate('/market-rates')}
                whileHover={{ scale: 1.02, boxShadow: '0 20px 40px rgba(46, 125, 50, 0.3)' }}
                whileTap={{ scale: 0.98 }}
              >
                  {/* Neon Glow Line at Top */}
                  <div style={{...styles.neonLine, background: '#00e676'}}></div>

                  <div style={styles.cardInternal}>
                      {/* Left: Data Info */}
                      <div style={styles.textColumn}>
                          <div style={styles.badgeRow}>
                              <span style={styles.pulseDotGreen}></span> 
                              <span style={styles.badgeText}>LIVE FEED</span>
                          </div>
                          <h2 style={styles.bigTitle}>Market <br/>Pulse 📈</h2>
                          <p style={styles.subText}>3,000+ Mandis • Real-time</p>
                      </div>

                      {/* Right: The Interaction */}
                      <div style={styles.actionColumn}>
                          <div style={styles.glassButton}>
                              <FaArrowRight color="#fff" size={18} />
                          </div>
                      </div>
                  </div>

                  {/* Decorative Background Graph (Faint) */}
                  <FaChartLine style={styles.bgWatermark} />
              </motion.div>
          )}

          {/* 2. NEWS CARD (Cyber Blue Theme) */}
          {activeTab === 'news' && (
              <motion.div 
                style={{...styles.glassCard, background: 'linear-gradient(145deg, rgba(2, 136, 209, 0.9), rgba(1, 87, 155, 0.95))'}} 
                onClick={() => navigate('/news')}
                whileHover={{ scale: 1.02, boxShadow: '0 20px 40px rgba(2, 136, 209, 0.3)' }}
                whileTap={{ scale: 0.98 }}
              >
                  <div style={{...styles.neonLine, background: '#29b6f6'}}></div>

                  <div style={styles.cardInternal}>
                      <div style={styles.textColumn}>
                          <div style={styles.badgeRow}>
                              <span style={{...styles.pulseDotGreen, background: '#29b6f6', boxShadow:'0 0 8px #29b6f6'}}></span> 
                              <span style={styles.badgeText}>GLOBAL</span>
                          </div>
                          <h2 style={styles.bigTitle}>Agri <br/>News 🌍</h2>
                          <p style={styles.subText}>Weather & Schemes</p>
                      </div>
                      <div style={styles.actionColumn}>
                          <div style={styles.glassButton}>
                              <FaArrowRight color="#fff" size={18} />
                          </div>
                      </div>
                  </div>
                  <FaNewspaper style={styles.bgWatermark} />
              </motion.div>
          )}

          {/* 3. LIBRARY CARD (Cyber Orange Theme) */}
          {activeTab === 'library' && (
              <motion.div 
                style={{...styles.glassCard, background: 'linear-gradient(145deg, rgba(230, 81, 0, 0.9), rgba(191, 54, 12, 0.95))'}} 
                onClick={() => navigate('/library')}
                whileHover={{ scale: 1.02, boxShadow: '0 20px 40px rgba(230, 81, 0, 0.3)' }}
                whileTap={{ scale: 0.98 }}
              >
                  <div style={{...styles.neonLine, background: '#ffab00'}}></div>

                  <div style={styles.cardInternal}>
                      <div style={styles.textColumn}>
                          <div style={styles.badgeRow}>
                              <span style={{...styles.pulseDotGreen, background: '#ffab00', boxShadow:'0 0 8px #ffab00'}}></span> 
                              <span style={styles.badgeText}>LEARNING</span>
                          </div>
                          <h2 style={styles.bigTitle}>Digital <br/>Library 📚</h2>
                          <p style={styles.subText}>Expert Videos & Books</p>
                      </div>
                      <div style={styles.actionColumn}>
                          <div style={styles.glassButton}>
                              <FaArrowRight color="#fff" size={18} />
                          </div>
                      </div>
                  </div>
                  <FaBook style={styles.bgWatermark} />
              </motion.div>
          )}

      </div>
    </div>
  );
};

const styles = {
  page: { minHeight: '100vh', fontFamily: '"Poppins", sans-serif', position: 'relative' },
  
  header: { 
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 20px', 
    background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', zIndex: 10, position: 'relative'
  },
  headerTitle: { fontSize: '20px', fontWeight: '700', color: '#1b5e20' },
  iconBtn: { background: 'transparent', border: 'none', cursor: 'pointer' },
  
  navContainer: { padding: '20px', zIndex: 10, position: 'relative' },
  glassNav: { display: 'flex', justifyContent: 'space-between', padding: '5px', background: 'rgba(255,255,255,0.9)', borderRadius: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' },
  navItem: { flex: 1, background: 'transparent', border: 'none', color: '#666', padding: '10px', borderRadius: '25px', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer', transition: '0.3s' },
  navItemActive: { flex: 1, background: '#2e7d32', color: '#fff', border: 'none', padding: '10px', borderRadius: '25px', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(46, 125, 50, 0.3)' },

  contentContainer: { padding: '0 20px', zIndex: 10, position: 'relative' },

  // --- NEW "EXTREME MODERN" CARD STYLES ---
  glassCard: {
    // A Deep, Rich Green Gradient (Almost Metallic)
    background: 'linear-gradient(145deg, rgba(46, 125, 50, 0.95), rgba(27, 94, 32, 1))',
    borderRadius: '24px',
    height: '140px', // COMPACT HEIGHT (Fixed the "Too Big" issue)
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)', // Deep shadow for pop
    border: '1px solid rgba(255,255,255,0.1)',
    cursor: 'pointer',
    marginTop: '10px'
  },
  neonLine: {
    position: 'absolute', top: 0, left: '20px', right: '20px', height: '3px',
    boxShadow: '0 0 10px currentColor',
    borderRadius: '0 0 4px 4px',
    zIndex: 3
  },
  cardInternal: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    height: '100%', padding: '0 25px', position: 'relative', zIndex: 2
  },
  textColumn: { display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  
  badgeRow: { 
    display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px',
    background: 'rgba(0,0,0,0.3)', padding: '4px 10px', borderRadius: '12px', width: 'fit-content'
  },
  pulseDotGreen: { width: '6px', height: '6px', background: '#00e676', borderRadius: '50%', boxShadow: '0 0 8px #00e676' },
  badgeText: { fontSize: '10px', color: '#fff', fontWeight: '700', letterSpacing: '1px' },
  
  bigTitle: { 
    fontSize: '22px', fontWeight: '800', color: '#fff', lineHeight: '1.1', margin: '4px 0',
    textShadow: '0 2px 10px rgba(0,0,0,0.3)'
  },
  subText: { fontSize: '12px', color: 'rgba(255,255,255,0.7)', fontWeight: '500' },

  actionColumn: { display: 'flex', alignItems: 'center' },
  glassButton: {
    width: '50px', height: '50px', borderRadius: '20px', // Squircle shape
    background: 'rgba(255,255,255,0.1)', // Glass button
    border: '1px solid rgba(255,255,255,0.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    backdropFilter: 'blur(5px)',
    boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
  },

  bgWatermark: {
    position: 'absolute', right: '-10px', bottom: '-20px', fontSize: '120px',
    color: 'rgba(255,255,255,0.05)', zIndex: 1, transform: 'rotate(-10deg)'
  }
};

export default AgriInsights;