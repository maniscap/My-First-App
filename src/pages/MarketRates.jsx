import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { IoMdArrowBack, IoMdRefresh, IoMdSearch, IoMdCalendar, IoMdArrowDropdown, IoMdArrowDropup } from 'react-icons/io';
import { FaMapMarkerAlt, FaStar, FaRegStar, FaLeaf } from 'react-icons/fa';
import { INDIA_LOCATIONS, STATIC_MARKETS } from '../Data/marketData';

// --- CAROUSEL BANNERS ---
const BANNERS = [
  "https://img.freepik.com/premium-photo/smart-farmer-holding-smartphone-with-ai-tech-interface-farm-background-future-smart-farming_1162141-40976.jpg",
  "https://cdn.siasat.com/wp-content/uploads/2020/10/2020_10img07_Oct_2020_PTI07-10-2020_000074B-1-scaled.jpg",
  "https://www.unite.ai/wp-content/uploads/2024/12/AI-for-Agriculture.webp",
  "https://olimpum.com/en/wp-content/uploads/WhatsApp-Image-2024-09-20-at-00.22.46.jpeg"
];

const generateRobustDummyData = () => { 
    return [
        {commodity: "Tomato", market: "Guntur", district: "Guntur", state: "Andhra Pradesh", modal_price: 1500, min_price: 1200, max_price: 1800, arrival_date: "12/10/2023"},
        {commodity: "Cotton", market: "Adilabad", district: "Adilabad", state: "Telangana", modal_price: 6500, min_price: 6000, max_price: 7000, arrival_date: "12/10/2023"},
        {commodity: "Onion", market: "Lasalgaon", district: "Nashik", state: "Maharashtra", modal_price: 2200, min_price: 1800, max_price: 2500, arrival_date: "12/10/2023"},
        {commodity: "Potato", market: "Agra", district: "Agra", state: "Uttar Pradesh", modal_price: 900, min_price: 800, max_price: 1000, arrival_date: "12/10/2023"},
        {commodity: "Rice", market: "Burdwan", district: "Bardhaman", state: "West Bengal", modal_price: 3200, min_price: 3000, max_price: 3400, arrival_date: "12/10/2023"}
    ]; 
};

