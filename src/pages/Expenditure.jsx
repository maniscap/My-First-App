import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoMdAdd, IoMdArrowBack, IoMdMore, IoMdClose } from 'react-icons/io';

// --- 🌾 EXTENDED CROP ICON LIBRARY (INDIAN CONTEXT) ---
const getAutoEmoji = (name) => {
    const n = name.toLowerCase().trim();

    // --- 1. MAIN FIELD CROPS (20+) ---
    if (n.includes('cotton')) return '☁️'; // Cloud looks like Cotton Boll
    if (n.includes('paddy') || n.includes('rice')) return '🌾';
    if (n.includes('wheat')) return '🌾'; // Wheat sheaf
    if (n.includes('maize') || n.includes('corn')) return '🌽';
    if (n.includes('sugarcane')) return '🎋';
    if (n.includes('groundnut') || n.includes('peanut')) return '🥜';
    if (n.includes('chilli') || n.includes('mirchi')) return '🌶️';
    if (n.includes('turmeric') || n.includes('haldi')) return '🔶';
    if (n.includes('soybean') || n.includes('soya')) return '🫘';
    if (n.includes('mustard')) return '🌼'; // Yellow flower
    if (n.includes('sunflower')) return '🌻';
    if (n.includes('tobacco')) return '🍂';
    if (n.includes('jute')) return '🧶';
    if (n.includes('tea')) return '🍵';
    if (n.includes('coffee')) return '☕';
    if (n.includes('coconut')) return '🥥';
    if (n.includes('arecanut') || n.includes('betel')) return '🌰';
    if (n.includes('rubber')) return '🌳';
    if (n.includes('bamboo')) return '🎍';
    if (n.includes('ginger')) return '🫚';
    if (n.includes('garlic')) return '🧄';

    // --- 2. VEGETABLES (15+) ---
    if (n.includes('tomato')) return '🍅';
    if (n.includes('potato') || n.includes('alu')) return '🥔';
    if (n.includes('onion')) return '🧅';
    if (n.includes('brinjal') || n.includes('eggplant')) return '🍆';
    if (n.includes('carrot')) return '🥕';
    if (n.includes('cucumber')) return '🥒';
    if (n.includes('capsicum')) return '🫑';
    if (n.includes('cabbage') || n.includes('lettuce')) return '🥬';
    if (n.includes('cauliflower')) return '🥦'; // Broccoli emoji works best visually
    if (n.includes('broccoli')) return '🥦';
    if (n.includes('peas') || n.includes('matar')) return '🫛';
    if (n.includes('okra') || n.includes('lady')) return '🥢'; // Visual approximation or generic green
    if (n.includes('pumpkin')) return '🎃';
    if (n.includes('radish')) return '🥢'; 
    if (n.includes('mushroom')) return '🍄';
    if (n.includes('spinach') || n.includes('palak')) return '🍃';
    if (n.includes('beetroot')) return '🟣';
    if (n.includes('sweet potato')) return '🍠';

    // --- 3. FRUITS (15+) ---
    if (n.includes('mango')) return '🥭';
    if (n.includes('banana')) return '🍌';
    if (n.includes('apple')) return '🍎';
    if (n.includes('grape')) return '🍇';
    if (n.includes('orange') || n.includes('santra')) return '🍊';
    if (n.includes('lemon') || n.includes('lime')) return '🍋';
    if (n.includes('watermelon')) return '🍉';
    if (n.includes('pineapple')) return '🍍';
    if (n.includes('papaya')) return '🍈'; // Melon is closest
    if (n.includes('pomegranate')) return '🔴'; // Red orb
    if (n.includes('guava')) return '🍐'; // Pear looks like Guava
    if (n.includes('strawberry')) return '🍓';
    if (n.includes('cherry')) return '🍒';
    if (n.includes('peach')) return '🍑';
    if (n.includes('jackfruit')) return '🍈'; // Melon approximation
    if (n.includes('custard apple')) return '🍏';

    // Default Fallback
    return '🌱'; 
};

