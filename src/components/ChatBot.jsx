import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * 🌿 FARM BUDDY: ULTIMATE MOBILE EDITION (v29.0 - FINAL LOGIC)
 * ----------------------------------------------------------------
 * 🛠️ UPDATES:
 * 1. ADDED "X" BUTTON to Legal Modal.
 * 2. LOGIC: Clicking "X" as new user = Closes App (Reject).
 * 3. LOGIC: Clicking "X" as returning user = Closes Modal Only.
 * 4. Preserved 3-Page Legal Wizard & Mobile Dragging.
 */

function ChatBot() {
  // --- 🔐 CONFIGURATION ---
  const GROQ_KEY = import.meta.env.VITE_GROQ_KEY;
  const GEMINI_KEY = import.meta.env.VITE_GEMINI_KEY; 

  // --- ⚙️ AI MODEL PRIORITY ---
  const MODEL_QUEUE = [
    { provider: 'gemini', id: 'gemini-1.5-flash' },   
    { provider: 'gemini', id: 'gemini-1.5-pro' },     
    { provider: 'gemini', id: 'gemini-1.0-pro' }, 
    { provider: 'groq', id: 'llama-3.3-70b-versatile' }, 
    { provider: 'groq', id: 'llama-3.1-8b-instant' },    
  ];

  // --- 📝 STATE MANAGEMENT ---
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      text: "Hello! I am **Farm Buddy** 🧢🌾.\n\nI am powered by **Google Gemini & Llama 3**. I can diagnose crops and answer farming questions.\n\n*Please read and accept the mandatory Terms & Conditions to start.*", 
      sender: "bot" 
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Legal State
  const [termsAccepted, setTermsAccepted] = useState(() => {
    return typeof window !== "undefined" && localStorage.getItem('farmbuddy_terms_v29') === 'true';
  });
  const [showFullTerms, setShowFullTerms] = useState(false);
  const [legalPage, setLegalPage] = useState(1); // 1, 2, or 3

  // File Upload State
  const [uploadedFile, setUploadedFile] = useState(null);
  const [base64Image, setBase64Image] = useState(null); 

  // --- 🍏 MOBILE DRAGGABLE STATE ---
  const [position, setPosition] = useState({ x: window.innerWidth - 150, y: window.innerHeight - 100 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const dragOffset = useRef({ x: 0, y: 0 });

  // Auto-scroll
  const messagesEndRef = useRef(null);
  useEffect(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

  // --- 🖱️ MOUSE & TOUCH HANDLERS ---
  
  // 1. Mouse (Desktop)
  const handleMouseDown = (e) => {
    setIsDragging(false);
    dragOffset.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  const handleMouseMove = (e) => {
    setIsDragging(true); 
    e.preventDefault(); 
    setPosition({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y });
  };
  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // 2. Touch (Mobile)
  const handleTouchStart = (e) => {
    setIsDragging(false);
    const touch = e.touches[0];
    dragOffset.current = { x: touch.clientX - position.x, y: touch.clientY - position.y };
  };
  const handleTouchMove = (e) => {
    setIsDragging(true);
    if (e.cancelable) e.preventDefault(); 
    const touch = e.touches[0];
    setPosition({ x: touch.clientX - dragOffset.current.x, y: touch.clientY - dragOffset.current.y });
  };
  const handleTouchEnd = (e) => {
    // Logic handled in click
  };

  const handleClickButton = () => {
    if (!isDragging) {
       handleOpenChat();
    }
  };

  // --- 🔄 CHAT LOGIC ---
  const handleOpenChat = () => { 
      setIsOpen(true); 
      // STRICT: Always show terms if not accepted yet
      if (!termsAccepted) {
          setShowFullTerms(true);
          setLegalPage(1); 
      }
  };
  
  const handleCloseChat = () => { setIsOpen(false); setUploadedFile(null); setShowFullTerms(false); }

  // 🟢 NEW: HANDLE X BUTTON LOGIC
  const handleCloseTermsModal = () => {
      setShowFullTerms(false);
      // IF NEW USER (Terms not accepted) -> CLOSE THE APP TOO
      if (!termsAccepted) {
          setIsOpen(false);
      }
  };
  
  const handleAcceptTerms = () => {
      setTermsAccepted(true);
      setShowFullTerms(false);
      localStorage.setItem('farmbuddy_terms_v29', 'true');
  }

  const handleFileChange = async (event) => {
      const file = event.target.files[0];
      if (file) {
          setUploadedFile(file);
          const reader = new FileReader();
          reader.onloadend = () => {
             setBase64Image(reader.result.split(',')[1]);
          };
          reader.readAsDataURL(file);
          setInput(`Analyze this crop image. Identify pests, diseases, or deficiencies.`);
      }
  };

  const removeUploadedImage = () => { setUploadedFile(null); setBase64Image(null); setInput(""); }

  const handleSend = async () => {
    if (!termsAccepted) { setShowFullTerms(true); return; }
    if (!input.trim() && !uploadedFile) return;

    const userText = input.trim() || uploadedFile?.name || "Scan Request";
    setMessages(prev => [...prev, { text: userText, sender: "user", image: uploadedFile ? URL.createObjectURL(uploadedFile) : null }]);
    setInput(""); 
    setIsLoading(true);

    const systemInstruction = "You are Farm Buddy, an expert agricultural AI. Use Markdown. Be concise and accurate.";
    let finalResponse = "";
    let success = false;

    // --- AI LOOP ---
    for (const modelConfig of MODEL_QUEUE) {
        if (success) break; 
        if (base64Image && modelConfig.provider === 'groq') continue;

        try {
            if (modelConfig.provider === 'gemini') {
                if (!GEMINI_KEY) throw new Error("Missing Gemini Key");
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelConfig.id}:generateContent?key=${GEMINI_KEY}`;
                const parts = [{ text: `SYSTEM: ${systemInstruction}\nUSER: ${userText}` }];
                if (base64Image) parts.unshift({ inline_data: { mime_type: uploadedFile.type, data: base64Image } });

                const res = await fetch(url, {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ contents: [{ parts: parts }] })
                });
                if (!res.ok) throw new Error(`Gemini ${res.status}`);
                const data = await res.json();
                finalResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (finalResponse) success = true;

            } else if (modelConfig.provider === 'groq') {
                if (!GROQ_KEY) throw new Error("Missing Groq Key");
                const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                    method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_KEY}` },
                    body: JSON.stringify({
                        model: modelConfig.id,
                        messages: [{ role: "system", content: systemInstruction }, { role: "user", content: userText }],
                        temperature: 0.5
                    })
                });
                if (!res.ok) throw new Error(`Groq ${res.status}`);
                const data = await res.json();
                finalResponse = data.choices[0]?.message?.content;
                if (finalResponse) success = true;
            }
        } catch (error) {
            console.warn(`❌ ${modelConfig.id} Failed`);
        }
    }

    if (!success) finalResponse = `⚠️ **System Offline**: Please check internet or API keys.`;
    setMessages(prev => [...prev, { text: finalResponse, sender: "bot" }]);
    setIsLoading(false);
    setUploadedFile(null); setBase64Image(null);
  };

  // --- 📜 3-PAGE LEGAL AGREEMENT ---
  const FullTermsModal = () => (
      <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
              {/* HEADER WITH X BUTTON */}
              <div style={styles.modalHeader}>
                  <span>⚖️ TERMS & SAFETY ({legalPage}/3)</span>
                  <button onClick={handleCloseTermsModal} style={styles.modalDismissBtn}>✖</button>
              </div>
              
              <div style={styles.modalBody}>
                {/* --- PAGE 1: AI WARNING --- */}
                {legalPage === 1 && (
                    <>
                        <p style={styles.criticalNotice}>⚠️ STEP 1: UNDERSTAND THE AI RISKS</p>
                        <h4>1. AI MAKES MISTAKES</h4>
                        <p>You understand that this app uses <strong>Google Gemini and Groq Artificial Intelligence</strong>. These are experimental technologies. They frequently <strong>hallucinate, lie, or provide completely false information</strong> about farming chemicals, diseases, and market prices.</p>
                        <h4>2. NO BLIND TRUST</h4>
                        <p>You agree <strong>NEVER</strong> to blindly follow the advice given by this AI. You must verify every single suggestion with a certified human agricultural officer or a real-world expert.</p>
                        <h4>3. RESEARCH USE ONLY</h4>
                        <p>This tool is for educational and research purposes only. It is <strong>NOT</strong> a replacement for professional farming advice.</p>
                    </>
                )}

                {/* --- PAGE 2: MONEY & CROP LIABILITY --- */}
                {legalPage === 2 && (
                    <>
                        <p style={styles.criticalNotice}>💰 STEP 2: FINANCIAL LIABILITY WAIVER</p>
                        <h4>4. DEVELOPERS ARE NOT RESPONSIBLE</h4>
                        <p>The owners, developers, and hosting providers of "Farm Buddy" are <strong>NOT LIABLE</strong> for any consequences resulting from your use of this app. </p>
                        <h4>5. CROP LOSS & FINANCIAL DAMAGE</h4>
                        <p>If you use a pesticide or method suggested by this AI and your crops die, or you lose money, <strong>YOU CANNOT SUE US</strong>. You accept full 100% responsibility for your own farming decisions.</p>
                        <h4>6. "AS IS" CONDITION</h4>
                        <p>This software is provided "AS IS" without warranty of any kind. We do not guarantee the app will work, be accurate, or be safe.</p>
                    </>
                )}

                {/* --- PAGE 3: FINAL LEGAL AGREEMENT --- */}
                {legalPage === 3 && (
                    <>
                        <p style={styles.criticalNotice}>🛡️ STEP 3: FINAL LEGAL AGREEMENT</p>
                        <h4>7. THIRD PARTY PROVIDERS</h4>
                        <p>The answers are generated by Google and Groq, not us. We have no control over their servers or their data accuracy.</p>
                        <h4>8. USE AT YOUR OWN RISK</h4>
                        <p>By clicking "I Agree" below, you legally confirm that you are using this AI at your own risk. You waive all rights to take legal action against the creators for any reason whatsoever, including negligence.</p>
                        <h4>9. NOT MANDATORY</h4>
                        <p>Using this AI is not mandatory. If you do not agree to these risks, please close the app immediately.</p>
                        <hr style={{margin: '15px 0', borderColor: '#eee'}} />
                        <p><em>By clicking "I Agree", you sign this digital contract.</em></p>
                    </>
                )}
              </div>

              {/* NAVIGATION BUTTONS */}
              <div style={{padding: '15px', backgroundColor: '#f9f9f9', display: 'flex', gap: '10px'}}>
                  {legalPage > 1 && (
                      <button onClick={() => setLegalPage(p => p - 1)} style={styles.backNavBtn}>Back</button>
                  )}
                  {legalPage < 3 ? (
                      <button onClick={() => setLegalPage(p => p + 1)} style={styles.nextNavBtn}>
                          I UNDERSTAND (NEXT) →
                      </button>
                  ) : (
                      <button onClick={handleAcceptTerms} style={styles.acceptBtn}>
                          ✅ I AGREE TO ALL TERMS
                      </button>
                  )}
              </div>
          </div>
      </div>
  );

  return (
    <div style={{ fontFamily: '"Inter", sans-serif' }}>
      
      {/* 🟢 OPEN CHAT INTERFACE */}
      {isOpen && (
        <div style={styles.fullPageChat}>
          
          {/* HEADER */}
          <div style={styles.header}>
            <button onClick={handleCloseChat} style={styles.backBtn}>←</button>
            <div style={{textAlign: 'center'}}>
                <span style={{fontSize: '18px', fontWeight: 'bold'}}>🧢 Farm Buddy 🌾</span>
                <span style={{fontSize: '11px', color: '#81C784', display: 'block'}}>Professional AI Assistant</span>
            </div>
            <div style={{width: '24px'}}></div>
          </div>
          
          {/* CHAT BODY */}
          <div style={styles.chatBody}>
            {messages.map((msg, i) => (
              <div key={i} style={{ 
                  textAlign: msg.sender === 'bot' ? 'left' : 'right', marginBottom: '20px',
                  display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'bot' ? 'flex-start' : 'flex-end'
              }}>
                {msg.image && <img src={msg.image} alt="Upload" style={styles.msgImage} />}
                <div style={msg.sender === 'bot' ? styles.botBubble : styles.userBubble}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                </div>
              </div>
            ))}
            {isLoading && <div style={styles.loadingArea}>Thinking...</div>}
            <div ref={messagesEndRef} />
          </div>

          {/* FOOTER */}
          <div style={styles.footer}>
            <div style={{
                opacity: termsAccepted ? 1 : 0.4, 
                pointerEvents: termsAccepted ? 'auto' : 'none', 
                display: 'flex', gap: '10px', width: '100%'
            }}>
                <input type="file" accept="image/*" onChange={handleFileChange} style={{display:'none'}} id="cam-input" />
                <label htmlFor="cam-input" style={styles.iconLabel}>📸</label>

                <div style={{flex: 1, position: 'relative', display: 'flex', alignItems: 'center'}}>
                    <input 
                        type="text" 
                        placeholder={termsAccepted ? "Ask Farm Buddy..." : "⚠️ Accept Terms First"} 
                        style={styles.textInput} 
                        value={input} 
                        onChange={(e) => setInput(e.target.value)} 
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    />
                    {uploadedFile && <button onClick={removeUploadedImage} style={styles.badgeClose}>❌ Img</button>}
                </div>

                <button onClick={handleSend} style={styles.sendCircle}>➤</button>
            </div>
            
            {/* LEGAL FOOTER LINK */}
            <div style={styles.bottomWarning}>
                AI can make mistakes, so double-check it. 
                <span onClick={() => { setShowFullTerms(true); setLegalPage(1); }} style={styles.readMore}> Read Safety Terms ↗</span>
            </div>
          </div>
        </div>
      )}
      
      {/* 📜 LEGAL MODAL (Z-Index: 200000) */}
      {showFullTerms && <FullTermsModal />}

      {/* 🍏 DRAGGABLE CAPSULE (Touch Enabled) */}
      {!isOpen && (
          <div 
            onMouseDown={handleMouseDown}
            onClick={handleClickButton}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            
            style={{
                ...styles.capsuleButton, 
                left: `${position.x}px`, 
                top: `${position.y}px`,
                cursor: isDragging ? 'grabbing' : 'pointer',
                touchAction: 'none'
            }}
          >
              <span style={{fontSize: '24px', marginRight: '8px'}}>🧢</span>
              <span style={{fontSize: '14px', fontWeight: 'bold', color: 'white', whiteSpace: 'nowrap'}}>Farm Buddy</span>
          </div>
      )}
    </div>
  );
}

