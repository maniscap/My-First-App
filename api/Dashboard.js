// Dashboard.jsx API Handler
// Fetches weather data for Dashboard.jsx page
// Route: POST /api/Dashboard
// Receives: { query, days, aqi }
// Returns: Weather data from WeatherAPI

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, days = 3, aqi = 'yes' } = req.body;
    const apiKey = process.env.WEATHER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'WEATHER_API_KEY is missing in environment variables' });
    }

    const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(query)}&days=${days}&aqi=${aqi}&alerts=yes`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to fetch weather data');
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Dashboard API Error:', error);
    res.status(500).json({ error: 'Failed to fetch Dashboard weather data', details: error.message });
  }
}
