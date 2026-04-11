import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoMdArrowBack, IoIosArrowDown, IoIosArrowUp, IoMdSunny, IoMdMoon, IoMdBookmark, IoMdSend, IoMdClose, IoMdVolumeHigh, IoMdVolumeOff, IoMdChatbubbles, IoMdGrid, IoMdTrash, IoMdMic, IoMdMicOff } from 'react-icons/io';
import { useSwipeable } from 'react-swipeable';
import { motion, AnimatePresence } from 'framer-motion';

// The path is perfectly set for a file sitting in src/pages/ 
// pulling from src/Utilities/
import { processWithFarmBrain } from '../utils.js/AIBrain';

// --- PREMIUM GLASS CARD STYLE EXTRACTED FROM WEATHER.JSX ---
const getGlassStyle = (theme) => ({
  background: theme === 'dark' ? 'rgba(20, 20, 25, 0.65)' : 'rgba(255, 255, 255, 0.5)',
  backdropFilter: 'blur(16px) saturate(120%) brightness(110%)',
  WebkitBackdropFilter: 'blur(16px) saturate(120%) brightness(110%)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderTop: '1px solid rgba(255, 255, 255, 0.3)',
  borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.3), 0 8px 32px rgba(0, 0, 0, 0.15)',
  borderRadius: '24px',
  boxSizing: 'border-box',
  transition: 'all 0.3s ease'
});

// --- 1. The Physical Page Component ---
const Page = React.forwardRef(({ title, children, number, theme, fontSize = 16 }, ref) => {
  const isDark = theme === 'dark';
  return (
    <div 
      ref={ref}
      className="page" 
      style={{ 
        fontFamily: "Georgia, 'Times New Roman', serif",
        background: 'transparent',
        boxShadow: 'none',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        boxSizing: 'border-box',
        position: 'relative'
      }}
    >
      <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '25px 20px', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
        <h2 style={{ fontSize: `${Math.max(18, fontSize + 4)}px`, color: isDark ? '#f0f0f0' : '#111', marginTop: 0, marginBottom: '20px', lineHeight: '1.3' }}>
          {title}
        </h2>
        <div style={{ fontSize: `${fontSize}px`, lineHeight: '1.6', color: isDark ? '#d4d4d8' : '#333', textAlign: 'justify', wordBreak: 'break-word' }}>
          {children}
        </div>
      </div>
    </div>
  );
});

const PageCover = React.forwardRef(({ children, theme }, ref) => {
    const isDark = theme === 'dark';
    return (
      <div 
        ref={ref}
        className="page page-cover" 
        style={{ 
          padding: '0', 
          background: 'transparent',
          boxShadow: 'none',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          width: '100%',
          boxSizing: 'border-box',
          position: 'relative'
        }}
      >
      <div style={{fontFamily: "Georgia, 'Times New Roman', serif", width: '100%', height: '100%'}}>
         {children}
      </div>
      </div>
    );
});

