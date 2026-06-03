import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Share2, Bookmark, Search, TrendingUp, Leaf, Droplet, TrendingDown, 
  Calendar, Clock, Eye, Heart, ChevronDown, Filter, X as CloseIcon
} from 'lucide-react';

// ===== CATEGORY CONFIGURATION FOR FARMERS =====
const FARMING_CATEGORIES = [
  {
    id: 'agriculture',
    name: 'Agriculture News',
    icon: '🌾',
    query: 'agriculture OR farming OR crops OR farmers OR cultivation OR yield',
    color: '#2ECC71',
    description: 'Latest farming techniques & crop updates'
  },
  {
    id: 'market',
    name: 'Market Rates',
    icon: '📊',
    query: 'agriculture prices OR market rates OR crop prices OR mandi OR wholesale',
    color: '#3498DB',
    description: 'Current commodity prices & market trends'
  },
  {
    id: 'weather',
    name: 'Weather & Season',
    icon: '🌦️',
    query: 'weather forecast India OR monsoon OR rainfall OR climate farming',
    color: '#F39C12',
    description: 'Weather predictions & seasonal guidance'
  },
  {
    id: 'schemes',
    name: 'Government Schemes',
    icon: '📋',
    query: 'PM-KISAN OR subsidy OR government scheme farmers OR agricultural support',
    color: '#E74C3C',
    description: 'Subsidies, loans & farmer welfare programs'
  },
  {
    id: 'equipment',
    name: 'Agri-Tech & Equipment',
    icon: '⚙️',
    query: 'agricultural equipment OR farming machinery OR agri-tech OR irrigation OR drones',
    color: '#9B59B6',
    description: 'Modern farming tools & technology'
  },
  {
    id: 'organic',
    name: 'Organic Farming',
    icon: '🍃',
    query: 'organic farming OR natural farming OR pesticide OR fertilizer OR sustainable agriculture',
    color: '#16A085',
    description: 'Organic & sustainable farming practices'
  },
  {
    id: 'all',
    name: 'All News',
    icon: '📰',
    query: 'agriculture OR farming OR crops OR farmers India',
    color: '#95A5A6',
    description: 'Latest updates from all sectors'
  }
];

