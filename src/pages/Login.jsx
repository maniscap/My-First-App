import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, googleProvider } from '../firebase'; 
import { 
  signInWithPopup, 
  signInWithPhoneNumber,
  RecaptchaVerifier 
} from 'firebase/auth';

import TermsAndConditions from './TermsAndConditions'; 

function Login() {
  const navigate = useNavigate();
  
  // --- BACKGROUND LOGIC ---
  const [bgImage, setBgImage] = useState('');
  const dayBg = 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2940&auto=format&fit=crop';
  const nightBg = 'https://images.unsplash.com/photo-1652454159675-11ead6275680?q=80&w=1170&auto=format&fit=crop';

  useEffect(() => {
    const updateTime = () => {
      const hour = new Date().getHours();
      setBgImage((hour >= 18 || hour < 6) ? nightBg : dayBg);
    };
    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');

  // --- LEGAL STATE ---
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  // --- BUTTON BRIGHTNESS LOGIC ---
  const cleanPhone = phone.replace(/\D/g, ''); 
  const isPhoneValid = cleanPhone.length === 10;
  // Button works if phone is 10 digits AND terms are checked
  const isButtonEnabled = isPhoneValid && termsAccepted;

  // --- 1. RECAPTCHA SETUP ---
  useEffect(() => {
    // Check if verifier already exists to avoid "element removed" error
    if (!window.recaptchaVerifier) {
        try {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'invisible',
                'callback': (response) => {
                    // reCAPTCHA solved
                    console.log("Captcha Solved");
                },
                'expired-callback': () => {
                    setError("Recaptcha expired. Refresh page.");
                    if(window.recaptchaVerifier) window.recaptchaVerifier.clear();
                    window.recaptchaVerifier = null;
                }
            });
        } catch (err) {
            console.error("Recaptcha Init Error:", err);
        }
    }
  }, []);

  // --- HANDLERS ---
  const handleGoogle = async () => {
    if (!termsAccepted) { setError("Please accept Terms & Conditions first."); return; }
    try { 
        await signInWithPopup(auth, googleProvider); 
        navigate('/dashboard'); 
    } catch (err) { 
        setError(err.message); 
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault(); 
    setError('');
    
    if (!isButtonEnabled) return; 
    
    const formattedPhone = `+91${cleanPhone}`;
    
    // Ensure verifier exists
    if (!window.recaptchaVerifier) {
        setError("System reloading... try again.");
        setTimeout(() => window.location.reload(), 1000);
        return;
    }

    const appVerifier = window.recaptchaVerifier;

    signInWithPhoneNumber(auth, formattedPhone, appVerifier)
      .then((confirmationResult) => {
        window.confirmationResult = confirmationResult;
        setOtpSent(true);
      })
      .catch((error) => {
        console.error("SMS Error:", error);
        
        // Friendly Error Messages
        if (error.code === 'auth/invalid-phone-number') setError("Invalid phone number.");
        else if (error.code === 'auth/too-many-requests') setError("Too many attempts. Try again later.");
        else if (error.code === 'auth/internal-error') {
            setError("Network Error. Reloading...");
            setTimeout(() => window.location.reload(), 1500);
        }
        else setError("Error: " + error.message);
      });
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (window.confirmationResult) {
        window.confirmationResult.confirm(otp)
            .then(() => navigate('/dashboard'))
            .catch(() => setError("Invalid OTP. Please try again."));
    }
  };

  return (
    <div style={{...pageStyle, backgroundImage: `url('${bgImage}')`}}>
      
      <div style={glassCardStyle}>
        
        <div style={{ marginBottom: '15px' }}>
          <div style={{fontSize: '45px', marginBottom: '5px', filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.3))'}}>🧢</div>
          <h2 style={titleStyle}>Login to Farm Cap</h2>
          <p style={{color: 'rgba(255,255,255,0.9)', margin: '2px 0 0 0', fontSize: '13px'}}>Secure access for farmers</p>
        </div>

        {error && <div style={errorBox}>⚠️ {error}</div>}

        <button onClick={handleGoogle} style={{...googleBtn, opacity: termsAccepted ? 1 : 0.6}} disabled={!termsAccepted}>
           <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" style={{width:'18px', marginRight:'10px'}}/>
          Sign in with Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', color: 'rgba(255,255,255,0.7)', fontSize: '11px', fontWeight: 'bold' }}>
          <div style={{flex: 1, height: '1px', background: 'rgba(255,255,255,0.3)'}}></div>
          <span style={{ margin: '0 10px' }}>OR USE MOBILE NUMBER</span>
          <div style={{flex: 1, height: '1px', background: 'rgba(255,255,255,0.3)'}}></div>
        </div>

        <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} style={formStyle}>
            {!otpSent ? (
              <>
                <div style={{position:'relative'}}>
                    <span style={prefixStyle}>+91</span>
                    <input 
                        type="tel" 
                        placeholder="Mobile Number" 
                        required 
                        maxLength="10"
                        style={phoneInputStyle} 
                        onChange={(e) => setPhone(e.target.value)} 
                    />
                </div>
                
                <div id="recaptcha-container"></div>
                
                {/* 💡 BUTTON CHANGES: GREY if invalid, BRIGHT GREEN if valid */}
                <button 
                    type="submit" 
                    disabled={!isButtonEnabled}
                    style={{
                        ...mainBtn, 
                        // If enabled: Green (#4CAF50), If disabled: Grey (#757575)
                        backgroundColor: isButtonEnabled ? '#4CAF50' : '#757575',
                        // If enabled: Full opacity, If disabled: Half opacity
                        opacity: isButtonEnabled ? 1 : 0.6,
                        // If enabled: Pointer cursor, If disabled: Not Allowed cursor
                        cursor: isButtonEnabled ? 'pointer' : 'not-allowed',
                        transform: isButtonEnabled ? 'scale(1.02)' : 'scale(1)',
                        boxShadow: isButtonEnabled ? '0 4px 15px rgba(76, 175, 80, 0.5)' : 'none'
                    }} 
                >
                    Get OTP
                </button>
              </>
            ) : (
              <>
                <input 
                    type="text" 
                    placeholder="Enter 6-digit OTP" 
                    required 
                    style={{...inputStyle, textAlign: 'center', letterSpacing: '4px', fontSize: '18px'}} 
                    onChange={(e) => setOtp(e.target.value)} 
                />
                <button type="submit" style={{...mainBtn, backgroundColor: '#4CAF50'}}>
                    Verify OTP
                </button>
                <p style={{fontSize:'12px', color:'white', marginTop:'10px', cursor:'pointer'}} onClick={() => setOtpSent(false)}>
                    Wrong number? Go back
                </p>
              </>
            )}
        </form>
        
        <div style={termsContainer}>
            <input 
                type="checkbox" 
                id="terms-check" 
                checked={termsAccepted} 
                onChange={(e) => {
                  if(!e.target.checked) setTermsAccepted(false);
                  else setShowLegalModal(true); 
                }} 
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
      
      {showLegalModal && (
        <TermsAndConditions 
          onClose={() => setShowLegalModal(false)}
          onAccept={() => {
            setTermsAccepted(true);
            setShowLegalModal(false);
          }}
        />
      )}

    </div>
  );
}

