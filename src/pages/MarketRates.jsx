import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { IoMdArrowBack, IoMdSearch, IoMdCalendar, IoMdArrowDropdown, IoMdArrowDropup } from 'react-icons/io';
import { FaMapMarkerAlt, FaLeaf, FaHistory } from 'react-icons/fa';

// Pointing exactly to your rigorous data library
import { CEDA_LIBRARY } from '../Data/marketData'; 

// --- BANNERS ---
const BANNERS = [
  "https://img.freepik.com/premium-photo/smart-farmer-holding-smartphone-with-ai-tech-interface-farm-background-future-smart-farming_1162141-40976.jpg",
  "https://cdn.siasat.com/wp-content/uploads/2020/10/2020_10img07_Oct_2020_PTI07-10-2020_000074B-1-scaled.jpg",
  "https://www.unite.ai/wp-content/uploads/2024/12/AI-for-Agriculture.webp",
  "https://olimpum.com/en/wp-content/uploads/WhatsApp-Image-2024-09-20-at-00.22.46.jpeg"
];

const MarketRates = () => {
  const navigate = useNavigate();
  
  // --- UI STATE ---
  const [currentBanner, setCurrentBanner] = useState(0);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState('Awaiting Search...');
  const [lookbackDays, setLookbackDays] = useState(0);

  // --- DATA STATES ---
  const [filteredData, setFilteredData] = useState([]); 

  // --- FILTER STATES ---
  const [selectedState, setSelectedState] = useState('Select State');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedGroup, setSelectedGroup] = useState('Select Category');
  const [selectedCommodity, setSelectedCommodity] = useState('All');

  // --- DYNAMIC DROPDOWN LISTS ---
  const [statesList, setStatesList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);
  const [groupsList, setGroupsList] = useState([]);
  const [commoditiesList, setCommoditiesList] = useState([]);

  const MANDI_KEY = import.meta.env.VITE_GOVT_MANDI_KEY;

  // --- CAROUSEL EFFECT ---
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner(prev => (prev + 1) % BANNERS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // ======================================================================
  // --- PHASE 1: INITIALIZE TREES FROM LOCAL LIBRARY ---
  // ======================================================================
  useEffect(() => {
    try {
      if (!CEDA_LIBRARY || !CEDA_LIBRARY.states || !CEDA_LIBRARY.commodityGroups) {
        console.warn("CEDA_LIBRARY is missing or improperly formatted.");
        return;
      }

      const extractedStates = CEDA_LIBRARY.states.map(s => s.name).sort();
      setStatesList(extractedStates);

      const extractedGroups = CEDA_LIBRARY.commodityGroups.map(g => g.groupName).sort();
      setGroupsList(['All', ...extractedGroups]);
    } catch (error) {
      console.error("Failed to parse CEDA_LIBRARY:", error);
    }
  }, []);

  // ======================================================================
  // --- PHASE 1.5: CASCADE DROPDOWNS ---
  // ======================================================================
  
  useEffect(() => {
    if (selectedState !== 'Select State' && selectedState !== 'All') {
      const stateObj = CEDA_LIBRARY.states.find(s => s.name === selectedState);
      if (stateObj && stateObj.districts) {
        setDistrictsList(['All', ...stateObj.districts.map(d => d.name).sort()]);
      } else {
        setDistrictsList(['All']); 
      }
      setSelectedDistrict('All');
    }
  }, [selectedState]);

  useEffect(() => {
    if (selectedGroup !== 'Select Category' && selectedGroup !== 'All') {
      const groupObj = CEDA_LIBRARY.commodityGroups.find(g => g.groupName === selectedGroup);
      if (groupObj && groupObj.commodities) {
        setCommoditiesList(['All', ...groupObj.commodities.sort()]);
      } else {
        setCommoditiesList(['All']);
      }
      setSelectedCommodity('All');
    } else if (selectedGroup === 'All') {
      const allComms = CEDA_LIBRARY.commodityGroups.flatMap(g => g.commodities);
      setCommoditiesList(['All', ...[...new Set(allComms)].sort()]);
      setSelectedCommodity('All');
    }
  }, [selectedGroup]);


  // ======================================================================
  // --- PHASE 2: 100% GOV API ENGINE WITH 7-DAY LOOKBACK ---
  // ======================================================================
  const fetchLiveRates = async () => {
    setLoading(true);
    setFilteredData([]);
    setLookbackDays(0);
    
    let dataFound = false;
    let targetDateObj = new Date(filterDate);
    let i = 0;
    const MAX_LOOKBACK = 7; 

    while (!dataFound && i < MAX_LOOKBACK) {
        // Gov API requires DD/MM/YYYY format exactly
        const y = targetDateObj.getFullYear();
        const m = String(targetDateObj.getMonth() + 1).padStart(2, '0');
        const d = String(targetDateObj.getDate()).padStart(2, '0');
        const govDateStr = `${d}/${m}/${y}`;
        
        setDataSource(`Scanning Gov API: ${govDateStr}...`);

        try {
            // Build the exact query URL to make the server do the heavy lifting
            let govUrl = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${MANDI_KEY}&format=json&limit=1000`;
            govUrl += `&filters[arrival_date]=${govDateStr}`;
            
            if (selectedState !== 'Select State' && selectedState !== 'All') {
                govUrl += `&filters[state]=${encodeURIComponent(selectedState)}`;
            }
            if (selectedDistrict !== 'All') {
                govUrl += `&filters[district]=${encodeURIComponent(selectedDistrict)}`;
            }
            if (selectedCommodity !== 'All') {
                govUrl += `&filters[commodity]=${encodeURIComponent(selectedCommodity)}`;
            }

            const govRes = await axios.get(govUrl);
            const govData = govRes.data?.records || [];

            if (govData.length > 0) {
                // Map Gov data into our unified card format
                const formattedData = govData.map(item => ({
                    commodity: item.commodity || 'Unknown',
                    market: item.market || 'Unknown',
                    district: item.district || 'Unknown',
                    state: item.state || 'Unknown',
                    modal_price: item.modal_price || item.price || "N/A",
                    min_price: item.min_price || item.min || "N/A",
                    max_price: item.max_price || item.max || "N/A",
                    arrival_date: item.arrival_date || govDateStr
                }));

                setFilteredData(formattedData);
                dataFound = true;
                setLookbackDays(i);
                
                if (i === 0) setDataSource('🟢 Gov Data (Live)');
                else setDataSource(`🟠 Gov Data (${i} Days Ago)`);
                break; // Exit the while loop!
            }
        } catch (error) {
            console.warn(`Gov API Failed for ${govDateStr}`, error);
        }

        // If no data found, step back 1 day and loop again
        targetDateObj.setDate(targetDateObj.getDate() - 1);
        i++;
    }

    if (!dataFound) {
        setDataSource('🔴 No Trades Found (7 Days)');
    }
    setLoading(false);
  };

  const toggleDropdown = (key) => {
    setActiveDropdown(activeDropdown === key ? null : key);
  };

  const handleCardClick = (commodity) => {
    console.log(`Phase 3: AI Trend Analysis triggered for ${commodity}`);
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
              <p style={styles.subtitle}>Gov District Sweep</p>
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
                <img key={i} src={src} style={{...styles.bannerImg, opacity: currentBanner === i ? 1 : 0 }} alt={`Banner ${i}`}/>
            ))}
            <div style={styles.bannerOverlay}>
                <div style={styles.bannerTitle}>FarmCap</div>
                <div style={styles.bannerSubtitle}>True Market Value Routing</div>
            </div>
        </div>

        {/* DYNAMIC FILTER STACK */}
        <div style={styles.filterStack}>
            
            {/* DATE SELECTOR */}
            <div style={{...styles.dropdownContainer, gridColumn: '1 / -1'}}>
                <label style={styles.dropdownLabel}>Target Date</label>
                <div style={styles.glassInputWrapper}>
                    <IoMdCalendar size={20} color="rgba(255,255,255,0.8)"/>
                    <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} style={styles.dateInput} />
                </div>
            </div>

            {/* STATE SELECTOR */}
            <div style={{...styles.dropdownContainer, zIndex: activeDropdown === 'state' ? 101 : 'auto'}}>
                <label style={styles.dropdownLabel}>Select State</label>
                <div style={styles.dropdownHeader} onClick={() => toggleDropdown('state')}>
                    <span style={{overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{selectedState}</span>
                    {activeDropdown === 'state' ? <IoMdArrowDropup size={20}/> : <IoMdArrowDropdown size={20}/>}
                </div>
                {activeDropdown === 'state' && (
                    <div style={styles.dropdownList}>
                        {statesList.map(state => (
                            <div key={state} style={styles.dropdownItem} onClick={() => { setSelectedState(state); setActiveDropdown(null); }}>
                                {state}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* DISTRICT SELECTOR */}
            <div style={{...styles.dropdownContainer, zIndex: activeDropdown === 'district' ? 101 : 'auto'}}>
                <label style={styles.dropdownLabel}>District Sweep</label>
                <div style={styles.dropdownHeader} onClick={() => toggleDropdown('district')}>
                    <span style={{overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{selectedDistrict}</span>
                    {activeDropdown === 'district' ? <IoMdArrowDropup size={20}/> : <IoMdArrowDropdown size={20}/>}
                </div>
                {activeDropdown === 'district' && (
                    <div style={styles.dropdownList}>
                        {districtsList.map(dist => (
                            <div key={dist} style={styles.dropdownItem} onClick={() => { setSelectedDistrict(dist); setActiveDropdown(null); }}>
                                {dist}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* COMMODITY GROUP SELECTOR */}
            <div style={{...styles.dropdownContainer, zIndex: activeDropdown === 'group' ? 101 : 'auto'}}>
                <label style={styles.dropdownLabel}>Category</label>
                <div style={styles.dropdownHeader} onClick={() => toggleDropdown('group')}>
                    <span style={{overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{selectedGroup}</span>
                    {activeDropdown === 'group' ? <IoMdArrowDropup size={20}/> : <IoMdArrowDropdown size={20}/>}
                </div>
                {activeDropdown === 'group' && (
                    <div style={styles.dropdownList}>
                        {groupsList.map(grp => (
                            <div key={grp} style={styles.dropdownItem} onClick={() => { setSelectedGroup(grp); setActiveDropdown(null); }}>
                                {grp}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* COMMODITY SELECTOR */}
            <div style={{...styles.dropdownContainer, zIndex: activeDropdown === 'commodity' ? 101 : 'auto'}}>
                <label style={styles.dropdownLabel}>Specific Crop</label>
                <div style={styles.dropdownHeader} onClick={() => toggleDropdown('commodity')}>
                    <span style={{overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{selectedCommodity}</span>
                    {activeDropdown === 'commodity' ? <IoMdArrowDropup size={20}/> : <IoMdArrowDropdown size={20}/>}
                </div>
                {activeDropdown === 'commodity' && (
                    <div style={styles.dropdownList}>
                        {commoditiesList.map(item => (
                            <div key={item} style={styles.dropdownItem} onClick={() => { setSelectedCommodity(item); setActiveDropdown(null); }}>
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
                  {loading ? 'Scanning API Nodes...' : 'Search True Value'}
                </button>
            </div>
        </div>

        {/* RESULTS GRID */}
        <div style={{...styles.section, marginBottom: '40px'}}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionTitle}>
                {selectedDistrict !== 'All' ? `${selectedDistrict} Active Mandis` : 'Live Prices'}
            </span>
            <span style={styles.sectionCount}>{filteredData.length} Trades Found</span>
          </div>

          {lookbackDays > 0 && !loading && (
             <div style={styles.lookbackWarning}>
                 <FaHistory size={14} color="#facc15" />
                 <span>Zero arrivals on selected date. Showing Last Traded Prices ({lookbackDays} days ago).</span>
             </div>
          )}

          {loading ? (
              <div style={styles.loaderContainer}>
                  <div className="loader"></div>
                  <p style={{color:'white', marginTop:'10px'}}>Executing District Sweep...</p>
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
                          <span style={{...styles.dateBadge, color: lookbackDays > 0 ? '#facc15' : 'rgba(255,255,255,0.5)'}}>
                              {item.arrival_date}
                          </span>
                      </div>
                      <div style={styles.locationRow}>
                          <FaMapMarkerAlt size={12} color="#4ade80"/> 
                          <span style={{fontWeight: '700', color: '#fff'}}>{item.market} Mandi</span>
                      </div>
                      <div style={styles.priceRow}>
                          <div style={styles.priceLabel}>{lookbackDays > 0 ? 'Last Traded (Modal)' : 'Modal Price'}</div>
                          <div style={styles.priceValue}>₹{item.modal_price}<span>/qtl</span></div>
                      </div>
                      <div style={styles.minMaxRow}>
                          <span>Min: ₹{item.min_price}</span>
                          <span>Max: ₹{item.max_price}</span>
                      </div>
                      <div style={styles.aiBadge}>Tap for Trend Analysis ✨</div>
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

// --- PREMIUM GLASSMORPHISM STYLES ---
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
  lookbackWarning: { display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(250, 204, 21, 0.1)', border: '1px solid rgba(250, 204, 21, 0.3)', padding: '10px 15px', borderRadius: '8px', marginBottom: '15px', fontSize: '12px', color: 'rgba(255,255,255,0.9)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px' },
  glassCard: { background: 'rgba(255, 255, 255, 0.07)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '15px', display: 'flex', flexDirection: 'column', gap: '8px', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  commodityName: { margin: 0, fontSize: '16px', fontWeight: '700', color: '#fff' },
  dateBadge: { fontSize: '10px' },
  locationRow: { display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'rgba(255,255,255,0.8)', paddingBottom: '4px', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  priceRow: { marginTop: '5px', background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '8px', textAlign: 'center' },
  priceLabel: { fontSize: '10px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' },
  priceValue: { fontSize: '18px', fontWeight: '800', color: '#4ade80' },
  minMaxRow: { display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' },
  aiBadge: { marginTop: '5px', fontSize: '10px', textAlign: 'center', color: '#60a5fa', fontWeight: '600', letterSpacing: '0.5px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '8px' },
  loaderContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px' },
  emptyState: { gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', color: 'rgba(255,255,255,0.5)', gap: '10px' }
};

export default MarketRates;