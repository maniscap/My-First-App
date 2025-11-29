import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';

function Admin() {
  // Get today's date automatically for default
  const today = new Date().toISOString().split('T')[0];

  const [rate, setRate] = useState({
    crop: '', price: '', trend: 'up',
    date: today,
    state: '',
    district: '',
    market: ''
  });
  
  const [currentRates, setCurrentRates] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- 1. FETCH DATA ---
  const fetchRates = async () => {
    const querySnapshot = await getDocs(collection(db, "market_rates"));
    const list = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setCurrentRates(list);
    setLoading(false);
  };

  useEffect(() => {
    fetchRates();
  }, []);

  // --- 2. ADD NEW RATE WITH DETAILS ---
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "market_rates"), {
        crop: rate.crop,
        price: rate.price,
        trend: rate.trend,
        date: rate.date,
        state: rate.state,
        district: rate.district,
        market: rate.market,
        updatedAt: new Date()
      });
      alert("✅ Detailed Rate Added!");
      // Reset form but keep date/location as it might be same for next entry
      setRate({ ...rate, crop: '', price: '', trend: 'up' });
      fetchRates();
    } catch (error) {
      alert("Failed to update.");
    }
  };

  // --- 3. DELETE OLD RATE ---
  const handleDelete = async (id) => {
    if(window.confirm("Delete this rate?")) {
      await deleteDoc(doc(db, "market_rates", id));
      fetchRates();
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <Link to="/" style={{ textDecoration: 'none', color: '#555' }}>⬅ Back Home</Link>
      
      <h1 style={{ color: '#d32f2f', textAlign: 'center' }}>🔐 Admin Dashboard</h1>

      {/* --- THE ADVANCED FORM --- */}
      <div style={formCard}>
        <h3>➕ Add Daily Market Rate</h3>
        <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          
          {/* Row 1: Date & Market */}
          <div style={{display: 'flex', gap: '10px'}}>
            <input type="date" required style={inputStyle} 
              value={rate.date} onChange={(e) => setRate({...rate, date: e.target.value})} />
            <input type="text" placeholder="Market Name (e.g. Asia Market)" required style={inputStyle} 
              value={rate.market} onChange={(e) => setRate({...rate, market: e.target.value})} />
          </div>

          {/* Row 2: Location */}
          <div style={{display: 'flex', gap: '10px'}}>
            <input type="text" placeholder="State (e.g. AP)" required style={inputStyle} 
              value={rate.state} onChange={(e) => setRate({...rate, state: e.target.value})} />
            <input type="text" placeholder="District (e.g. Guntur)" required style={inputStyle} 
              value={rate.district} onChange={(e) => setRate({...rate, district: e.target.value})} />
          </div>

          {/* Row 3: Crop Details */}
          <div style={{display: 'flex', gap: '10px'}}>
            <input type="text" placeholder="Crop Name" required style={inputStyle} 
              value={rate.crop} onChange={(e) => setRate({...rate, crop: e.target.value})} />
            <input type="text" placeholder="Price (₹)" required style={inputStyle} 
              value={rate.price} onChange={(e) => setRate({...rate, price: e.target.value})} />
          </div>

          <label style={{textAlign: 'left', fontWeight: 'bold'}}>Trend:</label>
          <select style={inputStyle} value={rate.trend} onChange={(e) => setRate({...rate, trend: e.target.value})}>
            <option value="up">📈 UP</option>
            <option value="down">📉 DOWN</option>
            <option value="stable">➡️ STABLE</option>
          </select>

          <button type="submit" style={btnStyle}>Publish Update</button>
        </form>
      </div>

      {/* --- THE LIST (Now shows details) --- */}
      <div style={{ marginTop: '30px' }}>
        <h3>📋 Current Live Rates</h3>
        {currentRates.map((item) => (
          <div key={item.id} style={itemStyle}>
            <div>
                <strong>{item.crop}</strong> - {item.price} <br/>
                <small style={{color: '#666'}}>📍 {item.market}, {item.district} ({item.date})</small>
            </div>
            <button onClick={() => handleDelete(item.id)} style={deleteBtn}>🗑️</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// STYLES
const formCard = { backgroundColor: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', marginTop: '20px' };
const inputStyle = { padding: '10px', borderRadius: '5px', border: '1px solid #ccc', flex: 1 };
const btnStyle = { padding: '12px', backgroundColor: '#d32f2f', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' };
const itemStyle = { display: 'flex', justifyContent: 'space-between', padding: '15px', background: 'white', borderBottom: '1px solid #ddd', alignItems: 'center' };
const deleteBtn = { background: 'none', border: '1px solid red', color: 'red', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' };

export default Admin;