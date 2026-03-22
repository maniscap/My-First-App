import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { IoMdArrowBack, IoMdClose } from 'react-icons/io';
import { FaFileInvoice, FaChartArea, FaMapMarkerAlt, FaShieldAlt, FaExternalLinkAlt, FaInfoCircle, FaChevronDown, FaRegFileAlt, FaChartLine } from 'react-icons/fa';

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

const CollapsibleGroup = ({ title, icon, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div style={styles.subSection}>
      <div 
        style={{...styles.subSectionTitle, cursor: 'pointer', margin: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', userSelect: 'none'}} 
        onClick={() => setIsOpen(!isOpen)}
      >
        <div style={{display: 'flex', alignItems: 'center'}}>
          {icon} <span style={{marginLeft: '8px'}}>{title}</span>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <FaChevronDown color="#9ca3af" size={14} />
        </motion.div>
      </div>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: 'auto', opacity: 1, marginTop: '15px' }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{ overflow: 'hidden' }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MarketRates = () => {
  const navigate = useNavigate();
  const [transitionState, setTransitionState] = useState({ isActive: false, reportName: "" });
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

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
                <FaShieldAlt size={50} color="#34d399" style={{ marginBottom: '15px' }}/>
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

      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.headerTop}>
          <button onClick={() => navigate('/agri-insights')} style={styles.iconBtn}>
            <IoMdArrowBack size={28} color="#34d399"/>
          </button>
          <div style={{textAlign:'center'}}>
            <h1 style={styles.title}>Mandi Navigator</h1>
            <p style={styles.subtitle}>Direct Agmarknet Access</p>
          </div>
          <div style={{width: '28px'}}></div> {/* Spacer for alignment */}
        </div>
      </div>

      <div style={styles.scrollContent}>
        
        {/* SECTION 1: PRICE & ARRIVAL REPORTS */}
        <motion.div variants={containerVariants} initial="hidden" animate="show" style={styles.section}>
          <div style={styles.sectionHeader}>
            <FaFileInvoice size={20} color="#34d399" />
            <h2 style={styles.sectionTitle}>Prices & Arrival Reports</h2>
          </div>
          {MARKET_REPORTS.map((group, idx) => (
            <CollapsibleGroup key={`market-${idx}`} title={group.title} icon={group.icon} defaultOpen={false}>
              <motion.div variants={containerVariants} initial="hidden" animate="show" style={styles.grid}>
                {group.items.map((item, i) => (
                  <motion.div 
                    variants={itemVariants} 
                    key={i} 
                    style={styles.card}
                    whileHover={{ scale: 1.02, borderColor: 'rgba(52, 211, 153, 0.6)', boxShadow: '0 10px 20px rgba(52, 211, 153, 0.15)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleLinkClick(item)}
                  >
                    <div style={styles.cardContent}>
                      <div style={styles.iconBoxMarket}>
                        <FaRegFileAlt size={16} />
                      </div>
                      <span style={styles.cardText}>{item.name}</span>
                      {item.isNew && <span style={styles.newBadge}>NEW</span>}
                    </div>
                    <div style={styles.arrowIconBox}>
                      <FaExternalLinkAlt size={12} color="rgba(255,255,255,0.5)" />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </CollapsibleGroup>
          ))}
        </motion.div>

        {/* SECTION 2: PRICE TREND REPORTS */}
        <motion.div variants={containerVariants} initial="hidden" animate="show" style={styles.section}>
          <div style={styles.sectionHeader}>
            <FaChartArea size={20} color="#60a5fa" />
            <h2 style={styles.sectionTitle}>Price Trend Reports</h2>
          </div>
          
          {TREND_REPORTS.map((group, idx) => (
            <CollapsibleGroup key={`trend-${idx}`} title={group.category} icon={group.icon} defaultOpen={false}>
              <motion.div variants={containerVariants} initial="hidden" animate="show" style={styles.grid}>
                {group.items.map((item, i) => (
                  <motion.div 
                    variants={itemVariants} 
                    key={i} 
                    style={styles.card}
                    whileHover={{ scale: 1.02, borderColor: 'rgba(96, 165, 250, 0.6)', boxShadow: '0 10px 20px rgba(96, 165, 250, 0.15)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleLinkClick(item)}
                  >
                    <div style={styles.cardContent}>
                      <div style={styles.iconBoxTrend}>
                        <FaChartLine size={16} />
                      </div>
                      <span style={styles.cardText}>{item.name}</span>
                    </div>
                    <div style={styles.arrowIconBox}>
                      <FaExternalLinkAlt size={12} color="rgba(255,255,255,0.5)" />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </CollapsibleGroup>
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
                  <IoMdArrowBack size={24} color="#34d399" />
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
    background: 'radial-gradient(circle at top right, #0f172a, #000000)', 
    color: '#fff', 
    fontFamily: '"Inter", sans-serif', 
    overflow: 'hidden', 
    display: 'flex', 
    flexDirection: 'column' 
  },
  header: { 
    padding: '20px', 
    background: 'rgba(15, 23, 42, 0.6)', 
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(255,255,255,0.05)' 
  },
  headerTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: '20px', margin: 0, fontWeight: '800', letterSpacing: '0.5px' },
  subtitle: { fontSize: '12px', color: '#34d399', margin: '4px 0 0 0', fontWeight: '600', textTransform: 'uppercase' },
  iconBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: 0 },
  scrollContent: { flex: 1, overflowY: 'auto', padding: '20px' },
  
  section: { marginBottom: '40px' },
  sectionHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' },
  sectionTitle: { fontSize: '18px', fontWeight: '700', margin: 0 },
  
  subSection: { marginBottom: '25px', background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' },
  subSectionTitle: { fontSize: '14px', fontWeight: '600', color: '#e5e7eb', margin: '0 0 15px 0', display: 'flex', alignItems: 'center' },
  
  grid: { display: 'grid', gridTemplateColumns: '1fr', gap: '12px' },
  card: { 
    background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.7) 100%)', 
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.05)', 
    borderRadius: '16px', 
    padding: '16px', 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    cursor: 'pointer',
    boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
    transition: 'border-color 0.2s ease'
  },
  cardContent: { display: 'flex', alignItems: 'center', gap: '15px', flex: 1, paddingRight: '15px' },
  cardText: { fontSize: '14px', fontWeight: '500', color: '#f8fafc', lineHeight: '1.4', letterSpacing: '0.3px' },
  newBadge: { background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', color: '#fff', fontSize: '9px', fontWeight: '800', padding: '3px 8px', borderRadius: '6px', letterSpacing: '0.5px', boxShadow: '0 2px 4px rgba(239, 68, 68, 0.4)' },
  iconBoxMarket: { width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(52, 211, 153, 0.2)' },
  iconBoxTrend: { width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(96, 165, 250, 0.15)', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(96, 165, 250, 0.2)' },
  arrowIconBox: { width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  
  infoTriggerBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', padding: '16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#e5e7eb', fontSize: '15px', fontWeight: '600', cursor: 'pointer', marginTop: '10px' },
  infoModalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: '#0f172a', zIndex: 2000, display: 'flex', justifyContent: 'center' },
  infoModalContent: { background: '#0f172a', padding: '20px', width: '100%', maxWidth: '800px', height: '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' },
  infoModalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.05)' },
  infoModalTitle: { fontSize: '18px', fontWeight: '700', margin: 0, color: '#f8fafc' },
  backBtnModal: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  infoModalScroll: { flex: 1, overflowY: 'auto', paddingRight: '5px' },

  infoCard: { background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', marginBottom: '15px' },
  cardHeader: { margin: '0 0 15px 0', fontSize: '14px', color: '#34d399', fontWeight: '700', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' },
  textBlock: { marginBottom: '12px' },
  highlightText: { fontSize: '12px', color: '#60a5fa', fontWeight: '600', display: 'block', marginBottom: '4px' },
  paragraph: { fontSize: '11px', color: '#9ca3af', lineHeight: '1.6', margin: 0 },
  bulletList: { margin: '8px 0 0 0', paddingLeft: '20px', color: '#9ca3af', fontSize: '12px' },
  bulletItem: { marginBottom: '6px', lineHeight: '1.5' },
  primaryLinkBtn: { background: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.3)', color: '#34d399', padding: '10px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', width: '100%', marginTop: '10px' },
  secondaryLinkBtn: { background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af', padding: '10px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', width: '100%', marginTop: '10px' },

  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  modalContent: { background: '#0f172a', border: '1px solid rgba(52, 211, 153, 0.3)', borderRadius: '24px', padding: '30px', width: '100%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' },
  modalTitle: { fontSize: '20px', fontWeight: '800', color: '#fff', margin: '0 0 10px 0' },
  modalText: { fontSize: '13px', color: '#9ca3af', margin: '0 0 15px 0', lineHeight: '1.5' },
  modalReportName: { background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', color: '#34d399', marginBottom: '25px', border: '1px solid rgba(52, 211, 153, 0.2)' },
  loaderLine: { width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden', marginBottom: '15px' },
  loaderFill: { height: '100%', background: '#34d399' },
  modalFooterText: { fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700', margin: 0 }
};

export default MarketRates;