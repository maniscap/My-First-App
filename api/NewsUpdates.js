export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { searchQuery, isLoadMore, page = 1, nextPageToken } = req.body;
    
    // Reading exact keys as they appear in your .env file
    const gnewsKey = process.env.VITE_GNEWS_API_KEY || process.env.GNEWS_API_KEY;
    const newsDataKey = process.env.VITE_NEWSDATA_API_KEY || process.env.NEWSDATA_API_KEY;
    const newsApiKey = process.env.VITE_NEWS_RSS_KEY || process.env.NEWS_RSS_KEY || process.env.VITE_NEWS_API_KEY || process.env.NEWS_API_KEY; 

    if (!gnewsKey && !newsDataKey && !newsApiKey) {
      return res.status(500).json({ error: 'All News API keys are missing in environment variables' });
    }

    let lastError = null;

    // ATTEMPT 1: Primary API (GNews)
    if (gnewsKey) {
      try {
        const gnewsUrl = `https://gnews.io/api/v4/search?q=${encodeURIComponent(searchQuery)}&country=in&lang=en&max=10&page=${isLoadMore ? page + 1 : 1}&apikey=${gnewsKey}`;
        const gnewsResponse = await fetch(gnewsUrl);
        
        if (!gnewsResponse.ok) throw new Error('GNews limit reached or failed.');

        const data = await gnewsResponse.json();
        return res.status(200).json({ articles: data.articles, imageKey: 'image', source: 'GNews (India Edition)', nextPageToken: null });
      } catch (error) {
        console.warn("Primary API (GNews) failed, switching to backup...", error.message);
        lastError = error.message;
      }
    }

    // ATTEMPT 2: Fallback API 1 (NewsData.io)
    if (newsDataKey) {
      try {
        let newsDataUrl = `https://newsdata.io/api/1/news?apikey=${newsDataKey}&q=${encodeURIComponent(searchQuery)}&country=in&language=en&size=10&image=1`;
        if (isLoadMore && nextPageToken) {
          newsDataUrl += `&page=${nextPageToken}`;
        }
        
        const newsDataResponse = await fetch(newsDataUrl);
        if (!newsDataResponse.ok) throw new Error('NewsData limit reached or failed.');

        const data = await newsDataResponse.json();
        return res.status(200).json({ articles: data.results, imageKey: 'image_url', source: 'NewsData (India Backup)', nextPageToken: data.nextPage });
      } catch (error) {
        console.warn("Fallback API (NewsData) failed, switching to next backup...", error.message);
        lastError = error.message;
      }
    }

    // ATTEMPT 3: Fallback API 2 (NewsAPI)
    if (newsApiKey) {
      try {
        const targetPage = isLoadMore ? page + 1 : 1;
        const newsApiUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(searchQuery)}&apiKey=${newsApiKey}&pageSize=10&page=${targetPage}&language=en`;
        
        const newsApiResponse = await fetch(newsApiUrl);
        if (!newsApiResponse.ok) throw new Error('NewsAPI limit reached or failed.');

        const data = await newsApiResponse.json();
        // NewsAPI returns arrays inside 'articles' and images inside 'urlToImage'
        return res.status(200).json({ articles: data.articles, imageKey: 'urlToImage', source: 'NewsAPI (Fallback)', nextPageToken: null });
      } catch (error) {
        console.warn("Fallback API (NewsAPI) failed.", error.message);
        lastError = error.message;
      }
    }

    // If all available APIs fail
    throw new Error(`All feeds unavailable. Last error: ${lastError}`);
  } catch (error) {
    console.error('NewsUpdates API Error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch news' });
  }
}
