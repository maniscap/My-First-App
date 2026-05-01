import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { IoMdArrowBack } from 'react-icons/io';

function Admin() {
  const [activeTab, setActiveTab] = useState('rates');
  
  // --- STATES ---
  const [rate, setRate] = useState({ 
      crop: '', price: '', trend: 'up', 
      date: new Date().toISOString().split('T')[0], 
      state: '', district: '', market: '' 
  });

  const [ratesList, setRatesList] = useState([]);

  // --- FETCH DATA ---
  const fetchData = async () => {
    const r = await getDocs(collection(db, "market_rates"));
    setRatesList(r.docs.map(d => ({id:d.id, ...d.data()})));
  };

  useEffect(() => { fetchData(); }, []);

  // --- SUBMIT HANDLERS ---
  const handleRateSubmit = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "market_rates"), rate);
    alert("Rate Added (Manual Override)");
    fetchData();
  };

  // --- DELETE HANDLER ---
  const handleDelete = async (col, id) => {
    if(window.confirm("Delete this item?")) {
        await deleteDoc(doc(db, col, id));
        fetchData();
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
          <Link to="/" style={styles.backBtn}><IoMdArrowBack size={24}/></Link>
          <h1 style={styles.title}>Admin Panel (Manual Override)</h1>
          <div style={{width: 24}}></div>
      </div>

      <div style={styles.container}>
          <p style={{color:'#888', marginBottom:'20px'}}>
              Note: The main Agri Insights app is now fully automated via APIs. 
              Use this form only if you need to inject custom local market rates manually.
          </p>

          <div style={styles.card}>
              <h3>➕ Add Custom Rate</h3>
              <form onSubmit={handleRateSubmit} style={styles.form}>
                  <div style={styles.row}>
                      <input type="date" value={rate.date} onChange={e=>setRate({...rate, date:e.target.value})} style={styles.input} required/>
                      <input placeholder="Market Name" value={rate.market} onChange={e=>setRate({...rate, market:e.target.value})} style={styles.input} required/>
                  </div>
                  <div style={styles.row}>
                      <input placeholder="State" value={rate.state} onChange={e=>setRate({...rate, state:e.target.value})} style={styles.input} required/>
                      <input placeholder="District" value={rate.district} onChange={e=>setRate({...rate, district:e.target.value})} style={styles.input} required/>
                  </div>
                  <div style={styles.row}>
                      <input placeholder="Crop Name" value={rate.crop} onChange={e=>setRate({...rate, crop:e.target.value})} style={styles.input} required/>
                      <input placeholder="Price (₹)" value={rate.price} onChange={e=>setRate({...rate, price:e.target.value})} style={styles.input} required/>
                  </div>
                  <button type="submit" style={styles.btn}>Publish Rate</button>
              </form>
          </div>

          <div style={styles.list}>
              {ratesList.map(r => (
                  <div key={r.id} style={styles.listItem}>
                      <span><b>{r.crop}</b> - ₹{r.price} ({r.market})</span>
                      <button onClick={()=>handleDelete('market_rates', r.id)} style={styles.delBtn}>X</button>
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
}

const styles = {
  page: { background: '#000', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid #333' },
  backBtn: { color: '#fff', textDecoration: 'none' },
  title: { fontSize: '18px', fontWeight: 'bold' },
  container: { padding: '20px', maxWidth: '600px', margin: '0 auto' },
  card: { background: '#111', padding: '20px', borderRadius: '12px', border: '1px solid #333', marginBottom: '20px' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  row: { display: 'flex', gap: '10px' },
  input: { flex: 1, padding: '12px', background: '#222', border: '1px solid #444', color: '#fff', borderRadius: '8px', outline: 'none' },
  btn: { padding: '12px', background: '#E23744', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  list: { display: 'flex', flexDirection: 'column', gap: '10px' },
  listItem: { display: 'flex', justifyContent: 'space-between', padding: '15px', background: '#111', border: '1px solid #333', borderRadius: '8px', alignItems: 'center' },
  delBtn: { background: 'rgba(255, 0, 0, 0.2)', color: 'red', border: 'none', borderRadius: '4px', padding: '5px 10px', cursor: 'pointer' }
};

export default Admin;