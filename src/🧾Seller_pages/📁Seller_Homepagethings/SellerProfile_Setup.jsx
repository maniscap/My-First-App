import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, User, ShieldCheck, Clock, ChevronLeft, UploadCloud, MapPin, Briefcase, CheckCircle2, Trash2, AlertTriangle, Edit3, RefreshCw } from 'lucide-react';
import { db } from '../../firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, getDoc, doc, setDoc, deleteDoc, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import SellerApplication_Terms from './SellerApplication_Terms';
import imageCompression from 'browser-image-compression';
import axios from 'axios';

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
        let unsubInd = () => {};
        let unsubOrg = () => {};
        let isComponentMounted = true;

        const unsubscribeAuth = onAuthStateChanged(getAuth(), async (user) => {
            if (!isComponentMounted) return;
            
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

            // --- LOCAL NOTIFICATION HELPER ---
            const processNotification = (data) => {
                const prevStatus = localStorage.getItem('seller_app_status');
                const prevEdit = localStorage.getItem('seller_app_pending_edit') === 'true';
                
                const addNotif = (title, msg, type) => {
                    try {
                        const notifs = JSON.parse(localStorage.getItem('seller_notifications') || '[]');
                        notifs.unshift({ id: Date.now().toString(), title, message: msg, type, timestamp: new Date().toISOString(), isRead: false });
                        localStorage.setItem('seller_notifications', JSON.stringify(notifs));
                        window.dispatchEvent(new Event('seller_notifications_updated'));
                    } catch (e) {
                        console.error("Error parsing notifications:", e);
                    }
                };

                if (prevStatus && prevStatus !== data.status) {
                    if (data.status === 'approved') addNotif('Application Approved', 'Congratulations! Your seller application has been approved.', 'success');
                    if (data.status === 'rejected') addNotif('Application Rejected', data.rejectionReason || 'Please check your application details.', 'error');
                    if (data.status === 'deleted_by_admin') addNotif('Account Deleted', `Reason: ${data.deletionReason || 'Admin Action'}. Message: ${data.deletionMessage || ''}`, 'error');
                }

                if (prevEdit && !data.hasPendingEdit) {
                    if (data.lastEditAction === 'rejected') {
                        addNotif('Edit Request Rejected', 'Your profile edit request was rejected by the admin. Your live profile remains unchanged.', 'error');
                    } else {
                        addNotif('✓✓✓ Edit Request Approved', 'Your profile edit request has been approved and applied to your live profile.', 'success');
                    }
                }

                localStorage.setItem('seller_app_status', data.status);
                localStorage.setItem('seller_app_pending_edit', data.hasPendingEdit ? 'true' : 'false');
            };

            // --- 2. FETCH LATEST DATA VIA SNAPSHOT ---
            if (currentIndId) {
                unsubInd = onSnapshot(doc(db, 'seller_applications', currentIndId), async (docSnap) => {
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        processNotification(data);
                        if (data.status === 'deleted_by_admin') {
                            localStorage.setItem('seller_app_deleted_reason', data.deletionReason || 'Violation of terms');
                            localStorage.setItem('seller_app_deleted_msg', data.deletionMessage || '');
                            localStorage.setItem('seller_app_status', 'permanently_deleted');
                            await deleteDoc(doc(db, 'seller_applications', currentIndId));
                            window.location.href = '/seller-home'; // Let the home page render the massive red screen
                            return;
                        } else if (data.status === 'rejected') {
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
                    if (!currentOrgId && isComponentMounted) setLoadingData(false);
                }, (error) => {
                    console.error("Error fetching individual app:", error);
                    if (!currentOrgId && isComponentMounted) setLoadingData(false);
                });
            } else {
                if (!currentOrgId && isComponentMounted) setLoadingData(false);
            }

            if (currentOrgId) {
                unsubOrg = onSnapshot(doc(db, 'seller_applications', currentOrgId), async (docSnap) => {
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        processNotification(data);
                        if (data.status === 'deleted_by_admin') {
                            localStorage.setItem('seller_app_deleted_reason', data.deletionReason || 'Violation of terms');
                            localStorage.setItem('seller_app_deleted_msg', data.deletionMessage || '');
                            localStorage.setItem('seller_app_status', 'permanently_deleted');
                            await deleteDoc(doc(db, 'seller_applications', currentOrgId));
                            window.location.href = '/seller-home'; // Let the home page render the massive red screen
                            return;
                        } else if (data.status === 'rejected') {
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
                    if (isComponentMounted) setLoadingData(false);
                }, (error) => {
                    console.error("Error fetching organisation app:", error);
                    if (isComponentMounted) setLoadingData(false);
                });
            }
        });

        return () => { 
            isComponentMounted = false;
            unsubscribeAuth();
            unsubInd(); 
            unsubOrg(); 
        };
    }, []);
    
    // Form Data State
    const [formData, setFormData] = useState({
        phone: '', emergencyPhone: '', email: '', shopName: '', ownerName: '',
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
    const [isEditingMode, setIsEditingMode] = useState(false);


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
                    const res = await axios.post('/api/UserLocation', { action: 'reverseGeocode', lat: latitude, lng: longitude });
                    const data = res.data;
                    if (data.addresses && data.addresses.length > 0) {
                        const addr = data.addresses[0].address;
                        setFormData(prev => ({
                            ...prev,
                            lat: latitude.toFixed(6),
                            lng: longitude.toFixed(6),
                            pincode: addr.postalCode || addr.postcode || prev.pincode,
                            state: addr.countrySubdivision || prev.state,
                            district: addr.countrySecondarySubdivision || addr.municipality || prev.district,
                            nearerCity: addr.municipality || prev.nearerCity,
                            village: addr.municipalitySubdivision || prev.village,
                            houseNumber: prev.houseNumber,
                            landmark: addr.streetName || prev.landmark
                        }));
                    } else {
                        throw new Error("No results from TomTom");
                    }
                } catch (tomTomError) {
                    console.warn("TomTom failed in Seller Setup. Falling back to OSM...", tomTomError);
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
                    } catch (osmError) {
                        console.error("Geocoding failed", osmError);
                        alert("Failed to auto-detect full address. Please enter manually.");
                    }
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
            if (!formData.shopName.trim()) { alert("Please enter your Shop Name."); return; }
            if (!formData.ownerName.trim()) { alert("Please enter the Owner Name."); return; }
            if (!formData.fullName.trim()) { alert("Please enter your Full Legal Name."); return; }
            if (!formData.aadharNumber.trim()) { alert("Please enter your Aadhar / Govt ID Number."); return; }
        } else {
            if (!formData.companyName.trim()) { alert("Please enter your Organisation Name."); return; }
            if (!formData.ownerName.trim()) { alert("Please enter the Owner Name."); return; }
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
                phone: formData.phone.startsWith('+91') ? formData.phone : `+91 ${formData.phone}`,
                emergencyPhone: formData.emergencyPhone ? (formData.emergencyPhone.startsWith('+91') ? formData.emergencyPhone : `+91 ${formData.emergencyPhone}`) : '',
                sellerId: isEditingMode ? formData.sellerId : sellerId, 
                userId: user ? user.uid : null,
                status: isEditingMode ? formData.status : 'pending_approval', 
                accountType: accountType, 
                submittedAt: formData.submittedAt || new Date().toISOString() 
            };
            
            delete submissionData.profilePic;
            delete submissionData.organicCertificate;
            delete submissionData.machineryImages;
            delete submissionData.idProof;
            delete submissionData.orgProduceImages;
            delete submissionData.orgMachineryImages;
            delete submissionData.orgHarvestImages;

            if (isEditingMode) {
                // Fetch live data to verify if changes were actually made
                const liveDocRef = doc(db, 'seller_applications', submissionData.sellerId);
                const liveDocSnap = await getDoc(liveDocRef);
                
                if (liveDocSnap.exists()) {
                    const liveData = liveDocSnap.data();
                    let hasChanges = false;
                    
                    const fieldsToCheck = [
                        'shopName', 'companyName', 'ownerName', 'fullName', 'aadharNumber', 'gstNumber', 
                        'email', 'phone', 'emergencyPhone', 'village', 'mandal', 'district', 'state', 'pincode', 'description'
                    ];

                    for (const field of fieldsToCheck) {
                        if ((submissionData[field] || '') !== (liveData[field] || '')) {
                            hasChanges = true;
                            break;
                        }
                    }

                    if (!hasChanges && JSON.stringify(submissionData.categories || []) !== JSON.stringify(liveData.categories || [])) {
                        hasChanges = true;
                    }

                    if (!hasChanges) {
                        alert("No changes were detected. Your application remains unmodified.");
                        setIsSubmitting(false);
                        return;
                    }
                }

                // Submit as an Edit Request
                await setDoc(liveDocRef, {
                    hasPendingEdit: true,
                    editData: submissionData
                }, { merge: true });
                
                alert(`Edit Request Submitted Successfully!\n\nOur Admin team will review your changes shortly. Your live profile will remain unchanged until approved.`);
                setIsEditingMode(false);
                setAccountType(null); // Go back to selection screen
            } else {
                // New Application
                await setDoc(doc(db, 'seller_applications', sellerId), submissionData);
                
                if (accountType === 'individual') {
                    localStorage.setItem('seller_individual_app_id', sellerId);
                } else {
                    localStorage.setItem('seller_organisation_app_id', sellerId);
                }
                localStorage.setItem('seller_app_id', sellerId);
                
                alert(`Application Submitted Successfully!\n\nYour Seller ID is: ${sellerId}\n\nOur Admin team will review your application shortly.`);
                setApplicationStatus('pending');
                navigate('/Seller_HomePage');
            }
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
        <div style={{ backgroundColor: '#f8fafc', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100dvh', overflowY: 'auto', overflowX: 'hidden', touchAction: 'pan-y', WebkitOverflowScrolling: 'touch', paddingBottom: '20px', display: 'flex', flexDirection: 'column' }}>
            <style>{`
                .custom-input::placeholder {
                    font-size: 13px !important;
                    font-weight: 400 !important;
                    font-style: italic !important;
                    color: #94a3b8 !important;
                }
            `}</style>
            
            {/* Header */}
            <div style={{ backgroundColor: '#0f172a', color: '#fff', padding: '16px 20px', borderBottomLeftRadius: '20px', borderBottomRightRadius: '20px', boxShadow: accountType ? 'none' : '0 4px 15px rgba(0,0,0,0.1)', transition: 'all 0.3s ease' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div onClick={() => navigate(-1)} style={{ cursor: 'pointer', padding: '5px' }}>
                            <ChevronLeft size={24} />
                        </div>
                        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Seller Registration</h1>
                    </div>
                    <div onClick={() => window.location.reload()} style={{ cursor: 'pointer', padding: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s' }} onMouseDown={(e) => e.currentTarget.style.transform = 'rotate(180deg)'} onMouseUp={(e) => e.currentTarget.style.transform = 'rotate(0deg)'}>
                        <RefreshCw size={20} color="#fff" />
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 10px' }}>
                    <ShieldCheck size={40} color="#4CAF50" style={{ flexShrink: 0 }} />
                    <div>
                        <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>Secure Verification</h2>
                        <p style={{ margin: '5px 0 0', fontSize: '13px', color: '#94a3b8', lineHeight: '1.4' }}>To maintain a high-quality marketplace, all sellers must be verified.</p>
                    </div>
                </div>
            </div>

            <div style={{ padding: accountType ? '0 2%' : '16px 2%', maxWidth: '100%', margin: '0 auto', display: showTermsModal ? 'none' : 'flex', flexDirection: 'column', flex: 1, width: '100%', boxSizing: 'border-box', transition: 'all 0.3s ease' }}>
                
                {/* Step 1: Choose Account Type */}
                {!accountType ? (
                    loadingData ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading profile status...</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                            <h3 style={{ margin: '10px 0', fontSize: '18px', color: '#1e293b', fontWeight: '800' }}>Select Account Type</h3>
                            
                            {(() => {
                                const isIndActive = indApp?.status === 'pending_approval' || indApp?.status === 'approved';
                                const isOrgActive = orgApp?.status === 'pending_approval' || orgApp?.status === 'approved';
                                
                                return (
                                    <>
                                        {/* INDIVIDUAL CARD */}
                            {indApp?.status === 'approved' ? (
                                <div style={{ backgroundColor: '#ecfdf5', padding: '20px', borderRadius: '16px', border: '1px solid #10b981', display: 'flex', gap: '16px', alignItems: 'flex-start', position: 'relative' }}>
                                    <div style={{ width: '48px', height: '48px', backgroundColor: '#10b981', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <ShieldCheck size={24} color="#fff" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '4px', justifyContent: 'space-between' }}>
                                            <div>
                                                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#065f46' }}>{indApp.shopName || indApp.fullName || "Single Person"}</h4>
                                                <span style={{ fontSize: '11px', color: '#059669', fontWeight: 'bold', display: 'block', marginTop: '2px' }}>Single Person Account</span>
                                            </div>
                                            <span style={{ fontSize: '10px', background: '#34d399', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>Approved</span>
                                        </div>
                                        <p style={{ margin: 0, fontSize: '13px', color: '#047857', fontWeight: '700' }}>ID: {indApp.sellerId}</p>
                                        {indApp.district && <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#065f46' }}>📍 {indApp.district}, {indApp.state}</p>}
                                        
                                        {indApp.hasPendingEdit ? (
                                            <div style={{ marginTop: '12px', padding: '8px 12px', background: '#fef3c7', borderRadius: '8px', border: '1px solid #fcd34d' }}>
                                                <p style={{ margin: 0, fontSize: '12px', color: '#d97706', fontWeight: '700' }}>⏳ Edit Request Under Review</p>
                                                <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#b45309' }}>Your changes are being verified.</p>
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={() => {
                                                    setFormData({
                                                        ...indApp,
                                                        phone: indApp.phone ? indApp.phone.replace('+91 ', '') : '',
                                                        emergencyPhone: indApp.emergencyPhone ? indApp.emergencyPhone.replace('+91 ', '') : ''
                                                    });
                                                    setIsEditingMode(true);
                                                    setAccountType('individual');
                                                }}
                                                style={{ marginTop: '12px', padding: '6px 12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                            >
                                                <Edit3 size={14} /> Edit Profile Info
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div 
                                    onClick={() => {
                                        if (isOrgActive) alert("You already have an active Organisation account. Only one account type is allowed per user.");
                                        else if (indApp?.status === 'pending_approval') alert("Your Individual Profile application is under review.");
                                        else setAccountType('individual');
                                    }}
                                    style={{ background: '#fff', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', cursor: (indApp?.status === 'pending_approval' || isOrgActive) ? 'not-allowed' : 'pointer', opacity: isOrgActive ? 0.5 : 1, border: '1.5px solid #f1f5f9', position: 'relative', overflow: 'hidden', display: 'flex', gap: '16px', alignItems: 'center', transition: 'all 0.2s ease', filter: isOrgActive ? 'grayscale(100%)' : 'none' }}
                                >
                                    <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#0284c7' }}></div>
                                    <div style={{ width: '48px', height: '48px', background: '#f0f9ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <User size={24} color="#0284c7" strokeWidth={2.5} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                                            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>{indApp?.shopName || indApp?.fullName || "Single Person"}</h4>
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
                                        {isOrgActive && (
                                            <p style={{ margin: '8px 0 0', fontSize: '11px', color: '#ef4444', fontWeight: 'bold' }}>🔒 Locked: You have an active Organisation account.</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ORGANISATION CARD */}
                            {orgApp?.status === 'approved' ? (
                                <div style={{ backgroundColor: '#ecfdf5', padding: '20px', borderRadius: '16px', border: '1px solid #10b981', display: 'flex', gap: '16px', alignItems: 'flex-start', position: 'relative' }}>
                                    <div style={{ width: '48px', height: '48px', backgroundColor: '#10b981', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <ShieldCheck size={24} color="#fff" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '4px', justifyContent: 'space-between' }}>
                                            <div>
                                                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#065f46' }}>{orgApp.companyName || "Organisation"}</h4>
                                                <span style={{ fontSize: '11px', color: '#059669', fontWeight: 'bold', display: 'block', marginTop: '2px' }}>Organisation Account</span>
                                            </div>
                                            <span style={{ fontSize: '10px', background: '#34d399', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>Approved</span>
                                        </div>
                                        <p style={{ margin: 0, fontSize: '13px', color: '#047857', fontWeight: '700' }}>ID: {orgApp.sellerId}</p>
                                        {orgApp.district && <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#065f46' }}>📍 {orgApp.district}, {orgApp.state}</p>}
                                        
                                        {orgApp.hasPendingEdit ? (
                                            <div style={{ marginTop: '12px', padding: '8px 12px', background: '#fef3c7', borderRadius: '8px', border: '1px solid #fcd34d' }}>
                                                <p style={{ margin: 0, fontSize: '12px', color: '#d97706', fontWeight: '700' }}>⏳ Edit Request Under Review</p>
                                                <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#b45309' }}>Your changes are being verified.</p>
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={() => {
                                                    setFormData({
                                                        ...orgApp,
                                                        phone: orgApp.phone ? orgApp.phone.replace('+91 ', '') : '',
                                                        emergencyPhone: orgApp.emergencyPhone ? orgApp.emergencyPhone.replace('+91 ', '') : ''
                                                    });
                                                    setIsEditingMode(true);
                                                    setAccountType('organisation');
                                                }}
                                                style={{ marginTop: '12px', padding: '6px 12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                            >
                                                <Edit3 size={14} /> Edit Profile Info
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div 
                                    onClick={() => {
                                        if (isIndActive) alert("You already have an active Individual account. Only one account type is allowed per user.");
                                        else if (orgApp?.status === 'pending_approval') alert("Your Organisation Profile application is under review.");
                                        else setAccountType('organisation');
                                    }}
                                    style={{ background: '#fff', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', cursor: (orgApp?.status === 'pending_approval' || isIndActive) ? 'not-allowed' : 'pointer', opacity: isIndActive ? 0.5 : 1, border: '1.5px solid #f1f5f9', position: 'relative', overflow: 'hidden', display: 'flex', gap: '16px', alignItems: 'center', transition: 'all 0.2s ease', filter: isIndActive ? 'grayscale(100%)' : 'none' }}
                                >
                                    <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#4338ca' }}></div>
                                    <div style={{ width: '48px', height: '48px', background: '#e0e7ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Building2 size={24} color="#4338ca" strokeWidth={2.5} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                                            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>{orgApp?.companyName || "Organisation"}</h4>
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
                                        {isIndActive && (
                                            <p style={{ margin: '8px 0 0', fontSize: '11px', color: '#ef4444', fontWeight: 'bold' }}>🔒 Locked: You have an active Individual account.</p>
                                        )}
                                    </div>
                                </div>
                            )}
                                    </>
                                );
                            })()}

                            {/* Delete Seller Account Button */}
                            <div style={{ marginTop: 'auto', paddingTop: '40px', display: 'flex', justifyContent: 'center' }}>
                                <button 
                                    onClick={() => navigate('/seller-delete-account')} 
                                    style={{ background: '#fef2f2', border: '1.5px solid #fecaca', color: '#ef4444', padding: '12px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s ease', fontFamily: "'Inter', sans-serif" }}>
                                    <Trash2 size={18} /> Delete Seller Account & ALL Data
                                </button>
                            </div>
                        </div>
                    )
                ) : (
                    
                    /* Step 2: Fill Details with Dynamic Theme */
                    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>

                        {/* Form Sub-Header — curved top to mirror the dark nav header's bottom curves */}
                        <div style={{ background: currentTheme.gradient, padding: '18px 20px 22px', color: '#fff', display: 'flex', alignItems: 'center', gap: '14px', borderTopLeftRadius: '20px', borderTopRightRadius: '20px', boxShadow: `0 4px 20px ${currentTheme.shadow}`, marginTop: '12px' }}>
                            <button type="button" onClick={() => { setAccountType(null); setIsEditingMode(false); }} style={{ background: 'rgba(255,255,255,0.18)', border: 'none', color: '#fff', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                                <ChevronLeft size={20} />
                            </button>
                            <div style={{ width: '42px', height: '42px', backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                {React.cloneElement(currentTheme.icon, { size: 22, color: '#fff' })}
                            </div>
                            <div>
                                <p style={{ margin: '0 0 2px', fontSize: '11px', fontWeight: '600', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Seller Registration</p>
                                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800' }}>{currentTheme.title}</h3>
                            </div>
                        </div>

                        {/* Form Body */}
                        <div style={{ padding: '20px 16px 32px', display: 'flex', flexDirection: 'column' }}>

                            {/* Profile Photo */}
                            <p style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: '600', color: '#374151', fontFamily: "'Inter', sans-serif" }}>
                                {accountType === 'individual' ? 'Profile Photo' : 'Company Logo'}
                            </p>
                            <FileUploadUI
                                label={accountType === 'individual' ? "Upload Profile Photo" : "Upload Company Logo"}
                                accept="image/*"
                                themeColor={currentTheme.primary}
                                onFileSelect={(file) => setFormData({...formData, profilePic: file})}
                            />

                            {/* Verification Document */}
                            <p style={{ margin: '20px 0 14px', fontSize: '16px', fontWeight: '700', color: '#111827', fontFamily: "'Inter', sans-serif" }}>Verification Document</p>
                            <FileUploadUI
                                label="Upload ID / Registration Proof (PDF/JPG)"
                                accept=".pdf,image/*"
                                themeColor={currentTheme.primary}
                                onFileSelect={(f) => setFormData({...formData, idProof: f})}
                            />

                            {/* Identity Section */}
                            <p style={{ margin: '20px 0 14px', fontSize: '16px', fontWeight: '700', color: '#111827', fontFamily: "'Inter', sans-serif" }}>Identity Details</p>
                            
                            {/* Critical Warning Note */}
                            <div style={{ backgroundColor: '#FEF2F2', borderRadius: '6px', padding: '8px 10px', marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                                <AlertTriangle size={14} color="#DC2626" style={{ flexShrink: 0, marginTop: '1px' }} />
                                <p style={{ margin: 0, fontSize: '11px', color: '#B91C1C', fontWeight: '400', lineHeight: '1.4' }}>
                                    <strong style={{ fontWeight: '600' }}>Note:</strong> Ensure these details are accurate. They will be displayed publicly on your Storefront and cannot be edited later without manual re-approval.
                                </p>
                            </div>
                            {accountType === 'individual' ? (<>
                                <InputGroup label="Shop Name" name="shopName" value={formData.shopName} onChange={handleChange} placeholder="e.g. Raju's Fresh Farms" themeColor={currentTheme.primary} />
                                <InputGroup label="Owner Name" name="ownerName" value={formData.ownerName} onChange={handleChange} placeholder="Owner's full name" themeColor={currentTheme.primary} />
                                <InputGroup label="Full Legal Name" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="As per Govt ID" themeColor={currentTheme.primary} />
                                <InputGroup label="Aadhar / Govt ID" name="aadharNumber" value={formData.aadharNumber} onChange={handleChange} placeholder="XXXX XXXX XXXX" themeColor={currentTheme.primary} />
                            </>) : (<>
                                <InputGroup label="Organisation Name" name="companyName" value={formData.companyName} onChange={handleChange} placeholder="e.g. Green Valley Co-op" themeColor={currentTheme.primary} />
                                <InputGroup label="Owner / Director" name="ownerName" value={formData.ownerName} onChange={handleChange} placeholder="Owner's name" themeColor={currentTheme.primary} />
                                <InputGroup label="GST / Reg. Number" name="gstNumber" value={formData.gstNumber} onChange={handleChange} placeholder="GSTIN / CIN" themeColor={currentTheme.primary} />
                            </>)}
                            <InputGroup label="Business Email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="store@example.com" themeColor={currentTheme.primary} />
                            <InputGroup label="Primary Phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="9876543210" maxLength="10" prefix="+91" themeColor={currentTheme.primary} />
                            <InputGroup label="Emergency Phone" name="emergencyPhone" type="tel" value={formData.emergencyPhone} onChange={handleChange} placeholder="9876543210" maxLength="10" prefix="+91" themeColor={currentTheme.primary} />

                            {/* Location Section */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '20px 0 14px' }}>
                                <p style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#111827', fontFamily: "'Inter', sans-serif" }}>Location & Address</p>
                                <button type="button" onClick={handleAutoDetectLocation} disabled={isDetecting} style={{ padding: '8px 16px', background: currentTheme.primary, color: '#fff', border: 'none', borderRadius: '20px', fontWeight: '600', fontSize: '13px', cursor: 'pointer', boxShadow: `0 2px 8px ${currentTheme.shadow}`, fontFamily: "'Inter', sans-serif" }}>
                                    {isDetecting ? '⏳ Detecting...' : '📍 Auto GPS'}
                                </button>
                            </div>
                            <div style={{ marginBottom: '16px', padding: '10px 12px', backgroundColor: '#FEF2F2', borderLeft: '4px solid #EF4444', borderRadius: '6px' }}>
                                <p style={{ margin: 0, fontSize: '13px', color: '#991B1B', fontWeight: '500', fontFamily: "'Inter', sans-serif", lineHeight: '1.4' }}>
                                    <span style={{ fontWeight: '700', color: '#DC2626' }}>Important Note:</span> When using Auto GPS to fill your location details, please ensure you are physically present at the exact location of your farm, house, shop, or organisation.
                                </p>
                            </div>
                            {formData.lat && formData.lng && <>
                                <InputGroup label="Latitude (Auto)" readOnly value={formData.lat} themeColor={currentTheme.primary} />
                                <InputGroup label="Longitude (Auto)" readOnly value={formData.lng} themeColor={currentTheme.primary} />
                            </>}
                            <InputGroup label="House / Plot No." name="houseNumber" value={formData.houseNumber} onChange={handleChange} placeholder="e.g. 1-42" themeColor={currentTheme.primary} />
                            <InputGroup label="Landmark" name="landmark" value={formData.landmark} onChange={handleChange} placeholder="Near Big Well" themeColor={currentTheme.primary} />
                            <InputGroup label="Village / Town" name="village" value={formData.village} onChange={handleChange} placeholder="Village Name" themeColor={currentTheme.primary} />
                            <InputGroup label="Mandal / Taluka" name="mandal" value={formData.mandal} onChange={handleChange} placeholder="Mandal Name" themeColor={currentTheme.primary} />
                            <InputGroup label="Nearer City" name="nearerCity" value={formData.nearerCity} onChange={handleChange} placeholder="City Name" themeColor={currentTheme.primary} />
                            <InputGroup label="District" name="district" value={formData.district} onChange={handleChange} placeholder="District" themeColor={currentTheme.primary} />
                            <InputGroup label="State" name="state" value={formData.state} onChange={handleChange} placeholder="State" themeColor={currentTheme.primary} />
                            <InputGroup label="Pincode" name="pincode" type="tel" value={formData.pincode} onChange={handleChange} placeholder="123456" themeColor={currentTheme.primary} />
                            <SelectGroup label="Delivery Radius" name="serviceRadius" value={formData.serviceRadius} onChange={handleChange} themeColor={currentTheme.primary} options={[
                                { value: '5km', label: 'Within 5 km — Local Only' },
                                { value: '20km', label: 'Within 20 km — Nearby Towns' },
                                { value: 'district', label: 'Entire District' },
                                { value: 'state', label: 'Entire State' }
                            ]} />

                            {/* Business Categories */}
                            <p style={{ margin: '20px 0 14px', fontSize: '16px', fontWeight: '700', color: '#111827', fontFamily: "'Inter', sans-serif" }}>Services You Offer</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                                {['Farm Fresh Produce', 'Harvested Crops', 'Machinery Rental', 'Agriculture Worker', 'Freelance Services', 'Local Agri Goods & Products', 'Not Sure'].map(cat => (
                                    <div key={cat} onClick={() => handleCategoryToggle(cat)}
                                        style={{ padding: '7px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                                            backgroundColor: formData.categories.includes(cat) ? currentTheme.primary : '#fff',
                                            color: formData.categories.includes(cat) ? '#fff' : '#3a3a3c',
                                            border: formData.categories.includes(cat) ? `1.5px solid ${currentTheme.primary}` : '1.5px solid rgba(0,0,0,0.1)',
                                            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                                            transition: 'all 0.2s ease',
                                        }}>
                                        {formData.categories.includes(cat) ? '✓ ' : ''}{cat}
                                    </div>
                                ))}
                            </div>

                            {/* ── CATEGORY-SPECIFIC QUESTIONS ── */}
                            {accountType === 'individual' && formData.categories.includes('Farm Fresh Produce') && (
                                <div style={{ background: '#f8fafc', border: `3px solid #10b981`, borderRadius: '16px', padding: '20px', marginBottom: '20px', boxShadow: '0 4px 12px rgba(16,185,129,0.1)' }}>
                                    <p style={{ margin: '0 0 14px', fontSize: '16px', fontWeight: '700', color: '#111827', fontFamily: "'Inter', sans-serif" }}>🌿 Farm Fresh Produce</p>
                                    <p style={{ margin: '0 0 10px', fontSize: '14px', fontWeight: '600', color: '#374151', fontFamily: "'Inter', sans-serif" }}>Are these products Organic?</p>
                                    <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
                                        {['yes', 'no'].map(val => (
                                            <div key={val} onClick={() => setFormData({...formData, isOrganic: val})}
                                                style={{ flex: 1, padding: '12px', textAlign: 'center', borderRadius: '12px', cursor: 'pointer', border: formData.isOrganic === val ? `2px solid #10b981` : '2px solid #e5e7eb', backgroundColor: formData.isOrganic === val ? `#10b98112` : '#f9fafb', color: formData.isOrganic === val ? '#10b981' : '#374151', fontWeight: '600', fontSize: '14px', transition: 'all 0.2s', fontFamily: "'Inter', sans-serif" }}>
                                                {val === 'yes' ? '🌱 Yes, Organic' : '🌾 No, Regular'}
                                            </div>
                                        ))}
                                    </div>
                                    {formData.isOrganic === 'yes' && <FileUploadUI label="Organic Certificate (PDF/Image)" accept=".pdf,image/*" themeColor="#10b981" onFileSelect={(f) => setFormData({...formData, organicCertificate: f})} />}
                                    <InputGroup label="List of products you produce" name="freshProduceTypes" value={formData.freshProduceTypes} onChange={handleChange} placeholder="e.g. Tomatoes, Mangoes, Wheat..." themeColor="#10b981" />
                                    <InputGroup label="Expected Quantity (e.g. 500 kg)" name="produceQuantity" type="tel" value={formData.produceQuantity || ''} onChange={handleChange} placeholder="Enter expected quantity..." themeColor="#10b981" />
                                </div>
                            )}

                            {accountType === 'individual' && formData.categories.includes('Machinery Rental') && (
                                <div style={{ background: '#f8fafc', border: `3px solid #f97316`, borderRadius: '16px', padding: '20px', marginBottom: '20px', boxShadow: '0 4px 12px rgba(249,115,22,0.1)' }}>
                                    <p style={{ margin: '0 0 14px', fontSize: '16px', fontWeight: '700', color: '#111827', fontFamily: "'Inter', sans-serif" }}>🚜 Machinery Rental</p>
                                    <TextAreaGroup label="What machinery do you have? (e.g. 2 Tractors, 1 Harvester)" name="machineryDetails" value={formData.machineryDetails} onChange={handleChange} placeholder="List machinery types and counts..." themeColor="#f97316" />
                                    <InputGroup label="Number of Machineries" name="machineryCount" type="tel" value={formData.machineryCount || ''} onChange={handleChange} placeholder="e.g. 3" themeColor="#f97316" />
                                    <FileUploadUI label="Upload Machinery Images" accept="image/*" themeColor="#f97316" onFileSelect={(f) => setFormData({...formData, machineryImages: f})} />
                                </div>
                            )}

                            {accountType === 'individual' && formData.categories.includes('Harvested Crops') && (
                                <div style={{ background: '#f8fafc', border: `3px solid #eab308`, borderRadius: '16px', padding: '20px', marginBottom: '20px', boxShadow: '0 4px 12px rgba(234,179,8,0.1)' }}>
                                    <p style={{ margin: '0 0 14px', fontSize: '16px', fontWeight: '700', color: '#111827', fontFamily: "'Inter', sans-serif" }}>🌾 Harvested Crops</p>
                                    <InputGroup label="Crops You Produce" name="harvestCrops" value={formData.harvestCrops} onChange={handleChange} placeholder="e.g. Rice, Wheat, Cotton..." themeColor="#eab308" />
                                    <InputGroup label="Expected Quantity (Quintals)" name="harvestQuantity" type="tel" value={formData.harvestQuantity} onChange={handleChange} placeholder="e.g. 50" themeColor="#eab308" />
                                </div>
                            )}

                            {accountType === 'individual' && formData.categories.includes('Agriculture Worker') && (
                                <div style={{ background: '#f8fafc', border: `3px solid #06b6d4`, borderRadius: '16px', padding: '20px', marginBottom: '20px', boxShadow: '0 4px 12px rgba(6,182,212,0.1)' }}>
                                    <p style={{ margin: '0 0 14px', fontSize: '16px', fontWeight: '700', color: '#111827', fontFamily: "'Inter', sans-serif" }}>👷 Agriculture Worker</p>
                                    <TextAreaGroup label="What types of farm work can you do?" name="workerSkills" value={formData.workerSkills} onChange={handleChange} placeholder="e.g. Harvesting, Sowing, Pesticide Spraying..." themeColor="#06b6d4" />
                                    <InputGroup label="Number of Workers" name="workerCount" type="tel" value={formData.workerCount || ''} onChange={handleChange} placeholder="e.g. 5" themeColor="#06b6d4" />
                                </div>
                            )}

                            {accountType === 'individual' && formData.categories.includes('Freelance Services') && (
                                <div style={{ background: '#f8fafc', border: `3px solid #8b5cf6`, borderRadius: '16px', padding: '20px', marginBottom: '20px', boxShadow: '0 4px 12px rgba(139,92,246,0.1)' }}>
                                    <p style={{ margin: '0 0 14px', fontSize: '16px', fontWeight: '700', color: '#111827', fontFamily: "'Inter', sans-serif" }}>💼 Freelance Services</p>
                                    <TextAreaGroup label="What freelance works can you do?" name="freelanceWorks" value={formData.freelanceWorks} onChange={handleChange} placeholder="e.g. Drone Piloting, Soil Testing, Accounting..." themeColor="#8b5cf6" />
                                    <InputGroup label="Years of Experience" name="freelanceExperience" type="tel" value={formData.freelanceExperience} onChange={handleChange} placeholder="e.g. 5" themeColor="#8b5cf6" />
                                    <InputGroup label="Number of Freelancers" name="freelancerCount" type="tel" value={formData.freelancerCount || ''} onChange={handleChange} placeholder="e.g. 2" themeColor="#8b5cf6" />
                                    <TextAreaGroup label="Technical Skill Set" name="freelanceSkillSet" value={formData.freelanceSkillSet} onChange={handleChange} placeholder="e.g. Certified DJI Pilot, Agribusiness Degree..." themeColor="#8b5cf6" />
                                </div>
                            )}

                            {accountType === 'individual' && formData.categories.includes('Local Agri Goods & Products') && (
                                <div style={{ background: '#f8fafc', border: `3px solid #ec4899`, borderRadius: '16px', padding: '20px', marginBottom: '20px', boxShadow: '0 4px 12px rgba(236,72,153,0.1)' }}>
                                    <p style={{ margin: '0 0 14px', fontSize: '16px', fontWeight: '700', color: '#111827', fontFamily: "'Inter', sans-serif" }}>🛍️ Local Agri Goods</p>
                                    <TextAreaGroup label="What local goods do you sell?" name="localGoodsTypes" value={formData.localGoodsTypes || ''} onChange={handleChange} placeholder="e.g. Honey, Pickles, Handicrafts..." themeColor="#ec4899" />
                                    <InputGroup label="Supply Quantity (e.g. 50 Jars)" name="localGoodsQuantity" type="tel" value={formData.localGoodsQuantity || ''} onChange={handleChange} placeholder="Enter expected quantity..." themeColor="#ec4899" />
                                </div>
                            )}

                            {accountType === 'organisation' && formData.categories.includes('Farm Fresh Produce') && (
                                <div style={{ background: '#f8fafc', border: `3px solid #10b981`, borderRadius: '16px', padding: '20px', marginBottom: '20px', boxShadow: '0 4px 12px rgba(16,185,129,0.1)' }}>
                                    <p style={{ margin: '0 0 14px', fontSize: '16px', fontWeight: '700', color: '#111827', fontFamily: "'Inter', sans-serif" }}>🌿 Farm Fresh Supply</p>
                                    <p style={{ margin: '0 0 10px', fontSize: '14px', fontWeight: '600', color: '#374151', fontFamily: "'Inter', sans-serif" }}>Are these products Organic?</p>
                                    <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
                                        {['yes', 'no'].map(val => (
                                            <div key={val} onClick={() => setFormData({...formData, isOrganic: val})}
                                                style={{ flex: 1, padding: '12px', textAlign: 'center', borderRadius: '12px', cursor: 'pointer', border: formData.isOrganic === val ? `2px solid #10b981` : '2px solid #e5e7eb', backgroundColor: formData.isOrganic === val ? `#10b98112` : '#f9fafb', color: formData.isOrganic === val ? '#10b981' : '#374151', fontWeight: '600', fontSize: '14px', transition: 'all 0.2s', fontFamily: "'Inter', sans-serif" }}>
                                                {val === 'yes' ? '🌱 Yes, Organic' : '🌾 No, Regular'}
                                            </div>
                                        ))}
                                    </div>
                                    {formData.isOrganic === 'yes' && <FileUploadUI label="Organic Certificate (PDF/Image)" accept=".pdf,image/*" themeColor="#10b981" onFileSelect={(f) => setFormData({...formData, organicCertificate: f})} />}
                                    <InputGroup label="List of products you produce" name="freshProduceTypes" value={formData.freshProduceTypes} onChange={handleChange} placeholder="e.g. Tomatoes, Mangoes, Wheat..." themeColor="#10b981" />
                                    <InputGroup label="Supply Capacity (e.g. 500 Tons/Month)" name="orgProduceCapacity" value={formData.orgProduceCapacity} onChange={handleChange} placeholder="Enter supply capacity..." themeColor="#10b981" />
                                    <FileUploadUI label="Upload Product Images (2-3 Images)" accept="image/*" multiple={true} themeColor="#10b981" onFileSelect={(f) => setFormData({...formData, orgProduceImages: f})} />
                                </div>
                            )}

                            {accountType === 'organisation' && formData.categories.includes('Machinery Rental') && (
                                <div style={{ background: '#f8fafc', border: `3px solid #f97316`, borderRadius: '16px', padding: '20px', marginBottom: '20px', boxShadow: '0 4px 12px rgba(249,115,22,0.1)' }}>
                                    <p style={{ margin: '0 0 14px', fontSize: '16px', fontWeight: '700', color: '#111827', fontFamily: "'Inter', sans-serif" }}>🚜 Machinery Supply</p>
                                    <TextAreaGroup label="What machinery do you have?" name="orgMachineryDetails" value={formData.orgMachineryDetails} onChange={handleChange} placeholder="List available machinery models and types..." themeColor="#f97316" />
                                    <InputGroup label="Fleet Size (e.g. 50 Tractors, 10 Harvesters)" name="orgMachineryCapacity" value={formData.orgMachineryCapacity} onChange={handleChange} placeholder="Enter fleet size..." themeColor="#f97316" />
                                    <FileUploadUI label="Upload Machinery Fleet Images (2-3 Images)" accept="image/*" multiple={true} themeColor="#f97316" onFileSelect={(f) => setFormData({...formData, orgMachineryImages: f})} />
                                </div>
                            )}

                            {accountType === 'organisation' && formData.categories.includes('Harvested Crops') && (
                                <div style={{ background: '#f8fafc', border: `3px solid #eab308`, borderRadius: '16px', padding: '20px', marginBottom: '20px', boxShadow: '0 4px 12px rgba(234,179,8,0.1)' }}>
                                    <p style={{ margin: '0 0 14px', fontSize: '16px', fontWeight: '700', color: '#111827', fontFamily: "'Inter', sans-serif" }}>🌾 Harvest Supply</p>
                                    <InputGroup label="Crops Supplied" name="orgHarvestCrops" value={formData.orgHarvestCrops} onChange={handleChange} placeholder="e.g. Bulk Rice, Wheat, Sugarcane..." themeColor="#eab308" />
                                    <InputGroup label="Supply Capacity (e.g. 1000 Quintals/Month)" name="orgHarvestCapacity" value={formData.orgHarvestCapacity} onChange={handleChange} placeholder="Enter expected yield..." themeColor="#eab308" />
                                    <FileUploadUI label="Upload Warehouse/Crop Images (2-3 Images)" accept="image/*" multiple={true} themeColor="#eab308" onFileSelect={(f) => setFormData({...formData, orgHarvestImages: f})} />
                                </div>
                            )}

                            {accountType === 'organisation' && formData.categories.includes('Agriculture Worker') && (
                                <div style={{ background: '#f8fafc', border: `3px solid #06b6d4`, borderRadius: '16px', padding: '20px', marginBottom: '20px', boxShadow: '0 4px 12px rgba(6,182,212,0.1)' }}>
                                    <p style={{ margin: '0 0 14px', fontSize: '16px', fontWeight: '700', color: '#111827', fontFamily: "'Inter', sans-serif" }}>👷 Worker Supply</p>
                                    <InputGroup label="Workers Available" name="orgWorkerCount" type="tel" value={formData.orgWorkerCount} onChange={handleChange} placeholder="e.g. 50" themeColor="#06b6d4" />
                                    <TextAreaGroup label="Their skill sets" name="orgWorkerSkills" value={formData.orgWorkerSkills} onChange={handleChange} placeholder="e.g. General labor, certified pesticide sprayers..." themeColor="#06b6d4" />
                                </div>
                            )}

                            {accountType === 'organisation' && formData.categories.includes('Freelance Services') && (
                                <div style={{ background: '#f8fafc', border: `3px solid #8b5cf6`, borderRadius: '16px', padding: '20px', marginBottom: '20px', boxShadow: '0 4px 12px rgba(139,92,246,0.1)' }}>
                                    <p style={{ margin: '0 0 14px', fontSize: '16px', fontWeight: '700', color: '#111827', fontFamily: "'Inter', sans-serif" }}>💼 Freelance Agency</p>
                                    <TextAreaGroup label="What freelance works can you do?" name="orgFreelanceWorks" value={formData.orgFreelanceWorks || ''} onChange={handleChange} placeholder="e.g. Drone Piloting, Soil Testing, Accounting..." themeColor="#8b5cf6" />
                                    <InputGroup label="Years of Experience" name="orgFreelanceExperience" type="tel" value={formData.orgFreelanceExperience || ''} onChange={handleChange} placeholder="e.g. 5" themeColor="#8b5cf6" />
                                    <InputGroup label="Number of Freelancers" name="orgFreelancerCount" type="tel" value={formData.orgFreelancerCount} onChange={handleChange} placeholder="e.g. 2" themeColor="#8b5cf6" />
                                    <TextAreaGroup label="Technical Skill Set" name="orgFreelancerSkills" value={formData.orgFreelancerSkills} onChange={handleChange} placeholder="e.g. Certified DJI Pilot, Agribusiness Degree..." themeColor="#8b5cf6" />
                                </div>
                            )}

                            {accountType === 'organisation' && formData.categories.includes('Local Agri Goods & Products') && (
                                <div style={{ background: '#f8fafc', border: `3px solid #ec4899`, borderRadius: '16px', padding: '20px', marginBottom: '20px', boxShadow: '0 4px 12px rgba(236,72,153,0.1)' }}>
                                    <p style={{ margin: '0 0 14px', fontSize: '16px', fontWeight: '700', color: '#111827', fontFamily: "'Inter', sans-serif" }}>🛍️ Local Agri Goods</p>
                                    <TextAreaGroup label="What local goods do you supply?" name="orgLocalGoodsTypes" value={formData.orgLocalGoodsTypes || ''} onChange={handleChange} placeholder="e.g. Organic Honey, Packaged Spices..." themeColor="#ec4899" />
                                    <InputGroup label="Supply Capacity (e.g. 500 Jars/Month)" name="orgLocalGoodsCapacity" value={formData.orgLocalGoodsCapacity || ''} onChange={handleChange} placeholder="Enter supply capacity..." themeColor="#ec4899" />
                                    <FileUploadUI label="Upload Product Images (2-3 Images)" accept="image/*" multiple={true} themeColor="#ec4899" onFileSelect={(f) => setFormData({...formData, orgLocalGoodsImages: f})} />
                                </div>
                            )}


                            {/* Delivery Preference */}
                            <p style={{ margin: '20px 0 14px', fontSize: '16px', fontWeight: '700', color: '#111827', fontFamily: "'Inter', sans-serif" }}>Delivery Preference</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                                <div onClick={() => setFormData({...formData, deliveryPreference: 'delivery'})}
                                    style={{ padding: '14px 16px', borderRadius: '12px', border: formData.deliveryPreference === 'delivery' ? `2px solid ${currentTheme.primary}` : '2px solid #e2e8f0', backgroundColor: formData.deliveryPreference === 'delivery' ? `${currentTheme.primary}12` : '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s ease' }}>
                                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: formData.deliveryPreference === 'delivery' ? `6px solid ${currentTheme.primary}` : '2px solid #cbd5e1', backgroundColor: '#fff', transition: 'all 0.2s ease', flexShrink: 0 }} />
                                    <span style={{ fontSize: '15px', fontWeight: '600', color: formData.deliveryPreference === 'delivery' ? currentTheme.primary : '#334155' }}>I can manage to deliver to the consumer</span>
                                </div>
                                <div onClick={() => setFormData({...formData, deliveryPreference: 'pickup'})}
                                    style={{ padding: '14px 16px', borderRadius: '12px', border: formData.deliveryPreference === 'pickup' ? `2px solid ${currentTheme.primary}` : '2px solid #e2e8f0', backgroundColor: formData.deliveryPreference === 'pickup' ? `${currentTheme.primary}12` : '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s ease' }}>
                                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: formData.deliveryPreference === 'pickup' ? `6px solid ${currentTheme.primary}` : '2px solid #cbd5e1', backgroundColor: '#fff', transition: 'all 0.2s ease', flexShrink: 0 }} />
                                    <span style={{ fontSize: '15px', fontWeight: '600', color: formData.deliveryPreference === 'pickup' ? currentTheme.primary : '#334155' }}>Consumers must come to the shop/farm to pickup</span>
                                </div>
                            </div>

                            {/* Legal Terms */}
                            <div style={{ marginTop: '8px', marginBottom: '20px', background: '#fff8f0', border: '2px solid #fcd34d', borderRadius: '12px', padding: '14px 16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                <input
                                    type="checkbox"
                                    required
                                    name="agreedToTerms"
                                    checked={formData.agreedToTerms || false}
                                    onChange={(e) => setFormData({...formData, agreedToTerms: e.target.checked})}
                                    style={{ width: '20px', height: '20px', cursor: 'pointer', flexShrink: 0, marginTop: '2px', accentColor: currentTheme.primary }}
                                />
                                <p style={{ margin: 0, fontSize: '13px', color: '#3a3a3c', lineHeight: '1.6' }}>
                                    I agree to the <span onClick={() => setShowTermsModal(true)} style={{ color: currentTheme.primary, fontWeight: '700', textDecoration: 'underline', cursor: 'pointer' }}>FarmCap Seller Registration Terms</span>. All provided details are accurate and belong to me.
                                </p>
                            </div>

                            {/* Save Button */}
                            <div style={{ padding: '0 0 20px' }}>
                                <button onClick={handleSubmit} disabled={isSubmitting} style={{ width: '100%', padding: '16px', background: currentTheme.primary, color: '#fff', border: 'none', borderRadius: '16px', fontSize: '16px', fontWeight: '800', cursor: 'pointer', boxShadow: `0 4px 15px ${currentTheme.shadow}`, transition: 'all 0.2s ease', fontFamily: "'Inter', sans-serif" }}>
                                    {isSubmitting ? 'Submitting...' : (isEditingMode ? 'Submit Edit Request' : 'Submit Registration')}
                                </button>
                            </div>
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

// ── INPUT COMPONENTS (FarmFresh-inspired, individual clean boxes) ──

const InputGroup = ({ label, themeColor = '#0f172a', prefix, ...props }) => {
    const [isFocused, setIsFocused] = useState(false);
    return (
        <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px', fontFamily: "'Inter', sans-serif" }}>{label}</label>
            <div style={{ display: 'flex', alignItems: 'center', width: '100%', boxSizing: 'border-box', borderRadius: '12px', border: `2px solid ${isFocused ? themeColor : '#e5e7eb'}`, backgroundColor: isFocused ? '#fff' : '#f9fafb', transition: 'all 0.2s ease', boxShadow: isFocused ? `0 0 0 3px ${themeColor}18` : 'none', overflow: 'hidden' }}>
                {prefix && <span style={{ paddingLeft: '14px', color: '#6b7280', fontWeight: '500', fontSize: '15px', fontFamily: "'Inter', sans-serif", flexShrink: 0 }}>{prefix}</span>}
                <input
                    className="custom-input"
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    style={{ flex: 1, padding: '13px 14px', backgroundColor: 'transparent', border: 'none', fontSize: '15px', color: '#111827', fontWeight: '500', outline: 'none', fontFamily: "'Inter', sans-serif", ...(props.readOnly ? { color: '#9ca3af' } : {}), ...props.style }}
                    {...props}
                />
            </div>
        </div>
    );
};

const SelectGroup = ({ label, themeColor = '#0f172a', options, ...props }) => {
    const [isFocused, setIsFocused] = useState(false);
    return (
        <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px', fontFamily: "'Inter', sans-serif" }}>{label}</label>
            <select
                className="custom-input"
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                style={{ width: '100%', padding: '13px 14px', borderRadius: '12px', border: `2px solid ${isFocused ? themeColor : '#e5e7eb'}`, backgroundColor: isFocused ? '#fff' : '#f9fafb', fontSize: '15px', color: '#111827', fontWeight: '500', outline: 'none', cursor: 'pointer', fontFamily: "'Inter', sans-serif", transition: 'all 0.2s ease', boxShadow: isFocused ? `0 0 0 3px ${themeColor}18` : 'none', boxSizing: 'border-box' }}
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
        <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px', fontFamily: "'Inter', sans-serif" }}>{label}</label>
            <textarea
                className="custom-input"
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                style={{ width: '100%', padding: '13px 14px', borderRadius: '12px', border: `2px solid ${isFocused ? themeColor : '#e5e7eb'}`, backgroundColor: isFocused ? '#fff' : '#f9fafb', fontSize: '15px', color: '#111827', fontWeight: '500', outline: 'none', minHeight: '88px', fontFamily: "'Inter', sans-serif", resize: 'none', lineHeight: '1.5', transition: 'all 0.2s ease', boxShadow: isFocused ? `0 0 0 3px ${themeColor}18` : 'none', boxSizing: 'border-box' }}
                {...props}
            />
        </div>
    );
};



const FileUploadUI = ({ label, accept, themeColor, onFileSelect, multiple = false }) => {
    const fileInputRef = useRef(null);
    const [fileData, setFileData] = useState(null);

    const handleFileChange = async (e) => {
        if (e.target.files && e.target.files.length > 0) {
            let files = Array.from(e.target.files);
            setFileData({ name: 'Compressing...', url: null, isImage: false, isCompressing: true });
            
            try {
                // Compress images to save Firebase Storage costs
                files = await Promise.all(files.map(async (file) => {
                    if (file.type.startsWith('image/')) {
                        const options = {
                            maxSizeMB: 0.15, // 150KB limit
                            maxWidthOrHeight: 1200,
                            useWebWorker: true
                        };
                        return await imageCompression(file, options);
                    }
                    return file;
                }));
            } catch (error) {
                console.error("Error compressing image:", error);
            }
            
            const firstFile = files[0];
            
            if (firstFile.type.startsWith('image/')) {
                setFileData({ name: multiple && files.length > 1 ? `${files.length} files selected` : firstFile.name, url: URL.createObjectURL(firstFile), isImage: true, isCompressing: false });
            } else {
                setFileData({ name: multiple && files.length > 1 ? `${files.length} files selected` : firstFile.name, url: null, isImage: false, isCompressing: false });
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
                    <p style={{ margin: '2px 0 0', fontSize: '13px', fontWeight: '700', color: fileData ? themeColor : '#0f172a' }}>{fileData && fileData.isCompressing ? 'Compressing image...' : (fileData ? fileData.name : 'Tap to select file...')}</p>
                </div>
            </div>
            {fileData && <CheckCircle2 size={20} color={themeColor} />}
        </div>
    );
};

export default SellerProfile_Setup;