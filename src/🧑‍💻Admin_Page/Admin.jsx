import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc, deleteField, deleteDoc, getCountFromServer, query, limit, onSnapshot, where, startAfter } from 'firebase/firestore';
import { IoMdArrowBack } from 'react-icons/io';
import { CheckCircle, XCircle, User, Building, LayoutDashboard, ClipboardList, Users, List, LogOut, Lock, RefreshCw } from 'lucide-react';

function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('adminAuth') === 'true');
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, verifications, approved, listings, reports, announcements
  const [verificationTab, setVerificationTab] = useState('individual'); // individual or organisation
  const [approvedTab, setApprovedTab] = useState('individual'); // individual or organisation
  const [sellerApplications, setSellerApplications] = useState([]);
  const [listingCounts, setListingCounts] = useState({ farmFresh: 0, machinery: 0, workers: 0, business: 0, freelance: 0, rejected: 0 });
  const [loading, setLoading] = useState(false);

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
      if (adminId === 'admin' && password === 'admin123') {
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
        // Fetch Seller Applications in REAL-TIME (Using a strict limit to prevent downloading the whole DB and crashing/billing)
        const appsQuery = query(collection(db, "seller_applications"), limit(100));
        // We use onSnapshot here but we manage it carefully. 
        // In a real production app, we would return the unsubscribe function from a separate useEffect.
        // For simplicity here in fetchData, we will just attach it.
        onSnapshot(appsQuery, (snapshot) => {
            setSellerApplications(snapshot.docs.map(d => ({id:d.id, ...d.data()})));
        });

        // Fetch Listing Counts (Using getCountFromServer to avoid massive read costs)
        const fetchCount = async (colName) => {
            try {
                if (colName === "rejected_applications") {
                    const coll = collection(db, colName);
                    const snapshot = await getCountFromServer(coll);
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
      if (isAuthenticated) fetchData(); 
  }, [isAuthenticated]);

  const handleReject = async (app) => {
      if(window.confirm("Are you sure you want to completely reject and erase this application from Firebase?")) {
          try {
              await deleteDoc(doc(db, "seller_applications", app.id));
              fetchData();
          } catch (error) {
              console.error("Error deleting application:", error);
              alert("Failed to reject and delete application.");
          }
      }
  };

  const handleApproveSeller = async (app) => {
      if(window.confirm("Approve this seller? Application will be moved to verified.")) {
          try {
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
      }
  };

  const handleDeleteApproved = async (id) => {
      if(window.confirm("Are you sure you want to permanently delete this verified seller from Firebase?")) {
          try {
              await deleteDoc(doc(db, "seller_applications", id));
              fetchData();
          } catch (err) { alert("Failed to delete seller."); }
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

  const approvedInd = sellerApplications.filter(a => a.status === 'approved' && a.accountType === 'individual');
  const approvedOrg = sellerApplications.filter(a => a.status === 'approved' && a.accountType === 'organisation');

  return (
    <div className="admin-dashboard">
      <style>{styles}</style>
      
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
              <button className={`nav-item ${activeTab === 'approved' ? 'active' : ''}`} onClick={() => setActiveTab('approved')}>
                  <Users size={20} /> Approved Sellers
              </button>
              <button className={`nav-item ${activeTab === 'listings' ? 'active' : ''}`} onClick={() => setActiveTab('listings')}>
                  <List size={20} /> Active Listings
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

          {/* APPROVED SELLERS TAB */}
          {activeTab === 'approved' && (
              <div className="tab-content">
                  <div className="header-titles">
                      <h1>Approved Sellers Directory</h1>
                      <p>Lightweight text-only directory of verified sellers.</p>
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
                  
                  <div className="verification-tabs" style={{ marginBottom: '20px', display: 'flex', overflowX: 'auto', gap: '8px', paddingBottom: '8px', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                      <button style={{ whiteSpace: 'nowrap', flexShrink: 0 }} className={listingCategory === 'listings_farm_fresh' ? 'active' : ''} onClick={() => setListingCategory('listings_farm_fresh')}>Farm Fresh</button>
                      <button style={{ whiteSpace: 'nowrap', flexShrink: 0 }} className={listingCategory === 'listings_machinery' ? 'active' : ''} onClick={() => setListingCategory('listings_machinery')}>Machinery</button>
                      <button style={{ whiteSpace: 'nowrap', flexShrink: 0 }} className={listingCategory === 'listings_workers' ? 'active' : ''} onClick={() => setListingCategory('listings_workers')}>Workers</button>
                      <button style={{ whiteSpace: 'nowrap', flexShrink: 0 }} className={listingCategory === 'listings_business' ? 'active' : ''} onClick={() => setListingCategory('listings_business')}>Business</button>
                      <button style={{ whiteSpace: 'nowrap', flexShrink: 0 }} className={listingCategory === 'listings_freelancing' ? 'active' : ''} onClick={() => setListingCategory('listings_freelancing')}>Freelance</button>
                      <button style={{ whiteSpace: 'nowrap', flexShrink: 0 }} className={listingCategory === 'listings_land' ? 'active' : ''} onClick={() => setListingCategory('listings_land')}>Land</button>
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

// Sub-component for the application card (Shows FULL DETAILS for employee to verify)
const ApplicationCard = ({ app, onApprove, onReject }) => {
    return (
        <div className="app-card">
            <div className="card-header">
                <div className="card-title-group">
                    {app.accountType === 'organisation' ? <Building size={24} color="#3b82f6" /> : <User size={24} color="#8b5cf6" />}
                    <div>
                        <h3 className="seller-name">{app.accountType === 'organisation' ? app.companyName : app.fullName}</h3>
                        <p className="seller-id-text">ID: {app.sellerId} • {app.accountType?.toUpperCase()}</p>
                    </div>
                </div>
                <div className="card-actions">
                    <button onClick={onReject} className="btn-action btn-reject"><XCircle size={18} /> Reject & Delete</button>
                    <button onClick={onApprove} className="btn-action btn-approve"><CheckCircle size={18} /> Approve Application</button>
                </div>
            </div>

            <div className="card-body">
                
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
                                {app.isOrganic || app.freshProduceTypes || app.orgProduceCapacity ? (
                                    <>
                                        {app.isOrganic === 'yes' ? <span style={{color: '#10b981', fontWeight: 'bold'}}>100% Organic 🌱</span> : (app.isOrganic === 'no' ? 'Conventional' : '')} 
                                        {app.freshProduceTypes && <><br/>Crops: {app.freshProduceTypes}</>}
                                        {app.orgProduceCapacity && <><br/>Capacity: {app.orgProduceCapacity}</>}
                                    </>
                                ) : 'N/A'}
                            </span>
                        </div>
                        <div className="info-block">
                            <span className="lbl">Machinery / Vehicles</span>
                            <span className="val">
                                {app.machineryDetails || app.orgMachineryDetails || app.orgMachineryCapacity ? (
                                    <>
                                        {app.machineryDetails || app.orgMachineryDetails}
                                        {(app.orgMachineryCapacity) && ` (Capacity: ${app.orgMachineryCapacity})`}
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
                                {app.workerSkills || app.orgWorkerSkills || app.orgWorkerCount ? (
                                    <>
                                        {app.workerSkills || app.orgWorkerSkills}
                                        {app.orgWorkerCount && ` (Count: ${app.orgWorkerCount})`}
                                    </>
                                ) : 'N/A'}
                            </span>
                        </div>
                        <div className="info-block">
                            <span className="lbl">Freelance / Skills</span>
                            <span className="val">
                                {app.freelanceWorks || app.freelanceSkillSet || app.orgFreelancerSkills || app.freelanceExperience || app.orgFreelancerCount ? (
                                    <>
                                        {app.freelanceWorks || app.freelanceSkillSet || app.orgFreelancerSkills}
                                        {app.freelanceExperience && ` (${app.freelanceExperience} Yrs Exp)`}
                                        {app.orgFreelancerCount && ` (Count: ${app.orgFreelancerCount})`}
                                    </>
                                ) : 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>

            </div>
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
      border-radius: 16px;
      border: 1px solid var(--border);
      box-shadow: 0 4px 15px rgba(0,0,0,0.03);
      overflow: hidden;
  }
  .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid var(--border);
      background: #f8fafc;
  }
  .card-title-group { display: flex; align-items: center; gap: 15px; }
  .seller-name { margin: 0; font-size: 20px; font-weight: 800; color: #0f172a; }
  .seller-id-text { margin: 4px 0 0 0; font-size: 13px; font-weight: 600; color: #64748b; font-family: monospace; }
  
  .card-actions { display: flex; gap: 12px; }
  .btn-action {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 16px; border-radius: 8px; border: none;
      font-weight: 700; font-size: 14px; cursor: pointer; transition: 0.2s;
  }
  .btn-reject { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
  .btn-reject:hover { background: #fee2e2; }
  .btn-approve { background: var(--success); color: white; box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3); }
  .btn-approve:hover { background: #059669; }

  .card-body { padding: 24px; display: flex; flex-direction: column; gap: 24px; }
  
  .detail-section h4 { margin: 0 0 15px 0; font-size: 14px; color: var(--primary); text-transform: uppercase; letter-spacing: 0.5px; }
  .detail-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; }
  .info-block { display: flex; flex-direction: column; gap: 4px; }
  .info-block .lbl { font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; }
  .info-block .val { font-size: 14px; font-weight: 600; color: #1e293b; }

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