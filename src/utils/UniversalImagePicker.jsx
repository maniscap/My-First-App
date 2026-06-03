import React, { useState, useEffect } from 'react';
import { CheckCircle2, Search, Loader2, Image as ImageIcon, RefreshCw, Grid } from 'lucide-react';

const defaultImages = [
    // 1. Group of Assorted Fruits
    "https://images.pexels.com/photos/5677921/pexels-photo-5677921.jpeg?auto=compress&cs=tinysrgb&w=800",
    // 2. Group of Fresh Vegetables
    "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&w=800&q=80",
    // 3. Dairy Products (Milk, Cheese, Butter)
    "https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=800&q=80",
    // 4. Leafy Green Vegetables
    "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=80",
    // 5. Farm Fresh Eggs (Daily Products)
    "https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=800&q=80",
    // 6. Fresh Dairy & Honey (Daily Products)
    "https://images.pexels.com/photos/1393382/pexels-photo-1393382.jpeg?auto=compress&cs=tinysrgb&w=800",
    // 7. Nuts and Seeds Group
    "https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=800",
    // 8. Mixed Fresh Berries
    "https://images.pexels.com/photos/8248297/pexels-photo-8248297.jpeg?auto=compress&cs=tinysrgb&w=800",
    // 9. Colorful Spices and Condiments
    "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80",
    // 10. Assorted Farm Produce Basket
    "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=800&q=80",
    // 11. Vibrant Display of Fresh Market Vegetables
    "https://images.pexels.com/photos/37321079/pexels-photo-37321079.jpeg?auto=compress&cs=tinysrgb&w=800"
];

