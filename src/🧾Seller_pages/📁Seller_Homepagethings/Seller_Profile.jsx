import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { doc, getDoc, collection, query, where, getDocs, deleteDoc, onSnapshot } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import { useUserMode } from '../../UserModeContext';
import BrandedTransition3D from '../../🛠️Shared_Components/BrandedTransition3D';
import { ChevronLeft, Edit3, Settings, HelpCircle, Package, Wallet, ShieldCheck, MapPin, Building2, User, Trash2, AlertTriangle, RefreshCw } from 'lucide-react';

function Seller_Profile() {
    const navigate = useNavigate();
    const { toggleUserMode } = useUserMode();
    const [isTransforming, setIsTransforming] = useState(false);

    const [sellerName, setSellerName] = useState(localStorage.getItem('seller_name') || 'Loading...');
    const [accountType, setAccountType] = useState(localStorage.getItem('seller_account_type') || 'single');
    const sellerId = localStorage.getItem('seller_app_id') || 'Unknown_ID';

    const [appStatus, setAppStatus] = useState(localStorage.getItem('seller_app_status') || 'loading');

    useEffect(() => {
        let unsub = () => {};
        const fetchProfileData = async () => {
            if (sellerId && sellerId !== 'Unknown_ID') {
                try {
                    const docRef = doc(db, 'seller_applications', sellerId);
                    unsub = onSnapshot(docRef, (docSnap) => {
                        if (docSnap.exists()) {
                            const data = docSnap.data();
                            const nameToUse = data.accountType === 'organisation' ? data.companyName : (data.shopName || data.fullName);
                            setSellerName(nameToUse || 'Shop Name');
                            setAccountType(data.accountType || 'single');
                            setAppStatus(data.status || 'loading');
                            
                            localStorage.setItem('seller_name', nameToUse || 'Shop Name');
                            localStorage.setItem('seller_account_type', data.accountType || 'single');
                            localStorage.setItem('seller_app_status', data.status || 'loading');
                        } else {
                            setSellerName('');
                            setAccountType('none');
                            setAppStatus('permanently_deleted');
                        }
                    });
                } catch (error) {
                    console.error("Error fetching profile data:", error);
                }
            }
        };
        
        if (sellerName === 'Loading...' || sellerId !== 'Unknown_ID') {
            fetchProfileData();
        }
        return () => unsub();
    }, [sellerId]);

    const handleSwitchToConsumer = () => {
        setIsTransforming(true);
        setTimeout(() => {
            toggleUserMode();
            navigate('/Consumer_HomePage');
        }, 3500);
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#f8fafc', overflowY: 'auto', overflowX: 'hidden', touchAction: 'pan-y', WebkitOverflowScrolling: 'touch', display: 'flex', flexDirection: 'column' }}>
            
            {/* --- PREMIUM HEADER --- */}
            <div style={{ backgroundColor: '#0f172a', color: '#fff', padding: '20px 20px 60px', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                    <div onClick={() => navigate('/Seller_HomePage')} style={{ cursor: 'pointer', padding: '5px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ChevronLeft size={24} color="#fff" />
                    </div>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <div onClick={() => window.location.reload()} style={{ padding: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseDown={(e) => e.currentTarget.style.transform = 'rotate(180deg)'} onMouseUp={(e) => e.currentTarget.style.transform = 'rotate(0deg)'}>
                            <RefreshCw size={20} color="#fff" />
                        </div>
                        <div style={{ padding: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', cursor: 'pointer' }}>
                            <Settings size={20} color="#fff" />
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.3)', border: '2px solid rgba(255,255,255,0.2)', position: 'relative', flexShrink: 0 }}>
                        {accountType === 'organisation' ? <Building2 size={36} color="#fff" /> : <User size={36} color="#fff" />}
                        <div style={{ position: 'absolute', bottom: '-5px', right: '-5px', background: '#10b981', width: '22px', height: '22px', borderRadius: '50%', border: '3px solid #0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ShieldCheck size={12} color="#fff" />
                        </div>
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                        <h1 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sellerName}</h1>
                        {accountType !== 'none' ? (
                            <>
                                <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <User size={14} /> {accountType === 'organisation' ? 'Organisation' : 'Individual'} • ID: {sellerId}
                                </p>
                                {appStatus === 'approved' && (
                                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px', background: 'rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: '12px' }}>Verified Seller</span>
                                )}
                                {appStatus === 'pending_approval' && (
                                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '1px', background: 'rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: '12px' }}>Pending Verification</span>
                                )}
                                {appStatus === 'rejected' && (
                                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#ef4444', textTransform: 'uppercase', letterSpacing: '1px', background: 'rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: '12px' }}>Rejected</span>
                                )}
                            </>
                        ) : (
                            <span style={{ fontSize: '11px', fontWeight: '700', color: '#ef4444', textTransform: 'uppercase', letterSpacing: '1px', background: 'rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: '12px' }}>Profile Deleted</span>
                        )}
                    </div>
                </div>
            </div>

            {accountType === 'none' ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', marginTop: '20px' }}>
                    <AlertTriangle size={48} color="#ef4444" style={{ margin: '0 auto 20px' }} />
                    <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginBottom: '10px' }}>Profile Not Found</h2>
                    <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '30px' }}>Your seller profile does not exist or has been permanently deleted by an administrator.</p>
                    <button onClick={() => navigate('/Seller_HomePage')} style={{ background: '#0f172a', color: '#fff', padding: '15px 30px', borderRadius: '16px', fontWeight: '700', border: 'none', width: '100%', fontSize: '16px', cursor: 'pointer' }}>Return to Home</button>
                </div>
            ) : (
                <>
                    {/* --- QUICK STATS OVERLAPPING HEADER --- */}
                    <div style={{ padding: '0 20px', marginTop: '-35px', position: 'relative', zIndex: 10 }}>
                        <div style={{ background: '#fff', borderRadius: '24px', padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                            <div style={{ textAlign: 'center' }}>
                                <h3 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>12</h3>
                                <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Listings</p>
                            </div>
                            <div style={{ textAlign: 'center', borderLeft: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0' }}>
                                <h3 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>4.9</h3>
                                <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Rating</p>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <h3 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>48</h3>
                                <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Orders</p>
                            </div>
                        </div>
                    </div>

                    {/* --- MENU OPTIONS --- */}
                    <div style={{ padding: '25px 20px', flex: 1 }}>
                        
                        <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '15px' }}>Business Console</h2>
                        
                        {appStatus === 'approved' ? (
                            <div style={{ background: '#fff', borderRadius: '24px', padding: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', marginBottom: '25px' }}>
                                
                                <Link to="/storefront-setup" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', padding: '15px', borderBottom: '1px solid #f1f5f9' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#fce7f3', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '15px' }}>
                                            <Building2 size={20} color="#db2777" />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ margin: '0 0 3px', fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>Store front Setup</h4>
                                            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Location, contacts, and delivery range</p>
                                        </div>
                                        <ChevronLeft size={20} color="#cbd5e1" style={{ transform: 'rotate(180deg)' }} />
                                    </div>
                                </Link>

                                <Link to="/seller-setup" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', padding: '15px', borderBottom: '1px solid #f1f5f9' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '15px' }}>
                                            <Edit3 size={20} color="#0284c7" />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ margin: '0 0 3px', fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>Seller Registration</h4>
                                            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Update your business information</p>
                                        </div>
                                        <ChevronLeft size={20} color="#cbd5e1" style={{ transform: 'rotate(180deg)' }} />
                                    </div>
                                </Link>

                                <Link to="/manage-listings" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', padding: '15px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '15px' }}>
                                            <Package size={20} color="#10b981" />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ margin: '0 0 3px', fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>Manage Listings</h4>
                                            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>View and edit active listings</p>
                                        </div>
                                        <ChevronLeft size={20} color="#cbd5e1" style={{ transform: 'rotate(180deg)' }} />
                                    </div>
                                </Link>

                                <div style={{ display: 'flex', alignItems: 'center', padding: '15px', cursor: 'pointer' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '15px' }}>
                                        <Wallet size={20} color="#d97706" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ margin: '0 0 3px', fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>Payments & Earnings</h4>
                                        <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Track your revenue</p>
                                    </div>
                                    <ChevronLeft size={20} color="#cbd5e1" style={{ transform: 'rotate(180deg)' }} />
                                </div>
                            </div>
                        ) : (
                            <div style={{ background: '#fff', borderRadius: '24px', padding: '20px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', marginBottom: '25px' }}>
                                <div style={{ width: '50px', height: '50px', borderRadius: '16px', background: '#f8fafc', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
                                    <ShieldCheck size={24} />
                                </div>
                                <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>Console Locked</h3>
                                <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>
                                    Your business console will be unlocked automatically once your application is verified by the administration team.
                                </p>
                            </div>
                        )}

                        <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '15px' }}>Support</h2>
                        
                        <div style={{ background: '#fff', borderRadius: '24px', padding: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', marginBottom: '30px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', padding: '15px', cursor: 'pointer' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '15px' }}>
                                    <HelpCircle size={20} color="#475569" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ margin: '0 0 3px', fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>Help Center</h4>
                                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Get assistance with selling</p>
                                </div>
                                <ChevronLeft size={20} color="#cbd5e1" style={{ transform: 'rotate(180deg)' }} />
                            </div>
                        </div>
                    </div>
                </>
            )}

            <div style={{ padding: '0 20px 20px 20px', marginTop: accountType === 'none' ? 'auto' : '0' }}>
                <button
                    onClick={handleSwitchToConsumer}
                    disabled={isTransforming}
                    style={{
                        width: '100%',
                        padding: '16px',
                        background: isTransforming ? '#94a3b8' : 'linear-gradient(135deg, #10b981, #059669)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '16px',
                        fontWeight: '800',
                        fontSize: '16px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)',
                        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        marginBottom: '30px',
                        transform: isTransforming ? 'scale(0.98)' : 'scale(1)',
                        opacity: isTransforming ? 0.8 : 1
                    }}
                >
                    {isTransforming ? 'Switching Workspace...' : 'Switch to Consumer Mode 🌾'}
                </button>
            </div>

            {/* SLEEK BRANDED WORKSPACE TRANSFORMATION OVERLAY */}
            <BrandedTransition3D isVisible={isTransforming} targetMode="consumer" />
        </div>
    );
}

export default Seller_Profile;