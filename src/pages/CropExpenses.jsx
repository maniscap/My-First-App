import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IoMdArrowBack, IoMdAdd, IoMdClose, IoMdCamera, IoMdTime, IoMdListBox, IoMdArrowDropdown, IoMdArrowDropup } from 'react-icons/io';
import { FaSeedling, FaTractor, FaFlask, FaUsers, FaTruck, FaQuestion, FaRegStickyNote, FaRupeeSign } from 'react-icons/fa';

// --- CATEGORY CONFIGURATION ---
const CATEGORIES = [
    { id: 'seeds', name: 'Seeds', icon: <FaSeedling/>, color: '#4CAF50', qtyLabel: 'No. of Bags/Kg' },
    { id: 'machinery', name: 'Machinery', icon: <FaTractor/>, color: '#FF9800', qtyLabel: 'Hours/Acres' },
    { id: 'fertilizers', name: 'Fertilizers', icon: <FaFlask/>, color: '#03A9F4', qtyLabel: 'No. of Bags/Liters' },
    { id: 'workers', name: 'Workers', icon: <FaUsers/>, color: '#E91E63', qtyLabel: 'No. of People/Days' },
    { id: 'transport', name: 'Transport', icon: <FaTruck/>, color: '#9C27B0', qtyLabel: 'Trips/Kms' },
    { id: 'other', name: 'Other', icon: <FaQuestion/>, color: '#607D8B', qtyLabel: 'Quantity' },
];

