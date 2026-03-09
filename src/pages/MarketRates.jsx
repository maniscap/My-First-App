import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { IoMdArrowBack, IoMdRefresh, IoMdSearch, IoMdCalendar, IoMdArrowDropdown, IoMdArrowDropup } from 'react-icons/io';
import { FaMapMarkerAlt, FaStar, FaRegStar, FaLeaf } from 'react-icons/fa';

// --- BANNERS & CONSTANTS ---
const BANNERS = [
  "https://img.freepik.com/premium-photo/smart-farmer-holding-smartphone-with-ai-tech-interface-farm-background-future-smart-farming_1162141-40976.jpg",
  "https://cdn.siasat.com/wp-content/uploads/2020/10/2020_10img07_Oct_2020_PTI07-10-2020_000074B-1-scaled.jpg",
  "https://www.unite.ai/wp-content/uploads/2024/12/AI-for-Agriculture.webp",
  "https://olimpum.com/en/wp-content/uploads/WhatsApp-Image-2024-09-20-at-00.22.46.jpeg"
];

const CEDA_BASE = '/api/ceda/agmarknet';

const MarketRates = () => {
  const navigate = useNavigate();
  
  // --- UI STATE ---
  const [currentBanner, setCurrentBanner] = useState(0);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState('Awaiting Search...');

  // --- DATA STATES ---
  const [filteredData, setFilteredData] = useState([]); 
  const [geographiesData, setGeographiesData] = useState([]);

  // --- FILTER STATES ---
  const [selectedState, setSelectedState] = useState('Select State');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedMarket, setSelectedMarket] = useState('All');
  const [selectedCommodity, setSelectedCommodity] = useState('All');

  // --- DYNAMIC DROPDOWN LISTS ---
  const [statesList, setStatesList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);
  const [marketsList, setMarketsList] = useState([]);
  const [commoditiesList, setCommoditiesList] = useState([]);

  const MANDI_KEY = import.meta.env.VITE_GOVT_MANDI_KEY;

  // --- CAROUSEL EFFECT ---
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner(prev => (prev + 1) % BANNERS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // --- PHASE 1: INITIALIZE STRUCTURAL DATA FROM CEDA ON LOAD ---
  useEffect(() => {
    const initializeDropdowns = async () => {
      try {
        // 1. Fetch Geographies (States & Districts)
        const geoRes = await axios.get(`${CEDA_BASE}/geographies`);
        const geoData = geoRes.data || [];
        setGeographiesData(geoData);
        
        // Extract unique states
        const uniqueStates = [...new Set(geoData.map(item => item.state))].filter(Boolean).sort();
        setStatesList(uniqueStates);

        // 2. Fetch Commodities List
        const commRes = await axios.get(`${CEDA_BASE}/commodities`);
        const commData = commRes.data || [];
        // Assuming API returns array of strings or objects. Handling both securely:
        const parsedCommodities = commData.map(c => typeof c === 'string' ? c : c.commodity).filter(Boolean).sort();
        setCommoditiesList(['All', ...parsedCommodities]);

      } catch (error) {
        console.error("Failed to load CEDA structural data:", error);
      }
    };
    initializeDropdowns();
  }, []);

  // --- PHASE 1.5: CASCADE DROPDOWNS ---
  // When State changes -> Update Districts
  useEffect(() => {
    if (selectedState !== 'Select State' && selectedState !== 'All') {
      const stateDistricts = geographiesData
        .filter(item => item.state === selectedState)
        .map(item => item.district)
        .filter(Boolean);
      setDistrictsList(['All', ...new Set(stateDistricts)].sort());
      setSelectedDistrict('All');
      setSelectedMarket('All');
      setMarketsList([]);
    }
  }, [selectedState, geographiesData]);

  // When District changes -> Fetch Markets via CEDA POST
  useEffect(() => {
    const fetchMarkets = async () => {
      if (selectedState !== 'Select State' && selectedDistrict !== 'All') {
        try {
          const res = await axios.post(`${CEDA_BASE}/markets`, {
            state: selectedState,
            district: selectedDistrict
          });
          const mktData = res.data || [];
          const parsedMarkets = mktData.map(m => typeof m === 'string' ? m : m.market).filter(Boolean).sort();
          setMarketsList(['All', ...parsedMarkets]);
        } catch (error) {
          console.error("Failed to fetch markets from CEDA:", error);
        }
      }
    };
    fetchMarkets();
  }, [selectedDistrict]);

  // --- PHASE 2: THE HYBRID FALLBACK ROUTER (THE ENGINE) ---
  const fetchLiveRates = async () => {
    setLoading(true);
    setFilteredData([]);
    
    const todayStr = new Date().toISOString().split('T')[0];
    const isToday = filterDate === todayStr;

    // Helper Function to map API responses to UI format
    const formatData = (rawArray) => {
       return rawArray.map(item => ({
          commodity: item.commodity,
          market: item.market,
          district: item.district,
          state: item.state,
          modal_price: item.modal_price || item.price || "N/A",
          min_price: item.min_price || item.min || "N/A",
          max_price: item.max_price || item.max || "N/A",
          arrival_date: item.arrival_date || item.date || filterDate
       }));
    };

    if (isToday) {
      // PATH B: Attempt 1 - Gov API (Live Spot Prices)
      try {
        setDataSource('Fetching Live Gov Data...');
        const govUrl = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${MANDI_KEY}&format=json&limit=10000`;
        const govRes = await axios.get(govUrl);
        
        let data = govRes.data.records || [];
        
        // Local Filter the massive Gov dump
        if (selectedState !== 'Select State' && selectedState !== 'All') data = data.filter(i => i.state === selectedState);
        if (selectedDistrict !== 'All') data = data.filter(i => i.district === selectedDistrict);
        if (selectedMarket !== 'All') data = data.filter(i => i.market === selectedMarket);
        if (selectedCommodity !== 'All') data = data.filter(i => i.commodity.toLowerCase().includes(selectedCommodity.toLowerCase()));

        if (data.length > 0) {
          setFilteredData(formatData(data));
          setDataSource('🟢 Live Govt Data');
          setLoading(false);
          return; // Success! Exit the function.
        }
        throw new Error("Gov API returned empty for these filters.");
      } catch (err) {
        console.warn("Gov API Failed/Empty, cascading to CEDA Today...", err);
      }

      // PATH B: Attempt 2 - CEDA Today Fallback
      try {
        setDataSource('Gov Offline. Fetching CEDA Backup...');
        const cedaRes = await axios.post(`${CEDA_BASE}/prices`, {
           state: selectedState !== 'All' ? selectedState : undefined,
           district: selectedDistrict !== 'All' ? selectedDistrict : undefined,
           market: selectedMarket !== 'All' ? selectedMarket : undefined,
           commodity: selectedCommodity !== 'All' ? selectedCommodity : undefined,
           date: todayStr
        });

        if (cedaRes.data && cedaRes.data.length > 0) {
          setFilteredData(formatData(cedaRes.data));
          setDataSource('🟡 CEDA Live Backup');
          setLoading(false);
          return;
        }
        throw new Error("CEDA Today returned empty.");
      } catch (err) {
        console.warn("CEDA Today Failed/Empty, cascading to CEDA Yesterday...", err);
      }

      // PATH B: Attempt 3 - CEDA Yesterday Fallback
      try {
        setDataSource('No Today Data. Fetching Yesterday...');
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        const cedaRes = await axios.post(`${CEDA_BASE}/prices`, {
           state: selectedState !== 'All' ? selectedState : undefined,
           district: selectedDistrict !== 'All' ? selectedDistrict : undefined,
           market: selectedMarket !== 'All' ? selectedMarket : undefined,
           commodity: selectedCommodity !== 'All' ? selectedCommodity : undefined,
           date: yesterdayStr
        });

        if (cedaRes.data && cedaRes.data.length > 0) {
           setFilteredData(formatData(cedaRes.data));
           setDataSource(`🟠 Last Updated: ${yesterdayStr}`);
        } else {
           setDataSource('🔴 No Data Available');
        }
      } catch (err) {
         setDataSource('🔴 No Data Available');
      }

    } else {
      // PATH A: Past Date Selected -> Go straight to CEDA
      try {
        setDataSource('Fetching Historical Data...');
        const cedaRes = await axios.post(`${CEDA_BASE}/prices`, {
           state: selectedState !== 'All' ? selectedState : undefined,
           district: selectedDistrict !== 'All' ? selectedDistrict : undefined,
           market: selectedMarket !== 'All' ? selectedMarket : undefined,
           commodity: selectedCommodity !== 'All' ? selectedCommodity : undefined,
           date: filterDate
        });

        if (cedaRes.data && cedaRes.data.length > 0) {
           setFilteredData(formatData(cedaRes.data));
           setDataSource('🟣 Historical (CEDA)');
        } else {
           setDataSource('🔴 No Data Available');
        }
      } catch (err) {
        setDataSource('🔴 Server Error');
      }
    }
    setLoading(false);
  };

  const toggleDropdown = (key) => {
    setActiveDropdown(activeDropdown === key ? null : key);
  };

  const handleCardClick = (commodity) => {
    console.log(`Phase 3: AI Analysis triggered for ${commodity}`);
  };

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.glassHeader}>
        <div style={styles.headerTop}>
          <button onClick={() => navigate('/agri-insights')} style={styles.iconBtn}>
            <IoMdArrowBack size={28} color="#4ade80"/>
          </button>
          <div style={{textAlign:'center'}}>
            <h1 style={styles.title}>Mandi Rates</h1>
            <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'6px'}}>
              <p style={styles.subtitle}>Hybrid Data Pipeline</p>
              {dataSource && <span style={styles.sourceBadge}>{dataSource}</span>}
            </div>
          </div>
          <button onClick={fetchLiveRates} style={styles.iconBtn}>
            <IoMdSearch size={28} color="#4ade80" className={loading ? "spin" : ""}/>
          </button>
        </div>
      </div>

      <div style={styles.scrollContent}>
        {/* CAROUSEL */}
        <div style={styles.carouselWrapper}>
            {BANNERS.map((src, i) => (
                <img key={i} src={src} style={{...styles.bannerImg, opacity: currentBanner === i ? 1 : 0 }} />
            ))}
            <div style={styles.bannerOverlay}>
                <div style={styles.bannerTitle}>FarmCap</div>
                <div style={styles.bannerSubtitle}>Intelligent Market Routing</div>
            </div>
            <div style={styles.dotsContainer}>
                {BANNERS.map((_, i) => (
                    <div key={i} style={{...styles.dot, background: i === currentBanner ? '#fff' : 'rgba(255,255,255,0.4)'}} />
                ))}
            </div>
        </div>

        {/* DYNAMIC FILTER STACK */}
        <div style={styles.filterStack}>
            
            {/* DATE SELECTOR */}
            <div style={styles.dropdownContainer}>
                <label style={styles.dropdownLabel}>Select Date</label>
                <div style={styles.glassInputWrapper}>
                    <IoMdCalendar size={20} color="rgba(255,255,255,0.8)"/>
                    <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} style={styles.dateInput} />
                </div>
            </div>

            {/* STATE SELECTOR */}
            <div style={styles.dropdownContainer}>
                <label style={styles.dropdownLabel}>Select State</label>
                <div style={styles.dropdownHeader} onClick={() => toggleDropdown('state')}>
                    <span style={{overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{selectedState}</span>
                    {activeDropdown === 'state' ? <IoMdArrowDropup size={20}/> : <IoMdArrowDropdown size={20}/>}
                </div>
                {activeDropdown === 'state' && (
                    <div style={styles.dropdownList}>
                        {statesList.map(state => (
                            <div key={state} style={styles.dropdownItem} onClick={() => {
                                setSelectedState(state); setActiveDropdown(null);
                            }}>
                                {state}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* DISTRICT SELECTOR */}
            <div style={styles.dropdownContainer}>
                <label style={styles.dropdownLabel}>Select District</label>
                <div style={styles.dropdownHeader} onClick={() => toggleDropdown('district')}>
                    <span style={{overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{selectedDistrict}</span>
                    {activeDropdown === 'district' ? <IoMdArrowDropup size={20}/> : <IoMdArrowDropdown size={20}/>}
                </div>
                {activeDropdown === 'district' && (
                    <div style={styles.dropdownList}>
                        {districtsList.map(dist => (
                            <div key={dist} style={styles.dropdownItem} onClick={() => {
                                setSelectedDistrict(dist); setActiveDropdown(null);
                            }}>
                                {dist}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* MARKET SELECTOR */}
            <div style={styles.dropdownContainer}>
                <label style={styles.dropdownLabel}>Select Market</label>
                <div style={styles.dropdownHeader} onClick={() => toggleDropdown('market')}>
                    <span style={{overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{selectedMarket}</span>
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

            {/* COMMODITY SELECTOR */}
            <div style={styles.dropdownContainer}>
                <label style={styles.dropdownLabel}>Commodity (Optional)</label>
                <div style={styles.dropdownHeader} onClick={() => toggleDropdown('commodity')}>
                    <span style={{overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{selectedCommodity}</span>
                    {activeDropdown === 'commodity' ? <IoMdArrowDropup size={20}/> : <IoMdArrowDropdown size={20}/>}
                </div>
                {activeDropdown === 'commodity' && (
                    <div style={styles.dropdownList}>
                        {commoditiesList.map(item => (
                            <div key={item} style={styles.dropdownItem} onClick={() => {
                                setSelectedCommodity(item); setActiveDropdown(null);
                            }}>
                                {item}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* GET PRICES BUTTON */}
            <div style={{gridColumn: '1 / -1', marginTop: '10px'}}>
                <button 
                  onClick={fetchLiveRates} 
                  style={{
                    width: '100%', padding: '15px', borderRadius: '12px', border: 'none',
                    background: selectedState !== 'Select State' ? '#4ade80' : 'rgba(255,255,255,0.1)',
                    color: selectedState !== 'Select State' ? '#000' : 'rgba(255,255,255,0.3)',
                    fontWeight: '800', fontSize: '16px', cursor: selectedState !== 'Select State' ? 'pointer' : 'not-allowed',
                    textTransform: 'uppercase', letterSpacing: '1px', transition: 'all 0.3s'
                  }}
                  disabled={selectedState === 'Select State'}
                >
                  {loading ? 'Searching Data Nodes...' : 'Search Market Rates'}
                </button>
            </div>
        </div>

        {/* RESULTS GRID */}
        <div style={{...styles.section, marginBottom: '40px'}}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionTitle}>
                {selectedMarket !== 'All' ? `${selectedMarket} Rates` : 'Live Prices'}
            </span>
            <span style={styles.sectionCount}>{filteredData.length} Items Found</span>
          </div>

          {loading ? (
              <div style={styles.loaderContainer}>
                  <div className="loader"></div>
                  <p style={{color:'white', marginTop:'10px'}}>Routing through API Nodes...</p>
              </div>
          ) : (
            <div style={styles.grid}>
              {filteredData.length === 0 && !loading && (
                  <div style={styles.emptyState}>
                      <FaLeaf size={40} color="rgba(255,255,255,0.3)"/>
                      <p>Select a State and tap Search to get started.</p>
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
      `}</style>
    </div>
  );
};

// --- PREMIUM GLASSMORPHISM STYLES (Kept exactly as you had them) ---
const styles = {
  page: { 
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
      background: 'radial-gradient(circle at 50% 0%, #111827 0%, #000000 100%)',
      fontFamily: '"Inter", sans-serif', color: 'white', overflow: 'hidden',
      display: 'flex', flexDirection: 'column'
  },
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
  iconBtn: { background: 'transparent', border: 'none', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  scrollContent: { flex: 1, overflowY: 'auto', padding: '20px', position: 'relative', zIndex: 5 },
  carouselWrapper: { position: 'relative', width: '100%', height: '220px', borderRadius: '16px', overflow: 'hidden', marginBottom: '20px', border: '1px solid rgba(74, 222, 128, 0.3)', boxShadow: '0 0 20px rgba(74, 222, 128, 0.1)' },
  bannerImg: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 1s ease-in-out' },
  bannerOverlay: { position: 'absolute', bottom: 0, left: 0, width: '100%', background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', padding: '20px', boxSizing: 'border-box' },
  bannerTitle: { fontSize: '20px', fontWeight: '800', color: 'white', marginBottom: '4px' },
  bannerSubtitle: { fontSize: '12px', color: '#4ade80', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' },
  dotsContainer: { position: 'absolute', bottom: '15px', right: '20px', display: 'flex', gap: '6px', zIndex: 2 },
  dot: { width: '6px', height: '6px', borderRadius: '50%', transition: 'background 0.3s' },
  filterStack: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' },
  dropdownContainer: { position: 'relative' },
  dropdownLabel: { display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginBottom: '6px', marginLeft: '4px', fontWeight: '600', textTransform: 'uppercase' },
  dropdownHeader: { background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '12px', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: '500', transition: 'background 0.2s' },
  dropdownList: { position: 'absolute', top: '100%', left: 0, right: 0, background: '#1e1e1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', marginTop: '5px', maxHeight: '250px', overflowY: 'auto', zIndex: 100, boxShadow: '0 10px 40px rgba(0,0,0,0.5)' },
  dropdownItem: { padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.9)', cursor: 'pointer', fontSize: '14px' },
  glassInputWrapper: { background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' },
  dateInput: { background: 'transparent', border: 'none', color: 'white', fontSize: '15px', width: '100%', outline: 'none', fontFamily: 'inherit', colorScheme: 'dark' },
  section: { marginBottom: '25px' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', padding: '0 5px' },
  sectionTitle: { fontSize: '14px', fontWeight: '700', color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase', letterSpacing: '1px' },
  sectionCount: { fontSize: '12px', color: 'rgba(255,255,255,0.5)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px' },
  glassCard: { background: 'rgba(255, 255, 255, 0.07)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '15px', display: 'flex', flexDirection: 'column', gap: '8px', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  commodityName: { margin: 0, fontSize: '16px', fontWeight: '700', color: '#fff' },
  dateBadge: { fontSize: '10px', color: 'rgba(255,255,255,0.5)' },
  locationRow: { display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'rgba(255,255,255,0.7)' },
  priceRow: { marginTop: '5px', background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '8px', textAlign: 'center' },
  priceLabel: { fontSize: '10px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' },
  priceValue: { fontSize: '18px', fontWeight: '800', color: '#4ade80' },
  minMaxRow: { display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' },
  aiBadge: { marginTop: '5px', fontSize: '10px', textAlign: 'center', color: '#60a5fa', fontWeight: '600', letterSpacing: '0.5px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '8px' },
  loaderContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px' },
  emptyState: { gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', color: 'rgba(255,255,255,0.5)', gap: '10px' }
};

export default MarketRates;