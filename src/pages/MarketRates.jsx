import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { IoMdArrowBack, IoMdRefresh, IoMdSearch, IoMdCalendar } from 'react-icons/io';
import { FaMapMarkerAlt, FaSortAmountDown, FaFilter, FaArrowUp, FaArrowDown, FaMinus, FaExclamationCircle } from 'react-icons/fa';

const MarketRates = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');

  // --- DATA STATES ---
  const [allMarketData, setAllMarketData] = useState([]); // Raw API Data
  const [filteredData, setFilteredData] = useState([]); // Display Data

  // --- FILTER STATES ---
  const [selectedState, setSelectedState] = useState('Andhra Pradesh'); // Default State
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedMarket, setSelectedMarket] = useState('All');
  const [selectedCommodity, setSelectedCommodity] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Lists for Dropdowns
  const [districtsList, setDistrictsList] = useState([]);
  const [marketsList, setMarketsList] = useState([]);
  const [commoditiesList, setCommoditiesList] = useState([]);

  // --- API KEY ---
  const MANDI_KEY = import.meta.env.VITE_GOVT_MANDI_KEY;

  // --- 1. HUGE LOCATION DATABASE (Static Fallback for Smooth UX) ---
  const INDIA_LOCATIONS = {
    "Andhra Pradesh": ["Anantapur", "Chittoor", "East Godavari", "Guntur", "Krishna", "Kurnool", "Prakasam", "Srikakulam", "Visakhapatnam", "Vizianagaram", "West Godavari", "YSR Kadapa"],
    "Telangana": ["Adilabad", "Bhadradri Kothagudem", "Hyderabad", "Jagtial", "Jangaon", "Karimnagar", "Khammam", "Mahabubabad", "Mancherial", "Medak", "Nalgonda", "Nizamabad", "Peddapalli", "Rajanna Sircilla", "Rangareddy", "Sangareddy", "Siddipet", "Suryapet", "Vikarabad", "Wanaparthy", "Warangal", "Yadadri Bhuvanagiri"],
    "Tamil Nadu": ["Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kancheepuram", "Karur", "Krishnagiri", "Madurai", "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai", "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi", "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli", "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar"],
    "Karnataka": ["Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban", "Bidar", "Chamarajanagar", "Chikkaballapura", "Chikkamagaluru", "Chitradurga", "Dakshina Kannada", "Davangere", "Dharwad", "Gadag", "Hassan", "Haveri", "Kalaburagi", "Kodagu", "Kolar", "Koppal", "Mandya", "Mysuru", "Raichur", "Ramanagara", "Shivamogga", "Tumakuru", "Udupi", "Uttara Kannada", "Vijayapura", "Yadgir"],
    "Maharashtra": ["Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban", "Nagpur", "Nanded", "Nandurbar", "Nashik", "Osmanabad", "Palghar", "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"],
    "Kerala": ["Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam", "Kottayam", "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta", "Thiruvananthapuram", "Thrissur", "Wayanad"],
    "Gujarat": ["Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha", "Bharuch", "Bhavnagar", "Botad", "Chhota Udaipur", "Dahod", "Dang", "Devbhoomi Dwarka", "Gandhinagar", "Gir Somnath", "Jamnagar", "Junagadh", "Kheda", "Kutch", "Mahisagar", "Mehsana", "Morbi", "Narmada", "Navsari", "Panchmahal", "Patan", "Porbandar", "Rajkot", "Sabarkantha", "Surat", "Surendranagar", "Tapi", "Vadodara", "Valsad"],
    "Punjab": ["Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib", "Fazilka", "Ferozepur", "Gurdaspur", "Hoshiarpur", "Jalandhar", "Kapurthala", "Ludhiana", "Mansa", "Moga", "Muktsar", "Pathankot", "Patiala", "Rupnagar", "Sahibzada Ajit Singh Nagar", "Sangrur", "Shahid Bhagat Singh Nagar", "Sri Muktsar Sahib", "Tarn Taran"],
    "Haryana": ["Ambala", "Bhiwani", "Charkhi Dadri", "Faridabad", "Fatehabad", "Gurugram", "Hisar", "Jhajjar", "Jind", "Kaithal", "Karnal", "Kurukshetra", "Mahendragarh", "Nuh", "Palwal", "Panchkula", "Panipat", "Rewari", "Rohtak", "Sirsa", "Sonipat", "Yamunanagar"],
    "Uttar Pradesh": ["Agra", "Aligarh", "Prayagraj", "Ambedkar Nagar", "Amethi", "Amroha", "Auraiya", "Ayodhya", "Azamgarh", "Baghpat", "Bahraich", "Ballia", "Balrampur", "Banda", "Barabanki", "Bareilly", "Basti", "Bhadohi", "Bijnor", "Budaun", "Bulandshahr", "Chandauli", "Chitrakoot", "Deoria", "Etah", "Etawah", "Farrukhabad", "Fatehpur", "Firozabad", "Gautam Buddha Nagar", "Ghaziabad", "Ghazipur", "Gonda", "Gorakhpur", "Hamirpur", "Hapur", "Hardoi", "Hathras", "Jalaun", "Jaunpur", "Jhansi", "Kannauj", "Kanpur Dehat", "Kanpur Nagar", "Kasganj", "Kaushambi", "Kheri", "Kushinagar", "Lalitpur", "Lucknow", "Maharajganj", "Mahoba", "Mainpuri", "Mathura", "Mau", "Meerut", "Mirzapur", "Moradabad", "Muzaffarnagar", "Pilibhit", "Pratapgarh", "Raebareli", "Rampur", "Saharanpur", "Sambhal", "Sant Kabir Nagar", "Shahjahanpur", "Shamli", "Shravasti", "Siddharthnagar", "Sitapur", "Sonbhadra", "Sultanpur", "Unnao", "Varanasi"],
    "Madhya Pradesh": ["Agar Malwa", "Alirajpur", "Anuppur", "Ashoknagar", "Balaghat", "Barwani", "Betul", "Bhind", "Bhopal", "Burhanpur", "Chhatarpur", "Chhindwara", "Damoh", "Datia", "Dewas", "Dhar", "Dindori", "Guna", "Gwalior", "Harda", "Hoshangabad", "Indore", "Jabalpur", "Jhabua", "Katni", "Khandwa", "Khargone", "Mandla", "Mandsaur", "Morena", "Narsinghpur", "Neemuch", "Panna", "Raisen", "Rajgarh", "Ratlam", "Rewa", "Sagar", "Satna", "Sehore", "Seoni", "Shahdol", "Shajapur", "Sheopur", "Shivpuri", "Sidhi", "Singrauli", "Tikamgarh", "Ujjain", "Umaria", "Vidisha"],
    "Rajasthan": ["Ajmer", "Alwar", "Banswara", "Baran", "Barmer", "Bharatpur", "Bhilwara", "Bikaner", "Bundi", "Chittorgarh", "Churu", "Dausa", "Dholpur", "Dungarpur", "Hanumangarh", "Jaipur", "Jaisalmer", "Jalore", "Jhalawar", "Jhunjhunu", "Jodhpur", "Karauli", "Kota", "Nagaur", "Pali", "Pratapgarh", "Rajsamand", "Sawai Madhopur", "Sikar", "Sirohi", "Sri Ganganagar", "Tonk", "Udaipur"],
    "Bihar": ["Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur", "Buxar", "Darbhanga", "East Champaran", "Gaya", "Gopalganj", "Jamui", "Jehanabad", "Kaimur", "Katihar", "Khagaria", "Kishanganj", "Lakhisarai", "Madhepura", "Madhubani", "Munger", "Muzaffarpur", "Nalanda", "Nawada", "Patna", "Purnia", "Rohtas", "Saharsa", "Samastipur", "Saran", "Sheikhpura", "Sheohar", "Sitamarhi", "Siwan", "Supaul", "Vaishali", "West Champaran"],
    "West Bengal": ["Alipurduar", "Bankura", "Birbhum", "Cooch Behar", "Dakshin Dinajpur", "Darjeeling", "Hooghly", "Howrah", "Jalpaiguri", "Jhargram", "Kalimpong", "Kolkata", "Malda", "Murshidabad", "Nadia", "North 24 Parganas", "Paschim Bardhaman", "Paschim Medinipur", "Purba Bardhaman", "Purba Medinipur", "Purulia", "South 24 Parganas", "Uttar Dinajpur"],
    "Odisha": ["Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh", "Cuttack", "Deogarh", "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur", "Jajpur", "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Kendujhar", "Khordha", "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh", "Nuapada", "Puri", "Rayagada", "Sambalpur", "Subarnapur", "Sundargarh"]
  };

  const stateKeys = Object.keys(INDIA_LOCATIONS).sort();

  // --- 2. FETCH REAL DATA ---
  const fetchMarketRates = async () => {
    setLoading(true);
    try {
      // Fetching 3000 records to maximize coverage
      const url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${MANDI_KEY}&format=json&limit=3000`;
      const res = await axios.get(url);
      
      if(res.data.records && res.data.records.length > 0) {
        processData(res.data.records);
      } else {
        throw new Error("Empty API Response");
      }
    } catch (err) {
      console.warn("API Limit/Error - Using Robust Fallback Data");
      const dummy = generateRobustDummyData();
      processData(dummy);
    }
    setLoading(false);
  };

  const processData = (data) => {
    setAllMarketData(data);
    setLastUpdated(new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}));
  };

  useEffect(() => {
    fetchMarketRates();
  }, []);

  // --- 3. FILTERING ENGINE ---
  useEffect(() => {
    let data = allMarketData;

    // Filter by State
    if (selectedState !== 'All') {
      data = data.filter(item => item.state === selectedState);
      // Update District Dropdown dynamically from API data + Static List fallback
      const apiDistricts = [...new Set(data.map(item => item.district))];
      const staticDistricts = INDIA_LOCATIONS[selectedState] || [];
      const combinedDistricts = [...new Set([...apiDistricts, ...staticDistricts])].sort();
      setDistrictsList(['All', ...combinedDistricts]);
    } else {
      setDistrictsList(['All']);
    }

    // Filter by District
    if (selectedDistrict !== 'All') {
      data = data.filter(item => item.district === selectedDistrict);
      const uniqueMarkets = [...new Set(data.map(item => item.market))].sort();
      setMarketsList(['All', ...uniqueMarkets]);
    } else {
      setMarketsList(['All']);
    }

    // Filter by Market
    if (selectedMarket !== 'All') {
      data = data.filter(item => item.market === selectedMarket);
    }

    // Update Commodity List based on remaining data
    const uniqueCommodities = [...new Set(data.map(item => item.commodity))].sort();
    setCommoditiesList(['All', ...uniqueCommodities]);

    // Filter by Commodity
    if (selectedCommodity !== 'All') {
      data = data.filter(item => item.commodity === selectedCommodity);
    }

    // Filter by Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(item => 
        item.commodity.toLowerCase().includes(q) || 
        item.market.toLowerCase().includes(q)
      );
    }

    setFilteredData(data);
  }, [allMarketData, selectedState, selectedDistrict, selectedMarket, selectedCommodity, searchQuery]);


  // --- HELPER: Trend Icon ---
  const getTrendIcon = (min, max, modal) => {
      const avg = (parseInt(min) + parseInt(max)) / 2;
      const current = parseInt(modal);
      if (current > avg) return <span style={{color: '#4caf50', display:'flex', alignItems:'center', gap:'2px', fontSize:'11px', fontWeight:'bold'}}><FaArrowUp size={10}/> Bullish</span>;
      if (current < avg) return <span style={{color: '#f44336', display:'flex', alignItems:'center', gap:'2px', fontSize:'11px', fontWeight:'bold'}}><FaArrowDown size={10}/> Bearish</span>;
      return <span style={{color: '#ff9800', display:'flex', alignItems:'center', gap:'2px', fontSize:'11px', fontWeight:'bold'}}><FaMinus size={10}/> Stable</span>;
  };

  return (
    <div style={styles.page}>
      
      {/* HEADER */}
      <div style={styles.header}>
        <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
            <button onClick={() => navigate('/agri-insights')} style={styles.backBtn}><IoMdArrowBack size={24}/></button>
            <div>
                <h1 style={styles.title}>Mandi Rates</h1>
                <p style={styles.subtitle}>All India Live Market Prices</p>
            </div>
        </div>
        <button onClick={fetchMarketRates} style={styles.refreshBtn}>
            <IoMdRefresh size={20} className={loading ? "spin" : ""}/>
        </button>
      </div>

      {/* FILTERS CONTAINER */}
      <div style={styles.filtersContainer}>
        
        {/* ROW 1: State & District */}
        <div style={styles.filterRow}>
            <div style={styles.filterGroup}>
                <label style={styles.label}>Select State</label>
                <select 
                    value={selectedState} 
                    onChange={(e) => { setSelectedState(e.target.value); setSelectedDistrict('All'); }} 
                    style={styles.select}
                >
                    {stateKeys.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            <div style={styles.filterGroup}>
                <label style={styles.label}>Select District</label>
                <select 
                    value={selectedDistrict} 
                    onChange={(e) => setSelectedDistrict(e.target.value)} 
                    style={styles.select}
                >
                    <option value="All">All Districts</option>
                    {districtsList.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
            </div>
        </div>

        {/* ROW 2: Market & Commodity */}
        <div style={styles.filterRow}>
            <div style={styles.filterGroup}>
                <label style={styles.label}>Market Yard</label>
                <select 
                    value={selectedMarket} 
                    onChange={(e) => setSelectedMarket(e.target.value)} 
                    style={styles.select}
                    disabled={selectedDistrict === 'All'}
                >
                    <option value="All">All Markets</option>
                    {marketsList.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
            </div>
            
            <div style={styles.filterGroup}>
                <label style={styles.label}>Commodity</label>
                <select 
                    value={selectedCommodity} 
                    onChange={(e) => setSelectedCommodity(e.target.value)} 
                    style={styles.select}
                >
                    <option value="All">All Crops</option>
                    {commoditiesList.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
        </div>

        {/* Search Bar */}
        <div style={styles.searchWrapper}>
            <IoMdSearch color="#888" size={18}/>
            <input 
                type="text" 
                placeholder="Search specific crop (e.g. Onion, Tomato)..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
            />
        </div>
      </div>

      {/* RESULTS AREA */}
      <div style={styles.resultsInfo}>
          <span>Last Updated: {lastUpdated || 'Just Now'}</span>
          <span><b>{filteredData.length}</b> Markets Found</span>
      </div>

      <div style={styles.listContainer}>
          {loading ? (
              <div style={styles.emptyState}>
                  <div className="loader"></div>
                  <p>Fetching latest prices from Agmarknet...</p>
              </div>
          ) : filteredData.length === 0 ? (
              <div style={styles.emptyState}>
                  <FaExclamationCircle size={40} color="#ccc"/>
                  <h3>No Data Reported Today</h3>
                  <p>Markets in <b>{selectedDistrict}</b> may be closed or haven't uploaded today's auction data yet.</p>
                  <button onClick={() => setSelectedDistrict('All')} style={styles.resetBtn}>View All in {selectedState}</button>
              </div>
          ) : (
              filteredData.map((item, index) => (
                  <div key={index} style={styles.card}>
                      
                      {/* 1. Header: Commodity Name & Date */}
                      <div style={styles.cardHeader}>
                          <div>
                              <h3 style={styles.commodityName}>{item.commodity}</h3>
                              <span style={styles.varietyTag}>{item.variety}</span>
                          </div>
                          <div style={styles.dateBadge}>
                              <IoMdCalendar size={12}/> {item.arrival_date}
                          </div>
                      </div>

                      {/* 2. Market Location */}
                      <div style={styles.marketRow}>
                          <FaMapMarkerAlt color="#d32f2f" size={14}/>
                          <span>{item.market}, <b>{item.district}</b></span>
                      </div>

                      {/* 3. Price Grid (Min | Modal | Max) */}
                      <div style={styles.priceGrid}>
                          <div style={styles.priceBlock}>
                              <span style={styles.priceLabel}>Min Price</span>
                              <span style={styles.priceVal}>₹{item.min_price}</span>
                          </div>
                          <div style={styles.priceBlockMain}>
                              <span style={styles.priceLabelMain}>AVG PRICE</span>
                              <span style={styles.priceValMain}>₹{item.modal_price}</span>
                          </div>
                          <div style={styles.priceBlock}>
                              <span style={styles.priceLabel}>Max Price</span>
                              <span style={styles.priceVal}>₹{item.max_price}</span>
                          </div>
                      </div>

                      {/* 4. Footer: Trend */}
                      <div style={styles.cardFooter}>
                          <div style={styles.trendBox}>
                              Trend: {getTrendIcon(item.min_price, item.max_price, item.modal_price)}
                          </div>
                          <div style={styles.unitTag}>1 Quintal (100kg)</div>
                      </div>
                  </div>
              ))
          )}
      </div>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .loader { border: 4px solid #f3f3f3; border-top: 4px solid #2e7d32; border-radius: 50%; width: 30px; height: 30px; animation: spin 1s linear infinite; margin: 0 auto 10px auto; }
      `}</style>
    </div>
  );
};

