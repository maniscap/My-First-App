import React, { 
  useState, 
  useEffect, 
  useRef, 
  useMemo, 
  useCallback 
} from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import axios from 'axios';
import { Menu, X, Trash2, Edit2, Mic, Image as ImageIcon, ArrowRight, RefreshCw, Volume2, VolumeX, Copy, Sparkles, PanelLeft, MessageSquarePlus, ArrowDown, Plus, Type, Check, Square, Download } from 'lucide-react';

const ImageEditor = ({ imageUrl, onSave, onCancel }) => {
  const canvasRef = useRef(null);
  const [color, setColor] = useState('#FF3B30');
  const [tool, setTool] = useState('pen'); // 'pen' | 'text'
  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const loadImageToCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      const MAX_DIM = 800; // Increased resolution for better doodle/text
      if (width > MAX_DIM || height > MAX_DIM) {
        if (width > height) { height *= MAX_DIM / width; width = MAX_DIM; }
        else { width *= MAX_DIM / height; height = MAX_DIM; }
      }
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    };
    img.src = imageUrl;
  }, [imageUrl]);

  useEffect(() => { loadImageToCanvas(); }, [loadImageToCanvas]);

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  };

  const handlePointerDown = (e) => {
    const pos = getPos(e);
    if (tool === 'pen') {
      isDrawing.current = true;
      lastPos.current = pos;
    } else if (tool === 'text') {
      const text = prompt("Enter text to overlay:");
      if (text) {
        const ctx = canvasRef.current.getContext('2d');
        const fontSize = Math.max(24, canvasRef.current.width * 0.05);
        ctx.font = `bold ${fontSize}px "Inter", sans-serif`;
        ctx.fillStyle = color;
        ctx.shadowColor = "black";
        ctx.shadowBlur = 4;
        ctx.fillText(text, pos.x, pos.y);
        ctx.shadowBlur = 0;
      }
    }
  };

  const handlePointerMove = (e) => {
    if (!isDrawing.current || tool !== 'pen') return;
    const pos = getPos(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(4, canvasRef.current.width * 0.01);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
  };

  const handlePointerUp = () => { isDrawing.current = false; };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 10005, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)', pointerEvents: 'auto' }} onClick={(e) => e.stopPropagation()}>
      <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', background: 'rgba(255,255,255,0.1)', padding: '10px 20px', borderRadius: '20px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button onClick={() => setTool('pen')} style={{ background: tool === 'pen' ? '#4ade80' : 'transparent', color: tool === 'pen' ? '#000' : '#fff', border: 'none', padding: '8px 12px', borderRadius: '10px', cursor: 'pointer', display: 'flex', gap: '5px', alignItems: 'center' }}><Edit2 size={16} /> Draw</button>
        <button onClick={() => setTool('text')} style={{ background: tool === 'text' ? '#4ade80' : 'transparent', color: tool === 'text' ? '#000' : '#fff', border: 'none', padding: '8px 12px', borderRadius: '10px', cursor: 'pointer', display: 'flex', gap: '5px', alignItems: 'center' }}><Type size={16} /> Text</button>
        <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.2)' }} />
        {['#FF3B30', '#FF9500', '#FFCC00', '#4CD964', '#5AC8FA', '#007AFF', '#5856D6', '#FFFFFF', '#000000'].map(c => (
          <div key={c} onClick={() => setColor(c)} style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: c, cursor: 'pointer', border: color === c ? '3px solid #fff' : '2px solid transparent', boxShadow: color === c ? '0 0 10px rgba(255,255,255,0.5)' : 'none' }} />
        ))}
      </div>
      
      <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '70vh', overflow: 'hidden', borderRadius: '12px', border: '2px solid rgba(255,255,255,0.2)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
        <canvas ref={canvasRef} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerOut={handlePointerUp} style={{ display: 'block', maxWidth: '100%', maxHeight: '70vh', touchAction: 'none', cursor: tool === 'pen' ? 'crosshair' : 'text' }} />
      </div>

      <div style={{ display: 'flex', gap: '15px', marginTop: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button onClick={onCancel} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', padding: '10px 20px', borderRadius: '24px', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center' }}><X size={18} /> Cancel</button>
        <button onClick={loadImageToCanvas} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '24px', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center' }}><RefreshCw size={18} /> Reset</button>
        <button onClick={() => onSave(canvasRef.current.toDataURL('image/jpeg', 0.85))} style={{ background: '#2E7D32', border: 'none', color: '#fff', padding: '10px 24px', borderRadius: '24px', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center', fontWeight: 'bold' }}><Check size={18} /> Apply</button>
      </div>
    </div>
  );
};

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
  
  // 🛠️ SYSTEM BOOT SEQUENCE
  useEffect(() => {
    console.group("🚀 FARM BUDDY: GENESIS KERNEL INITIALIZED");
    console.log("Kernel Version: v107.0 (Titanium)");
    console.log("Status: Secure Vercel Backend Connected");
    console.groupEnd();
  }, []);


  // ===============================================================================================
  // SECTION 2: THE "BRUTE FORCE" MODEL GRID (CLEANED & OPTIMIZED)
  // ===============================================================================================
  
  const MODEL_QUEUE = useMemo(() => [
    // --- TOP TIER GEMINI (Vision + Text + Search Grounding) ---
    { provider: 'gemini', id: 'gemini-2.5-pro', vision: true, desc: "Gemini 2.5 Pro" },
    { provider: 'gemini', id: 'gemini-2.5-flash', vision: true, desc: "Gemini 2.5 Flash" },
    { provider: 'gemini', id: 'gemini-2.0-flash', vision: true, desc: "Gemini 2.0 Flash" },
    { provider: 'gemini', id: 'gemini-1.5-pro', vision: true, desc: "Gemini 1.5 Pro" },
    { provider: 'gemini', id: 'gemini-1.5-flash', vision: true, desc: "Gemini 1.5 Flash" },
    { provider: 'gemini', id: 'gemini-2.0-pro-exp-0205', vision: true, desc: "Gemini 2.0 Pro Exp" },
    { provider: 'gemini', id: 'gemini-2.0-flash-thinking-exp-01-21', vision: true, desc: "Gemini 2.0 Flash Thinking" },
    { provider: 'gemini', id: 'gemini-2.5-flash-8b', vision: true, desc: "Gemini 2.5 Flash 8B" },
    
    // --- OPENROUTER ELITE (Free Tier) ---
    { provider: 'openrouter', id: 'google/gemini-2.5-pro:free', vision: true, desc: "OR Gemini 2.5 Pro" },
    { provider: 'openrouter', id: 'google/gemini-2.0-pro-exp-02-05:free', vision: true, desc: "OR Gemini 2.0 Pro Exp" },
    { provider: 'openrouter', id: 'meta-llama/llama-3.3-70b-instruct:free', vision: false, desc: "OR Llama 3.3 70B" },
    { provider: 'openrouter', id: 'deepseek/deepseek-r1-distill-llama-70b:free', vision: false, desc: "OR DeepSeek R1" },
    { provider: 'openrouter', id: 'google/gemini-2.0-flash-thinking-exp:free', vision: true, desc: "OR Gemini 2.0 Flash Thinking" },
    { provider: 'openrouter', id: 'qwen/qwen-2.5-coder-32b-instruct:free', vision: false, desc: "OR Qwen 2.5 32B" },
    { provider: 'openrouter', id: 'qwen/qwen-2.5-72b-instruct:free', vision: false, desc: "OR Qwen 2.5 72B" },
    { provider: 'openrouter', id: 'nvidia/llama-3.1-nemotron-70b-instruct:free', vision: false, desc: "OR Nemotron 70B" },
    { provider: 'openrouter', id: 'mistralai/mistral-nemo:free', vision: false, desc: "OR Mistral Nemo" },
    { provider: 'openrouter', id: 'meta-llama/llama-3.1-8b-instruct:free', vision: false, desc: "OR Llama 3.1 8B" },
    { provider: 'openrouter', id: 'gryphe/mythomax-l2-13b:free', vision: false, desc: "OR Mythomax L2" },
    { provider: 'openrouter', id: 'undi95/toppy-m-7b:free', vision: false, desc: "OR Toppy M" },
    
    // --- GROQ FAST TIER ---
    { provider: 'groq', id: 'llama-3.3-70b-versatile', vision: false, desc: "Llama 3.3 70B" },
    { provider: 'groq', id: 'llama-3.3-70b-specdec', vision: false, desc: "Llama 3.3 70B SpecDec" },
    { provider: 'groq', id: 'deepseek-r1-distill-llama-70b', vision: false, desc: "DeepSeek R1 70B" },
    { provider: 'groq', id: 'llama-3.2-90b-vision-preview', vision: true, desc: "Llama 3.2 90B Vision" },
    { provider: 'groq', id: 'llama-3.2-11b-vision-preview', vision: true, desc: "Llama 3.2 11B Vision" },
    { provider: 'groq', id: 'mixtral-8x7b-32768', vision: false, desc: "Mixtral 8x7B" },
    { provider: 'groq', id: 'qwen-2.5-32b', vision: false, desc: "Qwen 2.5 32B" },
    { provider: 'groq', id: 'llama-3.1-8b-instant', vision: false, desc: "Llama 3.1 8B" },
    { provider: 'groq', id: 'gemma2-9b-it', vision: false, desc: "Gemma 2 9B" },
    { provider: 'groq', id: 'llama3-70b-8192', vision: false, desc: "Llama 3 70B" },
    { provider: 'groq', id: 'llama3-8b-8192', vision: false, desc: "Llama 3 8B" },
    { provider: 'groq', id: 'gemma-7b-it', vision: false, desc: "Gemma 7B" },

    // --- HUGGING FACE SPECIALTY (Crop Disease - Keep these for image analysis) ---
    { provider: 'hf', id: 'linkan/plant-disease-classification-v2', vision: true, desc: "HF Plant Disease V2" },
    { provider: 'hf', id: 'google/vit-base-patch16-224', vision: true, desc: "Google ViT" },
    { provider: 'hf', id: 'microsoft/resnet-50', vision: true, desc: "ResNet-50" },
    { provider: 'hf', id: 'nateraw/vit-base-beans', vision: true, desc: "HF Beans Disease" },
    
    // --- HUGGING FACE TEXT FALLBACKS ---
    { provider: 'hf', id: 'meta-llama/Meta-Llama-3.1-8B-Instruct', vision: false, desc: "HF Llama 3.1 8B" },
    { provider: 'hf', id: 'mistralai/Mistral-Nemo-Instruct-2407', vision: false, desc: "HF Mistral Nemo" },
    { provider: 'hf', id: 'Qwen/Qwen2.5-7B-Instruct', vision: false, desc: "HF Qwen 2.5 7B" },
    { provider: 'hf', id: 'google/gemma-2-9b-it', vision: false, desc: "HF Gemma 2 9B" },
    { provider: 'hf', id: 'microsoft/Phi-3.5-mini-instruct', vision: false, desc: "HF Phi-3.5 Mini" },

    // --- FINAL LEGACY FALLBACKS ---
    { provider: 'gemini', id: 'gemini-1.5-flash-8b', vision: true, desc: "Gemini 1.5 Flash 8B" },
    { provider: 'gemini', id: 'gemini-1.0-pro', vision: false, desc: "Gemini 1.0 Pro" },
    { provider: 'openrouter', id: 'google/gemini-1.5-pro:free', vision: true, desc: "OR Gemini 1.5 Pro" }
  ], []);


  // ===============================================================================================
  // SECTION 3: ADVANCED REACT STATE ARCHITECTURE
  // ===============================================================================================
  
  // UI States
  const [isOpen, setIsOpen] = useState(false); 
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showScrollBtn, setShowScrollBtn] = useState(false); 
  const [showSidebar, setShowSidebar] = useState(false); 
  const [isExpanded, setIsExpanded] = useState(true);

  // Auto-collapse the ChatBot floating button after 3.5 seconds
  useEffect(() => {
      const timer = setTimeout(() => {
          setIsExpanded(false);
      }, 3500);
      return () => clearTimeout(timer);
  }, []);

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
      text: "🚜 **Farm Buddy: Genesis Mode.**\n\nI am your agricultural AI assistant, but **I can also answer ALL kinds of questions!** \n\n📸 **Upload a photo** for analysis.\n🎨 **Type 'Generate an image of...'** for AI art.\n\n*System Ready. Ask me anything!*", 
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
  const [isClearing, setIsClearing] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  
  // Advanced UX Refs
  const abortControllerRef = useRef(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  
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
  const termsAcceptedRef = useRef(termsAccepted);
  
  useEffect(() => { 
      termsAcceptedRef.current = termsAccepted; 
  }, [termsAccepted]);

  // 3.10 Hardware Back-Button / PopState Listener
  useEffect(() => {
      const handlePopState = (e) => {
          const state = e.state?.chatState;
          if (state === 'sidebar') {
              setShowSidebar(true);
              setShowFullTerms(false);
              setIsOpen(true);
          } else if (state === 'terms') {
              setShowFullTerms(true);
              setShowSidebar(false);
              setIsOpen(true);
          } else if (state === 'open') {
              if (!termsAcceptedRef.current) {
                  setIsOpen(false);
                  setShowFullTerms(false);
                  window.history.back(); // Kick out completely if terms aren't accepted
              } else {
                  setIsOpen(true);
                  setShowSidebar(false);
                  setShowFullTerms(false);
              }
          } else {
              setIsOpen(false);
              setShowSidebar(false);
              setShowFullTerms(false);
          }
      };
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // 3.11 Image Processing States
  const [uploadedFile, setUploadedFile] = useState(null);
  const [rawBase64, setRawBase64] = useState(null); 
  const [dataUrl, setDataUrl] = useState(null); 
  const [mimeType, setMimeType] = useState(null);     
  const [imageToEdit, setImageToEdit] = useState(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  // 3.12 Scrolling
  const messagesEndRef = useRef(null);
  const chatBodyRef = useRef(null);
  const textareaRef = useRef(null);
  
  const scrollToBottom = () => { 
      if (!isUserScrolling) {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); 
      }
  };
  useEffect(() => { scrollToBottom(); }, [messages, isTyping, isLoading]);

  useEffect(() => {
      const handleScroll = () => {
          if (chatBodyRef.current) {
              const { scrollTop, scrollHeight, clientHeight } = chatBodyRef.current;
              // If user is more than 150px away from the bottom, they are manually scrolling
              const isNearBottom = scrollHeight - scrollTop <= clientHeight + 150;
              setIsUserScrolling(!isNearBottom);
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
      closeSidebar();
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
          setIsClearing(true);
          setTimeout(() => {
              setSessions(prev => prev.map(s => {
                  if(s.id === currentSessionId) {
                      return { ...s, messages: [getGreeting()] };
                  }
                  return s;
              }));
              setIsClearing(false);
          }, 400); // Wait for the fade-out animation to finish
      }
  };

  const handleExportChat = () => {
      const sess = sessions.find(s => s.id === currentSessionId);
      if (!sess || sess.messages.length === 0) {
          alert("No messages to export!");
          return;
      }
      
      let textContent = `🚜 Farm Buddy Consultation: ${sess.title}\n📅 Date: ${new Date().toLocaleDateString()}\n\n`;
      textContent += `======================================================\n\n`;
      
      sess.messages.forEach(msg => {
          const sender = msg.sender === 'user' ? '👤 YOU' : '🤖 FARM BUDDY';
          textContent += `${sender} [${msg.timestamp}]:\n${msg.text}\n\n`;
          if (msg.image && (!msg.mimeType || !msg.mimeType.startsWith('image/'))) {
              textContent += `[Attached Document: ${msg.fileName}]\n\n`;
          }
      });
      
      textContent += `======================================================\n`;
      textContent += `Generated by Farm Buddy AI v107.0`;

      const blob = new Blob([textContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `FarmBuddy_Report_${sess.id}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
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
      const oldMsg = currentMessages[index];
      const newMessage = {
          text: editMessageText,
          sender: "user",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          image: oldMsg.image,
          mimeType: oldMsg.mimeType,
          fileName: oldMsg.fileName
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

      let rBase64 = null;
      if (oldMsg.image) {
          const parts = oldMsg.image.split(',');
          if (parts.length === 2) rBase64 = parts[1];
      }

      const aiPrompt = editMessageText.trim() || (oldMsg.mimeType?.includes('pdf') ? "Please read and summarize this document in detail." : "Please analyze this image and describe what you see.");
      executeAILoop(aiPrompt, rBase64, oldMsg.image, oldMsg.mimeType);
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
      
      // Expanded list of the highest-quality FREE voices built into Chrome, Edge, and Apple devices
      const preferredNames = [
        "Google US English", "Google UK English Male", 
        "Microsoft Mark", "Microsoft Guy Online", "Microsoft Aria Online",
        "Samantha", "Alex", "Rishi", "Daniel", 
        "Google हिन्दी", "Microsoft Hemant", 
        "Natural", "Neural", "Online", "Premium"
      ];
      let targetVoice = null;
      
      for (let i = 0; i < preferredNames.length; i++) {
          targetVoice = voices.find(v => v.name.includes(preferredNames[i]) && v.lang.includes(detected.code.split('-')[0]));
          if (targetVoice) break;
      }

      if (!targetVoice) {
          targetVoice = voices.find(v => v.lang.includes(detected.code.split('-')[0]) && (v.name.toLowerCase().includes("male") || v.name.toLowerCase().includes("man") || v.name.toLowerCase().includes("boy")));
      }

      if (!targetVoice) targetVoice = voices.find(v => v.lang.includes(detected.code.split('-')[0]));

      if (targetVoice) {
          utterance.voice = targetVoice;
          utterance.lang = targetVoice.lang;
      } 
      
      utterance.rate = 1.0; // Normal speed sounds much more natural
      utterance.pitch = 1.0; // Normal pitch prevents the voice from sounding distorted
      
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

  const handleRetry = (botMsgIndex) => {
      const sess = sessions.find(s => s.id === currentSessionId);
      if (!sess) return;
      
      const currentMessages = sess.messages;
      let lastUserMsg = null;
      
      for (let j = botMsgIndex - 1; j >= 0; j--) {
          if (currentMessages[j].sender === 'user') {
              lastUserMsg = currentMessages[j];
              break;
          }
      }
      
      if (!lastUserMsg) return;

      setIsLoading(true);
      setIsTyping(true);

      setSessions(prev => prev.map(s => {
          if (s.id === currentSessionId) {
              return { ...s, messages: s.messages.slice(0, botMsgIndex) };
          }
          return s;
      }));

      let rBase64 = null;
      let mType = null;
      if (lastUserMsg.image) {
          const parts = lastUserMsg.image.split(',');
          if (parts.length === 2) {
              const match = parts[0].match(/:(.*?);/);
              if (match) mType = match[1];
              rBase64 = parts[1];
          }
      }

      setTimeout(() => {
          const retryText = lastUserMsg.text || (mType?.includes('pdf') ? "Please read and summarize this document in detail." : "Please analyze this image.");
          executeAILoop(retryText, rBase64, lastUserMsg.image, mType);
      }, 0);
  };

  // ===============================================================================================
  // SECTION 6: BOUNDARY-PROTECTED DRAGGABLE UI & TERMS LOGIC
  // ===============================================================================================
  const [position, setPosition] = useState({ x: 20, y: window.innerHeight - 120 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    setIsDragging(false);
    dragOffset.current = { x: (window.innerWidth - e.clientX) - position.x, y: e.clientY - position.y };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    setIsDragging(true); 
    e.preventDefault();
    
    let newX = (window.innerWidth - e.clientX) - dragOffset.current.x;
    let newY = e.clientY - dragOffset.current.y;
    
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const capsuleWidth = isExpanded ? 145 : 50; 
    const capsuleHeight = 50;
    const padding = 10;
    const bottomPadding = 100; // Extra protection so it doesn't hide under the Bottom Navigation Dock

    if (newX < padding) newX = padding;
    if (newX > screenWidth - capsuleWidth - padding) newX = screenWidth - capsuleWidth - padding;
    if (newY < padding) newY = padding;
    if (newY > screenHeight - capsuleHeight - bottomPadding) newY = screenHeight - capsuleHeight - bottomPadding;
    
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const handleTouchStart = (e) => {
    setIsDragging(false);
    const touch = e.touches[0];
    dragOffset.current = { x: (window.innerWidth - touch.clientX) - position.x, y: touch.clientY - position.y };
  };

  const handleTouchMove = (e) => {
    setIsDragging(true);
    const touch = e.touches[0];
    let newX = (window.innerWidth - touch.clientX) - dragOffset.current.x;
    let newY = touch.clientY - dragOffset.current.y;
    
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const capsuleWidth = isExpanded ? 145 : 50;
    const capsuleHeight = 50;
    const padding = 10;
    const bottomPadding = 100; // Extra protection so it doesn't hide under the Bottom Navigation Dock

    if (newX < padding) newX = padding;
    if (newX > screenWidth - capsuleWidth - padding) newX = screenWidth - capsuleWidth - padding;
    if (newY < padding) newY = padding;
    if (newY > screenHeight - capsuleHeight - bottomPadding) newY = screenHeight - capsuleHeight - bottomPadding;
    
    setPosition({ x: newX, y: newY });
  };

  const handleClickButton = () => { 
      if (!isDragging) {
          handleOpenChat();
      }
  };
  
  const openSidebar = () => {
      setShowSidebar(true);
      window.history.pushState({ chatState: 'sidebar' }, '');
  };

  const closeSidebar = () => {
      setShowSidebar(false);
      if (window.history.state?.chatState === 'sidebar') {
          window.history.back();
      }
  };

  const handleOpenChat = () => { 
      setIsOpen(true); 
      window.history.pushState({ chatState: 'open' }, '');
      
      if (!termsAccepted) { 
          setShowFullTerms(true); 
          window.history.pushState({ chatState: 'terms' }, '');
      }
  };
  
  const handleCloseChat = () => {
      setIsOpen(false);
      if (window.history.state?.chatState === 'open') {
          window.history.back();
      }
  };

  const handleAcceptTerms = (e) => { 
      if(e && e.stopPropagation) e.stopPropagation(); 
      setTermsAccepted(true); 
      termsAcceptedRef.current = true;
      setShowFullTerms(false); 
      localStorage.setItem('farmbuddy_terms_v107', 'true'); 
      if (window.history.state?.chatState === 'terms') {
          window.history.back(); // Naturally steps back to 'open' state
      }
      setIsOpen(true); 
  };

  const handleCloseTerms = (e) => {
      if(e && e.stopPropagation) e.stopPropagation();
      setShowFullTerms(false);
      if (window.history.state?.chatState === 'terms') {
          window.history.back();
      }
      if(!termsAcceptedRef.current) setIsOpen(false);
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

  const processFile = (file) => {
      if (!file) return;
      setUploadedFile(file);
      setMimeType(file.type); 

      const reader = new FileReader();
      reader.onload = (e) => {
          const result = e.target.result;
          setDataUrl(result);
          setRawBase64(result.split(',')[1]);
          setMimeType(file.type || 'application/pdf');
      };
      reader.readAsDataURL(file);
  };

  const handleFileChange = (event) => {
      processFile(event.target.files[0]);
      event.target.value = ''; 
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDraggingFile(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDraggingFile(false); };
  const handleDrop = (e) => {
      e.preventDefault();
      setIsDraggingFile(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          processFile(e.dataTransfer.files[0]);
      }
  };

  const removeUploadedImage = () => { 
    setUploadedFile(null); 
    setRawBase64(null); 
    setDataUrl(null); 
    setInput(""); 
    setMimeType(null);
    setImageToEdit(null);
  };

  // ===============================================================================================
  // SECTION 8: MASTER AI ORCHESTRATOR
  // ===============================================================================================
  
  const handleSend = async (overrideText = null) => {
    // DOUBLE CHECK: Even if they bypass UI, logic prevents sending without terms.
    if (!termsAccepted) { setShowFullTerms(true); return; }
    
    if (!isOnline) { 
        addMessage({ text: "⚠️ **Connection Error:** You are currently OFFLINE.", sender: "bot", timestamp: new Date().toLocaleTimeString() }); 
        return; 
    }

    const userText = typeof overrideText === 'string' ? overrideText : input.trim();
    if (!userText && !uploadedFile) return;

    const aiPrompt = userText || (uploadedFile?.type?.includes('pdf') ? "Please read and summarize this document in detail." : "Please analyze this image and describe what you see.");
    const fileName = uploadedFile ? uploadedFile.name : null;

    addMessage({ 
        text: userText, 
        sender: "user", 
        image: dataUrl, 
        mimeType: mimeType,
        fileName: fileName,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    });
    
    setLastRequest({ text: aiPrompt, rawBase64, dataUrl, mimeType });
    setInput(""); 
    setUploadedFile(null); 
    setIsLoading(true); 
    setIsTyping(true);
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
    }
    
    executeAILoop(aiPrompt, rawBase64, dataUrl, mimeType);
  };

  const handleStopGeneration = () => {
      if (abortControllerRef.current) {
          abortControllerRef.current.abort();
      }
  };

  const executeAILoop = async (text, rBase64, dUrl, mType) => {
    // 🎨 GEN-AI Check
    if (text.toLowerCase().startsWith("generate an image") || text.toLowerCase().startsWith("draw") || text.toLowerCase().startsWith("create an image")) {
        try {
            const response = await axios.post('/api/ChatBot', { action: 'generateImage', text: text });
            if (response.data && response.data.success) {
                addMessage({ text: `🎨 **Generated Image for:**\n"${text}"`, sender: "bot", image: response.data.imageBase64, timestamp: new Date().toLocaleTimeString() });
            } else {
                throw new Error(response.data.error || "Generation Failed");
            }
            setIsLoading(false); setIsTyping(false);
            return;
        } catch(e) { console.error("Image Gen Error:", e); }
    }

    // 🧠 ANALYTICAL LOOP
    const systemInstruction = `You are 'Farm Buddy', an expert Agricultural AI assistant, but you are also highly capable of answering ANY type of question (general knowledge, coding, math, science, etc.).
    1. Default Language: ENGLISH.
    2. Reply in Hindi/Telugu/Tamil ONLY if user asks.
    3. Analyze crop images for diseases when an image is provided.
    4. If the user asks non-agricultural questions, answer them accurately and fully just like a general AI assistant would.`;
    
    let finalResponse = ""; 
    let success = false; 
    let debugLog = "";
    
    // Initialize AbortController for this request
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    const hasFile = !!(rBase64 && dUrl);
    const isImage = mType && mType.startsWith('image/');
    const queue = hasFile ? MODEL_QUEUE.filter(m => m.vision === true) : MODEL_QUEUE;
    
    if (hasFile && queue.length === 0) {
        addMessage({ text: "⚠️ **Configuration Error:** No file-capable models available.", sender: "bot", timestamp: new Date().toLocaleTimeString() });
        setIsLoading(false); setIsTyping(false);
        return;
    }

    // 🚀 PARALLEL BATCH EXECUTION
    const fetchModel = async (model) => {
      try {
        const response = await axios.post('/api/ChatBot', {
          action: 'chat',
          model: model,
          text: text,
          rBase64: rBase64,
          mType: mType,
          systemInstruction: systemInstruction
        }, { signal });

        const data = response.data;
        if (!data || data.error) throw new Error(data?.error || 'Backend Error');

        if (data._isRecursive) {
          return { _isRecursive: true, payload: data.payload };
        }
        
        return data.data;
      } catch (e) {
          if (e.name === 'AbortError' || e.code === 'ERR_CANCELED') {
              debugLog += `${model.id} (Stopped by user); `;
              throw e;
          }
          
          const errMsg = e.response?.data?.error || e.message || "";
          const isRateLimit = errMsg.includes("429") || errMsg.includes("quota");
          if (isRateLimit) {
              console.warn(`Rate limit hit for ${model.id}.`);
              debugLog += `${model.id} (429); `;
          } else {
              console.error(`Unexpected error with ${model.id}:`, e);
              debugLog += `${model.id} (Err); `;
          }
          throw e; // Re-throw so Promise.any knows this failed
      }
    };

    const BATCH_SIZE = 3;
    for (let i = 0; i < queue.length; i += BATCH_SIZE) {
        if (success) break;
        const batch = queue.slice(i, i + BATCH_SIZE);
        try {
            // Promise.any races the models and resolves with the FIRST successful response
            const result = await Promise.any(batch.map(model => fetchModel(model)));
            
            if (result?._isRecursive) {
                executeAILoop(result.payload, null, null, null);
                return;
            }
            
            finalResponse = result;
            success = true;
            break;
        } catch (aggregateError) {
            if (aggregateError.errors && aggregateError.errors.some(e => e.name === 'AbortError')) {
                success = false;
                finalResponse = "🛑 *Generation stopped by user.*";
                break;
            }
            // If we hit this block, EVERY model in the batch failed
            console.warn(`All models in batch ${i / BATCH_SIZE + 1} failed. Trying next batch if available.`);
        }
    }

    if (!success) {
        finalResponse = hasFile 
            ? `⚠️ **File Analysis Failed.** \n\nTried: ${queue.length} models. \n\n**Log:** ${debugLog}` 
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
        <div style={styles.chatWidget} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
          
          {/* SIDEBAR */}
          {showSidebar && (
              <div style={styles.sidebarOverlay} onClick={closeSidebar}>
                  <div style={styles.sidebar} onClick={(e) => e.stopPropagation()}>
                      <div style={styles.sidebarHeader}>
                          <h3 style={{display:'flex', alignItems:'center', gap:'8px', margin:0, fontSize:'18px', fontWeight:'600'}}>
                              <Menu size={20} /> History
                          </h3>
                          <button onClick={closeSidebar} style={styles.sidebarCloseBtn}>
                              <X size={24} strokeWidth={1.5} />
                          </button>
                      </div>
                      
                      <button onClick={handleNewChat} style={styles.newChatBtn}>
                          <MessageSquarePlus size={18} /> New Consultation
                      </button>
                      
                      <div style={styles.sessionList}>
                          {sessions.map(sess => (
                              <div key={sess.id} style={{...styles.sessionItem, backgroundColor: sess.id === currentSessionId ? 'rgba(255,255,255,0.1)' : 'transparent', borderLeft: sess.id === currentSessionId ? '4px solid #4ade80' : '4px solid transparent'}} onClick={() => { setCurrentSessionId(sess.id); closeSidebar(); }}>
                                  
                                  {/* ✏️ SIDEBAR EDIT LOGIC */}
                                  {editingSessionId === sess.id ? (
                                      <div style={styles.editRow}>
                                          <input 
                                              value={editTitleInput} 
                                              onChange={(e) => setEditTitleInput(e.target.value)} 
                                              onClick={(e) => e.stopPropagation()}
                                              style={styles.editInput}
                                              autoFocus
                                          />
                                          <button onClick={(e) => saveSessionTitle(e)} style={styles.saveBtn}>✓</button>
                                      </div>
                                  ) : (
                                      <>
                                        <span style={{overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1, fontWeight: sess.id === currentSessionId ? '600' : '400'}}>{sess.title}</span>
                                        <div style={{display:'flex', gap:'8px', alignItems:'center'}}>
                                            <button onClick={(e) => startEditingSession(e, sess)} style={styles.iconBtn}>
                                                <Edit2 size={14} color="#A0A0A0" />
                                            </button>
                                            <button onClick={(e) => handleDeleteChat(e, sess.id)} style={styles.deleteChatBtn}>
                                                <Trash2 size={16} color="#F84464" />
                                            </button>
                                        </div>
                                      </>
                                  )}
                              </div>
                          ))}
                      </div>
                      
                      <div style={styles.sidebarFooter}>
                          <span style={styles.termsText}>Farm Buddy can make mistakes. Check important info.{isOnline ? "" : " (Offline)"}</span>
                          <button onClick={() => { setShowFullTerms(true); window.history.pushState({ chatState: 'terms' }, ''); }} style={styles.readTermsBtn}>
                              Terms & Conditions
                          </button>
                      </div>
                  </div>
              </div>
          )}

          {/* HEADER */}
          <div style={styles.header}>
            <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                <button onClick={openSidebar} style={styles.glassMenuBtn} title="History">
                    <Menu size={20} color="#000" strokeWidth={2.5} />
                </button>
            </div>
            
            <div style={styles.headerTitleContainer} onClick={openSidebar}>
                <Sparkles size={18} color="#81C784" strokeWidth={2} />
                <span style={styles.headerTitle}>Farm Buddy</span>
                <span style={styles.headerBadge}>PRO</span>
            </div>
            
            <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                <button onClick={handleExportChat} style={styles.iconBtnInner} title="Download Chat History">
                    <Download size={20} color="#E3E3E3" strokeWidth={1.5} />
                </button>
                <button onClick={(e) => handleClearChat(e)} style={{...styles.iconBtnInner, ...(isClearing ? { animation: 'spin 0.4s linear' } : {})}} title="Clear Conversation">
                    <RefreshCw size={20} color="#E3E3E3" strokeWidth={1.5} />
                </button>
                <button onClick={handleCloseChat} style={styles.iconBtnInner} title="Close">
                    <X size={26} color="#E3E3E3" strokeWidth={1.5} />
                </button>
            </div>
          </div>

          {/* CHAT BODY */}
          <div style={{...styles.chatBody, ...(isClearing ? styles.chatBodyClearing : {})}} ref={chatBodyRef}>
            {messages.map((msg, i) => (
              <div key={i} style={{ textAlign: msg.sender === 'bot' ? 'left' : 'right', marginBottom: '16px', display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'bot' ? 'flex-start' : 'flex-end', animation: 'fadeIn 0.3s ease-in' }}>
                {msg.image && (
                    msg.mimeType && !msg.mimeType.startsWith('image/') ? (
                        <div style={styles.pdfMessage} onClick={() => {
                             const newTab = window.open();
                             newTab?.document.write(`<iframe src="${msg.image}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
                        }}>
                            📄 {msg.fileName || "View Attached Document"}
                        </div>
                    ) : (
                        <img src={msg.image} alt="User Upload" style={styles.msgImg} onClick={() => window.open(msg.image, '_blank')} />
                    )
                )}
                
                {/* ✏️ MESSAGE EDIT LOGIC */}
                {editingMessageIndex === i && msg.sender === 'user' ? (
                    <div style={styles.editMsgContainer}>
                        <textarea 
                            value={editMessageText} 
                            onChange={(e) => setEditMessageText(e.target.value)}
                            style={styles.editMsgTextarea}
                            className="premium-edit-textarea"
                        />
                        <div style={styles.editMsgActions}>
                            <button onClick={cancelEditingMessage} style={styles.cancelEditBtn}>Cancel</button>
                            <button onClick={() => saveAndRegenerateMessage(i)} style={styles.saveEditBtn}>Save & Regenerate</button>
                        </div>
                    </div>
                ) : msg.text ? (
                    <div style={msg.sender === 'bot' ? styles.botBubble : styles.userBubble}>
                      <ReactMarkdown 
                        children={msg.text} 
                        remarkPlugins={[remarkGfm]} 
                        components={{ 
                            code({node, inline, className, children, ...props}) { 
                                const match = /language-(\w+)/.exec(className || ''); 
                                return !inline && match ? (<div style={styles.codeBlock}><div style={styles.codeHeader}><span>{match[1]}</span><button onClick={() => handleCopy(String(children))} style={styles.codeCopyBtnSmall}>Copy</button></div><pre style={{margin:0, padding:'10px', overflowX:'auto'}}><code className={className} style={{fontFamily:'monospace', fontSize:'13px'}} {...props}>{children}</code></pre></div>) : (<code className={className} style={styles.inlineCode} {...props}>{children}</code>) 
                            },
                            // ✨ CLICKABLE URLS
                            a({node, href, children, ...props}) {
                                return (
                                    <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: '#81C784', textDecoration: 'underline', fontWeight: 'bold' }} {...props}>
                                        {children}
                                    </a>
                                );
                            }
                        }} 
                      />
                    </div>
                ) : null}
                
                <div style={{display:'flex', alignItems:'center', gap:'5px'}}>
                    <span style={styles.timestamp}>{msg.sender === 'user' ? '👤 ' : ''}{msg.timestamp || ""}</span>
                    {/* EDIT PENCIL FOR USER */}
                    {msg.sender === 'user' && !editingMessageIndex && (
                        <button onClick={() => startEditingMessage(i, msg.text)} style={styles.editMsgBtn} title="Edit & Retry">
                            <Edit2 size={14} color="#fff" strokeWidth={2} />
                        </button>
                    )}
                </div>
                
                {msg.sender === 'bot' && (
                  <div style={styles.actionRow}>
                    <button onClick={() => handleSpeak(msg.text)} style={styles.outlineBtn}>
                        {speaking ? <VolumeX size={14} /> : <Volume2 size={14} />} {speaking ? 'Stop' : 'Read'}
                    </button>
                    <button onClick={() => handleCopy(msg.text)} style={styles.outlineBtn}>
                        <Copy size={14} /> Copy
                    </button>
                    <button onClick={() => handleRetry(i)} style={styles.outlineBtn}>
                        <RefreshCw size={14} /> Retry
                    </button>
                  </div>
                )}
              </div>
            ))}
            
            {/* QUICK STARTER PROMPTS */}
            {messages.length === 1 && !isLoading && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '20px', justifyContent: 'center', animation: 'fadeIn 0.5s ease-out' }}>
                    {[
                        "🌱 How do I treat powdery mildew on tomato leaves?",
                        "💻 Write a Python script to track my farm expenses.",
                        "🌦️ What is the best summer crop to plant?",
                        "📊 Explain modern market demand trends."
                    ].map((promptText, idx) => (
                        <button key={idx} onClick={() => handleSend(promptText)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#E3E3E3', padding: '10px 16px', borderRadius: '20px', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s', backdropFilter: 'blur(10px)' }} onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'} onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}>
                            {promptText}
                        </button>
                    ))}
                </div>
            )}

            {isTyping && (<div style={styles.typingIndicatorBubble}><div className="typing-dot"></div><div className="typing-dot"></div><div className="typing-dot"></div></div>)}
            {isLoading && !isTyping && <div style={styles.loadingTxt}>⚡ Analyzing with Multi-Model Grid... <button onClick={handleStopGeneration} style={{background: 'transparent', border: 'none', color: '#ff4d4d', cursor: 'pointer', textDecoration: 'underline'}}>Stop</button></div>}
            <div ref={messagesEndRef} />
          </div>
            
          {showScrollBtn && (
              <button onClick={scrollToBottom} style={styles.scrollBtn}><ArrowDown size={22} color="#fff" strokeWidth={2.5} /></button>
          )}

          {/* FOOTER */}
          <div style={styles.footer}>
            <div style={styles.geminiInputCard}>
                {uploadedFile && (
                  <div style={{...styles.uploadPreviewRow, marginBottom: '4px'}}>
                    <div style={styles.imgBadge}>
                      <div 
                        style={{...styles.previewThumb, padding: 0, overflow: 'hidden', cursor: uploadedFile.type.startsWith('image/') ? 'pointer' : 'default'}}
                        onClick={() => {
                          if (uploadedFile.type.startsWith('image/')) setImageToEdit(dataUrl);
                        }}
                        title={uploadedFile.type.startsWith('image/') ? "Click to edit image" : ""}
                      >
                        {uploadedFile.type.startsWith('image/') && dataUrl ? (
                          <img src={dataUrl} alt="preview" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                        ) : '📄'}
                      </div>
                      <div style={styles.previewInfo}>
                        <span style={styles.previewName}>{uploadedFile.name || 'Uploaded Image'}</span>
                        <span style={styles.previewSize}>{(uploadedFile.size / 1024).toFixed(1)} KB</span>
                      </div>
                      <button onClick={removeUploadedImage} style={styles.delBadge}>✖</button>
                    </div>
                  </div>
                )}
                
                <textarea
                    ref={textareaRef}
                    placeholder={isLoading ? "Generating response..." : isOnline ? "Ask Farm Buddy..." : "Offline"}
                    disabled={!isOnline || isLoading}
                    style={styles.geminiTextArea}
                    className="gemini-textarea"
                    value={input}
                    rows={1}
                    onChange={(e) => {
                        setInput(e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                />

                <div style={styles.geminiActionRow}>
                  <input type="file" accept="image/*,.pdf,.txt" onChange={handleFileChange} style={{ display: 'none' }} id="cam-input" />
                  <label htmlFor="cam-input" style={styles.plusBtnInner} title="Add Attachment">
                      <Plus size={22} color="#E3E3E3" strokeWidth={2} />
                  </label>
                  
                  {isLoading ? (
                      <button onClick={handleStopGeneration} style={{...styles.sendBtn, background: '#ef4444'}} title="Stop Generation">
                          <Square fill="white" size={16} color="#fff" />
                      </button>
                  ) : !(input.trim() || uploadedFile) ? (
                      <button onClick={startListening} style={styles.iconBtnInner} title="Voice Input">
                          <Mic size={22} color="#E3E3E3" strokeWidth={1.5} />
                      </button>
                  ) : (
                      <button onClick={handleSend} style={{...styles.sendBtn, opacity: isOnline ? 1 : 0.5, cursor: isOnline ? 'pointer' : 'default', background: isOnline ? '#2E7D32' : '#555'}} disabled={!isOnline}>
                          <ArrowRight size={20} color="#fff" strokeWidth={2.5} />
                      </button>
                  )}
                </div>
            </div>
          </div>

          {/* DRAG & DROP OVERLAY */}
          {isDraggingFile && (
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(46, 125, 50, 0.2)', backdropFilter: 'blur(8px)', zIndex: 10001, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '4px dashed #4ade80', borderRadius: '24px', pointerEvents: 'none' }}>
                  <ImageIcon size={64} color="#4ade80" style={{ marginBottom: '16px', animation: 'pulseGlow 1.5s infinite alternate' }} />
                  <h2 style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold' }}>Drop image or document here</h2>
              </div>
          )}

        </div>
      )}

      {imageToEdit && (
          <ImageEditor 
              imageUrl={imageToEdit}
              onSave={(editedDataUrl) => {
                  setDataUrl(editedDataUrl);
                  setRawBase64(editedDataUrl.split(',')[1]);
                  setMimeType('image/jpeg');
                  setImageToEdit(null);
              }}
              onCancel={() => setImageToEdit(null)}
          />
      )}

      {showFullTerms && <FullTermsModal />}

      {/* FLOATING CAPSULE */}
      {!isOpen && (
        <div onMouseDown={handleMouseDown} onClick={handleClickButton} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} className={`gemini-bot-button ${isExpanded ? 'expanded' : 'collapsed'}`} style={{ ...styles.floatCapsule, right: `${position.x}px`, top: `${position.y}px`, width: isExpanded ? '145px' : '50px', height: '50px' }}>
            <div style={{ ...styles.geminiBotInner, width: '100%', height: '100%', borderRadius: isExpanded ? '25px' : '16px' }}>
                <Sparkles size={20} color="#fff" style={{ flexShrink: 0 }} />
                <span style={{ color: '#fff', fontSize: '13px', fontWeight: '500', letterSpacing: '0.2px', whiteSpace: 'nowrap', overflow: 'hidden', opacity: isExpanded ? 1 : 0, width: isExpanded ? '100px' : '0px', marginLeft: isExpanded ? '6px' : '0px', transition: 'all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)' }}>
                    Ask Farm Buddy
                </span>
            </div>
            <div className="snake-border"></div>
        </div>
      )}
      
      <style>{` 
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } 
        @keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } } 
        .typing-dot { width: 8px; height: 8px; background-color: #000; border-radius: 50%; display: inline-block; margin: 0 2px; animation: typingAnimation 1.4s infinite ease-in-out both; } 
        .typing-dot:nth-child(1) { animation-delay: -0.32s; } 
        .typing-dot:nth-child(2) { animation-delay: -0.16s; } 
        @keyframes typingAnimation { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1.0); } } 
        @keyframes spin { 100% { transform: rotate(-360deg); } } 
        @keyframes fadeOutUp { to { opacity: 0; transform: translateY(-20px); } } 
        @keyframes pulseGlow { 0% { opacity: 0.3; } 100% { opacity: 0.8; } }

        /* 3D TRANSPARENT BOT BUTTON & SNAKE BORDER */
        @keyframes slowPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.02); } }
        @keyframes spinCenter { 100% { transform: rotate(360deg); } }
        .gemini-bot-button { transition: width 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), border-radius 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.2s ease-out; position: relative; display: flex; align-items: center; justify-content: center; animation: slowPulse 4s ease-in-out infinite; box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2); }
        .gemini-bot-button:active { transform: scale(0.95); }
        .gemini-bot-button.expanded { border-radius: 25px; }
        .gemini-bot-button.collapsed { border-radius: 16px; }
        
        .snake-border {
            position: absolute;
            inset: 0;
            border-radius: inherit;
            padding: 3px;
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            overflow: hidden;
            z-index: 3;
            pointer-events: none;
        }
        .snake-border::before {
            content: ''; position: absolute; top: 50%; left: 50%; width: 300px; height: 300px; margin-top: -150px; margin-left: -150px;
            background: conic-gradient(transparent 50%, #ff3b30 70%, #ffcc00 85%, #4ade80 100%);
            animation: spinCenter 2s linear infinite;
        }

        /* AUTO-EXPANDING TEXTAREA PLACEHOLDER */
        .gemini-textarea::placeholder { color: rgba(255,255,255,0.5); transition: color 0.3s ease; }
        .gemini-textarea:focus::placeholder { color: #aaa; }

        /* PREMIUM EDIT TEXTAREA FOCUS EFFECTS */
        .premium-edit-textarea { transition: all 0.3s ease; }
        .premium-edit-textarea:focus { border-color: rgba(74, 222, 128, 0.5) !important; box-shadow: inset 0 2px 6px rgba(0,0,0,0.4), 0 0 0 1px rgba(74, 222, 128, 0.3) !important; background: rgba(0, 0, 0, 0.5) !important; }

        /* APPLE GLASS CARD CUSTOM CLASSES */
        .apple-glass-card {
          background: transparent; 
          backdrop-filter: blur(12px) saturate(120%) brightness(110%);
          -webkit-backdrop-filter: blur(12px) saturate(120%) brightness(110%);
          border-radius: 24px;
          padding: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-top: 1px solid rgba(255, 255, 255, 0.3);
          border-left: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.3), 0 8px 32px rgba(0, 0, 0, 0.15);
          color: #ffffff;
          font-family: "SF Pro Display", -apple-system, sans-serif;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .glass-label { font-size: 13px; opacity: 0.7; display: flex; gap: 6px; align-items: center; font-weight: 500; }
        .glass-value { font-size: 26px; font-weight: 700; margin-top: 6px; }
        .glass-subtext { font-size: 12px; opacity: 0.7; margin-top: 4px; }
      `}</style>
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
          background: '#000000',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderTop: '1px solid rgba(255, 255, 255, 0.45)',
          borderLeft: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.4), inset 0 0 15px rgba(255,255,255,0.1), 0 8px 32px rgba(0, 0, 0, 0.3)',
      display: 'flex', 
      flexDirection: 'column', 
      zIndex: 10000, 
      pointerEvents:'auto',
      overflow: 'hidden'
    },

    floatCapsule: { position: 'fixed', zIndex: 10000, touchAction: 'none', pointerEvents: 'auto', userSelect: 'none', cursor: 'move' },
    geminiBotInner: { 
        position: 'relative', 
        background: 'transparent',
        backdropFilter: 'blur(6px) saturate(120%)',
        WebkitBackdropFilter: 'blur(6px) saturate(120%)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderTop: '1px solid rgba(255, 255, 255, 0.25)',
        borderLeft: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.25), inset 0 -1px 2px rgba(0, 0, 0, 0.1)',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        zIndex: 2, 
        transition: 'all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)', 
        overflow: 'hidden' 
    },
    
    // ✏️ EDIT UI STYLES
    editRow: { display:'flex', gap:'5px', width:'100%' },
    editInput: { flex:1, background:'#333', border:'1px solid #555', color:'white', padding:'5px', borderRadius:'4px' },
    saveBtn: { background:'#2E7D32', border:'none', color:'white', borderRadius:'4px', cursor:'pointer' },
    iconBtn: { background:'transparent', border:'none', color:'#aaa', cursor:'pointer', fontSize:'14px' },
    
    editMsgContainer: { background: '#000000', width:'100%', maxWidth:'85%', padding:'20px', borderRadius:'28px', borderBottomRightRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.15)', borderTop: '1px solid rgba(255, 255, 255, 0.4)', borderLeft: '1px solid rgba(255, 255, 255, 0.3)', boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.4), inset 0 0 15px rgba(255,255,255,0.05), 0 10px 40px rgba(0, 0, 0, 0.4)' },
    editMsgTextarea: { width:'100%', height:'80px', background:'rgba(0, 0, 0, 0.3)', color:'#E3E3E3', border:'1px solid rgba(255, 255, 255, 0.1)', padding:'12px 16px', borderRadius:'16px', outline:'none', fontSize:'15px', lineHeight:'1.5', fontFamily:'"Inter", sans-serif', resize:'none', boxShadow:'inset 0 2px 6px rgba(0,0,0,0.4)', boxSizing:'border-box' },
    editMsgActions: { display:'flex', justifyContent:'flex-end', gap:'10px', marginTop:'12px' },
    saveEditBtn: { background:'#2E7D32', color:'white', border:'none', padding:'8px 18px', borderRadius:'20px', cursor:'pointer', fontSize:'13px', fontWeight:'600', transition:'all 0.2s ease', boxShadow:'0 4px 12px rgba(46, 125, 50, 0.3)' },
    cancelEditBtn: { background:'rgba(255, 255, 255, 0.08)', color:'#E3E3E3', border:'1px solid rgba(255, 255, 255, 0.15)', padding:'8px 18px', borderRadius:'20px', cursor:'pointer', fontSize:'13px', fontWeight:'600', transition:'all 0.2s ease' },
    editMsgBtn: { background: 'rgba(255, 255, 255, 0.15)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '50%', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)', transition: 'all 0.2s ease', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' },

    glassMenuBtn: { background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(20px) saturate(150%)', WebkitBackdropFilter: 'blur(20px) saturate(150%)', border: '1px solid rgba(255, 255, 255, 0.5)', boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)', borderRadius: '12px', padding: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease' },
    sidebarOverlay: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'flex-start' },
    sidebar: { width: '85%', maxWidth: '340px', height: '96%', margin: '2%', borderRadius: '36px', background: '#000000', border: '1px solid rgba(255, 255, 255, 0.05)', borderTop: '1px solid rgba(255, 255, 255, 0.1)', borderLeft: '1px solid rgba(255, 255, 255, 0.08)', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8)', display: 'flex', flexDirection: 'column', animation: 'slideIn 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)' },
    sidebarHeader: { padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff' },
    sidebarCloseBtn: { background:'none', border:'none', color:'white', fontSize:'24px', cursor:'pointer', padding: '0 5px', opacity: 0.8 },
    newChatBtn: { margin: '20px 15px 10px 15px', padding: '14px', backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', cursor: 'pointer', fontWeight: '600', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s ease' },
    sessionList: { flex: 1, overflowY: 'auto', padding: '0 10px 20px 10px' },
    sessionItem: { padding: '14px 16px', color: '#e0e0e0', cursor: 'pointer', borderRadius: '12px', marginBottom: '6px', fontSize: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background 0.2s' },
    deleteChatBtn: { background:'none', border:'none', color:'#888', fontSize:'14px', cursor:'pointer', opacity: 0.7 },
    
    header: { backgroundColor: 'transparent', padding: '8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '56px', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.08)' },
    headerTitleContainer: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '8px 16px', borderRadius: '12px', transition: 'background-color 0.2s', backgroundColor: 'rgba(255,255,255,0.05)' },
    headerTitle: { color: '#E3E3E3', fontSize: '18px', fontWeight: '500', fontFamily: '"Google Sans", "Inter", sans-serif', letterSpacing: '-0.03em' },
    headerBadge: { background: 'linear-gradient(90deg, #2E7D32, #81C784)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '14px', fontWeight: '600' },
    
    chatBody: { flex: 1, padding: '16px', overflowY: 'auto', scrollBehavior: 'smooth', position:'relative', backgroundColor: 'transparent', minHeight: 0 },
    chatBodyClearing: { animation: 'fadeOutUp 0.4s ease-out forwards' },
    botBubble: { background: 'transparent', color: '#ffffff', padding: '14px 18px', maxWidth: '90%', fontSize: '15px', lineHeight: '1.5', wordWrap: 'break-word', fontFamily: '"Times New Roman", Times, serif' },
    userBubble: { background: '#111111', color: '#ffffff', padding: '14px 18px', borderRadius: '24px', borderBottomRightRadius: '8px', maxWidth: '85%', fontSize: '15px', lineHeight: '1.5', wordWrap: 'break-word', border: '1px solid rgba(255, 255, 255, 0.15)', borderTop: '1px solid rgba(255, 255, 255, 0.4)', borderLeft: '1px solid rgba(255, 255, 255, 0.3)', boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.4), inset 0 0 10px rgba(255,255,255,0.1), 0 8px 32px rgba(0, 0, 0, 0.2)' },
    
    codeBlock: { backgroundColor: '#0d0d0d', border: '1px solid #333', borderRadius: '8px', margin: '12px 0', overflow: 'hidden' },
    codeHeader: { backgroundColor: '#222', padding: '6px 12px', fontSize: '12px', color: '#888', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', fontFamily: 'monospace' },
    codeCopyBtnSmall: { background: 'none', border: '1px solid #555', borderRadius: '4px', color: '#aaa', fontSize: '10px', cursor: 'pointer', padding: '2px 8px', textTransform: 'uppercase' },
    inlineCode: { backgroundColor: 'rgba(255,255,255,0.1)', padding: '2px 5px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '13px', color: '#FFCC80' },
    
    msgImg: { maxWidth: '300px', borderRadius: '12px', marginBottom: '10px', border: '1px solid #444', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' },
    pdfMessage: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: 'rgba(46, 125, 50, 0.2)', borderRadius: '12px', border: '1px solid rgba(74, 222, 128, 0.4)', cursor: 'pointer', marginBottom: '10px', color: '#81C784', fontWeight: '600', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' },
    timestamp: { fontSize: '11px', color: '#888', marginTop: '6px', marginLeft: '4px', marginRight: '4px' },
    
    typingIndicatorBubble: { background: '#111111', padding: '14px 20px', borderRadius: '24px', borderBottomLeftRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.15)', borderTop: '1px solid rgba(255, 255, 255, 0.4)', borderLeft: '1px solid rgba(255, 255, 255, 0.3)', boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.4), inset 0 0 10px rgba(255,255,255,0.1), 0 8px 32px rgba(0, 0, 0, 0.2)', display:'inline-block', marginBottom:'15px' },
    loadingTxt: { color: '#888', fontSize: '13px', textAlign: 'center', marginTop: '10px', fontStyle: 'italic' },
    
    actionRow: { display: 'flex', gap: '10px', marginTop: '10px' },
    outlineBtn: { backgroundColor: 'rgba(255,255,255,0.05)', color: '#E3E3E3', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '20px', padding: '6px 14px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s ease', fontFamily: '"Inter", sans-serif' },
    scrollBtn: { position: 'absolute', bottom: '100px', right: '20px', background: '#000000', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '50%', width: '44px', height: '44px', cursor: 'pointer', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', zIndex: 2001, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)' },
    
    footer: { backgroundColor: 'transparent', padding: '0', display: 'flex', flexDirection: 'column', alignItems: 'center', boxSizing: 'border-box', width: '100%', zIndex: 10 },
    
    geminiInputCard: { width: '100%', maxWidth: '100%', background: '#000000', borderTop: '1px solid rgba(255,255,255,0.25)', borderRadius: '24px 24px 0 0', padding: '16px 16px 28px 16px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '8px', boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.2), 0 -8px 30px rgba(0,0,0,0.4)' },
    geminiActionRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' },
    geminiTextArea: { width: '100%', background: 'transparent', border: 'none', color: '#E3E3E3', outline: 'none', fontSize: '16px', padding: '4px 4px', fontFamily: '"Inter", sans-serif', resize: 'none', lineHeight: '1.4', minHeight: '24px', maxHeight: '150px', overflowY: 'auto', boxSizing: 'border-box' },
    
    iconBtnInner: { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', borderRadius: '50%', transition: 'background-color 0.2s', flexShrink: 0 },
    plusBtnInner: { background: 'rgba(255, 255, 255, 0.1)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', transition: 'background-color 0.2s', flexShrink: 0 },
    sendBtn: { background: '#2E7D32', border: 'none', borderRadius: '50%', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)', flexShrink: 0, boxShadow: '0 4px 15px rgba(46, 125, 50, 0.4)' },
    
    uploadPreviewRow: { width: '100%', maxWidth: '100%', marginBottom: '12px', display: 'flex' },
    imgBadge: { display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#1E1F22', padding: '8px 16px 8px 8px', borderRadius: '16px', width: 'fit-content', border: '1px solid #444746' },
    previewThumb: { width: '40px', height: '40px', backgroundColor: '#282A2C', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' },
    previewInfo: { display: 'flex', flexDirection: 'column', gap: '2px' },
    previewName: { color: '#E3E3E3', fontSize: '13px', fontWeight: '500', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    previewSize: { color: '#C4C7C5', fontSize: '11px' },
    delBadge: { background: 'transparent', color: '#C4C7C5', border: 'none', fontSize: '16px', cursor: 'pointer', padding: '4px', marginLeft: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    
    sidebarFooter: { padding: '20px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)' },
    termsText: { fontSize: '12px', color: '#A0A0A0', textAlign: 'center', lineHeight: '1.5' },
    readTermsBtn: { background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#E3E3E3', borderRadius: '20px', padding: '8px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease' },

    modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 10002, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'auto', backdropFilter: 'blur(15px)' },
    modalContent: { width: '90%', maxWidth: '600px', background: '#000000', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.15)', borderTop: '1px solid rgba(255, 255, 255, 0.4)', borderLeft: '1px solid rgba(255, 255, 255, 0.3)', boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.4), inset 0 0 15px rgba(255,255,255,0.05), 0 25px 50px -12px rgba(0,0,0,0.8)', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '85vh', animation: 'fadeIn 0.2s ease-out' },
    modalHeader: { padding: '20px 24px', backgroundColor: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)', fontWeight: 'bold', fontSize: '16px', display: 'flex', justifyContent: 'space-between', color: '#fff' },
    modalBody: { padding: '24px', overflowY: 'auto', color: '#E3E3E3', fontSize: '14px', lineHeight: '1.6', flex: 1 },
    closeX: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#E3E3E3', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    acceptBtn: { width: '100%', padding: '20px', backgroundColor: 'rgba(46, 125, 50, 0.8)', backdropFilter: 'blur(10px)', color: 'white', border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '1px', transition: 'background 0.2s ease' },
    warnText: { color: '#ef4444', fontWeight: 'bold', borderBottom:'2px solid rgba(255,255,255,0.1)', paddingBottom:'12px', marginBottom:'16px', textAlign:'center', fontSize: '15px' },
    langBlock: { marginBottom: '25px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px' }
};

export default ChatBot;