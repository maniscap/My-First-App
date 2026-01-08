import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoMdAdd, IoMdArrowBack, IoMdMore, IoMdTrash, IoMdCreate, IoMdTime, IoMdWater } from 'react-icons/io';
import { FaLeaf, FaChartLine } from 'react-icons/fa';

function Expenditure() {
  const navigate = useNavigate();
  const [folders, setFolders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  
  // New Folder Form State
  const [newFolder, setNewFolder] = useState({ 
      name: '', emoji: '🍅', acres: '', 
      landType: 'own', // own | lease
      leaseAmount: '', // per acre
      season: 'kharif', // kharif | rabi | zaid
      waterSource: 'irrigated' // irrigated | rainfed
  });

  const [activeMenuId, setActiveMenuId] = useState(null); // For "Three Dots" outside

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('farmBuddy_expenditure_folders') || '[]');
    setFolders(saved);
  }, []);

  const handleSave = () => {
    if (!newFolder.name) return;
    
    // Calculate Total Lease Cost immediately
    const totalLease = newFolder.landType === 'lease' 
        ? (parseFloat(newFolder.leaseAmount || 0) * parseFloat(newFolder.acres || 0)) 
        : 0;

    const folder = { 
        id: Date.now(), 
        ...newFolder, 
        totalAmount: 0, // Expenditure starts at 0 (or totalLease if you want to count it immediately)
        itemCount: 0,
        status: 'running', // running | completed
        leaseCostTotal: totalLease 
    };
    
    const updated = [folder, ...folders];
    setFolders(updated);
    localStorage.setItem('farmBuddy_expenditure_folders', JSON.stringify(updated));
    setShowModal(false);
    setNewFolder({ name: '', emoji: '🍅', acres: '', landType: 'own', leaseAmount: '', season: 'kharif', waterSource: 'irrigated' });
  };

  const deleteFolder = (e, id) => {
      e.stopPropagation();
      if(window.confirm("Delete this crop folder?")) {
          const updated = folders.filter(f => f.id !== id);
          setFolders(updated);
          localStorage.setItem('farmBuddy_expenditure_folders', JSON.stringify(updated));
      }
      setActiveMenuId(null);
  };

  const toggleMenu = (e, id) => {
      e.stopPropagation();
      setActiveMenuId(activeMenuId === id ? null : id);
  };

  // Helper to render card style based on status
  const getCardStyle = (folder) => {
      if (folder.status !== 'completed') return styles.card; // Default Dark
      
      // Calculate Profit/Loss for visual
      const revenue = folder.harvestDetails?.totalRevenue || 0;
      const expenses = (folder.totalAmount || 0) + (folder.leaseCostTotal || 0);
      const profit = revenue - expenses;

      if (profit >= 0) return styles.cardProfit; // Green
      return styles.cardLoss; // Red
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={() => navigate('/dashboard')} style={styles.backBtn}><IoMdArrowBack size={24} /></button>
        <h2 style={styles.title}>Crop Expenditure</h2>
      </div>

      {/* Grid */}
      <div style={styles.grid}>
        {folders.length === 0 ? <p style={{textAlign:'center', color:'#666', gridColumn:'1/-1', marginTop:'50px'}}>No crops added yet.</p> : folders.map(f => {
            
            // Calculate Profit for Display
            const rev = f.harvestDetails?.totalRevenue || 0;
            const exp = (f.totalAmount || 0) + (f.leaseCostTotal || 0);
            const net = rev - exp;

            return (
              <div key={f.id} onClick={() => navigate(`/expenditure/${f.id}`)} style={getCardStyle(f)}>
                
                {/* 1. THREE DOTS OUTSIDE */}
                <div style={styles.cardHeader}>
                    <span style={{fontSize:'28px'}}>{f.emoji}</span>
                    <button onClick={(e) => toggleMenu(e, f.id)} style={styles.menuBtn}>
                        <IoMdMore size={24} color="white"/>
                    </button>
                    {activeMenuId === f.id && (
                        <div style={styles.dropdown}>
                            <div onClick={(e) => deleteFolder(e, f.id)} style={styles.menuItem}>🗑️ Delete</div>
                        </div>
                    )}
                </div>

                <h3 style={styles.cardTitle}>{f.name}</h3>
                
                {/* Details Badges */}
                <div style={{display:'flex', gap:'5px', flexWrap:'wrap', marginBottom:'10px'}}>
                    {f.acres && <span style={styles.badge}>{f.acres} Acr</span>}
                    <span style={styles.badge}>{f.season}</span>
                    <span style={styles.badge}>{f.landType === 'lease' ? 'Leased' : 'Own'}</span>
                </div>

                {/* 3. HARVEST STATUS DISPLAY */}
                {f.status === 'completed' ? (
                     <div style={{borderTop:'1px solid rgba(255,255,255,0.2)', paddingTop:'10px', marginTop:'10px'}}>
                        <div style={{fontSize:'12px', opacity:0.8}}>Net {net >= 0 ? 'Profit' : 'Loss'}</div>
                        <div style={{fontSize:'22px', fontWeight:'bold', color: 'white'}}>
                            {net >= 0 ? '+' : ''}₹{Math.abs(net).toLocaleString()}
                        </div>
                     </div>
                ) : (
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginTop:'10px'}}>
                        <div>
                            <div style={{fontSize:'12px', color:'rgba(255,255,255,0.6)'}}>Spent</div>
                            <div style={{fontSize:'18px', fontWeight:'bold'}}>₹{(f.totalAmount || 0).toLocaleString()}</div>
                        </div>
                        <div style={{fontSize:'12px', color:'rgba(255,255,255,0.4)'}}>{f.itemCount} bills</div>
                    </div>
                )}
              </div>
            );
        })}
      </div>

      {/* FAB */}
      <button onClick={() => setShowModal(true)} style={styles.fab}><IoMdAdd size={28} /></button>

      {/* 2. ADVANCED CREATE MODAL */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={{color:'white', margin:'0 0 20px 0'}}>Start New Crop</h3>
            
            <label style={styles.label}>Crop Name</label>
            <input placeholder="Ex: Tomato 2024" style={styles.input} value={newFolder.name} onChange={e => setNewFolder({...newFolder, name: e.target.value})} autoFocus/>

            <div style={{display:'flex', gap:'10px'}}>
                <div style={{flex:1}}>
                    <label style={styles.label}>Acres</label>
                    <input type="number" placeholder="0.0" style={styles.input} value={newFolder.acres} onChange={e => setNewFolder({...newFolder, acres: e.target.value})}/>
                </div>
                <div style={{flex:1}}>
                    <label style={styles.label}>Season</label>
                    <select style={styles.select} value={newFolder.season} onChange={e => setNewFolder({...newFolder, season: e.target.value})}>
                        <option value="kharif">Kharif (Monsoon)</option>
                        <option value="rabi">Rabi (Winter)</option>
                        <option value="zaid">Zaid (Summer)</option>
                    </select>
                </div>
            </div>

            <div style={{margin:'15px 0', background:'rgba(255,255,255,0.05)', padding:'15px', borderRadius:'10px'}}>
                <label style={styles.label}>Land Type</label>
                <div style={{display:'flex', gap:'10px', marginBottom: newFolder.landType === 'lease' ? '10px' : '0'}}>
                    <button onClick={()=>setNewFolder({...newFolder, landType:'own'})} style={newFolder.landType==='own' ? styles.toggleActive : styles.toggle}>Own Land</button>
                    <button onClick={()=>setNewFolder({...newFolder, landType:'lease'})} style={newFolder.landType==='lease' ? styles.toggleActive : styles.toggle}>Lease / Tenancy</button>
                </div>

                {newFolder.landType === 'lease' && (
                    <div style={{animation:'fadeIn 0.3s'}}>
                        <label style={styles.label}>Lease Amount (Per Acre)</label>
                        <div style={{display:'flex', alignItems:'center', background:'rgba(255,255,255,0.1)', borderRadius:'8px', padding:'0 10px'}}>
                            <span>₹</span>
                            <input type="number" placeholder="Ex: 20000" style={{...styles.input, border:'none', background:'transparent'}} value={newFolder.leaseAmount} onChange={e => setNewFolder({...newFolder, leaseAmount: e.target.value})}/>
                        </div>
                        <div style={{fontSize:'12px', color:'#aaa', marginTop:'5px'}}>
                            Total Lease: ₹{((parseFloat(newFolder.acres)||0) * (parseFloat(newFolder.leaseAmount)||0)).toLocaleString()}
                        </div>
                    </div>
                )}
            </div>

            <label style={styles.label}>Water Supply</label>
            <select style={styles.select} value={newFolder.waterSource} onChange={e => setNewFolder({...newFolder, waterSource: e.target.value})}>
                <option value="irrigated">💧 Irrigated (Bore/Canal)</option>
                <option value="rainfed">☁️ Rain-fed (Dependency)</option>
            </select>

            <div style={{display:'flex', gap:'10px', marginTop:'25px'}}>
                <button onClick={() => setShowModal(false)} style={styles.cancelBtn}>Cancel</button>
                <button onClick={handleSave} style={styles.saveBtn}>Create Folder</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#0f1215', color: 'white', fontFamily: 'sans-serif', padding: '20px' },
  header: { display: 'flex', alignItems: 'center', marginBottom: '20px' },
  backBtn: { background: 'none', border: 'none', color: 'white', cursor: 'pointer', marginRight: '15px' },
  title: { margin: 0, fontSize: '22px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '15px' },
  
  // Card Styles
  card: { background: 'rgba(255,255,255,0.05)', borderRadius: '20px', padding: '15px', position: 'relative', border: '1px solid rgba(255,255,255,0.1)', cursor:'pointer' },
  cardProfit: { background: 'linear-gradient(135deg, #1b5e20 0%, #0f1215 100%)', borderRadius: '20px', padding: '15px', position: 'relative', border: '1px solid #2e7d32', cursor:'pointer' },
  cardLoss: { background: 'linear-gradient(135deg, #b71c1c 0%, #0f1215 100%)', borderRadius: '20px', padding: '15px', position: 'relative', border: '1px solid #c62828', cursor:'pointer' },

  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  cardTitle: { margin: '0 0 5px 0', fontSize: '16px' },
  badge: { fontSize:'10px', background:'rgba(255,255,255,0.1)', padding:'2px 6px', borderRadius:'4px' },
  
  menuBtn: { background:'transparent', border:'none', color:'white', cursor:'pointer' },
  dropdown: { position:'absolute', top:'40px', right:'10px', background:'#222', padding:'10px', borderRadius:'8px', boxShadow:'0 5px 15px rgba(0,0,0,0.5)', zIndex:10 },
  menuItem: { color:'#ff5252', fontSize:'14px', cursor:'pointer' },

  fab: { position: 'fixed', bottom: '20px', right: '20px', width: '56px', height: '56px', borderRadius: '50%', background: '#4CAF50', color: 'white', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modalContent: { background: '#1A1A1C', padding: '25px', borderRadius: '20px', width: '90%', maxWidth: '350px' },
  label: { display:'block', fontSize:'12px', color:'#aaa', marginBottom:'5px', marginLeft:'2px' },
  input: { width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', marginBottom: '15px', boxSizing:'border-box' },
  select: { width: '100%', padding: '12px', borderRadius: '10px', background: '#222', border: '1px solid #444', color: 'white', marginBottom: '15px' },
  
  toggle: { flex:1, padding:'10px', borderRadius:'8px', background:'transparent', border:'1px solid #444', color:'#888', cursor:'pointer' },
  toggleActive: { flex:1, padding:'10px', borderRadius:'8px', background:'#4CAF50', border:'1px solid #4CAF50', color:'white', fontWeight:'bold', cursor:'pointer' },

  saveBtn: { flex:1, padding: '12px', borderRadius: '10px', background: '#4CAF50', color: 'white', border: 'none', fontWeight:'bold', cursor:'pointer' },
  cancelBtn: { flex:1, padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', cursor:'pointer' }
};

export default Expenditure;