import React, { useState } from 'react';

function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello! I am your Farm Assistant. How can I help?", sender: "bot" }
  ]);

  // These are the "Smart Options" the user can click
  const options = [
    { label: "📈 Market Rates", answer: "Today's rates: Wheat ₹2200/q, Rice ₹1950/q. Check the Enquiry tab for more!" },
    { label: "🚜 Rent Tractor", answer: "You can rent tractors in the Service tab. Prices start at ₹800/hour." },
    { label: "🌦️ Weather", answer: "It looks sunny today! Perfect for harvesting." },
    { label: "📞 Support", answer: "Call our helpline at 1800-FARM-CAP." }
  ];

  const handleOptionClick = (option) => {
    // 1. Add User's click as a message
    const newMessages = [...messages, { text: option.label, sender: "user" }];
    setMessages(newMessages);

    // 2. Add Bot's answer (Simulating AI delay)
    setTimeout(() => {
      setMessages((prev) => [...prev, { text: option.answer, sender: "bot" }]);
    }, 500);
  };

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
      
      {/* The Chat Window (Only shows if isOpen is true) */}
      {isOpen && (
        <div style={chatWindowStyle}>
          <div style={headerStyle}>
            <span>🤖 Farm Assistant</span>
            <button onClick={() => setIsOpen(false)} style={closeBtn}>✖</button>
          </div>

          <div style={bodyStyle}>
            {messages.map((msg, index) => (
              <div key={index} style={{ textAlign: msg.sender === 'bot' ? 'left' : 'right', marginBottom: '10px' }}>
                <span style={msg.sender === 'bot' ? botMsgStyle : userMsgStyle}>
                  {msg.text}
                </span>
              </div>
            ))}
          </div>

          <div style={footerStyle}>
            <p style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Ask me about:</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {options.map((opt, i) => (
                <button key={i} onClick={() => handleOptionClick(opt)} style={optionBtn}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* The Floating Button (Always visible) */}
      {!isOpen && (
        <button onClick={() => setIsOpen(true)} style={floatBtnStyle}>
          💬 Help
        </button>
      )}
    </div>
  );
}

// STYLES
const floatBtnStyle = {
  backgroundColor: '#2E7D32', color: 'white', border: 'none', borderRadius: '50px', padding: '15px 25px', fontSize: '16px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.3)', fontWeight: 'bold'
};

const chatWindowStyle = {
  width: '300px', height: '400px', backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 5px 15px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', overflow: 'hidden'
};

const headerStyle = {
  backgroundColor: '#2E7D32', color: 'white', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold'
};

const closeBtn = { background: 'none', border: 'none', color: 'white', fontSize: '16px', cursor: 'pointer' };

const bodyStyle = { flex: 1, padding: '10px', overflowY: 'auto', backgroundColor: '#f9f9f9' };

const footerStyle = { padding: '10px', borderTop: '1px solid #ddd', backgroundColor: 'white' };

const botMsgStyle = { backgroundColor: '#e0e0e0', color: 'black', padding: '8px 12px', borderRadius: '15px 15px 15px 0', display: 'inline-block', fontSize: '14px' };

const userMsgStyle = { backgroundColor: '#4CAF50', color: 'white', padding: '8px 12px', borderRadius: '15px 15px 0 15px', display: 'inline-block', fontSize: '14px' };

const optionBtn = { backgroundColor: 'white', border: '1px solid #2E7D32', color: '#2E7D32', borderRadius: '15px', padding: '5px 10px', fontSize: '12px', cursor: 'pointer' };

export default ChatBot;