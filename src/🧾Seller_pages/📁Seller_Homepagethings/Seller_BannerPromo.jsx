import React, { useState, useEffect } from 'react';

function Seller_BannerPromo() {
    const [currentSlide, setCurrentSlide] = useState(0);

    const banners = [
        {
            id: 1,
            title: "Expand Your Market! 🚀",
            desc: "Reach thousands of buyers by listing your fresh produce today.",
            bg: "linear-gradient(135deg, #10b981, #047857)"
        },
        {
            id: 2,
            title: "Rent Out Machinery 🚜",
            desc: "Don't let your tractor sit idle. Rent it out and earn passive income.",
            bg: "linear-gradient(135deg, #f59e0b, #b45309)"
        },
        {
            id: 3,
            title: "B2B Wholesale Deals 📦",
            desc: "Connect directly with restaurants and bulk buyers in the Business Zone.",
            bg: "linear-gradient(135deg, #8b5cf6, #5b21b6)"
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % banners.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [banners.length]);

    return (
        <div style={{ position: 'relative', width: '100%', height: '140px', borderRadius: '15px', overflow: 'hidden', marginBottom: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
            {banners.map((banner, index) => (
                <div 
                    key={banner.id}
                    style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: banner.bg,
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        color: 'white',
                        opacity: index === currentSlide ? 1 : 0,
                        transition: 'opacity 0.8s ease-in-out',
                        zIndex: index === currentSlide ? 1 : 0
                    }}
                >
                    <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', fontWeight: 'bold' }}>{banner.title}</h3>
                    <p style={{ margin: 0, fontSize: '13px', opacity: 0.9, lineHeight: '1.4' }}>{banner.desc}</p>
                </div>
            ))}
            
            {/* Pagination Dots */}
            <div style={{ position: 'absolute', bottom: '10px', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '6px', zIndex: 10 }}>
                {banners.map((_, idx) => (
                    <div 
                        key={idx} 
                        style={{ 
                            width: idx === currentSlide ? '18px' : '6px', 
                            height: '6px', 
                            backgroundColor: 'white', 
                            borderRadius: '3px', 
                            opacity: idx === currentSlide ? 1 : 0.5,
                            transition: 'all 0.3s ease'
                        }} 
                    />
                ))}
            </div>
        </div>
    );
}

export default Seller_BannerPromo;
