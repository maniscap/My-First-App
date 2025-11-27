import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Service() {
  // We use "State" to remember which tab is open (Machinery or Labor)
  const [activeTab, setActiveTab] = useState('machinery');

  // MOCK DATA: Machinery
  const machines = [
    { id: 1, name: "Mahindra Tractor 575", owner: "Ramesh Kumar", rate: "₹800 / hour", location: "Nellore", phone: "9876543210" },
    { id: 2, name: "Paddy Harvester", owner: "Suresh Reddy", rate: "₹2,500 / acre", location: "Guntur", phone: "9123456789" },
    { id: 3, name: "Rotavator", owner: "Krishna Rao", rate: "₹500 / hour", location: "Vijayawada", phone: "9988776655" },
  ];

  // MOCK DATA: Laborers
  const workers = [
    { id: 1, name: "Raju & Team (5 members)", skill: "Sowing / Planting", rate: "₹4,000 / day", location: "Nellore" },
    { id: 2, name: "Lakshmi", skill: "Weeding / Daily Wage", rate: "₹400 / day", location: "Guntur" },
    { id: 3, name: "Harvesting Gang (10 members)", skill: "Cutting & Threshing", rate: "₹8,000 / day", location: "Ongole" },
  ];

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <Link to="/" style={{ textDecoration: 'none', color: '#555' }}>⬅ Back to Home</Link>
      
      <h1 style={{ color: '#E65100', textAlign: 'center' }}>🛠️ Service Hub</h1>
      <p style={{ textAlign: 'center', color: '#666' }}>Find machinery or hire workers instantly.</p>

      {/* The Toggle Buttons */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '30px' }}>
        <button 
          onClick={() => setActiveTab('machinery')}
          style={activeTab === 'machinery' ? activeBtn : inactiveBtn}
        >
          🚜 Rent Machinery
        </button>
        <button 
          onClick={() => setActiveTab('labor')}
          style={activeTab === 'labor' ? activeBtn : inactiveBtn}
        >
          👷‍♀️ Hire Labor
        </button>
      </div>

      {/* The List Display */}
      <div style={{ display: 'grid', gap: '15px' }}>
        {activeTab === 'machinery' ? (
          // Show Machines
          machines.map((item) => (
            <div key={item.id} style={cardStyle}>
              <h3>{item.name}</h3>
              <p><strong>Owner:</strong> {item.owner}</p>
              <p><strong>Rate:</strong> <span style={{ color: 'green', fontWeight: 'bold' }}>{item.rate}</span></p>
              <p><strong>Location:</strong> {item.location}</p>
              <button onClick={() => alert(`Calling ${item.owner}: ${item.phone}`)} style={callBtn}>📞 Call Owner</button>
            </div>
          ))
        ) : (
          // Show Workers
          workers.map((item) => (
            <div key={item.id} style={cardStyle}>
              <h3>{item.name}</h3>
              <p><strong>Skill:</strong> {item.skill}</p>
              <p><strong>Rate:</strong> <span style={{ color: 'green', fontWeight: 'bold' }}>{item.rate}</span></p>
              <p><strong>Location:</strong> {item.location}</p>
              <button onClick={() => alert("Contacting Worker...")} style={callBtn}>📞 Hire Now</button>
            </div>
          ))
        )}
      </div>

    </div>
  );
}

// Styling Variables
const cardStyle = {
  backgroundColor: 'white',
  padding: '20px',
  borderRadius: '10px',
  boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  borderLeft: '5px solid #E65100',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap'
};

const activeBtn = {
  padding: '10px 20px', backgroundColor: '#E65100', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold'
};

const inactiveBtn = {
  padding: '10px 20px', backgroundColor: '#ddd', color: '#333', border: 'none', borderRadius: '20px', cursor: 'pointer'
};

const callBtn = {
  padding: '8px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginLeft: 'auto'
};

export default Service;