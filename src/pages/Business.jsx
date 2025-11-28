import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase'; // Import the key to the cloud
import { collection, addDoc, getDocs } from 'firebase/firestore'; // Import database tools

function Business() {
  const [activeTab, setActiveTab] = useState('sell');
  const [showForm, setShowForm] = useState(false);
  const [isLoadingLoc, setIsLoadingLoc] = useState(false);
  
  // STATE: Crops now start empty, we will fill them from the cloud
  const [crops, setCrops] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const [newPost, setNewPost] = useState({
    crop: '', qty: '', price: '', seller: '', location: '', lat: null, lng: null
  });

  // --- 1. FETCH DATA FROM CLOUD (Runs when page loads) ---
  useEffect(() => {
    const fetchCrops = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "crops"));
        const cropList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCrops(cropList);
        setLoadingData(false);
      } catch (error) {
        console.error("Error fetching crops:", error);
        setLoadingData(false);
      }
    };
    fetchCrops();
  }, []);

  // --- 2. SEND DATA TO CLOUD ---
  const handlePost = async (e) => {
    e.preventDefault();
    try {
      // Add to Firebase Database
      const docRef = await addDoc(collection(db, "crops"), {
        crop: newPost.crop,
        qty: newPost.qty,
        price: newPost.price,
        seller: newPost.seller,
        location: newPost.location,
        lat: newPost.lat,
        lng: newPost.lng,
        createdAt: new Date()
      });

      // Update Local Screen immediately
      const newItem = { id: docRef.id, ...newPost };
      setCrops([newItem, ...crops]);
      
      // Reset Form
      setNewPost({ crop: '', qty: '', price: '', seller: '', location: '', lat: null, lng: null });
      setShowForm(false);
      alert("Success! Saved to the Cloud ☁️");
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Error saving to cloud");
    }
  };

  // --- GPS LOCATION FUNCTION (Same as before) ---
  const getLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported.");
      return;
    }
    setIsLoadingLoc(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      setNewPost(prev => ({ ...prev, lat: lat, lng: lon }));

      try {
        const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
        const data = await response.json();
        const detailedLoc = `${data.locality || data.city}, ${data.principalSubdivision}`;
        setNewPost(prev => ({ ...prev, location: detailedLoc }));
      } catch (error) {
        setNewPost(prev => ({ ...prev, location: "GPS Location Locked" }));
      }
      setIsLoadingLoc(false);
    }, () => {
      alert("Unable to retrieve location.");
      setIsLoadingLoc(false);
    });
  };

  const openMap = (lat, lng) => {
    if (lat && lng) window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
    else alert("No GPS data available.");
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', paddingBottom: '80px' }}>
      <Link to="/" style={{ textDecoration: 'none', color: '#555' }}>⬅ Back to Home</Link>
      <h1 style={{ color: '#FBC02D', textAlign: 'center' }}>💰 Business Zone</h1>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '30px' }}>
        <button onClick={() => setActiveTab('sell')} style={activeTab === 'sell' ? activeBtn : inactiveBtn}>🌾 Crop Market</button>
        <button onClick={() => setActiveTab('buy')} style={activeTab === 'buy' ? activeBtn : inactiveBtn}>🛒 Buy Products</button>
      </div>

      {activeTab === 'sell' && (
        <>
          {!showForm && (
            <button onClick={() => setShowForm(true)} style={postBtn}>➕ Sell Your Crop</button>
          )}

          {showForm && (
            <div style={formCard}>
              <h3>📝 List Your Crop</h3>
              <form onSubmit={handlePost} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input type="text" placeholder="Crop Name" required style={inputStyle} 
                  value={newPost.crop} onChange={(e) => setNewPost({...newPost, crop: e.target.value})} />
                <input type="text" placeholder="Quantity" required style={inputStyle} 
                  value={newPost.qty} onChange={(e) => setNewPost({...newPost, qty: e.target.value})} />
                <input type="text" placeholder="Price" required style={inputStyle} 
                  value={newPost.price} onChange={(e) => setNewPost({...newPost, price: e.target.value})} />
                <input type="text" placeholder="Your Name" required style={inputStyle} 
                  value={newPost.seller} onChange={(e) => setNewPost({...newPost, seller: e.target.value})} />
                
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input type="text" placeholder="Location" required style={{...inputStyle, flex: 1}} 
                    value={newPost.location} onChange={(e) => setNewPost({...newPost, location: e.target.value})} />
                  <button type="button" onClick={getLocation} style={locBtn}>
                    {isLoadingLoc ? "⏳" : "📍 GPS"}
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" style={submitBtn}>✅ Post to Cloud</button>
                  <button type="button" onClick={() => setShowForm(false)} style={cancelBtn}>❌ Cancel</button>
                </div>
              </form>
            </div>
          )}

          {/* Loading State or List */}
          {loadingData ? (
            <p style={{textAlign: 'center'}}>⏳ Loading market data...</p>
          ) : (
            crops.map((item) => (
              <div key={item.id} style={cardStyle}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 5px 0' }}>{item.crop}</h3>
                  <p>Qty: <strong>{item.qty}</strong> | Price: <span style={{ color: 'green' }}>{item.price}</span></p>
                  <p style={{ fontSize: '12px', color: '#666' }}>📍 {item.location} | 👤 {item.seller}</p>
                  <button onClick={() => openMap(item.lat, item.lng)} style={mapLinkStyle}>🗺️ Get Directions</button>
                </div>
                <button style={callBtn}>📞 Call</button>
              </div>
            ))
          )}
        </>
      )}
      
      {activeTab === 'buy' && <p style={{ textAlign: 'center' }}>🛒 Marketplace coming soon!</p>}
    </div>
  );
}

// STYLES (Same as before)
const cardStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', borderLeft: '5px solid #FBC02D', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' };
const formCard = { backgroundColor: '#fff9c4', padding: '20px', borderRadius: '10px', border: '2px dashed #FBC02D', marginBottom: '20px' };
const activeBtn = { padding: '10px 20px', backgroundColor: '#FBC02D', color: 'black', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' };
const inactiveBtn = { padding: '10px 20px', backgroundColor: '#ddd', color: '#333', border: 'none', borderRadius: '20px', cursor: 'pointer' };
const callBtn = { padding: '8px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginLeft: '10px' };
const postBtn = { width: '100%', padding: '15px', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '8px', marginBottom: '20px', cursor: 'pointer', fontSize: '16px' };
const inputStyle = { padding: '10px', borderRadius: '5px', border: '1px solid #ccc' };
const submitBtn = { flex: 1, padding: '10px', backgroundColor: '#2E7D32', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' };
const cancelBtn = { flex: 1, padding: '10px', backgroundColor: '#d32f2f', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' };
const locBtn = { padding: '10px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' };
const mapLinkStyle = { background: 'none', border: 'none', color: '#2196F3', cursor: 'pointer', textDecoration: 'underline', fontSize: '13px', marginTop: '5px', padding: 0 };

export default Business;