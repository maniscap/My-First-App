import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  IoMdArrowBack, IoMdAdd, IoMdClose, IoMdCamera, IoMdListBox, 
  IoMdArrowDropdown, IoMdArrowDropup, IoMdMore, IoMdTrash, IoMdCreate, IoMdDownload
} from 'react-icons/io';
import { 
  FaSeedling, FaTractor, FaFlask, FaUsers, FaTruck, FaQuestion, FaRupeeSign, FaFilePdf 
} from 'react-icons/fa';

// --- CONFIGURATION ---
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
  const reportRef = useRef(null); // Reference for the hidden invoice

  // --- STATE ---
  const [currentFolder, setCurrentFolder] = useState(null);
  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [totals, setTotals] = useState({ overall: 0, cats: {} });

  // UI States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showHarvestModal, setShowHarvestModal] = useState(false);
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);

  // Form States
  const [newBill, setNewBill] = useState({ amount: '', category: 'seeds', quantity: '', note: '', image: null });
  const [editingBillId, setEditingBillId] = useState(null);
  const [harvestData, setHarvestData] = useState({ bags: '', quintals: '', pricePerQuintal: '' });

  // --- LOAD DATA ---
  useEffect(() => { loadFolderData(); loadBills(); }, [folderId]);

  const loadFolderData = () => {
    const allFolders = JSON.parse(localStorage.getItem('farmBuddy_expenditure_folders') || '[]');
    const folder = allFolders.find(f => f.id.toString() === folderId);
    if (folder) {
        setCurrentFolder(folder);
        if(folder.harvestDetails) setHarvestData(folder.harvestDetails);
    } else { navigate('/expenditure'); }
  };

  const loadBills = () => {
      const allBills = JSON.parse(localStorage.getItem('farmBuddy_bills') || '[]');
      const folderBills = allBills.filter(b => b.folderId.toString() === folderId);
      folderBills.sort((a, b) => new Date(b.isoDate) - new Date(a.isoDate));
      setBills(folderBills);
  };

  // --- CALCULATIONS ---
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

  // --- ACTIONS ---
  const handleSaveBill = () => {
      if (!newBill.amount) { alert("Enter amount"); return; }
      const allBills = JSON.parse(localStorage.getItem('farmBuddy_bills') || '[]');
      let updatedBills;

      if (editingBillId) {
          updatedBills = allBills.map(b => b.id === editingBillId ? { ...b, ...newBill, amount: parseFloat(newBill.amount) } : b);
      } else {
          const now = new Date();
          const billToSave = { id: Date.now(), folderId: folderId, ...newBill, amount: parseFloat(newBill.amount), dateStr: now.toLocaleDateString('en-IN', {day:'numeric', month:'short'}), isoDate: now.toISOString() };
          updatedBills = [...allBills, billToSave];
      }
      localStorage.setItem('farmBuddy_bills', JSON.stringify(updatedBills));
      
      // Update folder total (excluding lease for now in the stored total, we add it visually)
      const folderBills = updatedBills.filter(b => b.folderId.toString() === folderId);
      const total = folderBills.reduce((sum, b) => sum + (parseFloat(b.amount)||0), 0);
      
      const allFolders = JSON.parse(localStorage.getItem('farmBuddy_expenditure_folders') || '[]');
      const updatedFolders = allFolders.map(f => f.id.toString() === folderId ? { ...f, totalAmount: total, itemCount: folderBills.length } : f);
      localStorage.setItem('farmBuddy_expenditure_folders', JSON.stringify(updatedFolders));

      loadBills(); closeModal(); loadFolderData();
  };

  const handleDeleteBill = (billId) => {
      if(window.confirm("Delete bill?")) {
          const allBills = JSON.parse(localStorage.getItem('farmBuddy_bills') || '[]');
          const updatedBills = allBills.filter(b => b.id !== billId);
          localStorage.setItem('farmBuddy_bills', JSON.stringify(updatedBills));
          loadBills();
      }
  };

  const handleHarvestSubmit = () => {
      const bags = parseFloat(harvestData.bags) || 0;
      const quintals = parseFloat(harvestData.quintals) || 0;
      const price = parseFloat(harvestData.pricePerQuintal) || 0;
      const totalRevenue = quintals * price;

      const updatedHarvestDetails = { bags, quintals, pricePerQuintal: price, totalRevenue, isHarvested: true };
      const allFolders = JSON.parse(localStorage.getItem('farmBuddy_expenditure_folders') || '[]');
      const updatedFolders = allFolders.map(f => f.id.toString() === folderId ? { ...f, status: 'completed', harvestDetails: updatedHarvestDetails } : f);
      localStorage.setItem('farmBuddy_expenditure_folders', JSON.stringify(updatedFolders));
      
      loadFolderData(); setShowHarvestModal(false);
  };

  const handleReopenCrop = () => {
      if(window.confirm("Undo Harvest? Crop will be set to 'Running'.")){
        const allFolders = JSON.parse(localStorage.getItem('farmBuddy_expenditure_folders') || '[]');
        const updatedFolders = allFolders.map(f => f.id.toString() === folderId ? { ...f, status: 'running' } : f);
        localStorage.setItem('farmBuddy_expenditure_folders', JSON.stringify(updatedFolders));
        loadFolderData();
      }
  };

  // --- 4. PROFESSIONAL REPORT GENERATION ---
  const handleDownloadReport = () => {
      const content = reportRef.current;
      const originalDisplay = content.style.display;
      content.style.display = 'block'; // Make visible for printing
      window.print(); // Triggers browser print (Save as PDF)
      content.style.display = 'none'; // Hide again
  };

  // Helpers
  const openEditBill = (b) => { setNewBill({amount:b.amount, category:b.category, quantity:b.quantity, note:b.note, image:b.image}); setEditingBillId(b.id); setShowAddModal(true); };
  const closeModal = () => { setShowAddModal(false); setNewBill({amount:'', category:'seeds', quantity:'', note:'', image:null}); setEditingBillId(null); };
  const currentCatConfig = CATEGORIES.find(c => c.id === newBill.category) || CATEGORIES[0];
  
  // Data for View
  const isHarvested = currentFolder?.status === 'completed';
  const leaseCost = currentFolder?.leaseCostTotal || 0;
  const expenseTotal = totals.overall + leaseCost;
  const revenue = currentFolder?.harvestDetails?.totalRevenue || 0;
  const profit = revenue - expenseTotal;

  return (
    <div style={styles.page}>
      
      {/* --- HIDDEN INVOICE FOR PRINTING --- */}
      <div id="print-area" ref={reportRef} style={{display:'none', background:'white', padding:'40px', color:'black', fontFamily:'Arial, sans-serif'}}>
          <div style={{textAlign:'center', borderBottom:'2px solid #4CAF50', paddingBottom:'20px', marginBottom:'20px'}}>
              <h1 style={{margin:0, color:'#2E7D32'}}>FARM CONNECT REPORT</h1>
              <p style={{margin:'5px 0', color:'#666'}}>Crop Yield & Expenditure Statement</p>
          </div>

          {/* Section 1: Crop Info */}
          <div style={{display:'flex', justifyContent:'space-between', marginBottom:'30px'}}>
              <div>
                  <h3 style={{margin:0}}>{currentFolder?.name}</h3>
                  <p style={{margin:0}}>Season: {currentFolder?.season?.toUpperCase()}</p>
              </div>
              <div style={{textAlign:'right'}}>
                  <p style={{margin:0}}>Acres: {currentFolder?.acres}</p>
                  <p style={{margin:0}}>Land: {currentFolder?.landType?.toUpperCase()}</p>
              </div>
          </div>

          {/* Section 2: Harvest Details */}
          <table style={{width:'100%', borderCollapse:'collapse', marginBottom:'30px'}}>
              <thead>
                  <tr style={{background:'#f0f0f0'}}><th style={styles.th}>Total Bags</th><th style={styles.th}>Total Quintals</th><th style={styles.th}>Sold Price (Per Qt)</th><th style={styles.th}>Total Revenue</th></tr>
              </thead>
              <tbody>
                  <tr>
                      <td style={styles.td}>{currentFolder?.harvestDetails?.bags} Bags</td>
                      <td style={styles.td}>{currentFolder?.harvestDetails?.quintals} Qt</td>
                      <td style={styles.td}>₹{currentFolder?.harvestDetails?.pricePerQuintal}</td>
                      <td style={{...styles.td, fontWeight:'bold'}}>₹{revenue.toLocaleString()}</td>
                  </tr>
              </tbody>
          </table>

          {/* Section 3: Expense Details */}
          <h4 style={{borderBottom:'1px solid #ccc', paddingBottom:'5px'}}>Expenditure Breakdown</h4>
          <table style={{width:'100%', borderCollapse:'collapse', marginBottom:'20px'}}>
              <tbody>
                  {CATEGORIES.map(cat => (
                      totals.cats[cat.id] > 0 && (
                        <tr key={cat.id}>
                            <td style={{padding:'8px', borderBottom:'1px solid #eee'}}>{cat.name}</td>
                            <td style={{padding:'8px', borderBottom:'1px solid #eee', textAlign:'right'}}>₹{totals.cats[cat.id].toLocaleString()}</td>
                        </tr>
                      )
                  ))}
                  {leaseCost > 0 && (
                      <tr>
                          <td style={{padding:'8px', borderBottom:'1px solid #eee'}}>Land Lease Cost</td>
                          <td style={{padding:'8px', borderBottom:'1px solid #eee', textAlign:'right'}}>₹{leaseCost.toLocaleString()}</td>
                      </tr>
                  )}
                  <tr style={{background:'#eee'}}>
                      <td style={{padding:'8px', fontWeight:'bold'}}>TOTAL EXPENSES</td>
                      <td style={{padding:'8px', fontWeight:'bold', textAlign:'right'}}>₹{expenseTotal.toLocaleString()}</td>
                  </tr>
              </tbody>
          </table>

          {/* Section 4: Final */}
          <div style={{textAlign:'right', marginTop:'40px'}}>
              <h3>NET PROFIT: ₹{profit.toLocaleString()}</h3>
          </div>
          <div style={{textAlign:'center', marginTop:'50px', fontSize:'12px', color:'#999'}}>Generated by FarmConnect App</div>
      </div>

      {/* --- APP UI --- */}
      <div style={styles.header}>
        <button onClick={() => navigate('/expenditure')} style={styles.backBtn}><IoMdArrowBack size={24} color="#fff" /></button>
        <div style={{flex:1}}>
            <h2 style={styles.pageTitle}>{currentFolder?.name}</h2>
            <span style={{fontSize:'12px', color:'rgba(255,255,255,0.6)'}}>
                 {currentFolder?.season} • {currentFolder?.acres} Ac • {currentFolder?.landType}
            </span>
        </div>
        <div style={{position:'relative'}}>
            <button onClick={() => setShowMenu(!showMenu)} style={styles.menuBtn}><IoMdMore size={24} color="white"/></button>
            {showMenu && (
                <div style={styles.menuDropdown}>
                    <div onClick={() => { setShowHarvestModal(true); setShowMenu(false); }} style={styles.menuItem}>🌾 Harvest & Sell</div>
                </div>
            )}
        </div>
      </div>

      {/* HERO SECTION */}
      <div style={styles.heroContainer}>
        {isHarvested ? (
            <div style={{...styles.heroCard, background: profit >= 0 ? 'linear-gradient(135deg, #1b5e20 0%, #000 100%)' : 'linear-gradient(135deg, #b71c1c 0%, #000 100%)'}}>
                <div style={{textAlign:'center', marginBottom:'15px'}}>
                    <div style={{fontSize:'14px', opacity:0.8}}>{profit >= 0 ? '🎉 PROFIT' : '⚠️ LOSS'}</div>
                    <div style={{fontSize:'42px', fontWeight:'800', color:'white'}}>
                        {profit >= 0 ? '+' : ''}₹{Math.abs(profit).toLocaleString()}
                    </div>
                </div>
                
                <div style={styles.harvestStatsGrid}>
                    <div style={styles.harvestStat}><span>Sold For</span><strong>₹{revenue.toLocaleString()}</strong></div>
                    <div style={styles.harvestStat}><span>Total Cost</span><strong>₹{expenseTotal.toLocaleString()}</strong></div>
                </div>

                {/* DOWNLOAD REPORT BUTTON */}
                <button onClick={handleDownloadReport} style={styles.reportBtn}>
                    <IoMdDownload size={18}/> Download Professional Report
                </button>
                
                <button onClick={handleReopenCrop} style={styles.reopenBtn}>Re-open Crop (Undo)</button>
            </div>
        ) : (
            <div style={styles.heroCard}>
                <div style={{display:'flex', justifyContent:'space-between'}}>
                    <div>
                        <div style={{fontSize:'14px', opacity:0.7}}>Running Expenses</div>
                        <div style={{fontSize:'32px', fontWeight:'700'}}>₹{totals.overall.toLocaleString()}</div>
                        {leaseCost > 0 && <div style={{fontSize:'12px', opacity:0.5}}>+ ₹{leaseCost.toLocaleString()} Lease</div>}
                    </div>
                    <button onClick={() => setShowAddModal(true)} style={styles.heroAddBtn}><IoMdAdd size={24} color="white"/></button>
                </div>
                {/* Filters */}
                <div style={styles.scroller}>
                    <div onClick={() => setActiveFilter('all')} style={{...styles.catPill, border: activeFilter === 'all' ? '1px solid white' : '1px solid transparent'}}>All</div>
                    {CATEGORIES.map(cat => (
                        <div key={cat.id} onClick={() => setActiveFilter(cat.id)} style={{...styles.catPill, color: cat.color, border: activeFilter === cat.id ? `1px solid ${cat.color}` : '1px solid transparent'}}>{cat.name}</div>
                    ))}
                </div>
            </div>
        )}
      </div>

      {/* BILL LIST */}
      <div style={styles.listContainer}>
          {filteredBills.map(bill => {
             const catCfg = CATEGORIES.find(c => c.id === bill.category) || CATEGORIES[5];
             return (
               <div key={bill.id} style={styles.billCard}>
                   <div style={{...styles.billIconBox, color: catCfg.color, background: `${catCfg.color}20`}}>{catCfg.icon}</div>
                   <div style={{flex:1, paddingLeft:'15px'}}>
                       <div style={{fontWeight:'600'}}>{catCfg.name}</div>
                       <div style={{fontSize:'12px', opacity:0.5}}>{bill.dateStr} • {bill.quantity}</div>
                       {bill.note && <div style={{fontSize:'11px', opacity:0.7, fontStyle:'italic'}}>{bill.note}</div>}
                   </div>
                   <div style={{textAlign:'right'}}>
                       <div style={{fontWeight:'bold', color:catCfg.color}}>₹{bill.amount}</div>
                       <div style={{display:'flex', gap:'10px', marginTop:'5px', justifyContent:'flex-end'}}>
                           <IoMdCreate onClick={()=>openEditBill(bill)} color="#ccc"/>
                           <IoMdTrash onClick={()=>handleDeleteBill(bill.id)} color="#FF5252"/>
                       </div>
                   </div>
               </div>
             )
          })}
      </div>

      {/* ADD MODAL */}
      {showAddModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={{color:'white'}}>Add Expense</h3>
            <div style={{marginBottom:'15px'}}>
                <div style={styles.label}>Category</div>
                <div style={{display:'flex', gap:'10px', overflowX:'auto', paddingBottom:'10px'}}>
                    {CATEGORIES.map(cat => (
                        <div key={cat.id} onClick={()=>setNewBill({...newBill, category:cat.id})} style={{padding:'10px', borderRadius:'10px', background: newBill.category===cat.id ? cat.color : '#333', minWidth:'60px', textAlign:'center'}}>
                            <div style={{fontSize:'20px'}}>{cat.icon}</div>
                            <div style={{fontSize:'10px'}}>{cat.name}</div>
                        </div>
                    ))}
                </div>
            </div>
            <div style={styles.amountBox}><FaRupeeSign/><input type="number" autoFocus style={styles.amountInput} value={newBill.amount} onChange={e=>setNewBill({...newBill, amount:e.target.value})} placeholder="Amount"/></div>
            <input style={styles.simpleInput} value={newBill.quantity} onChange={e=>setNewBill({...newBill, quantity:e.target.value})} placeholder="Quantity (Optional)"/>
            <input style={{...styles.simpleInput, marginTop:'10px'}} value={newBill.note} onChange={e=>setNewBill({...newBill, note:e.target.value})} placeholder="Note (Optional)"/>
            
            <div style={{marginTop:'15px', display:'flex', gap:'10px'}}>
                <button onClick={closeModal} style={styles.cancelBtn}>Cancel</button>
                <button onClick={handleSaveBill} style={styles.saveBtn}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* HARVEST MODAL */}
      {showHarvestModal && (
          <div style={styles.modalOverlay}>
              <div style={styles.modalContent}>
                  <h3 style={{color:'white'}}>Harvest & Sell</h3>
                  <div style={styles.label}>Total Bags</div>
                  <input type="number" style={styles.simpleInput} value={harvestData.bags} onChange={e=>setHarvestData({...harvestData, bags:e.target.value})}/>
                  <div style={{...styles.label, marginTop:'10px'}}>Total Quintals</div>
                  <input type="number" style={styles.simpleInput} value={harvestData.quintals} onChange={e=>setHarvestData({...harvestData, quintals:e.target.value})}/>
                  <div style={{...styles.label, marginTop:'10px'}}>Price Per Quintal</div>
                  <input type="number" style={styles.simpleInput} value={harvestData.pricePerQuintal} onChange={e=>setHarvestData({...harvestData, pricePerQuintal:e.target.value})}/>
                  
                  <div style={{marginTop:'20px', padding:'10px', background:'rgba(76,175,80,0.2)', borderRadius:'10px', textAlign:'center', color:'#4CAF50', fontWeight:'bold'}}>
                      Revenue: ₹{((parseFloat(harvestData.quintals)||0) * (parseFloat(harvestData.pricePerQuintal)||0)).toLocaleString()}
                  </div>
                  <button onClick={handleHarvestSubmit} style={{...styles.saveBtn, marginTop:'15px'}}>Complete Harvest</button>
                  <button onClick={()=>setShowHarvestModal(false)} style={{...styles.cancelBtn, marginTop:'10px'}}>Cancel</button>
              </div>
          </div>
      )}
    </div>
  );
}

