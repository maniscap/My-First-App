import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { IoMdArrowBack, IoMdClose, IoMdSearch } from 'react-icons/io';
import { FaFileInvoice, FaChartArea, FaMapMarkerAlt, FaShieldAlt, FaExternalLinkAlt, FaInfoCircle, FaChevronRight, FaStar, FaClock, FaFilter, FaArrowRight } from 'react-icons/fa';

// --- DATA STRUCTURE: PASTE YOUR LINKS HERE ---
const MARKET_REPORTS = [
  {
    title: "Prices & Arrival Reports",
    icon: <FaFileInvoice size={24} color="#34d399" />,
    items: [
      { name: "Home Page", url: "https://agmarknet.gov.in/home" },
      { name: "Daily Price and Arrival", isNew: true, url: "https://agmarknet.gov.in/daily-price-and-arrival-report" },
      { name: "All Type of Report (All Grades)", isNew: true, url: "https://agmarknet.gov.in/alltypeofreports" },
      { name: "Commodity-Wise, Market-Wise Daily Report (Weighted Average)", url: "https://agmarknet.gov.in/commoditydailyreportweightedinput" },
      { name: "Market-Wise, Commodity-wise Daily Report", url: "https://agmarknet.gov.in/marketwisedailyreportinput" },
      { name: "Market-Wise Daily Report For Specific Commodity", url: "https://agmarknet.gov.in/marketwisespecificcommodityinput" },
      { name: "Commodity Prices During Last Week", url: "https://agmarknet.gov.in/commoditypricelastweekinput" },
      { name: "Market-Wise Prices During Last Week", url: "https://agmarknet.gov.in/marketwisepricelastweekinput" },
      { name: "Commodity Transactions Below MSP", url: "https://agmarknet.gov.in/commoditybelowmspinput" },
      { name: "Commodity Transactions Above MSP", url: "https://agmarknet.gov.in/commodityabovemspinput" },
      { name: "Commodity-Wise, Market-Wise Daily Report For a State", url: "https://agmarknet.gov.in/commoditywisedailystatereportinput" },
      { name: "Commodity-Wise, Market-Wise Daily Report For a State (Market Category Wise)", url: "https://agmarknet.gov.in/commoditywisedailystatemktinput" },
      { name: "Date Wise Prices For Specified Commodity", url: "https://agmarknet.gov.in/datewisespeccommdodityinput" },
      { name: "Market-Wise, Commodity-Wise Daily Report For a State", url: "https://agmarknet.gov.in/marketwisedailystatereportinput" }
    ]
  }
];

const TREND_REPORTS = [
  {
    category: "State-wise Reports",
    icon: <FaMapMarkerAlt color="#10b981" />,
    items: [
      { name: "State-wise Wholesale Prices Monthly Analysis", url: "https://agmarknet.gov.in/statewholesalemonthanalysis" },
      { name: "State-wise & Variety-wise Prices Monthly Analysis", url: "https://agmarknet.gov.in/statevarietymonthlyanalysis" },
      { name: "State-wise Wholesale Prices Weekly Analysis", url: "https://agmarknet.gov.in/statewholesaleweekanalysis" },
      { name: "State-wise & Variety-wise Prices Weekly Analysis", url: "https://agmarknet.gov.in/statevarietyweeklyanalysis" }
    ]
  },
  {
    category: "District-wise Reports",
    icon: <FaMapMarkerAlt color="#06b6d4" />,
    items: [
      { name: "District-wise Wholesale Prices Monthly Analysis", url: "https://agmarknet.gov.in/districtwholesalemonthanalysis" },
      { name: "District-wise & Variety-wise Prices Monthly Analysis", url: "https://agmarknet.gov.in/districtvarietymonthlyanalysis" },
      { name: "District-wise Wholesale Prices Weekly Analysis", url: "https://agmarknet.gov.in/districtwholesaleweekanalysis" },
      { name: "District-wise & Variety-Wise Prices Weekly Analysis", url: "https://agmarknet.gov.in/districtvarietyweeklyanalysis" }
    ]
  },
  {
    category: "Market-wise Reports",
    icon: <FaMapMarkerAlt color="#fbbf24" />,
    items: [
      { name: "Market-wise Wholesale Arrivals Monthly Analysis", url: "https://agmarknet.gov.in/marketarrivalsmonthanalysis" },
      { name: "Market-wise Wholesale Prices Monthly Analysis", url: "https://agmarknet.gov.in/marketwholesalemonthanalysis" },
      { name: "Market-wise & Variety-wise Prices Monthly Analysis", url: "https://agmarknet.gov.in/marketvarietymonthlyanalysis" },
      { name: "Market-wise Wholesale Arrivals Weekly Analysis", url: "https://agmarknet.gov.in/marketarrivalsweekanalysis" },
      { name: "Market-wise Wholesale Prices Weekly Analysis", url: "https://agmarknet.gov.in/marketwholesaleweekanalysis" },
      { name: "Market-wise & Variety-Wise Prices Weekly Analysis", url: "https://agmarknet.gov.in/marketvarietyweeklyanalysis" }
    ]
  },
  {
    category: "Market-wise Reports (All Districts)",
    icon: <FaMapMarkerAlt color="#a7f3d0" />,
    items: [
      { name: "Market-wise Wholesale Arrivals Monthly Analysis (All Districts)", url: "https://agmarknet.gov.in/marketallarrivalmonthanalysis" },
      { name: "Market-wise Wholesale Prices Monthly Analysis (All Districts)", url: "https://agmarknet.gov.in/marketallwholesalemonthanalysis" },
      { name: "Market-wise Wholesale Arrivals Weekly Analysis (All Districts)", url: "https://agmarknet.gov.in/marketallarrivalweekanalysis" },
      { name: "Market-wise Wholesale Prices Weekly Analysis (All Districts)", url: "https://agmarknet.gov.in/marketallwholesaleweekanalysis" }
    ]
  }
];

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } 
  }
};

const cardHoverVariants = {
  rest: { y: 0, scale: 1 },
  hover: { y: -4, scale: 1.02, transition: { duration: 0.3, ease: 'easeOut' } }
};

