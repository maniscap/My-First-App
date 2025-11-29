import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase'; 
import { collection, getDocs } from 'firebase/firestore';

function AgriInsights() {
  const [marketRates, setMarketRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        console.log("Attempting to fetch market rates..."); // Debug log
        const q = collection(db, "market_rates"); 
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          console.log("No documents found!");
        }

        const list = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log("Data fetched:", list); // Debug log
        setMarketRates(list);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching rates:", err);
        setError(err.message);
        setLoading(false);
      }
    };
    fetchRates();
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <Link to="/" style={{ textDecoration: 'none', color: '#555' }}>⬅ Back to Home</Link>
      
      <h1 style={{ color: '#2E7D32', textAlign: 'center' }}>📊 Agri-Insights & Resources</h1>

      <div style={cardStyle}>
        <h2>📈 Daily Market Rates</h2>
        
        {/* ERROR MESSAGE DISPLAY */}
        {error && <p style={{color: 'red'}}>⚠️ Error: {error}</p>}

        {loading ? <p>⏳ Loading data...</p> : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {marketRates.map((item) => (
              <div key={item.id} style={itemStyle}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0', color: '#2E7D32' }}>{item.crop}</h3>
                  <p style={{ fontWeight: 'bold' }}>₹{item.price}</p>
                </div>
                <div style={{ fontSize: '14px', color: '#555' }}>
                  <p>📍 {item.market || "Unknown Market"}</p>
                  <p>📅 {item.date || "Today"}</p>
                </div>
                <div>{item.trend}</div>
              </div>
            ))}
          </div>
        )}
        
        {!loading && !error && marketRates.length === 0 && (
          <p style={{color: '#888'}}>No market rates found in database.</p>
        )}
      </div>
    </div>
  );
}

const cardStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', marginBottom: '30px' };
const itemStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', borderBottom: '1px solid #f0f0f0' };

export default AgriInsights;