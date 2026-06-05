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
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#F5F5F7', overflowY: 'auto', WebkitOverflowScrolling: 'touch', width: '100vw', boxSizing: 'border-box', overflowX: 'hidden', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, Helvetica, sans-serif' }}>
            <style>{`
                * { box-sizing: border-box; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                .spin-anim { animation: spin 1s linear infinite; }
                div::-webkit-scrollbar { display: none; }
                
                .apple-card {
                    background: #FFFFFF;
                    border-radius: 20px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
                    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .apple-card:active {
                    transform: scale(0.97);
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
                }
                .btn-bounce {
                    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                }
                .btn-bounce:active {
                    transform: scale(0.92);
                    opacity: 0.8;
                }
            `}</style>
            
            {/* Apple Glass Header */}
            <div style={{ position: 'sticky', top: 0, zIndex: 50, padding: '16px 20px', background: 'rgba(245, 245, 247, 0.85)', backdropFilter: 'saturate(180%) blur(20px)', WebkitBackdropFilter: 'saturate(180%) blur(20px)', borderBottom: '0.5px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button onClick={() => navigate(-1)} className="btn-bounce" style={{ background: 'transparent', border: 'none', padding: '0', color: '#0071E3', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <ArrowLeft size={28} strokeWidth={2.5} />
                    </button>
                    <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1D1D1F', letterSpacing: '-0.5px' }}>Listings</h1>
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
                    style={{ background: '#E8F0FE', border: 'none', padding: '8px 14px', borderRadius: '14px', cursor: 'pointer', color: '#0071E3', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', opacity: loading ? 0.6 : 1 }}
                    disabled={loading}
                >
                    <RefreshCw size={16} className={loading ? "spin-anim" : ""} strokeWidth={2.5} /> {loading ? "Syncing" : "Sync"}
                </button>
            </div>

            {/* Segmented Controls (Tabs) */}
            <div style={{ padding: '20px 20px 10px 20px' }}>
                <div style={{ display: 'flex', overflowX: 'auto', gap: '8px', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className="btn-bounce"
                            style={{
                                padding: '10px 18px',
                                border: 'none',
                                borderRadius: '999px',
                                background: activeTab === tab.id ? '#1D1D1F' : '#E5E5EA',
                                fontSize: '15px',
                                fontWeight: activeTab === tab.id ? '600' : '500',
                                color: activeTab === tab.id ? '#FFFFFF' : '#1D1D1F',
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
                    <div style={{ textAlign: 'center', padding: '60px 0', color: '#86868B', fontWeight: '500', fontSize: '15px' }}>
                        <RefreshCw size={28} className="spin-anim" style={{ color: '#0071E3', marginBottom: '16px' }} />
                        <p>Loading your products...</p>
                    </div>
                ) : displayListings.length === 0 ? (
                    <div className="apple-card" style={{ textAlign: 'center', padding: '50px 20px', marginTop: '10px' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '32px', backgroundColor: '#F5F5F7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                            <PackageOpen size={32} color="#86868B" />
                        </div>
                        <h3 style={{ margin: '0 0 8px 0', color: '#1D1D1F', fontSize: '18px', fontWeight: '600' }}>No Listings Found</h3>
                        <p style={{ margin: 0, color: '#86868B', fontSize: '15px', lineHeight: '1.4' }}>You haven't added any {activeTab !== 'all' ? tabs.find(t=>t.id === activeTab).label : ''} items yet.</p>
                        <button onClick={() => navigate('/Seller_HomePage')} className="btn-bounce" style={{ marginTop: '24px', padding: '14px 28px', background: '#0071E3', color: '#fff', border: 'none', borderRadius: '999px', fontWeight: '600', fontSize: '15px', cursor: 'pointer' }}>
                            Create Listing
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {displayListings.map(item => (
                            <div key={item.id} className="apple-card" style={{ 
                                padding: '16px', 
                                display: 'flex', 
                                gap: '16px', 
                                alignItems: 'center',
                                width: '100%',
                                overflow: 'hidden'
                            }}>
                                
                                <div style={{ width: '80px', height: '80px', borderRadius: '16px', backgroundColor: '#F5F5F7', overflow: 'hidden', flexShrink: 0 }}>
                                    {item.imageUrl ? (
                                        <img src={item.imageUrl} alt={item.itemName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#86868B', fontSize: '24px' }}>⌘</div>
                                    )}
                                </div>
                                
                                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: '11px', fontWeight: '600', color: '#86868B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            {item.listingType.replace('_', ' ')}
                                        </span>
                                        {item.status === 'paused' && (
                                            <span style={{ fontSize: '10px', fontWeight: '600', color: '#FF3B30', backgroundColor: '#FFEBEA', padding: '2px 6px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Power size={10} /> Paused
                                            </span>
                                        )}
                                    </div>
                                    <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '600', color: '#1D1D1F', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.3px' }}>
                                        {item.itemName}
                                    </h3>
                                    <p style={{ margin: 0, fontSize: '16px', color: '#1D1D1F', fontWeight: '500' }}>₹{item.price} <span style={{ color: '#86868B', fontSize: '14px', fontWeight: '400' }}>/ {item.unit}</span></p>
                                </div>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
                                    <button 
                                        onClick={() => handleOpenEdit(item)}
                                        className="btn-bounce"
                                        style={{ width: '38px', height: '38px', borderRadius: '19px', border: 'none', backgroundColor: '#E8F0FE', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#0071E3' }}
                                    >
                                        <Edit2 size={16} strokeWidth={2.5} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(item.id, item.collectionName)}
                                        className="btn-bounce"
                                        style={{ width: '38px', height: '38px', borderRadius: '19px', border: 'none', backgroundColor: '#FFEBEA', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#FF3B30' }}
                                    >
                                        <Trash2 size={16} strokeWidth={2.5} />
                                    </button>
                                </div>
                                
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Apple Bottom Sheet Modal */}
            {editModalOpen && selectedItemForEdit && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                    {/* Backdrop */}
                    <div onClick={() => setEditModalOpen(false)} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', animation: 'fadeIn 0.3s ease' }}></div>
                    
                    {/* Sheet */}
                    <div style={{ position: 'relative', backgroundColor: '#F5F5F7', width: '100%', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '24px 20px 40px 20px', animation: 'slideUpSheet 0.4s cubic-bezier(0.16, 1, 0.3, 1)', boxShadow: '0 -10px 40px rgba(0,0,0,0.1)' }}>
                        <style>{`
                            @keyframes slideUpSheet { from { transform: translateY(100%); } to { transform: translateY(0); } }
                            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                        `}</style>
                        
                        {/* Drag Handle */}
                        <div style={{ width: '40px', height: '5px', backgroundColor: '#D1D1D6', borderRadius: '3px', margin: '0 auto 20px auto' }}></div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: '#1D1D1F', letterSpacing: '-0.5px' }}>Options</h3>
                            <button onClick={() => setEditModalOpen(false)} className="btn-bounce" style={{ background: '#E5E5EA', border: 'none', borderRadius: '15px', cursor: 'pointer', padding: '8px', display: 'flex', color: '#86868B' }}>
                                <X size={20} strokeWidth={2.5} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <button 
                                onClick={handleEditDetails}
                                className="btn-bounce apple-card"
                                style={{ width: '100%', padding: '16px', border: 'none', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', textAlign: 'left' }}
                            >
                                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#E8F0FE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0071E3', flexShrink: 0 }}>
                                    <Edit2 size={24} />
                                </div>
                                <div>
                                    <h4 style={{ margin: '0 0 2px 0', fontSize: '17px', fontWeight: '600', color: '#1D1D1F' }}>Edit Details</h4>
                                    <p style={{ margin: 0, fontSize: '14px', color: '#86868B', fontWeight: '400' }}>Modify price, photos, or text</p>
                                </div>
                            </button>

                            <button 
                                onClick={handleToggleVisibility}
                                className="btn-bounce apple-card"
                                style={{ width: '100%', padding: '16px', border: 'none', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', textAlign: 'left' }}
                            >
                                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: selectedItemForEdit.status === 'paused' ? '#E8F5E9' : '#FFEBEA', display: 'flex', alignItems: 'center', justifyContent: 'center', color: selectedItemForEdit.status === 'paused' ? '#34C759' : '#FF3B30', flexShrink: 0 }}>
                                    <Power size={24} />
                                </div>
                                <div>
                                    <h4 style={{ margin: '0 0 2px 0', fontSize: '17px', fontWeight: '600', color: selectedItemForEdit.status === 'paused' ? '#34C759' : '#FF3B30' }}>
                                        {selectedItemForEdit.status === 'paused' ? 'Activate Listing' : 'Pause Listing'}
                                    </h4>
                                    <p style={{ margin: 0, fontSize: '14px', color: '#86868B', fontWeight: '400' }}>
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