// STYLES (Print styles are handled by browser default, hidden div is styled inline)
const styles = {
  page: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: '#0f1215', color: 'white', overflowY: 'auto', paddingBottom:'80px' },
  header: { display: 'flex', alignItems: 'center', padding: '20px', background: 'rgba(20,20,20,0.9)', position: 'sticky', top: 0, zIndex: 10 },
  backBtn: { background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius:'50%', width:'40px', height:'40px', display:'flex', alignItems:'center', justifyContent:'center', marginRight: '15px' },
  pageTitle: { margin: 0, fontSize: '20px', fontWeight: '700' },
  menuBtn: { background:'transparent', border:'none', cursor:'pointer' },
  menuDropdown: { position:'absolute', top:'40px', right:'0', background:'#333', padding:'10px', borderRadius:'8px', zIndex:20 },
  menuItem: { padding:'10px', minWidth:'120px', cursor:'pointer' },

  heroContainer: { padding: '20px' },
  heroCard: { background: 'rgba(255,255,255,0.1)', padding: '25px', borderRadius: '20px', position:'relative' },
  heroAddBtn: { width:'50px', height:'50px', borderRadius:'50%', background:'#4CAF50', border:'none', display:'flex', alignItems:'center', justifyContent:'center' },
  
  scroller: { display:'flex', gap:'10px', overflowX:'auto', marginTop:'20px' },
  catPill: { padding:'8px 15px', borderRadius:'15px', background:'rgba(255,255,255,0.05)', whiteSpace:'nowrap', fontSize:'12px', cursor:'pointer' },

  listContainer: { padding:'0 20px' },
  billCard: { display:'flex', alignItems:'center', background:'rgba(255,255,255,0.05)', padding:'15px', borderRadius:'15px', marginBottom:'10px' },
  billIconBox: { width:'40px', height:'40px', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px' },
  
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100 },
  modalContent: { background: '#1A1A1C', width: '100%', borderTopLeftRadius: '25px', borderTopRightRadius: '25px', padding: '25px' },
  
  amountBox: { display:'flex', alignItems:'center', background:'rgba(255,255,255,0.05)', padding:'15px', borderRadius:'15px', marginBottom:'15px' },
  amountInput: { background:'transparent', border:'none', color:'white', fontSize:'24px', marginLeft:'10px', width:'100%', outline:'none' },
  simpleInput: { width:'100%', padding:'15px', borderRadius:'15px', background:'rgba(255,255,255,0.05)', border:'none', color:'white', marginBottom:'10px', boxSizing:'border-box' },
  saveBtn: { width:'100%', padding:'15px', borderRadius:'15px', background:'#4CAF50', border:'none', color:'white', fontWeight:'bold', fontSize:'16px' },
  cancelBtn: { width:'100%', padding:'15px', borderRadius:'15px', background:'rgba(255,255,255,0.1)', border:'none', color:'white' },
  
  harvestStatsGrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', margin:'20px 0' },
  harvestStat: { background:'rgba(0,0,0,0.3)', padding:'10px', borderRadius:'10px', textAlign:'center', fontSize:'14px' },
  reportBtn: { width:'100%', padding:'12px', background:'white', color:'black', border:'none', borderRadius:'10px', fontWeight:'bold', marginBottom:'10px', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', cursor:'pointer' },
  reopenBtn: { width:'100%', padding:'10px', background:'rgba(255,255,255,0.2)', color:'white', border:'none', borderRadius:'10px', fontSize:'12px', cursor:'pointer' },
  
  // Print Table Styles (used inline in the hidden div, but kept here for reference)
  th: { padding:'10px', borderBottom:'2px solid #ddd', textAlign:'left', fontSize:'12px', color:'#666' },
  td: { padding:'10px', borderBottom:'1px solid #eee', fontSize:'14px' }
};

export default CropExpenses;