// --- STYLES ---
const pageStyle = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: 'black', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 0 };
const glassCardStyle = { width: '100%', maxWidth: '340px', textAlign: 'center', backgroundColor: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(15px)', WebkitBackdropFilter: 'blur(15px)', padding: '25px', borderRadius: '24px', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)', border: '1px solid rgba(255, 255, 255, 0.2)' };
const titleStyle = { color: 'white', margin: '0', fontWeight: '800', fontSize: '24px', textShadow: '0 2px 4px rgba(0,0,0,0.3)' };
const errorBox = { color: '#ffcdd2', fontSize: '12px', background: 'rgba(255,0,0,0.2)', padding: '8px', borderRadius: '6px', marginBottom: '10px' };
const googleBtn = { width: '100%', padding: '12px', backgroundColor: 'white', color: '#333', border: 'none', borderRadius: '50px', cursor: 'pointer', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', transition: 'transform 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '15px' };
const phoneInputStyle = { width: '100%', padding: '12px 15px', paddingLeft: '50px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.3)', fontSize: '16px', outline: 'none', backgroundColor: 'rgba(255,255,255,0.9)', transition: '0.3s', boxSizing: 'border-box', color: '#333', fontWeight:'bold' };
const prefixStyle = { position:'absolute', left:'15px', top:'50%', transform:'translateY(-50%)', color:'#333', fontWeight:'bold', fontSize:'16px', zIndex:1 };
const inputStyle = { width: '100%', padding: '12px 15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.3)', fontSize: '15px', outline: 'none', backgroundColor: 'rgba(255,255,255,0.8)', transition: '0.3s', boxSizing: 'border-box' };
const mainBtn = { padding: '14px', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', transition: 'all 0.3s ease', width:'100%', color: 'white' };
const backLink = { fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginTop: '20px', display: 'inline-block', textDecoration: 'none' };
const termsContainer = { display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '20px', marginBottom: '5px' };
const checkboxStyle = { marginRight: '8px', width: '16px', height: '16px', cursor:'pointer' };
const termsLabelStyle = { color: 'rgba(255, 255, 255, 0.9)', fontSize: '13px', fontWeight: '500', textShadow: '0 1px 2px rgba(0,0,0,0.5)', cursor:'pointer' };
const learnMoreLinkStyle = { color: '#FFD700', cursor: 'pointer', textDecoration: 'underline', fontWeight: '700' };

export default Login;