const iconVariants = {
  rest: { 
    rotate: 0, 
    scale: 1,
    boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.2), 0 4px 10px rgba(0, 0, 0, 0.1)'
  },
  hover: { 
    rotate: 10, 
    scale: 1.1,
    boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.4), 0 0 15px rgba(255, 255, 255, 0.25)', 
    transition: { duration: 0.3 } 
  }
};

// Shared images to be used for both the top banner and the bookshelf
const BOOK_COVERS = [
  "https://img.freepik.com/premium-photo/illustration-indian-agriculture-wheat-field-india-generative-ai_756405-75186.jpg",
  "https://img.freepik.com/premium-photo/farmer-using-laptop-scenic-rice-field-sunset_38013-38674.jpg",
  "https://static.vecteezy.com/system/resources/thumbnails/041/760/565/small_2x/ai-generated-tractor-spraying-pesticide-on-wheat-field-free-photo.jpeg",
  "https://img.freepik.com/premium-photo/concept-growing-crops-using-ai-farming-system-uses-artificial-intelligence-optimize-work_1006821-4087.jpg?w=2000",
];

// --- NEW: GLASS BOOKSHELF COMPONENT ---
const Bookshelf = ({ items, onLinkClick, favorites, onToggleFavorite }) => {
  const GAP = 12;

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="hide-scrollbar" style={{ width: '100%', height: '100%', overflowY: 'auto', overflowX: 'hidden' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: `${GAP}px`, width: '100%', paddingBottom: '120px' }}>
            {items.map((item, idx) => {
              const isFavorited = favorites.some(fav => fav.name === item.name && fav.url === item.url);
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                  whileHover={{ x: 8, transition: { duration: 0.2 } }}
                  onClick={() => onLinkClick(item)}
                  style={{ 
                    ...styles.book, 
                    width: '100%', 
                    flexShrink: 0, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '18px 20px',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flex: 1, paddingRight: '15px' }}>
                    {item.isNew && <span style={{...styles.newBadge, position: 'static', marginBottom: '8px'}}>NEW</span>}
                    <h3 style={{...styles.openBookTitle, WebkitLineClamp: 3, margin: 0, fontSize: '14px'}}>{item.name}</h3>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <motion.button
                      whileHover={{ scale: 1.15, filter: 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.5))' }}
                      whileTap={{ scale: 0.85 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(item);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <FaStar size={16} color={isFavorited ? "#fbbf24" : "#64748b"} />
                    </motion.button>
                    <motion.div 
                      style={{ 
                        background: 'rgba(255, 255, 255, 0.05)', 
                        padding: '10px', 
                        borderRadius: '12px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        flexShrink: 0,
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderTop: '1px solid rgba(255, 255, 255, 0.25)',
                        boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1)'
                      }}
                      whileHover={{ scale: 1.05, boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.3), 0 0 12px rgba(16, 185, 129, 0.4)' }}
                    >
                        <FaExternalLinkAlt size={14} color="#10b981" />
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>
      </div>
    </div>
  );
};

const MarketRates = () => {
  const navigate = useNavigate();
  const [transitionState, setTransitionState] = useState({ isActive: false, reportName: "" });
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('marketRatesFavorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [recentItems, setRecentItems] = useState(() => {
    const saved = localStorage.getItem('marketRatesRecent');
    return saved ? JSON.parse(saved) : [];
  });
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showRecentOnly, setShowRecentOnly] = useState(false);

  const scrollRef = useRef(null);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('marketRatesFavorites', JSON.stringify(favorites));
  }, [favorites]);

  // Save recent items to localStorage
  useEffect(() => {
    localStorage.setItem('marketRatesRecent', JSON.stringify(recentItems));
  }, [recentItems]);

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Auto-scroll to top when filters or search change
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [searchQuery, showFavoritesOnly, showRecentOnly, activeCategory]);

  // Auto-rotating banner interval
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % BOOK_COVERS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const toggleFavorite = (item) => {
    setFavorites(prev => {
      const isAlreadyFavorited = prev.some(fav => fav.name === item.name && fav.url === item.url);
      if (isAlreadyFavorited) {
        return prev.filter(fav => !(fav.name === item.name && fav.url === item.url));
      } else {
        return [...prev, item];
      }
    });
  };

  const addToRecent = (item) => {
    setRecentItems(prev => {
      const filtered = prev.filter(rec => !(rec.name === item.name && rec.url === item.url));
      return [item, ...filtered].slice(0, 10); // Keep only 10 recent items
    });
  };

  const handleLinkClick = (report) => {
    if (!report.url) {
      alert("URL not yet configured for: " + report.name);
      return;
    }

    addToRecent(report);

    // Trigger the 3-second intercept modal
    setTransitionState({ isActive: true, reportName: report.name });

    setTimeout(() => {
      // Open the government site in a new tab
      window.open(report.url, '_blank', 'noopener,noreferrer');
      // Hide the modal so they are back in Farmcap when they close the new tab
      setTransitionState({ isActive: false, reportName: "" });
    }, 3000);
  };

  // Filter logic
  const getFilteredCategories = () => {
    let allItems = [];
    const allCategories = [...MARKET_REPORTS, ...TREND_REPORTS];

    allCategories.forEach(cat => {
      const items = cat.items || [];
      items.forEach(item => {
        allItems.push({ ...item, category: cat.title || cat.category, categoryIcon: cat.icon });
      });
    });

    let filtered = allItems;

    if (showFavoritesOnly) {
      filtered = filtered.filter(item => favorites.some(fav => fav.name === item.name && fav.url === item.url));
    }

    if (showRecentOnly) {
      filtered = filtered.filter(item => recentItems.some(rec => rec.name === item.name && rec.url === item.url));
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(query) || 
        (item.category && item.category.toLowerCase().includes(query))
      );
    }

    return filtered;
  };

  const filteredItems = useMemo(() => getFilteredCategories(), [searchQuery, showFavoritesOnly, showRecentOnly, favorites, recentItems]);

  // Utility to safely escape special characters in search queries to prevent Regex crashes
  const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  // Helper function to highlight matching text
  const highlightText = (text, query) => {
    if (!query.trim()) return text;
    
    const parts = text.split(new RegExp(`(${escapeRegExp(query)})`, 'gi'));
    return parts.map((part, idx) => 
      part.toLowerCase() === query.toLowerCase() 
        ? <span key={idx} style={{ background: 'rgba(251, 191, 36, 0.6)', color: '#fff', padding: '2px 4px', borderRadius: '4px', fontWeight: '600' }}>{part}</span>
        : part
    );
  };

  return (
    <>
      {/* FULL SCREEN BACKGROUND */}
      <div style={styles.bg}>
        <div style={styles.bgOverlay}></div>
        <div style={styles.pageOverlay}></div>
      </div>

      <div style={styles.page}>
      
      {/* 3-SECOND INTERCEPT MODAL */}
      <AnimatePresence>
        {transitionState.isActive && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            style={styles.modalOverlay}
          >
            <motion.div 
              initial={{ scale: 0.8 }} 
              animate={{ scale: 1 }} 
              transition={{ type: 'spring', bounce: 0.5 }}
              style={styles.modalContent}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
                <span style={{ fontSize: '28px' }}>🧢</span>
                <span style={{ fontSize: '20px', fontWeight: '800', color: '#fff', letterSpacing: '0.5px' }}>Farmcap</span>
              </div>
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }} 
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <FaShieldAlt size={45} color="#10b981" style={{ marginBottom: '15px' }}/>
              </motion.div>
              <h2 style={styles.modalTitle}>Securing Connection</h2>
              <p style={styles.modalText}>Routing you to the official Directorate of Marketing & Inspection (DMI) portal for:</p>
              <div style={styles.modalReportName}>{transitionState.reportName}</div>
              <div style={styles.loaderLine}>
                <motion.div 
                  initial={{ width: "0%" }} 
                  animate={{ width: "100%" }} 
                  transition={{ duration: 3, ease: "linear" }}
                  style={styles.loaderFill}
                />
              </div>
              <p style={styles.modalFooterText}>Government of India Database</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>



      {/* FULL PAGE CATEGORY VIEW FOR BOOKSHELF */}
      <AnimatePresence>
        {activeCategory && !searchQuery && !showFavoritesOnly && !showRecentOnly && (
          <motion.div 
            initial={{ opacity: 0, x: "100%" }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: 'tween', duration: 0.3 }}
            style={styles.fullPageOverlay}
          >
            <div style={styles.headerContainer}>
              <div style={styles.glassCapsuleHeader}>
                <button onClick={() => setActiveCategory(null)} style={styles.iconBtn}>
                  <IoMdArrowBack size={20} color="#10b981" />
                </button>
                <h2 style={styles.fullPageTitle}>{activeCategory.title || activeCategory.category}</h2>
                <div style={{width: '40px'}}></div>
              </div>
            </div>
            <div style={styles.fullPageContent}>
              <p style={{color: '#94a3b8', marginBottom: '20px', fontSize: '14px', textAlign: 'center', lineHeight: '1.5'}}>
                Scroll up and down to explore all <strong style={{color: '#fff'}}>{activeCategory.items.length}</strong> reports.<br/>Tap an item to expand it.
              </p>
              <Bookshelf 
                items={activeCategory.items} 
                onLinkClick={handleLinkClick}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER */}
      <div style={styles.headerContainer}>
        <div style={styles.glassCapsuleHeader}>
          <button onClick={() => navigate('/Consumer_HomePage')} style={styles.iconBtn}>
            <IoMdArrowBack size={20} color="#10b981"/>
          </button>
          <div style={{textAlign:'center'}}>
            <h1 style={styles.title}>Mandi Navigator</h1>
            <p style={styles.subtitle}>Direct Agmarknet Access</p>
          </div>
          <div style={{width: '40px'}}></div>
        </div>
      </div>

      {/* SEARCH BAR */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={styles.searchContainer}
      >
        <div style={styles.searchInputWrapper}>
          <IoMdSearch size={18} color="#71717a" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
          {searchQuery && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSearchQuery("")}
              style={styles.clearBtn}
            >
              <IoMdClose size={16} color="#71717a" />
            </motion.button>
          )}
        </div>

        {/* FILTER BUTTONS */}
        <div style={styles.filterButtonsContainer}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            style={{
              ...styles.filterButton,
              background: showFavoritesOnly ? 'rgba(251, 191, 36, 0.15)' : 'rgba(255,255,255,0.02)',
              borderColor: showFavoritesOnly ? 'rgba(251, 191, 36, 0.3)' : 'rgba(255,255,255,0.08)',
              color: showFavoritesOnly ? '#fbbf24' : '#a1a1aa'
            }}
          >
            <FaStar size={14} />
            <span>{favorites.length}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowRecentOnly(!showRecentOnly)}
            style={{
              ...styles.filterButton,
              background: showRecentOnly ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.02)',
              borderColor: showRecentOnly ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255,255,255,0.08)',
              color: showRecentOnly ? '#10b981' : '#a1a1aa'
            }}
          >
            <FaClock size={14} />
            <span>{recentItems.length}</span>
          </motion.button>
        </div>
      </motion.div>

      <div style={styles.scrollContent} ref={scrollRef}>
        
        {/* SEARCH RESULTS / FILTER RESULTS VIEW */}
        {(searchQuery || showFavoritesOnly || showRecentOnly) && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{marginBottom: '30px'}}
          >
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingTop: '8px'}}>
              <h3 style={{...styles.sectionTitle, margin: 0}}>
                {showFavoritesOnly ? `Favorites (${filteredItems.length})` : showRecentOnly ? `Recently Viewed (${filteredItems.length})` : `Search Results (${filteredItems.length})`}
              </h3>
              {(searchQuery || showFavoritesOnly || showRecentOnly) && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setSearchQuery("");
                    setShowFavoritesOnly(false);
                    setShowRecentOnly(false);
                  }}
                  style={{background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', fontSize: '13px', fontWeight: '600'}}
                >
                  Clear
                </motion.button>
              )}
            </div>
            {filteredItems.length > 0 ? (
              <motion.div variants={containerVariants} initial="hidden" animate="show">
                {filteredItems.map((item, idx) => (
                  <motion.button
                    key={`${item.name}-${idx}`}
                    variants={itemVariants}
                    whileHover="hover"
                    initial="rest"
                    animate="rest"
                    onClick={() => handleLinkClick(item)}
                    style={{...styles.categoryCard, width: '100%', marginBottom: '10px'}}
                  >
                    <div style={styles.cardContent}>
                      <motion.div 
                        style={styles.cardIconBox}
                        variants={iconVariants}
                      >
                        <FaFileInvoice size={20} color="#10b981" />
                      </motion.div>
                      <div style={{ flex: 1, textAlign: 'left' }}>
                        <h3 style={{...styles.cardTitleText, marginBottom: '4px'}}>{highlightText(item.name, searchQuery)}</h3>
                        <p style={{...styles.cardSubtext, margin: 0}}>{item.category}</p>
                      </div>
                      <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                        {item.isNew && <span style={{fontSize: '10px', background: '#10b981', color: '#000', padding: '3px 8px', borderRadius: '12px', fontWeight: '700'}}>NEW</span>}
                        <motion.button
                          whileHover={{ scale: 1.2, filter: 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.5))' }}
                          whileTap={{ scale: 0.8 }}
                          onClick={(e) => { e.stopPropagation(); toggleFavorite(item); }}
                          style={{background: 'none', border: 'none', cursor: 'pointer'}}
                        >
                          <FaStar size={14} color={favorites.some(f => f.name === item.name && f.url === item.url) ? '#fbbf24' : '#64748b'} />
                        </motion.button>
                        <FaExternalLinkAlt size={12} color="#94a3b8" />
                      </div>
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{textAlign: 'center', padding: '30px 20px', color: '#64748b'}}
              >
                <p style={{fontSize: '14px', margin: 0}}>No results found</p>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* MAIN CONTENT - SHOW ONLY WHEN NOT SEARCHING/FILTERING */}
        {!searchQuery && !showFavoritesOnly && !showRecentOnly && (
          <>
        
        {/* HOARDING / BANNER SECTION */}
        <motion.div variants={containerVariants} initial="hidden" animate="show" style={styles.hoardingContainer}>
          <AnimatePresence>
            <motion.img 
              key={currentBannerIndex}
              src={BOOK_COVERS[currentBannerIndex]} 
              alt="Market Hoarding" 
              initial={{ opacity: 0, scale: 1.15 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              style={{...styles.hoardingImage, position: 'absolute', top: 0, left: 0, filter: 'brightness(1.5)'}} 
            />
          </AnimatePresence>
          <div style={{...styles.hoardingOverlay, zIndex: 1}}>
            <div>
              <p style={{color: '#10b981', margin: '0 0 5px 0', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px'}}>Live Updates</p>
              <h2 style={styles.hoardingText}>National Mandi Database</h2>
            </div>
          </div>
        </motion.div>

        {/* FAVORITES SECTION */}
        {favorites.length > 0 && (
          <motion.div variants={containerVariants} initial="hidden" animate="show" style={styles.section}>
            <motion.div 
              style={styles.sectionHeader}
              whileHover={{ x: 5 }}
            >
              <FaStar size={20} color="#fbbf24" />
              <h2 style={styles.sectionTitle}>Saved Favorites ({favorites.length})</h2>
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowFavoritesOnly(true)}
              style={{...styles.categoryCard, width: '100%'}}
            >
              <div style={styles.cardContent}>
                <motion.div 
                  style={styles.cardIconBox}
                  whileHover={{ scale: 1.1, rotate: 5, boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.4), 0 0 15px rgba(251, 191, 36, 0.3)' }}
                >
                  <FaStar size={20} color="#fbbf24" />
                </motion.div>
                <div style={{ flex: 1 }}>
                  <h3 style={styles.cardTitleText}>View All Favorites</h3>
                  <p style={styles.cardSubtext}>Quick access to saved reports</p>
                </div>
                <motion.div whileHover={{ x: 4 }}>
                  <FaChevronRight style={{marginLeft: 'auto'}} color="#cbd5e1" size={16} />
                </motion.div>
              </div>
            </motion.button>
          </motion.div>
        )}

        {/* RECENT SECTION */}
        {recentItems.length > 0 && (
          <motion.div variants={containerVariants} initial="hidden" animate="show" style={styles.section}>
            <motion.div 
              style={styles.sectionHeader}
              whileHover={{ x: 5 }}
            >
              <FaClock size={20} color="#10b981" />
              <h2 style={styles.sectionTitle}>Recently Viewed ({recentItems.length})</h2>
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowRecentOnly(true)}
              style={{...styles.categoryCard, width: '100%'}}
            >
              <div style={styles.cardContent}>
                <motion.div 
                  style={styles.cardIconBox}
                  whileHover={{ scale: 1.1, rotate: -5, boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.4), 0 0 15px rgba(16, 185, 129, 0.3)' }}
                >
                  <FaClock size={20} color="#10b981" />
                </motion.div>
                <div style={{ flex: 1 }}>
                  <h3 style={styles.cardTitleText}>View Recent Reports</h3>
                  <p style={styles.cardSubtext}>Your recently accessed links</p>
                </div>
                <motion.div whileHover={{ x: 4 }}>
                  <FaChevronRight style={{marginLeft: 'auto'}} color="#cbd5e1" size={16} />
                </motion.div>
              </div>
            </motion.button>
          </motion.div>
        )}
        
        {/* SECTION 1: PRICE & ARRIVAL REPORTS */}
        <motion.div variants={containerVariants} initial="hidden" animate="show" style={styles.section}>
          <div style={styles.sectionHeader}>
            <FaFileInvoice size={20} color="#10b981" />
            <h2 style={styles.sectionTitle}>Prices & Arrival Reports</h2>
            <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#71717a', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px' }}>
              {MARKET_REPORTS.reduce((acc, group) => acc + group.items.length, 0)} reports
            </span>
          </div>
          {MARKET_REPORTS.map((group, idx) => {
            return (
              <motion.div
                key={`market-${idx}`}
                variants={itemVariants}
                whileHover="hover"
                whileTap={{ scale: 0.98 }}
                initial="rest"
                style={styles.categoryCard}
                onClick={() => setActiveCategory(group)}
              >
              <div style={styles.cardContent}>
                <motion.div 
                  style={styles.cardIconBox}
                  variants={iconVariants}
                  initial="rest"
                  whileHover="hover"
                >
                  {group.icon}
                </motion.div>
                <div style={{ flex: 1 }}>
                  <h3 style={styles.cardTitleText}>{group.title}</h3>
                  <p style={styles.cardSubtext}>{group.items.length} reports available</p>
                </div>
                <motion.div 
                  style={{ marginLeft: 'auto', color: '#cbd5e1' }}
                  animate={{ x: 0 }}
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  <FaChevronRight size={16} />
                </motion.div>
              </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* SECTION 2: PRICE TREND REPORTS */}
        <motion.div variants={containerVariants} initial="hidden" animate="show" style={styles.section}>
          <div style={styles.sectionHeader}>
            <FaChartArea size={20} color="#10b981" />
            <h2 style={styles.sectionTitle}>Price Trend Reports</h2>
            <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#71717a', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px' }}>
              {TREND_REPORTS.reduce((acc, group) => acc + group.items.length, 0)} reports
            </span>
          </div>
          
          {TREND_REPORTS.map((group, idx) => {
            return (
              <motion.div
                key={`trend-${idx}`}
                variants={itemVariants}
                whileHover="hover"
                whileTap={{ scale: 0.98 }}
                initial="rest"
                style={styles.categoryCard}
                onClick={() => setActiveCategory(group)}
              >
              <div style={styles.cardContent}>
                <motion.div 
                  style={styles.cardIconBox}
                  variants={iconVariants}
                  initial="rest"
                  whileHover="hover"
                >
                  {group.icon}
                </motion.div>
                <div style={{ flex: 1 }}>
                  <h3 style={styles.cardTitleText}>{group.category}</h3>
                  <p style={styles.cardSubtext}>{group.items.length} reports available</p>
                </div>
                <motion.div 
                  style={{ marginLeft: 'auto', color: '#cbd5e1' }}
                  animate={{ x: 0 }}
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  <FaChevronRight size={16} />
                </motion.div>
              </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* SECTION 3: INFO TRIGGER BUTTON */}
        <motion.button 
          variants={itemVariants}
          whileHover={{ scale: 1.02, boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.3), 0 0 15px rgba(255, 255, 255, 0.15)' }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsInfoModalOpen(true)} 
          style={styles.infoTriggerBtn}
        >
          <FaInfoCircle size={18} />
          <span>About Agmarknet & Farmcap</span>
        </motion.button>

        </>
        )}
      </div>

      {/* INFO FULL VIEW */}
      <AnimatePresence>
        {isInfoModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            style={styles.infoModalOverlay}
          >
            <motion.div 
              initial={{ x: "100%" }} 
              animate={{ x: 0 }} 
              exit={{ x: "100%" }}
              transition={{ type: 'tween', duration: 0.3 }}
              style={styles.infoModalContent}
            >
              <div style={styles.headerContainer}>
                <div style={styles.glassCapsuleHeader}>
                  <button onClick={() => setIsInfoModalOpen(false)} style={styles.iconBtn}>
                    <IoMdArrowBack size={20} color="#10b981" />
                  </button>
                  <h2 style={styles.infoModalTitle}>About & Legal</h2>
                  <div style={{width: '40px'}}></div>
                </div>
              </div>
              <div style={styles.infoModalScroll}>
                
                {/* CARD 1: ABOUT AGMARKNET & SERVICES */}
                <div style={styles.infoCard}>
                  <h4 style={styles.cardHeader}>About the Official Agmarknet Portal</h4>
                  
                  <div style={styles.textBlock}>
                    <span style={styles.highlightText}>National Infrastructure:</span>
                    <p style={styles.paragraph}>Agmarknet is a flagship G2C (Government to Citizen) e-governance portal. It acts as the central digital repository for agricultural commodity market data across India, providing transparency into nationwide mandi operations.</p>
                  </div>

                  <div style={styles.textBlock}>
                    <span style={styles.highlightText}>Data Origin & Methodology:</span>
                    <p style={styles.paragraph}>The database is maintained by the Directorate of Marketing and Inspection (DMI), Ministry of Agriculture and Farmers Welfare. Data is not automatically generated; it is physically captured and uploaded daily by authorized officials at respective Agricultural Produce Market Committees (APMCs) across thousands of local market yards.</p>
                  </div>

                  <div style={styles.textBlock}>
                    <span style={styles.highlightText}>Overview of Provided Services:</span>
                    <p style={styles.paragraph}>The links provided in this application route you to specific, highly detailed government databases, which include:</p>
                    <ul style={styles.bulletList}>
                      <li style={styles.bulletItem}><strong>Live Prices & Arrivals:</strong> Daily, real-time tracking of what commodities are arriving at mandis and their current modal, minimum, and maximum trading prices.</li>
                      <li style={styles.bulletItem}><strong>Analytical Trends:</strong> Historical time-series data (weekly and monthly) allowing farmers to forecast market trajectories based on past state, district, and market-level performance.</li>
                      <li style={styles.bulletItem}><strong>MSP Protection Data:</strong> Critical reports highlighting commodity transactions occurring both below and above the Government's mandated Minimum Support Price (MSP), protecting farmers from exploitation.</li>
                    </ul>
                  </div>

                  <div style={styles.textBlock}>
                    <span style={styles.highlightText}>Government Accuracy & Legal Disclaimer:</span>
                    <p style={styles.paragraph}>While the DMI verifies this data to the best of their ability, the information is subject to rapid market changes. The Government of India explicitly states that this data is for informational transparency and <strong>must not be used for legal purposes or litigation</strong>. The DMI is not liable for errors, omissions, or authenticity of the APMC-reported data.</p>
                  </div>

                  <button 
                    onClick={() => window.open('https://agmarknet.gov.in/aboutus', '_blank', 'noopener,noreferrer')} 
                    style={styles.primaryLinkBtn}
                  >
                    Official Agmarknet About Us ➔
                  </button>
                </div>

                {/* CARD 2: ABOUT FARMCAP & CONNECTION */}
                <div style={styles.infoCard}>
                  <h4 style={styles.cardHeader}>About Farmcap's Integration</h4>
                  
                  <div style={styles.textBlock}>
                    <span style={styles.highlightText}>Our Utility & Purpose:</span>
                    <p style={styles.paragraph}>Farmcap is an independent, private agricultural utility application. Our mission is to remove digital friction for rural users by organizing complex, hard-to-find government data into an accessible, mobile-friendly directory.</p>
                  </div>

                  <div style={styles.textBlock}>
                    <span style={styles.highlightText}>Connection Architecture (How it works):</span>
                    <p style={styles.paragraph}>Farmcap employs a <strong>Secure Outbound Routing</strong> architecture. We do not scrape, download, host, or alter any data from the Indian Government. When you click a service link in Farmcap, our app securely hands off your session directly to the official <code>agmarknet.gov.in</code> servers via a new browser window. You are viewing the raw, direct source.</p>
                  </div>

                  <div style={styles.textBlock}>
                    <span style={styles.highlightText}>Absolute Liability Shield:</span>
                    <p style={styles.paragraph}><strong>Farmcap makes no warranties regarding market prices.</strong> This application serves strictly as an educational and navigational bridge. Neither Farmcap, its developers, nor the Directorate of Marketing and Inspection are responsible for any financial losses, trading outcomes, crop sales, or business decisions made as a result of using this portal.</p>
                  </div>
                  
                  <div style={styles.textBlock}>
                    <span style={styles.highlightText}>User Responsibility:</span>
                    <p style={styles.paragraph}>By using these links, you acknowledge that agricultural markets are highly volatile. Users must perform independent physical due diligence and inquire directly with local Mandi officials or buyers before executing any financial transactions.</p>
                  </div>

                  <button style={styles.secondaryLinkBtn}>
                    Farmcap Privacy Policy
                  </button>
                </div>
                
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </>
  );
};

const styles = {
  bg: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 0,
    backgroundImage: 'url("https://cdn.wallpapersafari.com/96/60/BSGmdb.jpg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  bgOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 1,
    backgroundColor: 'rgba(10, 10, 15, 0.4)',
  },
  page: { 
    height: '100vh', 
    background: 'transparent',
    color: '#f0f4f8', 
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', 
    overflow: 'hidden', 
    display: 'flex', 
    flexDirection: 'column',
    position: 'relative',
    zIndex: 10,
    boxSizing: 'border-box',
    textShadow: '0 2px 8px rgba(0,0,0,0.3)'
  },
  pageOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.05) 0%, transparent 60%)',
    zIndex: 2,
    pointerEvents: 'none'
  },
  headerContainer: { 
    padding: '24px 20px 16px 20px', 
    position: 'relative',
    zIndex: 1,
    width: '100%',
    boxSizing: 'border-box'
  },
  glassCapsuleHeader: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    background: 'rgba(255, 255, 255, 0.02)',
    backdropFilter: 'blur(25px) saturate(120%)',
    WebkitBackdropFilter: 'blur(25px) saturate(120%)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderTop: '1px solid rgba(255, 255, 255, 0.35)',
    borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '24px',
    padding: '12px 16px',
    boxShadow: 'inset 0 2px 5px rgba(255, 255, 255, 0.25), inset 0 -2px 5px rgba(0, 0, 0, 0.1), 0 10px 40px rgba(0, 0, 0, 0.2)'
  },
  title: { fontSize: '20px', margin: 0, fontWeight: '600', letterSpacing: '-0.3px', color: '#ffffff' },
  subtitle: { fontSize: '12px', color: '#10b981', margin: '6px 0 0 0', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.8px' },
  iconBtn: { 
    background: 'rgba(255, 255, 255, 0.05)', 
    border: '1px solid rgba(255, 255, 255, 0.1)', 
    borderTop: '1px solid rgba(255, 255, 255, 0.35)',
    cursor: 'pointer', 
    width: '40px', 
    height: '40px', 
    borderRadius: '14px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 0, 
    color: '#f0f4f8',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
    boxShadow: 'inset 0 2px 4px rgba(255, 255, 255, 0.25), inset 0 -1px 2px rgba(0, 0, 0, 0.1), 0 4px 10px rgba(0, 0, 0, 0.1)'
  },
  
  // SEARCH & FILTER STYLES
  searchContainer: { 
    padding: '16px 20px 12px 20px',
    position: 'relative',
    zIndex: 1,
    width: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  searchInputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(255, 255, 255, 0.02)',
    backdropFilter: 'blur(25px) saturate(120%)',
    WebkitBackdropFilter: 'blur(25px) saturate(120%)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderTop: '1px solid rgba(255, 255, 255, 0.35)',
    borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '18px',
    transition: 'all 0.3s ease',
    boxShadow: 'inset 0 2px 5px rgba(255, 255, 255, 0.2), inset 0 -2px 5px rgba(0, 0, 0, 0.1), 0 8px 20px rgba(0, 0, 0, 0.15)'
  },
  searchInput: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    padding: '12px 14px 12px 40px',
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: '500',
    outline: 'none',
    fontFamily: 'inherit'
  },
  clearBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px 12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#94a3b8'
  },
  filterButtonsContainer: {
    display: 'flex',
    gap: '12px',
    width: '100%'
  },
  filterButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 14px',
    background: 'rgba(255, 255, 255, 0.02)',
    backdropFilter: 'blur(25px) saturate(120%)',
    WebkitBackdropFilter: 'blur(25px) saturate(120%)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderTop: '1px solid rgba(255, 255, 255, 0.35)',
    borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '16px',
    color: '#cbd5e1',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: 'inset 0 2px 4px rgba(255, 255, 255, 0.2), inset 0 -1px 3px rgba(0, 0, 0, 0.1), 0 4px 15px rgba(0, 0, 0, 0.1)'
  },

  scrollContent: { flex: 1, overflowY: 'auto', padding: '20px', position: 'relative', zIndex: 1, width: '100%', boxSizing: 'border-box' },
  
  section: { marginBottom: '36px' },
  sectionHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' },
  sectionTitle: { fontSize: '13px', fontWeight: '700', margin: 0, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1.2px' },
  
  categoryCard: { 
    position: 'relative', 
    padding: '20px', 
    borderRadius: '24px', 
    background: 'rgba(255, 255, 255, 0.02)',
    backdropFilter: 'blur(30px) saturate(120%)',
    WebkitBackdropFilter: 'blur(30px) saturate(120%)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderTop: '1px solid rgba(255, 255, 255, 0.35)',
    borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: 'inset 0 2px 6px rgba(255, 255, 255, 0.25), inset 0 -2px 5px rgba(0, 0, 0, 0.15), 0 10px 30px rgba(0, 0, 0, 0.2)',
    cursor: 'pointer', 
    marginBottom: '14px', 
    overflow: 'hidden', 
    width: '100%', 
    boxSizing: 'border-box',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
  },
  cardContent: { position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '14px', width: '100%' },
  cardIconBox: { 
    width: '52px', 
    height: '52px', 
    borderRadius: '12px', 
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(20px)', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    flexShrink: 0,
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderTop: '1px solid rgba(255, 255, 255, 0.35)',
    borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: 'inset 0 2px 4px rgba(255, 255, 255, 0.25), inset 0 -1px 2px rgba(0, 0, 0, 0.1), 0 4px 10px rgba(0, 0, 0, 0.1)'
  },
  cardTitleText: { fontSize: '16px', fontWeight: '600', color: '#ffffff', margin: 0 },
  cardSubtext: { fontSize: '13px', color: '#94a3b8', margin: '4px 0 0 0' },
  
  // HOARDING STYLES
  hoardingContainer: { 
    width: '100%', 
    height: '200px', 
    borderRadius: '24px', 
    overflow: 'hidden', 
    position: 'relative', 
    marginBottom: '36px', 
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderTop: '1px solid rgba(255, 255, 255, 0.35)',
    boxShadow: 'inset 0 2px 5px rgba(255, 255, 255, 0.25), inset 0 -2px 5px rgba(0, 0, 0, 0.15), 0 20px 60px rgba(0, 0, 0, 0.3)',
    boxSizing: 'border-box' 
  },
  hoardingImage: { width: '100%', height: '100%', objectFit: 'cover' },
  hoardingOverlay: { 
    position: 'absolute', 
    inset: 0, 
    background: 'linear-gradient(to right, rgba(15, 15, 20, 0.9) 0%, rgba(15, 15, 20, 0.5) 60%, transparent 100%)',
    display: 'flex', 
    alignItems: 'center', 
    padding: '32px', 
    boxSizing: 'border-box' 
  },
  hoardingText: { color: 'white', fontSize: '28px', fontWeight: '700', lineHeight: '1.3', letterSpacing: '-0.5px' },

  // BOOKSHELF STYLES
  book: { 
    position: 'relative', 
    borderRadius: '20px', 
    cursor: 'pointer', 
    overflow: 'hidden', 
    background: 'rgba(255, 255, 255, 0.02)',
    backdropFilter: 'blur(25px) saturate(120%)',
    WebkitBackdropFilter: 'blur(25px) saturate(120%)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderTop: '1px solid rgba(255, 255, 255, 0.35)',
    borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: 'inset 0 2px 5px rgba(255, 255, 255, 0.25), inset 0 -2px 4px rgba(0, 0, 0, 0.15), 0 8px 25px rgba(0, 0, 0, 0.15)',
    flexShrink: 0, 
    boxSizing: 'border-box',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
  },
  openBookTitle: { margin: '0 0 10px 0', color: 'white', fontSize: '15px', fontWeight: '600', lineHeight: '1.3', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  
  newBadge: { position: 'absolute', top: '12px', right: '12px', background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)', color: '#fff', fontSize: '10px', fontWeight: '700', padding: '6px 10px', borderRadius: '8px', letterSpacing: '0.5px', boxShadow: '0 4px 15px rgba(255, 107, 107, 0.4)' },
  
  infoTriggerBtn: { 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: '10px', 
    width: '100%', 
    padding: '16px', 
    background: 'rgba(255, 255, 255, 0.02)',
    backdropFilter: 'blur(25px) saturate(120%)',
    WebkitBackdropFilter: 'blur(25px) saturate(120%)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderTop: '1px solid rgba(255, 255, 255, 0.35)',
    borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '16px', 
    color: '#cbd5e1', 
    fontSize: '14px', 
    fontWeight: '600', 
    cursor: 'pointer', 
    marginTop: '12px',
    transition: 'all 0.3s ease',
    boxShadow: 'inset 0 2px 5px rgba(255, 255, 255, 0.25), inset 0 -2px 4px rgba(0, 0, 0, 0.1), 0 8px 20px rgba(0, 0, 0, 0.15)'
  },
  
  infoModalOverlay: { 
    position: 'fixed', 
    top: 0, 
    left: 0, 
    width: '100%', 
    height: '100%', 
    background: 'rgba(0, 0, 0, 0.5)', 
    backdropFilter: 'blur(10px)', 
    WebkitBackdropFilter: 'blur(10px)', 
    zIndex: 2000, 
    display: 'flex', 
    justifyContent: 'flex-end' 
  },
  infoModalContent: { 
    background: 'rgba(15, 15, 20, 0.75)',
    backdropFilter: 'blur(40px) saturate(150%)', 
    WebkitBackdropFilter: 'blur(40px) saturate(150%)', 
    borderLeft: '1px solid rgba(255, 255, 255, 0.15)',
    borderTop: '1px solid rgba(255, 255, 255, 0.25)',
    padding: '24px', 
    width: '100%', 
    maxWidth: '420px', 
    height: '100%', 
    display: 'flex', 
    flexDirection: 'column', 
    boxSizing: 'border-box', 
    boxShadow: 'inset 2px 2px 5px rgba(255, 255, 255, 0.2), inset 0 -2px 10px rgba(0, 0, 0, 0.2), -20px 0 60px rgba(0, 0, 0, 0.5)' 
  },
  infoModalTitle: { fontSize: '18px', fontWeight: '700', margin: 0, color: '#ffffff' },
  infoModalScroll: { flex: 1, overflowY: 'auto', paddingRight: '8px', marginTop: '16px' },

  infoCard: { 
    background: 'rgba(255, 255, 255, 0.02)',
    backdropFilter: 'blur(25px) saturate(120%)',
    WebkitBackdropFilter: 'blur(25px) saturate(120%)',
    padding: '24px', 
    borderRadius: '24px', 
    marginBottom: '16px', 
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderTop: '1px solid rgba(255, 255, 255, 0.35)',
    borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: 'inset 0 2px 5px rgba(255, 255, 255, 0.25), inset 0 -2px 5px rgba(0, 0, 0, 0.15), 0 8px 32px rgba(0, 0, 0, 0.15)'
  },
  cardHeader: { margin: '0 0 16px 0', fontSize: '14px', color: '#38bdf8', fontWeight: '700', letterSpacing: '0.2px' },
  textBlock: { marginBottom: '16px' },
  highlightText: { fontSize: '12px', color: '#60a5fa', fontWeight: '700', display: 'block', marginBottom: '6px', letterSpacing: '0.3px', textTransform: 'uppercase' },
  paragraph: { fontSize: '13px', color: '#cbd5e1', lineHeight: '1.7', margin: 0 },
  bulletList: { margin: '8px 0 0 0', paddingLeft: '20px', color: '#cbd5e1', fontSize: '13px' },
  bulletItem: { marginBottom: '8px', lineHeight: '1.6' },
  primaryLinkBtn: { 
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: '#ffffff', 
    border: 'none', 
    padding: '12px', 
    borderRadius: '10px', 
    fontSize: '13px', 
    fontWeight: '700', 
    cursor: 'pointer', 
    width: '100%', 
    marginTop: '12px',
    transition: 'all 0.3s ease',
    boxShadow: 'inset 0 2px 4px rgba(255, 255, 255, 0.3), 0 4px 15px rgba(16, 185, 129, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },
  secondaryLinkBtn: { 
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderTop: '1px solid rgba(255, 255, 255, 0.25)',
    borderLeft: '1px solid rgba(255, 255, 255, 0.15)',
    color: '#f0f4f8', 
    padding: '12px', 
    borderRadius: '10px', 
    fontSize: '13px', 
    fontWeight: '600', 
    cursor: 'pointer', 
    width: '100%', 
    marginTop: '12px',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
    boxShadow: 'inset 0 2px 4px rgba(255, 255, 255, 0.15), inset 0 -1px 2px rgba(0,0,0,0.1)'
  },

  modalOverlay: { 
    position: 'fixed', 
    top: 0, 
    left: 0, 
    width: '100%', 
    height: '100%', 
    background: 'rgba(0, 0, 0, 0.6)', 
    backdropFilter: 'blur(8px)', 
    zIndex: 1000, 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: '20px', 
    boxSizing: 'border-box' 
  },
  modalContent: { 
    background: 'rgba(20, 20, 25, 0.65)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderTop: '1px solid rgba(255, 255, 255, 0.35)',
    borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '28px', 
    padding: '36px 32px', 
    width: '100%', 
    maxWidth: '380px', 
    textAlign: 'center', 
    boxShadow: 'inset 0 2px 6px rgba(255, 255, 255, 0.25), inset 0 -2px 6px rgba(0, 0, 0, 0.2), 0 25px 60px rgba(0, 0, 0, 0.5)',
    boxSizing: 'border-box',
    backdropFilter: 'blur(30px) saturate(150%)',
    WebkitBackdropFilter: 'blur(30px) saturate(150%)'
  },
  modalTitle: { fontSize: '22px', fontWeight: '700', color: '#ffffff', margin: '0 0 12px 0' },
  modalText: { fontSize: '14px', color: '#cbd5e1', margin: '0 0 24px 0', lineHeight: '1.6' },
  modalReportName: { 
    background: 'rgba(255, 255, 255, 0.05)',
    padding: '16px', 
    borderRadius: '16px', 
    fontSize: '14px', 
    fontWeight: '600', 
    color: '#10b981', 
    marginBottom: '28px', 
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderTop: '1px solid rgba(255, 255, 255, 0.3)',
    borderLeft: '1px solid rgba(255, 255, 255, 0.15)',
    boxShadow: 'inset 0 2px 4px rgba(255, 255, 255, 0.15), inset 0 -1px 2px rgba(0, 0, 0, 0.1)'
  },
  loaderLine: { width: '100%', height: '3px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '2px', overflow: 'hidden', marginBottom: '16px' },
  loaderFill: { height: '100%', background: 'linear-gradient(to right, #10b981, #34d399)' },
  modalFooterText: { fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.2px', fontWeight: '700', margin: 0 },

  // FULL PAGE OVERLAY STYLES
  fullPageOverlay: { 
    position: 'fixed', 
    top: 0, 
    left: 0, 
    width: '100%', 
    height: '100%', 
    background: 'rgba(10, 10, 12, 0.35)',
    backdropFilter: 'blur(16px) saturate(150%)', 
    WebkitBackdropFilter: 'blur(16px) saturate(150%)', 
    zIndex: 500, 
    display: 'flex', 
    flexDirection: 'column', 
    boxSizing: 'border-box' 
  },
  fullPageTitle: { fontSize: '18px', fontWeight: '700', color: '#fff', margin: 0 },
  fullPageContent: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', padding: '20px', paddingTop: '12px', overflow: 'hidden', width: '100%', boxSizing: 'border-box' }
};

export default MarketRates;