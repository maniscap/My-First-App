import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Leaf, CheckCircle2 } from 'lucide-react';
import { farmFreshCategories, farmFreshUnits } from '../../utils/ProductLibrary';
import TermsAgreementCheckbox from '../../🛠️Shared_Components/TermsAgreementCheckbox';
import UniversalImagePicker from '../../utils/UniversalImagePicker';
import { db, auth } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
// Custom iOS-style toggle switch
const OrganicToggle = ({ checked, onChange }) => (
    <div 
        onClick={() => onChange(!checked)}
        style={{
            width: '50px', height: '30px', borderRadius: '15px',
            backgroundColor: checked ? '#10b981' : '#e2e8f0',
            position: 'relative', cursor: 'pointer', transition: 'all 0.3s ease'
        }}
    >
        <div style={{
            width: '26px', height: '26px', borderRadius: '50%', backgroundColor: '#fff',
            position: 'absolute', top: '2px', left: checked ? '22px' : '2px',
            transition: 'all 0.3s ease', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }} />
    </div>
);

export default function FarmFresh_ListingForm() {
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedItemId, setSelectedItemId] = useState('');
    const [customName, setCustomName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [unit, setUnit] = useState('1kg');
    const [customUnitName, setCustomUnitName] = useState('');
    const [isUnitOpen, setIsUnitOpen] = useState(false);
    const [isOrganic, setIsOrganic] = useState(false);
    const [organicCertName, setOrganicCertName] = useState('');
    const [organicCertNumber, setOrganicCertNumber] = useState('');
    const [shelfLife, setShelfLife] = useState('');
    const [qualityGuarantee, setQualityGuarantee] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submittedData, setSubmittedData] = useState(null);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [isItemOpen, setIsItemOpen] = useState(false);
    const [errorToast, setErrorToast] = useState('');
    // Derived logic for dropdowns
    const activeCategoryObj = farmFreshCategories.find(c => c.category === selectedCategory);
    const activeItems = activeCategoryObj ? activeCategoryObj.items : [];
    const isOtherSelected = selectedItemId.includes('other');
    const selectedItemName = isOtherSelected ? customName : activeItems.find(i => i.id === selectedItemId)?.name;

    // Smart filtering for the unit dropdown
    const getFilteredUnits = () => {
        // Always show the Custom option
        const alwaysInclude = ['custom_other_unit'];
        if (!selectedCategory) return farmFreshUnits;

        const cat = selectedCategory.toLowerCase();
        const item = selectedItemId.toLowerCase();
        const itemName = (selectedItemName || '').toLowerCase();
        
        let allowedVals = [];
        const commonWeights = ['250g', '500g', '1kg', '2kg', '5kg', '10kg', '20kg', '25kg', '50kg', '100kg', 'ton'];
        const bulkTransport = ['gunny_bag', 'bag', 'trolley', 'auto_load', 'mini_truck', 'truck'];

        // Item-level specific checks
        if (item.includes('egg') || itemName.includes('egg')) {
            allowedVals = ['piece', 'dozen', 'box'];
        } else if (item.includes('milk') || item.includes('water') || item.includes('oil') || item.includes('lassi') || itemName.includes('ghee')) {
            allowedVals = ['1L', '5L', '10L', '20L', 'packet', 'box', '500g', '1kg'];
        } else if (item.includes('banana') || item.includes('coconut') || item.includes('lemon') || item.includes('bamboo')) {
            allowedVals = ['piece', 'dozen', 'bunch', 'bag', 'box', '1kg', '100pcs'];
        } else if (item.includes('flower') || itemName.includes('flower')) {
            allowedVals = ['1kg', '250g', '500g', '5kg', 'bunch', 'piece', 'basket'];
        } else if (item.includes('leaf') || item.includes('leaves') || item.includes('spinach') || item.includes('coriander')) {
            allowedVals = ['bunch', '100leaves', '250g', '500g', '1kg'];
        } else if (cat.includes('dairy') || cat.includes('honey')) {
            allowedVals = ['1L', '5L', '10L', '20L', '500g', '1kg', '2kg', '5kg', '10kg', 'dozen', 'piece', 'packet', 'box'];
        } else if (cat.includes('cultural')) {
            allowedVals = ['piece', 'dozen', 'bunch', '100leaves', '100pcs', 'basket', 'box', 'packet', '250g', '500g', '1kg'];
        } else if (cat.includes('cash crop') || cat.includes('field') || cat.includes('cereal') || cat.includes('pulse')) {
            allowedVals = ['1kg', '5kg', '10kg', '20kg', '25kg', '50kg', '100kg', 'ton', ...bulkTransport];
        } else if (cat.includes('spice') || cat.includes('dry') || cat.includes('jaggery')) {
            allowedVals = ['250g', '500g', '1kg', '2kg', '5kg', '10kg', '25kg', 'packet', 'box'];
        } else {
            // Default (Vegetables, Fruits)
            allowedVals = [...commonWeights, 'piece', 'dozen', 'bunch', 'box', 'crate', 'basket', 'packet', ...bulkTransport];
        }

        return farmFreshUnits.filter(u => allowedVals.includes(u.val) || alwaysInclude.includes(u.val));
    };

    const displayUnits = getFilteredUnits();

    const showError = (msg) => {
        setErrorToast(msg);
        setTimeout(() => setErrorToast(''), 4000);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        
        // --- Strict Validations ---
        if (!selectedCategory) {
            showError("Please select a Category before submitting.");
            return;
        }
        if (!selectedItemId) {
            showError("Please select an Item to list.");
            return;
        }
        if (isOtherSelected && !customName.trim()) {
            showError("Please type the name of your custom item.");
            return;
        }
        if (unit === 'custom_other_unit' && !customUnitName.trim()) {
            showError("Please type the name of your custom unit.");
            return;
        }
        if (!selectedImageUrl) {
            showError("Please upload or provide an Image for your product.");
            return;
        }
        if (!price || isNaN(price) || parseFloat(price) <= 0) {
            showError("Please enter a valid Price (numbers only, greater than 0).");
            return;
        }
        if (!description || description.trim().length < 10) {
            showError("Please provide a good, descriptive text about your produce (at least 10 characters).");
            return;
        }
        
        const shelfLifeRegex = /^\d+\s+(day|days|week|weeks|month|months|year|years)$/i;
        if (!shelfLife || !shelfLifeRegex.test(shelfLife.trim())) {
            showError("Please specify the Estimated Shelf Life in the correct format (e.g., '5 Days', '2 Weeks', '1 Month').");
            return;
        }
        if (!qualityGuarantee) {
            showError("You must check the Quality Guarantee box to list on Farm Fresh.");
            return;
        }
        if (!termsAccepted) {
            showError("You must agree to the Terms & Conditions to list on FarmCap.");
            return;
        }

        if (isSubmitting) return; // Prevent double clicks
        setIsSubmitting(true);
        
        try {
            const user = auth.currentUser;
            if (!user) {
                showError("You must be logged in to create a listing.");
                setIsSubmitting(false);
                return;
            }

            const listingData = {
                sellerId: localStorage.getItem('seller_app_id'),
                sellerName: user.displayName || 'Unknown Seller', // Could fetch from profile
                shopName: localStorage.getItem('locationTitle') || 'My Shop',
                listingType: 'farm_fresh',
                category: selectedCategory,
                itemId: selectedItemId,
                itemName: selectedItemName,
                description: description,
                price: parseFloat(price),
                unit: unit === 'custom_other_unit' ? customUnitName : unit,
                isOrganic: isOrganic,
                organicCertName: isOrganic ? organicCertName : null,
                organicCertNumber: isOrganic ? organicCertNumber : null,
                listingDate: new Date().toLocaleDateString('en-IN'),
                shelfLife: shelfLife,
                qualityGuarantee: qualityGuarantee,
                imageUrl: selectedImageUrl,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            await addDoc(collection(db, 'seller_listings'), listingData);
            
            setSubmittedData(listingData);
            setShowSuccess(true);
            setTimeout(() => {
                navigate('/Seller_HomePage');
            }, 10000);
        } catch (error) {
            console.error("Error adding document: ", error);
            alert("Failed to save listing. Please try again.");
            setIsSubmitting(false);
        }
    };

    if (showSuccess && submittedData) {
        return (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '24px', overflowY: 'auto', WebkitOverflowScrolling: 'touch', boxSizing: 'border-box' }}>
                
                {/* Floating glowing orbs in background for premium feel */}
                <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(34,197,94,0.15) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', pointerEvents: 'none', animation: 'pulseOrb 4s infinite alternate' }} />
                <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', pointerEvents: 'none', animation: 'pulseOrb 3s infinite alternate-reverse' }} />

                <div style={{ animation: 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '360px', position: 'relative', zIndex: 1, boxSizing: 'border-box' }}>
                    
                    {/* The Premium Receipt Card */}
                    <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
                        
                        {/* Hero Header of Receipt */}
                        <div style={{ background: 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)', padding: '32px 24px 24px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', borderBottom: '2px dashed #e2e8f0', position: 'relative' }}>
                            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', boxShadow: '0 8px 20px rgba(22,163,74,0.3)', animation: 'scaleUpBounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}>
                                <CheckCircle2 size={32} color="white" />
                            </div>
                            <h2 style={{ margin: '0 0 4px 0', fontSize: '22px', fontWeight: '800', color: '#0f172a', textAlign: 'center' }}>{submittedData.itemName}</h2>
                            <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#64748b', textAlign: 'center', fontWeight: '500' }}>Your listing was added successfully!</p>
                            <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: '700', backgroundColor: '#dcfce7', padding: '4px 12px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{submittedData.category}</span>
                        </div>

                        {/* Image & Price Section */}
                        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                {submittedData.imageUrl ? (
                                    <div style={{ width: '70px', height: '70px', borderRadius: '16px', overflow: 'hidden', flexShrink: 0, boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                                        <img src={submittedData.imageUrl} alt={submittedData.itemName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                ) : (
                                    <div style={{ width: '70px', height: '70px', borderRadius: '16px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <span style={{ fontSize: '20px' }}>🌱</span>
                                    </div>
                                )}
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', marginBottom: '2px' }}>Selling Price</span>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                        <span style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>₹{submittedData.price}</span>
                                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#64748b' }}>/ {submittedData.unit}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div style={{ backgroundColor: '#f8fafc', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', border: '1px solid #f1f5f9' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Listed On</span>
                                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>{submittedData.listingDate}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Shelf Life</span>
                                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>{submittedData.shelfLife}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Farming</span>
                                    <span style={{ fontSize: '13px', fontWeight: '700', color: submittedData.isOrganic ? '#16a34a' : '#0f172a' }}>{submittedData.isOrganic ? '100% Organic' : 'Standard'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Quality Check</span>
                                    <span style={{ fontSize: '13px', fontWeight: '700', color: submittedData.qualityGuarantee ? '#16a34a' : '#ef4444' }}>{submittedData.qualityGuarantee ? 'Guaranteed ✓' : 'Unverified'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Action Area */}
                        <div style={{ padding: '0 24px 24px 24px' }}>
                            <button 
                                onClick={() => navigate('/Seller_HomePage')} 
                                style={{ width: '100%', padding: '16px', borderRadius: '16px', backgroundColor: '#0f172a', color: 'white', border: 'none', fontSize: '15px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 10px 25px rgba(15,23,42,0.2)', transition: 'transform 0.2s ease, background 0.2s ease' }}
                                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                Continue to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
                
                <style>{`
                    @keyframes scaleUpBounce {
                        0% { transform: scale(0); opacity: 0; }
                        60% { transform: scale(1.1); opacity: 1; }
                        100% { transform: scale(1); opacity: 1; }
                    }
                    @keyframes slideUp {
                        from { transform: translateY(40px); opacity: 0; }
                        to { transform: translateY(0); opacity: 1; }
                    }
                    @keyframes pulseOrb {
                        from { transform: scale(1); opacity: 0.5; }
                        to { transform: scale(1.2); opacity: 1; }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#f8fafc', overflowY: 'auto', WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}>

            {/* Header */}
            <div style={{ position: 'sticky', top: 0, backgroundColor: '#ffffff', zIndex: 10, padding: '16px 20px', display: 'flex', alignItems: 'center', borderBottom: '1px solid #f1f5f9', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', padding: '8px', marginRight: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', backgroundColor: '#f8fafc', cursor: 'pointer' }}>
                    <ArrowLeft size={20} color="#0f172a" />
                </button>
                <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>Add Farm Fresh</h1>
            </div>

            <div style={{ padding: '24px 20px', paddingBottom: '100px' }}>
                <form onSubmit={handleSave}>
                    
                    {/* 1. Category Selection - CUSTOM DROPDOWN */}
                    <div style={{ marginBottom: '28px', position: 'relative' }}>
                        <label style={{ display: 'block', fontSize: '15px', fontWeight: '700', color: '#1e293b', marginBottom: '10px' }}>Select Category <span style={{color: '#ef4444'}}>*</span></label>
                        <div 
                            onClick={() => { setIsCategoryOpen(!isCategoryOpen); setIsItemOpen(false); }}
                            style={{ width: '100%', boxSizing: 'border-box', padding: '16px 20px', borderRadius: '14px', border: '2px solid #94a3b8', fontSize: '16px', fontWeight: '600', backgroundColor: '#f8fafc', color: selectedCategory ? '#0f172a' : '#64748b', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
                        >
                            <span>{selectedCategory || "-- Choose Category --"}</span>
                            <svg width="20" height="20" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isCategoryOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}><path d="M6 9l6 6 6-6"/></svg>
                        </div>
                        
                        {isCategoryOpen && (
                            <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, width: '100%', maxHeight: '400px', overflowY: 'auto', backgroundColor: '#ffffff', borderRadius: '14px', border: '3px solid #1e293b', zIndex: 50, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}>
                                {farmFreshCategories.map(cat => (
                                    <div 
                                        key={cat.category} 
                                        onClick={() => { 
                                            setSelectedCategory(cat.category); 
                                            setSelectedItemId(''); 
                                            setCustomName(''); 
                                            setUnit('');
                                            setIsCategoryOpen(false);
                                        }}
                                        style={{ padding: '14px 20px', borderBottom: '1px solid #e2e8f0', cursor: 'pointer', fontSize: '15px', fontWeight: selectedCategory === cat.category ? '700' : '500', backgroundColor: selectedCategory === cat.category ? '#f0fdf4' : '#ffffff', color: selectedCategory === cat.category ? '#16a34a' : '#1e293b' }}
                                    >
                                        {cat.category}
                                    </div>
                                ))}
                                <div 
                                    onClick={() => { 
                                        setSelectedCategory('Other'); 
                                        setSelectedItemId('custom_other_global'); 
                                        setCustomName(''); 
                                        setUnit('');
                                        setIsCategoryOpen(false);
                                    }}
                                    style={{ padding: '14px 20px', cursor: 'pointer', fontSize: '15px', fontWeight: '700', backgroundColor: '#f0fdf4', color: '#16a34a' }}
                                >
                                    ➕ Add Other Category...
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 2. Item Selection - CUSTOM DROPDOWN */}
                    {selectedCategory && selectedCategory !== 'Other' && (
                        <div style={{ marginBottom: '28px', position: 'relative', animation: 'fadeIn 0.3s ease-in-out' }}>
                            <label style={{ display: 'block', fontSize: '15px', fontWeight: '700', color: '#1e293b', marginBottom: '10px' }}>Select Item <span style={{color: '#ef4444'}}>*</span></label>
                            <div 
                                onClick={() => setIsItemOpen(!isItemOpen)}
                                style={{ width: '100%', boxSizing: 'border-box', padding: '16px 20px', borderRadius: '14px', border: '2px solid #94a3b8', fontSize: '16px', fontWeight: '600', backgroundColor: '#f8fafc', color: selectedItemId ? '#0f172a' : '#64748b', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
                            >
                                <span>{activeItems.find(i => i.id === selectedItemId)?.name || "-- Choose Item --"}</span>
                                <svg width="20" height="20" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isItemOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}><path d="M6 9l6 6 6-6"/></svg>
                            </div>
                            
                            {isItemOpen && (
                                <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, width: '100%', maxHeight: '400px', overflowY: 'auto', backgroundColor: '#ffffff', borderRadius: '14px', border: '3px solid #1e293b', zIndex: 40, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}>
                                    {activeItems.map((item) => {
                                        const isOther = item.id.includes('other');
                                        return (
                                            <div 
                                                key={item.id} 
                                                onClick={() => { 
                                                    setSelectedItemId(item.id); 
                                                    setCustomName(''); 
                                                    setUnit('');
                                                    setIsItemOpen(false);
                                                }}
                                                style={{ 
                                                    padding: '14px 20px', 
                                                    borderBottom: '1px solid #e2e8f0', 
                                                    cursor: 'pointer', 
                                                    fontSize: '15px', 
                                                    fontWeight: selectedItemId === item.id || isOther ? '700' : '500', 
                                                    backgroundColor: selectedItemId === item.id ? '#f0fdf4' : (isOther ? '#f0fdf4' : '#ffffff'), 
                                                    color: selectedItemId === item.id ? '#16a34a' : (isOther ? '#16a34a' : '#1e293b') 
                                                }}
                                            >
                                                {item.name}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Universal Image Picker */}
                    {selectedItemName && (
                        <UniversalImagePicker 
                            searchTerm={selectedItemName} 
                            categoryContext={selectedCategory} 
                            onSelectImage={setSelectedImageUrl} 
                            currentSelection={selectedImageUrl} 
                        />
                    )}

                    {/* 3. Custom Name Input (Only shows if "Other..." is selected) */}
                    {isOtherSelected && (
                        <div style={{ marginBottom: '24px', animation: 'fadeIn 0.3s ease-in-out' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>What are you listing?</label>
                            <input 
                                type="text" 
                                placeholder="e.g. Fresh Bamboo Shoots" 
                                value={customName}
                                onChange={(e) => setCustomName(e.target.value)}
                                style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '15px', backgroundColor: '#fff', color: '#0f172a', fontWeight: '500', outline: 'none', boxSizing: 'border-box' }}
                                required={isOtherSelected}
                            />
                        </div>
                    )}

                    {/* 4. Organic Toggle */}
                    <div style={{ marginBottom: '24px' }}>
                        <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Leaf size={20} color="#16a34a" />
                                </div>
                                <div>
                                    <h4 style={{ margin: '0 0 2px 0', fontSize: '15px', color: '#0f172a', fontWeight: '700' }}>100% Organic</h4>
                                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Chemical-free produce</p>
                                </div>
                            </div>
                            <OrganicToggle checked={isOrganic} onChange={setIsOrganic} />
                        </div>
                        
                        {/* Organic Certification Details - Shown only when toggled ON */}
                        {isOrganic && (
                            <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', animation: 'fadeIn 0.3s ease-in-out' }}>
                                <h5 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#1e293b', fontWeight: '600' }}>Organic Certification Details</h5>
                                <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#64748b' }}>Provide certificate text details so buyers can verify your organic status.</p>
                                
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Certification Body / Certified Name</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. India Organic, USDA..." 
                                        value={organicCertName}
                                        onChange={(e) => setOrganicCertName(e.target.value)}
                                        style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: '#fff', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
                                        required={isOrganic}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Certificate Number</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. ORG-12345678" 
                                        value={organicCertNumber}
                                        onChange={(e) => setOrganicCertNumber(e.target.value)}
                                        style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: '#fff', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
                                        required={isOrganic}
                                    />
                                </div>
                            </div>
                        )}
                    </div>



                    {/* 5. Pricing & Unit Container */}
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>Price (₹)</label>
                            <input 
                                type="number" 
                                placeholder="0.00" 
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                style={{ width: '100%', padding: '16px 12px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '15px', backgroundColor: '#fff', color: '#0f172a', fontWeight: '600', outline: 'none', boxSizing: 'border-box', WebkitAppearance: 'none' }}
                                required
                            />
                        </div>

                        <div style={{ flex: 1, position: 'relative' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>Selling Unit</label>
                            
                            <div 
                                onClick={() => setIsUnitOpen(!isUnitOpen)}
                                style={{ width: '100%', boxSizing: 'border-box', padding: '16px 16px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: '600', backgroundColor: '#fff', color: unit ? '#0f172a' : '#64748b', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                            >
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{farmFreshUnits.find(u => u.val === unit)?.label || unit || "-- Select Unit --"}</span>
                                <svg width="20" height="20" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isUnitOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0, marginLeft: '8px' }}><path d="M6 9l6 6 6-6"/></svg>
                            </div>

                            {isUnitOpen && (
                                <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, width: '100%', maxHeight: '400px', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff', borderRadius: '14px', border: '3px solid #1e293b', zIndex: 60, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}>
                                    <div style={{ overflowY: 'auto', flex: 1, padding: '8px 0' }}>
                                        {displayUnits.map((u) => {
                                            const isOther = u.val === 'custom_other_unit';
                                            return (
                                                <div 
                                                    key={u.val} 
                                                    onClick={() => { 
                                                        setUnit(u.val); 
                                                        setIsUnitOpen(false);
                                                    }}
                                                    style={{ 
                                                        padding: '14px 20px', 
                                                        cursor: 'pointer', 
                                                        fontSize: '15px', 
                                                        fontWeight: unit === u.val || isOther ? '700' : '500', 
                                                        backgroundColor: unit === u.val ? '#f0fdf4' : (isOther ? '#f0fdf4' : '#ffffff'), 
                                                        color: unit === u.val ? '#16a34a' : (isOther ? '#16a34a' : '#1e293b'),
                                                        borderBottom: isOther ? 'none' : '1px solid #e2e8f0'
                                                    }}
                                                >
                                                    {u.label}
                                                </div>
                                            );
                                        })}
                                        {displayUnits.length === 0 && (
                                            <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>No units found. Use Custom Unit.</div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {unit === 'custom_other_unit' && (
                                <div style={{ marginTop: '12px', animation: 'slideUp 0.3s ease-out' }}>
                                    <input 
                                        type="text" 
                                        placeholder="Type custom unit (e.g. 30 Kg Tin)" 
                                        value={customUnitName}
                                        onChange={(e) => setCustomUnitName(e.target.value)}
                                        style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '2px solid #16a34a', fontSize: '14px', backgroundColor: '#f0fdf4', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
                                        required
                                        autoFocus
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 6. Description */}
                    <div style={{ marginBottom: '32px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>Description & Quality details</label>
                        <textarea 
                            placeholder="Describe your produce (e.g. Freshly picked this morning, perfectly ripe, no chemicals used...)" 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '15px', backgroundColor: '#fff', color: '#0f172a', fontWeight: '500', outline: 'none', minHeight: '120px', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
                            required
                        />
                    </div>

                    {/* 7. Quality Assurance & Freshness */}
                    <div style={{ marginBottom: '32px', backgroundColor: '#f0fdf4', padding: '16px 20px', borderRadius: '16px', border: '2px solid #16a34a' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                            <svg width="20" height="20" fill="none" stroke="#15803d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                            <h4 style={{ margin: 0, fontSize: '16px', color: '#15803d', fontWeight: '800' }}>Quality & Freshness</h4>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                            <div style={{ flex: 1, backgroundColor: '#fff', padding: '12px', borderRadius: '12px', border: '1px solid #bbf7d0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <span style={{ display: 'block', fontSize: '12px', color: '#64748b', fontWeight: '600', marginBottom: '4px' }}>Listing Date</span>
                                <span style={{ display: 'block', fontSize: '15px', color: '#0f172a', fontWeight: '700' }}>{new Date().toLocaleDateString('en-IN')}</span>
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontSize: '12px', color: '#475569', fontWeight: '600', marginBottom: '4px' }}>Expected Shelf Life <span style={{color: '#ef4444'}}>*</span></label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. 5 Days, 2 Months" 
                                    value={shelfLife}
                                    onChange={(e) => setShelfLife(e.target.value)}
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: '12px', border: '1px solid #bbf7d0', fontSize: '14px', backgroundColor: '#fff', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
                                    required
                                />
                            </div>
                        </div>

                        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', backgroundColor: '#fff', padding: '12px', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                            <input 
                                type="checkbox" 
                                checked={qualityGuarantee}
                                onChange={(e) => setQualityGuarantee(e.target.checked)}
                                style={{ marginTop: '4px', width: '20px', height: '20px', accentColor: '#16a34a' }}
                                required
                            />
                            <div>
                                <span style={{ display: 'block', fontSize: '15px', fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>I Guarantee Quality</span>
                                <span style={{ display: 'block', fontSize: '13px', color: '#475569', lineHeight: '1.4' }}>By listing, I verify this produce is fresh, accurately described, and honors the Farm Fresh platform standards.</span>
                            </div>
                        </label>
                    </div>

                    <TermsAgreementCheckbox checked={termsAccepted} onChange={setTermsAccepted} />

                    {/* Submit Button */}
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        style={{ width: '100%', padding: '18px', borderRadius: '16px', backgroundColor: isSubmitting ? '#94a3b8' : '#0f172a', color: '#fff', border: 'none', fontSize: '16px', fontWeight: '700', cursor: isSubmitting ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', boxShadow: '0 10px 25px rgba(15,23,42,0.2)' }}
                    >
                        {isSubmitting ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.3)', borderTop: '3px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                                Adding Listing...
                            </span>
                        ) : (
                            <>
                                <CheckCircle2 size={20} />
                                Publish Listing
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* Error Toast Notification */}
            {errorToast && (
                <div style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#ef4444', color: 'white', padding: '16px 24px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(239, 68, 68, 0.4)', zIndex: 100000, display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '600', fontSize: '15px', animation: 'slideUp 0.3s ease-out', maxWidth: '90%', width: 'max-content' }}>
                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
                    <span>{errorToast}</span>
                </div>
            )}
            
            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideDown {
                    from { opacity: 0; transform: translate(-50%, -20px); }
                    to { opacity: 1; transform: translate(-50%, 0); }
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
