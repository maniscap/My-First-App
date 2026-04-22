export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Checks for any variation of the TomTom key name you might have used
    const apiKey = process.env.TOMTOM_API_KEY || process.env.VITE_TOMTOM_API_KEY || process.env.TOMTOM_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: 'TOMTOM_API_KEY is missing' });
    }

    const { action } = req.body;

    // ACTION 1: Reverse Geocode (Lat/Lng -> Address)
    if (action === 'reverseGeocode') {
      const { lat, lng } = req.body;
      const url = `https://api.tomtom.com/search/2/reverseGeocode/${lat},${lng}.json?key=${apiKey}&radius=50`;
      const response = await fetch(url);
      return res.status(200).json(await response.json());
    }

    // ACTION 2: Search Query (Text -> Places)
    if (action === 'search') {
      const { query } = req.body;
      const url = `https://api.tomtom.com/search/2/search/${encodeURIComponent(query)}.json?key=${apiKey}&countrySet=IN&limit=10&typeahead=true`;
      const response = await fetch(url);
      return res.status(200).json(await response.json());
    }

    // ACTION 3: Smart Nearby Places
    if (action === 'nearby') {
      const { lat, lng, radius, categorySet } = req.body;
      const url = `https://api.tomtom.com/search/2/nearbySearch/.json?lat=${lat}&lon=${lng}&radius=${radius}&limit=15&categorySet=${categorySet}&key=${apiKey}`;
      const response = await fetch(url);
      return res.status(200).json(await response.json());
    }

    return res.status(400).json({ error: 'Invalid action requested' });
  } catch (error) {
    console.error('UserLocation API Error:', error);
    res.status(500).json({ error: 'Failed to fetch location data', details: error.message });
  }
}
