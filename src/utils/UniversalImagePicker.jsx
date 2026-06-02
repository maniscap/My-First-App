import React, { useState, useEffect } from 'react';
import { CheckCircle2, Search, Loader2, Image as ImageIcon, RefreshCw, Grid } from 'lucide-react';

const defaultImages = [
    "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400", 
    "https://images.unsplash.com/photo-1519999482648-25049ddd37b1?w=400",
    "https://images.unsplash.com/photo-1471194402529-8e0f5a675de6?w=400",
    "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=400",
    "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=400", 
    "https://images.unsplash.com/photo-1595853035070-59a39fe84ee3?w=400",
    "https://images.unsplash.com/photo-1557844352-761f2565b576?w=400",
    "https://images.unsplash.com/photo-1518843875459-f738682238a6?w=400",
    "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=400", 
    "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400",
    "https://images.unsplash.com/photo-1600788886242-5c96aabe3757?w=400",
    "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400",
    "https://images.unsplash.com/photo-1587049352847-81a56d773c1c?w=400", 
    "https://images.unsplash.com/photo-1620313627725-bdfbc92d19b4?w=400",
    "https://images.unsplash.com/photo-1611162458324-aae1eb4129a4?w=400",
    "https://images.unsplash.com/photo-1599598425947-3300262118ff?w=400",
    "https://images.unsplash.com/photo-1626200419109-3820202e8d35?w=400", 
    "https://images.unsplash.com/photo-1599785209707-a456fc1337bb?w=400",
    "https://images.unsplash.com/photo-1550617931-e17a7b70dce2?w=400",
    "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400",
    "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400", 
    "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=400",
    "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400",
    "https://images.unsplash.com/photo-1533758223637-251f50a80e46?w=400",
    "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400", 
    "https://images.unsplash.com/photo-1553456558-aff63285aaa1?w=400",
    "https://images.unsplash.com/photo-1604328471151-b52226907017?w=400",
    "https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=400", 
    "https://images.unsplash.com/photo-1604544026362-72d8294a2b96?w=400",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400"
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
                    return (
                        <div 
                            key={index}
                            onClick={() => onSelectImage(imgUrl)}
                            style={{ 
                                height: '100px', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', position: 'relative',
                                border: isSelected ? '3px solid #4CAF50' : '2px solid transparent',
                                boxShadow: isSelected ? '0 8px 20px rgba(76, 175, 80, 0.3)' : '0 2px 8px rgba(0,0,0,0.05)',
                                transition: 'all 0.2s ease', transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                                backgroundColor: '#f1f5f9'
                            }}
                        >
                            <img src={imgUrl} alt={`Option ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)' }}></div>
                            
                            {isSelected && (
                                <div style={{ position: 'absolute', top: '6px', right: '6px', backgroundColor: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2px', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}>
                                    <CheckCircle2 size={16} color="#4CAF50" fill="#e8f5e9" />
                                </div>
                            )}
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
