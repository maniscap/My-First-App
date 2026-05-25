// ModernTech.jsx API Handler
// Fetches YouTube videos for ModernTech.jsx page
// Route: POST /api/ModernTech
// Receives: { searchQuery, maxResults }
// Returns: Video search results from YouTube Data API

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { searchQuery, maxResults = 10, pageToken } = req.body;
    const apiKey = process.env.YOUTUBE_API_KEY || process.env.YOUTUBE_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'YouTube API key is missing in environment variables' });
    }

    if (!searchQuery) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Added relevanceLanguage=hi to match your original frontend code
    let url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${maxResults}&q=${encodeURIComponent(searchQuery)}&type=video&key=${apiKey}&relevanceLanguage=hi`;
    
    if (pageToken) {
      url += `&pageToken=${pageToken}`;
    }

    const response = await fetch(url, {
      headers: {
        "Referer": req.headers.referer || "http://localhost:3000"
      }
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to fetch from YouTube API');
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('ModernTech API Error:', error);
    res.status(500).json({ error: 'Failed to fetch YouTube videos', details: error.message });
  }
}
