import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, googleProvider } from '../firebase'; // Import our setup
import { 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  RecaptchaVerifier 
} from 'firebase/auth';

function Login() {
  const navigate = useNavigate();
  
  // State for switching modes
  const [authMethod, setAuthMethod] = useState('email'); // 'email', 'phone'
  const [isSignup, setIsSignup] = useState(false);
  
  // Form Inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');

  // 1. HANDLE GOOGLE LOGIN (Easiest)
  const handleGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/profile');
    } catch (err) {
      setError(err.message);
    }
  };

  // 2. HANDLE EMAIL LOGIN/SIGNUP
  const handleEmail = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isSignup) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate('/profile');
    } catch (err) {
      setError(err.message);
    }
  };

  // 3. HANDLE PHONE LOGIN (Tricky part with OTP)
  const generateRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible'
      });
    }
  };

  const handleSendOtp = (e) => {
    e.preventDefault();
    setError('');
    generateRecaptcha();
    const appVerifier = window.recaptchaVerifier;
    
    // Format: "+91" + phone number
    const formattedPhone = phone.includes('+') ? phone : `+91${phone}`;

    signInWithPhoneNumber(auth, formattedPhone, appVerifier)
      .then((confirmationResult) => {
        window.confirmationResult = confirmationResult;
        setOtpSent(true);
        alert("OTP Sent! (Please check your SMS)");
      }).catch((err) => {
        setError(err.message);
      });
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (window.confirmationResult) {
      window.confirmationResult.confirm(otp).then((result) => {
        navigate('/profile');
      }).catch((err) => setError("Invalid OTP"));
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={{ color: '#2E7D32', marginBottom: '20px' }}>
          Welcome to Farm Cap 🚜
        </h2>

        {/* Error Message */}
        {error && <p style={{ color: 'red', fontSize: '12px' }}>⚠️ {error}</p>}

        {/* --- GOOGLE BUTTON (Always visible) --- */}
        <button onClick={handleGoogle} style={googleBtn}>
          <span style={{ marginRight: '10px' }}>G</span> Continue with Google
        </button>

        <p style={{ margin: '15px 0', color: '#888' }}>----- OR -----</p>

        {/* --- TABS TO SWITCH EMAIL / PHONE --- */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '15px' }}>
          <button onClick={() => {setAuthMethod('email'); setOtpSent(false)}} style={authMethod === 'email' ? activeTab : inactiveTab}>📧 Email</button>
          <button onClick={() => {setAuthMethod('phone'); setOtpSent(false)}} style={authMethod === 'phone' ? activeTab : inactiveTab}>📱 Phone</button>
        </div>

        {/* --- EMAIL FORM --- */}
        {authMethod === 'email' && (
          <form onSubmit={handleEmail} style={formStyle}>
            <input type="email" placeholder="Email" required style={inputStyle} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" required style={inputStyle} onChange={(e) => setPassword(e.target.value)} />
            <button type="submit" style={actionBtn}>
              {isSignup ? 'Sign Up' : 'Login'}
            </button>
            <p style={toggleText} onClick={() => setIsSignup(!isSignup)}>
              {isSignup ? "Have an account? Login" : "New here? Create Account"}
            </p>
          </form>
        )}

        {/* --- PHONE FORM --- */}
        {authMethod === 'phone' && (
          <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} style={formStyle}>
            {!otpSent ? (
              <>
                <input type="tel" placeholder="Phone (e.g. 9876543210)" required style={inputStyle} onChange={(e) => setPhone(e.target.value)} />
                <div id="recaptcha-container"></div>
                <button type="submit" style={actionBtn}>Send OTP</button>
              </>
            ) : (
              <>
                <input type="text" placeholder="Enter OTP" required style={inputStyle} onChange={(e) => setOtp(e.target.value)} />
                <button type="submit" style={actionBtn}>Verify OTP</button>
              </>
            )}
          </form>
        )}

        <Link to="/" style={{ fontSize: '12px', color: '#666', marginTop: '15px', display: 'block' }}>Skip for now →</Link>
      </div>
    </div>
  );
}

// STYLES
const containerStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f4c3' };
const cardStyle = { backgroundColor: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', width: '320px', textAlign: 'center' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '10px' };
const inputStyle = { padding: '12px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '16px' };
const googleBtn = { width: '100%', padding: '12px', backgroundColor: '#fff', color: '#333', border: '1px solid #ccc', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const actionBtn = { padding: '12px', backgroundColor: '#2E7D32', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' };
const toggleText = { fontSize: '12px', color: '#2E7D32', cursor: 'pointer', marginTop: '10px', textDecoration: 'underline' };
const activeTab = { padding: '5px 15px', backgroundColor: '#2E7D32', color: 'white', border: 'none', borderRadius: '20px', fontSize: '12px' };
const inactiveTab = { padding: '5px 15px', backgroundColor: '#ddd', color: '#333', border: 'none', borderRadius: '20px', fontSize: '12px' };

export default Login;