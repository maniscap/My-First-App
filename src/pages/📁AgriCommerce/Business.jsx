import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';

function Business() {
  const [bgImage, setBgImage] = useState('');
  const dayBg = 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2940&auto=format&fit=crop';
  const nightBg = 'https://images.unsplash.com/photo-1504333638930-c8787321eee0?q=80&w=2070&auto=format&fit=crop';

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 18 || hour < 6) setBgImage(nightBg);
    else setBgImage(dayBg);
  }, []);

  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // User Location State
  const [userLat, setUserLat] = useState(null);
  const [userLng, setUserLng] = useState(null);
  const [userLocName, setUserLocName] = useState('');

  // 1. Get User Location (From Dashboard Memory)
  useEffect(() => {
    const lat = localStorage.getItem('userLat');
    const lng = localStorage.getItem('userLng');
    const name = localStorage.getItem('userLocation');
    if (lat && lng) {
      setUserLat(parseFloat(lat));
      setUserLng(parseFloat(lng));
    }
    if (name && name !== 'Select Location') {
      setUserLocName(name);
    }
  }, []);

  // 2. Fetch Data
  useEffect(() => {
    const fetchCrops = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "crops"));
        const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCrops(list);
        setLoading(false);
      } catch (error) { console.error("Error:", error); setLoading(false); }
    };
    fetchCrops();
  }, []);

  // 3. HYBRID FILTER (GPS Radius OR Name Match)
  const filteredCrops = crops.filter(item => {
    // If no user location set, show everything
    if (!userLocName && !userLat) return true;

    const itemLocString = typeof item.location === 'object' ? `${item.location.locality || ''}, ${item.location.city || ''}` : item.location || '';

    // CHECK 1: Distance (Priority)
    if (userLat && userLng && item.lat && item.lng) {
      const R = 6371; // Earth radius km
      const dLat = (item.lat - userLat) * Math.PI / 180;
      const dLon = (item.lng - userLng) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(userLat * Math.PI / 180) * Math.cos(item.lat * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const dist = R * c;
      if (dist <= 50) return true; // Keep if within 50km
    }

    // CHECK 2: Name Match (Fallback)
    if (userLocName && itemLocString) {
      const u = userLocName.toLowerCase();
      const i = itemLocString.toLowerCase();
      if (i.includes(u) || u.includes(i)) return true;
    }

    return false;
  });

  // 4. ACTION HANDLERS
  const openDirections = (lat, lng) => {
    if (lat && lng) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    } else {
      alert("Seller has not provided GPS coordinates.");
    }
  };

  const openWhatsApp = (item) => {
    const phone = item.sellerContact || item.phone;
    const seller = item.sellerName || item.seller || 'Seller';
    const title = item.title || item.crop || 'crop';
    const qty = item.quantity || item.qty || '';
    const price = item.price || item.rate || 'negotiable';
    const qtyText = qty ? `*${qty} of ${title}*` : `*${title}*`;
    const msg = `Hi ${seller}, I am interested in buying ${qtyText} (₹${price}). My location is *${userLocName || "nearby"}*. Can we discuss delivery?`;
    
    if (!phone) {
       alert("Seller contact number not provided.");
       return;
    }
    window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div style={{...pageStyle, backgroundImage: `url('${bgImage}')`}}>
      <div style={contentContainer}>
        <Link to="/dashboard" style={backLink}>⬅ Dashboard</Link>
        <h1 style={titleStyle}>💰 Business Zone</h1>
        
        {userLocName && (
          <div style={filterBadge}>
            📍 Showing results for: <strong>{userLocName}</strong>
          </div>
        )}

        {/* SELLER REDIRECT BANNER */}
        <div style={sellerBanner}>
            <div>
                <div style={{fontWeight: 'bold', fontSize: '14px', marginBottom: '4px'}}>Want to sell your harvest?</div>
                <div style={{fontSize: '12px', opacity: 0.9}}>List your bulk crops in the Seller Profile.</div>
            </div>
            <Link to="/profile" style={sellerBtn}>Go to Profile ➔</Link>
        </div>

            <div style={{ display: 'grid', gap: '15px' }}>
              {loading ? <p style={{textAlign:'center', color:'white'}}>⏳ Loading Market...</p> : 
                filteredCrops.length > 0 ? (
                  filteredCrops.map((item) => (
                    <div key={item.id} style={glassItem}>
                  {item.image || item.photo ? (<img src={item.image || item.photo} alt="Crop" style={itemImg} />) : (<div style={placeholderImg}>🌾</div>)}
                      <div style={{flex: 1}}>
                    <h3 style={{ margin: '0 0 5px 0', color: '#FBC02D' }}>{item.title || item.crop}</h3>
                    <p style={{fontSize: '13px', margin:'2px 0'}}>
                        {(item.quantity || item.qty) ? `Qty: ${item.quantity || item.qty} • ` : ''}
                        <span style={{color:'lightgreen'}}>₹{item.price || item.rate}</span>
                    </p>
                    {item.grade && <p style={{ fontSize: '11px', color: '#aaa', margin: '2px 0' }}>Grade: {item.grade}</p>}
                    <p style={{ fontSize: '11px', color: '#ddd' }}>
                        📍 {typeof item.location === 'object' ? `${item.location.locality || ''}, ${item.location.city || ''}` : item.location}
                    </p>
                        <div style={{marginTop:'8px', display:'flex', gap:'8px'}}>
                           <button onClick={() => openDirections(item.lat, item.lng)} style={smallActionBtn}>📍 Direct</button>
                           <button onClick={() => openWhatsApp(item)} style={smallActionBtn}>💬 Chat</button>
                        </div>
                      </div>
                  <a href={`tel:${item.sellerContact || item.phone}`} style={callBtn}>📞</a>
                    </div>
                  ))
                ) : (
                  <div style={{textAlign:'center', color:'white', opacity:0.7, padding:'20px'}}>
                    <p>No crops found near <strong>{userLocName}</strong>.</p>
                    <button onClick={() => setUserLocName('')} style={resetBtn}>🌍 Show All</button>
                  </div>
                )
              }
            </div>
      </div>
    </div>
  );
}

