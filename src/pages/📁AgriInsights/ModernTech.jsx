import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { IoMdArrowBack, IoMdPlay, IoMdInformationCircle } from 'react-icons/io';
import { FaTractor, FaWater, FaLeaf, FaRobot } from 'react-icons/fa';

// --- THE "SOMETHING MORE": Contextual Tech Data ---
// We provide the ROI, Cost, and Subsidies which YouTube DOES NOT have.
const TECH_CATEGORIES = [
  {
    id: 'drones', name: 'Agri Drones', icon: <FaRobot size={20} />, 
    searchQuery: 'Agriculture spraying drones India farming',
    description: 'Drones for spraying pesticides and mapping crop health.',
    cost: '₹4 Lakh - ₹8 Lakh',
    subsidy: 'Up to 40%-100% via SMAM scheme',
    benefits: 'Saves 80% water, 90% time, protects from chemical exposure.',
    actionText: 'Rent a Drone'
  },
  {
    id: 'irrigation', name: 'Smart Irrigation', icon: <FaWater size={20} />, 
    searchQuery: 'Smart drip irrigation automated farming India',
    description: 'IoT based automated drip/sprinkler systems controlled via smartphone.',
    cost: '₹50,000 - ₹1.5 Lakh/Acre',
    subsidy: '55%-100% under PMKSY',
    benefits: 'Prevents over-watering, saves electricity, boosts yield by 30%.',
    actionText: 'Find Installers'
  },
  {
    id: 'hydroponics', name: 'Hydroponics', icon: <FaLeaf size={20} />, 
    searchQuery: 'Hydroponics setup farming India tutorial',
    description: 'Growing crops without soil using nutrient-rich water.',
    cost: '₹10 Lakh - ₹25 Lakh/Acre setup',
    subsidy: '20%-50% under NHB',
    benefits: 'Requires 10% of traditional water, zero soil diseases, 10x yield.',
    actionText: 'Get Consultation'
  },
  {
    id: 'machinery', name: 'Modern Machinery', icon: <FaTractor size={20} />, 
    searchQuery: 'Modern agriculture machinery tractors India',
    description: 'Advanced harvesters, laser land levelers, and seed drills.',
    cost: 'Varies widely',
    subsidy: 'Available under various state schemes',
    benefits: 'Reduces labor dependency, ensures uniform planting/harvesting.',
    actionText: 'Rent Machinery'
  }
];

