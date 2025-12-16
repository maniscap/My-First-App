import React, { useState, useEffect } from 'react';
import { doc, collection, query, where, getDocs, setDoc, deleteDoc } from 'firebase/firestore'; 
import { db } from '../firebase'; 
// 🚨 IMPORT THE NEW DEDICATED FORM PAGE
import ListingFormPage from './ListingFormPage';

// --- STYLING HELPERS (Simplified List View Styles) ---
const pageStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: '#f8f8f8', display:'flex', justifyContent:'center', overflowY:'auto' };
const subPageCard = { width: '100%', maxWidth: '480px', background: '#fff', padding: '25px', minHeight: '100vh', boxSizing:'border-box', boxShadow:'0 0 15px rgba(0,0,0,0.05)' };
const backBtn = { background:'none', border:'none', fontSize:'16px', color:'#2E7D32', cursor:'pointer', marginBottom:'25px', padding:0, fontWeight:'700' };
const sectionTitle = { margin:'0 0 25px 0', color:'#333', fontSize:'24px', fontWeight:'800' };
const actionBtn = { background:'#FF9800', color:'white', border:'none', padding:'15px', borderRadius:'12px', cursor:'pointer', fontWeight:'bold', fontSize:'14px', flexShrink: 0, width:'100%' };

// Listing specific styles
const typeDisplay = (type) => ({ 
    fontSize: '11px', fontWeight: '800', padding: '4px 8px', borderRadius: '4px', color: 'white',
    background: type === 'Service' ? '#1B5E20' : (type === 'Product' ? '#FF9800' : '#0D47A1'), marginBottom: '8px'
});
const getItemStatusStyle = (status) => ({ color: status === 'Active' ? '#4CAF50' : status === 'Paused' ? '#FFC107' : '#D32F2F', fontSize: '13px', marginTop: '5px', fontWeight:'600' });
const listActionBtn = { padding: '8px 12px', fontSize: '12px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: '#1976D2', color: 'white', fontWeight: 'bold' };
const simulateBtn = { padding: '8px 12px', fontSize: '11px', borderRadius: '6px', border: '1px solid #ddd', cursor: 'pointer', background: '#f5f5f5', color: '#555', marginLeft: 'auto' };
const itemTitle = { margin: '0 0 5px 0', fontSize: '18px', fontWeight: '800', color: '#333' };
const itemPrice = { margin: 0, fontSize: '16px', color: '#1B5E20', fontWeight: 'bold' }; 
const actionRow = { display: 'flex', gap: '10px', marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '10px' };

// DYNAMIC CARD STYLES 
const getCardGradient = (type) => {
    switch (type) {
        case 'Service': return 'linear-gradient(135deg, #E8F5E9 0%, #DCE7D8 100%)'; 
        case 'Product': return 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)'; 
        case 'Business': return 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)'; 
        default: return '#fff';
    }
};

const getCardIcon = (type) => {
    switch (type) {
        case 'Service': return '🚜'; 
        case 'Product': return '🌾'; 
        case 'Business': return '👨‍🌾'; 
        default: return '📦';
    }
};

const listingCardStyle = (type, hasInquiries) => ({ 
    background: getCardGradient(type),
    padding: '20px', 
    borderRadius: '12px', 
    boxShadow: '0 6px 20px rgba(0,0,0,0.08)', 
    borderLeft: hasInquiries ? '5px solid #d32f2f' : '5px solid #2E7D32', 
    position: 'relative', 
    marginTop: '15px', 
    overflow: 'hidden'
});

// FIXED HEADER AND ACTION BADGE STYLES
const headerContainer = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', position: 'relative' };

const actionBadgeStyle = (count) => ({
    background: count > 0 ? '#d32f2f' : '#888', 
    color: 'white',
    borderRadius: '8px',
    padding: '8px 12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: 'bold',
    cursor: 'pointer',
    border: 'none',
    boxShadow: count > 0 ? '0 4px 8px rgba(211, 47, 47, 0.4)' : 'none',
    transition: 'all 0.2s'
});

const actionMenuDropdown = {
    position: 'absolute', top: 50, right: 0, background: 'white', border: '1px solid #ddd',
    borderRadius: '12px', padding: '15px', boxShadow: '0 6px 15px rgba(0,0,0,0.2)',
    zIndex: 100, minWidth: '280px', maxHeight: '400px', overflowY: 'auto'
};

