export default async function handler(req, res) {
    const { query, page = 1 } = req.query;

    if (!query) {
        return res.status(400).json({ error: "Missing query" });
    }

    const PIXABAY_KEY = process.env.PIXABAY_API_KEY;
    const PEXELS_KEY = process.env.PEXELS_API_KEY;
    
    let results = [];

    // 1. Fetch from Pixabay
    if (PIXABAY_KEY) {
        try {
            const pixabayUrl = `https://pixabay.com/api/?key=${PIXABAY_KEY}&q=${encodeURIComponent(query)}&image_type=photo&per_page=3&page=${page}`;
            const pixRes = await fetch(pixabayUrl);
            if (pixRes.ok) {
                const data = await pixRes.json();
                if (data.hits) {
                    data.hits.forEach(hit => {
                        if (hit.webformatURL) results.push(hit.webformatURL);
                    });
                }
            }
        } catch (error) {
            console.error("Pixabay fetch failed:", error);
        }
    }

    // 2. Fetch from Pexels
    if (PEXELS_KEY) {
        try {
            const pexelsUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=3&page=${page}`;
            const pexRes = await fetch(pexelsUrl, {
                headers: {
                    Authorization: PEXELS_KEY
                }
            });
            if (pexRes.ok) {
                const data = await pexRes.json();
                if (data.photos) {
                    data.photos.forEach(photo => {
                        if (photo.src && photo.src.medium) results.push(photo.src.medium);
                    });
                }
            }
        } catch (error) {
            console.error("Pexels fetch failed:", error);
        }
    }

    // Deduplicate and limit
    const uniqueResults = [...new Set(results)].slice(0, 6);

    return res.status(200).json({ images: uniqueResults });
}
