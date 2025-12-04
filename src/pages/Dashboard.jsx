import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Dashboard() {
  // --- BACKGROUND ---
  const [bgImage, setBgImage] = useState('');
  const dayBg = 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2940&auto=format&fit=crop';
  const nightBg = 'https://images.unsplash.com/photo-1652454159675-11ead6275680?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 18 || hour < 6) setBgImage(nightBg);
    else setBgImage(dayBg);
  }, []);

  // --- LOCATION STATE ---
  const userLocation = "Pune, India";
  const [showLocModal, setShowLocModal] = useState(false);
  const [manualInput, setManualInput] = useState('');

  const saveManualLocation = () => { setShowLocModal(false); };

  return (
    <div style={{...pageStyle, backgroundImage: `url('${bgImage}')`}}>
      
      {/* --- HEADER --- */}
      <div style={headerWrapper}>
        <div style={topRow}>
           <div style={locationClickableArea} onClick={() => setShowLocModal(true)}>
              <div style={{fontSize:'22px', fontWeight:'800', color:'white', lineHeight:'1'}}>Home</div>
              <div style={{color:'rgba(255,255,255,0.8)', fontSize:'13px', marginTop:'4px', display:'flex', alignItems:'center'}}>📍 {userLocation}</div>
           </div>
           <Link to="/profile" style={profileCircle}><span style={{fontSize:'26px'}}>🧢</span></Link>
        </div>
        <div style={searchBar}>
           <span style={{fontSize:'18px', color:'rgba(255,255,255,0.6)'}}>🔍</span>
           <input type="text" placeholder="Search 'tractors' or 'rice'..." style={searchInput}/>
        </div>
      </div>

      {/* --- HERO TITLE --- */}
      <div style={heroSection}>
        <h1 style={fadedHeroTitle}>Growing Smarter Together</h1>
      </div>

      {/* --- BENTO GRID (Pro Layout: Top Text & White Right Icons) --- */}
      <div style={bentoGrid}>
        
        {/* Row 1, Left: Agri-Insights */}
        <Link to="/agri-insights" style={cardLink}>
           <div className="glass-card" style={{...cardStyle, backgroundImage: "url('https://img.freepik.com/premium-photo/hand-holding-plant-with-sun-it_1174726-1291.jpg')"}}>
              <div style={cardTopOverlay}>
                 {/* Left Side Text */}
                 <div>
                    <h3 style={cardTitle}>Agri-Insights</h3>
                    <p style={cardSubtitle}>Rates & Guides</p>
                 </div>
                 {/* Right Side White Icon (Chart) */}
                 <div style={whiteIconBox}>
                   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                 </div>
              </div>
           </div>
        </Link>

        {/* Row 1, Right: Service Hub */}
        <Link to="/service" style={cardLink}>
           <div className="glass-card" style={{...cardStyle, backgroundImage: "url('https://th.bing.com/th/id/R.e2c73dbf8a8f512a95ee3a2ec35f5d72?rik=DuUew48QLbwHzw&riu=http%3a%2f%2fvnmanpower.com%2fupload_images%2fimages%2fall%2ffarm-workers-from-vmst.jpg&ehk=s1NXBhEe0wVXkZGBnlrnXcEoGY1R4UtFvQ9kW7HVQ0Y%3d&risl=&pid=ImgRaw&r=0')"}}>
              <div style={cardTopOverlay}>
                 <div>
                    <h3 style={cardTitle}>Service Hub</h3>
                    <p style={cardSubtitle}>Machinery&Workers</p>
                 </div>
                 {/* Right Side White Icon (Tractor replacement - Gears) */}
                 <div style={whiteIconBox}>
                   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"/><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M12 2v2"/><path d="M12 22v-2"/><path d="m17 7-1.4-1.4"/><path d="M19.4 17 18 15.6"/><path d="M22 12h-2"/><path d="M4 12H2"/><path d="m17 17-1.4 1.4"/><path d="M19.4 7 18 8.4"/><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"/></svg>
                 </div>
              </div>
           </div>
        </Link>

        {/* Row 2, Left: Business Zone */}
        <Link to="/business" style={cardLink}>
           <div className="glass-card" style={{...cardStyle, backgroundImage: "url('https://www.deere.ca/assets/images/region-4/products/harvesting/cornhead-R4A057928_RRD_1-1920x1080.jpg')"}}>
              <div style={cardTopOverlay}>
                 <div>
                    <h3 style={cardTitle}>Business Zone</h3>
                    <p style={cardSubtitle}>Sell Harvest</p>
                 </div>
                 {/* Right Side White Icon (Money Bag) */}
                 <div style={whiteIconBox}>
                   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22v-10"/></svg>
                 </div>
              </div>
           </div>
        </Link>

        {/* Row 2, Right: Farm Fresh */}
        <div className="glass-card" style={{...cardStyle, backgroundImage: "url('https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=500')"}}>
           <div style={cardTopOverlay}>
              <div>
                 <h3 style={cardTitle}>Farm Fresh</h3>
                 <p style={cardSubtitle}>Agri Products</p>
              </div>
              {/* Right Side White Icon (Basket) */}
              <div style={whiteIconBox}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 11-1 9"/><path d="m19 11-4-7"/><path d="M2 11h20"/><path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.7-7.4"/><path d="M4.5 15.5h15"/><path d="m5 11 4-7"/><path d="m9 11 1 9"/></svg>
              </div>
           </div>
        </div>

        {/* Row 3: WIDE WEATHER CARD */}
        <div className="glass-card" style={{...wideCardStyle, backgroundImage: "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800')"}}>
           <div style={cardTopOverlay}>
               <div>
                  <h3 style={{...cardTitle, margin:0}}>Crop Weather</h3>
                  <p style={cardSubtitle}>28°C, Rain: 40%, Humidity: 65%</p>
               </div>
               {/* Right Side White Icon (Sun/Cloud) */}
               <div style={whiteIconBox}>
                 <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M20 12h2"/><path d="m19.07 4.93-1.41 1.41"/><path d="M15.947 12.65a4 4 0 0 0-5.925-4.128"/><path d="M13 22H7a4 4 0 1 1 0-8h1"/></svg>
               </div>
           </div>
        </div>

      </div>

      {/* Modal */}
      {showLocModal && (
        <div style={modalOverlay}>
          <div style={modalCard}>
            <h3>📍 Set Location</h3>
            <input type="text" placeholder="Enter City / Village" style={inputStyle} onChange={(e) => setManualInput(e.target.value)} />
            <button onClick={saveManualLocation} style={saveBtn}>Update</button>
            <button onClick={() => setShowLocModal(false)} style={closeBtn}>Close</button>
          </div>
        </div>
      )}

    </div>
  );
}

