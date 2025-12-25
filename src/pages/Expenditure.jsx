import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoMdArrowBack, IoMdSearch, IoMdAdd, IoMdClose } from 'react-icons/io';
import { FaLeaf } from 'react-icons/fa';

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
    if (lower.includes('grape')) return '🍇';
    if (lower.includes('sugar')) return '🎋';
    return '📁'; 
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    const newFolder = {
      id: Date.now(), 
      name: newFolderName,
      emoji: getCropEmoji(newFolderName), 
      createdAt: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
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
            <div 
                key={folder.id} 
                style={styles.folderCard}
                onClick={() => navigate(`/expenditure/${folder.id}`)} // 👈 LINK TO NEW PAGE
            >
              {/* Top Row: Icon & Date */}
              <div style={styles.folderIconRow}>
                <div style={styles.emojiBox}>{folder.emoji || getCropEmoji(folder.name)}</div>
                <span style={styles.folderDate}>{folder.createdAt}</span>
              </div>
              
              {/* Middle: Name */}
              <div style={styles.folderName}>{folder.name}</div>
              
              {/* Bottom: Stats */}
              <div style={styles.folderStats}>
                <span>{folder.itemCount} Bills</span>
                <span style={styles.amountBadge}>₹{folder.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* --- FAB (Create Folder) --- */}
      <div style={styles.fab} onClick={() => setShowAddModal(true)}>
        <IoMdAdd size={32} color="#fff" />
      </div>

      {/* --- MODAL (Glassmorphism) --- */}
      {showAddModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={{margin:0, color:'white', fontSize:'20px'}}>New Crop Folder</h3>
              <button onClick={() => setShowAddModal(false)} style={styles.closeBtn}><IoMdClose size={22}/></button>
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

// --- MODERN GLASSMORPHISM STYLES ---
const styles = {
  page: { 
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
    background: 'linear-gradient(to bottom, #0f1215, #151920)', // Deep Premium Dark
    color: 'white', fontFamily: '"SF Pro Display", sans-serif',
    overflowY: 'auto', paddingBottom: '100px'
  },
  header: { 
    display: 'flex', alignItems: 'center', padding: '20px', 
    background: 'rgba(15, 18, 21, 0.8)', backdropFilter: 'blur(10px)',
    position: 'sticky', top: 0, zIndex: 10, borderBottom: '1px solid rgba(255,255,255,0.05)'
  },
  backBtn: { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius:'50%', width:'40px', height:'40px', display:'flex', alignItems:'center', justifyContent:'center', cursor: 'pointer', marginRight: '15px' },
  pageTitle: { margin: 0, fontSize: '24px', fontWeight: '700', letterSpacing:'0.5px' },
  
  searchContainer: { 
    margin: '15px 20px 25px 20px', 
    background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(15px)',
    borderRadius: '18px', display: 'flex', alignItems: 'center', height: '55px', 
    border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
  },
  searchInput: { 
    background: 'transparent', border: 'none', color: 'white', 
    fontSize: '16px', marginLeft: '10px', width: '100%', outline: 'none',
    fontWeight: '400'
  },

  grid: { 
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', padding: '0 20px' 
  },
  folderCard: {
    background: 'rgba(255, 255, 255, 0.06)', backdropFilter: 'blur(20px)',
    borderRadius: '24px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '15px',
    border: '1px solid rgba(255, 255, 255, 0.08)', 
    boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
    cursor: 'pointer', transition: 'transform 0.2s', position: 'relative', overflow: 'hidden'
  },
  folderIconRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  emojiBox: { fontSize: '36px', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))' },
  folderDate: { fontSize: '11px', color: 'rgba(255,255,255,0.5)', background:'rgba(255,255,255,0.05)', padding:'4px 8px', borderRadius:'8px', height:'fit-content' },
  folderName: { fontSize: '18px', fontWeight: '600', lineHeight: '1.3', letterSpacing:'0.3px' },
  folderStats: { 
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.5)',
    marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)'
  },
  amountBadge: { 
    fontWeight:'700', color:'#4CAF50', background:'rgba(76, 175, 80, 0.15)', 
    padding:'4px 8px', borderRadius:'6px', letterSpacing:'0.5px' 
  },

  emptyState: { 
    gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', 
    marginTop: '60px', textAlign: 'center' 
  },
  emptyIcon: { 
    width: '90px', height: '90px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', 
    display: 'flex', alignItems: 'center', justifyContent: 'center', border:'1px dashed rgba(255,255,255,0.15)'
  },
  
  fab: {
    position: 'fixed', bottom: '30px', left: '25px', 
    width: '65px', height: '65px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 15px 35px rgba(76, 175, 80, 0.3)', cursor: 'pointer', zIndex: 100,
    border: '1px solid rgba(255,255,255,0.2)'
  },

  modalOverlay: {
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200
  },
  modalContent: {
    background: 'rgba(30, 30, 30, 0.85)', backdropFilter: 'blur(30px)',
    width: '85%', maxWidth: '350px', borderRadius: '32px', padding: '30px', 
    border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 40px 80px rgba(0,0,0,0.6)'
  },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
  closeBtn: { background: 'rgba(255,255,255,0.08)', border: 'none', color: 'white', cursor: 'pointer', width:'32px', height:'32px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' },
  modalInput: {
    width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)',
    padding: '16px', borderRadius: '16px', color: 'white', fontSize: '18px',
    marginBottom: '20px', outline: 'none', boxSizing: 'border-box'
  },
  createBtn: {
    width: '100%', background: '#4CAF50', border: 'none', padding: '16px',
    borderRadius: '16px', color: 'white', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer',
    boxShadow: '0 5px 15px rgba(76, 175, 80, 0.3)'
  }
};

export default Expenditure;