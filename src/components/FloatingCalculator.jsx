import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { IoMdClose, IoMdCalendar, IoMdCalculator } from 'react-icons/io';
import { FaBackspace, FaExpandAlt, FaCompressAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { MdAspectRatio } from 'react-icons/md'; 

const FloatingCalculator = () => {
  const location = useLocation();
  
  // --- GATEKEEPER ---
  if (!location.pathname.toLowerCase().includes('expenditure')) {
    return null;
  }

  // --- STATE ---
  // Start fully visible on screen
  const [position, setPosition] = useState({ x: window.innerWidth - 100, y: window.innerHeight - 200 });
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState('calc'); 
  
  // --- SIZING STATE ---
  const [presetIndex, setPresetIndex] = useState(1); 
  const presets = [0.85, 1];
  const [customScale, setCustomScale] = useState(null); 
  const scale = customScale || presets[presetIndex];

  // Drag Refs
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  
  // Resize Refs
  const isResizing = useRef(false);
  const resizeStart = useRef({ x: 0, y: 0, initialScale: 1 });

  // --- 1. SMOOTH DRAG LOGIC (Strict Boundaries) ---
  
  const handleDragStart = (e) => {
    if (e.target.closest('.resize-handle') || e.target.tagName === 'INPUT') {
        return;
    }
    
    isDragging.current = true;
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    dragOffset.current = { 
        x: clientX - position.x, 
        y: clientY - position.y 
    };

    if (e.touches) {
        window.addEventListener('touchmove', handleDragMove, { passive: false });
        window.addEventListener('touchend', handleDragEnd);
    } else {
        window.addEventListener('pointermove', handleDragMove);
        window.addEventListener('pointerup', handleDragEnd);
    }
  };

  const handleDragMove = (e) => {
    if (!isDragging.current) return;
    
    if (e.preventDefault) e.preventDefault(); 

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    let newX = clientX - dragOffset.current.x;
    let newY = clientY - dragOffset.current.y;
    
    // --- STRICT WALL BOUNDARIES ---
    // This ensures it never goes off screen (0 to Screen Width)
    const padding = 10; 
    const maxX = window.innerWidth - 60; // 60 is approx width of closed icon
    const maxY = window.innerHeight - 60;
    
    if (newX < padding) newX = padding; 
    if (newX > maxX) newX = maxX;
    if (newY < padding) newY = padding; 
    if (newY > maxY) newY = maxY;

    setPosition({ x: newX, y: newY });
  };

  const handleDragEnd = () => {
    isDragging.current = false;
    window.removeEventListener('pointermove', handleDragMove);
    window.removeEventListener('pointerup', handleDragEnd);
    window.removeEventListener('touchmove', handleDragMove);
    window.removeEventListener('touchend', handleDragEnd);
  };

  // --- 2. CUSTOM RESIZE LOGIC ---
  const handleResizeStart = (e) => {
      e.stopPropagation(); 
      e.preventDefault();
      isResizing.current = true;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      resizeStart.current = { x: clientX, initialScale: scale };
      
      window.addEventListener('pointermove', handleResizeMove);
      window.addEventListener('pointerup', handleResizeEnd);
      window.addEventListener('touchmove', handleResizeMove);
      window.addEventListener('touchend', handleResizeEnd);
  };

  const handleResizeMove = (e) => {
      if (!isResizing.current) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const deltaX = clientX - resizeStart.current.x;
      const scaleChange = deltaX / 300; 
      let newScale = resizeStart.current.initialScale + scaleChange;
      
      if (newScale < 0.6) newScale = 0.6;
      if (newScale > 2.0) newScale = 2.0;

      setCustomScale(newScale);
  };

  const handleResizeEnd = () => {
      isResizing.current = false;
      window.removeEventListener('pointermove', handleResizeMove);
      window.removeEventListener('pointerup', handleResizeEnd);
      window.removeEventListener('touchmove', handleResizeMove);
      window.removeEventListener('touchend', handleResizeEnd);
  };

  useEffect(() => {
      return () => {
          window.removeEventListener('pointermove', handleDragMove);
          window.removeEventListener('pointerup', handleDragEnd);
          window.removeEventListener('pointermove', handleResizeMove);
          window.removeEventListener('pointerup', handleResizeEnd);
      };
  }, []);

  const cyclePreset = () => {
      setCustomScale(null); 
      setPresetIndex((prev) => (prev + 1) % presets.length);
  };

  // --- RENDER ---
  return (
    <div
      style={{
          position: 'fixed', left: position.x, top: position.y, zIndex: 9999,
          touchAction: 'none', 
          transform: `scale(${isOpen ? scale : 1})`,
          transformOrigin: 'top right', 
          transition: (isDragging.current || isResizing.current) ? 'none' : 'transform 0.2s cubic-bezier(0.19, 1, 0.22, 1)',
      }}
      onPointerDown={handleDragStart}
      onTouchStart={handleDragStart}
    >
      
      {/* 🟠 1. CLOSED ICON (RESTORED OLD DOT GRID LOGO) */}
      {!isOpen && (
          <div 
              onClick={() => !isDragging.current && setIsOpen(true)}
              style={{
                  width: '60px', height: '60px', borderRadius: '14px',
                  background: '#000', boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
                  cursor: 'pointer', position:'relative', overflow:'hidden',
                  border: '1px solid rgba(255,255,255,0.15)',
                  display: 'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'
              }}
          >
              <div style={{display: 'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'4px', width:'fit-content', marginTop:'10px'}}>
                 <Dot color="#A5A5A5" /><Dot color="#A5A5A5" /><Dot color="#A5A5A5" /><Dot color="#FF9F0A" />
                 <Dot color="#333" /><Dot color="#333" /><Dot color="#333" /><Dot color="#FF9F0A" />
                 <Dot color="#333" /><Dot color="#333" /><Dot color="#333" /><Dot color="#FF9F0A" />
                 <div style={{background:'#333', borderRadius:'3px', gridColumn:'span 2', height:'5px'}}></div><Dot color="#333" /><Dot color="#FF9F0A" />
              </div>
          </div>
      )}

      {/* 📱 2. OPEN WIDGET */}
      {isOpen && (
          <div style={{
              width: '320px', minHeight: '500px',
              background: '#000000', borderRadius: '35px', 
              padding: '20px 20px 35px 20px',
              boxShadow: '0 50px 100px rgba(0,0,0,0.9), 0 0 0 1px #333',
              display: 'flex', flexDirection: 'column', gap: '15px', overflow: 'hidden',
              position: 'relative' 
          }}>
              {/* Header */}
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0 5px'}}>
                   {/* Mode Switch */}
                   <div style={{display:'flex', background:'#1C1C1E', borderRadius:'12px', padding:'3px', border: '1px solid #333'}}>
                       <div onClick={(e) => {e.stopPropagation(); setMode('calc')}} style={{
                             padding:'8px 14px', borderRadius:'10px', cursor:'pointer',
                             background: mode === 'calc' ? '#636366' : 'transparent', color: mode === 'calc' ? 'white' : '#888', transition:'0.2s'
                         }}><IoMdCalculator size={18}/></div>
                       <div onClick={(e) => {e.stopPropagation(); setMode('calendar')}} style={{
                             padding:'8px 14px', borderRadius:'10px', cursor:'pointer',
                             background: mode === 'calendar' ? '#636366' : 'transparent', color: mode === 'calendar' ? 'white' : '#888', transition:'0.2s'
                         }}><IoMdCalendar size={18}/></div>
                   </div>
                   
                   {/* Window Controls */}
                   <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
                       <div onClick={(e) => {e.stopPropagation(); cyclePreset()}} style={{
                           cursor:'pointer', color:'#666', display:'flex', alignItems:'center', gap:'2px',
                           background:'rgba(255,255,255,0.1)', padding:'6px 10px', borderRadius:'10px'
                       }}>
                           {presetIndex === 0 ? <FaCompressAlt size={12}/> : <FaExpandAlt size={12}/>}
                       </div>
                       <div onClick={(e) => {e.stopPropagation(); setIsOpen(false)}} style={{
                           cursor:'pointer', background:'#333', borderRadius:'50%', width:'30px', height:'30px',
                           display:'flex', alignItems:'center', justifyContent:'center', color:'#fff'
                       }}><IoMdClose size={20}/></div>
                   </div>
              </div>

              {/* Content */}
              <div style={{flex:1, display:'flex', flexDirection:'column'}}>
                  {mode === 'calc' ? <CalculatorView /> : <CalendarView />}
              </div>

              {/* ↘️ RESIZE HANDLE */}
              <div 
                className="resize-handle"
                onPointerDown={handleResizeStart}
                onTouchStart={handleResizeStart}
                style={{
                    position: 'absolute', bottom: 0, right: 0,
                    width: '50px', height: '50px', 
                    cursor: 'nwse-resize',
                    display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end',
                    padding: '8px', zIndex: 10
                }}
              >
                  <MdAspectRatio size={24} color="#666" style={{transform:'rotate(90deg)'}} />
              </div>
          </div>
      )}
    </div>
  );
};

// --- Helper Component for the Dot Grid Icon ---
const Dot = ({ color }) => (
    <div style={{background: color, borderRadius:'50%', width:'5px', height:'5px'}}></div>
);

// ==========================================
// 🧮 CALCULATOR VIEW (SUPER POWERED)
// ==========================================
const CalculatorView = () => {
    const [input, setInput] = useState('0');
    const [history, setHistory] = useState('');
    const [isResult, setIsResult] = useState(false);

    // Dynamic Font Scaling
    const getFontSize = (text) => {
        const len = text.length;
        if (len < 8) return '64px';
        if (len < 12) return '48px';
        if (len < 16) return '36px';
        return '28px'; 
    };

    const handleTap = (val) => {
        if (navigator.vibrate) navigator.vibrate(10);
        
        if (val === 'AC') { setInput('0'); setHistory(''); setIsResult(false); return; }
        
        if (val === 'DEL') { 
            if (isResult) { setInput('0'); setIsResult(false); }
            else { setInput(prev => prev.length > 1 ? prev.slice(0, -1) : '0'); }
            return; 
        }
        
        if (val === '=') {
            try {
                let evalString = input.replace(/x/g, '*').replace(/÷/g, '/').replace(/,/g, '');
                evalString = evalString.replace(/(\d+)%/g, '($1/100)');

                // eslint-disable-next-line no-eval
                let rawRes = eval(evalString);
                
                if (rawRes > 999999999999 || rawRes < -999999999999) {
                    rawRes = rawRes.toExponential(4);
                } else {
                    rawRes = parseFloat(rawRes.toFixed(8)); 
                }

                const res = rawRes.toString();
                setHistory(input);
                setInput(res);
                setIsResult(true);
            } catch { 
                setInput('Error'); 
                setTimeout(() => setInput('0'), 1000); 
            }
            return;
        }
        
        if (['+', '-', 'x', '÷', '%'].includes(val)) {
            setIsResult(false);
            const lastChar = input.slice(-1);
            if (['+', '-', 'x', '÷', '%'].includes(lastChar)) {
                setInput(input.slice(0, -1) + val);
            } else {
                setInput(input + val);
            }
            return;
        }
        
        if (input === '0' || input === 'Error' || isResult) { 
            setInput(val); 
            setIsResult(false); 
        } else { 
            setInput(input + val); 
        }
    };

    return (
        <>
            {/* DISPLAY SCREEN */}
            <div 
                onPointerDown={(e) => e.target.tagName !== 'INPUT' && e.stopPropagation()} 
                style={{
                    textAlign: 'right', 
                    padding:'20px 10px', 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'flex-end',
                    minHeight: '120px'
                }}
            >
                <div style={{height: '24px', color: '#888', fontSize: '16px', marginBottom:'5px', overflow:'hidden'}}>{history}</div>
                <div style={{
                    color: 'white', 
                    fontSize: getFontSize(input), 
                    fontWeight: '300', 
                    lineHeight: '1.1',
                    wordBreak: 'break-all',
                    whiteSpace: 'pre-wrap', 
                    transition: 'font-size 0.1s ease'
                }}>
                    {input}
                </div>
            </div>

            {/* KEYPAD */}
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', paddingBottom:'10px'}}>
                <Btn label="AC" bg="#A5A5A5" color="black" onClick={() => handleTap('AC')} />
                <Btn icon={<FaBackspace size={22}/>} bg="#A5A5A5" color="black" onClick={() => handleTap('DEL')} />
                <Btn label="%" bg="#A5A5A5" color="black" onClick={() => handleTap('%')} />
                <Btn label="÷" bg="#FF9F0A" onClick={() => handleTap('÷')} />
                <Btn label="7" onClick={() => handleTap('7')} />
                <Btn label="8" onClick={() => handleTap('8')} />
                <Btn label="9" onClick={() => handleTap('9')} />
                <Btn label="x" bg="#FF9F0A" onClick={() => handleTap('x')} />
                <Btn label="4" onClick={() => handleTap('4')} />
                <Btn label="5" onClick={() => handleTap('5')} />
                <Btn label="6" onClick={() => handleTap('6')} />
                <Btn label="-" bg="#FF9F0A" onClick={() => handleTap('-')} />
                <Btn label="1" onClick={() => handleTap('1')} />
                <Btn label="2" onClick={() => handleTap('2')} />
                <Btn label="3" onClick={() => handleTap('3')} />
                <Btn label="+" bg="#FF9F0A" onClick={() => handleTap('+')} />
                <Btn label="0" span={2} align="left" onClick={() => handleTap('0')} />
                <Btn label="." onClick={() => handleTap('.')} />
                <Btn label="=" bg="#FF9F0A" onClick={() => handleTap('=')} />
            </div>
        </>
    );
};

// ==========================================
// 📅 CALENDAR VIEW
// ==========================================
const CalendarView = () => {
    const [viewDate, setViewDate] = useState(new Date()); 
    const [selectedDate, setSelectedDate] = useState(new Date()); 

    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const holidays = {
        "12-25": "🎄 Christmas Day",
        "12-31": "🎉 New Year's Eve",
        "1-1": "🥂 New Year's Day",
        "1-14": "🪁 Makara Sankranti",
        "1-26": "🇮🇳 Republic Day",
        "8-15": "🇮🇳 Independence Day",
        "10-2": "🕊️ Gandhi Jayanti"
    };

    const changeMonth = (offset) => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));
    };

    const handleDateClick = (day) => {
        const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        setSelectedDate(newDate);
    };

    const renderDays = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const totalDays = new Date(year, month + 1, 0).getDate();
        const startDay = new Date(year, month, 1).getDay();
        
        const blanks = Array(startDay).fill(null);
        const dayArray = Array.from({ length: totalDays }, (_, i) => i + 1);
        const allSlots = [...blanks, ...dayArray];
        
        const today = new Date();

        return (
            <div style={{display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:'8px', marginTop:'15px'}}>
                {days.map((d, i) => (
                    <div key={i} style={{
                        textAlign:'center', 
                        color: (i === 0 || i === 6) ? '#FF453A' : '#8E8E93', 
                        fontSize:'13px', fontWeight:'600', marginBottom:'5px'
                    }}>
                        {d}
                    </div>
                ))}
                
                {allSlots.map((d, i) => {
                    if (!d) return <div key={i}></div>;

                    const dateObj = new Date(year, month, d);
                    const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                    const isSelected = d === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear();
                    const dayOfWeek = dateObj.getDay();
                    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                    const dateKey = `${month + 1}-${d}`;
                    const isHoliday = holidays[dateKey] !== undefined;

                    let textColor = 'white';
                    let bgColor = 'transparent';

                    if (isSelected) { textColor = 'black'; bgColor = 'white'; }
                    else if (isToday) { textColor = '#FF9F0A'; }
                    else if (isHoliday) { textColor = '#FF453A'; }
                    else if (isWeekend) { textColor = '#FF453A'; }

                    return (
                        <div 
                            key={i} 
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={() => handleDateClick(d)}
                            style={{
                                height: '36px', width: '36px', margin: '0 auto',
                                display:'flex', alignItems:'center', justifyContent:'center',
                                fontSize: '16px', 
                                fontWeight: (isToday || isSelected) ? '700' : '400',
                                background: bgColor, 
                                color: textColor,
                                borderRadius: '50%',
                                cursor: 'pointer',
                            }}
                        >
                            {d}
                        </div>
                    );
                })}
            </div>
        );
    };

    const getEventForSelected = () => {
        const key = `${selectedDate.getMonth() + 1}-${selectedDate.getDate()}`;
        return holidays[key] || "No events for today";
    };

    return (
        <div style={{animation:'fadeIn 0.3s'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid #333', marginBottom:'10px'}}>
                <button onPointerDown={(e) => e.stopPropagation()} onClick={() => changeMonth(-1)} style={{background:'none', border:'none', color:'#FF9F0A', cursor:'pointer', padding:'5px'}}><FaChevronLeft size={18}/></button>
                <div style={{fontSize:'18px', fontWeight:'600', color:'white'}}>
                    {months[viewDate.getMonth()]} <span style={{color:'#888', fontWeight:'400'}}>{viewDate.getFullYear()}</span>
                </div>
                <button onPointerDown={(e) => e.stopPropagation()} onClick={() => changeMonth(1)} style={{background:'none', border:'none', color:'#FF9F0A', cursor:'pointer', padding:'5px'}}><FaChevronRight size={18}/></button>
            </div>
            {renderDays()}
            <div style={{marginTop:'25px', padding:'15px', background:'#1C1C1E', borderRadius:'16px'}}>
                <div style={{color:'#FF9F0A', fontSize:'12px', fontWeight:'700', textTransform:'uppercase', marginBottom:'5px'}}>
                    {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </div>
                <div style={{color:'white', fontSize:'15px', fontWeight:'500'}}>
                    {getEventForSelected()}
                </div>
            </div>
        </div>
    );
};

// ==========================================
// 🔘 BUTTON COMPONENT
// ==========================================
const Btn = ({ label, onClick, color = 'white', span, icon, bg = '#333333', align }) => {
    return (
        <button
            onPointerDown={(e) => { e.stopPropagation(); }} 
            onClick={onClick}
            style={{
                gridColumn: span ? `span ${span}` : 'span 1',
                height: '65px', 
                borderRadius: '50px', 
                border: 'none',
                background: bg, 
                color: color, 
                fontSize: label === 'AC' ? '22px' : '32px', 
                fontWeight: '400',
                cursor: 'pointer', 
                display: 'flex', alignItems: 'center', 
                justifyContent: align === 'left' ? 'flex-start' : 'center',
                paddingLeft: align === 'left' ? '28px' : '0',
                userSelect: 'none',
                active: { opacity: 0.7 } 
            }}
        >
            {icon || label}
        </button>
    );
};

export default FloatingCalculator;