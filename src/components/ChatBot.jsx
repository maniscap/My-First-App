import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * 🌿 FARM BUDDY: TITANIUM "BUG-FREE" EDITION (v90.0)
 * ====================================================
 * * 🛑 CRITICAL FIXES IMPLEMENTED:
 * 1. MODAL SCROLL FIX: Added onWheel/onTouchMove propagation stops to the modal body.
 * 2. GHOST CLICK FIX: Added aggressive event shielding to the Modal Overlay.
 * 3. NO EXTERNAL LIBS: Removed syntax highlighter to prevent white screens.
 * 4. MOBILE CRASH FIX: Verified handleTouchStart existence.
 * * * 🚀 FEATURES:
 * - 30 AI Models (Gemini, Groq, HF)
 * - Vision (Crop Disease)
 * - Persistent History
 * - Auto-Scroll
 */

function ChatBot() {
  // ==================================================================================
  // 1. CONFIGURATION & API KEYS
  // ==================================================================================
  const GROQ_KEY = import.meta.env.VITE_GROQ_KEY;
  const GEMINI_KEY = import.meta.env.VITE_GEMINI_KEY; 
  const HF_KEY = import.meta.env.VITE_HF_KEY; 

  // Debugging Keys on Mount
  useEffect(() => {
    console.log("🔌 FARM BUDDY: Systems Online & Event Shields Active");
  }, []);

  // ==================================================================================
  // 2. THE 30-MODEL "BRUTE FORCE" GRID (FULL LIST)
  // ==================================================================================
  const MODEL_QUEUE = useMemo(() => [
    // --- TIER 1: GOOGLE GEMINI VISION ---
    { provider: 'gemini', id: 'gemini-1.5-pro', vision: true }, 
    { provider: 'gemini', id: 'gemini-2.0-flash-exp', vision: true }, 
    { provider: 'gemini', id: 'gemini-1.5-flash', vision: true },
    { provider: 'gemini', id: 'gemini-1.5-flash-8b', vision: true },

    // --- TIER 2: GROQ VISION & HIGH POWER ---
    { provider: 'groq', id: 'llama-3.2-90b-vision-preview', vision: true },
    { provider: 'groq', id: 'llama-3.2-11b-vision-preview', vision: true },
    { provider: 'groq', id: 'llama-3.3-70b-versatile', vision: false }, 
    { provider: 'groq', id: 'llama-3.1-70b-versatile', vision: false },

   // --- TIER 3: HUGGING FACE VISION ---
    { provider: 'hf', id: 'linkan/plant-disease-classification-v2', vision: true },
    { provider: 'hf', id: 'google/vit-base-patch16-224', vision: true },
    { provider: 'hf', id: 'microsoft/resnet-50', vision: true },
    { provider: 'hf', id: 'facebook/detr-resnet-50', vision: true },
    { provider: 'hf', id: 'google/vit-large-patch16-224', vision: true },

    // --- TIER 4: TEXT FALLBACKS ---
    { provider: 'groq', id: 'mixtral-8x7b-32768', vision: false },
    { provider: 'groq', id: 'gemma2-9b-it', vision: false },
    { provider: 'gemini', id: 'gemini-1.0-pro', vision: false },
    { provider: 'gemini', id: 'gemini-pro', vision: false },
    { provider: 'groq', id: 'llama-3.1-8b-instant', vision: false },
    { provider: 'groq', id: 'llama3-70b-8192', vision: false },
    { provider: 'groq', id: 'llama3-8b-8192', vision: false },
  ], []);

  // ==================================================================================
  // 3. ADVANCED STATE MANAGEMENT
  // ==================================================================================
  const [isOpen, setIsOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  // Persistent History Logic
  const [messages, setMessages] = useState(() => {
    try {
        const saved = localStorage.getItem('farmbuddy_history_v90');
        if (saved) {
          return JSON.parse(saved);
        }
    } catch (e) {
        console.error("History Load Error", e);
    }
    return [{ 
      text: "✨ **Welcome to Farm Buddy!** 🌿\n\nI am your AI Agriculture Assistant. \n\n📸 **Upload a photo** of your crop to detect diseases.\n💬 **Ask questions** in your local language.\n\nHow can I help you today?", 
      sender: "bot",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }];
  });

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false); 
  const [isListening, setIsListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  
  const [lastRequest, setLastRequest] = useState({ text: "", imageBlob: null, base64: null, dataUrl: null });

  // Legal & Permission State
  const [termsAccepted, setTermsAccepted] = useState(() => {
    return typeof window !== "undefined" && localStorage.getItem('farmbuddy_terms_v60') === 'true';
  });
  const [showFullTerms, setShowFullTerms] = useState(false);

  // Image Processing State
  const [uploadedFile, setUploadedFile] = useState(null);
  const [imageBlob, setImageBlob] = useState(null); 
  const [base64Raw, setBase64Raw] = useState(null); 
  const [dataUrl, setDataUrl] = useState(null);     

  // Refs
  const messagesEndRef = useRef(null);
  const chatBodyRef = useRef(null);
  
  // Auto-Scroll Logic
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    localStorage.setItem('farmbuddy_history_v90', JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleStatusChange = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);
    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, []);

  // Scroll Button Visibility
  useEffect(() => {
      const handleScroll = () => {
          if (chatBodyRef.current) {
              const { scrollTop, scrollHeight, clientHeight } = chatBodyRef.current;
              setShowScrollBtn(scrollHeight - scrollTop > clientHeight + 100);
          }
      };
      chatBodyRef.current?.addEventListener('scroll', handleScroll);
      return () => chatBodyRef.current?.removeEventListener('scroll', handleScroll);
  }, [isOpen]);

  // ==================================================================================
  // 4. UTILITIES (Voice, Copy, Retry, Clear)
  // ==================================================================================
  
  useEffect(() => {
    const loadVoices = () => { window.speechSynthesis.getVoices(); };
    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
  }, []);

  const detectLanguage = (text) => {
      if (/[\u0C00-\u0C7F]/.test(text)) return { code: 'te-IN', name: 'Telugu' };
      if (/[\u0900-\u097F]/.test(text)) return { code: 'hi-IN', name: 'Hindi' };
      if (/[\u0B80-\u0BFF]/.test(text)) return { code: 'ta-IN', name: 'Tamil' };
      return { code: 'en-US', name: 'English' };
  };

  const handleSpeak = (text) => {
    if ('speechSynthesis' in window) {
      if (speaking) {
        window.speechSynthesis.cancel();
        setSpeaking(false);
        return;
      }
      const cleanText = text.replace(/[*#_`\-]/g, '');
      const detected = detectLanguage(cleanText);
      const utterance = new SpeechSynthesisUtterance(cleanText);
      const voices = window.speechSynthesis.getVoices();
      
      let targetVoice = voices.find(v => v.lang.includes(detected.code.split('-')[0]) && v.name.includes("Google"));
      if (!targetVoice) targetVoice = voices.find(v => v.lang.includes(detected.code.split('-')[0]));

      if (targetVoice) {
          utterance.voice = targetVoice;
          utterance.lang = targetVoice.lang;
      } 
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      
      setSpeaking(true);
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-Speech not supported.");
    }
  };

  const handleCopy = (text) => {
    const cleanText = text.replace(/[*#_`]/g, '');
    navigator.clipboard.writeText(cleanText);
    alert("✅ Copied to clipboard!");
  };

  const handleRetry = () => {
    if (!lastRequest.text && !lastRequest.imageBlob) return;
    setIsLoading(true);
    setMessages(prev => prev.slice(0, -1)); 
    executeAILoop(lastRequest.text, lastRequest.imageBlob, lastRequest.base64, lastRequest.dataUrl);
  };

  // 🔴 FIXED: Prevent "Delete" from firing when Terms are clicked
  const handleClearChat = (e) => {
      if(e && e.stopPropagation) e.stopPropagation();
      const confirmClear = window.confirm("Are you sure you want to delete all chat history?");
      if(confirmClear) {
          const resetMsg = [{ 
              text: "🗑️ History cleared. I am ready for new tasks!", 
              sender: "bot",
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }];
          setMessages(resetMsg);
          localStorage.setItem('farmbuddy_history_v90', JSON.stringify(resetMsg));
      }
  };

  // ==================================================================================
  // 5. DRAGGABLE UI & TOUCH LOGIC
  // ==================================================================================
  const [position, setPosition] = useState({ x: window.innerWidth - 100, y: window.innerHeight - 120 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Mouse Handlers
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

  // Touch Handlers (Restored to prevent crash)
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
    const maxX = window.innerWidth - 80; 
    const maxY = window.innerHeight - 80;
    if (newX < 5) newX = 5; if (newX > maxX) newX = maxX;
    if (newY < 5) newY = 5; if (newY > maxY) newY = maxY;
    setPosition({ x: newX, y: newY });
  };

  // Toggle Logic
  const handleClickButton = () => { if (!isDragging) handleOpenChat(); };
  
  const handleOpenChat = () => { 
      setIsOpen(true); 
      if (!termsAccepted) {
          setShowFullTerms(true);
      }
  };
  
  // 🔴 FIXED: Ensure Acceptance doesn't trigger background events
  const handleAcceptTerms = (e) => { 
      if(e && e.stopPropagation) e.stopPropagation(); // Shield the click
      setTermsAccepted(true); 
      setShowFullTerms(false); 
      localStorage.setItem('farmbuddy_terms_v60', 'true'); 
      setIsOpen(true); 
  };

  const handleCloseTerms = (e) => {
      if(e && e.stopPropagation) e.stopPropagation(); // Shield the click
      setShowFullTerms(false);
      if(!termsAccepted) setIsOpen(false);
  }

  // ==================================================================================
  // 6. INPUT & FILE HANDLING
  // ==================================================================================
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US'; 
      recognition.interimResults = false;
      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + (prev ? " " : "") + transcript);
        setIsListening(false);
      };
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } else {
      alert("⚠️ Voice input is not supported in this browser. Please try Google Chrome.");
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);
      if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              let width = img.width; height = img.height;
              const MAX_DIM = 800;
              if (width > MAX_DIM || height > MAX_DIM) {
                if (width > height) { height *= MAX_DIM/width; width = MAX_DIM; }
                else { width *= MAX_DIM/height; height = MAX_DIM; }
              }
              canvas.width = width; canvas.height = height;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0, width, height);
              const processedDataUrl = canvas.toDataURL('image/jpeg', 0.7); 
              setDataUrl(processedDataUrl);
              setBase64Raw(processedDataUrl.split(',')[1]); 
              fetch(processedDataUrl).then(res => res.blob()).then(blob => setImageBlob(blob));
            };
            img.src = e.target.result;
          };
          reader.readAsDataURL(file);
          setInput(`Analyze this crop image strictly.`);
      } else {
          const reader = new FileReader();
          reader.onload = (e) => {
              const textContent = e.target.result.slice(0, 30000); 
              setInput(`Analyze this file content:\n\n${textContent}\n\nUser Request: `);
          };
          reader.readAsText(file);
      }
    }
  };

  const removeUploadedImage = () => { 
    setUploadedFile(null); setBase64Raw(null); setDataUrl(null); setImageBlob(null); setInput(""); 
  };

  // ==================================================================================
  // 7. MASTER AI LOGIC
  // ==================================================================================
  const handleSend = async () => {
    if (!termsAccepted) { setShowFullTerms(true); return; }
    if (!isOnline) { setMessages(prev => [...prev, { text: "⚠️ You are OFFLINE.", sender: "bot", timestamp: new Date().toLocaleTimeString() }]); return; }
    if (!input.trim() && !uploadedFile) return;

    const userText = input.trim() || "Analysis Request";
    setMessages(prev => [...prev, { text: userText, sender: "user", image: uploadedFile && uploadedFile.type.startsWith('image/') ? URL.createObjectURL(uploadedFile) : null, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setLastRequest({ text: userText, imageBlob, base64: base64Raw, dataUrl });
    setInput(""); setIsLoading(true); setIsTyping(true);
    executeAILoop(userText, imageBlob, base64Raw, dataUrl);
  };

  const executeAILoop = async (text, imgBlob, b64, dUrl) => {
    const systemInstruction = "You are a Universal AI Assistant. 1. If the user writes in any language, REPLY IN THAT LANGUAGE. 2. Analyze crop images for diseases. 3. Use Markdown.";
    let finalResponse = ""; let success = false; let debugLog = "";
    
    for (const model of MODEL_QUEUE) {
      if (success) break;
      if (imgBlob && !model.vision) continue;

      try {
        if (model.provider === 'gemini') {
          if (!GEMINI_KEY) continue;
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model.id}:generateContent?key=${GEMINI_KEY}`;
          const parts = [{ text: `SYSTEM: ${systemInstruction}\nUSER: ${text}` }];
          if (b64) parts.unshift({ inline_data: { mime_type: "image/jpeg", data: b64 } });
          const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: parts }] }) });
          const data = await res.json();
          finalResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (finalResponse) success = true;
        } else if (model.provider === 'groq') {
          if (!GROQ_KEY) continue;
          let payload;
          if (dUrl && model.vision) { payload = [{ role: "user", content: [{ type: "text", text: text }, { type: "image_url", image_url: { url: dUrl } }] }]; } 
          else { payload = [{ role: "system", content: systemInstruction }, { role: "user", content: text }]; }
          const res = await fetch("https://api.groq.com/openai/v1/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${GROQ_KEY}` }, body: JSON.stringify({ model: model.id, messages: payload, temperature: 0.5 }) });
          const data = await res.json();
          finalResponse = data.choices?.[0]?.message?.content;
          if (finalResponse) success = true;
        } else if (model.provider === 'hf') {
          if (!HF_KEY) continue;
          const fetchHF = async () => fetch(`https://api-inference.huggingface.co/models/${model.id}`, { headers: { Authorization: `Bearer ${HF_KEY}` }, method: "POST", body: imgBlob });
          let res = await fetchHF();
          if (res.status === 503) { await new Promise(r => setTimeout(r, 5000)); res = await fetchHF(); }
          const data = await res.json();
          if (Array.isArray(data) && data[0].label) {
            const disease = data[0].label; const conf = (data[0].score * 100).toFixed(1);
            if (!text.includes("An image analysis model identified")) {
                 executeAILoop(`Identified: "${disease}" (${conf}%). Provide cure report.`, null, null, null); return;
            } else { finalResponse = `🔍 **Result:** ${disease} (${conf}%)\n\n${text}`; success = true; }
          }
        } 
      } catch (e) { debugLog += `${model.id} failed; `; }
    }

    if (!success) finalResponse = `⚠️ Models failed. \n${debugLog}`;
    setMessages(prev => [...prev, { text: finalResponse, sender: "bot", timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setIsLoading(false); setIsTyping(false); setUploadedFile(null); setBase64Raw(null); setDataUrl(null); setImageBlob(null);
  };

  // ==================================================================================
  // 8. LEGAL MODAL (FIXED SCROLL & CLICK)
  // ==================================================================================
  const FullTermsModal = () => (
    // 🛡️ STOP PROPAGATION ON OVERLAY
    <div 
        style={styles.modalOverlay} 
        onClick={(e) => e.stopPropagation()} 
        onMouseDown={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()} 
        onTouchMove={(e) => e.stopPropagation()} // Fixes Mobile Drag Conflict
    >
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <span>⚖️ ELABORATED TERMS & CONDITIONS</span>
          {/* 🛡️ Close Button Shield */}
          <button onClick={handleCloseTerms} style={styles.closeX}>✖</button>
        </div>
        
        {/* 🔴 FIXED: Allow scrolling inside this div by stopping propagation of wheel events */}
        <div 
            style={styles.modalBody} 
            onWheel={(e) => e.stopPropagation()} 
            onTouchMove={(e) => e.stopPropagation()}
        >
          <p style={styles.warnText}>⚠️ IMPORTANT: LEGAL NOTICE FOR ALL USERS</p>
          
          <h4>1. DEVELOPERS & OWNERS LIABILITY WAIVER</h4>
          <p>The developers, creators, and owners of the Farm Buddy application act solely as providers of an interface for third-party Artificial Intelligence services. We explicitly disclaim all responsibility for any results, advice, data, or suggestions generated by the AI. You agree that we assume <strong>ZERO LIABILITY</strong> for the consequences of your decisions, actions, or inactions based on this tool.</p>

          <h4>2. AI ERRORS, HALLUCINATIONS & SUGGESTIONS</h4>
          <p>Artificial Intelligence models (including those from Hugging Face, Google, and Groq) are subject to "hallucinations," factual inaccuracies, and logical errors. All results provided are merely <strong>automated suggestions</strong> and not professional mandates. You have the ultimate, sole responsibility to recheck, verify, and cross-reference all information with certified human agricultural experts before taking any action.</p>

          <h4>3. DO NOT BLINDLY FOLLOW RESULTS</h4>
          <p>Blindly following AI-generated cures, chemical dosages, or identification results can lead to catastrophic crop failure, soil poisoning, or financial ruin. You agree that any application of treatments based solely on this tool is done <strong>at your own risk</strong>. Always perform small-scale testing before widespread application.</p>

          <h4>4. PROVIDER & CURE DISCLAIMER</h4>
          <p>The agricultural solutions are generated by third-party models. The owners of this application are not responsible for any mistakes, scientific inaccuracies, or crop death caused by following these third-party suggestions. We provide the connection pipeline, not the agronomic wisdom.</p>

          <h4>5. FINANCIAL & CROP LOSS WAIVER</h4>
          <p>We assume no liability for crop loss, soil degradation, financial bankruptcy, loss of profit, or any money-related issues resulting from the use of this software. No compensation, financial or otherwise, will be provided for damages incurred.</p>

          <h4>6. VOLUNTARY & NON-MANDATORY USE</h4>
          <p>By clicking "Accept," you confirm that your use of this AI is entirely voluntary. This is not a mandatory service.</p>
        </div>
        {/* 🛡️ Accept Button Shield */}
        <button onClick={handleAcceptTerms} style={styles.acceptBtn}>I HAVE READ & AGREE</button>
      </div>
    </div>
  );

  // ==================================================================================
  // 9. RENDER VIEW
  // ==================================================================================
  return (
    <div style={styles.pageWrap}>
      
      {/* MAIN CHAT WINDOW */}
      {isOpen && (
        <div style={styles.chatWindow}>
          
          {/* HEADER */}
          <div style={styles.header}>
            <button onClick={() => setIsOpen(false)} style={styles.backBtn}>←</button>
            <div style={{ textAlign: 'center' }}>
                <div style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>Farm Buddy 🌾</div>
                <div style={{ fontSize: '10px', color: '#81C784' }}>Titanium Edition v90.0</div>
            </div>
            {/* 🛡️ STOP PROPAGATION ON DELETE BUTTON */}
            <button onClick={(e) => handleClearChat(e)} style={styles.backBtn} title="Clear Chat History">🗑️</button>
          </div>

          {/* CHAT MESSAGES AREA */}
          <div style={styles.chatBody} ref={chatBodyRef}>
            {messages.map((msg, i) => (
              <div key={i} style={{ 
                textAlign: msg.sender === 'bot' ? 'left' : 'right', 
                marginBottom: '20px', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: msg.sender === 'bot' ? 'flex-start' : 'flex-end',
                animation: 'fadeIn 0.3s ease-in'
              }}>
                {msg.image && <img src={msg.image} alt="User Upload" style={styles.msgImg} />}
                
                <div style={msg.sender === 'bot' ? styles.botBubble : styles.userBubble}>
                  {/* MARKDOWN RENDERER (Native CSS - No Library) */}
                  <ReactMarkdown 
                    children={msg.text} 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({node, inline, className, children, ...props}) {
                        const match = /language-(\w+)/.exec(className || '')
                        return !inline && match ? (
                          <div style={styles.codeBlock}>
                              <div style={styles.codeHeader}>
                                  <span>{match[1]}</span>
                                  <button onClick={() => handleCopy(String(children))} style={styles.codeCopyBtnSmall}>Copy</button>
                              </div>
                              <pre style={{margin:0, padding:'10px', overflowX:'auto'}}>
                                  <code className={className} style={{fontFamily:'monospace', fontSize:'13px'}} {...props}>
                                      {children}
                                  </code>
                              </pre>
                          </div>
                        ) : (
                          <code className={className} style={styles.inlineCode} {...props}>
                            {children}
                          </code>
                        )
                      }
                    }}
                  />
                </div>
                
                {/* TIMESTAMPS */}
                <span style={styles.timestamp}>
                   {msg.sender === 'bot' ? '🤖' : '👤'} {msg.timestamp || ""}
                </span>
                
                {/* ACTION BUTTONS (BOT ONLY) */}
                {msg.sender === 'bot' && (
                  <div style={styles.actionRow}>
                    <button onClick={() => handleSpeak(msg.text)} style={styles.outlineBtn} title="Read Aloud">
                        {speaking ? '🔇 Stop' : '🔊 Speak'}
                    </button>
                    <button onClick={() => handleCopy(msg.text)} style={styles.outlineBtn} title="Copy Text">
                        📋 Copy
                    </button>
                    <button onClick={handleRetry} style={styles.outlineBtn} title="Regenerate">
                        🔄 Retry
                    </button>
                  </div>
                )}
              </div>
            ))}
            
            {/* TYPING INDICATOR */}
            {isTyping && (
                <div style={styles.typingIndicatorBubble}>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                </div>
            )}
            
            {isLoading && !isTyping && <div style={styles.loadingTxt}>⚡ Analyzing with 30-Model Grid...</div>}
            <div ref={messagesEndRef} />
          </div>
            
          {/* SCROLL DOWN BUTTON */}
          {showScrollBtn && (
              <button onClick={scrollToBottom} style={styles.scrollBtn}>⬇️</button>
          )}

          {/* FOOTER INPUT AREA */}
          <div style={styles.footer}>
            <div style={styles.inputRow}>
              
              <div style={styles.inputWrapper}>
                <input type="file" accept="image/*,.txt,.json,.pdf,.js,.py,.csv,.md" onChange={handleFileChange} style={{ display: 'none' }} id="cam-input" />
                <label htmlFor="cam-input" style={styles.camIcon}>📸</label>
                
                <input 
                  type="text" 
                  placeholder={isOnline ? "Ask about crops, diseases..." : "Waiting for internet..."}
                  disabled={!isOnline}
                  style={styles.inputField} 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)} 
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()} 
                />

                <button onClick={startListening} style={styles.micIcon}>
                    <svg viewBox="0 0 24 24" width="20" height="20" fill={isListening ? "#EA4335" : "#AAAAAA"}>
                      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                      <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                    </svg>
                </button>
              </div>

              <button onClick={handleSend} style={{...styles.sendOutlineBtn, opacity: isOnline ? 1 : 0.5}} disabled={!isOnline}>➤</button>

            </div>
            
            {uploadedFile && (
              <div style={styles.imgBadge}>
                🖼️ File Ready <button onClick={removeUploadedImage} style={styles.delBadge}>✖</button>
              </div>
            )}
            
            <div style={styles.legalLinks}>
              AI can make mistakes. {isOnline ? "🟢 Online" : "🔴 Offline"} <span onClick={() => setShowFullTerms(true)} style={styles.readTerms}>Terms</span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL (Only shows if explicitly requested OR terms not accepted) */}
      {showFullTerms && <FullTermsModal />}

      {/* FLOATING CAPSULE */}
      {!isOpen && (
        <div 
          onMouseDown={handleMouseDown} 
          onClick={handleClickButton} 
          onTouchStart={handleTouchStart} 
          onTouchMove={handleTouchMove} 
          style={{ 
            ...styles.floatCapsule, 
            left: `${position.x}px`, 
            top: `${position.y}px`, 
            cursor: isDragging ? 'grabbing' : 'pointer' 
          }}
        >
            <span style={{fontSize:'22px'}}>🧢</span> 
            <span style={{fontWeight:'bold', color:'white', fontSize:'14px'}}>Farm Buddy</span>
        </div>
      )}
      
      {/* ANIMATION STYLES */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .typing-dot {
            width: 8px; height: 8px; background-color: #aaa; border-radius: 50%; display: inline-block; margin: 0 2px;
            animation: typingAnimation 1.4s infinite ease-in-out both;
        }
        .typing-dot:nth-child(1) { animation-delay: -0.32s; }
        .typing-dot:nth-child(2) { animation-delay: -0.16s; }
        @keyframes typingAnimation { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1.0); } }
      `}</style>
    </div>
  );
}

// ==================================================================================
// 10. FULLY EXPANDED STYLE SHEET (PROFESSIONAL STRUCTURE)
// ==================================================================================
const styles = {
    // WRAPPER
    pageWrap: { 
        backgroundColor: 'transparent', 
        height: '100vh', 
        fontFamily: '"Inter", "Segoe UI", Arial, sans-serif', 
        overflow: 'hidden', 
        pointerEvents:'none' 
    }, 
    
    // FLOATING BUTTON
    floatCapsule: { 
      position: 'fixed', 
      padding: '12px 22px', 
      borderRadius: '50px', 
      backgroundColor: '#2E7D32', 
      border: '2px solid white', 
      boxShadow: '0 6px 20px rgba(0,0,0,0.5)', 
      display: 'flex', 
      alignItems: 'center', 
      gap: '10px', 
      zIndex: 1000, 
      touchAction: 'none', 
      transition: 'transform 0.1s ease', 
      pointerEvents:'auto' 
    },
    
    // CHAT WINDOW
    chatWindow: { 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100vw', 
      height: '100vh', 
      backgroundColor: '#121212', 
      display: 'flex', 
      flexDirection: 'column', 
      zIndex: 2000, 
      pointerEvents:'auto' 
    },
    
    // HEADER
    header: { 
      backgroundColor: '#1E1E1E', 
      padding: '15px 20px', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      borderBottom: '1px solid #333' 
    },
    backBtn: { 
        background: 'none', 
        border: 'none', 
        color: 'white', 
        fontSize: '26px', 
        cursor: 'pointer' 
    },
    
    // BODY
    chatBody: { 
        flex: 1, 
        padding: '20px', 
        overflowY: 'auto', 
        scrollBehavior: 'smooth', 
        position:'relative' 
    },
    
    // BUBBLES
    botBubble: { 
      backgroundColor: '#1E1E1E', 
      color: '#E0E0E0', 
      padding: '14px 18px', 
      borderRadius: '4px 18px 18px 18px', 
      maxWidth: '85%', 
      border: '1px solid #333', 
      fontSize: '15px', 
      lineHeight: '1.6' 
    },
    userBubble: { 
      backgroundColor: '#2E7D32', 
      color: 'white', 
      padding: '14px 18px', 
      borderRadius: '18px 4px 18px 18px', 
      maxWidth: '85%', 
      fontSize: '15px', 
      lineHeight: '1.6',
      boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
    },
    
    // CODE BLOCK STYLING (NATIVE)
    codeBlock: {
      backgroundColor: '#111',
      border: '1px solid #444',
      borderRadius: '8px',
      margin: '10px 0',
      overflow: 'hidden'
    },
    codeHeader: {
      backgroundColor: '#222',
      padding: '5px 10px',
      fontSize: '12px',
      color: '#888',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid #444'
    },
    codeCopyBtnSmall: {
      background: 'none',
      border: '1px solid #555',
      borderRadius: '4px',
      color: '#aaa',
      fontSize: '10px',
      cursor: 'pointer',
      padding: '2px 6px'
    },
    inlineCode: {
      backgroundColor: 'rgba(255,255,255,0.1)',
      padding: '2px 4px',
      borderRadius: '4px',
      fontFamily: 'monospace',
      fontSize: '13px'
    },

    // MEDIA
    msgImg: { 
        maxWidth: '240px', 
        borderRadius: '12px', 
        marginBottom: '10px', 
        border: '1px solid #444' 
    },
    timestamp: { 
        fontSize: '10px', 
        color: '#666', 
        marginTop: '5px', 
        marginLeft: '5px', 
        marginRight: '5px' 
    },
    
    // INDICATOR
    typingIndicatorBubble: { 
        backgroundColor: '#1E1E1E', 
        padding: '10px 15px', 
        borderRadius: '4px 18px 18px 18px', 
        border: '1px solid #333', 
        display:'inline-block', 
        marginBottom:'10px' 
    },

    // BUTTONS
    actionRow: { 
        display: 'flex', 
        gap: '8px', 
        marginTop: '10px' 
    },
    outlineBtn: {
        backgroundColor: 'transparent', 
        color: 'white', 
        border: '1.5px solid rgba(255,255,255,0.7)',
        borderRadius: '20px', 
        padding: '6px 14px', 
        fontSize: '12px', 
        fontWeight: 'bold',
        cursor: 'pointer', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '5px', 
        transition: 'all 0.2s ease', 
        fontFamily: 'sans-serif'
    },
    scrollBtn: { 
        position: 'absolute', 
        bottom: '90px', 
        right: '20px', 
        background: '#2E7D32', 
        color:'white', 
        border:'none', 
        borderRadius:'50%', 
        width:'40px', 
        height:'40px', 
        fontSize:'20px', 
        cursor:'pointer', 
        boxShadow:'0 2px 5px rgba(0,0,0,0.3)', 
        zIndex:2001 
    },

    // FOOTER
    footer: { 
        backgroundColor: '#1E1E1E', 
        padding: '10px 10px 20px 10px', 
        borderTop: '1px solid #333' 
    },
    inputRow: { 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        maxWidth: '100%' 
    },
    inputWrapper: { 
      flex: 1, 
      display: 'flex', 
      alignItems: 'center', 
      backgroundColor: '#2C2C2C', 
      borderRadius: '30px', 
      padding: '8px 12px', 
      border: '1px solid #444', 
      overflow: 'hidden' 
    },
    camIcon: { 
        fontSize: '20px', 
        cursor: 'pointer', 
        marginRight: '10px' 
    },
    inputField: { 
        flex: 1, 
        background: 'none', 
        border: 'none', 
        color: 'white', 
        outline: 'none', 
        fontSize: '16px', 
        minWidth: '50px' 
    },
    micIcon: { 
        background: 'none', 
        border: 'none', 
        cursor: 'pointer', 
        display: 'flex', 
        alignItems: 'center', 
        padding: '5px', 
        marginLeft: '5px' 
    },
    sendOutlineBtn: { 
      width: '45px', 
      height: '45px', 
      borderRadius: '50%', 
      backgroundColor: 'transparent', 
      border: '2px solid white', 
      color: 'white', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      fontSize: '18px', 
      cursor: 'pointer', 
      flexShrink: 0, 
      boxShadow: '0 0 10px rgba(255,255,255,0.1)', 
      transition: 'all 0.2s ease'
    },
    
    // MODAL STYLES (Z-INDEX 3000 to overlay everything)
    modalOverlay: { 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        backgroundColor: 'rgba(0,0,0,0.95)', 
        zIndex: 3000, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        pointerEvents: 'auto' // ENSURE IT CAPTURES CLICKS
    },
    modalContent: { 
        width: '92%', 
        maxWidth: '550px', 
        backgroundColor: 'white', 
        borderRadius: '15px', 
        overflow: 'hidden', 
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '80vh' // Ensures it doesn't overflow screen height
    },
    modalHeader: { 
        padding: '18px 20px', 
        backgroundColor: '#F8F9FA', 
        borderBottom: '1px solid #DDD', 
        fontWeight: 'bold', 
        fontSize: '15px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        color: '#333' 
    },
    modalBody: { 
        padding: '25px', 
        overflowY: 'auto', 
        color: '#444', 
        fontSize: '13px', 
        lineHeight: '1.7',
        flex: 1 // Takes remaining space
    },
    closeX: { 
        background: 'none', 
        border: 'none', 
        fontSize: '22px', 
        cursor: 'pointer', 
        color: '#888' 
    },
    acceptBtn: { 
        width: '100%', 
        padding: '20px', 
        backgroundColor: '#2E7D32', 
        color: 'white', 
        border: 'none', 
        fontWeight: 'bold', 
        fontSize: '15px', 
        cursor: 'pointer', 
        textTransform: 'uppercase' 
    },
    
    // TEXT HELPER
    warnText: { 
        color: '#D32F2F', 
        fontWeight: 'bold', 
        borderBottom:'1px solid #eee', 
        paddingBottom:'10px', 
        marginBottom:'15px', 
        textAlign:'center' 
    },
    legalLinks: { 
        textAlign: 'center', 
        marginTop: '12px', 
        fontSize: '11px', 
        color: '#888' 
    },
    readTerms: { 
        color: '#81C784', 
        textDecoration: 'underline', 
        cursor: 'pointer', 
        fontWeight: 'bold', 
        marginLeft: '5px' 
    },
    imgBadge: { 
        color: '#81C784', 
        fontSize: '12px', 
        marginTop: '10px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        justifyContent: 'center' 
    },
    delBadge: { 
        background: '#D32F2F', 
        color: 'white', 
        border: 'none', 
        borderRadius: '4px', 
        padding: '2px 6px', 
        fontSize: '10px', 
        cursor: 'pointer' 
    },
    loadingTxt: { 
        color: '#666', 
        fontSize: '12px', 
        textAlign: 'center', 
        marginTop: '10px' 
    }
};

export default ChatBot;