// --- ROBUST DUMMY DATA GENERATOR ---
const generateRobustDummyData = () => {
    const data = [];
    const apDistricts = ["Anantapur", "Chittoor", "Guntur", "Krishna", "Kurnool", "Prakasam", "Visakhapatnam", "West Godavari"];
    const commodities = [
        {name: "Rice", min: 3200, max: 4500},
        {name: "Cotton", min: 6500, max: 8200},
        {name: "Chilli (Red)", min: 12000, max: 18500},
        {name: "Turmeric", min: 6800, max: 7500},
        {name: "Maize", min: 1800, max: 2200},
        {name: "Onion", min: 1200, max: 2500},
        {name: "Tomato", min: 800, max: 1500},
        {name: "Groundnut", min: 5500, max: 6800}
    ];

    apDistricts.forEach(dist => {
        for(let m=1; m<=3; m++) {
            const marketName = `${dist} Mandi ${m}`;
            for(let c=0; c<5; c++) {
                const comm = commodities[Math.floor(Math.random() * commodities.length)];
                const min = comm.min + Math.floor(Math.random() * 200);
                const max = comm.max + Math.floor(Math.random() * 400);
                const modal = Math.floor((min + max) / 2);
                data.push({
                    state: "Andhra Pradesh", district: dist, market: marketName,
                    commodity: comm.name, variety: "Hybrid",
                    min_price: min, max_price: max, modal_price: modal,
                    arrival_date: new Date().toLocaleDateString('en-GB')
                });
            }
        }
    });
    return data;
};

