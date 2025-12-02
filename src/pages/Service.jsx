import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

function Service() {
  const [activeTab, setActiveTab] = useState('machinery');
  const [showForm, setShowForm] = useState(false);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newService, setNewService] = useState({ name: '', contact: '', rate: '', location: '' });

  useEffect(() => {
    const fetchServices = async () => {
      const querySnapshot = await getDocs(collection(db, "services"));
      setServices(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    };
    fetchServices();
  }, []);

  // ... handlePost logic ...

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', paddingBottom: '80px', paddingTop: '100px' }}>
      <Link to="/dashboard" style={backLink}>⬅ Dashboard</Link>
      <h1 style={titleStyle}>🛠️ Service Hub</h1>

      {/* Tabs, Form, and List go here... */}
      {/* Copy the inner content from your previous Service.jsx, but keep this wrapper div */}
    </div>
  );
}

const backLink = { color: 'white', textDecoration: 'none', fontSize: '14px', background: 'rgba(0,0,0,0.5)', padding: '8px 15px', borderRadius: '20px', backdropFilter: 'blur(5px)' };
const titleStyle = { color: 'white', textAlign: 'center', marginTop: '20px', textShadow: '0 2px 4px rgba(0,0,0,0.8)', fontWeight: '900' };

export default Service;