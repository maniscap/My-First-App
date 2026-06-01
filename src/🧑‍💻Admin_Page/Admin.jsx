import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { IoMdArrowBack } from 'react-icons/io';
import { CheckCircle, XCircle, Clock, User, Building, MapPin, Phone, Briefcase } from 'lucide-react';

function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  
  const [sellerApplications, setSellerApplications] = useState([]);
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
        const apps = await getDocs(collection(db, "seller_applications"));
        setSellerApplications(apps.docs.map(d => ({id:d.id, ...d.data()})));
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

  // --- ACTION HANDLERS ---
  const handleReject = async (id) => {
    if(window.confirm("Are you sure you want to REJECT this application?")) {
        const sellerRef = doc(db, "seller_applications", id);
        await updateDoc(sellerRef, { status: 'rejected' }); // Mark as rejected instead of deleting
        fetchData();
    }
  };

  const handleApproveSeller = async (id) => {
      if(window.confirm("Approve this seller? All heavy data/images will be stripped from the database.")) {
          const sellerRef = doc(db, "seller_applications", id);
          // When approved, we update status to approved. 
          // Note: Images were never sent to Firestore, so we just mark it approved.
          await updateDoc(sellerRef, { status: 'approved' });
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
                      <div className="input-group">
                          <label>Admin ID</label>
                          <input type="text" placeholder="Enter Admin ID" value={adminId} onChange={(e) => setAdminId(e.target.value)} required />
                      </div>
                      <div className="input-group">
                          <label>Password</label>
                          <input type="password" placeholder="Enter Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                      </div>
                      <button type="submit" className="btn-primary">Secure Login</button>
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
      
      {/* Desktop & Mobile Navbar */}
      <nav className="admin-navbar">
          <div className="nav-left">
              <Link to="/" className="nav-back"><IoMdArrowBack size={24}/></Link>
              <div className="nav-brand">
                  <span className="brand-icon">💼</span>
                  <span className="brand-text">Admin Dashboard</span>
              </div>
          </div>
          <button onClick={() => setIsAuthenticated(false)} className="btn-logout">Logout</button>
      </nav>

      <main className="dashboard-content">
          <div className="dashboard-header">
              <div className="header-titles">
                  <h1>Verification Hub</h1>
                  <p>Review full details of incoming applications.</p>
              </div>
              <div className="stats-cards">
                  <div className="stat-card pending">
                      <h3>{pendingApps.length}</h3>
                      <p>Pending Review</p>
                  </div>
                  <div className="stat-card approved">
                      <h3>{approvedApps.length}</h3>
                      <p>Verified / Approved</p>
                  </div>
                  <div className="stat-card rejected">
                      <h3>{rejectedApps.length}</h3>
                      <p>Rejected</p>
                  </div>
              </div>
          </div>

          <div className="applications-section">
              <h2 className="section-title">Applications Pending Review</h2>
              
              {loading ? (
                  <div className="loading-state">Loading applications...</div>
              ) : pendingApps.length === 0 ? (
                  <div className="empty-state">
                      <CheckCircle size={48} color="#10b981" />
                      <p>You're all caught up! No pending applications.</p>
                  </div>
              ) : (
                  <div className="cards-grid">
                      {pendingApps.map(app => (
                          <ApplicationCard 
                              key={app.id} 
                              app={app} 
                              onApprove={() => handleApproveSeller(app.id)} 
                              onReject={() => handleReject(app.id)} 
                          />
                      ))}
                  </div>
              )}

              {/* APPROVED SELLERS TEXT LIST */}
              {approvedApps.length > 0 && (
                  <div className="approved-directory">
                      <h2 className="section-title" style={{marginTop: '40px'}}>Approved Sellers Directory</h2>
                      <p className="directory-subtitle">Stored as pure text data.</p>
                      <div className="text-list">
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
              )}
          </div>
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
                    {app.accountType === 'organisation' ? <Building size={20} color="#3b82f6" /> : <User size={20} color="#8b5cf6" />}
                    <h3 className="seller-name">{app.accountType === 'organisation' ? app.companyName : app.fullName}</h3>
                </div>
                <span className="status-badge badge-orange">Pending Review</span>
            </div>

            <div className="seller-id-badge">
                <span className="id-label">SELLER ID</span>
                <span className="id-value">{app.sellerId}</span>
            </div>

            <div className="card-body">
                {/* Basic Info */}
                <div className="detail-group">
                    <h4>Basic Information</h4>
                    <p><strong>Phone:</strong> {app.phone}</p>
                    <p><strong>Aadhaar/ID:</strong> {app.aadhaarNumber || 'N/A'}</p>
                    <p><strong>Location:</strong> {app.village}, {app.mandal}, {app.district}, {app.state} - {app.pincode}</p>
                    <p><strong>Categories:</strong> {app.categories?.join(', ') || 'None'}</p>
                </div>

                {/* Specific details based on categories */}
                {app.categories && app.categories.length > 0 && (
                    <div className="detail-group">
                        <h4>Application Specifics</h4>
                        {app.categories.map(cat => (
                            <div key={cat} style={{marginBottom: '10px'}}>
                                <strong>{cat}:</strong>
                                <pre style={{fontSize: '11px', background: '#f8fafc', padding: '5px', borderRadius: '4px', overflowX: 'auto'}}>
                                    {JSON.stringify(app[cat] || 'No specific data provided', null, 2)}
                                </pre>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="card-actions">
                <button onClick={onReject} className="btn-action btn-reject">
                    <XCircle size={18} /> Reject
                </button>
                <button onClick={onApprove} className="btn-action btn-approve">
                    <CheckCircle size={18} /> Approve
                </button>
            </div>
        </div>
    );
};

// --- CSS STYLES FOR RESPONSIVENESS AND PREMIUM UI ---
const styles = `
  :root {
      --bg-color: #f8fafc;
      --card-bg: #ffffff;
      --text-main: #0f172a;
      --text-muted: #64748b;
      --primary: #3b82f6;
      --success: #10b981;
      --danger: #ef4444;
      --border: #e2e8f0;
  }

  /* LOGIN PAGE */
  .admin-login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      font-family: 'Inter', sans-serif;
      padding: 20px;
  }
  .login-card {
      background: white;
      padding: 40px;
      border-radius: 24px;
      width: 100%;
      max-width: 400px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
  }
  .login-header {
      text-align: center;
      margin-bottom: 30px;
  }
  .shield-icon {
      font-size: 48px;
      margin-bottom: 10px;
  }
  .login-header h2 {
      margin: 0 0 5px 0;
      color: #0f172a;
      font-size: 24px;
      font-weight: 800;
  }
  .login-header p {
      margin: 0;
      color: #64748b;
      font-size: 14px;
  }
  .input-group {
      margin-bottom: 20px;
  }
  .input-group label {
      display: block;
      margin-bottom: 8px;
      font-size: 13px;
      font-weight: 700;
      color: #475569;
  }
  .input-group input {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      font-size: 15px;
      box-sizing: border-box;
      outline: none;
      transition: border-color 0.2s;
  }
  .input-group input:focus {
      border-color: #3b82f6;
  }
  .btn-primary {
      width: 100%;
      padding: 14px;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
      transition: transform 0.1s;
  }
  .btn-primary:active {
      transform: scale(0.98);
  }
  .back-link {
      display: block;
      text-align: center;
      margin-top: 20px;
      color: #94a3b8;
      text-decoration: none;
      font-size: 14px;
      font-weight: 600;
  }

  /* DASHBOARD */
  .admin-dashboard {
      min-height: 100vh;
      background-color: var(--bg-color);
      font-family: 'Inter', sans-serif;
      color: var(--text-main);
  }
  .admin-navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      background: white;
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 100;
  }
  .nav-left {
      display: flex;
      align-items: center;
      gap: 16px;
  }
  .nav-back {
      color: var(--text-main);
      display: flex;
      align-items: center;
  }
  .nav-brand {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 800;
      font-size: 18px;
  }
  .btn-logout {
      background: #f1f5f9;
      border: none;
      color: #475569;
      padding: 8px 16px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
  }

  .dashboard-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 30px 24px;
  }
  .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 40px;
      flex-wrap: wrap;
      gap: 20px;
  }
  .header-titles h1 {
      margin: 0 0 8px 0;
      font-size: 28px;
      font-weight: 800;
  }
  .header-titles p {
      margin: 0;
      color: var(--text-muted);
  }
  .stats-cards {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
  }
  .stat-card {
      background: white;
      padding: 16px 24px;
      border-radius: 16px;
      border: 1px solid var(--border);
      min-width: 140px;
  }
  .stat-card h3 {
      margin: 0 0 4px 0;
      font-size: 24px;
      font-weight: 800;
  }
  .stat-card p {
      margin: 0;
      font-size: 13px;
      font-weight: 600;
  }
  .stat-card.pending h3 { color: #f59e0b; }
  .stat-card.approved h3 { color: #10b981; }
  .stat-card.rejected h3 { color: #ef4444; }

  .section-title {
      font-size: 20px;
      font-weight: 800;
      margin-bottom: 20px;
      border-bottom: 2px solid var(--border);
      padding-bottom: 10px;
  }

  /* GRID SYSTEM */
  .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 24px;
  }

  /* CARDS */
  .app-card {
      background: white;
      border-radius: 20px;
      border: 1px solid var(--border);
      padding: 24px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
      transition: transform 0.2s, box-shadow 0.2s;
      display: flex;
      flex-direction: column;
  }
  .app-card:hover {
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
  }
  .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 15px;
  }
  .card-title-group {
      display: flex;
      align-items: center;
      gap: 10px;
  }
  .seller-name {
      margin: 0;
      font-size: 18px;
      font-weight: 800;
  }
  .status-badge {
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
  }
  .badge-orange { background: #fffbeb; color: #b45309; border: 1px solid #fde68a; }

  .seller-id-badge {
      background: #f1f5f9;
      padding: 8px 12px;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
      border: 1px dashed #cbd5e1;
  }
  .id-label { font-size: 11px; font-weight: 800; color: #64748b; }
  .id-value { font-size: 13px; font-weight: 800; color: #0f172a; font-family: monospace; }

  .card-body {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 24px;
      flex-grow: 1;
  }
  .detail-group h4 {
      margin: 0 0 8px 0;
      font-size: 14px;
      color: var(--primary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
  }
  .detail-group p {
      margin: 0 0 4px 0;
      font-size: 13px;
      color: #334155;
  }

  .card-actions {
      display: flex;
      gap: 12px;
  }
  .btn-action {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px;
      border-radius: 10px;
      border: none;
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
  }
  .btn-reject {
      background: #fef2f2;
      color: #dc2626;
  }
  .btn-reject:hover { background: #fee2e2; }
  .btn-approve {
      background: var(--success);
      color: white;
      box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3);
  }
  .btn-approve:hover { background: #059669; }

  .empty-state {
      text-align: center;
      padding: 60px 20px;
      background: white;
      border-radius: 20px;
      border: 1px dashed var(--border);
  }
  .empty-state p { margin-top: 15px; color: var(--text-muted); font-weight: 500; }

  /* APPROVED DIRECTORY - PRINT STYLE */
  .approved-directory {
      margin-top: 50px;
      background: white;
      padding: 30px;
      border-radius: 16px;
      border: 1px solid var(--border);
  }
  .directory-subtitle {
      color: var(--text-muted);
      font-size: 14px;
      margin-top: -15px;
      margin-bottom: 20px;
  }
  .text-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
  }
  .text-row {
      font-family: 'Courier New', monospace;
      font-size: 13px;
      padding: 10px;
      border-bottom: 1px solid #f1f5f9;
      color: #1e293b;
  }

  /* MOBILE RESPONSIVENESS */
  @media (max-width: 768px) {
      .dashboard-header {
          flex-direction: column;
          align-items: flex-start;
      }
      .stats-cards {
          width: 100%;
      }
      .stat-card {
          flex: 1;
          padding: 12px 16px;
      }
      .cards-grid {
          grid-template-columns: 1fr;
      }
  }
`;

export default Admin;