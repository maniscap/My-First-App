import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';

function Enquiry() {
  const [marketRates, setMarketRates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const q = collection(db, "market_rates");
        const querySnapshot = await getDocs(q);
        const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMarketRates(list);
        setLoading(false);
      } catch (error) {
        console.error("Error:", error);
        setLoading(false);
      }
    };
    fetchRates();
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <Link to="/" style={{ textDecoration: 'none', color: '#555' }}>⬅ Back to Home</Link>
      
      <h1 style={{ color: '#2E7D32', textAlign: 'center' }}>📢 Enquiry & Knowledge Hub</h1>

      <div style={cardStyle}>
        <h2>📈 Daily Market Rates (Live)</h2>
        
        {loading ? <p>⏳ Loading...</p> : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {marketRates.map((item) => (
              <div key={item.id} style={itemStyle}>
                
                {/* Left Side: Crop & Price */}
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 5px 0', color: '#2E7D32' }}>{item.crop}</h3>
                  <p style={{ margin: 0, fontWeight: 'bold', fontSize: '18px' }}>₹{item.price}</p>
                </div>

                {/* Middle: Location & Date */}
                <div style={{ flex: 1, fontSize: '14px', color: '#555' }}>
                  <p style={{ margin: '2px 0' }}>📍 {item.market}</p>
                  <p style={{ margin: '2px 0' }}>🏙️ {item.district}, {item.state}</p>
                  <p style={{ margin: '2px 0', fontSize: '12px', color: '#888' }}>📅 {item.date}</p>
                </div>

                {/* Right Side: Trend Icon */}
                <div style={{ textAlign: 'right' }}>
                  {item.trend === 'up' && <span style={{color: 'green', fontWeight: 'bold', fontSize: '14px'}}>📈 UP</span>}
                  {item.trend === 'down' && <span style={{color: 'red', fontWeight: 'bold', fontSize: '14px'}}>📉 DOWN</span>}
                  {item.trend === 'stable' && <span style={{color: 'grey', fontWeight: 'bold', fontSize: '14px'}}>➡️ STABLE</span>}
                </div>

              </div>
            ))}
          </div>
        )}
        
        {marketRates.length === 0 && !loading && <p>No updates yet.</p>}
      </div>

      <div style={cardStyle}>
        <h2>🎥 Video References</h2>
        <p style={{color:'#888'}}>Video guides coming soon...</p>
      </div>
    </div>
  );
}

// STYLES
const cardStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', marginBottom: '30px' };
const itemStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', borderBottom: '1px solid #eee', flexWrap: 'wrap', gap: '10px' };

export default Enquiry;