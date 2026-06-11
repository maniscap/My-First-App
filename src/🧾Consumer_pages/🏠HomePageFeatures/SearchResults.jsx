import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, getDocs, query as firebaseQuery, limit, where } from 'firebase/firestore';

function SearchResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const query = new URLSearchParams(location.search).get('q')?.toLowerCase() || '';

  // 1. GET USER LOCATION (For 50km Filter)
  const userLat = parseFloat(localStorage.getItem('userLat'));
  const userLng = parseFloat(localStorage.getItem('userLng'));
  const userLocName = localStorage.getItem('userLocation') || 'your location';

  // 2. HAVERSINE FORMULA
  const getDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 9999;
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; 
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch from ALL correct collections with limits to save costs (Strategy D)
        const freshSnap = await getDocs(firebaseQuery(collection(db, "listings_farm_fresh"), limit(45)));
        const machSnap = await getDocs(firebaseQuery(collection(db, "listings_machinery"), limit(45)));
        const workSnap = await getDocs(firebaseQuery(collection(db, "listings_workers"), limit(45)));
        const busSnap = await getDocs(firebaseQuery(collection(db, "listings_business"), limit(45)));
        const goodsSnap = await getDocs(firebaseQuery(collection(db, "listings_local_goods"), limit(45)));

        const allItems = [
          ...freshSnap.docs.map(d => ({ ...d.data(), type: 'Farm Fresh', id: d.id })),
          ...machSnap.docs.map(d => ({ ...d.data(), type: 'Machinery', id: d.id })),
          ...workSnap.docs.map(d => ({ ...d.data(), type: 'Worker', id: d.id })),
          ...busSnap.docs.map(d => ({ ...d.data(), type: 'Business', id: d.id })),
          ...goodsSnap.docs.map(d => ({ ...d.data(), type: 'Local Goods', id: d.id }))
        ];

        // Fetch frozen sellers to filter out their listings
        const frozenSnap = await getDocs(firebaseQuery(collection(db, "seller_applications"), where("frozen", "==", true)));
        const frozenSellerIds = new Set(frozenSnap.docs.map(d => d.data().sellerId));

        // FILTER: (Name Match) AND (Distance < 50km) AND (Not Frozen)
        const filtered = allItems.filter(item => {
          if (frozenSellerIds.has(item.sellerId)) return false;

          // 1. Text Match
          const nameMatch = (item.cropName || item.machineName || item.productName || item.businessName || item.role || item.crop || item.name || item.item || '').toLowerCase().includes(query);
          
          // 2. Distance Match
          let distanceMatch = true;
          if (userLat && userLng && item.lat && item.lng) {
            const dist = getDistance(userLat, userLng, item.lat, item.lng);
            if (dist > 50) distanceMatch = false;
          }

          return nameMatch && distanceMatch;
        });

        setResults(filtered);
      } catch (e) { console.error(e); }
      setLoading(false);
    };

    fetchData();
  }, [query]);

  return (
    <div style={pageStyle}>
      <div style={contentContainer}>
        <div style={{display:'flex', alignItems:'center', marginBottom:'20px'}}>
           <Link to="/Consumer_HomePage" style={backBtn}>⬅</Link>
           <h2 style={{margin:0, color:'white', marginLeft:'10px'}}>Results for "{query}"</h2>
        </div>
        
        <div style={filterBadge}>
           📍 Near <strong>{userLocName}</strong> (within 50km)
        </div>

        {loading ? <p style={{color:'white', textAlign:'center'}}>Searching nearby...</p> : 
          results.length > 0 ? results.map(item => (
            <div key={item.id} style={glassItem}>
               {/* TYPE BADGE */}
               <span style={typeBadge(item.type)}>{item.type}</span>
               
               <div style={{flex: 1}}>
                 <h3 style={{ margin: '0 0 5px 0', color: '#fff' }}>{item.crop || item.name || item.item}</h3>
                 <p style={{fontSize: '13px', margin:'2px 0', color:'#ddd'}}>
                   {item.qty ? `Qty: ${item.qty} • ` : ''} 
                   <span style={{color:'lightgreen'}}>₹{item.price || item.rate}</span>
                 </p>
                 <p style={{ fontSize: '11px', color: '#aaa' }}>📍 {item.location}</p>
                 <a href={`tel:${item.phone}`} style={callBtn}>📞 Call</a>
               </div>
            </div>
          )) : (
            <div style={{textAlign:'center', color:'white', opacity:0.7, marginTop:'50px'}}>
              <p>No results found for "{query}" near your location.</p>
              <p style={{fontSize:'12px'}}>Try changing your location in Consumer_HomePage or search for something else.</p>
            </div>
          )
        }
      </div>
    </div>
  );
}

// STYLES
const pageStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: '#111', overflowY: 'auto' };
const contentContainer = { padding: '20px', maxWidth: '800px', margin: '0 auto', paddingBottom: '100px' };
const backBtn = { textDecoration:'none', fontSize:'24px', color:'white' };
const filterBadge = { textAlign:'center', marginBottom:'20px', color:'lightgreen', fontSize:'13px', background:'rgba(255,255,255,0.1)', padding:'8px', borderRadius:'15px' };
const glassItem = { backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255,255,255,0.2)', padding: '15px', borderRadius: '15px', display: 'flex', alignItems: 'center', marginBottom:'15px', position:'relative' };
const callBtn = { textDecoration: 'none', padding: '8px 15px', backgroundColor: '#28a745', color: 'white', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', display:'inline-block', marginTop:'5px' };
const typeBadge = (type) => ({ position:'absolute', top:'10px', right:'10px', fontSize:'10px', background: type==='Service'?'#2196F3':type==='Crop'?'#E65100':'#2E7D32', color:'white', padding:'3px 8px', borderRadius:'10px' });

export default SearchResults;