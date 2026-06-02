import React, { useState, useEffect } from 'react';
import { CheckCircle2, Search, Loader2, Image as ImageIcon, RefreshCw, Grid } from 'lucide-react';

const defaultImages = [
    "https://live.staticflickr.com/8519/8474947839_95d1ae895e_b.jpg",
    "https://live.staticflickr.com/5600/15445225125_466a65d8f0_b.jpg",
    "https://live.staticflickr.com/1366/1429183106_b84ca1eff6_m.jpg",
    "https://live.staticflickr.com/2841/10724352873_f4c1f1d62a_b.jpg",
    "https://live.staticflickr.com/2281/2409582661_22387a9d53.jpg",
    "https://live.staticflickr.com/18/23695009_f6588835f5.jpg",
    "https://live.staticflickr.com/199/499458167_fa582f64f4_b.jpg",
    "https://live.staticflickr.com/3383/4643773329_e84829b56a_b.jpg",
    "https://live.staticflickr.com/2636/3726819581_d900b78430_b.jpg",
    "https://live.staticflickr.com/227/513371114_f048acf9c3_b.jpg",
    "https://live.staticflickr.com/5097/5409192966_91c4e02a62.jpg",
    "https://live.staticflickr.com/6208/6064227108_201e743d6f_b.jpg",
    "https://live.staticflickr.com/130/411317929_1a62e5343d_b.jpg",
    "https://live.staticflickr.com/3505/3221086251_86961ee330_b.jpg",
    "https://live.staticflickr.com/5038/7199375694_91f04413ee_b.jpg",
    "https://live.staticflickr.com/4024/4415406430_d8433ae034_b.jpg",
    "https://live.staticflickr.com/1353/5143600065_6e398f1f6a_b.jpg",
    "https://live.staticflickr.com/2334/2223030510_f0b5139bc2_b.jpg",
    "https://live.staticflickr.com/2134/2212907384_a3114ecff5_b.jpg",
    "https://live.staticflickr.com/3262/3190155469_905aab7757.jpg",
    "https://live.staticflickr.com/7231/7206713736_6354fec037_b.jpg",
    "https://live.staticflickr.com/26/102791309_e99b16ee6e.jpg",
    "https://live.staticflickr.com/2909/14579916743_2e490e16aa_b.jpg",
    "https://live.staticflickr.com/8214/8302732166_89fcc9bf6b_b.jpg",
    "https://live.staticflickr.com/221/475600565_7a460f012e_b.jpg",
    "https://live.staticflickr.com/65535/50397215321_8fb28d1abe_b.jpg",
    "https://live.staticflickr.com/1359/745530631_7afb916353_b.jpg",
    "https://live.staticflickr.com/4135/4782183732_0ce56a8eb4_b.jpg",
    "https://live.staticflickr.com/3109/4558690694_014902bc07_b.jpg",
    "https://live.staticflickr.com/32/57128856_be5648209e_b.jpg"
];

