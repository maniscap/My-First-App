import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, googleProvider } from '../firebase'; 
import { 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  RecaptchaVerifier 
} from 'firebase/auth';

function Login() {
  const navigate = useNavigate();
  
  // --- BACKGROUND LOGIC (Unchanged) ---
  const [bgImage, setBgImage] = useState('');
  const dayBg = 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2940&auto=format&fit=crop';
  const nightBg = 'https://images.unsplash.com/photo-1652454159675-11ead6275680?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

  useEffect(() => {
    const updateTime = () => {
      const hour = new Date().getHours();
      if (hour >= 18 || hour < 6) setBgImage(nightBg);
      else setBgImage(dayBg);
    };
    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  const [authMethod, setAuthMethod] = useState('email'); 
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');

  // NEW STATE FOR LEGAL AGREEMENTS
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  const isButtonDisabled = !termsAccepted;


  const handleGoogle = async () => {
    if (isButtonDisabled) { setError("Please accept Terms & Conditions."); return; }
    try { await signInWithPopup(auth, googleProvider); navigate('/dashboard'); } 
    catch (err) { setError(err.message); }
  };

  const handleEmail = async (e) => {
    e.preventDefault(); setError('');
    if (isButtonDisabled) { setError("Please accept Terms & Conditions."); return; }
    try {
      if (isSignup) await createUserWithEmailAndPassword(auth, email, password);
      else await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err) { setError(err.message); }
  };

  const generateRecaptcha = () => {
    if (!window.recaptchaVerifier) window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { 'size': 'invisible' });
  };

  const handleSendOtp = (e) => {
    e.preventDefault(); setError('');
    if (isButtonDisabled) { setError("Please accept Terms & Conditions."); return; }
    generateRecaptcha();
    const formattedPhone = phone.includes('+') ? phone : `+91${phone}`;
    signInWithPhoneNumber(auth, formattedPhone, window.confirmationResult)
      .then((res) => { window.confirmationResult = res; setOtpSent(true); alert("OTP Sent!"); })
      .catch((err) => { setError(err.message); });
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (window.confirmationResult) window.confirmationResult.confirm(otp).then(() => navigate('/dashboard')).catch(() => setError("Invalid OTP"));
  };

  // 🚨 LEGAL CONTENT TEMPLATES (ULTRA-MAXIMIZED AND DETAILED)
  const LegalContent = () => (
      <>
          <h3>FARMCONNECT / FARMCAP: COMPREHENSIVE LEGAL AGREEMENTS</h3>
          
          <h4 style={legalSectionTitle}>1. Acceptance, Account Integrity, and User Instructions</h4>
          <p>
            By proceeding, you <strong>irrevocably agree</strong> to these Terms. You acknowledge that **your use of this Platform is entirely at your own risk.**
          </p>
          <p style={legalClause}>
            <strong>1.1. Account Verification (Ref. Requirement 1):</strong> You warrant that all registration data is true, current, and complete. **FarmConnect / FARMCAP requires correct login details and accepts no fake identity.** Providing fraudulent information constitutes a material breach and grounds for immediate termination without recourse.
          </p>
          <p style={legalClause}>
            <strong>1.2. Prohibited Conduct and Fraud (Ref. 6, 8, 9):</strong> You are strictly prohibited from all illegal, fraudulent, harassing, or deceptive activities. **Doing fraud is not acceptable.** If fraud or illegal activity is suspected or proven:
            <ul style={{paddingLeft: '20px', margin: '5px 0'}}>
                <li>Your account will be **immediately blocked** and permanently disabled.</li>
                <li>We reserve the right to report your data to law enforcement, and **you will be punished under applicable laws** if proven guilty.</li>
                <li>**The Platform is not responsible for any losses or damages** incurred by third parties due to your illegal or fraudulent actions.</li>
            </ul>
          </p>

          <h4 style={legalSectionTitle}>2. Marketplace Transactions and Mandatory Due Diligence</h4>
          <p>
            The Platform acts only as a connection service. FarmConnect / FARMCAP is **not an inspection, certification, or payment authority.**
          </p>
          
          <h5 style={legalSubSectionTitle}>2.1. Seller Profile Responsibility (Detailed Instructions for Sellers)</h5>
          <p style={legalClause}>
            **Profile Accuracy:** Sellers must maintain accurate inventory. **Any dispute regarding the quality, legality, or fulfillment of the listing is the Seller's sole liability.** The Seller agrees to promptly resolve all customer claims regarding quality or non-delivery.
          </p>
          <p style={legalClause}>
            **Legal Compliance:** Sellers warrant they possess all necessary licenses, certifications, and legal permissions to sell the listed goods (e.g., restricted seeds, controlled chemicals).
          </p>
          
          <h5 style={legalSubSectionTitle}>2.2. Buyer Instructions and Verification Duty (Ref. 2, 5)</h5>
          <p style={legalClause}>
            **Inspection Requirement (Ref. 2):** **When buying or hiring, you must personally cross-check the product, machinery, or the person.** This is your non-delegable duty.
            <ul style={{paddingLeft: '20px', margin: '5px 0'}}>
                <li>Always inspect perishable goods (crops) for spoilage before acceptance.</li>
                <li>Verify machinery operational status and registration documents.</li>
                <li>Confirm labor credentials and identity against public records or references.</li>
            </ul>
            **The app developers are not responsible for the consequences of a failed inspection.**
          </p>
          <p style={legalClause}>
            **Quality and Misbehavior (Ref. 5):** **The Seller is responsible for the quality of the products and service.** If the product is damaged or the worker misbehaves or does not work, **the app developers are not responsible for that.** You must resolve the issue directly with the other party.
          </p>

          <h4 style={legalSectionTitle}>3. Financial Risk, Payment, and Liability</h4>
          <p>
            <strong>3.1. Payment Exclusion (Ref. 3, 6):</strong> FarmConnect / FARMCAP **does not** handle, process, or secure transactions. **The user should check the payments with the seller.** The buyer and the seller are **solely responsible** for the money exchange, security, and calculating the final fair amount.
          </p>
          <p style={legalClause}>
            <strong>3.2. Advance Payment Warning (Ref. 4):</strong> **You should not do the payments in advance.** If doing so, it is **entirely at your own risk.** The Platform holds no liability for the loss of funds due to non-delivery, fraud, or non-performance related to pre-payments.
          </p>
          <p style={legalClause}>
            <strong>3.3. Indemnification (Developer Shield):</strong> You agree to **fully indemnify and hold harmless** FarmConnect / FARMCAP, its owners, and developers from all claims, lawsuits, costs, and expenses (including reasonable legal fees) arising from **your financial transactions, frauds, or listing disputes.** You agree to cover the costs of the Platform's legal defense.
          </p>

          <h4 style={legalSectionTitle}>4. AI Assistant Terms (Specific User Instructions)</h4>
          <p>
            <strong>4.1. Suggestions Only (Ref. 7):</strong> The AI Assistant (Gemini) provides advice as **suggestions only**. It is generated by a machine model and **can make mistakes.**
          </p>
          <p style={legalClause}>
            **User Instructions:** You must **not trust the chatbot at all times.** You are required to:
            <ul style={{paddingLeft: '20px', margin: '5px 0'}}>
                <li>Consult professional agronomists for critical decisions.</li>
                <li>Verify all chemical dosages, diagnoses, and safety standards independently.</li>
                <li>Acknowledge that **the app is not responsible** for any damage or loss resulting from AI-provided recommendations.</li>
            </ul>
          </p>

          <h4 style={legalSectionTitle}>5. Disclaimer of Warranties and Final Provisions</h4>
          <p>
            <strong>5.1. Disclaimer:</strong> The Service is provided **"AS IS"** and **"AS AVAILABLE."** We disclaim all warranties. We do not guarantee continuous or error-free operation.
          </p>
          <p style={legalClause}>
            <strong>5.2. Governing Law:</strong> These Terms shall be governed by the laws of India.
          </p>
          <p>
            <strong>By clicking "I Understand & Accept," you acknowledge that you have read, understood, and agreed to this definitive set of Terms and the total assumption of personal and financial risk.</strong>
          </p>
      </>
  );

  // 🚨 LEGAL MODAL COMPONENT (Unchanged Functionality)
  const LegalModal = () => (
      <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
              <div style={modalHeaderStyle}>
                  Legal Agreements
                  <button onClick={() => setShowLegalModal(false)} style={modalCloseBtnStyle}>✖</button>
              </div>
              <div style={modalBodyStyle}>
                  <LegalContent />
              </div>
              <button 
                  onClick={() => { setTermsAccepted(true); setShowLegalModal(false); }} 
                  style={modalAcceptBtnStyle}
              >
                  I Understand & Accept
              </button>
          </div>
      </div>
  );


  return (
    <div style={{...pageStyle, backgroundImage: `url('${bgImage}')`}}>
      
      <div style={glassCardStyle}>
        
        <div style={{ marginBottom: '15px' }}>
          <div style={{fontSize: '45px', marginBottom: '5px', filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.3))'}}>🧢</div>
          <h2 style={titleStyle}>
            {isSignup ? 'Join Farm Cap' : 'Login'}
          </h2>
          <p style={{color: 'rgba(255,255,255,0.9)', margin: '2px 0 0 0', fontSize: '13px'}}>Secure access for farmers</p>
        </div>

        {error && <div style={errorBox}>⚠️ {error}</div>}

        <button onClick={handleGoogle} style={{...googleBtn, opacity: isButtonDisabled ? 0.6 : 1}} disabled={isButtonDisabled}>
          <svg width="18" height="18" viewBox="0 0 24 24" style={{marginRight: '10px'}}>
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', margin: '15px 0', color: 'rgba(255,255,255,0.7)', fontSize: '11px', fontWeight: 'bold' }}>
          <div style={{flex: 1, height: '1px', background: 'rgba(255,255,255,0.3)'}}></div>
          <span style={{ margin: '0 10px' }}>OR</span>
          <div style={{flex: 1, height: '1px', background: 'rgba(255,255,255,0.3)'}}></div>
        </div>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '15px' }}>
          <button onClick={() => {setAuthMethod('email'); setOtpSent(false)}} style={authMethod === 'email' ? activeTab : inactiveTab}>
            <svg width="18" height="14" viewBox="0 0 48 48" style={{marginRight:'6px', verticalAlign:'middle'}}>
                <path fill="#4caf50" d="M45,16.2l-5,2.75l-5,4.75v13h10V16.2z"></path>
                <path fill="#1e88e5" d="M3,16.2l5,2.75l5,4.75v13H3V16.2z"></path>
                <path fill="#e53935" d="M35,23.7v13h10V16.2l-10-5.5v13z"></path>
                <path fill="#c62828" d="M3,16.2v20.5h10v-13L3,23.7z"></path>
                <path fill="#fbc02d" d="M35,11.2L24,5.2L13,11.2v12.5L24,17.7l11,6V11.2z"></path>
            </svg>
            Email
          </button>
          
          <button onClick={() => {setAuthMethod('phone'); setOtpSent(false)}} style={authMethod === 'phone' ? activeTab : inactiveTab}>
            📱 Phone
          </button>
        </div>

        {authMethod === 'email' && (
          <form onSubmit={handleEmail} style={formStyle}>
            <input type="email" placeholder="Email" required style={inputStyle} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" required style={inputStyle} onChange={(e) => setPassword(e.target.value)} />
            
            <button type="submit" style={{...mainBtn, opacity: isButtonDisabled ? 0.6 : 1}} disabled={isButtonDisabled}>
                {isSignup ? 'Create Account' : 'Login'}
            </button>
            
            <p style={toggleText} onClick={() => setIsSignup(!isSignup)}>{isSignup ? "Login" : "Create Account"}</p>
          </form>
        )}

        {authMethod === 'phone' && (
          <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} style={formStyle}>
            {!otpSent ? (
              <><input type="tel" placeholder="Mobile Number" required style={inputStyle} onChange={(e) => setPhone(e.target.value)} /><div id="recaptcha-container"></div>
                <button type="submit" style={{...mainBtn, opacity: isButtonDisabled ? 0.6 : 1}} disabled={isButtonDisabled}>Send OTP</button></>
            ) : (
              <><input type="text" placeholder="OTP" required style={{...inputStyle, textAlign: 'center'}} onChange={(e) => setOtp(e.target.value)} />
                <button type="submit" style={{...mainBtn, opacity: isButtonDisabled ? 0.6 : 1}} disabled={isButtonDisabled}>Verify</button></>
            )}
          </form>
        )}
        
        {/* LEGAL AGREEMENT CHECKBOX AND LINK */}
        <div style={termsContainer}>
            <input 
                type="checkbox" 
                id="terms-check" 
                checked={termsAccepted} 
                onChange={(e) => setTermsAccepted(e.target.checked)} 
                style={checkboxStyle}
            />
            <label htmlFor="terms-check" style={termsLabelStyle}>
                I agree to the 
                <span onClick={() => setShowLegalModal(true)} style={learnMoreLinkStyle}>
                    &nbsp;T&C & Privacy Policy
                </span>
            </label>
        </div>

        <Link to="/" style={backLink}>← Home</Link>
      </div>
      
      {/* LEGAL AGREEMENTS MODAL RENDERER */}
      {showLegalModal && <LegalModal />}

    </div>
  );
}

