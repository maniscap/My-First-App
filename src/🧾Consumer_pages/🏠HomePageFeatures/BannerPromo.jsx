import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Sparkles, Tag, Gift, Search, Leaf } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ==========================================
// 1. DYNAMIC FULL-BLEED BANNER WIDGET (ZEPTO STYLE)
// ==========================================
export const BannerWidget = ({ 
  activeTab, 
  direction, 
  searchVal = '', 
  setSearchVal = () => {}, 
  isSearchFocused = false, 
  setIsSearchFocused = () => {} 
}) => {
  // Select sleek theme solid colors based on active tab to blend with tabs perfectly
  const getBannerBackground = () => {
    if (activeTab === 'AgriInsights') {
      return '#0EA5E9'; // Sky Blue (Solid)
    }
    if (activeTab === 'Agri commerce') {
      return '#0B0F19'; // Obsidian Gold / Night (Solid)
    }
    if (activeTab === 'tools and utils') {
      return '#0F172A'; // Winter Indigo / Slate (Solid)
    }
    return '#1A2E26'; // Farm Green (Solid)
  };

  return (
    <motion.div 
      animate={{ background: getBannerBackground() }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      style={{ 
        width: '100%', 
        height: '260px', /* Taller height, expanded to double size */
        margin: '0 0 20px 0', /* REMOVED TOP MARGIN: 0px below tabs to merge seamlessly without gap */
        padding: '0 15px', /* Elegant horizontal padding for inner content */
        boxSizing: 'border-box',
        position: 'relative', 
        overflow: 'hidden', 
        zIndex: 10,
        borderRadius: '0 0 24px 24px', /* Top corners are straight, bottom corners are curved */
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
      
      {/* COMPACT HALF-SIZE SEARCH BAR FOR MOBILE LAYOUT AT THE TOP */}
      <div style={{
        width: '90%',
        maxWidth: '320px', /* Not that big, just half size, perfect for mobile layout */
        boxSizing: 'border-box'
      }}>
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
          borderRadius: '10px',
          padding: '7px 12px',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
          color: '#ffffff',
          transition: 'all 0.3s ease',
          height: '34px',
          boxSizing: 'border-box'
        }}>
           <Search size={15} color="#ffffff" style={{ marginRight: '8px', opacity: 0.9, flexShrink: 0 }} />
           <input 
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#ffffff',
                fontSize: '13px',
                padding: 0,
                fontWeight: '600'
              }}
              placeholder={
                activeTab === 'AgriInsights' ? "Search news, subsidies..." :
                activeTab === 'Agri commerce' ? "Search machinery, workers..." :
                "Search GPS tools, radio..."
              }
           />
        </div>
      </div>
    </motion.div>
  );
};

// ==========================================
// 2. DEDICATED BANNER PROMO PAGE
// ==========================================
const BannerPromo = () => {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'Promotions';

  return (
    <div style={{ background: 'var(--bg-color)', minHeight: '100vh', color: 'var(--text-color)', fontFamily: '"Nunito", sans-serif', paddingBottom: '50px' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '20px', position: 'sticky', top: 0, background: 'var(--bg-color)', zIndex: 10 }}>
        <Link to="/Consumer_HomePage" style={{ color: 'var(--text-color)', textDecoration: 'none', display: 'flex', alignItems: 'center', marginRight: '15px' }}>
          <ArrowLeft size={24} />
        </Link>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>Promo & Features</h2>
      </div>
      
      <div style={{ padding: '0 20px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'linear-gradient(135deg, #F84464 0%, #FF7E95 100%)', borderRadius: '24px', padding: '30px 20px', color: 'white', boxShadow: '0 10px 25px rgba(248, 68, 100, 0.3)', marginBottom: '30px' }}>
           <Sparkles size={32} style={{ marginBottom: '10px' }} />
           <h1 style={{ margin: '0 0 10px 0', fontSize: '28px', fontWeight: '900' }}>Exclusive {tab} Offers</h1>
           <p style={{ margin: 0, fontSize: '15px', opacity: 0.9, lineHeight: '1.5' }}>Explore all the newly added features and limited time promotions tailored just for you.</p>
        </motion.div>

        <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '15px' }}>Current Highlights</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
           <PromoCard icon={<Tag size={24} color="#10B981" />} title="50% Off First Delivery" desc="Valid on all Farm Fresh orders placed this week." color="#E6F7F1" />
           <PromoCard icon={<Gift size={24} color="#0EA5E9" />} title="Free Expert Consultation" desc="Ask our agronomists any questions for free using ChatBot." color="#E0F2FE" />
        </div>
      </div>
    </div>
  );
};

const PromoCard = ({ icon, title, desc, color }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'var(--card-color)', padding: '20px', borderRadius: '18px', border: '1px solid var(--border-color)', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}><div style={{ width: '50px', height: '50px', borderRadius: '14px', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</div><div><h4 style={{ margin: '0 0 5px 0', fontSize: '16px', fontWeight: '800' }}>{title}</h4><p style={{ margin: 0, fontSize: '13px', color: 'var(--subtle-text)', lineHeight: '1.4' }}>{desc}</p></div></div>
);
export default BannerPromo;