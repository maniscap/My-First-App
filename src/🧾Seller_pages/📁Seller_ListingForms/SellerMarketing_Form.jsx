import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../../firebase';
import { doc, collection, addDoc, updateDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { ArrowLeft, MapPin, Plus, Trash2, Camera, Video, AlertCircle, CheckCircle, ShieldCheck, Sparkles } from 'lucide-react';
import LockedListingScreen from '../../🛠️Shared_Components/LockedListingScreen';

export default function SellerMarketing_Form() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    // Read status instantly from localStorage — same pattern as all other listing forms
    const [appStatus, setAppStatus] = useState(localStorage.getItem('seller_app_status') || 'none');
    const [appFrozen, setAppFrozen] = useState(localStorage.getItem('seller_app_frozen') === 'true');
    const [sellerId, setSellerId] = useState(localStorage.getItem('seller_app_id') || '');

    // Section 1: Basic Identity
    const [shopName, setShopName] = useState('');
    const [category, setCategory] = useState('');
    const [customCategory, setCustomCategory] = useState('');
    const [yearEstablished, setYearEstablished] = useState('');
    const [shopLogo, setShopLogo] = useState(null);
    const [isSection1Open, setIsSection1Open] = useState(false);

    // Section 2: Owner & Partners
    const [ownerName, setOwnerName] = useState('');
    const [phone, setPhone] = useState('');
    const [partners, setPartners] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [isSection2Open, setIsSection2Open] = useState(false);

    // Section 3: Location
    const [isSection3Open, setIsSection3Open] = useState(false);
    const [locationForm, setLocationForm] = useState({
        lat: '', lng: '', pincode: '', state: '', district: '', nearerCity: '', mandal: '', village: '', houseNumber: '', landmark: ''
    });
    const [homeServices, setHomeServices] = useState(false);
    const [radius, setRadius] = useState('');
    const [deliveryFeeType, setDeliveryFeeType] = useState('free');
    const [deliveryFeeAmount, setDeliveryFeeAmount] = useState('');
    const [isFetchingLocation, setIsFetchingLocation] = useState(false);

    const updateLocationForm = (field, value) => {
        setLocationForm(prev => ({ ...prev, [field]: value }));
    };

    // Section 4: Details & Inventory
    const [isSection4Open, setIsSection4Open] = useState(false);
    const [description, setDescription] = useState('');
    const [specialization, setSpecialization] = useState('');
    const [gstin, setGstin] = useState('');
    const [website, setWebsite] = useState('');
    const [itemsAvailable, setItemsAvailable] = useState('');

    // Section 5: Operations & Offers
    const [isSection5Open, setIsSection5Open] = useState(false);
    const [openTime, setOpenTime] = useState('');
    const [openAmPm, setOpenAmPm] = useState('AM');
    const [closeTime, setCloseTime] = useState('');
    const [closeAmPm, setCloseAmPm] = useState('PM');
    const [holidays, setHolidays] = useState([]);
    const [offerDesc, setOfferDesc] = useState('');
    const [offerImage, setOfferImage] = useState(null);
    const [breakTime, setBreakTime] = useState('');
    const [payments, setPayments] = useState([]);

    // Section 6: Social & Amenities
    const [isSection6Open, setIsSection6Open] = useState(false);
    const [whatsapp, setWhatsapp] = useState('');
    const [instagram, setInstagram] = useState('');
    const [amenities, setAmenities] = useState([]);

    // Section 7: Media Uploads
    const [isSection7Open, setIsSection7Open] = useState(false);
    const [shopFront, setShopFront] = useState(null);
    const [insideView, setInsideView] = useState(null);
    const [productsPhoto, setProductsPhoto] = useState(null);
    const [menuPhoto, setMenuPhoto] = useState(null);
    const [shopVideo, setShopVideo] = useState(null);

    const handleOfferImageUpload = (e) => {
        if (e.target.files && e.target.files[0]) {
            setOfferImage(URL.createObjectURL(e.target.files[0]));
        }
    };

    const toggleHoliday = (day) => {
        if (holidays.includes(day)) {
            setHolidays(holidays.filter(d => d !== day));
        } else {
            setHolidays([...holidays, day]);
        }
    };

    const togglePayment = (method) => {
        if (payments.includes(method)) {
            setPayments(payments.filter(m => m !== method));
        } else {
            setPayments([...payments, method]);
        }
    };

    const toggleAmenity = (amenity) => {
        if (amenities.includes(amenity)) {
            setAmenities(amenities.filter(a => a !== amenity));
        } else {
            setAmenities([...amenities, amenity]);
        }
    };

    // Predefined Categories
    const categories = ['Pesticides & Fertilizers', 'Hardware & Tools', 'Hospital / Clinic', 'Function Hall', 'Restaurant / Cafe', 'Retail Shop', 'Other'];

    // Auth Check — syncs user object; status already read from localStorage above
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (!currentUser) {
                setAppStatus('none');
                return;
            }
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    const fetchLocation = () => {
        if (!navigator.geolocation) {
            alert("GPS not supported by your browser.");
            return;
        }
        setIsFetchingLocation(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const res = await fetch('/api/UserLocation', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'reverseGeocode', lat: latitude, lng: longitude })
                    });
                    if (!res.ok) throw new Error("TomTom response not ok");
                    const data = await res.json();
                    if (data.addresses && data.addresses.length > 0) {
                        const addr = data.addresses[0].address;
                        setLocationForm(prev => ({
                            ...prev,
                            lat: latitude.toFixed(6),
                            lng: longitude.toFixed(6),
                            pincode: addr.postalCode || addr.postcode || prev.pincode,
                            state: addr.countrySubdivision || prev.state,
                            district: addr.countrySecondarySubdivision || addr.municipality || prev.district,
                            nearerCity: addr.municipality || prev.nearerCity,
                            mandal: addr.municipality || prev.mandal || '',
                            village: addr.municipalitySubdivision || prev.village,
                            houseNumber: prev.houseNumber || '',
                            landmark: addr.streetName || prev.landmark || ''
                        }));
                    } else {
                        throw new Error("No results from TomTom");
                    }
                } catch (tomTomError) {
                    console.warn("TomTom failed. Falling back to OpenStreetMap...", tomTomError);
                    try {
                        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`, {
                            headers: {
                                'Accept-Language': 'en-US,en;q=0.9'
                            }
                        });
                        const data = await response.json();
                        if (data && data.address) {
                            const addr = data.address;
                            setLocationForm(prev => ({
                                ...prev,
                                lat: latitude.toFixed(6),
                                lng: longitude.toFixed(6),
                                pincode: addr.postcode || prev.pincode,
                                state: addr.state || prev.state,
                                district: addr.state_district || addr.county || prev.district,
                                nearerCity: addr.city || addr.town || addr.municipality || prev.nearerCity,
                                mandal: addr.county || addr.subregion || addr.city_district || addr.suburb || prev.mandal || '',
                                village: addr.village || addr.suburb || addr.neighbourhood || addr.hamlet || prev.village,
                                houseNumber: addr.house_number || prev.houseNumber || '',
                                landmark: addr.attraction || addr.tourism || addr.amenity || addr.road || prev.landmark || ''
                            }));
                        }
                    } catch (osmError) {
                        console.error("Geocoding failed entirely", osmError);
                        alert("Failed to auto-detect full address. Please enter manually.");
                    }
                } finally {
                    setIsFetchingLocation(false);
                }
            },
            (error) => {
                alert("Could not fetch location. Please enable location services.");
                setIsFetchingLocation(false);
            }
        );
    };

    const addPartner = () => {
        setPartners([...partners, { name: '', contact: '' }]);
    };
    const updatePartner = (index, field, value) => {
        const newPartners = [...partners];
        newPartners[index][field] = value;
        setPartners(newPartners);
    };
    const removePartner = (index) => {
        setPartners(partners.filter((_, i) => i !== index));
    };

    const addStaff = () => {
        setStaffList([...staffList, { name: '', contact: '' }]);
    };
    const updateStaff = (index, field, value) => {
        const newStaff = [...staffList];
        newStaff[index][field] = value;
        setStaffList(newStaff);
    };
    const removeStaff = (index) => {
        setStaffList(staffList.filter((_, i) => i !== index));
    };

    // Validation & Progress Logic
    const calculateProgress = () => {
        const fields = [
            { id: 'field-shopName', valid: shopName.trim().length > 0, section: 1 },
            { id: 'field-category', valid: category !== 'Other' ? category !== '' : customCategory.trim().length > 0, section: 1 },
            { id: 'field-ownerName', valid: ownerName.trim().length > 0, section: 2 },
            { id: 'field-ownerPhone', valid: phone.trim().length >= 10, section: 2 },
            { id: 'field-pincode', valid: locationForm.pincode.trim().length >= 6, section: 3 },
            { id: 'field-village', valid: locationForm.village.trim().length > 0, section: 3 },
            { id: 'field-mandal', valid: locationForm.mandal.trim().length > 0, section: 3 },
            { id: 'field-district', valid: locationForm.district.trim().length > 0, section: 3 },
            { id: 'field-state', valid: locationForm.state.trim().length > 0, section: 3 },
            { id: 'field-latlng', valid: locationForm.lat !== '' && locationForm.lng !== '', section: 3 },
            { id: 'field-specialization', valid: specialization.trim().length > 0, section: 4 },
            { id: 'field-itemsAvailable', valid: itemsAvailable.trim().length > 0, section: 4 },
            { id: 'field-openTime', valid: openTime.trim().length > 0, section: 5 },
            { id: 'field-closeTime', valid: closeTime.trim().length > 0, section: 5 },
            { id: 'field-payments', valid: payments.length > 0, section: 5 },
            { id: 'field-shopFront', valid: shopFront !== null, section: 7 },
            { id: 'field-insideView', valid: insideView !== null, section: 7 }
        ];
        const completedCount = fields.filter(f => f.valid).length;
        const percentage = Math.round((completedCount / fields.length) * 100);
        return { percentage, fields };
    };

    const [showErrors, setShowErrors] = useState(false);
    const { percentage, fields: reqFields } = calculateProgress();

    const getErrorClass = (fieldId) => {
        if (!showErrors) return '';
        const field = reqFields.find(f => f.id === fieldId);
        return field && !field.valid ? 'error-glow' : '';
    };

    const handleSubmit = () => {
        if (percentage < 100) {
            setShowErrors(true);
            const firstError = reqFields.find(f => !f.valid);
            if (firstError) {
                if (firstError.section === 1) setIsSection1Open(true);
                if (firstError.section === 2) setIsSection2Open(true);
                if (firstError.section === 3) setIsSection3Open(true);
                if (firstError.section === 4) setIsSection4Open(true);
                if (firstError.section === 5) setIsSection5Open(true);
                if (firstError.section === 7) setIsSection7Open(true);
                
                setTimeout(() => {
                    const el = document.getElementById(firstError.id);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 150);
            }
            return;
        }
        alert("Success! Your Marketing Listing has been published.");
    };

    if (appStatus !== 'approved' || appFrozen) {
        return (
            <LockedListingScreen
                categoryName="Marketing & Promotions"
                icon={Sparkles}
                title="Marketing is Locked"
                description="Showcase your shop, business & services to thousands of customers. Complete your seller registration to unlock powerful marketing tools."
                colorTheme={{
                    main: '#7C3AED',   // Purple
                    bg: '#F5F3FF',
                    border: '#DDD6FE',
                    shadow: '#C4B5FD'
                }}
            />
        );
    }

    return (
        <div className="form-container">
            {/* Header */}
            <div className="header">
                <button onClick={() => navigate(-1)} className="back-btn">
                    <ArrowLeft size={24} color="#ffffff" />
                </button>
                <div>
                    <h1 className="header-title">Create Marketing Listing</h1>
                    <p className="header-subtitle">Expand your business reach to the local community</p>
                </div>
            </div>

            <div className="form-content">
                <div className="seller-id-card">
                    <div className="seller-id-info">
                        <span className="seller-id-label">Verified Seller ID</span>
                        <strong className="seller-id-value">{sellerId || 'Loading...'}</strong>
                    </div>
                    <ShieldCheck size={32} color="#10b981" />
                </div>

                {/* Progress Card */}
                <div style={{ background: '#ffffff', borderRadius: '16px', padding: '16px 20px', marginBottom: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '12px' }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '15px', color: '#1d1d1f', fontWeight: '700' }}>Profile Completion</h3>
                            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#86868b' }}>Complete required fields to publish.</p>
                        </div>
                        <span style={{ fontSize: '20px', fontWeight: '800', color: percentage === 100 ? '#34C759' : '#0071e3' }}>
                            {percentage}%
                        </span>
                    </div>
                    <div style={{ background: '#f5f5f7', height: '10px', borderRadius: '5px', overflow: 'hidden', position: 'relative' }}>
                        <div style={{ width: `${percentage}%`, height: '100%', background: percentage === 100 ? '#34C759' : 'linear-gradient(90deg, #0071e3, #409cff)', transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)', borderRadius: '5px' }}></div>
                    </div>
                </div>

                <form className="marketing-form">
                    
                    {/* SECTION 1: Basic Identity */}
                    <div className={`form-card accordion-card ${isSection1Open ? 'accordion-open' : 'accordion-closed'}`}>
                        <div className="card-header" onClick={() => setIsSection1Open(!isSection1Open)}>
                            <h2 className="card-title" style={{ margin: 0, borderBottom: 'none', paddingBottom: 0 }}>1. Business Identity</h2>
                            <span className="accordion-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isSection1Open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                            </span>
                        </div>
                        
                        {isSection1Open && (
                            <div className="card-body">
                                <div id="field-shopName" className={`input-group ${getErrorClass('field-shopName')}`} style={{ marginTop: '20px' }}>
                                    <label>Shop / Organization Name *</label>
                                    <input type="text" value={shopName} onChange={e => setShopName(e.target.value)} placeholder="e.g. Raju Pesticides" required />
                                </div>

                                <div id="field-category" className={`input-group ${getErrorClass('field-category')}`}>
                                    <label>Business Category *</label>
                                    <select value={category} onChange={e => setCategory(e.target.value)} required>
                                        <option value="">Select a category</option>
                                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>

                                <div className="input-group">
                                    <label>Year Established</label>
                                    <input type="number" value={yearEstablished} onChange={e => setYearEstablished(e.target.value)} placeholder="e.g. 2015" />
                                </div>

                                {category === 'Other' && (
                                    <div className="input-group">
                                        <label>Custom Category Name *</label>
                                        <input type="text" value={customCategory} onChange={e => setCustomCategory(e.target.value)} placeholder="Type your category" required />
                                    </div>
                                )}

                                <div className="input-group">
                                    <label>Shop Logo (Optional)</label>
                                    <div className="logo-upload-box">
                                        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', width: '100%', height: '100%', justifyContent: 'center' }}>
                                            {shopLogo ? (
                                                <img src={shopLogo} alt="Logo Preview" style={{ maxHeight: '60px', objectFit: 'contain' }} />
                                            ) : (
                                                <>
                                                    <Camera size={20} />
                                                    <span>Click to Upload Logo</span>
                                                </>
                                            )}
                                            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                                                if (e.target.files && e.target.files[0]) {
                                                    setShopLogo(URL.createObjectURL(e.target.files[0]));
                                                }
                                            }} />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* SECTION 2: Owner Details */}
                    <div className={`form-card accordion-card ${isSection2Open ? 'accordion-open-orange' : 'accordion-closed-orange'}`}>
                        <div className="card-header" onClick={() => setIsSection2Open(!isSection2Open)}>
                            <h2 className="card-title" style={{ margin: 0, borderBottom: 'none', paddingBottom: 0 }}>2. Contact Details</h2>
                            <span className="accordion-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isSection2Open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                            </span>
                        </div>
                        
                        {isSection2Open && (
                            <div className="card-body">
                                <div id="field-ownerName" className={`input-group ${getErrorClass('field-ownerName')}`} style={{ marginTop: '20px' }}>
                                    <label>Owner Full Name *</label>
                                    <input type="text" value={ownerName} onChange={e => setOwnerName(e.target.value)} placeholder="Full Name" required />
                                </div>

                                <div id="field-ownerPhone" className={`input-group ${getErrorClass('field-ownerPhone')}`}>
                                    <label>Primary Phone Number *</label>
                                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91" required />
                                </div>

                                {/* Partners */}
                                <div className="partners-section">
                                    <div className="partners-header">
                                        <label>Partners (Optional)</label>
                                        <button type="button" onClick={addPartner} className="add-btn">
                                            <Plus size={16} /> Add Partner
                                        </button>
                                    </div>
                                    
                                    {partners.map((partner, index) => (
                                        <div key={index} className="partner-row">
                                            <input 
                                                type="text" 
                                                placeholder="Partner Name" 
                                                value={partner.name}
                                                onChange={e => updatePartner(index, 'name', e.target.value)}
                                            />
                                            <input 
                                                type="tel" 
                                                placeholder="Contact Number" 
                                                value={partner.contact}
                                                onChange={e => updatePartner(index, 'contact', e.target.value)}
                                            />
                                            <button type="button" onClick={() => removePartner(index)} className="del-btn">
                                                <Trash2 size={16} /> Remove Partner
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {/* Staff */}
                                <div className="partners-section">
                                    <div className="partners-header">
                                        <label>Staff (Optional)</label>
                                        <button type="button" onClick={addStaff} className="add-btn">
                                            <Plus size={16} /> Add Staff
                                        </button>
                                    </div>
                                    
                                    {staffList.map((staff, index) => (
                                        <div key={index} className="partner-row">
                                            <input 
                                                type="text" 
                                                placeholder="Staff Name" 
                                                value={staff.name}
                                                onChange={e => updateStaff(index, 'name', e.target.value)}
                                            />
                                            <input 
                                                type="tel" 
                                                placeholder="Contact Number" 
                                                value={staff.contact}
                                                onChange={e => updateStaff(index, 'contact', e.target.value)}
                                            />
                                            <button type="button" onClick={() => removeStaff(index)} className="del-btn">
                                                <Trash2 size={16} /> Remove Staff
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* SECTION 3: Location */}
                    <div className={`form-card accordion-card ${isSection3Open ? 'accordion-open-green' : 'accordion-closed-green'}`}>
                        <div className="card-header" onClick={() => setIsSection3Open(!isSection3Open)}>
                            <h2 className="card-title" style={{ margin: 0, borderBottom: 'none', paddingBottom: 0 }}>3. Location & Delivery</h2>
                            <span className="accordion-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isSection3Open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                            </span>
                        </div>

                        {isSection3Open && (
                            <div className="card-body">
                                {locationForm.lat && locationForm.lng && (
                                    <div style={{ marginTop: '20px', marginBottom: '20px', width: '100%' }}>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#1d1d1f', marginBottom: '8px' }}>Map Preview</label>
                                        <iframe 
                                            title="Shop Location"
                                            width="100%" 
                                            height="250" 
                                            frameBorder="0" 
                                            scrolling="no" 
                                            marginHeight="0" 
                                            marginWidth="0" 
                                            src={`https://maps.google.com/maps?q=${locationForm.lat},${locationForm.lng}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
                                            style={{ borderRadius: '12px', border: '0.5px solid rgba(0,0,0,0.15)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                                        ></iframe>
                                    </div>
                                )}

                                <div id="field-latlng" className={`location-picker ${getErrorClass('field-latlng')}`} style={{ marginTop: locationForm.lat ? '0' : '20px' }}>
                                    <div className="loc-status">
                                        {locationForm.lat ? (
                                            <span className="loc-success"><CheckCircle size={18} /> GPS Location Secured ({locationForm.lat}, {locationForm.lng})</span>
                                        ) : (
                                            <span className="loc-warning"><AlertCircle size={18} /> GPS Location Required</span>
                                        )}
                                    </div>
                                    <button type="button" onClick={fetchLocation} disabled={isFetchingLocation} className="fetch-loc-btn">
                                        <MapPin size={18} /> {isFetchingLocation ? 'Fetching...' : locationForm.lat ? 'Update Location' : 'Auto-Detect Location'}
                                    </button>
                                    <p className="help-text">Please stand outside your shop to get an accurate pin for customers.</p>
                                </div>

                                <div className="grid-2">
                                    <div className="input-group">
                                        <label>Latitude *</label>
                                        <input type="text" value={locationForm.lat} readOnly placeholder="Auto-detected" style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed', color: '#86868b' }} />
                                    </div>
                                    <div className="input-group">
                                        <label>Longitude *</label>
                                        <input type="text" value={locationForm.lng} readOnly placeholder="Auto-detected" style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed', color: '#86868b' }} />
                                    </div>
                                </div>

                                <div className="grid-2">
                                    <div className="input-group">
                                        <label>House No. / Building</label>
                                        <input type="text" value={locationForm.houseNumber} onChange={e => updateLocationForm('houseNumber', e.target.value)} placeholder="e.g. 12-45" />
                                    </div>
                                    <div id="field-village" className={`input-group ${getErrorClass('field-village')}`}>
                                        <label>Village / Area *</label>
                                        <input type="text" value={locationForm.village} onChange={e => updateLocationForm('village', e.target.value)} placeholder="e.g. Gandhi Nagar" required />
                                    </div>
                                    <div className="input-group">
                                        <label>Street / Landmark</label>
                                        <input type="text" value={locationForm.landmark} onChange={e => updateLocationForm('landmark', e.target.value)} placeholder="e.g. Near Bus Stand" />
                                    </div>
                                    <div className="input-group">
                                        <label>City / Town *</label>
                                        <input type="text" value={locationForm.nearerCity} onChange={e => updateLocationForm('nearerCity', e.target.value)} placeholder="e.g. Warangal" required />
                                    </div>
                                    <div id="field-mandal" className={`input-group ${getErrorClass('field-mandal')}`}>
                                        <label>Mandal</label>
                                        <input type="text" value={locationForm.mandal} onChange={e => updateLocationForm('mandal', e.target.value)} placeholder="e.g. Hanamkonda" />
                                    </div>
                                    <div id="field-district" className={`input-group ${getErrorClass('field-district')}`}>
                                        <label>District *</label>
                                        <input type="text" value={locationForm.district} onChange={e => updateLocationForm('district', e.target.value)} placeholder="e.g. Warangal" required />
                                    </div>
                                    <div id="field-state" className={`input-group ${getErrorClass('field-state')}`}>
                                        <label>State *</label>
                                        <input type="text" value={locationForm.state} onChange={e => updateLocationForm('state', e.target.value)} placeholder="e.g. Telangana" required />
                                    </div>
                                    <div className="input-group">
                                        <label>PIN Code *</label>
                                        <input type="text" value={locationForm.pincode} onChange={e => updateLocationForm('pincode', e.target.value)} placeholder="e.g. 506001" required />
                                    </div>
                                </div>

                                <div className="toggle-group" style={{ marginTop: '16px' }}>
                                    <label>Do you offer Home Delivery / Services?</label>
                                    <div className="toggle-switch">
                                        <button type="button" className={homeServices ? 'active' : ''} onClick={() => setHomeServices(true)}>Yes</button>
                                        <button type="button" className={!homeServices ? 'active' : ''} onClick={() => setHomeServices(false)}>No</button>
                                    </div>
                                </div>

                                {homeServices && (
                                    <>
                                        <div className="input-group">
                                            <label>Service Radius (in km) *</label>
                                            <input type="number" value={radius} onChange={e => setRadius(e.target.value)} placeholder="e.g. 10" required />
                                        </div>
                                        <div className="input-group">
                                            <label>Delivery Fee / Service Charge *</label>
                                            <div className="toggle-switch" style={{ marginBottom: '12px' }}>
                                                <button type="button" className={deliveryFeeType === 'free' ? 'active' : ''} onClick={() => { setDeliveryFeeType('free'); setDeliveryFeeAmount(''); }}>Free Delivery</button>
                                                <button type="button" className={deliveryFeeType === 'charge' ? 'active' : ''} onClick={() => setDeliveryFeeType('charge')}>Charge Amount</button>
                                            </div>
                                            {deliveryFeeType === 'charge' && (
                                                <input type="number" value={deliveryFeeAmount} onChange={e => setDeliveryFeeAmount(e.target.value)} placeholder="e.g. 50" required />
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* SECTION 4: Details & Inventory */}
                    <div className={`form-card accordion-card ${isSection4Open ? 'accordion-open-blue' : 'accordion-closed-blue'}`}>
                        <div className="card-header" onClick={() => setIsSection4Open(!isSection4Open)}>
                            <h2 className="card-title" style={{ margin: 0, borderBottom: 'none', paddingBottom: 0 }}>4. Business Information</h2>
                            <span className="accordion-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isSection4Open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                            </span>
                        </div>

                        {isSection4Open && (
                            <div className="card-body" style={{ marginTop: '16px' }}>
                                <div className="input-group">
                                    <label>About Shop / Description *</label>
                                    <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What makes your shop special? Tell customers your story..." rows="3" required></textarea>
                                </div>

                                <div id="field-specialization" className={`input-group ${getErrorClass('field-specialization')}`}>
                                    <label>Business Specialization</label>
                                    <input type="text" value={specialization} onChange={e => setSpecialization(e.target.value)} placeholder="e.g. Organic Seeds, Hardware Expert" />
                                </div>
                                
                                <div className="input-group">
                                    <label>GSTIN / Registration No. (Optional)</label>
                                    <input type="text" value={gstin} onChange={e => setGstin(e.target.value)} placeholder="e.g. 22AAAAA0000A1Z5" />
                                </div>

                                <div className="input-group">
                                    <label>Website or Social Media Link (Optional)</label>
                                    <input type="url" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://www.facebook.com/yourshop" />
                                </div>

                                <div id="field-itemsAvailable" className={`input-group ${getErrorClass('field-itemsAvailable')}`}>
                                    <label>Items / Services Available *</label>
                                    <textarea value={itemsAvailable} onChange={e => setItemsAvailable(e.target.value)} placeholder="List main brands, items, or services (e.g. Tractor repair, Urea bags, PVC Pipes)" rows="5" required></textarea>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* SECTION 5: Operations */}
                    <div className={`form-card accordion-card ${isSection5Open ? 'accordion-open-indigo' : 'accordion-closed-indigo'}`}>
                        <div className="card-header" onClick={() => setIsSection5Open(!isSection5Open)}>
                            <h2 className="card-title" style={{ margin: 0, borderBottom: 'none', paddingBottom: 0 }}>5. Operations & Offers</h2>
                            <span className="accordion-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isSection5Open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                            </span>
                        </div>

                        {isSection5Open && (
                            <div className="card-body" style={{ marginTop: '16px' }}>
                                <div className="grid-2">
                                    <div id="field-openTime" className={`input-group ${getErrorClass('field-openTime')}`}>
                                        <label>Opening Time</label>
                                        <div className="ios-time-picker">
                                            <input type="text" className="ios-time-input" value={openTime} onChange={e => setOpenTime(e.target.value)} placeholder="09:00" required />
                                            <div className="ios-am-pm-toggle">
                                                <button type="button" className={openAmPm === 'AM' ? 'active' : ''} onClick={() => setOpenAmPm('AM')}>AM</button>
                                                <button type="button" className={openAmPm === 'PM' ? 'active' : ''} onClick={() => setOpenAmPm('PM')}>PM</button>
                                            </div>
                                        </div>
                                    </div>
                                    <div id="field-closeTime" className={`input-group ${getErrorClass('field-closeTime')}`}>
                                        <label>Closing Time</label>
                                        <div className="ios-time-picker">
                                            <input type="text" className="ios-time-input" value={closeTime} onChange={e => setCloseTime(e.target.value)} placeholder="08:30" required />
                                            <div className="ios-am-pm-toggle">
                                                <button type="button" className={closeAmPm === 'AM' ? 'active' : ''} onClick={() => setCloseAmPm('AM')}>AM</button>
                                                <button type="button" className={closeAmPm === 'PM' ? 'active' : ''} onClick={() => setCloseAmPm('PM')}>PM</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label>Lunch / Break Time (Optional)</label>
                                    <input type="text" value={breakTime} onChange={e => setBreakTime(e.target.value)} placeholder="e.g. 01:00 PM - 02:00 PM" />
                                </div>

                                <div className="input-group">
                                    <label>Select Weekly Holidays / Closed Days</label>
                                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '6px' }}>
                                        <button type="button" onClick={() => setHolidays([])} style={{ padding: '8px 16px', borderRadius: '20px', border: holidays.length === 0 ? 'none' : '1px solid rgba(0,0,0,0.15)', background: holidays.length === 0 ? '#5E5CE6' : '#fff', color: holidays.length === 0 ? '#fff' : '#1d1d1f', fontWeight: '600', fontSize: '14px', cursor: 'pointer', transition: '0.2s', boxShadow: holidays.length === 0 ? '0 2px 8px rgba(94,92,230,0.3)' : 'none' }}>
                                            No Holidays
                                        </button>
                                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                                            <button key={day} type="button" onClick={() => toggleHoliday(day)} style={{ padding: '8px 16px', borderRadius: '20px', border: holidays.includes(day) ? 'none' : '1px solid rgba(0,0,0,0.15)', background: holidays.includes(day) ? '#5E5CE6' : '#fff', color: holidays.includes(day) ? '#fff' : '#1d1d1f', fontWeight: '600', fontSize: '14px', cursor: 'pointer', transition: '0.2s', boxShadow: holidays.includes(day) ? '0 2px 8px rgba(94,92,230,0.3)' : 'none' }}>
                                                {day.substring(0, 3)}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="help-text" style={{ marginTop: '8px', color: '#5E5CE6', fontWeight: '600' }}>⚠️ Only select the days your shop is CLOSED.</p>
                                </div>

                                <div id="field-payments" className={`input-group ${getErrorClass('field-payments')}`}>
                                    <label>Accepted Payment Methods</label>
                                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '6px' }}>
                                        {['Cash', 'UPI / QR Code', 'Credit/Debit Cards', 'Bank Transfer'].map(method => (
                                            <button key={method} type="button" onClick={() => togglePayment(method)} style={{ padding: '8px 16px', borderRadius: '20px', border: payments.includes(method) ? 'none' : '1px solid rgba(0,0,0,0.15)', background: payments.includes(method) ? '#1d1d1f' : '#fff', color: payments.includes(method) ? '#fff' : '#1d1d1f', fontWeight: '600', fontSize: '14px', cursor: 'pointer', transition: '0.2s', boxShadow: payments.includes(method) ? '0 2px 8px rgba(0,0,0,0.2)' : 'none' }}>
                                                {method}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="offer-section" style={{ background: 'linear-gradient(135deg, #5E5CE6 0%, #8C8BEB 100%)', padding: '24px', borderRadius: '18px', marginTop: '20px', boxShadow: '0 8px 24px rgba(94,92,230,0.25)', position: 'relative', overflow: 'hidden' }}>
                                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
                                    <div style={{ position: 'absolute', bottom: '-40px', left: '10%', width: '150px', height: '150px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
                                    
                                    <div style={{ position: 'relative', zIndex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                            <div style={{ background: '#fff', color: '#5E5CE6', width: '38px', height: '38px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                                                <Sparkles size={20} />
                                            </div>
                                            <div>
                                                <label style={{ color: '#fff', fontSize: '18px', fontWeight: '800', margin: 0, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Daily Super Deal</label>
                                                <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px', margin: '2px 0 0 0', fontWeight: '500' }}>Attract more footfall with a today-only offer!</p>
                                            </div>
                                        </div>
                                        
                                        <textarea value={offerDesc} onChange={e => setOfferDesc(e.target.value)} placeholder="e.g. 🔥 Get 10% OFF on all purchases today!" rows="2" style={{ width: '100%', padding: '16px 20px', borderRadius: '12px', border: 'none', fontSize: '17px', fontWeight: '600', color: '#1d1d1f', background: '#ffffff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', outline: 'none', boxSizing: 'border-box', resize: 'vertical', minHeight: '80px' }}></textarea>
                                        
                                        <div style={{ marginTop: '16px' }}>
                                            {!offerImage ? (
                                                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: 'rgba(255,255,255,0.2)', color: '#fff', borderRadius: '24px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', border: '1px dashed rgba(255,255,255,0.5)', transition: '0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                                                    <Camera size={18} /> Add Promo Image (Optional)
                                                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleOfferImageUpload} />
                                                </label>
                                            ) : (
                                                <div style={{ position: 'relative', display: 'inline-block' }}>
                                                    <img src={offerImage} alt="Offer Promo" style={{ height: '120px', borderRadius: '12px', border: '3px solid #fff', objectFit: 'cover', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }} />
                                                    <button type="button" onClick={() => setOfferImage(null)} style={{ position: 'absolute', top: '-10px', right: '-10px', background: '#1d1d1f', color: '#fff', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}>
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* SECTION 6: Social & Amenities */}
                    <div className={`form-card accordion-card ${isSection6Open ? 'accordion-open-cyan' : 'accordion-closed-cyan'}`}>
                        <div className="card-header" onClick={() => setIsSection6Open(!isSection6Open)}>
                            <h2 className="card-title" style={{ margin: 0, borderBottom: 'none', paddingBottom: 0 }}>6. Social & Amenities (Optional)</h2>
                            <span className="accordion-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isSection6Open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                            </span>
                        </div>

                        {isSection6Open && (
                            <div className="card-body" style={{ marginTop: '16px' }}>
                                <div className="grid-2">
                                    <div className="input-group">
                                        <label>Customer WhatsApp Number</label>
                                        <input type="tel" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="+91 xxxxx xxxxx" />
                                    </div>
                                    <div className="input-group">
                                        <label>Instagram / Facebook Link</label>
                                        <input type="url" value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="https://instagram.com/yourshop" />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label>Website Link (Optional)</label>
                                    <input type="url" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://www.yourwebsite.com" />
                                </div>

                                <div className="input-group">
                                    <label>Shop Amenities & Facilities</label>
                                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '6px' }}>
                                        {['🚗 Parking Available', '❄️ Air Conditioned', '🛜 Free Wi-Fi', '♿ Wheelchair Accessible', '🚻 Washroom', '🛵 Home Delivery'].map(amenity => (
                                            <button key={amenity} type="button" onClick={() => toggleAmenity(amenity)} style={{ padding: '8px 16px', borderRadius: '20px', border: amenities.includes(amenity) ? 'none' : '1px solid rgba(0,0,0,0.15)', background: amenities.includes(amenity) ? '#00C7BE' : '#fff', color: amenities.includes(amenity) ? '#fff' : '#1d1d1f', fontWeight: '600', fontSize: '14px', cursor: 'pointer', transition: '0.2s', boxShadow: amenities.includes(amenity) ? '0 2px 8px rgba(0,199,190,0.3)' : 'none' }}>
                                                {amenity}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="help-text" style={{ marginTop: '8px' }}>Highlighting these features attracts more customers to visit.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* SECTION 7: Media Uploads */}
                    <div className={`form-card accordion-card ${isSection7Open ? 'accordion-open-aesthetic' : 'accordion-closed-aesthetic'}`}>
                        <div className="card-header" onClick={() => setIsSection7Open(!isSection7Open)}>
                            <h2 className="card-title" style={{ margin: 0, borderBottom: 'none', paddingBottom: 0, background: 'linear-gradient(45deg, #8A2387, #E94057, #F27121)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>7. Photos & Video</h2>
                            <span className="accordion-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isSection7Open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                            </span>
                        </div>

                        {isSection7Open && (
                            <div className="card-body" style={{ marginTop: '16px' }}>
                                <div style={{ background: '#fff0f5', border: '1px dashed #ff2d55', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                                    <h4 style={{ margin: '0 0 8px 0', color: '#d01c3e', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <ShieldCheck size={18} /> Content Safety & Optimization
                                    </h4>
                                    <ul style={{ margin: 0, paddingLeft: '20px', color: '#1d1d1f', fontSize: '13px', lineHeight: '1.6' }}>
                                        <li><strong>Strictly No Vulgarity:</strong> All images and videos are monitored. Uploading inappropriate content will result in an immediate permanent ban.</li>
                                        <li><strong>Auto-Optimization:</strong> Maximum 10MB per image, 50MB for video. Don't worry about dimensions—our Cloudinary system automatically compresses and resizes them for lightning-fast loading!</li>
                                        <li><strong>High Quality:</strong> Clear, well-lit photos attract up to 40% more customers.</li>
                                    </ul>
                                </div>
                                
                                <div className="media-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
                                    {[
                                        { id: 'field-shopFront', title: 'Shop Front Photo', icon: <Camera size={24} />, bg: 'linear-gradient(135deg, #E2B0FF, #9F44D3)', state: shopFront, setter: setShopFront, accept: 'image/*' },
                                        { id: 'field-insideView', title: 'Inside View Photo', icon: <Camera size={24} />, bg: 'linear-gradient(135deg, #FF9A9E, #FECFEF)', state: insideView, setter: setInsideView, accept: 'image/*' },
                                        { title: 'Products Photo', icon: <Camera size={24} />, bg: 'linear-gradient(135deg, #a18cd1, #fbc2eb)', state: productsPhoto, setter: setProductsPhoto, accept: 'image/*' },
                                        { title: 'Menu / Catalogue', icon: <Camera size={24} />, bg: 'linear-gradient(135deg, #f6d365, #fda085)', state: menuPhoto, setter: setMenuPhoto, accept: 'image/*' },
                                        { title: '1 Short Video (Max 30s)', icon: <Video size={24} />, bg: 'linear-gradient(135deg, #84fab0, #8fd3f4)', state: shopVideo, setter: setShopVideo, accept: 'video/*' }
                                    ].map((item, i) => (
                                        item.state ? (
                                            <div id={item.id} key={i} className={getErrorClass(item.id)} style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', height: '140px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                                                {item.accept === 'video/*' ? (
                                                    <video src={item.state} style={{ width: '100%', height: '100%', objectFit: 'cover' }} autoPlay muted loop />
                                                ) : (
                                                    <img src={item.state} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                )}
                                                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '6px', fontSize: '11px', fontWeight: '600', textAlign: 'center', backdropFilter: 'blur(4px)' }}>
                                                    {item.title}
                                                </div>
                                                <button type="button" onClick={() => item.setter(null)} style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(4px)' }}>
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ) : (
                                            <label id={item.id} key={i} className={`aesthetic-upload-box ${getErrorClass(item.id)}`} style={{ background: '#fafafa', border: '1.5px dashed rgba(0,0,0,0.15)', borderRadius: '20px', padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', cursor: 'pointer', transition: 'all 0.3s', position: 'relative', overflow: 'hidden', height: '140px', boxSizing: 'border-box' }}>
                                                <div style={{ background: item.bg, width: '48px', height: '48px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                                                    {item.icon}
                                                </div>
                                                <span style={{ fontSize: '13px', fontWeight: '700', color: '#1d1d1f', textAlign: 'center' }}>{item.title}</span>
                                                <input type="file" accept={item.accept} style={{ display: 'none' }} onChange={(e) => { if(e.target.files[0]) item.setter(URL.createObjectURL(e.target.files[0])) }} />
                                            </label>
                                        )
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="submit-section">
                        <button type="button" className="submit-btn" onClick={handleSubmit}>Publish Marketing Listing</button>
                    </div>

                </form>
            </div>

            <style>{`
                .loading-screen {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                    color: #86868b;
                }
                
                .form-container {
                    background-color: #f5f5f7;
                    min-height: 100vh;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                    padding-bottom: 80px;
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    width: 100vw;
                    height: 100dvh;
                    overflow-y: auto;
                    box-sizing: border-box;
                    z-index: 40;
                }

                .header {
                    position: sticky;
                    top: 0;
                    border-radius: 0 0 24px 24px;
                    background: rgba(0, 113, 227, 0.9);
                    backdrop-filter: blur(20px) saturate(180%);
                    -webkit-backdrop-filter: blur(20px) saturate(180%);
                    padding: 16px 20px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    z-index: 50;
                    box-shadow: 0 8px 24px rgba(0, 113, 227, 0.25);
                }

                .back-btn {
                    background: rgba(255, 255, 255, 0.2);
                    border: none;
                    border-radius: 50%;
                    padding: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: background 0.2s;
                }

                .back-btn:hover { 
                    background: rgba(255, 255, 255, 0.3);
                }

                .header-title {
                    margin: 0;
                    font-size: 17px;
                    font-weight: 600;
                    color: #ffffff;
                }

                .header-subtitle {
                    margin: 2px 0 0 0;
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.8);
                    font-weight: 400;
                }

                .form-content {
                    padding: 32px 3%;
                    max-width: 1520px;
                    margin: 0 auto;
                }

                .form-card {
                    background: #ffffff;
                    border-radius: 18px;
                    padding: 16px;
                    margin-bottom: 24px;
                    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
                }

                .accordion-card {
                    padding: 0;
                    transition: all 0.3s ease;
                }

                .accordion-closed {
                    border: none;
                    border-left: 4px solid rgba(175, 82, 222, 0.4);
                    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
                }

                .accordion-open {
                    border: none;
                    border-left: 6px solid #af52de;
                    box-shadow: 0 6px 24px rgba(175, 82, 222, 0.15);
                }

                .accordion-closed-orange {
                    border: none;
                    border-left: 4px solid rgba(255, 149, 0, 0.4);
                    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
                }

                .accordion-open-orange {
                    border: none;
                    border-left: 6px solid #ff9500;
                    box-shadow: 0 6px 24px rgba(255, 149, 0, 0.15);
                }

                .accordion-closed-green {
                    border: none;
                    border-left: 4px solid rgba(52, 199, 89, 0.4);
                    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
                }

                .accordion-open-green {
                    border: none;
                    border-left: 6px solid #34c759;
                    box-shadow: 0 6px 24px rgba(52, 199, 89, 0.15);
                }

                .accordion-closed-blue {
                    border: none;
                    border-left: 4px solid rgba(0, 122, 255, 0.4);
                    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
                }

                .accordion-open-blue {
                    border: none;
                    border-left: 6px solid #007aff;
                    box-shadow: 0 6px 24px rgba(0, 122, 255, 0.15);
                }

                .accordion-closed-indigo {
                    border: none;
                    border-left: 4px solid rgba(94, 92, 230, 0.4);
                    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
                }

                .accordion-open-indigo {
                    border: none;
                    border-left: 6px solid #5E5CE6;
                    box-shadow: 0 6px 24px rgba(94, 92, 230, 0.15);
                }

                .accordion-closed-cyan {
                    border: none;
                    border-left: 4px solid rgba(0, 199, 190, 0.4);
                    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
                }

                .accordion-open-cyan {
                    border: none;
                    border-left: 6px solid #00C7BE;
                    box-shadow: 0 6px 24px rgba(0, 199, 190, 0.15);
                }

                .accordion-closed-aesthetic {
                    position: relative;
                    border: none;
                    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
                }
                .accordion-closed-aesthetic::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; bottom: 0; width: 4px;
                    background: linear-gradient(180deg, #8A2387, #E94057, #F27121);
                    border-top-left-radius: 18px;
                    border-bottom-left-radius: 18px;
                }

                .accordion-open-aesthetic {
                    position: relative;
                    border: none;
                    box-shadow: 0 6px 24px rgba(233, 64, 87, 0.15);
                }
                .accordion-open-aesthetic::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; bottom: 0; width: 6px;
                    background: linear-gradient(180deg, #8A2387, #E94057, #F27121);
                    border-top-left-radius: 18px;
                    border-bottom-left-radius: 18px;
                }
                
                .aesthetic-upload-box:hover {
                    border-color: #E94057 !important;
                    background: #ffffff !important;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.06);
                    transform: translateY(-3px);
                }

                .card-header {
                    padding: 16px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    cursor: pointer;
                    transition: background 0.2s;
                    border-radius: 18px;
                }
                
                .card-header:hover {
                    background: #fafafa;
                }

                .card-body {
                    padding: 0 16px 16px 16px;
                    border-top: 0.5px solid rgba(0, 0, 0, 0.05);
                    animation: slideDown 0.3s ease-out forwards;
                }
                
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .accordion-icon {
                    color: #86868b;
                    display: flex;
                    align-items: center;
                }

                .logo-upload-box {
                    background: #fafafa;
                    border: 0.5px dashed rgba(0,0,0,0.2);
                    border-radius: 12px;
                    height: 80px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    color: #86868b;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .logo-upload-box:hover {
                    background: #fdf5ff;
                    border-color: #af52de;
                    color: #af52de;
                }
                
                .logo-upload-box span {
                    font-size: 12px;
                    font-weight: 500;
                }

                .card-title {
                    margin: 0 0 20px 0;
                    font-size: 19px;
                    font-weight: 600;
                    color: #1d1d1f;
                    border-bottom: 0.5px solid rgba(0, 0, 0, 0.1);
                    padding-bottom: 12px;
                }

                .seller-id-card {
                    background: #ffffff;
                    border: 2px solid #0071e3;
                    border-radius: 18px;
                    padding: 20px 24px;
                    margin-bottom: 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    box-shadow: 0 4px 20px rgba(0, 113, 227, 0.2);
                }

                .seller-id-info {
                    display: flex;
                    flex-direction: column;
                }

                .seller-id-label {
                    font-size: 12px;
                    font-weight: 600;
                    color: #86868b;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 6px;
                }

                .seller-id-value {
                    font-size: 19px;
                    font-weight: 700;
                    color: #0071e3;
                    letter-spacing: 1.5px;
                    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
                }

                .input-group {
                    margin-bottom: 18px;
                }

                .input-group label {
                    display: block;
                    font-size: 13px;
                    font-weight: 500;
                    color: #1d1d1f;
                    margin-bottom: 8px;
                }

                .input-group input, .input-group select, .input-group textarea {
                    width: 100%;
                    padding: 14px 16px;
                    border-radius: 12px;
                    border: 0.5px solid rgba(0,0,0,0.15);
                    font-size: 17px;
                    color: #1d1d1f;
                    background: #fafafa;
                    box-sizing: border-box;
                    font-family: inherit;
                    transition: all 0.2s;
                }
                
                .input-group input[type=number]::-webkit-outer-spin-button,
                .input-group input[type=number]::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }

                .input-group input[type=number] {
                    -moz-appearance: textfield;
                }

                .input-group input:focus, .input-group select:focus, .input-group textarea:focus {
                    outline: none;
                    border-color: #0071e3;
                    background: #fff;
                    box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.2);
                }

                .ios-time-picker {
                    display: flex;
                    align-items: center;
                    background: #fafafa;
                    border: 0.5px solid rgba(0,0,0,0.15);
                    border-radius: 12px;
                    padding: 4px 6px;
                    transition: all 0.2s;
                }

                .ios-time-picker:focus-within {
                    border-color: #0071e3;
                    background: #fff;
                    box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.2);
                }

                .input-group .ios-time-input {
                    border: none !important;
                    background: transparent !important;
                    box-shadow: none !important;
                    padding: 10px 12px !important;
                    flex: 1;
                    width: 100%;
                }

                .ios-am-pm-toggle {
                    display: flex;
                    background: rgba(0,0,0,0.06);
                    border-radius: 6px;
                    padding: 2px;
                }

                .ios-am-pm-toggle button {
                    background: transparent;
                    color: #86868b;
                    border: none;
                    border-radius: 4px;
                    padding: 4px 8px;
                    font-size: 11px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .ios-am-pm-toggle button.active {
                    background: #ffffff;
                    color: #1d1d1f;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.08);
                }

                .grid-2 {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 24px;
                }

                .partners-section {
                    background: #fafafa;
                    padding: 16px;
                    border-radius: 12px;
                    border: 0.5px solid rgba(0,0,0,0.1);
                    margin-top: 16px;
                }

                .partners-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                }

                .partners-header label {
                    font-size: 13px;
                    font-weight: 500;
                    color: #1d1d1f;
                    margin: 0;
                }

                .add-btn {
                    background: rgba(0, 113, 227, 0.1);
                    color: #0071e3;
                    border: none;
                    padding: 6px 14px;
                    border-radius: 14px;
                    font-size: 13px;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .add-btn:hover {
                    background: rgba(0, 113, 227, 0.15);
                }

                .partner-row {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    margin-bottom: 16px;
                    padding-bottom: 16px;
                    border-bottom: 1px solid rgba(0,0,0,0.05);
                }

                .partner-row:last-child {
                    border-bottom: none;
                    margin-bottom: 0;
                    padding-bottom: 0;
                }

                .partner-row input {
                    width: 100%;
                    box-sizing: border-box;
                    padding: 14px 16px;
                    border-radius: 12px;
                    border: 0.5px solid rgba(0,0,0,0.15);
                    font-size: 17px;
                    color: #1d1d1f;
                    background: #fff;
                    font-family: inherit;
                }
                
                .partner-row input:focus {
                    outline: none;
                    border-color: #0071e3;
                    box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.2);
                }

                .del-btn {
                    align-self: flex-start;
                    background: #fef0f0;
                    color: #ff3b30;
                    border: none;
                    border-radius: 10px;
                    padding: 10px 16px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .del-btn:hover {
                    background: #ffe5e5;
                }

                .location-picker {
                    background: #f5f5f7;
                    border: 0.5px solid rgba(0,0,0,0.1);
                    padding: 12px;
                    border-radius: 10px;
                    margin-bottom: 16px;
                }

                .loc-status {
                    margin-bottom: 12px;
                    font-size: 13px;
                    font-weight: 600;
                }

                .loc-success { color: #34c759; display: flex; align-items: center; gap: 6px; }
                .loc-warning { color: #ff9f0a; display: flex; align-items: center; gap: 6px; }

                .fetch-loc-btn {
                    width: 100%;
                    padding: 10px;
                    background: #0071e3;
                    color: #fff;
                    border: none;
                    border-radius: 8px;
                    font-weight: 500;
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                
                .fetch-loc-btn:disabled { opacity: 0.7; cursor: wait; }
                .fetch-loc-btn:hover:not(:disabled) { 
                    background: #0077ed;
                }

                .help-text {
                    font-size: 12px;
                    color: #86868b;
                    margin: 8px 0 0 0;
                    line-height: 1.4;
                }

                .toggle-group {
                    margin-bottom: 20px;
                }

                .toggle-group label {
                    display: block;
                    font-size: 13px;
                    font-weight: 500;
                    color: #1d1d1f;
                    margin-bottom: 12px;
                }

                .toggle-switch {
                    display: flex;
                    background: #e5e5ea;
                    padding: 2px;
                    border-radius: 10px;
                }

                .toggle-switch button {
                    flex: 1;
                    padding: 8px;
                    border: none;
                    background: transparent;
                    border-radius: 8px;
                    font-weight: 500;
                    font-size: 13px;
                    color: #1d1d1f;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .toggle-switch button.active {
                    background: #fff;
                    box-shadow: 0 3px 8px rgba(0,0,0,0.12), 0 3px 1px rgba(0,0,0,0.04);
                }

                .offer-section {
                    background: #fdfaf5;
                    border: 0.5px solid #f6d194;
                    padding: 16px;
                    border-radius: 14px;
                }

                .media-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                }

                .media-upload-box {
                    background: #fafafa;
                    border: 0.5px dashed rgba(0,0,0,0.2);
                    border-radius: 14px;
                    height: 120px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    color: #86868b;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .media-upload-box:hover {
                    background: #f0f0f2;
                    border-color: #0071e3;
                    color: #0071e3;
                }

                .media-upload-box span {
                    font-size: 13px;
                    font-weight: 500;
                    text-align: center;
                    padding: 0 10px;
                }

                .video-box {
                    border-color: rgba(255, 45, 85, 0.3);
                    color: #ff2d55;
                    background: #fffafa;
                }
                .video-box:hover { 
                    border-color: #ff2d55;
                    color: #ff2d55; 
                    background: #fff0f2; 
                }

                .submit-section {
                    margin-top: 32px;
                }

                .submit-btn {
                    width: 100%;
                    padding: 18px;
                    background: linear-gradient(135deg, #ff2d55 0%, #af52de 100%);
                    color: #fff;
                    border: none;
                    border-radius: 16px;
                    font-size: 18px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 8px 24px rgba(175, 82, 222, 0.3);
                }

                .submit-btn:active {
                    transform: translateY(0);
                    box-shadow: 0 4px 12px rgba(0, 113, 227, 0.3);
                }

                .error-glow input, .error-glow select, .error-glow textarea, .error-glow .ios-time-picker, .error-glow.aesthetic-upload-box, .error-glow.map-container, .error-glow .pill-group {
                    border: 1.5px solid #ff2d55 !important;
                    box-shadow: 0 0 0 4px rgba(255, 45, 85, 0.15) !important;
                    border-radius: 12px;
                }
                .error-glow.aesthetic-upload-box, .error-glow.map-container {
                    border-radius: 20px;
                }

                /* Mobile Optimization */
            `}</style>
        </div>
    );
}
