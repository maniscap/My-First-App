import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

function AgriInsights() {
  // --- BACKGROUND LOGIC ---
  const [bgImage, setBgImage] = useState('');
  const dayBg = 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2940&auto=format&fit=crop';
  const nightBg = 'https://media.istockphoto.com/id/1050520122/photo/full-moon-clouds-and-skies-with-forest-in-the-dark-night.jpg?s=1024x1024&w=is&k=20&c=aI_22_03ioCvhtoLIxeuiITaaO-PJcvcFOzX27HYRUs=';

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 18 || hour < 6) setBgImage(nightBg);
    else setBgImage(dayBg);
  }, []);

  // --- DATA LOGIC ---
  const [marketRates, setMarketRates] = useState([]);
  const [loading, setLoading] = useState(true);

  const booksEnglish = [
    { id: 1, title: "Modern Farming", author: "K. Annadana", color: "rgba(76, 175, 80, 0.8)" },
    { id: 2, title: "Soil Health", author: "Agri Dept", color: "rgba(139, 195, 74, 0.8)" },
    { id: 3, title: "Pest Control", author: "Dr. S. Rao", color: "rgba(56, 142, 60, 0.8)" },
  ];

  const booksTelugu = [
    { id: 1, title: "Adhunika Vyavasayam", author: "Rytu Nestham", color: "rgba(255, 152, 0, 0.8)" },
    { id: 2, title: "Panta Rakshana", author: "Govt of AP", color: "rgba(255, 87, 34, 0.8)" },
    { id: 3, title: "Sendriya Eruvulu", author: "Subhash Palekar", color: "rgba(230, 74, 25, 0.8)" },
  ];

  const videos = [
    { id: 1, title: "How to Grow Rice (Telugu)", link: "https://www.youtube.com/results?search_query=paddy+cultivation+telugu" },
    { id: 2, title: "Cotton Pest Management", link: "https://www.youtube.com/results?search_query=cotton+pest+control" },
    { id: 3, title: "Zero Budget Farming", link: "https://www.youtube.com/results?search_query=zero+budget+natural+farming" },
    { id: 4, title: "Drip Irrigation Guide", link: "https://www.youtube.com/results?search_query=drip+irrigation+system" },
  ];

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
    // FIXED BACKGROUND + SCROLLABLE CONTENT
    <div style={{...pageStyle, backgroundImage: `url('${bgImage}')`}}>
      
      <div style={contentContainer}>
        <Link to="/dashboard" style={backLink}>⬅ Dashboard</Link>
        
        <h1 style={titleStyle}>📊 Agri-Insights</h1>

        {/* --- MARKET RATES GLASS CARD --- */}
        <div style={glassCard}>
          <h2 style={headerStyle}>📈 Daily Market Rates</h2>
          {loading ? <p style={{textAlign:'center', color:'white'}}>⏳ Loading...</p> : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {marketRates.map((item) => (
                <div key={item.id} style={itemStyle}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0', color: '#1B5E20', fontSize: '20px', fontWeight:'800' }}>{item.crop}</h3>
                    <p style={{ fontWeight: 'bold', fontSize: '18px' }}>₹{item.price}</p>
                  </div>
                  <div style={{ flex: 1.5, fontSize: '13px', color: '#333', borderLeft: '1px solid #ddd', paddingLeft: '15px' }}>
                    <p style={{ margin: '2px 0' }}>📍 <strong>{item.market}</strong></p>
                    <p style={{ margin: '2px 0' }}>🏙️ {item.district}</p>
                    <p style={{ margin: '2px 0', fontSize: '11px', color: '#555' }}>📅 {item.date}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {item.trend === 'up' && <span style={{color: 'green', fontWeight:'bold'}}>📈 UP</span>}
                    {item.trend === 'down' && <span style={{color: 'red', fontWeight:'bold'}}>📉 DOWN</span>}
                    {item.trend === 'stable' && <span style={{color: '#555', fontWeight:'bold'}}>➡️ SAME</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
          {!loading && marketRates.length === 0 && <p style={{textAlign:'center', color:'#eee'}}>No rates available.</p>}
        </div>

        {/* --- LIBRARY GLASS CARD --- */}
        <div style={glassCard}>
          <h2 style={headerStyle}>📚 Reference Library</h2>
          
          <h3 style={{color: 'white', marginTop: '20px', textShadow:'0 1px 2px black'}}>English Books 🇬🇧</h3>
          <div style={gridStyle}>
            {booksEnglish.map((book) => (
              <div key={book.id} style={{ ...bookStyle, backgroundColor: book.color }}>
                <div style={bookSpine}></div><h4>{book.title}</h4><small>{book.author}</small>
              </div>
            ))}
          </div>

          <h3 style={{color: 'white', marginTop: '20px', textShadow:'0 1px 2px black'}}>Telugu Books 🇮🇳</h3>
          <div style={gridStyle}>
            {booksTelugu.map((book) => (
              <div key={book.id} style={{ ...bookStyle, backgroundColor: book.color }}>
                <div style={bookSpine}></div><h4>{book.title}</h4><small>{book.author}</small>
              </div>
            ))}
          </div>
        </div>

        {/* --- VIDEO GLASS CARD --- */}
        <div style={glassCard}>
          <h2 style={headerStyle}>🎥 Video Tutorials</h2>
          <div style={gridStyle}>
            {videos.map((vid) => (
              <a key={vid.id} href={vid.link} target="_blank" rel="noopener noreferrer" style={videoCard}>
                <div style={{fontSize:'40px'}}>▶️</div>
                <p style={{fontWeight: 'bold', margin: '10px 0', color: '#1B5E20'}}>{vid.title}</p>
                <span style={{fontSize: '12px', color: 'blue'}}>Watch on YouTube ↗</span>
              </a>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// --- STYLES ---
const pageStyle = { 
  position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
  backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: 'black',
  overflowY: 'auto' // Enables scrolling over fixed background
};

const contentContainer = { padding: '20px', maxWidth: '800px', margin: '0 auto', paddingBottom: '100px' };

const backLink = { color: 'white', textDecoration: 'none', fontSize: '14px', background: 'rgba(0,0,0,0.5)', padding: '8px 15px', borderRadius: '20px', backdropFilter: 'blur(5px)' };
const titleStyle = { color: 'white', textAlign: 'center', marginTop: '20px', textShadow: '0 2px 4px rgba(0,0,0,0.8)', fontWeight: '900', letterSpacing: '1px' };

const glassCard = { 
  backgroundColor: 'rgba(255, 255, 255, 0.85)', // High opacity for readability
  backdropFilter: 'blur(10px)', 
  padding: '20px', borderRadius: '20px', 
  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)', 
  marginBottom: '30px',
  border: '1px solid rgba(255,255,255,0.2)'
};

const headerStyle = { borderBottom: '2px solid #1B5E20', paddingBottom: '10px', color: '#1B5E20', marginTop: 0 };
const itemStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', borderBottom: '1px solid #ccc', background: 'rgba(255,255,255,0.5)', borderRadius: '10px' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '15px' };

const bookStyle = { height: '140px', borderRadius: '5px 10px 10px 5px', padding: '10px', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', position: 'relative', boxShadow: '2px 2px 5px rgba(0,0,0,0.3)', cursor: 'pointer' };
const bookSpine = { position: 'absolute', left: 0, top: 0, bottom: 0, width: '10px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '5px 0 0 5px' };

const videoCard = { display: 'block', textDecoration: 'none', backgroundColor: 'white', padding: '15px', borderRadius: '10px', textAlign: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', transition: '0.3s' };

export default AgriInsights;