import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Business() {
  const [activeTab, setActiveTab] = useState('sell');

  // MOCK DATA: Crops farmers are selling
  const cropListings = [
    { id: 1, crop: "Organic Turmeric", qty: "50 Quintals", price: "₹6,000 / q", seller: "Ravi Varma", location: "Guntur", phone: "9876500001" },
    { id: 2, crop: "Sona Masoori Rice", qty: "100 Bags", price: "₹1,200 / bag", seller: "Anitha Devi", location: "Nellore", phone: "9876500002" },
    { id: 3, crop: "Red Chillies (High Spice)", qty: "20 Quintals", price: "₹18,000 / q", seller: "Prasad Rao", location: "Warangal", phone: "9876500003" },
  ];

  // MOCK DATA: Products to buy
  const products = [
    { id: 1, item: "Natural Honey", price: "₹500 / litre", seller: "Bee Farms Ltd", available: "In Stock" },
    { id: 2, item: "Vermicompost", price: "₹200 / bag", seller: "Green Earth", available: "50 bags left" },
    { id: 3, item: "Neem Oil Pesticide", price: "₹350 / litre", seller: "Safe Crops", available: "In Stock" },
  ];

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', paddingBottom: '80px' }}>
      <Link to="/" style={{ textDecoration: 'none', color: '#555' }}>⬅ Back to Home</Link>
      
      <h1 style={{ color: '#FBC02D', textAlign: 'center', textShadow: '1px 1px 2px #333' }}>💰 Business Zone</h1>
      
      {/* Toggle Buttons */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '30px' }}>
        <button onClick={() => setActiveTab('sell')} style={activeTab === 'sell' ? activeBtn : inactiveBtn}>
          🌾 Crop Market
        </button>
        <button onClick={() => setActiveTab('buy')} style={activeTab === 'buy' ? activeBtn : inactiveBtn}>
          🛒 Buy Products
        </button>
      </div>

      {/* Content Area */}
      <div style={{ display: 'grid', gap: '15px' }}>
        {activeTab === 'sell' ? (
          <>
            <button style={postBtn}>➕ Sell Your Crop</button>
            {cropListings.map((item) => (
              <div key={item.id} style={cardStyle}>
                <div>
                  <h3 style={{ margin: '0 0 5px 0' }}>{item.crop}</h3>
                  <p style={{ margin: '5px 0' }}>Quantity: <strong>{item.qty}</strong></p>
                  <p style={{ margin: '5px 0' }}>Ask Price: <span style={{ color: 'green', fontWeight: 'bold' }}>{item.price}</span></p>
                  <p style={{ fontSize: '12px', color: '#666' }}>📍 {item.location} | 👤 {item.seller}</p>
                </div>
                <button onClick={() => alert(`Calling ${item.seller}...`)} style={callBtn}>📞 Call</button>
              </div>
            ))}
          </>
        ) : (
          products.map((item) => (
            <div key={item.id} style={cardStyle}>
              <div>
                <h3 style={{ margin: '0 0 5px 0' }}>{item.item}</h3>
                <p style={{ margin: '5px 0' }}>Price: <span style={{ color: 'green', fontWeight: 'bold' }}>{item.price}</span></p>
                <p style={{ fontSize: '12px', color: '#E65100' }}>{item.available} | Sold by {item.seller}</p>
              </div>
              <button style={callBtn}>🛒 Order</button>
            </div>
          ))
        )}
      </div>

      {/* The Disclaimer Footer (As per your note) */}
      <div style={{ marginTop: '50px', padding: '15px', background: '#ffebee', color: '#c62828', fontSize: '12px', textAlign: 'center', borderRadius: '8px', border: '1px solid #ffcdd2' }}>
        <strong>⚠️ DISCLAIMER:</strong> This app only connects buyers and farmers. We are NOT responsible for payments or quality of goods. Please verify before paying.
      </div>

    </div>
  );
}

// Styles
const cardStyle = {
  backgroundColor: 'white',
  padding: '20px',
  borderRadius: '10px',
  boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  borderLeft: '5px solid #FBC02D',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const activeBtn = { padding: '10px 20px', backgroundColor: '#FBC02D', color: 'black', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' };
const inactiveBtn = { padding: '10px 20px', backgroundColor: '#ddd', color: '#333', border: 'none', borderRadius: '20px', cursor: 'pointer' };
const callBtn = { padding: '8px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' };
const postBtn = { width: '100%', padding: '15px', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '8px', marginBottom: '20px', cursor: 'pointer', fontSize: '16px' };

export default Business;