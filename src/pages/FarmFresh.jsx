import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

function FarmFresh() {
  // --- BACKGROUND ---
  const [bgImage, setBgImage] = useState('');
  const dayBg = 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2940&auto=format&fit=crop';
  const nightBg = 'https://images.unsplash.com/photo-1504333638930-c8787321eee0?q=80&w=2070&auto=format&fit=crop';

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 18 || hour < 6) setBgImage(nightBg);
    else setBgImage(dayBg);
  }, []);

  // --- MARKET LOGIC ---
  const [showForm, setShowForm] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingLoc, setIsLoadingLoc] = useState(false);

  // Added 'image' to state
  const [newProduct, setNewProduct] = useState({
    item: '', qty: '', price: '', seller: '', location: '', phone: '', image: ''
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "daily_products"));
        const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(list);
        setLoading(false);
      } catch (error) { console.error("Error:", error); setLoading(false); }
    };
    fetchProducts();
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
        setNewProduct(prev => ({ ...prev, location: `${data.locality || data.city}, ${data.principalSubdivision}` }));
      } catch (error) { setNewProduct(prev => ({ ...prev, location: "GPS Locked" })); }
      setIsLoadingLoc(false);
    }, () => { alert("Check phone GPS settings."); setIsLoadingLoc(false); }, {enableHighAccuracy:true, timeout:10000});
  };

  // IMAGE HANDLER
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) { // Limit to 1MB
        alert("Image too large! Please choose an image under 1MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct({ ...newProduct, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePost = async (e) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, "daily_products"), { ...newProduct, createdAt: new Date() });
      setProducts([{ id: docRef.id, ...newProduct }, ...products]);
      setNewProduct({ item: '', qty: '', price: '', seller: '', location: '', phone: '', image: '' });
      setShowForm(false);
      alert("Fresh Produce Listed! 🧺");
    } catch (error) { alert("Error saving."); }
  };

  return (
    <div style={{...pageStyle, backgroundImage: `url('${bgImage}')`}}>
      <div style={contentContainer}>
        <Link to="/dashboard" style={backLink}>⬅ Dashboard</Link>
        <h1 style={titleStyle}>🥦 Farm Fresh</h1>
        <p style={subtitleStyle}>Buy & Sell Daily Essentials</p>

        {!showForm && <button onClick={() => setShowForm(true)} style={postBtn}>➕ Sell Fresh Items</button>}

        {showForm && (
          <div style={glassCard}>
            <h3 style={{marginTop:0, color: '#2E7D32'}}>List Daily Item</h3>
            <form onSubmit={handlePost} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              
              {/* IMAGE INPUT */}
              <div style={{border:'1px dashed #ccc', padding:'10px', borderRadius:'8px', textAlign:'center', backgroundColor:'rgba(255,255,255,0.5)'}}>
                <label style={{cursor:'pointer', fontSize:'14px', color:'#2E7D32', fontWeight:'bold'}}>
                  📷 Upload Photo
                  <input type="file" accept="image/*" onChange={handleImageUpload} style={{display:'none'}} />
                </label>
                {newProduct.image && <img src={newProduct.image} alt="Preview" style={{display:'block', margin:'10px auto', width:'80px', height:'80px', objectFit:'cover', borderRadius:'8px'}} />}
              </div>

              <input type="text" placeholder="Item Name (e.g. Milk)" required style={inputStyle} 
                value={newProduct.item} onChange={(e) => setNewProduct({...newProduct, item: e.target.value})} />
              <div style={{display:'flex', gap:'10px'}}>
                <input type="text" placeholder="Qty" required style={inputStyle} 
                  value={newProduct.qty} onChange={(e) => setNewProduct({...newProduct, qty: e.target.value})} />
                <input type="text" placeholder="Price (₹)" required style={inputStyle} 
                  value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} />
              </div>
              <input type="text" placeholder="Seller Name" required style={inputStyle} 
                value={newProduct.seller} onChange={(e) => setNewProduct({...newProduct, seller: e.target.value})} />
              <input type="tel" placeholder="Phone Number" required style={inputStyle} 
                value={newProduct.phone} onChange={(e) => setNewProduct({...newProduct, phone: e.target.value})} />
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="text" placeholder="Location" required style={{...inputStyle, flex: 1}} 
                  value={newProduct.location} onChange={(e) => setNewProduct({...newProduct, location: e.target.value})} />
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
            products.map((item) => (
              <div key={item.id} style={glassItem}>
                {/* DISPLAY IMAGE */}
                {item.image ? (
                  <img src={item.image} alt="Product" style={{width:'70px', height:'70px', borderRadius:'10px', objectFit:'cover', marginRight:'15px', border:'1px solid white'}} />
                ) : (
                  <div style={{width:'70px', height:'70px', borderRadius:'10px', background:'rgba(255,255,255,0.3)', marginRight:'15px', display:'flex', alignItems:'center', justifyContent:'center'}}>🥦</div>
                )}
                <div style={{flex: 1}}>
                  <h3 style={{ margin: '0 0 5px 0', color: '#2E7D32' }}>{item.item}</h3>
                  <p style={{fontSize: '14px', margin:'2px 0'}}><strong>Qty:</strong> {item.qty} | <strong>₹{item.price}</strong></p>
                  <p style={{ fontSize: '12px', color: '#555' }}>📍 {item.location}</p>
                  <p style={{ fontSize: '12px', color: '#555' }}>👤 {item.seller}</p>
                </div>
                <a href={`tel:${item.phone}`} style={callBtn}>📞 Call</a>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}

// STYLES
const pageStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: 'black', overflowY: 'auto' };
const contentContainer = { padding: '20px', maxWidth: '800px', margin: '0 auto', paddingBottom: '100px', paddingTop: '20px' };
const backLink = { color: 'white', textDecoration: 'none', fontSize: '14px', background: 'rgba(0,0,0,0.5)', padding: '8px 15px', borderRadius: '20px', backdropFilter: 'blur(5px)' };
const titleStyle = { color: 'white', textAlign: 'center', marginTop: '15px', textShadow: '0 2px 4px rgba(0,0,0,0.8)', fontWeight: '900', marginBottom: '5px' };
const subtitleStyle = { color: '#ddd', textAlign: 'center', fontSize: '14px', marginTop: '0', marginBottom: '20px', textShadow: '0 1px 2px black' };
const glassCard = { backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: '20px', borderRadius: '20px', marginBottom: '20px', boxShadow: '0 8px 32px 0 rgba(0,0,0,0.3)' };
const glassItem = { backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: '10px', borderRadius: '15px', display: 'flex', alignItems: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' };
const postBtn = { width: '100%', padding: '15px', backgroundColor: 'white', color: '#2E7D32', border: 'none', borderRadius: '10px', marginBottom: '20px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', fontSize: '16px' };
const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #ccc', width: '100%', boxSizing: 'border-box', fontSize: '16px' };
const submitBtn = { flex: 1, padding: '12px', backgroundColor: '#2E7D32', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const cancelBtn = { flex: 1, padding: '12px', backgroundColor: '#d32f2f', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const locBtn = { padding: '10px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' };
const callBtn = { textDecoration: 'none', padding: '10px 15px', backgroundColor: '#4CAF50', color: 'white', borderRadius: '50px', fontSize: '13px', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' };

export default FarmFresh;