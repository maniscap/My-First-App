import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

function Business() {
  const [showForm, setShowForm] = useState(false);
  const [crops, setCrops] = useState([]);
  const [newPost, setNewPost] = useState({ crop: '', qty: '', price: '', seller: '', location: '' });

  useEffect(() => {
    const fetchCrops = async () => {
      const querySnapshot = await getDocs(collection(db, "crops"));
      setCrops(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchCrops();
  }, []);

  const handlePost = async (e) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, "crops"), { ...newPost, createdAt: new Date() });
      setCrops([{ id: docRef.id, ...newPost }, ...crops]);
      setShowForm(false);
    } catch (error) { alert("Error saving."); }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', paddingBottom: '80px', paddingTop: '20px' }}>
      <Link to="/dashboard" style={backLink}>⬅ Dashboard</Link>
      <h1 style={titleStyle}>💰 Business Zone</h1>

      {!showForm && <button onClick={() => setShowForm(true)} style={postBtn}>➕ Sell Crop</button>}
      
      {showForm && (
        <div style={glassCard}>
           <form onSubmit={handlePost} style={{display:'flex', flexDirection:'column', gap:'10px'}}>
             <input placeholder="Crop Name" required style={inputStyle} onChange={(e) => setNewPost({...newPost, crop: e.target.value})} />
             <input placeholder="Price" required style={inputStyle} onChange={(e) => setNewPost({...newPost, price: e.target.value})} />
             <button type="submit" style={submitBtn}>Post</button>
           </form>
        </div>
      )}

      <div style={{ display: 'grid', gap: '15px' }}>
          {crops.map((item) => (
              <div key={item.id} style={glassItem}>
                  <h3>{item.crop}</h3>
                  <p>{item.price}</p>
              </div>
          ))}
      </div>
    </div>
  );
}

const backLink = { color: 'white', textDecoration: 'none', fontSize: '14px', background: 'rgba(0,0,0,0.5)', padding: '8px 15px', borderRadius: '20px', backdropFilter: 'blur(5px)' };
const titleStyle = { color: 'white', textAlign: 'center', marginTop: '20px', textShadow: '0 2px 4px rgba(0,0,0,0.8)', fontWeight: '900' };
const postBtn = { width: '100%', padding: '15px', backgroundColor: 'white', color: '#FBC02D', border: 'none', borderRadius: '10px', marginBottom: '20px', cursor: 'pointer', fontWeight: 'bold' };
const glassCard = { backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: '20px', borderRadius: '20px', marginBottom: '20px' };
const glassItem = { backgroundColor: 'rgba(255, 255, 255, 0.85)', padding: '15px', borderRadius: '15px' };
const inputStyle = { padding: '10px', width: '100%', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' };
const submitBtn = { padding: '10px', backgroundColor: '#2E7D32', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' };

export default Business;