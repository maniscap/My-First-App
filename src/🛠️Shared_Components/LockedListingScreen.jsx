import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function LockedListingScreen({ categoryName, icon: Icon, title, description, colorTheme }) {
    const navigate = useNavigate();
    
    // Default fallback to Blue if no theme provided
    const theme = colorTheme || {
        main: '#3B82F6', // Blue
        bg: '#EFF6FF',
        border: '#DBEAFE',
        shadow: '#BFDBFE'
    };

    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: `linear-gradient(135deg, ${theme.bg} 0%, #F8FAFC 100%)`, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px', boxSizing: 'border-box', overflowY: 'auto' }}>
        
        {/* Top Back Button Row (Static Flow) */}
        <div style={{ width: '100%', maxWidth: '420px', display: 'flex', justifyContent: 'flex-start', marginBottom: '32px' }}>
          <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '44px', height: '44px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <ArrowLeft size={22} color="#0F172A" />
          </button>
        </div>

        {/* Minimalist 3D Block Card with Faint Colorful Gradient */}
        <div style={{ 
            background: `linear-gradient(180deg, #FFFFFF 0%, ${theme.bg} 100%)`, 
            borderRadius: '32px', 
            padding: '40px 32px', 
            width: '100%', 
            maxWidth: '420px', 
            boxSizing: 'border-box',
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            textAlign: 'center', 
            border: `8px solid rgba(255, 255, 255, 0.6)`,
            boxShadow: `0 12px 0 ${theme.border}, 0 24px 40px rgba(0,0,0,0.06)`,
            marginBottom: '40px'
        }}>
            
            <div style={{ width: '64px', height: '64px', backgroundColor: theme.bg, borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', border: `2px solid ${theme.border}`, boxShadow: `0 6px 0 ${theme.shadow}` }}>
               {Icon && <Icon size={32} color={theme.main} strokeWidth={2.5} />}
            </div>
            
            <h2 style={{color: '#0F172A', fontSize: '24px', fontWeight: '800', marginBottom: '12px', letterSpacing: '-0.3px'}}>{title}</h2>
            
            <p style={{color: '#475569', margin: 0, fontSize: '15px', lineHeight: '1.6', fontWeight: '500'}}>
                {description}
            </p>
            
            <div style={{ width: '100%', height: '2px', backgroundColor: theme.bg, margin: '28px 0', borderRadius: '2px' }}></div>
            
            <div style={{ backgroundColor: theme.bg, borderRadius: '20px', padding: '24px', width: '100%', boxSizing: 'border-box', border: `1px solid ${theme.border}`, position: 'relative', overflow: 'hidden', textAlign: 'left' }}>
                <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', opacity: 0.05, transform: 'rotate(-15deg)' }}>
                    {Icon && <Icon size={120} color={theme.main} />}
                </div>
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <p style={{color: theme.main, margin: '0 0 8px 0', fontSize: '13px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: '800'}}>
                        Next Steps
                    </p>
                    <p style={{color: '#475569', margin: 0, fontSize: '14px', lineHeight: '1.6', fontWeight: '500'}}>
                        Please go to the <span onClick={() => navigate('/seller-setup')} style={{color: theme.main, fontWeight: '800', cursor: 'pointer', textDecoration: 'underline'}}>Seller Registration</span> to submit your application. 
                        Once approved, you can return here and your listings will instantly go live!
                    </p>
                </div>
            </div>

            <div style={{ marginTop: '32px', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: theme.bg, borderRadius: '24px', border: `2px solid ${theme.border}`, boxShadow: `0 4px 0 ${theme.border}` }}>
                <span style={{ fontSize: '16px' }}>✨</span>
                <span style={{ fontSize: '15px', color: theme.main, fontWeight: '800', letterSpacing: '0.5px' }}>Thank You!</span>
            </div>
        </div>
      </div>
    );
}
