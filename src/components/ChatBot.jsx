import React, { 
  useState, 
  useEffect, 
  useRef, 
  useMemo, 
  useCallback 
} from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * =================================================================================================
 * 🌿 FARM BUDDY: TITANIUM "GENESIS" EDITION (v107.0)
 * =================================================================================================
 * * PROPRIETARY AGRICULTURAL AI INTERFACE & DIAGNOSTIC ENGINE
 * COPYRIGHT © 2026 FARM BUDDY INC.
 * DEVELOPED FOR: HIGH-PERFORMANCE WEB & MOBILE ENVIRONMENTS
 * * =================================================================================================
 */

function ChatBot() {

  // ===============================================================================================
  // SECTION 1: SECURE ENVIRONMENT CONFIGURATION & DIAGNOSTICS
  // ===============================================================================================
  
  const GROQ_KEY = import.meta.env.VITE_GROQ_KEY;
  const GEMINI_KEY = import.meta.env.VITE_GEMINI_KEY; 
  const HF_KEY = import.meta.env.VITE_HF_KEY; 

  // 🛠️ SYSTEM BOOT SEQUENCE
  useEffect(() => {
    console.group("🚀 FARM BUDDY: GENESIS KERNEL INITIALIZED");
    console.log("Kernel Version: v107.0 (Titanium)");
    
    const status = {
        GROQ: GROQ_KEY ? "🟢 ONLINE" : "🔴 OFFLINE",
        GEMINI: GEMINI_KEY ? "🟢 ONLINE" : "🔴 OFFLINE",
        HF: HF_KEY ? "🟢 ONLINE" : "🔴 OFFLINE"
    };
    console.table(status);
    console.groupEnd();
  }, [GROQ_KEY, GEMINI_KEY, HF_KEY]);


  // ===============================================================================================
  // SECTION 2: THE "BRUTE FORCE" MODEL GRID (FULL 30+ MODELS)
  // ===============================================================================================
  
  const MODEL_QUEUE = useMemo(() => [
    { provider: 'gemini', id: 'gemini-1.5-flash', vision: true, desc: "Gemini 1.5 Flash" },
    { provider: 'gemini', id: 'gemini-1.5-pro', vision: true, desc: "Gemini 1.5 Pro" },
    { provider: 'groq', id: 'llama-3.2-11b-vision-preview', vision: true, desc: "Llama 3.2 11B Vision" },
    { provider: 'groq', id: 'llama-3.2-90b-vision-preview', vision: true, desc: "Llama 3.2 90B Vision" },
    { provider: 'hf', id: 'linkan/plant-disease-classification-v2', vision: true, desc: "HF Plant Disease V2" },
    { provider: 'hf', id: 'google/vit-base-patch16-224', vision: true, desc: "Google ViT" },
    { provider: 'hf', id: 'microsoft/resnet-50', vision: true, desc: "ResNet-50" },
    { provider: 'hf', id: 'facebook/detr-resnet-50', vision: true, desc: "Facebook DETR" },
    { provider: 'hf', id: 'google/vit-large-patch16-224', vision: true, desc: "Google ViT Large" },
    { provider: 'hf', id: 'nateraw/vit-base-beans', vision: true, desc: "HF Beans Disease" },
    { provider: 'hf', id: 'jazmys/vit-base-patch16-224-in21k-finetuned-lora-food', vision: true, desc: "HF Food Analysis" },
    { provider: 'gemini', id: 'gemini-2.0-flash-exp', vision: true, desc: "Gemini 2.0 Exp" },
    { provider: 'gemini', id: 'gemini-pro-vision', vision: true, desc: "Gemini 1.0 Vision" },
    { provider: 'gemini', id: 'gemini-1.5-flash-8b', vision: true, desc: "Gemini 1.5 Flash 8B" },
    { provider: 'groq', id: 'llama-3.3-70b-versatile', vision: false }, 
    { provider: 'groq', id: 'llama-3.1-70b-versatile', vision: false },
    { provider: 'groq', id: 'llama-3.1-8b-instant', vision: false },
    { provider: 'groq', id: 'llama3-70b-8192', vision: false },
    { provider: 'groq', id: 'llama3-8b-8192', vision: false },
    { provider: 'groq', id: 'mixtral-8x7b-32768', vision: false },
    { provider: 'groq', id: 'gemma2-9b-it', vision: false },
    { provider: 'groq', id: 'gemma-7b-it', vision: false },
    { provider: 'gemini', id: 'gemini-1.0-pro', vision: false },
    { provider: 'gemini', id: 'gemini-pro', vision: false },
    { provider: 'gemini', id: 'text-bison-001', vision: false },
    { provider: 'gemini', id: 'chat-bison-001', vision: false },
    { provider: 'groq', id: 'llama3-groq-70b-8192-tool-use-preview', vision: false },
    { provider: 'groq', id: 'llama3-groq-8b-8192-tool-use-preview', vision: false },
  ], []);


  // ===============================================================================================
  // SECTION 3: ADVANCED REACT STATE ARCHITECTURE
  // ===============================================================================================
  
  // UI States
  const [isOpen, setIsOpen] = useState(false); 
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showScrollBtn, setShowScrollBtn] = useState(false); 
  const [showSidebar, setShowSidebar] = useState(false); 

  // Session & History Persistence
  const [sessions, setSessions] = useState(() => {
      try {
          const saved = localStorage.getItem('farmbuddy_sessions_v106');
          if (saved) return JSON.parse(saved);
      } catch (e) { console.error("History Error", e); }
      return []; 
  });
  
  const [currentSessionId, setCurrentSessionId] = useState(null);

  // ✏️ EDITING STATES (TITLES & MESSAGES)
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editTitleInput, setEditTitleInput] = useState("");
  const [editingMessageIndex, setEditingMessageIndex] = useState(null);
  const [editMessageText, setEditMessageText] = useState("");

  // 3.3 Greeting Generator
  const getGreeting = useCallback(() => ({ 
      text: "🚜 **Farm Buddy: Genesis Mode.**\n\nI am connected to the Titanium v107 Grid. \n\n📸 **Upload a photo** to unleash the vision engine.\n🎨 **Type 'Generate an image of...'** for AI art.\n\n*System Ready. Awaiting input.*", 
      sender: "bot",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }), []);

  // 3.4 Session Initialization
  useEffect(() => {
      if (sessions.length === 0) {
          const newId = Date.now();
          setSessions([{ id: newId, title: "New Farm Consultation", messages: [getGreeting()] }]);
          setCurrentSessionId(newId);
      } else if (!currentSessionId) {
          setCurrentSessionId(sessions[0].id);
      }
  }, [sessions, currentSessionId, getGreeting]);

  // 3.5 Session Save
  useEffect(() => {
      if (sessions.length > 0) {
          localStorage.setItem('farmbuddy_sessions_v106', JSON.stringify(sessions));
      }
  }, [sessions]);

  // 3.6 Active Message List
  const messages = useMemo(() => {
      const sess = sessions.find(s => s.id === currentSessionId);
      return sess ? sess.messages : [getGreeting()];
  }, [sessions, currentSessionId, getGreeting]);


  // 3.7 Input & Processing States
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false); 
  const [isListening, setIsListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  
  // 3.8 Retry Cache
  const [lastRequest, setLastRequest] = useState({ 
      text: "", 
      rawBase64: null, 
      dataUrl: null, 
      mimeType: null 
  });

  // 3.9 Legal & Permission (UPDATED KEY v107)
  const [termsAccepted, setTermsAccepted] = useState(() => {
    // We use v107 to force a reset, ensuring the user sees it "the first time" on this update
    return typeof window !== "undefined" && localStorage.getItem('farmbuddy_terms_v107') === 'true';
  });
  const [showFullTerms, setShowFullTerms] = useState(false);

  // 3.10 Image Processing States
  const [uploadedFile, setUploadedFile] = useState(null);
  const [rawBase64, setRawBase64] = useState(null); 
  const [dataUrl, setDataUrl] = useState(null); 
  const [mimeType, setMimeType] = useState(null);     

  // 3.11 Scrolling
  const messagesEndRef = useRef(null);
  const chatBodyRef = useRef(null);
  
  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); };
  useEffect(() => { scrollToBottom(); }, [messages, isTyping, isLoading]);

  useEffect(() => {
      const handleScroll = () => {
          if (chatBodyRef.current) {
              const { scrollTop, scrollHeight, clientHeight } = chatBodyRef.current;
              setShowScrollBtn(scrollHeight - scrollTop > clientHeight + 100);
          }
      };
      const ref = chatBodyRef.current;
      ref?.addEventListener('scroll', handleScroll);
      return () => ref?.removeEventListener('scroll', handleScroll);
  }, [isOpen]);

  // ===============================================================================================
  // SECTION 4: STATE MUTATION HELPERS
  // ===============================================================================================

  const handleNewChat = () => {
      const newId = Date.now();
      setSessions(prev => [{ id: newId, title: "New Farm Consultation", messages: [getGreeting()] }, ...prev]);
      setCurrentSessionId(newId);
      setShowSidebar(false);
  };

  const handleDeleteChat = (e, idToDelete) => {
      e.stopPropagation();
      if (!window.confirm("Delete this report permanently?")) return;
      
      const updatedSessions = sessions.filter(s => s.id !== idToDelete);
      setSessions(updatedSessions);
      
      if (idToDelete === currentSessionId) {
          if (updatedSessions.length > 0) {
              setCurrentSessionId(updatedSessions[0].id);
          } else {
              const newId = Date.now();
              setSessions([{ id: newId, title: "New Farm Consultation", messages: [getGreeting()] }]);
              setCurrentSessionId(newId);
          }
      }
  };

  const handleClearChat = (e) => {
      if(e && e.stopPropagation) e.stopPropagation();
      if(window.confirm("Clear this active conversation?")) {
          setSessions(prev => prev.map(s => {
              if(s.id === currentSessionId) {
                  return { ...s, messages: [getGreeting()] };
              }
              return s;
          }));
      }
  };

  const addMessage = (msg) => {
      setSessions(prev => prev.map(s => {
          if (s.id === currentSessionId) {
              let newTitle = s.title;
              const userMsgCount = s.messages.filter(m => m.sender === 'user').length;
              if (userMsgCount === 0 && msg.sender === 'user') {
                  newTitle = msg.text.slice(0, 30) + (msg.text.length > 30 ? "..." : "");
              }
              return { ...s, title: newTitle, messages: [...s.messages, msg] };
          }
          return s;
      }));
  };

  // ✏️ EDITING FUNCTIONS
  const startEditingSession = (e, session) => {
      e.stopPropagation();
      setEditingSessionId(session.id);
      setEditTitleInput(session.title);
  };

  const saveSessionTitle = (e) => {
      e.stopPropagation();
      setSessions(prev => prev.map(s => s.id === editingSessionId ? { ...s, title: editTitleInput } : s));
      setEditingSessionId(null);
  };

  const startEditingMessage = (index, currentText) => {
      setEditingMessageIndex(index);
      setEditMessageText(currentText);
  };

  const cancelEditingMessage = () => {
      setEditingMessageIndex(null);
      setEditMessageText("");
  };

  const saveAndRegenerateMessage = (index) => {
      const currentMessages = sessions.find(s => s.id === currentSessionId).messages;
      const slicedMessages = currentMessages.slice(0, index);
      const newMessage = {
          text: editMessageText,
          sender: "user",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          image: currentMessages[index].image 
      };

      setSessions(prev => prev.map(s => {
          if (s.id === currentSessionId) {
              return { ...s, messages: [...slicedMessages, newMessage] };
          }
          return s;
      }));

      setEditingMessageIndex(null);
      setEditMessageText("");
      setIsLoading(true);
      setIsTyping(true);
      executeAILoop(editMessageText, rawBase64, dataUrl, mimeType);
  };

  // ===============================================================================================
  // SECTION 5: UTILITIES (TTS, COPY, RETRY)
  // ===============================================================================================
  
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
      
      let targetVoice = voices.find(v => 
          (v.name.includes("Natural") || v.name.includes("Neural")) && 
          v.lang.includes(detected.code.split('-')[0])
      );

      if (!targetVoice) targetVoice = voices.find(v => v.lang.includes(detected.code.split('-')[0]));

      if (targetVoice) {
          utterance.voice = targetVoice;
          utterance.lang = targetVoice.lang;
      } 
      
      utterance.rate = 0.95; 
      utterance.pitch = 1.0; 
      
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      
      setSpeaking(true);
      window.speechSynthesis.speak(utterance);
    } else {
      alert("TTS Not Supported in this browser.");
    }
  };

  const handleCopy = (text) => {
    const cleanText = text.replace(/[*#_`]/g, '');
    navigator.clipboard.writeText(cleanText)
      .then(() => alert("✅ Copied to clipboard!"))
      .catch(() => alert("❌ Copy failed."));
  };

  const handleRetry = () => {
    if (!lastRequest.text && !lastRequest.dataUrl) return;
    setIsLoading(true);
    setSessions(prev => prev.map(s => {
        if(s.id === currentSessionId && s.messages.length > 0 && s.messages[s.messages.length - 1].sender === 'bot') {
            return { ...s, messages: s.messages.slice(0, -1) };
        }
        return s;
    }));
    executeAILoop(lastRequest.text, lastRequest.rawBase64, lastRequest.dataUrl, lastRequest.mimeType);
  };

  // ===============================================================================================
  // SECTION 6: BOUNDARY-PROTECTED DRAGGABLE UI & TERMS LOGIC
  // ===============================================================================================
  const [position, setPosition] = useState({ x: window.innerWidth - 100, y: window.innerHeight - 100 });
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
    
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const capsuleWidth = 160; 
    const capsuleHeight = 50;
    const padding = 10;

    if (newX < padding) newX = padding;
    if (newX > screenWidth - capsuleWidth - padding) newX = screenWidth - capsuleWidth - padding;
    if (newY < padding) newY = padding;
    if (newY > screenHeight - capsuleHeight - padding) newY = screenHeight - capsuleHeight - padding;
    
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
    
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const capsuleWidth = 160;
    const capsuleHeight = 50;
    const padding = 10;

    if (newX < padding) newX = padding;
    if (newX > screenWidth - capsuleWidth - padding) newX = screenWidth - capsuleWidth - padding;
    if (newY < padding) newY = padding;
    if (newY > screenHeight - capsuleHeight - padding) newY = screenHeight - capsuleHeight - padding;
    
    setPosition({ x: newX, y: newY });
  };

  const handleClickButton = () => { 
      if (!isDragging) {
          handleOpenChat();
      }
  };
  
  const handleOpenChat = () => { 
      setIsOpen(true); 
      // STRICT CHECK: If terms not accepted, show modal immediately.
      if (!termsAccepted) { 
          setShowFullTerms(true); 
      }
  };
  
  const handleAcceptTerms = (e) => { 
      if(e && e.stopPropagation) e.stopPropagation(); 
      setTermsAccepted(true); 
      setShowFullTerms(false); 
      localStorage.setItem('farmbuddy_terms_v107', 'true'); 
      setIsOpen(true); 
  };

  const handleCloseTerms = (e) => {
      if(e && e.stopPropagation) e.stopPropagation();
      setShowFullTerms(false);
      // STRICT KICK-OUT: If they close the terms modal without accepting, close the whole chat.
      if(!termsAccepted) setIsOpen(false);
  };

  // ===============================================================================================
  // SECTION 7: "PRE-FLIGHT" IMAGE ALGORITHM
  // ===============================================================================================
  
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

  const processImageForAI = (imgElement) => {
      const canvas = document.createElement('canvas');
      let width = imgElement.width; 
      let height = imgElement.height; 

      const MAX_DIM = 512; 
      
      if (width > MAX_DIM || height > MAX_DIM) {
        if (width > height) { 
            height *= MAX_DIM/width; 
            width = MAX_DIM; 
        } else { 
            width *= MAX_DIM/height; 
            height = MAX_DIM; 
        }
      }
      
      canvas.width = width; 
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true; 
      ctx.drawImage(imgElement, 0, 0, width, height);
      
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8); 
      const rawBase64 = dataUrl.split(',')[1];

      return { dataUrl, rawBase64 };
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    event.target.value = ''; 
    setUploadedFile(file);
    setMimeType(file.type); 

    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const { dataUrl, rawBase64 } = processImageForAI(img);
            setDataUrl(dataUrl);
            setRawBase64(rawBase64);
            setMimeType('image/jpeg');
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
        setInput(`Analyze this crop image strictly for diseases.`);
    } else {
        const reader = new FileReader();
        reader.onload = (e) => {
            const textContent = e.target.result.slice(0, 30000); 
            setInput(`Analyze this file content:\n\n${textContent}\n\nUser Request: `);
        };
        reader.readAsText(file);
    }
  };

  const removeUploadedImage = () => { 
    setUploadedFile(null); 
    setRawBase64(null); 
    setDataUrl(null); 
    setInput(""); 
    setMimeType(null);
  };

  // ===============================================================================================
  // SECTION 8: MASTER AI ORCHESTRATOR
  // ===============================================================================================
  
  const handleSend = async () => {
    // DOUBLE CHECK: Even if they bypass UI, logic prevents sending without terms.
    if (!termsAccepted) { setShowFullTerms(true); return; }
    
    if (!isOnline) { 
        addMessage({ text: "⚠️ **Connection Error:** You are currently OFFLINE.", sender: "bot", timestamp: new Date().toLocaleTimeString() }); 
        return; 
    }
    if (!input.trim() && !uploadedFile) return;

    const userText = input.trim() || "Analysis Request";
    addMessage({ 
        text: userText, 
        sender: "user", 
        image: dataUrl, 
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    });
    
    setLastRequest({ text: userText, rawBase64, dataUrl, mimeType });
    setInput(""); 
    setUploadedFile(null); 
    setIsLoading(true); 
    setIsTyping(true);
    
    executeAILoop(userText, rawBase64, dataUrl, mimeType);
  };

  const executeAILoop = async (text, rBase64, dUrl, mType) => {
    // 🎨 GEN-AI Check
    if (text.toLowerCase().startsWith("generate an image") || text.toLowerCase().startsWith("draw") || text.toLowerCase().startsWith("create an image")) {
        try {
            if (!HF_KEY) throw new Error("Missing Hugging Face API Key");
            const res = await fetch("https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0", {
                method: "POST",
                headers: { Authorization: `Bearer ${HF_KEY}`, "Content-Type": "application/json", "x-use-cache": "false" },
                body: JSON.stringify({ inputs: text }),
            });
            if (!res.ok) throw new Error(`Generation Failed: ${res.status}`);
            const imageBlob = await res.blob();
            const imageUrl = URL.createObjectURL(imageBlob);
            addMessage({ text: `🎨 **Generated Image for:**\n"${text}"`, sender: "bot", image: imageUrl, timestamp: new Date().toLocaleTimeString() });
            setIsLoading(false); setIsTyping(false);
            return; 
        } catch(e) { console.error("Image Gen Error:", e); }
    }

    // 🧠 ANALYTICAL LOOP
    const systemInstruction = `You are 'Farm Buddy', an expert Agricultural AI assistant.
    1. Default Language: ENGLISH.
    2. Reply in Hindi/Telugu/Tamil ONLY if user asks.
    3. Analyze crop images for diseases.`;
    
    let finalResponse = ""; 
    let success = false; 
    let debugLog = "";
    
    const hasImage = !!(rBase64 && dUrl);
    const queue = hasImage ? MODEL_QUEUE.filter(m => m.vision === true) : MODEL_QUEUE;
    
    if (hasImage && queue.length === 0) {
        addMessage({ text: "⚠️ **Configuration Error:** No vision-capable models available.", sender: "bot", timestamp: new Date().toLocaleTimeString() });
        setIsLoading(false); setIsTyping(false);
        return;
    }

    for (const model of queue) {
      if (success) break;
      try {
        if (model.provider === 'gemini') {
          if (!GEMINI_KEY) { debugLog += "Gemini Key Missing; "; continue; }
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model.id}:generateContent?key=${GEMINI_KEY}`;
          const parts = hasImage 
            ? [{ text: `SYSTEM: ${systemInstruction} \nUSER REQUEST: ${text}` }, { inline_data: { mime_type: mType || "image/jpeg", data: rBase64 } }] 
            : [{ text: `SYSTEM: ${systemInstruction}\nUSER REQUEST: ${text}` }];
          const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: parts }] }) });
          if (!res.ok) { const err = await res.json(); throw new Error(`Gemini ${res.status}`); }
          const data = await res.json();
          finalResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (finalResponse) success = true;

        } else if (model.provider === 'groq') {
          if (!GROQ_KEY) { debugLog += "Groq Key Missing; "; continue; }
          let payload;
          if (hasImage && model.vision && dUrl) { 
              const mergedContent = `${systemInstruction}\n\nUSER REQUEST: ${text}`;
              payload = [{ role: "user", content: [{ type: "text", text: mergedContent }, { type: "image_url", image_url: { url: dUrl } }] }]; 
          } else { 
              payload = [{ role: "system", content: systemInstruction }, { role: "user", content: text }]; 
          }
          const res = await fetch("https://api.groq.com/openai/v1/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${GROQ_KEY}` }, body: JSON.stringify({ model: model.id, messages: payload }) });
          const data = await res.json();
          if (data.error) throw new Error(`Groq ${data.error.message}`);
          finalResponse = data.choices?.[0]?.message?.content;
          if (finalResponse) success = true;

        } else if (model.provider === 'hf') {
          if (!HF_KEY) { debugLog += "HF Key Missing; "; continue; }
          const fetchHF = async () => {
              const res = await fetch(dUrl);
              const blob = await res.blob();
              return fetch(`https://api-inference.huggingface.co/models/${model.id}`, { method: "POST", headers: { Authorization: `Bearer ${HF_KEY}` }, body: blob });
          };
          let res = await fetchHF();
          if (res.status === 503) { await new Promise(r => setTimeout(r, 5000)); res = await fetchHF(); }
          if (!res.ok) { const txt = await res.text(); throw new Error(`HF ${res.status}`); }
          const data = await res.json();
          if (Array.isArray(data) && data[0].label) {
            const disease = data[0].label; 
            if (!text.includes("detected:")) {
                 executeAILoop(`Detected: "${disease}". Detailed cure?`, null, null, null); 
                 return; 
            } else { finalResponse = `🔍 **Diagnosis:** ${disease}\n\n${text}`; success = true; }
          }
        } 
      } catch (e) { debugLog += `${model.id} err; `; }
    }

    if (!success) {
        finalResponse = hasImage 
            ? `⚠️ **Vision Analysis Failed.** \n\nTried: ${queue.length} models. \n\n**Log:** ${debugLog}` 
            : `⚠️ **System Error:** All AI models failed. \nLogs: ${debugLog}`;
    }
    
    addMessage({ text: finalResponse, sender: "bot", timestamp: new Date().toLocaleTimeString() });
    setIsLoading(false); setIsTyping(false);
    setRawBase64(null); setDataUrl(null); setMimeType(null);
  };

  // ===============================================================================================
  // SECTION 9: SUB-COMPONENTS (MODALS) - UPDATED FOR 8 LANGUAGES
  // ===============================================================================================
  
  const FullTermsModal = () => (
    <div style={styles.modalOverlay} onClick={(e)=>e.stopPropagation()}>
      <div style={styles.modalContent} onClick={(e)=>e.stopPropagation()}>
        <div style={styles.modalHeader}>
            <span>⚖️ TERMS OF USE / उपयोग की शर्तें</span>
            <button onClick={handleCloseTerms} style={styles.closeX}>✖</button>
        </div>
        <div style={styles.modalBody}>
            <p style={styles.warnText}>⚠️ IMPORTANT: READ BEFORE CONTINUING</p>
            
            {/* ENGLISH */}
            <div style={styles.langBlock}>
                <h4>🇬🇧 English</h4>
                <p><strong>1. Use at Your Own Risk:</strong> This application is provided only for general information purposes. You are using this app entirely at your own risk. The owners and developers are not responsible for any outcomes resulting from its use.</p>
                <p><strong>2. User Responsibility:</strong> You are solely responsible for how you use the information provided by this AI. Any decisions you make based on the app’s responses are your own responsibility.</p>
                <p><strong>3. No Liability for Losses:</strong> The owners and developers are not responsible for any crop loss, financial loss, production loss, or any other damage that may occur from using the information provided by this app.</p>
                <p><strong>4. AI Can Make Mistakes:</strong> This chatbot is built using multiple AI systems. AI-generated information may be incorrect, incomplete, or outdated. Always verify the information with agricultural experts or official sources before taking action.</p>
                <p><strong>5. Not a Professional Service:</strong> This app does not replace professional agricultural, scientific, or government advice. For serious crop issues, always consult qualified agricultural officers or experts.</p>
            </div>

            {/* HINDI */}
            <div style={styles.langBlock}>
                <h4>🇮🇳 हिंदी (Hindi)</h4>
                <p><strong>1. अपने जोखिम पर उपयोग करें:</strong> यह एप्लिकेशन केवल सामान्य जानकारी के लिए है। इसका उपयोग आप पूरी तरह से अपने जोखिम पर कर रहे हैं। डेवलपर्स किसी भी परिणाम के लिए जिम्मेदार नहीं हैं।</p>
                <p><strong>2. उपयोगकर्ता की जिम्मेदारी:</strong> इस AI द्वारा दी गई जानकारी का उपयोग कैसे करना है, इसकी पूरी जिम्मेदारी आपकी है।</p>
                <p><strong>3. नुकसान के लिए कोई दायित्व नहीं:</strong> फसल के नुकसान, वित्तीय हानि या किसी अन्य क्षति के लिए मालिक और डेवलपर्स जिम्मेदार नहीं हैं।</p>
                <p><strong>4. AI गलतियाँ कर सकता है:</strong> यह जानकारी गलत या पुरानी हो सकती है। कार्रवाई करने से पहले हमेशा कृषि विशेषज्ञों से जांच करें।</p>
                <p><strong>5. पेशेवर सेवा नहीं:</strong> यह ऐप पेशेवर कृषि सलाह की जगह नहीं लेता है। गंभीर मुद्दों के लिए हमेशा योग्य कृषि अधिकारियों से परामर्श करें।</p>
            </div>

            {/* BENGALI */}
            <div style={styles.langBlock}>
                <h4>🇮🇳 বাংলা (Bengali)</h4>
                <p><strong>1. নিজের ঝুঁকিতে ব্যবহার করুন:</strong> এই অ্যাপটি শুধুমাত্র সাধারণ তথ্যের জন্য। আপনি এটি সম্পূর্ণ নিজের ঝুঁকিতে ব্যবহার করছেন।</p>
                <p><strong>2. ব্যবহারকারীর দায়িত্ব:</strong> এই AI-এর দেওয়া তথ্য ব্যবহারের সম্পূর্ণ দায়িত্ব আপনার।</p>
                <p><strong>3. ক্ষতির কোনো দায় নেই:</strong> ফসলের ক্ষতি বা আর্থিক লোকসানের জন্য মালিকরা দায়ী নন।</p>
                <p><strong>4. AI ভুল করতে পারে:</strong> তথ্য ভুল বা অসম্পূর্ণ হতে পারে। ব্যবস্থা নেওয়ার আগে সর্বদা বিশেষজ্ঞদের সাথে যাচাই করুন।</p>
                <p><strong>5. পেশাদার পরিষেবা নয়:</strong> এটি পেশাদার কৃষি পরামর্শের বিকল্প নয়।</p>
            </div>

            {/* TELUGU */}
            <div style={styles.langBlock}>
                <h4>🇮🇳 తెలుగు (Telugu)</h4>
                <p><strong>1. మీ స్వంత పూచీకత్తుతో ఉపయోగించండి:</strong> ఈ యాప్ సాధారణ సమాచారం కోసం మాత్రమే. దీనిని ఉపయోగించడం పూర్తిగా మీ బాధ్యత.</p>
                <p><strong>2. వినియోగదారు బాధ్యత:</strong> ఈ AI అందించిన సమాచారం ఆధారంగా మీరు తీసుకునే నిర్ణయాలకు మీదే బాధ్యత.</p>
                <p><strong>3. నష్టాలకు బాధ్యత లేదు:</strong> పంట నష్టం లేదా ఆర్థిక నష్టానికి డెవలపర్లు బాధ్యత వహించరు.</p>
                <p><strong>4. AI తప్పులు చేయవచ్చు:</strong> సమాచారం తప్పుగా ఉండవచ్చు. చర్య తీసుకునే ముందు ఎల్లప్పుడూ వ్యవసాయ నిపుణులను సంప్రదించండి.</p>
                <p><strong>5. వృత్తిపరమైన సేవ కాదు:</strong> ఇది ప్రభుత్వ లేదా శాస్త్రీయ సలహాలకు ప్రత్యామ్నాయం కాదు.</p>
            </div>

            {/* MARATHI */}
            <div style={styles.langBlock}>
                <h4>🇮🇳 मराठी (Marathi)</h4>
                <p><strong>1. आपल्या स्वतःच्या जोखमीवर वापरा:</strong> हे ॲप केवळ सामान्य माहितीसाठी आहे. आपण हे पूर्णपणे आपल्या स्वतःच्या जोखमीवर वापरत आहात.</p>
                <p><strong>2. वापरकर्त्याची जबाबदारी:</strong> या AI द्वारे दिलेल्या माहितीचा वापर कसा करायचा, याची संपूर्ण जबाबदारी तुमची आहे.</p>
                <p><strong>3. नुकसानीसाठी जबाबदारी नाही:</strong> पिकांचे नुकसान किंवा आर्थिक नुकसानीसाठी मालक जबाबदार नाहीत.</p>
                <p><strong>4. AI चुका करू शकते:</strong> ही माहिती चुकीची असू शकते. कारवाई करण्यापूर्वी नेहमी कृषी तज्ञांशी संपर्क साधा.</p>
                <p><strong>5. व्यावसायिक सेवा नाही:</strong> हे ॲप व्यावसायिक कृषी सल्ल्याची जागा घेत नाही.</p>
            </div>

            {/* TAMIL */}
            <div style={styles.langBlock}>
                <h4>🇮🇳 தமிழ் (Tamil)</h4>
                <p><strong>1. உங்கள் சொந்தப் பொறுப்பில் பயன்படுத்தவும்:</strong> இந்த செயலி பொதுவான தகவலுக்காக மட்டுமே. இதை உங்கள் சொந்தப் பொறுப்பில் பயன்படுத்துகிறீர்கள்.</p>
                <p><strong>2. பயனரின் பொறுப்பு:</strong> இந்த AI வழங்கும் தகவலைப் பயன்படுத்துவது உங்கள் முழுப் பொறுப்பாகும்.</p>
                <p><strong>3. இழப்புகளுக்குப் பொறுப்பல்ல:</strong> பயிர் இழப்பு அல்லது பண இழப்புக்கு உரிமையாளர்கள் பொறுப்பல்ல.</p>
                <p><strong>4. AI தவறுகள் செய்யலாம்:</strong> தகவல் தவறாக இருக்கலாம். செயல்படுவதற்கு முன் எப்போதும் வேளாண் நிபுணர்களை அணுகவும்.</p>
                <p><strong>5. தொழில்முறை சேவை அல்ல:</strong> இது தொழில்முறை வேளாண் ஆலோசனையை மாற்றாது.</p>
            </div>

            {/* GUJARATI */}
            <div style={styles.langBlock}>
                <h4>🇮🇳 ગુજરાતી (Gujarati)</h4>
                <p><strong>1. તમારા પોતાના જોખમે ઉપયોગ કરો:</strong> આ એપ્લિકેશન માત્ર સામાન્ય માહિતી માટે છે. તમે તેનો ઉપયોગ તમારા પોતાના જોખમે કરી રહ્યા છો.</p>
                <p><strong>2. વપરાશકર્તાની જવાબદારી:</strong> આ AI દ્વારા આપવામાં આવેલી માહિતીના ઉપયોગની સંપૂર્ણ જવાબદારી તમારી છે.</p>
                <p><strong>3. નુકસાન માટે કોઈ જવાબદારી નથી:</strong> પાકના નુકસાન કે આર્થિક નુકસાન માટે માલિકો જવાબદાર નથી.</p>
                <p><strong>4. AI ભૂલો કરી શકે છે:</strong> માહિતી ખોટી હોઈ શકે છે. પગલાં લેતા પહેલા હંમેશા કૃષિ નિષ્ણાતોની સલાહ લો.</p>
                <p><strong>5. વ્યાવસાયિક સેવા નથી:</strong> આ એપ વ્યાવસાયિક કૃષિ સલાહનો વિકલ્પ નથી.</p>
            </div>

            {/* KANNADA */}
            <div style={styles.langBlock}>
                <h4>🇮🇳 ಕನ್ನಡ (Kannada)</h4>
                <p><strong>1. ನಿಮ್ಮ ಸ್ವಂತ ಅಪಾಯದಲ್ಲಿ ಬಳಸಿ:</strong> ಈ ಅಪ್ಲಿಕೇಶನ್ ಸಾಮಾನ್ಯ ಮಾಹಿತಿಗಾಗಿ ಮಾತ್ರ. ನೀವು ಇದನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ನಿಮ್ಮ ಸ್ವಂತ ಅಪಾಯದಲ್ಲಿ ಬಳಸುತ್ತಿದ್ದೀರಿ.</p>
                <p><strong>2. ಬಳಕೆದಾರರ ಜವಾಬ್ದಾರಿ:</strong> ಈ AI ನೀಡುವ ಮಾಹಿತಿಯನ್ನು ಹೇಗೆ ಬಳಸುತ್ತೀರಿ ಎಂಬುದು ನಿಮ್ಮ ಜವಾಬ್ದಾರಿಯಾಗಿದೆ.</p>
                <p><strong>3. ನಷ್ಟಗಳಿಗೆ ಹೊಣೆಗಾರಿಕೆ ಇಲ್ಲ:</strong> ಬೆಳೆ ನಷ್ಟ ಅಥವಾ ಆರ್ಥಿಕ ನಷ್ಟಕ್ಕೆ ಮಾಲೀಕರು ಜವಾಬ್ದಾರರಲ್ಲ.</p>
                <p><strong>4. AI ತಪ್ಪುಗಳನ್ನು ಮಾಡಬಹುದು:</strong> ಮಾಹಿತಿ ತಪ್ಪಾಗಿರಬಹುದು. ಕ್ರಮ ಕೈಗೊಳ್ಳುವ ಮೊದಲು ಯಾವಾಗಲೂ ಕೃಷಿ ತಜ್ಞರನ್ನು ಸಂಪರ್ಕಿಸಿ.</p>
                <p><strong>5. ವೃತ್ತಿಪರ ಸೇವೆಯಲ್ಲ:</strong> ಇದು ವೃತ್ತಿಪರ ಕೃಷಿ ಸಲಹೆಗೆ ಬದಲಿಯಲ್ಲ.</p>
            </div>

            {/* MALAYALAM */}
            <div style={styles.langBlock}>
                <h4>🇮🇳 മലയാളം (Malayalam)</h4>
                <p><strong>1. സ്വന്തം ഉത്തരവാദിത്തത്തിൽ ഉപയോഗിക്കുക:</strong> ഈ ആപ്പ് പൊതുവിവരങ്ങൾക്ക് മാത്രമുള്ളതാണ്. ഇത് നിങ്ങളുടെ സ്വന്തം റിസ്കിൽ ഉപയോഗിക്കുക.</p>
                <p><strong>2. ഉപയോക്താവിന്റെ ഉത്തരവാദിത്തം:</strong> ഈ വിവരങ്ങൾ എങ്ങനെ ഉപയോഗിക്കുന്നു എന്നത് നിങ്ങളുടെ പൂർണ്ണ ഉത്തരവാദിത്തമാണ്.</p>
                <p><strong>3. നഷ്ടങ്ങൾക്ക് ഉത്തരവാദികളല്ല:</strong> വിളനാശത്തിനോ സാമ്പത്തിക നഷ്ടത്തിനോ ഡെവലപ്പർമാർ ഉത്തരവാദികളല്ല.</p>
                <p><strong>4. AI തെറ്റുകൾ വരുത്തിയേക്കാം:</strong> വിവരങ്ങൾ തെറ്റായേക്കാം. നടപടിയെടുക്കുന്നതിന് മുമ്പ് കാർഷിക വിദഗ്ധരുമായി പരിശോധിക്കുക.</p>
                <p><strong>5. പ്രൊഫഷണൽ സേവനമല്ല:</strong> ഇത് ഔദ്യോഗിക കാർഷിക ഉപദേശത്തിന് പകരമല്ല.</p>
            </div>

        </div>
        <button onClick={handleAcceptTerms} style={styles.acceptBtn}>Agree and Continue</button>
      </div>
    </div>
  );

  // ===============================================================================================
  // SECTION 10: RENDER (FULL SCREEN CINEMA UI)
  // ===============================================================================================
  return (
    <div style={styles.pageWrap}>
      
      {/* 🖥️ MAIN CHAT WIDGET (FULL SCREEN) */}
      {isOpen && (
        <div style={styles.chatWidget}>
          
          {/* SIDEBAR */}
          {showSidebar && (
              <div style={styles.sidebarOverlay} onClick={() => setShowSidebar(false)}>
                  <div style={styles.sidebar} onClick={(e) => e.stopPropagation()}>
                      <div style={styles.sidebarHeader}>
                          <h3>🗄️ History</h3>
                          <button onClick={() => setShowSidebar(false)} style={styles.sidebarCloseBtn}>✖</button>
                      </div>
                      
                      <button onClick={handleNewChat} style={styles.newChatBtn}>+ New Consultation</button>
                      
                      <div style={styles.sessionList}>
                          {sessions.map(sess => (
                              <div key={sess.id} style={{...styles.sessionItem, backgroundColor: sess.id === currentSessionId ? '#333' : 'transparent', borderLeft: sess.id === currentSessionId ? '4px solid #2E7D32' : '4px solid transparent'}} onClick={() => { setCurrentSessionId(sess.id); setShowSidebar(false); }}>
                                  
                                  {/* ✏️ SIDEBAR EDIT LOGIC */}
                                  {editingSessionId === sess.id ? (
                                      <div style={styles.editRow}>
                                          <input 
                                              value={editTitleInput} 
                                              onChange={(e) => setEditTitleInput(e.target.value)} 
                                              onClick={(e) => e.stopPropagation()}
                                              style={styles.editInput}
                                          />
                                          <button onClick={(e) => saveSessionTitle(e)} style={styles.saveBtn}>✓</button>
                                      </div>
                                  ) : (
                                      <>
                                        <span style={{overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1}}>{sess.title}</span>
                                        <div style={{display:'flex', gap:'5px'}}>
                                            <button onClick={(e) => startEditingSession(e, sess)} style={styles.iconBtn}>✎</button>
                                            <button onClick={(e) => handleDeleteChat(e, sess.id)} style={styles.deleteChatBtn}>🗑️</button>
                                        </div>
                                      </>
                                  )}
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          )}

          {/* HEADER */}
          <div style={styles.header}>
            <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                {/* ❌ UNIFIED CLOSE BUTTON */}
                <button onClick={() => setIsOpen(false)} style={styles.backBtn} title="Close">✖</button>
                <button onClick={() => setShowSidebar(true)} style={styles.hamburgerBtn} title="History">☰</button>
            </div>
            
            <div style={{ textAlign: 'center' }}>
                <div style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>Farm Buddy 🌾</div>
                <div style={{ fontSize: '12px', color: '#81C784' }}>Genesis Edition v107.0</div>
            </div>
            
            <button onClick={(e) => handleClearChat(e)} style={styles.backBtn} title="Clear">🗑️</button>
          </div>

          {/* CHAT BODY */}
          <div style={styles.chatBody} ref={chatBodyRef}>
            {messages.map((msg, i) => (
              <div key={i} style={{ textAlign: msg.sender === 'bot' ? 'left' : 'right', marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'bot' ? 'flex-start' : 'flex-end', animation: 'fadeIn 0.3s ease-in' }}>
                {msg.image && (
                    <img src={msg.image} alt="User Upload" style={styles.msgImg} onClick={() => window.open(msg.image, '_blank')} />
                )}
                
                {/* ✏️ MESSAGE EDIT LOGIC */}
                {editingMessageIndex === i && msg.sender === 'user' ? (
                    <div style={styles.editMsgContainer}>
                        <textarea 
                            value={editMessageText} 
                            onChange={(e) => setEditMessageText(e.target.value)}
                            style={styles.editMsgTextarea}
                        />
                        <div style={styles.editMsgActions}>
                            <button onClick={cancelEditingMessage} style={styles.cancelEditBtn}>Cancel</button>
                            <button onClick={() => saveAndRegenerateMessage(i)} style={styles.saveEditBtn}>Save & Regenerate</button>
                        </div>
                    </div>
                ) : (
                    <div style={msg.sender === 'bot' ? styles.botBubble : styles.userBubble}>
                      <ReactMarkdown children={msg.text} remarkPlugins={[remarkGfm]} components={{ code({node, inline, className, children, ...props}) { const match = /language-(\w+)/.exec(className || ''); return !inline && match ? (<div style={styles.codeBlock}><div style={styles.codeHeader}><span>{match[1]}</span><button onClick={() => handleCopy(String(children))} style={styles.codeCopyBtnSmall}>Copy</button></div><pre style={{margin:0, padding:'10px', overflowX:'auto'}}><code className={className} style={{fontFamily:'monospace', fontSize:'13px'}} {...props}>{children}</code></pre></div>) : (<code className={className} style={styles.inlineCode} {...props}>{children}</code>) } }} />
                    </div>
                )}
                
                <div style={{display:'flex', alignItems:'center', gap:'5px'}}>
                    <span style={styles.timestamp}>{msg.sender === 'bot' ? '🤖' : '👤'} {msg.timestamp || ""}</span>
                    {/* EDIT PENCIL FOR USER */}
                    {msg.sender === 'user' && !editingMessageIndex && (
                        <button onClick={() => startEditingMessage(i, msg.text)} style={styles.editMsgBtn} title="Edit & Retry">✎</button>
                    )}
                </div>
                
                {msg.sender === 'bot' && (
                  <div style={styles.actionRow}>
                    <button onClick={() => handleSpeak(msg.text)} style={styles.outlineBtn}>{speaking ? '🔇 Stop' : '🔊 Read'}</button>
                    <button onClick={() => handleCopy(msg.text)} style={styles.outlineBtn}>📋 Copy</button>
                    <button onClick={handleRetry} style={styles.outlineBtn}>🔄 Retry</button>
                  </div>
                )}
              </div>
            ))}
            {isTyping && (<div style={styles.typingIndicatorBubble}><div className="typing-dot"></div><div className="typing-dot"></div><div className="typing-dot"></div></div>)}
            {isLoading && !isTyping && <div style={styles.loadingTxt}>⚡ Analyzing with Multi-Model Grid...</div>}
            <div ref={messagesEndRef} />
          </div>
            
          {showScrollBtn && (<button onClick={scrollToBottom} style={styles.scrollBtn}>⬇️</button>)}

          {/* FOOTER */}
          <div style={styles.footer}>
            <div style={styles.inputRow}>
              <div style={styles.inputWrapper}>
                <input type="file" accept="image/*,.pdf,.txt" onChange={handleFileChange} style={{ display: 'none' }} id="cam-input" />
                <label htmlFor="cam-input" style={styles.camIcon} title="Upload Image">📸</label>
                <input type="text" placeholder={isOnline ? "Ask about crops..." : "Offline"} disabled={!isOnline} style={styles.inputField} value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} />
                
                {/* 🎙️ PRO WHITE MIC ICON */}
                <button onClick={startListening} style={styles.micIcon} title="Voice Input">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
                        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                        <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                    </svg>
                </button>
              </div>
              <button onClick={handleSend} style={{...styles.sendOutlineBtn, opacity: isOnline ? 1 : 0.5}} disabled={!isOnline}>➤</button>
            </div>
            {uploadedFile && (<div style={styles.imgBadge}>🖼️ Image Ready: {(uploadedFile.size / 1024).toFixed(1)} KB <button onClick={removeUploadedImage} style={styles.delBadge}>✖</button></div>)}
            <div style={styles.legalLinks}>AI can make mistakes. {isOnline ? "🟢 Online" : "🔴 Offline"} <span onClick={() => setShowFullTerms(true)} style={styles.readTerms}>Terms</span></div>
          </div>
        </div>
      )}

      {showFullTerms && <FullTermsModal />}

      {/* FLOATING CAPSULE */}
      {!isOpen && (
        <div onMouseDown={handleMouseDown} onClick={handleClickButton} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} style={{ ...styles.floatCapsule, left: `${position.x}px`, top: `${position.y}px` }}>
            <span style={{fontSize:'22px'}}>🧢</span> <span style={{fontWeight:'bold', color:'white', fontSize:'14px'}}>Farm Buddy</span>
        </div>
      )}
      
      <style>{` @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } @keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } } .typing-dot { width: 8px; height: 8px; background-color: #aaa; border-radius: 50%; display: inline-block; margin: 0 2px; animation: typingAnimation 1.4s infinite ease-in-out both; } .typing-dot:nth-child(1) { animation-delay: -0.32s; } .typing-dot:nth-child(2) { animation-delay: -0.16s; } @keyframes typingAnimation { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1.0); } } `}</style>
    </div>
  );
}

