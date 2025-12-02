import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

function Business() {
  const [activeTab, setActiveTab] = useState('sell');
  const [showForm, setShowForm] = useState(false);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState({ crop: '', qty: '', price: '', seller: '', location: '' });

  useEffect(() => {
    const fetchCrops = async () => {
      const querySnapshot = await getDocs(collection(db, "crops"));
      setCrops(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    };
    fetchCrops();
  }, []);

  // ... handlePost logic ...

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', paddingBottom: '80px', paddingTop: '100px' }}>
      <Link to="/dashboard" style={backLink}>⬅ Dashboard</Link>
      <h1 style={titleStyle}>💰 Business Zone</h1>

      {/* Tabs, Form, and List go here... */}
    </div>
  );
}

const backLink = { color: 'white', textDecoration: 'none', fontSize: '14px', background: 'rgba(0,0,0,0.5)', padding: '8px 15px', borderRadius: '20px', backdropFilter: 'blur(5px)' };
const titleStyle = { color: 'white', textAlign: 'center', marginTop: '20px', textShadow: '0 2px 4px rgba(0,0,0,0.8)', fontWeight: '900' };

export default Business;