const UniversalImagePicker = ({ searchTerm, categoryContext, onSelectImage, currentSelection }) => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [page, setPage] = useState(1);
    
    // Default Gallery States
    const [showDefaults, setShowDefaults] = useState(false);
    const [defaultPage, setDefaultPage] = useState(0);

    // Run fetch whenever search term changes (reset page to 1)
    useEffect(() => {
        if (!searchTerm || searchTerm.length < 2) return;
        
        setPage(1);
        setShowDefaults(false); // Close defaults if active
        
        const timeoutId = setTimeout(() => {
            fetchImages(1);
        }, 800);
        
        return () => clearTimeout(timeoutId);
    }, [searchTerm, categoryContext]);

    // Run fetch when 'page' state changes via Load More
    useEffect(() => {
        if (page > 1) {
            fetchImages(page);
        }
    }, [page]);

    const fetchImages = async (pageNum = 1) => {
        setLoading(true);
        if (pageNum === 1) setHasSearched(true);
        if (pageNum === 1) setImages([]);
        
        try {
            let cleanName = searchTerm.split('(')[0].split('/')[0].trim();
            const suffix = categoryContext ? ` ${categoryContext}` : '';
            const primaryQuery = suffix ? `${cleanName}${suffix}` : cleanName;
            
            const results = [];

            // 1. Fetch from Openverse using pagination
            const openverseUrl = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(cleanName)}&page=${pageNum}&page_size=4`;
            try {
                const resOpenverse = await fetch(openverseUrl);
                const dataOpenverse = await resOpenverse.json();
                if (dataOpenverse && dataOpenverse.results) {
                    dataOpenverse.results.forEach(img => {
                        if (img.url && img.url.match(/\.(jpeg|jpg|gif|png)$/i)) {
                            if (!results.includes(img.url)) results.push(img.url);
                        }
                    });
                }
            } catch (e) {
                console.error("Openverse fetch failed", e);
            }

            // 2. Fetch from Wikimedia Commons & Wiki ONLY on page 1 (since they don't do easy pagination)
            if (pageNum === 1) {
                const commonsUrl = `https://commons.wikimedia.org/w/api.php?origin=*&action=query&generator=search&gsrsearch=${encodeURIComponent(primaryQuery)}&gsrnamespace=6&prop=imageinfo&iiprop=url&format=json&gsrlimit=3`;
                try {
                    const resCommons = await fetch(commonsUrl);
                    const dataCommons = await resCommons.json();
                    if (dataCommons.query && dataCommons.query.pages) {
                        Object.values(dataCommons.query.pages).forEach(page => {
                            if (page.imageinfo && page.imageinfo[0] && page.imageinfo[0].url) {
                                const url = page.imageinfo[0].url;
                                if (url.match(/\.(jpeg|jpg|gif|png)$/i)) results.push(url);
                            }
                        });
                    }
                } catch (e) {}

                if (results.length < 3) {
                    const wikiUrl = `https://en.wikipedia.org/w/api.php?origin=*&action=query&generator=search&gsrsearch=${encodeURIComponent(primaryQuery)}&prop=pageimages&format=json&piprop=original&gsrlimit=2`;
                    try {
                        const resWiki = await fetch(wikiUrl);
                        const dataWiki = await resWiki.json();
                        if (dataWiki.query && dataWiki.query.pages) {
                            Object.values(dataWiki.query.pages).forEach(page => {
                                if (page.original && page.original.source) {
                                    const url = page.original.source;
                                    if (!results.includes(url) && url.match(/\.(jpeg|jpg|gif|png)$/i)) results.push(url);
                                }
                            });
                        }
                    } catch (e) {}
                }
            }

            // Provide generic fallback only if completely empty on page 1
            if (pageNum === 1 && results.length === 0) {
                results.push('https://images.unsplash.com/photo-1595853035070-59a39fe84ee3?auto=format&q=100');
            }

            const finalImages = results.slice(0, 3);
            setImages(finalImages);
            
            if (pageNum === 1 && (!currentSelection || !finalImages.includes(currentSelection))) {
                if (finalImages[0]) onSelectImage(finalImages[0]);
            }

        } catch (error) {
            console.error("Image search error", error);
            if (pageNum === 1) {
                const fallback = 'https://images.unsplash.com/photo-1595853035070-59a39fe84ee3?auto=format&q=100';
                setImages([fallback]);
                onSelectImage(fallback);
            }
        } finally {
            setLoading(false);
        }
    };

    if (!searchTerm || searchTerm.length < 2) return null;

    // Determine which images to display
    const currentDisplayImages = showDefaults 
        ? defaultImages.slice(defaultPage * 3, (defaultPage * 3) + 3)
        : images;

    return (
        <div style={{ marginTop: '16px', marginBottom: '24px', animation: 'fadeIn 0.3s ease' }}>
            {/* Header Area */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <label style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ImageIcon size={16} color={showDefaults ? "#f59e0b" : "#4CAF50"} />
                    {showDefaults ? "Default Image Gallery" : "Select Listing Image"}
                </label>
                {loading && <span style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}><Loader2 size={12} className="spin-animation" /> Searching...</span>}
            </div>

            {hasSearched && !loading && images.length === 0 && !showDefaults && (
                <p style={{ fontSize: '13px', color: '#64748b', fontStyle: 'italic', marginBottom: '12px' }}>No exact images found. Please try loading more or use defaults.</p>
            )}

            {/* Images Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
                {currentDisplayImages.map((imgUrl, index) => {
                    const isSelected = currentSelection === imgUrl;
                    const globalIndex = showDefaults ? (defaultPage * 3) + index + 1 : index + 1;
                    
                    return (
                        <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div 
                                onClick={() => onSelectImage(imgUrl)}
                                style={{ 
                                    height: '100px', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', position: 'relative',
                                    border: isSelected ? '3px solid #4CAF50' : '2px solid transparent',
                                    boxShadow: isSelected ? '0 8px 20px rgba(76, 175, 80, 0.3)' : '0 2px 8px rgba(0,0,0,0.05)',
                                    transition: 'all 0.2s ease', transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                                    backgroundColor: '#f1f5f9'
                                }}
                            >
                                <img src={imgUrl} alt={`Option ${globalIndex}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)' }}></div>
                                
                                {isSelected && (
                                    <div style={{ position: 'absolute', top: '6px', right: '6px', backgroundColor: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2px', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}>
                                        <CheckCircle2 size={16} color="#4CAF50" fill="#e8f5e9" />
                                    </div>
                                )}
                            </div>
                            
                            {/* Display image number for easy identification */}
                            <div style={{ textAlign: 'center', fontSize: '11px', fontWeight: '700', color: '#64748b' }}>
                                Image {globalIndex}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                {showDefaults ? (
                    <>
                        <button 
                            type="button"
                            onClick={() => setDefaultPage((prev) => (prev + 1) % 10)}
                            style={{ flex: 1, padding: '10px', backgroundColor: '#f1f5f9', color: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                        >
                            <RefreshCw size={14} /> Next 3 Defaults
                        </button>
                        <button 
                            type="button"
                            onClick={() => setShowDefaults(false)}
                            style={{ padding: '10px 16px', backgroundColor: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '12px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                        >
                            Back
                        </button>
                    </>
                ) : (
                    <>
                        <button 
                            type="button"
                            onClick={() => setPage(p => p + 1)}
                            disabled={loading}
                            style={{ flex: 1, padding: '10px', backgroundColor: '#f1f5f9', color: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '13px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', opacity: loading ? 0.7 : 1 }}
                        >
                            <RefreshCw size={14} className={loading ? 'spin-animation' : ''} /> Load More Images
                        </button>
                        <button 
                            type="button"
                            onClick={() => { setShowDefaults(true); setDefaultPage(0); }}
                            style={{ flex: 1, padding: '10px', backgroundColor: '#fff', color: '#f59e0b', border: '1px solid #fcd34d', borderRadius: '12px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                        >
                            <Grid size={14} /> See Defaults
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default UniversalImagePicker;
