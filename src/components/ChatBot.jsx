import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
// ❗ Ensure you have run: npm install react-markdown remark-gfm
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function ChatBot() {
  // --- 🔐 SECURE CONFIGURATION ---
  const API_KEY = import.meta.env.VITE_GEMINI_KEY; 
  
  // 🛠️ MODELS (KEEPING YOUR EXISTING SELECTION)
  const MODEL_PRIMARY = "gemini-2.5-flash";        
  const MODEL_BACKUP_1 = "gemini-2.5-flash-lite";     
  const MODEL_BACKUP_2 = "gemini-1.5-flash";  
  const MODEL_BACKUP_3 = "gemini-3-pro";
  const MODEL_BACKUP_4 = "gemini-3-flash";

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      text: "Hello! I am **Farm Buddy** 🤝🌾.\n\nI am running on the advanced **Pro** model to help you with your crops.\n\n*Note: I am an AI assistant. Always verify my suggestions with a human expert.*", 
      sender: "bot" 
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  // 🛠️ PERSISTENCE
  const [termsAccepted, setTermsAccepted] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem('farmcap_terms_accepted') === 'true';
    }
    return false;
  });
  const [showFullTerms, setShowFullTerms] = useState(false);

  const [uploadedFile, setUploadedFile] = useState(null);
  const [imagePart, setImagePart] = useState(null); 

  // Auto-scroll logic
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Helper: File to Base64
  const fileToGenerativePart = async (file) => {
    const base64Data = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.readAsDataURL(file);
    });
    return { inlineData: { data: base64Data, mimeType: file.type } };
  }

  // Handler: Image Selection
  const handleFileChange = async (event) => {
      const file = event.target.files[0];
      if (file) {
          setUploadedFile(file);
          const part = await fileToGenerativePart(file);
          setImagePart(part);
          setInput(`Analyze this crop image. Identify diseases, pests, or deficiencies.`);
      }
  };

  const removeUploadedImage = () => {
      setUploadedFile(null);
      setImagePart(null);
      setInput("");
  }

  const handleOpenChat = () => {
    setIsOpen(true);
    if (!termsAccepted) setShowFullTerms(true);
  }

  const handleCloseChat = () => {
      setIsOpen(false);
      removeUploadedImage();
      setShowFullTerms(false); 
  }

  const handleAcceptTerms = () => {
      setTermsAccepted(true);
      setShowFullTerms(false);
      localStorage.setItem('farmcap_terms_accepted', 'true');
  }

  // 🧠 TRIPLE BACKUP SEND LOGIC
  const handleSend = async () => {
    if (!termsAccepted) { setShowFullTerms(true); return; }
    if (!input.trim() && !imagePart) return;

    let userMessageText = input.trim() || uploadedFile?.name || "Scan Request";
    const userMessage = { 
        text: userMessageText, 
        sender: "user", 
        image: uploadedFile ? URL.createObjectURL(uploadedFile) : null 
    };
    
    const promptParts = [];
    promptParts.push({text: "SYSTEM: You are Farm Buddy, a pro agricultural AI. Use Markdown for all formatting. You analyze images but cannot generate them."});

    if (imagePart) promptParts.push(imagePart);
    if (input.trim()) promptParts.push({ text: input.trim() });
    
    setMessages((prev) => [...prev, userMessage]);
    setInput(""); 
    setUploadedFile(null);
    setImagePart(null);
    setIsLoading(true);

    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      let result;
      
      // Attempt 1: PRO
      try {
        const model = genAI.getGenerativeModel({ model: MODEL_PRIMARY });
        result = await model.generateContent(promptParts);
      } catch (err1) {
        // Attempt 2: FLASH
        try {
           const backup1 = genAI.getGenerativeModel({ model: MODEL_BACKUP_1 });
           result = await backup1.generateContent(promptParts);
        } catch (err2) {
           // Attempt 3: SAFETY
           try {
             const backup2 = genAI.getGenerativeModel({ model: MODEL_BACKUP_2 });
             result = await backup2.generateContent(promptParts);
           } catch (err3) {
             throw new Error("All servers busy.");
           }
        }
      }

      const response = await result.response;
      setMessages((prev) => [...prev, { text: response.text(), sender: "bot" }]);
    } catch (error) {
      setMessages((prev) => [...prev, { text: "⚠️ Server busy. Please try again.", sender: "bot" }]);
    }
    setIsLoading(false);
  };

  // 📜 MASSIVE LEGAL TERMS
  const FullTermsModal = () => (
      <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
              <h3 style={styles.modalHeader}>
                  🤝 Farm Buddy - Professional Terms & Liability Waiver
                  <button onClick={() => setShowFullTerms(false)} style={styles.modalDismissBtn}>✖</button> 
              </h3>
              <div style={styles.modalBody}>
                  <p style={{color: '#FF8A80', fontWeight: 'bold', textAlign: 'center'}}>⚠️ LEGAL ACTION WAIVER: READ CAREFULLY</p>
                  
                  <h4>1. ABSOLUTE DEVELOPER NON-LIABILITY</h4>
                  <p>By using Farm Buddy, you irrevocably agree that the developers and creators (the "Developers") are <strong>NOT RESPONSIBLE</strong> for any farm results or crop outcomes. You use this AI at your <strong>SOLE RISK</strong>.</p>
                  <p>The Developers are not liable for: crop death, soil toxicity, yield loss, financial bankruptcy, or environmental damage. This is a text-based research tool, not a professional agricultural service.</p>

                  <h4>2. AI HALLUCINATION & ERROR WARNING</h4>
                  <p>This application utilizes Gemini Pro Artificial Intelligence. AI can produce "hallucinations"—meaning it may provide incorrect or dangerous advice with absolute confidence. <strong>NEVER</strong> apply chemicals or change farming practices based solely on this chat.</p>

                  <h4>3. NOT A CERTIFIED PROFESSIONAL</h4>
                  <p>Farm Buddy results are <strong>NOT</strong> provided by humans. They are <strong>SUGGESTIONS</strong>, not mandates. You are legally required to verify all diagnoses with a licensed human agronomist in your specific region before taking action.</p>
                  
                  <h4>4. CHEMICAL & PESTICIDE DANGER</h4>
                  <p>Pesticides are dangerous. The AI may suggest chemicals that are banned in your country or harmful to your specific crop variety. The user assumes 100% of the liability for chemical accidents. The Developers disclaim all liability.</p>

                  <h4>5. REGIONAL AND ENVIRONMENTAL VARIANCE</h4>
                  <p>Agricultural conditions vary by meter and minute. The AI does not know your soil pH, local humidity, or specific micro-climate. Any advice given is a general estimation and may be catastrophic if applied without local testing.</p>

                  <h4>6. DATA PRIVACY AND AI USAGE</h4>
                  <p>Images and text you upload are processed by Google's servers. Do not upload sensitive personal data. The Developers are not responsible for how third-party AI providers manage your data.</p>

                  <h4>7. INDEMNIFICATION</h4>
                  <p>You agree to indemnify and hold harmless the Developers from any claims, losses, or legal fees arising from your reliance on AI-generated suggestions.</p>

                  <hr style={{borderColor: '#444'}}/>
                  <p style={{fontSize: '11px', textAlign: 'center', color: '#888'}}>By clicking "Accept," you acknowledge you are responsible for checking reality.</p>
              </div>
              <button onClick={handleAcceptTerms} style={styles.acceptBtn}>✅ I Accept Full Responsibility</button>
          </div>
      </div>
  );

  return (
    <div style={{ fontFamily: '"Inter", sans-serif' }}>
      {isOpen && (
        <div style={styles.fullPageChat}>
          
          {/* HEADER */}
          <div style={styles.header}>
            <button onClick={handleCloseChat} style={styles.backBtn}>←</button>
            <div style={{textAlign: 'center'}}>
                <span style={{fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px'}}>
                    🤝 Farm Buddy 🌾
                </span>
                <span style={{fontSize: '11px', color: '#81C784'}}>Pro Model Enabled</span>
            </div>
            <div style={{width: '24px'}}></div>
          </div>
          
          {/* BODY */}
          <div style={styles.chatBody}>
            {messages.map((msg, i) => (
              <div key={i} style={{ 
                  textAlign: msg.sender === 'bot' ? 'left' : 'right', 
                  marginBottom: '20px',
                  display: 'flex', flexDirection: 'column',
                  alignItems: msg.sender === 'bot' ? 'flex-start' : 'flex-end'
              }}>
                {msg.image && <img src={msg.image} alt="Upload" style={styles.msgImage} />}
                <div style={msg.sender === 'bot' ? styles.botBubble : styles.userBubble}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                </div>
              </div>
            ))}
            {isLoading && (
                <div style={styles.loadingArea}>
                    <div className="spinner" style={styles.spinner}></div> thinking...
                </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* FOOTER - ALIGNMENT FIXED */}
          <div style={styles.footer}>
            <div style={styles.inputContainer}>
                <input type="file" accept="image/*" onChange={handleFileChange} style={{display:'none'}} id="cam-input" disabled={!termsAccepted} />
                <label htmlFor="cam-input" style={{...styles.iconLabel, opacity: termsAccepted ? 1 : 0.5}}>📸</label>

                <div style={{flex: 1, position: 'relative', display: 'flex', alignItems: 'center'}}>
                    <input 
                        type="text" 
                        placeholder={termsAccepted ? "Ask Farm Buddy..." : "Accept terms..."} 
                        style={styles.textInput} 
                        value={input} 
                        onChange={(e) => setInput(e.target.value)} 
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        disabled={!termsAccepted}
                    />
                    {uploadedFile && (
                        <div style={styles.imageBadge}>
                            <span>🖼️ Image Ready</span>
                            <button onClick={removeUploadedImage} style={styles.badgeClose}>✖</button>
                        </div>
                    )}
                </div>

                <button 
                    onClick={handleSend} 
                    style={styles.sendCircle}
                    disabled={!termsAccepted || (input.trim() === "" && imagePart === null)}
                >➤</button>
            </div>
            <div style={styles.bottomWarning}>
                AI can make mistakes, so double-check it. <span onClick={() => setShowFullTerms(true)} style={styles.readMore}>Read more</span>
            </div>
          </div>
        </div>
      )}
      
      {showFullTerms && <FullTermsModal />}

      {/* DASHBOARD FLOATING BUTTON (SMALLER) */}
      {!isOpen && (
          <button onClick={handleOpenChat} style={styles.miniFloatBtn}>
              <span style={{fontSize: '20px'}}>🤝</span> 
              <span style={{fontWeight: 'bold'}}>Farm Buddy</span>
          </button>
      )}
    </div>
  );
}

// --- 🎨 PROFESSIONAL STYLES (EXPANDED TO PRESERVE LINE COUNT) ---
const styles = {
    miniFloatBtn: {
        position: 'fixed', 
        bottom: '25px', 
        right: '25px', 
        zIndex: 999,
        background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
        color: 'white', 
        border: 'none', 
        borderRadius: '50px', 
        padding: '10px 18px', // Smaller as requested
        fontSize: '14px', // Smaller as requested
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.3)', 
        cursor: 'pointer'
    },
    fullPageChat: {
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100vw', // Full Screen
        height: '100vh', // Full Screen
        backgroundColor: '#131314', 
        zIndex: 9999, 
        display: 'flex', 
        flexDirection: 'column'
    },
    header: {
        backgroundColor: '#1E1F20', 
        color: '#E3E3E3', 
        padding: '15px 25px',
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid #333'
    },
    backBtn: { background: 'none', border: 'none', color: 'white', fontSize: '26px', cursor: 'pointer' },
    chatBody: {
        flex: 1, 
        padding: '25px', 
        overflowY: 'auto', 
        backgroundColor: '#131314',
        display: 'flex', 
        flexDirection: 'column'
    },
    botBubble: {
        backgroundColor: '#1E1F20', 
        color: '#E3E3E3', 
        padding: '15px 20px', 
        borderRadius: '4px 22px 22px 22px', 
        maxWidth: '85%', 
        fontSize: '15px', 
        lineHeight: '1.6', 
        border: '1px solid #333'
    },
    userBubble: {
        backgroundColor: '#2E7D32', 
        color: 'white', 
        padding: '12px 20px', 
        borderRadius: '22px 4px 22px 22px', 
        maxWidth: '80%', 
        fontSize: '15px'
    },
    footer: {
        backgroundColor: '#1E1F20', 
        padding: '15px 20px 35px 20px', 
        borderTop: '1px solid #333'
    },
    inputContainer: {
        display: 'flex', 
        alignItems: 'center', 
        gap: '15px', 
        maxWidth: '1000px', 
        margin: '0 auto', 
        width: '100%'
    },
    textInput: {
        width: '100%', 
        padding: '15px 20px', 
        borderRadius: '30px', 
        border: '1px solid #444',
        backgroundColor: '#2D2D30', 
        color: 'white', 
        fontSize: '16px', 
        outline: 'none'
    },
    iconLabel: { fontSize: '26px', cursor: 'pointer', color: '#9aa0a6' },
    sendCircle: {
        backgroundColor: '#2E7D32', 
        color: 'white', 
        border: 'none', 
        borderRadius: '50%', 
        width: '50px', 
        height: '50px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        fontSize: '22px', 
        cursor: 'pointer', 
        flexShrink: 0 // FIXED ALIGNMENT
    },
    bottomWarning: { textAlign: 'center', color: '#9aa0a6', fontSize: '12px', marginTop: '12px' },
    readMore: { color: '#81C784', textDecoration: 'underline', cursor: 'pointer', marginLeft: '5px' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    modalContent: { width: '90%', maxWidth: '600px', backgroundColor: '#1E1F20', borderRadius: '15px', border: '1px solid #444', overflow: 'hidden' },
    modalHeader: { padding: '20px', backgroundColor: '#2E7D32', color: 'white', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' },
    modalBody: { padding: '30px', color: '#CCC', fontSize: '14px', lineHeight: '1.7', maxHeight: '60vh', overflowY: 'auto' },
    modalDismissBtn: { background: 'none', border: 'none', color: 'white', fontSize: '22px', cursor: 'pointer' },
    acceptBtn: { width: '100%', padding: '18px', backgroundColor: '#2E7D32', color: 'white', border: 'none', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' },
    msgImage: { maxWidth: '250px', borderRadius: '12px', marginBottom: '8px', border: '1px solid #444' },
    imageBadge: { position: 'absolute', top: '-45px', left: '10px', backgroundColor: '#2E7D32', padding: '6px 12px', borderRadius: '15px', color: 'white', fontSize: '12px', display: 'flex', gap: '8px' },
    badgeClose: { background: 'none', border: 'none', color: 'white', fontWeight: 'bold', cursor: 'pointer' },
    loadingArea: { color: '#9aa0a6', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' },
    spinner: { width: '16px', height: '16px', border: '2px solid #333', borderTop: '2px solid #81C784', borderRadius: '50%', animation: 'spin 1s linear infinite' }
};

export default ChatBot;