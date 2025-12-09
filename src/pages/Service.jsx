import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

function Service() {
  const [bgImage, setBgImage] = useState('');
  const dayBg = 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2940&auto=format&fit=crop';
  const nightBg = 'https://images.unsplash.com/photo-1504333638930-c8787321eee0?q=80&w=2070&auto=format&fit=crop';

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 18 || hour < 6) setBgImage(nightBg);
    else setBgImage(dayBg);
  }, []);

  const [activeTab, setActiveTab] = useState('machinery');
  const [showForm, setShowForm] = useState(false);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingLoc, setIsLoadingLoc] = useState(false);
  const [userFilterLoc, setUserFilterLoc] = useState(''); // Stores the user's Dashboard location

  // Added 'image'
  const [newService, setNewService] = useState({ name: '', phone: '', rate: '', location: '', category: 'machinery', image: '' });

  // 1. Get User Location from Memory
  useEffect(() => {
    const savedLoc = localStorage.getItem('userLocation');
    if (savedLoc && savedLoc !== 'Select Location') {
      setUserFilterLoc(savedLoc);
    }
  }, []);

  // 2. Fetch Data
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "services"));
        const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setServices(list);
        setLoading(false);
      } catch (error) { console.error("Error:", error); setLoading(false); }
    };
    fetchServices();
  }, []);

  // 3. Filter Logic
  const filteredServices = services.filter(item => {
    // Match Category
    if (item.category !== activeTab) return false;
    
    // Match Location (Smart Search)
    // If no user location is set, show everything.
    if (!userFilterLoc) return true;
    
    // If set, verify if listing location includes user location (or vice versa)
    // Example: User="Pune", Item="Pune City" -> MATCH
    const itemLoc = item.location ? item.location.toLowerCase() : "";
    const userLoc = userFilterLoc.toLowerCase();
    return itemLoc.includes(userLoc) || userLoc.includes(itemLoc);
  });

  const getLocation = () => {
    if (!navigator.geolocation) { alert("Geolocation not supported"); return; }
    setIsLoadingLoc(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      try {
        const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
        const data = await response.json();
        setNewService(prev => ({ ...prev, location: `${data.locality || data.city}, ${data.principalSubdivision}` }));
      } catch (error) { setNewService(prev => ({ ...prev, location: "GPS Locked" })); }
      setIsLoadingLoc(false);
    }, () => { alert("Check phone GPS settings."); setIsLoadingLoc(false); }, {enableHighAccuracy:true, timeout:10000});
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) { alert("Image too large! Max 1MB."); return; }
      const reader = new FileReader();
      reader.onloadend = () => setNewService({ ...newService, image: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const handlePost = async (e) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, "services"), { ...newService, category: activeTab, createdAt: new Date() });
      setServices([{ id: docRef.id, ...newService, category: activeTab }, ...services]);
      setNewService({ name: '', phone: '', rate: '', location: '', category: 'machinery', image: '' });
      setShowForm(false);
      alert("Service Listed! 🛠️");
    } catch (error) { alert("Error saving."); }
  };

  return (
    <div style={{...pageStyle, backgroundImage: `url('${bgImage}')`}}>
      <div style={contentContainer}>
        <Link to="/dashboard" style={backLink}>⬅ Dashboard</Link>
        <h1 style={titleStyle}>🛠️ Service Hub</h1>
        
        {/* LOCATION FILTER INDICATOR */}
        <div style={{textAlign:'center', marginBottom:'15px', color:'lightgreen', fontSize:'14px', background:'rgba(0,0,0,0.6)', padding:'5px', borderRadius:'10px'}}>
          {userFilterLoc ? `📍 Showing results for: ${userFilterLoc}` : "🌍 Showing all locations (Set location in Dashboard)"}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '20px' }}>
          <button onClick={() => setActiveTab('machinery')} style={activeTab === 'machinery' ? activeBtn : inactiveBtn}>🚜 Machinery</button>
          <button onClick={() => setActiveTab('labor')} style={activeTab === 'labor' ? activeBtn : inactiveBtn}>👷‍♀️ Labor</button>
        </div>

        {!showForm && (
          <button onClick={() => setShowForm(true)} style={postBtn}>
            {activeTab === 'machinery' ? "➕ List Machine" : "➕ List Worker"}
          </button>
        )}

        {showForm && (
          <div style={glassCard}>
            <h3 style={{marginTop:0, color: '#E65100'}}>List Service</h3>
            <form onSubmit={handlePost} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              
              {/* IMAGE INPUT */}
              <div style={{border:'1px dashed #ccc', padding:'10px', borderRadius:'8px', textAlign:'center', backgroundColor:'rgba(255,255,255,0.5)'}}>
                <label style={{cursor:'pointer', fontSize:'14px', color:'#E65100', fontWeight:'bold'}}>
                  📷 Upload Photo
                  <input type="file" accept="image/*" onChange={handleImageUpload} style={{display:'none'}} />
                </label>
                {newService.image && <img src={newService.image} alt="Preview" style={{display:'block', margin:'10px auto', width:'80px', height:'80px', objectFit:'cover', borderRadius:'8px'}} />}
              </div>

              <input type="text" placeholder="Name / Title" required style={inputStyle} value={newService.name} onChange={(e) => setNewService({...newService, name: e.target.value})} />
              <input type="text" placeholder="Rate (e.g. ₹800/hr)" required style={inputStyle} value={newService.rate} onChange={(e) => setNewService({...newService, rate: e.target.value})} />
              <input type="tel" placeholder="Phone Number" required style={inputStyle} value={newService.phone} onChange={(e) => setNewService({...newService, phone: e.target.value})} />
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="text" placeholder="Location" required style={{...inputStyle, flex: 1}} value={newService.location} onChange={(e) => setNewService({...newService, location: e.target.value})} />
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
          {loading ? <p style={{textAlign:'center', color:'white'}}>⏳ Loading Services...</p> : 
            filteredServices.length > 0 ? (
              filteredServices.map((item) => (
                <div key={item.id} style={glassItem}>
                  {/* DISPLAY IMAGE */}
                  {item.image ? (
                    <img src={item.image} alt="Service" style={{width:'70px', height:'70px', borderRadius:'10px', objectFit:'cover', marginRight:'15px', border:'1px solid white'}} />
                  ) : (
                    <div style={{width:'70px', height:'70px', borderRadius:'10px', background:'rgba(255,255,255,0.3)', marginRight:'15px', display:'flex', alignItems:'center', justifyContent:'center'}}>🛠️</div>
                  )}
                  <div style={{flex: 1}}>
                    <h3 style={{ margin: '0 0 5px 0', color: '#E65100' }}>{item.name}</h3>
                    <p style={{fontSize: '14px', margin:'2px 0'}}><strong>Rate:</strong> <span style={{ color: 'lightgreen', fontWeight: 'bold' }}>{item.rate}</span></p>
                    <p style={{ fontSize: '12px', color: '#ddd' }}>📍 {item.location}</p>
                  </div>
                  <a href={`tel:${item.phone}`} style={callBtn}>📞 Call</a>
                </div>
              ))
            ) : (
              <div style={{textAlign:'center', color:'white', background:'rgba(0,0,0,0.5)', padding:'20px', borderRadius:'15px'}}>
                <p>No services found in <strong>{userFilterLoc}</strong>.</p>
                <button onClick={() => setUserFilterLoc('')} style={{padding:'8px 15px', marginTop:'5px', borderRadius:'20px', border:'none', cursor:'pointer'}}>🌍 Show All Locations</button>
              </div>
            )
          }
        </div>
      </div>
    </div>
  );
}

