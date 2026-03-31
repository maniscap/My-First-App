import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoMdArrowBack } from 'react-icons/io';

const NewsUpdates = () => {
  const navigate = useNavigate();
  
  // We now store the two categories in separate states
  const [agriNews, setAgriNews] = useState([]);
  const [otherNews, setOtherNews] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeApi, setActiveApi] = useState(''); 
  const [activeCategory, setActiveCategory] = useState('agriculture');
  const [page, setPage] = useState(1);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [fetchingMore, setFetchingMore] = useState(false);

  useEffect(() => {
    fetchNewsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory]); // Refetches or loads from cache whenever you switch tabs

  const fetchNewsData = async (isLoadMore = false) => {
    if (isLoadMore) setFetchingMore(true);
    else setLoading(true);
    setError(null);

    // --- CACHE CHECK: Validate Daily Expiration ---
    const today = new Date().toDateString();
    if (!isLoadMore) {
      const cacheDate = sessionStorage.getItem('farmcap_news_date');
      
      if (cacheDate !== today) {
        // It's a new day! Clear the old cache
        sessionStorage.removeItem('farmcap_agri_news');
        sessionStorage.removeItem('farmcap_other_news');
        sessionStorage.setItem('farmcap_news_date', today);
      } else {
        // Same day, use cache if available
        const cachedAgri = sessionStorage.getItem('farmcap_agri_news');
        const cachedOther = sessionStorage.getItem('farmcap_other_news');
        
        const parsedAgri = cachedAgri ? JSON.parse(cachedAgri) : [];
        const parsedOther = cachedOther ? JSON.parse(cachedOther) : [];
        
        if (parsedAgri.length > 0) setAgriNews(parsedAgri);
        if (parsedOther.length > 0) setOtherNews(parsedOther);
        
        // If the currently requested category already has data, we can safely skip the API call
        if ((activeCategory === 'agriculture' && parsedAgri.length > 0) || 
            (activeCategory === 'other' && parsedOther.length > 0)) {
          setLoading(false);
          return;
        }
      }
    }

    const gnewsKey = import.meta.env.VITE_GNEWS_API_KEY;
    const newsDataKey = import.meta.env.VITE_NEWSDATA_API_KEY;

    if (!gnewsKey || !newsDataKey) {
      setError("API keys are missing. Check your .env file.");
      setLoading(false);
      setFetchingMore(false);
      return;
    }

    // --- DYNAMIC QUERY: Changes based on the active tab so "Load More" always works ---
    const queryStr = activeCategory === 'agriculture' 
      ? '"agriculture" OR "farming" OR "farmers" OR crops OR "agri-tech" OR mandi'
      : 'India OR "rural development" OR economy OR "current affairs" OR weather';
      
    const searchQuery = encodeURIComponent(queryStr);
    
    try {
      // ATTEMPT 1: Primary API (GNews)
      const gnewsUrl = `https://gnews.io/api/v4/search?q=${searchQuery}&country=in&lang=en&max=10&page=${isLoadMore ? page + 1 : 1}&apikey=${gnewsKey}`;
      const gnewsResponse = await fetch(gnewsUrl);
      
      if (!gnewsResponse.ok) throw new Error('GNews limit reached or failed.'); 

      const data = await gnewsResponse.json();
      processAndSortNews(data.articles, 'image', 'GNews (India Edition)', isLoadMore);
      if (isLoadMore) setPage(prev => prev + 1);

    } catch (primaryError) {
      console.warn("Primary API failed, switching to backup...", primaryError.message);

      try {
        // ATTEMPT 2: Fallback API (NewsData.io)
        // Added &image=1 to specifically request articles with cover images
        let newsDataUrl = `https://newsdata.io/api/1/news?apikey=${newsDataKey}&q=${searchQuery}&country=in&language=en&size=10&image=1`;
        if (isLoadMore && nextPageToken) {
          newsDataUrl += `&page=${nextPageToken}`;
        }
        const newsDataResponse = await fetch(newsDataUrl);

        if (!newsDataResponse.ok) throw new Error('All feeds unavailable.');

        const data = await newsDataResponse.json();
        setNextPageToken(data.nextPage); // Save for next pagination
        processAndSortNews(data.results, 'image_url', 'NewsData (India Backup)', isLoadMore);

      } catch (backupError) {
        setError(backupError.message);
      }
    } finally {
      setLoading(false);
      setFetchingMore(false);
    }
  };

  // --- THE SORTING ENGINE ---
  const processAndSortNews = (articles, imageKey, apiName, append = false) => {
    const tempAgri = [];
    const tempOther = [];
    
    if (!articles) return;

    // Keywords to determine if an article is strictly agricultural
    const agriKeywords = /agricultur|farm|crop|harvest|seed|tractor|irrigation|fertilizer|pest|mandi|agri-tech|subsidy|kisan/i;

    articles.forEach(article => {
      // Normalize the data format
      const formattedArticle = {
        title: article.title,
        description: article.description,
        url: article.url || article.link,
        image: article[imageKey] || null, // No fallback fake images anymore
        publishedAt: article.publishedAt || article.pubDate,
        source: article.source?.name || article.source_id || 'Agri Update'
      };

      // Check the title and description against our keywords
      const textToAnalyze = `${formattedArticle.title} ${formattedArticle.description}`;
      
      if (agriKeywords.test(textToAnalyze)) {
        tempAgri.push(formattedArticle);
      } else {
        tempOther.push(formattedArticle);
      }
    });

    // Smartly merge the states so switching tabs to fetch doesn't wipe existing cache from the other tab
    setAgriNews(prev => {
      let updated;
      if (append) updated = [...prev, ...tempAgri];
      else if (activeCategory === 'agriculture') updated = tempAgri;
      else updated = [...prev, ...tempAgri];
      
      sessionStorage.setItem('farmcap_agri_news', JSON.stringify(updated));
      return updated;
    });

    setOtherNews(prev => {
      let updated;
      if (append) updated = [...prev, ...tempOther];
      else if (activeCategory === 'other') updated = tempOther;
      else updated = [...prev, ...tempOther];
      
      sessionStorage.setItem('farmcap_other_news', JSON.stringify(updated));
      return updated;
    });

    setActiveApi(apiName);
  };

  // Determine which list to show based on the active tab
  const currentNewsList = activeCategory === 'agriculture' ? agriNews : otherNews;

  return (
    <div style={{ padding: '20px', background: 'linear-gradient(135deg, #f0f9ff 0%, #e1f5fe 100%)', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Header Section */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '25px',
        background: 'white',
        padding: '16px 20px',
        borderRadius: '24px',
        boxShadow: '0 10px 25px rgba(2, 136, 209, 0.1)',
        border: '1px solid rgba(2, 136, 209, 0.1)'
      }}>
        <button 
          onClick={() => navigate('/agri-insights', { state: { explored: true } })} 
          style={{ background: '#f0f9ff', border: 'none', cursor: 'pointer', padding: '10px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }}
        >
          <IoMdArrowBack size={24} color="#0288d1" />
        </button>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ color: '#0288d1', margin: '0', fontSize: '20px', fontWeight: '800' }}>News Updates 🇮🇳</h1>
          {!loading && !error && activeApi && (
            <div style={{ fontSize: '11px', color: '#888', fontWeight: '600', marginTop: '4px', letterSpacing: '0.5px' }}>Powered by {activeApi}</div>
          )}
        </div>
        <div style={{ width: '44px' }} />
      </div>
      
      {/* Category Toggle Card */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        marginBottom: '25px', 
        background: 'white', 
        padding: '6px', 
        borderRadius: '16px', 
        boxShadow: '0 4px 15px rgba(2, 136, 209, 0.08)', 
        border: '1px solid rgba(2, 136, 209, 0.1)' 
      }}>
        <button
          onClick={() => setActiveCategory('agriculture')}
          style={{
            flex: 1, padding: '10px', borderRadius: '12px', border: 'none', cursor: 'pointer',
            fontWeight: 'bold', fontSize: '14px', transition: 'all 0.3s ease',
            background: activeCategory === 'agriculture' ? '#0288d1' : 'transparent',
            color: activeCategory === 'agriculture' ? 'white' : '#555'
          }}>
          🌾 Agriculture
        </button>
        <button
          onClick={() => setActiveCategory('other')}
          style={{
            flex: 1, padding: '10px', borderRadius: '12px', border: 'none', cursor: 'pointer',
            fontWeight: 'bold', fontSize: '14px', transition: 'all 0.3s ease',
            background: activeCategory === 'other' ? '#0288d1' : 'transparent',
            color: activeCategory === 'other' ? 'white' : '#555'
          }}>
          📰 General Info
        </button>
      </div>

      {/* State Management: Loading & Error */}
      {loading && (
        <div style={{ textAlign: 'center', color: '#0288d1', padding: '40px 0' }}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>📰</div>
          <p style={{ fontWeight: '600', fontSize: '16px' }}>Harvesting the latest updates...</p>
        </div>
      )}
      
      {error && (
        <div style={{ background: '#ffebee', color: '#c62828', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <p style={{ margin: 0 }}>{error}</p>
        </div>
      )}

      {/* News Feed Container */}
      {!loading && !error && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {currentNewsList.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
              <p>No specific news found for this category right now.</p>
              <p style={{ fontSize: '12px' }}>Try checking the other tab!</p>
            </div>
          ) : (
            currentNewsList.map((article, index) => (
              <a 
                key={index} 
                href={article.url} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div style={{ 
                  background: 'white', 
                  borderRadius: '20px', 
                  overflow: 'hidden', 
                  boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
                  transition: 'transform 0.2s ease',
                  border: '1px solid rgba(2, 136, 209, 0.1)'
                }}>
                  {/* ONLY show image if the URL genuinely exists */}
                  {article.image && (
                    <img 
                      src={article.image} 
                      alt="News Thumbnail" 
                      onError={(e) => { e.target.style.display = 'none'; }} // Instantly hide if the image fails to load
                      style={{ width: '100%', height: '180px', objectFit: 'cover' }} 
                    />
                  )}
                  
                  <div style={{ padding: '15px' }}>
                    <div style={{ marginBottom: '10px' }}>
                      <span style={{ background: '#e8f5e9', color: '#2e7d32', padding: '4px 10px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{article.source}</span>
                    </div>
                    <h2 style={{ fontSize: '17px', color: '#111', margin: '0 0 10px 0', lineHeight: '1.4', fontWeight: '700' }}>
                      {article.title}
                    </h2>
                    <p style={{ fontSize: '13px', color: '#555', margin: '0 0 15px 0', lineHeight: '1.5' }}>
                      {article.description ? `${article.description.substring(0, 120)}...` : 'Click to read the full story.'}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#999' }}>
                      <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                      <span style={{ color: '#0288d1', fontWeight: 'bold' }}>Read full story →</span>
                    </div>
                  </div>
                </div>
              </a>
            ))
          )}
          
          {/* Load More Button */}
          {currentNewsList.length > 0 && (
            <button 
              onClick={() => fetchNewsData(true)}
              disabled={fetchingMore}
              style={{
                padding: '14px', background: '#0288d1', color: 'white', border: 'none', 
                borderRadius: '16px', fontWeight: 'bold', fontSize: '14px', 
                cursor: fetchingMore ? 'not-allowed' : 'pointer', marginTop: '10px',
                boxShadow: '0 4px 15px rgba(2, 136, 209, 0.2)'
              }}
            >
              {fetchingMore ? 'Loading more news...' : 'Load More News ↻'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default NewsUpdates;