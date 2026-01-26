import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { db } from '../firebase'; // Ensure this path is correct
import { collection, getDocs } from 'firebase/firestore';
import { IoMdArrowBack, IoMdRefresh } from 'react-icons/io';
import { FaBook, FaYoutube, FaNewspaper, FaChartLine } from 'react-icons/fa';

const AgriInsights = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('market'); // market, news, library
  const [libraryTab, setLibraryTab] = useState('videos'); // videos, books

  // --- DATA STATES ---
  const [marketRates, setMarketRates] = useState([]);
  const [newsArticles, setNewsArticles] = useState([]);
  const [videos, setVideos] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- FILTERS ---
  const [newsState, setNewsState] = useState('national');

  // --- API KEYS (From .env) ---
  const MANDI_KEY = import.meta.env.VITE_GOVT_MANDI_KEY;
  const RSS_KEY = import.meta.env.VITE_NEWS_RSS_KEY;
  const YOUTUBE_KEY = import.meta.env.VITE_YOUTUBE_KEY;

  // --- 1. FETCH MARKET RATES (Govt API) ---
  const fetchMarketRates = async () => {
    // Note: If API fails/key is empty, we use dummy data so UI doesn't break
    try {
      if (!MANDI_KEY) throw new Error("No Key");
      // This is a sample OGD endpoint. You might need to adjust resource_id based on specific dataset
      const url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${MANDI_KEY}&format=json&limit=20`;
      const res = await axios.get(url);
      if(res.data.records) {
        setMarketRates(res.data.records);
      }
    } catch (err) {
      console.warn("Using fallback market data (API Error or No Key)");
      setMarketRates([
        { state: 'Andhra Pradesh', commodity: 'Cotton', modal_price: '6200', market: 'Adoni' },
        { state: 'Telangana', commodity: 'Chilli', modal_price: '14500', market: 'Warangal' },
        { state: 'Karnataka', commodity: 'Maize', modal_price: '2100', market: 'Raichur' },
        { state: 'Maharashtra', commodity: 'Onion', modal_price: '1800', market: 'Lasalgaon' },
        { state: 'Tamil Nadu', commodity: 'Rice', modal_price: '3400', market: 'Erode' },
      ]);
    }
  };

  // --- 2. FETCH NEWS (RSS to JSON) ---
  const fetchNews = async () => {
    setLoading(true);
    let rssUrl = '';

    // Map States to their Local Newspaper RSS Feeds
    switch(newsState) {
        case 'ap': rssUrl = 'https://www.sakshi.com/rss/feed/andhra-pradesh'; break; // Sakshi
        case 'ts': rssUrl = 'https://www.eenadu.net/rss/telangana'; break; // Eenadu
        case 'tn': rssUrl = 'https://www.dtnext.in/rss'; break; // DT Next
        case 'ka': rssUrl = 'https://kannada.oneindia.com/rss/kannada-news-fb.xml'; break;
        default: rssUrl = 'https://timesofindia.indiatimes.com/rssfeeds/296589292.cms'; // TOI Agriculture
    }

    try {
        // Use rss2json to convert XML to JSON we can read
        const converterUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}&api_key=${RSS_KEY}`;
        const res = await axios.get(converterUrl);
        if(res.data.items) setNewsArticles(res.data.items);
    } catch (err) {
        console.error("News Error", err);
    }
    setLoading(false);
  };

  // --- 3. FETCH VIDEOS (YouTube API) ---
  const fetchVideos = async () => {
      try {
          // DD Kisan Channel ID: UCtL5Y... (Or generic search)
          // We search for "Farming India" to get latest relevant videos
          const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=modern+farming+india+techniques&type=video&key=${YOUTUBE_KEY}`;
          const res = await axios.get(url);
          setVideos(res.data.items);
      } catch (err) {
          console.error("YouTube Error", err);
      }
  };

  // --- 4. FETCH BOOKS (Firebase) ---
  const fetchBooks = async () => {
      try {
          const querySnapshot = await getDocs(collection(db, "library"));
          const booksData = querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
          setBooks(booksData);
      } catch (err) { console.error("Firebase Error", err); }
  };

  // Load Data on Mount
  useEffect(() => {
      fetchMarketRates();
      fetchVideos();
      fetchBooks();
  }, []);

  // Reload News when State changes
  useEffect(() => {
      fetchNews();
  }, [newsState]);

  return (
    <div style={styles.page}>
      
      {/* HEADER */}
      <div style={styles.header}>
          <button onClick={() => navigate('/dashboard')} style={styles.backBtn}><IoMdArrowBack size={24}/></button>
          <h1 style={styles.title}>Agri Insights</h1>
          <div style={{width: 24}}></div> {/* Spacer for alignment */}
      </div>

      {/* TICKER (Stock Market Style) */}
      <div style={styles.tickerContainer}>
          <div style={styles.tickerTrack}>
              {marketRates.map((rate, i) => (
                  <span key={i} style={styles.tickerItem}>
                      {rate.commodity} ({rate.market}): <span style={{color:'#4CAF50'}}>₹{rate.modal_price}</span>
                      <span style={{margin: '0 15px', opacity:0.3}}>|</span>
                  </span>
              ))}
              {/* Duplicate for infinite scroll effect */}
              {marketRates.map((rate, i) => (
                  <span key={`dup-${i}`} style={styles.tickerItem}>
                      {rate.commodity} ({rate.market}): <span style={{color:'#4CAF50'}}>₹{rate.modal_price}</span>
                      <span style={{margin: '0 15px', opacity:0.3}}>|</span>
                  </span>
              ))}
          </div>
      </div>

      {/* MAIN TABS */}
      <div style={styles.tabContainer}>
          <button onClick={() => setActiveTab('market')} style={activeTab === 'market' ? styles.activeTab : styles.tab}>
             <FaChartLine /> Market
          </button>
          <button onClick={() => setActiveTab('news')} style={activeTab === 'news' ? styles.activeTab : styles.tab}>
             <FaNewspaper /> News
          </button>
          <button onClick={() => setActiveTab('library')} style={activeTab === 'library' ? styles.activeTab : styles.tab}>
             <FaBook /> Library
          </button>
      </div>

      {/* CONTENT AREA */}
      <div style={styles.content}>
          
          {/* --- MARKET TAB --- */}
          {activeTab === 'market' && (
              <div style={styles.grid}>
                  {marketRates.map((rate, idx) => (
                      <div key={idx} style={styles.marketCard}>
                          <div style={{fontSize:'12px', opacity:0.7}}>{rate.state} • {rate.market}</div>
                          <div style={{fontSize:'20px', fontWeight:'bold', margin:'5px 0', color:'#E23744'}}>{rate.commodity}</div>
                          <div style={{display:'flex', justifyContent:'space-between', alignItems:'end'}}>
                              <div style={{fontSize:'24px', fontWeight:'700'}}>₹{rate.modal_price}</div>
                              <div style={styles.trendBadge}>Avg Price</div>
                          </div>
                      </div>
                  ))}
              </div>
          )}

          {/* --- NEWS TAB --- */}
          {activeTab === 'news' && (
              <div>
                  {/* State Selector */}
                  <div style={styles.filterRow}>
                      <span style={{fontSize:'14px', opacity:0.8}}>Region:</span>
                      <select value={newsState} onChange={(e) => setNewsState(e.target.value)} style={styles.select}>
                          <option value="national">🇮🇳 National (English)</option>
                          <option value="ap">Andhra Pradesh (Telugu)</option>
                          <option value="ts">Telangana (Telugu)</option>
                          <option value="tn">Tamil Nadu (Tamil)</option>
                          <option value="ka">Karnataka (Kannada)</option>
                      </select>
                  </div>

                  {loading ? <p style={{textAlign:'center', marginTop:'20px'}}>Fetching latest papers...</p> : (
                      <div style={styles.newsList}>
                          {newsArticles.map((item, idx) => (
                              <div key={idx} style={styles.newsCard} onClick={() => window.open(item.link, '_blank')}>
                                  {item.thumbnail && <img src={item.thumbnail} alt="" style={styles.newsImg}/>}
                                  <div style={styles.newsContent}>
                                      <h3 style={styles.newsTitle}>{item.title}</h3>
                                      <div style={styles.newsMeta}>{new Date(item.pubDate).toLocaleDateString()} • Tap to Read</div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
          )}

          {/* --- LIBRARY TAB --- */}
          {activeTab === 'library' && (
              <div>
                  <div style={styles.subTabContainer}>
                      <button onClick={() => setLibraryTab('videos')} style={libraryTab === 'videos' ? styles.subTabActive : styles.subTab}>
                          <FaYoutube color="red"/> Videos
                      </button>
                      <button onClick={() => setLibraryTab('books')} style={libraryTab === 'books' ? styles.subTabActive : styles.subTab}>
                          <FaBook color="#4CAF50"/> Guides
                      </button>
                  </div>

                  {libraryTab === 'videos' ? (
                      <div style={styles.grid}>
                          {videos.map((vid, idx) => (
                              <div key={idx} style={styles.videoCard} onClick={() => window.open(`https://www.youtube.com/watch?v=${vid.id.videoId}`, '_blank')}>
                                  <img src={vid.snippet.thumbnails.medium.url} alt="" style={styles.vidThumb}/>
                                  <div style={{padding:'10px'}}>
                                      <div style={styles.vidTitle}>{vid.snippet.title}</div>
                                      <div style={{fontSize:'10px', opacity:0.6}}>{vid.snippet.channelTitle}</div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  ) : (
                      <div style={styles.grid}>
                          {books.length === 0 ? <p style={{padding:'20px', textAlign:'center', width:'100%'}}>No books added yet.</p> : books.map((book, idx) => (
                              <div key={idx} style={styles.bookCard} onClick={() => window.open(book.link, '_blank')}>
                                  <div style={styles.bookIcon}><FaBook size={30} color="#fff"/></div>
                                  <div style={styles.bookInfo}>
                                      <div style={{fontWeight:'bold', fontSize:'14px'}}>{book.title}</div>
                                      <div style={{fontSize:'12px', opacity:0.7}}>{book.author || 'Farm Guide'}</div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
          )}
      </div>

    </div>
  );
};

// --- STYLES ---
const styles = {
  page: { background: '#000', minHeight: '100vh', color: '#fff', fontFamily: '"SF Pro Display", sans-serif', paddingBottom: '80px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: '#111', borderBottom: '1px solid #222' },
  title: { fontSize: '20px', fontWeight: '700', margin: 0 },
  backBtn: { background: 'none', border: 'none', color: '#fff', cursor: 'pointer' },

  // Ticker Animation
  tickerContainer: { background: '#1A1A1A', overflow: 'hidden', whiteSpace: 'nowrap', padding: '10px 0', borderBottom: '1px solid #333' },
  tickerTrack: { display: 'inline-block', animation: 'marquee 20s linear infinite' },
  tickerItem: { display: 'inline-block', fontSize: '14px', fontWeight: '500' },

  // Tabs
  tabContainer: { display: 'flex', padding: '15px', gap: '10px', background: '#000' },
  tab: { flex: 1, padding: '12px', background: '#111', border: '1px solid #333', borderRadius: '30px', color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px' },
  activeTab: { flex: 1, padding: '12px', background: '#fff', border: '1px solid #fff', borderRadius: '30px', color: '#000', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold', fontSize: '14px' },

  content: { padding: '15px' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },

  // Market Card
  marketCard: { background: '#111', padding: '15px', borderRadius: '16px', border: '1px solid #333' },
  trendBadge: { fontSize: '10px', background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '10px' },

  // News
  filterRow: { display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px', marginBottom: '15px' },
  select: { background: '#222', color: '#fff', border: '1px solid #444', padding: '8px', borderRadius: '8px', outline: 'none' },
  newsList: { display: 'flex', flexDirection: 'column', gap: '15px' },
  newsCard: { display: 'flex', background: '#111', borderRadius: '12px', overflow: 'hidden', border: '1px solid #222', cursor: 'pointer' },
  newsImg: { width: '100px', objectFit: 'cover' },
  newsContent: { padding: '15px', flex: 1 },
  newsTitle: { fontSize: '14px', margin: '0 0 8px 0', lineHeight: '1.4' },
  newsMeta: { fontSize: '11px', color: '#E23744', fontWeight: 'bold' },

  // Library
  subTabContainer: { display: 'flex', gap: '20px', marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '10px' },
  subTab: { background: 'none', border: 'none', color: '#666', fontSize: '16px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' },
  subTabActive: { background: 'none', border: 'none', color: '#fff', fontSize: '16px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' },
  
  videoCard: { background: '#111', borderRadius: '12px', overflow: 'hidden', border: '1px solid #333', cursor: 'pointer' },
  vidThumb: { width: '100%', height: '100px', objectFit: 'cover' },
  vidTitle: { fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },

  bookCard: { background: 'linear-gradient(135deg, #1e1e1e 0%, #111 100%)', borderRadius: '12px', padding: '15px', display: 'flex', alignItems: 'center', gap: '15px', gridColumn: 'span 2', border: '1px solid #333', cursor: 'pointer' },
  bookIcon: { width: '50px', height: '60px', background: '#333', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  bookInfo: { display: 'flex', flexDirection: 'column' }
};

// Inject CSS for Ticker
const styleSheet = document.createElement("style");
styleSheet.innerText = `
@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
`;
document.head.appendChild(styleSheet);

export default AgriInsights;