// STYLES
const pageStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: 'black', overflowY: 'auto' };
const contentContainer = { padding: '20px', maxWidth: '800px', margin: '0 auto', paddingBottom: '100px', paddingTop: '20px' };
const backLink = { color: 'white', textDecoration: 'none', fontSize: '14px', background: 'rgba(0,0,0,0.5)', padding: '8px 15px', borderRadius: '20px', backdropFilter: 'blur(5px)' };
const titleStyle = { color: 'white', textAlign: 'center', marginTop: '15px', textShadow: '0 2px 4px rgba(0,0,0,0.8)', fontWeight: '900', marginBottom: '10px' };
const filterBadge = { textAlign:'center', marginBottom:'15px', color:'lightgreen', fontSize:'13px', background:'rgba(0,0,0,0.6)', padding:'5px 10px', borderRadius:'15px', display:'inline-block' };
const glassCard = { backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: '20px', borderRadius: '20px', marginBottom: '20px', boxShadow: '0 8px 32px 0 rgba(0,0,0,0.3)' };
const glassItem = { backgroundColor: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', padding: '12px', borderRadius: '15px', display: 'flex', alignItems: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', color: 'white' };
const itemImg = { width:'80px', height:'80px', borderRadius:'10px', objectFit:'cover', marginRight:'15px', border:'1px solid rgba(255,255,255,0.5)' };
const placeholderImg = { width:'80px', height:'80px', borderRadius:'10px', background:'rgba(255,255,255,0.1)', marginRight:'15px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'30px' };
const callBtn = { textDecoration: 'none', padding: '10px', backgroundColor: '#28a745', color: 'white', borderRadius: '50%', fontSize: '18px', width:'40px', height:'40px', display:'flex', alignItems:'center', justifyContent:'center', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', marginLeft: '10px' };
const smallActionBtn = { padding: '5px 10px', fontSize: '11px', borderRadius: '15px', border: 'none', background: 'rgba(255,255,255,0.2)', color: 'white', cursor: 'pointer' };
const resetBtn = { padding:'8px 15px', marginTop:'10px', borderRadius:'20px', border:'none', cursor:'pointer', background:'white', color:'black', fontWeight:'bold' };
const sellerBanner = { background: 'rgba(251, 192, 45, 0.15)', border: '1px solid rgba(251, 192, 45, 0.4)', borderRadius: '16px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', color: 'white', backdropFilter: 'blur(5px)' };
const sellerBtn = { background: '#FBC02D', color: '#000', padding: '10px 16px', borderRadius: '12px', textDecoration: 'none', fontWeight: 'bold', fontSize: '13px', boxShadow: '0 4px 10px rgba(251, 192, 45, 0.3)', flexShrink: 0, marginLeft: '10px' };

export default Business;