import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, User, ShieldCheck, Clock, ChevronLeft, UploadCloud, MapPin, Briefcase, CheckCircle2 } from 'lucide-react';
import { db } from '../../firebase';
import { collection, addDoc, getDoc, doc, deleteDoc } from 'firebase/firestore';

function SellerProfile_Setup() {
    const navigate = useNavigate();
    
    // Application State: 'none' (filling form), 'pending' (under review), 'approved' (ready)
    const [applicationStatus, setApplicationStatus] = useState('none');
    
    // Form Selection State
    const [accountType, setAccountType] = useState(null); // 'individual' or 'organisation'
    
    // Check if already applied
    const indId = localStorage.getItem('seller_individual_app_id');
    const orgId = localStorage.getItem('seller_organisation_app_id');
    
    const [indApp, setIndApp] = useState(null);
    const [orgApp, setOrgApp] = useState(null);
    const [loadingData, setLoadingData] = useState(true);

    const [cachedIndReject, setCachedIndReject] = useState(localStorage.getItem('cached_reject_ind'));
    const [cachedOrgReject, setCachedOrgReject] = useState(localStorage.getItem('cached_reject_org'));

    useEffect(() => {
        const fetchStatus = async () => {
            if (indId) {
                const docSnap = await getDoc(doc(db, 'seller_applications', indId));
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data.status === 'rejected') {
                        localStorage.setItem('cached_reject_ind', data.rejectionReason || "Does not meet requirements");
                        setCachedIndReject(data.rejectionReason || "Does not meet requirements");
                        await deleteDoc(doc(db, 'seller_applications', indId));
                        localStorage.removeItem('seller_individual_app_id');
                        // Also clear global app id if it matches
                        if(localStorage.getItem('seller_app_id') === indId) localStorage.removeItem('seller_app_id');
                    } else {
                        setIndApp(data);
                    }
                } else {
                    localStorage.removeItem('seller_individual_app_id');
                }
            }
            if (orgId) {
                const docSnap = await getDoc(doc(db, 'seller_applications', orgId));
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data.status === 'rejected') {
                        localStorage.setItem('cached_reject_org', data.rejectionReason || "Does not meet requirements");
                        setCachedOrgReject(data.rejectionReason || "Does not meet requirements");
                        await deleteDoc(doc(db, 'seller_applications', orgId));
                        localStorage.removeItem('seller_organisation_app_id');
                        if(localStorage.getItem('seller_app_id') === orgId) localStorage.removeItem('seller_app_id');
                    } else {
                        setOrgApp(data);
                    }
                } else {
                    localStorage.removeItem('seller_organisation_app_id');
                }
            }
            setLoadingData(false);
        };
        fetchStatus();
    }, [indId, orgId]);
    
    // Form Data State
    const [formData, setFormData] = useState({
        phone: '', emergencyPhone: '', email: '', shopName: '',
        houseNumber: '', landmark: '', village: '', mandal: '', nearerCity: '', district: '', state: '', pincode: '', lat: '', lng: '', serviceRadius: '20km',
        categories: [], experienceYears: '', farmSize: '',
        fullName: '', aadharNumber: '',
        companyName: '', gstNumber: '', representativeName: '',
        
        // Individual Ag Profile specific fields
        isOrganic: 'no',
        freshProduceTypes: '',
        machineryDetails: '',
        harvestCrops: '',
        harvestQuantity: '',
        workerSkills: '',
        freelanceWorks: '',
        freelanceExperience: '',
        freelanceSkillSet: '',
        
        // Organisation Ag Profile specific fields
        orgProduceCapacity: '',
        orgProduceImages: null,
        orgMachineryDetails: '',
        orgMachineryCapacity: '',
        orgMachineryImages: null,
        orgHarvestCrops: '',
        orgHarvestCapacity: '',
        orgHarvestImages: null,
        orgWorkerCount: '',
        orgWorkerSkills: '',
        orgFreelancerCount: '',
        orgFreelancerSkills: ''
    });

    const [isDetecting, setIsDetecting] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);


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
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
                    const data = await response.json();
                    if (data && data.address) {
                        const addr = data.address;
                        setFormData(prev => ({
                            ...prev,
                            lat: latitude.toFixed(6),
                            lng: longitude.toFixed(6),
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
            () => { alert("GPS access denied or failed."); setIsDetecting(false); }
        );
    };

    const handleSubmit = async () => {
        // --- STRICT FORM VALIDATION ---
        
        // 1. Validate Phone Number (exactly 10 digits)
        const phoneRegex = /^[0-9]{10}$/;
        if (!formData.phone || !phoneRegex.test(formData.phone)) {
            alert("Please enter a valid 10-digit Phone Number.");
            return;
        }

        // 2. Validate Identity Details
        if (accountType === 'individual') {
            if (!formData.fullName.trim()) { alert("Please enter your Full Legal Name."); return; }
            if (!formData.aadharNumber.trim()) { alert("Please enter your Aadhar / Govt ID Number."); return; }
        } else {
            if (!formData.companyName.trim()) { alert("Please enter your Organisation Name."); return; }
            if (!formData.representativeName.trim()) { alert("Please enter the Contact Person Name."); return; }
            if (!formData.gstNumber.trim()) { alert("Please enter your GST / Registration Number."); return; }
        }

        // 3. Validate Location / Address Details
        const missingAddress = [];
        if (!formData.village.trim()) missingAddress.push("Village/Town");
        if (!formData.mandal.trim()) missingAddress.push("Mandal/Tehsil");
        if (!formData.district.trim()) missingAddress.push("District");
        if (!formData.state.trim()) missingAddress.push("State");
        if (!formData.pincode.trim()) missingAddress.push("Pincode");
        
        if (missingAddress.length > 0) {
            alert(`Please fill all required Location details. Missing: ${missingAddress.join(', ')}`);
            return;
        }

        // 4. Validate Categories
        if (!formData.categories || formData.categories.length === 0) {
            alert("Please select at least one Business Category from the 'Your Business Categories' section.");
            return;
        }
        // ------------------------------

        setIsSubmitting(true);
        try {
            // Generate an absolutely unique alphanumeric Seller ID (e.g. SLR-LWMX1Y2Z-9A2B)
            const timestampPart = Date.now().toString(36).toUpperCase();
            const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
            const sellerId = `SLR-${timestampPart}-${randomPart}`;
            
            // Clean up formData by removing File objects (they cause Firestore errors without Storage upload)
            const submissionData = { ...formData, sellerId: sellerId, status: 'pending_approval', accountType: accountType, submittedAt: new Date().toISOString() };
            delete submissionData.profilePic;
            delete submissionData.organicCertificate;
            delete submissionData.machineryImages;
            delete submissionData.idProof;
            delete submissionData.orgProduceImages;
            delete submissionData.orgMachineryImages;
            delete submissionData.orgHarvestImages;

            // Submit to Firebase
            const docRef = await addDoc(collection(db, 'seller_applications'), submissionData);
            
            alert(`Application Submitted Successfully!\n\nYour Seller ID is: ${sellerId}\n\nOur Admin team will review your application shortly.`);
            
            // Primary tracker for homepage
            localStorage.setItem('seller_app_id', docRef.id);
            
            // Specific trackers for preventing duplicates
            if (accountType === 'individual') {
                localStorage.setItem('seller_individual_app_id', docRef.id);
            } else {
                localStorage.setItem('seller_organisation_app_id', docRef.id);
            }
            
            navigate('/Seller_HomePage');
        } catch (error) {
            console.error("Submission failed:", error);
            alert("Failed to submit application. Please check your connection.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Dynamic Theming Configuration ---
    const themeConfig = {
        individual: {
            primary: '#0284c7', // Sky blue
            bg: '#f0f9ff',
            icon: <User size={28} color="#0284c7" />,
            title: 'Individual Registration',
            subtitle: 'For independent farmers and workers',
            gradient: 'linear-gradient(135deg, #0284c7, #0369a1)',
            shadow: 'rgba(2, 132, 199, 0.3)'
        },
        organisation: {
            primary: '#4338ca', // Indigo / Deep Blue
            bg: '#eef2ff',
            icon: <Building2 size={28} color="#4338ca" />,
            title: 'Organisation Registration',
            subtitle: 'For registered companies and co-ops',
            gradient: 'linear-gradient(135deg, #4338ca, #3730a3)',
            shadow: 'rgba(67, 56, 202, 0.3)'
        }
    };

    const currentTheme = accountType ? themeConfig[accountType] : null;


    // --- RENDER: REGISTRATION FORM ---
    return (
        <div style={{ backgroundColor: '#f8fafc', minHeight: '100dvh', paddingBottom: '60px' }}>
            
            {/* Header */}
            <div style={{ backgroundColor: '#0f172a', color: '#fff', padding: '20px', paddingBottom: '40px', borderBottomLeftRadius: '30px', borderBottomRightRadius: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                    <div onClick={() => navigate(-1)} style={{ cursor: 'pointer', padding: '5px' }}>
                        <ChevronLeft size={28} />
                    </div>
                    <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>Seller Registration</h1>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px', padding: '0 10px' }}>
                    <ShieldCheck size={40} color="#4CAF50" style={{ flexShrink: 0 }} />
                    <div>
                        <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>Secure Verification</h2>
                        <p style={{ margin: '5px 0 0', fontSize: '13px', color: '#94a3b8', lineHeight: '1.4' }}>To maintain a high-quality marketplace, all sellers must be verified.</p>
                    </div>
                </div>
            </div>

            <div style={{ padding: '20px', maxWidth: '500px', margin: '-20px auto 0' }}>
                
                {/* Step 1: Choose Account Type */}
                {!accountType ? (
                    loadingData ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading profile status...</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <h3 style={{ margin: '10px 0', fontSize: '18px', color: '#1e293b', fontWeight: '800' }}>Select Account Type</h3>
                            
                            {/* INDIVIDUAL CARD */}
                            {indApp?.status === 'approved' ? (
                                <div style={{ backgroundColor: '#ecfdf5', padding: '25px', borderRadius: '24px', boxShadow: '0 8px 30px rgba(16, 185, 129, 0.1)', border: '2px solid #a7f3d0' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                                        <div style={{ width: '50px', height: '50px', backgroundColor: '#10b981', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <ShieldCheck size={28} color="#fff" />
                                        </div>
                                        <div>
                                            <h4 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: '800', color: '#065f46' }}>Single Person Profile</h4>
                                            <span style={{ fontSize: '12px', background: '#34d399', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>Approved</span>
                                        </div>
                                    </div>
                                    <div style={{ background: '#fff', padding: '15px', borderRadius: '12px' }}>
                                        <p style={{ margin: '0 0 5px', fontSize: '14px', color: '#047857' }}><strong>Name:</strong> {indApp.fullName}</p>
                                        <p style={{ margin: '0 0 5px', fontSize: '14px', color: '#047857' }}><strong>ID:</strong> {indApp.sellerId}</p>
                                        <p style={{ margin: '0 0 5px', fontSize: '14px', color: '#047857' }}><strong>Address:</strong> {indApp.village}, {indApp.district}</p>
                                        <p style={{ margin: '0', fontSize: '14px', color: '#047857' }}><strong>Interests:</strong> {indApp.categories?.join(', ')}</p>
                                    </div>
                                </div>
                            ) : (
                                <div 
                                    onClick={() => {
                                        if (indApp?.status === 'pending_approval') alert("Your Individual Profile application is under review.");
                                        else setAccountType('individual');
                                    }}
                                    style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '24px', boxShadow: '0 8px 30px rgba(2, 132, 199, 0.1)', cursor: indApp?.status === 'pending_approval' ? 'not-allowed' : 'pointer', opacity: indApp?.status === 'pending_approval' ? 0.6 : 1, border: '2px solid transparent', transition: 'all 0.3s ease', position: 'relative', overflow: 'hidden' }}
                                >
                                    <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: 'radial-gradient(circle, rgba(2,132,199,0.1) 0%, rgba(2,132,199,0) 70%)', transform: 'translate(30%, -30%)' }}></div>
                                    <div style={{ width: '60px', height: '60px', backgroundColor: '#e0f2fe', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                                        <User size={32} color="#0284c7" />
                                    </div>
                                    <h4 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>Single Person</h4>
                                    
                                    {indApp?.status === 'pending_approval' ? (
                                        <p style={{ margin: 0, fontSize: '14px', color: '#d97706', fontWeight: '700' }}>Application in Process</p>
                                    ) : cachedIndReject ? (
                                        <div style={{ marginTop: '5px' }}>
                                            <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#dc2626', fontWeight: '700' }}>Previous Application Rejected</p>
                                            <p style={{ margin: 0, fontSize: '12px', color: '#7f1d1d', background: '#fef2f2', padding: '6px', borderRadius: '6px' }}>Reason: {cachedIndReject}</p>
                                            <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#0284c7', fontWeight: 'bold' }}>Click to Re-apply</p>
                                        </div>
                                    ) : (
                                        <p style={{ margin: 0, fontSize: '14px', color: '#64748b', lineHeight: '1.5' }}>Best for individual farmers, independent workers, or sole machinery owners.</p>
                                    )}
                                </div>
                            )}

                            {/* ORGANISATION CARD */}
                            {orgApp?.status === 'approved' ? (
                                <div style={{ backgroundColor: '#ecfdf5', padding: '25px', borderRadius: '24px', boxShadow: '0 8px 30px rgba(16, 185, 129, 0.1)', border: '2px solid #a7f3d0' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                                        <div style={{ width: '50px', height: '50px', backgroundColor: '#10b981', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <ShieldCheck size={28} color="#fff" />
                                        </div>
                                        <div>
                                            <h4 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: '800', color: '#065f46' }}>Organisation Profile</h4>
                                            <span style={{ fontSize: '12px', background: '#34d399', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>Approved</span>
                                        </div>
                                    </div>
                                    <div style={{ background: '#fff', padding: '15px', borderRadius: '12px' }}>
                                        <p style={{ margin: '0 0 5px', fontSize: '14px', color: '#047857' }}><strong>Company:</strong> {orgApp.companyName}</p>
                                        <p style={{ margin: '0 0 5px', fontSize: '14px', color: '#047857' }}><strong>ID:</strong> {orgApp.sellerId}</p>
                                        <p style={{ margin: '0 0 5px', fontSize: '14px', color: '#047857' }}><strong>Address:</strong> {orgApp.village}, {orgApp.district}</p>
                                        <p style={{ margin: '0', fontSize: '14px', color: '#047857' }}><strong>Interests:</strong> {orgApp.categories?.join(', ')}</p>
                                    </div>
                                </div>
                            ) : (
                                <div 
                                    onClick={() => {
                                        if (orgApp?.status === 'pending_approval') alert("Your Organisation Profile application is under review.");
                                        else setAccountType('organisation');
                                    }}
                                    style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '24px', boxShadow: '0 8px 30px rgba(67, 56, 202, 0.1)', cursor: orgApp?.status === 'pending_approval' ? 'not-allowed' : 'pointer', opacity: orgApp?.status === 'pending_approval' ? 0.6 : 1, border: '2px solid transparent', transition: 'all 0.3s ease', position: 'relative', overflow: 'hidden' }}
                                >
                                    <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: 'radial-gradient(circle, rgba(67,56,202,0.1) 0%, rgba(67,56,202,0) 70%)', transform: 'translate(30%, -30%)' }}></div>
                                    <div style={{ width: '60px', height: '60px', backgroundColor: '#eef2ff', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                                        <Building2 size={32} color="#4338ca" />
                                    </div>
                                    <h4 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>Organisation</h4>
                                    
                                    {orgApp?.status === 'pending_approval' ? (
                                        <p style={{ margin: 0, fontSize: '14px', color: '#d97706', fontWeight: '700' }}>Application in Process</p>
                                    ) : cachedOrgReject ? (
                                        <div style={{ marginTop: '5px' }}>
                                            <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#dc2626', fontWeight: '700' }}>Previous Application Rejected</p>
                                            <p style={{ margin: 0, fontSize: '12px', color: '#7f1d1d', background: '#fef2f2', padding: '6px', borderRadius: '6px' }}>Reason: {cachedOrgReject}</p>
                                            <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#4338ca', fontWeight: 'bold' }}>Click to Re-apply</p>
                                        </div>
                                    ) : (
                                        <p style={{ margin: 0, fontSize: '14px', color: '#64748b', lineHeight: '1.5' }}>Best for registered farming co-ops, rental businesses, and suppliers.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )
                ) : (
                    
                    /* Step 2: Fill Details with Dynamic Theme */
                    <div style={{ backgroundColor: '#fff', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                        
                        {/* Dynamic Hero Header */}
                        <div style={{ background: currentTheme.gradient, padding: '35px 25px 30px', color: '#fff', position: 'relative' }}>
                            <button type="button" onClick={() => setAccountType(null)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', padding: '8px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', backdropFilter: 'blur(5px)' }}>
                                Change Type
                            </button>
                            <div style={{ width: '60px', height: '60px', backgroundColor: '#fff', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
                                {currentTheme.icon}
                            </div>
                            <h3 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: '800' }}>{currentTheme.title}</h3>
                            <p style={{ margin: 0, fontSize: '14px', opacity: 0.9, lineHeight: '1.4' }}>{currentTheme.subtitle}</p>
                        </div>

                        <div style={{ padding: '30px 25px' }}>
                            
                            {/* Personal/Business Info Section */}
                            <SectionTitle title="Identity Details" icon={<User size={20} color={currentTheme.primary} />} theme={currentTheme} />
                            
                            {/* Profile / Logo Upload UI */}
                            <FileUploadUI 
                                label={accountType === 'individual' ? "Upload Profile Photo" : "Upload Company Logo"}
                                accept="image/*"
                                themeColor={currentTheme.primary}
                                onFileSelect={(file) => setFormData({...formData, profilePic: file})}
                            />
                            
                            {accountType === 'individual' ? (
                                <>
                                    <InputGroup label="Shop / Display Name" name="shopName" value={formData.shopName} onChange={handleChange} placeholder="e.g. Ramesh's Fresh Farms" themeColor={currentTheme.primary} />
                                    <InputGroup label="Full Legal Name" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="As per Govt ID" themeColor={currentTheme.primary} />
                                    <InputGroup label="Aadhar / Govt ID Number" name="aadharNumber" value={formData.aadharNumber} onChange={handleChange} placeholder="XXXX XXXX XXXX" themeColor={currentTheme.primary} />
                                </>
                            ) : (
                                <>
                                    <InputGroup label="Organisation Name" name="companyName" value={formData.companyName} onChange={handleChange} placeholder="e.g. Green Valley Co-op" themeColor={currentTheme.primary} />
                                    <InputGroup label="Contact Person Name" name="representativeName" value={formData.representativeName} onChange={handleChange} placeholder="Full Name" themeColor={currentTheme.primary} />
                                </>
                            )}
                            
                            <InputGroup label="Business Email Address" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="store@example.com" themeColor={currentTheme.primary} />

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <InputGroup label="Primary Phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="+91..." themeColor={currentTheme.primary} />
                                <InputGroup label="Emergency Phone" name="emergencyPhone" type="tel" value={formData.emergencyPhone} onChange={handleChange} placeholder="Alternative No." themeColor={currentTheme.primary} />
                            </div>

                            {/* Location Section */}
                            <SectionTitle title="Location & Address" icon={<MapPin size={20} color={currentTheme.primary} />} theme={currentTheme} />
                            
                            <button 
                                type="button"
                                onClick={handleAutoDetectLocation}
                                disabled={isDetecting}
                                style={{ width: '100%', padding: '16px', background: currentTheme.gradient, color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '15px', cursor: 'pointer', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'transform 0.2s', boxShadow: `0 6px 20px ${currentTheme.shadow}`, letterSpacing: '0.5px' }}
                            >
                                {isDetecting ? 'Detecting Location...' : '📍 Auto-Detect GPS Location'}
                            </button>
                            <p style={{ margin: '0 0 25px', fontSize: '12.5px', color: '#64748b', textAlign: 'center', lineHeight: '1.5' }}>
                                <b style={{ color: currentTheme.primary }}>Note:</b> Please use this feature only when you are physically present at your home, shop, or machinery warehouse.
                            </p>

                            {/* Read-Only Coordinates */}
                            {formData.lat && formData.lng && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                                    <InputGroup label="Latitude (Auto)" readOnly value={formData.lat} themeColor={currentTheme.primary} style={{ backgroundColor: '#f1f5f9', color: '#64748b' }} />
                                    <InputGroup label="Longitude (Auto)" readOnly value={formData.lng} themeColor={currentTheme.primary} style={{ backgroundColor: '#f1f5f9', color: '#64748b' }} />
                                </div>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                                <InputGroup label="House / Plot No." name="houseNumber" value={formData.houseNumber} onChange={handleChange} placeholder="e.g. 1-42" themeColor={currentTheme.primary} />
                                <InputGroup label="Landmark" name="landmark" value={formData.landmark} onChange={handleChange} placeholder="Near Big Well" themeColor={currentTheme.primary} />
                                <InputGroup label="Village" name="village" value={formData.village} onChange={handleChange} placeholder="Village Name" themeColor={currentTheme.primary} />
                                <InputGroup label="Mandal / Taluka" name="mandal" value={formData.mandal} onChange={handleChange} placeholder="Mandal Name" themeColor={currentTheme.primary} />
                                <InputGroup label="Nearer City" name="nearerCity" value={formData.nearerCity} onChange={handleChange} placeholder="City Name" themeColor={currentTheme.primary} />
                                <InputGroup label="District" name="district" value={formData.district} onChange={handleChange} placeholder="District Name" themeColor={currentTheme.primary} />
                                <InputGroup label="State" name="state" value={formData.state} onChange={handleChange} placeholder="State" themeColor={currentTheme.primary} />
                                <InputGroup label="Pincode" name="pincode" type="number" value={formData.pincode} onChange={handleChange} placeholder="123456" themeColor={currentTheme.primary} />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <SelectGroup label="Service / Delivery Radius" name="serviceRadius" value={formData.serviceRadius} onChange={handleChange} themeColor={currentTheme.primary} options={[
                                    { value: '5km', label: 'Within 5 km (Local Only)' },
                                    { value: '20km', label: 'Within 20 km (Nearby Towns)' },
                                    { value: 'district', label: 'Entire District' },
                                    { value: 'state', label: 'Entire State' }
                                ]} />
                            </div>

                            {/* Ag Profile Section */}
                            <SectionTitle title="Agriculture Profile" icon={<Briefcase size={20} color={currentTheme.primary} />} theme={currentTheme} />

                            {/* Categories */}
                            <div style={{ marginBottom: '30px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '12px' }}>What services do you plan to offer?</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                    {['Farm Fresh Produce', 'Harvested Crops', 'Machinery Rental', 'Agriculture Worker', 'Freelance Services', 'Not Sure'].map(cat => (
                                        <div 
                                            key={cat}
                                            onClick={() => handleCategoryToggle(cat)}
                                            style={{ 
                                                padding: '10px 16px', 
                                                borderRadius: '20px', 
                                                fontSize: '13px', 
                                                fontWeight: '600', 
                                                cursor: 'pointer',
                                                backgroundColor: formData.categories.includes(cat) ? currentTheme.primary : '#f1f5f9',
                                                color: formData.categories.includes(cat) ? '#fff' : '#475569',
                                                border: formData.categories.includes(cat) ? `1px solid ${currentTheme.primary}` : '1px solid #cbd5e1',
                                                transition: 'all 0.2s ease',
                                                boxShadow: formData.categories.includes(cat) ? `0 4px 10px ${currentTheme.shadow}` : 'none'
                                            }}
                                        >
                                            {cat}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Individual Form Deep Dive Questions */}
                            {accountType === 'individual' && formData.categories.includes('Farm Fresh Produce') && (
                                <div style={{ padding: '25px', backgroundColor: '#fff', borderRadius: '16px', border: `1.5px solid ${currentTheme.primary}30`, marginBottom: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                                    <h5 style={{ margin: '0 0 20px', color: currentTheme.primary, fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>🌿 Farm Fresh Produce</h5>
                                    
                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '10px' }}>Are these products Organic?</label>
                                        <div style={{ display: 'flex', gap: '15px' }}>
                                            <div 
                                                onClick={() => setFormData({...formData, isOrganic: 'yes'})}
                                                style={{ flex: 1, padding: '14px', textAlign: 'center', borderRadius: '12px', cursor: 'pointer', border: formData.isOrganic === 'yes' ? `2px solid ${currentTheme.primary}` : '1.5px solid #cbd5e1', backgroundColor: formData.isOrganic === 'yes' ? `${currentTheme.primary}10` : '#fff', color: formData.isOrganic === 'yes' ? currentTheme.primary : '#475569', fontWeight: '700', transition: 'all 0.2s', boxShadow: formData.isOrganic === 'yes' ? `0 4px 10px ${currentTheme.primary}20` : 'none' }}>
                                                Yes, Organic
                                            </div>
                                            <div 
                                                onClick={() => setFormData({...formData, isOrganic: 'no'})}
                                                style={{ flex: 1, padding: '14px', textAlign: 'center', borderRadius: '12px', cursor: 'pointer', border: formData.isOrganic === 'no' ? `2px solid ${currentTheme.primary}` : '1.5px solid #cbd5e1', backgroundColor: formData.isOrganic === 'no' ? `${currentTheme.primary}10` : '#fff', color: formData.isOrganic === 'no' ? currentTheme.primary : '#475569', fontWeight: '700', transition: 'all 0.2s', boxShadow: formData.isOrganic === 'no' ? `0 4px 10px ${currentTheme.primary}20` : 'none' }}>
                                                No, Regular
                                            </div>
                                        </div>
                                    </div>

                                    {formData.isOrganic === 'yes' && (
                                        <FileUploadUI label="Upload Organic Certificate (PDF/Image)" accept=".pdf,image/*" themeColor={currentTheme.primary} onFileSelect={(f) => setFormData({...formData, organicCertificate: f})} />
                                    )}

                                    <TextAreaGroup 
                                        label="What products do you keep? (e.g. Vegetables: Tomatoes. Fruits: Mangoes)" 
                                        name="freshProduceTypes" 
                                        value={formData.freshProduceTypes} 
                                        onChange={handleChange} 
                                        placeholder="List your product types and specific names here..." 
                                        themeColor={currentTheme.primary} 
                                    />
                                </div>
                            )}

                            {accountType === 'individual' && formData.categories.includes('Machinery Rental') && (
                                <div style={{ padding: '25px', backgroundColor: '#fff', borderRadius: '16px', border: `1.5px solid ${currentTheme.primary}30`, marginBottom: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                                    <h5 style={{ margin: '0 0 20px', color: currentTheme.primary, fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>🚜 Machinery Rental</h5>
                                    
                                    <TextAreaGroup 
                                        label="What machinery do you have and how many? (e.g. 2 Tractors, 1 Harvester)" 
                                        name="machineryDetails" 
                                        value={formData.machineryDetails} 
                                        onChange={handleChange} 
                                        placeholder="List machinery types and counts..." 
                                        themeColor={currentTheme.primary} 
                                    />

                                    <FileUploadUI label="Upload Machinery Images" accept="image/*" themeColor={currentTheme.primary} onFileSelect={(f) => setFormData({...formData, machineryImages: f})} />
                                </div>
                            )}

                            {accountType === 'individual' && formData.categories.includes('Harvested Crops') && (
                                <div style={{ padding: '25px', backgroundColor: '#fff', borderRadius: '16px', border: `1.5px solid ${currentTheme.primary}30`, marginBottom: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                                    <h5 style={{ margin: '0 0 20px', color: currentTheme.primary, fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>🌾 Harvested Crops</h5>
                                    
                                    <InputGroup label="What crops will you sell?" name="harvestCrops" value={formData.harvestCrops} onChange={handleChange} placeholder="e.g. Rice, Wheat, Cotton..." themeColor={currentTheme.primary} />
                                    <InputGroup label="Expected Quantity (in Quintals)" name="harvestQuantity" type="number" value={formData.harvestQuantity} onChange={handleChange} placeholder="e.g. 50" themeColor={currentTheme.primary} />
                                </div>
                            )}

                            {accountType === 'individual' && formData.categories.includes('Agriculture Worker') && (
                                <div style={{ padding: '25px', backgroundColor: '#fff', borderRadius: '16px', border: `1.5px solid ${currentTheme.primary}30`, marginBottom: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                                    <h5 style={{ margin: '0 0 20px', color: currentTheme.primary, fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>👷 Agriculture Worker</h5>
                                    
                                    <TextAreaGroup 
                                        label="What types of farm work can you do?" 
                                        name="workerSkills" 
                                        value={formData.workerSkills} 
                                        onChange={handleChange} 
                                        placeholder="e.g. Harvesting, Sowing, Pesticide Spraying..." 
                                        themeColor={currentTheme.primary} 
                                    />
                                </div>
                            )}

                            {accountType === 'individual' && formData.categories.includes('Freelance Services') && (
                                <div style={{ padding: '25px', backgroundColor: '#fff', borderRadius: '16px', border: `1.5px solid ${currentTheme.primary}30`, marginBottom: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                                    <h5 style={{ margin: '0 0 20px', color: currentTheme.primary, fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>💼 Freelance Services</h5>
                                    
                                    <TextAreaGroup 
                                        label="What specific freelance works can you do?" 
                                        name="freelanceWorks" 
                                        value={formData.freelanceWorks} 
                                        onChange={handleChange} 
                                        placeholder="e.g. Drone Piloting, Soil Testing, Accounting..." 
                                        themeColor={currentTheme.primary} 
                                    />
                                    
                                    <InputGroup label="Years of Experience in this work" name="freelanceExperience" type="number" value={formData.freelanceExperience} onChange={handleChange} placeholder="e.g. 5" themeColor={currentTheme.primary} />
                                    
                                    <TextAreaGroup 
                                        label="What is your technical skill set?" 
                                        name="freelanceSkillSet" 
                                        value={formData.freelanceSkillSet} 
                                        onChange={handleChange} 
                                        placeholder="e.g. Certified DJI Pilot, Agribusiness Degree..." 
                                        themeColor={currentTheme.primary} 
                                    />
                                </div>
                            )}

                            {/* Organisation Form Deep Dive Questions */}
                            {accountType === 'organisation' && formData.categories.includes('Farm Fresh Produce') && (
                                <div style={{ padding: '25px', backgroundColor: '#fff', borderRadius: '16px', border: `1.5px solid ${currentTheme.primary}30`, marginBottom: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                                    <h5 style={{ margin: '0 0 20px', color: currentTheme.primary, fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>🌿 Farm Fresh Produce Supply</h5>
                                    
                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '10px' }}>Are these products Organic?</label>
                                        <div style={{ display: 'flex', gap: '15px' }}>
                                            <div 
                                                onClick={() => setFormData({...formData, isOrganic: 'yes'})}
                                                style={{ flex: 1, padding: '14px', textAlign: 'center', borderRadius: '12px', cursor: 'pointer', border: formData.isOrganic === 'yes' ? `2px solid ${currentTheme.primary}` : '1.5px solid #cbd5e1', backgroundColor: formData.isOrganic === 'yes' ? `${currentTheme.primary}10` : '#fff', color: formData.isOrganic === 'yes' ? currentTheme.primary : '#475569', fontWeight: '700', transition: 'all 0.2s', boxShadow: formData.isOrganic === 'yes' ? `0 4px 10px ${currentTheme.primary}20` : 'none' }}>
                                                Yes, Organic
                                            </div>
                                            <div 
                                                onClick={() => setFormData({...formData, isOrganic: 'no'})}
                                                style={{ flex: 1, padding: '14px', textAlign: 'center', borderRadius: '12px', cursor: 'pointer', border: formData.isOrganic === 'no' ? `2px solid ${currentTheme.primary}` : '1.5px solid #cbd5e1', backgroundColor: formData.isOrganic === 'no' ? `${currentTheme.primary}10` : '#fff', color: formData.isOrganic === 'no' ? currentTheme.primary : '#475569', fontWeight: '700', transition: 'all 0.2s', boxShadow: formData.isOrganic === 'no' ? `0 4px 10px ${currentTheme.primary}20` : 'none' }}>
                                                No, Regular
                                            </div>
                                        </div>
                                    </div>

                                    {formData.isOrganic === 'yes' && (
                                        <FileUploadUI label="Upload Organic Certificate (PDF/Image)" accept=".pdf,image/*" themeColor={currentTheme.primary} onFileSelect={(f) => setFormData({...formData, organicCertificate: f})} />
                                    )}

                                    <InputGroup label="Supply Capacity (e.g. 500 Tons/Month)" name="orgProduceCapacity" value={formData.orgProduceCapacity} onChange={handleChange} placeholder="Enter supply capacity..." themeColor={currentTheme.primary} />
                                    
                                    <FileUploadUI label="Upload Product Images (2-3 Images)" accept="image/*" multiple={true} themeColor={currentTheme.primary} onFileSelect={(f) => setFormData({...formData, orgProduceImages: f})} />
                                </div>
                            )}

                            {accountType === 'organisation' && formData.categories.includes('Machinery Rental') && (
                                <div style={{ padding: '25px', backgroundColor: '#fff', borderRadius: '16px', border: `1.5px solid ${currentTheme.primary}30`, marginBottom: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                                    <h5 style={{ margin: '0 0 20px', color: currentTheme.primary, fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>🚜 Machinery Rental Supply</h5>
                                    
                                    <TextAreaGroup 
                                        label="What machinery do you have?" 
                                        name="orgMachineryDetails" 
                                        value={formData.orgMachineryDetails} 
                                        onChange={handleChange} 
                                        placeholder="List available machinery models and types..." 
                                        themeColor={currentTheme.primary} 
                                    />
                                    
                                    <InputGroup label="Supply Capacity (e.g. 50 Tractors, 10 Harvesters)" name="orgMachineryCapacity" value={formData.orgMachineryCapacity} onChange={handleChange} placeholder="Enter fleet size / capacity..." themeColor={currentTheme.primary} />

                                    <FileUploadUI label="Upload Machinery Fleet Images (2-3 Images)" accept="image/*" multiple={true} themeColor={currentTheme.primary} onFileSelect={(f) => setFormData({...formData, orgMachineryImages: f})} />
                                </div>
                            )}

                            {accountType === 'organisation' && formData.categories.includes('Harvested Crops') && (
                                <div style={{ padding: '25px', backgroundColor: '#fff', borderRadius: '16px', border: `1.5px solid ${currentTheme.primary}30`, marginBottom: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                                    <h5 style={{ margin: '0 0 20px', color: currentTheme.primary, fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>🌾 Harvested Crops Supply</h5>
                                    
                                    <InputGroup label="What crops do you supply?" name="orgHarvestCrops" value={formData.orgHarvestCrops} onChange={handleChange} placeholder="e.g. Bulk Rice, Wheat, Sugarcane..." themeColor={currentTheme.primary} />
                                    <InputGroup label="Supply Capacity (e.g. 1000 Quintals/Month)" name="orgHarvestCapacity" value={formData.orgHarvestCapacity} onChange={handleChange} placeholder="Enter expected yield / capacity..." themeColor={currentTheme.primary} />
                                    
                                    <FileUploadUI label="Upload Warehouse/Crop Images (2-3 Images)" accept="image/*" multiple={true} themeColor={currentTheme.primary} onFileSelect={(f) => setFormData({...formData, orgHarvestImages: f})} />
                                </div>
                            )}

                            {accountType === 'organisation' && formData.categories.includes('Agriculture Worker') && (
                                <div style={{ padding: '25px', backgroundColor: '#fff', borderRadius: '16px', border: `1.5px solid ${currentTheme.primary}30`, marginBottom: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                                    <h5 style={{ margin: '0 0 20px', color: currentTheme.primary, fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>👷 Agriculture Worker Supply</h5>
                                    
                                    <InputGroup label="How many workers can you supply?" name="orgWorkerCount" type="number" value={formData.orgWorkerCount} onChange={handleChange} placeholder="e.g. 50" themeColor={currentTheme.primary} />
                                    
                                    <TextAreaGroup 
                                        label="What are their skill sets?" 
                                        name="orgWorkerSkills" 
                                        value={formData.orgWorkerSkills} 
                                        onChange={handleChange} 
                                        placeholder="e.g. General labor, certified pesticide sprayers, heavy machinery operators..." 
                                        themeColor={currentTheme.primary} 
                                    />
                                </div>
                            )}

                            {accountType === 'organisation' && formData.categories.includes('Freelance Services') && (
                                <div style={{ padding: '25px', backgroundColor: '#fff', borderRadius: '16px', border: `1.5px solid ${currentTheme.primary}30`, marginBottom: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                                    <h5 style={{ margin: '0 0 20px', color: currentTheme.primary, fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>💼 Freelance Agency Supply</h5>
                                    
                                    <InputGroup label="How many freelancers/specialists can you supply?" name="orgFreelancerCount" type="number" value={formData.orgFreelancerCount} onChange={handleChange} placeholder="e.g. 10" themeColor={currentTheme.primary} />
                                    
                                    <TextAreaGroup 
                                        label="What are their specific skill sets?" 
                                        name="orgFreelancerSkills" 
                                        value={formData.orgFreelancerSkills} 
                                        onChange={handleChange} 
                                        placeholder="e.g. Agronomists, Drone Pilots, Farm Managers..." 
                                        themeColor={currentTheme.primary} 
                                    />
                                </div>
                            )}

                            {/* Document Upload */}
                            <FileUploadUI 
                                label="Upload ID / Registration Proof (PDF/JPG)"
                                accept=".pdf,image/*"
                                themeColor={currentTheme.primary}
                                onFileSelect={(f) => setFormData({...formData, idProof: f})}
                            />

                            {/* Legal Terms Checkbox */}
                            <div style={{ marginBottom: '30px', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', padding: '15px 20px', borderRadius: '14px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                <input 
                                    type="checkbox" 
                                    required
                                    name="agreedToTerms"
                                    checked={formData.agreedToTerms || false}
                                    onChange={(e) => setFormData({...formData, agreedToTerms: e.target.checked})}
                                    style={{ width: '22px', height: '22px', cursor: 'pointer', flexShrink: 0, marginTop: '2px', accentColor: '#DC2626' }}
                                />
                                <p style={{ margin: 0, fontSize: '13px', color: '#991B1B', lineHeight: '1.5' }}>
                                    I agree to the <a href="#" onClick={(e) => { e.preventDefault(); window.open('/seller-terms', '_blank'); }} style={{ color: '#DC2626', fontWeight: '800', textDecoration: 'underline' }}>FarmCap Seller Terms & Conditions</a>. I acknowledge that I am solely responsible for the quality, safety, and financial transactions of my goods and services.
                                </p>
                            </div>

                            <button 
                                type="button" 
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                style={{ width: '100%', padding: '18px', background: currentTheme.gradient, color: '#fff', border: 'none', borderRadius: '14px', fontWeight: '800', fontSize: '16px', cursor: isSubmitting ? 'not-allowed' : 'pointer', boxShadow: `0 8px 25px ${currentTheme.shadow}`, transition: 'transform 0.2s', letterSpacing: '0.5px', opacity: isSubmitting ? 0.7 : 1 }}>
                                {isSubmitting ? 'Submitting Application...' : 'Submit Profile Application'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// --- Helper Components ---

const SectionTitle = ({ title, icon, theme }) => (
    <div style={{ margin: '35px 0 20px', display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ width: '36px', height: '36px', backgroundColor: theme.bg, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {icon}
        </div>
        <h4 style={{ margin: 0, fontSize: '18px', color: '#0f172a', fontWeight: '800' }}>{title}</h4>
    </div>
);

const InputGroup = ({ label, themeColor = '#0f172a', ...props }) => {
    const [isFocused, setIsFocused] = useState(false);
    
    return (
        <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: isFocused ? themeColor : '#475569', marginBottom: '8px', transition: 'color 0.2s' }}>{label}</label>
            <input 
                required
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                style={{ 
                    width: '100%', 
                    padding: '14px 16px', 
                    backgroundColor: isFocused ? '#fff' : '#f8fafc', 
                    border: `1.5px solid ${isFocused ? themeColor : '#cbd5e1'}`, 
                    borderRadius: '12px', 
                    fontSize: '15px', 
                    color: '#0f172a',
                    fontWeight: '500',
                    boxSizing: 'border-box',
                    outline: 'none',
                    boxShadow: isFocused ? `0 0 0 4px ${themeColor}15` : 'none',
                    transition: 'all 0.2s ease',
                    ...(props.readOnly ? { backgroundColor: '#f1f5f9', color: '#64748b' } : {}),
                    ...props.style
                }} 
                {...props} 
            />
        </div>
    );
};

const SelectGroup = ({ label, themeColor = '#0f172a', options, ...props }) => {
    const [isFocused, setIsFocused] = useState(false);
    return (
        <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: isFocused ? themeColor : '#475569', marginBottom: '8px', transition: 'color 0.2s' }}>{label}</label>
            <select 
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                style={{ 
                    width: '100%', 
                    padding: '14px 16px', 
                    backgroundColor: isFocused ? '#fff' : '#f8fafc', 
                    border: `1.5px solid ${isFocused ? themeColor : '#cbd5e1'}`, 
                    borderRadius: '12px', 
                    fontSize: '15px', 
                    color: '#0f172a',
                    fontWeight: '500',
                    boxSizing: 'border-box',
                    outline: 'none',
                    boxShadow: isFocused ? `0 0 0 4px ${themeColor}15` : 'none',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                }} 
                {...props}
            >
                {options.map((opt, i) => <option key={i} value={opt.value}>{opt.label}</option>)}
            </select>
        </div>
    );
};

const TextAreaGroup = ({ label, themeColor = '#0f172a', ...props }) => {
    const [isFocused, setIsFocused] = useState(false);
    return (
        <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: isFocused ? themeColor : '#475569', marginBottom: '8px', transition: 'color 0.2s' }}>{label}</label>
            <textarea 
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                style={{ 
                    width: '100%', 
                    padding: '14px 16px', 
                    backgroundColor: isFocused ? '#fff' : '#f8fafc', 
                    border: `1.5px solid ${isFocused ? themeColor : '#cbd5e1'}`, 
                    borderRadius: '12px', 
                    fontSize: '15px', 
                    color: '#0f172a',
                    fontWeight: '500',
                    boxSizing: 'border-box',
                    outline: 'none',
                    boxShadow: isFocused ? `0 0 0 4px ${themeColor}15` : 'none',
                    transition: 'all 0.2s ease',
                    minHeight: '100px',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                }} 
                {...props} 
            />
        </div>
    );
};

const FileUploadUI = ({ label, accept, themeColor, onFileSelect, multiple = false }) => {
    const fileInputRef = useRef(null);
    const [fileData, setFileData] = useState(null);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);
            const firstFile = files[0];
            
            // Generate preview URL if it's an image
            if (firstFile.type.startsWith('image/')) {
                const url = URL.createObjectURL(firstFile);
                setFileData({ 
                    name: multiple && files.length > 1 ? `${files.length} files selected` : firstFile.name, 
                    url: url, 
                    isImage: true 
                });
            } else {
                setFileData({ 
                    name: multiple && files.length > 1 ? `${files.length} files selected` : firstFile.name, 
                    url: null, 
                    isImage: false 
                });
            }

            if(onFileSelect) onFileSelect(multiple ? files : firstFile);
        }
    };

    // Cleanup object URL to prevent memory leaks when component unmounts or file changes
    useEffect(() => {
        return () => {
            if (fileData && fileData.url) {
                URL.revokeObjectURL(fileData.url);
            }
        };
    }, [fileData]);

    return (
        <div 
            onClick={() => fileInputRef.current.click()}
            style={{ marginBottom: '20px', padding: '25px 20px', border: `2px dashed ${fileData ? themeColor : '#cbd5e1'}`, borderRadius: '16px', textAlign: 'center', backgroundColor: fileData ? `${themeColor}08` : '#fff', cursor: 'pointer', transition: 'all 0.2s', position: 'relative' }}>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept={accept} multiple={multiple} style={{ display: 'none' }} />
            
            {fileData ? (
                <div>
                    {fileData.isImage ? (
                        <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'center' }}>
                            <img src={fileData.url} alt="Preview" style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', border: `2px solid ${themeColor}` }} />
                        </div>
                    ) : (
                        <CheckCircle2 size={32} color={themeColor} style={{ marginBottom: '10px' }} />
                    )}
                    <p style={{ margin: 0, fontSize: '14px', color: '#0f172a', fontWeight: '700', wordBreak: 'break-all' }}>Selected: {fileData.name}</p>
                    <p style={{ margin: '5px 0 0', fontSize: '12px', color: themeColor, fontWeight: '600' }}>Click to change {multiple ? 'files' : 'file'}</p>
                </div>
            ) : (
                <div>
                    <UploadCloud size={32} color={themeColor} style={{ marginBottom: '10px', opacity: 0.8 }} />
                    <p style={{ margin: 0, fontSize: '14px', color: '#1e293b', fontWeight: '700' }}>{label}</p>
                    <p style={{ margin: '5px 0 0', fontSize: '12px', color: '#64748b' }}>Click to browse files</p>
                </div>
            )}
        </div>
    );
};

export default SellerProfile_Setup;