// STYLES (Keep existing styles)
const pageStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: 'black', overflowY: 'auto' };
const contentContainer = { padding: '20px', maxWidth: '800px', margin: '0 auto', paddingBottom: '100px', paddingTop: '20px' };
const backLink = { color: 'white', textDecoration: 'none', fontSize: '14px', background: 'rgba(0,0,0,0.5)', padding: '8px 15px', borderRadius: '20px', backdropFilter: 'blur(5px)' };
const titleStyle = { color: 'white', textAlign: 'center', marginTop: '15px', textShadow: '0 2px 4px rgba(0,0,0,0.8)', fontWeight: '900', marginBottom: '20px' };
const glassCard = { backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: '20px', borderRadius: '20px', marginBottom: '20px', boxShadow: '0 8px 32px 0 rgba(0,0,0,0.3)' };
const glassItem = { backgroundColor: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', padding: '10px', borderRadius: '15px', display: 'flex', alignItems: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', color: 'white' };
const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #ccc', width: '100%', boxSizing: 'border-box', fontSize: '16px' };
const activeBtn = { padding: '10px 20px', backgroundColor: '#E65100', color: 'white', border: 'none', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer' };
const inactiveBtn = { padding: '10px 20px', backgroundColor: 'rgba(255,255,255,0.3)', color: 'white', border: '1px solid white', borderRadius: '20px', cursor: 'pointer' };
const postBtn = { width: '100%', padding: '15px', backgroundColor: 'white', color: '#E65100', border: 'none', borderRadius: '10px', marginBottom: '20px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', fontSize: '16px' };
const submitBtn = { flex: 1, padding: '12px', backgroundColor: '#2E7D32', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const cancelBtn = { flex: 1, padding: '12px', backgroundColor: '#d32f2f', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const locBtn = { padding: '10px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' };
const callBtn = { textDecoration: 'none', padding: '10px 15px', backgroundColor: '#28a745', color: 'white', borderRadius: '50px', fontSize: '13px', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', marginLeft: '10px' };

export default Service;