import React, { useState, useEffect } from 'react';
import { doc, collection, setDoc } from 'firebase/firestore'; 
import { db } from '../firebase'; 

// --- STYLING HELPERS (Form specific styles) ---
const pageStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: '#f8f8f8', display:'flex', justifyContent:'center', overflowY:'auto' };
const subPageCard = { width: '100%', maxWidth: '480px', background: '#fff', padding: '25px', minHeight: '100vh', boxSizing:'border-box', boxShadow:'0 0 15px rgba(0,0,0,0.05)' };
const backBtn = { background:'none', border:'none', fontSize:'16px', color:'#2E7D32', cursor:'pointer', marginBottom:'25px', padding:0, fontWeight:'700' };

const formGroup = { marginBottom:'20px' };
const formRow = { display:'flex', gap:'15px' };
const label = { display:'block', fontSize:'12px', fontWeight:'600', color:'#888', marginBottom:'5px', textTransform:'uppercase' }; 
const ajioInput = { width:'100%', padding: '12px 0', borderRadius: '0', border: 'none', borderBottom: '1px solid #ddd', fontSize: '15px', boxSizing: 'border-box', background: 'transparent', color: '#333', outline:'none' }; 
const mainSaveBtn = { width:'100%', background:'#2E7D32', color:'white', border:'none', padding:'16px', borderRadius:'12px', fontSize:'17px', fontWeight:'bold', cursor:'pointer', marginTop:'10px' };
const deleteBtn = { width:'100%', background:'#d32f2f', color:'white', border:'none', padding:'16px', borderRadius:'12px', fontSize:'17px', fontWeight:'bold', cursor:'pointer', marginTop:'10px' };
const infoCardStyle = { padding: '15px', background: '#F5F5F5', borderRadius: '8px', marginBottom: '20px', borderLeft: '3px solid #607D8B' };
const radioBtnStyle = { flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ddd', cursor: 'pointer', fontWeight: 'bold', textAlign: 'center' };

const getFormHeaderStyle = (type) => {
    let color;
    switch (type) {
        case 'Service': color = '#1B5E20'; break;
        case 'Product': color = '#FF9800'; break;
        case 'Business': color = '#0D47A1'; break;
        default: color = '#333';
    }
    return {
        background: `linear-gradient(90deg, ${color} 0%, ${color}CC 100%)`,
        color: 'white',
        padding: '12px 20px',
        borderRadius: '8px 8px 0 0', 
        fontSize: '16px',
        fontWeight: '700',
        textAlign: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    };
};

const COLLECTION_MAP = { 'Service': 'services', 'Product': 'daily_products', 'Business': 'crops' };
const TYPE_DISPLAY_MAP = { 'Service': 'Service Hub', 'Product': 'Farm Fresh', 'Business': 'Business Zone' };


// --- MAIN LISTING FORM COMPONENT ---
export function ListingFormPage({ user, profileData, showNotification, goToMyListings, editingItem }) {
    
    const [isSaving, setIsSaving] = useState(false);
    
    const initialFormData = {
        type: editingItem?.type || null, 
        title: editingItem?.title || '', 
        price: editingItem?.price || '', 
        unit: editingItem?.unit || (editingItem?.type === 'Service' ? 'per_hour' : 'per_unit'), 
        description: editingItem?.description || '', 
        
        sellerName: profileData.sellerName, 
        sellerContact: profileData.phone, 
        lat: profileData.businessAddress.lat, 
        lng: profileData.businessAddress.lng,
        
        category: editingItem?.category || null, 
        freshness: editingItem?.freshness || null, 
        quantity: editingItem?.quantity || null, 
        cropName: editingItem?.cropName || '', 
        grade: editingItem?.grade || '',
        
        // Service specific fields (Now mandatory for Service type)
        serviceType: editingItem?.serviceType || null, 
        equipmentType: editingItem?.equipmentType || 'tractor',
        laborCount: editingItem?.laborCount || 1,

        id: editingItem?.id || null, 
        collectionName: editingItem?.collectionName || null,
    };
    
    const [formData, setFormData] = useState(initialFormData);
    const [activeListingType, setActiveListingType] = useState(initialFormData.type);

    // 🚨 STATE TO CONTROL DYNAMIC SERVICE SUB-TYPE
    const [serviceType, setServiceType] = useState(initialFormData.serviceType); 

    // --- Handlers ---
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleTypeSelection = (type) => {
        setActiveListingType(type);
        setFormData(prev => ({ 
            ...prev, 
            type: type,
            unit: type === 'Service' ? 'per_hour' : (type === 'Product' ? 'per_unit' : 'per_kg'),
        }));
        // Reset service type for fresh selection
        if (type === 'Service') {
             setServiceType(null); 
             setFormData(prev => ({ ...prev, serviceType: null }));
        }
    };
    
    const handleServiceTypeSelection = (type) => {
        setServiceType(type);
        // Reset unit type to a sensible default based on sub-type
        const defaultUnit = type === 'machinery' ? 'per_hour' : 'per_day'; 
        setFormData(prev => ({ ...prev, serviceType: type, unit: defaultUnit }));
    };


    const handleSaveListing = async (e) => {
        e.preventDefault();
        
        if (!activeListingType) return;
        if (!formData.title || !formData.price || !formData.description) { showNotification("Please fill all required fields.", 'error'); return; }

        // Service-specific validation
        if (activeListingType === 'Service') {
            if (!serviceType) { showNotification("Please select Machinery or Labor.", 'error'); return; }
            if (serviceType === 'labor' && (!formData.laborCount || formData.laborCount < 1)) {
                 showNotification("Labor listing requires Number of Persons.", 'error'); return;
            }
        }

        setIsSaving(true);
        try {
            const collectionName = editingItem?.collectionName || COLLECTION_MAP[activeListingType];
            const isNew = !editingItem;
            
            const dataToSave = { 
                ...formData, 
                userId: user.uid, 
                lastUpdated: new Date(),
                location: profileData.businessAddress,
            };
            delete dataToSave.unit; 

            if (!isNew) { 
                 await setDoc(doc(db, collectionName, formData.id), dataToSave, { merge: true });
                 showNotification("Listing updated successfully!", 'success');
            } else {
                 const newDocRef = doc(collection(db, collectionName)); 
                 await setDoc(newDocRef, {...dataToSave, id: newDocRef.id, status: 'Active', inquiries: []});
                 showNotification("New Listing created successfully!", 'success');
            }
            
            goToMyListings(true); 

        } catch (error) {
            console.error("Error saving listing:", error); showNotification("Failed to save listing.", 'error');
        } finally { setIsSaving(false); }
    };


    // --- Form UI Logic ---
    const renderTypeSelector = () => {
        return (
             <div style={{ padding: '15px', border: '1px solid #eee', borderRadius: '12px', background: '#f9f9f9', marginTop: '20px' }}>
                <h3 style={{fontSize:'16px', color:'#333', marginBottom:'15px', textAlign:'center'}}>Select Listing Type:</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <button onClick={() => handleTypeSelection('Service')} style={{...mainSaveBtn, background: '#1B5E20', padding: '12px'}}>
                        🚜 {TYPE_DISPLAY_MAP.Service}
                    </button>
                    <button onClick={() => handleTypeSelection('Product')} style={{...mainSaveBtn, background: '#FF9800', padding: '12px'}}>
                        🥛 {TYPE_DISPLAY_MAP.Product}
                    </button>
                    <button onClick={() => handleTypeSelection('Business')} style={{...mainSaveBtn, background: '#0D47A1', padding: '12px'}}>
                        🌾 {TYPE_DISPLAY_MAP.Business}
                    </button>
                </div>
            </div>
        );
    };

    const renderServiceTypeSelector = () => {
         return (
             <>
                {renderSellerInfoCard()}
                <h4 style={{fontSize:'16px', color:'#333', marginBottom:'15px', textAlign:'center'}}>
                    What type of service are you listing?
                </h4>
                 <div style={formRow}>
                     <button 
                         type="button" 
                         onClick={() => handleServiceTypeSelection('machinery')} 
                         style={{...radioBtnStyle, background: serviceType === 'machinery' ? '#1B5E20' : 'white', color: serviceType === 'machinery' ? 'white' : '#1B5E20', borderColor: '#1B5E20'}}
                     >
                         🚜 Machinery
                     </button>
                     <button 
                         type="button" 
                         onClick={() => handleServiceTypeSelection('labor')} 
                         style={{...radioBtnStyle, background: serviceType === 'labor' ? '#1B5E20' : 'white', color: serviceType === 'labor' ? 'white' : '#1B5E20', borderColor: '#1B5E20'}}
                     >
                         👨‍🌾 Labor Hire
                     </button>
                 </div>
             </>
         );
    };

    const renderSellerInfoCard = () => (
        <div style={infoCardStyle}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '800', color: '#333' }}>
                Seller Profile Details (Autofilled)
            </h4>
            <div style={{ fontSize: '13px', color: '#555', lineHeight: '1.5' }}>
                <p style={{ margin: 0 }}>**Name:** {profileData.sellerName || 'N/A'}</p>
                <p style={{ margin: 0 }}>**Contact:** {profileData.phone || 'N/A'}</p>
                <p style={{ margin: 0 }}>
                    **Service Location (GPS):** {profileData.businessAddress.lat ? `Lat/Lng Active` : `Missing - Please Update Profile`}
                </p>
                <p style={{ margin: 0, marginTop: '8px', fontWeight: 'bold', color: '#D32F2F' }}>
                    NOTE: Used for 50km radius search.
                </p>
            </div>
        </div>
    );
    
    // Renders the main form fields based on type
    const renderFormFields = () => {
        
        // --- Common Fields ---
        const commonFields = (
            <>
                {renderSellerInfoCard()}

                <div style={formGroup}>
                    <label style={label}>Title / Name of Item</label>
                    <input type="text" name="title" value={formData.title || ''} onChange={handleFormChange} style={ajioInput} placeholder="e.g. Tomato (100kg), Harvester Rental" />
                </div>

                <div style={formRow}>
                    <div style={{...formGroup, flex:'0 0 55%'}}>
                        <label style={label}>Price / Rate</label>
                        <input type="text" name="price" value={formData.price || ''} onChange={handleFormChange} style={ajioInput} placeholder="e.g. 500, 1200" />
                    </div>
                    <div style={{...formGroup, flex:'0 0 40%'}}>
                        <label style={label}>Unit/Rate Type</label>
                        <select 
                            name="unit" 
                            value={formData.unit || 'per_unit'} 
                            onChange={handleFormChange} 
                            style={ajioInput}
                        >
                            {activeListingType === 'Service' && ( 
                                 <>
                                    <option value="per_hour">₹ / Hour</option>
                                    <option value="per_day">₹ / Day</option>
                                    <option value="per_acre">₹ / Acre</option>
                                    <option value="fixed">Fixed Price</option>
                                </>
                            )}
                            {(activeListingType === 'Product' || activeListingType === 'Business') && (
                                <>
                                    <option value="per_unit">₹ / Unit</option>
                                    <option value="per_kg">₹ / Kg</option>
                                    <option value="per_ton">₹ / Ton</option>
                                </>
                            )}
                        </select>
                    </div>
                </div>
            </>
        );

        // --- Specific Fields ---
        let specificFields = null;

        if (activeListingType === 'Service') {
            
            // This is the core Service form now
            specificFields = (
                <>
                    {commonFields} 
                    
                    <h5 style={{margin: '0 0 15px 0', fontSize: '14px', color: '#1B5E20'}}>
                        {serviceType === 'machinery' ? '🚜 Equipment Details' : '👨‍🌾 Labor Details'}
                    </h5>

                    {serviceType === 'machinery' && (
                        <div style={formGroup}>
                            <label style={label}>Equipment Type</label>
                            <select name="equipmentType" value={formData.equipmentType || 'tractor'} onChange={handleFormChange} style={ajioInput}>
                                <option value="tractor">Tractor</option>
                                <option value="harvester">Harvester / Combine</option>
                                <option value="tiller">Tiller / Cultivator</option>
                                <option value="sprayer">Sprayer Equipment</option>
                                <option value="other">Other Equipment</option>
                            </select>
                        </div>
                    )}
                    
                    {serviceType === 'labor' && (
                        <div style={formGroup}>
                            <label style={label}>Number of Persons Available (Min 1)</label>
                            <input type="number" name="laborCount" value={formData.laborCount || 1} onChange={handleFormChange} style={ajioInput} placeholder="e.g. 5" min="1" />
                        </div>
                    )}

                    <div style={formGroup}>
                        <label style={label}>Service Category (General)</label>
                        <select name="category" value={formData.category || serviceType} onChange={handleFormChange} style={ajioInput}>
                            <option value="machinery">Machinery Rental</option> 
                            <option value="labor">Labor Hire</option> 
                            <option value="consulting">Consulting/Expertise</option> 
                        </select>
                    </div>
                </>
            );

        } else if (activeListingType === 'Product') {
            specificFields = (
                <>
                    {commonFields}
                    <div style={formRow}>
                        <div style={{...formGroup, flex:1}}><label style={label}>Product Status</label><select name="freshness" value={formData.freshness || 'fresh'} onChange={handleFormChange} style={ajioInput}>
                                <option value="fresh">Fresh (Daily Harvest)</option><option value="stored">Stored (Cold/Dry Storage)</option></select></div>
                        <div style={{...formGroup, flex:1}}><label style={label}>Available Quantity</label><input type="number" name="quantity" value={formData.quantity || 0} onChange={handleFormChange} style={ajioInput} placeholder="e.g. 50" /></div>
                    </div>
                </>
            );
        } else if (activeListingType === 'Business') {
            specificFields = (
                <>
                    {commonFields}
                    <div style={formRow}>
                        <div style={{...formGroup, flex:1}}><label style={label}>Crop Type / Harvest</label><input type="text" name="cropName" value={formData.cropName || ''} onChange={handleFormChange} style={ajioInput} placeholder="e.g. Wheat, Basmati Rice" /></div>
                        <div style={{...formGroup, flex:1}}><label style={label}>Grade</label><input type="text" name="grade" value={formData.grade || ''} onChange={handleFormChange} style={ajioInput} placeholder="e.g. Grade A, Certified" /></div>
                    </div>
                </>
            );
        }


        // --- Final Form Assembly ---
        return (
            <form onSubmit={handleSaveListing} style={{padding: '0 10px'}}>
                {activeListingType !== 'Service' && specificFields} 
                {activeListingType === 'Service' && specificFields} 

                <div style={formGroup}>
                    <label style={label}>Detailed Description</label>
                    <textarea name="description" value={formData.description || ''} onChange={handleFormChange} style={{...ajioInput, minHeight:'100px', border:'1px solid #ddd', padding:'10px'}} placeholder="Describe quality, availability, terms, etc."></textarea>
                </div>
                <button type="submit" style={mainSaveBtn} disabled={isSaving}>
                    {isSaving ? 'Saving...' : (editingItem ? `Update ${activeListingType} Listing` : `Create ${activeListingType} Listing`)}
                </button>
            </form>
        );
    };

    // --- RENDERER LOGIC ---
    let content;
    
    // Step 1: Select Type
    if (!activeListingType) {
        content = renderTypeSelector();
    
    // Step 2 (Service Only): Select Sub-Type (Only if not editing or serviceType not set)
    // 🚨 IMPORTANT FIX: This ensures edit mode skips the selector if serviceType is already saved.
    } else if (activeListingType === 'Service' && !serviceType) {
        content = renderServiceTypeSelector();
    
    // Step 3: Render Full Form
    } else {
        content = renderFormFields();
    }

    const formTitle = activeListingType 
        ? `${editingItem ? 'EDIT' : 'CREATE NEW'} ${TYPE_DISPLAY_MAP[activeListingType] || 'LISTING'}`
        : 'SELECT LISTING TYPE';

    return (
        <div style={pageStyle}>
            <div style={subPageCard}>
                <button onClick={() => goToMyListings(false)} style={backBtn}>
                    ⬅ Back to Listings
                </button>
                
                <div style={{...getFormHeaderStyle(activeListingType), marginBottom: '25px'}}>
                     {formTitle}
                </div>
                
                {content}

                {/* Only show Cancel button if actively creating/editing */}
                {activeListingType && (
                   <button type="button" onClick={() => goToMyListings(false)} style={{...deleteBtn, background: '#888', marginTop: '20px', width: '95%', margin: '20px auto 0 auto'}}>
                       Cancel & Discard Changes
                   </button>
                )}
                
            </div>
        </div>
    );
}

export default ListingFormPage;