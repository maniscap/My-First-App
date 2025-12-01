import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

function Business() {
  // --- BACKGROUND ---
  const [bgImage, setBgImage] = useState('');
  const dayBg = 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2940&auto=format&fit=crop';
  const nightBg = 'https://media.istockphoto.com/id/1050520122/photo/full-moon-clouds-and-skies-with-forest-in-the-dark-night.jpg?s=1024x1024&w=is&k=20&c=aI_22_03ioCvhtoLIxeuiITaaO-PJcvcFOzX27HYRUs=';

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 18 || hour < 6) setBgImage(nightBg);
    else setBgImage(dayBg);
  }, []);

  // --- LOGIC ---
  const [activeTab, setActiveTab] = useState('sell');
  const [showForm, setShowForm] = useState(false);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingLoc, setIsLoadingLoc] = useState(false);

  const [newPost, setNewPost] = useState({ crop: '', qty: '', price: '', seller: '', location: '', lat: null, lng: null });

  useEffect(() => {
    const fetchCrops = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "crops"));
        const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCrops(list);
        setLoading(false);
      } catch (error) { console.error("Error:", error); setLoading(false); }
    };
    fetchCrops();
  }, []);

  const getLocation = () => {
    if (!navigator.geolocation) { alert("Geolocation not supported"); return; }
    setIsLoadingLoc(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      setNewPost(prev => ({ ...prev, lat: lat, lng: lon }));
      try {
        const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
        const data = await response.json();
        setNewPost(prev => ({ ...prev, location: `${data.locality || data.city}, ${data.principalSubdivision}` }));
      } catch (error) { setNewPost(prev => ({ ...prev, location: "GPS Locked" })); }
      setIsLoadingLoc(false);
    }, () => { alert("Unable to retrieve location."); setIsLoadingLoc(false); });
  };

  const handlePost = async (e) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, "crops"), { ...newPost, createdAt: new Date() });
      setCrops([{ id: docRef.id, ...newPost }, ...crops]);
      setNewPost({ crop: '', qty: '', price: '', seller: '', location: '', lat: null, lng: null });
      setShowForm(false);
      alert("Crop Listed! 💰");
    } catch (error) { alert("Error saving."); }
  };

  return (
    <div style={{...pageStyle, backgroundImage: `url('${bgImage}')`}}>
      <div style={contentContainer}>
        <Link to="/dashboard" style={backLink}>⬅ Dashboard</Link>
        <h1 style={titleStyle}>💰 Business Zone</h1>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '20px' }}>
          <button onClick={() => setActiveTab('sell')} style={activeTab === 'sell' ? activeBtn : inactiveBtn}>🌾 Sell Crop</button>
          <button onClick={() => setActiveTab('buy')} style={activeTab === 'buy' ? activeBtn : inactiveBtn}>🛒 Buy</button>
        </div>

        {activeTab === 'sell' && (
          <>
            {!showForm && <button onClick={() => setShowForm(true)} style={postBtn}>➕ Sell Your Crop</button>}
            
            {showForm && (
              <div style={glassCard}>
                <h3 style={{marginTop:0}}>List Your Crop</h3>
                <form onSubmit={handlePost} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input type="text" placeholder="Crop Name" required style={inputStyle} value={newPost.crop} onChange={(e) => setNewPost({...newPost, crop: e.target.value})} />
                  <input type="text" placeholder="Quantity" required style={inputStyle} value={newPost.qty} onChange={(e) => setNewPost({...newPost, qty: e.target.value})} />
                  <input type="text" placeholder="Price (₹)" required style={inputStyle} value={newPost.price} onChange={(e) => setNewPost({...newPost, price: e.target.value})} />
                  <input type="text" placeholder="Your Name" required style={inputStyle} value={newPost.seller} onChange={(e) => setNewPost({...newPost, seller: e.target.value})} />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input type="text" placeholder="Location" required style={{...inputStyle, flex: 1}} value={newPost.location} onChange={(e) => setNewPost({...newPost, location: e.target.value})} />
                    <button type="button" onClick={getLocation} style={locBtn}>{isLoadingLoc ? "⏳" : "📍 GPS"}</button>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button type="submit" style={submitBtn}>✅ Post</button>
                    <button type="button" onClick={() => setShowForm(false)} style={cancelBtn}>❌ Cancel</button>
                  </div>
                </form>
              </div>
            )}

            <div style={{ display: 'grid', gap: '15px' }}>
              {loading ? <p style={{textAlign:'center', color:'white'}}>⏳ Loading...</p> : 
                crops.map((item) => (
                  <div key={item.id} style={glassItem}>
                    <div style={{flex: 1}}>
                      <h3 style={{ margin: '0 0 5px 0', color: '#FBC02D' }}>{item.crop}</h3>
                      <p>Qty: <strong>{item.qty}</strong> | Price: <span style={{ color: 'green' }}>{item.price}</span></p>
                      <p style={{ fontSize: '12px', color: '#555' }}>📍 {item.location}</p>
                      {item.lat && <a href={`http://maps.google.com/?q=${item.lat},${item.lng}`} target="_blank" style={{color: 'blue', fontSize: '12px'}}>🗺️ Map</a>}
                    </div>
                    <button style={callBtn}>📞 Call</button>
                  </div>
                ))
              }
            </div>
          </>
        )}
        
        {activeTab === 'buy' && <div style={glassCard}><p style={{textAlign:'center'}}>🛒 Buyer Marketplace coming soon...</p></div>}
      </div>
    </div>
  );
}

// STYLES
const pageStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: 'black', overflowY: 'auto' };
const contentContainer = { padding: '20px', maxWidth: '800px', margin: '0 auto', paddingBottom: '100px' };
const backLink = { color: 'white', textDecoration: 'none', fontSize: '14px', background: 'rgba(0,0,0,0.5)', padding: '8px 15px', borderRadius: '20px', backdropFilter: 'blur(5px)' };
const titleStyle = { color: 'white', textAlign: 'center', marginTop: '20px', textShadow: '0 2px 4px rgba(0,0,0,0.8)', fontWeight: '900' };
const glassCard = { backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: '20px', borderRadius: '20px', marginBottom: '20px', boxShadow: '0 8px 32px 0 rgba(0,0,0,0.3)' };
const glassItem = { backgroundColor: 'rgba(255, 255, 255, 0.85)', padding: '15px', borderRadius: '15px', display: 'flex', alignItems: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' };
const inputStyle = { padding: '10px', borderRadius: '8px', border: '1px solid #ccc', width: '100%', boxSizing: 'border-box' };
const activeBtn = { padding: '10px 20px', backgroundColor: '#FBC02D', color: 'black', border: 'none', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer' };
const inactiveBtn = { padding: '10px 20px', backgroundColor: 'rgba(255,255,255,0.3)', color: 'white', border: '1px solid white', borderRadius: '20px', cursor: 'pointer' };
const postBtn = { width: '100%', padding: '15px', backgroundColor: 'white', color: '#FBC02D', border: 'none', borderRadius: '10px', marginBottom: '20px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' };
const submitBtn = { flex: 1, padding: '10px', backgroundColor: '#2E7D32', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' };
const cancelBtn = { flex: 1, padding: '10px', backgroundColor: '#d32f2f', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' };
const locBtn = { padding: '10px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' };
const callBtn = { padding: '8px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', marginLeft: '10px' };

export default Business;