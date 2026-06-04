import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, User, ShieldCheck, Clock, ChevronLeft, UploadCloud, MapPin, Briefcase, CheckCircle2 } from 'lucide-react';
import { db } from '../../firebase';
import { getAuth } from 'firebase/auth';
import { collection, addDoc, getDoc, doc, deleteDoc, query, where, getDocs } from 'firebase/firestore';
import SellerApplication_Terms from './SellerApplication_Terms';

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
            const auth = getAuth();
            const user = auth.currentUser;
            
            let currentIndId = localStorage.getItem('seller_individual_app_id');
            let currentOrgId = localStorage.getItem('seller_organisation_app_id');

            // --- 1. CLOUD SYNC: Restore state if local storage is missing (e.g., new device) ---
            if (user && (!currentIndId && !currentOrgId)) {
                try {
                    const q = query(collection(db, 'seller_applications'), where('userId', '==', user.uid));
                    const querySnapshot = await getDocs(q);
                    
                    querySnapshot.forEach((docSnap) => {
                        const data = docSnap.data();
                        if (data.accountType === 'individual') {
                            currentIndId = docSnap.id;
                            localStorage.setItem('seller_individual_app_id', currentIndId);
                            localStorage.setItem('seller_app_id', currentIndId);
                        } else if (data.accountType === 'organisation') {
                            currentOrgId = docSnap.id;
                            localStorage.setItem('seller_organisation_app_id', currentOrgId);
                            localStorage.setItem('seller_app_id', currentOrgId);
                        }
                    });
                } catch (error) {
                    console.error("Error syncing applications:", error);
                }
            }

            // --- 2. FETCH LATEST DATA ---
            if (currentIndId) {
                const docSnap = await getDoc(doc(db, 'seller_applications', currentIndId));
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data.status === 'rejected') {
                        localStorage.setItem('cached_reject_ind', data.rejectionReason || "Does not meet requirements");
                        setCachedIndReject(data.rejectionReason || "Does not meet requirements");
                        await deleteDoc(doc(db, 'seller_applications', currentIndId));
                        localStorage.removeItem('seller_individual_app_id');
                        if(localStorage.getItem('seller_app_id') === currentIndId) localStorage.removeItem('seller_app_id');
                    } else {
                        setIndApp(data);
                    }
                } else {
                    localStorage.removeItem('seller_individual_app_id');
                }
            }
            if (currentOrgId) {
                const docSnap = await getDoc(doc(db, 'seller_applications', currentOrgId));
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data.status === 'rejected') {
                        localStorage.setItem('cached_reject_org', data.rejectionReason || "Does not meet requirements");
                        setCachedOrgReject(data.rejectionReason || "Does not meet requirements");
                        await deleteDoc(doc(db, 'seller_applications', currentOrgId));
                        localStorage.removeItem('seller_organisation_app_id');
                        if(localStorage.getItem('seller_app_id') === currentOrgId) localStorage.removeItem('seller_app_id');
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
    }, []);
    
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
    const [showTermsModal, setShowTermsModal] = useState(false);


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
            // Generate an absolutely unique alphanumeric Seller ID based on account type
            const timestampPart = Date.now().toString(36).toUpperCase();
            const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
            const prefix = accountType === 'individual' ? 'SIN' : 'ORG';
            const sellerId = `${prefix}-${timestampPart}-${randomPart}`;
            
            const auth = getAuth();
            const user = auth.currentUser;

            // Clean up formData by removing File objects (they cause Firestore errors without Storage upload)
            const submissionData = { 
                ...formData, 
                phone: `+91 ${formData.phone}`,
                emergencyPhone: formData.emergencyPhone ? `+91 ${formData.emergencyPhone}` : '',
                sellerId: sellerId, 
                userId: user ? user.uid : null,
                status: 'pending_approval', 
                accountType: accountType, 
                submittedAt: new Date().toISOString() 
            };
            
            delete submissionData.profilePic;
            delete submissionData.organicCertificate;
            delete submissionData.machineryImages;
            delete submissionData.idProof;
            delete submissionData.orgProduceImages;
            delete submissionData.orgMachineryImages;
            delete submissionData.orgHarvestImages;

            // STRICT FIX: Force the Document ID to perfectly match the generated sellerId
            // And use setDoc to specify that explicit ID in the database
            await setDoc(doc(db, 'seller_applications', sellerId), submissionData);
            
            // Set local storage using the exact sellerId (both specific and global tracker)
            if (accountType === 'individual') {
                localStorage.setItem('seller_individual_app_id', sellerId);
            } else {
                localStorage.setItem('seller_organisation_app_id', sellerId);
            }
            localStorage.setItem('seller_app_id', sellerId);
            
            alert(`Application Submitted Successfully!\n\nYour Seller ID is: ${sellerId}\n\nOur Admin team will review your application shortly.`);
            
            setApplicationStatus('pending');navigate('/Seller_HomePage');
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
        <div style={{ backgroundColor: '#f8fafc', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100dvh', overflowY: 'auto', overflowX: 'hidden', touchAction: 'pan-y', WebkitOverflowScrolling: 'touch', paddingBottom: '60px' }}>
            <style>{`
                .custom-input::placeholder {
                    font-size: 13px !important;
                    font-weight: 500 !important;
                    color: #94a3b8 !important;
                }
            `}</style>
            
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

            <div style={{ padding: '10px 2%', maxWidth: '100%', margin: '0 auto', display: showTermsModal ? 'none' : 'block' }}>
                
                {/* Step 1: Choose Account Type */}
                {!accountType ? (
                    loadingData ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading profile status...</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <h3 style={{ margin: '10px 0', fontSize: '18px', color: '#1e293b', fontWeight: '800' }}>Select Account Type</h3>
                            
                            {/* INDIVIDUAL CARD */}
                            {indApp?.status === 'approved' ? (
                                <div style={{ backgroundColor: '#ecfdf5', padding: '20px', borderRadius: '16px', border: '1px solid #10b981', display: 'flex', gap: '16px', alignItems: 'center' }}>
                                    <div style={{ width: '48px', height: '48px', backgroundColor: '#10b981', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <ShieldCheck size={24} color="#fff" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                                            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#065f46' }}>Single Person</h4>
                                            <span style={{ fontSize: '10px', background: '#34d399', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>Approved</span>
                                        </div>
                                        <p style={{ margin: 0, fontSize: '13px', color: '#047857' }}>ID: {indApp.sellerId}</p>
                                    </div>
                                </div>
                            ) : (
                                <div 
                                    onClick={() => {
                                        if (indApp?.status === 'pending_approval') alert("Your Individual Profile application is under review.");
                                        else setAccountType('individual');
                                    }}
                                    style={{ background: '#fff', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', cursor: indApp?.status === 'pending_approval' ? 'not-allowed' : 'pointer', opacity: indApp?.status === 'pending_approval' ? 0.7 : 1, border: '1.5px solid #f1f5f9', position: 'relative', overflow: 'hidden', display: 'flex', gap: '16px', alignItems: 'center', transition: 'all 0.2s ease' }}
                                >
                                    <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#0284c7' }}></div>
                                    <div style={{ width: '48px', height: '48px', background: '#f0f9ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <User size={24} color="#0284c7" strokeWidth={2.5} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                                            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Single Person</h4>
                                            {indApp?.status === 'pending_approval' ? (
                                                <span style={{ fontSize: '10px', fontWeight: '800', color: '#d97706', textTransform: 'uppercase', background: '#fffbeb', padding: '2px 6px', borderRadius: '4px' }}>Pending</span>
                                            ) : cachedIndReject ? (
                                                <span style={{ fontSize: '10px', fontWeight: '800', color: '#dc2626', textTransform: 'uppercase', background: '#fef2f2', padding: '2px 6px', borderRadius: '4px' }}>Rejected</span>
                                            ) : (
                                                <span style={{ fontSize: '10px', fontWeight: '800', color: '#0284c7', textTransform: 'uppercase', background: '#e0f2fe', padding: '2px 6px', borderRadius: '4px' }}>Individual</span>
                                            )}
                                        </div>
                                        <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.4' }}>Designed for independent farmers, sole machinery owners, or individual gig workers.</p>
                                        {cachedIndReject && <button style={{ margin: '8px 0 0', padding: '6px 12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>Re-apply</button>}
                                    </div>
                                </div>
                            )}

                            {/* ORGANISATION CARD */}
                            {orgApp?.status === 'approved' ? (
                                <div style={{ backgroundColor: '#ecfdf5', padding: '20px', borderRadius: '16px', border: '1px solid #10b981', display: 'flex', gap: '16px', alignItems: 'center' }}>
                                    <div style={{ width: '48px', height: '48px', backgroundColor: '#10b981', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <ShieldCheck size={24} color="#fff" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                                            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#065f46' }}>Organisation</h4>
                                            <span style={{ fontSize: '10px', background: '#34d399', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>Approved</span>
                                        </div>
                                        <p style={{ margin: 0, fontSize: '13px', color: '#047857' }}>ID: {orgApp.sellerId}</p>
                                    </div>
                                </div>
                            ) : (
                                <div 
                                    onClick={() => {
                                        if (orgApp?.status === 'pending_approval') alert("Your Organisation Profile application is under review.");
                                        else setAccountType('organisation');
                                    }}
                                    style={{ background: '#fff', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', cursor: orgApp?.status === 'pending_approval' ? 'not-allowed' : 'pointer', opacity: orgApp?.status === 'pending_approval' ? 0.7 : 1, border: '1.5px solid #f1f5f9', position: 'relative', overflow: 'hidden', display: 'flex', gap: '16px', alignItems: 'center', transition: 'all 0.2s ease' }}
                                >
                                    <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#4338ca' }}></div>
                                    <div style={{ width: '48px', height: '48px', background: '#e0e7ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Building2 size={24} color="#4338ca" strokeWidth={2.5} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                                            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Organisation</h4>
                                            {orgApp?.status === 'pending_approval' ? (
                                                <span style={{ fontSize: '10px', fontWeight: '800', color: '#d97706', textTransform: 'uppercase', background: '#fffbeb', padding: '2px 6px', borderRadius: '4px' }}>Pending</span>
                                            ) : cachedOrgReject ? (
                                                <span style={{ fontSize: '10px', fontWeight: '800', color: '#dc2626', textTransform: 'uppercase', background: '#fef2f2', padding: '2px 6px', borderRadius: '4px' }}>Rejected</span>
                                            ) : (
                                                <span style={{ fontSize: '10px', fontWeight: '800', color: '#4338ca', textTransform: 'uppercase', background: '#e0e7ff', padding: '2px 6px', borderRadius: '4px' }}>Company</span>
                                            )}
                                        </div>
                                        <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.4' }}>Ideal for registered farming co-ops, equipment rental agencies, and large suppliers.</p>
                                        {cachedOrgReject && <button style={{ margin: '8px 0 0', padding: '6px 12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>Re-apply</button>}
                                    </div>
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

                        <div style={{ padding: '24px 24px' }}>
                            
                            {/* Personal/Business Info Section */}
                            <SectionTitle title="Identity Details" icon={<User size={20} color={currentTheme.primary} />} theme={currentTheme} />
                            
                            {/* Profile / Logo Upload UI */}
                            <FileUploadUI 
                                label={accountType === 'individual' ? "Upload Profile Photo" : "Upload Company Logo"}
                                accept="image/*"
                                themeColor={currentTheme.primary}
                                onFileSelect={(file) => setFormData({...formData, profilePic: file})}
                            />
                            
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px' }}>
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
                                        <InputGroup label="GST / Registration Number" name="gstNumber" value={formData.gstNumber} onChange={handleChange} placeholder="GSTIN / CIN" themeColor={currentTheme.primary} />
                                    </>
                                )}
                                <InputGroup label="Business Email Address" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="store@example.com" themeColor={currentTheme.primary} />
                                <InputGroup label="Primary Phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="9876543210" maxLength="10" prefix="+91" themeColor={currentTheme.primary} />
                                <InputGroup label="Emergency Phone" name="emergencyPhone" type="tel" value={formData.emergencyPhone} onChange={handleChange} placeholder="9876543210" maxLength="10" prefix="+91" themeColor={currentTheme.primary} />
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '24px 0 16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ color: currentTheme.primary, display: 'flex' }}><MapPin size={20} /></div>
                                    <h4 style={{ margin: 0, fontSize: '14px', color: '#0f172a', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Location</h4>
                                </div>
                                <button type="button" onClick={handleAutoDetectLocation} disabled={isDetecting} style={{ padding: '10px 20px', background: currentTheme.primary, color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: `0 4px 10px ${currentTheme.shadow}` }}>
                                    {isDetecting ? 'Detecting...' : '📍 Auto-Detect GPS'}
                                </button>
                            </div>

                            {/* Read-Only Coordinates */}
                            {formData.lat && formData.lng && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                                    <InputGroup label="Latitude (Auto)" readOnly value={formData.lat} themeColor={currentTheme.primary} style={{ backgroundColor: '#f1f5f9', color: '#64748b' }} />
                                    <InputGroup label="Longitude (Auto)" readOnly value={formData.lng} themeColor={currentTheme.primary} style={{ backgroundColor: '#f1f5f9', color: '#64748b' }} />
                                </div>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
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
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>What services do you plan to offer?</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {['Farm Fresh Produce', 'Harvested Crops', 'Machinery Rental', 'Agriculture Worker', 'Freelance Services', 'Local Agri Goods & Products', 'Not Sure'].map(cat => (
                                        <div 
                                            key={cat}
                                            onClick={() => handleCategoryToggle(cat)}
                                            style={{ 
                                                padding: '6px 12px', 
                                                borderRadius: '8px', 
                                                fontSize: '12px', 
                                                fontWeight: '700', 
                                                cursor: 'pointer',
                                                backgroundColor: formData.categories.includes(cat) ? currentTheme.primary : '#f8fafc',
                                                color: formData.categories.includes(cat) ? '#fff' : '#475569',
                                                border: formData.categories.includes(cat) ? `1px solid ${currentTheme.primary}` : '1px solid #e2e8f0',
                                                transition: 'all 0.2s ease',
                                                boxShadow: formData.categories.includes(cat) ? `0 2px 8px ${currentTheme.shadow}` : 'none'
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
                                    I agree to the <span onClick={() => setShowTermsModal(true)} style={{ color: '#DC2626', fontWeight: '800', textDecoration: 'underline', cursor: 'pointer' }}>FarmCap Seller Registration Terms</span>. I confirm that all provided details are 100% accurate and belong to me.
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

            {/* Terms Modal Overlay */}
            {showTermsModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999999, backgroundColor: '#fff', overflowY: 'auto' }}>
                    <SellerApplication_Terms isModal={true} onClose={() => setShowTermsModal(false)} />
                </div>
            )}
        </div>
    );
}

const SectionTitle = ({ title, icon, theme }) => (
    <div style={{ margin: '24px 0 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ color: theme.primary, display: 'flex' }}>{icon}</div>
        <h4 style={{ margin: 0, fontSize: '14px', color: '#000', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</h4>
        <div style={{ flex: 1, height: '1px', background: `linear-gradient(90deg, ${theme.primary}30, transparent)`, marginLeft: '10px' }}></div>
    </div>
);

const InputGroup = ({ label, themeColor = '#0f172a', prefix, ...props }) => {
    const [isFocused, setIsFocused] = useState(false);
    return (
        <div style={{ position: 'relative', marginBottom: '14px', backgroundColor: '#f8fafc', borderRadius: '10px', border: `2px solid ${isFocused ? themeColor : '#e2e8f0'}`, transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', overflow: 'hidden', boxShadow: isFocused ? `0 0 0 3px ${themeColor}15` : 'none' }}>
            {prefix && <span style={{ paddingLeft: '14px', color: '#64748b', fontWeight: '700', fontSize: '14px' }}>{prefix}</span>}
            <div style={{ flex: 1, padding: '8px 14px 6px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: isFocused ? themeColor : '#000', textTransform: 'uppercase', letterSpacing: '0.5px', transition: 'color 0.2s', marginBottom: '2px' }}>{label}</label>
                <input 
                    className="custom-input"
                    required
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    style={{ width: '100%', padding: '4px 0', backgroundColor: 'transparent', border: 'none', fontSize: '15px', color: '#000', fontWeight: '800', outline: 'none', ...(props.readOnly ? { color: '#94a3b8' } : {}), ...props.style }} 
                    {...props} 
                />
            </div>
        </div>
    );
};

const SelectGroup = ({ label, themeColor = '#0f172a', options, ...props }) => {
    const [isFocused, setIsFocused] = useState(false);
    return (
        <div style={{ position: 'relative', marginBottom: '14px', backgroundColor: '#f8fafc', borderRadius: '10px', border: `2px solid ${isFocused ? themeColor : '#e2e8f0'}`, transition: 'all 0.2s ease', padding: '8px 14px 6px', boxShadow: isFocused ? `0 0 0 3px ${themeColor}15` : 'none' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: isFocused ? themeColor : '#000', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>{label}</label>
            <select 
                className="custom-input"
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                style={{ width: '100%', padding: '4px 0', backgroundColor: 'transparent', border: 'none', fontSize: '15px', color: '#000', fontWeight: '800', outline: 'none', cursor: 'pointer' }} 
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
        <div style={{ position: 'relative', marginBottom: '14px', backgroundColor: '#f8fafc', borderRadius: '10px', border: `2px solid ${isFocused ? themeColor : '#e2e8f0'}`, transition: 'all 0.2s ease', padding: '8px 14px 6px', boxShadow: isFocused ? `0 0 0 3px ${themeColor}15` : 'none' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: isFocused ? themeColor : '#000', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{label}</label>
            <textarea 
                className="custom-input"
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                style={{ width: '100%', padding: '4px 0', backgroundColor: 'transparent', border: 'none', fontSize: '15px', color: '#000', fontWeight: '800', outline: 'none', minHeight: '80px', fontFamily: 'inherit', resize: 'vertical' }} 
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
            
            if (firstFile.type.startsWith('image/')) {
                setFileData({ name: multiple && files.length > 1 ? `${files.length} files selected` : firstFile.name, url: URL.createObjectURL(firstFile), isImage: true });
            } else {
                setFileData({ name: multiple && files.length > 1 ? `${files.length} files selected` : firstFile.name, url: null, isImage: false });
            }

            if(onFileSelect) onFileSelect(multiple ? files : firstFile);
        }
    };

    useEffect(() => {
        return () => {
            if (fileData && fileData.url) URL.revokeObjectURL(fileData.url);
        };
    }, [fileData]);

    return (
        <div 
            onClick={() => fileInputRef.current.click()}
            style={{ marginBottom: '16px', padding: '12px 14px', border: `1.5px dashed ${fileData ? themeColor : '#cbd5e1'}`, borderRadius: '12px', backgroundColor: fileData ? `${themeColor}08` : '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s ease', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.01)' }}>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept={accept} multiple={multiple} style={{ display: 'none' }} />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {fileData && fileData.isImage ? (
                        <img src={fileData.url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <UploadCloud size={18} color={fileData ? themeColor : "#64748b"} />
                    )}
                </div>
                <div>
                    <p style={{ margin: 0, fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</p>
                    <p style={{ margin: '2px 0 0', fontSize: '13px', fontWeight: '700', color: fileData ? themeColor : '#0f172a' }}>{fileData ? fileData.name : 'Tap to select file...'}</p>
                </div>
            </div>
            {fileData && <CheckCircle2 size={20} color={themeColor} />}
        </div>
    );
};

export default SellerProfile_Setup;