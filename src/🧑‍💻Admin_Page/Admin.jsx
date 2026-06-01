import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc, deleteField, addDoc } from 'firebase/firestore';
import { IoMdArrowBack } from 'react-icons/io';
import { CheckCircle, XCircle, Clock, User, Building, MapPin, Phone, Briefcase, LayoutDashboard, ClipboardList, Users, List, LogOut, Lock } from 'lucide-react';

function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, verifications, approved, listings
  const [sellerApplications, setSellerApplications] = useState([]);
  const [listingCounts, setListingCounts] = useState({ farmFresh: 0, machinery: 0, workers: 0, business: 0, freelance: 0, rejected: 0 });
  const [loading, setLoading] = useState(false);

  // --- LOGIN ---
  const handleLogin = (e) => {
      e.preventDefault();
      if (adminId === 'admin' && password === 'admin123') {
          setIsAuthenticated(true);
      } else {
          alert('Invalid Admin ID or Password');
      }
  };

  // --- FETCH DATA ---
  const fetchData = async () => {
    setLoading(true);
    try {
        // Fetch Seller Applications
        const apps = await getDocs(collection(db, "seller_applications"));
        setSellerApplications(apps.docs.map(d => ({id:d.id, ...d.data()})));

        // Fetch Listing Counts
        const fetchCount = async (colName) => {
            try {
                const snap = await getDocs(collection(db, colName));
                return snap.size;
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

  const handleReject = async (app, reason) => {
      // 1. Add to rejected_applications to keep the count
      await addDoc(collection(db, "rejected_applications"), {
          rejectedAt: new Date().toISOString(),
          reason: reason || "Does not meet requirements."
      });

      // 2. Update the original document so the user sees the reason once
      const sellerRef = doc(db, "seller_applications", app.id);
      const updates = { status: 'rejected', rejectionReason: reason || "Does not meet requirements." };
      
      // Wipe all personal data from the main document to ensure privacy
      Object.keys(app).forEach(key => {
          if (key !== 'id' && key !== 'status' && key !== 'accountType' && key !== 'sellerId') {
              updates[key] = deleteField();
          }
      });
      
      await updateDoc(sellerRef, updates);
      fetchData();
  };

  const handleApproveSeller = async (app) => {
      if(window.confirm("Approve this seller? Application will be moved to verified.")) {
          // Update Firestore: Mark as approved and erase image fields completely (in case they exist)
          const sellerRef = doc(db, "seller_applications", app.id);
          await updateDoc(sellerRef, { 
              status: 'approved',
              profilePic: deleteField(),
              idProof: deleteField(),
              organicCertificate: deleteField(),
              machineryImages: deleteField(),
              orgProduceImages: deleteField(),
              orgMachineryImages: deleteField(),
              orgHarvestImages: deleteField()
          });
          
          fetchData();
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

  const pendingApps = sellerApplications.filter(a => a.status === 'pending_approval');
  const approvedApps = sellerApplications.filter(a => a.status === 'approved');
  const rejectedApps = sellerApplications.filter(a => a.status === 'rejected');

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
                  <ClipboardList size={20} /> Verifications <span className="badge">{pendingApps.length}</span>
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
              <button className="nav-item btn-logout" onClick={() => setIsAuthenticated(false)}><LogOut size={20} /> Logout</button>
          </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
          
          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
              <div className="tab-content">
                  <div className="header-titles">
                      <h1>Dashboard Overview</h1>
                      <p>High-level statistics and system health.</p>
                  </div>
                  
                  <h3 className="section-subtitle">Application Status</h3>
                  <div className="stats-cards">
                      <div className="stat-card pending">
                          <h3>{pendingApps.length}</h3>
                          <p>Pending Review</p>
                      </div>
                      <div className="stat-card approved">
                          <h3>{approvedApps.length}</h3>
                          <p>Verified Sellers</p>
                      </div>
                      <div className="stat-card rejected">
                          <h3>{listingCounts.rejected}</h3>
                          <p>Total Rejected</p>
                      </div>
                  </div>

                  <h3 className="section-subtitle" style={{marginTop: '40px'}}>Live Listing Counts</h3>
                  <div className="stats-cards">
                      <div className="stat-card neutral"><div className="icon">🌾</div><h3>{listingCounts.farmFresh}</h3><p>Farm Fresh</p></div>
                      <div className="stat-card neutral"><div className="icon">🚜</div><h3>{listingCounts.machinery}</h3><p>Machinery</p></div>
                      <div className="stat-card neutral"><div className="icon">🧑‍🔧</div><h3>{listingCounts.workers}</h3><p>Workers</p></div>
                      <div className="stat-card neutral"><div className="icon">📦</div><h3>{listingCounts.business}</h3><p>Business Zone</p></div>
                      <div className="stat-card neutral"><div className="icon">🚚</div><h3>{listingCounts.freelance}</h3><p>Freelancing</p></div>
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
                  ) : pendingApps.length === 0 ? (
                      <div className="empty-state">
                          <CheckCircle size={48} color="#10b981" />
                          <p>You're all caught up! No pending applications.</p>
                      </div>
                  ) : (
                      <div className="cards-list">
                          {pendingApps.map(app => (
                              <ApplicationCard 
                                  key={app.id} 
                                  app={app} 
                                  onApprove={() => handleApproveSeller(app)} 
                                  onReject={(reason) => handleReject(app, reason)} 
                              />
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
                  
                  <div className="approved-directory">
                      <div className="text-list">
                          {approvedApps.length === 0 && <p style={{color:'#64748b'}}>No approved sellers yet.</p>}
                          {approvedApps.map(app => (
                              <div key={app.id} className="text-row">
                                  <strong>{app.sellerId}</strong> &mdash; 
                                  {app.accountType === 'organisation' ? app.companyName : app.fullName} 
                                  ({app.categories?.join(', ') || 'No categories'}) &mdash; 
                                  {app.phone} &mdash; {app.village}, {app.district}
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          )}

          {/* LISTINGS TAB */}
          {activeTab === 'listings' && (
              <div className="tab-content">
                  <div className="header-titles">
                      <h1>Active Listings</h1>
                      <p>Manage all active market listings.</p>
                  </div>
                  <div className="empty-state">
                      <List size={48} color="#64748b" />
                      <p>Listing management UI will be built alongside the listing forms.</p>
                  </div>
              </div>
          )}

      </main>
    </div>
  );
}

// Sub-component for the application card (Shows FULL DETAILS for employee to verify)
const ApplicationCard = ({ app, onApprove, onReject }) => {
    const [showReject, setShowReject] = React.useState(false);
    const [rejectReason, setRejectReason] = React.useState("");

    const handleConfirmReject = () => {
        if (!rejectReason.trim()) {
            alert("Please provide a reason for rejection.");
            return;
        }
        onReject(rejectReason);
    };

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
                    <button onClick={() => setShowReject(!showReject)} className="btn-action btn-reject"><XCircle size={18} /> {showReject ? "Cancel" : "Reject"}</button>
                    <button onClick={onApprove} className="btn-action btn-approve"><CheckCircle size={18} /> Approve Application</button>
                </div>
            </div>

            {showReject && (
                <div style={{ padding: '20px 24px', background: '#fef2f2', borderBottom: '1px solid #fee2e2' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '800', color: '#991b1b', marginBottom: '8px' }}>Reason for Rejection:</label>
                    <textarea 
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #fca5a5', minHeight: '80px', marginBottom: '15px', fontSize: '14px', outline: 'none' }}
                        placeholder="Explain why this application is being rejected..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                    ></textarea>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button onClick={() => setShowReject(false)} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #fca5a5', background: 'white', color: '#991b1b', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
                        <button onClick={handleConfirmReject} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#dc2626', color: 'white', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}><XCircle size={16} /> Confirm Reject</button>
                    </div>
                </div>
            )}

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
                        {(app.isOrganic || app.freshProduceTypes) && (
                            <div className="info-block">
                                <span className="lbl">Farm & Produce</span>
                                <span className="val">
                                    {app.isOrganic === 'yes' ? <span style={{color: '#10b981', fontWeight: 'bold'}}>100% Organic 🌱</span> : 'Conventional'} 
                                    {app.freshProduceTypes && <><br/>Crops: {app.freshProduceTypes}</>}
                                    {app.orgProduceCapacity && <><br/>Capacity: {app.orgProduceCapacity}</>}
                                </span>
                            </div>
                        )}
                        {(app.machineryDetails || app.orgMachineryDetails) && (
                            <div className="info-block">
                                <span className="lbl">Machinery / Vehicles</span>
                                <span className="val">
                                    {app.machineryDetails || app.orgMachineryDetails}
                                    {(app.orgMachineryCapacity) && ` (Capacity: ${app.orgMachineryCapacity})`}
                                </span>
                            </div>
                        )}
                        {(app.harvestCrops || app.orgHarvestCrops) && (
                            <div className="info-block">
                                <span className="lbl">Harvest Output</span>
                                <span className="val">
                                    {app.harvestCrops || app.orgHarvestCrops} 
                                    {(app.harvestQuantity || app.orgHarvestCapacity) && ` - ${app.harvestQuantity || app.orgHarvestCapacity}`}
                                </span>
                            </div>
                        )}
                        {(app.workerSkills || app.orgWorkerSkills || app.orgWorkerCount) && (
                            <div className="info-block">
                                <span className="lbl">Labor / Workers</span>
                                <span className="val">
                                    {app.workerSkills || app.orgWorkerSkills}
                                    {app.orgWorkerCount && ` (Count: ${app.orgWorkerCount})`}
                                </span>
                            </div>
                        )}
                        {(app.freelanceWorks || app.freelanceSkillSet || app.orgFreelancerSkills) && (
                            <div className="info-block">
                                <span className="lbl">Freelance / Skills</span>
                                <span className="val">
                                    {app.freelanceWorks || app.freelanceSkillSet || app.orgFreelancerSkills}
                                    {app.freelanceExperience && ` (${app.freelanceExperience} Yrs Exp)`}
                                    {app.orgFreelancerCount && ` (Count: ${app.orgFreelancerCount})`}
                                </span>
                            </div>
                        )}
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
      min-height: 100vh;
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