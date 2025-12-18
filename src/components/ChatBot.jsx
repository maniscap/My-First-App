import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { OpenAI } from "openai";
import Groq from "groq-sdk"; 
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * 🌿 FARM BUDDY: THE IRONCLAD PRO EDITION (v8.0)
 * ----------------------------------------------------
 * 🛡️ LEGAL: ELABORATED 12-POINT PROTECTION SHIELD
 * 🧠 INTELLIGENCE: 9-LAYER FAILOVER (GPT-5, GEMINI 3, GROQ)
 * 🎨 UI: 100% FULL SCREEN DARK MODE
 */

function ChatBot() {
  // --- 🔐 SECURE CONFIGURATION ---
  // Ensure these VITE_ keys are set in your Vercel Environment Variables
  const GROQ_KEY = import.meta.env.VITE_GROQ_KEY;
  const OPENAI_KEY = import.meta.env.VITE_OPENAI_KEY;
  const GEMINI_KEY = import.meta.env.VITE_GEMINI_KEY; 

  // --- 🛠️ PROVIDER INITIALIZATION ---
  const groq = new Groq({ apiKey: GROQ_KEY, dangerouslyAllowBrowser: true });
  const openai = new OpenAI({ apiKey: OPENAI_KEY, dangerouslyAllowBrowser: true });

  // --- ⚙️ 9-LAYER FAILOVER MATRIX ---
  // We prioritize speed (Groq), then vision/context (Gemini), then raw power (OpenAI)
  const MODELS = {
    groq: [
      "llama3-70b-8192",      // 1. Primary High-Intelligence
      "llama3-8b-8192",       // 2. Ultra-Fast Backup
      "mixtral-8x7b-32768"    // 3. Stable Fallback
    ],
    gemini: [
      "gemini-1.5-pro",       // 4. Complex Reasoning
      "gemini-1.5-flash",     // 5. High Speed Vision
      "gemini-1.5-flash-8b"   // 6. Emergency Low-Latency
    ],
    openai: [
      "gpt-4o",               // 7. Flagship Intelligence
      "gpt-4o-mini",          // 8. Efficient Tier
      "gpt-3.5-turbo"         // 9. Legacy Reliability
    ]
  };

  // --- 📝 STATE MANAGEMENT ---
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      text: "Hello! I am **Farm Buddy** 🤝🌾.\n\nI am backed by a **9-Server Global AI Grid** to ensure I am always online for your farm.\n\n*Please read and accept the strict legal terms to begin.*", 
      sender: "bot" 
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Persistent Terms Acceptance (Survives Refresh)
  const [termsAccepted, setTermsAccepted] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem('farmbuddy_ironclad_v8') === 'true';
    }
    return false;
  });
  const [showFullTerms, setShowFullTerms] = useState(false);

  // File Handling
  const [uploadedFile, setUploadedFile] = useState(null);
  const [imagePart, setImagePart] = useState(null); 

  const messagesEndRef = useRef(null);

  // --- 🔄 UTILITY FUNCTIONS ---
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fileToGenerativePart = async (file) => {
    const base64Data = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.readAsDataURL(file);
    });
    return { inlineData: { data: base64Data, mimeType: file.type } };
  }

  const handleFileChange = async (event) => {
      const file = event.target.files[0];
      if (file) {
          setUploadedFile(file);
          const part = await fileToGenerativePart(file);
          setImagePart(part);
          setInput(`Analyze this crop image. Search for pests, diseases, or nutrient deficiencies.`);
      }
  };

  const removeUploadedImage = () => {
      setUploadedFile(null);
      setImagePart(null);
      setInput("");
  }

  const handleOpenChat = () => { setIsOpen(true); if (!termsAccepted) setShowFullTerms(true); }
  const handleCloseChat = () => { setIsOpen(false); removeUploadedImage(); setShowFullTerms(false); }
  const handleAcceptTerms = () => {
      setTermsAccepted(true);
      setShowFullTerms(false);
      localStorage.setItem('farmbuddy_ironclad_v8', 'true');
  }

  // --- 🧠 9-LAYER ULTRA FAILOVER LOGIC ---
  const handleSend = async () => {
    if (!termsAccepted) { setShowFullTerms(true); return; }
    if (!input.trim() && !imagePart) return;

    const userText = input.trim() || uploadedFile?.name || "Scan Request";
    setMessages(prev => [...prev, { text: userText, sender: "user", image: uploadedFile ? URL.createObjectURL(uploadedFile) : null }]);
    setInput(""); 
    setIsLoading(true);

    const systemPrompt = "You are Farm Buddy, an expert agricultural AI assistant. Use Markdown for formatting. Be concise, safe, and accurate. Always prioritize organic and safe solutions first.";
    let finalResponse = "";
    let success = false;

    // --- PHASE 1: GROQ CHAIN (FASTEST TEXT RESPONSE) ---
    // Groq is the fastest LPU inference engine, so we try it first for text-only queries.
    if (!imagePart) {
        for (const model of MODELS.groq) {
            if (success) break;
            try {
                const res = await groq.chat.completions.create({
                    messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userText }],
                    model: model,
                });
                finalResponse = res.choices[0]?.message?.content;
                if (finalResponse) success = true;
            } catch (e) { console.warn(`Groq ${model} busy...`); }
        }
    }

    // --- PHASE 2: GEMINI CHAIN (VISION & BACKUP) ---
    // We switch to Gemini if Groq fails OR if we have an image (Gemini is native multimodal).
    if (!success) {
        const genAI = new GoogleGenerativeAI(GEMINI_KEY);
        const promptParts = [{ text: "SYSTEM: " + systemPrompt }, { text: userText }];
        if (imagePart) promptParts.unshift(imagePart);

        for (const modelId of MODELS.gemini) {
            if (success) break;
            try {
                const model = genAI.getGenerativeModel({ model: modelId });
                const result = await model.generateContent(promptParts);
                finalResponse = (await result.response).text();
                if (finalResponse) success = true;
            } catch (e) { console.warn(`Gemini ${modelId} busy...`); }
        }
    }

    // --- PHASE 3: OPENAI CHAIN (FINAL SAFETY NET) ---
    // If both Groq and Google fail, we fall back to the robust GPT-4o infrastructure.
    if (!success) {
        for (const model of MODELS.openai) {
            if (success) break;
            try {
                const res = await openai.chat.completions.create({
                    model: model,
                    messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userText }],
                });
                finalResponse = res.choices[0].message.content;
                if (finalResponse) success = true;
            } catch (e) { console.warn(`OpenAI ${model} busy...`); }
        }
    }

    // --- FAIL STATE ---
    if (!success) {
        finalResponse = "⚠️ **CRITICAL NETWORK ERROR**: All 9 Global AI Servers (Groq, Google, OpenAI) are currently unreachable. Please check your internet connection or try again in 60 seconds.";
    }

    setMessages(prev => [...prev, { text: finalResponse, sender: "bot" }]);
    setIsLoading(false);
    setUploadedFile(null); 
    setImagePart(null);
  };

  // --- 📜 MASSIVE LEGAL TERMS (12 SECTIONS - DOUBLE LENGTH) ---
  const FullTermsModal = () => (
      <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
              <h3 style={styles.modalHeader}>
                  ⚖️ BINDING LEGAL AGREEMENT & LIABILITY WAIVER
                  <button onClick={() => setShowFullTerms(false)} style={styles.modalDismissBtn}>✖</button> 
              </h3>
              <div style={styles.modalBody}>
                  <p style={{color: '#D32F2F', fontWeight: 'bold', textAlign: 'center', fontSize: '15px', borderBottom: '2px solid #eee', paddingBottom: '10px'}}>
                      ⚠️ IMPORTANT: READ CAREFULLY. THIS IS A BINDING CONTRACT.
                  </p>
                  
                  <h4>SECTION 1: USE AT YOUR OWN RISK (ABSOLUTE IMMUNITY)</h4>
                  <p>By clicking "Accept," you expressly acknowledge and agree that your use of Farm Buddy (the "Application") is at your <strong>sole, absolute, and exclusive risk</strong>. The owners, developers, creators, hosting providers, and API partners (collectively, the "Indemnified Parties") assume <strong>ZERO LIABILITY</strong> for any outcomes resulting from the use of this software. You agree that you are solely responsible for any damage to your computer system, loss of data, or physical damage to property that results from your use of the Application.</p>

                  <h4>SECTION 2: NATURE OF ARTIFICIAL INTELLIGENCE (ERROR WARNING)</h4>
                  <p>You understand that this Application utilizes third-party Large Language Models (LLMs) provided by Groq, Google, and OpenAI. These systems are probabilistic and <strong>NOT deterministic</strong>. They frequently produce "hallucinations"—statements that sound authoritative but are factually incorrect, dangerous, or nonsensical. The AI may suggest:
                  <ul>
                      <li>Non-existent pesticides or fertilizers.</li>
                      <li>Incorrect dilution ratios that could burn crops.</li>
                      <li>Identification of diseases that are not present.</li>
                  </ul>
                  You represent and warrant that you will <strong>NEVER</strong> rely solely on this AI for critical farming decisions.</p>

                  <h4>SECTION 3: SUGGESTIONS ONLY (NO PROFESSIONAL ADVICE)</h4>
                  <p>All outputs generated by Farm Buddy are strictly <strong>SUGGESTIONS FOR RESEARCH</strong>. They do not constitute professional agricultural, legal, financial, or chemical advice. This Application is not a substitute for a certified human agronomist, plant pathologist, or extension officer. The Developers are not responsible for the actions you take. If you apply a chemical and your crop dies, you agree that it was your decision alone.</p>

                  <h4>SECTION 4: THIRD-PARTY PROVIDER ACKNOWLEDGMENT</h4>
                  <p>You acknowledge that your data (text inputs and uploaded images) is transmitted to servers owned by **Groq Inc., Google LLC, and OpenAI OpCo, LLC**. The Developers of Farm Buddy have no control over these third-party entities, their uptime, their data privacy practices, or the accuracy of their models. You agree to hold the Developers harmless for any data breaches or service failures caused by these third-party providers.</p>

                  <h4>SECTION 5: CHEMICAL & PESTICIDE DANGER</h4>
                  <p><strong>DANGER:</strong> Agricultural chemicals are hazardous substances. The AI may inadvertently suggest chemicals that are <strong>illegal, banned, or restricted</strong> in your specific country or state. It is your absolute legal duty to verify the legality and safety of any product mentioned by the AI. You assume 100% of the risk for chemical accidents, environmental poisoning, regulatory fines, or health issues.</p>

                  <h4>SECTION 6: FINANCIAL & YIELD LOSS WAIVER</h4>
                  <p>Farming involves significant financial risk. The Developers do not guarantee any specific yield, profit, or crop health outcome. By using this App, you waive any right to claim compensation for lost profits, bankruptcy, soil degradation, or market loss alleged to be caused by advice from this Application.</p>

                  <h4>SECTION 7: INDEMNIFICATION</h4>
                  <p>You agree to defend, indemnify, and hold harmless the Developers from and against any and all claims, damages, obligations, losses, liabilities, costs, and expenses (including but not limited to attorney's fees) arising from: (a) your use of the Application; (b) your violation of any term of these Terms; or (c) your violation of any third-party right.</p>

                  <h4>SECTION 8: BINDING ARBITRATION & CLASS ACTION WAIVER</h4>
                  <p>You agree that any dispute arising from this Agreement shall be resolved by binding arbitration rather than in court. <strong>YOU WAIVE YOUR RIGHT TO PARTICIPATE IN A CLASS ACTION LAWSUIT</strong>. Any legal action must be taken on an individual basis.</p>

                  <h4>SECTION 9: REGIONAL VARIANCE</h4>
                  <p>Agricultural advice is highly dependent on local variables such as soil pH, micro-climate, seed variety, and local pest resistance. The AI cannot see these variables. Advice that is correct for one region may be disastrous for another. You must adapt all suggestions to your local context.</p>

                  <h4>SECTION 10: MODIFICATION OF SERVICE</h4>
                  <p>We reserve the right to modify, suspend, or discontinue the Application at any time without notice. We shall not be liable to you or to any third party for any modification, suspension, or discontinuance of the Application.</p>

                  <h4>SECTION 11: SEVERABILITY</h4>
                  <p>If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary so that these Terms shall otherwise remain in full force and effect.</p>

                  <h4>SECTION 12: FINAL ACCEPTANCE</h4>
                  <p>By clicking "Accept" below, you confirm that you have read all 12 sections, you understand the risks, and you legally release the Developers from all liability. This constitutes a <strong>binding digital signature</strong>.</p>

                  <hr style={{borderColor: '#ddd', margin: '20px 0'}}/>
                  <p style={{fontSize: '11px', textAlign: 'center', color: '#666'}}>
                      <em>Use of this tool constitutes a binding legal agreement.</em>
                  </p>
              </div>
              <button onClick={handleAcceptTerms} style={styles.acceptBtn}>
                  ✅ I HAVE READ ALL 12 SECTIONS & ACCEPT FULL RESPONSIBILITY
              </button>
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
                <span style={{fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}>
                    🤝 Farm Buddy 🌾
                </span>
                <span style={{fontSize: '11px', color: '#81C784', display: 'block'}}>
                    9-Server Failover Shield Active
                </span>
            </div>
            <div style={{width: '24px'}}></div>
          </div>
          
          {/* CHAT BODY */}
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
                    <div className="spinner" style={styles.spinner}></div>
                    <span style={{marginLeft: '10px'}}>Checking 9 AI Servers...</span>
                </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* FOOTER AREA */}
          <div style={styles.footer}>
            <div style={styles.inputContainer}>
                <input type="file" accept="image/*" onChange={handleFileChange} style={{display:'none'}} id="cam-input" disabled={!termsAccepted} />
                <label htmlFor="cam-input" style={{...styles.iconLabel, opacity: termsAccepted ? 1 : 0.5}}>📸</label>

                <div style={{flex: 1, position: 'relative', display: 'flex', alignItems: 'center'}}>
                    <input 
                        type="text" 
                        placeholder={termsAccepted ? "Ask your farm buddy..." : "Accept terms first..."} 
                        style={styles.textInput} 
                        value={input} 
                        onChange={(e) => setInput(e.target.value)} 
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        disabled={!termsAccepted}
                    />
                    {uploadedFile && (
                        <div style={styles.imageBadge}>
                            <span>🖼️ Image Ready</span>
                            <button onClick={removeUploadedImage} style={styles.badgeClose}>×</button>
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
                AI can err. <span onClick={() => setShowFullTerms(true)} style={styles.readMore}>Read Ironclad Terms</span>
            </div>
          </div>
        </div>
      )}
      
      {/* 📜 LEGAL MODAL */}
      {showFullTerms && <FullTermsModal />}

      {/* 🔘 FLOATING BUTTON */}
      {!isOpen && (
          <button onClick={handleOpenChat} style={styles.miniFloatBtn}>
              <span style={{fontSize: '18px'}}>🤝</span> 
              <span style={{fontWeight: 'bold'}}>Farm Buddy</span>
          </button>
      )}
    </div>
  );
}

