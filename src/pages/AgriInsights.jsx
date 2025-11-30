import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';

function AgriInsights() {
  const [marketRates, setMarketRates] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- 1. DATA: BOOKS COLLECTION (You can add more here) ---
  const booksEnglish = [
    { id: 1, title: "Modern Farming", author: "K. Annadana", color: "#4CAF50" },
    { id: 2, title: "Soil Health", author: "Agri Dept", color: "#8BC34A" },
    { id: 3, title: "Pest Control", author: "Dr. S. Rao", color: "#388E3C" },
  ];

  const booksTelugu = [
    { id: 1, title: "Adhunika Vyavasayam", author: "Rytu Nestham", color: "#FF9800" },
    { id: 2, title: "Panta Rakshana", author: "Govt of AP", color: "#FF5722" },
    { id: 3, title: "Sendriya Eruvulu", author: "Subhash Palekar", color: "#E64A19" },
  ];

  // --- 2. DATA: VIDEO LINKS (YouTube) ---
  const videos = [
    { id: 1, title: "How to Grow Rice (Telugu)", link: "https://www.youtube.com/results?search_query=paddy+cultivation+telugu" },
    { id: 2, title: "Cotton Pest Management", link: "https://www.youtube.com/results?search_query=cotton+pest+control" },
    { id: 3, title: "Zero Budget Farming", link: "https://www.youtube.com/results?search_query=zero+budget+natural+farming" },
    { id: 4, title: "Drip Irrigation Guide", link: "https://www.youtube.com/results?search_query=drip+irrigation+system" },
  ];

  // --- 3. FETCH MARKET RATES (Existing Code) ---
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
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', paddingBottom: '80px' }}>
      <Link to="/" style={{ textDecoration: 'none', color: '#555' }}>⬅ Back to Home</Link>
      
      <h1 style={{ color: '#2E7D32', textAlign: 'center' }}>📊 Agri-Insights & Resources</h1>

      {/* --- SECTION 1: MARKET RATES --- */}
      <div style={cardStyle}>
        <h2 style={{borderBottom: '2px solid #eee', paddingBottom: '10px'}}>📈 Daily Market Rates</h2>
        {loading ? <p style={{textAlign: 'center'}}>⏳ Loading...</p> : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {marketRates.map((item) => (
              <div key={item.id} style={itemStyle}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0', color: '#2E7D32' }}>{item.crop}</h3>
                  <p style={{ fontWeight: 'bold' }}>₹{item.price}</p>
                </div>
                <div style={{ fontSize: '12px', color: '#555' }}>
                  <p>📍 {item.market}</p>
                  <p>📅 {item.date}</p>
                </div>
                <div>{item.trend === 'up' ? '📈 UP' : '➡️ STABLE'}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- SECTION 2: LIBRARY (BOOKS) --- */}
      <div style={cardStyle}>
        <h2>📚 Reference Library</h2>
        
        <h3 style={{color: '#555', marginTop: '20px'}}>English Books 🇬🇧</h3>
        <div style={gridStyle}>
          {booksEnglish.map((book) => (
            <div key={book.id} style={{ ...bookStyle, backgroundColor: book.color }}>
              <div style={bookSpine}></div>
              <h4>{book.title}</h4>
              <small>{book.author}</small>
            </div>
          ))}
        </div>

        <h3 style={{color: '#555', marginTop: '20px'}}>Telugu Books 🇮🇳</h3>
        <div style={gridStyle}>
          {booksTelugu.map((book) => (
            <div key={book.id} style={{ ...bookStyle, backgroundColor: book.color }}>
              <div style={bookSpine}></div>
              <h4>{book.title}</h4>
              <small>{book.author}</small>
            </div>
          ))}
        </div>
      </div>

      {/* --- SECTION 3: VIDEO GALLERY --- */}
      <div style={cardStyle}>
        <h2>🎥 Video Tutorials</h2>
        <div style={gridStyle}>
          {videos.map((vid) => (
            <a key={vid.id} href={vid.link} target="_blank" rel="noopener noreferrer" style={videoCard}>
              <div style={playIcon}>▶️</div>
              <p style={{fontWeight: 'bold', margin: '10px 0', color: '#333'}}>{vid.title}</p>
              <span style={{fontSize: '12px', color: 'blue'}}>Watch on YouTube ↗</span>
            </a>
          ))}
        </div>
      </div>

    </div>
  );
}

// STYLES
const cardStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', marginBottom: '30px' };
const itemStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', borderBottom: '1px solid #f0f0f0' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '15px' };

// Book Styles
const bookStyle = { 
  height: '140px', 
  borderRadius: '5px 10px 10px 5px', 
  padding: '10px', 
  color: 'white', 
  display: 'flex', 
  flexDirection: 'column', 
  justifyContent: 'center', 
  textAlign: 'center', 
  position: 'relative',
  boxShadow: '2px 2px 5px rgba(0,0,0,0.2)',
  cursor: 'pointer'
};
const bookSpine = { position: 'absolute', left: 0, top: 0, bottom: 0, width: '10px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '5px 0 0 5px' };

// Video Styles
const videoCard = { 
  display: 'block',
  textDecoration: 'none',
  backgroundColor: '#f9f9f9', 
  padding: '15px', 
  borderRadius: '10px', 
  textAlign: 'center', 
  border: '1px solid #ddd',
  transition: '0.3s'
};
const playIcon = { fontSize: '40px', marginBottom: '5px' };

export default AgriInsights;