import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { IoMdArrowBack, IoMdBook, IoMdTrendingUp, IoMdVideocam, IoMdPaper, IoMdDownload } from 'react-icons/io';
import { FaFilePdf, FaNewspaper } from 'react-icons/fa';

function AgriInsights() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('rates'); // rates | library | videos | news

  // --- STATE ---
  const [marketRates, setMarketRates] = useState([]);
  const [library, setLibrary] = useState([]);
  const [videos, setVideos] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Market Rates
        try {
            const ratesSnap = await getDocs(collection(db, "market_rates"));
            setMarketRates(ratesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch(e) { console.log("Rates fetch error", e); }

        // 2. Library (PDFs)
        try {
            const libSnap = await getDocs(collection(db, "library"));
            setLibrary(libSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch(e) { console.log("Lib fetch error", e); }

        // 3. Videos
        try {
            const vidSnap = await getDocs(collection(db, "videos"));
            setVideos(vidSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch(e) { console.log("Vid fetch error", e); }

        // 4. News (Auto-Fetch)
        try {
            const rssUrl = "https://www.downtoearth.org.in/rss/agriculture"; 
            const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`);
            const data = await res.json();
            if(data.items) setNews(data.items.slice(0, 10));
        } catch (e) { console.log("News fetch error", e); }

      } catch (error) { console.error("General Error:", error); }
      setLoading(false);
    };
    fetchData();
  }, []);

  // --- RENDER HELPERS (With Safety Checks) ---
  const renderRates = () => (
    <div style={styles.grid}>
      {marketRates.length === 0 ? <p style={styles.empty}>No rates updated today.</p> : marketRates.map((item) => (
        <div key={item.id} style={styles.rateCard}>
          <div style={styles.rateHeader}>
            {/* Safety: Check if crop exists before getting charAt */}
            <div style={styles.cropIcon}>{(item.crop || '?').charAt(0)}</div>
            <div>
              <h3 style={styles.cropName}>{item.crop || 'Unknown Crop'}</h3>
              <p style={styles.marketLoc}>📍 {item.market || 'Unknown'}, {item.district}</p>
            </div>
            <div style={{textAlign:'right', marginLeft:'auto'}}>
              <h3 style={styles.price}>₹{item.price || '0'}</h3>
              <span style={{
                ...styles.trendBadge, 
                color: item.trend === 'up' ? '#4CAF50' : '#FF5252',
                background: item.trend === 'up' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 82, 82, 0.1)'
              }}>
                {item.trend === 'up' ? '▲ Up' : item.trend === 'down' ? '▼ Down' : '● Stable'}
              </span>
            </div>
          </div>
          <div style={styles.dateBadge}>Updated: {item.date}</div>
        </div>
      ))}
    </div>
  );

  const renderLibrary = () => (
    <div style={styles.grid}>
      {library.length === 0 ? <p style={styles.empty}>No books available.</p> : library.map((book) => (
        <div key={book.id} style={styles.bookCard}>
           <div style={styles.bookIcon}><FaFilePdf size={30} color="#FF5252"/></div>
           <div style={{flex:1}}>
             <h4 style={styles.bookTitle}>{book.title || 'Untitled'}</h4>
             <p style={styles.bookAuthor}>By {book.author || 'FarmBuddy'}</p>
           </div>
           {book.link && (
               <a href={book.link} target="_blank" rel="noreferrer" style={styles.readBtn}>
                 Read <IoMdDownload />
               </a>
           )}
        </div>
      ))}
    </div>
  );

  const renderVideos = () => (
    <div style={styles.videoGrid}>
      {videos.length === 0 ? <p style={styles.empty}>No videos available.</p> : videos.map((vid) => {
        // Safety: Check if link exists before split
        let videoId = "";
        if (vid.link && vid.link.includes('v=')) {
            videoId = vid.link.split('v=')[1]?.split('&')[0];
        } else if (vid.link && vid.link.includes('youtu.be/')) {
            videoId = vid.link.split('youtu.be/')[1];
        }

        if (!videoId) return null; // Skip invalid links

        const embedUrl = `https://www.youtube.com/embed/${videoId}`;
        return (
          <div key={vid.id} style={styles.videoCard}>
            <iframe 
              src={embedUrl} 
              title={vid.title || 'Video'} 
              style={styles.iframe} 
              frameBorder="0" 
              allowFullScreen
            ></iframe>
            <div style={{padding:'15px'}}>
              <h4 style={styles.videoTitle}>{vid.title || 'Agri Video'}</h4>
            </div>
          </div>
        )
      })}
    </div>
  );

  const renderNews = () => (
    <div style={styles.list}>
       {news.length === 0 ? <p style={styles.empty}>Fetching latest news...</p> : news.map((n, i) => (
         <div key={i} style={styles.newsCard} onClick={() => window.open(n.link, '_blank')}>
            <div style={styles.newsIcon}><FaNewspaper /></div>
            <div>
              <h4 style={styles.newsTitle}>{n.title}</h4>
              <p style={styles.newsDate}>{new Date(n.pubDate).toDateString()}</p>
            </div>
         </div>
       ))}
    </div>
  );

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>
          <IoMdArrowBack size={24} color="#fff" />
        </button>
        <h2 style={styles.pageTitle}>Agri Insights</h2>
      </div>

      {/* TABS */}
      <div style={styles.tabContainer}>
        <div style={activeTab === 'rates' ? styles.activeTab : styles.tab} onClick={() => setActiveTab('rates')}>
           <IoMdTrendingUp size={18}/> Market
        </div>
        <div style={activeTab === 'library' ? styles.activeTab : styles.tab} onClick={() => setActiveTab('library')}>
           <IoMdBook size={18}/> Library
        </div>
        <div style={activeTab === 'videos' ? styles.activeTab : styles.tab} onClick={() => setActiveTab('videos')}>
           <IoMdVideocam size={18}/> Videos
        </div>
        <div style={activeTab === 'news' ? styles.activeTab : styles.tab} onClick={() => setActiveTab('news')}>
           <IoMdPaper size={18}/> News
        </div>
      </div>

      {/* CONTENT */}
      <div style={styles.content}>
         {loading ? <div style={styles.loader}>Loading Updates...</div> : (
           <>
             {activeTab === 'rates' && renderRates()}
             {activeTab === 'library' && renderLibrary()}
             {activeTab === 'videos' && renderVideos()}
             {activeTab === 'news' && renderNews()}
           </>
         )}
      </div>
    </div>
  );
}

// --- STYLES ---
const styles = {
  page: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: '#121212', color: 'white', fontFamily: '"SF Pro Display", sans-serif', overflowY: 'auto', paddingBottom:'80px' },
  header: { display: 'flex', alignItems: 'center', padding: '20px', background: 'rgba(20,20,20,0.9)', position: 'sticky', top: 0, zIndex: 10, backdropFilter:'blur(10px)' },
  backBtn: { background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius:'50%', width:'40px', height:'40px', display:'flex', alignItems:'center', justifyContent:'center', cursor: 'pointer', marginRight: '15px' },
  pageTitle: { margin: 0, fontSize: '22px', fontWeight: '700' },

  tabContainer: { display:'flex', padding:'0 10px', gap:'10px', overflowX:'auto', marginBottom:'15px', scrollbarWidth:'none' },
  tab: { padding:'10px 20px', borderRadius:'25px', background:'rgba(255,255,255,0.05)', color:'#aaa', display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', whiteSpace:'nowrap', fontSize:'14px' },
  activeTab: { padding:'10px 20px', borderRadius:'25px', background:'#4CAF50', color:'white', display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', whiteSpace:'nowrap', fontSize:'14px', fontWeight:'600', boxShadow:'0 4px 15px rgba(76, 175, 80, 0.4)' },

  content: { padding:'0 15px' },
  grid: { display:'flex', flexDirection:'column', gap:'15px' },
  empty: { textAlign:'center', color:'#666', marginTop:'50px' },
  loader: { textAlign:'center', color:'#888', marginTop:'50px' },

  // Rate Card
  rateCard: { background:'rgba(255,255,255,0.05)', padding:'15px', borderRadius:'16px', border:'1px solid rgba(255,255,255,0.1)' },
  rateHeader: { display:'flex', alignItems:'center', gap:'15px' },
  cropIcon: { width:'50px', height:'50px', borderRadius:'12px', background:'#2E7D32', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px', fontWeight:'bold' },
  cropName: { margin:0, fontSize:'18px' },
  marketLoc: { margin:0, fontSize:'12px', color:'#aaa', marginTop:'4px' },
  price: { margin:0, fontSize:'20px', color:'#4CAF50' },
  trendBadge: { fontSize:'10px', padding:'3px 8px', borderRadius:'6px', display:'inline-block', marginTop:'5px' },
  dateBadge: { fontSize:'10px', color:'#666', marginTop:'10px', textAlign:'right' },

  // Library Card
  bookCard: { background:'rgba(255,255,255,0.05)', padding:'15px', borderRadius:'16px', display:'flex', alignItems:'center', gap:'15px', border:'1px solid rgba(255,255,255,0.1)' },
  bookIcon: { width:'50px', height:'60px', background:'rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'8px' },
  bookTitle: { margin:0, fontSize:'16px' },
  bookAuthor: { margin:0, fontSize:'12px', color:'#888', marginTop:'4px' },
  readBtn: { background:'#2196F3', color:'white', textDecoration:'none', padding:'8px 16px', borderRadius:'20px', fontSize:'12px', display:'flex', alignItems:'center', gap:'5px' },

  // Video Card
  videoGrid: { display:'grid', gridTemplateColumns:'1fr', gap:'20px' },
  videoCard: { background:'black', borderRadius:'16px', overflow:'hidden', border:'1px solid #333' },
  iframe: { width:'100%', height:'200px', background:'#000' },
  videoTitle: { margin:0, fontSize:'16px', color:'#eee' },

  // News Card
  newsCard: { display:'flex', gap:'15px', padding:'15px', background:'rgba(255,255,255,0.03)', borderRadius:'12px', marginBottom:'10px', cursor:'pointer' },
  newsIcon: { width:'40px', height:'40px', background:'#FF9800', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'white' },
  newsTitle: { margin:0, fontSize:'14px', lineHeight:'1.4' },
  newsDate: { margin:0, fontSize:'11px', color:'#666', marginTop:'5px' }
};

export default AgriInsights;