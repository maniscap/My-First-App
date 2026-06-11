import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs, getDoc, doc, updateDoc, deleteField, deleteDoc, getCountFromServer, query, limit, onSnapshot, where, startAfter, writeBatch, setDoc } from 'firebase/firestore';
import { storage } from '../firebase';
import { ref, deleteObject } from 'firebase/storage';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { IoMdArrowBack } from 'react-icons/io';
import { CheckCircle, XCircle, User, Building, LayoutDashboard, ClipboardList, Users, List, LogOut, Lock, RefreshCw, Edit3, CheckCircle2, Check, X, Search } from 'lucide-react';

function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('adminAuth') === 'true');
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, verifications, approved, listings, reports, announcements
  const [verificationTab, setVerificationTab] = useState('individual'); // individual or organisation
  const [approvedTab, setApprovedTab] = useState('individual'); // individual or organisation
  const [approvedSearchQuery, setApprovedSearchQuery] = useState('');
  const [sellerApplications, setSellerApplications] = useState([]);
  const [listingCounts, setListingCounts] = useState({ farmFresh: 0, machinery: 0, workers: 0, business: 0, freelance: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // --- NEW LISTINGS STATE ---
  const [adminListings, setAdminListings] = useState([]);
  const [listingCategory, setListingCategory] = useState('listings_farm_fresh');
  const [loadingListings, setLoadingListings] = useState(false);
  const [lastVisibleListing, setLastVisibleListing] = useState(null);
  const [hasMoreListings, setHasMoreListings] = useState(true);

  
  // --- REPORTS & ANNOUNCEMENTS STATE ---
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [announcementText, setAnnouncementText] = useState('');
  const [sendingAnnouncement, setSendingAnnouncement] = useState(false);

  // Deletion Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [sellerToDelete, setSellerToDelete] = useState(null);
  const [deleteReason, setDeleteReason] = useState('Violation of Terms & Conditions');
  const [deleteMessage, setDeleteMessage] = useState('');
  const [isDeletingSeller, setIsDeletingSeller] = useState(false);

  const fetchReports = async () => {
      setLoadingReports(true);
      try {
          const q = query(collection(db, 'reported_listings'), limit(45));
          const snap = await getDocs(q);
          setReports(snap.docs.map(d => ({id: d.id, ...d.data()})));
      } catch (e) {
          console.error(e);
      }
      setLoadingReports(false);
  };

  useEffect(() => {
      if (activeTab === 'reports') fetchReports();
  }, [activeTab]);

  const handlePublishAnnouncement = async (e) => {
      e.preventDefault();
      if (!announcementText.trim()) return;
      setSendingAnnouncement(true);
      try {
          // Store in global_settings which all apps read ONCE on boot
          await updateDoc(doc(db, 'global_settings', 'announcements'), {
              message: announcementText,
              timestamp: new Date().toISOString()
          });
          alert("Announcement published globally!");
          setAnnouncementText('');
      } catch (e) {
          console.error(e);
          alert("Failed to publish.");
      }
      setSendingAnnouncement(false);
  };

  const observerTarget = React.useRef(null);

  const fetchAdminListings = async (isLoadMore = false) => {
      if (loadingListings || (!hasMoreListings && isLoadMore)) return;
      if (isLoadMore && !lastVisibleListing) return; // FIX: Prevent duplicating first page
      setLoadingListings(true);
      try {
          let q;
          if (isLoadMore && lastVisibleListing) {
              q = query(collection(db, listingCategory), startAfter(lastVisibleListing), limit(45));
          } else {
              q = query(collection(db, listingCategory), limit(45));
          }
          const snap = await getDocs(q);
          const newDocs = snap.docs.map(d => ({id: d.id, ...d.data()}));
          
          if (snap.docs.length > 0) setLastVisibleListing(snap.docs[snap.docs.length - 1]);
          if (snap.docs.length < 45) setHasMoreListings(false);
          else setHasMoreListings(true);

          if (isLoadMore) setAdminListings(prev => [...prev, ...newDocs]);
          else setAdminListings(newDocs);
      } catch (e) {
          console.error(e);
      }
      setLoadingListings(false);
  };

  useEffect(() => {
      if (activeTab === 'listings') {
          setLastVisibleListing(null);
          setHasMoreListings(true);
          fetchAdminListings(false);
      }
  }, [activeTab, listingCategory]);

  useEffect(() => {
      const observer = new IntersectionObserver(
          entries => {
              if (entries[0].isIntersecting && hasMoreListings && !loadingListings && activeTab === 'listings') {
                  fetchAdminListings(true);
              }
          },
          { threshold: 1.0 }
      );
      if (observerTarget.current) observer.observe(observerTarget.current);
      return () => {
          if (observerTarget.current) observer.unobserve(observerTarget.current);
      };
  }, [observerTarget, hasMoreListings, loadingListings, activeTab, lastVisibleListing]);

  const handleDeleteListing = async (id) => {
      if(window.confirm("Are you sure you want to permanently delete this listing?")) {
          try {
              await deleteDoc(doc(db, listingCategory, id));
              setAdminListings(adminListings.filter(item => item.id !== id));
              fetchData(); // Update counts
          } catch(e) {
              alert("Failed to delete listing.");
          }
      }
  };



  // --- LOGIN ---
  const handleLogin = (e) => {
      e.preventDefault();
      const inputAdminId = adminId.trim().toLowerCase();
      const inputPassword = password.trim();
      
      if (inputAdminId === 'admin' && inputPassword === 'admin123') {
          localStorage.setItem('adminAuth', 'true');
          setIsAuthenticated(true);
      } else {
          alert('Invalid Admin ID or Password');
      }
  };

  // --- FETCH DATA ---
  const fetchData = async () => {
    setLoading(true);
    try {
        // Applications are fetched in real-time via a dedicated useEffect below.

        // Fetch Listing Counts (Using getCountFromServer to avoid massive read costs)
        const fetchCount = async (colName) => {
            try {
                if (colName === "rejected_applications") {
                    const q = query(collection(db, "seller_applications"), where('status', '==', 'rejected'));
                    const snapshot = await getCountFromServer(q);
                    return snapshot.data().count;
                }
                
                // Only count listings that are active
                const q = query(collection(db, colName), where('status', '==', 'active'));
                const snapshot = await getCountFromServer(q);
                return snapshot.data().count;
            } catch(e) { return 0; }
        };
        
        const [c1, c2, c3, c4, c5, rejCount] = await Promise.all([
            fetchCount("listings_farm_fresh"),
            fetchCount("listings_machinery"),
            fetchCount("listings_workers"),
            fetchCount("listings_business"),
            fetchCount("listings_freelancing"),
            fetchCount("rejected_applications")
        ]);

        setListingCounts({ farmFresh: c1, machinery: c2, workers: c3, business: c4, freelance: c5, rejected: rejCount });

    } catch (error) {
        console.error("Error fetching data:", error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => { 
      if (isAuthenticated) { 
          fetchData();
      }
  }, [isAuthenticated]);

  // Real-time listener for Seller Applications
  useEffect(() => {
      let unsubSnapshot;
      if (isAuthenticated) {
          const appsQuery = query(collection(db, "seller_applications"), limit(100));
          unsubSnapshot = onSnapshot(appsQuery, (snapshot) => {
              setSellerApplications(snapshot.docs.map(d => ({id: d.id, ...d.data()})));
          }, (error) => {
              console.error("Error with admin onSnapshot:", error);
          });
      }
      return () => {
          if (unsubSnapshot) unsubSnapshot();
      };
  }, [isAuthenticated]);

  const cleanupStorageMedia = async (appData) => {
      const urls = [];
      if (appData.profilePic) urls.push(appData.profilePic);
      if (appData.idProof) urls.push(appData.idProof);
      if (appData.organicCertificate) urls.push(appData.organicCertificate);
      ['machineryImages', 'orgProduceImages', 'orgMachineryImages', 'orgHarvestImages'].forEach(key => {
          if (appData[key] && Array.isArray(appData[key])) urls.push(...appData[key]);
      });

      for (const url of urls) {
          try {
              if (typeof url === 'string' && url.includes('firebasestorage')) {
                  const fileRef = ref(storage, url);
                  await deleteObject(fileRef);
              }
          } catch(e) { console.error("Failed to delete", url, e); }
      }
  };

  const wipeSellerData = async (sellerId) => {
      const collectionsToClear = [
          'listings_farm_fresh', 'listings_machinery', 'listings_workers',
          'listings_business', 'listings_freelancing', 'listings_local_goods'
      ];
      
      const batch = writeBatch(db);
      for (const colName of collectionsToClear) {
          const q = query(collection(db, colName), where('sellerId', '==', sellerId));
          const snap = await getDocs(q);
          snap.docs.forEach(d => batch.delete(doc(db, colName, d.id)));
      }
      
      try {
          batch.delete(doc(db, 'seller_profiles', sellerId));
          await batch.commit();
      } catch (e) { console.log("Batch wipe error:", e); }
  };

  const handleReject = async (app) => {
      if(isProcessing) return;
      const reason = window.prompt("Enter rejection reason (User will see this):", "Does not meet platform requirements.");
      if (reason === null) return;
      
      if(window.confirm("Are you sure you want to reject this application? This will wipe all their listings.")) {
          setIsProcessing(true);
          try {
              await wipeSellerData(app.id);
              await cleanupStorageMedia(app);
              await updateDoc(doc(db, "seller_applications", app.id), { status: 'rejected', rejectionReason: reason });
              fetchData();
          } catch (error) {
              console.error("Error rejecting application:", error);
              alert("Failed to reject application.");
          }
          setIsProcessing(false);
      }
  };

  const handleApproveSeller = async (app) => {
      if(isProcessing) return;
      if(window.confirm("Approve this seller? Application will be moved to verified.")) {
          setIsProcessing(true);
          try {
              await cleanupStorageMedia(app);
              const sellerRef = doc(db, "seller_applications", app.id);
              await updateDoc(sellerRef, { 
                  status: 'approved',
                  approvedAt: new Date().toISOString(),
                  profilePic: deleteField(),
                  idProof: deleteField(),
                  organicCertificate: deleteField(),
                  machineryImages: deleteField(),
                  orgProduceImages: deleteField(),
                  orgMachineryImages: deleteField(),
                  orgHarvestImages: deleteField()
              });
              fetchData();
          } catch (error) {
              console.error("Error approving:", error);
              alert("Failed to approve application.");
          }
          setIsProcessing(false);
      }
  };

  const handleDeleteApproved = (id) => {
      setSellerToDelete(id);
      setDeleteReason('Violation of Terms & Conditions');
      setDeleteMessage('');
      setDeleteModalOpen(true);
  };

  const executeSellerDeletion = async () => {
      if(!sellerToDelete || isProcessing) return;
      setIsProcessing(true);
      try {
          // get the app data to clean up its storage media
          const app = sellerApplications.find(a => a.id === sellerToDelete);
          if (app) await cleanupStorageMedia(app);
          
          await wipeSellerData(sellerToDelete);
          await updateDoc(doc(db, "seller_applications", sellerToDelete), {
              status: 'deleted_by_admin',
              deletionReason: deleteReason,
              deletionMessage: deleteMessage
          });
          setDeleteModalOpen(false);
          setSellerToDelete(null);
          fetchData();
       } catch (err) { 
          alert("Failed to delete seller."); 
       }
       setIsProcessing(false);
   };

   const handleApproveEdit = async (app) => {
       if(window.confirm("Approve this edit? This will update their live profile with the new details.")) {
           try {
               const sellerRef = doc(db, "seller_applications", app.id);
               await updateDoc(sellerRef, { 
                   ...app.editData,
                   hasPendingEdit: false,
                   lastEditAction: 'approved',
                   editData: deleteField()
               });
               fetchData();
               alert("Edit approved successfully.");
           } catch (error) {
               console.error("Error approving edit:", error);
               alert("Failed to approve edit request.");
           }
       }
   };

   const handleRejectEdit = async (app) => {
       if(window.confirm("Reject this edit? The seller's live profile will remain unchanged.")) {
           try {
               const sellerRef = doc(db, "seller_applications", app.id);
               await updateDoc(sellerRef, { 
                   hasPendingEdit: false,
                   lastEditAction: 'rejected',
                   editData: deleteField()
               });
               fetchData();
               alert("Edit rejected successfully.");
           } catch (error) {
               console.error("Error rejecting edit:", error);
               alert("Failed to reject edit request.");
           }
       }
   };

  if (!isAuthenticated) {
      return (
          <div className="admin-login-page">
              <style>{styles}</style>
              <div className="login-card">
                  <div className="login-header">
                      <div className="shield-icon">🛡️</div>
                      <h2>Admin Portal</h2>
                      <p>FarmCap Management System</p>
                  </div>
                  <form onSubmit={handleLogin} className="login-form">
                      <div className="input-wrapper">
                          <User className="input-icon" size={20} />
                          <input type="text" placeholder="Admin ID" value={adminId} onChange={(e) => setAdminId(e.target.value)} required className="auth-input" />
                      </div>
                      <div className="input-wrapper">
                          <Lock className="input-icon" size={20} />
                          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="auth-input" />
                      </div>
                      <button type="submit" className="btn-login">
                          <span>Secure Login</span>
                          <Lock size={18} />
                      </button>
                  </form>
                  <Link to="/" className="back-link">← Back to Main Site</Link>
              </div>
          </div>
      );
  }

  const pendingAppsCount = sellerApplications.filter(a => a.status === 'pending_approval').length;
  const approvedAppsCount = sellerApplications.filter(a => a.status === 'approved').length;

  const pendingInd = sellerApplications.filter(a => a.status === 'pending_approval' && a.accountType === 'individual');
  const pendingOrg = sellerApplications.filter(a => a.status === 'pending_approval' && a.accountType === 'organisation');

  const approvedSearchLower = approvedSearchQuery.toLowerCase();
  
  const approvedInd = sellerApplications.filter(a => {
      if (a.status !== 'approved' || a.accountType !== 'individual') return false;
      if (!approvedSearchQuery) return true;
      const idMatch = a.sellerId?.toLowerCase().includes(approvedSearchLower);
      const nameMatch = a.fullName?.toLowerCase().includes(approvedSearchLower) || a.shopName?.toLowerCase().includes(approvedSearchLower);
      return idMatch || nameMatch;
  });

  const approvedOrg = sellerApplications.filter(a => {
      if (a.status !== 'approved' || a.accountType !== 'organisation') return false;
      if (!approvedSearchQuery) return true;
      const idMatch = a.sellerId?.toLowerCase().includes(approvedSearchLower);
      const nameMatch = a.companyName?.toLowerCase().includes(approvedSearchLower) || a.shopName?.toLowerCase().includes(approvedSearchLower);
      return idMatch || nameMatch;
  });

  const pendingEdits = sellerApplications.filter(a => a.hasPendingEdit);

  return (
    <div className="admin-dashboard">
      <style>{styles}</style>
      
      {/* Deletion Modal - Apple Premium Style */}
      {deleteModalOpen && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{backgroundColor: '#ffffff', padding: '32px', borderRadius: '24px', width: '420px', maxWidth: '90%', boxSizing: 'border-box', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', border: '1px solid #E5E7EB'}}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ backgroundColor: '#FEF2F2', padding: '10px', borderRadius: '12px', color: '#EF4444' }}>
                <XCircle size={24} strokeWidth={2} />
              </div>
              <h3 style={{ margin: 0, color: '#111827', fontSize: '20px', fontWeight: '800' }}>Delete Account</h3>
            </div>
            
            <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '24px', lineHeight: '1.5' }}>
              Specify the reason for deleting this account. This message will be sent to the seller before their app permanently wipes their data.
            </p>
            
            <label style={{display: 'block', fontSize: '13px', fontWeight: '800', marginBottom: '8px', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Reason</label>
            <div style={{ position: 'relative', marginBottom: '20px' }}>
              <select value={deleteReason} onChange={e => setDeleteReason(e.target.value)} style={{width: '100%', padding: '16px', borderRadius: '14px', border: '1px solid #D1D5DB', backgroundColor: '#F9FAFB', fontSize: '15px', color: '#111827', outline: 'none', appearance: 'none', boxSizing: 'border-box', cursor: 'pointer', fontWeight: '500'}}>
                <option>Violation of Terms & Conditions</option>
                <option>Fraudulent Activity</option>
                <option>User Requested Deletion</option>
                <option>Incomplete or Fake Profile</option>
                <option>Other</option>
              </select>
              <div style={{ position: 'absolute', right: '16px', top: '16px', pointerEvents: 'none', color: '#9CA3AF' }}>▼</div>
            </div>

            <label style={{display: 'block', fontSize: '13px', fontWeight: '800', marginBottom: '8px', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Custom Message</label>
            <textarea value={deleteMessage} onChange={e => setDeleteMessage(e.target.value)} placeholder="Explain the reason..." rows={3} style={{width: '100%', padding: '16px', borderRadius: '14px', border: '1px solid #D1D5DB', backgroundColor: '#F9FAFB', fontSize: '15px', color: '#111827', outline: 'none', boxSizing: 'border-box', resize: 'none', fontWeight: '500', marginBottom: '32px'}}></textarea>

            <div style={{display: 'flex', gap: '12px'}}>
              <button onClick={() => setDeleteModalOpen(false)} style={{flex: 1, padding: '16px', backgroundColor: '#F3F4F6', color: '#4B5563', border: 'none', borderRadius: '14px', cursor: 'pointer', fontWeight: '800', fontSize: '15px', transition: 'background-color 0.2s'}}>Cancel</button>
              <button onClick={executeSellerDeletion} disabled={isDeletingSeller} style={{flex: 1, padding: '16px', backgroundColor: '#EF4444', color: '#FFFFFF', border: 'none', borderRadius: '14px', cursor: isDeletingSeller ? 'not-allowed' : 'pointer', fontWeight: '800', fontSize: '15px', transition: 'opacity 0.2s', opacity: isDeletingSeller ? 0.7 : 1}}>{isDeletingSeller ? 'Deleting...' : 'Confirm Delete'}</button>
            </div>
          </div>
        </div>
      )}
      
      {/* SIDEBAR */}
      <aside className="sidebar">
          <div className="sidebar-brand">
              <span className="brand-icon">💼</span>
              <span className="brand-text">Admin Panel</span>
          </div>
          
          <nav className="sidebar-nav">
              <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
                  <LayoutDashboard size={20} /> Dashboard Overview
              </button>
              <button className={`nav-item ${activeTab === 'verifications' ? 'active' : ''}`} onClick={() => setActiveTab('verifications')}>
                  <ClipboardList size={20} /> Verifications <span className="badge">{pendingAppsCount}</span>
              </button>
              <button className={`nav-item ${activeTab === 'edit_approvals' ? 'active' : ''}`} onClick={() => setActiveTab('edit_approvals')}>
                  <Edit3 size={20} /> Edit Approvals {pendingEdits.length > 0 && <span className="badge" style={{background: '#f59e0b'}}>{pendingEdits.length}</span>}
              </button>
              <button className={`nav-item ${activeTab === 'approved' ? 'active' : ''}`} onClick={() => setActiveTab('approved')}>
                  <Users size={20} /> Approved Sellers
              </button>
              <button className={`nav-item ${activeTab === 'listings' ? 'active' : ''}`} onClick={() => setActiveTab('listings')}>
                  <List size={20} /> Active Listings
              </button>
              <button className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
                  <ClipboardList size={20} /> Flagged Reports
              </button>
              <button className={`nav-item ${activeTab === 'announcements' ? 'active' : ''}`} onClick={() => setActiveTab('announcements')}>
                  <LayoutDashboard size={20} /> Global Broadcast
              </button>
          </nav>

          <div className="sidebar-footer">
              <Link to="/" className="nav-item"><IoMdArrowBack size={20} /> Exit to App</Link>
              <button className="nav-item btn-logout" onClick={() => { localStorage.removeItem('adminAuth'); setIsAuthenticated(false); }}><LogOut size={20} /> Logout</button>
          </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
          
          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
              <div className="tab-content">
                  <div className="header-titles" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                          <h1>Dashboard Overview</h1>
                          <p>High-level statistics and system health.</p>
                      </div>
                      <button 
                          onClick={fetchData} 
                          disabled={loading}
                          style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '12px', cursor: loading ? 'wait' : 'pointer', color: '#16a34a', fontWeight: '700', fontSize: '14px', transition: 'all 0.2s', opacity: loading ? 0.7 : 1 }}
                      >
                          <RefreshCw size={18} /> {loading ? "Refreshing..." : "Refresh Stats"}
                      </button>
                  </div>
                  
                  <h3 className="section-subtitle">Application Status</h3>
                  <div className="stats-cards">
                      <div className="stat-card pending">
                          <h3>{pendingAppsCount}</h3>
                          <p>Pending Review</p>
                      </div>
                      <div className="stat-card approved">
                          <h3>{approvedAppsCount}</h3>
                          <p>Total Verified Sellers</p>
                      </div>
                  </div>

                  <h3 className="section-subtitle" style={{marginTop: '40px'}}>Seller Demographics</h3>
                  <div className="stats-cards">
                      <div className="stat-card neutral"><div className="icon">👤</div><h3>{approvedInd.length}</h3><p>Verified Individuals</p></div>
                      <div className="stat-card neutral"><div className="icon">🏢</div><h3>{approvedOrg.length}</h3><p>Verified Organisations</p></div>
                  </div>

                  <h3 className="section-subtitle" style={{marginTop: '40px'}}>Live Listing Counts</h3>
                  <div className="stats-cards">
                      <div className="stat-card neutral"><div className="icon">🥬</div><h3>{listingCounts.farmFresh}</h3><p>Farm Fresh</p></div>
                      <div className="stat-card neutral"><div className="icon">🚜</div><h3>{listingCounts.machinery}</h3><p>Machinery</p></div>
                      <div className="stat-card neutral"><div className="icon">🧑‍🔧</div><h3>{listingCounts.workers}</h3><p>Workers</p></div>
                      <div className="stat-card neutral"><div className="icon">🌾</div><h3>{listingCounts.business}</h3><p>Business Zone</p></div>
                      <div className="stat-card neutral"><div className="icon">👨</div><h3>{listingCounts.freelance}</h3><p>Freelancing</p></div>
                  </div>
              </div>
          )}

          {/* VERIFICATIONS TAB */}
          {activeTab === 'verifications' && (
              <div className="tab-content">
                  <div className="header-titles">
                      <h1>Pending Verifications</h1>
                      <p>Review full details and documents before approving.</p>
                  </div>
                  
                  {loading ? (
                      <div className="loading-state">Loading applications...</div>
                  ) : pendingAppsCount === 0 ? (
                      <div className="empty-state">
                          <CheckCircle size={48} color="#10b981" />
                          <p>You're all caught up! No pending applications.</p>
                      </div>
                  ) : (
                      <>
                          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                              <button 
                                  onClick={() => setVerificationTab('individual')}
                                  style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer', background: verificationTab === 'individual' ? '#8b5cf6' : '#e2e8f0', color: verificationTab === 'individual' ? 'white' : '#64748b', transition: 'all 0.2s' }}
                              >
                                  👤 Individual Shops ({pendingInd.length})
                              </button>
                              <button 
                                  onClick={() => setVerificationTab('organisation')}
                                  style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer', background: verificationTab === 'organisation' ? '#3b82f6' : '#e2e8f0', color: verificationTab === 'organisation' ? 'white' : '#64748b', transition: 'all 0.2s' }}
                              >
                                  🏢 Organisations ({pendingOrg.length})
                              </button>
                          </div>
                          
                          {verificationTab === 'individual' && (
                              pendingInd.length === 0 ? <p style={{color: '#64748b'}}>No pending individual applications.</p> :
                              <div className="cards-list">
                                  {pendingInd.map(app => (
                                      <ApplicationCard key={app.id} app={app} onApprove={() => handleApproveSeller(app)} onReject={() => handleReject(app)} />
                                  ))}
                              </div>
                          )}

                          {verificationTab === 'organisation' && (
                              pendingOrg.length === 0 ? <p style={{color: '#64748b'}}>No pending organisation applications.</p> :
                              <div className="cards-list">
                                  {pendingOrg.map(app => (
                                      <ApplicationCard key={app.id} app={app} onApprove={() => handleApproveSeller(app)} onReject={() => handleReject(app)} />
                                  ))}
                              </div>
                          )}
                      </>
                  )}
              </div>
          )}

          {/* EDIT APPROVALS TAB */}
          {activeTab === 'edit_approvals' && (
              <div className="tab-content">
                  <div className="header-titles">
                      <h1>Edit Approvals</h1>
                      <p>Review and approve profile edits submitted by active sellers.</p>
                  </div>
                  
                  {pendingEdits.length === 0 ? (
                      <div className="empty-state">
                          <CheckCircle2 size={48} color="#10b981" />
                          <p>No pending edit requests.</p>
                      </div>
                  ) : (
                      <div className="applications-grid">
                          {pendingEdits.map(app => (
                              <EditCard key={app.id} app={app} onApprove={() => handleApproveEdit(app)} onReject={() => handleRejectEdit(app)} />
                          ))}
                      </div>
                  )}
              </div>
          )}

          {/* APPROVED SELLERS TAB */}
          {activeTab === 'approved' && (
              <div className="tab-content">
                  <div className="header-titles">
                      <h1>Approved Sellers Directory</h1>
                      <p>Lightweight text-only directory of verified sellers.</p>
                  </div>
                  
                  <div style={{ marginBottom: '20px', position: 'relative' }}>
                      <Search size={20} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input 
                          type="text" 
                          placeholder="Search by Seller ID or Shop/Company/Owner Name..." 
                          value={approvedSearchQuery}
                          onChange={(e) => setApprovedSearchQuery(e.target.value)}
                          style={{ width: '100%', padding: '14px 16px 14px 44px', borderRadius: '12px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#f8fafc', fontSize: '15px', outline: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                      />
                  </div>
                  
                  <div className="approved-directory">
                      <div className="text-list">
                          
                          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                              <button 
                                  onClick={() => setApprovedTab('individual')}
                                  style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer', background: approvedTab === 'individual' ? '#8b5cf6' : '#e2e8f0', color: approvedTab === 'individual' ? 'white' : '#64748b', transition: 'all 0.2s' }}
                              >
                                  👤 Individual Shops ({approvedInd.length})
                              </button>
                              <button 
                                  onClick={() => setApprovedTab('organisation')}
                                  style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer', background: approvedTab === 'organisation' ? '#3b82f6' : '#e2e8f0', color: approvedTab === 'organisation' ? 'white' : '#64748b', transition: 'all 0.2s' }}
                              >
                                  🏢 Organisations ({approvedOrg.length})
                              </button>
                          </div>

                          {approvedTab === 'individual' && (
                              approvedInd.length === 0 ? <p style={{color:'#64748b'}}>No approved individual sellers yet.</p> :
                              <div style={{marginBottom: '40px'}}>
                                  {approvedInd.map(app => (
                                      <div key={app.id} className="text-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '10px' }}>
                                          <div>
                                              <strong>{app.sellerId}</strong> &mdash; 
                                              {app.fullName} 
                                              ({app.categories?.join(', ') || 'No categories'}) &mdash; 
                                              {app.phone} &mdash; {app.village}, {app.district}
                                              <br/>
                                              <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Approved At: {app.approvedAt ? new Date(app.approvedAt).toLocaleString() : 'N/A'}</span>
                                          </div>
                                          <button onClick={() => handleDeleteApproved(app.id)} style={{ padding: '10px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Delete Seller</button>
                                      </div>
                                  ))}
                              </div>
                          )}

                          {approvedTab === 'organisation' && (
                              approvedOrg.length === 0 ? <p style={{color:'#64748b'}}>No approved organisation sellers yet.</p> :
                              <div style={{marginBottom: '40px'}}>
                                  {approvedOrg.map(app => (
                                      <div key={app.id} className="text-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '10px' }}>
                                          <div>
                                              <strong>{app.sellerId}</strong> &mdash; 
                                              {app.companyName} 
                                              ({app.categories?.join(', ') || 'No categories'}) &mdash; 
                                              {app.phone} &mdash; {app.village}, {app.district}
                                              <br/>
                                              <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Approved At: {app.approvedAt ? new Date(app.approvedAt).toLocaleString() : 'N/A'}</span>
                                          </div>
                                          <button onClick={() => handleDeleteApproved(app.id)} style={{ padding: '10px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Delete Seller</button>
                                      </div>
                                  ))}
                              </div>
                          )}
                      </div>
                  </div>
              </div>
          )}

          {/* LISTINGS TAB */}
          {activeTab === 'listings' && (
              <div className="tab-content">
                  <div className="header-titles" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                  <h1>Active Listings</h1>
                          <p>Manage active market listings (Max 45 per fetch with auto-scroll).</p>
                      </div>
                      <button onClick={() => { setLastVisibleListing(null); setHasMoreListings(true); fetchAdminListings(false); }} className="btn-action btn-approve" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <RefreshCw size={16} className={loadingListings && !lastVisibleListing ? 'spin-anim' : ''} /> Refresh Data
                      </button>
                  </div>
                  
                  <div style={{ display: 'flex', overflowX: 'auto', gap: '10px', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', paddingBottom: '20px', marginBottom: '10px' }}>
                      {[
                          { id: 'listings_farm_fresh', label: 'Farm Fresh' },
                          { id: 'listings_machinery', label: 'Machinery' },
                          { id: 'listings_workers', label: 'Workers' },
                          { id: 'listings_business', label: 'Business' },
                          { id: 'listings_freelancing', label: 'Freelance' },
                          { id: 'listings_local_goods', label: 'Local Goods & Products' }
                      ].map(tab => (
                          <button
                              key={tab.id}
                              onClick={() => setListingCategory(tab.id)}
                              style={{
                                  padding: '10px 20px',
                                  borderRadius: '12px',
                                  background: listingCategory === tab.id ? '#0f172a' : '#FFFFFF',
                                  fontSize: '14px',
                                  fontWeight: listingCategory === tab.id ? '500' : '400',
                                  color: listingCategory === tab.id ? '#FFFFFF' : '#6B7280',
                                  whiteSpace: 'nowrap',
                                  cursor: 'pointer',
                                  flexShrink: 0,
                                  boxShadow: listingCategory === tab.id ? '0 8px 20px rgba(15,23,42,0.15)' : '0 2px 8px rgba(0,0,0,0.03)',
                                  border: listingCategory === tab.id ? '1px solid #0f172a' : '1px solid rgba(0,0,0,0.04)',
                                  transition: 'all 0.2s'
                              }}
                          >
                              {tab.label}
                          </button>
                      ))}
                  </div>

                  {loadingListings && adminListings.length === 0 ? (
                      <div className="empty-state"><RefreshCw size={48} className="spin-anim" color="#64748b" /><p>Fetching listings cheaply...</p></div>
                  ) : adminListings.length === 0 ? (
                      <div className="empty-state"><List size={48} color="#64748b" /><p>No listings found in this category.</p></div>
                  ) : (
                      <div className="grid-cards" style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                          {adminListings.map(item => (
                              <div key={item.id} className="app-card" style={{ padding: '16px' }}>
                                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                      {item.imageUrl ? (
                                          <img src={item.imageUrl} alt="item" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                                      ) : (
                                          <div style={{ width: '80px', height: '80px', backgroundColor: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>📦</div>
                                      )}
                                      <div style={{ flex: 1 }}>
                                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                              <h3 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>{item.itemName || item.cropName || item.serviceName || item.title || 'Item'}</h3>
                                              <span style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '4px', backgroundColor: item.status === 'active' ? '#dcfce7' : '#fef2f2', color: item.status === 'active' ? '#166534' : '#991b1b', fontWeight: 'bold' }}>
                                                  {(item.status || 'active').toUpperCase()}
                                              </span>
                                          </div>
                                          <p style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '14px', fontWeight: 'bold' }}>₹{item.price} / {item.unit || item.priceUnit || 'unit'}</p>
                                          <p style={{ margin: '0', color: '#94a3b8', fontSize: '12px' }}>Seller ID: {item.sellerId ? item.sellerId.substring(0,8) : 'Unknown'}...</p>
                                      </div>
                                  </div>
                                  <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                                      <button onClick={() => handleDeleteListing(item.id)} className="btn-action btn-reject" style={{ width: 'auto', padding: '8px 16px' }}>
                                          <XCircle size={16} /> Delete Listing
                                      </button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}
                  {/* Invisible trigger for Infinite Scroll */}
                  <div ref={observerTarget} style={{ height: '20px', margin: '20px 0' }}>
                      {loadingListings && adminListings.length > 0 && <p style={{textAlign: 'center', color: '#64748b'}}>Loading more...</p>}
                      {!hasMoreListings && adminListings.length > 0 && <p style={{textAlign: 'center', color: '#64748b'}}>End of listings.</p>}
                  </div>
              </div>
          )}

      
          {/* REPORTS TAB */}
          {activeTab === 'reports' && (
              <div className="tab-content">
                  <div className="header-titles" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                          <h1>Flagged Reports</h1>
                          <p>Manage listings reported by users (Max 45 per fetch).</p>
                      </div>
                      <button onClick={fetchReports} className="btn-action btn-approve" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <RefreshCw size={16} className={loadingReports ? 'spin-anim' : ''} /> Refresh Data
                      </button>
                  </div>
                  {loadingReports ? (
                      <div className="empty-state"><RefreshCw size={48} className="spin-anim" color="#64748b" /><p>Fetching reports...</p></div>
                  ) : reports.length === 0 ? (
                      <div className="empty-state"><CheckCircle size={48} color="#10b981" /><p>Zero reported items. Your marketplace is safe!</p></div>
                  ) : (
                      <div className="grid-cards" style={{ display: 'grid', gap: '16px', gridTemplateColumns: '1fr' }}>
                          {reports.map(rep => (
                              <div key={rep.id} className="app-card" style={{ padding: '16px', borderLeft: '4px solid #ef4444' }}>
                                  <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#ef4444' }}>Reason: {rep.reason}</h3>
                                  <p style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '14px' }}>Listing ID: {rep.listingId}</p>
                                  <button style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Investigate</button>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
          )}

          {/* ANNOUNCEMENTS TAB */}
          {activeTab === 'announcements' && (
              <div className="tab-content">
                  <div className="header-titles">
                      <h1>Global Broadcast</h1>
                      <p>Push a banner announcement to all consumer apps instantly.</p>
                  </div>
                  <div className="app-card" style={{ padding: '24px', maxWidth: '600px' }}>
                      <form onSubmit={handlePublishAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          <label style={{ fontWeight: 'bold', color: '#334155' }}>Announcement Message</label>
                          <textarea 
                              value={announcementText}
                              onChange={(e) => setAnnouncementText(e.target.value)}
                              placeholder="e.g., Server maintenance at midnight..."
                              style={{ padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', minHeight: '100px', fontSize: '15px', fontFamily: 'inherit' }}
                              required
                          />
                          <button type="submit" disabled={sendingAnnouncement} style={{ padding: '14px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
                              {sendingAnnouncement ? 'Publishing...' : 'Publish to All Users'}
                          </button>
                      </form>
                  </div>
              </div>
          )}

      </main>
    </div>
  );
}

// Sub-component for edit requests
const EditCard = ({ app, onApprove, onReject }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="app-card" style={{ transition: 'all 0.3s ease' }}>
            <div className="card-header" style={{ cursor: 'pointer', paddingBottom: isExpanded ? '15px' : undefined }} onClick={() => setIsExpanded(!isExpanded)}>
                <div className="card-title-group">
                    <div style={{width:'48px', height:'48px', background:'#fef3c7', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center'}}>
                        <Edit3 size={24} color="#d97706" />
                    </div>
                    <div>
                        <h3 className="seller-name">{app.companyName || app.shopName || app.fullName || "Seller"}</h3>
                        <p className="seller-id-text">{app.id}</p>
                    </div>
                </div>
                <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                    <button className="btn-action btn-fold" onClick={() => setIsExpanded(!isExpanded)}>
                        {isExpanded ? 'Fold Up ▲' : 'Open Details ▼'}
                    </button>
                    <button className="btn-action btn-reject" onClick={onReject}><X size={20} strokeWidth={2.5}/> Reject Edit</button>
                    <button className="btn-action btn-approve" onClick={onApprove}><Check size={20} strokeWidth={2.5}/> Approve Edit</button>
                </div>
            </div>
            
            {isExpanded && (
                <div className="card-body" style={{ borderTop: '1px solid #e2e8f0', marginTop: '15px', paddingTop: '15px' }}>
                    <div className="detail-section">
                        <h4>Requested Field Changes</h4>
                        <div style={{display:'flex', flexDirection:'column', gap:'12px', background:'#f8fafc', padding:'20px', borderRadius:'12px', border:'1px solid #e2e8f0'}}>
                            {Object.keys(app.editData || {}).map(key => {
                                if (['hasPendingEdit', 'editData', 'submittedAt'].includes(key)) return null;
                                const oldVal = app[key];
                                const newVal = app.editData[key];
                                if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
                                    const displayOld = Array.isArray(oldVal) ? oldVal.join(', ') : (oldVal || '(empty)');
                                    const displayNew = Array.isArray(newVal) ? newVal.join(', ') : (newVal || '(empty)');
                                    const displayKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                                    return (
                                        <div key={key} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '15px' }}>
                                            <span style={{ fontSize: '14px', fontWeight: '800', color: '#475569', minWidth: '140px' }}>{displayKey}:</span>
                                            <div style={{ flex: 1, minWidth: '200px', background:'#fee2e2', color:'#b91c1c', padding:'10px 14px', borderRadius:'8px', fontSize:'14px', textDecoration:'line-through', border: '1px dashed #fca5a5' }}>
                                                {displayOld}
                                            </div>
                                            <span style={{color:'#94a3b8', fontWeight:'bold'}}>➔</span>
                                            <div style={{ flex: 1, minWidth: '200px', background:'#d1fae5', color:'#047857', padding:'10px 14px', borderRadius:'8px', fontSize:'14px', fontWeight:'800', boxShadow:'0 4px 10px rgba(16,185,129,0.1)', border: '1px solid #a7f3d0' }}>
                                                {displayNew}
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Sub-component for the application card (Shows FULL DETAILS for employee to verify)
const ApplicationCard = ({ app, onApprove, onReject }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="app-card" style={{ transition: 'all 0.3s ease' }}>
            <div className="card-header" style={{ cursor: 'pointer', paddingBottom: isExpanded ? '15px' : undefined }} onClick={() => setIsExpanded(!isExpanded)}>
                <div className="card-title-group">
                    {app.accountType === 'organisation' ? (
                        <div style={{width:'56px', height:'56px', background:'#eff6ff', borderRadius:'14px', display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid #bfdbfe', boxShadow: '0 4px 10px rgba(59,130,246,0.1)'}}>
                            <Building size={28} color="#2563eb" />
                        </div>
                    ) : (
                        <div style={{width:'56px', height:'56px', background:'#f5f3ff', borderRadius:'14px', display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid #ddd6fe', boxShadow: '0 4px 10px rgba(139,92,246,0.1)'}}>
                            <User size={28} color="#7c3aed" />
                        </div>
                    )}
                    <div>
                        <h3 className="seller-name">{app.accountType === 'organisation' ? app.companyName : app.fullName}</h3>
                        <p className="seller-id-text">ID: {app.sellerId} • {app.accountType?.toUpperCase()}</p>
                    </div>
                </div>
                <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                    <button className="btn-action btn-fold" onClick={() => setIsExpanded(!isExpanded)}>
                        {isExpanded ? 'Fold Up ▲' : 'Open Details ▼'}
                    </button>
                    <button onClick={onReject} className="btn-action btn-reject"><XCircle size={20} /> Reject</button>
                    <button onClick={onApprove} className="btn-action btn-approve"><CheckCircle size={20} /> Approve</button>
                </div>
            </div>

            {isExpanded && (
                <div className="card-body" style={{ borderTop: '1px solid #e2e8f0', marginTop: '15px', paddingTop: '15px' }}>
                
                {/* 1. TEXT DETAILS (Will be saved permanently) */}
                <div className="detail-section">
                    <h4>Text Information (Saved Permanently)</h4>
                    <div className="detail-grid">
                        <div className="info-block">
                            <span className="lbl">Phone</span>
                            <span className="val">{app.phone} {app.emergencyPhone && ` / ${app.emergencyPhone}`}</span>
                        </div>
                        <div className="info-block">
                            <span className="lbl">{app.accountType === 'organisation' ? 'GST Number' : 'Aadhaar / ID'}</span>
                            <span className="val">{app.accountType === 'organisation' ? app.gstNumber : app.aadharNumber}</span>
                        </div>
                        <div className="info-block">
                            <span className="lbl">Location</span>
                            <span className="val">{app.village}, {app.mandal}, {app.district}, {app.state} - {app.pincode}</span>
                        </div>
                        <div className="info-block">
                            <span className="lbl">Categories</span>
                            <span className="val">{app.categories?.join(', ') || 'None'}</span>
                        </div>
                        <div className="info-block">
                            <span className="lbl">Experience / Size</span>
                            <span className="val">{app.experienceYears ? `${app.experienceYears} Yrs` : ''} {app.farmSize ? `/ ${app.farmSize} Acres` : ''}</span>
                        </div>
                    </div>
                </div>

                {/* 2. SPECIFIC AGRICULTURE & BUSINESS DETAILS */}
                <div className="detail-section" style={{ marginTop: '10px' }}>
                    <h4>Agriculture & Business Specifics</h4>
                    <div className="detail-grid">
                        <div className="info-block">
                            <span className="lbl">Farm & Produce</span>
                            <span className="val">
                                {app.isOrganic || app.freshProduceTypes || app.orgProduceCapacity || app.produceQuantity ? (
                                    <>
                                        {app.isOrganic === 'yes' ? <span style={{color: '#10b981', fontWeight: 'bold'}}>100% Organic 🌱</span> : (app.isOrganic === 'no' ? 'Conventional' : '')} 
                                        {app.freshProduceTypes && <><br/>Crops: {app.freshProduceTypes}</>}
                                        {(app.orgProduceCapacity || app.produceQuantity) && <><br/>Capacity: {app.orgProduceCapacity || app.produceQuantity}</>}
                                    </>
                                ) : 'N/A'}
                            </span>
                        </div>
                        <div className="info-block">
                            <span className="lbl">Machinery / Vehicles</span>
                            <span className="val">
                                {app.machineryDetails || app.orgMachineryDetails || app.orgMachineryCapacity || app.machineryCount ? (
                                    <>
                                        {app.machineryDetails || app.orgMachineryDetails}
                                        {(app.orgMachineryCapacity || app.machineryCount) && ` (Count/Capacity: ${app.orgMachineryCapacity || app.machineryCount})`}
                                    </>
                                ) : 'N/A'}
                            </span>
                        </div>
                        <div className="info-block">
                            <span className="lbl">Harvest Output</span>
                            <span className="val">
                                {app.harvestCrops || app.orgHarvestCrops || app.harvestQuantity || app.orgHarvestCapacity ? (
                                    <>
                                        {app.harvestCrops || app.orgHarvestCrops} 
                                        {(app.harvestQuantity || app.orgHarvestCapacity) && ` - ${app.harvestQuantity || app.orgHarvestCapacity}`}
                                    </>
                                ) : 'N/A'}
                            </span>
                        </div>
                        <div className="info-block">
                            <span className="lbl">Labor / Workers</span>
                            <span className="val">
                                {app.workerSkills || app.orgWorkerSkills || app.orgWorkerCount || app.workerCount ? (
                                    <>
                                        {app.workerSkills || app.orgWorkerSkills}
                                        {(app.orgWorkerCount || app.workerCount) && ` (Count: ${app.orgWorkerCount || app.workerCount})`}
                                    </>
                                ) : 'N/A'}
                            </span>
                        </div>
                        <div className="info-block">
                            <span className="lbl">Freelance / Skills</span>
                            <span className="val">
                                {app.freelanceWorks || app.orgFreelanceWorks || app.freelanceSkillSet || app.orgFreelancerSkills || app.freelanceExperience || app.orgFreelanceExperience || app.orgFreelancerCount || app.freelancerCount ? (
                                    <>
                                        {app.freelanceWorks || app.orgFreelanceWorks || app.freelanceSkillSet || app.orgFreelancerSkills}
                                        {(app.freelanceExperience || app.orgFreelanceExperience) && ` (${app.freelanceExperience || app.orgFreelanceExperience} Yrs Exp)`}
                                        {(app.orgFreelancerCount || app.freelancerCount) && ` (Count: ${app.orgFreelancerCount || app.freelancerCount})`}
                                    </>
                                ) : 'N/A'}
                            </span>
                        </div>
                        <div className="info-block">
                            <span className="lbl">Local Agri Goods</span>
                            <span className="val">
                                {app.localGoodsTypes || app.orgLocalGoodsTypes || app.orgLocalGoodsCapacity || app.localGoodsQuantity ? (
                                    <>
                                        {app.localGoodsTypes || app.orgLocalGoodsTypes}
                                        {(app.orgLocalGoodsCapacity || app.localGoodsQuantity) && ` (Capacity: ${app.orgLocalGoodsCapacity || app.localGoodsQuantity})`}
                                    </>
                                ) : 'N/A'}
                            </span>
                        </div>
                        <div className="info-block" style={{ gridColumn: '1 / -1' }}>
                            <span className="lbl">Delivery Preference</span>
                            <span className="val" style={{ fontWeight: 'bold', color: '#3b82f6' }}>
                                {app.deliveryPreference === 'delivery' ? '🚚 Seller Manages Delivery' : (app.deliveryPreference === 'pickup' ? '🏪 Customer Pickup Required' : 'Not Specified')}
                            </span>
                        </div>
                    </div>
                </div>

            </div>
            )}
        </div>
    );
};

// --- CSS STYLES FOR RESPONSIVENESS AND PREMIUM UI ---
const styles = `
  :root {
      --bg-color: #f1f5f9;
      --card-bg: #ffffff;
      --text-main: #0f172a;
      --text-muted: #64748b;
      --primary: #3b82f6;
      --primary-dark: #2563eb;
      --success: #10b981;
      --danger: #ef4444;
      --border: #e2e8f0;
      --sidebar-w: 260px;
  }

  * { box-sizing: border-box; }

  /* LOGIN PAGE STYLES */
  .admin-login-page {
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh; 
      background: linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=1920&q=80') center/cover no-repeat;
      font-family: 'Inter', sans-serif;
      padding: 20px;
  }
  .login-card {
      background: rgba(255, 255, 255, 0.85); 
      padding: 50px 40px; 
      border-radius: 24px; 
      width: 100%; 
      max-width: 420px;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); 
      text-align: center;
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.5);
  }
  .login-header .shield-icon { font-size: 56px; margin-bottom: 15px; }
  .login-header h2 { margin: 0 0 8px; color: #000000; font-size: 28px; font-weight: 900; letter-spacing: -0.5px; }
  .login-header p { margin: 0 0 35px; color: #334155; font-size: 15px; font-weight: 700; }
  
  .login-form { display: flex; flex-direction: column; gap: 20px; width: 100%; }
  
  .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
  }
  .input-icon {
      position: absolute;
      left: 18px;
      color: #64748b;
      transition: 0.3s;
  }
  .auth-input {
      width: 100%;
      padding: 16px 20px 16px 50px !important;
      border-radius: 12px; 
      border: 2px solid #cbd5e1; 
      font-size: 16px; 
      outline: none; 
      transition: all 0.3s ease; 
      background-color: rgba(255, 255, 255, 0.9) !important; 
      color: #000000 !important; 
      font-weight: 700 !important;
  }
  .auth-input::placeholder { color: #94a3b8 !important; font-weight: 500 !important; }
  .auth-input:focus { 
      border-color: #10b981; 
      background-color: #ffffff !important; 
      box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15); 
  }
  .auth-input:focus + .input-icon, .input-wrapper:focus-within .input-icon {
      color: #10b981;
  }
  
  .btn-login {
      width: 100%;
      padding: 16px; 
      background-color: #10b981; 
      color: #ffffff; 
      border: none; 
      border-radius: 12px;
      font-size: 16px; 
      font-weight: 800; 
      cursor: pointer; 
      transition: all 0.3s ease; 
      margin-top: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3);
  }
  .btn-login:hover { 
      background-color: #059669; 
      transform: translateY(-2px);
      box-shadow: 0 12px 25px rgba(16, 185, 129, 0.4);
  }
  
  .back-link {
      display: inline-block;
      margin-top: 25px;
      color: #475569;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
      transition: color 0.2s;
  }
  .back-link:hover { color: #000000; }

  /* DASHBOARD LAYOUT */
  .admin-dashboard {
      display: flex;
      height: 100vh;
      overflow: hidden;
      background-color: var(--bg-color);
      font-family: 'Inter', sans-serif;
      color: var(--text-main);
  }

  /* SIDEBAR */
  .sidebar {
      width: var(--sidebar-w);
      background: #0f172a;
      color: #f8fafc;
      display: flex;
      flex-direction: column;
      position: fixed;
      top: 0; left: 0; bottom: 0;
      z-index: 100;
  }
  .sidebar-brand {
      padding: 24px;
      font-size: 20px;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 10px;
      border-bottom: 1px solid #1e293b;
  }
  .sidebar-nav {
      flex: 1;
      padding: 24px 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
  }
  .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 15px;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      text-align: left;
      text-decoration: none;
      transition: all 0.2s;
  }
  .nav-item:hover { background: #1e293b; color: #f8fafc; }
  .nav-item.active { background: var(--primary); color: white; }
  
  .badge {
      margin-left: auto;
      background: #ef4444;
      color: white;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 800;
  }

  .sidebar-footer {
      padding: 24px 12px;
      border-top: 1px solid #1e293b;
  }
  .btn-logout { width: 100%; color: #fca5a5; }
  .btn-logout:hover { background: #7f1d1d; color: white; }

  /* MAIN CONTENT */
  .main-content {
      flex: 1;
      margin-left: var(--sidebar-w);
      padding: 40px;
      overflow-y: auto;
  }
  .header-titles { margin-bottom: 30px; }
  .header-titles h1 { margin: 0 0 8px 0; font-size: 28px; font-weight: 800; }
  .header-titles p { margin: 0; color: var(--text-muted); font-size: 15px; }

  .section-subtitle { font-size: 18px; font-weight: 700; margin-bottom: 15px; color: #334155; }

  /* STAT CARDS */
  .stats-cards {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
  }
  .stat-card {
      background: white;
      padding: 20px 24px;
      border-radius: 16px;
      border: 1px solid var(--border);
      min-width: 160px;
      flex: 1;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
  }
  .stat-card h3 { margin: 0 0 4px 0; font-size: 28px; font-weight: 800; }
  .stat-card p { margin: 0; font-size: 14px; font-weight: 600; color: var(--text-muted); }
  .stat-card.pending h3 { color: #f59e0b; }
  .stat-card.approved h3 { color: #10b981; }
  .stat-card.rejected h3 { color: #ef4444; }
  
  .stat-card.neutral { display: flex; flex-direction: column; align-items: center; text-align: center; }
  .stat-card.neutral .icon { font-size: 32px; margin-bottom: 10px; }
  .stat-card.neutral h3 { color: #0f172a; }

  /* FULL WIDTH CARDS LIST */
  .cards-list { display: flex; flex-direction: column; gap: 24px; }
  
  .app-card {
      background: white;
      border-radius: 20px;
      border: 1px solid rgba(0,0,0,0.05);
      box-shadow: 0 10px 30px rgba(0,0,0,0.08);
      overflow: hidden;
      transition: all 0.3s ease;
  }
  .app-card:hover {
      box-shadow: 0 15px 40px rgba(0,0,0,0.12);
      transform: translateY(-2px);
  }
  .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px 30px;
      border-bottom: 1px solid var(--border);
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  }
  .card-title-group { display: flex; align-items: center; gap: 20px; }
  .seller-name { margin: 0; font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; }
  .seller-id-text { margin: 6px 0 0 0; font-size: 14px; font-weight: 700; color: #64748b; font-family: monospace; background: #e2e8f0; padding: 4px 8px; border-radius: 6px; display: inline-block; }
  
  .card-actions { display: flex; gap: 14px; }
  .btn-action {
      display: flex; align-items: center; gap: 8px;
      padding: 12px 20px; border-radius: 12px; border: none;
      font-weight: 800; font-size: 15px; cursor: pointer; transition: all 0.3s ease;
  }
  .btn-fold { background: white; border: 2px solid #cbd5e1; color: #475569; }
  .btn-fold:hover { background: #f8fafc; border-color: #94a3b8; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }

  .btn-reject { background: white; color: #ef4444; border: 2px solid #fca5a5; }
  .btn-reject:hover { background: #ef4444; color: white; border-color: #ef4444; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2); }
  
  .btn-approve { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3); border: 2px solid transparent; }
  .btn-approve:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4); filter: brightness(1.1); }

  .card-body { padding: 30px; padding-bottom: 40px; display: flex; flex-direction: column; gap: 30px; }
  
  .detail-section h4 { margin: 0 0 15px 0; font-size: 14px; color: var(--primary); text-transform: uppercase; letter-spacing: 0.5px; }
  .detail-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; }
  .info-block { display: flex; flex-direction: column; gap: 8px; background: #f8fafc; padding: 18px; border-radius: 14px; border-left: 5px solid var(--primary); transition: all 0.3s ease; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
  .info-block .lbl { font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
  .info-block .val { font-size: 15px; font-weight: 600; color: #0f172a; line-height: 1.6; }

  /* Multi-color info blocks */
  .info-block:nth-child(6n+1) { border-left-color: #3b82f6; background: #eff6ff; }
  .info-block:nth-child(6n+1) .lbl { color: #2563eb; }
  .info-block:nth-child(6n+1):hover { box-shadow: 0 8px 20px rgba(59,130,246,0.15); background: #ffffff; border-left-color: #1d4ed8; transform: translateY(-3px); }

  .info-block:nth-child(6n+2) { border-left-color: #10b981; background: #ecfdf5; }
  .info-block:nth-child(6n+2) .lbl { color: #059669; }
  .info-block:nth-child(6n+2):hover { box-shadow: 0 8px 20px rgba(16,185,129,0.15); background: #ffffff; border-left-color: #047857; transform: translateY(-3px); }

  .info-block:nth-child(6n+3) { border-left-color: #f59e0b; background: #fffbeb; }
  .info-block:nth-child(6n+3) .lbl { color: #d97706; }
  .info-block:nth-child(6n+3):hover { box-shadow: 0 8px 20px rgba(245,158,11,0.15); background: #ffffff; border-left-color: #b45309; transform: translateY(-3px); }

  .info-block:nth-child(6n+4) { border-left-color: #8b5cf6; background: #f5f3ff; }
  .info-block:nth-child(6n+4) .lbl { color: #7c3aed; }
  .info-block:nth-child(6n+4):hover { box-shadow: 0 8px 20px rgba(139,92,246,0.15); background: #ffffff; border-left-color: #6d28d9; transform: translateY(-3px); }

  .info-block:nth-child(6n+5) { border-left-color: #ec4899; background: #fdf2f8; }
  .info-block:nth-child(6n+5) .lbl { color: #db2777; }
  .info-block:nth-child(6n+5):hover { box-shadow: 0 8px 20px rgba(236,72,153,0.15); background: #ffffff; border-left-color: #be185d; transform: translateY(-3px); }

  .info-block:nth-child(6n+6) { border-left-color: #06b6d4; background: #ecfeff; }
  .info-block:nth-child(6n+6) .lbl { color: #0891b2; }
  .info-block:nth-child(6n+6):hover { box-shadow: 0 8px 20px rgba(6,182,212,0.15); background: #ffffff; border-left-color: #0e7490; transform: translateY(-3px); }

  /* MEDIA STYLES */
  .warning-bg { background: #fffbeb; padding: 20px; border-radius: 12px; border: 1px dashed #fcd34d; }
  .warning-bg h4 { color: #b45309; margin-bottom: 5px; }
  .helper-text { margin: 0 0 15px 0; font-size: 12px; color: #d97706; font-weight: 500; }
  
  .media-container { display: flex; flex-wrap: wrap; gap: 15px; }
  .image-preview-box, .image-array-box { background: white; padding: 10px; border-radius: 8px; border: 1px solid #fde68a; }
  .img-label { display: flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 700; color: #b45309; margin-bottom: 8px; }
  .preview-img { width: 100px; height: 100px; object-fit: cover; border-radius: 6px; border: 1px solid #e2e8f0; transition: 0.2s; cursor: pointer; }
  .preview-img:hover { transform: scale(1.05); }
  .img-grid { display: flex; gap: 8px; flex-wrap: wrap; }

  .raw-data-box { background: #f8fafc; padding: 15px; border-radius: 8px; font-size: 12px; color: #475569; overflow-x: auto; border: 1px solid #e2e8f0; }

  /* APPROVED DIRECTORY - PRINT STYLE */
  .approved-directory { background: white; padding: 30px; border-radius: 16px; border: 1px solid var(--border); }
  .text-list { display: flex; flex-direction: column; gap: 10px; }
  .text-row { font-family: 'Courier New', monospace; font-size: 14px; padding: 12px; border-bottom: 1px solid #f1f5f9; color: #1e293b; }

  /* RESPONSIVE */
  @media (max-width: 1024px) {
      .sidebar { width: 80px; }
      .sidebar-text, .brand-text { display: none; }
      .main-content { margin-left: 80px; padding: 20px; }
      .nav-item { justify-content: center; padding: 12px; }
      .badge { display: none; }
  }
  @media (max-width: 768px) {
      .admin-dashboard { flex-direction: column; }
      .sidebar { position: static; width: 100%; height: auto; flex-direction: row; padding: 10px; overflow-x: auto; }
      .main-content { margin-left: 0; padding: 15px; }
      .card-header { flex-direction: column; align-items: flex-start; gap: 15px; }
  }
`;

export default Admin;