import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CircleUserRound, ShieldCheck, Building2, Snowflake, X } from 'lucide-react';
import Seller_BannerPromo from './Seller_BannerPromo';
import { db, auth } from '../../firebase';
import { collection, query, where, getDocs, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

function Seller_HomePage() {
    const navigate = useNavigate();

    const [appStatus, setAppStatus] = useState('loading');
    const [sellerName, setSellerName] = useState('');
    const [appFrozen, setAppFrozen] = useState(false);
    const [appFrozenReason, setAppFrozenReason] = useState('');
    const [appFrozenUntil, setAppFrozenUntil] = useState(null);

    const handleCategoryClick = (path) => {
        // Always navigate — the listing form itself shows LockedListingScreen
        // with a beautiful status card for pending/frozen/rejected accounts.
        navigate(path);
    };

    const images = {
        farmFresh: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=500&q=80",
        machinery: "https://images.unsplash.com/photo-1628105051996-5fc7a9d70034?w=500&q=80",
        workers: "https://images.unsplash.com/photo-1599839619722-39751411ea63?w=500&q=80",
        business: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=500&q=80",
        freelance: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=500&q=80",
        localGoods: "https://images.unsplash.com/photo-1590004953392-5aba2e72269a?w=500&q=80"
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                localStorage.setItem('seller_app_status', 'none');
                localStorage.removeItem('seller_app_id');
                localStorage.setItem('seller_app_frozen', 'false');
                setAppStatus('none');
                return;
            }

            try {
                let appId = localStorage.getItem('seller_app_id');

                if (!appId) {
                    try {
                        const q = query(collection(db, 'seller_applications'), where("userId", "==", user.uid));
                        const querySnapshot = await getDocs(q);
                        if (!querySnapshot.empty) {
                            appId = querySnapshot.docs[0].id;
                            localStorage.setItem('seller_app_id', appId);
                        } else {
                            if (localStorage.getItem('seller_app_status') === 'permanently_deleted') {
                                setAppStatus('permanently_deleted');
                                // already stored, no change needed
                            } else {
                                // No application exists — clear any stale status so listing forms show correct card
                                localStorage.setItem('seller_app_status', 'none');
                                localStorage.removeItem('seller_app_id');
                                localStorage.setItem('seller_app_frozen', 'false');
                                setAppStatus('none');
                            }
                            return;
                        }
                    } catch (error) {
                        console.error("Error querying seller applications:", error);
                        localStorage.setItem('seller_app_status', 'none');
                        setAppStatus('none');
                        return;
                    }
                }

                if (appId) {
                    const docRef = doc(db, 'seller_applications', appId);
                    const unsubscribeSnapshot = onSnapshot(docRef, (docSnap) => {
                        if (docSnap.exists()) {
                            const appData = docSnap.data();
                            if (appData.status === 'deleted_by_admin') {
                                localStorage.setItem('seller_app_deleted_reason', appData.deletionReason || 'Violation of terms');
                                localStorage.setItem('seller_app_deleted_msg', appData.deletionMessage || '');
                                deleteDoc(docRef).catch(e => console.error(e));
                                setAppStatus('permanently_deleted');
                                localStorage.setItem('seller_app_status', 'permanently_deleted');
                                localStorage.removeItem('seller_name');
                                localStorage.removeItem('seller_app_id');
                                localStorage.removeItem('seller_account_type');
                                return;
                            }

                            setAppStatus(appData.status);
                            setAppFrozen(appData.frozen === true);
                            localStorage.setItem('seller_app_frozen', appData.frozen === true ? 'true' : 'false');
                            setAppFrozenReason(appData.frozenReason || 'Irregular activity detected');
                            localStorage.setItem('seller_app_frozen_reason', appData.frozenReason || 'Irregular activity detected');
                            setAppFrozenUntil(appData.frozenUntil || null);

                            const nameToUse = appData.accountType === 'organisation' ? appData.companyName : (appData.shopName || appData.fullName);
                            setSellerName(nameToUse);
                            localStorage.setItem('seller_name', nameToUse);
                            localStorage.setItem('seller_account_type', appData.accountType);

                            const prevStatus = localStorage.getItem('seller_app_status');
                            const prevEdit = localStorage.getItem('seller_app_pending_edit') === 'true';

                            const addNotif = (title, msg, type) => {
                                const notifs = JSON.parse(localStorage.getItem('seller_notifications') || '[]');
                                notifs.unshift({ id: Date.now().toString(), title, message: msg, type, timestamp: new Date().toISOString(), isRead: false });
                                localStorage.setItem('seller_notifications', JSON.stringify(notifs));
                                window.dispatchEvent(new Event('seller_notifications_updated'));
                            };

                            if (prevStatus && prevStatus !== appData.status) {
                                if (appData.status === 'approved') addNotif('Application Approved', 'Congratulations! Your seller application has been approved.', 'success');
                                if (appData.status === 'rejected') addNotif('Application Rejected', appData.rejectionReason || 'Please check your application details.', 'error');
                            }

                            if (appData.status === 'rejected') {
                                localStorage.setItem('seller_app_rejected_reason', appData.rejectionReason || 'Does not meet platform requirements.');
                                localStorage.setItem('seller_app_status', 'rejected');
                                setAppStatus('rejected');
                                
                                // Self-destruct the document to keep Firebase clean
                                deleteDoc(docRef).catch(e => console.error("Error auto-deleting rejected app:", e));
                                return; // Stop processing further
                            }

                            if (prevEdit && !appData.hasPendingEdit) {
                                if (appData.lastEditAction === 'rejected') {
                                    addNotif('Edit Request Rejected', 'Your profile edit request was rejected by the admin. Your live profile remains unchanged.', 'error');
                                } else {
                                    addNotif('✓✓✓ Edit Request Approved', 'Your profile edit request has been approved and applied to your live profile.', 'success');
                                }
                            }

                            localStorage.setItem('seller_app_status', appData.status);
                            localStorage.setItem('seller_app_pending_edit', appData.hasPendingEdit ? 'true' : 'false');
                        } else {
                            // Doc was deleted from Firestore (either permanently deleted or self-destructed reject)
                            const currentStatus = localStorage.getItem('seller_app_status');
                            if (currentStatus === 'permanently_deleted') {
                                setAppStatus('permanently_deleted');
                            } else if (currentStatus === 'rejected') {
                                setAppStatus('rejected');
                            } else {
                                localStorage.setItem('seller_app_status', 'none');
                                localStorage.removeItem('seller_app_id');
                                localStorage.setItem('seller_app_frozen', 'false');
                                setAppStatus('none');
                            }
                        }
                    }, (error) => {
                        console.error("Error with application snapshot:", error);
                        localStorage.setItem('seller_app_status', 'error');
                        setAppStatus('error');
                    });
                    window.sellerHomeSnapshotUnsub = unsubscribeSnapshot;
                }
            } catch (error) {
                console.error("Error fetching application status:", error);
                localStorage.setItem('seller_app_status', 'error');
                setAppStatus('error');
            }
        });

        return () => {
            unsubscribe();
            if (window.sellerHomeSnapshotUnsub) {
                window.sellerHomeSnapshotUnsub();
                window.sellerHomeSnapshotUnsub = null;
            }
        };
    }, []);



    return (
        <div style={{ backgroundColor: '#f8fafc', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100dvh', overflowY: 'auto', overflowX: 'hidden', touchAction: 'pan-y', WebkitOverflowScrolling: 'touch', padding: '20px', paddingBottom: '120px', boxSizing: 'border-box' }}>

            <style>{`
                @keyframes popIn {
                    0% { opacity: 0; transform: scale(0.88) translateY(30px); }
                    100% { opacity: 1; transform: scale(1) translateY(0); }
                }
                @keyframes slideUp {
                    0% { opacity: 0; transform: translateY(40px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .listing-card {
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                    cursor: pointer;
                }
                .listing-card:active {
                    transform: scale(0.97);
                }
            `}</style>

            {/* TOP HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: '16px 20px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(226, 232, 240, 0.8)', marginBottom: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Building2 size={16} color="#10b981" />
                        </div>
                        <h1 style={{ margin: 0, fontSize: '18px', color: '#0f172a', fontWeight: '800', letterSpacing: '-0.3px' }}>Seller Dashboard</h1>
                    </div>
                    <p style={{ margin: '4px 0 0 36px', fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Manage your storefront &amp; listings</p>
                </div>
                <Link to="/profile" style={{ textDecoration: 'none' }}>
                    <div style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg, #e0f2fe, #bae6fd)', color: '#0284c7', borderRadius: '14px', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.5), 0 4px 10px rgba(2,132,199,0.1)' }}>
                        <CircleUserRound size={24} strokeWidth={2.5} />
                    </div>
                </Link>
            </div>

            {/* STATUS BANNER (top area) */}
            {appStatus === 'loading' && (
                <div style={{ background: '#f1f5f9', padding: '16px', borderRadius: '16px', marginBottom: '24px', textAlign: 'center', color: '#475569', fontWeight: '600', border: '1px solid #e2e8f0' }}>
                    Checking your Seller Status...
                </div>
            )}

            {appStatus === 'approved' && !appFrozen && (
                <div style={{ background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', border: '1px solid #a7f3d0', padding: '20px', borderRadius: '20px', marginBottom: '24px', color: '#065f46', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 8px 25px rgba(16, 185, 129, 0.1)' }}>
                    <div style={{ background: '#10b981', borderRadius: '12px', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <ShieldCheck size={24} color="#fff" />
                    </div>
                    <div>
                        <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '800' }}>Welcome, {sellerName}!</h3>
                        <p style={{ margin: 0, fontSize: '13px', color: '#047857', fontWeight: '500' }}>Your account is verified. You can now post live listings.</p>
                    </div>
                </div>
            )}

            {(appStatus !== 'approved' || appFrozen) && appStatus !== 'loading' && (
                <div
                    onClick={() => navigate('/seller-setup')}
                    style={{ cursor: 'pointer', background: appStatus === 'permanently_deleted' || appStatus === 'rejected' ? 'linear-gradient(135deg,#fef2f2,#fee2e2)' : appFrozen ? 'linear-gradient(135deg,#fff7ed,#ffedd5)' : appStatus === 'pending_approval' ? 'linear-gradient(135deg,#fffbeb,#fef3c7)' : 'linear-gradient(135deg,#eff6ff,#dbeafe)', border: `1px solid ${appStatus === 'permanently_deleted' || appStatus === 'rejected' ? '#fecdd3' : appFrozen ? '#fed7aa' : appStatus === 'pending_approval' ? '#fde68a' : '#bfdbfe'}`, padding: '18px', borderRadius: '20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 6px 20px rgba(0,0,0,0.06)', transition: 'transform 0.15s ease' }}
                >
                    <div style={{ fontSize: '26px', flexShrink: 0 }}>
                        {appStatus === 'permanently_deleted' ? '🚫' : appStatus === 'rejected' ? '❌' : appFrozen ? '❄️' : appStatus === 'pending_approval' ? '⏳' : '🏪'}
                    </div>
                    <div style={{ flex: 1 }}>
                        <p style={{ margin: '0 0 2px 0', fontWeight: '800', fontSize: '14px', color: appStatus === 'permanently_deleted' || appStatus === 'rejected' ? '#9f1239' : appFrozen ? '#7c2d12' : appStatus === 'pending_approval' ? '#78350f' : '#1e3a8a' }}>
                            {appStatus === 'permanently_deleted' ? 'Account Deleted by Admin' : appStatus === 'rejected' ? 'Application Rejected' : appFrozen ? 'Account Temporarily Frozen' : appStatus === 'pending_approval' ? 'Application Under Review' : 'Seller Account Required'}
                        </p>
                        <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Tap to see full details</p>
                    </div>
                    <span style={{ fontSize: '18px', color: '#94a3b8' }}>›</span>
                </div>
            )}

            <Seller_BannerPromo />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', marginTop: '8px' }}>
                <h2 style={{ fontSize: '20px', color: '#0f172a', margin: 0, fontWeight: '800', letterSpacing: '-0.5px' }}>Add New Listings</h2>
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>6 Categories</span>
            </div>

            {/* LISTINGS GRID — always fully visible and clickable, 6-color 3D cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

                {/* MARKETING & PROMOTIONS — full width, purple */}
                <div className="listing-card" onClick={() => handleCategoryClick('/add-marketing')}>
                    <div style={{ borderRadius: '20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', boxShadow: '0 10px 30px rgba(102,126,234,0.35)', border: '1px solid rgba(255,255,255,0.15)', padding: '20px', display: 'flex', alignItems: 'center', gap: '18px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }}></div>
                        <div style={{ position: 'absolute', bottom: '-30px', right: '60px', width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}></div>
                        <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', flexShrink: 0, boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.3)' }}>✨</div>
                        <div style={{ flex: 1, zIndex: 1 }}>
                            <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '800', color: '#fff', letterSpacing: '-0.3px' }}>Marketing &amp; Promotions</h3>
                            <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.8)', fontWeight: '500' }}>Showcase your shop, business &amp; services</p>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px 14px', borderRadius: '10px', backdropFilter: 'blur(8px)', flexShrink: 0, zIndex: 1 }}>
                            <span style={{ fontSize: '12px', color: '#fff', fontWeight: '800' }}>🚀 Add</span>
                        </div>
                    </div>
                </div>

                {/* 2-column grid for remaining 6 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>

                    {/* FARM FRESH — green */}
                    <div className="listing-card" onClick={() => handleCategoryClick('/add-farm-fresh')}>
                        <div style={{ borderRadius: '20px', background: '#ffffff', border: '1px solid #dcfce7', boxShadow: '0 6px 20px rgba(16,185,129,0.12)', overflow: 'hidden' }}>
                            <div style={{ height: '72px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
                                <span style={{ fontSize: '32px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}>🥬</span>
                            </div>
                            <div style={{ padding: '12px' }}>
                                <h3 style={{ margin: '0 0 3px 0', fontSize: '14px', fontWeight: '800', color: '#064e3b' }}>Farm Fresh</h3>
                                <p style={{ margin: '0 0 10px 0', fontSize: '11px', color: '#6b7280', fontWeight: '500' }}>Sell fresh produce</p>
                                <div style={{ background: '#d1fae5', padding: '6px 10px', borderRadius: '8px', textAlign: 'center' }}>
                                    <span style={{ fontSize: '11px', color: '#065f46', fontWeight: '800' }}>+ Add Listing</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* BUSINESS ZONE — amber */}
                    <div className="listing-card" onClick={() => handleCategoryClick('/add-business')}>
                        <div style={{ borderRadius: '20px', background: '#ffffff', border: '1px solid #fef3c7', boxShadow: '0 6px 20px rgba(245,158,11,0.12)', overflow: 'hidden' }}>
                            <div style={{ height: '72px', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
                                <span style={{ fontSize: '32px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}>🌾</span>
                            </div>
                            <div style={{ padding: '12px' }}>
                                <h3 style={{ margin: '0 0 3px 0', fontSize: '14px', fontWeight: '800', color: '#451a03' }}>Business Zone</h3>
                                <p style={{ margin: '0 0 10px 0', fontSize: '11px', color: '#6b7280', fontWeight: '500' }}>Sell bulk harvest</p>
                                <div style={{ background: '#fef3c7', padding: '6px 10px', borderRadius: '8px', textAlign: 'center' }}>
                                    <span style={{ fontSize: '11px', color: '#78350f', fontWeight: '800' }}>+ Add Listing</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* MACHINERY — blue */}
                    <div className="listing-card" onClick={() => handleCategoryClick('/add-machinery')}>
                        <div style={{ borderRadius: '20px', background: '#ffffff', border: '1px solid #dbeafe', boxShadow: '0 6px 20px rgba(59,130,246,0.12)', overflow: 'hidden' }}>
                            <div style={{ height: '72px', background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
                                <span style={{ fontSize: '32px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}>🚜</span>
                            </div>
                            <div style={{ padding: '12px' }}>
                                <h3 style={{ margin: '0 0 3px 0', fontSize: '14px', fontWeight: '800', color: '#1e3a8a' }}>Machinery</h3>
                                <p style={{ margin: '0 0 10px 0', fontSize: '11px', color: '#6b7280', fontWeight: '500' }}>Rent out equipment</p>
                                <div style={{ background: '#dbeafe', padding: '6px 10px', borderRadius: '8px', textAlign: 'center' }}>
                                    <span style={{ fontSize: '11px', color: '#1e40af', fontWeight: '800' }}>+ Add Listing</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* WORKERS — rose */}
                    <div className="listing-card" onClick={() => handleCategoryClick('/add-workers')}>
                        <div style={{ borderRadius: '20px', background: '#ffffff', border: '1px solid #fce7f3', boxShadow: '0 6px 20px rgba(236,72,153,0.12)', overflow: 'hidden' }}>
                            <div style={{ height: '72px', background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
                                <span style={{ fontSize: '32px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}>🧑‍🔧</span>
                            </div>
                            <div style={{ padding: '12px' }}>
                                <h3 style={{ margin: '0 0 3px 0', fontSize: '14px', fontWeight: '800', color: '#500724' }}>Workers</h3>
                                <p style={{ margin: '0 0 10px 0', fontSize: '11px', color: '#6b7280', fontWeight: '500' }}>Provide labour services</p>
                                <div style={{ background: '#fce7f3', padding: '6px 10px', borderRadius: '8px', textAlign: 'center' }}>
                                    <span style={{ fontSize: '11px', color: '#9d174d', fontWeight: '800' }}>+ Add Listing</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* FREELANCING — indigo */}
                    <div className="listing-card" onClick={() => handleCategoryClick('/add-freelancing')}>
                        <div style={{ borderRadius: '20px', background: '#ffffff', border: '1px solid #e0e7ff', boxShadow: '0 6px 20px rgba(99,102,241,0.12)', overflow: 'hidden' }}>
                            <div style={{ height: '72px', background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
                                <span style={{ fontSize: '32px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}>👨‍💻</span>
                            </div>
                            <div style={{ padding: '12px' }}>
                                <h3 style={{ margin: '0 0 3px 0', fontSize: '14px', fontWeight: '800', color: '#1e1b4b' }}>Freelancing</h3>
                                <p style={{ margin: '0 0 10px 0', fontSize: '11px', color: '#6b7280', fontWeight: '500' }}>Offer specialized skills</p>
                                <div style={{ background: '#e0e7ff', padding: '6px 10px', borderRadius: '8px', textAlign: 'center' }}>
                                    <span style={{ fontSize: '11px', color: '#3730a3', fontWeight: '800' }}>+ Add Listing</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* LOCAL GOODS — orange */}
                    <div className="listing-card" onClick={() => handleCategoryClick('/add-local-goods')}>
                        <div style={{ borderRadius: '20px', background: '#ffffff', border: '1px solid #ffedd5', boxShadow: '0 6px 20px rgba(249,115,22,0.12)', overflow: 'hidden' }}>
                            <div style={{ height: '72px', background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
                                <span style={{ fontSize: '32px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}>🧺</span>
                            </div>
                            <div style={{ padding: '12px' }}>
                                <h3 style={{ margin: '0 0 3px 0', fontSize: '14px', fontWeight: '800', color: '#431407' }}>Local Goods</h3>
                                <p style={{ margin: '0 0 10px 0', fontSize: '11px', color: '#6b7280', fontWeight: '500' }}>Sell handmade &amp; tools</p>
                                <div style={{ background: '#ffedd5', padding: '6px 10px', borderRadius: '8px', textAlign: 'center' }}>
                                    <span style={{ fontSize: '11px', color: '#7c2d12', fontWeight: '800' }}>+ Add Listing</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default Seller_HomePage;