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

            // We will collect exactly 1 image from each of the 4 sources
            const pixabayKey = import.meta.env.VITE_PIXABAY_API_KEY || '44218659-1bc0dc9dbf1754e0c7104e171'; // Using a safe fallback if env is missing locally
            const pexelsKey = import.meta.env.VITE_PEXELS_API_KEY || 'N2yTq0Yk3l26XU2jZz9cZ7wSIfK7K8H3Y7zZ4nF6F0k3T4B5bV8jI8O9'; // Safe fallback
            
            // Fire all 4 requests at the exact same time for maximum speed
            const promises = [];

            // 1. Pixabay
            promises.push(
                fetch(`https://pixabay.com/api/?key=${pixabayKey}&q=${encodeURIComponent(cleanName)}&image_type=photo&per_page=3&page=${pageNum}`)
                .then(r => r.json()).then(d => d.hits && d.hits[0] ? d.hits[0].webformatURL : null).catch(() => null)
            );

            // 2. Pexels
            promises.push(
                fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(cleanName)}&per_page=3&page=${pageNum}`, { headers: { Authorization: pexelsKey } })
                .then(r => r.json()).then(d => d.photos && d.photos[0] ? d.photos[0].src.medium : null).catch(() => null)
            );

            // 3. Openverse
            promises.push(
                fetch(`https://api.openverse.org/v1/images/?q=${encodeURIComponent(cleanName)}&page=${pageNum}&page_size=3`)
                .then(r => r.json()).then(d => d.results && d.results[0] ? d.results[0].url : null).catch(() => null)
            );

            // 4. Wikimedia (Only page 1)
            if (pageNum === 1) {
                promises.push(
                    fetch(`https://commons.wikimedia.org/w/api.php?origin=*&action=query&generator=search&gsrsearch=${encodeURIComponent(primaryQuery)}&gsrnamespace=6&prop=imageinfo&iiprop=url&format=json&gsrlimit=1`)
                    .then(r => r.json()).then(d => {
                        if (d.query && d.query.pages) {
                            const pages = Object.values(d.query.pages);
                            return pages[0]?.imageinfo?.[0]?.url || null;
                        }
                        return null;
                    }).catch(() => null)
                );
            } else {
                // If not page 1, grab a second Openverse image to fill the 4th slot
                promises.push(
                    fetch(`https://api.openverse.org/v1/images/?q=${encodeURIComponent(cleanName)}&page=${pageNum}&page_size=3`)
                    .then(r => r.json()).then(d => d.results && d.results[1] ? d.results[1].url : null).catch(() => null)
                );
            }

            // Wait for all APIs to respond
            const fetchedUrls = await Promise.all(promises);
            
            // Filter out nulls and duplicates
            fetchedUrls.forEach(url => {
                if (url && url.match(/\.(jpeg|jpg|gif|png)$/i) && !results.includes(url)) {
                    results.push(url);
                }
            });

            // Display generic fallback only if completely empty on page 1
            if (pageNum === 1 && results.length === 0) {
                results.push('https://images.unsplash.com/photo-1595853035070-59a39fe84ee3?auto=format&q=100');
            }

            // Slice to EXACTLY 4 images to show variety from all sources
            const finalImages = results.slice(0, 4);
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
        ? defaultImages.slice(defaultPage * 4, (defaultPage * 4) + 4)
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

            {/* Images Grid - Updated to show 4 images in a 2x2 or 4-col layout */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '16px' }}>
                {currentDisplayImages.map((imgUrl, index) => {
                    const isSelected = currentSelection === imgUrl;
                    const globalIndex = showDefaults ? (defaultPage * 4) + index + 1 : index + 1;
                    
                    return (
                        <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div 
                                onClick={() => onSelectImage(imgUrl)}
                                style={{ 
                                    height: '110px', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', position: 'relative',
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
                            onClick={() => setDefaultPage((prev) => (prev + 1) % Math.ceil(defaultImages.length / 4))}
                            style={{ flex: 1, padding: '10px', backgroundColor: '#f1f5f9', color: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                        >
                            <RefreshCw size={14} /> Next 4 Defaults
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
