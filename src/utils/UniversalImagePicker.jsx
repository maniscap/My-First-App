import React, { useState, useEffect } from 'react';
import { CheckCircle2, Search, Loader2, Image as ImageIcon } from 'lucide-react';

const UniversalImagePicker = ({ searchTerm, categoryContext, onSelectImage, currentSelection }) => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    useEffect(() => {
        if (!searchTerm || searchTerm.length < 2) return;
        
        // Debounce the search slightly
        const timeoutId = setTimeout(() => {
            fetchImages();
        }, 800);
        
        return () => clearTimeout(timeoutId);
    }, [searchTerm, categoryContext]);

    const fetchImages = async () => {
        setLoading(true);
        setHasSearched(true);
        setImages([]);
        
        try {
            let cleanName = searchTerm.split('(')[0].split('/')[0].trim();
            const suffix = categoryContext ? ` ${categoryContext}` : '';
            const primaryQuery = suffix ? `${cleanName}${suffix}` : cleanName;
            
            const results = [];

            // 1. Fetch from Wikimedia Commons (Best for general photos, tractors, tools, workers)
            const commonsUrl = `https://commons.wikimedia.org/w/api.php?origin=*&action=query&generator=search&gsrsearch=${encodeURIComponent(primaryQuery)}&gsrnamespace=6&prop=imageinfo&iiprop=url&format=json&gsrlimit=3`;
            try {
                const resCommons = await fetch(commonsUrl);
                const dataCommons = await resCommons.json();
                if (dataCommons.query && dataCommons.query.pages) {
                    Object.values(dataCommons.query.pages).forEach(page => {
                        if (page.imageinfo && page.imageinfo[0] && page.imageinfo[0].url) {
                            // Ensure it's a valid image extension to avoid PDFs/SVGs
                            const url = page.imageinfo[0].url;
                            if (url.match(/\.(jpeg|jpg|gif|png)$/i)) {
                                results.push(url);
                            }
                        }
                    });
                }
            } catch (e) {
                console.error("Commons fetch failed", e);
            }

            // 2. Fetch from Wikipedia Original Images (Best for specific crops/fruits/botanical)
            if (results.length < 3) {
                const wikiUrl = `https://en.wikipedia.org/w/api.php?origin=*&action=query&generator=search&gsrsearch=${encodeURIComponent(primaryQuery)}&prop=pageimages&format=json&piprop=original&gsrlimit=2`;
                try {
                    const resWiki = await fetch(wikiUrl);
                    const dataWiki = await resWiki.json();
                    if (dataWiki.query && dataWiki.query.pages) {
                        Object.values(dataWiki.query.pages).forEach(page => {
                            if (page.original && page.original.source) {
                                const url = page.original.source;
                                if (!results.includes(url) && url.match(/\.(jpeg|jpg|gif|png)$/i)) {
                                    results.push(url);
                                }
                            }
                        });
                    }
                } catch (e) {
                    console.error("Wiki fetch failed", e);
                }
            }
            
            // 3. Fallback without suffix if we still have nothing
            if (results.length === 0 && suffix) {
                const fallbackUrl = `https://commons.wikimedia.org/w/api.php?origin=*&action=query&generator=search&gsrsearch=${encodeURIComponent(cleanName)}&gsrnamespace=6&prop=imageinfo&iiprop=url&format=json&gsrlimit=3`;
                try {
                    const resFb = await fetch(fallbackUrl);
                    const dataFb = await resFb.json();
                    if (dataFb.query && dataFb.query.pages) {
                        Object.values(dataFb.query.pages).forEach(page => {
                            if (page.imageinfo && page.imageinfo[0] && page.imageinfo[0].url) {
                                const url = page.imageinfo[0].url;
                                if (url.match(/\.(jpeg|jpg|gif|png)$/i)) {
                                    results.push(url);
                                }
                            }
                        });
                    }
                } catch (e) { }
            }

            // If completely empty, provide an Unsplash generic fallback
            if (results.length === 0) {
                results.push('https://images.unsplash.com/photo-1595853035070-59a39fe84ee3?auto=format&q=100');
            }

            // Take max 3 images and select the first one automatically if nothing is selected
            const finalImages = results.slice(0, 3);
            setImages(finalImages);
            
            if (!currentSelection || !finalImages.includes(currentSelection)) {
                onSelectImage(finalImages[0]);
            }

        } catch (error) {
            console.error("Image search error", error);
            const fallback = 'https://images.unsplash.com/photo-1595853035070-59a39fe84ee3?auto=format&q=100';
            setImages([fallback]);
            onSelectImage(fallback);
        } finally {
            setLoading(false);
        }
    };

    if (!searchTerm || searchTerm.length < 2) {
        return null; // Don't show anything if no search term
    }

    return (
        <div style={{ marginTop: '16px', marginBottom: '24px', animation: 'fadeIn 0.3s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <label style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ImageIcon size={16} color="#4CAF50" />
                    Select Listing Image
                </label>
                {loading && <span style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}><Loader2 size={12} className="spin-animation" /> Searching...</span>}
            </div>

            {hasSearched && !loading && images.length === 0 && (
                <p style={{ fontSize: '13px', color: '#64748b', fontStyle: 'italic' }}>No exact images found. Using default.</p>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {images.map((imgUrl, index) => {
                    const isSelected = currentSelection === imgUrl;
                    return (
                        <div 
                            key={index}
                            onClick={() => onSelectImage(imgUrl)}
                            style={{ 
                                height: '100px', 
                                borderRadius: '16px', 
                                overflow: 'hidden', 
                                cursor: 'pointer',
                                position: 'relative',
                                border: isSelected ? '3px solid #4CAF50' : '2px solid transparent',
                                boxShadow: isSelected ? '0 8px 20px rgba(76, 175, 80, 0.3)' : '0 2px 8px rgba(0,0,0,0.05)',
                                transition: 'all 0.2s ease',
                                transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                                backgroundColor: '#f1f5f9'
                            }}
                        >
                            <img 
                                src={imgUrl} 
                                alt={`Option ${index + 1}`} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            />
                            
                            {/* Dark gradient overlay for contrast */}
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)' }}></div>
                            
                            {isSelected && (
                                <div style={{ position: 'absolute', top: '6px', right: '6px', backgroundColor: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2px', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}>
                                    <CheckCircle2 size={18} color="#4CAF50" fill="#4CAF50" stroke="#fff" />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            
            <p style={{ margin: '8px 0 0 0', fontSize: '11px', color: '#94a3b8', textAlign: 'center' }}>
                High-quality images sourced directly from the web based on your input.
            </p>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
                .spin-animation { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default UniversalImagePicker;