function Expenditure() {
  const navigate = useNavigate();
  const [folders, setFolders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({ 
      name: '', emoji: '🌱', acres: '', 
      landType: 'own', leaseAmount: '', 
      season: 'kharif', waterSource: 'irrigated' 
  });

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('farmBuddy_expenditure_folders') || '[]');
    setFolders(saved);
  }, []);

  // --- ACTIONS ---
  const handleNameChange = (e) => {
      const name = e.target.value;
      setFormData({ ...formData, name: name, emoji: getAutoEmoji(name) });
  };

  const handleSave = () => {
    if (!formData.name) return;
    
    // Calculate Lease (Annual)
    const acres = parseFloat(formData.acres) || 0;
    const leasePerAcre = parseFloat(formData.leaseAmount) || 0;
    const totalLease = formData.landType === 'lease' ? (acres * leasePerAcre) : 0;

    let updatedFolders;
    
    if (editingId) {
        // UPDATE EXISTING FOLDER
        updatedFolders = folders.map(f => {
            if (f.id === editingId) {
                return { ...f, ...formData, leaseCostTotal: totalLease };
            }
            return f;
        });
    } else {
        // CREATE NEW FOLDER
        const newFolder = { 
            id: Date.now(), ...formData, 
            totalAmount: 0, itemCount: 0, status: 'running', leaseCostTotal: totalLease 
        };
        updatedFolders = [newFolder, ...folders];
    }
    
    setFolders(updatedFolders);
    localStorage.setItem('farmBuddy_expenditure_folders', JSON.stringify(updatedFolders));
    closeModal();
  };

  const deleteFolder = (e, id) => {
      e.stopPropagation();
      if(window.confirm("Delete this crop folder completely?")) {
          const updated = folders.filter(f => f.id !== id);
          setFolders(updated);
          localStorage.setItem('farmBuddy_expenditure_folders', JSON.stringify(updated));
          
          const allBills = JSON.parse(localStorage.getItem('farmBuddy_bills') || '[]');
          const cleanBills = allBills.filter(b => b.folderId.toString() !== id.toString());
          localStorage.setItem('farmBuddy_bills', JSON.stringify(cleanBills));
      }
      setActiveMenuId(null);
  };

  const openEditModal = (e, folder) => {
      e.stopPropagation();
      setFormData({
          name: folder.name, emoji: folder.emoji, acres: folder.acres,
          landType: folder.landType, leaseAmount: folder.leaseAmount || '',
          season: folder.season, waterSource: folder.waterSource
      });
      setEditingId(folder.id);
      setShowModal(true);
      setActiveMenuId(null);
  };

  const closeModal = () => {
      setShowModal(false);
      setEditingId(null);
      setFormData({ name: '', emoji: '🌱', acres: '', landType: 'own', leaseAmount: '', season: 'kharif', waterSource: 'irrigated' });
  };

  const toggleMenu = (e, id) => {
      e.stopPropagation();
      setActiveMenuId(activeMenuId === id ? null : id);
  };

  // Helper for UI calculation display
  const calculatedLease = (parseFloat(formData.acres) || 0) * (parseFloat(formData.leaseAmount) || 0);

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={() => navigate('/dashboard')} style={styles.backBtn}><IoMdArrowBack size={24} /></button>
        <h2 style={styles.title}>Crop Expenditure</h2>
      </div>

      {/* List Container */}
      <div style={styles.listContainer}>
        {folders.length === 0 ? <p style={{textAlign:'center', color:'#666', marginTop:'50px'}}>No crops added yet.</p> : folders.map(f => {
            const rev = f.harvestDetails?.totalRevenue || 0;
            const exp = (f.totalAmount || 0) + (f.leaseCostTotal || 0); // Include Lease in expense view
            const net = rev - exp;
            const isCompleted = f.status === 'completed';

            return (
              <div key={f.id} onClick={() => navigate(`/expenditure/${f.id}`)} style={isCompleted ? (net >=0 ? styles.cardProfit : styles.cardLoss) : styles.card}>
                
                <div style={styles.cardContentRow}>
                    <div style={{display:'flex', alignItems:'center', gap:'15px', flex:1}}>
                        <div style={styles.emojiBox}>{f.emoji}</div>
                        <div>
                            <h3 style={styles.cardTitle}>{f.name}</h3>
                            <div style={styles.pillContainer}>
                                {f.acres && <span style={styles.pill}>{f.acres} Acr</span>}
                                <span style={styles.pill}>{f.season}</span>
                                <span style={styles.pill}>{f.landType === 'lease' ? 'Leased' : 'Own'}</span>
                            </div>
                        </div>
                    </div>

                    <button onClick={(e) => toggleMenu(e, f.id)} style={styles.menuBtn}>
                        <IoMdMore size={24} color="rgba(255,255,255,0.7)"/>
                    </button>
                    {activeMenuId === f.id && (
                        <div style={styles.dropdown}>
                            <div onClick={(e) => openEditModal(e, f)} style={styles.menuItem}>✏️ Edit Folder</div>
                            <div onClick={(e) => deleteFolder(e, f.id)} style={{...styles.menuItem, color:'#FF5252'}}>🗑️ Delete</div>
                        </div>
                    )}
                </div>

                <div style={styles.divider}></div>

                {isCompleted ? (
                     <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                        <div>
                            <div style={{fontSize:'12px', opacity:0.8}}>Net Result</div>
                            <div style={{fontSize:'24px', fontWeight:'bold', color: 'white'}}>
                                {net >= 0 ? '+' : ''}₹{Math.abs(net).toLocaleString()}
                            </div>
                        </div>
                        <div style={styles.statusBadge}>Finished</div>
                     </div>
                ) : (
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                        <div>
                            <div style={{fontSize:'12px', color:'rgba(255,255,255,0.6)'}}>Spent so far (Bills)</div>
                            <div style={{fontSize:'20px', fontWeight:'bold'}}>₹{(f.totalAmount || 0).toLocaleString()}</div>
                        </div>
                        {f.leaseCostTotal > 0 && (
                            <div style={{textAlign:'right'}}>
                                <div style={{fontSize:'12px', color:'rgba(255,255,255,0.6)'}}>+ Land Lease</div>
                                <div style={{fontSize:'14px', color:'#aaa'}}>₹{f.leaseCostTotal.toLocaleString()}</div>
                            </div>
                        )}
                    </div>
                )}
              </div>
            );
        })}
      </div>

      <button onClick={() => setShowModal(true)} style={styles.fab}><IoMdAdd size={28} /></button>

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
                <h3 style={{color:'white', margin:0}}>{editingId ? 'Edit Details' : 'Start New Crop'}</h3>
                <button onClick={closeModal} style={styles.closeBtn}><IoMdClose size={24}/></button>
            </div>
            
            {/* Auto-Icon Input */}
            <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'15px'}}>
                <div style={styles.modalEmojiBox}>{formData.emoji}</div>
                <div style={{flex:1}}>
                      <label style={styles.label}>Crop Name</label>
                      <input placeholder="Ex: Cotton, Tomato..." style={styles.input} value={formData.name} onChange={handleNameChange} autoFocus/>
                </div>
            </div>

            <div style={{display:'flex', gap:'10px'}}>
                <div style={{flex:1}}>
                    <label style={styles.label}>Acres</label>
                    <input type="number" placeholder="0.0" style={styles.input} value={formData.acres} onChange={e => setFormData({...formData, acres: e.target.value})}/>
                </div>
                <div style={{flex:1}}>
                    <label style={styles.label}>Season</label>
                    <select style={styles.select} value={formData.season} onChange={e => setFormData({...formData, season: e.target.value})}>
                        <option value="kharif">Kharif</option>
                        <option value="rabi">Rabi</option>
                        <option value="zaid">Zaid</option>
                    </select>
                </div>
            </div>

            <div style={{margin:'15px 0', background:'rgba(255,255,255,0.05)', padding:'15px', borderRadius:'12px', border:'1px solid rgba(255,255,255,0.1)'}}>
                <label style={styles.label}>Land Type</label>
                <div style={{display:'flex', gap:'10px', marginBottom: formData.landType === 'lease' ? '15px' : '0'}}>
                    <button onClick={()=>setFormData({...formData, landType:'own'})} style={formData.landType==='own' ? styles.toggleActive : styles.toggle}>Own Land</button>
                    <button onClick={()=>setFormData({...formData, landType:'lease'})} style={formData.landType==='lease' ? styles.toggleActive : styles.toggle}>Lease</button>
                </div>

                {formData.landType === 'lease' && (
                    <div style={{animation:'fadeIn 0.3s'}}>
                        <label style={styles.label}>Lease Amount (Per Acre)</label>
                        <div style={styles.leaseInputContainer}>
                            <span style={{color:'#4CAF50', fontWeight:'bold'}}>₹</span>
                            <input type="number" placeholder="Ex: 25000" style={styles.leaseInput} value={formData.leaseAmount} onChange={e => setFormData({...formData, leaseAmount: e.target.value})}/>
                        </div>
                        
                        {/* AUTO CALCULATED TOTAL LEASE DISPLAY */}
                        <div style={styles.totalLeaseBox}>
                            <span style={{color:'#aaa', fontSize:'13px'}}>Total Lease Cost (Yearly)</span>
                            <span style={{color:'#4CAF50', fontSize:'18px', fontWeight:'bold'}}>
                                ₹{calculatedLease.toLocaleString()}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            <label style={styles.label}>Water Supply</label>
            <select style={styles.select} value={formData.waterSource} onChange={e => setFormData({...formData, waterSource: e.target.value})}>
                <option value="irrigated">💧 Irrigated (Bore/Canal)</option>
                <option value="rainfed">☁️ Rain-fed (Dependency)</option>
            </select>

            <button onClick={handleSave} style={styles.saveBtn}>{editingId ? 'Save Changes' : 'Create Folder'}</button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#0f1215', color: 'white', fontFamily: 'sans-serif', padding: '20px', paddingBottom:'80px' },
  header: { display: 'flex', alignItems: 'center', marginBottom: '20px' },
  backBtn: { background: 'none', border: 'none', color: 'white', cursor: 'pointer', marginRight: '15px' },
  title: { margin: 0, fontSize: '22px' },
  listContainer: { display: 'flex', flexDirection: 'column', gap: '15px' },
  card: { background: '#1A1A1C', borderRadius: '16px', padding: '20px', position: 'relative', border: '1px solid #333', cursor:'pointer' },
  cardProfit: { background: 'linear-gradient(135deg, #052e16 0%, #1A1A1C 100%)', borderRadius: '16px', padding: '20px', position: 'relative', border: '1px solid #14532d', cursor:'pointer' },
  cardLoss: { background: 'linear-gradient(135deg, #450a0a 0%, #1A1A1C 100%)', borderRadius: '16px', padding: '20px', position: 'relative', border: '1px solid #7f1d1d', cursor:'pointer' },
  cardContentRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  emojiBox: { fontSize: '32px', background: 'rgba(255,255,255,0.05)', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' },
  cardTitle: { margin: '0 0 5px 0', fontSize: '18px', fontWeight: 'bold' },
  pillContainer: { display: 'flex', gap: '5px', flexWrap: 'wrap' },
  pill: { fontSize:'11px', background:'rgba(255,255,255,0.1)', padding:'4px 8px', borderRadius:'6px', color:'#ccc' },
  divider: { height:'1px', background:'rgba(255,255,255,0.1)', margin:'15px 0' },
  statusBadge: { fontSize:'11px', background:'rgba(255,255,255,0.2)', padding:'4px 8px', borderRadius:'4px' },
  menuBtn: { background:'transparent', border:'none', cursor:'pointer', padding:'5px' },
  dropdown: { position:'absolute', top:'50px', right:'20px', background:'#222', padding:'5px', borderRadius:'12px', boxShadow:'0 5px 20px rgba(0,0,0,0.5)', zIndex:10, border:'1px solid #333', minWidth:'120px' },
  menuItem: { color:'white', fontSize:'14px', cursor:'pointer', padding:'10px 15px', borderBottom:'1px solid #333' },
  fab: { position: 'fixed', bottom: '20px', right: '20px', width: '60px', height: '60px', borderRadius: '50%', background: '#4CAF50', color: 'white', border: 'none', boxShadow: '0 4px 15px rgba(76, 175, 80, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex:50 },
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter:'blur(5px)' },
  modalContent: { background: '#1A1A1C', padding: '25px', borderRadius: '24px', width: '90%', maxWidth: '360px', border:'1px solid #333', boxShadow:'0 20px 50px rgba(0,0,0,0.5)' },
  modalHeader: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' },
  modalEmojiBox: { fontSize:'36px', width:'60px', height:'60px', background:'rgba(255,255,255,0.05)', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'12px', marginBottom:'15px' },
  closeBtn: { background:'transparent', border:'none', color:'#666', cursor:'pointer' },
  label: { display:'block', fontSize:'12px', color:'#888', marginBottom:'6px', marginLeft:'2px' },
  input: { width: '100%', padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', marginBottom: '0', boxSizing:'border-box', fontSize:'16px' },
  select: { width: '100%', padding: '14px', borderRadius: '12px', background: '#111', border: '1px solid #333', color: 'white', marginBottom: '15px', fontSize:'14px' },
  toggle: { flex:1, padding:'12px', borderRadius:'10px', background:'transparent', border:'1px solid #333', color:'#666', cursor:'pointer', fontSize:'14px' },
  toggleActive: { flex:1, padding:'12px', borderRadius:'10px', background:'#2E7D32', border:'1px solid #2E7D32', color:'white', fontWeight:'bold', cursor:'pointer', fontSize:'14px' },
  leaseInputContainer: { display:'flex', alignItems:'center', background:'rgba(255,255,255,0.05)', borderRadius:'12px', padding:'0 15px', border:'1px solid rgba(255,255,255,0.1)' },
  leaseInput: { flex:1, background:'transparent', border:'none', color:'white', padding:'14px', fontSize:'16px', outline:'none' },
  totalLeaseBox: { marginTop:'10px', background:'rgba(76,175,80,0.1)', padding:'12px', borderRadius:'10px', display:'flex', justifyContent:'space-between', alignItems:'center', border:'1px solid rgba(76,175,80,0.2)' },
  saveBtn: { width:'100%', padding: '16px', borderRadius: '14px', background: '#4CAF50', color: 'white', border: 'none', fontWeight:'bold', cursor:'pointer', fontSize:'16px', marginTop:'10px' }
};

export default Expenditure;