import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, User, ShieldCheck, Clock, CheckCircle2, ChevronLeft, UploadCloud } from 'lucide-react';

function SellerProfile_Setup() {
    const navigate = useNavigate();
    
    // Application State: 'none' (filling form), 'pending' (under review), 'approved' (ready)
    const [applicationStatus, setApplicationStatus] = useState('none');
    
    // Form Selection State
    const [accountType, setAccountType] = useState(null); // 'individual' or 'organisation'
    
    // Form Data State
    const [formData, setFormData] = useState({
        // Common Contact
        phone: '',
        emergencyPhone: '',
        email: '',
        
        // Rural Specific Address
        houseNumber: '',
        landmark: '',
        village: '',
        mandal: '',
        nearerCity: '',
        district: '',
        state: '',
        pincode: '',
        
        // Ag profile
        categories: [],
        experienceYears: '',
        farmSize: '',
        
        // Individual specific
        fullName: '',
        aadharNumber: '',
        
        // Organisation specific
        companyName: '',
        gstNumber: '',
        representativeName: ''
    });

    const [isDetecting, setIsDetecting] = useState(false);

    // Check existing status on load
    useEffect(() => {
        const savedStatus = localStorage.getItem('mock_seller_status');
        if (savedStatus) {
            setApplicationStatus(savedStatus);
        }
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCategoryToggle = (cat) => {
        setFormData(prev => ({
            ...prev,
            categories: prev.categories.includes(cat) 
                ? prev.categories.filter(c => c !== cat)
                : [...prev.categories, cat]
        }));
    };

    const handleAutoDetectLocation = () => {
        if (!navigator.geolocation) {
            alert("GPS not supported by your browser.");
            return;
        }
        setIsDetecting(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
                    );
                    const data = await response.json();
                    if (data && data.address) {
                        const addr = data.address;
                        setFormData(prev => ({
                            ...prev,
                            pincode: addr.postcode || prev.pincode,
                            state: addr.state || prev.state,
                            district: addr.state_district || addr.county || prev.district,
                            nearerCity: addr.city || addr.town || addr.municipality || prev.nearerCity,
                            village: addr.village || addr.suburb || addr.neighbourhood || addr.hamlet || prev.village,
                            houseNumber: addr.house_number || prev.houseNumber,
                            landmark: addr.attraction || addr.tourism || addr.amenity || prev.landmark
                        }));
                    }
                } catch (error) {
                    console.error("Geocoding failed", error);
                    alert("Failed to auto-detect full address. Please enter manually.");
                } finally {
                    setIsDetecting(false);
                }
            },
            (error) => {
                alert("GPS access denied or failed.");
                setIsDetecting(false);
            }
        );
    };

    const handleSubmitApplication = (e) => {
        e.preventDefault();
        // Here we would send data to Firebase Admin collection
        console.log("Submitting Application to Admin:", { type: accountType, ...formData });
        
        // Mocking the pending state
        localStorage.setItem('mock_seller_status', 'pending');
        setApplicationStatus('pending');
    };

    // --- RENDER: PENDING REVIEW SCREEN ---
    if (applicationStatus === 'pending') {
        return (
            <div style={{ minHeight: '100dvh', backgroundColor: '#f8fafc', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ backgroundColor: '#fff', padding: '40px 30px', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
                    <div style={{ width: '80px', height: '80px', backgroundColor: '#FEF3C7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                        <Clock size={40} color="#D97706" />
                    </div>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', marginBottom: '10px' }}>Application Under Review</h2>
                    <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.6', marginBottom: '30px' }}>
                        Your seller application has been securely securely transmitted to the FarmCap Admin team. We are verifying your documents to ensure a safe marketplace. 
                    </p>
                    <div style={{ backgroundColor: '#F1F5F9', padding: '15px', borderRadius: '12px', fontSize: '13px', color: '#475569', fontWeight: '600', marginBottom: '30px' }}>
                        Estimated verification time: 24-48 Hours
                    </div>
                    <button 
                        onClick={() => navigate('/Consumer_HomePage')}
                        style={{ width: '100%', padding: '15px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '15px', cursor: 'pointer' }}
                    >
                        Return to Consumer Mode
                    </button>
                    
                    {/* DEMO PURPOSES ONLY: Hidden button to mock admin approval */}
                    <button 
                        onClick={() => { localStorage.setItem('mock_seller_status', 'approved'); window.location.href='/Seller_HomePage'; }}
                        style={{ marginTop: '20px', fontSize: '10px', color: '#ccc', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                        [Demo: Force Admin Approve]
                    </button>
                </div>
            </div>
        );
    }

    // --- RENDER: REGISTRATION FORM ---
    return (
        <div style={{ backgroundColor: '#f8fafc', minHeight: '100dvh', paddingBottom: '40px' }}>
            
            {/* Header */}
            <div style={{ backgroundColor: '#0f172a', color: '#fff', padding: '20px', paddingBottom: '40px', borderBottomLeftRadius: '30px', borderBottomRightRadius: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                    <div onClick={() => navigate(-1)} style={{ cursor: 'pointer', padding: '5px' }}>
                        <ChevronLeft size={28} />
                    </div>
                    <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>Seller Registration</h1>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px', padding: '0 10px' }}>
                    <ShieldCheck size={40} color="#4CAF50" />
                    <div>
                        <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>Secure Admin Verification</h2>
                        <p style={{ margin: '5px 0 0', fontSize: '13px', color: '#94a3b8', lineHeight: '1.4' }}>To maintain a high-quality marketplace, all sellers must be verified before listing products or machinery.</p>
                    </div>
                </div>
            </div>

            <div style={{ padding: '20px', maxWidth: '500px', margin: '-20px auto 0' }}>
                
                {/* Step 1: Choose Account Type */}
                {!accountType ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <h3 style={{ margin: '10px 0', fontSize: '16px', color: '#1e293b', fontWeight: '800' }}>Select Account Type</h3>
                        
                        <div 
                            onClick={() => setAccountType('individual')}
                            style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', cursor: 'pointer', border: '2px solid transparent', transition: 'all 0.2s' }}
                        >
                            <div style={{ width: '50px', height: '50px', backgroundColor: '#E0F2FE', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px' }}>
                                <User size={26} color="#0284C7" />
                            </div>
                            <h4 style={{ margin: '0 0 5px', fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Single Person Account</h4>
                            <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>Best for individual farmers, independent workers, or single machinery owners.</p>
                        </div>

                        <div 
                            onClick={() => setAccountType('organisation')}
                            style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', cursor: 'pointer', border: '2px solid transparent', transition: 'all 0.2s' }}
                        >
                            <div style={{ width: '50px', height: '50px', backgroundColor: '#FCE7F3', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px' }}>
                                <Building2 size={26} color="#DB2777" />
                            </div>
                            <h4 style={{ margin: '0 0 5px', fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Registered Organisation</h4>
                            <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>Best for farming co-ops, machinery rental businesses, and large agricultural suppliers.</p>
                        </div>
                    </div>
                ) : (
                    
                    /* Step 2: Fill Details */
                    <form onSubmit={handleSubmitApplication} style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                                {accountType === 'individual' ? 'Individual Details' : 'Organisation Details'}
                            </h3>
                            <button type="button" onClick={() => setAccountType(null)} style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
                                Change Type
                            </button>
                        </div>

                        {/* Conditional Fields */}
                        {accountType === 'individual' ? (
                            <>
                                <InputGroup label="Full Legal Name" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="As per Govt ID" />
                                <InputGroup label="Aadhar / Govt ID Number" name="aadharNumber" value={formData.aadharNumber} onChange={handleChange} placeholder="XXXX XXXX XXXX" />
                            </>
                        ) : (
                            <>
                                <InputGroup label="Registered Company Name" name="companyName" value={formData.companyName} onChange={handleChange} placeholder="e.g. Green Valley Co-op" />
                                <InputGroup label="GST / Business Reg Number" name="gstNumber" value={formData.gstNumber} onChange={handleChange} placeholder="GSTIN..." />
                                <InputGroup label="Authorised Representative Name" name="representativeName" value={formData.representativeName} onChange={handleChange} placeholder="Full Name" />
                            </>
                        )}

                        {/* Common Contact Fields */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <InputGroup label="Primary Phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="+91..." />
                            <InputGroup label="Emergency Phone" name="emergencyPhone" type="tel" value={formData.emergencyPhone} onChange={handleChange} placeholder="Alternative No." />
                        </div>
                        
                        <div style={{ margin: '25px 0 15px', paddingBottom: '10px', borderBottom: '1px solid #e2e8f0' }}>
                            <h4 style={{ margin: 0, fontSize: '15px', color: '#1e293b', fontWeight: '800' }}>Location Details</h4>
                        </div>

                        {/* GPS Auto-Detect Button */}
                        <button 
                            type="button"
                            onClick={handleAutoDetectLocation}
                            disabled={isDetecting}
                            style={{ width: '100%', padding: '12px', backgroundColor: '#e0f2fe', color: '#0284c7', border: '1px dashed #7dd3fc', borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        >
                            {isDetecting ? 'Detecting Location...' : '📍 Auto-Detect GPS Location'}
                        </button>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <InputGroup label="House / Plot No. / Street" name="houseNumber" value={formData.houseNumber} onChange={handleChange} placeholder="e.g. 1-42, Main St" />
                            <InputGroup label="Landmark" name="landmark" value={formData.landmark} onChange={handleChange} placeholder="Near Big Well" />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <InputGroup label="Village" name="village" value={formData.village} onChange={handleChange} placeholder="Village Name" />
                            <InputGroup label="Mandal / Taluka" name="mandal" value={formData.mandal} onChange={handleChange} placeholder="Mandal Name" />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <InputGroup label="Nearer City" name="nearerCity" value={formData.nearerCity} onChange={handleChange} placeholder="City Name" />
                            <InputGroup label="District" name="district" value={formData.district} onChange={handleChange} placeholder="District Name" />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <InputGroup label="State" name="state" value={formData.state} onChange={handleChange} placeholder="State" />
                            <InputGroup label="Pincode" name="pincode" type="number" value={formData.pincode} onChange={handleChange} placeholder="123456" />
                        </div>

                        <div style={{ margin: '25px 0 15px', paddingBottom: '10px', borderBottom: '1px solid #e2e8f0' }}>
                            <h4 style={{ margin: 0, fontSize: '15px', color: '#1e293b', fontWeight: '800' }}>Agriculture & Business Profile</h4>
                        </div>

                        {accountType === 'individual' ? (
                            <>
                                <InputGroup label="Primary Asset / Skill (e.g. 1 Tractor, Drone Operator)" name="primaryAsset" value={formData.primaryAsset || ''} onChange={handleChange} placeholder="What do you own/do?" />
                                <InputGroup label="Years of Experience" name="experienceYears" type="number" value={formData.experienceYears} onChange={handleChange} placeholder="e.g. 10" />
                            </>
                        ) : (
                            <>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <InputGroup label="Fleet Size (No. of Vehicles)" name="fleetSize" type="number" value={formData.fleetSize || ''} onChange={handleChange} placeholder="e.g. 5" required={false} />
                                    <InputGroup label="Labor Force Size (No. of Workers)" name="laborSize" type="number" value={formData.laborSize || ''} onChange={handleChange} placeholder="e.g. 30" required={false} />
                                </div>
                                <InputGroup label="Total Farm/Warehouse Size (Optional)" name="farmSize" value={formData.farmSize} onChange={handleChange} placeholder="e.g. 50 Acres / 2000 Sq Ft" required={false} />
                            </>
                        )}

                        {/* Categories */}
                        <div style={{ marginBottom: '25px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '10px' }}>What do you plan to offer? (Select all that apply)</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {['Farm Fresh Produce', 'Harvested Crops', 'Machinery Rental', 'Agricultural Labor', 'Freelance Services'].map(cat => (
                                    <div 
                                        key={cat}
                                        onClick={() => handleCategoryToggle(cat)}
                                        style={{ 
                                            padding: '8px 12px', 
                                            borderRadius: '20px', 
                                            fontSize: '12px', 
                                            fontWeight: '600', 
                                            cursor: 'pointer',
                                            backgroundColor: formData.categories.includes(cat) ? '#10b981' : '#f1f5f9',
                                            color: formData.categories.includes(cat) ? '#fff' : '#475569',
                                            border: formData.categories.includes(cat) ? '1px solid #059669' : '1px solid #cbd5e1'
                                        }}
                                    >
                                        {cat}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Document Upload Mock */}
                        <div style={{ marginBottom: '30px', padding: '20px', border: '2px dashed #cbd5e1', borderRadius: '12px', textAlign: 'center', backgroundColor: '#f8fafc' }}>
                            <UploadCloud size={30} color="#94a3b8" style={{ marginBottom: '10px' }} />
                            <p style={{ margin: 0, fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Upload ID / Registration Proof</p>
                            <p style={{ margin: '5px 0 0', fontSize: '11px', color: '#94a3b8' }}>PNG, JPG, PDF up to 5MB</p>
                        </div>

                        {/* Legal Terms Checkbox */}
                        <div style={{ marginBottom: '25px', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', padding: '15px', borderRadius: '12px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                            <input 
                                type="checkbox" 
                                required
                                name="agreedToTerms"
                                checked={formData.agreedToTerms || false}
                                onChange={(e) => setFormData({...formData, agreedToTerms: e.target.checked})}
                                style={{ width: '20px', height: '20px', cursor: 'pointer', flexShrink: 0, marginTop: '2px' }}
                            />
                            <p style={{ margin: 0, fontSize: '12px', color: '#991B1B', lineHeight: '1.5' }}>
                                I agree to the <a href="#" onClick={(e) => { e.preventDefault(); window.open('/seller-terms', '_blank'); }} style={{ color: '#DC2626', fontWeight: 'bold', textDecoration: 'underline' }}>FarmCap Seller Terms & Conditions</a>. I acknowledge that FarmCap is exclusively a digital bridge platform, and I am solely responsible for the quality, safety, and financial transactions of my goods and services.
                            </p>
                        </div>

                        <button type="submit" style={{ width: '100%', padding: '16px', backgroundColor: '#2E7D32', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '16px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(46, 125, 50, 0.3)' }}>
                            Submit for Verification
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

// Helper Component for Inputs
const InputGroup = ({ label, ...props }) => (
    <div style={{ marginBottom: '18px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>{label}</label>
        <input 
            required
            style={{ 
                width: '100%', 
                padding: '12px 15px', 
                backgroundColor: '#f8fafc', 
                border: '1px solid #cbd5e1', 
                borderRadius: '10px', 
                fontSize: '14px', 
                color: '#1e293b',
                boxSizing: 'border-box',
                outline: 'none'
            }} 
            {...props} 
        />
    </div>
);

export default SellerProfile_Setup;