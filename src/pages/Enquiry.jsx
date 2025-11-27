import React from 'react';
import { Link } from 'react-router-dom';

function Enquiry() {
  // 1. This is our "Mock Data" (Pretend Database)
  const marketRates = [
    { id: 1, crop: "Wheat 🌾", price: "₹2,200 / quintal", trend: "⬆ Up" },
    { id: 2, crop: "Rice 🍚", price: "₹1,950 / quintal", trend: "⬌ Stable" },
    { id: 3, crop: "Cotton ☁️", price: "₹6,300 / quintal", trend: "⬇ Down" },
    { id: 4, crop: "Corn 🌽", price: "₹1,800 / quintal", trend: "⬆ Up" },
  ];

  const videos = [
    { id: 1, title: "Modern Sowing Techniques", duration: "10 min" },
    { id: 2, title: "Organic Fertilizer Guide", duration: "15 min" },
    { id: 3, title: "Tractor Maintenance 101", duration: "8 min" },
  ];

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <Link to="/" style={{ textDecoration: 'none', color: '#555' }}>⬅ Back to Home</Link>
      
      <h1 style={{ color: '#2E7D32', textAlign: 'center' }}>📢 Enquiry & Knowledge Hub</h1>

      {/* Section 1: Market Rates */}
      <div style={cardStyle}>
        <h2>📈 Daily Market Rates</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#eee', textAlign: 'left' }}>
              <th style={{ padding: '10px' }}>Crop</th>
              <th style={{ padding: '10px' }}>Price</th>
              <th style={{ padding: '10px' }}>Trend</th>
            </tr>
          </thead>
          <tbody>
            {marketRates.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '10px' }}>{item.crop}</td>
                <td style={{ padding: '10px', fontWeight: 'bold' }}>{item.price}</td>
                <td style={{ padding: '10px', color: item.trend.includes('Up') ? 'green' : 'red' }}>
                  {item.trend}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Section 2: Video References */}
      <div style={cardStyle}>
        <h2>🎥 Video References</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
          {videos.map((vid) => (
            <div key={vid.id} style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px', textAlign: 'center', border: '1px solid #ddd' }}>
              <div style={{ fontSize: '40px' }}>▶️</div>
              <strong>{vid.title}</strong>
              <p style={{ fontSize: '12px', color: '#666' }}>{vid.duration}</p>
              <button style={{ padding: '5px 10px', background: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Watch</button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

// Simple styling for the boxes
const cardStyle = {
  backgroundColor: 'white',
  padding: '20px',
  borderRadius: '10px',
  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  marginBottom: '30px',
  color: '#333'
};

export default Enquiry;