// --- STYLES ---
const pageStyle = { 
  position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
  backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: 'black',
  display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 0
};

const glassCardStyle = { 
  width: '100%', maxWidth: '340px', textAlign: 'center', 
  backgroundColor: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(15px)', 
  WebkitBackdropFilter: 'blur(15px)', padding: '25px', borderRadius: '24px',
  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)', border: '1px solid rgba(255, 255, 255, 0.2)'
};

const titleStyle = { color: 'white', margin: '0', fontWeight: '800', fontSize: '24px', textShadow: '0 2px 4px rgba(0,0,0,0.3)' };
const errorBox = { color: '#ffcdd2', fontSize: '12px', background: 'rgba(255,0,0,0.2)', padding: '8px', borderRadius: '6px', marginBottom: '10px' };
const googleBtn = { width: '100%', padding: '10px', backgroundColor: 'white', color: '#333', border: 'none', borderRadius: '50px', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', transition: 'transform 0.2s' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '10px' };
const inputStyle = { width: '100%', padding: '10px 15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.3)', fontSize: '15px', outline: 'none', backgroundColor: 'rgba(255,255,255,0.8)', transition: '0.3s', boxSizing: 'border-box' };
const mainBtn = { padding: '12px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '15px', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(76, 175, 80, 0.4)', transition: 'transform 0.2s' };
const toggleText = { fontSize: '12px', color: 'white', cursor: 'pointer', marginTop: '8px', fontWeight: '500', textShadow: '0 1px 2px rgba(0,0,0,0.5)' };
const backLink = { fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginTop: '15px', display: 'inline-block', textDecoration: 'none' };

const activeTab = { padding: '6px 15px', backgroundColor: 'white', color: 'black', border: 'none', borderRadius: '18px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center' };
const inactiveTab = { padding: '6px 15px', backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '18px', fontSize: '12px', cursor: 'pointer' };

// NEW LEGAL STYLES
const termsContainer = { 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginTop: '15px',
    marginBottom: '10px'
};
const checkboxStyle = { 
    marginRight: '8px', 
    width: '14px', 
    height: '14px',
};
const termsLabelStyle = {
    color: 'rgba(255, 255, 255, 0.9)', 
    fontSize: '12px',
    fontWeight: '500',
    textShadow: '0 1px 2px rgba(0,0,0,0.5)'
};
const learnMoreLinkStyle = {
    color: '#FFD700', // Gold color for link
    cursor: 'pointer', 
    textDecoration: 'underline',
    fontWeight: '700'
};

// MODAL STYLES (Reused from Chatbot but adapted for Login)
const modalOverlayStyle = {
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.8)', 
    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 
};
const modalContentStyle = {
    width: '90%', maxWidth: '500px', backgroundColor: 'white', borderRadius: '12px',
    boxShadow: '0 5px 25px rgba(0, 0, 0, 0.7)', display: 'flex', flexDirection: 'column', overflow: 'hidden',
    maxHeight: '80vh'
};
const modalHeaderStyle = {
    backgroundColor: '#388E3C', 
    color: 'white', padding: '15px 20px', margin: 0, fontSize: '18px', fontWeight: 'bold',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
};
const modalBodyStyle = {
    padding: '20px', fontSize: '13px', color: '#333', overflowY: 'auto'
};
const modalCloseBtnStyle = {
    background: 'none', border: 'none', color: 'white', fontSize: '18px', cursor: 'pointer', padding: '0 10px'
};
const modalAcceptBtnStyle = {
    backgroundColor: '#2E7D32', color: 'white', padding: '15px 20px', border: 'none', width: '100%',
    fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', transition: 'background-color 0.2s'
};
const legalSectionTitle = {
    color: '#1B5E20', 
    fontSize: '15px',
    marginTop: '20px', 
    marginBottom: '8px',
    fontWeight: '800'
};
const legalSubSectionTitle = {
    color: '#388E3C', 
    fontSize: '13px',
    marginTop: '15px', 
    marginBottom: '5px',
    fontWeight: '700'
};
const legalClause = {
    margin: '10px 0',
    paddingLeft: '10px',
    borderLeft: '3px solid #E0E0E0',
    fontSize: '12px',
    lineHeight: '1.4'
}


export default Login;