const ModernTech = () => {
  const navigate = useNavigate();
  const [activeTech, setActiveTech] = useState(TECH_CATEGORIES[0]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Hide scrollbars for the sleek Apple look
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // --- YOUTUBE API FETCH LOGIC ---
  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      setError(null);

      // CACHING: YouTube API gives 10,000 quota/day. Searches cost 100 quota!
      // We check sessionStorage first so we don't burn quota when users switch tabs.
      const cacheKey = `farmcap_yt_${activeTech.id}`;
      const cachedData = sessionStorage.getItem(cacheKey);
      
      if (cachedData) {
        setVideos(JSON.parse(cachedData));
        setLoading(false);
        return;
      }

      try {
        const response = await axios.post('/api/ModernTech', {
          searchQuery: activeTech.searchQuery,
          maxResults: 4
        });
        const videoData = response.data.items;
        
        setVideos(videoData);
        sessionStorage.setItem(cacheKey, JSON.stringify(videoData));
      } catch (err) {
        console.error("YouTube Fetch Error:", err);
        const backendError = err.response?.data?.details || err.response?.data?.error || err.message;
        setError(`API Error: ${backendError}`);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [activeTech]);

  return (
      <div style={styles.page}>
        {/* Background Image reused from MarketRates to save Service Worker storage */}
        <img 
          src="https://img.freepik.com/premium-photo/concept-growing-crops-using-ai-farming-system-uses-artificial-intelligence-optimize-work_1006821-4087.jpg?w=2000" 
          alt="Modern Farming Background" 
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: -2 }} 
        />
        {/* Dark Glass Overlay for text readability */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.2)', zIndex: -1 }}></div>

        <div style={styles.appWrapper}>
          {/* TOP HEADER */}
          <div style={styles.topBar}>
            <button style={styles.iconBtn} onClick={() => navigate('/dashboard')}>
               <IoMdArrowBack size={24} color="#fff" />
            </button>
            <div style={styles.locationText}>
              <span style={styles.cityTitle}>Agri-Tech Hub</span>
              <span style={styles.regionTitle}>Modern Farming</span>
            </div>
            <div style={{width: '40px'}}></div>
        </div>

          <div className="hide-scrollbar" style={styles.scrollContent}>
            {/* HORIZONTAL CATEGORY SCROLL */}
              <div className="hide-scrollbar" style={styles.tabContainer}>
              {TECH_CATEGORIES.map((tech) => (
                  <button 
                    key={tech.id} 
                    onClick={() => setActiveTech(tech)}
                    style={{
                        ...styles.tabBtn, 
                          background: activeTech.id === tech.id ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                          borderTop: activeTech.id === tech.id ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.15)',
                          borderLeft: activeTech.id === tech.id ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                        {tech.icon} <span style={{marginLeft: '8px', fontWeight: activeTech.id === tech.id ? '700' : '500'}}>{tech.name}</span>
                  </button>
              ))}
            </div>

            {/* THE "VALUE ADD" INSIGHT CARD */}
              <div style={styles.glassSection}>
                <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'10px'}}>
                      <div style={styles.iconCircle}><IoMdInformationCircle size={24} color="#4ade80" /></div>
                      <h3 style={{margin:0, color:'#fff', fontSize:'18px', fontWeight:'700'}}>Why {activeTech.name}?</h3>
                </div>
                  <p style={{fontSize:'14px', color:'rgba(255,255,255,0.8)', margin:'0 0 15px 0', lineHeight:'1.5'}}>{activeTech.description}</p>
                
                <div style={styles.statsGrid}>
                      <div style={styles.modernCard}>
                          <div style={styles.cardLabel}>Est. Cost</div>
                        <span style={styles.statValue}>{activeTech.cost}</span>
                    </div>
                      <div style={styles.modernCard}>
                          <div style={styles.cardLabel}>Govt Subsidy</div>
                        <span style={styles.statValue}>{activeTech.subsidy}</span>
                    </div>
                </div>
                
                  <div style={styles.benefitText}>
                     <span style={{color:'#4ade80', fontWeight:'700', display:'block', marginBottom:'4px'}}>Key Benefits</span>
                     {activeTech.benefits}
                  </div>

                <button onClick={() => navigate('/rent-machinery')} style={styles.actionBtn}>
                      {activeTech.actionText}
                </button>
            </div>

            {/* YOUTUBE VIDEO FEED */}
              <div style={{...styles.glassSection, padding: '15px 20px', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                  <span style={{color: '#fff', fontSize: '15px', fontWeight: '700'}}>Recommended Tutorials</span>
                  <IoMdPlay size={18} color="rgba(255,255,255,0.6)" />
              </div>
            
            {loading && <div style={{color:'#a1a1aa', textAlign:'center', padding:'20px'}}>Fetching latest videos...</div>}
            {error && <div style={{color:'#ef4444', textAlign:'center', padding:'20px'}}>{error}</div>}
            
            {!loading && !error && videos.length === 0 && <div style={{color:'#a1a1aa', textAlign:'center', padding:'20px'}}>No videos found.</div>}

            <div style={styles.videoList}>
              {videos.map((vid) => (
                  <div key={vid.id.videoId} style={styles.videoCard}>
                      <div style={styles.iframeWrapper}>
                          <iframe 
                              width="100%" 
                              height="100%" 
                              src={`https://www.youtube-nocookie.com/embed/${vid.id.videoId}?rel=0&modestbranding=1`} 
                              title={vid.snippet.title} 
                              frameBorder="0" 
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                              allowFullScreen
                                style={{position:'absolute', top:0, left:0, borderRadius:'20px'}}
                          ></iframe>
                      </div>
                      <div style={styles.videoDetails}>
                          <h4 style={styles.videoTitle}>{vid.snippet.title.replace(/&quot;/g, '"').replace(/&#39;/g, "'")}</h4>
                          <p style={styles.channelTitle}>{vid.snippet.channelTitle}</p>
                      </div>
                  </div>
              ))}
            </div>
          </div>
        </div>
      </div>
  );
};

// APPLE STYLE GLASSMORPHISM BASE
const appleGlass = {
  background: 'rgba(255, 255, 255, 0.06)',
  backdropFilter: 'blur(16px) saturate(120%)',
  WebkitBackdropFilter: 'blur(16px) saturate(120%)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderTop: '1px solid rgba(255, 255, 255, 0.3)',
  borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.2), inset 0 -1px 2px rgba(0, 0, 0, 0.1), 0 8px 30px rgba(0, 0, 0, 0.2)'
};

const styles = {
  page: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', color: 'white', fontFamily: '"SF Pro Display", system-ui, sans-serif', background: 'transparent', textShadow: '0 2px 10px rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center' },
  appWrapper: { position: 'relative', width: '100%', maxWidth: '520px', height: '100%', display: 'flex', flexDirection: 'column' },
  
  topBar: { ...appleGlass, display:'flex', justifyContent:'space-between', alignItems:'center', borderRadius: '40px', padding: '8px 15px', margin: '15px 12px', zIndex: 10 },
  locationText: { display:'flex', flexDirection:'column', alignItems:'center', flex: 1, overflow: 'hidden', padding: '0 10px', textAlign: 'center' },
  cityTitle: { fontSize:'18px', fontWeight:'700', textShadow:'0 2px 5px rgba(0,0,0,0.5)', letterSpacing:'0.5px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', width:'100%' },
  regionTitle: { fontSize:'11px', opacity:0.9, marginTop:'2px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', width:'100%', color: '#4ade80' },
  iconBtn: { background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.1)', borderTop: '1px solid rgba(255, 255, 255, 0.3)', borderLeft: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '14px', color:'white', cursor:'pointer', padding:'8px', backdropFilter: 'blur(16px)', boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.2), inset 0 -1px 2px rgba(0, 0, 0, 0.1), 0 4px 10px rgba(0, 0, 0, 0.1)' },

  scrollContent: { flex: 1, overflowY: 'auto', padding: '10px 12px 100px 12px' },
  
  tabContainer: { display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '15px', marginBottom: '5px' },
  tabBtn: { display: 'flex', alignItems: 'center', padding: '12px 20px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.05)', borderTop: '1px solid rgba(255,255,255,0.2)', borderLeft: '1px solid rgba(255,255,255,0.1)', whiteSpace: 'nowrap', cursor: 'pointer', transition: 'all 0.3s ease', color: '#fff', backdropFilter: 'blur(16px)', boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.15), inset 0 -1px 2px rgba(0, 0, 0, 0.1), 0 4px 15px rgba(0,0,0,0.1)' },
  
  glassSection: { ...appleGlass, borderRadius: '32px', padding: '20px', marginBottom: '20px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' },
  iconCircle: { width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(74, 222, 128, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(74, 222, 128, 0.2)', borderTop: '1px solid rgba(74, 222, 128, 0.4)', borderLeft: '1px solid rgba(74, 222, 128, 0.3)', boxShadow: 'inset 0 1px 3px rgba(255, 255, 255, 0.2)' },
  
  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '15px' },
  modernCard: { background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(16px)', borderRadius: '20px', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', border: '1px solid rgba(255, 255, 255, 0.08)', borderTop: '1px solid rgba(255, 255, 255, 0.25)', borderLeft: '1px solid rgba(255, 255, 255, 0.15)', boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.15), inset 0 -1px 2px rgba(0, 0, 0, 0.1)' },
  cardLabel: { fontSize: '11px', color: '#a1a1aa', textTransform: 'uppercase', fontWeight: '600', marginBottom: '6px', letterSpacing: '0.5px' },
  statValue: { fontSize: '15px', color: '#fff', fontWeight: '700' },
  
  benefitText: { fontSize: '13px', color: '#d1d5db', background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(16px)', padding: '16px', borderRadius: '20px', lineHeight: '1.6', border: '1px solid rgba(255, 255, 255, 0.08)', borderTop: '1px solid rgba(255, 255, 255, 0.25)', borderLeft: '1px solid rgba(255, 255, 255, 0.15)', boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.15), inset 0 -1px 2px rgba(0, 0, 0, 0.1)' },
  actionBtn: { width: '100%', padding: '16px', marginTop: '20px', background: 'linear-gradient(135deg, rgba(52, 211, 153, 0.9) 0%, rgba(5, 150, 105, 0.9) 100%)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderTop: '1px solid rgba(255,255,255,0.4)', borderRadius: '16px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', backdropFilter: 'blur(16px)', boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.3), 0 8px 25px rgba(5, 150, 105, 0.4)' },

  videoList: { display: 'flex', flexDirection: 'column', gap: '15px' },
  videoCard: { ...appleGlass, borderRadius: '32px', overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '12px' },
  iframeWrapper: { position: 'relative', width: '100%', paddingTop: '56.25%', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.08)', borderTop: '1px solid rgba(255, 255, 255, 0.25)', boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.2)' },
  videoDetails: { padding: '15px 5px 5px 5px' },
  videoTitle: { margin: '0 0 6px 0', fontSize: '15px', color: '#fff', fontWeight: '700', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  channelTitle: { margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }
};

export default ModernTech;