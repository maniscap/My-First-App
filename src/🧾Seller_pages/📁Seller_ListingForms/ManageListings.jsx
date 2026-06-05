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
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#FAFAFA', overflowY: 'auto', WebkitOverflowScrolling: 'touch', width: '100vw', boxSizing: 'border-box', overflowX: 'hidden', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, Helvetica, sans-serif' }}>
            <style>{`
                * { box-sizing: border-box; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                .spin-anim { animation: spin 1s linear infinite; }
                div::-webkit-scrollbar { display: none; }
                
                /* Super refined card styling */
                .premium-card {
                    background: #FFFFFF;
                    border: 1px solid rgba(0, 0, 0, 0.04);
                    border-radius: 20px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02), 0 10px 40px rgba(0, 0, 0, 0.02);
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .premium-card:active {
                    transform: scale(0.97);
                    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.02);
                }
                
                /* Action buttons styling */
                .action-btn {
                    transition: all 0.2s ease;
                }
                .action-btn:active {
                    transform: scale(0.9);
                }

                /* Tab styling */
                .refined-tab {
                    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .refined-tab:active {
                    transform: scale(0.95);
                }
                
                /* Shimmer loading effect */
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
                .shimmer {
                    background: linear-gradient(90deg, #F3F4F6 25%, #E5E7EB 50%, #F3F4F6 75%);
                    background-size: 200% 100%;
                    animation: shimmer 1.5s infinite;
                }
            `}</style>
            
            {/* Header - Glassmorphic but pure white */}
            <div style={{ position: 'sticky', top: 0, zIndex: 50, padding: '16px 20px', background: 'rgba(250, 250, 250, 0.85)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button onClick={() => navigate(-1)} className="action-btn" style={{ background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.05)', padding: '8px', borderRadius: '50%', color: '#0066CC', cursor: 'pointer', display: 'flex', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                        <ArrowLeft size={20} strokeWidth={2.5} />
                    </button>
                    <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#000000', letterSpacing: '-0.8px' }}>Inventory</h1>
                </div>
                <button 
                    onClick={() => {
                        const sellerAppId = localStorage.getItem('seller_app_id');
                        if (sellerAppId) {
                            setLoading(true);
                            fetchListings(sellerAppId, true);
                        }
                    }}
                    className="action-btn"
                    style={{ background: '#0066CC', border: 'none', padding: '10px 16px', borderRadius: '999px', cursor: 'pointer', color: '#FFFFFF', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', opacity: loading ? 0.7 : 1, boxShadow: '0 4px 12px rgba(0, 102, 204, 0.25)' }}
                    disabled={loading}
                >
                    <RefreshCw size={16} className={loading ? "spin-anim" : ""} strokeWidth={2.5} /> {loading ? "Syncing" : "Sync"}
                </button>
            </div>

            {/* Scrollable Tabs */}
            <div style={{ padding: '24px 20px 16px 20px' }}>
                <div style={{ display: 'flex', overflowX: 'auto', gap: '10px', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', paddingBottom: '10px' }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className="refined-tab"
                            style={{
                                padding: '12px 24px',
                                border: 'none',
                                borderRadius: '12px',
                                background: activeTab === tab.id ? '#000000' : '#FFFFFF',
                                fontSize: '15px',
                                fontWeight: activeTab === tab.id ? '600' : '500',
                                color: activeTab === tab.id ? '#FFFFFF' : '#6B7280',
                                whiteSpace: 'nowrap',
                                cursor: 'pointer',
                                flexShrink: 0,
                                boxShadow: activeTab === tab.id ? '0 8px 20px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.03)',
                                border: activeTab === tab.id ? '1px solid #000' : '1px solid rgba(0,0,0,0.04)'
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ padding: '8px 20px 40px 20px' }}>
                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {[1, 2, 3].map(i => (
                            <div key={i} className="premium-card" style={{ padding: '16px', display: 'flex', gap: '16px', height: '120px' }}>
                                <div className="shimmer" style={{ width: '88px', height: '88px', borderRadius: '14px' }}></div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '12px' }}>
                                    <div className="shimmer" style={{ width: '80%', height: '18px', borderRadius: '4px' }}></div>
                                    <div className="shimmer" style={{ width: '50%', height: '14px', borderRadius: '4px' }}></div>
                                    <div className="shimmer" style={{ width: '30%', height: '20px', borderRadius: '4px' }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : displayListings.length === 0 ? (
                    <div className="premium-card" style={{ textAlign: 'center', padding: '60px 20px', marginTop: '10px', background: 'linear-gradient(180deg, #FFFFFF 0%, #FAFAFA 100%)' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '40px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(0,102,204,0.12)' }}>
                            <PackageOpen size={36} color="#0066CC" />
                        </div>
                        <h3 style={{ margin: '0 0 10px 0', color: '#000000', fontSize: '20px', fontWeight: '700', letterSpacing: '-0.5px' }}>No inventory found</h3>
                        <p style={{ margin: 0, color: '#6B7280', fontSize: '15px', lineHeight: '1.5' }}>You don't have any {activeTab !== 'all' ? tabs.find(t=>t.id === activeTab).label.toLowerCase() : ''} items listed right now.</p>
                        <button onClick={() => navigate('/Seller_HomePage')} className="action-btn" style={{ marginTop: '30px', padding: '16px 32px', background: '#000000', color: '#fff', border: 'none', borderRadius: '999px', fontWeight: '600', fontSize: '16px', cursor: 'pointer', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
                            Create a Listing
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {displayListings.map(item => (
                            <div key={item.id} className="premium-card" style={{ 
                                padding: '16px', 
                                display: 'flex', 
                                gap: '16px', 
                                alignItems: 'center',
                                width: '100%',
                                overflow: 'hidden'
                            }}>
                                
                                <div style={{ width: '92px', height: '92px', borderRadius: '16px', backgroundColor: '#F3F4F6', overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(0,0,0,0.05)' }}>
                                    {item.imageUrl ? (
                                        <img src={item.imageUrl} alt={item.itemName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: '28px' }}>📦</div>
                                    )}
                                </div>
                                
                                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: '10px', fontWeight: '700', color: '#0066CC', backgroundColor: '#EFF6FF', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '4px 10px', borderRadius: '8px' }}>
                                            {item.listingType.replace('_', ' ')}
                                        </span>
                                        {item.status === 'paused' && (
                                            <span style={{ fontSize: '10px', fontWeight: '700', color: '#DC2626', backgroundColor: '#FEF2F2', padding: '4px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px', letterSpacing: '0.8px' }}>
                                                <Power size={10} strokeWidth={3} /> PAUSED
                                            </span>
                                        )}
                                    </div>
                                    <h3 style={{ margin: '0 0 6px 0', fontSize: '19px', fontWeight: '700', color: '#000000', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.5px' }}>
                                        {item.itemName}
                                    </h3>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                        <span style={{ fontSize: '20px', fontWeight: '800', color: '#0066CC', letterSpacing: '-0.5px' }}>₹{item.price}</span>
                                        <span style={{ color: '#9CA3AF', fontSize: '14px', fontWeight: '500' }}>/ {item.unit}</span>
                                    </div>
                                </div>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flexShrink: 0 }}>
                                    <button 
                                        onClick={() => handleOpenEdit(item)}
                                        className="action-btn"
                                        style={{ width: '42px', height: '42px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#4B5563', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}
                                    >
                                        <Edit2 size={18} strokeWidth={2} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(item.id, item.collectionName)}
                                        className="action-btn"
                                        style={{ width: '42px', height: '42px', borderRadius: '12px', border: 'none', backgroundColor: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#DC2626' }}
                                    >
                                        <Trash2 size={18} strokeWidth={2} />
                                    </button>
                                </div>
                                
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Premium Edit Modal Sheet */}
            {editModalOpen && selectedItemForEdit && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                    {/* Blurred Backdrop */}
                    <div onClick={() => setEditModalOpen(false)} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', animation: 'fadeIn 0.25s ease' }}></div>
                    
                    {/* Sheet */}
                    <div style={{ position: 'relative', backgroundColor: '#FFFFFF', width: '100%', borderTopLeftRadius: '28px', borderTopRightRadius: '28px', padding: '24px 24px 48px 24px', animation: 'slideUpSheet 0.35s cubic-bezier(0.2, 1, 0.3, 1)', boxShadow: '0 -20px 60px rgba(0,0,0,0.15)' }}>
                        <style>{`
                            @keyframes slideUpSheet { from { transform: translateY(100%); } to { transform: translateY(0); } }
                            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                        `}</style>
                        
                        {/* Drag Handle */}
                        <div style={{ width: '48px', height: '5px', backgroundColor: '#E5E7EB', borderRadius: '3px', margin: '0 auto 28px auto' }}></div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                            <h3 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: '#000000', letterSpacing: '-0.5px' }}>Listing Options</h3>
                            <button onClick={() => setEditModalOpen(false)} className="action-btn" style={{ background: '#F3F4F6', border: 'none', borderRadius: '50%', cursor: 'pointer', padding: '8px', display: 'flex', color: '#6B7280' }}>
                                <X size={20} strokeWidth={2.5} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <button 
                                onClick={handleEditDetails}
                                className="action-btn premium-card"
                                style={{ width: '100%', padding: '18px', display: 'flex', alignItems: 'center', gap: '18px', cursor: 'pointer', textAlign: 'left', border: '1px solid rgba(0,0,0,0.05)', boxShadow: 'none' }}
                            >
                                <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: '#FAFAFA', border: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000000', flexShrink: 0 }}>
                                    <Edit2 size={22} strokeWidth={2} />
                                </div>
                                <div>
                                    <h4 style={{ margin: '0 0 4px 0', fontSize: '17px', fontWeight: '700', color: '#000000', letterSpacing: '-0.3px' }}>Edit Details</h4>
                                    <p style={{ margin: 0, fontSize: '14px', color: '#6B7280', fontWeight: '500' }}>Modify price, photos, or description</p>
                                </div>
                            </button>

                            <button 
                                onClick={handleToggleVisibility}
                                className="action-btn premium-card"
                                style={{ width: '100%', padding: '18px', display: 'flex', alignItems: 'center', gap: '18px', cursor: 'pointer', textAlign: 'left', border: '1px solid rgba(0,0,0,0.05)', boxShadow: 'none' }}
                            >
                                <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: selectedItemForEdit.status === 'paused' ? '#000000' : '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: selectedItemForEdit.status === 'paused' ? '#FFFFFF' : '#DC2626', flexShrink: 0 }}>
                                    <Power size={22} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h4 style={{ margin: '0 0 4px 0', fontSize: '17px', fontWeight: '700', color: selectedItemForEdit.status === 'paused' ? '#000000' : '#DC2626', letterSpacing: '-0.3px' }}>
                                        {selectedItemForEdit.status === 'paused' ? 'Activate Listing' : 'Pause Listing'}
                                    </h4>
                                    <p style={{ margin: 0, fontSize: '14px', color: '#6B7280', fontWeight: '500' }}>
                                        {selectedItemForEdit.status === 'paused' ? 'Make visible to buyers again' : 'Hide temporarily from the marketplace'}
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
