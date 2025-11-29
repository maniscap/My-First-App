import React, { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";

function ChatBot() {
  // --- PASTE YOUR NEW "FARMCAP" KEY HERE ---
  const API_KEY = "AIzaSyDBwateOypcFZh63ZJEe428ecaDxekFp2Y"; 

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello! I am connected to Google Gemini. Ask me anything!", sender: "bot" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    // 1. Add User Message
    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput(""); 
    setIsLoading(true);

    try {
      // 2. Connect to Real AI
      const genAI = new GoogleGenerativeAI(API_KEY);
      
      // Using the latest Flash model for speed
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

      // 3. Send Request
      const result = await model.generateContent(input);
      const response = await result.response;
      const text = response.text();

      // 4. Show AI Response
      setMessages((prev) => [...prev, { text: text, sender: "bot" }]);
    } catch (error) {
      console.error("AI Error:", error);
      // If this shows up, it means the Key or Connection failed
      setMessages((prev) => [...prev, { text: "⚠️ Connection Error: " + error.message, sender: "bot" }]);
    }
    setIsLoading(false);
  };

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
      {isOpen && (
        <div style={chatWindowStyle}>
          <div style={headerStyle}>
            <span>🤖 AI Farm Assistant</span>
            <button onClick={() => setIsOpen(false)} style={closeBtn}>✖</button>
          </div>
          <div style={bodyStyle}>
            {messages.map((msg, i) => (
              <div key={i} style={{ textAlign: msg.sender === 'bot' ? 'left' : 'right', marginBottom: '10px' }}>
                <span style={msg.sender === 'bot' ? botMsgStyle : userMsgStyle}>{msg.text}</span>
              </div>
            ))}
            {isLoading && <div style={{color: '#888'}}>Thinking... 🤔</div>}
          </div>
          <div style={footerStyle}>
            <input type="text" placeholder="Ask anything..." style={inputStyle} 
              value={input} onChange={(e) => setInput(e.target.value)} 
              onKeyPress={(e) => e.key === 'Enter' && handleSend()} />
            <button onClick={handleSend} style={sendBtn}>🚀</button>
          </div>
        </div>
      )}
      {!isOpen && <button onClick={() => setIsOpen(true)} style={floatBtnStyle}>🤖 Ask AI</button>}
    </div>
  );
}

// STYLES
const floatBtnStyle = { backgroundColor: '#2E7D32', color: 'white', border: 'none', borderRadius: '50px', padding: '15px 25px', fontSize: '16px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.3)', fontWeight: 'bold' };
const chatWindowStyle = { width: '320px', height: '450px', backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 5px 15px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', overflow: 'hidden' };
const headerStyle = { backgroundColor: '#2E7D32', color: 'white', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold' };
const closeBtn = { background: 'none', border: 'none', color: 'white', fontSize: '16px', cursor: 'pointer' };
const bodyStyle = { flex: 1, padding: '15px', overflowY: 'auto', backgroundColor: '#f4f4f4' };
const footerStyle = { padding: '10px', borderTop: '1px solid #ddd', backgroundColor: 'white', display: 'flex', gap: '5px' };
const inputStyle = { flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ddd', outline: 'none' };
const sendBtn = { backgroundColor: '#2E7D32', color: 'white', border: 'none', borderRadius: '5px', padding: '10px 15px', cursor: 'pointer' };
const botMsgStyle = { backgroundColor: 'white', color: 'black', padding: '10px', borderRadius: '15px 15px 15px 0', display: 'inline-block', fontSize: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', maxWidth: '80%' };
const userMsgStyle = { backgroundColor: '#2E7D32', color: 'white', padding: '10px', borderRadius: '15px 0 15px 15px', display: 'inline-block', fontSize: '14px', maxWidth: '80%' };

export default ChatBot;