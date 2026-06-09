import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CircleUserRound, ShieldAlert, ShieldCheck, ShieldX, Clock, Building2 } from 'lucide-react';
import Seller_BannerPromo from './Seller_BannerPromo';
import { db, auth } from '../../firebase';
import { doc, getDoc, collection, query, where, getDocs, onSnapshot, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

function Seller_HomePage() {
    const navigate = useNavigate();

    
    // Live Application Status state
    const [appStatus, setAppStatus] = useState('loading'); // loading, none, pending_approval, approved, rejected
    const [sellerName, setSellerName] = useState('');

    const images = {
        farmFresh: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=500&q=80",
        machinery: "https://images.unsplash.com/photo-1628105051996-5fc7a9d70034?w=500&q=80",
        workers: "https://images.unsplash.com/photo-1599839619722-39751411ea63?w=500&q=80",
        business: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=500&q=80",
        freelance: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=500&q=80",
        localGoods: "https://images.unsplash.com/photo-1590004953392-5aba2e72269a?w=500&q=80" // Baskets/handmade goods
    };

    useEffect(() => {

    }, []);

    // Fetch the live status from Firebase
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                setAppStatus('none');
                return;
            }

            try {
                let appId = localStorage.getItem('seller_app_id');
                
                // 1. If not found via local storage, query Firestore by userId
                if (!appId) {
                    const q = query(collection(db, 'seller_applications'), where("userId", "==", user.uid));
                    const querySnapshot = await getDocs(q);
                    
                    if (!querySnapshot.empty) {
                        const appDoc = querySnapshot.docs[0];
                        appId = appDoc.id;
                        localStorage.setItem('seller_app_id', appId);
                    } else {
                        if (localStorage.getItem('seller_app_status') === 'permanently_deleted') {
                            setAppStatus('permanently_deleted');
                        } else {
                            setAppStatus('none');
                        }
                        return;
                    }
                }

                // 2. Set up realtime listener
                if (appId) {
                    const docRef = doc(db, 'seller_applications', appId);
                    const unsubscribeSnapshot = onSnapshot(docRef, (docSnap) => {
                        if (docSnap.exists()) {
                            const appData = docSnap.data();
                            if (appData.status === 'deleted_by_admin') {
                                // Store the reason locally so user can see it
                                localStorage.setItem('seller_app_deleted_reason', appData.deletionReason || 'Violation of terms');
                                localStorage.setItem('seller_app_deleted_msg', appData.deletionMessage || '');
                                
                                // Actually delete the document from firebase now that we received it
                                deleteDoc(docRef).catch(e => console.error(e));
                                
                                setAppStatus('permanently_deleted');
                                localStorage.setItem('seller_app_status', 'permanently_deleted');
                                return; // Stop processing this snapshot
                            }

                            setAppStatus(appData.status);
                            const nameToUse = appData.accountType === 'organisation' ? appData.companyName : (appData.shopName || appData.fullName);
                            setSellerName(nameToUse);
                            localStorage.setItem('seller_name', nameToUse);
                            localStorage.setItem('seller_account_type', appData.accountType);

                            // --- LOCAL NOTIFICATION LOGIC (ZERO EXTRA READS) ---
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

                            if (prevEdit && !appData.hasPendingEdit) {
                                if (appData.lastEditAction === 'rejected') {
                                    addNotif('Edit Request Rejected', 'Your profile edit request was rejected by the admin. Your live profile remains unchanged.', 'error');
                                } else {
                                    addNotif('✓✓✓ Edit Request Approved', 'Your profile edit request has been approved and applied to your live profile.', 'success');
                                }
                            }

                            localStorage.setItem('seller_app_status', appData.status);
                            localStorage.setItem('seller_app_pending_edit', appData.hasPendingEdit ? 'true' : 'false');
                            // ----------------------------------------------------
                        } else {
                            if (localStorage.getItem('seller_app_status') === 'permanently_deleted') {
                                setAppStatus('permanently_deleted');
                            } else {
                                setAppStatus('none');
                            }
                        }
                    }, (error) => {
                        console.error("Error with application snapshot:", error);
                        setAppStatus('error');
                    });
                    
                    // We need to return this so the auth listener can unsubscribe it when user changes
                    // but onAuthStateChanged only allows returning its own unsubscribe.
                    // We will store it globally or clear it when unmounting
                    window.sellerHomeSnapshotUnsub = unsubscribeSnapshot;
                }

            } catch (error) {
                console.error("Error fetching application status:", error);
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
        <div style={{ backgroundColor: '#f8fafc', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100dvh', overflowY: 'auto', overflowX: 'hidden', touchAction: 'pan-y', WebkitOverflowScrolling: 'touch', padding: '20px', paddingBottom: '120px', boxSizing: 'border-box' }}>
            
            {/* TOP HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: '16px 20px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(226, 232, 240, 0.8)', marginBottom: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Building2 size={16} color="#10b981" />
                        </div>
                        <h1 style={{ margin: 0, fontSize: '18px', color: '#0f172a', fontWeight: '800', letterSpacing: '-0.3px' }}>Seller Dashboard</h1>
                    </div>
                    <p style={{ margin: '4px 0 0 36px', fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Manage your storefront & listings</p>
                </div>
                
                <Link to="/profile" style={{ textDecoration: 'none' }}>
                    <div style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg, #e0f2fe, #bae6fd)', color: '#0284c7', borderRadius: '14px', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.5), 0 4px 10px rgba(2,132,199,0.1)' }}>
                        <CircleUserRound size={24} strokeWidth={2.5} />
                    </div>
                </Link>
            </div>

            {/* STATUS BANNERS */}
            {appStatus === 'loading' && (
                <div style={{ background: '#f1f5f9', padding: '16px', borderRadius: '16px', marginBottom: '24px', textAlign: 'center', color: '#475569', fontWeight: '600', border: '1px solid #e2e8f0' }}>
                    Checking your Seller Status...
                </div>
            )}

            {appStatus === 'none' && (
                <div style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', padding: '24px', borderRadius: '24px', marginBottom: '24px', color: 'white', display: 'flex', alignItems: 'flex-start', gap: '16px', boxShadow: '0 10px 30px rgba(37, 99, 235, 0.25)' }}>
                    <ShieldAlert size={32} color="white" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                        <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '800' }}>Add your first listings and start your business</h3>
                        <p style={{ margin: 0, fontSize: '14px', opacity: 0.9, lineHeight: '1.5' }}>Go to the seller registration and send your application. After that, you will be able to add the listings.</p>
                        <button onClick={() => navigate('/seller-setup')} style={{ marginTop: '16px', background: 'white', color: '#2563eb', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: '800', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>Go to Seller Registration</button>
                    </div>
                </div>
            )}

            {appStatus === 'permanently_deleted' && (
                <div style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', padding: '24px', borderRadius: '24px', marginBottom: '24px', color: 'white', display: 'flex', alignItems: 'flex-start', gap: '16px', boxShadow: '0 10px 30px rgba(220, 38, 38, 0.25)' }}>
                    <ShieldAlert size={32} color="white" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                        <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '800' }}>Account Deleted</h3>
                        <p style={{ margin: '0 0 12px 0', fontSize: '14px', opacity: 0.9, lineHeight: '1.5' }}>Your previous account was deleted. <b>Reason:</b> {localStorage.getItem('seller_app_deleted_reason') || 'Violation of terms'}. {localStorage.getItem('seller_app_deleted_msg') ? `"${localStorage.getItem('seller_app_deleted_msg')}"` : ''}</p>
                        <p style={{ margin: 0, fontSize: '14px', opacity: 0.9, lineHeight: '1.5' }}>You have been granted a second chance. Submit a new application to reactivate your store.</p>
                        <button onClick={() => navigate('/seller-setup')} style={{ marginTop: '16px', background: 'white', color: '#dc2626', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: '800', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>Go to Seller Registration</button>
                    </div>
                </div>
            )}

            {appStatus === 'pending_approval' && (
                <div style={{ background: 'linear-gradient(135deg, #fffbeb, #fef3c7)', border: '1px solid #fde68a', padding: '24px', borderRadius: '24px', marginBottom: '24px', color: '#92400e', display: 'flex', alignItems: 'flex-start', gap: '16px', boxShadow: '0 8px 25px rgba(245, 158, 11, 0.1)' }}>
                    <Clock size={32} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                        <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '800' }}>Application Under Review</h3>
                        <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5', color: '#b45309' }}>Hang tight, {sellerName}! Our admin team is currently reviewing your profile application. You will be able to post listings once approved.</p>
                    </div>
                </div>
            )}

            {appStatus === 'approved' && (
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



            <Seller_BannerPromo />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', marginTop: '8px' }}>
                <h2 style={{ fontSize: '20px', color: '#0f172a', margin: 0, fontWeight: '800', letterSpacing: '-0.5px' }}>Add New Listings</h2>
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>6 Categories</span>
            </div>

            {/* BLOCK CLICKS IF NOT APPROVED */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                
                <Link to="/add-business" style={{ textDecoration: 'none' }}>
                    <div style={{ borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', backgroundColor: '#fff', height: '100%', border: '1px solid #e2e8f0', position: 'relative' }}>
                        <div style={{ height: '110px', width: '100%', position: 'relative' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.5))', zIndex: 1 }}></div>
                            <img src={images.business} alt="Business Zone" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', top: '12px', right: '12px', fontSize: '18px', backgroundColor: '#fff', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', zIndex: 2, boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>🌾</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                            <div style={{ padding: '12px 12px 8px 12px' }}>
                                <h3 style={{ margin: '0 0 2px 0', fontSize: '15px', color: '#0f172a', fontWeight: '800' }}>Business Zone</h3>
                                <p style={{ margin: 0, fontSize: '11px', color: '#64748b', fontWeight: '500' }}>Sell bulk harvest.</p>
                            </div>
                            <div style={{ padding: '8px 12px', borderTop: '1px solid #f1f5f9', backgroundColor: '#fcfdfd', marginTop: 'auto' }}>
                                <p style={{ margin: 0, fontSize: '11px', color: '#16a34a', fontWeight: '700' }}>Click to add your listings</p>
                            </div>
                        </div>
                    </div>
                </Link>

                <Link to="/add-farm-fresh" style={{ textDecoration: 'none' }}>
                    <div style={{ borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', backgroundColor: '#fff', height: '100%', border: '1px solid #e2e8f0', position: 'relative' }}>
                        <div style={{ height: '110px', width: '100%', position: 'relative' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.5))', zIndex: 1 }}></div>
                            <img src={images.farmFresh} alt="Farm Fresh" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', top: '12px', right: '12px', fontSize: '18px', backgroundColor: '#fff', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', zIndex: 2, boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>🥬</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                            <div style={{ padding: '12px 12px 8px 12px' }}>
                                <h3 style={{ margin: '0 0 2px 0', fontSize: '15px', color: '#0f172a', fontWeight: '800' }}>Farm Fresh</h3>
                                <p style={{ margin: 0, fontSize: '11px', color: '#64748b', fontWeight: '500' }}>Sell fresh produce.</p>
                            </div>
                            <div style={{ padding: '8px 12px', borderTop: '1px solid #f1f5f9', backgroundColor: '#fcfdfd', marginTop: 'auto' }}>
                                <p style={{ margin: 0, fontSize: '11px', color: '#16a34a', fontWeight: '700' }}>Click to add your listings</p>
                            </div>
                        </div>
                    </div>
                </Link>

                <Link to="/add-machinery" style={{ textDecoration: 'none' }}>
                    <div style={{ borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', backgroundColor: '#fff', height: '100%', border: '1px solid #e2e8f0', position: 'relative' }}>
                        <div style={{ height: '110px', width: '100%', position: 'relative' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.5))', zIndex: 1 }}></div>
                            <img src={images.machinery} alt="Hire Machinery" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', top: '12px', right: '12px', fontSize: '18px', backgroundColor: '#fff', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', zIndex: 2, boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>🚜</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                            <div style={{ padding: '12px 12px 8px 12px' }}>
                                <h3 style={{ margin: '0 0 2px 0', fontSize: '15px', color: '#0f172a', fontWeight: '800' }}>Machinery</h3>
                                <p style={{ margin: 0, fontSize: '11px', color: '#64748b', fontWeight: '500' }}>Rent out equipment.</p>
                            </div>
                            <div style={{ padding: '8px 12px', borderTop: '1px solid #f1f5f9', backgroundColor: '#fcfdfd', marginTop: 'auto' }}>
                                <p style={{ margin: 0, fontSize: '11px', color: '#16a34a', fontWeight: '700' }}>Click to add your listings</p>
                            </div>
                        </div>
                    </div>
                </Link>

                <Link to="/add-workers" style={{ textDecoration: 'none' }}>
                    <div style={{ borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', backgroundColor: '#fff', height: '100%', border: '1px solid #e2e8f0', position: 'relative' }}>
                        <div style={{ height: '110px', width: '100%', position: 'relative' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.5))', zIndex: 1 }}></div>
                            <img src={images.workers} alt="Hire Workers" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', top: '12px', right: '12px', fontSize: '18px', backgroundColor: '#fff', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', zIndex: 2, boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>🧑‍🔧</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                            <div style={{ padding: '12px 12px 8px 12px' }}>
                                <h3 style={{ margin: '0 0 2px 0', fontSize: '15px', color: '#0f172a', fontWeight: '800' }}>Workers</h3>
                                <p style={{ margin: 0, fontSize: '11px', color: '#64748b', fontWeight: '500' }}>Provide labor services.</p>
                            </div>
                            <div style={{ padding: '8px 12px', borderTop: '1px solid #f1f5f9', backgroundColor: '#fcfdfd', marginTop: 'auto' }}>
                                <p style={{ margin: 0, fontSize: '11px', color: '#16a34a', fontWeight: '700' }}>Click to add your listings</p>
                            </div>
                        </div>
                    </div>
                </Link>

                <Link to="/add-freelancing" style={{ textDecoration: 'none' }}>
                    <div style={{ borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', backgroundColor: '#fff', height: '100%', border: '1px solid #e2e8f0', position: 'relative' }}>
                        <div style={{ height: '110px', width: '100%', position: 'relative' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.5))', zIndex: 1 }}></div>
                            <img src={images.freelance} alt="Freelancing" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', top: '12px', right: '12px', fontSize: '18px', backgroundColor: '#fff', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', zIndex: 2, boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>👨‍💻</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                            <div style={{ padding: '12px 12px 8px 12px' }}>
                                <h3 style={{ margin: '0 0 2px 0', fontSize: '15px', color: '#0f172a', fontWeight: '800' }}>Freelancing</h3>
                                <p style={{ margin: 0, fontSize: '11px', color: '#64748b', fontWeight: '500' }}>Offer specialized skills.</p>
                            </div>
                            <div style={{ padding: '8px 12px', borderTop: '1px solid #f1f5f9', backgroundColor: '#fcfdfd', marginTop: 'auto' }}>
                                <p style={{ margin: 0, fontSize: '11px', color: '#16a34a', fontWeight: '700' }}>Click to add your listings</p>
                            </div>
                        </div>
                    </div>
                </Link>

                <Link to="/add-local-goods" style={{ textDecoration: 'none' }}>
                    <div style={{ borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', backgroundColor: '#fff', height: '100%', border: '1px solid #e2e8f0', position: 'relative' }}>
                        <div style={{ height: '110px', width: '100%', position: 'relative' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.5))', zIndex: 1 }}></div>
                            <img src={images.localGoods} alt="Local Agri Goods" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', top: '12px', right: '12px', fontSize: '18px', backgroundColor: '#fff', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', zIndex: 2, boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>🧺</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                            <div style={{ padding: '12px 12px 8px 12px' }}>
                                <h3 style={{ margin: '0 0 2px 0', fontSize: '15px', color: '#0f172a', fontWeight: '800' }}>Local Goods</h3>
                                <p style={{ margin: 0, fontSize: '11px', color: '#64748b', fontWeight: '500' }}>Sell handmade & tools.</p>
                            </div>
                            <div style={{ padding: '8px 12px', borderTop: '1px solid #f1f5f9', backgroundColor: '#fcfdfd', marginTop: 'auto' }}>
                                <p style={{ margin: 0, fontSize: '10.5px', color: '#16a34a', fontWeight: '700', lineHeight: '1.3' }}>Click here to add your listings to live to the users</p>
                            </div>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}

export default Seller_HomePage;