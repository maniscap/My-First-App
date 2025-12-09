import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

function Business() {
  const [bgImage, setBgImage] = useState('');
  const dayBg = 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2940&auto=format&fit=crop';
  const nightBg = 'https://images.unsplash.com/photo-1504333638930-c8787321eee0?q=80&w=2070&auto=format&fit=crop';

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 18 || hour < 6) setBgImage(nightBg);
    else setBgImage(dayBg);
  }, []);

  const [activeTab, setActiveTab] = useState('sell');
  const [showForm, setShowForm] = useState(false);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingLoc, setIsLoadingLoc] = useState(false);

  // Added 'image'
  const [newPost, setNewPost] = useState({ 
    crop: '', qty: '', price: '', seller: '', phone: '', location: '', image: '' 
  });

  useEffect(() => {
    const fetchCrops = async () => {
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
      try {
        const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
        const data = await response.json();
        setNewPost(prev => ({ ...prev, location: `${data.locality || data.city}, ${data.principalSubdivision}` }));
      } catch (error) { setNewPost(prev => ({ ...prev, location: "GPS Locked" })); }
      setIsLoadingLoc(false);
    }, () => { alert("Check phone GPS settings."); setIsLoadingLoc(false); }, {enableHighAccuracy:true, timeout:10000});
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) { alert("Image too large! Max 1MB."); return; }
      const reader = new FileReader();
      reader.onloadend = () => setNewPost({ ...newPost, image: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const handlePost = async (e) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, "crops"), { ...newPost, createdAt: new Date() });
      setCrops([{ id: docRef.id, ...newPost }, ...crops]);
      setNewPost({ crop: '', qty: '', price: '', seller: '', phone: '', location: '', image: '' });
      setShowForm(false);
      alert("Crop Listed Successfully! 🌾");
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
                <h3 style={{marginTop:0, color:'#FBC02D'}}>List Bulk Crop</h3>
                <form onSubmit={handlePost} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  
                  {/* IMAGE INPUT */}
                  <div style={{border:'1px dashed #ccc', padding:'10px', borderRadius:'8px', textAlign:'center', backgroundColor:'rgba(255,255,255,0.2)'}}>
                    <label style={{cursor:'pointer', fontSize:'14px', color:'#FBC02D', fontWeight:'bold'}}>
                      📷 Upload Crop Photo
                      <input type="file" accept="image/*" onChange={handleImageUpload} style={{display:'none'}} />
                    </label>
                    {newPost.image && <img src={newPost.image} alt="Preview" style={{display:'block', margin:'10px auto', width:'80px', height:'80px', objectFit:'cover', borderRadius:'8px'}} />}
                  </div>

                  <input type="text" placeholder="Crop Name (e.g. Cotton)" required style={inputStyle} value={newPost.crop} onChange={(e) => setNewPost({...newPost, crop: e.target.value})} />
                  <div style={{display:'flex', gap:'10px'}}>
                    <input type="text" placeholder="Qty (Tons)" required style={inputStyle} value={newPost.qty} onChange={(e) => setNewPost({...newPost, qty: e.target.value})} />
                    <input type="text" placeholder="Price (₹)" required style={inputStyle} value={newPost.price} onChange={(e) => setNewPost({...newPost, price: e.target.value})} />
                  </div>
                  <input type="text" placeholder="Seller Name" required style={inputStyle} value={newPost.seller} onChange={(e) => setNewPost({...newPost, seller: e.target.value})} />
                  <input type="tel" placeholder="Phone Number" required style={inputStyle} value={newPost.phone} onChange={(e) => setNewPost({...newPost, phone: e.target.value})} />
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
              {loading ? <p style={{textAlign:'center', color:'white'}}>⏳ Loading Market...</p> : 
                crops.map((item) => (
                  <div key={item.id} style={glassItem}>
                    {/* DISPLAY IMAGE */}
                    {item.image ? (
                      <img src={item.image} alt="Crop" style={{width:'70px', height:'70px', borderRadius:'10px', objectFit:'cover', marginRight:'15px', border:'1px solid rgba(255,255,255,0.5)'}} />
                    ) : (
                      <div style={{width:'70px', height:'70px', borderRadius:'10px', background:'rgba(255,255,255,0.1)', marginRight:'15px', display:'flex', alignItems:'center', justifyContent:'center'}}>🌾</div>
                    )}
                    <div style={{flex: 1}}>
                      <h3 style={{ margin: '0 0 5px 0', color: '#FBC02D' }}>{item.crop}</h3>
                      <p style={{fontSize: '14px', margin:'2px 0'}}><strong>Qty:</strong> {item.qty} | <span style={{color:'lightgreen', fontWeight:'bold'}}>₹{item.price}</span></p>
                      <p style={{ fontSize: '12px', color: '#ddd' }}>📍 {item.location}</p>
                      <p style={{ fontSize: '12px', color: '#ddd' }}>👤 {item.seller}</p>
                    </div>
                    <a href={`tel:${item.phone}`} style={callBtn}>📞 Call</a>
                  </div>
                ))
              }
            </div>
          </>
        )}
        
        {activeTab === 'buy' && <div style={glassCard}><p style={{textAlign:'center', color:'black'}}>🛒 Buyer Marketplace coming soon...</p></div>}
      </div>
    </div>
  );
}

// STYLES (Same as before)
const pageStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: 'black', overflowY: 'auto' };
const contentContainer = { padding: '20px', maxWidth: '800px', margin: '0 auto', paddingBottom: '100px', paddingTop: '20px' };
const backLink = { color: 'white', textDecoration: 'none', fontSize: '14px', background: 'rgba(0,0,0,0.5)', padding: '8px 15px', borderRadius: '20px', backdropFilter: 'blur(5px)' };
const titleStyle = { color: 'white', textAlign: 'center', marginTop: '15px', textShadow: '0 2px 4px rgba(0,0,0,0.8)', fontWeight: '900', marginBottom: '20px' };
const glassCard = { backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: '20px', borderRadius: '20px', marginBottom: '20px', boxShadow: '0 8px 32px 0 rgba(0,0,0,0.3)' };
const glassItem = { backgroundColor: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', padding: '10px', borderRadius: '15px', display: 'flex', alignItems: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', color: 'white' };
const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #ccc', width: '100%', boxSizing: 'border-box', fontSize: '16px' };
const activeBtn = { padding: '10px 20px', backgroundColor: '#FBC02D', color: 'black', border: 'none', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer' };
const inactiveBtn = { padding: '10px 20px', backgroundColor: 'rgba(255,255,255,0.3)', color: 'white', border: '1px solid white', borderRadius: '20px', cursor: 'pointer' };
const postBtn = { width: '100%', padding: '15px', backgroundColor: 'white', color: '#FBC02D', border: 'none', borderRadius: '10px', marginBottom: '20px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', fontSize: '16px' };
const submitBtn = { flex: 1, padding: '12px', backgroundColor: '#2E7D32', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const cancelBtn = { flex: 1, padding: '12px', backgroundColor: '#d32f2f', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const locBtn = { padding: '10px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' };
const callBtn = { textDecoration: 'none', padding: '10px 15px', backgroundColor: '#28a745', color: 'white', borderRadius: '50px', fontSize: '13px', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', marginLeft: '10px' };

export default Business;