const UniversalImagePicker = ({ searchTerm, categoryContext, onSelectImage, currentSelection }) => {
    const [images, setImages] = useState({ pixabay: null, pexels: null, openverse: null, wikimedia: null });
    const [loading, setLoading] = useState({ pixabay: false, pexels: false, openverse: false, wikimedia: false });
    const [pages, setPages] = useState({ pixabay: 1, pexels: 1, openverse: 1, wikimedia: 1 });
    const [hasSearched, setHasSearched] = useState(false);
    
    const [showDefaults, setShowDefaults] = useState(false);
    const [defaultPage, setDefaultPage] = useState(0);

    // CRITICAL: Vite requires VITE_ prefix to load these into the browser safely
    const pixabayKey = import.meta.env.VITE_PIXABAY_API_KEY; 
    const pexelsKey = import.meta.env.VITE_PEXELS_API_KEY;

    useEffect(() => {
        if (!searchTerm || searchTerm.length < 2) return;
        
        setShowDefaults(false); 
        setPages({ pixabay: 1, pexels: 1, openverse: 1, wikimedia: 1 });
        setImages({ pixabay: null, pexels: null, openverse: null, wikimedia: null });
        
        const timeoutId = setTimeout(() => {
            setHasSearched(true);
            fetchAllSources(1);
        }, 800);
        
        return () => clearTimeout(timeoutId);
    }, [searchTerm, categoryContext]);

    const getCleanQuery = () => {
        let cleanName = searchTerm.split('(')[0].split('/')[0].trim();
        const suffix = categoryContext ? ` ${categoryContext}` : '';
        return suffix ? `${cleanName}${suffix}` : cleanName;
    };

    const fetchAllSources = (pageNum) => {
        fetchSource('pixabay', pageNum);
        fetchSource('pexels', pageNum);
        fetchSource('openverse', pageNum);
        fetchSource('wikimedia', pageNum);
    };

    const fetchSource = async (source, pageNum) => {
        const query = getCleanQuery();
        setLoading(prev => ({ ...prev, [source]: true }));

        try {
            let url = null;
            if (source === 'pixabay' || source === 'pexels') {
                // Call our secure Vercel Serverless Function instead of the public APIs
                const res = await fetch(`/api/fetchImages?source=${source}&query=${encodeURIComponent(query)}&page=${pageNum}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.url) url = data.url;
                } else {
                    console.error(`${source} Backend Error:`, res.statusText);
                }
            }
            else if (source === 'openverse') {
                const res = await fetch(`https://api.openverse.org/v1/images/?q=${encodeURIComponent(query)}&page=${pageNum}&page_size=5`);
                const data = await res.json();
                if (data.results && data.results[0]) url = data.results[0].url;
            }
            else if (source === 'wikimedia') {
                const res = await fetch(`https://commons.wikimedia.org/w/api.php?origin=*&action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=6&prop=imageinfo&iiprop=url&format=json&gsrlimit=10`);
                const data = await res.json();
                if (data.query && data.query.pages) {
                    const pagesArr = Object.values(data.query.pages);
                    const item = pagesArr[pageNum - 1] || pagesArr[0];
                    if (item && item.imageinfo) url = item.imageinfo[0].url;
                }
            }
            
            if (url) {
                setImages(prev => ({ ...prev, [source]: url }));
                if (!currentSelection) onSelectImage(url); // Auto select first found
            }
        } catch (e) {
            console.error(`Failed to fetch ${source}:`, e);
        } finally {
            setLoading(prev => ({ ...prev, [source]: false }));
        }
    };

    const handleReloadSource = (source) => {
        const nextPage = pages[source] + 1;
        setPages(prev => ({ ...prev, [source]: nextPage }));
        fetchSource(source, nextPage);
    };

    if (!searchTerm || searchTerm.length < 2) return null;

    return (
        <div style={{ marginTop: '16px', marginBottom: '24px', animation: 'fadeIn 0.3s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <label style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ImageIcon size={16} color={showDefaults ? "#f59e0b" : "#4CAF50"} />
                    {showDefaults ? "Default Image Gallery" : "Select Listing Image"}
                </label>
            </div>

            {showDefaults ? (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '16px' }}>
                        {defaultImages.slice(defaultPage * 4, (defaultPage * 4) + 4).map((imgUrl, index) => {
                            const isSelected = currentSelection === imgUrl;
                            const globalIndex = (defaultPage * 4) + index + 1;
                            return (
                                <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <div onClick={() => onSelectImage(imgUrl)}
                                        style={{ height: '110px', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', position: 'relative', border: isSelected ? '3px solid #4CAF50' : '2px solid transparent', boxShadow: isSelected ? '0 8px 20px rgba(76, 175, 80, 0.3)' : '0 2px 8px rgba(0,0,0,0.05)', transition: 'all 0.2s ease', transform: isSelected ? 'scale(1.02)' : 'scale(1)', backgroundColor: '#f1f5f9' }}
                                    >
                                        <img src={imgUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        {isSelected && (
                                            <div style={{ position: 'absolute', top: '6px', right: '6px', backgroundColor: '#fff', borderRadius: '50%', padding: '2px', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}>
                                                <CheckCircle2 size={16} color="#4CAF50" fill="#e8f5e9" />
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ textAlign: 'center', fontSize: '11px', fontWeight: '700', color: '#64748b' }}>Image {globalIndex}</div>
                                </div>
                            );
                        })}
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button type="button" onClick={() => setDefaultPage((prev) => (prev + 1) % Math.ceil(defaultImages.length / 4))} style={{ flex: 1, padding: '10px', backgroundColor: '#f1f5f9', color: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <RefreshCw size={14} /> Next 4 Defaults
                        </button>
                        <button type="button" onClick={() => setShowDefaults(false)} style={{ padding: '10px 16px', backgroundColor: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '12px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Back</button>
                    </div>
                </>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    
                    {['pixabay', 'pexels', 'openverse', 'wikimedia'].map(source => {
                        const imgUrl = images[source];
                        const isLoading = loading[source];
                        const isSelected = currentSelection === imgUrl;

                        return (
                            <div key={source} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '10px', backgroundColor: '#fff', borderRadius: '16px', border: isSelected ? '2px solid #4CAF50' : '1px solid #e2e8f0', boxShadow: isSelected ? '0 4px 12px rgba(76, 175, 80, 0.15)' : '0 2px 4px rgba(0,0,0,0.02)', transition: 'all 0.2s ease' }}>
                                
                                <div onClick={() => imgUrl && onSelectImage(imgUrl)}
                                    style={{ width: '90px', height: '70px', borderRadius: '10px', backgroundColor: '#f1f5f9', overflow: 'hidden', position: 'relative', cursor: imgUrl ? 'pointer' : 'default', flexShrink: 0 }}
                                >
                                    {isLoading ? (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 size={18} color="#94a3b8" className="spin-animation" /></div>
                                    ) : imgUrl ? (
                                        <>
                                            <img src={imgUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            {isSelected && (
                                                <div style={{ position: 'absolute', top: '4px', right: '4px', backgroundColor: '#fff', borderRadius: '50%', padding: '2px' }}>
                                                    <CheckCircle2 size={12} color="#4CAF50" fill="#e8f5e9" />
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#94a3b8', textAlign: 'center', padding: '4px' }}>No image</div>
                                    )}
                                </div>

                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', textTransform: 'capitalize' }}>From {source}</div>
                                    <button 
                                        type="button"
                                        onClick={() => handleReloadSource(source)}
                                        disabled={isLoading}
                                        style={{ alignSelf: 'flex-start', padding: '6px 12px', backgroundColor: '#f8fafc', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '11px', fontWeight: '600', cursor: isLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '4px', opacity: isLoading ? 0.7 : 1 }}
                                    >
                                        <RefreshCw size={12} className={isLoading ? 'spin-animation' : ''} /> {isLoading ? 'Searching...' : 'Try another'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    <button 
                        type="button"
                        onClick={() => { setShowDefaults(true); setDefaultPage(0); }}
                        style={{ width: '100%', padding: '12px', backgroundColor: '#fff', color: '#f59e0b', border: '1px dashed #fcd34d', borderRadius: '12px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '4px' }}
                    >
                        <Grid size={16} /> See the Default Image Gallery instead
                    </button>
                </div>
            )}
            
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .spin-animation {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default UniversalImagePicker;
