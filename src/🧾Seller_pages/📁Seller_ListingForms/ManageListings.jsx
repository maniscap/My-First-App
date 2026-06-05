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
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#FAF6F0', overflowY: 'auto', WebkitOverflowScrolling: 'touch', width: '100vw', boxSizing: 'border-box', overflowX: 'hidden', fontFamily: "'Nunito', sans-serif" }}>
            <style>{`
                * { box-sizing: border-box; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                .spin-anim { animation: spin 1s linear infinite; }
                div::-webkit-scrollbar { display: none; }
                
                .earth-card {
                    background: #FFFFFF;
                    border: 1px solid #F0EAE1;
                    box-shadow: 0 8px 24px rgba(62, 39, 35, 0.04);
                    border-radius: 24px;
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }
                .earth-card:active {
                    transform: scale(0.98);
                    box-shadow: 0 4px 12px rgba(62, 39, 35, 0.06);
                }
                .action-btn {
                    transition: all 0.2s ease;
                }
                .action-btn:active {
                    transform: scale(0.92);
                }
            `}</style>
            
            {/* Earthy Organic Header */}
            <div style={{ padding: '30px 20px 20px 20px', backgroundColor: '#FAF6F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                    <button onClick={() => navigate(-1)} className="action-btn" style={{ background: '#FFFFFF', border: '1px solid #EAE3D9', padding: '12px', borderRadius: '16px', color: '#4A3C31', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
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
                        style={{ background: '#E8F5E9', border: '1px solid #C8E6C9', padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '16px', cursor: 'pointer', color: '#2E7D32', fontWeight: '800', fontSize: '14px', opacity: loading ? 0.7 : 1 }}
                        disabled={loading}
                    >
                        <RefreshCw size={18} className={loading ? "spin-anim" : ""} /> {loading ? "Refreshing" : "Refresh"}
                    </button>
                </div>
                <div>
                    <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '900', color: '#3E2723', letterSpacing: '-0.5px' }}>My Harvest</h1>
                    <p style={{ margin: '6px 0 0', fontSize: '15px', color: '#795548', fontWeight: '600', letterSpacing: '0.2px' }}>Manage your organic produce & listings</p>
                </div>
            </div>

            {/* Earthy Scrollable Tabs */}
            <div style={{ display: 'flex', overflowX: 'auto', padding: '10px 20px', gap: '12px', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', paddingBottom: '20px' }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className="action-btn"
                        style={{
                            padding: '12px 24px',
                            border: 'none',
                            borderRadius: '20px',
                            background: activeTab === tab.id ? '#4A3C31' : '#F0EAE1',
                            fontSize: '15px',
                            fontWeight: activeTab === tab.id ? '800' : '700',
                            color: activeTab === tab.id ? '#FAF6F0' : '#8D6E63',
                            boxShadow: activeTab === tab.id ? '0 8px 20px rgba(74, 60, 49, 0.2)' : 'none',
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
                    <div style={{ textAlign: 'center', padding: '60px 0', color: '#8D6E63', fontWeight: '600', fontSize: '16px' }}>
                        <RefreshCw size={32} className="spin-anim" style={{ color: '#2E7D32', marginBottom: '16px' }} />
                        <p>Gathering your items...</p>
                    </div>
                ) : displayListings.length === 0 ? (
                    <div className="earth-card" style={{ textAlign: 'center', padding: '60px 20px', marginTop: '10px' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '40px', backgroundColor: '#F0EAE1', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                            <PackageOpen size={40} color="#8D6E63" />
                        </div>
                        <h3 style={{ margin: '0 0 10px 0', color: '#3E2723', fontSize: '20px', fontWeight: '800' }}>No Items Yet</h3>
                        <p style={{ margin: 0, color: '#795548', fontSize: '15px', lineHeight: '1.5' }}>You haven't listed any {activeTab !== 'all' ? tabs.find(t=>t.id === activeTab).label : ''} produce.</p>
                        <button onClick={() => navigate('/Seller_HomePage')} className="action-btn" style={{ marginTop: '30px', padding: '16px 32px', background: '#2E7D32', color: '#fff', border: 'none', borderRadius: '16px', fontWeight: '800', fontSize: '16px', boxShadow: '0 10px 20px rgba(46, 125, 50, 0.25)', cursor: 'pointer' }}>
                            Plant a Listing
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {displayListings.map(item => (
                            <div key={item.id} className="earth-card" style={{ 
                                padding: '14px', 
                                display: 'flex', 
                                gap: '14px', 
                                alignItems: 'center',
                                width: '100%',
                                overflow: 'hidden'
                            }}>
                                
                                <div style={{ width: '85px', height: '85px', borderRadius: '18px', backgroundColor: '#F9F6EE', border: '1px solid #EAE3D9', overflow: 'hidden', flexShrink: 0 }}>
                                    {item.imageUrl ? (
                                        <img src={item.imageUrl} alt={item.itemName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A1887F', fontSize: '28px' }}>🌾</div>
                                    )}
                                </div>
                                
                                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#5D4037', backgroundColor: '#EFEBE5', padding: '4px 8px', borderRadius: '8px' }}>
                                            {item.listingType.replace('_', ' ')}
                                        </span>
                                        {item.status === 'paused' && (
                                            <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#C62828', backgroundColor: '#FFEBEE', padding: '4px 8px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Power size={10} /> Paused
                                            </span>
                                        )}
                                    </div>
                                    <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '800', color: '#3E2723', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.3px' }}>
                                        {item.itemName}
                                    </h3>
                                    <p style={{ margin: 0, fontSize: '16px', color: '#2E7D32', fontWeight: '800' }}>₹{item.price} <span style={{ color: '#8D6E63', fontSize: '13px', fontWeight: '600' }}>/ {item.unit}</span></p>
                                </div>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
                                    <button 
                                        onClick={() => handleOpenEdit(item)}
                                        className="action-btn"
                                        style={{ width: '42px', height: '42px', borderRadius: '14px', border: 'none', backgroundColor: '#F0EAE1', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#5D4037' }}
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(item.id, item.collectionName)}
                                        className="action-btn"
                                        style={{ width: '42px', height: '42px', borderRadius: '14px', border: 'none', backgroundColor: '#FFEBEE', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#C62828' }}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Earthy Edit Modal */}
            {editModalOpen && selectedItemForEdit && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(62, 39, 35, 0.5)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
                    <div style={{ backgroundColor: '#FAF6F0', borderRadius: '32px', width: '100%', maxWidth: '400px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(62, 39, 35, 0.3)', border: '1px solid #EAE3D9', animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                        <style>{`
                            @keyframes slideUp { from { opacity: 0; transform: translateY(40px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
                        `}</style>
                        <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '22px', fontWeight: '900', color: '#3E2723', letterSpacing: '-0.5px' }}>Listing Options</h3>
                            <button onClick={() => setEditModalOpen(false)} className="action-btn" style={{ background: '#EAE3D9', border: 'none', borderRadius: '50%', cursor: 'pointer', padding: '10px', display: 'flex', color: '#5D4037' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <div style={{ padding: '0 24px 30px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <button 
                                onClick={handleEditDetails}
                                className="action-btn"
                                style={{ width: '100%', padding: '20px', background: '#FFFFFF', border: '1px solid #EAE3D9', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', textAlign: 'left', boxShadow: '0 4px 10px rgba(62, 39, 35, 0.02)' }}
                            >
                                <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: '#F0EAE1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5D4037', flexShrink: 0 }}>
                                    <Edit2 size={24} />
                                </div>
                                <div>
                                    <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '800', color: '#3E2723' }}>Edit Details</h4>
                                    <p style={{ margin: 0, fontSize: '13px', color: '#795548', fontWeight: '600' }}>Modify price, image, or description</p>
                                </div>
                            </button>

                            <button 
                                onClick={handleToggleVisibility}
                                className="action-btn"
                                style={{ width: '100%', padding: '20px', background: selectedItemForEdit.status === 'paused' ? '#E8F5E9' : '#FFF3E0', border: `1px solid ${selectedItemForEdit.status === 'paused' ? '#C8E6C9' : '#FFE0B2'}`, borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', textAlign: 'left', boxShadow: '0 4px 10px rgba(62, 39, 35, 0.02)' }}
                            >
                                <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: selectedItemForEdit.status === 'paused' ? '#2E7D32' : '#E65100', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', flexShrink: 0 }}>
                                    <Power size={24} />
                                </div>
                                <div>
                                    <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '800', color: selectedItemForEdit.status === 'paused' ? '#1B5E20' : '#E65100' }}>
                                        {selectedItemForEdit.status === 'paused' ? 'Activate Listing' : 'Pause Listing'}
                                    </h4>
                                    <p style={{ margin: 0, fontSize: '13px', color: selectedItemForEdit.status === 'paused' ? '#2E7D32' : '#EF6C00', fontWeight: '600' }}>
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