// --- 2. The Main Library Component ---
const DigitalLibrary = () => {
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 18 || hour < 6) setTheme('dark');
    else setTheme('light');
  }, []);

  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [bookTopic, setBookTopic] = useState('');
  const [language, setLanguage] = useState('English');
  const [bookLength, setBookLength] = useState('Standard (10 Pages)');
  const [chapters, setChapters] = useState(3);
  const [contentStyle, setContentStyle] = useState('Practical Advice (Step-by-step)');
  const [customStyle, setCustomStyle] = useState('');
  const [bookData, setBookData] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(60);
  const [theme, setTheme] = useState('light');
  const [fontSize, setFontSize] = useState(16);

  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = bookData ? bookData.length + 3 : 0;
  const [showControls, setShowControls] = useState(false);
  const [showGridView, setShowGridView] = useState(false);

  // Chatbot state
  const [userQuestion, setUserQuestion] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const [searchHistory, setSearchHistory] = useState(() => {
    const saved = localStorage.getItem('farmCap_library_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [savedBooks, setSavedBooks] = useState(() => {
    const saved = localStorage.getItem('farmCap_saved_books');
    return saved ? JSON.parse(saved) : [];
  });

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSavedBooksOpen, setIsSavedBooksOpen] = useState(false);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const chatContainerRef = useRef(null);

  const stateRef = useRef({ bookData: null, loading: false, isAlreadySaved: true, showSavePrompt: false });
  const skipNextPopState = useRef(false);
  const generationIdRef = useRef(null);

  // Countdown timer effect
  useEffect(() => {
    if (!loading) return;

    setCountdown(90); // Extended timer for maximum context generation

    const timerId = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timerId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup for when loading becomes false or component unmounts
    return () => {
      clearInterval(timerId);
    }
  }, [loading]);

  // Stop speaking if page changes
  useEffect(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [currentPage]);

  // Cleanup speech synthesis
  useEffect(() => {
    return () => {
      if (window.speechSynthesis.speaking) window.speechSynthesis.cancel();
    };
  }, [bookData]);

  // Auto-scroll chat effect
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, isChatLoading]);

  const isAlreadySaved = bookData && bookTopic ? savedBooks.some(book => book.topic.toLowerCase() === bookTopic.toLowerCase()) : false;

  useEffect(() => {
    stateRef.current = { bookData, loading, isAlreadySaved, showSavePrompt };
  }, [bookData, loading, isAlreadySaved, showSavePrompt]);

  useEffect(() => {
    const handlePopState = (e) => {
      if (skipNextPopState.current) {
        skipNextPopState.current = false;
        return;
      }
      const { bookData, loading, isAlreadySaved, showSavePrompt } = stateRef.current;

      if (showSavePrompt) {
        setShowSavePrompt(false);
        window.history.pushState({ isSubView: true }, ''); // Prevent back
      } else if (bookData && !isAlreadySaved) {
        setShowSavePrompt(true);
        window.history.pushState({ isSubView: true }, ''); // Prevent back
      } else if (bookData) {
        setBookData(null);
        setCurrentPage(0);
        setChatMessages([]);
      } else if (loading) {
        setLoading(false);
        generationIdRef.current = null; // Cancel generation
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const callAIWithTimeout = (systemPrompt, userPrompt, timeout = 30000) => {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("AI request timed out.")), timeout)
    );
    return Promise.race([processWithFarmBrain(systemPrompt, userPrompt), timeoutPromise]);
  };
  
  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(Math.max(0, totalPages - 1), prev + 1));
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleNextPage(),
    onSwipedRight: () => handlePrevPage(),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  const toggleControls = (e) => {
    // Only toggle if the click is on the background, not on buttons inside
    if (e.target === e.currentTarget) {
      setShowControls(prev => !prev);
    }
  };

  const onPage = (e) => { setCurrentPage(e.data); };

  const toggleSpeech = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (currentPage === 0 || currentPage === 1 || !bookData || currentPage >= totalPages - 1) {
      return; // Do not read cover, ToC, or End pages
    }

    const pageIndex = currentPage - 2;
    const pageData = bookData[pageIndex];
    if (!pageData) return;

    const textToSpeak = `${pageData.chapter_title}. ${pageData.page_content}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    const voices = window.speechSynthesis.getVoices();
    const langCode = language.substring(0, 2).toLowerCase();
    const selectedVoice = voices.find(voice => voice.lang.startsWith(langCode) && voice.name.includes('Google')) ||
                          voices.find(voice => voice.lang.startsWith(langCode) && voice.localService) ||
                          voices.find(voice => voice.lang.startsWith(langCode));
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
      console.error('Speech synthesis error:', e);
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const generateBook = async () => {
    if (!topic.trim()) return;
    
    const currentTopic = topic.trim();
    setBookTopic(currentTopic);

    const updatedHistory = [currentTopic, ...searchHistory.filter(t => t.toLowerCase() !== currentTopic.toLowerCase())].slice(0, 10);
    setSearchHistory(updatedHistory);
    localStorage.setItem('farmCap_library_history', JSON.stringify(updatedHistory));

    const currentGenId = Date.now();
    generationIdRef.current = currentGenId;

    setLoading(true);
    setError(null);
    setBookData(null);
    setCoverImage(null);
    window.history.pushState({ isSubView: true }, '');

    // --- NEW: Fetch a high-quality image from Unsplash based on the topic ---
    const unsplashUrl = `https://source.unsplash.com/400x600/?${encodeURIComponent(currentTopic + ',farm,agriculture')}`;
    setCoverImage(unsplashUrl);
    new Image().src = unsplashUrl; // Preload the image

    let targetPages = 10;
    if (bookLength.includes('5')) targetPages = 5;
    if (bookLength.includes('15')) targetPages = 15;
    if (bookLength.includes('20')) targetPages = 20;

    let toneInstruction = '';
    if (contentStyle.includes('Educational')) toneInstruction = 'Write in an educational and theoretical tone. Explain the science and the "why" behind the concepts clearly.';
    else if (contentStyle.includes('Practical')) toneInstruction = 'Write strictly as a highly actionable, step-by-step practical advice guide. Focus on "how-to" and daily farming tasks.';
    else if (contentStyle.includes('Story')) toneInstruction = 'Write the content as an engaging narrative or story that teaches the concepts through relatable rural characters and scenarios.';
    else toneInstruction = `Write exactly according to this custom instruction: "${customStyle}"`;

    // --- PROMPT ENGINEERING: Forcing JSON Output ---
    const systemPrompt = `
      You are a versatile and expert Indian agricultural AI author. 
      The user requested a book on the topic: "${currentTopic}". 
      Expand it into a comprehensive guide customized for the Indian farming context.

      # SAFETY GUIDELINES:
      If the topic is sexually explicit, violent, or inappropriate, you must still return a valid JSON array, but with a single page explaining your refusal politely.

      # CRITICAL FORMATTING RULES (READ THESE FOUR WORDS STRICTLY: ONLY VALID JSON ARRAY):
      1. The entire book MUST be written in the ${language} language.
      2. You MUST respond ONLY with a valid JSON array. NO conversational text, NO greetings, NO markdown formatting.
      3. Each page object must have EXACTLY two keys: "chapter_title" and "page_content".
      4. TONE & STYLE: ${toneInstruction}
      5. CONTENT CLARITY: Use simple, engaging, and easy-to-understand language. Explain any technical jargon clearly so even a beginner can easily understand.
      6. LENGTH CONSTRAINTS: You must generate approximately ${targetPages} pages.
      7. CHAPTER CONSTRAINTS: Divide the content logically across EXACTLY ${chapters} chapters.
      8. ABSOLUTE REQUIREMENT: Every single chapter MUST have AT LEAST TWO PAGES. NEVER write a chapter that is only one page. Group them nicely.
      9. CRITICAL: You MUST properly close the JSON array ( ] ) before your output limit is reached. Do not cut off mid-sentence.

      # EXAMPLE JSON STRUCTURE (showing mandatory multi-page chapter format):
      [
        { "chapter_title": "Chapter 1: Basics (Part 1)", "page_content": "Detailed content part 1..." },
        { "chapter_title": "Chapter 1: Basics (Part 2)", "page_content": "Detailed content part 2..." },
        { "chapter_title": "Chapter 2: Advanced (Part 1)", "page_content": "Detailed content part 1..." },
        { "chapter_title": "Chapter 2: Advanced (Part 2)", "page_content": "Detailed content part 2..." }
      ]
    `;

    let attempts = 0;
    const maxAttempts = 3; // Retry up to 3 times if a model fails or formatting breaks
    let finalParsedData = null;

    while (attempts < maxAttempts && !finalParsedData) {
      attempts++;
      try {
        const retryHint = attempts > 1 ? "\n\nCRITICAL: Previous attempt failed. READ THESE FOUR WORDS STRICTLY: ONLY VALID JSON ARRAY. DO NOT ADD ANY OTHER TEXT." : "";
        const result = await callAIWithTimeout(systemPrompt + retryHint, `Topic: ${topic}`, 90000); // 90-second timeout for massive generation

        if (!result.success) throw new Error(result.error || "Failed to generate book.");

        let rawText = result.data;
        let parsedData = null;
        
        // 1. Remove Markdown Formatting
        let cleanStr = rawText.replace(/```(?:json)?/gi, '').replace(/```/gi, '').trim();

        // 2. Extract the Array or Object
        const startIdx = cleanStr.indexOf('[');
        const endIdx = cleanStr.lastIndexOf(']');
        
        if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
            cleanStr = cleanStr.substring(startIdx, endIdx + 1);
            parsedData = JSON.parse(cleanStr);
        } else {
            // Fallback for wrapped objects like { "book": [...] }
            const objStart = cleanStr.indexOf('{');
            const objEnd = cleanStr.lastIndexOf('}');
            if (objStart !== -1 && objEnd !== -1 && objEnd > objStart) {
                const objStr = cleanStr.substring(objStart, objEnd + 1);
                const obj = JSON.parse(objStr);
                for (const key in obj) {
                    if (Array.isArray(obj[key])) { parsedData = obj[key]; break; }
                }
                if (!parsedData) parsedData = [obj];
            } else {
                 parsedData = JSON.parse(cleanStr);
            }
        }

        // 3. Validation & Normalization (handles camelCase vs snake_case and single objects)
        if (!Array.isArray(parsedData)) {
            if (parsedData && typeof parsedData === 'object') parsedData = [parsedData];
            else throw new Error("AI did not return a valid array or object.");
        }
        if (parsedData.length === 0) throw new Error("AI returned an empty array.");

        finalParsedData = parsedData.map((page, index) => ({
            chapter_title: page.chapter_title || page.chapterTitle || page.title || `Chapter ${index + 1}`,
            page_content: page.page_content || page.pageContent || page.content || page.text || ""
        })).filter(page => page.page_content.trim() !== "");

        if (finalParsedData.length === 0) {
            finalParsedData = null; 
            throw new Error("No valid pages found after parsing.");
        }
      } catch (err) {
        console.warn(`Book Generation Attempt ${attempts} failed:`, err);
      }
    }

    if (generationIdRef.current !== currentGenId) {
      return; // User cancelled the generation by going back
    }

    if (finalParsedData) {
      setBookData(finalParsedData);
      setTopic(''); // Clear input after generating
      setCurrentPage(0);
      setChatMessages([]);
    } else {
      setError("The AI formatting failed after multiple attempts. Please try again with a slightly different topic.");
      skipNextPopState.current = true;
      window.history.back();
    }
    setLoading(false);
  };

  const handleBackClick = () => {
    const { bookData, loading, isAlreadySaved } = stateRef.current;
    if (bookData && !isAlreadySaved) {
      setShowSavePrompt(true);
    } else if (bookData || loading) {
      window.history.back(); // Invokes the robust hardware-back logic via popstate
    } else {
      navigate('/dashboard');
    }
  };

  const handleDiscardAndLeave = () => {
    setShowSavePrompt(false);
    setBookData(null);
    setCurrentPage(0);
    setChatMessages([]);
    skipNextPopState.current = true;
    window.history.back();
  };

  const handleSaveAndLeave = () => {
    handleSaveBook();
    setShowSavePrompt(false);
    setBookData(null);
    setCurrentPage(0);
    setChatMessages([]);
    skipNextPopState.current = true;
    window.history.back();
  };

  const handleSaveBook = () => {
    if (!bookData || !bookTopic) return;
    
    setSavedBooks(prevSavedBooks => {
      const isAlreadyInLibrary = prevSavedBooks.some(book => book.topic.toLowerCase() === bookTopic.toLowerCase());
      
      let updatedSavedBooks;
      if (isAlreadyInLibrary) {
        // If already saved, remove it (toggle off)
        updatedSavedBooks = prevSavedBooks.filter(book => book.topic.toLowerCase() !== bookTopic.toLowerCase());
      } else {
        // If not saved, add it to the beginning of the array
        const newSavedBook = {
          id: Date.now(),
          topic: bookTopic,
          bookData: bookData,
          coverImage: coverImage
        };
        updatedSavedBooks = [newSavedBook, ...prevSavedBooks];
      }
      
      // Persist the updated list to localStorage
      localStorage.setItem('farmCap_saved_books', JSON.stringify(updatedSavedBooks));
      
      // Return the new state
      return updatedSavedBooks;
    });
  };

  const handleChatSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!userQuestion.trim() || isChatLoading) return;

    const question = userQuestion;
    const newUserMessage = { id: Date.now(), sender: 'user', text: question };
    setChatMessages(prev => [...prev, newUserMessage]); // This is correct
    setIsChatLoading(true);
    setUserQuestion('');

    const bookContent = bookData.map(p => `Chapter: ${p.chapter_title}\nContent: ${p.page_content}`).join('\n\n');

    const systemPrompt = `
      You are an expert agricultural AI assistant. The user has just read a book about "${bookTopic}" that you generated for them. They have a follow-up question. Your primary goal is to answer based on the provided book content. This includes answering direct questions AND interpreting conceptual or indirect themes (like the moral of a story).

      First, analyze the user's question and determine if the answer can be derived from the provided book context, either directly or conceptually.

      Respond ONLY with a valid JSON object with two keys: "inBook" (boolean) and "answer" (string). Do not add any markdown.

      - If the answer IS in the book context (directly or conceptually), set "inBook" to true and provide a comprehensive answer in the "answer" field.
      - If the answer IS NOT in the book context, set "inBook" to false and set the "answer" field to: "I'm sorry, that information is not covered in this guide. Would you like me to search for an answer outside of this book?"

      The answer must be in the ${language} language.

      --- BOOK CONTEXT START ---
      ${bookContent}
      --- BOOK CONTEXT END ---
    `;

    try {
      const result = await callAIWithTimeout(systemPrompt, `User's Question: ${question}`);
      let aiResponseMessage;

      if (result.success) {
        try {
          const cleanJsonStr = result.data.replace(/```json/gi, '').replace(/```/gi, '').trim();
          const parsed = JSON.parse(cleanJsonStr);
          
          if (parsed.inBook) {
            aiResponseMessage = { id: Date.now() + 1, sender: 'ai', text: parsed.answer };
          } else {
            // Not in book, make it expandable
            aiResponseMessage = { 
              id: Date.now() + 1, 
              sender: 'ai',
              text: parsed.answer,
              expandable: true,
              originalQuestion: question // Store the original question
            };
          }
        } catch (e) {
          // If JSON parsing fails, just show the raw text as a fallback.
          aiResponseMessage = { id: Date.now() + 1, sender: 'ai', text: result.data };
        }
      } else {
        aiResponseMessage = { id: Date.now() + 1, sender: 'ai', text: "I'm sorry, I encountered an error and can't answer right now." };
      }
      
      setChatMessages(prev => [...prev, aiResponseMessage]);

    } catch (err) {
      console.error("Chat Error:", err);
      const newAiMessage = { id: Date.now() + 1, sender: 'ai', text: "There was a problem connecting to the AI. Please check your connection." };
      setChatMessages(prev => [...prev, newAiMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleOutOfBookAnswer = async (question, messageId) => {
    // Set loading state for the specific message to be replaced
    setChatMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, text: 'Searching outside the book...', expandable: false, isLoading: true } : msg
    ));

    const systemPrompt = `
      You are an expert agricultural AI assistant.
      The user was reading a book about "${bookTopic}" and asked a follow-up question that was not in the book.
      Please provide a comprehensive and helpful answer to the user's question.
      The answer must be in the ${language} language.
    `;

    try {
      const result = await callAIWithTimeout(systemPrompt, `User's Question: ${question}`);
      const newAnswer = result.success ? result.data : "I'm sorry, I encountered an error while searching for more information.";

      // Update the message with the final answer, replacing the old one
      setChatMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, text: newAnswer, isLoading: false } : msg
      ));
    } catch (err) {
      console.error("Out of book chat error:", err);
      setChatMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, text: "Failed to connect to the AI for more information.", isLoading: false } : msg
      ));
    }
  };

  const glassInputStyle = {
    width: '100%',
    background: 'rgba(0, 0, 0, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderTop: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '16px',
    padding: '16px 20px',
    color: '#fff',
    fontSize: '15px',
    fontWeight: '500',
    outline: 'none',
    boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.15)',
    boxSizing: 'border-box',
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    transition: 'all 0.3s ease'
  };

  const labelStyle = { display: 'block', fontSize: '12px', color: 'rgba(255, 255, 255, 0.9)', fontWeight: '700', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px', textShadow: '0 1px 2px rgba(0,0,0,0.5)' };

  const glassCardStyle = {
    background: 'transparent',
    backdropFilter: 'blur(16px) saturate(120%) brightness(110%)',
    WebkitBackdropFilter: 'blur(16px) saturate(120%) brightness(110%)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderTop: '1px solid rgba(255, 255, 255, 0.3)',
    borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.3), 0 8px 32px rgba(0, 0, 0, 0.15)',
    borderRadius: '24px',
    padding: '25px',
    boxSizing: 'border-box',
    width: '100%',
    maxWidth: '500px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s ease'
  };

  const glassHeaderStyle = {
    background: 'transparent', 
    backdropFilter: 'blur(16px) saturate(120%) brightness(110%)', 
    WebkitBackdropFilter: 'blur(16px) saturate(120%) brightness(110%)', 
    border: '1px solid rgba(255, 255, 255, 0.1)', 
    borderTop: '1px solid rgba(255, 255, 255, 0.3)', 
    borderLeft: '1px solid rgba(255, 255, 255, 0.2)', 
    boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.3), 0 8px 32px rgba(0,0,0,0.15)', 
    padding: '12px 15px', 
    borderRadius: '20px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    marginBottom: '20px', 
    flexShrink: 0, 
    maxWidth: '500px', 
    width: '100%', 
    margin: '0 auto 20px auto', 
    boxSizing: 'border-box'
  };

  const optionStyle = { background: '#1e1e24', color: '#fff' };

  return (
    <div style={{ position: 'fixed', inset: 0, fontFamily: '"SF Pro Display", system-ui, sans-serif' }}>
      {/* Sharp Global Background via IMG tag like Weather.jsx */}
      <img 
        src="https://images.pexels.com/photos/158163/clouds-cloudporn-weather-lookup-158163.jpeg" 
        alt="Library Background" 
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: -2 }} 
      />
      {/* Dim Overlay */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.1)', zIndex: -1 }}></div>
      
      <div style={{ 
        position: 'relative',
      padding: '20px 15px', 
        height: '100%',
      overflowY: (bookData || loading) ? 'hidden' : 'auto',
      overflowX: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
    }}>
      <style>{`
        @keyframes border-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
      <style>{`.spinner { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header Container (Hidden when reading) */}
      {!bookData && (
        <div style={glassHeaderStyle}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', overflow: 'hidden' }}>
              <button onClick={handleBackClick} style={{ position: 'absolute', left: 0, background:'none', border:'none', cursor:'pointer', padding: 0, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                <IoMdArrowBack size={26} color="#fff"/>
              </button>
              <h1 style={{ color: '#fff', margin: 0, fontSize: '18px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: '700', textShadow: '0 2px 4px rgba(0,0,0,0.5)', textAlign: 'center' }}>AI Farm Library 📚</h1>
            </div>
        </div>
      )}

      {/* Main Content Container (Glass card removed when viewing book for a cleaner look) */}
        <div style={{
        ...(bookData && !loading ? {} : glassCardStyle),
        padding: (bookData && !loading) ? '0' : '25px',
        background: (bookData && !loading) ? 'transparent' : glassCardStyle.background,
        border: (bookData && !loading) ? 'none' : glassCardStyle.border,
        boxShadow: (bookData && !loading) ? 'none' : glassCardStyle.boxShadow,
        backdropFilter: (bookData && !loading) ? 'none' : glassCardStyle.backdropFilter,
        WebkitBackdropFilter: (bookData && !loading) ? 'none' : glassCardStyle.WebkitBackdropFilter,
        flex: (bookData && !loading) ? 1 : 'none', 
        margin: '0 auto',
        boxSizing: 'border-box'
      }}>

        {/* Input Section - The "Librarian" */}
        {!bookData && !loading && (
          <div>
            <h2 style={{ fontSize: '22px', margin: '0 0 5px 0', color: '#fff', fontWeight: '700', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Build Your Custom Guide</h2>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.9)', marginBottom: '25px', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>Set your preferences and let AI write a personalized book.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                  <label style={labelStyle}>What is the topic?</label>
                  <input type="text" placeholder="e.g. Organic pest control for rice" value={topic} onChange={(e) => setTopic(e.target.value)} style={glassInputStyle} />
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ flex: 1, position: 'relative' }}>
                      <label style={labelStyle}>Length</label>
                      <select value={bookLength} onChange={(e) => setBookLength(e.target.value)} style={glassInputStyle}>
                          <option value="Short (5 Pages)" style={optionStyle}>Short (~5 Pages)</option>
                          <option value="Standard (10 Pages)" style={optionStyle}>Standard (~10 Pages)</option>
                          <option value="In-Depth (20 Pages)" style={optionStyle}>In-Depth (~20 Pages)</option>
                      </select>
                      <IoIosArrowDown size={20} color="#fff" style={{ position: 'absolute', right: '16px', top: '40px', pointerEvents: 'none' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Chapters: {chapters}</label>
                      <input type="range" min="1" max="5" value={chapters} onChange={(e) => setChapters(parseInt(e.target.value))} style={{ width: '100%', height: '5px', borderRadius: '5px', outline: 'none', accentColor: '#4db6ac', marginTop: '16px' }} />
                  </div>
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ flex: 1, position: 'relative' }}>
                      <label style={labelStyle}>Writing Style</label>
                      <select value={contentStyle} onChange={(e) => setContentStyle(e.target.value)} style={glassInputStyle}>
                          <option value="Educational (Science & Theory)" style={optionStyle}>Educational (Theory)</option>
                          <option value="Practical Advice (Step-by-step)" style={optionStyle}>Practical (How-To)</option>
                          <option value="Story Mode (Narrative)" style={optionStyle}>Story Mode</option>
                          <option value="Custom Instruction" style={optionStyle}>Custom</option>
                      </select>
                      <IoIosArrowDown size={20} color="#fff" style={{ position: 'absolute', right: '16px', top: '40px', pointerEvents: 'none' }} />
                  </div>
                  <div style={{ flex: 1, position: 'relative' }}>
                      <label style={labelStyle}>Language</label>
                      <select value={language} onChange={(e) => setLanguage(e.target.value)} style={glassInputStyle}>
                          <option value="English" style={optionStyle}>English</option>
                          <option value="Hindi" style={optionStyle}>Hindi</option>
                          <option value="Telugu" style={optionStyle}>Telugu</option>
                          <option value="Tamil" style={optionStyle}>Tamil</option>
                          <option value="Marathi" style={optionStyle}>Marathi</option>
                          <option value="Gujarati" style={optionStyle}>Gujarati</option>
                          <option value="Kannada" style={optionStyle}>Kannada</option>
                      </select>
                      <IoIosArrowDown size={20} color="#fff" style={{ position: 'absolute', right: '16px', top: '40px', pointerEvents: 'none' }} />
                  </div>
              </div>

              {contentStyle === 'Custom Instruction' && (
                  <div>
                      <label style={labelStyle}>Custom Instructions</label>
                      <input type="text" placeholder="e.g. Explain it like a bedtime story..." value={customStyle} onChange={(e) => setCustomStyle(e.target.value)} style={glassInputStyle} />
                  </div>
              )}

              <button onClick={generateBook} style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, #34d399 0%, #059669 100%)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderTop: '1px solid rgba(255,255,255,0.4)', borderRadius: '16px', fontWeight: '800', fontSize: '16px', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 8px 25px rgba(5, 150, 105, 0.4), inset 0 1px 2px rgba(255,255,255,0.4)', marginTop: '10px' }}>
                  🚀 Generate My Book
              </button>
            
            {error && <p style={{ color: '#d32f2f', fontSize: '14px', marginTop: '10px' }}>{error}</p>}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', color: '#fff', padding: '50px 0' }}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '56px', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))' }}>🧢</div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#fff', letterSpacing: '1px', marginTop: '10px' }}>FARMCAP</div>
            </div>
            <h3 style={{marginBottom: '10px', color: '#fff'}}>Writing your custom book...</h3>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>Consulting AI models for the best farming practices...</p>
            <div style={{ marginTop: '25px', padding: '15px 25px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '16px', display: 'inline-block', background: 'rgba(0,0,0,0.3)', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.2)' }}>
              <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>Estimated time remaining:</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '26px', fontWeight: '800', color: '#4db6ac' }}>
                {countdown} seconds
              </p>
            </div>
            <div style={{ fontSize: '11px', color: '#ff8a80', fontWeight: '600', lineHeight: '1.5', padding: '12px', marginTop: '30px', border: '1px solid rgba(255, 138, 128, 0.3)', borderRadius: '12px', background: 'rgba(255, 138, 128, 0.1)', textAlign: 'left', maxWidth: '400px', margin: '30px auto 0' }}>
              Disclaimer: These are books generated by the AI. Please check before taking any steps based on this, as AI can make mistakes. You have the responsibility to check, and the app and its owners are not responsible for any loss of money or crop.
            </div>
          </div>
        )}

        {/* Book Rendering State */}
        {bookData && !loading && (
          <KindleStyleViewer 
            bookData={bookData}
            bookTopic={bookTopic}
            coverImage={coverImage}
            theme={theme}
            setTheme={setTheme}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            handlePrevPage={handlePrevPage}
            handleNextPage={handleNextPage}
            swipeHandlers={swipeHandlers}
            toggleControls={toggleControls}
            showControls={showControls}
            setShowControls={setShowControls}
            showGridView={showGridView}
            setShowGridView={setShowGridView}
            setIsChatModalOpen={setIsChatModalOpen}
            handleBackClick={handleBackClick}
            toggleSpeech={toggleSpeech}
            isSpeaking={isSpeaking}
            handleSaveBook={handleSaveBook}
            isAlreadySaved={isAlreadySaved}
            fontSize={fontSize}
            setFontSize={setFontSize}
          />
        )}
      </div>

      {!bookData && !loading && (
        <>
        {/* Search History Dropdown */}
        <div style={{ background: 'transparent', backdropFilter: 'blur(16px) saturate(120%) brightness(110%)', WebkitBackdropFilter: 'blur(16px) saturate(120%) brightness(110%)', border: '1px solid rgba(255, 255, 255, 0.1)', borderTop: '1px solid rgba(255, 255, 255, 0.3)', borderLeft: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '24px', overflow: 'hidden', boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.3), 0 8px 32px rgba(0,0,0,0.15)', maxWidth: '500px', width: '100%', margin: '20px auto 0 auto', flexShrink: 0 }}>
          <button 
            onClick={() => setIsHistoryOpen(!isHistoryOpen)} 
            style={{ width: '100%', padding: '16px 20px', background: 'transparent', border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontSize: '15px', fontWeight: '700', color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
          > 
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🕒</span>
              <span>Recent Topics</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {isHistoryOpen ? <IoIosArrowUp size={20} /> : <IoIosArrowDown size={20} />}
            </div>
          </button>
          
          {isHistoryOpen && (
            <div style={{ padding: '0 20px 15px 20px', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '250px', overflowY: 'auto' }}>
              {searchHistory.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '4px' }}>
                  <span onClick={(e) => { e.stopPropagation(); setSearchHistory([]); localStorage.removeItem('farmCap_library_history'); }} style={{ fontSize: '11px', color: '#ff8a80', cursor: 'pointer', background: 'rgba(211, 47, 47, 0.2)', padding: '5px 12px', borderRadius: '16px', border: '1px solid rgba(211, 47, 47, 0.4)' }}>Clear All</span>
                </div>
              )}
              {searchHistory.length > 0 ? (
                searchHistory.map((item, idx) => (
                  <div 
                    key={`${item}-${idx}`} 
                    onClick={() => { setTopic(item); window.scrollTo({ top: 0, behavior: 'smooth' }); setIsHistoryOpen(false); }} 
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 15px', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', transition: 'background 0.2s', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.15)', textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}
                  >
                    <div>🔍 {item}</div>
                    <IoMdTrash size={18} color="#ff8a80" onClick={(e) => {
                      e.stopPropagation();
                      const newHistory = searchHistory.filter((_, i) => i !== idx);
                      setSearchHistory(newHistory);
                      localStorage.setItem('farmCap_library_history', JSON.stringify(newHistory));
                    }} style={{ opacity: 0.8 }} onMouseOver={e => e.target.style.opacity = 1} onMouseOut={e => e.target.style.opacity = 0.8} />
                  </div>
                ))
              ) : (
                <div style={{ color: '#aaa', fontSize: '14px', textAlign: 'center', padding: '10px' }}>
                  You don't have any recent searches.
                </div>
              )}
            </div>
          )}
        </div>

      {/* Saved Books Dropdown */}
        <div style={{ background: 'transparent', backdropFilter: 'blur(16px) saturate(120%) brightness(110%)', WebkitBackdropFilter: 'blur(16px) saturate(120%) brightness(110%)', border: '1px solid rgba(255, 255, 255, 0.1)', borderTop: '1px solid rgba(255, 255, 255, 0.3)', borderLeft: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '24px', overflow: 'hidden', boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.3), 0 8px 32px rgba(0,0,0,0.15)', maxWidth: '500px', width: '100%', margin: '20px auto 20px auto', flexShrink: 0 }}>
          <button 
            onClick={() => setIsSavedBooksOpen(!isSavedBooksOpen)} 
            style={{ width: '100%', padding: '16px 20px', background: 'transparent', border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontSize: '15px', fontWeight: '700', color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📚</span>
              <span>Saved Books</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {isSavedBooksOpen ? <IoIosArrowUp size={20} /> : <IoIosArrowDown size={20} />}
            </div>
          </button>
          
          {isSavedBooksOpen && (
            <div style={{ padding: '0 20px 15px 20px', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '250px', overflowY: 'auto' }}>
              {savedBooks.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '4px' }}>
                  <span onClick={(e) => { e.stopPropagation(); setSavedBooks([]); localStorage.removeItem('farmCap_saved_books'); }} style={{ fontSize: '11px', color: '#ff8a80', cursor: 'pointer', background: 'rgba(211, 47, 47, 0.2)', padding: '5px 12px', borderRadius: '16px', border: '1px solid rgba(211, 47, 47, 0.4)' }}>Clear All</span>
                </div>
              )}
              {savedBooks.length > 0 ? (
                savedBooks.map((book) => ( 
                  <div key={book.id} onClick={() => { setBookData(book.bookData); setBookTopic(book.topic); setCoverImage(book.coverImage || null); setCurrentPage(0); setChatMessages([]); setIsSavedBooksOpen(false); window.history.pushState({ isSubView: true }, ''); }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 15px', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', transition: 'background 0.2s', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.15)', textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>
                    <div>📖 {book.topic}</div>
                    <IoMdTrash size={18} color="#ff8a80" onClick={(e) => {
                      e.stopPropagation();
                      const newBooks = savedBooks.filter(b => b.id !== book.id);
                      setSavedBooks(newBooks);
                      localStorage.setItem('farmCap_saved_books', JSON.stringify(newBooks));
                    }} style={{ opacity: 0.8 }} onMouseOver={e => e.target.style.opacity = 1} onMouseOut={e => e.target.style.opacity = 0.8} />
                  </div>
                ))
              ) : (
                <div style={{ color: '#aaa', fontSize: '14px', textAlign: 'center', padding: '10px' }}>
                  You don't have any saved books.
                </div>
              )}
            </div>
          )}
        </div>
        </>
      )}

      {/* Chat Modal */}
      <ChatModal
        show={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
        theme={theme}
        chatMessages={chatMessages}
        isChatLoading={isChatLoading}
        userQuestion={userQuestion}
        setUserQuestion={setUserQuestion}
        handleChatSubmit={handleChatSubmit}
        handleOutOfBookAnswer={handleOutOfBookAnswer}
        chatContainerRef={chatContainerRef}
        language={language}
      />

      {/* Unsaved Changes Prompt */}
      <AnimatePresence>
        {showSavePrompt && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              style={{ background: theme === 'dark' ? '#18181b' : '#fff', padding: '25px', borderRadius: '24px', width: '90%', maxWidth: '340px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)' }}
            >
              <div style={{ fontSize: '40px', margin: '0 0 10px 0' }}>⚠️</div>
              <h3 style={{ margin: '0 0 10px 0', color: theme === 'dark' ? '#fff' : '#000' }}>Save before leaving?</h3>
              <p style={{ color: theme === 'dark' ? '#aaa' : '#666', fontSize: '14px', marginBottom: '20px', lineHeight: '1.5' }}>
                You haven't saved <strong>"{bookTopic}"</strong>. It takes time to generate these books. Do you want to save it to your library?
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button onClick={handleSaveAndLeave} style={{ background: theme === 'dark' ? '#4db6ac' : '#00695c', color: theme === 'dark' ? '#000' : '#fff', border: 'none', padding: '14px', borderRadius: '16px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>💾 Save Book & Leave</button>
                <button onClick={handleDiscardAndLeave} style={{ background: 'rgba(211, 47, 47, 0.1)', color: '#ef4444', border: '1px solid rgba(211, 47, 47, 0.3)', padding: '14px', borderRadius: '16px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}>🗑️ Discard</button>
                <button onClick={() => setShowSavePrompt(false)} style={{ background: 'transparent', color: theme === 'dark' ? '#888' : '#aaa', border: 'none', padding: '10px', fontSize: '14px', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </div>
  );
};

const KindleStyleViewer = ({ bookData, bookTopic, coverImage, theme, setTheme, currentPage, setCurrentPage, totalPages, handlePrevPage, handleNextPage, swipeHandlers, showControls, setShowControls, showGridView, setShowGridView, setIsChatModalOpen, handleBackClick, toggleSpeech, isSpeaking, handleSaveBook, isAlreadySaved, fontSize, setFontSize }) => {
  const isDark = theme === 'dark';

  const pinchRef = useRef({ startDist: 0, startFontSize: 16 });

  const getDistance = (touches) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      pinchRef.current.startDist = getDistance(e.touches);
      pinchRef.current.startFontSize = fontSize;
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && pinchRef.current.startDist > 0) {
      const currentDist = getDistance(e.touches);
      const scale = currentDist / pinchRef.current.startDist;
      
      const newFontSize = Math.max(12, Math.min(38, pinchRef.current.startFontSize * scale));
      setFontSize(Math.round(newFontSize));
    }
  };

  const handleTouchEnd = (e) => {
    if (e.touches.length < 2) {
      pinchRef.current.startDist = 0;
    }
  };

  const toggleControlsInternal = (e) => {
    if (e.target && typeof e.target.closest === 'function' && e.target.closest('.controls-ignore')) return;
    setShowControls(!showControls);
  };

  const renderCurrentPage = () => {
    if (currentPage === 0) {
      return (
        <PageCover theme={theme}>
          <div style={{
            width: '100%', height: '100%',
            backgroundImage: `url(${coverImage || ''})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end',
            padding: '30px', boxSizing: 'border-box', position: 'relative'
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)' }} />
            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', color: 'white' }}>
              <h1 style={{ fontSize: '32px', textShadow: '0 2px 5px rgba(0,0,0,0.7)', margin: '0 0 10px 0', lineHeight: '1.2' }}>{bookTopic}</h1>
              <p style={{ fontStyle: 'italic', opacity: 0.9, margin: 0 }}>A FarmCap AI Guide</p>
            </div>
          </div>
        </PageCover>
      );
    }
    if (currentPage === 1) {
      const toc = [];
      let currentChap = "";
      bookData.forEach((page, index) => {
        const chapterBaseTitle = page.chapter_title.replace(/\s*\(?(Part|Continued)[\s\d]*\)?/i, '').trim();
        if (chapterBaseTitle !== currentChap) {
          toc.push({ title: chapterBaseTitle, pageIndex: index + 2 });
          currentChap = chapterBaseTitle;
        }
      });

      return (
        <PageCover theme={theme}>
          <div style={{ padding: '30px 20px', width: '100%', height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', background: isDark ? '#18181b' : '#fff' }}>
            <h2 style={{ fontSize: `${Math.max(20, fontSize + 4)}px`, color: isDark ? '#fff' : '#111', borderBottom: `2px solid ${isDark ? '#4db6ac' : '#00695c'}`, paddingBottom: '10px', marginBottom: '20px', fontFamily: "Georgia, 'Times New Roman', serif" }}>Table of Contents</h2>
            <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto' }}>
              {toc.map((item, i) => (
                <div key={i} onClick={(e) => { e.stopPropagation(); setCurrentPage(item.pageIndex); }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: isDark ? '1px dashed rgba(255,255,255,0.1)' : '1px dashed rgba(0,0,0,0.1)', cursor: 'pointer' }} onMouseOver={(e) => e.currentTarget.style.opacity = 0.7} onMouseOut={(e) => e.currentTarget.style.opacity = 1}>
                  <span style={{ fontSize: '16px', fontWeight: 'bold', color: isDark ? '#b2dfdb' : '#004d40', fontFamily: "Georgia, 'Times New Roman', serif" }}>{item.title}</span>
                  <span style={{ fontSize: '14px', color: isDark ? '#fff' : '#000', fontFamily: "Georgia, 'Times New Roman', serif" }}>Page {item.pageIndex + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </PageCover>
      );
    }
    if (currentPage === totalPages - 1) {
      return (
        <PageCover theme={theme}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ color: isDark ? '#fff' : '#333', fontFamily: "Georgia, 'Times New Roman', serif" }}>The End</h2>
            <p style={{ color: isDark ? '#aaa' : '#666' }}>Happy Farming!</p>
          </div>
        </PageCover>
      );
    }
    const pageIndex = currentPage - 2;
    const page = bookData[pageIndex];
    if (!page) return <Page number={currentPage} title="Page not found" theme={theme} fontSize={fontSize}>This page could not be loaded.</Page>;
    return (
      <Page number={currentPage} title={page.chapter_title} theme={theme} fontSize={fontSize}>
        {page.page_content}
      </Page>
    );
  };

  const iconBtnStyle = { background: 'transparent', border: 'none', cursor: 'pointer', color: isDark ? '#fff' : '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px' };

  return (
    <div 
      {...swipeHandlers} 
      style={{
        position: 'fixed', inset: 0, zIndex: 1000, 
        background: isDark ? '#000' : '#f4f4f4', 
        display: 'flex', flexDirection: 'column'
      }}
    >
      {/* TOP CONTROLS */}
      <AnimatePresence>
        {showControls && (
          <motion.div 
            initial={{ y: -80 }} animate={{ y: 0 }} exit={{ y: -80 }} transition={{ type: 'tween', duration: 0.2 }}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '70px', background: isDark ? '#1a1a1a' : '#fff', zIndex: 1010, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
            className="controls-ignore"
          >
            <button onClick={handleBackClick} style={iconBtnStyle}><IoMdArrowBack size={26}/></button>
            <div style={{ display: 'flex', gap: '5px' }}>
              <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} style={iconBtnStyle} title="Toggle Theme">
                {theme === 'light' ? <IoMdMoon size={24} /> : <IoMdSunny size={24} />}
              </button>
              <button onClick={toggleSpeech} style={iconBtnStyle} title="Read Aloud">{isSpeaking ? <IoMdVolumeHigh size={24} color="#4db6ac"/> : <IoMdVolumeOff size={24}/>}</button>
              <button onClick={handleSaveBook} style={iconBtnStyle} title="Save Book">{isAlreadySaved ? <IoMdBookmark size={24} color="#ef4444"/> : <IoMdBookmark size={24} color="rgba(128,128,128,0.5)"/>}</button>
              <button onClick={() => setIsChatModalOpen(true)} style={iconBtnStyle} title="Ask AI"><IoMdChatbubbles size={24}/></button>
              <button onClick={() => setShowGridView(true)} style={iconBtnStyle} title="Grid View"><IoMdGrid size={24}/></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN PAGE CONTENT (SCALES ON CLICK) */}
      <div 
        style={{ flex: 1, perspective: '1000px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', touchAction: 'pan-y' }} 
        onClick={toggleControlsInternal}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, x: 20 }}
          animate={{ 
            opacity: 1, 
            x: 0,
            scale: showControls ? 0.85 : 1, 
            y: showControls ? -15 : 0, 
            borderRadius: showControls ? '20px' : '0px',
            boxShadow: showControls ? '0 25px 50px -12px rgba(0,0,0,0.5)' : 'none'
          }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          style={{
            width: '100%',
            height: '100%',
            maxWidth: '600px',
            background: isDark ? '#18181b' : '#fff',
            overflow: 'hidden',
            cursor: showControls ? 'pointer' : 'default'
          }}>
          {renderCurrentPage()}
        </motion.div>
      </div>

      {/* BOTTOM SLIDER CONTROLS */}
      <AnimatePresence>
        {showControls && (
          <motion.div 
            initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} transition={{ type: 'tween', duration: 0.2 }}
            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: isDark ? '#1a1a1a' : '#fff', zIndex: 1010, padding: '20px 25px', boxShadow: '0 -4px 15px rgba(0,0,0,0.1)' }} 
            className="controls-ignore"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px', fontSize: '14px', fontWeight: 'bold', color: isDark ? '#aaa' : '#555' }}>
               Page {currentPage + 1} of {Math.max(1, totalPages)}
            </div>
            <input
              type="range" min="0" max={Math.max(0, totalPages - 1)} value={currentPage}
              onChange={(e) => setCurrentPage(parseInt(e.target.value, 10))}
              style={{ width: '100%', accentColor: isDark ? '#4db6ac' : '#00695c' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* TINY READING FOOTER (HIDDEN WHEN CONTROLS ACTIVE) */}
      <AnimatePresence>
        {!showControls && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'absolute', bottom: '15px', left: '20px', fontSize: '11px', color: '#888', pointerEvents: 'none' }}>
            Page {currentPage + 1}
          </motion.div>
        )}
      </AnimatePresence>

      <GridViewModal 
        show={showGridView} 
        onClose={() => setShowGridView(false)} 
        bookData={bookData} 
        bookTopic={bookTopic} 
        coverImage={coverImage} 
        theme={theme} 
        setCurrentPage={setCurrentPage} 
      />
    </div>
  );
};

const GridViewModal = ({ show, onClose, bookData, bookTopic, coverImage, theme, setCurrentPage }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(20px) saturate(200%)', WebkitBackdropFilter: 'blur(20px) saturate(200%)', zIndex: 1000, display: 'flex', flexDirection: 'column' }}
        onClick={onClose}
      >
        <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: theme === 'dark' ? 'rgba(20,20,25,0.6)' : 'rgba(255,255,255,0.4)', borderBottom: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.4)' }}>
          <h3 style={{ margin: 0, color: theme === 'dark' ? '#fff' : '#000' }}>Page Layouts</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: theme === 'dark' ? '#fff' : '#000' }}><IoMdClose size={24} /></button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '15px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '15px' }}>
          {/* Cover */}
          <div onClick={() => { setCurrentPage(0); onClose(); }} style={{ cursor: 'pointer', border: `2px solid ${theme === 'dark' ? '#4db6ac' : '#00695c'}`, borderRadius: '16px', padding: '15px', background: theme === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.6)', backdropFilter: 'blur(10px)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold' }}>Cover</div>
            {coverImage ? (
              <img src={coverImage} alt="Cover" style={{ width: '60px', height: '80px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px' }} />
            ) : (
              <div style={{ fontSize: '24px', margin: '10px 0' }}>🌱</div>
            )}
            <div style={{ fontSize: '10px', color: '#888' }}>Page 1</div>
          </div>

          {/* ToC */}
          <div onClick={() => { setCurrentPage(1); onClose(); }} style={{ cursor: 'pointer', border: theme === 'dark' ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.6)', borderRadius: '16px', padding: '15px', background: theme === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.6)', backdropFilter: 'blur(10px)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold' }}>Contents</div>
            <div style={{ fontSize: '24px', margin: '10px 0' }}>📑</div>
            <div style={{ fontSize: '10px', color: '#888' }}>Page 2</div>
          </div>

          {/* Pages */}
          {bookData.map((page, index) => (
            <div key={index} onClick={() => { setCurrentPage(index + 2); onClose(); }} style={{ cursor: 'pointer', border: theme === 'dark' ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.6)', borderRadius: '16px', padding: '15px', background: theme === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.6)', backdropFilter: 'blur(10px)' }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{page.chapter_title}</div>
              <div style={{ fontSize: '10px', color: '#888', marginTop: '5px' }}>Page {index + 3}</div>
            </div>
          ))}
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

const ChatModal = ({ show, onClose, theme, chatMessages, isChatLoading, userQuestion, setUserQuestion, handleChatSubmit, handleOutOfBookAnswer, chatContainerRef, language }) => {
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support speech recognition.");
      return;
    }
    const recognition = new SpeechRecognition();
    
    const langCodeMap = {
      'Hindi': 'hi-IN', 'Telugu': 'te-IN', 'Tamil': 'ta-IN',
      'Marathi': 'mr-IN', 'Gujarati': 'gu-IN', 'Kannada': 'kn-IN', 'English': 'en-IN'
    };
    recognition.lang = langCodeMap[language] || 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setUserQuestion(prev => prev ? prev + ' ' + transcript : transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  return (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: '0%' }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', bounce: 0.1, duration: 0.4 }}
          style={{ width: '100%', maxWidth: '500px', height: '75vh', background: theme === 'dark' ? 'linear-gradient(135deg, rgba(30, 30, 35, 0.75) 0%, rgba(10, 10, 15, 0.85) 100%)' : 'linear-gradient(135deg, rgba(255, 255, 255, 0.65) 0%, rgba(255, 255, 255, 0.35) 100%)', backdropFilter: 'blur(25px) saturate(200%)', WebkitBackdropFilter: 'blur(25px) saturate(200%)', borderTop: theme === 'dark' ? '1.5px solid rgba(255,255,255,0.3)' : '1.5px solid rgba(255,255,255,0.8)', borderLeft: theme === 'dark' ? '1.5px solid rgba(255,255,255,0.2)' : '1.5px solid rgba(255,255,255,0.5)', borderRight: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.4)', borderTopLeftRadius: '36px', borderTopRightRadius: '36px', display: 'flex', flexDirection: 'column', boxShadow: '0 -20px 50px rgba(0,0,0,0.4), inset 0 2px 5px rgba(255,255,255,0.3)' }}
          onClick={e => e.stopPropagation()}
        > 
          {/* Header */}
          <div style={{ padding: '20px 25px', borderBottom: theme === 'dark' ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', borderTopLeftRadius: '36px', borderTopRightRadius: '36px' }}>
            <h3 style={{ margin: 0, color: theme === 'dark' ? '#fff' : '#000', fontSize: '16px', fontWeight: '600', flexGrow: 1, textAlign: 'center' }}>Ask AI About This Book</h3>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', color: theme === 'dark' ? '#fff' : '#000', cursor: 'pointer', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IoMdClose size={20} /></button>
          </div>

          {/* Messages */}
          <div ref={chatContainerRef} style={{ flex: 1, overflowY: 'auto', padding: '15px' }}>
            <p style={{ fontSize: '13px', color: theme === 'dark' ? '#bbb' : '#666', textAlign: 'center', marginBottom: '15px' }}>
              Ask about this book. If you want, you can ask from out of the book.
            </p>
            {chatMessages.map(msg => (
              <div key={msg.id} style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start', marginBottom: '12px' }}>
                <div style={{
                  background: msg.sender === 'user' ? (theme === 'dark' ? 'rgba(77, 182, 172, 0.85)' : 'rgba(0, 105, 92, 0.85)') : (theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.7)'),
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.4)',
                  color: msg.sender === 'user' ? (theme === 'dark' ? '#000' : '#fff') : (theme === 'dark' ? '#fff' : '#000'),
                  padding: '10px 15px',
                  borderRadius: '20px',
                  maxWidth: '85%',
                  lineHeight: '1.5',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15), inset 0 1px 2px rgba(255,255,255,0.2)'
                }}>
                  {msg.isLoading ? (
                     <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div className="spinner"></div><span>Searching...</span></div>
                  ) : (
                    msg.text
                  )}
                  {msg.expandable && (
                    <button 
                      onClick={() => handleOutOfBookAnswer(msg.originalQuestion, msg.id)}
                      style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)', color: theme === 'dark' ? 'white' : 'black', border: theme === 'dark' ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(0,0,0,0.15)', borderTop: theme === 'dark' ? '1.5px solid rgba(255,255,255,0.4)' : '1.5px solid rgba(0,0,0,0.2)', borderRadius: '12px', padding: '10px 14px', marginTop: '12px', cursor: 'pointer', width: '100%', fontWeight: '700', backdropFilter: 'blur(10px)', boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }}
                    >
                      Search Outside Book
                    </button>
                  )}
                </div>
              </div>
            ))}
            {isChatLoading && <div style={{ display: 'flex', justifyContent: 'flex-start' }}><div style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.8)', backdropFilter: 'blur(15px)', border: theme === 'dark' ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.6)', color: theme === 'dark' ? '#fff' : '#000', padding: '10px 15px', borderRadius: '20px', boxShadow: '0 8px 25px rgba(0,0,0,0.15), inset 0 1px 2px rgba(255,255,255,0.2)' }}>Thinking...</div></div>}
          </div>

          {/* Input Form */}
          <form onSubmit={handleChatSubmit} style={{ padding: '15px', borderTop: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)', display: 'flex', gap: '10px', background: 'transparent', alignItems: 'center' }}>
            <button 
              type="button" 
              onClick={startListening}
              style={{ background: isListening ? '#d32f2f' : (theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.4)'), border: theme === 'dark' ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(255,255,255,0.6)', color: isListening ? 'white' : (theme === 'dark' ? '#fff' : '#000'), width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.3s', flexShrink: 0, backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
            >
              {isListening ? <IoMdMicOff size={20} /> : <IoMdMic size={20} />}
            </button>
            <input type="text" value={userQuestion} onChange={(e) => setUserQuestion(e.target.value)} placeholder="Ask a question..." style={{ flex: 1, padding: '14px 18px', borderRadius: '30px', border: '1px solid rgba(255, 255, 255, 0.2)', borderTop: '1.5px solid rgba(255, 255, 255, 0.4)', borderLeft: '1.5px solid rgba(255, 255, 255, 0.3)', background: 'rgba(0,0,0,0.1)', color: theme === 'dark' ? '#fff' : '#000', outline: 'none', backdropFilter: 'blur(16px) saturate(150%)', WebkitBackdropFilter: 'blur(16px) saturate(150%)', boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.2), 0 4px 15px rgba(0,0,0,0.1)' }} />
            <button type="submit" style={{ background: theme === 'dark' ? 'linear-gradient(135deg, rgba(77, 182, 172, 0.9) 0%, rgba(0, 105, 92, 0.9) 100%)' : 'linear-gradient(135deg, rgba(0, 105, 92, 0.9) 0%, rgba(0, 77, 64, 0.9) 100%)', border: theme === 'dark' ? '1.5px solid rgba(255,255,255,0.4)' : '1.5px solid rgba(255,255,255,0.6)', color: 'white', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 8px 20px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.5)', backdropFilter: 'blur(10px)' }}>
              <IoMdSend size={20} />
            </button>
          </form>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
  )
};

export default DigitalLibrary;