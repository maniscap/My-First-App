import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk"; 
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * 🌿 FARM BUDDY: THE ULTIMATE BRUTE FORCE EDITION (v15.0)
 * ----------------------------------------------------------------
 * 🧠 STRATEGY: "Shotgun" Failover (Tries 15+ Models sequentially)
 * 🛡️ LEGAL: 20-Section Mega-Shield
 * 🔧 DIAGNOSTICS: Console Error Logging Enabled
 */

function ChatBot() {
  // --- 🔐 SECURE CONFIGURATION ---
  const GROQ_KEY = import.meta.env.VITE_GROQ_KEY;
  const GEMINI_KEY = import.meta.env.VITE_GEMINI_KEY; 

  // --- 🛠️ PROVIDER INITIALIZATION ---
  const groq = new Groq({ apiKey: GROQ_KEY, dangerouslyAllowBrowser: true });

  // --- ⚙️ THE "TOTAL" MODEL LIST ---
  // The code will try these ONE BY ONE. If "Nano Banana" (Beta) fails, 
  // it instantly jumps to "Gemini 1.5 Flash" (Stable).
  const MODEL_QUEUE = [
    // --- TIER 1: HYPER-SPEED GROQ (Text Only) ---
    { provider: 'groq', id: 'llama3-8b-8192' },       // Most Reliable
    { provider: 'groq', id: 'llama3-70b-8192' },      // Smartest Groq
    { provider: 'groq', id: 'mixtral-8x7b-32768' },   // Large Context
    { provider: 'groq', id: 'gemma-7b-it' },          // Google on Groq
    
    // --- TIER 2: GOOGLE GEMINI (The "Total" List) ---
    // Includes the Beta/Screenshot models you requested.
    { provider: 'gemini', id: 'gemini-1.5-flash' },   // STABLE (Likely to work)
    { provider: 'gemini', id: 'gemini-1.5-flash-8b' },// STABLE (Fastest)
    { provider: 'gemini', id: 'gemini-1.5-pro' },     // STABLE (Smartest)
    { provider: 'gemini', id: 'gemini-1.0-pro' },     // LEGACY (Backup)
    
    // --- TIER 3: EXPERIMENTAL / FUTURE MODELS (From Screenshots) ---
    // If these don't exist yet publicly, the code catches the error and skips them.
    { provider: 'gemini', id: 'gemini-3-flash' },     
    { provider: 'gemini', id: 'gemini-3-pro' },       
    { provider: 'gemini', id: 'nano-banana' },        
    { provider: 'gemini', id: 'nano-banana-pro' }     
  ];

  // --- 📝 STATE ---
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      text: "Hello! I am **Farm Buddy** 🤝🌾.\n\nI am equipped with a **Brute Force AI Engine**. I will cycle through 12+ AI models (including Nano Banana & Gemini 3) until I find one that is online.\n\n*Please read the extended 20-point legal agreement to begin.*", 
      sender: "bot" 
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [debugLog, setDebugLog] = useState(""); // Stores error codes for you to see
  
  const [termsAccepted, setTermsAccepted] = useState(() => {
    return typeof window !== "undefined" && localStorage.getItem('farmbuddy_bruteforce_v15') === 'true';
  });
  const [showFullTerms, setShowFullTerms] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [imagePart, setImagePart] = useState(null); 

  const messagesEndRef = useRef(null);
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => scrollToBottom(), [messages]);

  // --- 🔄 FILE PROCESSING ---
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
          setInput(`Analyze this crop image. Identify pests, diseases, or deficiencies.`);
      }
  };

  const removeUploadedImage = () => { setUploadedFile(null); setImagePart(null); setInput(""); }
  const handleOpenChat = () => { setIsOpen(true); if (!termsAccepted) setShowFullTerms(true); }
  const handleCloseChat = () => { setIsOpen(false); removeUploadedImage(); setShowFullTerms(false); }
  const handleAcceptTerms = () => {
      setTermsAccepted(true);
      setShowFullTerms(false);
      localStorage.setItem('farmbuddy_bruteforce_v15', 'true');
  }

  // --- 🧠 THE "BRUTE FORCE" ENGINE ---
  const handleSend = async () => {
    if (!termsAccepted) { setShowFullTerms(true); return; }
    if (!input.trim() && !imagePart) return;

    const userText = input.trim() || uploadedFile?.name || "Scan Request";
    setMessages(prev => [...prev, { text: userText, sender: "user", image: uploadedFile ? URL.createObjectURL(uploadedFile) : null }]);
    setInput(""); 
    setIsLoading(true);
    setDebugLog(""); // Clear previous errors

    const systemPrompt = "You are Farm Buddy, an expert agricultural AI. Use Markdown. Be concise and accurate.";
    let finalResponse = "";
    let success = false;

    // --- LOOP THROUGH EVERY MODEL IN THE QUEUE ---
    for (const modelConfig of MODEL_QUEUE) {
        if (success) break; // Stop if we found a working model
        
        // Skip Groq (Text) models if user uploaded an image
        if (imagePart && modelConfig.provider === 'groq') continue;

        try {
            console.log(`Attempting connection to: ${modelConfig.id} (${modelConfig.provider})...`);
            
            if (modelConfig.provider === 'groq') {
                const res = await groq.chat.completions.create({
                    messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userText }],
                    model: modelConfig.id,
                });
                finalResponse = res.choices[0]?.message?.content;
                if (finalResponse) success = true;

            } else if (modelConfig.provider === 'gemini') {
                const genAI = new GoogleGenerativeAI(GEMINI_KEY);
                const model = genAI.getGenerativeModel({ model: modelConfig.id });
                
                const promptParts = [{ text: "SYSTEM: " + systemPrompt }, { text: userText }];
                if (imagePart) promptParts.unshift(imagePart);
                
                const result = await model.generateContent(promptParts);
                finalResponse = (await result.response).text();
                if (finalResponse) success = true;
            }
        } catch (error) {
            console.warn(`Model ${modelConfig.id} Failed:`, error.message);
            // We append errors to a hidden log so we can debug if needed
            setDebugLog(prev => prev + `[${modelConfig.id}: ${error.status || 'Fail'}] `);
        }
    }

    // --- FINAL FALLBACK MESSAGE ---
    if (!success) {
        finalResponse = `⚠️ **System Offline**: Tried 12+ AI Models and all failed. \n\n**Debug Info:** ${debugLog}\n\n*Possible Fixes:*\n1. Check Vercel API Keys (Are they blank?)\n2. Check Internet Connection.\n3. Reload the page.`;
    }

    setMessages(prev => [...prev, { text: finalResponse, sender: "bot" }]);
    setIsLoading(false);
    setUploadedFile(null); 
    setImagePart(null);
  };

  // --- 📜 MASSIVE 20-SECTION LEGAL AGREEMENT ---
  const FullTermsModal = () => (
      <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
              <h3 style={styles.modalHeader}>
                  ⚖️ UNIVERSAL TERMS & CONDITIONS (2025)
                  <button onClick={() => setShowFullTerms(false)} style={styles.modalDismissBtn}>✖</button> 
              </h3>
              <div style={styles.modalBody}>
                  <p style={{color: '#D32F2F', fontWeight: 'bold', textAlign: 'center', fontSize: '15px', borderBottom: '2px solid #eee', paddingBottom: '10px'}}>
                      ⚠️ CRITICAL NOTICE: YOU ARE WAIVING ALL LEGAL RIGHTS.
                  </p>
                  
                  <h4>1. IRREVOCABLE WAIVER OF LIABILITY</h4>
                  <p>By accessing Farm Buddy, you ("The User") expressly acknowledge and agree that your use of this Artificial Intelligence is at your **sole and absolute risk**. The owners, developers, creators, and hosting partners ("The Indemnified") assume **ZERO LIABILITY** for any outcomes, physical damages, financial losses, or crop deaths.</p>

                  <h4>2. AI ERROR & HALLUCINATION POLICY</h4>
                  <p>Artificial Intelligence (Groq & Gemini) is experimental and **can make mistakes**. The AI may hallucinate incorrect facts, suggest non-existent pesticides, or misidentify diseases. You are legally required to **double-check** every result provided here against official agricultural manuals. Failure to verify information is your sole negligence.</p>

                  <h4>3. SUGGESTIONS ONLY (NOT MANDATES)</h4>
                  <p>All results given in these chats are **strictly suggestions** for research purposes only. They are NOT mandates. The Owners are **NOT responsible for your actions**. If you follow a suggestion and it kills your harvest, the decision was yours alone.</p>

                  <h4>4. PROVIDER ACKNOWLEDGMENT</h4>
                  <p>You acknowledge that the results displayed here are generated by third-party Large Language Models from **Groq and Google**. The Developers have no control over their logic or server stability.</p>

                  <h4>5. BINDING ACCEPTANCE</h4>
                  <p>By clicking "Accept," you verify that you have **read all terms** and this constitutes a binding digital signature.</p>

                  <h4>6. CHEMICAL SAFETY</h4>
                  <p>Pesticides are dangerous. The AI may suggest chemicals illegal in your area. **You must check local laws.** The Developers assume no liability for poisoning.</p>

                  <h4>7. FINANCIAL LOSS WAIVER</h4>
                  <p>The Developers do not guarantee yield or profit. You waive any right to claim compensation for financial bankruptcy caused by farming decisions.</p>

                  <h4>8. DATA TRANSMISSION</h4>
                  <p>Your data is transmitted to US-based servers. We are not responsible for data intercepts or privacy breaches by third-party providers.</p>

                  <h4>9. JURISDICTION & ARBITRATION</h4>
                  <p>Any dispute must be resolved by binding individual arbitration. You waive the right to a jury trial or class action lawsuit.</p>

                  <h4>10. FORCE MAJEURE</h4>
                  <p>We are not liable for service outages caused by internet failures, war, strikes, or acts of God.</p>

                  <h4>11. NO WARRANTY</h4>
                  <p>The service is provided "AS IS" without any warranty of accuracy or uptime.</p>

                  <h4>12. MEDICAL DISCLAIMER</h4>
                  <p>This AI cannot diagnose human or animal health issues caused by crops. Consult a doctor for health advice.</p>

                  <h4>13. INDEMNIFICATION</h4>
                  <p>You agree to pay all legal fees for the Developers if you violate these terms and cause a lawsuit.</p>

                  <h4>14. AGE RESTRICTION</h4>
                  <p>You must be 18+ to use this app, as it discusses hazardous chemicals.</p>

                  <h4>15. SEVERABILITY</h4>
                  <p>If one part of this contract is invalid, the rest remains legally binding.</p>

                  <h4>16. MODIFICATION RIGHTS</h4>
                  <p>We can change these terms at any time without notifying you.</p>

                  <h4>17. ACCURACY OF IMAGES</h4>
                  <p>AI Vision can misinterpret blurry images. You must verify diagnoses visually yourself.</p>

                  <h4>18. CROP INSURANCE</h4>
                  <p>Using this AI does not replace crop insurance. We are not an insurance provider.</p>

                  <h4>19. INTELLECTUAL PROPERTY</h4>
                  <p>The code is proprietary. The AI outputs belong to the user/provider terms.</p>

                  <h4>20. FINAL AGREEMENT</h4>
                  <p>This is the complete and final agreement between User and Developer.</p>

                  <hr style={{borderColor: '#ddd', margin: '20px 0'}}/>
                  <p style={{fontSize: '11px', textAlign: 'center', color: '#666'}}>
                      <em>Use of this tool constitutes a binding legal agreement.</em>
                  </p>
              </div>
              <button onClick={handleAcceptTerms} style={styles.acceptBtn}>
                  ✅ I READ ALL 20 SECTIONS & ACCEPT RESPONSIBILITY
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
                    Brute Force: 12-Model Grid
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
                    <span style={{marginLeft: '10px'}}>Cycling through AI Models...</span>
                </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* FOOTER */}
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

                <button onClick={handleSend} style={styles.sendCircle} disabled={!termsAccepted}>➤</button>
            </div>
            <div style={styles.bottomWarning}>
                AI can err. <span onClick={() => setShowFullTerms(true)} style={styles.readMore}>Read 20-Point Terms</span>
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

// --- 💅 STYLES (Professional Dark Mode) ---
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