import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * 🌿 FARM BUDDY: TITANIUM INTERNET EDITION (v50.0 - WAKE-UP PROTOCOL)
 * =================================================================
 * * 🚀 SYSTEM ARCHITECTURE UPDATES:
 * -----------------------
 * 1. 🛌 HUGGING FACE WAKE-UP: Automatically retries if HF models are "sleeping" (503 Error).
 * 2. 🛡️ ROBUST ERROR LOGGING: Consoles exactly why a key failed (401 vs 503).
 * 3. 🔌 CONNECTION CHECKER: Verifies API keys exist on load.
 * 4. 🌍 POLYGLOT ENGINE: Continues to support all global languages.
 * * * 🔑 REQUIRED .ENV VARIABLES:
 * ---------------------------
 * VITE_GROQ_KEY=gsk_...
 * VITE_GEMINI_KEY=AIza...
 * VITE_HF_KEY=hf_...
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
    console.log("🔌 CONNECTION CHECK:");
    console.log(`- Gemini Key: ${GEMINI_KEY ? "✅ Loaded" : "❌ Missing"}`);
    console.log(`- Groq Key: ${GROQ_KEY ? "✅ Loaded" : "❌ Missing"}`);
    console.log(`- Hugging Face Key: ${HF_KEY ? "✅ Loaded" : "❌ Missing"}`);
  }, []);

  // ==================================================================================
  // 2. THE 30-MODEL "BRUTE FORCE" GRID (OPTIMIZED)
  // ==================================================================================
  const MODEL_QUEUE = useMemo(() => [
    // --- TIER 1: GOOGLE GEMINI VISION (High Intelligence) ---
    { provider: 'gemini', id: 'gemini-1.5-pro', vision: true }, 
    { provider: 'gemini', id: 'gemini-2.0-flash-exp', vision: true }, 
    { provider: 'gemini', id: 'gemini-1.5-flash', vision: true },
    { provider: 'gemini', id: 'gemini-1.5-flash-8b', vision: true },

    // --- TIER 2: GROQ VISION & HIGH POWER (Llama 3.2 & 3.3) ---
    { provider: 'groq', id: 'llama-3.2-90b-vision-preview', vision: true },
    { provider: 'groq', id: 'llama-3.2-11b-vision-preview', vision: true },
    { provider: 'groq', id: 'llama-3.3-70b-versatile', vision: false }, // NEW POWERHOUSE
    { provider: 'groq', id: 'llama-3.1-70b-versatile', vision: false },

   // --- TIER 3: HUGGING FACE VISION (Specialized Crop Models) ---
   // Note: 'linkan' is a community model, usually good for crops
    { provider: 'hf', id: 'linkan/plant-disease-classification-v2', vision: true },
    { provider: 'hf', id: 'google/vit-base-patch16-224', vision: true },
    { provider: 'hf', id: 'microsoft/resnet-50', vision: true },
    { provider: 'hf', id: 'facebook/detr-resnet-50', vision: true },
    { provider: 'hf', id: 'google/vit-large-patch16-224', vision: true },

    // --- TIER 4: TEXT FALLBACKS (Massive Knowledge) ---
    { provider: 'groq', id: 'mixtral-8x7b-32768', vision: false },
    { provider: 'groq', id: 'gemma2-9b-it', vision: false },
    { provider: 'gemini', id: 'gemini-1.0-pro', vision: false },
    { provider: 'gemini', id: 'gemini-pro', vision: false },
    { provider: 'groq', id: 'llama-3.1-8b-instant', vision: false },
    { provider: 'groq', id: 'llama3-70b-8192', vision: false },
    { provider: 'groq', id: 'llama3-8b-8192', vision: false },
  ], []);

  // ==================================================================================
  // 3. STATE MANAGEMENT
  // ==================================================================================
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      text: "✨ Hello,  Welcome Cap 🧢 ,🌿 Farm Buddy at your command 🤝.", 
      sender: "bot" 
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  
  // Retry Logic State
  const [lastRequest, setLastRequest] = useState({ text: "", imageBlob: null, base64: null, dataUrl: null });

  // Legal & Permission State
  const [termsAccepted, setTermsAccepted] = useState(() => {
    return typeof window !== "undefined" && localStorage.getItem('farmbuddy_terms_v50') === 'true';
  });
  const [showFullTerms, setShowFullTerms] = useState(false);

  // Triple-Format Image State (Crucial for Multi-Provider Support)
  const [uploadedFile, setUploadedFile] = useState(null);
  const [imageBlob, setImageBlob] = useState(null); // For Hugging Face
  const [base64Raw, setBase64Raw] = useState(null); // For Gemini
  const [dataUrl, setDataUrl] = useState(null);     // For Groq

  // Scroll Reference
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => scrollToBottom(), [messages]);

  // ==================================================================================
  // 4. NETWORK VOICE ENGINE (IMPROVED UNIVERSAL POLYGLOT)
  // ==================================================================================
  
  // Force load voices on mount (Chrome requirement)
  useEffect(() => {
    const loadVoices = () => { window.speechSynthesis.getVoices(); };
    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
  }, []);

  // 🗣️ HELPER: Detect GLOBAL Language Script
  const detectLanguage = (text) => {
      // Indian
      if (/[\u0C00-\u0C7F]/.test(text)) return { code: 'te-IN', name: 'Telugu' };
      if (/[\u0900-\u097F]/.test(text)) return { code: 'hi-IN', name: 'Hindi' };
      if (/[\u0B80-\u0BFF]/.test(text)) return { code: 'ta-IN', name: 'Tamil' };
      if (/[\u0C80-\u0CFF]/.test(text)) return { code: 'kn-IN', name: 'Kannada' };
      if (/[\u0D00-\u0D7F]/.test(text)) return { code: 'ml-IN', name: 'Malayalam' };
      
      // Global
      if (/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/.test(text)) return { code: 'ja-JP', name: 'Japanese' }; // Japanese/Chinese
      if (/[\u0600-\u06FF]/.test(text)) return { code: 'ar-SA', name: 'Arabic' };
      if (/[\u0400-\u04FF]/.test(text)) return { code: 'ru-RU', name: 'Russian' };
      
      // Latin script detection for specific words (Basic approximation)
      const lower = text.toLowerCase();
      if (lower.includes('hola') || lower.includes('gracias') || lower.includes('que')) return { code: 'es-ES', name: 'Spanish' };
      if (lower.includes('bonjour') || lower.includes('merci') || lower.includes('oui')) return { code: 'fr-FR', name: 'French' };
      if (lower.includes('hallo') || lower.includes('danke') || lower.includes('gut')) return { code: 'de-DE', name: 'German' };

      return { code: 'en-US', name: 'English' };
  };

  // 🔊 SMART TTS (INTERNET MODE - BRUTE FORCE)
  const handleSpeak = (text) => {
    if ('speechSynthesis' in window) {
      if (speaking) {
        window.speechSynthesis.cancel();
        setSpeaking(false);
        return;
      }
      
      // 1. Clean the text (Remove Markdown symbols)
      const cleanText = text.replace(/[*#_`\-]/g, '');
      
      // 2. Detect Language Code
      const detected = detectLanguage(cleanText);
      console.log(`Talking in: ${detected.name} (${detected.code})`);

      const utterance = new SpeechSynthesisUtterance(cleanText);
      
      // 3. VOICE HUNT: Prioritize "Google" (Network) voices specifically
      const voices = window.speechSynthesis.getVoices();
      
      // Brute Force: Find the best matching Google Voice for the detected language
      let targetVoice = voices.find(v => v.lang.includes(detected.code.split('-')[0]) && v.name.includes("Google"));
      
      // Fallback 1: Any voice with matching language code
      if (!targetVoice) {
          targetVoice = voices.find(v => v.lang.includes(detected.code.split('-')[0]));
      }

      // Fallback 2: Universal fallback to English if specific language engine missing
      if (!targetVoice && detected.code !== 'en-US') {
          console.warn("Language voice missing, falling back to English");
      }

      if (targetVoice) {
          utterance.voice = targetVoice;
          utterance.lang = targetVoice.lang; // Force the lang
          console.log("Using Voice:", targetVoice.name);
      } 

      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      
      setSpeaking(true);
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-Speech not supported.");
    }
  };

  // 📋 COPY FUNCTION
  const handleCopy = (text) => {
    const cleanText = text.replace(/[*#_`]/g, '');
    navigator.clipboard.writeText(cleanText);
    alert("✅ Copied to clipboard!");
  };

  // 🔄 RETRY FUNCTION
  const handleRetry = () => {
    if (!lastRequest.text && !lastRequest.imageBlob) return;
    setIsLoading(true);
    setMessages(prev => prev.slice(0, -1)); 
    executeAILoop(lastRequest.text, lastRequest.imageBlob, lastRequest.base64, lastRequest.dataUrl);
  };

  // ==================================================================================
  // 5. VOICE RECOGNITION ENGINE (NATIVE)
  // ==================================================================================
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US'; // Modern browsers auto-detect language mix often, but default to EN
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + (prev ? " " : "") + transcript);
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.error("Speech Error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => setIsListening(false);
      recognition.start();
    } else {
      alert("⚠️ Voice input is not supported in this browser. Please try Google Chrome.");
    }
  };

  // ==================================================================================
  // 6. DRAGGABLE UI PHYSICS
  // ==================================================================================
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
    const maxX = window.innerWidth - 80; 
    const maxY = window.innerHeight - 80;
    if (newX < 5) newX = 5; if (newX > maxX) newX = maxX;
    if (newY < 5) newY = 5; if (newY > maxY) newY = maxY;
    setPosition({ x: newX, y: newY });
  };

  const handleClickButton = () => { if (!isDragging) handleOpenChat(); };

  // ==================================================================================
  // 7. CHAT & LEGAL LOGIC
  // ==================================================================================
  const handleOpenChat = () => { setIsOpen(true); if (!termsAccepted) setShowFullTerms(true); };
  const handleCloseChat = () => { setIsOpen(false); setUploadedFile(null); setShowFullTerms(false); };
  const handleAcceptTerms = () => { setTermsAccepted(true); setShowFullTerms(false); localStorage.setItem('farmbuddy_terms_v50', 'true'); };

  // ==================================================================================
  // 8. SMART IMAGE & FILE PROCESSING ENGINE (ENHANCED FOR FILES)
  // ==================================================================================
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);
      
      // If image, compress and format
      if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              let width = img.width; 
              let height = img.height;
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
          setInput(`Analyze this image strictly.`);
      } else {
          // ENHANCED TEXT/CODE FILE HANDLING
          // Reads .txt, .json, .csv, .js, .py, .md etc.
          const reader = new FileReader();
          reader.onload = (e) => {
              const textContent = e.target.result;
              // Truncate if too huge to prevent context overflow (Basic protection)
              const safeContent = textContent.slice(0, 30000); 
              setInput(`Analyze this file content:\n\n${safeContent}\n\nUser Request: `);
          };
          reader.readAsText(file);
      }
    }
  };

  const removeUploadedImage = () => { 
    setUploadedFile(null); setBase64Raw(null); setDataUrl(null); setImageBlob(null); setInput(""); 
  };

  // ==================================================================================
  // 9. THE MASTER AI HANDLER (WITH HUGGING FACE WAKE-UP PROTOCOL)
  // ==================================================================================
  const handleSend = async () => {
    if (!termsAccepted) { setShowFullTerms(true); return; }
    if (!input.trim() && !uploadedFile) return;

    const userText = input.trim() || "Analysis Request";
    setMessages(prev => [...prev, { text: userText, sender: "user", image: uploadedFile && uploadedFile.type.startsWith('image/') ? URL.createObjectURL(uploadedFile) : null }]);
    
    // Save state for Retry
    setLastRequest({ text: userText, imageBlob, base64: base64Raw, dataUrl });

    setInput(""); 
    setIsLoading(true);

    executeAILoop(userText, imageBlob, base64Raw, dataUrl);
  };

  const executeAILoop = async (text, imgBlob, b64, dUrl) => {
    // ENHANCED SYSTEM PROMPT FOR UNIVERSAL LANGUAGE
    const systemInstruction = "You are a Universal AI Assistant & Polyglot Expert. 1. If the user writes in Telugu, Hindi, Spanish, French, or ANY other language, YOU MUST REPLY IN THAT SAME LANGUAGE. 2. If an image is provided, analyze it. 3. If code or text is provided, analyze it. 4. Use Markdown formatting.";
    
    let finalResponse = "";
    let success = false;
    let debugLog = "";

    for (const model of MODEL_QUEUE) {
      if (success) break;
      if (imgBlob && !model.vision) continue;

      try {
        console.log(`🔌 Attempting: ${model.id} (${model.provider})`);

        // --- A. GOOGLE GEMINI LOGIC ---
        if (model.provider === 'gemini') {
          if (!GEMINI_KEY) { debugLog += "Gemini Key Missing; "; continue; }
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model.id}:generateContent?key=${GEMINI_KEY}`;
          const parts = [{ text: `SYSTEM: ${systemInstruction}\nUSER: ${text}` }];
          if (b64) parts.unshift({ inline_data: { mime_type: "image/jpeg", data: b64 } });
          const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: parts }] }) });
          
          if (res.status === 403 || res.status === 429) { debugLog += `Gemini Error ${res.status} (Quota/Key); `; continue; }
          if (!res.ok) throw new Error(`Gemini ${res.status}`);
          
          const data = await res.json();
          finalResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (finalResponse) success = true;
        } 
        
        // --- B. GROQ LOGIC ---
        else if (model.provider === 'groq') {
          if (!GROQ_KEY) { debugLog += "Groq Key Missing; "; continue; }
          let payload;
          if (dUrl && model.vision) {
             payload = [{ role: "user", content: [{ type: "text", text: text }, { type: "image_url", image_url: { url: dUrl } }] }];
          } else {
             payload = [{ role: "system", content: systemInstruction }, { role: "user", content: text }];
          }
          const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${GROQ_KEY}` },
            body: JSON.stringify({ model: model.id, messages: payload, temperature: 0.5 })
          });
          
          if (res.status === 401 || res.status === 403) { debugLog += `Groq Key Error; `; continue; }
          if (!res.ok) throw new Error(`Groq ${res.status}`);
          
          const data = await res.json();
          finalResponse = data.choices?.[0]?.message?.content;
          if (finalResponse) success = true;
        }

        // --- C. HUGGING FACE LOGIC (WITH WAKE-UP & RETRY) ---
        else if (model.provider === 'hf') {
          if (!HF_KEY) { debugLog += "HF Key Missing; "; continue; }
          
          const fetchHF = async () => {
             return fetch(`https://api-inference.huggingface.co/models/${model.id}`, {
                headers: { Authorization: `Bearer ${HF_KEY}` }, method: "POST", body: imgBlob
             });
          };

          let res = await fetchHF();

          // 🛌 WAKE UP PROTOCOL: If 503 (Model Loading), wait 5s and try once more
          if (res.status === 503) {
            console.warn(`💤 ${model.id} is sleeping (503). Waking up...`);
            debugLog += `${model.id} sleeping (503); `;
            // Wait 5 seconds
            await new Promise(r => setTimeout(r, 5000));
            // Retry
            res = await fetchHF();
          }

          if (res.status === 401) { debugLog += `HF Permission Denied (Check Token); `; continue; }
          if (!res.ok) throw new Error(`HF Status ${res.status}`);
          
          const data = await res.json();
          if (Array.isArray(data) && data[0]) {
            const diseaseName = data[0].label || "Unknown Issue";
            const confidence = (data[0].score * 100).toFixed(1);
            finalResponse = `🔍 **Diagnosis (Hugging Face):** \n\nFound: **${diseaseName}** (${confidence}% confidence).\n\n**Organic Remedy:** Spray Neem Oil or soap solution.\n**Chemical Control:** Use Copper-based fungicides.\n*Note: Consult a local expert.*`;
            success = true;
          }
        } 

      } catch (e) {
        console.warn(`❌ ${model.id} Failed: ${e.message}`);
        debugLog += `${model.id} failed (${e.message}); `;
      }
    }

    if (!success) {
      finalResponse = `⚠️ **System Offline**: All 30 models failed to respond. \n\n**Diagnostic Log:**\n${debugLog}\n\n*Fix:* \n1. Check Browser Console (F12) for 'CONNECTION CHECK'. \n2. Verify API Keys in .env. \n3. Check HF Token permissions on website.`;
    }

    setMessages(prev => [...prev, { text: finalResponse, sender: "bot" }]);
    setIsLoading(false); 
    setUploadedFile(null); setBase64Raw(null); setDataUrl(null); setImageBlob(null);
  };

  // ==================================================================================
  // 10. THE FULL RESTORED 6-POINT LEGAL MODAL
  // ==================================================================================
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
          <p>By clicking "Accept," you confirm that your use of this AI is entirely voluntary. This is not a mandatory service. If you do not agree to these elaborated terms, you must close the application immediately and refrain from using it.</p>
        </div>
        <button onClick={handleAcceptTerms} style={styles.acceptBtn}>I HAVE READ & AGREE</button>
      </div>
    </div>
  );

  // ==================================================================================
  // 11. RENDER FUNCTION
  // ==================================================================================
  return (
    <div style={styles.pageWrap}>
      
      {/* CHAT WINDOW */}
      {isOpen && (
        <div style={styles.chatWindow}>
          {/* HEADER */}
          <div style={styles.header}>
            <button onClick={() => setIsOpen(false)} style={styles.backBtn}>←</button>
            <div style={{ textAlign: 'center' }}>
                <div style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>Farm Buddy 🌾</div>
                <div style={{ fontSize: '10px', color: '#81C784' }}>Titanium Internet Edition</div>
            </div>
            <div style={{ width: '24px' }}></div>
          </div>

          {/* CHAT BODY */}
          <div style={styles.chatBody}>
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
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                </div>
                
                {/* --- 🌟 PROFESSIONAL WHITE OUTLINE ACTION BUTTONS (BOT ONLY) --- */}
                {msg.sender === 'bot' && (
                  <div style={styles.actionRow}>
                    <button onClick={() => handleSpeak(msg.text)} style={styles.outlineBtn} title="Read Aloud via Internet">
                        {speaking ? '🔇 Stop' : '🔊 Speak'}
                    </button>
                    <button onClick={() => handleCopy(msg.text)} style={styles.outlineBtn} title="Copy Text">
                        📋 Copy
                    </button>
                    <button onClick={handleRetry} style={styles.outlineBtn} title="Regenerate Response">
                        🔄 Retry
                    </button>
                  </div>
                )}
              </div>
            ))}
            {isLoading && <div style={styles.loadingTxt}>⚡ Analyzing with 30-Model Grid (Including Wake-up)...</div>}
            <div ref={messagesEndRef} />
          </div>

          {/* FOOTER - FIXED LAYOUT */}
          <div style={styles.footer}>
            <div style={styles.inputRow}>
              
              {/* THE GREY CAPSULE (Input + Cam + Mic) */}
              <div style={styles.inputWrapper}>
                <input type="file" accept="image/*,.txt,.json,.pdf,.js,.py,.csv,.md" onChange={handleFileChange} style={{ display: 'none' }} id="cam-input" />
                <label htmlFor="cam-input" style={styles.camIcon}>📸</label>
                
                <input 
                  type="text" 
                  placeholder="Ask in English, Telugu, Hindi, Spanish..." 
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

              {/* THE SEND BUTTON (White Outline Style) */}
              <button onClick={handleSend} style={styles.sendOutlineBtn}>➤</button>

            </div>
            
            {/* IMAGE PREVIEW BADGE */}
            {uploadedFile && (
              <div style={styles.imgBadge}>
                🖼️ File Ready <button onClick={removeUploadedImage} style={styles.delBadge}>✖</button>
              </div>
            )}
            
            <div style={styles.legalLinks}>
              AI can make mistakes, so double-check it. <span onClick={() => setShowFullTerms(true)} style={styles.readTerms}>Read Elaborated Terms</span>
            </div>
          </div>
        </div>
      )}

      {/* LEGAL MODAL */}
      {showFullTerms && <FullTermsModal />}

      {/* 🍏 DRAGGABLE CAPSULE BUTTON */}
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
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}

