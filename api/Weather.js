// Weather.js API Handler
// Fetches weather forecast and search suggestions securely
// Route: POST /api/Weather
// Receives: { action: 'forecast' | 'search', query: string }
// Returns: Weather data JSON

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, query } = req.body;
  const apiKey = process.env.WEATHER_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Weather API key not configured on server' });
  }

  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    let url = '';
    if (action === 'forecast') {
      url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(query)}&days=7&aqi=yes&alerts=yes`;
    } else if (action === 'search') {
      url = `https://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${encodeURIComponent(query)}`;
    } else {
      return res.status(400).json({ error: 'Invalid action provided' });
    }

    // Fetch from the external API
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    // Send data back to the frontend
    res.status(200).json(data);
  } catch (error) {
    console.error('Weather API Error:', error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
}