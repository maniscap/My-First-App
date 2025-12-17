import React, { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";

function ChatBot() {
  // --- 🚨 ACTION REQUIRED: PASTE YOUR NEW, SECURE API KEY HERE 🚨 ---
  const API_KEY = import.meta.env.VITE_GEMINI_KEY; // Replace this with a new key
  
  const MODEL_NAME = "gemini-1.5-flash"; 

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello! I am connected to Google Gemini. Ask me anything!", sender: "bot" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // New States for Disclaimer Management
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showFullTerms, setShowFullTerms] = useState(false);

  // States for Image Scanner
  const [uploadedFile, setUploadedFile] = useState(null);
  const [imagePart, setImagePart] = useState(null); 


  // HELPER FUNCTION: Converts File to Gemini Part object
  const fileToGenerativePart = async (file) => {
    const base64Data = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.readAsDataURL(file);
    });

    return {
      inlineData: {
        data: base64Data,
        mimeType: file.type,
      },
    };
  }

  // HANDLER: Processes the file when uploaded
  const handleFileChange = async (event) => {
      const file = event.target.files[0];
      if (file) {
          setUploadedFile(file);
          const part = await fileToGenerativePart(file);
          setImagePart(part);
          
          setInput(`Diagnose the disease in this plant image. Provide the disease name, cure/remedy, and recommended safe pesticides.`);
      } else {
          setUploadedFile(null);
          setImagePart(null);
          setInput("");
      }
  };


  const handleSend = async () => {
    if (!termsAccepted) {
        setShowFullTerms(true);
        return;
    }
    if (!input.trim() && !imagePart) return;

    let userMessageText = input.trim() || uploadedFile?.name || "Image Scan Request";
    const userMessage = { 
        text: userMessageText, 
        sender: "user", 
        image: uploadedFile ? URL.createObjectURL(uploadedFile) : null 
    };
    
    const promptParts = [];
    if (imagePart) {
        promptParts.push(imagePart);
    }
    if (input.trim()) {
        promptParts.push({ text: input.trim() });
    } else if (imagePart) {
        promptParts.push({ text: "Diagnose this plant image: What is the disease, cure, and pesticide recommendation?" });
    }

    setMessages((prev) => [...prev, userMessage]);
    setInput(""); 
    setUploadedFile(null);
    setImagePart(null);
    setIsLoading(true);

    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });

      const result = await model.generateContent({ contents: promptParts });
      const response = await result.response;
      const text = response.text();

      setMessages((prev) => [...prev, { text: text, sender: "bot" }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages((prev) => [...prev, { text: "⚠️ Diagnostic Error: " + error.message, sender: "bot" }]);
    }
    setIsLoading(false);
  };
  
  const handleOpenChat = () => {
    setIsOpen(true);
    if (!termsAccepted) {
        setShowFullTerms(true);
    }
  }

  // 🚨 FIXED HANDLER: Closes the chat and cleans up image state for stability
  const handleCloseChat = () => {
      setIsOpen(false);
      setUploadedFile(null);
      setImagePart(null);
      setShowFullTerms(false); // Ensure modal is closed if open
  }
  
  // 🚨 NEW HANDLER: Closes the Terms modal without accepting
  const handleDismissTerms = () => {
      setShowFullTerms(false);
      // Optional: If you want to close the chat entirely when terms are dismissed:
      // setIsOpen(false);
  }

  const removeUploadedImage = () => {
      setUploadedFile(null);
      setImagePart(null);
      setInput("");
  }


  // --- Disclaimer Components ---
  const FullTermsModal = () => (
      <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
              {/* 🚨 MODAL HEADER WITH DISMISS BUTTON */}
              <h3 style={modalHeaderStyle}>
                  AI Farm Assistant - Terms of Use & Liability
                  <button onClick={handleDismissTerms} style={modalDismissBtnStyle}>✖</button> 
              </h3>
              
              <div style={modalBodyStyle}>
                  <p><strong>Please read this liability agreement and instructions before accepting.</strong></p>
                  
                  <h4>1. Limitation of Liability and Accuracy</h4>
                  <p>
                      **AI Can Make Mistakes:** The advice, recommendations, and diagnostic information provided by the Gemini AI are generated by a machine learning model and **may contain errors, inaccuracies, or irrelevant information.**
                  </p>
                  <p>
                      **Not Professional Advice:** This tool is designed for informational assistance only and does **NOT** substitute the advice of a qualified agronomist, chemist, or agricultural professional.
                  </p>

                  <h4>2. User Responsibility (Duty of Care)</h4>
                  <ul>
                      <li>**Recheck All Data:** You are required to re-check all provided information, including dosages, application timing, pesticide names, and safety warnings.</li>
                      <li>**Sole Risk:** You use the AI assistant entirely at your own risk. Any actions taken based on AI suggestions are your sole responsibility.</li>
                      <li>**No Trust:** **Do not trust the chatbot at all times.** Always verify critical information, especially concerning chemical use or crop health.</li>
                  </ul>
                  
                  <h4>3. Exclusion of Developer/Company Liability</h4>
                  <p>
                      **FarmConnect / FARMCAP**, its developers, and affiliates are **expressly NOT responsible** for any direct, indirect, incidental, or consequential damages, financial losses, crop failure, health issues, or any other negative outcome resulting from reliance on the AI's recommendations or chat responses.
                  </p>
                  
                  <p>
                      **Policy Agreement:** By clicking "I Accept & Proceed to Chat," you affirm that you have read, understood, and accept these limitations and conditions, including the non-liability of the platform.
                  </p>
                  <hr/>
              </div>
              <button 
                  onClick={() => { setTermsAccepted(true); setShowFullTerms(false); }} 
                  style={acceptBtnStyle}
              >
                  ✅ I Accept & Proceed to Chat
              </button>
          </div>
      </div>
  );
  
  // PERSISTENT WARNING BAR
  const PersistentWarningBar = () => (
    <div style={warningBarStyle}>
        Gemini can make mistakes, so double-check it. 
        <span 
            style={learnMoreLinkStyle}
            onClick={() => setShowFullTerms(true)}
        >
            (Learn More)
        </span>
    </div>
  );


  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
      {isOpen && (
        <div style={chatWindowStyle}>
          <div style={headerStyle}>
            <span>🤖 AI Farm Assistant</span>
            <button onClick={handleCloseChat} style={closeBtn}>✖</button> {/* 🚨 USING FIXED HANDLER */}
          </div>
          
          <PersistentWarningBar />

          <div style={bodyStyle}>
            {messages.map((msg, i) => (
              <div key={i} style={{ textAlign: msg.sender === 'bot' ? 'left' : 'right', marginBottom: '10px' }}>
                {msg.image && <img src={msg.image} alt="Uploaded for diagnosis" style={uploadedImageStyle} />}
                <span style={msg.sender === 'bot' ? botMsgStyle : userMsgStyle}>{msg.text}</span>
              </div>
            ))}
            {isLoading && <div style={{color: '#888'}}>Thinking... 🤔</div>}
          </div>

          <div style={footerStyle}>
              {/* IMAGE SCANNER INPUT */}
              <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange}
                  style={hiddenInputStyle} 
                  id="image-scanner-input"
                  disabled={!termsAccepted}
              />
              <label 
                  htmlFor="image-scanner-input" 
                  style={{...scannerBtnStyle, opacity: termsAccepted ? 1 : 0.5}}
                  title="Scan Plant Disease"
              >
                  📷
              </label>

            <input 
                type="text" 
                placeholder={termsAccepted ? "Ask anything or scan a plant..." : "Accept terms to enable chat..."} 
                style={inputStyle} 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                disabled={!termsAccepted}
            />

            {/* UPLOADED FILE DISPLAY */}
            {uploadedFile && (
                <div style={fileBadgeStyle}>
                    {uploadedFile.name.substring(0, 10)}...
                    <button onClick={removeUploadedImage} style={removeFileBtnStyle}>x</button>
                </div>
            )}
            
            <button 
                onClick={handleSend} 
                style={sendBtn}
                disabled={!termsAccepted || (input.trim() === "" && imagePart === null)}
            >
                🚀
            </button>
          </div>
        </div>
      )}
      
      {/* FULL TERMS MODAL RENDERER */}
      {showFullTerms && <FullTermsModal />}

      {!isOpen && <button onClick={handleOpenChat} style={floatBtnStyle}>🤖 Ask AI</button>}
    </div>
  );
}

