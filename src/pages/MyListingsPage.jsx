import React, { useState, useEffect } from 'react';
import { doc, collection, query, where, getDocs, setDoc, deleteDoc } from 'firebase/firestore'; 
// Import Firebase essentials from your main setup file
import { db } from '../firebase'; 

// --- STYLING HELPERS (Imported or Defined Locally) ---
// We redefine the styles needed for the listings page here for independence
const subPageCard = { width: '100%', maxWidth: '480px', background: '#fff', padding: '20px', minHeight: '100vh', boxSizing:'border-box', boxShadow:'0 0 10px rgba(0,0,0,0.05)' };
const backBtn = { background:'none', border:'none', fontSize:'14px', color:'#555', cursor:'pointer', marginBottom:'20px', padding:0, fontWeight:'600' };
const sectionTitle = { margin:'0 0 25px 0', color:'#333', fontSize:'22px' };
const actionBtn = { background:'#1976D2', color:'white', border:'none', padding:'8px 12px', borderRadius:'6px', cursor:'pointer', fontWeight:'bold', fontSize:'12px', flexShrink: 0 };
const mainSaveBtn = { width:'100%', background:'#2E7D32', color:'white', border:'none', padding:'16px', borderRadius:'12px', fontSize:'17px', fontWeight:'bold', cursor:'pointer', marginTop:'10px' };
const logoutBtn = { width:'100%', background:'#d32f2f', color:'white', border:'none', padding:'16px', borderRadius:'12px', fontSize:'17px', fontWeight:'bold', cursor:'pointer', marginTop:'30px' };

