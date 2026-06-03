export default async function handler(req, res) {
    const { source, query, page = 1 } = req.query;

    if (!query || !source) {
        return res.status(400).json({ error: "Missing query or source" });
    }

    const PIXABAY_KEY = process.env.PIXABAY_API_KEY || process.env.VITE_PIXABAY_API_KEY;
    const PEXELS_KEY = process.env.PEXELS_API_KEY || process.env.VITE_PEXELS_API_KEY;

    let urls = [];

    try {
        if (source === 'pixabay' && PIXABAY_KEY) {
            const pixabayUrl = `https://pixabay.com/api/?key=${PIXABAY_KEY}&q=${encodeURIComponent(query)}&image_type=photo&per_page=3&page=${page}`;
            const pixRes = await fetch(pixabayUrl);
            if (pixRes.ok) {
                const data = await pixRes.json();
                if (data.hits) {
                    urls = data.hits.slice(0, 3).map(h => h.webformatURL).filter(Boolean);
                }
            } else {
                return res.status(pixRes.status).json({ error: "Pixabay API error" });
            }
        } 
        else if (source === 'pexels' && PEXELS_KEY) {
            const pexelsUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=3&page=${page}`;
            const pexRes = await fetch(pexelsUrl, {
                headers: { Authorization: PEXELS_KEY }
            });
            if (pexRes.ok) {
                const data = await pexRes.json();
                if (data.photos) {
                    urls = data.photos.slice(0, 3).map(p => p.src.medium).filter(Boolean);
                }
            } else {
                return res.status(pexRes.status).json({ error: "Pexels API error" });
            }
        }
        else {
            return res.status(401).json({ error: "Missing API key on the server" });
        }

        return res.status(200).json({ urls });

    } catch (error) {
        console.error(`Backend fetch failed for ${source}:`, error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
