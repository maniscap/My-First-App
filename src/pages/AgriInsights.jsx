import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

function AgriInsights() {
  const [marketRates, setMarketRates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Data (Books/Videos) omitted for brevity, paste your arrays here if needed or keep them in your file.
  // I will keep the fetch logic.
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const q = collection(db, "market_rates"); 
        const querySnapshot = await getDocs(q);
        const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMarketRates(list);
        setLoading(false);
      } catch (error) { console.error("Error:", error); setLoading(false); }
    };
    fetchRates();
  }, []);

  return (
    // Padding Top 100px to clear the fixed header
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', paddingBottom: '80px', paddingTop: '100px' }}>
      
      <Link to="/dashboard" style={backLink}>⬅ Dashboard</Link>
      
      <h1 style={titleStyle}>📊 Agri-Insights</h1>

      <div style={glassCard}>
        <h2 style={headerStyle}>📈 Daily Market Rates</h2>
        {loading ? <p style={{textAlign:'center', color:'white'}}>⏳ Loading...</p> : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {marketRates.map((item) => (
              <div key={item.id} style={itemStyle}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0', color: '#1B5E20', fontSize: '20px' }}>{item.crop}</h3>
                  <p style={{ fontWeight: 'bold' }}>₹{item.price}</p>
                </div>
                <div style={{ fontSize: '12px', color: '#555' }}>
                  <p>📍 {item.market}</p>
                  <p>📅 {item.date}</p>
                </div>
                <div>{item.trend}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Add your Books/Videos sections here using same style */}
    </div>
  );
}

// STYLES
const backLink = { color: 'white', textDecoration: 'none', fontSize: '14px', background: 'rgba(0,0,0,0.5)', padding: '8px 15px', borderRadius: '20px', backdropFilter: 'blur(5px)' };
const titleStyle = { color: 'white', textAlign: 'center', marginTop: '20px', textShadow: '0 2px 4px rgba(0,0,0,0.8)', fontWeight: '900' };
const glassCard = { backgroundColor: 'rgba(255, 255, 255, 0.85)', padding: '20px', borderRadius: '20px', marginBottom: '30px', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)' };
const headerStyle = { borderBottom: '2px solid #1B5E20', paddingBottom: '10px', color: '#1B5E20', marginTop: 0 };
const itemStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', borderBottom: '1px solid #ccc' };

export default AgriInsights;