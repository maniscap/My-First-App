import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Leaf, CheckCircle2 } from 'lucide-react';
import { farmFreshCategories } from '../../utils/ProductLibrary';
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
    const [unit, setUnit] = useState('kg');
    const [isOrganic, setIsOrganic] = useState(false);
    const [organicCertName, setOrganicCertName] = useState('');
    const [organicCertNumber, setOrganicCertNumber] = useState('');
    const [selectedImageUrl, setSelectedImageUrl] = useState(null);

    // Derived logic for dropdowns
    const activeCategoryObj = farmFreshCategories.find(c => c.category === selectedCategory);
    const activeItems = activeCategoryObj ? activeCategoryObj.items : [];
    const isOtherSelected = selectedItemId.includes('other');
    const selectedItemName = isOtherSelected ? customName : activeItems.find(i => i.id === selectedItemId)?.name;

    // Smart Dynamic Units based on the exact item chosen
    const getDynamicUnits = () => {
        if (!selectedCategory) return [{ val: 'kg', label: 'Per Kg' }];
        
        const cat = selectedCategory.toLowerCase();
        const item = selectedItemId.toLowerCase();

        if (item.includes('egg')) return [ { val: 'dozen', label: 'Per Dozen' }, { val: 'tray', label: 'Per Tray (30)' }, { val: 'piece', label: 'Per Piece' } ];
        if (item.includes('milk') || item.includes('lassi') || item.includes('buttermilk') || item.includes('water') || item.includes('juice') || item.includes('oil')) return [ { val: 'liter', label: 'Per Liter' }, { val: '500ml', label: 'Per 500ml' }, { val: 'packet', label: 'Per Packet' } ];
        if (cat.includes('dairy') || item.includes('pickle') || item.includes('jam') || item.includes('butter') || item.includes('ghee') || item.includes('honey')) return [ { val: 'kg', label: 'Per Kg' }, { val: '500g', label: 'Per 500g' }, { val: '250g', label: 'Per 250g' }, { val: 'jar', label: 'Per Jar' }, { val: 'packet', label: 'Per Packet' } ];
        if (item.includes('leaves') || item.includes('spinach') || item.includes('mint') || item.includes('coriander')) return [ { val: 'bunch', label: 'Per Bunch' }, { val: 'kg', label: 'Per Kg' }, { val: 'gram', label: 'Per 100g' } ];
        if (item.includes('bread') || item.includes('bun') || item.includes('biscuit') || item.includes('cookie') || item.includes('chikki') || item.includes('papad') || item.includes('chips') || item.includes('mathri')) return [ { val: 'packet', label: 'Per Packet' }, { val: 'piece', label: 'Per Piece' }, { val: 'box', label: 'Per Box' }, { val: 'kg', label: 'Per Kg' } ];
        if (item.includes('banana') || item.includes('coconut')) return [ { val: 'dozen', label: 'Per Dozen' }, { val: 'piece', label: 'Per Piece' }, { val: 'kg', label: 'Per Kg' }, { val: 'quintal', label: 'Per Quintal' } ];
        if (cat.includes('field')) return [ { val: 'quintal', label: 'Per Quintal (100kg)' }, { val: 'ton', label: 'Per Ton (1000kg)' }, { val: 'bag', label: 'Per Bag (50kg)' }, { val: 'kg', label: 'Per Kg' } ];

        return [ { val: 'kg', label: 'Per Kg' }, { val: 'quintal', label: 'Per Quintal' }, { val: 'ton', label: 'Per Ton' }, { val: 'gram', label: 'Per 100g' }, { val: 'box', label: 'Per Box/Crate' } ];
    };

    const dynamicUnits = getDynamicUnits();

    const handleSave = async (e) => {
        e.preventDefault();
        
        try {
            const user = auth.currentUser;
            if (!user) {
                alert("You must be logged in to create a listing.");
                return;
            }

            const listingData = {
                sellerId: user.uid,
                sellerName: user.displayName || 'Unknown Seller', // Could fetch from profile
                shopName: localStorage.getItem('locationTitle') || 'My Shop',
                listingType: 'farm_fresh',
                category: selectedCategory,
                itemId: selectedItemId,
                itemName: selectedItemName,
                description: description,
                price: Number(price),
                unit: unit,
                isOrganic: isOrganic,
                organicCertName: isOrganic ? organicCertName : null,
                organicCertNumber: isOrganic ? organicCertNumber : null,
                imageUrl: selectedImageUrl,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            await addDoc(collection(db, 'seller_listings'), listingData);
            
            navigate('/Seller_HomePage');
        } catch (error) {
            console.error("Error adding document: ", error);
            alert("Failed to save listing. Please try again.");
        }
    };

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
                    
                    {/* 1. Category Selection */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>Select Category</label>
                        <select 
                            value={selectedCategory} 
                            onChange={(e) => { setSelectedCategory(e.target.value); setSelectedItemId(''); setCustomName(''); }}
                            style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '15px', backgroundColor: '#fff', color: '#0f172a', appearance: 'none', outline: 'none' }}
                            required
                        >
                            <option value="">-- Choose Category --</option>
                            {farmFreshCategories.map(cat => (
                                <option key={cat.category} value={cat.category}>{cat.category}</option>
                            ))}
                        </select>
                    </div>

                    {/* 2. Item Selection (Appears only after category is chosen) */}
                    {selectedCategory && (
                        <div style={{ marginBottom: '24px', animation: 'fadeIn 0.3s ease-in-out' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>Select Item</label>
                            <select 
                                value={selectedItemId} 
                                onChange={(e) => { setSelectedItemId(e.target.value); setCustomName(''); setUnit(''); }}
                                style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '15px', backgroundColor: '#fff', color: '#0f172a', appearance: 'none', outline: 'none' }}
                                required
                            >
                                <option value="">-- Choose Item --</option>
                                {activeItems.map(item => (
                                    <option key={item.id} value={item.id}>{item.name}</option>
                                ))}
                            </select>
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

                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>Selling Unit</label>
                            <div style={{ position: 'relative' }}>
                                <select 
                                    value={unit || dynamicUnits[0]?.val}
                                    onChange={(e) => setUnit(e.target.value)}
                                    style={{ width: '100%', padding: '16px 40px 16px 16px', borderRadius: '16px', border: '1px solid #cbd5e1', fontSize: '15px', backgroundColor: '#fff', outline: 'none', appearance: 'none', boxSizing: 'border-box', color: '#0f172a', fontWeight: '600' }}
                                >
                                    {dynamicUnits.map(u => (
                                        <option key={u.val} value={u.val}>{u.label}</option>
                                    ))}
                                </select>
                                <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: '14px', color: '#64748b' }}>▼</div>
                            </div>
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

                    {/* Submit Button */}
                    <button 
                        type="submit" 
                        style={{ width: '100%', padding: '18px', borderRadius: '16px', backgroundColor: '#0f172a', color: '#fff', border: 'none', fontSize: '16px', fontWeight: '700', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', boxShadow: '0 10px 25px rgba(15,23,42,0.2)' }}
                    >
                        <CheckCircle2 size={20} />
                        Publish Listing
                    </button>

                </form>
            </div>
            
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
