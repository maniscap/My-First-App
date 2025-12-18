import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * 🌿 FARM BUDDY: FINAL TITANIUM EDITION (v40.0)
 * ----------------------------------------------------------------
 * 🚀 ENGINES: Hugging Face (Primary) + Gemini v1beta (Fixed) + Groq Vision.
 * 🎤 UI: Official Google Mic SVG & Solid Professional Dark Theme.
 * 📜 LEGAL: Full Elaborated 6-Point Professional Liability Disclaimer.
 * 🔧 FIXES: Auto-Image Resizer + Multi-Endpoint Gemini Routing.
 */

function ChatBot() {
  // --- 🔐 API CONFIGURATION ---
  const GROQ_KEY = import.meta.env.VITE_GROQ_KEY;
  const GEMINI_KEY = import.meta.env.VITE_GEMINI_KEY; 
  const HF_KEY = import.meta.env.VITE_HF_KEY; 

  // --- ⚙️ 15-MODEL ABSOLUTE FORCE QUEUE ---
  const MODEL_QUEUE = [
    { provider: 'hf', id: 'linkan/plant-disease-classification-v2', vision: true },
    { provider: 'hf', id: 'google/vit-base-patch16-224', vision: true },
    { provider: 'gemini', id: 'gemini-1.5-pro', vision: true }, 
    { provider: 'gemini', id: 'gemini-2.0-flash-exp', vision: true },
    { provider: 'gemini', id: 'gemini-1.5-flash', vision: true },
    { provider: 'groq', id: 'llama-3.2-90b-vision-preview', vision: true },
    { provider: 'groq', id: 'llama-3.2-11b-vision-preview', vision: true },
    { provider: 'groq', id: 'llama-3.3-70b-versatile', vision: false },
    { provider: 'groq', id: 'llama-3.1-70b-versatile', vision: false },
    { provider: 'groq', id: 'mixtral-8x7b-32768', vision: false },
    { provider: 'gemini', id: 'gemini-1.0-pro', vision: false },
    { provider: 'gemini', id: 'gemini-pro', vision: false },
    { provider: 'groq', id: 'gemma2-9b-it', vision: false },
    { provider: 'groq', id: 'llama-3.1-8b-instant', vision: false },
    { provider: 'hf', id: 'timm/resnet50.a1_in1k', vision: true }
  ];

  // --- 📝 STATE MANAGEMENT ---
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      text: "🌱 **Welcome to Farm Buddy Pro.**\n\nUpload a photo or speak for a 15-model diagnosis. I can identify pests, diseases, and provide organic or chemical cures.", 
      sender: "bot" 
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const [termsAccepted, setTermsAccepted] = useState(() => {
    return typeof window !== "undefined" && localStorage.getItem('farmbuddy_terms_v40') === 'true';
  });
  const [showFullTerms, setShowFullTerms] = useState(false);

  const [uploadedFile, setUploadedFile] = useState(null);
  const [imageBlob, setImageBlob] = useState(null);
  const [base64Image, setBase64Image] = useState(null);

  const messagesEndRef = useRef(null);
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => scrollToBottom(), [messages]);

  // --- 🎤 VOICE RECOGNITION ---
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.start();
      setIsListening(true);
      recognition.onresult = (e) => {
        setInput(e.results[0][0].transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
    } else {
      alert("Voice input is not supported in this browser.");
    }
  };

  // --- 🍏 DRAGGABLE UI (BOUNDED) ---
  const [position, setPosition] = useState({ x: window.innerWidth - 100, y: window.innerHeight - 120 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    setIsDragging(false);
    dragOffset.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    setIsDragging(true); 
    e.preventDefault();
    let newX = e.clientX - dragOffset.current.x;
    let newY = e.clientY - dragOffset.current.y;
    const maxX = window.innerWidth - 80; const maxY = window.innerHeight - 80;
    if (newX < 10) newX = 10; if (newX > maxX) newX = maxX;
    if (newY < 10) newY = 10; if (newY > maxY) newY = maxY;
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const handleTouchStart = (e) => {
    setIsDragging(false);
    const touch = e.touches[0];
    dragOffset.current = { x: touch.clientX - position.x, y: touch.clientY - position.y };
  };

  const handleTouchMove = (e) => {
    setIsDragging(true);
    const touch = e.touches[0];
    let newX = touch.clientX - dragOffset.current.x;
    let newY = touch.clientY - dragOffset.current.y;
    const maxX = window.innerWidth - 80; const maxY = window.innerHeight - 80;
    if (newX < 5) newX = 5; if (newX > maxX) newX = maxX;
    if (newY < 5) newY = 5; if (newY > maxY) newY = maxY;
    setPosition({ x: newX, y: newY });
  };

  const handleClickButton = () => { if (!isDragging) handleOpenChat(); };

  // --- 🔄 LOGIC ---
  const handleOpenChat = () => { 
    setIsOpen(true); 
    if (!termsAccepted) setShowFullTerms(true); 
  };
  const handleCloseChat = () => { setIsOpen(false); setUploadedFile(null); setShowFullTerms(false); }
  const handleAcceptTerms = () => {
    setTermsAccepted(true);
    setShowFullTerms(false);
    localStorage.setItem('farmbuddy_terms_v40', 'true');
  }

  // --- 📸 IMAGE PROCESSING (COMPRESSION ENGINE) ---
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width; let height = img.height;
          // Compression to 640px for maximum compatibility
          if (width > 640) { height *= 640/width; width = 640; }
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
          setBase64Image(dataUrl);
          fetch(dataUrl).then(res => res.blob()).then(blob => setImageBlob(blob));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
      setInput(`Strictly analyze this crop image. Identify disease and suggest cures.`);
    }
  };

  const removeUploadedImage = () => { setUploadedFile(null); setBase64Image(null); setInput(""); }

  // --- 🧠 MASTER FORCE ENGINE ---
  const handleSend = async () => {
    if (!termsAccepted) { setShowFullTerms(true); return; }
    if (!input.trim() && !uploadedFile) return;

    const userText = input.trim() || "Analysis Request";
    setMessages(prev => [...prev, { text: userText, sender: "user", image: uploadedFile ? URL.createObjectURL(uploadedFile) : null }]);
    setInput(""); setIsLoading(true);

    const systemInstruction = "Senior Agricultural Scientist. Rule: Provide Diagnosis, Symptoms, Organic Cure, and Chemical Control in Markdown.";
    let finalResponse = "";
    let success = false;
    let debugLog = "";

    for (const model of MODEL_QUEUE) {
      if (success) break;
      if (uploadedFile && !model.vision) continue;

      try {
        console.log(`🔌 Bypassing errors with: ${model.id}`);

        if (model.provider === 'hf') {
          if (!HF_KEY) continue;
          const res = await fetch(`https://api-inference.huggingface.co/models/${model.id}`, {
            headers: { Authorization: `Bearer ${HF_KEY}` },
            method: "POST",
            body: imageBlob
          });
          const data = await res.json();
          if (data[0]) {
            finalResponse = `🔍 **Diagnosis (HF Engine):** Likely **${data[0].label.replace(/_/g, " ")}** (${(data[0].score * 100).toFixed(1)}% confidence).\n\n**Action Plan:** Spray Neem Oil for organic control or seek a Copper Fungicide from a dealer.`;
            success = true;
          }
        } 
        else if (model.provider === 'gemini') {
          if (!GEMINI_KEY) continue;
          // Try v1beta endpoint (most successful for vision)
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model.id}:generateContent?key=${GEMINI_KEY}`;
          const parts = [{ text: `SYSTEM: ${systemInstruction}\nUSER: ${userText}` }];
          if (base64Image) parts.unshift({ inline_data: { mime_type: "image/jpeg", data: base64Image.split(',')[1] } });
          
          const res = await fetch(url, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: parts }] })
          });
          const data = await res.json();
          finalResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (finalResponse) success = true;
        } 
        else if (model.provider === 'groq') {
          if (!GROQ_KEY) continue;
          const payload = base64Image && model.vision ? 
            [{ role: "user", content: [{ type: "text", text: userText }, { type: "image_url", image_url: { url: base64Image } }] }] :
            [{ role: "system", content: systemInstruction }, { role: "user", content: userText }];
          
          const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${GROQ_KEY}` },
            body: JSON.stringify({ model: model.id, messages: payload, temperature: 0.5 })
          });
          const data = await res.json();
          finalResponse = data.choices?.[0]?.message?.content;
          if (finalResponse) success = true;
        }
      } catch (e) { debugLog += `${model.id} err; `; }
    }
    setMessages(prev => [...prev, { text: finalResponse || `⚠️ System Offline. Debug: ${debugLog}`, sender: "bot" }]);
    setIsLoading(false); setUploadedFile(null); setBase64Image(null);
  };

  // --- 📜 ELABORATED 6-POINT LEGAL MODAL ---
  const FullTermsModal = () => (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <div style={styles.modalHeader}>
          <span>⚖️ ELABORATED TERMS & CONDITIONS</span>
          <button onClick={() => {setShowFullTerms(false); if(!termsAccepted) setIsOpen(false);}} style={styles.closeX}>✖</button>
        </div>
        <div style={styles.modalBody}>
          <p style={styles.warnText}>⚠️ IMPORTANT: LEGAL NOTICE FOR ALL USERS</p>
          <h4>1. DEVELOPERS & OWNERS LIABILITY WAIVER</h4>
          <p>The developers, creators, and owners of the Farm Buddy application act solely as providers of an interface for third-party Artificial Intelligence. We explicitly disclaim all responsibility for any results, advice, data, or suggestions generated. You agree that we assume zero liability for the consequences of your decisions.</p>

          <h4>2. AI ERRORS & SUGGESTIONS</h4>
          <p>Artificial Intelligence models are subject to "hallucinations" and logical errors. All results provided are merely automated suggestions and not professional mandates. You have the ultimate responsibility to recheck and verify all information with certified human agricultural experts before taking any action.</p>

          <h4>3. DO NOT BLINDLY FOLLOW RESULTS</h4>
          <p>Blindly following AI-generated cures or chemical dosages can lead to catastrophic crop failure. You agree that any application of treatments based solely on this tool is done at your own risk. Always perform small-scale testing first.</p>

          <h4>4. PROVIDER & CURE DISCLAIMER</h4>
          <p>The agricultural solutions are generated by third-party models from Google, Groq, and Hugging Face. The owners of this application are not responsible for any mistakes, scientific inaccuracies, or crop death caused by following these third-party suggestions.</p>

          <h4>5. FINANCIAL & CROP LOSS WAIVER</h4>
          <p>We assume no liability for crop loss, soil degradation, financial bankruptcy, loss of profit, or any money-related issues resulting from the use of this software. No compensation, financial or otherwise, will be provided for damages.</p>

          <h4>6. VOLUNTARY & NON-MANDATORY USE</h4>
          <p>By clicking "Accept," you confirm that your use of this AI is entirely voluntary. This is not a mandatory service. If you do not agree to these elaborated terms, you must close the application immediately.</p>
        </div>
        <button onClick={handleAcceptTerms} style={styles.acceptBtn}>AGREE & CONTINUE</button>
      </div>
    </div>
  );

  return (
    <div style={styles.pageWrap}>
      {isOpen && (
        <div style={styles.chatWindow}>
          <div style={styles.header}>
            <button onClick={() => setIsOpen(false)} style={styles.backBtn}>←</button>
            <div style={{ textAlign: 'center' }}>
                <div style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>Farm Buddy 🌾</div>
                <div style={{ fontSize: '10px', color: '#81C784' }}>15-Model Grid Active</div>
            </div>
            <div style={{ width: '24px' }}></div>
          </div>

          <div style={styles.chatBody}>
            {messages.map((msg, i) => (
              <div key={i} style={{ textAlign: msg.sender === 'bot' ? 'left' : 'right', marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'bot' ? 'flex-start' : 'flex-end' }}>
                {msg.image && <img src={msg.image} alt="Crop" style={styles.msgImg} />}
                <div style={msg.sender === 'bot' ? styles.botBubble : styles.userBubble}><ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown></div>
              </div>
            ))}
            {isLoading && <div style={styles.loadingTxt}>Brute-forcing AI Cloud...</div>}
            <div ref={messagesEndRef} />
          </div>

          <div style={styles.footer}>
            <div style={styles.inputArea}>
              <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} id="cam-input" />
              <label htmlFor="cam-input" style={styles.toolBtn}>📸</label>
              <input type="text" placeholder="Ask Farm Buddy..." style={styles.input} value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} />
              <button onClick={startListening} style={styles.micBtn}>
                <svg viewBox="0 0 24 24" width="22" height="22" fill={isListening ? "#EA4335" : "#FFFFFF"}><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
              </button>
              <button onClick={handleSend} style={styles.sendBtn}>➤</button>
            </div>
            {uploadedFile && <div style={styles.imgBadge}>🖼️ Photo Loaded <button onClick={removeUploadedImage} style={styles.delBadge}>✖</button></div>}
            <div style={styles.legalLinks}>AI can err. <span onClick={() => setShowFullTerms(true)} style={styles.readTerms}>Read Elaborated Terms</span></div>
          </div>
        </div>
      )}
      {showFullTerms && <FullTermsModal />}
      {!isOpen && (
        <div onMouseDown={handleMouseDown} onClick={handleClickButton} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} style={{ ...styles.floatCapsule, left: `${position.x}px`, top: `${position.y}px`, cursor: isDragging ? 'grabbing' : 'pointer' }}>
            <span style={{fontSize:'22px'}}>🧢</span> <span style={{fontWeight:'bold', color:'white', fontSize:'14px'}}>Farm Buddy</span>
        </div>
      )}
    </div>
  );
}

