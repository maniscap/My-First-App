import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../../firebase';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ArrowLeft, Trash2, Edit2, PackageOpen, X, Power } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';

export default function ManageListings() {
    const navigate = useNavigate();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');

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

    const fetchListings = async (sellerAppId) => {
        try {
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
                if (a.createdAt && b.createdAt) {
                    return b.createdAt.toMillis() - a.createdAt.toMillis();
                }
                return 0;
            });
            
            setListings(data);
        } catch (error) {
            console.error("Error fetching listings:", error);
            alert("Failed to load your listings.");
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
        } catch (error) {
            console.error("Error deleting document:", error);
            alert("Failed to delete listing.");
        }
    };

    const handleOpenEdit = (item) => {
        if (item.collectionName === 'listings_farm_fresh') {
            navigate('/Seller_ListingForms/FarmFresh', { state: { editData: item } });
        } else {
            alert('Edit for this category is under construction.');
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#f8fafc', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
            
            {/* Header */}
            <div style={{ position: 'sticky', top: 0, backgroundColor: '#ffffff', zIndex: 10, padding: '16px 20px', display: 'flex', alignItems: 'center', borderBottom: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                <button onClick={() => navigate(-1)} style={{ background: '#f8fafc', border: 'none', padding: '8px', marginRight: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', cursor: 'pointer' }}>
                    <ArrowLeft size={20} color="#0f172a" />
                </button>
                <div style={{ flex: 1 }}>
                    <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0f172a', letterSpacing: '-0.3px' }}>Manage Listings</h1>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Edit or remove your products</p>
                </div>
            </div>

            {/* Scrollable Tabs */}
            <div style={{ display: 'flex', overflowX: 'auto', padding: '16px 20px', gap: '12px', backgroundColor: '#f8fafc', scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
                <style>{`
                    div::-webkit-scrollbar { display: none; }
                `}</style>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: '12px 20px',
                            border: activeTab === tab.id ? '1px solid #1e293b' : '1px solid #e2e8f0',
                            borderRadius: '16px',
                            background: activeTab === tab.id ? '#1e293b' : '#ffffff',
                            fontSize: '14px',
                            fontWeight: activeTab === tab.id ? '700' : '600',
                            color: activeTab === tab.id ? '#ffffff' : '#64748b',
                            boxShadow: activeTab === tab.id ? '0 10px 20px -5px rgba(30,41,59,0.3)' : '0 2px 4px rgba(0,0,0,0.02)',
                            whiteSpace: 'nowrap',
                            cursor: 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            outline: 'none'
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div style={{ padding: '20px' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>Loading listings...</div>
                ) : displayListings.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '32px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                            <PackageOpen size={32} color="#94a3b8" />
                        </div>
                        <h3 style={{ margin: '0 0 8px 0', color: '#1e293b', fontSize: '16px' }}>No Listings Found</h3>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>You haven't added any {activeTab !== 'all' ? tabs.find(t=>t.id === activeTab).label : ''} listings yet.</p>
                        <button onClick={() => navigate('/Seller_HomePage')} style={{ marginTop: '20px', padding: '12px 24px', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>
                            Go Add Listings
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '20px' }}>
                        {displayListings.map(item => (
                            <div key={item.id} style={{ 
                                backgroundColor: '#ffffff', borderRadius: '24px', padding: '16px', 
                                boxShadow: '0 4px 15px rgba(0,0,0,0.03), 0 1px 3px rgba(0,0,0,0.05)', 
                                border: '1px solid #f1f5f9', display: 'flex', gap: '16px', alignItems: 'center'
                            }}>
                                
                                <div style={{ width: '90px', height: '90px', borderRadius: '16px', backgroundColor: '#f8fafc', overflow: 'hidden', flexShrink: 0, boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
                                    {item.imageUrl ? (
                                        <img src={item.imageUrl} alt={item.itemName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '24px' }}>🌱</div>
                                    )}
                                </div>
                                
                                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                        <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#0369a1', backgroundColor: '#e0f2fe', padding: '4px 8px', borderRadius: '8px' }}>
                                            {item.listingType.replace('_', ' ')}
                                        </span>
                                        {item.status === 'paused' && (
                                            <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#b91c1c', backgroundColor: '#fee2e2', padding: '4px 8px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Power size={10} /> Paused
                                            </span>
                                        )}
                                    </div>
                                    <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '800', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.3px' }}>
                                        {item.itemName}
                                    </h3>
                                    <p style={{ margin: 0, fontSize: '16px', color: '#16a34a', fontWeight: '700' }}>₹{item.price} <span style={{ color: '#64748b', fontSize: '13px', fontWeight: '500' }}>/ {item.unit}</span></p>
                                </div>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <button 
                                        onClick={() => handleOpenEdit(item)}
                                        style={{ width: '40px', height: '40px', borderRadius: '12px', border: 'none', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#3b82f6', transition: 'background-color 0.2s' }}
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(item.id, item.collectionName)}
                                        style={{ width: '40px', height: '40px', borderRadius: '12px', border: 'none', backgroundColor: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#ef4444', transition: 'background-color 0.2s' }}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
