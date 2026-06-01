import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { IoMdArrowBack } from 'react-icons/io';

function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  
  // --- STATES ---
  const [sellerApplications, setSellerApplications] = useState([]);

  // --- LOGIN ---
  const handleLogin = (e) => {
      e.preventDefault();
      // Simple hardcoded auth for demo (can be moved to Firebase Auth later)
      if (adminId === 'admin' && password === 'admin123') {
          setIsAuthenticated(true);
      } else {
          alert('Invalid Admin ID or Password');
      }
  };

  // --- FETCH DATA ---
  const fetchData = async () => {
    try {
        const apps = await getDocs(collection(db, "seller_applications"));
        setSellerApplications(apps.docs.map(d => ({id:d.id, ...d.data()})));
    } catch (error) {
        console.error("Error fetching data:", error);
    }
  };

  useEffect(() => { 
      if (isAuthenticated) {
          fetchData(); 
      }
  }, [isAuthenticated]);



  // --- ACTION HANDLERS ---
  const handleDelete = async (col, id) => {
    if(window.confirm("Delete this item?")) {
        await deleteDoc(doc(db, col, id));
        fetchData();
    }
  };

  const handleApproveSeller = async (id) => {
      if(window.confirm("Approve this seller?")) {
          const sellerRef = doc(db, "seller_applications", id);
          await updateDoc(sellerRef, { status: 'approved' });
          alert("Seller Approved!");
          fetchData();
      }
  };

  if (!isAuthenticated) {
      return (
          <div style={{...styles.page, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <div style={styles.card}>
                  <h2 style={{marginTop: 0, textAlign: 'center'}}>Admin Login</h2>
                  <form onSubmit={handleLogin} style={styles.form}>
                      <input 
                          type="text" 
                          placeholder="Admin ID" 
                          value={adminId} 
                          onChange={(e) => setAdminId(e.target.value)} 
                          style={styles.input} 
                          required 
                      />
                      <input 
                          type="password" 
                          placeholder="Password" 
                          value={password} 
                          onChange={(e) => setPassword(e.target.value)} 
                          style={styles.input} 
                          required 
                      />
                      <button type="submit" style={styles.btn}>Login to Dashboard</button>
                  </form>
                  <Link to="/" style={{display: 'block', textAlign: 'center', marginTop: '15px', color: '#888'}}>Back to App</Link>
              </div>
          </div>
      );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
          <Link to="/" style={styles.backBtn}><IoMdArrowBack size={24}/></Link>
          <h1 style={styles.title}>Admin Dashboard</h1>
          <button onClick={() => setIsAuthenticated(false)} style={styles.logoutBtn}>Logout</button>
      </div>

      <div style={styles.tabsContainer}>
          <button style={styles.activeTab}>
              Seller Applications ({sellerApplications.filter(a => a.status === 'pending_approval').length})
          </button>
      </div>

      <div style={styles.container}>
          <div>
              <h2 style={{marginTop: 0}}>Pending Seller Applications</h2>
              {sellerApplications.length === 0 ? <p style={{color: '#888'}}>No applications found.</p> : null}
              
              <div style={styles.list}>
                  {sellerApplications.map(app => (
                      <div key={app.id} style={styles.appCard}>
                          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px'}}>
                              <div>
                                  <span style={{background: app.status === 'approved' ? '#065f46' : '#854d0e', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase'}}>{app.status}</span>
                                  <h3 style={{margin: '10px 0 5px'}}>{app.accountType === 'organisation' ? app.companyName : app.fullName}</h3>
                                  <p style={{margin: 0, color: '#aaa', fontSize: '14px'}}>ID: <b>{app.sellerId}</b> | Type: {app.accountType}</p>
                              </div>
                              <div style={{display: 'flex', gap: '10px'}}>
                                  {app.status === 'pending_approval' && (
                                      <button onClick={() => handleApproveSeller(app.id)} style={{...styles.btn, background: '#10b981'}}>Approve</button>
                                  )}
                                  <button onClick={() => handleDelete('seller_applications', app.id)} style={styles.delBtn}>Reject / Delete</button>
                              </div>
                          </div>
                          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '14px', background: '#222', padding: '15px', borderRadius: '8px'}}>
                              <p style={{margin:0}}><b>Phone:</b> {app.phone}</p>
                              <p style={{margin:0}}><b>Location:</b> {app.village}, {app.district}</p>
                              <p style={{margin:0}}><b>Categories:</b> {app.categories?.join(', ')}</p>
                              <p style={{margin:0}}><b>Submitted:</b> {new Date(app.submittedAt).toLocaleDateString()}</p>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </div>
    </div>
  );
}

const styles = {
  page: { background: '#000', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid #333' },
  backBtn: { color: '#fff', textDecoration: 'none' },
  title: { fontSize: '18px', fontWeight: 'bold', margin: 0 },
  logoutBtn: { background: 'transparent', border: '1px solid #555', color: '#fff', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' },
  tabsContainer: { display: 'flex', borderBottom: '1px solid #333', padding: '0 20px' },
  tab: { background: 'transparent', border: 'none', color: '#888', padding: '15px 20px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' },
  activeTab: { background: 'transparent', border: 'none', color: '#fff', padding: '15px 20px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', borderBottom: '3px solid #3b82f6' },
  container: { padding: '20px', maxWidth: '800px', margin: '0 auto' },
  card: { background: '#111', padding: '25px', borderRadius: '12px', border: '1px solid #333', marginBottom: '20px', width: '100%', maxWidth: '400px' },
  appCard: { background: '#111', padding: '20px', borderRadius: '12px', border: '1px solid #333', marginBottom: '15px' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  row: { display: 'flex', gap: '10px' },
  input: { flex: 1, padding: '12px', background: '#222', border: '1px solid #444', color: '#fff', borderRadius: '8px', outline: 'none', width: '100%', boxSizing: 'border-box' },
  btn: { padding: '12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  list: { display: 'flex', flexDirection: 'column', gap: '10px' },
  listItem: { display: 'flex', justifyContent: 'space-between', padding: '15px', background: '#111', border: '1px solid #333', borderRadius: '8px', alignItems: 'center' },
  delBtn: { background: 'rgba(255, 0, 0, 0.2)', color: 'red', border: 'none', borderRadius: '4px', padding: '8px 12px', cursor: 'pointer', fontWeight: 'bold' }
};

export default Admin;