const MarketRates = () => {
  const navigate = useNavigate();
  
  // --- UI STATE ---
  const [currentBanner, setCurrentBanner] = useState(0);
  const [bgLoaded, setBgLoaded] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');
  const [dataSource, setDataSource] = useState('');

  // --- DATA STATES ---
  const [allMarketData, setAllMarketData] = useState([]); 
  const [filteredData, setFilteredData] = useState([]); 

  // --- LOCAL STORAGE: Learned Markets (Dynamic Cache) ---
  const [learnedMarkets, setLearnedMarkets] = useState(() => {
    try {
      const saved = localStorage.getItem('farmcap_learned_markets');
      return saved ? JSON.parse(saved) : {};
    } catch (e) { return {}; }
  });

  // --- LOCAL STORAGE: Check for Pinned Market on Load ---
  const [pinnedMarket, setPinnedMarket] = useState(() => {
    const saved = localStorage.getItem('farmcap_pinned_market');
    return saved ? JSON.parse(saved) : null;
  });

  // --- FILTER STATES ---
  const [selectedState, setSelectedState] = useState(pinnedMarket ? pinnedMarket.state : 'Andhra Pradesh');
  const [selectedDistrict, setSelectedDistrict] = useState(pinnedMarket ? pinnedMarket.district : 'All');
  const [selectedMarket, setSelectedMarket] = useState(pinnedMarket ? pinnedMarket.market : 'All');

  // Lists for Dropdowns
  const [districtsList, setDistrictsList] = useState([]);
  const [marketsList, setMarketsList] = useState([]);

  const MANDI_KEY = import.meta.env.VITE_GOVT_MANDI_KEY;

  const stateKeys = Object.keys(INDIA_LOCATIONS).sort();

  // --- CAROUSEL EFFECT ---
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner(prev => (prev + 1) % BANNERS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // --- FETCH REAL DATA ---
  const fetchMarketRates = async () => {
    setLoading(true);
    
    if (!MANDI_KEY) {
        console.warn("⚠️ No API Key found. Using Demo Data.");
        processData(generateRobustDummyData());
        setDataSource('🟠 Demo Mode (No Key)');
        setLoading(false);
        return;
    }

    try {
      const url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${MANDI_KEY}&format=json&limit=10000`;
      const res = await axios.get(url);
      if(res.data.records && res.data.records.length > 0) {
        processData(res.data.records);
        setDataSource('🟢 Live Govt Data');
      } else throw new Error("Empty");
    } catch (err) {
      console.error("API Fetch Error:", err);
      processData(generateRobustDummyData()); // Fallback
      setDataSource('🔴 Offline / Demo Data');
    }
    setLoading(false);
  };

  const processData = (data) => {
    setAllMarketData(data);
    setLastUpdated(new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}));

    // --- DYNAMICALLY LEARN NEW MARKETS ---
    setLearnedMarkets(prev => {
      const newLearned = { ...prev };
      let hasUpdates = false;
      data.forEach(item => {
        const { state, district, market } = item;
        if (!state || !district || !market) return;
        if (!newLearned[state]) newLearned[state] = {};
        if (!newLearned[state][district]) newLearned[state][district] = [];
        if (!newLearned[state][district].includes(market)) {
          newLearned[state][district].push(market);
          hasUpdates = true;
        }
      });
      if (hasUpdates) localStorage.setItem('farmcap_learned_markets', JSON.stringify(newLearned));
      return hasUpdates ? newLearned : prev;
    });
  };

  useEffect(() => { fetchMarketRates(); }, []);

  // --- FILTERING ENGINE ---
  useEffect(() => {
    let data = allMarketData;

    if (selectedState !== 'All') {
      data = data.filter(item => item.state === selectedState);
      const apiDistricts = [...new Set(data.map(item => item.district))];
      const staticDistricts = INDIA_LOCATIONS[selectedState] || [];
      setDistrictsList(['All', ...new Set([...apiDistricts, ...staticDistricts])].sort());
    }

    if (selectedDistrict !== 'All') {
      // 1. Filter data for the grid
      const districtData = data.filter(item => item.district === selectedDistrict);
      
      // 2. Populate Markets Dropdown (Merge API markets + Static markets)
      const apiMarkets = [...new Set(districtData.map(item => item.market))];
      const staticMarkets = (STATIC_MARKETS[selectedState] && STATIC_MARKETS[selectedState][selectedDistrict]) || [];
      const cachedMarkets = (learnedMarkets[selectedState] && learnedMarkets[selectedState][selectedDistrict]) || [];
      setMarketsList(['All', ...new Set([...apiMarkets, ...staticMarkets, ...cachedMarkets])].sort());
      
      // 3. Update data for next steps
      data = districtData;
    }

    if (selectedMarket !== 'All') {
      data = data.filter(item => item.market === selectedMarket);
    }

    setFilteredData(data);
  }, [allMarketData, selectedState, selectedDistrict, selectedMarket]);

  // --- PIN MARKET FUNCTION ---
  const togglePinMarket = () => {
    if (pinnedMarket && pinnedMarket.market === selectedMarket) {
      // Unpin if currently pinned
      localStorage.removeItem('farmcap_pinned_market');
      setPinnedMarket(null);
    } else {
      // Pin
      const newPin = { state: selectedState, district: selectedDistrict, market: selectedMarket };
      localStorage.setItem('farmcap_pinned_market', JSON.stringify(newPin));
      setPinnedMarket(newPin);
    }
  };

  const toggleDropdown = (key) => {
    if (activeDropdown === key) {
        setActiveDropdown(null);
    } else {
        setActiveDropdown(key);
    }
  };

  // --- AI CARD EXPANSION PLACEHOLDER ---
  const handleCardClick = (commodity) => {
    console.log(`Clicked ${commodity}! This is where the Gemini AI will fetch 7-day data and expand!`);
    // We will build this logic in Phase 2
  };

  const isCurrentMarketPinned = pinnedMarket && pinnedMarket.market === selectedMarket && selectedMarket !== 'All';

  return (
    <div style={styles.page}>
      <div style={styles.overlay}></div>
      
      {/* HEADER */}
      <div style={styles.glassHeader}>
        <div style={styles.headerTop}>
          <button onClick={() => navigate('/agri-insights')} style={styles.iconBtn}>
            <IoMdArrowBack size={24} color="white"/>
          </button>
          <div style={{textAlign:'center'}}>
            <h1 style={styles.title}>Mandi Rates</h1>
            <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'6px'}}>
              <p style={styles.subtitle}>Live Market Prices</p>
              {dataSource && <span style={styles.sourceBadge}>{dataSource}</span>}
            </div>
          </div>
          <button onClick={fetchMarketRates} style={styles.iconBtn}>
            <IoMdRefresh size={24} color="white" className={loading ? "spin" : ""}/>
          </button>
        </div>
      </div>

      {/* MAIN SCROLLABLE CONTENT */}
      <div style={styles.scrollContent}>

        {/* 1. PROFESSIONAL CAROUSEL BANNER */}
        <div style={styles.carouselWrapper}>
            {BANNERS.map((src, i) => (
                <img 
                    key={i} 
                    src={src} 
                    style={{
                        ...styles.bannerImg, 
                        opacity: currentBanner === i ? 1 : 0 
                    }} 
                />
            ))}
            <div style={styles.bannerOverlay}>
                <div style={styles.bannerTitle}>FarmCap</div>
                <div style={styles.bannerSubtitle}>Your Harvest. Your Capital. Your Control.</div>
            </div>
            <div style={styles.dotsContainer}>
                {BANNERS.map((_, i) => (
                    <div key={i} style={{...styles.dot, background: i === currentBanner ? '#fff' : 'rgba(255,255,255,0.4)'}} />
                ))}
            </div>
        </div>

        {/* 2. GOV STYLE TICKER */}
        <div style={styles.tickerContainer}>
            <div style={styles.tickerText}>Live Market Analytics Powered by AGMARKNET | Department of Agriculture & Farmers Welfare, Government of India</div>
        </div>
        
        {/* VERTICAL FILTER STACK */}
        <div style={styles.filterStack}>
            
            {/* DATE SELECTOR */}
            <div style={styles.dropdownContainer}>
                <label style={styles.dropdownLabel}>Select Date</label>
                <div style={styles.glassInputWrapper}>
                    <IoMdCalendar size={20} color="rgba(255,255,255,0.8)"/>
                    <input 
                        type="date" 
                        value={filterDate} 
                        onChange={(e) => setFilterDate(e.target.value)} 
                        style={styles.dateInput}
                    />
                </div>
            </div>

            {/* STATE SELECTOR */}
            <div style={styles.dropdownContainer}>
                <label style={styles.dropdownLabel}>Select State</label>
                <div style={styles.dropdownHeader} onClick={() => toggleDropdown('state')}>
                    <span>{selectedState === 'All' ? 'Select State' : selectedState}</span>
                    {activeDropdown === 'state' ? <IoMdArrowDropup size={20}/> : <IoMdArrowDropdown size={20}/>}
                </div>
                {activeDropdown === 'state' && (
                    <div style={styles.dropdownList}>
                        {stateKeys.map(state => (
                            <div key={state} style={styles.dropdownItem} onClick={() => {
                                setSelectedState(state); setSelectedDistrict('All'); setSelectedMarket('All'); setActiveDropdown(null);
                            }}>
                                {state}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* DISTRICT SELECTOR */}
            {selectedState !== 'All' && (
                <div style={styles.dropdownContainer}>
                    <label style={styles.dropdownLabel}>Select District</label>
                    <div style={styles.dropdownHeader} onClick={() => toggleDropdown('district')}>
                        <span>{selectedDistrict === 'All' ? 'Select District' : selectedDistrict}</span>
                        {activeDropdown === 'district' ? <IoMdArrowDropup size={20}/> : <IoMdArrowDropdown size={20}/>}
                    </div>
                    {activeDropdown === 'district' && (
                        <div style={styles.dropdownList}>
                            {districtsList.map(dist => (
                                <div key={dist} style={styles.dropdownItem} onClick={() => {
                                    setSelectedDistrict(dist); setSelectedMarket('All'); setActiveDropdown(null);
                                }}>
                                    {dist}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* MARKET SELECTOR */}
            {selectedDistrict !== 'All' && (
                <div style={styles.dropdownContainer}>
                    <label style={styles.dropdownLabel}>Select Market</label>
                    <div style={styles.dropdownHeader} onClick={() => toggleDropdown('market')}>
                        <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                            <span>{selectedMarket === 'All' ? 'Select Market' : selectedMarket}</span>
                            {selectedMarket !== 'All' && (
                                <div onClick={(e) => { e.stopPropagation(); togglePinMarket(); }}>
                                    {isCurrentMarketPinned ? <FaStar color="#FFD700"/> : <FaRegStar color="rgba(255,255,255,0.5)"/>}
                                </div>
                            )}
                        </div>
                        {activeDropdown === 'market' ? <IoMdArrowDropup size={20}/> : <IoMdArrowDropdown size={20}/>}
                    </div>
                    {activeDropdown === 'market' && (
                        <div style={styles.dropdownList}>
                            {marketsList.map(mkt => (
                                <div key={mkt} style={styles.dropdownItem} onClick={() => {
                                    setSelectedMarket(mkt); setActiveDropdown(null);
                                }}>
                                    {mkt}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>

        {/* 4. COMMODITIES GRID */}
        <div style={{...styles.section, marginBottom: '40px'}}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionTitle}>
                {selectedMarket !== 'All' ? `${selectedMarket} Rates` : 'All Commodities'}
            </span>
            <span style={styles.sectionCount}>{filteredData.length} Items</span>
          </div>

          {loading ? (
              <div style={styles.loaderContainer}>
                  <div className="loader"></div>
                  <p style={{color:'white', marginTop:'10px'}}>Fetching Live Rates...</p>
              </div>
          ) : (
            <div style={styles.grid}>
              {filteredData.length === 0 && (
                  <div style={styles.emptyState}>
                      <FaLeaf size={40} color="rgba(255,255,255,0.3)"/>
                      <p>No data found for this selection.</p>
                  </div>
              )}
              {filteredData.map((item, index) => (
                  <div key={index} style={styles.glassCard} onClick={() => handleCardClick(item.commodity)}>
                      <div style={styles.cardHeader}>
                          <h3 style={styles.commodityName}>{item.commodity}</h3>
                          <span style={styles.dateBadge}>{item.arrival_date}</span>
                      </div>
                      <div style={styles.locationRow}>
                          <FaMapMarkerAlt size={12} color="#4ade80"/> 
                          <span>{item.market}, {item.district}</span>
                      </div>
                      <div style={styles.priceRow}>
                          <div style={styles.priceLabel}>Modal Price</div>
                          <div style={styles.priceValue}>₹{item.modal_price}<span>/qtl</span></div>
                      </div>
                      <div style={styles.minMaxRow}>
                          <span>Min: ₹{item.min_price}</span>
                          <span>Max: ₹{item.max_price}</span>
                      </div>
                      <div style={styles.aiBadge}>Tap for AI Analysis ✨</div>
                  </div>
              ))}
            </div>
          )}
        </div>

      </div>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .loader { border: 3px solid rgba(255,255,255,0.3); border-top: 3px solid #4ade80; border-radius: 50%; width: 30px; height: 30px; animation: spin 1s linear infinite; }
        @keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
      `}</style>
    </div>
  );
};

// --- PREMIUM GLASSMORPHISM STYLES ---
const styles = {
  page: { 
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
      background: '#111',
      fontFamily: '"Inter", sans-serif', color: 'white', overflow: 'hidden',
      display: 'flex', flexDirection: 'column'
  },
  overlay: { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 0 },
  
  glassHeader: { 
      position: 'relative', zIndex: 10, 
      background: 'rgba(255, 255, 255, 0.1)', 
      backdropFilter: 'blur(15px)', WebkitBackdropFilter: 'blur(15px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '15px 20px', display: 'flex', flexDirection: 'column', gap: '15px'
  },
  headerTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: '22px', margin: 0, fontWeight: '800', letterSpacing: '0.5px' },
  subtitle: { fontSize: '12px', opacity: 0.8, margin: 0 },
  sourceBadge: { fontSize: '9px', background: 'rgba(74, 222, 128, 0.2)', color: '#4ade80', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(74, 222, 128, 0.3)' },
  iconBtn: { background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '12px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  pinIconBtn: { background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },

  scrollContent: { flex: 1, overflowY: 'auto', padding: '20px', position: 'relative', zIndex: 5 },
  
  // --- CAROUSEL STYLES ---
  carouselWrapper: {
    position: 'relative',
    width: '100%',
    height: '220px',
    borderRadius: '20px',
    overflow: 'hidden',
    marginBottom: '20px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
  },
  bannerImg: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'opacity 1s ease-in-out'
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
    padding: '20px',
    boxSizing: 'border-box'
  },
  bannerTitle: { fontSize: '20px', fontWeight: '800', color: 'white', marginBottom: '4px' },
  bannerSubtitle: { fontSize: '12px', color: '#4ade80', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' },
  dotsContainer: { position: 'absolute', bottom: '15px', right: '20px', display: 'flex', gap: '6px', zIndex: 2 },
  dot: { width: '6px', height: '6px', borderRadius: '50%', transition: 'background 0.3s' },

  // --- TICKER STYLES ---
  tickerContainer: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '12px',
    padding: '10px 15px',
    marginBottom: '25px',
    border: '1px solid rgba(255,255,255,0.1)',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    backdropFilter: 'blur(5px)'
  },
  tickerText: {
    fontSize: '12px',
    color: '#ccc',
    display: 'inline-block',
    animation: 'marquee 15s linear infinite'
  },

  filterStack: { display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' },
  dropdownContainer: { position: 'relative' },
  dropdownLabel: { display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginBottom: '6px', marginLeft: '4px', fontWeight: '600', textTransform: 'uppercase' },
  dropdownHeader: {
      background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '12px',
      padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      color: 'white', cursor: 'pointer', fontSize: '15px', fontWeight: '500',
      transition: 'background 0.2s'
  },
  dropdownList: {
      position: 'absolute', top: '100%', left: 0, right: 0,
      background: '#1e1e1e', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '12px', marginTop: '5px', maxHeight: '250px', overflowY: 'auto',
      zIndex: 100, boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
  },
  dropdownItem: { padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.9)', cursor: 'pointer', fontSize: '14px' },
  
  glassInputWrapper: { background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' },
  dateInput: { background: 'transparent', border: 'none', color: 'white', fontSize: '15px', width: '100%', outline: 'none', fontFamily: 'inherit', colorScheme: 'dark' },

  section: { marginBottom: '25px' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', padding: '0 5px' },
  sectionTitle: { fontSize: '14px', fontWeight: '700', color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase', letterSpacing: '1px' },
  sectionCount: { fontSize: '12px', color: 'rgba(255,255,255,0.5)' },

  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px' },
  
  glassCard: { 
      background: 'rgba(255, 255, 255, 0.07)', 
      backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)', 
      borderRadius: '16px', padding: '15px', 
      display: 'flex', flexDirection: 'column', gap: '8px',
      cursor: 'pointer', transition: 'transform 0.2s',
      boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
  },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  commodityName: { margin: 0, fontSize: '16px', fontWeight: '700', color: '#fff' },
  dateBadge: { fontSize: '10px', color: 'rgba(255,255,255,0.5)' },
  
  locationRow: { display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'rgba(255,255,255,0.7)' },
  
  priceRow: { marginTop: '5px', background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '8px', textAlign: 'center' },
  priceLabel: { fontSize: '10px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' },
  priceValue: { fontSize: '18px', fontWeight: '800', color: '#4ade80' },
  
  minMaxRow: { display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' },
  
  aiBadge: { 
      marginTop: '5px', fontSize: '10px', textAlign: 'center', 
      color: '#60a5fa', fontWeight: '600', letterSpacing: '0.5px',
      borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '8px'
  },

  loaderContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px' },
  emptyState: { gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', color: 'rgba(255,255,255,0.5)', gap: '10px' }
};

export default MarketRates;