// --- STYLES ---
const pageStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: 'black', overflowY: 'auto' };
const headerWrapper = { padding: '25px 20px 0 20px' };
const topRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' };
const locationClickableArea = { display:'flex', flexDirection:'column', justifyContent:'center', cursor: 'pointer' };
const profileCircle = { width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.25)' };
const searchBar = { background: 'rgba(0, 0, 0, 0.2)', backdropFilter: 'blur(10px)', borderRadius: '12px', padding: '12px 15px', display: 'flex', alignItems: 'center', border: '1px solid rgba(255,255,255,0.1)' };
const searchInput = { border: 'none', outline: 'none', background: 'transparent', marginLeft: '10px', fontSize: '16px', width: '100%', color: 'white', '::placeholder': { color: 'rgba(255,255,255,0.5)' } };

const heroSection = { padding: '0 20px', marginTop: '25px', marginBottom: '20px' };
const fadedHeroTitle = { fontSize: '1.2rem', margin: 1.0, fontWeight: '800', letterSpacing: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', background: 'linear-gradient(to right, #ffffff 0%, #e0e0e0 50%, rgba(255,255,255,0.2) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block', textTransform: 'uppercase' };

const bentoGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: '0 20px 100px 20px' };
const cardLink = { textDecoration: 'none', color: 'white', display: 'block' };

const cardStyle = { borderRadius: '18px', height: '185px', position: 'relative', overflow: 'hidden', backgroundSize: 'cover', backgroundPosition: 'center', border: '1px solid rgba(255,255,255,0.15)' };
const wideCardStyle = { gridColumn: 'span 2', height: '180px', borderRadius: '18px', position: 'relative', overflow: 'hidden', backgroundSize: 'cover', backgroundPosition: 'center', border: '1px solid rgba(255,255,255,0.15)' };

// UPDATED: Top Overlay to hold Text (Left) and Icon (Right)
const cardTopOverlay = { position: 'absolute', top: 0, left: 0, width: '100%', padding: '15px', background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%)', color: 'white', textAlign: 'left', boxSizing: 'border-box', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 1 };

// NEW: White Icon Style
const whiteIconBox = {  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' };

const cardTitle = { margin: '0 0 4px 0', fontSize: '17px', fontWeight: '700', textShadow: '0 2px 4px rgba(0,0,0,0.5)' };
const cardSubtitle = { margin: 0, fontSize: '13px', opacity: 0.9, fontWeight: '500', textShadow: '0 1px 2px rgba(0,0,0,0.5)' };

const modalOverlay = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalCard = { background: 'white', padding: '20px', borderRadius: '15px', width: '80%', maxWidth: '300px', textAlign: 'center', color: 'black' };
const inputStyle = { padding: '10px', width: '100%', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing:'border-box' };
const saveBtn = { padding: '10px', background: '#2E7D32', color: 'white', border: 'none', borderRadius: '5px', width: '100%', marginBottom: '5px' };
const closeBtn = { background: 'none', border: '1px solid black', color: 'black', padding: '5px 10px', marginTop:'10px', cursor: 'pointer', borderRadius:'5px' };

export default Dashboard;