// Listing specific styles
const itemTypeBadgeStyle = { background: '#2E7D32', color: 'white', padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', marginRight: '10px' };
const getItemStatusStyle = (status) => ({ color: status === 'Active' ? '#4CAF50' : status === 'Pending Inquiry' ? '#FFC107' : '#D32F2F', fontSize: '12px', marginTop: '5px' });
const getItemStatusIconStyle = (status) => ({ fontSize: '24px', color: status === 'Active' ? '🟢' : status === 'Pending Inquiry' ? '🟡' : '🔴' });
const listActionBtn = { padding: '8px 12px', fontSize: '12px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: '#FF9800', color: 'white', fontWeight: 'bold' };
const completeBtn = { padding: '8px 15px', fontSize: '13px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: '#2E7D32', color: 'white', fontWeight: 'bold', marginLeft: 'auto' };
const simulateBtn = { padding: '8px 15px', fontSize: '13px', borderRadius: '6px', border: '1px solid #ddd', cursor: 'pointer', background: '#fff', color: '#555', fontWeight: 'bold', marginLeft: 'auto' };
const listingCardStyle = { background: '#fff', padding: '15px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', position: 'relative' };
const inquiryBadge = { position: 'absolute', top: -15, right: 15, background: '#FFC107', color: '#000', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', zIndex: 10 };
const itemTitle = { margin: '0 0 5px 0', fontSize: '18px', fontWeight: '800' };
const itemPrice = { margin: 0, fontSize: '14px', color: '#2E7D32' };
const actionRow = { display: 'flex', gap: '10px', marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '10px' };
const formGroup = { marginBottom:'20px' };
const label = { display:'block', fontSize:'12px', fontWeight:'600', color:'#888', marginBottom:'5px', textTransform:'uppercase' }; 
const ajioInput = { width:'100%', padding: '12px 0', borderRadius: '0', border: 'none', borderBottom: '1px solid #ddd', fontSize: '15px', boxSizing: 'border-box', background: 'transparent', color: '#333', outline:'none' }; 

// We need the pageStyle from Profile.jsx as a container
const pageStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: '#f8f8f8', display:'flex', justifyContent:'center', overflowY:'auto' };


// --- LISTING MANAGEMENT COMPONENT ---
export function MyListingsPage({ user, profileData, setActiveView, showNotification }) {
    
    const [listings, setListings] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [activeSubView, setActiveSubView] = useState('list'); // 'list' or 'editor'
    const [editListing, setEditListing] = useState(null); // The listing object being edited

    // --- Data Fetching ---
    const fetchListings = async (uid) => {
        if (!uid) return;
        try {
            const listingsCollection = collection(db, "listings");
            const q = query(listingsCollection, where("sellerId", "==", uid)); 
            const querySnapshot = await getDocs(q);
            
            let fetchedListings = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                inquiries: doc.data().inquiries || [], 
            }));

            // --- TEMPORARY MOCK FOR DEMONSTRATION: Add default listings if DB is empty ---
            if (fetchedListings.length === 0) {
                 fetchedListings = [
                    { id: 'l1', type: 'Service', title: 'Tractor (Model 550) Rental', status: 'Pending Inquiry', price: '₹800/hr', description: 'Heavy duty tractor rental for farming.', inquiries: [{ id: 'i1', buyer: 'Ravi', time: '10 min ago' }], },
                    { id: 'l2', type: 'Product', title: 'Chillies (Grade A)', status: 'Active', price: '₹60/kg', description: 'Freshly harvested chillies from Sholinganallur.', inquiries: [], },
                    { id: 'l3', type: 'Service', title: 'Daily Labor Hire (10 People)', status: 'Paused', price: '₹400/day', description: 'Experienced farm labor available for daily hire.', inquiries: [], },
                ];
            }
            
            // SORTING: Items with inquiries jump to the top
            fetchedListings.sort((a, b) => (b.inquiries.length > 0 ? 1 : 0) - (a.inquiries.length > 0 ? 1 : 0));

            setListings(fetchedListings);
        } catch (error) {
            console.error("Error fetching listings: ", error);
            showNotification("Failed to load your listings.", 'error');
        }
    };
    
    // Fetch listings when the component mounts or user changes
    useEffect(() => {
        if (user?.uid) {
            fetchListings(user.uid);
        }
    }, [user?.uid]);


    // --- Listing Actions ---
    const handleSaveListing = async (listing) => {
        if (!user) return;
        setIsSaving(true);
        showNotification("Saving Listing...", 'loading');

        try {
            let listingData = {
                ...listing,
                sellerId: user.uid, 
                lastUpdated: new Date(),
                inquiries: listing.inquiries || [], 
            };

            const isNew = !listing.id || listing.id.length <= 2;

            if (!isNew) { 
                 await setDoc(doc(db, "listings", listing.id), listingData, { merge: true });
                 showNotification("Listing updated successfully!", 'success');
            } else {
                 const newDocRef = doc(collection(db, "listings")); 
                 await setDoc(newDocRef, {...listingData, id: newDocRef.id, status: 'Active', inquiries: []});
                 showNotification("New Listing created successfully!", 'success');
            }
            
            await fetchListings(user.uid); 
            
            setEditListing(null);
            setActiveSubView('list');
        } catch (error) {
            console.error("Error saving listing:", error);
            showNotification("Failed to save listing.", 'error');
        } finally {
             setIsSaving(false);
        }
    };

    const handleDeleteListing = async (listingId) => {
        if (!user) return;
        if (window.confirm("Are you sure you want to delete this listing?")) {
            showNotification("Deleting listing...", 'loading');
            try {
                await deleteDoc(doc(db, "listings", listingId)); 
                await fetchListings(user.uid);
                showNotification("Listing deleted successfully.", 'success');
                setEditListing(null);
                setActiveSubView('list');
            } catch (error) {
                console.error("Error deleting listing: ", error);
                showNotification("Failed to delete listing.", 'error');
            }
        }
    };

    const markOrderComplete = async (listingId, inquiryId, category) => {
        if (!user) return;
        showNotification(`Order ${inquiryId} marked complete! Updating profile stats...`, 'loading');
        
        try {
            // 1. Erase/Archive from Listings (Simulate Deletion)
            await deleteDoc(doc(db, "listings", listingId)); 
            
            // NOTE: In a real app, we would update seller stats on the user document here.
            // Since this function is outside Profile, we'd need to pass a callback from Profile
            // that handles updating the profileData state and Firestore user document.
            // For now, we'll rely on the Profile component managing its own stats update.

            await fetchListings(user.uid);
            showNotification("Transaction recorded and listing removed.", 'success');

        } catch (error) {
            console.error("Error completing order:", error);
            showNotification("Failed to complete order. Please check connection.", 'error');
        }
    };
    
    const simulateNewInquiry = async (listingId) => {
        if (!user) return;
        const listingRef = doc(db, "listings", listingId);
        const newInquiry = { id: Date.now(), buyer: 'New Buyer', time: 'Just now' };

        await setDoc(listingRef, { 
            status: 'Pending Inquiry', 
            inquiries: [newInquiry], 
        }, { merge: true });

        await fetchListings(user.uid);
        showNotification('Simulated: New buyer request received and item moved to the top!', 'success');
    };
    
    // --- Listing Editor Component (Nested) ---
    const ListingEditor = ({ listing }) => {
        const isNew = !listing || !listing.id || listing.id.length <= 2;
        const [formData, setFormData] = useState(listing || { id: null, type: 'Product', title: '', status: 'Active', price: '', description: '', inquiries: [] });

        const handleChange = (e) => {
            const { name, value } = e.target;
            setFormData(prev => ({ ...prev, [name]: value }));
        };

        const handleSubmit = (e) => {
            e.preventDefault();
            if (!formData.title || !formData.price || !formData.description) {
                showNotification("Please fill all required fields.", 'error');
                return;
            }
            handleSaveListing(formData);
        };

        return (
            <div style={subPageCard}>
                <button onClick={() => setActiveSubView('list')} style={backBtn}>⬅ Back to Listings</button>
                <h2 style={sectionTitle}>{isNew ? '✨ Create New Listing' : '✏️ Edit Listing'}</h2> 
                
                <form onSubmit={handleSubmit}>
                    <div style={formGroup}>
                        <label style={label}>Listing Type</label>
                        <select 
                            name="type" 
                            value={formData.type} 
                            onChange={handleChange} 
                            style={ajioInput}
                        >
                            <option value="Product">Product (e.g., Rice, Vegetables)</option>
                            <option value="Service">Service (e.g., Tractor Hire, Labor)</option>
                        </select>
                    </div>

                    <div style={formGroup}>
                        <label style={label}>Title / Name of Item</label>
                        <input type="text" name="title" value={formData.title} onChange={handleChange} style={ajioInput} placeholder="e.g. Tomato (100kg), Tractor Rental" />
                    </div>

                    <div style={formGroup}>
                        <label style={label}>Price / Rate</label>
                        <input type="text" name="price" value={formData.price} onChange={handleChange} style={ajioInput} placeholder="e.g. ₹500/hr, ₹1,200/Bag" />
                    </div>

                    <div style={formGroup}>
                        <label style={label}>Detailed Description</label>
                        <textarea 
                            name="description" 
                            value={formData.description} 
                            onChange={handleChange} 
                            style={{...ajioInput, minHeight:'100px'}} 
                            placeholder="Describe quality, availability, terms, etc."
                        ></textarea>
                    </div>

                    {!isNew && ( 
                        <div style={formGroup}>
                            <label style={label}>Status</label>
                            <select 
                                name="status" 
                                value={formData.status} 
                                onChange={handleChange} 
                                style={ajioInput}
                            >
                                <option value="Active">Active</option>
                                <option value="Paused">Paused</option>
                                <option value="Sold Out">Sold Out</option>
                            </select>
                        </div>
                    )}

                    <button type="submit" style={mainSaveBtn} disabled={isSaving}>
                        {isSaving ? 'Saving...' : (isNew ? 'Create New Listing' : 'Update Listing')}
                    </button>
                    {!isNew && (
                        <button type="button" onClick={() => handleDeleteListing(formData.id)} style={{...logoutBtn, marginTop: '10px'}}>
                            Delete Listing
                        </button>
                    )}
                </form>
            </div>
        );
    };


    // --- Main List Renderer ---
    if (activeSubView === 'editor') {
        return <ListingEditor listing={editListing} />;
    }

    return (
        <div style={pageStyle}>
            <div style={subPageCard}>
                {/* We use setActiveView to go back to the main Profile menu */}
                <button onClick={() => setActiveView('menu')} style={backBtn}>⬅ Back to Menu</button> 
                <h2 style={sectionTitle}>📋 My Listings</h2>
                <p style={{fontSize:'14px', color:'#666', marginBottom:'20px'}}>Manage your **{profileData.sellerName}** listings. Items with new inquiries jump to the top.</p>
                
                {/* **RE-ADDED: Create New Listing Button** */}
                <button 
                    onClick={() => { setEditListing(null); setActiveSubView('editor'); }} 
                    style={{...actionBtn, background: '#FF9800', width:'100%', padding:'15px', marginBottom:'20px', fontSize:'14px'}}
                >
                    ➕ Create New Listing
                </button>
                
                {/* Check for empty listings and display message */}
                {(!listings || listings.length === 0) && <p style={{textAlign:'center', color:'#999'}}>No active listings found.</p>}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {listings.map((item) => {
                        const hasInquiries = item.inquiries && item.inquiries.length > 0;
                        const currentInquiry = hasInquiries ? item.inquiries[0] : null;

                        return (
                            <div key={item.id} style={{...listingCardStyle, 
                                    borderLeft: hasInquiries ? '5px solid #FFC107' : '5px solid #2E7D32' 
                            }}>
                                
                                {hasInquiries && (
                                    <div style={inquiryBadge}>
                                        🔔 NEW INQUIRY ({item.inquiries.length}) - Buyer: {currentInquiry.buyer}
                                    </div>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <span style={itemTypeBadgeStyle}>{item.type}</span>
                                        <h4 style={itemTitle}>{item.title}</h4>
                                        <p style={itemPrice}>{item.price}</p>
                                        <p style={getItemStatusStyle(item.status)}>Status: <strong>{item.status}</strong></p>
                                    </div>
                                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                        <span style={getItemStatusIconStyle(item.status)}>{item.status === 'Active' ? '🟢' : item.status === 'Pending Inquiry' ? '🟡' : '🔴'}</span>
                                        <p style={{fontSize:'11px', color:'#999', marginTop:'5px'}}>ID: {item.id}</p>
                                    </div>
                                </div>

                                <div style={actionRow}>
                                    <button 
                                        onClick={() => { setEditListing(item); setActiveSubView('editor'); }} 
                                        style={{...listActionBtn, background:'#1976D2'}}
                                    >
                                        Edit
                                    </button>
                                    <button onClick={() => handleDeleteListing(item.id)} style={{...listActionBtn, background:'#d32f2f'}}>
                                        Delete
                                    </button>
                                    
                                    {hasInquiries && (
                                        <button 
                                            onClick={() => markOrderComplete(item.id, currentInquiry.id, item.type.toLowerCase())} 
                                            style={completeBtn}
                                        >
                                            Complete Order
                                        </button>
                                    )}
                                    
                                    {item.status === 'Active' && !hasInquiries && (
                                        <button onClick={() => simulateNewInquiry(item.id)} style={simulateBtn}>Simulate Hire/Buy</button>
                                    )}
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