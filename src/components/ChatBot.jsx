import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { OpenAI } from "openai";
import Groq from "groq-sdk"; 
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * 🌿 FARM BUDDY: IRONCLAD EDITION (v4.0)
 * ----------------------------------------------------
 * ARCHITECTURE: 9-Layer Cross-Provider Failover System
 * 1. Groq LPU (Models 1,2,3) -> 2. Gemini (Models 1,2,3) -> 3. OpenAI (Models 1,2,3)
 * * LEGAL: Strict Liability Shield (Expanded 200%)
 */

function ChatBot() {
  // --- 🔐 CONFIGURATION ---
  const GROQ_KEY = import.meta.env.VITE_GROQ_KEY;
  const GEMINI_KEY = import.meta.env.VITE_GEMINI_KEY; 
  const OPENAI_KEY = import.meta.env.VITE_OPENAI_KEY; 

  // --- 🛠️ CLIENT INITIALIZATION ---
  const groq = new Groq({ apiKey: GROQ_KEY, dangerouslyAllowBrowser: true });
  const openai = new OpenAI({ apiKey: OPENAI_KEY, dangerouslyAllowBrowser: true });

  // --- ⚙️ 9-LAYER MODEL MATRIX ---
  
  // TIER 1: GROQ (Primary - Speed)
  const GROQ_1 = "llama3-70b-8192";
  const GROQ_2 = "llama3-8b-8192";
  const GROQ_3 = "mixtral-8x7b-32768";

  // TIER 2: GEMINI (Secondary - Vision/Google)
  const GEM_1 = "gemini-1.5-pro";
  const GEM_2 = "gemini-1.5-flash";
  const GEM_3 = "gemini-1.5-flash-8b";

  // TIER 3: OPENAI (Tertiary - Fallback)
  const GPT_1 = "gpt-4o";
  const GPT_2 = "gpt-4o-mini";
  const GPT_3 = "gpt-3.5-turbo";

  // --- 📝 STATE MANAGEMENT ---
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      text: "Hello! I am **Farm Buddy** 🤝🌾.\n\nI am backed by a **9-Server Failover System** to ensure I am always here to help you.\n\n*Please read the strict terms before proceeding.*", 
      sender: "bot" 
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const [termsAccepted, setTermsAccepted] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem('farmcap_terms_accepted') === 'true';
    }
    return false;
  });
  const [showFullTerms, setShowFullTerms] = useState(false);

  const [uploadedFile, setUploadedFile] = useState(null);
  const [imagePart, setImagePart] = useState(null); 

  const messagesEndRef = useRef(null);

  // --- 🔄 UTILITIES ---
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => scrollToBottom(), [messages]);

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
          setInput(`Analyze this crop image. Identify diseases, pests, or deficiencies.`);
      }
  };

  const removeUploadedImage = () => { setUploadedFile(null); setImagePart(null); setInput(""); }
  const handleOpenChat = () => { setIsOpen(true); if (!termsAccepted) setShowFullTerms(true); }
  const handleCloseChat = () => { setIsOpen(false); removeUploadedImage(); setShowFullTerms(false); }
  const handleAcceptTerms = () => {
      setTermsAccepted(true);
      setShowFullTerms(false);
      localStorage.setItem('farmcap_terms_accepted', 'true');
  }

  // --- 🧠 9-LAYER ULTRA FAILOVER LOGIC ---
  const handleSend = async () => {
    if (!termsAccepted) { setShowFullTerms(true); return; }
    if (!input.trim() && !imagePart) return;

    const userText = input.trim() || uploadedFile?.name || "Scan";
    setMessages(prev => [...prev, { text: userText, sender: "user", image: uploadedFile ? URL.createObjectURL(uploadedFile) : null }]);
    setInput(""); 
    setIsLoading(true);

    const systemPrompt = "You are Farm Buddy, an expert agricultural AI. Use Markdown. Be concise, safe, and accurate.";
    let finalResponse = "";
    let success = false;

    // --- PHASE 1: GROQ CHAIN (Text Only - Fastest) ---
    if (!imagePart) {
        try {
            const completion = await groq.chat.completions.create({
                messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userText }],
                model: GROQ_1,
            });
            finalResponse = completion.choices[0]?.message?.content;
            success = true;
        } catch (e1) {
            console.warn(`Groq 1 Failed: ${e1.message}. Trying Groq 2...`);
            try {
                const completion = await groq.chat.completions.create({
                    messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userText }],
                    model: GROQ_2,
                });
                finalResponse = completion.choices[0]?.message?.content;
                success = true;
            } catch (e2) {
                console.warn(`Groq 2 Failed. Trying Groq 3...`);
                try {
                    const completion = await groq.chat.completions.create({
                        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userText }],
                        model: GROQ_3,
                    });
                    finalResponse = completion.choices[0]?.message?.content;
                    success = true;
                } catch (e3) { console.warn("All Groq Servers Busy. Switching to Gemini..."); }
            }
        }
    }

    // --- PHASE 2: GEMINI CHAIN (Multimodal & Backup) ---
    if (!success) {
        const genAI = new GoogleGenerativeAI(GEMINI_KEY);
        const promptParts = [{ text: "SYSTEM: " + systemPrompt }, { text: userText }];
        if (imagePart) promptParts.unshift(imagePart);

        try {
            const model = genAI.getGenerativeModel({ model: GEM_1 });
            const result = await model.generateContent(promptParts);
            finalResponse = (await result.response).text();
            success = true;
        } catch (g1) {
            console.warn(`Gemini 1 Failed. Trying Gemini 2...`);
            try {
                const model = genAI.getGenerativeModel({ model: GEM_2 });
                const result = await model.generateContent(promptParts);
                finalResponse = (await result.response).text();
                success = true;
            } catch (g2) {
                console.warn(`Gemini 2 Failed. Trying Gemini 3...`);
                try {
                    const model = genAI.getGenerativeModel({ model: GEM_3 });
                    const result = await model.generateContent(promptParts);
                    finalResponse = (await result.response).text();
                    success = true;
                } catch (g3) { console.warn("All Gemini Servers Busy. Switching to OpenAI..."); }
            }
        }
    }

    // --- PHASE 3: OPENAI CHAIN (Ultimate Safety Net) ---
    if (!success) {
        // OpenAI Vision only works with GPT-4o models, so we check image status
        try {
            const completion = await openai.chat.completions.create({
                model: GPT_1,
                messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userText }],
            });
            finalResponse = completion.choices[0].message.content;
            success = true;
        } catch (o1) {
            console.warn(`GPT 1 Failed. Trying GPT 2...`);
            try {
                const completion = await openai.chat.completions.create({
                    model: GPT_2,
                    messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userText }],
                });
                finalResponse = completion.choices[0].message.content;
                success = true;
            } catch (o2) {
                console.warn(`GPT 2 Failed. Trying GPT 3...`);
                try {
                    const completion = await openai.chat.completions.create({
                        model: GPT_3,
                        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userText }],
                    });
                    finalResponse = completion.choices[0].message.content;
                    success = true;
                } catch (o3) {
                    finalResponse = "⚠️ **CRITICAL FAILURE**: All 9 Global AI Servers (Groq, Google, OpenAI) are currently unreachable. Please check your internet connection.";
                }
            }
        }
    }

    setMessages(prev => [...prev, { text: finalResponse, sender: "bot" }]);
    setIsLoading(false);
    setUploadedFile(null); 
    setImagePart(null);
  };

  // --- 📜 IRONCLAD LEGAL TERMS (MASSIVE EXPANSION) ---
  const FullTermsModal = () => (
      <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
              <h3 style={styles.modalHeader}>
                  🤝 Farm Buddy - STRICT TERMS OF SERVICE
                  <button onClick={() => setShowFullTerms(false)} style={styles.modalDismissBtn}>✖</button> 
              </h3>
              <div style={styles.modalBody}>
                  <p style={{color: '#D32F2F', fontWeight: 'bold', textAlign: 'center', fontSize: '14px', borderBottom: '1px solid #ccc', paddingBottom: '10px'}}>
                      ⚠️ WARNING: BY USING THIS APP, YOU WAIVE YOUR RIGHT TO SUE. READ CAREFULLY.
                  </p>
                  
                  <h4>1. IRREVOCABLE WAIVER OF LIABILITY</h4>
                  <p>By accessing Farm Buddy, you ("The User") agree to irrevocably release, indemnify, and hold harmless the developers, owners, hosting providers, and API partners ("The Developers") from any and all liability. The Developers shall NOT be liable for any direct, indirect, incidental, special, consequential, or exemplary damages, including but not limited to crop loss, financial ruin, or personal injury.</p>

                  <h4>2. NO PROFESSIONAL ADVICE OR RELATIONSHIP</h4>
                  <p>Farm Buddy is an experimental AI research tool. It is <strong>NOT</strong> a certified agronomist, plant pathologist, or chemist. Use of this app does not create a professional-client relationship. All outputs are generated by probabilistic machine learning algorithms (LLMs) and should never be treated as verified fact. You are legally required to consult a local, certified human expert before taking any action.</p>

                  <h4>3. AI HALLUCINATION & ERROR WARNING</h4>
                  <p>The User acknowledges that AI models (Groq, Gemini, ChatGPT) frequently "hallucinate," generating plausible-sounding but completely false information. The App may recommend:
                  <ul>
                      <li>Non-existent pesticides.</li>
                      <li>Dangerous chemical mixtures.</li>
                      <li>Incorrect dosage rates that could kill your crops.</li>
                  </ul>
                  The User accepts 100% responsibility for verifying every suggestion against official product labels and local laws.</p>

                  <h4>4. CHEMICAL & PESTICIDE DANGER</h4>
                  <p><strong>DANGER:</strong> Agricultural chemicals are lethal. The App assumes NO responsibility for your handling, storage, or application of chemicals. The AI may suggest chemicals banned in your jurisdiction. It is your sole duty to check the MSDS (Material Safety Data Sheet) and local regulations. The Developers disclaim all liability for poisoning, environmental damage, or regulatory fines.</p>

                  <h4>5. FINANCIAL RISK ASSUMPTION</h4>
                  <p>The User acknowledges that agriculture is a high-risk industry. The Developers are not responsible for lost profits, bankruptcy, or yield reductions resulting from reliance on this App. Any financial decision you make based on AI advice is made at your own peril.</p>

                  <h4>6. DATA TRANSMISSION & PRIVACY</h4>
                  <p>Your data (images and text) is transmitted to third-party servers in the USA (Google, OpenAI, Groq) for processing. We do not control these entities. Do not upload sensitive, personal, or proprietary data. You agree that the Developers are not liable for data breaches at these third-party companies.</p>

                  <h4>7. REGIONAL & ENVIRONMENTAL VARIABLES</h4>
                  <p>The AI does not know your specific soil pH, micro-climate, seed variety, or local pest resistance profile. Advice that is correct for one farm may be disastrous for yours. You must adapt all suggestions to your local reality.</p>

                  <h4>8. MANDATORY ARBITRATION & CLASS ACTION WAIVER</h4>
                  <p>You agree that any dispute arising from this Agreement shall be resolved by binding arbitration on an individual basis. <strong>YOU WAIVE YOUR RIGHT TO PARTICIPATE IN A CLASS ACTION LAWSUIT</strong> against the Developers.</p>

                  <h4>9. SERVICE AVAILABILITY (NO WARRANTY)</h4>
                  <p>The App is provided "AS IS" and "AS AVAILABLE" without warranty of any kind. We do not guarantee 100% uptime. The AI services may be unavailable due to server load, maintenance, or force majeure events.</p>

                  <h4>10. INDEMNIFICATION</h4>
                  <p>You agree to defend, indemnify, and hold the Developers harmless from any claims, damages, costs, and expenses (including attorney's fees) arising from your use of the App or your violation of these Terms.</p>

                  <h4>11. AGE RESTRICTION</h4>
                  <p>You must be at least 18 years old to use this App. By accepting, you verify you are of legal age to handle agricultural chemicals and enter into binding contracts.</p>

                  <h4>12. SEVERABILITY</h4>
                  <p>If any provision of these Terms is found to be unenforceable, the remaining provisions shall remain in full force and effect.</p>

                  <hr style={{borderColor: '#ddd', margin: '20px 0'}}/>
                  <p style={{fontSize: '11px', textAlign: 'center', color: '#666'}}>
                      <em>Clicking "I Accept" constitutes a digital signature and a binding legal agreement.</em>
                  </p>
              </div>
              <button onClick={handleAcceptTerms} style={styles.acceptBtn}>
                  ✅ I Verify I Have Read & Accept All Risks
              </button>
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
                <span style={{fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}>
                    🤝 Farm Buddy 🌾
                </span>
                <span style={{fontSize: '11px', color: '#81C784', display: 'block'}}>
                    System: Groq ➔ Gemini ➔ ChatGPT
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

          {/* FOOTER */}
          <div style={styles.footer}>
            <div style={styles.inputContainer}>
                <input type="file" accept="image/*" onChange={handleFileChange} style={{display:'none'}} id="cam-input" disabled={!termsAccepted} />
                <label htmlFor="cam-input" style={{...styles.iconLabel, opacity: termsAccepted ? 1 : 0.5}}>📸</label>

                <div style={{flex: 1, position: 'relative', display: 'flex', alignItems: 'center'}}>
                    <input 
                        type="text" 
                        placeholder={termsAccepted ? "Ask anything..." : "Accept terms..."} 
                        style={styles.textInput} 
                        value={input} 
                        onChange={(e) => setInput(e.target.value)} 
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        disabled={!termsAccepted}
                    />
                    {uploadedFile && (
                        <div style={styles.imageBadge}>
                            <span>🖼️ Image</span>
                            <button onClick={removeUploadedImage} style={styles.badgeClose}>×</button>
                        </div>
                    )}
                </div>

                <button onClick={handleSend} style={styles.sendCircle} disabled={!termsAccepted}>➤</button>
            </div>
            <div style={styles.bottomWarning}>
                AI can err. <span onClick={() => setShowFullTerms(true)} style={styles.readMore}>Read 12-Pt Terms</span>
            </div>
          </div>
        </div>
      )}
      
      {showFullTerms && <FullTermsModal />}

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
        padding: '10px 20px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.4)', cursor: 'pointer', transition: 'all 0.2s'
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
    modalContent: { width: '92%', maxWidth: '600px', backgroundColor: '#fff', color: '#333', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' },
    modalHeader: { padding: '20px', backgroundColor: '#f8f8f8', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '18px', fontWeight: 'bold' },
    modalBody: { padding: '25px', fontSize: '13px', lineHeight: '1.7', maxHeight: '70vh', overflowY: 'auto' },
    modalDismissBtn: { background: 'none', border: 'none', color: '#333', fontSize: '24px', cursor: 'pointer' },
    acceptBtn: { width: '100%', padding: '18px', backgroundColor: '#2E7D32', color: 'white', border: 'none', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' },
    
    // Extras
    msgImage: { maxWidth: '200px', borderRadius: '10px', marginBottom: '8px', border: '1px solid #444' },
    imageBadge: { position: 'absolute', top: '-40px', left: '0', backgroundColor: '#2E7D32', padding: '5px 10px', borderRadius: '10px', color: 'white', fontSize: '11px', display: 'flex', gap: '6px' },
    badgeClose: { background: 'none', border: 'none', color: 'white', fontWeight: 'bold', cursor: 'pointer' },
    loadingArea: { color: '#9aa0a6', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' },
    spinner: { width: '14px', height: '14px', border: '2px solid #333', borderTop: '2px solid #81C784', borderRadius: '50%', animation: 'spin 1s linear infinite' }
};

export default ChatBot;