// ===============================================================================================
// SECTION 11: FULL SCREEN STYLE SHEET
// ===============================================================================================
const styles = {
    pageWrap: { 
        backgroundColor: 'transparent', 
        height: '100vh', 
        width: '100vw',
        position: 'fixed',
        top: 0,
        left: 0,
        fontFamily: '"Inter", "Segoe UI", sans-serif', 
        overflow: 'hidden', 
        pointerEvents:'none', 
        zIndex: 9999
    }, 
    
    // 🖥️ FULL SCREEN CHAT WIDGET
    chatWidget: { 
      position: 'fixed', 
      top: 0,
      left: 0,
      width: '100vw', 
      height: '100vh', 
      backgroundColor: 'rgba(18, 18, 18, 0.95)', // Glassmorphism
      backdropFilter: 'blur(10px)',
      display: 'flex', 
      flexDirection: 'column', 
      zIndex: 10000, 
      pointerEvents:'auto',
      overflow: 'hidden'
    },

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
      zIndex: 10000, 
      touchAction: 'none', 
      transition: 'transform 0.1s ease', 
      pointerEvents:'auto',
      userSelect: 'none',
      cursor: 'move'
    },
    
    // ✏️ EDIT UI STYLES
    editRow: { display:'flex', gap:'5px', width:'100%' },
    editInput: { flex:1, background:'#333', border:'1px solid #555', color:'white', padding:'5px', borderRadius:'4px' },
    saveBtn: { background:'#2E7D32', border:'none', color:'white', borderRadius:'4px', cursor:'pointer' },
    iconBtn: { background:'transparent', border:'none', color:'#aaa', cursor:'pointer', fontSize:'14px' },
    
    editMsgContainer: { width:'100%', maxWidth:'80%', background:'#222', padding:'10px', borderRadius:'10px', border:'1px solid #444' },
    editMsgTextarea: { width:'100%', height:'60px', background:'#111', color:'white', border:'1px solid #333', padding:'5px', borderRadius:'5px' },
    editMsgActions: { display:'flex', justifyContent:'flex-end', gap:'10px', marginTop:'5px' },
    saveEditBtn: { background:'#2E7D32', color:'white', border:'none', padding:'5px 10px', borderRadius:'4px', cursor:'pointer', fontSize:'12px' },
    cancelEditBtn: { background:'transparent', color:'#aaa', border:'1px solid #555', padding:'5px 10px', borderRadius:'4px', cursor:'pointer', fontSize:'12px' },
    editMsgBtn: { background:'transparent', border:'none', color:'#555', cursor:'pointer', fontSize:'12px', opacity:0.5 },

    sidebarOverlay: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 10001, display: 'flex', alignItems: 'flex-start', backdropFilter: 'blur(5px)' },
    sidebar: { width: '85%', maxWidth: '320px', height: '100%', backgroundColor: '#1a1a1a', borderRight: '1px solid #333', display: 'flex', flexDirection: 'column', animation: 'slideIn 0.25s ease-out', boxShadow: '4px 0 15px rgba(0,0,0,0.5)' },
    sidebarHeader: { padding: '20px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white', backgroundColor: '#111' },
    sidebarCloseBtn: { background:'none', border:'none', color:'white', fontSize:'24px', cursor:'pointer', padding: '0 5px' },
    newChatBtn: { margin: '15px', padding: '14px', backgroundColor: '#2E7D32', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', transition: 'background 0.2s' },
    sessionList: { flex: 1, overflowY: 'auto', padding: '0 10px 20px 10px' },
    sessionItem: { padding: '14px 15px', color: '#e0e0e0', cursor: 'pointer', borderRadius: '6px', marginBottom: '6px', fontSize: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background 0.1s' },
    deleteChatBtn: { background:'none', border:'none', color:'#888', fontSize:'14px', cursor:'pointer', opacity: 0.7 },
    
    header: { backgroundColor: '#1E1E1E', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', height: '70px' },
    backBtn: { background: 'none', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer', padding: '5px' },
    hamburgerBtn: { background: 'none', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer', marginLeft: '10px' },
    
    chatBody: { flex: 1, padding: '20px', overflowY: 'auto', scrollBehavior: 'smooth', position:'relative', backgroundColor: 'transparent' },
    botBubble: { backgroundColor: '#1E1E1E', color: '#E0E0E0', padding: '16px 20px', borderRadius: '4px 20px 20px 20px', maxWidth: '80%', border: '1px solid #333', fontSize: '16px', lineHeight: '1.6', wordWrap: 'break-word', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
    userBubble: { backgroundColor: '#2E7D32', color: 'white', padding: '16px 20px', borderRadius: '20px 4px 20px 20px', maxWidth: '80%', fontSize: '16px', lineHeight: '1.6', boxShadow: '0 4px 6px rgba(0,0,0,0.2)', wordWrap: 'break-word' },
    
    codeBlock: { backgroundColor: '#0d0d0d', border: '1px solid #333', borderRadius: '8px', margin: '12px 0', overflow: 'hidden' },
    codeHeader: { backgroundColor: '#222', padding: '6px 12px', fontSize: '12px', color: '#888', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', fontFamily: 'monospace' },
    codeCopyBtnSmall: { background: 'none', border: '1px solid #555', borderRadius: '4px', color: '#aaa', fontSize: '10px', cursor: 'pointer', padding: '2px 8px', textTransform: 'uppercase' },
    inlineCode: { backgroundColor: 'rgba(255,255,255,0.1)', padding: '2px 5px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '13px', color: '#FFCC80' },
    
    msgImg: { maxWidth: '300px', borderRadius: '12px', marginBottom: '10px', border: '1px solid #444', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' },
    timestamp: { fontSize: '11px', color: '#888', marginTop: '6px', marginLeft: '4px', marginRight: '4px' },
    
    typingIndicatorBubble: { backgroundColor: '#1E1E1E', padding: '12px 18px', borderRadius: '4px 18px 18px 18px', border: '1px solid #333', display:'inline-block', marginBottom:'15px' },
    loadingTxt: { color: '#888', fontSize: '13px', textAlign: 'center', marginTop: '10px', fontStyle: 'italic' },
    
    actionRow: { display: 'flex', gap: '10px', marginTop: '10px' },
    outlineBtn: { backgroundColor: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '20px', padding: '6px 14px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s ease', fontFamily: 'sans-serif' },
    scrollBtn: { position: 'absolute', bottom: '120px', right: '30px', background: '#2E7D32', color:'white', border:'none', borderRadius:'50%', width:'50px', height:'50px', fontSize:'24px', cursor:'pointer', boxShadow:'0 4px 10px rgba(0,0,0,0.3)', zIndex:2001, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    
    footer: { backgroundColor: '#1E1E1E', padding: '20px 20px 30px 20px', borderTop: '1px solid #333' },
    inputRow: { display: 'flex', alignItems: 'center', gap: '12px', maxWidth: '900px', margin: '0 auto', width: '100%' },
    inputWrapper: { flex: 1, display: 'flex', alignItems: 'center', backgroundColor: '#2C2C2C', borderRadius: '30px', padding: '10px 20px', border: '1px solid #444', overflow: 'hidden' },
    camIcon: { fontSize: '24px', cursor: 'pointer', marginRight: '15px', filter: 'grayscale(0.2)', transition: 'filter 0.2s' },
    inputField: { flex: 1, background: 'none', border: 'none', color: 'white', outline: 'none', fontSize: '16px', minWidth: '50px' },
    micIcon: { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '5px', marginLeft: '8px', fontSize:'22px' },
    sendOutlineBtn: { width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'transparent', border: '2px solid white', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', cursor: 'pointer', flexShrink: 0, boxShadow: '0 0 15px rgba(255,255,255,0.05)', transition: 'all 0.2s ease' },
    
    modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 10002, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'auto', backdropFilter: 'blur(4px)' },
    modalContent: { width: '90%', maxWidth: '600px', backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', maxHeight: '85vh', animation: 'fadeIn 0.2s ease-out' },
    modalHeader: { padding: '20px 24px', backgroundColor: '#F3F4F6', borderBottom: '1px solid #E5E7EB', fontWeight: 'bold', fontSize: '16px', display: 'flex', justifyContent: 'space-between', color: '#1F2937' },
    modalBody: { padding: '24px', overflowY: 'auto', color: '#4B5563', fontSize: '14px', lineHeight: '1.6', flex: 1 },
    closeX: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#9CA3AF' },
    acceptBtn: { width: '100%', padding: '20px', backgroundColor: '#2E7D32', color: 'white', border: 'none', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '1px' },
    warnText: { color: '#DC2626', fontWeight: 'bold', borderBottom:'2px solid #F3F4F6', paddingBottom:'12px', marginBottom:'16px', textAlign:'center', fontSize: '15px' },
    langBlock: { marginBottom: '25px', borderBottom: '1px solid #eee', paddingBottom: '15px' },
    legalLinks: { textAlign: 'center', marginTop: '12px', fontSize: '12px', color: '#666' },
    readTerms: { color: '#81C784', textDecoration: 'underline', cursor: 'pointer', fontWeight: 'bold', marginLeft: '5px' },
    imgBadge: { color: '#81C784', fontSize: '12px', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', backgroundColor: 'rgba(46, 125, 50, 0.1)', padding: '4px 10px', borderRadius: '12px', width: 'fit-content', margin: '10px auto 0 auto' },
    delBadge: { background: '#EF4444', color: 'white', border: 'none', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }
};

export default ChatBot; 