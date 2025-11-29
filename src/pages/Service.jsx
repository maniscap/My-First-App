import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

function Service() {
  const [activeTab, setActiveTab] = useState('machinery');
  const [showForm, setShowForm] = useState(false);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingLoc, setIsLoadingLoc] = useState(false); // For the "Locating..." spinner

  // Form Data (Now includes lat/lng)
  const [newService, setNewService] = useState({
    name: '', contact: '', rate: '', location: '', category: 'machinery', lat: null, lng: null
  });

  // --- 1. FETCH DATA ---
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "services"));
        const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setServices(list);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching services:", error);
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  // --- 2. GET LIVE LOCATION (GPS) ---
  const getLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported.");
      return;
    }
    setIsLoadingLoc(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      
      // Save coordinates
      setNewService(prev => ({ ...prev, lat: lat, lng: lon }));

      try {
        // Get address name
        const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
        const data = await response.json();
        const detailedLoc = `${data.locality || data.city}, ${data.principalSubdivision}`;
        setNewService(prev => ({ ...prev, location: detailedLoc }));
      } catch (error) {
        setNewService(prev => ({ ...prev, location: "GPS Location Locked" }));
      }
      setIsLoadingLoc(false);
    }, () => {
      alert("Unable to retrieve location.");
      setIsLoadingLoc(false);
    });
  };

  // --- 3. OPEN GOOGLE MAPS ---
  const openMap = (lat, lng) => {
    if (lat && lng) window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
    else alert("No GPS data available for this listing.");
  };

  // --- 4. SEND TO CLOUD ---
  const handlePost = async (e) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, "services"), {
        name: newService.name,
        contact: newService.contact,
        rate: newService.rate,
        location: newService.location,
        category: activeTab,
        lat: newService.lat,
        lng: newService.lng,
        createdAt: new Date()
      });

      const newItem = { id: docRef.id, ...newService, category: activeTab };
      setServices([newItem, ...services]);

      setNewService({ name: '', contact: '', rate: '', location: '', category: 'machinery', lat: null, lng: null });
      setShowForm(false);
      alert("Success! Service Listed with GPS 🌍");
    } catch (error) {
      alert("Error saving to cloud");
    }
  };

  const filteredServices = services.filter(item => item.category === activeTab);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', paddingBottom: '80px' }}>
      <Link to="/" style={{ textDecoration: 'none', color: '#555' }}>⬅ Back to Home</Link>
      <h1 style={{ color: '#E65100', textAlign: 'center' }}>🛠️ Service Hub</h1>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '30px' }}>
        <button onClick={() => setActiveTab('machinery')} style={activeTab === 'machinery' ? activeBtn : inactiveBtn}>🚜 Rent Machinery</button>
        <button onClick={() => setActiveTab('labor')} style={activeTab === 'labor' ? activeBtn : inactiveBtn}>👷‍♀️ Hire Labor</button>
      </div>

      {!showForm && (
        <button onClick={() => setShowForm(true)} style={postBtn}>
          {activeTab === 'machinery' ? "➕ List Your Machine" : "➕ List Yourself as Worker"}
        </button>
      )}

      {showForm && (
        <div style={formCard}>
          <h3>{activeTab === 'machinery' ? "🚜 Machine Details" : "👷‍♀️ Worker Details"}</h3>
          <form onSubmit={handlePost} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input type="text" placeholder={activeTab === 'machinery' ? "Machine Name" : "Worker Name / Skill"} 
              required style={inputStyle} value={newService.name} onChange={(e) => setNewService({...newService, name: e.target.value})} />
            
            <input type="text" placeholder="Rate (e.g. ₹800/hr)" 
              required style={inputStyle} value={newService.rate} onChange={(e) => setNewService({...newService, rate: e.target.value})} />
            
            <input type="tel" placeholder="Contact Number" 
              required style={inputStyle} value={newService.contact} onChange={(e) => setNewService({...newService, contact: e.target.value})} />

            {/* LOCATION WITH GPS BUTTON */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <input type="text" placeholder="Location" required style={{...inputStyle, flex: 1}} 
                value={newService.location} onChange={(e) => setNewService({...newService, location: e.target.value})} />
              <button type="button" onClick={getLocation} style={locBtn}>
                {isLoadingLoc ? "⏳" : "📍 GPS"}
              </button>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" style={submitBtn}>✅ Post</button>
              <button type="button" onClick={() => setShowForm(false)} style={cancelBtn}>❌ Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gap: '15px' }}>
        {loading ? (
          <p style={{ textAlign: 'center' }}>⏳ Loading services...</p>
        ) : (
          filteredServices.map((item) => (
            <div key={item.id} style={cardStyle}>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 5px 0' }}>{item.name}</h3>
                <p><strong>Rate:</strong> <span style={{ color: 'green', fontWeight: 'bold' }}>{item.rate}</span></p>
                <p style={{ fontSize: '12px', color: '#666' }}>📍 {item.location}</p>
                <button onClick={() => openMap(item.lat, item.lng)} style={mapLinkStyle}>🗺️ Get Directions</button>
              </div>
              <button onClick={() => alert(`Calling ${item.contact}...`)} style={callBtn}>📞 Call</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Styles
const cardStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', borderLeft: '5px solid #E65100', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const formCard = { backgroundColor: '#fff3e0', padding: '20px', borderRadius: '10px', border: '2px dashed #E65100', marginBottom: '20px' };
const activeBtn = { padding: '10px 20px', backgroundColor: '#E65100', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' };
const inactiveBtn = { padding: '10px 20px', backgroundColor: '#ddd', color: '#333', border: 'none', borderRadius: '20px', cursor: 'pointer' };
const callBtn = { padding: '8px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginLeft: '10px' };
const postBtn = { width: '100%', padding: '15px', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '8px', marginBottom: '20px', cursor: 'pointer', fontSize: '16px' };
const inputStyle = { padding: '10px', borderRadius: '5px', border: '1px solid #ccc' };
const submitBtn = { flex: 1, padding: '10px', backgroundColor: '#2E7D32', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' };
const cancelBtn = { flex: 1, padding: '10px', backgroundColor: '#d32f2f', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' };
const locBtn = { padding: '10px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' };
const mapLinkStyle = { background: 'none', border: 'none', color: '#2196F3', cursor: 'pointer', textDecoration: 'underline', fontSize: '13px', marginTop: '5px', padding: 0 };

export default Service;