// --- 💅 STYLES ---
const styles = {
    capsuleButton: {
        position: 'fixed', padding: '12px 20px', borderRadius: '50px', backgroundColor: '#2E7D32',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 99999, userSelect: 'none', border: '2px solid white', minWidth: 'auto', transition: 'transform 0.1s', 
    },
    fullPageChat: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: '#131314', zIndex: 99999, display: 'flex', flexDirection: 'column' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 200000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    
    header: { backgroundColor: '#1E1F20', color: '#E3E3E3', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333' },
    backBtn: { background: 'none', border: 'none', color: 'white', fontSize: '26px', cursor: 'pointer' },
    chatBody: { flex: 1, padding: '20px', overflowY: 'auto', backgroundColor: '#131314' },
    botBubble: { backgroundColor: '#1E1F20', color: '#E3E3E3', padding: '14px 18px', borderRadius: '4px 20px 20px 20px', maxWidth: '88%', fontSize: '15px', lineHeight: '1.6', border: '1px solid #333' },
    userBubble: { backgroundColor: '#2E7D32', color: 'white', padding: '12px 18px', borderRadius: '20px 4px 20px 20px', maxWidth: '85%', fontSize: '15px' },
    
    footer: { backgroundColor: '#1E1F20', padding: '15px 15px 30px 15px', borderTop: '1px solid #333' },
    textInput: { width: '100%', padding: '14px 18px', borderRadius: '25px', border: '1px solid #444', backgroundColor: '#2D2D30', color: 'white', fontSize: '15px', outline: 'none' },
    iconLabel: { fontSize: '24px', cursor: 'pointer', color: '#9aa0a6' },
    sendCircle: { backgroundColor: '#2E7D32', color: 'white', border: 'none', borderRadius: '50%', width: '45px', height: '45px', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    badgeClose: { position: 'absolute', right: '10px', background: '#d32f2f', color: 'white', border: 'none', borderRadius: '4px', fontSize: '10px', padding: '2px 6px', cursor: 'pointer'},
    
    bottomWarning: { textAlign: 'center', color: '#9aa0a6', fontSize: '11px', marginTop: '12px' },
    readMore: { color: '#81C784', textDecoration: 'underline', cursor: 'pointer', fontWeight: 'bold', marginLeft: '5px' },
    criticalNotice: { color: '#D32F2F', fontWeight: 'bold', textAlign: 'center', fontSize: '14px', borderBottom: '1px solid #ddd', paddingBottom: '10px', marginBottom: '15px' },
    
    modalContent: { width: '90%', maxWidth: '500px', backgroundColor: '#fff', color: '#333', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' },
    // MODAL HEADER NOW FLEX FOR X BUTTON
    modalHeader: { padding: '15px 20px', backgroundColor: '#f5f5f5', borderBottom: '1px solid #ddd', fontSize: '16px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    modalBody: { padding: '20px', fontSize: '13px', lineHeight: '1.6', maxHeight: '55vh', overflowY: 'auto' },
    modalDismissBtn: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#555', lineHeight: '1' },
    
    acceptBtn: { width: '100%', padding: '15px', backgroundColor: '#2E7D32', color: 'white', border: 'none', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', borderRadius: '8px' },
    nextNavBtn: { flex: 1, padding: '15px', backgroundColor: '#333', color: 'white', border: 'none', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', borderRadius: '8px' },
    backNavBtn: { padding: '15px 20px', backgroundColor: '#eee', color: '#333', border: 'none', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', borderRadius: '8px' },
    
    msgImage: { maxWidth: '200px', borderRadius: '10px', marginBottom: '8px', border: '1px solid #444' },
    loadingArea: { color: '#9aa0a6', fontSize: '12px', marginLeft: '10px', marginTop: '10px' }
};

export default ChatBot;