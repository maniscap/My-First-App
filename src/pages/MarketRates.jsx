import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { IoMdArrowBack, IoMdClose } from 'react-icons/io';
import { FaFileInvoice, FaChartArea, FaMapMarkerAlt, FaShieldAlt, FaExternalLinkAlt, FaInfoCircle, FaChevronRight } from 'react-icons/fa';

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
    icon: <FaMapMarkerAlt color="#60a5fa" />,
    items: [
      { name: "State-wise Wholesale Prices Monthly Analysis", url: "https://agmarknet.gov.in/statewholesalemonthanalysis" },
      { name: "State-wise & Variety-wise Prices Monthly Analysis", url: "https://agmarknet.gov.in/statevarietymonthlyanalysis" },
      { name: "State-wise Wholesale Prices Weekly Analysis", url: "https://agmarknet.gov.in/statewholesaleweekanalysis" },
      { name: "State-wise & Variety-wise Prices Weekly Analysis", url: "https://agmarknet.gov.in/statevarietyweeklyanalysis" }
    ]
  },
  {
    category: "District-wise Reports",
    icon: <FaMapMarkerAlt color="#f472b6" />,
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
    icon: <FaMapMarkerAlt color="#a78bfa" />,
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
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

// Shared images to be used for both the top banner and the bookshelf
const BOOK_COVERS = [
  "https://img.freepik.com/premium-photo/illustration-indian-agriculture-wheat-field-india-generative-ai_756405-75186.jpg",
  "https://img.freepik.com/premium-photo/farmer-using-laptop-scenic-rice-field-sunset_38013-38674.jpg",
  "https://static.vecteezy.com/system/resources/thumbnails/041/760/565/small_2x/ai-generated-tractor-spraying-pesticide-on-wheat-field-free-photo.jpeg",
  "https://img.freepik.com/premium-photo/concept-growing-crops-using-ai-farming-system-uses-artificial-intelligence-optimize-work_1006821-4087.jpg?w=2000",
  "https://img.freepik.com/premium-photo/young-indian-farmer-using-laptop-agriculture-field_75648-8622.jpg",
  "https://peachbot.in/storage/blogs/V1FRLmrDjxKeMWNUyWA7Vkyh6tHoJaoo3k0sIR5V.jpg",
  "https://img.freepik.com/premium-photo/concept-growing-crops-using-ai-farming-system-uses-artificial-intelligence-optimize-work_1006821-4087.jpg?w=2000"
];

// --- NEW: GLASS BOOKSHELF COMPONENT ---
const Bookshelf = ({ items, onLinkClick, isFullView }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  // Adjusted Sizing: Open book flush to the left, 2 closed spines on the right
  const W_INACTIVE = isFullView ? 45 : 35;
  const W_ACTIVE = isFullView ? 270 : 250;
  const GAP = isFullView ? 15 : 12;
  const ACTIVE_X_OFFSET = 0; // Anchors the active book to the absolute left edge to save space

  const handleNext = () => setActiveIndex((prev) => Math.min(prev + 1, items.length - 1));
  const handlePrev = () => setActiveIndex((prev) => Math.max(prev - 1, 0));

  // Smooth Swipe Gestures
  const handlePanEnd = (e, info) => {
    const swipeThreshold = 30;
    const velocityThreshold = 400;
    if (info.offset.x < -swipeThreshold || info.velocity.x < -velocityThreshold) {
      setActiveIndex((prev) => Math.min(prev + 1, items.length - 1)); // Swipe Left
    } else if (info.offset.x > swipeThreshold || info.velocity.x > velocityThreshold) {
      setActiveIndex((prev) => Math.max(prev - 1, 0)); // Swipe Right
    }
  };

  return (
    <div style={styles.bookshelfWrapper}>
      <div style={{ ...styles.bookshelf, height: isFullView ? '55vh' : '260px', minHeight: isFullView ? '400px' : 'auto' }}>
        {/* Absolute left-aligned track wrapper */}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, display: 'flex', alignItems: 'center' }}>
          <motion.div
            onPanEnd={handlePanEnd}
            animate={{ x: ACTIVE_X_OFFSET - (activeIndex * (W_INACTIVE + GAP)) }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{ display: 'flex', gap: `${GAP}px`, alignItems: 'center', width: 'max-content', touchAction: 'pan-y', height: '100%' }}
          >
            {items.map((item, idx) => {
              const isActive = activeIndex === idx;
              const bgUrl = BOOK_COVERS[idx % BOOK_COVERS.length];

              return (
                <motion.div
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  style={{ ...styles.book, backgroundImage: `url(${bgUrl})` }}
                  animate={{ 
                    width: isActive ? W_ACTIVE : W_INACTIVE,
                    height: '100%', // Keeps all books flat on the same visual plane
                    opacity: isActive ? 1 : 0.85, // Slightly lower opacity so the 3D white edge pops out
                    boxShadow: isActive 
                      ? '0 15px 30px -5px rgba(0, 0, 0, 0.6), inset 0 0 10px rgba(255, 255, 255, 0.2), inset 1px 1px 2px rgba(255, 255, 255, 0.5)' 
                      : '0 10px 20px -5px rgba(0, 0, 0, 0.5), inset 6px 0 12px rgba(255, 255, 255, 0.5), inset -2px 0 5px rgba(0, 0, 0, 0.4)' // 3D glass spine facing left
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <div style={styles.bookGlassOverlay}>
                    {isActive ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} style={styles.openBookContent}>
                        {item.isNew && <span style={styles.newBadge}>NEW</span>}
                        <h3 style={styles.openBookTitle}>{item.name}</h3>
                        <button style={styles.launchBtn} onClick={(e) => { e.stopPropagation(); onLinkClick(item); }}> Access Report <FaExternalLinkAlt size={12} style={{marginLeft: '8px'}} /> </button>
                      </motion.div>
                    ) : (
                      <div style={styles.closedBookSpine}><span style={styles.spineText}>{item.name}</span></div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
      <div style={styles.shelfBase}></div>
      
      {/* NAVIGATION INDICATOR & CONTROLS */}
      <div style={styles.navControls}>
        <button onClick={handlePrev} disabled={activeIndex === 0} style={{...styles.navBtn, opacity: activeIndex === 0 ? 0.3 : 1}}>
          <IoMdArrowBack size={20} color="#fff" />
        </button>
        <span style={styles.navIndicator}>Report {activeIndex + 1} of {items.length}</span>
        <button onClick={handleNext} disabled={activeIndex === items.length - 1} style={{...styles.navBtn, opacity: activeIndex === items.length - 1 ? 0.3 : 1, transform: 'rotate(180deg)'}}>
          <IoMdArrowBack size={20} color="#fff" />
        </button>
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

  // Auto-rotating banner interval
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % BOOK_COVERS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const handleLinkClick = (report) => {
    if (!report.url) {
      alert("URL not yet configured for: " + report.name);
      return;
    }

    // Trigger the 3-second intercept modal
    setTransitionState({ isActive: true, reportName: report.name });

    setTimeout(() => {
      // Open the government site in a new tab
      window.open(report.url, '_blank', 'noopener,noreferrer');
      // Hide the modal so they are back in Farmcap when they close the new tab
      setTransitionState({ isActive: false, reportName: "" });
    }, 3000);
  };

  return (
    <div style={styles.page}>

      {/* THICK BACKGROUND OVERLAY */}
      <div style={styles.pageOverlay}></div>
      
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
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }} 
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <FaShieldAlt size={50} color="#10b981" style={{ marginBottom: '15px' }}/>
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
        {activeCategory && (
          <motion.div 
            initial={{ opacity: 0, x: "100%" }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: 'tween', duration: 0.3 }}
            style={styles.fullPageOverlay}
          >
            <div style={styles.fullPageHeader}>
              <button onClick={() => setActiveCategory(null)} style={styles.backBtnModal}>
                <IoMdArrowBack size={24} color="#10b981" />
              </button>
              <h2 style={styles.fullPageTitle}>{activeCategory.title || activeCategory.category}</h2>
            </div>
            <div style={styles.fullPageContent}>
              <p style={{color: '#94a3b8', marginBottom: '20px', fontSize: '14px', textAlign: 'center', lineHeight: '1.5'}}>
                Swipe the books, tap the closed spines, or use the arrows below<br/>to explore all <strong style={{color: '#fff'}}>{activeCategory.items.length}</strong> reports in this category.
              </p>
              <Bookshelf items={activeCategory.items} onLinkClick={handleLinkClick} isFullView={true} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.headerTop}>
          <button onClick={() => navigate('/agri-insights')} style={styles.iconBtn}>
            <IoMdArrowBack size={20} color="#10b981"/>
          </button>
          <div style={{textAlign:'center'}}>
            <h1 style={styles.title}>Mandi Navigator</h1>
            <p style={styles.subtitle}>Direct Agmarknet Access</p>
          </div>
          <div style={{width: '40px'}}></div>
        </div>
      </div>

      <div style={styles.scrollContent}>
        
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
              style={{...styles.hoardingImage, position: 'absolute', top: 0, left: 0}} 
            />
          </AnimatePresence>
          <div style={{...styles.hoardingOverlay, zIndex: 1}}>
            <div>
              <p style={{color: '#10b981', margin: '0 0 5px 0', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px'}}>Live Updates</p>
              <h2 style={styles.hoardingText}>National Mandi Database</h2>
            </div>
          </div>
        </motion.div>
        
        {/* SECTION 1: PRICE & ARRIVAL REPORTS */}
        <motion.div variants={containerVariants} initial="hidden" animate="show" style={styles.section}>
          <div style={styles.sectionHeader}>
            <FaFileInvoice size={20} color="#10b981" />
            <h2 style={styles.sectionTitle}>Prices & Arrival Reports</h2>
          </div>
          {MARKET_REPORTS.map((group, idx) => (
            <motion.div
              key={`market-${idx}`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{...styles.categoryCard, backgroundImage: `url(${BOOK_COVERS[idx % BOOK_COVERS.length]})`}}
              onClick={() => setActiveCategory(group)}
            >
              <div style={styles.cardOverlay}></div>
              <div style={styles.cardContent}>
                <div style={styles.cardIconBox}>{group.icon}</div>
                <h3 style={styles.cardTitleText}>{group.title}</h3>
                <FaChevronRight style={{marginLeft: 'auto'}} color="#a1a1aa" size={14} />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* SECTION 2: PRICE TREND REPORTS */}
        <motion.div variants={containerVariants} initial="hidden" animate="show" style={styles.section}>
          <div style={styles.sectionHeader}>
            <FaChartArea size={20} color="#3b82f6" />
            <h2 style={styles.sectionTitle}>Price Trend Reports</h2>
          </div>
          
          {TREND_REPORTS.map((group, idx) => (
            <motion.div
              key={`trend-${idx}`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{...styles.categoryCard, backgroundImage: `url(${BOOK_COVERS[(idx + MARKET_REPORTS.length) % BOOK_COVERS.length]})`}}
              onClick={() => setActiveCategory(group)}
            >
              <div style={styles.cardOverlay}></div>
              <div style={styles.cardContent}>
                <div style={styles.cardIconBox}>{group.icon}</div>
                <h3 style={styles.cardTitleText}>{group.category}</h3>
                <FaChevronRight style={{marginLeft: 'auto'}} color="#a1a1aa" size={14} />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* SECTION 3: INFO TRIGGER BUTTON */}
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsInfoModalOpen(true)} 
          style={styles.infoTriggerBtn}
        >
          <FaInfoCircle size={18} />
          <span>About Agmarknet & Farmcap</span>
        </motion.button>

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
              <div style={styles.infoModalHeader}>
                <button onClick={() => setIsInfoModalOpen(false)} style={styles.backBtnModal}>
                  <IoMdArrowBack size={24} color="#10b981" />
                </button>
                <h2 style={styles.infoModalTitle}>About & Legal</h2>
                <div style={{width: '40px'}}></div>
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
  );
};

const styles = {
  page: { 
    height: '100vh', 
    background: 'url("https://images.unsplash.com/photo-1504333638930-c8787321eee0?q=80&w=2070&auto=format&fit=crop") center/cover no-repeat', 
    color: '#e2e8f0', 
    fontFamily: '"Inter", -apple-system, sans-serif', 
    overflow: 'hidden', 
    display: 'flex', 
    flexDirection: 'column',
    position: 'relative'
  },
  pageOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(9, 9, 11, 0.85)', // Thick dark tint
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    zIndex: 0
  },
  header: { 
    padding: '20px', 
    background: 'rgba(9, 9, 11, 0.5)', 
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    position: 'relative',
    zIndex: 1
  },
  headerTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: '18px', margin: 0, fontWeight: '700', letterSpacing: '0.2px', color: '#ffffff' },
  subtitle: { fontSize: '12px', color: '#10b981', margin: '4px 0 0 0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' },
  iconBtn: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, color: '#f8fafc' },
  scrollContent: { flex: 1, overflowY: 'auto', padding: '20px', position: 'relative', zIndex: 1 },
  
  section: { marginBottom: '35px' },
  sectionHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' },
  sectionTitle: { fontSize: '13px', fontWeight: '700', margin: 0, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '1px' },
  
  categoryCard: { position: 'relative', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', marginBottom: '15px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.3)', backgroundSize: 'cover', backgroundPosition: 'center' },
  cardOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(9,9,11,0.95) 0%, rgba(9,9,11,0.6) 100%)', zIndex: 0 },
  cardContent: { position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '15px', width: '100%' },
  cardIconBox: { width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  cardTitleText: { fontSize: '15px', fontWeight: '700', color: '#ffffff', margin: 0 },
  
  // HOARDING STYLES
  hoardingContainer: { width: '100%', height: '180px', borderRadius: '16px', overflow: 'hidden', position: 'relative', marginBottom: '35px', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' },
  hoardingImage: { width: '100%', height: '100%', objectFit: 'cover' },
  hoardingOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(9,9,11,0.9) 0%, rgba(9,9,11,0.1) 100%)', display: 'flex', alignItems: 'center', padding: '20px' },
  hoardingText: { color: 'white', fontSize: '24px', fontWeight: '800', lineHeight: '1.2' },

  // BOOKSHELF STYLES
  bookshelfWrapper: { width: '100%', display: 'flex', flexDirection: 'column' },
  bookshelf: { width: '100%', overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', paddingBottom: '10px' },
  shelfBase: { height: '6px', width: '100%', background: '#27272a', borderRadius: '3px', marginTop: '5px' },
  book: { borderRadius: '12px', backgroundSize: 'cover', backgroundPosition: 'center', cursor: 'pointer', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.35)' },
  bookGlassOverlay: { width: '100%', height: '100%', background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.05) 45%, transparent 100%)', transition: 'background 0.3s' }, // Increased image brightness drastically
  navControls: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: '25px', padding: '0 10px' },
  navBtn: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', width: '45px', height: '45px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' },
  navIndicator: { color: '#cbd5e1', fontSize: '14px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' },
  closedBookSpine: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px', writingMode: 'vertical-rl', transform: 'rotate(180deg)' },
  spineText: { color: '#ffffff', fontWeight: '700', fontSize: '14px', letterSpacing: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textShadow: '0 2px 6px rgba(0,0,0,0.8)' },
  openBookContent: { width: '100%', height: '100%', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', boxSizing: 'border-box' },
  openBookTitle: { margin: '0 0 15px 0', color: 'white', fontSize: '18px', fontWeight: '700', lineHeight: '1.3', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  launchBtn: { background: '#10b981', color: '#09090b', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  
  newBadge: { position: 'absolute', top: '15px', right: '15px', background: '#ef4444', color: '#fff', fontSize: '9px', fontWeight: '800', padding: '4px 8px', borderRadius: '4px', letterSpacing: '0.5px' },
  
  infoTriggerBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', padding: '16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#a1a1aa', fontSize: '14px', fontWeight: '600', cursor: 'pointer', marginTop: '10px' },
  infoModalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 2000, display: 'flex', justifyContent: 'flex-end' },
  infoModalContent: { background: 'rgba(15, 15, 20, 0.9)', backdropFilter: 'blur(20px)', borderLeft: '1px solid rgba(255,255,255,0.1)', padding: '20px', width: '100%', maxWidth: '400px', height: '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', boxShadow: '-10px 0 30px rgba(0,0,0,0.5)' },
  infoModalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  infoModalTitle: { fontSize: '18px', fontWeight: '700', margin: 0, color: '#ffffff' },
  backBtnModal: { background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#f8fafc' },
  infoModalScroll: { flex: 1, overflowY: 'auto', paddingRight: '5px' },

  infoCard: { background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.1)' },
  cardHeader: { margin: '0 0 15px 0', fontSize: '14px', color: '#10b981', fontWeight: '700' },
  textBlock: { marginBottom: '15px' },
  highlightText: { fontSize: '12px', color: '#38bdf8', fontWeight: '600', display: 'block', marginBottom: '4px' },
  paragraph: { fontSize: '13px', color: '#a1a1aa', lineHeight: '1.6', margin: 0 },
  bulletList: { margin: '8px 0 0 0', paddingLeft: '20px', color: '#a1a1aa', fontSize: '13px' },
  bulletItem: { marginBottom: '6px', lineHeight: '1.5' },
  primaryLinkBtn: { background: '#10b981', color: '#09090b', border: 'none', padding: '12px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', width: '100%', marginTop: '10px' },
  secondaryLinkBtn: { background: 'rgba(255,255,255,0.1)', border: 'none', color: '#f8fafc', padding: '12px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', width: '100%', marginTop: '10px' },

  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(9,9,11,0.9)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  modalContent: { background: '#18181b', border: '1px solid #27272a', borderRadius: '20px', padding: '30px', width: '100%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' },
  modalTitle: { fontSize: '20px', fontWeight: '700', color: '#ffffff', margin: '0 0 10px 0' },
  modalText: { fontSize: '14px', color: '#a1a1aa', margin: '0 0 20px 0', lineHeight: '1.5' },
  modalReportName: { background: '#09090b', padding: '16px', borderRadius: '12px', fontSize: '14px', fontWeight: '600', color: '#10b981', marginBottom: '25px', border: '1px solid #27272a' },
  loaderLine: { width: '100%', height: '4px', background: '#27272a', borderRadius: '2px', overflow: 'hidden', marginBottom: '15px' },
  loaderFill: { height: '100%', background: '#10b981' },
  modalFooterText: { fontSize: '11px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600', margin: 0 },

  // NEW FULL PAGE OVERLAY STYLES
  fullPageOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(9,9,11,0.95)', backdropFilter: 'blur(20px)', zIndex: 500, display: 'flex', flexDirection: 'column', boxSizing: 'border-box' },
  fullPageHeader: { display: 'flex', alignItems: 'center', gap: '15px', padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  fullPageTitle: { fontSize: '18px', fontWeight: '700', color: '#fff', margin: 0 },
  fullPageContent: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px' }
};

export default MarketRates;