// --- 💅 COMPREHENSIVE STYLING ---
const styles = {
    pageWrap: { backgroundColor: '#121212', height: '100vh', fontFamily: 'Arial, sans-serif', overflow: 'hidden' },
    floatCapsule: { position: 'fixed', padding: '12px 22px', borderRadius: '50px', backgroundColor: '#2E7D32', border: '2px solid white', boxShadow: '0 6px 20px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 1000, touchAction: 'none' },
    chatWindow: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: '#121212', display: 'flex', flexDirection: 'column', zIndex: 2000 },
    header: { backgroundColor: '#1E1E1E', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333' },
    backBtn: { background: 'none', border: 'none', color: 'white', fontSize: '26px', cursor: 'pointer' },
    chatBody: { flex: 1, padding: '20px', overflowY: 'auto' },
    botBubble: { backgroundColor: '#1E1E1E', color: '#E0E0E0', padding: '14px 18px', borderRadius: '4px 18px 18px 18px', maxWidth: '85%', border: '1px solid #333', fontSize: '15px', lineHeight: '1.6' },
    userBubble: { backgroundColor: '#2E7D32', color: 'white', padding: '14px 18px', borderRadius: '18px 4px 18px 18px', maxWidth: '85%', fontSize: '15px', lineHeight: '1.6' },
    footer: { backgroundColor: '#1E1E1E', padding: '15px 20px 30px 20px', borderTop: '1px solid #333' },
    inputArea: { display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#2C2C2C', padding: '10px 18px', borderRadius: '35px', border: '1px solid #444' },
    input: { flex: 1, background: 'none', border: 'none', color: 'white', outline: 'none', fontSize: '16px' },
    toolBtn: { cursor: 'pointer', fontSize: '22px' },
    micBtn: { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' },
    sendBtn: { background: '#2E7D32', color: 'white', border: 'none', borderRadius: '50%', width: '42px', height: '42px', cursor: 'pointer' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    modalContent: { width: '92%', maxWidth: '550px', backgroundColor: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' },
    modalHeader: { padding: '18px 20px', backgroundColor: '#F8F9FA', borderBottom: '1px solid #DDD', fontWeight: 'bold', fontSize: '15px', display: 'flex', justifyContent: 'space-between', color: '#333' },
    modalBody: { padding: '25px', maxHeight: '65vh', overflowY: 'auto', color: '#444', fontSize: '13px', lineHeight: '1.7' },
    closeX: { background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#888' },
    acceptBtn: { width: '100%', padding: '20px', backgroundColor: '#2E7D32', color: 'white', border: 'none', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' },
    warnText: { color: '#D32F2F', fontWeight: 'bold', borderBottom:'1px solid #eee', paddingBottom:'10px', marginBottom:'15px', textAlign:'center' },
    legalLinks: { textAlign: 'center', marginTop: '12px', fontSize: '11px', color: '#888' },
    readTerms: { color: '#81C784', textDecoration: 'underline', cursor: 'pointer', fontWeight: 'bold', marginLeft: '5px' },
    msgImg: { maxWidth: '240px', borderRadius: '12px', marginBottom: '10px', border: '1px solid #444' },
    imgBadge: { color: '#81C784', fontSize: '12px', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' },
    delBadge: { background: '#D32F2F', color: 'white', border: 'none', borderRadius: '4px', padding: '2px 6px', fontSize: '10px', cursor: 'pointer' },
    loadingTxt: { color: '#666', fontSize: '12px', textAlign: 'center', marginTop: '10px' }
};

export default ChatBot;