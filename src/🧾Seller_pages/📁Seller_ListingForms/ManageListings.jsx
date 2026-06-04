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

    // Quick Edit States
    const [editingItem, setEditingItem] = useState(null);
    const [editPrice, setEditPrice] = useState('');
    const [editUnit, setEditUnit] = useState('');
    const [editStatus, setEditStatus] = useState('active');
    const [isSaving, setIsSaving] = useState(false);

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
        setEditingItem(item);
        setEditPrice(item.price || '');
        setEditUnit(item.unit || '');
        setEditStatus(item.status || 'active');
    };

    const handleSaveEdit = async () => {
        if (!editingItem) return;
        setIsSaving(true);
        try {
            const itemRef = doc(db, editingItem.collectionName, editingItem.id);
            await updateDoc(itemRef, {
                price: parseFloat(editPrice),
                unit: editUnit,
                status: editStatus
            });
            
            // Update local state
            setListings(listings.map(l => 
                l.id === editingItem.id 
                    ? { ...l, price: parseFloat(editPrice), unit: editUnit, status: editStatus } 
                    : l
            ));
            setEditingItem(null);
        } catch (error) {
            console.error("Error updating listing:", error);
            alert("Failed to update listing.");
        } finally {
            setIsSaving(false);
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
            <div style={{ display: 'flex', overflowX: 'auto', padding: '0 20px', gap: '8px', borderBottom: '1px solid #f1f5f9', backgroundColor: '#fff', scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
                <style>{`
                    div::-webkit-scrollbar { display: none; }
                `}</style>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: '12px 16px',
                            border: 'none',
                            background: 'none',
                            fontSize: '14px',
                            fontWeight: activeTab === tab.id ? '800' : '600',
                            color: activeTab === tab.id ? '#16a34a' : '#64748b',
                            borderBottom: activeTab === tab.id ? '3px solid #16a34a' : '3px solid transparent',
                            whiteSpace: 'nowrap',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
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
                    <div style={{ display: 'grid', gap: '16px' }}>
                        {displayListings.map(item => (
                            <div key={item.id} style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', gap: '16px', alignItems: 'center' }}>
                                
                                <div style={{ width: '80px', height: '80px', borderRadius: '12px', backgroundColor: '#f1f5f9', overflow: 'hidden', flexShrink: 0 }}>
                                    {item.imageUrl ? (
                                        <img src={item.imageUrl} alt={item.itemName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '12px' }}>No Image</div>
                                    )}
                                </div>
                                
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                        <span style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', color: '#0369a1', backgroundColor: '#e0f2fe', padding: '2px 6px', borderRadius: '4px' }}>
                                            {item.listingType.replace('_', ' ')}
                                        </span>
                                        {item.status === 'paused' && (
                                            <span style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', color: '#b91c1c', backgroundColor: '#fee2e2', padding: '2px 6px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                                <Power size={10} /> Paused
                                            </span>
                                        )}
                                    </div>
                                    <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '700', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {item.itemName}
                                    </h3>
                                    <p style={{ margin: 0, fontSize: '14px', color: '#16a34a', fontWeight: '600' }}>₹{item.price} <span style={{ color: '#64748b', fontSize: '12px', fontWeight: '400' }}>/ {item.unit}</span></p>
                                </div>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <button 
                                        onClick={() => handleOpenEdit(item)}
                                        style={{ width: '36px', height: '36px', borderRadius: '18px', border: '1px solid #e2e8f0', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#3b82f6' }}
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(item.id, item.collectionName)}
                                        style={{ width: '36px', height: '36px', borderRadius: '18px', border: '1px solid #fee2e2', backgroundColor: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#ef4444' }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Edit Modal */}
            {editingItem && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a', fontWeight: '700' }}>Quick Edit</h3>
                            <button onClick={() => setEditingItem(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
                                <X size={20} color="#64748b" />
                            </button>
                        </div>
                        
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Status</label>
                            <select 
                                value={editStatus} 
                                onChange={(e) => setEditStatus(e.target.value)}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '16px', color: '#0f172a', backgroundColor: '#fff', outline: 'none' }}
                            >
                                <option value="active">Active (Visible)</option>
                                <option value="paused">Paused (Out of Stock)</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Price (₹)</label>
                            <input 
                                type="number" 
                                value={editPrice} 
                                onChange={(e) => setEditPrice(e.target.value)}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '16px', color: '#0f172a', outline: 'none' }}
                            />
                        </div>
                        
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Unit</label>
                            <input 
                                type="text" 
                                value={editUnit} 
                                onChange={(e) => setEditUnit(e.target.value)}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '16px', color: '#0f172a', outline: 'none' }}
                            />
                        </div>
                        
                        <button 
                            onClick={handleSaveEdit}
                            disabled={isSaving}
                            style={{ width: '100%', padding: '14px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: isSaving ? 'not-allowed' : 'pointer', transition: 'background-color 0.2s' }}
                        >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