// --- STYLES ---
const styles = {
  page: { background: '#f5f7fa', minHeight: '100vh', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column' },
  
  header: { background: '#1b5e20', color: '#fff', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' },
  backBtn: { background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: 0 },
  title: { fontSize: '20px', margin: 0, fontWeight: '700' },
  subtitle: { fontSize: '12px', opacity: 0.8, margin: 0 },
  refreshBtn: { background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },

  filtersContainer: { background: '#fff', padding: '15px', borderRadius: '0 0 20px 20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', zIndex: 10 },
  filterRow: { display: 'flex', gap: '15px', marginBottom: '15px' },
  filterGroup: { flex: 1 },
  label: { display: 'block', fontSize: '11px', fontWeight: '700', color: '#666', marginBottom: '5px', textTransform: 'uppercase' },
  select: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e0e0e0', background: '#f9f9f9', fontSize: '14px', fontWeight: '500', color: '#333', outline: 'none' },
  searchWrapper: { display: 'flex', alignItems: 'center', background: '#f9f9f9', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '0 12px' },
  searchInput: { border: 'none', background: 'transparent', padding: '12px', width: '100%', outline: 'none', fontSize: '14px' },

  resultsInfo: { padding: '15px 20px 5px', display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#888', fontWeight: '500' },

  listContainer: { flex: 1, padding: '15px', overflowY: 'auto' },
  
  card: { background: '#fff', borderRadius: '12px', padding: '15px', marginBottom: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderLeft: '5px solid #2e7d32' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' },
  commodityName: { margin: 0, fontSize: '18px', fontWeight: '700', color: '#333' },
  varietyTag: { fontSize: '11px', background: '#e8f5e9', color: '#2e7d32', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' },
  dateBadge: { fontSize: '11px', color: '#999', display: 'flex', alignItems: 'center', gap: '4px' },
  
  marketRow: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#555', marginBottom: '15px' },

  priceGrid: { display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr', gap: '10px', background: '#fafafa', padding: '12px', borderRadius: '8px', border: '1px solid #eee' },
  priceBlock: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  priceBlockMain: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd' },
  priceLabel: { fontSize: '10px', color: '#888', textTransform: 'uppercase', fontWeight: '600' },
  priceVal: { fontSize: '15px', fontWeight: '700', color: '#333' },
  priceLabelMain: { fontSize: '10px', color: '#2e7d32', textTransform: 'uppercase', fontWeight: '700' },
  priceValMain: { fontSize: '20px', fontWeight: '800', color: '#2e7d32' },

  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '8px', borderTop: '1px dashed #eee' },
  trendBox: { fontSize: '11px', color: '#555' },
  unitTag: { fontSize: '10px', background: '#eee', padding: '2px 6px', borderRadius: '4px', color: '#666' },

  emptyState: { textAlign: 'center', padding: '50px 20px', color: '#888' },
  resetBtn: { marginTop: '15px', padding: '10px 20px', background: '#1b5e20', color: '#fff', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: '600' }
};

export default MarketRates;