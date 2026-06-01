import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CircleUserRound, ShieldAlert, ShieldCheck, ShieldX } from 'lucide-react';
import Seller_BannerPromo from './Seller_BannerPromo';
import { db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';

function Seller_HomePage() {
    const navigate = useNavigate();
    const [userLocation, setUserLocation] = useState('Select Shop Location'); 
    const [locationTitle, setLocationTitle] = useState('My Shop'); 
    
    // Live Application Status state
    const [appStatus, setAppStatus] = useState('loading'); // loading, none, pending_approval, approved, rejected
    const [sellerName, setSellerName] = useState('');

    const images = {
        farmFresh: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=500&q=80",
        machinery: "https://images.unsplash.com/photo-1628105051996-5fc7a9d70034?w=500&q=80",
        workers: "https://images.unsplash.com/photo-1599839619722-39751411ea63?w=500&q=80",
        business: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=500&q=80",
        freelance: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=500&q=80"
    };

    useEffect(() => {
        const loadLocation = () => {
            const savedLoc = localStorage.getItem('userLocation'); 
            const savedTitle = localStorage.getItem('locationTitle');
            if (savedLoc) setUserLocation(savedLoc);
            if (savedTitle) setLocationTitle(savedTitle); 
        };
        loadLocation();
        window.addEventListener('storage', loadLocation);
        return () => window.removeEventListener('storage', loadLocation);
    }, []);

    // Fetch the live status from Firebase
    useEffect(() => {
        const fetchStatus = async () => {
            const appId = localStorage.getItem('seller_app_id');
            if (!appId) {
                setAppStatus('none');
                return;
            }

            try {
                const docRef = doc(db, 'seller_applications', appId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setAppStatus(data.status);
                    setSellerName(data.accountType === 'organisation' ? data.companyName : data.fullName);
                } else {
                    setAppStatus('none');
                }
            } catch (error) {
                console.error("Error fetching application status:", error);
                setAppStatus('error');
            }
        };
        fetchStatus();
    }, []);

    // RENDER: Application Rejected
    if (appStatus === 'rejected') {
        return (
            <div style={{ backgroundColor: '#fff1f2', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center' }}>
                <ShieldX size={80} color="#e11d48" style={{ marginBottom: '20px' }} />
                <h1 style={{ color: '#be123c', margin: '0 0 10px 0' }}>Application Rejected</h1>
                <p style={{ color: '#4c0519', maxWidth: '400px', lineHeight: '1.6' }}>We're sorry, but your application to become a Seller on FarmCap has been rejected by the admin team. Please contact support for more details.</p>
                <button onClick={() => { localStorage.removeItem('seller_app_id'); setAppStatus('none'); }} style={{ marginTop: '30px', padding: '12px 24px', background: '#e11d48', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>Start New Application</button>
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: '#f4f7f6', minHeight: '100vh', padding: '20px', paddingBottom: '100px', boxSizing: 'border-box' }}>
            
            {/* TOP HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: '15px 20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
                <div onClick={() => navigate('/seller-location')} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{color:'#4CAF50', fontSize: '18px'}}>📍</span>
                        <h1 style={{ margin: 0, fontSize: '18px', color: '#2c3e50', fontWeight: '800' }}>{locationTitle}</h1>
                        <span style={{ fontSize: '12px', color: '#2c3e50' }}>▼</span>
                    </div>
                    <p style={{ margin: '2px 0 0 26px', fontSize: '11px', color: '#7f8c8d', width: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userLocation}</p>
                </div>
                
                <Link to="/profile" style={{ textDecoration: 'none' }}>
                    <div style={{ width: '42px', height: '42px', backgroundColor: '#f8fafc', color: '#0f172a', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                        <CircleUserRound size={24} strokeWidth={2} />
                    </div>
                </Link>
            </div>

            {/* STATUS BANNERS */}
            {appStatus === 'loading' && (
                <div style={{ background: '#e2e8f0', padding: '15px', borderRadius: '12px', marginBottom: '20px', textAlign: 'center', color: '#475569', fontWeight: 'bold' }}>
                    Checking your Seller Status...
                </div>
            )}

            {appStatus === 'none' && (
                <div style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', padding: '20px', borderRadius: '12px', marginBottom: '20px', color: 'white', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)' }}>
                    <ShieldAlert size={36} color="white" />
                    <div>
                        <h3 style={{ margin: '0 0 5px 0' }}>Profile Not Setup</h3>
                        <p style={{ margin: 0, fontSize: '13px', opacity: 0.9 }}>You need to submit your seller application before you can post listings.</p>
                        <button onClick={() => navigate('/seller-setup')} style={{ marginTop: '10px', background: 'white', color: '#2563eb', border: 'none', padding: '6px 15px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Set Up Profile Now</button>
                    </div>
                </div>
            )}

            {appStatus === 'pending_approval' && (
                <div style={{ background: '#fffbeb', border: '2px solid #fde68a', padding: '20px', borderRadius: '12px', marginBottom: '20px', color: '#b45309', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <Clock size={36} color="#d97706" />
                    <div>
                        <h3 style={{ margin: '0 0 5px 0' }}>Application Under Review</h3>
                        <p style={{ margin: 0, fontSize: '13px' }}>Hang tight, {sellerName}! Our admin team is currently reviewing your profile application. You will be able to post listings once approved.</p>
                    </div>
                </div>
            )}

            {appStatus === 'approved' && (
                <div style={{ background: '#ecfdf5', border: '2px solid #a7f3d0', padding: '15px', borderRadius: '12px', marginBottom: '20px', color: '#047857', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <ShieldCheck size={28} color="#10b981" />
                    <div>
                        <h3 style={{ margin: '0 0 3px 0', fontSize: '15px' }}>Welcome, {sellerName}!</h3>
                        <p style={{ margin: 0, fontSize: '12px' }}>Your account is verified. You can now post live listings.</p>
                    </div>
                </div>
            )}

            <Seller_BannerPromo />

            <h2 style={{ fontSize: '18px', color: '#2c3e50', marginBottom: '15px', fontWeight: '800' }}>Add New Listings</h2>

            {/* BLOCK CLICKS IF NOT APPROVED */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', opacity: appStatus !== 'approved' ? 0.5 : 1, pointerEvents: appStatus !== 'approved' ? 'none' : 'auto' }}>
                
                <Link to="/add-business" style={{ textDecoration: 'none' }}>
                    <div style={{ borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', backgroundColor: '#fff', height: '100%' }}>
                        <div style={{ height: '100px', width: '100%', position: 'relative' }}>
                            <img src={images.business} alt="Business Zone" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '20px', backgroundColor: 'rgba(255,255,255,0.9)', padding: '5px', borderRadius: '50%', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>📦</div>
                        </div>
                        <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', borderTop: '3px solid #9b59b6' }}>
                            <h3 style={{ margin: '0 0 5px 0', fontSize: '15px', color: '#2c3e50', fontWeight: 'bold' }}>Business Zone</h3>
                            <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Sell bulk harvest.</p>
                        </div>
                    </div>
                </Link>

                <Link to="/add-farm-fresh" style={{ textDecoration: 'none' }}>
                    <div style={{ borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', backgroundColor: '#fff', height: '100%' }}>
                        <div style={{ height: '100px', width: '100%', position: 'relative' }}>
                            <img src={images.farmFresh} alt="Farm Fresh" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '20px', backgroundColor: 'rgba(255,255,255,0.9)', padding: '5px', borderRadius: '50%', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>🌾</div>
                        </div>
                        <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', borderTop: '3px solid #4CAF50' }}>
                            <h3 style={{ margin: '0 0 5px 0', fontSize: '15px', color: '#2c3e50', fontWeight: 'bold' }}>Farm Fresh</h3>
                            <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Sell fresh products.</p>
                        </div>
                    </div>
                </Link>

                <Link to="/add-machinery" style={{ textDecoration: 'none' }}>
                    <div style={{ borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', backgroundColor: '#fff', height: '100%' }}>
                        <div style={{ height: '100px', width: '100%', position: 'relative' }}>
                            <img src={images.machinery} alt="Hire Machinery" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '20px', backgroundColor: 'rgba(255,255,255,0.9)', padding: '5px', borderRadius: '50%', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>🚜</div>
                        </div>
                        <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', borderTop: '3px solid #f39c12' }}>
                            <h3 style={{ margin: '0 0 5px 0', fontSize: '15px', color: '#2c3e50', fontWeight: 'bold' }}>Machinery</h3>
                            <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Rent out equipment.</p>
                        </div>
                    </div>
                </Link>

                <Link to="/add-workers" style={{ textDecoration: 'none' }}>
                    <div style={{ borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', backgroundColor: '#fff', height: '100%' }}>
                        <div style={{ height: '100px', width: '100%', position: 'relative' }}>
                            <img src={images.workers} alt="Hire Workers" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '20px', backgroundColor: 'rgba(255,255,255,0.9)', padding: '5px', borderRadius: '50%', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>🧑‍🔧</div>
                        </div>
                        <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', borderTop: '3px solid #3498db' }}>
                            <h3 style={{ margin: '0 0 5px 0', fontSize: '15px', color: '#2c3e50', fontWeight: 'bold' }}>Workers</h3>
                            <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Provide labor services.</p>
                        </div>
                    </div>
                </Link>

                <Link to="/add-freelancing" style={{ textDecoration: 'none' }}>
                    <div style={{ borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', backgroundColor: '#fff', height: '100%' }}>
                        <div style={{ height: '100px', width: '100%', position: 'relative' }}>
                            <img src={images.freelance} alt="Freelancing" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '20px', backgroundColor: 'rgba(255,255,255,0.9)', padding: '5px', borderRadius: '50%', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>🚚</div>
                        </div>
                        <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', borderTop: '3px solid #e74c3c' }}>
                            <h3 style={{ margin: '0 0 5px 0', fontSize: '15px', color: '#2c3e50', fontWeight: 'bold' }}>Freelancing</h3>
                            <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Offer specialized skills.</p>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}

export default Seller_HomePage;