// STYLES 
const floatBtnStyle = { backgroundColor: '#2E7D32', color: 'white', border: 'none', borderRadius: '50px', padding: '15px 25px', fontSize: '16px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.3)', fontWeight: 'bold' };
const chatWindowStyle = { width: '320px', height: '450px', backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 5px 15px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', overflow: 'hidden' };
const headerStyle = { backgroundColor: '#2E7D32', color: 'white', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold' };
const closeBtn = { background: 'none', border: 'none', color: 'white', fontSize: '16px', cursor: 'pointer' };
const bodyStyle = { flex: 1, padding: '15px', overflowY: 'auto', backgroundColor: '#f4f4f4' };
const footerStyle = { padding: '10px', borderTop: '1px solid #ddd', backgroundColor: 'white', display: 'flex', alignItems: 'center', gap: '5px', position: 'relative' }; 
const inputStyle = { flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ddd', outline: 'none' };
const sendBtn = { backgroundColor: '#2E7D32', color: 'white', border: 'none', borderRadius: '5px', padding: '10px 15px', cursor: 'pointer' };
const botMsgStyle = { backgroundColor: 'white', color: 'black', padding: '10px', borderRadius: '15px 15px 15px 0', display: 'inline-block', fontSize: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', maxWidth: '80%' };
const userMsgStyle = { backgroundColor: '#2E7D32', color: 'white', padding: '10px', borderRadius: '15px 0 15px 15px', display: 'inline-block', fontSize: '14px', maxWidth: '80%' };

// DISCLAIMER/WARNING STYLES
const warningBarStyle = {
    padding: '5px 10px', background: '#FDD835', color: '#333', fontSize: '10px', textAlign: 'center', flexShrink: 0,
};
const learnMoreLinkStyle = {
    color: '#0D47A1', cursor: 'pointer', marginLeft: '5px', textDecoration: 'underline'
};

// MODAL STYLES
const modalOverlayStyle = {
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 
};
const modalContentStyle = {
    width: '90%', maxWidth: '400px', backgroundColor: 'white', borderRadius: '12px',
    boxShadow: '0 5px 25px rgba(0, 0, 0, 0.5)', display: 'flex', flexDirection: 'column', overflow: 'hidden'
};
// 🚨 UPDATED MODAL HEADER STYLE
const modalHeaderStyle = {
    backgroundColor: '#D32F2F', color: 'white', padding: '15px 20px', margin: 0, fontSize: '18px', textAlign: 'center',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
};
// 🚨 NEW MODAL DISMISS BUTTON STYLE
const modalDismissBtnStyle = {
    background: 'none', border: 'none', color: 'white', fontSize: '18px', cursor: 'pointer',
    padding: '0 10px'
};
const modalBodyStyle = {
    padding: '20px', fontSize: '13px', color: '#555', maxHeight: '300px', overflowY: 'auto'
};
const acceptBtnStyle = {
    backgroundColor: '#2E7D32', color: 'white', padding: '15px 20px', border: 'none', width: '100%',
    fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', transition: 'background-color 0.2s'
};

// NEW SCANNER STYLES
const hiddenInputStyle = { display: 'none' };
const scannerBtnStyle = { 
    fontSize: '20px', 
    cursor: 'pointer', 
    marginRight: '5px',
    padding: '5px',
    flexShrink: 0,
    transition: 'opacity 0.2s'
};
const fileBadgeStyle = {
    position: 'absolute',
    bottom: '50px', 
    left: '10px',
    background: '#E0F2F1', // Light teal background
    color: '#004D40',
    padding: '5px 10px',
    borderRadius: '15px',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
};
const removeFileBtnStyle = {
    marginLeft: '5px',
    background: 'transparent',
    border: 'none',
    color: '#004D40',
    fontWeight: 'bold',
    cursor: 'pointer'
};
const uploadedImageStyle = {
    maxWidth: '100%',
    height: 'auto',
    borderRadius: '8px',
    marginBottom: '10px'
}


export default ChatBot;