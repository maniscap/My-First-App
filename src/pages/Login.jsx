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
  
  // --- DAY/NIGHT BACKGROUND LOGIC ---
  const [bgImage, setBgImage] = useState('');
  const dayBg = 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2940&auto=format&fit=crop';
  const nightBg = 'https://images.unsplash.com/photo-1509773896068-7fd415d91e2e?q=80&w=2940&auto=format&fit=crop';

  useEffect(() => {
    const updateTime = () => {
      const hour = new Date().getHours();
      if (hour >= 18 || hour < 6) setBgImage(nightBg);
      else setBgImage(dayBg);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);
  // ----------------------------------

  const [authMethod, setAuthMethod] = useState('email'); 
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');

  const handleGoogle = async () => {
    try { await signInWithPopup(auth, googleProvider); navigate('/dashboard'); } 
    catch (err) { setError(err.message); }
  };

  const handleEmail = async (e) => {
    e.preventDefault(); setError('');
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
    e.preventDefault(); setError(''); generateRecaptcha();
    const formattedPhone = phone.includes('+') ? phone : `+91${phone}`;
    signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier)
      .then((res) => { window.confirmationResult = res; setOtpSent(true); alert("OTP Sent!"); })
      .catch((err) => { setError(err.message); });
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (window.confirmationResult) window.confirmationResult.confirm(otp).then(() => navigate('/dashboard')).catch(() => setError("Invalid OTP"));
  };

  return (
    <div style={{...containerStyle, backgroundImage: `url('${bgImage}')`}}>
      
      {/* --- TRANSPARENT GLASS CARD --- */}
      <div style={glassCardStyle}>
        
        {/* Header */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{fontSize: '50px', marginBottom: '5px', filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.3))'}}>🧢</div>
          <h2 style={titleStyle}>
            {isSignup ? 'Join Farm Cap' : 'Login'}
          </h2>
          <p style={{color: 'rgba(255,255,255,0.8)', margin: '5px 0 0 0', fontSize: '14px'}}>Secure access for farmers</p>
        </div>

        {error && <div style={errorBox}>⚠️ {error}</div>}

        {/* --- GOOGLE BUTTON --- */}
        <button onClick={handleGoogle} style={googleBtn}>
          <svg width="18" height="18" viewBox="0 0 24 24" style={{marginRight: '10px'}}>
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: 'bold' }}>
          <div style={{flex: 1, height: '1px', background: 'rgba(255,255,255,0.3)'}}></div>
          <span style={{ margin: '0 10px' }}>OR</span>
          <div style={{flex: 1, height: '1px', background: 'rgba(255,255,255,0.3)'}}></div>
        </div>

        {/* --- TABS (Email / Phone) --- */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px' }}>
          <button onClick={() => {setAuthMethod('email'); setOtpSent(false)}} 
            style={authMethod === 'email' ? activeTab : inactiveTab}>
            
            {/* --- GMAIL LOGO --- */}
            <svg width="20" height="20" viewBox="0 0 48 48" style={{marginRight:'8px', verticalAlign:'middle'}}>
                <path fill="#4caf50" d="M45,16.2l-5,2.75l-5,4.75v13h10V16.2z"></path>
                <path fill="#1e88e5" d="M3,16.2l5,2.75l5,4.75v13H3V16.2z"></path>
                <path fill="#e53935" d="M35,23.7v13h10V16.2l-10-5.5v13z"></path>
                <path fill="#c62828" d="M3,16.2v20.5h10v-13L3,23.7z"></path>
                <path fill="#fbc02d" d="M35,11.2L24,5.2L13,11.2v12.5L24,17.7l11,6V11.2z"></path>
            </svg>
            Email
          </button>
          
          <button onClick={() => {setAuthMethod('phone'); setOtpSent(false)}} 
            style={authMethod === 'phone' ? activeTab : inactiveTab}>
            📱 Phone
          </button>
        </div>

        {/* --- EMAIL FORM --- */}
        {authMethod === 'email' && (
          <form onSubmit={handleEmail} style={formStyle}>
            <input type="email" placeholder="Email" required style={inputStyle} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" required style={inputStyle} onChange={(e) => setPassword(e.target.value)} />
            <button type="submit" style={mainBtn}>
              {isSignup ? 'Create Account' : 'Login'} 
            </button>
            <p style={toggleText} onClick={() => setIsSignup(!isSignup)}>
              {isSignup ? "Have an account? Login" : "New? Create Account"}
            </p>
          </form>
        )}

        {/* --- PHONE FORM --- */}
        {authMethod === 'phone' && (
          <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} style={formStyle}>
            {!otpSent ? (
              <>
                <input type="tel" placeholder="Mobile Number" required style={inputStyle} onChange={(e) => setPhone(e.target.value)} />
                <div id="recaptcha-container"></div>
                <button type="submit" style={mainBtn}>Send OTP</button>
              </>
            ) : (
              <>
                <input type="text" placeholder="OTP" required style={{...inputStyle, textAlign: 'center'}} onChange={(e) => setOtp(e.target.value)} />
                <button type="submit" style={mainBtn}>Verify</button>
              </>
            )}
          </form>
        )}

        <Link to="/" style={backLink}>← Home</Link>
      </div>
    </div>
  );
}

// --- STYLES ---
const containerStyle = { 
  // Fixed full viewport coverage
  position: 'fixed', 
  top: 0, 
  left: 0, 
  width: '100vw', 
  height: '100vh',
  display: 'flex', 
  justifyContent: 'center', 
  alignItems: 'center', 
  padding: '20px',
  backgroundSize: 'cover', 
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundColor: 'black', // Safety
  zIndex: 0
};

const glassCardStyle = { 
  width: '100%', maxWidth: '360px', textAlign: 'center', 
  backgroundColor: 'rgba(255, 255, 255, 0.15)', 
  backdropFilter: 'blur(15px)', 
  WebkitBackdropFilter: 'blur(15px)',
  padding: '30px', borderRadius: '24px',
  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  zIndex: 10 // Sits above background
};

const titleStyle = { color: 'white', margin: '0', fontWeight: '800', fontSize: '24px', textShadow: '0 2px 4px rgba(0,0,0,0.3)' };
const errorBox = { color: '#ffcdd2', fontSize: '13px', background: 'rgba(255,0,0,0.2)', padding: '10px', borderRadius: '8px', marginBottom: '15px' };
const googleBtn = { width: '100%', padding: '12px', backgroundColor: 'white', color: '#333', border: 'none', borderRadius: '50px', cursor: 'pointer', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', transition: 'transform 0.2s' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '12px' };
const inputStyle = { width: '100%', padding: '12px 15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.3)', fontSize: '15px', outline: 'none', backgroundColor: 'rgba(255,255,255,0.8)', transition: '0.3s', boxSizing: 'border-box' };
const mainBtn = { padding: '12px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(76, 175, 80, 0.4)', transition: 'transform 0.2s' };
const toggleText = { fontSize: '13px', color: 'white', cursor: 'pointer', marginTop: '10px', fontWeight: '500', textShadow: '0 1px 2px rgba(0,0,0,0.5)' };
const backLink = { fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginTop: '20px', display: 'inline-block', textDecoration: 'none' };

const activeTab = { padding: '8px 20px', backgroundColor: 'white', color: '#333', border: 'none', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center' };
const inactiveTab = { padding: '8px 20px', backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '20px', fontSize: '13px', cursor: 'pointer' };

export default Login;