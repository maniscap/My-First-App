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
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#f0f4f8', overflowY: 'auto', WebkitOverflowScrolling: 'touch', width: '100vw', boxSizing: 'border-box', overflowX: 'hidden' }}>
            <style>{`
                * { box-sizing: border-box; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                .spin-anim { animation: spin 1s linear infinite; }
                div::-webkit-scrollbar { display: none; }
                .glass-card {
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.9);
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.03);
                    border-radius: 28px;
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }
                .glass-card:active {
                    transform: scale(0.98);
                }
                .header-gradient {
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    box-shadow: 0 10px 30px rgba(16, 185, 129, 0.2);
                }
                .action-btn {
                    transition: all 0.2s ease;
                }
                .action-btn:active {
                    transform: scale(0.9);
                }
            `}</style>
            
            {/* Aesthetic Header */}
            <div className="header-gradient" style={{ position: 'relative', padding: '30px 20px 50px 20px', borderBottomLeftRadius: '40px', borderBottomRightRadius: '40px', color: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                    <button onClick={() => navigate(-1)} className="action-btn" style={{ background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '16px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ArrowLeft size={22} />
                    </button>
                    <button 
                        onClick={() => {
                            const sellerAppId = localStorage.getItem('seller_app_id');
                            if (sellerAppId) {
                                setLoading(true);
                                fetchListings(sellerAppId, true);
                            }
                        }}
                        className="action-btn"
                        style={{ background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '16px', cursor: 'pointer', color: 'white', fontWeight: '800', fontSize: '14px', opacity: loading ? 0.7 : 1 }}
                        disabled={loading}
                    >
                        <RefreshCw size={18} className={loading ? "spin-anim" : ""} /> {loading ? "Refreshing" : "Refresh"}
                    </button>
                </div>
                <div>
                    <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '900', letterSpacing: '-1px' }}>My Listings</h1>
                    <p style={{ margin: '6px 0 0', fontSize: '15px', opacity: 0.9, fontWeight: '500', letterSpacing: '0.2px' }}>Manage your organic produce & machinery</p>
                </div>
            </div>

            {/* Overlapping Scrollable Tabs */}
            <div style={{ display: 'flex', overflowX: 'auto', padding: '0 20px', gap: '12px', marginTop: '-24px', position: 'relative', zIndex: 10, paddingBottom: '20px' }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className="action-btn"
                        style={{
                            padding: '14px 26px',
                            border: '1px solid rgba(255,255,255,0.5)',
                            borderRadius: '20px',
                            background: activeTab === tab.id ? '#0f172a' : 'rgba(255,255,255,0.9)',
                            backdropFilter: 'blur(10px)',
                            fontSize: '15px',
                            fontWeight: activeTab === tab.id ? '800' : '700',
                            color: activeTab === tab.id ? '#ffffff' : '#475569',
                            boxShadow: activeTab === tab.id ? '0 10px 25px rgba(15,23,42,0.3)' : '0 4px 15px rgba(0,0,0,0.05)',
                            whiteSpace: 'nowrap',
                            cursor: 'pointer',
                            flexShrink: 0
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div style={{ padding: '0 20px 40px 20px' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b', fontWeight: '600', fontSize: '16px' }}>
                        <RefreshCw size={32} className="spin-anim" style={{ color: '#10b981', marginBottom: '16px' }} />
                        <p>Fetching your inventory...</p>
                    </div>
                ) : displayListings.length === 0 ? (
                    <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px', marginTop: '20px' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '40px', backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                            <PackageOpen size={40} color="#10b981" />
                        </div>
                        <h3 style={{ margin: '0 0 10px 0', color: '#0f172a', fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px' }}>No Listings Found</h3>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '15px', lineHeight: '1.5' }}>You haven't added any {activeTab !== 'all' ? tabs.find(t=>t.id === activeTab).label : ''} items yet.</p>
                        <button onClick={() => navigate('/Seller_HomePage')} className="action-btn" style={{ marginTop: '30px', padding: '16px 32px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', border: 'none', borderRadius: '16px', fontWeight: '800', fontSize: '16px', boxShadow: '0 10px 20px rgba(16,185,129,0.3)', cursor: 'pointer' }}>
                            Add New Listing
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {displayListings.map(item => (
                            <div key={item.id} className="glass-card" style={{ 
                                padding: '14px', 
                                display: 'flex', 
                                gap: '14px', 
                                alignItems: 'center',
                                width: '100%',
                                overflow: 'hidden'
                            }}>
                                
                                <div style={{ width: '85px', height: '85px', borderRadius: '20px', backgroundColor: '#f1f5f9', overflow: 'hidden', flexShrink: 0, boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.05)' }}>
                                    {item.imageUrl ? (
                                        <img src={item.imageUrl} alt={item.itemName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '28px' }}>🌱</div>
                                    )}
                                </div>
                                
                                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#0369a1', backgroundColor: '#e0f2fe', padding: '4px 8px', borderRadius: '8px' }}>
                                            {item.listingType.replace('_', ' ')}
                                        </span>
                                        {item.status === 'paused' && (
                                            <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ef4444', backgroundColor: '#fee2e2', padding: '4px 8px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Power size={10} /> Paused
                                            </span>
                                        )}
                                    </div>
                                    <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '800', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.3px' }}>
                                        {item.itemName}
                                    </h3>
                                    <p style={{ margin: 0, fontSize: '16px', color: '#10b981', fontWeight: '800' }}>₹{item.price} <span style={{ color: '#64748b', fontSize: '13px', fontWeight: '600' }}>/ {item.unit}</span></p>
                                </div>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
                                    <button 
                                        onClick={() => handleOpenEdit(item)}
                                        className="action-btn"
                                        style={{ width: '42px', height: '42px', borderRadius: '14px', border: 'none', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#3b82f6' }}
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(item.id, item.collectionName)}
                                        className="action-btn"
                                        style={{ width: '42px', height: '42px', borderRadius: '14px', border: 'none', backgroundColor: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#ef4444' }}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Premium Glass Edit Modal */}
            {editModalOpen && selectedItemForEdit && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
                    <div style={{ backgroundColor: '#ffffff', borderRadius: '32px', width: '100%', maxWidth: '400px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid rgba(255,255,255,0.5)', animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                        <style>{`
                            @keyframes slideUp { from { opacity: 0; transform: translateY(40px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
                        `}</style>
                        <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '22px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.5px' }}>Listing Options</h3>
                            <button onClick={() => setEditModalOpen(false)} className="action-btn" style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', cursor: 'pointer', padding: '10px', display: 'flex', color: '#64748b' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <div style={{ padding: '0 24px 30px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <button 
                                onClick={handleEditDetails}
                                className="action-btn"
                                style={{ width: '100%', padding: '20px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', textAlign: 'left', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}
                            >
                                <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', flexShrink: 0 }}>
                                    <Edit2 size={24} />
                                </div>
                                <div>
                                    <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Edit Details</h4>
                                    <p style={{ margin: 0, fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Modify price, image, or description</p>
                                </div>
                            </button>

                            <button 
                                onClick={handleToggleVisibility}
                                className="action-btn"
                                style={{ width: '100%', padding: '20px', background: selectedItemForEdit.status === 'paused' ? '#ecfdf5' : '#fff1f2', border: `1px solid ${selectedItemForEdit.status === 'paused' ? '#a7f3d0' : '#fecdd3'}`, borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', textAlign: 'left', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}
                            >
                                <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: selectedItemForEdit.status === 'paused' ? '#10b981' : '#f43f5e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', flexShrink: 0 }}>
                                    <Power size={24} />
                                </div>
                                <div>
                                    <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '800', color: selectedItemForEdit.status === 'paused' ? '#065f46' : '#9f1239' }}>
                                        {selectedItemForEdit.status === 'paused' ? 'Activate Listing' : 'Pause Listing'}
                                    </h4>
                                    <p style={{ margin: 0, fontSize: '13px', color: selectedItemForEdit.status === 'paused' ? '#047857' : '#be123c', fontWeight: '500' }}>
                                        {selectedItemForEdit.status === 'paused' ? 'Make this product visible to buyers' : 'Temporarily hide from the market'}
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
