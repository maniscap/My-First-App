import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { ArrowLeft, MapPin, Plus, Trash2, Camera, Video, AlertCircle, CheckCircle, ShieldCheck } from 'lucide-react';
import LockedListingScreen from '../../🛠️Shared_Components/LockedListingScreen';

export default function SellerMarketing_Form() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [appStatus, setAppStatus] = useState('loading');
    const [sellerId, setSellerId] = useState('');

    // Section 1: Basic Identity
    const [shopName, setShopName] = useState('');
    const [category, setCategory] = useState('');
    const [customCategory, setCustomCategory] = useState('');

    // Section 2: Owner & Partners
    const [ownerName, setOwnerName] = useState('');
    const [phone, setPhone] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [partners, setPartners] = useState([]); // { name: '', contact: '' }

    // Section 3: Location
    const [address, setAddress] = useState('');
    const [coordinates, setCoordinates] = useState({ lat: null, lng: null });
    const [homeServices, setHomeServices] = useState(false);
    const [radius, setRadius] = useState('');
    const [isFetchingLocation, setIsFetchingLocation] = useState(false);

    // Section 4: Details & Inventory
    const [description, setDescription] = useState('');
    const [itemsAvailable, setItemsAvailable] = useState('');

    // Section 5: Operations & Offers
    const [openTime, setOpenTime] = useState('');
    const [closeTime, setCloseTime] = useState('');
    const [holidays, setHolidays] = useState('');
    const [offerDesc, setOfferDesc] = useState('');

    // Predefined Categories
    const categories = ['Pesticides & Fertilizers', 'Hardware & Tools', 'Hospital / Clinic', 'Function Hall', 'Restaurant / Cafe', 'Retail Shop', 'Other'];

    // Auth Check
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (!currentUser) {
                setAppStatus('none');
                return;
            }
            setUser(currentUser);
            try {
                let appId = localStorage.getItem('seller_app_id');
                if (appId) {
                    setSellerId(appId);
                    const docRef = doc(db, 'seller_applications', appId);
                    const unsubSnapshot = onSnapshot(docRef, (docSnap) => {
                        if (docSnap.exists()) setAppStatus(docSnap.data().status);
                    });
                    return () => unsubSnapshot();
                }
            } catch (error) {
                setAppStatus('error');
            }
        });
        return () => unsubscribe();
    }, []);

    const fetchLocation = () => {
        setIsFetchingLocation(true);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCoordinates({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                    setIsFetchingLocation(false);
                },
                (error) => {
                    alert("Could not fetch location. Please enable location services.");
                    setIsFetchingLocation(false);
                }
            );
        } else {
            alert("Geolocation is not supported by your browser");
            setIsFetchingLocation(false);
        }
    };

    const addPartner = () => {
        if (partners.length < 3) {
            setPartners([...partners, { name: '', contact: '' }]);
        } else {
            alert("Maximum 3 partners allowed");
        }
    };

    const updatePartner = (index, field, value) => {
        const newPartners = [...partners];
        newPartners[index][field] = value;
        setPartners(newPartners);
    };

    const removePartner = (index) => {
        const newPartners = partners.filter((_, i) => i !== index);
        setPartners(newPartners);
    };

    if (appStatus === 'loading') {
        return <div className="loading-screen">Loading...</div>;
    }

    if (appStatus !== 'approved') {
        return <LockedListingScreen />;
    }

    return (
        <div className="form-container">
            {/* Header */}
            <div className="header">
                <button onClick={() => navigate(-1)} className="back-btn">
                    <ArrowLeft size={24} color="#1e293b" />
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

                <form className="marketing-form">
                    
                    {/* SECTION 1: Basic Identity */}
                    <div className="form-card">
                        <h2 className="card-title">1. Business Identity</h2>
                        
                        <div className="input-group">
                            <label>Shop / Organization Name *</label>
                            <input type="text" value={shopName} onChange={e => setShopName(e.target.value)} placeholder="e.g. Raju Pesticides" required />
                        </div>

                        <div className="input-group">
                            <label>Business Category *</label>
                            <select value={category} onChange={e => setCategory(e.target.value)} required>
                                <option value="">Select a category</option>
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>

                        {category === 'Other' && (
                            <div className="input-group">
                                <label>Custom Category Name *</label>
                                <input type="text" value={customCategory} onChange={e => setCustomCategory(e.target.value)} placeholder="Type your category" required />
                            </div>
                        )}
                    </div>

                    {/* SECTION 2: Owner Details */}
                    <div className="form-card">
                        <h2 className="card-title">2. Contact Details</h2>
                        
                        <div className="input-group">
                            <label>Owner Name *</label>
                            <input type="text" value={ownerName} onChange={e => setOwnerName(e.target.value)} placeholder="Full Name" required />
                        </div>

                        <div className="grid-2">
                            <div className="input-group">
                                <label>Calling Number *</label>
                                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91" required />
                            </div>
                            <div className="input-group">
                                <label>WhatsApp Number *</label>
                                <input type="tel" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="+91" required />
                            </div>
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
                                        placeholder="Contact" 
                                        value={partner.contact}
                                        onChange={e => updatePartner(index, 'contact', e.target.value)}
                                    />
                                    <button type="button" onClick={() => removePartner(index)} className="del-btn">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* SECTION 3: Location */}
                    <div className="form-card">
                        <h2 className="card-title">3. Location & Delivery</h2>
                        
                        <div className="input-group">
                            <label>Full Address *</label>
                            <textarea value={address} onChange={e => setAddress(e.target.value)} placeholder="Shop number, Street, Landmark, Town" rows="2" required></textarea>
                        </div>

                        <div className="location-picker">
                            <div className="loc-status">
                                {coordinates.lat ? (
                                    <span className="loc-success"><CheckCircle size={18} /> GPS Location Secured</span>
                                ) : (
                                    <span className="loc-warning"><AlertCircle size={18} /> GPS Location Required</span>
                                )}
                            </div>
                            <button type="button" onClick={fetchLocation} disabled={isFetchingLocation} className="fetch-loc-btn">
                                <MapPin size={18} /> {isFetchingLocation ? 'Fetching...' : coordinates.lat ? 'Update Location' : 'Get Current Location'}
                            </button>
                            <p className="help-text">Please stand outside your shop to get an accurate pin for customers.</p>
                        </div>

                        <div className="toggle-group">
                            <label>Do you offer Home Delivery / Services?</label>
                            <div className="toggle-switch">
                                <button type="button" className={homeServices ? 'active' : ''} onClick={() => setHomeServices(true)}>Yes</button>
                                <button type="button" className={!homeServices ? 'active' : ''} onClick={() => setHomeServices(false)}>No</button>
                            </div>
                        </div>

                        {homeServices && (
                            <div className="input-group">
                                <label>Service Radius (in km) *</label>
                                <input type="number" value={radius} onChange={e => setRadius(e.target.value)} placeholder="e.g. 10" required />
                            </div>
                        )}
                    </div>

                    {/* SECTION 4: Details & Inventory */}
                    <div className="form-card">
                        <h2 className="card-title">4. Business Information</h2>
                        
                        <div className="input-group">
                            <label>About Shop / Description *</label>
                            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What makes your shop special?" rows="3" required></textarea>
                        </div>

                        <div className="input-group">
                            <label>Items / Services Available *</label>
                            <textarea value={itemsAvailable} onChange={e => setItemsAvailable(e.target.value)} placeholder="List main brands, items, or services (e.g. Tractor repair, Urea bags, PVC Pipes)" rows="4" required></textarea>
                        </div>
                    </div>

                    {/* SECTION 5: Operations */}
                    <div className="form-card">
                        <h2 className="card-title">5. Operations & Offers</h2>
                        
                        <div className="grid-2">
                            <div className="input-group">
                                <label>Opening Time</label>
                                <input type="time" value={openTime} onChange={e => setOpenTime(e.target.value)} required />
                            </div>
                            <div className="input-group">
                                <label>Closing Time</label>
                                <input type="time" value={closeTime} onChange={e => setCloseTime(e.target.value)} required />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Weekly Holiday</label>
                            <input type="text" value={holidays} onChange={e => setHolidays(e.target.value)} placeholder="e.g. Sunday (or leave blank if open everyday)" />
                        </div>

                        <div className="offer-section">
                            <label>Today's Special Offer (Optional)</label>
                            <input type="text" value={offerDesc} onChange={e => setOfferDesc(e.target.value)} placeholder="e.g. 10% off on all seeds today!" />
                            <p className="help-text">You can update this daily from your dashboard.</p>
                        </div>
                    </div>

                    {/* SECTION 6: Media Uploads */}
                    <div className="form-card media-card">
                        <h2 className="card-title">6. Photos & Video</h2>
                        <p className="help-text">High quality photos attract more customers!</p>
                        
                        <div className="media-grid">
                            <div className="media-upload-box">
                                <Camera size={28} />
                                <span>Shop Front Photo</span>
                            </div>
                            <div className="media-upload-box">
                                <Camera size={28} />
                                <span>Inside View Photo</span>
                            </div>
                            <div className="media-upload-box">
                                <Camera size={28} />
                                <span>Products Photo</span>
                            </div>
                            <div className="media-upload-box video-box">
                                <Video size={28} />
                                <span>1 Short Video (Max 30s)</span>
                            </div>
                        </div>
                    </div>

                    <div className="submit-section">
                        <button type="button" className="submit-btn">Continue to Publish</button>
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
                    color: #64748b;
                }
                
                .form-container {
                    background-color: #f1f5f9;
                    min-height: 100vh;
                    font-family: 'Inter', system-ui, sans-serif;
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
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(10px);
                    padding: 16px 20px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    z-index: 50;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.03);
                    border-bottom: 1px solid #e2e8f0;
                }

                .back-btn {
                    background: #f1f5f9;
                    border: none;
                    border-radius: 12px;
                    padding: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .back-btn:hover { background: #e2e8f0; }

                .header-title {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 800;
                    color: #0f172a;
                }

                .header-subtitle {
                    margin: 2px 0 0 0;
                    font-size: 13px;
                    color: #10b981;
                    font-weight: 600;
                }

                .form-content {
                    padding: 20px;
                    max-width: 600px;
                    margin: 0 auto;
                }

                .form-card {
                    background: #ffffff;
                    border-radius: 20px;
                    padding: 24px;
                    margin-bottom: 20px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.03);
                    border: 1px solid #f1f5f9;
                }

                .card-title {
                    margin: 0 0 20px 0;
                    font-size: 16px;
                    font-weight: 800;
                    color: #334155;
                    border-bottom: 2px solid #f1f5f9;
                    padding-bottom: 12px;
                }

                .seller-id-card {
                    background: #f0fdf4;
                    border: 1px solid #bbf7d0;
                    border-radius: 16px;
                    padding: 16px 20px;
                    margin-bottom: 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    box-shadow: 0 4px 15px rgba(22, 163, 74, 0.05);
                }

                .seller-id-info {
                    display: flex;
                    flex-direction: column;
                }

                .seller-id-label {
                    font-size: 12px;
                    font-weight: 700;
                    color: #16a34a;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 4px;
                }

                .seller-id-value {
                    font-size: 18px;
                    font-weight: 800;
                    color: #14532d;
                    font-family: monospace;
                }

                .input-group {
                    margin-bottom: 16px;
                }

                .input-group label {
                    display: block;
                    font-size: 13px;
                    font-weight: 700;
                    color: #475569;
                    margin-bottom: 8px;
                }

                .input-group input, .input-group select, .input-group textarea {
                    width: 100%;
                    padding: 14px 16px;
                    border-radius: 12px;
                    border: 1px solid #cbd5e1;
                    font-size: 15px;
                    color: #0f172a;
                    background: #f8fafc;
                    box-sizing: border-box;
                    font-family: inherit;
                    transition: all 0.2s;
                }

                .input-group input:focus, .input-group select:focus, .input-group textarea:focus {
                    outline: none;
                    border-color: #3b82f6;
                    background: #fff;
                    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
                }

                .grid-2 {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                }

                .partners-section {
                    background: #f8fafc;
                    padding: 16px;
                    border-radius: 12px;
                    border: 1px dashed #cbd5e1;
                    margin-top: 16px;
                }

                .partners-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                }

                .partners-header label {
                    font-size: 13px;
                    font-weight: 700;
                    color: #475569;
                    margin: 0;
                }

                .add-btn {
                    background: #e0e7ff;
                    color: #4f46e5;
                    border: none;
                    padding: 6px 12px;
                    border-radius: 8px;
                    font-size: 12px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    cursor: pointer;
                }

                .partner-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr auto;
                    gap: 8px;
                    margin-bottom: 8px;
                }

                .partner-row input {
                    padding: 10px;
                    border-radius: 8px;
                    border: 1px solid #cbd5e1;
                    font-size: 13px;
                }

                .del-btn {
                    background: #fee2e2;
                    color: #ef4444;
                    border: none;
                    border-radius: 8px;
                    width: 38px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                }

                .location-picker {
                    background: #f0fdfa;
                    border: 1px solid #ccfbf1;
                    padding: 16px;
                    border-radius: 12px;
                    margin-bottom: 16px;
                }

                .loc-status {
                    margin-bottom: 12px;
                    font-size: 14px;
                    font-weight: 600;
                }

                .loc-success { color: #10b981; display: flex; align-items: center; gap: 6px; }
                .loc-warning { color: #f59e0b; display: flex; align-items: center; gap: 6px; }

                .fetch-loc-btn {
                    width: 100%;
                    padding: 14px;
                    background: #0f766e;
                    color: #fff;
                    border: none;
                    border-radius: 10px;
                    font-weight: 700;
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .fetch-loc-btn:disabled { opacity: 0.7; cursor: wait; }
                .fetch-loc-btn:hover:not(:disabled) { background: #115e59; }

                .help-text {
                    font-size: 12px;
                    color: #64748b;
                    margin: 8px 0 0 0;
                }

                .toggle-group {
                    margin-bottom: 16px;
                }

                .toggle-group label {
                    display: block;
                    font-size: 13px;
                    font-weight: 700;
                    color: #475569;
                    margin-bottom: 8px;
                }

                .toggle-switch {
                    display: flex;
                    background: #f1f5f9;
                    padding: 4px;
                    border-radius: 12px;
                }

                .toggle-switch button {
                    flex: 1;
                    padding: 10px;
                    border: none;
                    background: transparent;
                    border-radius: 8px;
                    font-weight: 700;
                    color: #64748b;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .toggle-switch button.active {
                    background: #fff;
                    color: #0f172a;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                }

                .offer-section {
                    background: #fff7ed;
                    border: 1px dashed #fdba74;
                    padding: 16px;
                    border-radius: 12px;
                }

                .media-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                }

                .media-upload-box {
                    background: #f8fafc;
                    border: 2px dashed #cbd5e1;
                    border-radius: 16px;
                    height: 120px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    color: #64748b;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .media-upload-box:hover {
                    background: #f1f5f9;
                    border-color: #3b82f6;
                    color: #3b82f6;
                }

                .media-upload-box span {
                    font-size: 12px;
                    font-weight: 600;
                    text-align: center;
                    padding: 0 8px;
                }

                .video-box {
                    border-color: #fbcfe8;
                    color: #ec4899;
                    background: #fdf2f8;
                }
                .video-box:hover { border-color: #db2777; color: #db2777; background: #fce7f3; }

                .submit-section {
                    margin-top: 30px;
                }

                .submit-btn {
                    width: 100%;
                    padding: 18px;
                    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                    color: #fff;
                    border: none;
                    border-radius: 16px;
                    font-size: 16px;
                    font-weight: 800;
                    cursor: pointer;
                    box-shadow: 0 10px 25px rgba(37, 99, 235, 0.2);
                    transition: transform 0.2s, box-shadow 0.2s;
                }

                .submit-btn:active { transform: scale(0.98); }
            `}</style>
        </div>
    );
}
