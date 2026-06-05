import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../../firebase';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ArrowLeft, Trash2, Edit2, PackageOpen, X, Power, RefreshCw } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';

export default function ManageListings() {
    const navigate = useNavigate();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedItemForEdit, setSelectedItemForEdit] = useState(null);

    const tabs = [
        { id: 'all', label: 'All Listings' },
        { id: 'listings_farm_fresh', label: 'Farm Fresh' },
        { id: 'listings_machinery', label: 'Machinery' },
        { id: 'listings_workers', label: 'Workers' },
        { id: 'listings_business', label: 'Business' },
        { id: 'listings_freelancing', label: 'Freelancing' },
        { id: 'listings_local_goods', label: 'Local Goods' }
    ];

    const displayListings = activeTab === 'all' 
        ? listings 
        : listings.filter(item => item.collectionName === activeTab);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                const sellerAppId = localStorage.getItem('seller_app_id');
                if (sellerAppId) fetchListings(sellerAppId);
                else setLoading(false);
            } else {
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    const fetchListings = async (sellerAppId, forceRefresh = false) => {
        try {
            if (!forceRefresh) {
                const cached = sessionStorage.getItem(`seller_listings_${sellerAppId}`);
                if (cached) {
                    setListings(JSON.parse(cached));
                    setLoading(false);
                    return; // Pure cache hit, massive read savings!
                }
            }

            const collectionsToFetch = [
                'listings_farm_fresh',
                'listings_machinery',
                'listings_workers',
                'listings_business',
                'listings_freelancing',
                'listings_local_goods'
            ];

            const promises = collectionsToFetch.map(async (colName) => {
                const q = query(collection(db, colName), where('sellerId', '==', sellerAppId));
                const snapshot = await getDocs(q);
                return snapshot.docs.map(doc => ({
                    id: doc.id,
                    collectionName: colName,
                    ...doc.data()
                }));
            });
            
            const results = await Promise.all(promises);
            const data = results.flat();
            
            // Sort client-side by date if createdAt exists
            data.sort((a, b) => {
                const timeA = a.createdAt?.seconds ? a.createdAt.seconds : 0;
                const timeB = b.createdAt?.seconds ? b.createdAt.seconds : 0;
                return timeB - timeA;
            });
            
            setListings(data);
            sessionStorage.setItem(`seller_listings_${sellerAppId}`, JSON.stringify(data));
        } catch (error) {
            console.error("Error fetching listings:", error);
            if (!listings.length) alert("Failed to load your listings.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, collectionName) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this listing?");
        if (!confirmDelete) return;

        try {
            await deleteDoc(doc(db, collectionName, id));
            setListings(listings.filter(item => item.id !== id));
            const sellerAppId = localStorage.getItem('seller_app_id');
            if (sellerAppId) sessionStorage.removeItem(`seller_listings_${sellerAppId}`);
        } catch (error) {
            console.error("Error deleting document:", error);
            alert("Failed to delete listing.");
        }
    };

    const handleOpenEdit = (item) => {
        setSelectedItemForEdit(item);
        setEditModalOpen(true);
    };

    const handleToggleVisibility = async () => {
        if (!selectedItemForEdit) return;
        
        const isCurrentlyPaused = selectedItemForEdit.status === 'paused';
        const newStatus = isCurrentlyPaused ? 'active' : 'paused';
        
        const confirmMsg = isCurrentlyPaused 
            ? "Are you sure you want to activate this listing? It will become visible to all buyers."
            : "Are you sure you want to pause this listing? It will be hidden from buyers.";
            
        if (!window.confirm(confirmMsg)) return;

        try {
            const itemRef = doc(db, selectedItemForEdit.collectionName, selectedItemForEdit.id);
            await updateDoc(itemRef, { status: newStatus });
            
            setListings(listings.map(item => 
                item.id === selectedItemForEdit.id ? { ...item, status: newStatus } : item
            ));
            const sellerAppId = localStorage.getItem('seller_app_id');
            if (sellerAppId) sessionStorage.removeItem(`seller_listings_${sellerAppId}`);
            setEditModalOpen(false);
            setSelectedItemForEdit(null);
        } catch (error) {
            console.error("Error updating visibility:", error);
            alert("Failed to update visibility.");
        }
    };

    const handleEditDetails = () => {
        if (!selectedItemForEdit) return;
        if (selectedItemForEdit.collectionName === 'listings_farm_fresh') {
            navigate('/add-farm-fresh', { state: { editData: selectedItemForEdit } });
        } else {
            alert('Edit for this category is under construction.');
        }
        setEditModalOpen(false);
    };

    return (
        <div className="aurora-bg" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch', width: '100vw', boxSizing: 'border-box', overflowX: 'hidden', fontFamily: "'Inter', system-ui, sans-serif" }}>
            <style>{`
                * { box-sizing: border-box; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                .spin-anim { animation: spin 1s linear infinite; }
                div::-webkit-scrollbar { display: none; }
                
                @keyframes aurora {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .aurora-bg {
                    background: linear-gradient(-45deg, #0f172a, #1e1b4b, #312e81, #4c1d95, #581c87, #020617);
                    background-size: 400% 400%;
                    animation: aurora 20s ease infinite;
                }
                
                .glass-panel {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(24px);
                    -webkit-backdrop-filter: blur(24px);
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    border-left: 1px solid rgba(255, 255, 255, 0.05);
                    border-right: 1px solid rgba(255, 255, 255, 0.02);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.02);
                    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.4);
                    border-radius: 20px;
                    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .glass-panel:active {
                    transform: scale(0.97);
                    box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.6);
                }
                
                .text-glow {
                    text-shadow: 0 0 15px rgba(255,255,255,0.4);
                }
                
                .btn-bounce {
                    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                }
                .btn-bounce:active {
                    transform: scale(0.92);
                }
            `}</style>
            
            {/* Aurora Glass Header */}
            <div style={{ position: 'sticky', top: 0, zIndex: 50, padding: '20px 20px', background: 'rgba(2, 6, 23, 0.4)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 30px rgba(0,0,0,0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button onClick={() => navigate(-1)} className="btn-bounce" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px', borderRadius: '12px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <ArrowLeft size={24} strokeWidth={2} />
                    </button>
                    <h1 className="text-glow" style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#FFFFFF', letterSpacing: '0.5px' }}>My Listings</h1>
                </div>
                <button 
                    onClick={() => {
                        const sellerAppId = localStorage.getItem('seller_app_id');
                        if (sellerAppId) {
                            setLoading(true);
                            fetchListings(sellerAppId, true);
                        }
                    }}
                    className="btn-bounce"
                    style={{ background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '12px', cursor: 'pointer', color: '#fff', fontWeight: '600', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', opacity: loading ? 0.6 : 1, boxShadow: '0 0 15px rgba(168, 85, 247, 0.4)' }}
                    disabled={loading}
                >
                    <RefreshCw size={16} className={loading ? "spin-anim" : ""} strokeWidth={2} /> {loading ? "Syncing" : "Sync"}
                </button>
            </div>

            {/* Aurora Floating Pills */}
            <div style={{ padding: '20px 20px 10px 20px', position: 'relative', zIndex: 10 }}>
                <div style={{ display: 'flex', overflowX: 'auto', gap: '12px', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', paddingBottom: '10px' }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className="btn-bounce"
                            style={{
                                padding: '10px 20px',
                                border: activeTab === tab.id ? '1px solid rgba(168, 85, 247, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '16px',
                                background: activeTab === tab.id ? 'rgba(126, 34, 206, 0.4)' : 'rgba(255, 255, 255, 0.05)',
                                backdropFilter: 'blur(10px)',
                                fontSize: '14px',
                                fontWeight: activeTab === tab.id ? '600' : '500',
                                color: activeTab === tab.id ? '#FFFFFF' : 'rgba(255,255,255,0.6)',
                                boxShadow: activeTab === tab.id ? '0 0 20px rgba(168, 85, 247, 0.3)' : 'none',
                                whiteSpace: 'nowrap',
                                cursor: 'pointer',
                                flexShrink: 0
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ padding: '10px 20px 40px 20px' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.7)', fontWeight: '500', fontSize: '15px' }}>
                        <RefreshCw size={28} className="spin-anim text-glow" style={{ color: '#a855f7', marginBottom: '16px' }} />
                        <p>Loading your products...</p>
                    </div>
                ) : displayListings.length === 0 ? (
                    <div className="glass-panel" style={{ textAlign: 'center', padding: '50px 20px', marginTop: '10px' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '32px', backgroundColor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <PackageOpen size={32} color="rgba(255,255,255,0.5)" />
                        </div>
                        <h3 style={{ margin: '0 0 8px 0', color: '#FFFFFF', fontSize: '18px', fontWeight: '600' }}>No Listings Found</h3>
                        <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '15px', lineHeight: '1.4' }}>You haven't added any {activeTab !== 'all' ? tabs.find(t=>t.id === activeTab).label : ''} items yet.</p>
                        <button onClick={() => navigate('/Seller_HomePage')} className="btn-bounce" style={{ marginTop: '24px', padding: '14px 28px', background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '16px', fontWeight: '600', fontSize: '15px', cursor: 'pointer', boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)' }}>
                            Create Listing
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {displayListings.map(item => (
                            <div key={item.id} className="glass-panel" style={{ 
                                padding: '16px', 
                                display: 'flex', 
                                gap: '16px', 
                                alignItems: 'center',
                                width: '100%',
                                overflow: 'hidden'
                            }}>
                                
                                <div style={{ width: '80px', height: '80px', borderRadius: '14px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', flexShrink: 0 }}>
                                    {item.imageUrl ? (
                                        <img src={item.imageUrl} alt={item.itemName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '24px' }}>✦</div>
                                    )}
                                </div>
                                
                                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: '10px', fontWeight: '600', color: '#e2e8f0', backgroundColor: 'rgba(255,255,255,0.1)', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '2px 6px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            {item.listingType.replace('_', ' ')}
                                        </span>
                                        {item.status === 'paused' && (
                                            <span style={{ fontSize: '10px', fontWeight: '600', color: '#fca5a5', backgroundColor: 'rgba(239, 68, 68, 0.2)', padding: '2px 6px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                                                <Power size={10} /> Paused
                                            </span>
                                        )}
                                    </div>
                                    <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '600', color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '0.2px' }}>
                                        {item.itemName}
                                    </h3>
                                    <p style={{ margin: 0, fontSize: '16px', color: '#a855f7', fontWeight: '600', textShadow: '0 0 10px rgba(168, 85, 247, 0.3)' }}>₹{item.price} <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', fontWeight: '400', textShadow: 'none' }}>/ {item.unit}</span></p>
                                </div>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
                                    <button 
                                        onClick={() => handleOpenEdit(item)}
                                        className="btn-bounce"
                                        style={{ width: '38px', height: '38px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#a855f7' }}
                                    >
                                        <Edit2 size={16} strokeWidth={2} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(item.id, item.collectionName)}
                                        className="btn-bounce"
                                        style={{ width: '38px', height: '38px', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)', backgroundColor: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fca5a5' }}
                                    >
                                        <Trash2 size={16} strokeWidth={2} />
                                    </button>
                                </div>
                                
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Aurora Glass Edit Modal */}
            {editModalOpen && selectedItemForEdit && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                    {/* Dark Aurora Backdrop */}
                    <div onClick={() => setEditModalOpen(false)} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', animation: 'fadeIn 0.3s ease' }}></div>
                    
                    {/* Glass Sheet */}
                    <div style={{ position: 'relative', background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)', width: '100%', borderTopLeftRadius: '32px', borderTopRightRadius: '32px', borderTop: '1px solid rgba(255,255,255,0.1)', padding: '20px 20px 40px 20px', animation: 'slideUpSheet 0.4s cubic-bezier(0.16, 1, 0.3, 1)', boxShadow: '0 -10px 50px rgba(0,0,0,0.5)' }}>
                        <style>{`
                            @keyframes slideUpSheet { from { transform: translateY(100%); } to { transform: translateY(0); } }
                            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                        `}</style>
                        
                        {/* Glowing Drag Handle */}
                        <div style={{ width: '40px', height: '4px', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '2px', margin: '0 auto 24px auto', boxShadow: '0 0 10px rgba(255,255,255,0.2)' }}></div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 className="text-glow" style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: '#FFFFFF', letterSpacing: '0.5px' }}>Listing Options</h3>
                            <button onClick={() => setEditModalOpen(false)} className="btn-bounce" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', cursor: 'pointer', padding: '8px', display: 'flex', color: '#fff' }}>
                                <X size={20} strokeWidth={2} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <button 
                                onClick={handleEditDetails}
                                className="btn-bounce glass-panel"
                                style={{ width: '100%', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', textAlign: 'left', borderTop: '1px solid rgba(255,255,255,0.1)', borderLeft: '1px solid rgba(255,255,255,0.1)' }}
                            >
                                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(168, 85, 247, 0.2)', border: '1px solid rgba(168, 85, 247, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d8b4fe', flexShrink: 0 }}>
                                    <Edit2 size={24} />
                                </div>
                                <div>
                                    <h4 style={{ margin: '0 0 2px 0', fontSize: '16px', fontWeight: '600', color: '#FFFFFF' }}>Edit Details</h4>
                                    <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontWeight: '400' }}>Modify price, photos, or text</p>
                                </div>
                            </button>

                            <button 
                                onClick={handleToggleVisibility}
                                className="btn-bounce glass-panel"
                                style={{ width: '100%', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', textAlign: 'left', borderTop: '1px solid rgba(255,255,255,0.1)', borderLeft: '1px solid rgba(255,255,255,0.1)' }}
                            >
                                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: selectedItemForEdit.status === 'paused' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)', border: `1px solid ${selectedItemForEdit.status === 'paused' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: selectedItemForEdit.status === 'paused' ? '#86efac' : '#fca5a5', flexShrink: 0 }}>
                                    <Power size={24} />
                                </div>
                                <div>
                                    <h4 style={{ margin: '0 0 2px 0', fontSize: '16px', fontWeight: '600', color: selectedItemForEdit.status === 'paused' ? '#86efac' : '#fca5a5' }}>
                                        {selectedItemForEdit.status === 'paused' ? 'Activate Listing' : 'Pause Listing'}
                                    </h4>
                                    <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontWeight: '400' }}>
                                        {selectedItemForEdit.status === 'paused' ? 'Make visible to buyers' : 'Hide from the marketplace'}
                                    </p>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
