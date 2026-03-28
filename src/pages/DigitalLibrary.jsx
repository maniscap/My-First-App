import React, { useState, forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoMdArrowBack } from 'react-icons/io';
import HTMLFlipBook from 'react-pageflip';

// The path is perfectly set for a file sitting in src/pages/ 
// pulling from src/Utilities/
import { processWithFarmBrain } from '../utils.js/AIBrain';

// --- 1. The Physical Page Component ---
// react-pageflip requires pages to be forwarded refs
const Page = forwardRef((props, ref) => {
  return (
    <div 
      className="page" 
      ref={ref} 
      style={{ 
        padding: '25px', 
        background: '#fffdf2', // Classic book page color
        border: '1px solid #e0d4b5', 
        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        boxSizing: 'border-box'
      }}
    >
      <div>
        <h2 style={{ fontSize: '20px', color: '#00695c', borderBottom: '2px solid #00695c', paddingBottom: '10px', marginTop: 0 }}>
          {props.title}
        </h2>
        <p style={{ fontSize: '15px', lineHeight: '1.6', color: '#333', marginTop: '15px' }}>
          {props.children}
        </p>
      </div>
      <div style={{ textAlign: 'center', fontSize: '12px', color: '#888', borderTop: '1px solid #eee', paddingTop: '10px' }}>
        Page {props.number}
      </div>
    </div>
  );
});

// --- 2. The Main Library Component ---
const DigitalLibrary = () => {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [bookData, setBookData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateBook = async () => {
    if (!topic.trim()) return;
    
    setLoading(true);
    setError(null);
    setBookData(null);

    // --- PROMPT ENGINEERING: Forcing JSON Output ---
    const systemPrompt = `
      You are an expert Indian agricultural scientist. The user wants to learn about a specific farming topic. 
      Write a short, educational guide customized for Indian climate, soil, and markets. 
      
      CRITICAL REQUIREMENT: You MUST respond ONLY with a valid JSON array of objects. Do not include markdown formatting like \`\`\`json. 
      Each object represents one page of the book. Keep each page under 120 words so it fits visually on a mobile screen. 
      Generate exactly 4 to 6 pages.
      
      Format exactly like this:
      [
        { "chapter_title": "Introduction to [Topic]", "page_content": "..." },
        { "chapter_title": "Best Practices", "page_content": "..." }
      ]
    `;

    try {
      const result = await processWithFarmBrain(systemPrompt, `Topic: ${topic}`);

      if (!result.success) {
        throw new Error(result.error || "Failed to generate book.");
      }

      // Aggressively clean the response to prevent UI crashes if the LLM adds markdown
      const cleanJsonStr = result.data
        .replace(/```json/gi, '')
        .replace(/```/gi, '')
        .trim();
        
      const parsedData = JSON.parse(cleanJsonStr);
      
      setBookData(parsedData);
      setTopic(''); // Clear input after generating

    } catch (err) {
      console.error("Book Generation Error:", err);
      setError("The AI formatting failed. Please try again with a slightly different topic.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', background: '#e0f2f1', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
        <button 
          onClick={() => navigate('/agri-insights', { state: { explored: true } })} 
          style={{ background:'none', border:'none', cursor:'pointer', padding: 0, marginRight: '15px' }}
        >
          <IoMdArrowBack size={28} color="#00695c"/>
        </button>
        <h1 style={{ color: '#00695c', margin: 0, fontSize: '24px' }}>AI Farm Library 📚</h1>
      </div>

      {/* Input Section - The "Librarian" */}
      {!bookData && !loading && (
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '18px', margin: '0 0 15px 0', color: '#333' }}>What do you want to learn today?</h2>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
            Ask our AI agricultural scientist to write a custom, on-demand guide just for you.
          </p>
          <input 
            type="text" 
            placeholder="e.g., Organic pest control for rice" 
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', marginBottom: '15px', boxSizing: 'border-box' }}
          />
          <button 
            onClick={generateBook}
            style={{ width: '100%', padding: '12px', background: '#00695c', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Generate My Custom Book
          </button>
          
          {error && <p style={{ color: '#d32f2f', fontSize: '14px', marginTop: '10px' }}>{error}</p>}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', color: '#00695c', padding: '50px 0' }}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>✍️🤖</div>
          <h3>Writing your custom book...</h3>
          <p style={{ fontSize: '14px', color: '#666' }}>Consulting AI models for the best farming practices...</p>
        </div>
      )}

      {/* Book Rendering State */}
      {bookData && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          {/* react-pageflip configuration */}
          <HTMLFlipBook 
            width={300} 
            height={400} 
            size="stretch"
            minWidth={300}
            maxWidth={400}
            minHeight={400}
            maxHeight={500}
            showCover={true}
            mobileScrollSupport={true}
            className="farm-book"
            style={{ boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}
          >
            {/* Book Cover */}
            <Page title="FarmCap Guide" number={1}>
               <div style={{ textAlign: 'center', marginTop: '50px' }}>
                 <h1 style={{ fontSize: '24px', color: '#00695c' }}>Custom Guide</h1>
                 <p style={{ fontStyle: 'italic', color: '#555' }}>Generated Exclusively For You</p>
                 <div style={{ fontSize: '50px', marginTop: '20px' }}>🌱</div>
               </div>
            </Page>

            {/* Dynamically Generated Pages */}
            {bookData.map((page, index) => (
              <Page key={index} title={page.chapter_title} number={index + 2}>
                {page.page_content}
              </Page>
            ))}

            {/* Back Cover */}
            <Page title="The End" number={bookData.length + 2}>
              <div style={{ textAlign: 'center', marginTop: '30px' }}>
                 <p style={{ fontSize: '12px', color: '#666', fontStyle: 'italic' }}>
                   Disclaimer: This guide is AI-generated. Always verify chemical use, fertilizers, and market strategies with local agricultural boards or experts before application.
                 </p>
                 <button 
                  onClick={() => setBookData(null)}
                  style={{ marginTop: '30px', padding: '10px 20px', background: '#00695c', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                 >
                   Write Another Book
                 </button>
               </div>
            </Page>
          </HTMLFlipBook>
          
          <p style={{ marginTop: '20px', color: '#00695c', fontSize: '14px', fontWeight: 'bold' }}>
            ← Swipe to turn pages →
          </p>
        </div>
      )}
    </div>
  );
};

export default DigitalLibrary;