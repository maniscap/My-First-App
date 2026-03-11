import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoMdArrowBack } from 'react-icons/io';

const AiAdvisor = () => {
  const navigate = useNavigate();
  
  // We will pass data into these states later using React Router
  const [activeFeature, setActiveFeature] = useState('Standby'); 
  const [contextData, setContextData] = useState(null);
  const [aiResponse, setAiResponse] = useState('Waiting for data payload...');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.glassHeader}>
        <div style={styles.headerTop}>
          <button onClick={() => navigate(-1)} style={styles.iconBtn}>
            <IoMdArrowBack size={28} color="#60a5fa"/>
          </button>
          <div style={{textAlign:'center'}}>
            <h1 style={styles.title}>AI Advisor</h1>
            <span style={styles.badge}>{activeFeature} Mode</span>
          </div>
          <div style={{width: '40px'}}></div> {/* Spacer for alignment */}
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div style={styles.content}>
        <div style={styles.aiCard}>
            <h2 style={{marginTop: 0, color: '#60a5fa'}}>Copilot Analysis</h2>
            
            {isAnalyzing ? (
                <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                    <div className="loader"></div>
                    <p>Processing data through Gemini...</p>
                </div>
            ) : (
                <p style={{lineHeight: '1.6', color: '#e5e7eb'}}>{aiResponse}</p>
            )}
        </div>
      </div>

      <style>{`
        .loader { border: 3px solid rgba(255,255,255,0.1); border-top: 3px solid #60a5fa; border-radius: 50%; width: 24px; height: 24px; animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

const styles = {
  page: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: '#111827', fontFamily: '"Inter", sans-serif', color: 'white', display: 'flex', flexDirection: 'column' },
  glassHeader: { background: 'rgba(255, 255, 255, 0.05)', padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  headerTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: '20px', margin: 0, fontWeight: '800' },
  badge: { fontSize: '10px', background: 'rgba(96, 165, 250, 0.2)', color: '#60a5fa', padding: '3px 8px', borderRadius: '12px', textTransform: 'uppercase' },
  iconBtn: { background: 'transparent', border: 'none', cursor: 'pointer' },
  content: { padding: '20px', flex: 1, overflowY: 'auto' },
  aiCard: { background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(96, 165, 250, 0.3)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }
};

export default AiAdvisor;