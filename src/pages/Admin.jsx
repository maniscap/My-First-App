import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';

function Admin() {
  const [activeTab, setActiveTab] = useState('rates');
  
  // --- STATES ---
  const [rate, setRate] = useState({ 
      crop: '', price: '', trend: 'up', 
      date: new Date().toISOString().split('T')[0], 
      state: '', district: '', market: '' 
  });
  const [book, setBook] = useState({ title: '', author: '', link: '' });
  const [video, setVideo] = useState({ title: '', link: '' });

  // Lists
  const [ratesList, setRatesList] = useState([]);
  const [booksList, setBooksList] = useState([]);
  const [videosList, setVideosList] = useState([]);

  // --- FETCH DATA ---
  const fetchData = async () => {
    const r = await getDocs(collection(db, "market_rates"));
    setRatesList(r.docs.map(d => ({id:d.id, ...d.data()})));
    
    const b = await getDocs(collection(db, "library"));
    setBooksList(b.docs.map(d => ({id:d.id, ...d.data()})));
    
    const v = await getDocs(collection(db, "videos"));
    setVideosList(v.docs.map(d => ({id:d.id, ...d.data()})));
  };

  useEffect(() => { fetchData(); }, []);

  // --- SUBMIT HANDLERS ---
  const handleRateSubmit = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "market_rates"), rate);
    alert("Rate Added!");
    fetchData();
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "library"), book);
    alert("Book Added!");
    setBook({ title: '', author: '', link: '' });
    fetchData();
  };

  const handleVideoSubmit = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "videos"), video);
    alert("Video Added!");
    setVideo({ title: '', link: '' });
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
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <Link to="/" style={{ textDecoration: 'none', color: '#555' }}>⬅ Back Home</Link>
      <h1 style={{ color: '#d32f2f', textAlign: 'center' }}>🔐 Content Manager</h1>

      {/* TABS */}
      <div style={{display:'flex', gap:'10px', marginBottom:'20px', justifyContent:'center', flexWrap: 'wrap'}}>
          <button onClick={()=>setActiveTab('rates')} style={activeTab==='rates'?activeTabStyle:tabStyle}>Market Rates</button>
          <button onClick={()=>setActiveTab('books')} style={activeTab==='books'?activeTabStyle:tabStyle}>Library Books</button>
          <button onClick={()=>setActiveTab('videos')} style={activeTab==='videos'?activeTabStyle:tabStyle}>Videos</button>
      </div>

      {/* --- RATES TAB --- */}
      {activeTab === 'rates' && (
          <div>
              <div style={card}>
                  <h3>➕ Add Rate</h3>
                  <form onSubmit={handleRateSubmit} style={formGrid}>
                      
                      {/* Responsive Row 1: Date & Market */}
                      <div style={responsiveRow}>
                          <input type="date" value={rate.date} onChange={e=>setRate({...rate, date:e.target.value})} style={input} required/>
                          <input placeholder="Market Name" value={rate.market} onChange={e=>setRate({...rate, market:e.target.value})} style={input} required/>
                      </div>

                      {/* Responsive Row 2: Location */}
                      <div style={responsiveRow}>
                          <input placeholder="State" value={rate.state} onChange={e=>setRate({...rate, state:e.target.value})} style={input} required/>
                          <input placeholder="District" value={rate.district} onChange={e=>setRate({...rate, district:e.target.value})} style={input} required/>
                      </div>

                      {/* Responsive Row 3: Details */}
                      <div style={responsiveRow}>
                          <input placeholder="Crop Name" value={rate.crop} onChange={e=>setRate({...rate, crop:e.target.value})} style={input} required/>
                          <input placeholder="Price (₹)" value={rate.price} onChange={e=>setRate({...rate, price:e.target.value})} style={input} required/>
                      </div>

                      <select value={rate.trend} onChange={e=>setRate({...rate, trend:e.target.value})} style={input}>
                          <option value="up">📈 Up</option><option value="down">📉 Down</option><option value="stable">➡️ Stable</option>
                      </select>
                      <button type="submit" style={btn}>Publish Rate</button>
                  </form>
              </div>
              <div style={listContainer}>
                  {ratesList.map(r => (
                      <div key={r.id} style={listItem}>
                          <span><b>{r.crop}</b> - ₹{r.price} ({r.market})</span>
                          <button onClick={()=>handleDelete('market_rates', r.id)} style={delBtn}>X</button>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* --- BOOKS TAB --- */}
      {activeTab === 'books' && (
          <div>
              <div style={card}>
                  <h3>📚 Add Book</h3>
                  <form onSubmit={handleBookSubmit} style={formGrid}>
                      <input placeholder="Book Title" value={book.title} onChange={e=>setBook({...book, title:e.target.value})} style={input} required/>
                      <input placeholder="Author" value={book.author} onChange={e=>setBook({...book, author:e.target.value})} style={input}/>
                      <input placeholder="PDF/Drive Link" value={book.link} onChange={e=>setBook({...book, link:e.target.value})} style={input} required/>
                      <button type="submit" style={btn}>Add Book</button>
                  </form>
              </div>
              <div style={listContainer}>
                  {booksList.map(b => (
                      <div key={b.id} style={listItem}>
                          <span><b>{b.title}</b> ({b.author})</span>
                          <button onClick={()=>handleDelete('library', b.id)} style={delBtn}>X</button>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* --- VIDEOS TAB --- */}
      {activeTab === 'videos' && (
          <div>
              <div style={card}>
                  <h3>🎥 Add Video</h3>
                  <form onSubmit={handleVideoSubmit} style={formGrid}>
                      <input placeholder="Video Title" value={video.title} onChange={e=>setVideo({...video, title:e.target.value})} style={input} required/>
                      <input placeholder="YouTube Link" value={video.link} onChange={e=>setVideo({...video, link:e.target.value})} style={input} required/>
                      <button type="submit" style={btn}>Add Video</button>
                  </form>
              </div>
              <div style={listContainer}>
                  {videosList.map(v => (
                      <div key={v.id} style={listItem}>
                          <span><b>{v.title}</b></span>
                          <button onClick={()=>handleDelete('videos', v.id)} style={delBtn}>X</button>
                      </div>
                  ))}
              </div>
          </div>
      )}

    </div>
  );
}

// STYLES
const tabStyle = { padding: '10px 20px', cursor: 'pointer', border: '1px solid #ccc', background: 'white', borderRadius: '5px' };
const activeTabStyle = { ...tabStyle, background: '#d32f2f', color: 'white', borderColor: '#d32f2f' };
const card = { background: '#f9f9f9', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' };
const formGrid = { display: 'flex', flexDirection: 'column', gap: '15px' }; // Increased gap

// ✅ FIX: This allows wrapping.
const responsiveRow = { display: 'flex', gap: '15px', flexWrap: 'wrap' };

// ✅ FIX: 'flex: 1 1 280px' forces the input to be AT LEAST 280px wide.
// On Mobile (width < 350px): 280px + 280px > Screen Width. So they stack vertically.
// On Desktop (width > 800px): They fit side by side.
const input = { 
    padding: '12px', 
    borderRadius: '8px', 
    border: '1px solid #ddd', 
    flex: '1 1 280px', 
    width: '100%', 
    boxSizing: 'border-box' // Prevents padding from causing overflow
};

const btn = { padding: '15px', background: '#d32f2f', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' };
const listContainer = { marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' };
const listItem = { display: 'flex', justifyContent: 'space-between', padding: '15px', background: 'white', border: '1px solid #eee', borderRadius: '5px', alignItems: 'center' };
const delBtn = { background: '#ffcdd2', color: '#c62828', border: 'none', borderRadius: '5px', padding: '5px 10px', cursor: 'pointer', height: 'fit-content' };

export default Admin;