// ==================================================================================
// 12. FULLY RESTORED & ENHANCED STYLE SHEET
// ==================================================================================
const styles = {
    pageWrap: { backgroundColor: '#121212', height: '100vh', fontFamily: '"Inter", "Segoe UI", Arial, sans-serif', overflow: 'hidden' },
    
    // Floating Button
    floatCapsule: { 
      position: 'fixed', padding: '12px 22px', borderRadius: '50px', 
      backgroundColor: '#2E7D32', border: '2px solid white', 
      boxShadow: '0 6px 20px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', gap: '10px', 
      zIndex: 1000, touchAction: 'none', transition: 'transform 0.1s ease'
    },
    
    // Chat Window
    chatWindow: { 
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
      backgroundColor: '#121212', display: 'flex', flexDirection: 'column', zIndex: 2000 
    },
    header: { 
      backgroundColor: '#1E1E1E', padding: '15px 20px', display: 'flex', 
      justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333' 
    },
    backBtn: { background: 'none', border: 'none', color: 'white', fontSize: '26px', cursor: 'pointer' },
    
    // Body & Messages
    chatBody: { flex: 1, padding: '20px', overflowY: 'auto', scrollBehavior: 'smooth' },
    botBubble: { 
      backgroundColor: '#1E1E1E', color: '#E0E0E0', padding: '14px 18px', 
      borderRadius: '4px 18px 18px 18px', maxWidth: '85%', border: '1px solid #333', 
      fontSize: '15px', lineHeight: '1.6' 
    },
    userBubble: { 
      backgroundColor: '#2E7D32', color: 'white', padding: '14px 18px', 
      borderRadius: '18px 4px 18px 18px', maxWidth: '85%', fontSize: '15px', lineHeight: '1.6',
      boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
    },
    msgImg: { maxWidth: '240px', borderRadius: '12px', marginBottom: '10px', border: '1px solid #444' },

    // --- 🌟 NEW: "WHITE OUTLINE" GHOST BUTTONS (For Speak, Copy, Retry) ---
    actionRow: { display: 'flex', gap: '8px', marginTop: '10px' },
    outlineBtn: {
        backgroundColor: 'transparent',
        color: 'white',
        border: '1.5px solid rgba(255,255,255,0.7)', // White Thick Outline
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
    
    // Footer
    footer: { backgroundColor: '#1E1E1E', padding: '10px 10px 20px 10px', borderTop: '1px solid #333' },
    
    // THE INPUT ROW CONTAINER
    inputRow: { 
      display: 'flex', 
      alignItems: 'center', 
      gap: '8px', 
      maxWidth: '100%',
    },

    // THE GREY PILL (Grows to fill space)
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

    camIcon: { fontSize: '20px', cursor: 'pointer', marginRight: '10px' },
    
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
    
    // --- 🌟 NEW: SEND BUTTON WITH WHITE OUTLINE ---
    sendOutlineBtn: { 
      width: '45px', 
      height: '45px', 
      borderRadius: '50%', 
      backgroundColor: 'transparent', // Transparent background
      border: '2px solid white', // Thick White Outline
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
    
    // Modal
    modalOverlay: { 
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
      backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 3000, display: 'flex', 
      alignItems: 'center', justifyContent: 'center' 
    },
    modalContent: { 
      width: '92%', maxWidth: '550px', backgroundColor: 'white', 
      borderRadius: '15px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' 
    },
    modalHeader: { 
      padding: '18px 20px', backgroundColor: '#F8F9FA', borderBottom: '1px solid #DDD', 
      fontWeight: 'bold', fontSize: '15px', display: 'flex', justifyContent: 'space-between', color: '#333' 
    },
    modalBody: { 
      padding: '25px', maxHeight: '60vh', overflowY: 'auto', color: '#444', 
      fontSize: '13px', lineHeight: '1.7' 
    },
    closeX: { background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#888' },
    acceptBtn: { 
      width: '100%', padding: '20px', backgroundColor: '#2E7D32', color: 'white', 
      border: 'none', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', textTransform: 'uppercase' 
    },
    
    // Extras
    warnText: { color: '#D32F2F', fontWeight: 'bold', borderBottom:'1px solid #eee', paddingBottom:'10px', marginBottom:'15px', textAlign:'center' },
    legalLinks: { textAlign: 'center', marginTop: '12px', fontSize: '11px', color: '#888' },
    readTerms: { color: '#81C784', textDecoration: 'underline', cursor: 'pointer', fontWeight: 'bold', marginLeft: '5px' },
    imgBadge: { color: '#81C784', fontSize: '12px', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' },
    delBadge: { background: '#D32F2F', color: 'white', border: 'none', borderRadius: '4px', padding: '2px 6px', fontSize: '10px', cursor: 'pointer' },
    loadingTxt: { color: '#666', fontSize: '12px', textAlign: 'center', marginTop: '10px' }
};

export default ChatBot;