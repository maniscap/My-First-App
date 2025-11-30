import React, { useState } from 'react';
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
  const [authMethod, setAuthMethod] = useState('email'); 
  const [isSignup, setIsSignup] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');

  // 1. HANDLE GOOGLE LOGIN
  const handleGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/dashboard'); // <--- CHANGED TO DASHBOARD
    } catch (err) {
      setError(err.message);
    }
  };

  // 2. HANDLE EMAIL LOGIN
  const handleEmail = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isSignup) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate('/dashboard'); // <--- CHANGED TO DASHBOARD
    } catch (err) {
      setError(err.message);
    }
  };

  // 3. HANDLE PHONE LOGIN
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
        navigate('/dashboard'); // <--- CHANGED TO DASHBOARD
      }).catch((err) => setError("Invalid OTP"));
    }
  };

  return (
    <div style={containerStyle}>
      <div className="glass-card" style={cardStyle}>
        <h2 style={{ color: '#1B5E20', marginBottom: '20px' }}>
          {isSignup ? 'Join Farm Cap' : 'Welcome Back'} 🚜
        </h2>

        {error && <p style={{ color: 'red', fontSize: '12px' }}>⚠️ {error}</p>}

        <button onClick={handleGoogle} style={googleBtn}>
          <span style={{ marginRight: '10px' }}>G</span> Continue with Google
        </button>

        <p style={{ margin: '15px 0', color: '#555' }}>----- OR -----</p>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '15px' }}>
          <button onClick={() => {setAuthMethod('email'); setOtpSent(false)}} style={authMethod === 'email' ? activeTab : inactiveTab}>📧 Email</button>
          <button onClick={() => {setAuthMethod('phone'); setOtpSent(false)}} style={authMethod === 'phone' ? activeTab : inactiveTab}>📱 Phone</button>
        </div>

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

        <Link to="/" style={{ fontSize: '12px', color: '#555', marginTop: '15px', display: 'block', textDecoration: 'none' }}>⬅ Back to Home</Link>
      </div>
    </div>
  );
}

// STYLES
const containerStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' };
const cardStyle = { width: '100%', maxWidth: '350px', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.95)' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '10px' };
const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '16px' };
const googleBtn = { width: '100%', padding: '12px', backgroundColor: '#fff', color: '#333', border: '1px solid #ccc', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '500' };
const actionBtn = { padding: '12px', backgroundColor: '#1B5E20', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' };
const toggleText = { fontSize: '13px', color: '#1B5E20', cursor: 'pointer', marginTop: '10px', textDecoration: 'underline', fontWeight: '500' };
const activeTab = { padding: '8px 20px', backgroundColor: '#1B5E20', color: 'white', border: 'none', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' };
const inactiveTab = { padding: '8px 20px', backgroundColor: '#ddd', color: '#333', border: 'none', borderRadius: '20px', fontSize: '13px' };

export default Login;