const actionItemCard = {
    padding: '10px', borderBottom: '1px solid #eee', marginBottom: '8px',
    background: '#f9f9f9', borderRadius: '6px'
};

const COLLECTION_MAP = { 'Service': 'services', 'Product': 'daily_products', 'Business': 'crops' };
const TYPE_DISPLAY_MAP = { 'Service': 'Service Hub', 'Product': 'Farm Fresh', 'Business': 'Business Zone' };

// --- MAIN LISTINGS COMPONENT (Now acting as a router/container) ---
export function MyListingsPage({ user, profileData, setActiveView, showNotification }) {
    
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // 🚨 STATE FOR ROUTING TO THE NEW FORM PAGE
    const [activeSubView, setActiveSubView] = useState('list'); // 'list' or 'form'
    const [editingItem, setEditingItem] = useState(null); // Item being edited
    const [showBellMenu, setShowBellMenu] = useState(false); 

    // --- Data Fetching & Actions ---
    const fetchListings = async (uid) => {
        if (!uid) return;
        setLoading(true);
        const collectionNames = ['services', 'crops', 'daily_products'];
        const fetchPromises = collectionNames.map(name => {
            const q = query(collection(db, name), where("userId", "==", uid)); 
            return getDocs(q).then(snapshot => 
                snapshot.docs.map(doc => ({
                    id: doc.id, collectionName: name, 
                    type: name === 'services' ? 'Service' : (name === 'crops' ? 'Business' : 'Product'), 
                    ...doc.data(),
                    inquiries: doc.data().inquiries || [], 
                }))
            );
        });
        
        try {
            const results = await Promise.all(fetchPromises);
            let fetchedListings = results.flat();
            fetchedListings.sort((a, b) => (b.inquiries.length > 0 ? 1 : 0) - (a.inquiries.length > 0 ? 1 : 0));
            setListings(fetchedListings);
        } catch (error) {
            console.error("Error fetching listings: ", error);
            showNotification("Failed to load your listings.", 'error');
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        if (user?.uid) fetchListings(user.uid);
    }, [user?.uid]);

    // 🚨 ROUTING AND REFRESH HANDLER
    const goToMyListings = (shouldRefresh) => {
        setActiveSubView('list');
        setEditingItem(null);
        if (shouldRefresh && user?.uid) {
            fetchListings(user.uid);
        }
    };
    
    const handleStartNewListing = () => {
        setEditingItem(null);
        setActiveSubView('form');
    };

    const handleStartEditListing = (item) => {
        setEditingItem(item);
        setActiveSubView('form'); 
    };

    // --- CRUD Handlers (Moved most logic to ListingFormPage) ---
    const handleDeleteListing = async (listingId, collectionName) => {
        if (window.confirm("Are you sure you want to delete this listing?")) {
            await deleteDoc(doc(db, collectionName, listingId)); 
            await fetchListings(user.uid);
            showNotification("Deleted.", 'success');
        }
    };
    
    const markOrderComplete = async (item) => {
        try {
            await deleteDoc(doc(db, item.collectionName, item.id)); 
            await fetchListings(user.uid);
            setShowBellMenu(false); 
            showNotification(`Order for ${item.title} Completed & Listing Removed!`, 'success');
        } catch (error) { showNotification("Error completing order.", 'error'); }
    };

    const simulateInquiry = async (item) => {
        const newInquiry = { id: Date.now(), buyer: 'Test Buyer', msg: 'Interested!' };
        const updatedInquiries = [...item.inquiries, newInquiry];
        
        await setDoc(doc(db, item.collectionName, item.id), { inquiries: updatedInquiries }, { merge: true });
        await fetchListings(user.uid);
        showNotification("Simulated: New Buyer Inquiry Added! Check the Action Badge.", 'success');
    };

    const totalPendingActions = listings.reduce((total, item) => total + item.inquiries.length, 0);

    // --- RENDERER ---

    // 🚨 RENDER THE FORM PAGE IF ACTIVE
    if (activeSubView === 'form') {
        return (
            <ListingFormPage 
                user={user} 
                profileData={profileData} 
                showNotification={showNotification}
                goToMyListings={goToMyListings} 
                editingItem={editingItem} 
            />
        );
    }
    
    // Default List View 
    return (
        <div style={pageStyle}>
            <div style={subPageCard}>
                <button onClick={() => setActiveView('menu')} style={backBtn}>⬅ Back to Menu</button> 
                
                {/* HEADER CONTAINER FOR TITLE AND ACTION BADGE */}
                <div style={headerContainer}>
                    <h2 style={{...sectionTitle, margin: 0, flexGrow: 1}}>📋 My Listings</h2>
                    
                    {/* FIXED ACTION BADGE BUTTON */}
                    <button 
                        onClick={() => setShowBellMenu(!showBellMenu)} 
                        style={actionBadgeStyle(totalPendingActions)}
                        title="Seller Action Center"
                    >
                        📝 {totalPendingActions} Actions
                    </button>
                </div>

                <p style={{fontSize:'14px', color:'#666', marginBottom:'20px', marginTop: '5px'}}>
                    Manage your **{profileData.sellerName || 'ICEAP'}** listings. 
                </p>

                {/* ACTION MENU DROPDOWN */}
                {showBellMenu && (
                    <div style={actionMenuDropdown}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '16px' }}>
                            Seller Actions ({totalPendingActions} Pending)
                        </h4>
                        {totalPendingActions === 0 ? (
                            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>No actions required. Listings are clean.</p>
                        ) : (
                            listings
                                .filter(item => item.inquiries.length > 0)
                                .map(item => (
                                    <div key={item.id} style={actionItemCard}>
                                        <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', fontSize: '14px' }}>
                                            {item.title} ({TYPE_DISPLAY_MAP[item.type]})
                                        </p>
                                        <div style={{ display: 'flex', gap: '5px' }}>
                                            <button 
                                                onClick={() => showNotification(`Accepted request for ${item.title}`, 'success')} 
                                                style={{...listActionBtn, background: '#1B5E20', flexGrow: 1}}
                                            >
                                                Accept
                                            </button>
                                            
                                            <button 
                                                onClick={() => markOrderComplete(item)} 
                                                style={{...listActionBtn, background: '#d32f2f', flexGrow: 1}}
                                            >
                                                Complete
                                            </button>
                                        </div>
                                    </div>
                                ))
                        )}
                        <button onClick={() => setShowBellMenu(false)} style={{...listActionBtn, background: '#888', marginTop: '10px', width: '100%'}}>
                            Close Action Center
                        </button>
                    </div>
                )}
                
                {/* Main Create Button */}
                <button 
                    onClick={handleStartNewListing} 
                    style={actionBtn}
                >
                    ➕ Create New Listing
                </button>

                {loading && <p style={{textAlign:'center', color:'#999', marginTop:'20px'}}>Loading listings from database...</p>}

                {(!listings || listings.length === 0) && !loading && <p style={{textAlign:'center', color:'#999', marginTop:'20px'}}>No active listings found.</p>}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop:'20px' }}>
                    {listings.map((item) => {
                        const hasInquiries = item.inquiries && item.inquiries.length > 0;

                        return (
                            <div key={item.id} style={listingCardStyle(item.type, hasInquiries)}>
                                
                                {/* DYNAMIC ICON CONTAINER */}
                                <div style={{ 
                                    fontSize: '30px', padding: '10px', borderRadius: '50%',
                                    background: 'rgba(255, 255, 255, 0.5)',
                                    position: 'absolute', top: '15px', right: '15px',
                                }}>
                                    {getCardIcon(item.type)}
                                </div>
                                
                                <div style={{padding: '20px'}}> 
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <div style={typeDisplay(item.type)}>
                                                {TYPE_DISPLAY_MAP[item.type]}
                                            </div> 
                                            <h4 style={itemTitle}>{item.title}</h4>
                                            <p style={itemPrice}>{item.price}</p>
                                            <p style={getItemStatusStyle(item.status)}>Status: <strong>{item.status}</strong></p>
                                        </div>
                                    </div>

                                    <div style={actionRow}>
                                        <button 
                                            onClick={() => handleStartEditListing(item)} 
                                            style={{...listActionBtn}}
                                        >
                                            Edit Details
                                        </button>
                                        <button onClick={() => handleDeleteListing(item.id, item.collectionName)} style={{...listActionBtn, background:'#d32f2f'}}>
                                            Delete Listing
                                        </button>

                                        {/* SIMULATE BUTTON (For Testing) */}
                                        <button onClick={() => simulateInquiry(item)} style={simulateBtn}>⚡ Simulate Buyer</button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default MyListingsPage;