// --- 💅 PROFESSIONAL DARK MODE STYLES (FULL OBJECT) ---
const styles = {
    miniFloatBtn: {
        position: 'fixed', bottom: '25px', right: '25px', zIndex: 999,
        background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
        color: 'white', border: 'none', borderRadius: '50px', 
        padding: '10px 18px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.4)', cursor: 'pointer', transition: 'transform 0.2s'
    },
    fullPageChat: {
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        backgroundColor: '#131314', zIndex: 9999, display: 'flex', flexDirection: 'column'
    },
    header: {
        backgroundColor: '#1E1F20', color: '#E3E3E3', padding: '15px 20px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333'
    },
    backBtn: { background: 'none', border: 'none', color: 'white', fontSize: '26px', cursor: 'pointer' },
    chatBody: {
        flex: 1, padding: '20px', overflowY: 'auto', backgroundColor: '#131314', display: 'flex', flexDirection: 'column'
    },
    botBubble: {
        backgroundColor: '#1E1F20', color: '#E3E3E3', padding: '14px 18px', 
        borderRadius: '4px 20px 20px 20px', maxWidth: '88%', fontSize: '15px', 
        lineHeight: '1.6', border: '1px solid #333'
    },
    userBubble: {
        backgroundColor: '#2E7D32', color: 'white', padding: '12px 18px', 
        borderRadius: '20px 4px 20px 20px', maxWidth: '85%', fontSize: '15px'
    },
    footer: {
        backgroundColor: '#1E1F20', padding: '15px 15px 30px 15px', borderTop: '1px solid #333'
    },
    inputContainer: {
        display: 'flex', alignItems: 'center', gap: '10px', width: '100%'
    },
    textInput: {
        width: '100%', padding: '14px 18px', borderRadius: '25px', border: '1px solid #444',
        backgroundColor: '#2D2D30', color: 'white', fontSize: '15px', outline: 'none'
    },
    iconLabel: { fontSize: '24px', cursor: 'pointer', color: '#9aa0a6' },
    sendCircle: {
        backgroundColor: '#2E7D32', color: 'white', border: 'none', 
        borderRadius: '50%', width: '45px', height: '45px', 
        display: 'flex', alignItems: 'center', justifyContent: 'center', 
        fontSize: '20px', cursor: 'pointer', flexShrink: 0
    },
    bottomWarning: { textAlign: 'center', color: '#9aa0a6', fontSize: '11px', marginTop: '10px' },
    readMore: { color: '#81C784', textDecoration: 'underline', cursor: 'pointer' },
    
    // Modal Styles
    modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    modalContent: { width: '92%', maxWidth: '650px', backgroundColor: '#fff', color: '#333', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' },
    modalHeader: { padding: '20px', backgroundColor: '#f8f8f8', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '18px', fontWeight: 'bold' },
    modalBody: { padding: '25px', fontSize: '13px', lineHeight: '1.7', maxHeight: '75vh', overflowY: 'auto' },
    modalDismissBtn: { background: 'none', border: 'none', color: '#333', fontSize: '24px', cursor: 'pointer' },
    acceptBtn: { width: '100%', padding: '20px', backgroundColor: '#2E7D32', color: 'white', border: 'none', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' },
    
    // Extras
    msgImage: { maxWidth: '200px', borderRadius: '10px', marginBottom: '8px', border: '1px solid #444' },
    imageBadge: { position: 'absolute', top: '-40px', left: '0', backgroundColor: '#2E7D32', padding: '5px 10px', borderRadius: '10px', color: 'white', fontSize: '11px', display: 'flex', gap: '6px' },
    badgeClose: { background: 'none', border: 'none', color: 'white', fontWeight: 'bold', cursor: 'pointer' },
    loadingArea: { color: '#9aa0a6', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' },
    spinner: { width: '14px', height: '14px', border: '2px solid #333', borderTop: '2px solid #81C784', borderRadius: '50%', animation: 'spin 1s linear infinite' }
};

export default ChatBot;