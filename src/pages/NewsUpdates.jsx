import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoMdArrowBack } from 'react-icons/io';

const NewsUpdates = () => {
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeApi, setActiveApi] = useState(''); 

  useEffect(() => {
    const fetchAgriNews = async () => {
      setLoading(true);
      setError(null);

      const gnewsKey = import.meta.env.VITE_GNEWS_API_KEY;
      const newsDataKey = import.meta.env.VITE_NEWSDATA_API_KEY;

      if (!gnewsKey || !newsDataKey) {
        setError("API keys are missing. Check your .env file.");
        setLoading(false);
        return;
      }

      // Pro-level query: Targeting agriculture along with tech, markets, and schemes
      const searchQuery = encodeURIComponent('agriculture OR farming OR "agri-tech" OR subsidy OR "market rates" OR "government scheme"');
      
      try {
        // --- ATTEMPT 1: Primary API (GNews) ---
        // Added &country=in to restrict results strictly to India
        const gnewsUrl = `https://gnews.io/api/v4/search?q=${searchQuery}&country=in&lang=en&max=10&apikey=${gnewsKey}`;
        const gnewsResponse = await fetch(gnewsUrl);
        
        if (!gnewsResponse.ok) {
          throw new Error('GNews limit reached or failed.'); 
        }

        const gnewsData = await gnewsResponse.json();
        
        const formattedNews = gnewsData.articles.map(article => ({
          title: article.title,
          description: article.description,
          url: article.url,
          image: article.image,
          publishedAt: article.publishedAt,
          source: article.source?.name || 'Agri Update'
        }));

        setNews(formattedNews);
        setActiveApi('GNews (India Edition)');

      } catch (primaryError) {
        console.warn("Primary API failed, switching to backup...", primaryError.message);

        try {
          // --- ATTEMPT 2: Fallback API (NewsData.io) ---
          // Added &country=in here as well
          const newsDataUrl = `https://newsdata.io/api/1/news?apikey=${newsDataKey}&q=${searchQuery}&country=in&language=en`;
          const newsDataResponse = await fetch(newsDataUrl);

          if (!newsDataResponse.ok) {
            throw new Error('Both Primary and Backup news feeds are currently unavailable.');
          }

          const fallbackData = await newsDataResponse.json();

          const formattedNews = fallbackData.results.map(article => ({
            title: article.title,
            description: article.description,
            url: article.link, 
            image: article.image_url, 
            publishedAt: article.pubDate, 
            source: article.source_id || 'Agri Update'
          }));

          setNews(formattedNews);
          setActiveApi('NewsData (India Backup)');

        } catch (backupError) {
          setError(backupError.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAgriNews();
  }, []);

  return (
    <div style={{ padding: '20px', background: '#f0f9ff', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header Section */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <button 
          onClick={() => navigate('/agri-insights')} 
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0', marginRight: '15px' }}
        >
          <IoMdArrowBack size={28} color="#0288d1" />
        </button>
        <div>
          <h1 style={{ color: '#0288d1', margin: '0', fontSize: '24px' }}>Indian Agri News 🇮🇳</h1>
          {!loading && !error && activeApi && (
            <span style={{ fontSize: '10px', color: '#888' }}>Powered by {activeApi}</span>
          )}
        </div>
      </div>

      {/* State Management: Loading & Error */}
      {loading && (
        <div style={{ textAlign: 'center', color: '#0288d1', padding: '40px 0' }}>
          <p>Harvesting the latest updates...</p>
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
          {news.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666' }}>No news updates available at the moment.</p>
          ) : (
            news.map((article, index) => (
              <a 
                key={index} 
                href={article.url} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div style={{ 
                  background: 'white', 
                  borderRadius: '12px', 
                  overflow: 'hidden', 
                  boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                  transition: 'transform 0.2s ease',
                  border: '1px solid #e1f5fe'
                }}>
                  {article.image && (
                    <img 
                      src={article.image} 
                      alt="News Thumbnail" 
                      style={{ width: '100%', height: '180px', objectFit: 'cover' }} 
                    />
                  )}
                  <div style={{ padding: '15px' }}>
                    <p style={{ fontSize: '12px', color: '#4caf50', fontWeight: 'bold', margin: '0 0 5px 0', textTransform: 'uppercase' }}>
                      {article.source}
                    </p>
                    <h2 style={{ fontSize: '18px', color: '#333', margin: '0 0 10px 0', lineHeight: '1.4' }}>
                      {article.title}
                    </h2>
                    <p style={{ fontSize: '14px', color: '#666', margin: '0 0 15px 0', lineHeight: '1.5' }}>
                      {article.description ? `${article.description.substring(0, 100)}...` : 'Click to read the full story.'}
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
        </div>
      )}
    </div>
  );
};

export default NewsUpdates;