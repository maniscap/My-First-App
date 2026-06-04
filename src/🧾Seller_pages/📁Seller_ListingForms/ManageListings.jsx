import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../../firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { ArrowLeft, Trash2, Edit2, PackageOpen } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';

export default function ManageListings() {
    const navigate = useNavigate();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);

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

            <div style={{ padding: '20px' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>Loading listings...</div>
                ) : listings.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '32px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                            <PackageOpen size={32} color="#94a3b8" />
                        </div>
                        <h3 style={{ margin: '0 0 8px 0', color: '#1e293b', fontSize: '16px' }}>No Listings Found</h3>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>You haven't added any listings yet.</p>
                        <button onClick={() => navigate('/Seller_HomePage')} style={{ marginTop: '20px', padding: '12px 24px', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>
                            Go Add Listings
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '16px' }}>
                        {listings.map(item => (
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
                                    </div>
                                    <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '700', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {item.itemName}
                                    </h3>
                                    <p style={{ margin: 0, fontSize: '14px', color: '#16a34a', fontWeight: '600' }}>₹{item.price} <span style={{ color: '#64748b', fontSize: '12px', fontWeight: '400' }}>/ {item.unit}</span></p>
                                </div>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <button 
                                        onClick={() => alert('Edit feature coming soon! (Will pre-fill the form)')}
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
        </div>
    );
}