function CropExpenses() {
  const navigate = useNavigate();
  const { folderId } = useParams();
  const fileInputRef = useRef(null);

  // --- STATE ---
  const [currentFolder, setCurrentFolder] = useState(null);
  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [totals, setTotals] = useState({ overall: 0, cats: {} });

  // UI State for Form
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);

  // Form State
  const [newBill, setNewBill] = useState({
      amount: '', category: 'seeds', quantity: '', note: '', image: null
  });

  // --- 1. LOAD DATA ---
  useEffect(() => {
    const allFolders = JSON.parse(localStorage.getItem('farmBuddy_expenditure_folders') || '[]');
    const folder = allFolders.find(f => f.id.toString() === folderId);
    if (folder) setCurrentFolder(folder);
    else navigate('/expenditure');
    loadBills();
  }, [folderId]);

  const loadBills = () => {
      const allBills = JSON.parse(localStorage.getItem('farmBuddy_bills') || '[]');
      const folderBills = allBills.filter(b => b.folderId.toString() === folderId);
      folderBills.sort((a, b) => new Date(b.isoDate) - new Date(a.isoDate));
      setBills(folderBills);
  };

  // --- 2. CALCULATE & FILTER ---
  useEffect(() => {
    let overall = 0;
    const catTotals = {};
    CATEGORIES.forEach(c => catTotals[c.id] = 0);

    bills.forEach(bill => {
        const amt = parseFloat(bill.amount) || 0;
        overall += amt;
        if (catTotals[bill.category] !== undefined) catTotals[bill.category] += amt;
    });
    setTotals({ overall, cats: catTotals });

    if (activeFilter === 'all') setFilteredBills(bills);
    else setFilteredBills(bills.filter(b => b.category === activeFilter));
  }, [bills, activeFilter]);


  // --- 3. ACTIONS ---
  const handleImageUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width; let height = img.height;
                if (width > height) { if (width > 800) { height *= 800 / width; width = 800; } } 
                else { if (height > 800) { width *= 800 / height; height = 800; } }
                canvas.width = width; canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                setNewBill({ ...newBill, image: canvas.toDataURL('image/jpeg', 0.7) });
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
      }
  };

  const handleSaveBill = () => {
      if (!newBill.amount) { alert("Please enter an amount"); return; }
      
      const now = new Date();
      const billToSave = {
          id: Date.now(), folderId: folderId, ...newBill, amount: parseFloat(newBill.amount),
          dateStr: now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
          timeStr: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute:'2-digit' }),
          isoDate: now.toISOString()
      };

      const allBills = JSON.parse(localStorage.getItem('farmBuddy_bills') || '[]');
      localStorage.setItem('farmBuddy_bills', JSON.stringify([...allBills, billToSave]));
      updateFolderStats(billToSave.amount);

      loadBills();
      setShowAddModal(false);
      setNewBill({ amount: '', category: 'seeds', quantity: '', note: '', image: null });
      setIsCatDropdownOpen(false); // Reset dropdown
  };

  const updateFolderStats = (latestAmount) => {
      const allFolders = JSON.parse(localStorage.getItem('farmBuddy_expenditure_folders') || '[]');
      const updatedFolders = allFolders.map(f => {
          if(f.id.toString() === folderId) {
              return { ...f, totalAmount: (f.totalAmount || 0) + latestAmount, itemCount: (f.itemCount || 0) + 1 };
          }
          return f;
      });
      localStorage.setItem('farmBuddy_expenditure_folders', JSON.stringify(updatedFolders));
  }

  const currentCatConfig = CATEGORIES.find(c => c.id === newBill.category);

  // --- RENDER ---
  return (
    <div style={styles.page}>
      
      {/* HEADER */}
      <div style={styles.header}>
        <button onClick={() => navigate('/expenditure')} style={styles.backBtn}>
          <IoMdArrowBack size={24} color="#fff" />
        </button>
        <div style={{display:'flex', flexDirection:'column'}}>
            <h2 style={styles.pageTitle}>{currentFolder?.name || 'Loading...'}</h2>
            <span style={{fontSize:'12px', color:'rgba(255,255,255,0.6)'}}>
                 {currentFolder?.emoji} Expense Tracker
            </span>
        </div>
      </div>

      {/* HERO CARD */}
      <div style={styles.heroContainer}>
        <div style={styles.heroCard}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'20px'}}>
                <div>
                    <div style={{fontSize:'14px', color:'rgba(255,255,255,0.7)', marginBottom:'5px'}}>Total Spent</div>
                    <div style={{fontSize:'36px', fontWeight:'700', color:'white', display:'flex', alignItems:'center'}}>
                        <span style={{fontSize:'24px', marginRight:'2px'}}>₹</span> 
                        {totals.overall.toLocaleString()}
                    </div>
                </div>
                <button onClick={() => setShowAddModal(true)} style={styles.heroAddBtn}>
                    <IoMdAdd size={24} color="white"/>
                </button>
            </div>

            {/* Scroller */}
            <div style={styles.scroller}>
                 <div onClick={() => setActiveFilter('all')} style={{...styles.catPill, 
                        background: activeFilter === 'all' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)',
                        borderColor: activeFilter === 'all' ? 'white' : 'rgba(255,255,255,0.1)'}}>
                    <IoMdListBox size={16} color="white" style={{marginRight:'8px'}} />
                    <div style={{display:'flex', flexDirection:'column'}}>
                        <span style={{fontSize:'12px', fontWeight:'600'}}>All</span>
                        <span style={{fontSize:'11px', opacity:0.7}}>₹{totals.overall > 1000 ? (totals.overall/1000).toFixed(1)+'k' : totals.overall}</span>
                    </div>
                </div>
                {CATEGORIES.map(cat => (
                    <div key={cat.id} onClick={() => setActiveFilter(cat.id)} style={{...styles.catPill, 
                            background: activeFilter === cat.id ? `${cat.color}40` : 'rgba(255,255,255,0.05)',
                            borderColor: activeFilter === cat.id ? cat.color : 'rgba(255,255,255,0.1)'}}>
                        <div style={{color: cat.color, marginRight:'8px', fontSize:'18px'}}>{cat.icon}</div>
                         <div style={{display:'flex', flexDirection:'column'}}>
                            <span style={{fontSize:'12px', fontWeight:'600'}}>{cat.name}</span>
                            <span style={{fontSize:'11px', opacity:0.7}}>₹{totals.cats[cat.id] > 1000 ? (totals.cats[cat.id]/1000).toFixed(1)+'k' : totals.cats[cat.id] }</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* BILL LIST */}
      <div style={styles.listContainer}>
          <div style={{fontSize:'14px', fontWeight:'600', color:'rgba(255,255,255,0.6)', marginBottom:'15px', paddingLeft:'5px'}}>
              {activeFilter === 'all' ? 'Recent Transactions' : `${CATEGORIES.find(c=>c.id===activeFilter).name} Bills`} ({filteredBills.length})
          </div>
          {filteredBills.length === 0 ? (
              <div style={{textAlign:'center', padding:'40px', color:'rgba(255,255,255,0.4)'}}>No bills found.</div>
          ) : (
              filteredBills.map(bill => {
                  const catCfg = CATEGORIES.find(c => c.id === bill.category);
                  return (
                    <div key={bill.id} style={styles.billCard}>
                        <div style={{...styles.billIconBox, background: `${catCfg.color}20`, color: catCfg.color}}>
                            {catCfg.icon}
                        </div>
                        <div style={{flex:1, paddingLeft:'15px'}}>
                            <div style={{fontSize:'16px', fontWeight:'600', marginBottom:'4px'}}>{catCfg.name}</div>
                            <div style={{fontSize:'12px', color:'rgba(255,255,255,0.5)', display:'flex', alignItems:'center', gap:'10px'}}>
                                <span>{bill.dateStr}</span>
                                {bill.quantity && <span>• {bill.quantity}</span>}
                            </div>
                            {bill.note && <div style={{fontSize:'11px', color:'rgba(255,255,255,0.4)', marginTop:'4px', fontStyle:'italic'}}>{bill.note}</div>}
                        </div>
                        <div style={{textAlign:'right'}}>
                            <div style={{fontSize:'18px', fontWeight:'700', color: catCfg.color}}>₹{bill.amount.toLocaleString()}</div>
                            {bill.image && <div style={{fontSize:'10px', color:'rgba(255,255,255,0.5)', marginTop:'5px'}}>📎 Attached</div>}
                        </div>
                    </div>
                  );
              })
          )}
      </div>

      {/* --- MODERN ADD EXPENSE MODAL --- */}
      {showAddModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={{margin:0, color:'white', fontSize:'22px'}}>Add Expense</h3>
              <button onClick={() => setShowAddModal(false)} style={styles.closeBtn}><IoMdClose size={24}/></button>
            </div>
            
            <div style={styles.formScroll}>
                
                {/* 1. CATEGORY SELECTOR (Custom Dropdown) */}
                <div style={{marginBottom:'20px'}}>
                    <div style={{fontSize:'13px', color:'rgba(255,255,255,0.6)', marginBottom:'8px', marginLeft:'4px'}}>Category</div>
                    
                    {/* The Trigger Button */}
                    <div 
                        onClick={() => setIsCatDropdownOpen(!isCatDropdownOpen)}
                        style={{
                            ...styles.dropdownTrigger, 
                            borderColor: isCatDropdownOpen ? currentCatConfig.color : 'rgba(255,255,255,0.1)'
                        }}
                    >
                        <div style={{display:'flex', alignItems:'center', gap:'10px', color: currentCatConfig.color}}>
                            {currentCatConfig.icon}
                            <span style={{color:'white', fontWeight:'600', fontSize:'16px'}}>{currentCatConfig.name}</span>
                        </div>
                        {isCatDropdownOpen ? <IoMdArrowDropup color="#888"/> : <IoMdArrowDropdown color="#888"/>}
                    </div>

                    {/* The Dropdown List (Hidden by default) */}
                    {isCatDropdownOpen && (
                        <div style={styles.catGrid}>
                            {CATEGORIES.map(cat => (
                                <div 
                                    key={cat.id} 
                                    onClick={() => { setNewBill({...newBill, category: cat.id}); setIsCatDropdownOpen(false); }}
                                    style={{
                                        ...styles.catGridItem,
                                        background: newBill.category === cat.id ? `${cat.color}30` : 'rgba(255,255,255,0.05)',
                                        border: newBill.category === cat.id ? `1px solid ${cat.color}` : '1px solid transparent'
                                    }}
                                >
                                    <div style={{color: cat.color, fontSize:'20px', marginBottom:'5px'}}>{cat.icon}</div>
                                    <div style={{fontSize:'12px', color:'white'}}>{cat.name}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 2. AMOUNT INPUT (Big & Bold) */}
                <div style={styles.inputGroup}>
                    <div style={{fontSize:'13px', color:'rgba(255,255,255,0.6)', marginBottom:'8px'}}>Amount</div>
                    <div style={styles.amountBox}>
                        <FaRupeeSign color={currentCatConfig.color} size={20} />
                        <input 
                            type="number" 
                            placeholder="0" 
                            autoFocus
                            style={styles.amountInput} 
                            value={newBill.amount} 
                            onChange={(e) => setNewBill({...newBill, amount: e.target.value})}
                        />
                    </div>
                </div>

                {/* 3. DYNAMIC QUANTITY */}
                <div style={styles.inputGroup}>
                    <div style={{fontSize:'13px', color:'rgba(255,255,255,0.6)', marginBottom:'8px'}}>{currentCatConfig.qtyLabel} <span style={{opacity:0.5}}>(Optional)</span></div>
                    <div style={styles.simpleInputBox}>
                        <input 
                            type="text" 
                            placeholder="Ex: 5 Bags, 2 Workers..." 
                            style={styles.simpleInput} 
                            value={newBill.quantity} 
                            onChange={(e) => setNewBill({...newBill, quantity: e.target.value})}
                        />
                    </div>
                </div>

                {/* 4. NOTE (Large Textarea) */}
                <div style={styles.inputGroup}>
                    <div style={{fontSize:'13px', color:'rgba(255,255,255,0.6)', marginBottom:'8px'}}>Note <span style={{opacity:0.5}}>(Optional)</span></div>
                    <div style={styles.simpleInputBox}>
                        <textarea 
                            rows="3"
                            placeholder="Add details about the shop or bill..." 
                            style={styles.textArea} 
                            value={newBill.note} 
                            onChange={(e) => setNewBill({...newBill, note: e.target.value})}
                        />
                    </div>
                </div>

                {/* 5. IMAGE UPLOAD */}
                <div style={{marginTop:'10px'}}>
                    <div onClick={() => fileInputRef.current.click()} style={styles.imageUploadBox}>
                        {newBill.image ? (
                            <img src={newBill.image} alt="Bill Preview" style={{width:'100%', height:'100%', objectFit:'cover', borderRadius:'12px'}} />
                        ) : (
                            <>
                                <IoMdCamera size={28} color="rgba(255,255,255,0.4)" />
                                <span style={{fontSize:'13px', color:'rgba(255,255,255,0.4)', marginTop:'8px'}}>Attach Bill Photo</span>
                            </>
                        )}
                        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} style={{display:'none'}} />
                    </div>
                     {newBill.image && <button onClick={(e) => {e.stopPropagation(); setNewBill({...newBill, image:null})}} style={{background:'transparent', border:'none', color:'#FF5252', fontSize:'13px', width:'100%', marginBottom:'10px', cursor:'pointer'}}>Remove Photo ✕</button>}
                </div>
            </div>

            <button onClick={handleSaveBill} style={styles.saveBtn}>
              Save Expense
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
    background: 'linear-gradient(to bottom, #0f1215, #151920)', 
    color: 'white', fontFamily: '"SF Pro Display", sans-serif',
    overflowY: 'auto', paddingBottom:'80px'
  },
  header: { 
    display: 'flex', alignItems: 'center', padding: '20px', 
    background: 'transparent', position: 'sticky', top: 0, zIndex: 10
  },
  backBtn: { background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', borderRadius:'50%', width:'40px', height:'40px', display:'flex', alignItems:'center', justifyContent:'center', cursor: 'pointer', marginRight: '15px' },
  pageTitle: { margin: 0, fontSize: '22px', fontWeight: '700', letterSpacing:'0.5px', lineHeight:'1.1' },

  // Hero
  heroContainer: { padding: '0 20px 25px 20px' },
  heroCard: {
    background: 'rgba(255, 255, 255, 0.07)', backdropFilter: 'blur(15px)',
    borderRadius: '24px', padding: '25px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)', position:'relative'
  },
  heroAddBtn: {
    width:'50px', height:'50px', borderRadius:'50%',
    background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
    border: 'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
    boxShadow: '0 5px 15px rgba(76, 175, 80, 0.4)',
    position: 'absolute', top:'20px', right:'20px'
  },
  scroller: {
    display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '5px', scrollbarWidth: 'none', msOverflowStyle: 'none',
    maskImage: 'linear-gradient(to right, black 85%, transparent 100%)'
  },
  catPill: {
      minWidth: '110px', padding: '10px 15px', borderRadius: '16px',
      display: 'flex', alignItems: 'center', cursor: 'pointer', transition: '0.2s',
      border: '1px solid transparent'
  },

  // List
  listContainer: { padding: '0 20px' },
  billCard: {
      background: 'rgba(255, 255, 255, 0.04)', backdropFilter: 'blur(10px)',
      borderRadius: '18px', padding: '15px', marginBottom:'12px',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      display: 'flex', alignItems: 'center'
  },
  billIconBox: {
      width:'45px', height:'45px', borderRadius:'14px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px'
  },

  // NEW MODAL STYLES
  modalOverlay: {
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
    display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 2000
  },
  modalContent: {
    background: '#1A1A1C', width: '100%', borderTopLeftRadius: '30px', borderTopRightRadius: '30px',
    padding: '25px 25px 40px 25px', 
    boxShadow: '0 -10px 40px rgba(0,0,0,0.6)', animation: 'slideUp 0.3s ease',
    maxHeight: '90vh', display:'flex', flexDirection:'column'
  },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
  closeBtn: { background: 'rgba(255,255,255,0.08)', border: 'none', color: '#ccc', cursor: 'pointer', width:'32px', height:'32px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' },
  
  formScroll: { overflowY: 'auto', paddingBottom:'20px', flex: 1 },
  
  inputGroup: { marginBottom:'20px' },

  // Dropdown
  dropdownTrigger: {
      background: 'rgba(255,255,255,0.05)', borderRadius:'16px', padding:'15px',
      display:'flex', justifyContent:'space-between', alignItems:'center',
      border: '1px solid rgba(255,255,255,0.1)', cursor:'pointer'
  },
  catGrid: {
      display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px', marginTop:'10px',
      background: '#111', padding:'15px', borderRadius:'16px', border:'1px solid #333'
  },
  catGridItem: {
      borderRadius:'12px', padding:'15px 5px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      cursor:'pointer', transition:'0.2s'
  },

  // Amount Box
  amountBox: {
      display:'flex', alignItems:'center', background: 'rgba(255,255,255,0.05)', 
      borderRadius:'16px', padding:'10px 20px', border:'1px solid rgba(255,255,255,0.1)'
  },
  amountInput: {
      width: '100%', background: 'transparent', border: 'none',
      padding: '10px', color: 'white', fontSize: '32px', outline: 'none', fontWeight:'700'
  },

  // Simple Inputs
  simpleInputBox: {
      background: 'rgba(255,255,255,0.05)', borderRadius:'16px', border:'1px solid rgba(255,255,255,0.1)'
  },
  simpleInput: {
      width: '100%', background: 'transparent', border: 'none',
      padding: '16px', color: 'white', fontSize: '16px', outline: 'none'
  },
  textArea: {
      width: '100%', background: 'transparent', border: 'none',
      padding: '16px', color: 'white', fontSize: '16px', outline: 'none', fontFamily:'inherit', resize:'none'
  },

  imageUploadBox: {
      height:'100px', background: 'rgba(255,255,255,0.03)', border:'2px dashed rgba(255,255,255,0.15)',
      borderRadius:'16px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      marginBottom:'10px', cursor:'pointer'
  },

  saveBtn: {
    width: '100%', background: '#4CAF50', border: 'none', padding: '18px',
    borderRadius: '16px', color: 'white', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer',
    marginTop:'10px', boxShadow: '0 5px 20px rgba(76, 175, 80, 0.2)'
  }
};

// Add keyframes for modal slide up
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
@keyframes slideUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
}
`, styleSheet.cssRules.length);

export default CropExpenses;