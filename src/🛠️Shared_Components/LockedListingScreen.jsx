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

    const appStatus = localStorage.getItem('seller_app_status') || 'none';
    const appFrozen = localStorage.getItem('seller_app_frozen') === 'true';

    // 1) DYNAMIC THEME SELECTION
    let currentTheme = colorTheme || {
        main: '#3B82F6', // Blue
        bg: '#EFF6FF',
        border: '#DBEAFE',
        shadow: '#BFDBFE'
    };

    if (appStatus === 'permanently_deleted' || appStatus === 'rejected') {
        currentTheme = {
            main: '#EF4444', // Red
            bg: '#FEF2F2',
            border: '#FEE2E2',
            shadow: '#FECACA'
        };
    } else if (appFrozen) {
        // Use a nice Blue specifically for frozen accounts
        currentTheme = {
            main: '#0284C7', // Sky Blue
            bg: '#F0F9FF',
            border: '#E0F2FE',
            shadow: '#BAE6FD'
        };
    }
    // For 'pending_approval' and 'none', we do NOT override, so it uses the unique category colorTheme!

    // 2) POLITE DYNAMIC TEXT
    let displayTitle = title;
    let displayDesc = description;
    let nextStepsLabel = "Next Steps";
    let nextStepsText = (
        <>
            Welcome to our Seller Hub! Please submit a quick application to start adding {categoryName} listings. <br/><br/>
            <span onClick={() => navigate('/seller-setup')} style={{color: currentTheme.main, fontWeight: '800', cursor: 'pointer', textDecoration: 'underline'}}>Click here to Register</span>
        </>
    );

    if (appFrozen) {
        displayTitle = "Account Temporarily Paused";
        displayDesc = "Your seller privileges are temporarily on hold. During this time, you cannot manage or add new listings.";
        const reason = localStorage.getItem('seller_app_frozen_reason') || 'Irregular activity detected';
        nextStepsLabel = "Reason for Pause";
        nextStepsText = <>We kindly ask for your patience. Reason: <strong>{reason}</strong>. Our team is looking into this, please wait for further updates.</>;
    } else if (appStatus === 'permanently_deleted') {
        displayTitle = "Account Access Revoked";
        displayDesc = "We are very sorry, but your seller account has been removed by our administration team. You no longer have access to add new listings.";
        const reason = localStorage.getItem('seller_app_deleted_reason') || 'Violation of Terms & Conditions';
        nextStepsLabel = "What can I do?";
        nextStepsText = (
            <>
                Reason: <strong>{reason}</strong>.<br/>
                If you believe this was a mistake, we invite you to <span onClick={() => navigate('/seller-setup')} style={{color: currentTheme.main, fontWeight: '800', cursor: 'pointer', textDecoration: 'underline'}}>Apply Again</span> and our team will gladly re-evaluate your case.
            </>
        );
    } else if (appStatus === 'rejected') {
        displayTitle = "Application Not Approved";
        displayDesc = "We appreciate your interest in becoming a seller, but unfortunately, your application was not approved at this time.";
        const reason = localStorage.getItem('seller_app_rejected_reason') || 'Does not meet platform requirements.';
        nextStepsLabel = "What can I do?";
        nextStepsText = (
            <>
                Reason: <strong>{reason}</strong>.<br/>
                Please review the requirements. You are welcome to <span onClick={() => navigate('/seller-setup')} style={{color: currentTheme.main, fontWeight: '800', cursor: 'pointer', textDecoration: 'underline'}}>Update & Re-Apply</span> once the issues are resolved.
            </>
        );
    } else if (appStatus === 'pending_approval') {
        displayTitle = "Application Under Review";
        displayDesc = `Thank you for applying! Our admin team is currently reviewing your details.`;
        nextStepsLabel = "Status Update";
        nextStepsText = <>Please wait a little while longer. We appreciate your patience and will notify you the moment your account is approved to add {categoryName}!</>;
    }

    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: `linear-gradient(135deg, ${currentTheme.bg} 0%, #F8FAFC 100%)`, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px', boxSizing: 'border-box', overflowY: 'auto' }}>
        
        {/* Top Back Button Row (Static Flow) */}
        <div style={{ width: '100%', maxWidth: '420px', display: 'flex', justifyContent: 'flex-start', marginBottom: '16px' }}>
          <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <ArrowLeft size={20} color="#0F172A" />
          </button>
        </div>

        {/* Premium 3D Block Card */}
        <div style={{ 
            background: `linear-gradient(180deg, #FFFFFF 0%, ${currentTheme.bg} 100%)`, 
            borderRadius: '24px', 
            padding: '28px 24px', 
            width: '100%', 
            maxWidth: '420px', 
            boxSizing: 'border-box',
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            textAlign: 'center', 
            border: `4px solid #FFFFFF`,
            boxShadow: `
                inset 0 4px 0 rgba(255,255,255,1), 
                inset 0 -4px 0 rgba(0,0,0,0.03), 
                0 10px 0 ${currentTheme.border}, 
                0 20px 40px rgba(0,0,0,0.1)
            `,
            position: 'relative',
            marginBottom: '20px'
        }}>
            
            <div style={{ width: '60px', height: '60px', backgroundColor: currentTheme.bg, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', border: `3px solid #FFFFFF`, boxShadow: `0 6px 0 ${currentTheme.shadow}, 0 10px 15px rgba(0,0,0,0.05)` }}>
               {Icon && <Icon size={30} color={currentTheme.main} strokeWidth={2.5} />}
            </div>
            
            <h2 style={{color: '#0F172A', fontSize: '20px', fontWeight: '800', marginBottom: '8px', letterSpacing: '-0.3px', textShadow: '0 1px 2px rgba(0,0,0,0.03)'}}>{displayTitle}</h2>
            
            <p style={{color: '#475569', margin: 0, fontSize: '14px', lineHeight: '1.5', fontWeight: '600'}}>
                {displayDesc}
            </p>
            
            <div style={{ width: '100%', height: '3px', background: `linear-gradient(90deg, transparent, ${currentTheme.border}, transparent)`, margin: '20px 0', borderRadius: '2px' }}></div>
            
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '20px', width: '100%', boxSizing: 'border-box', border: `2px solid ${currentTheme.bg}`, boxShadow: `inset 0 3px 6px rgba(0,0,0,0.02), 0 4px 0 ${currentTheme.bg}`, position: 'relative', overflow: 'hidden', textAlign: 'left' }}>
                <div style={{ position: 'absolute', bottom: '-15px', right: '-15px', opacity: 0.04, transform: 'rotate(-15deg)' }}>
                    {Icon && <Icon size={100} color={currentTheme.main} />}
                </div>
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <p style={{color: currentTheme.main, margin: '0 0 6px 0', fontSize: '12px', letterSpacing: '0.8px', textTransform: 'uppercase', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '6px'}}>
                        <span style={{width: '6px', height: '6px', borderRadius: '50%', backgroundColor: currentTheme.main}}></span>
                        {nextStepsLabel}
                    </p>
                    <p style={{color: '#334155', margin: 0, fontSize: '13px', lineHeight: '1.6', fontWeight: '600'}}>
                        {nextStepsText}
                    </p>
                </div>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#FFFFFF', borderRadius: '20px', border: `2px solid ${currentTheme.bg}`, boxShadow: `0 4px 0 ${currentTheme.shadow}, 0 6px 12px rgba(0,0,0,0.05)` }}>
                <span style={{ fontSize: '16px' }}>✨</span>
                <span style={{ fontSize: '14px', color: currentTheme.main, fontWeight: '800', letterSpacing: '0.3px' }}>Thank You!</span>
            </div>
        </div>
      </div>
    );
}
