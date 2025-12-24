import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoMdArrowBack, IoMdSearch, IoMdAdd, IoMdClose } from 'react-icons/io';
import { FaLeaf } from 'react-icons/fa';

// 👇 1. IMPORT THE NEW CALCULATOR
import FloatingCalculator from '../components/FloatingCalculator';

function Expenditure() {
  const navigate = useNavigate();

  // --- STATE ---
  const [folders, setFolders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // --- LOCAL STORAGE ---
  useEffect(() => {
    const saved = localStorage.getItem('farmBuddy_expenditure_folders');
    if (saved) setFolders(JSON.parse(saved));
  }, []);

  const saveFolders = (updatedFolders) => {
    setFolders(updatedFolders);
    localStorage.setItem('farmBuddy_expenditure_folders', JSON.stringify(updatedFolders));
  };

  // --- EMOJI LOGIC ---
  const getCropEmoji = (name) => {
    const lower = name.toLowerCase();
    if (lower.includes('tomato')) return '🍅';
    if (lower.includes('potato')) return '🥔';
    if (lower.includes('onion')) return '🧅';
    if (lower.includes('rice') || lower.includes('paddy')) return '🌾';
    if (lower.includes('wheat')) return '🌾';
    if (lower.includes('corn') || lower.includes('maize')) return '🌽';
    if (lower.includes('cotton')) return '🌿';
    if (lower.includes('chilli')) return '🌶️';
    if (lower.includes('mango')) return '🥭';
    if (lower.includes('banana')) return '🍌';
    return '📁'; 
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    const newFolder = {
      id: Date.now(), 
      name: newFolderName,
      emoji: getCropEmoji(newFolderName), 
      createdAt: new Date().toLocaleDateString(),
      totalAmount: 0, itemCount: 0
    };
    const updated = [newFolder, ...folders];
    saveFolders(updated);
    setNewFolderName('');
    setShowAddModal(false);
  };

  const filteredFolders = folders.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div style={styles.page}>
      
      {/* 👇 2. PLACE THE CALCULATOR HERE */}
      <FloatingCalculator />

      {/* --- HEADER --- */}
      <div style={styles.header}>
        <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>
          <IoMdArrowBack size={24} color="#fff" />
        </button>
        <h2 style={styles.pageTitle}>Crop Expenditure</h2>
      </div>

      {/* --- SEARCH --- */}
      <div style={styles.searchContainer}>
        <IoMdSearch size={22} color="rgba(255,255,255,0.6)" style={{marginLeft:'15px'}}/>
        <input 
          type="text" 
          placeholder="Search crop folders..." 
          style={styles.searchInput}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* --- GRID --- */}
      <div style={styles.grid}>
        {filteredFolders.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}><FaLeaf size={40} color="rgba(255,255,255,0.5)"/></div>
            <p style={{marginTop:'15px', color:'rgba(255,255,255,0.6)'}}>No folders found.</p>
          </div>
        ) : (
          filteredFolders.map((folder) => (
            <div key={folder.id} className="glass-card" style={styles.folderCard}>
              <div style={styles.folderIconRow}>
                <span style={{fontSize:'32px'}}>{folder.emoji || getCropEmoji(folder.name)}</span>
                <span style={styles.folderDate}>{folder.createdAt}</span>
              </div>
              <div style={styles.folderName}>{folder.name}</div>
              <div style={styles.folderStats}>
                <span>{folder.itemCount} Bills</span>
                <span style={{fontWeight:'700', color:'#4CAF50'}}>₹{folder.totalAmount}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* --- FAB (Create Folder) --- */}
      <div style={styles.fab} onClick={() => setShowAddModal(true)}>
        <IoMdAdd size={30} color="#fff" />
      </div>

      {/* --- MODAL --- */}
      {showAddModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={{margin:0, color:'white'}}>New Crop Folder</h3>
              <button onClick={() => setShowAddModal(false)} style={styles.closeBtn}><IoMdClose size={24}/></button>
            </div>
            <input 
              type="text" 
              placeholder="Ex: Cotton 2025" 
              autoFocus
              style={styles.modalInput}
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
            />
            <button onClick={handleCreateFolder} style={styles.createBtn}>
              Create Folder
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- STYLES ---
const styles = {
  page: { 
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
    background: '#121212', color: 'white', fontFamily: '"SF Pro Display", sans-serif',
    overflowY: 'auto'
  },
  header: { 
    display: 'flex', alignItems: 'center', padding: '20px', 
    background: 'transparent', 
    position: 'sticky', top: 0, zIndex: 10
  },
  backBtn: { background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', borderRadius:'50%', width:'40px', height:'40px', display:'flex', alignItems:'center', justifyContent:'center', cursor: 'pointer', marginRight: '15px' },
  pageTitle: { margin: 0, fontSize: '24px', fontWeight: '700', letterSpacing:'0.5px' },
  searchContainer: { 
    margin: '10px 20px 25px 20px', 
    background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)',
    borderRadius: '16px', display: 'flex', alignItems: 'center', height: '55px', 
    border: '1px solid rgba(255, 255, 255, 0.1)'
  },
  searchInput: { 
    background: 'transparent', border: 'none', color: 'white', 
    fontSize: '16px', marginLeft: '10px', width: '100%', outline: 'none'
  },
  grid: { 
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', padding: '0 20px 100px 20px' 
  },
  folderCard: {
    background: 'rgba(255, 255, 255, 0.07)', backdropFilter: 'blur(12px)',
    borderRadius: '24px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px',
    border: '1px solid rgba(255, 255, 255, 0.08)', boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    cursor: 'pointer'
  },
  folderIconRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  folderDate: { fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '5px', fontWeight:'500' },
  folderName: { fontSize: '17px', fontWeight: '600', lineHeight: '1.3' },
  folderStats: { 
    display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'rgba(255,255,255,0.5)',
    marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)'
  },
  emptyState: { 
    gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', 
    marginTop: '50px', textAlign: 'center' 
  },
  emptyIcon: { 
    width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', 
    display: 'flex', alignItems: 'center', justifyContent: 'center', border:'1px dashed rgba(255,255,255,0.2)'
  },
  fab: {
    position: 'fixed', bottom: '30px', left: '25px', 
    width: '65px', height: '65px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 10px 30px rgba(76, 175, 80, 0.3)', cursor: 'pointer', zIndex: 100,
    border: '1px solid rgba(255,255,255,0.2)'
  },
  modalOverlay: {
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200
  },
  modalContent: {
    background: 'rgba(30, 30, 30, 0.9)', backdropFilter: 'blur(20px)',
    width: '80%', maxWidth: '350px', borderRadius: '28px', padding: '25px', 
    border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
  },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
  closeBtn: { background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', width:'30px', height:'30px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' },
  modalInput: {
    width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
    padding: '16px', borderRadius: '16px', color: 'white', fontSize: '16px',
    marginBottom: '20px', outline: 'none', boxSizing: 'border-box'
  },
  createBtn: {
    width: '100%', background: '#4CAF50', border: 'none', padding: '16px',
    borderRadius: '16px', color: 'white', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer',
    boxShadow: '0 5px 15px rgba(76, 175, 80, 0.3)'
  }
};

export default Expenditure;