import React from 'react';
import { Link } from 'react-router-dom';
import { CircleUserRound } from 'lucide-react';
import Seller_BannerPromo from './Seller_BannerPromo';

function Seller_HomePage() {
    // High-quality agricultural placeholder images
    const images = {
        farmFresh: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=500&q=80",  /* Fresh tomatoes/vegetables */
        machinery: "https://images.unsplash.com/photo-1628105051996-5fc7a9d70034?w=500&q=80",  /* Tractor */
        workers: "https://images.unsplash.com/photo-1599839619722-39751411ea63?w=500&q=80",    /* Farmers working */
        business: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=500&q=80",   /* Golden wheat harvest */
        freelance: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=500&q=80"   /* Delivery truck / Logistics */
    };

    return (
        <div style={{ backgroundColor: '#f4f7f6', minHeight: '100vh', padding: '20px', paddingBottom: '100px', boxSizing: 'border-box' }}>
            
            {/* --- TOP HEADER --- */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: '15px 20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '20px', color: '#2c3e50', fontWeight: '800' }}>🛍️ Seller Workspace</h1>
                    <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#7f8c8d', fontStyle: 'italic' }}>FarmCap: Growing Smarter, Together 🌾</p>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                    <Link to="/profile" style={{ textDecoration: 'none' }}>
                        <div style={{ width: '42px', height: '42px', backgroundColor: '#f8fafc', color: '#0f172a', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', cursor: 'pointer', border: '1px solid #e2e8f0' }}>
                            <CircleUserRound size={24} strokeWidth={2} />
                        </div>
                    </Link>
                </div>
            </div>

            {/* --- PROMO BANNER --- */}
            <Seller_BannerPromo />

            <h2 style={{ fontSize: '18px', color: '#2c3e50', marginBottom: '15px', fontWeight: '800' }}>Add New Listings</h2>

            {/* --- 5 FIREBASE ADD CARDS (IMAGE STRIP LAYOUT) --- */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                
                {/* Card 1: Business Zone */}
                <Link to="/add-business" style={{ textDecoration: 'none' }}>
                    <div style={{ borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', backgroundColor: '#fff', height: '100%' }}>
                        <div style={{ height: '100px', width: '100%', position: 'relative' }}>
                            <img src={images.business} alt="Business Zone" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '20px', backgroundColor: 'rgba(255,255,255,0.9)', padding: '5px', borderRadius: '50%', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>📦</div>
                        </div>
                        <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', borderTop: '3px solid #9b59b6' }}>
                            <h3 style={{ margin: '0 0 5px 0', fontSize: '15px', color: '#2c3e50', fontWeight: 'bold' }}>Business Zone Listings</h3>
                            <p style={{ margin: 0, fontSize: '13px', color: '#34495e', fontWeight: '500', lineHeight: '1.4' }}>Click here to sell your harvest.</p>
                        </div>
                    </div>
                </Link>

                {/* Card 2: Farm Fresh */}
                <Link to="/add-farm-fresh" style={{ textDecoration: 'none' }}>
                    <div style={{ borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', backgroundColor: '#fff', height: '100%' }}>
                        <div style={{ height: '100px', width: '100%', position: 'relative' }}>
                            <img src={images.farmFresh} alt="Farm Fresh" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '20px', backgroundColor: 'rgba(255,255,255,0.9)', padding: '5px', borderRadius: '50%', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>🌾</div>
                        </div>
                        <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', borderTop: '3px solid #4CAF50' }}>
                            <h3 style={{ margin: '0 0 5px 0', fontSize: '15px', color: '#2c3e50', fontWeight: 'bold' }}>Farm Fresh Listings</h3>
                            <p style={{ margin: 0, fontSize: '13px', color: '#34495e', fontWeight: '500', lineHeight: '1.4' }}>Add here to sell your fresh products.</p>
                        </div>
                    </div>
                </Link>

                {/* Card 3: Hire Machinery */}
                <Link to="/add-machinery" style={{ textDecoration: 'none' }}>
                    <div style={{ borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', backgroundColor: '#fff', height: '100%' }}>
                        <div style={{ height: '100px', width: '100%', position: 'relative' }}>
                            <img src={images.machinery} alt="Hire Machinery" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '20px', backgroundColor: 'rgba(255,255,255,0.9)', padding: '5px', borderRadius: '50%', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>🚜</div>
                        </div>
                        <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', borderTop: '3px solid #f39c12' }}>
                            <h3 style={{ margin: '0 0 5px 0', fontSize: '15px', color: '#2c3e50', fontWeight: 'bold' }}>Hire Machinary Listings</h3>
                            <p style={{ margin: 0, fontSize: '13px', color: '#34495e', fontWeight: '500', lineHeight: '1.4' }}>Add your machinary and send them for rent.</p>
                        </div>
                    </div>
                </Link>

                {/* Card 4: Hire Workers */}
                <Link to="/add-workers" style={{ textDecoration: 'none' }}>
                    <div style={{ borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', backgroundColor: '#fff', height: '100%' }}>
                        <div style={{ height: '100px', width: '100%', position: 'relative' }}>
                            <img src={images.workers} alt="Hire Workers" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '20px', backgroundColor: 'rgba(255,255,255,0.9)', padding: '5px', borderRadius: '50%', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>🧑‍🔧</div>
                        </div>
                        <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', borderTop: '3px solid #3498db' }}>
                            <h3 style={{ margin: '0 0 5px 0', fontSize: '15px', color: '#2c3e50', fontWeight: 'bold' }}>Hire Workers Listings</h3>
                            <p style={{ margin: 0, fontSize: '13px', color: '#34495e', fontWeight: '500', lineHeight: '1.4' }}>Add your agriculture skills to work and earn.</p>
                        </div>
                    </div>
                </Link>

                {/* Card 5: Freelancing (Now square/standard layout) */}
                <Link to="/add-freelancing" style={{ textDecoration: 'none' }}>
                    <div style={{ borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', backgroundColor: '#fff', height: '100%' }}>
                        <div style={{ height: '100px', width: '100%', position: 'relative' }}>
                            <img src={images.freelance} alt="Freelancing" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '20px', backgroundColor: 'rgba(255,255,255,0.9)', padding: '5px', borderRadius: '50%', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>🚚</div>
                        </div>
                        <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', borderTop: '3px solid #e74c3c' }}>
                            <h3 style={{ margin: '0 0 5px 0', fontSize: '15px', color: '#2c3e50', fontWeight: 'bold' }}>Freelancing Listings</h3>
                            <p style={{ margin: 0, fontSize: '13px', color: '#34495e', fontWeight: '500', lineHeight: '1.4' }}>Add here your skills to work.</p>
                        </div>
                    </div>
                </Link>

            </div>
        </div>
    );
}

export default Seller_HomePage;