// ===== MAIN COMPONENT =====
const NewsUpdates = () => {
  const navigate = useNavigate();
  
  // State Management
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [imageKey, setImageKey] = useState('image');
  const [apiSource, setApiSource] = useState('Loading...');
  const [selectedCategory, setSelectedCategory] = useState(FARMING_CATEGORIES[0]);
  const [searchInput, setSearchInput] = useState('');
  const [savedArticles, setSavedArticles] = useState([]);
  const [showSaved, setShowSaved] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('recent'); // recent, trending, mostRead

  const scrollRef = useRef(null);
  const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=1000&auto=format&fit=crop';

  // Utility to decode HTML entities (like &quot;, &#39;) in titles and descriptions
  const decodeHTML = (html) => {
    if (!html) return '';
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  };

  // Load saved articles from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedNews');
    if (saved) setSavedArticles(JSON.parse(saved));
  }, []);

  // Fetch News
  const fetchNews = useCallback(async (isLoadMore = false, overrideQuery = null) => {
    setLoading(true);
    setError(null);

    try {
      const query = overrideQuery !== null ? overrideQuery : (searchInput || selectedCategory.query);

      const response = await fetch('/api/NewsUpdates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          searchQuery: query,
          isLoadMore,
          page: isLoadMore ? page + 1 : 1,
          nextPageToken
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch news');
      }

      setImageKey(data.imageKey);
      setApiSource(data.source);
      setNextPageToken(data.nextPageToken);

      const newArticles = data.articles || [];

      if (isLoadMore) {
        setArticles(prev => [...prev, ...newArticles]);
        setPage(prev => prev + 1);
      } else {
        setArticles(newArticles);
        setPage(1);
      }
    } catch (err) {
      console.error('News fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchInput, page, nextPageToken]);

  // Initial Load
  useEffect(() => {
    setArticles([]);
    setPage(1);
    setSearchInput('');
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    fetchNews(false, selectedCategory.query);
  }, [selectedCategory]);

  // Handle Search
  const handleSearch = (e) => {
    e.preventDefault();
    setArticles([]);
    setPage(1);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;

    if (searchInput.trim()) {
      fetchNews(false);
    } else {
      fetchNews(false, selectedCategory.query);
    }
  };

  // Handle Clear Search
  const handleClearSearch = () => {
    setSearchInput('');
    setArticles([]);
    setPage(1);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    fetchNews(false, selectedCategory.query);
  };

  // Toggle Save Article
  const toggleSave = (article) => {
    const isAlreadySaved = savedArticles.some(a => a.url === article.url || a.link === article.url);
    
    if (isAlreadySaved) {
      const updated = savedArticles.filter(a => a.url !== article.url && a.link !== article.url);
      setSavedArticles(updated);
      localStorage.setItem('savedNews', JSON.stringify(updated));
    } else {
      const updated = [...savedArticles, article];
      setSavedArticles(updated);
      localStorage.setItem('savedNews', JSON.stringify(updated));
    }
  };

  // Share Article
  const shareArticle = (article) => {
    const text = `Check this farming news: ${decodeHTML(article.title)}\n${article.url || article.link}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Farming News',
        text: text,
      }).catch(err => console.log('Share failed:', err));
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(text);
      alert('Link copied to clipboard!');
    }
  };

  // Calculate Reading Time
  const getReadingTime = (text) => {
    if (!text) return '2 min';
    const words = text.split(' ').length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return `${minutes} min`;
  };

  // Format Time
  const formatTime = (dateString) => {
    if (!dateString) return 'Recent';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    const options = { month: 'short', day: 'numeric' };
    if (diffDays > 365) options.year = 'numeric';
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  // Get Credibility Badge
  const getSourceBadge = (source) => {
    const trustedSources = ['BBC', 'Reuters', 'AP', 'The Hindu', 'Indian Express', 'Hindustan Times'];
    const isTrusted = trustedSources.some(s => source?.includes(s));
    
    return {
      color: isTrusted ? '#27AE60' : '#3498DB',
      label: isTrusted ? '✓ Verified' : '📰 News',
      trusted: isTrusted
    };
  };

  // Render Article Card
  const renderArticleCard = (article, index, isSaved = false) => {
    const title = decodeHTML(article.title || 'Untitled');
    const desc = decodeHTML(article.description || article.content || 'Read more on the original source...');
    const link = article.url || article.link;
    const date = article.publishedAt || article.pubDate;
    const sourceName = article.source?.name || article.source_id || 'Agri News';
    const img = article[imageKey] || FALLBACK_IMAGE;
    
    const isSavedArticle = savedArticles.some(a => (a.url || a.link) === (article.url || article.link));
    const sourceInfo = getSourceBadge(sourceName);
    const readingTime = getReadingTime(desc);

    return (
      <motion.div
        key={`${article.url || article.link}-${index}`}
        style={styles.card}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ delay: index * 0.05 }}
        whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}
      >
        {/* Image with Overlay */}
        <div style={styles.imageContainer}>
          <img
            src={img}
            alt={title}
            style={styles.image}
            onError={(e) => {
              if (e.target.src !== FALLBACK_IMAGE) e.target.src = FALLBACK_IMAGE;
            }}
          />
          <div style={styles.imageOverlay}>
            <span style={{ ...styles.categoryTag, backgroundColor: selectedCategory.color }}>
              {selectedCategory.icon} {selectedCategory.name}
            </span>
          </div>
        </div>

        {/* Content */}
        <div style={styles.content}>
          {/* Meta Information */}
          <div style={styles.metaRow}>
            <div style={styles.metaLeft}>
              <span style={{ ...styles.sourceBadge, color: sourceInfo.color, borderColor: sourceInfo.color }}>
                {sourceInfo.label}
              </span>
              <span style={styles.metaText}>
                <Clock size={14} style={{ marginRight: '4px' }} /> {readingTime} read
              </span>
            </div>
            <span style={styles.timeAgo}>{formatTime(date)}</span>
          </div>

          {/* Title */}
          <h3 style={styles.cardTitle}>{title}</h3>

          {/* Description */}
          <p style={styles.desc}>{desc}</p>

          {/* Action Buttons & Footer */}
          <div style={styles.cardFooter}>
            <div style={styles.actions}>
              <motion.button
                style={{
                  ...styles.actionBtn,
                  background: isSavedArticle ? '#E74C3C' : 'rgba(255,255,255,0.05)'
                }}
                onClick={() => toggleSave(article)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                title={isSavedArticle ? 'Remove from saved' : 'Save for later'}
              >
                <Bookmark size={16} fill={isSavedArticle ? 'currentColor' : 'none'} />
              </motion.button>

              <motion.button
                style={styles.actionBtn}
                onClick={() => shareArticle(article)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                title="Share news"
              >
                <Share2 size={16} />
              </motion.button>
            </div>

            <motion.a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.readMoreBtn}
              whileHover={{ paddingRight: '20px' }}
              whileTap={{ scale: 0.98 }}
            >
              Read Article →
            </motion.a>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <>
      {/* Background */}
      <div style={styles.bg}>
        <div style={styles.overlay} />
      </div>

      <div style={styles.page}>
        <style>{`
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
        
        <div style={styles.appWrapper}>
          <div style={styles.topSection}>
        {/* HEADER */}
        <div style={styles.header}>
          <button style={styles.backBtn} onClick={() => navigate('/Consumer_HomePage')} title="Go back">
            <CloseIcon size={24} />
          </button>
          <div style={styles.headerContent}>
            <h1 style={styles.mainTitle}>🌾 Farming News</h1>
            <p style={styles.subtitle}>Latest updates for Indian farmers</p>
          </div>
          <motion.button
            style={styles.savedBtn}
            onClick={() => setShowSaved(!showSaved)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="View saved articles"
          >
            <Bookmark size={20} fill={showSaved ? 'currentColor' : 'none'} />
            <span style={styles.savedCount}>{savedArticles.length}</span>
          </motion.button>
        </div>

        {/* SEARCH & FILTERS */}
        <div style={styles.controlPanel}>
          {/* Search Bar */}
          <form onSubmit={handleSearch} style={styles.searchContainer}>
            <Search size={20} style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search farming news... (e.g., 'mandi rates', 'irrigation', 'subsidy')"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={styles.searchInput}
            />
            {searchInput && (
              <motion.button
                type="button"
                style={styles.clearBtn}
                onClick={handleClearSearch}
                whileTap={{ scale: 0.95 }}
              >
                <CloseIcon size={18} />
              </motion.button>
            )}
          </form>

          {/* Filter Toggle */}
          <motion.button
            style={styles.filterBtn}
            onClick={() => setShowFilters(!showFilters)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Filter size={20} /> {showFilters ? 'Hide' : 'Filter'}
          </motion.button>
        </div>

        {/* CATEGORY FILTER */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              style={styles.filterPanel}
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
            <div style={styles.categoryGrid}>
              {FARMING_CATEGORIES.map((category) => (
                <motion.button
                  key={category.id}
                  style={{
                    ...styles.categoryBtn,
                    background: selectedCategory.id === category.id
                      ? 'rgba(255,255,255,0.1)'
                      : 'rgba(255,255,255,0.02)',
                    borderColor: selectedCategory.id === category.id ? category.color : 'rgba(255,255,255,0.1)',
                    borderTop: selectedCategory.id === category.id ? `1px solid ${category.color}` : '1px solid rgba(255,255,255,0.25)',
                    borderLeft: selectedCategory.id === category.id ? `1px solid ${category.color}` : '1px solid rgba(255,255,255,0.15)',
                  }}
                  onClick={() => {
                    if (selectedCategory.id === category.id) {
                      // Refresh active category
                      setArticles([]);
                      setPage(1);
                      setSearchInput('');
                      if (scrollRef.current) scrollRef.current.scrollTop = 0;
                      fetchNews(false, category.query);
                    } else {
                      setSelectedCategory(category);
                    }
                    setShowFilters(false);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span style={styles.categoryIcon}>{category.icon}</span>
                  <div style={styles.categoryInfo}>
                    <div style={styles.categoryName}>{category.name}</div>
                    <div style={styles.categoryDesc}>{category.description}</div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* MAIN CONTENT */}
        <div className="hide-scrollbar" style={styles.scrollContent} ref={scrollRef}>
        <div style={styles.stage}>
          <AnimatePresence>
            {/* Showing Saved Articles */}
            {showSaved && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={styles.savedSection}
              >
                <div style={styles.savedHeader}>
                  <h2 style={styles.savedTitle}>📚 Saved Articles ({savedArticles.length})</h2>
                  <motion.button
                    style={styles.closeBtn}
                    onClick={() => setShowSaved(false)}
                    whileTap={{ scale: 0.95 }}
                  >
                    <CloseIcon size={24} />
                  </motion.button>
                </div>

                {savedArticles.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.emptyState}>
                    <Bookmark size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                    <p style={styles.emptyText}>No saved articles yet.</p>
                    <p style={{ ...styles.emptyText, fontSize: '13px', opacity: 0.6 }}>
                      Tap the bookmark icon to save news for later reading.
                    </p>
                  </motion.div>
                ) : (
                  <div style={styles.grid}>
                    {savedArticles.map((article, index) => renderArticleCard(article, index, true))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Error State */}
            {error && !showSaved && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.errorBox}>
                <div style={styles.errorContent}>
                  <p style={styles.errorText}>⚠️ {error}</p>
                  <motion.button
                    style={styles.retryBtn}
                    onClick={() => fetchNews(false)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    🔄 Try Again
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* No Articles */}
            {articles.length === 0 && !loading && !error && !showSaved && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.emptyState}>
                <Leaf size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                <p style={styles.emptyText}>No news found in this category</p>
                <p style={{ ...styles.emptyText, fontSize: '13px', opacity: 0.6 }}>
                  Try a different category or search term
                </p>
              </motion.div>
            )}

            {/* Articles Grid */}
            {articles.length > 0 && !showSaved && (
              <div style={styles.grid}>
                {articles.map((article, index) => renderArticleCard(article, index))}
              </div>
            )}
          </AnimatePresence>

          {/* Loading State */}
          {loading && !showSaved && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={styles.loadingContainer}
            >
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  style={styles.skeletonCard}
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2, delay: i * 0.2 }}
                />
              ))}
              <p style={styles.loadingText}>📡 Fetching latest farming news...</p>
            </motion.div>
          )}

          {/* Load More Button */}
          {articles.length > 0 && !loading && !error && !showSaved && (
            <motion.button
              style={styles.loadMoreBtn}
              onClick={() => fetchNews(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              📰 Load More News
            </motion.button>
          )}
        </div>

        {/* Footer Info */}
        {articles.length > 0 && !showSaved && (
          <motion.div
            style={styles.footerInfo}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p style={styles.footerText}>
              Powered by {apiSource} • {articles.length} articles loaded • 🇮🇳 India Edition
            </p>
          </motion.div>
        )}
      </div>
      </div>
      </div>
    </>
  );
};


// ===== ENHANCED STYLES FOR MAXIMUM UI/UX =====
const styles = {
  // ===== LAYOUT =====
  bg: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    backgroundImage: 'url("https://cdn.wallpapersafari.com/96/60/BSGmdb.jpg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    backgroundColor: 'rgba(10, 15, 20, 0.45)',
    backgroundImage: 'linear-gradient(rgba(46, 204, 113, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(46, 204, 113, 0.02) 1px, transparent 1px)',
    backgroundSize: '40px 40px',
  },
  page: {
    position: 'relative',
    zIndex: 10,
    padding: '16px',
    minHeight: '100dvh',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: 'white',
    paddingBottom: '60px',
  },

  // ===== HEADER =====
  header: {
    background: 'rgba(255, 255, 255, 0.02)',
    transform: 'translateZ(0)', willChange: 'transform, backdrop-filter', backdropFilter: 'blur(30px) saturate(120%)',
    WebkitBackdropFilter: 'blur(30px) saturate(120%)',
    width: '100%',
    maxWidth: '600px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '18px 20px',
    borderRadius: '28px',
    marginBottom: '20px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderTop: '1px solid rgba(255, 255, 255, 0.35)',
    borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: 'inset 0 2px 5px rgba(255, 255, 255, 0.25), inset 0 -2px 5px rgba(0, 0, 0, 0.1), 0 10px 40px rgba(0, 0, 0, 0.2)',
    position: 'sticky',
    top: '10px',
    zIndex: 50,
    boxSizing: 'border-box',
    gap: '12px',
  },
  backBtn: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderTop: '1px solid rgba(255, 255, 255, 0.35)',
    borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
    color: 'white',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s',
    flexShrink: 0,
    boxShadow: 'inset 0 2px 4px rgba(255, 255, 255, 0.25), inset 0 -1px 2px rgba(0, 0, 0, 0.1), 0 4px 10px rgba(0, 0, 0, 0.1)'
  },
  headerContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  mainTitle: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #2ECC71 0%, #27AE60 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    color: 'transparent',
  },
  subtitle: {
    margin: 0,
    fontSize: '12px',
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
  },
  savedBtn: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderTop: '1px solid rgba(255, 255, 255, 0.35)',
    borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
    color: '#E67E22',
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    transition: 'all 0.3s',
    flexShrink: 0,
    boxShadow: 'inset 0 2px 4px rgba(255, 255, 255, 0.25), inset 0 -1px 2px rgba(0, 0, 0, 0.1), 0 4px 10px rgba(0, 0, 0, 0.1)'
  },
  savedCount: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    background: '#E74C3C',
    color: 'white',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: 'bold',
  },

  // ===== CONTROL PANEL =====
  controlPanel: {
    width: '100%',
    maxWidth: '600px',
    display: 'flex',
    gap: '12px',
    marginBottom: '16px',
    boxSizing: 'border-box',
  },
  searchContainer: {
    flex: 1,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(255, 255, 255, 0.02)',
    transform: 'translateZ(0)', willChange: 'transform, backdrop-filter', backdropFilter: 'blur(25px) saturate(120%)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderTop: '1px solid rgba(255, 255, 255, 0.35)',
    borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '16px',
    boxShadow: 'inset 0 2px 5px rgba(255, 255, 255, 0.2), inset 0 -2px 5px rgba(0, 0, 0, 0.1), 0 8px 20px rgba(0, 0, 0, 0.15)'
  },
  searchIcon: {
    position: 'absolute',
    left: '16px',
    color: 'rgba(255,255,255,0.4)',
    pointerEvents: 'none',
    zIndex: 2,
  },
  searchInput: {
    width: '100%',
    background: 'transparent',
    border: 'none',
    color: 'white',
    padding: '12px 16px 12px 44px',
    borderRadius: '16px',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.3s',
    boxSizing: 'border-box',
  },
  clearBtn: {
    position: 'absolute',
    right: '8px',
    background: 'rgba(255,255,255,0.1)',
    border: 'none',
    color: 'white',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  filterBtn: {
    background: 'rgba(255, 255, 255, 0.05)',
    transform: 'translateZ(0)', willChange: 'transform, backdrop-filter', backdropFilter: 'blur(25px) saturate(120%)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderTop: '1px solid rgba(255, 255, 255, 0.35)',
    borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
    color: 'white',
    padding: '12px 16px',
    borderRadius: '16px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s',
    flexShrink: 0,
    boxShadow: 'inset 0 2px 4px rgba(255, 255, 255, 0.2), inset 0 -1px 3px rgba(0, 0, 0, 0.1), 0 4px 15px rgba(0, 0, 0, 0.1)'
  },

  // ===== FILTER PANEL =====
  filterPanel: {
    width: '100%',
    maxWidth: '600px',
    background: 'rgba(255, 255, 255, 0.02)',
    transform: 'translateZ(0)', willChange: 'transform, backdrop-filter', backdropFilter: 'blur(30px) saturate(120%)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderTop: '1px solid rgba(255, 255, 255, 0.35)',
    borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: 'inset 0 2px 5px rgba(255, 255, 255, 0.25), inset 0 -2px 5px rgba(0, 0, 0, 0.15), 0 10px 30px rgba(0, 0, 0, 0.2)',
    borderRadius: '20px',
    padding: '16px',
    marginBottom: '16px',
    boxSizing: 'border-box',
  },
  categoryGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    width: '100%',
  },
  categoryBtn: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderTop: '1px solid rgba(255, 255, 255, 0.25)',
    borderLeft: '1px solid rgba(255, 255, 255, 0.15)',
    boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.2), inset 0 -1px 2px rgba(0, 0, 0, 0.1)',
    color: 'white',
    padding: '12px',
    borderRadius: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    transition: 'all 0.3s',
    fontSize: '13px',
  },
  categoryIcon: {
    fontSize: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '24px',
  },
  categoryInfo: {
    textAlign: 'left',
    flex: 1,
  },
  categoryName: {
    fontWeight: '600',
    fontSize: '12px',
    marginBottom: '2px',
  },
  categoryDesc: {
    fontSize: '10px',
    opacity: 0.6,
  },

  // ===== MAIN STAGE =====
  stage: {
    width: '100%',
    maxWidth: '600px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    boxSizing: 'border-box',
  },
  grid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '100%',
  },

  // ===== ARTICLE CARD =====
  card: {
    background: 'rgba(255, 255, 255, 0.02)',
    transform: 'translateZ(0)', willChange: 'transform, backdrop-filter', backdropFilter: 'blur(30px) saturate(120%)',
    WebkitBackdropFilter: 'blur(30px) saturate(120%)',
    borderRadius: '24px',
    overflow: 'hidden',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderTop: '1px solid rgba(255, 255, 255, 0.35)',
    borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: 'inset 0 2px 5px rgba(255, 255, 255, 0.25), inset 0 -2px 5px rgba(0, 0, 0, 0.15), 0 10px 30px rgba(0, 0, 0, 0.2)',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: '180px',
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.4s',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 100%)',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  categoryTag: {
    alignSelf: 'flex-start',
    color: 'white',
    padding: '6px 12px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: 'bold',
    transform: 'translateZ(0)', willChange: 'transform, backdrop-filter', backdropFilter: 'blur(10px)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  content: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    flex: 1,
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '12px',
    gap: '8px',
    flexWrap: 'wrap',
  },
  metaLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  sourceBadge: {
    padding: '4px 10px',
    borderRadius: '8px',
    fontSize: '11px',
    fontWeight: '600',
    border: '1px solid currentColor',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  metaText: {
    display: 'flex',
    alignItems: 'center',
    color: 'rgba(255,255,255,0.5)',
    fontSize: '11px',
  },
  timeAgo: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: '11px',
    fontWeight: '500',
  },
  cardTitle: {
    margin: 0,
    fontSize: '15px',
    fontWeight: '700',
    lineHeight: '1.5',
    color: 'white',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  desc: {
    margin: 0,
    fontSize: '13px',
    color: 'rgba(255,255,255,0.65)',
    lineHeight: '1.5',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: '12px',
    borderTop: '1px solid rgba(46, 204, 113, 0.1)',
    gap: '12px',
  },
  actions: {
    display: 'flex',
    gap: '8px',
  },
  actionBtn: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderTop: '1px solid rgba(255, 255, 255, 0.25)',
    borderLeft: '1px solid rgba(255, 255, 255, 0.15)',
    color: '#2ECC71',
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    fontSize: '16px',
    boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.2), 0 4px 10px rgba(0,0,0,0.1)'
  },
  readMoreBtn: {
    background: 'linear-gradient(135deg, #2ECC71 0%, #27AE60 100%)',
    color: 'white',
    textDecoration: 'none',
    padding: '8px 14px',
    borderRadius: '10px',
    fontWeight: '600',
    fontSize: '12px',
    transition: 'all 0.3s',
    marginLeft: 'auto',
    textAlign: 'center',
    border: 'none',
    borderTop: '1px solid rgba(255, 255, 255, 0.4)',
    cursor: 'pointer',
    boxShadow: 'inset 0 2px 4px rgba(255, 255, 255, 0.3), 0 4px 10px rgba(46, 204, 113, 0.3)'
  },

  // ===== SAVED SECTION =====
  savedSection: {
    width: '100%',
    maxWidth: '600px',
    borderRadius: '24px',
    background: 'rgba(255, 255, 255, 0.02)',
    transform: 'translateZ(0)', willChange: 'transform, backdrop-filter', backdropFilter: 'blur(30px) saturate(120%)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderTop: '1px solid rgba(255, 255, 255, 0.35)',
    borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: 'inset 0 2px 5px rgba(255, 255, 255, 0.25), inset 0 -2px 5px rgba(0, 0, 0, 0.15), 0 10px 30px rgba(0, 0, 0, 0.2)',
    overflow: 'hidden',
  },
  savedHeader: {
    padding: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(230, 126, 34, 0.2)',
    background: 'rgba(230, 126, 34, 0.1)',
  },
  savedTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '700',
    color: '#E67E22',
  },
  closeBtn: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderTop: '1px solid rgba(255, 255, 255, 0.35)',
    borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
    color: 'white',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    boxShadow: 'inset 0 2px 4px rgba(255, 255, 255, 0.25), inset 0 -1px 2px rgba(0, 0, 0, 0.1), 0 4px 10px rgba(0, 0, 0, 0.1)'
  },

  // ===== EMPTY STATES =====
  emptyState: {
    width: '100%',
    maxWidth: '600px',
    padding: '60px 20px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '24px',
    background: 'rgba(255, 255, 255, 0.02)',
    transform: 'translateZ(0)', willChange: 'transform, backdrop-filter', backdropFilter: 'blur(20px) saturate(120%)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderTop: '1px solid rgba(255, 255, 255, 0.25)',
    borderLeft: '1px solid rgba(255, 255, 255, 0.15)',
    boxShadow: 'inset 0 2px 5px rgba(255, 255, 255, 0.2), inset 0 -2px 5px rgba(0, 0, 0, 0.1)'
  },
  emptyText: {
    margin: '8px 0',
    fontSize: '14px',
    color: 'rgba(255,255,255,0.7)',
  },

  // ===== ERROR & LOADING STATES =====
  errorBox: {
    width: '100%',
    maxWidth: '600px',
    padding: '20px',
    borderRadius: '24px',
    background: 'rgba(231, 76, 60, 0.1)',
    transform: 'translateZ(0)', willChange: 'transform, backdrop-filter', backdropFilter: 'blur(20px) saturate(120%)',
    border: '1px solid rgba(231, 76, 60, 0.2)',
    borderTop: '1px solid rgba(231, 76, 60, 0.4)',
    borderLeft: '1px solid rgba(231, 76, 60, 0.3)',
    boxShadow: 'inset 0 2px 5px rgba(255, 255, 255, 0.2), inset 0 -2px 5px rgba(0, 0, 0, 0.1), 0 10px 30px rgba(231, 76, 60, 0.1)'
  },
  errorContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    textAlign: 'center',
  },
  errorText: {
    margin: 0,
    fontSize: '14px',
    color: '#FF6B6B',
    fontWeight: '500',
  },
  retryBtn: {
    background: 'linear-gradient(135deg, #E74C3C 0%, #C0392B 100%)',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '10px',
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  loadingContainer: {
    width: '100%',
    maxWidth: '600px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    alignItems: 'center',
    padding: '40px 20px',
  },
  skeletonCard: {
    width: '100%',
    height: '200px',
    borderRadius: '16px',
    background: 'linear-gradient(90deg, rgba(46,204,113,0.1), rgba(46,204,113,0.2), rgba(46,204,113,0.1))',
    backgroundSize: '200% 100%',
  },
  loadingText: {
    fontSize: '13px',
    color: '#2ECC71',
    fontWeight: '600',
    marginTop: '10px',
  },

  // ===== BUTTONS =====
  loadMoreBtn: {
    background: 'linear-gradient(135deg, #2ECC71 0%, #27AE60 100%)',
    color: 'white',
    border: 'none',
    padding: '14px 28px',
    borderRadius: '14px',
    fontWeight: '700',
    fontSize: '14px',
    cursor: 'pointer',
    marginTop: '20px',
    boxShadow: '0 8px 20px rgba(46, 204, 113, 0.3)',
    transition: 'all 0.3s',
  },

  // ===== FOOTER =====
  footerInfo: {
    width: '100%',
    maxWidth: '600px',
    padding: '16px',
    textAlign: 'center',
    background: 'rgba(20,20,20,0.5)',
    borderTop: '1px solid rgba(46, 204, 113, 0.1)',
  },
  footerText: {
    margin: 0,
    fontSize: '11px',
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '500',
  }
};

export default NewsUpdates;