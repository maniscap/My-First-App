import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { IoMdClose, IoMdCalendar, IoMdCalculator } from 'react-icons/io';
import { FaBackspace, FaExpandAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const FloatingCalculator = () => {
  const location = useLocation();
  
  // --- GATEKEEPER ---
  if (!location.pathname.toLowerCase().includes('expenditure')) {
    return null;
  }

  // --- STATE ---
  const [position, setPosition] = useState({ x: window.innerWidth - 85, y: window.innerHeight - 200 });
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState('calc'); 
  const [scale, setScale] = useState(1); 

  // Drag Refs
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // --- DRAG LOGIC ---
  const handlePointerDown = (e) => {
    if (['BUTTON', 'svg', 'path'].includes(e.target.tagName) || e.target.closest('button')) return;
    isDragging.current = true;
    e.target.setPointerCapture(e.pointerId);
    dragOffset.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    let newX = e.clientX - dragOffset.current.x;
    let newY = e.clientY - dragOffset.current.y;
    
    const maxX = window.innerWidth - 60;
    const maxY = window.innerHeight - 60;
    if (newX < 0) newX = 0; if (newX > maxX) newX = maxX;
    if (newY < 0) newY = 0; if (newY > maxY) newY = maxY;

    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e) => {
    isDragging.current = false;
    e.target.releasePointerCapture(e.pointerId);
  };

  // --- RENDER ---
  return (
    <div
      style={{
          position: 'fixed', left: position.x, top: position.y, zIndex: 9999,
          touchAction: 'none', 
          transform: `scale(${isOpen ? scale : 1})`,
          transformOrigin: 'top right', 
          transition: isDragging.current ? 'none' : 'transform 0.3s cubic-bezier(0.19, 1, 0.22, 1)',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      
      {/* 🟠 1. CLOSED: REFINED "AIRY" ICON */}
      {!isOpen && (
          <div 
              onClick={() => !isDragging.current && setIsOpen(true)}
              style={{
                  width: '60px', height: '60px', // Standard App Icon Size
                  borderRadius: '14px',
                  background: '#000', 
                  boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
                  cursor: 'pointer', position:'relative', overflow:'hidden',
                  border: '1px solid rgba(255,255,255,0.15)',
                  display: 'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'
              }}
          >
              {/* Thinner, Sharper Grid */}
              <div style={{
                  display: 'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'4px', 
                  width:'fit-content', // Auto-shrink to fit dots
                  marginTop:'10px'
              }}>
                 {/* Row 1 */}
                 <Dot color="#A5A5A5" /><Dot color="#A5A5A5" /><Dot color="#A5A5A5" /><Dot color="#FF9F0A" />
                 {/* Row 2 */}
                 <Dot color="#333" /><Dot color="#333" /><Dot color="#333" /><Dot color="#FF9F0A" />
                 {/* Row 3 */}
                 <Dot color="#333" /><Dot color="#333" /><Dot color="#333" /><Dot color="#FF9F0A" />
                 {/* Row 4 */}
                 <div style={{background:'#333', borderRadius:'3px', gridColumn:'span 2', height:'5px'}}></div>
                 <Dot color="#333" /><Dot color="#FF9F0A" />
              </div>
          </div>
      )}

      {/* 📱 2. OPEN: SUPER WIDGET */}
      {isOpen && (
          <div style={{
              width: '300px',
              minHeight: '460px',
              background: '#000000',
              borderRadius: '35px',
              padding: '20px',
              boxShadow: '0 50px 100px rgba(0,0,0,0.9), 0 0 0 1px #333',
              display: 'flex', flexDirection: 'column', gap: '15px',
              overflow: 'hidden'
          }}>
              {/* Header */}
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0 5px'}}>
                   <div style={{
                       display:'flex', background:'#1C1C1E', borderRadius:'10px', padding:'2px', border: '1px solid #333'
                   }}>
                       <div onClick={() => setMode('calc')} style={{
                             padding:'6px 12px', borderRadius:'8px', cursor:'pointer', fontSize:'14px',
                             background: mode === 'calc' ? '#636366' : 'transparent',
                             color: mode === 'calc' ? 'white' : '#888', transition:'0.2s'
                         }}><IoMdCalculator size={16}/></div>
                       <div onClick={() => setMode('calendar')} style={{
                             padding:'6px 12px', borderRadius:'8px', cursor:'pointer', fontSize:'14px',
                             background: mode === 'calendar' ? '#636366' : 'transparent',
                             color: mode === 'calendar' ? 'white' : '#888', transition:'0.2s'
                         }}><IoMdCalendar size={16}/></div>
                   </div>
                   <div style={{display:'flex', gap:'10px'}}>
                       <div onClick={() => setScale(s => s === 1 ? 1.15 : 1)} style={{cursor:'pointer', color:'#666'}}><FaExpandAlt size={12}/></div>
                       <div onClick={() => setIsOpen(false)} style={{cursor:'pointer', color:'#666'}}><IoMdClose size={18}/></div>
                   </div>
              </div>

              {/* Content */}
              <div style={{flex:1, display:'flex', flexDirection:'column'}}>
                  {mode === 'calc' ? <CalculatorView /> : <CalendarView />}
              </div>
          </div>
      )}
    </div>
  );
};

// Refined Dot for Icon (Smaller size: 5px)
const Dot = ({ color }) => (
    <div style={{background: color, borderRadius:'50%', width:'5px', height:'5px'}}></div>
);

// ==========================================
// 🧮 CALCULATOR VIEW
// ==========================================
const CalculatorView = () => {
    const [input, setInput] = useState('0');
    const [history, setHistory] = useState('');
    const [isResult, setIsResult] = useState(false);

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
                const evalString = input.replace(/x/g, '*').replace(/÷/g, '/').replace(/,/g, '');
                // eslint-disable-next-line no-eval
                const rawRes = eval(evalString);
                const res = Number(rawRes).toLocaleString(undefined, { maximumFractionDigits: 6 });
                setHistory(input);
                setInput(res);
                setIsResult(true);
            } catch { setInput('Error'); setTimeout(() => setInput('0'), 1000); }
            return;
        }
        if (['+', '-', 'x', '÷', '%'].includes(val)) {
            setIsResult(false);
            const lastChar = input.slice(-1);
            if (['+', '-', 'x', '÷', '%'].includes(lastChar)) setInput(input.slice(0, -1) + val);
            else setInput(input + val);
            return;
        }
        if (input === '0' || isResult) { setInput(val); setIsResult(false); }
        else { setInput(input + val); }
    };

    return (
        <>
            <div style={{textAlign: 'right', padding:'10px 5px 20px 5px'}}>
                <div style={{height: '20px', color: '#888', fontSize: '15px', marginBottom:'5px'}}>{history}</div>
                <div style={{color: 'white', fontSize: '56px', fontWeight: '200', overflowX: 'auto', whiteSpace: 'nowrap', scrollbarWidth: 'none'}}>{input}</div>
            </div>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', flex:1}}>
                <Btn label="AC" bg="#A5A5A5" color="black" onClick={() => handleTap('AC')} />
                <Btn icon={<FaBackspace size={20}/>} bg="#A5A5A5" color="black" onClick={() => handleTap('DEL')} />
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
// 📅 CALENDAR VIEW (RED EVENTS)
// ==========================================
const CalendarView = () => {
    const [viewDate, setViewDate] = useState(new Date()); 
    const [selectedDate, setSelectedDate] = useState(new Date()); 

    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    // Holidays (MM-DD)
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
            <div style={{display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:'8px', marginTop:'10px'}}>
                {/* HEADERS - Weekends RED */}
                {days.map((d, i) => (
                    <div key={i} style={{
                        textAlign:'center', 
                        color: (i === 0 || i === 6) ? '#FF453A' : '#8E8E93', 
                        fontSize:'13px', fontWeight:'600', marginBottom:'5px'
                    }}>
                        {d}
                    </div>
                ))}
                
                {/* DATES */}
                {allSlots.map((d, i) => {
                    if (!d) return <div key={i}></div>;

                    const dateObj = new Date(year, month, d);
                    const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                    const isSelected = d === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear();
                    const dayOfWeek = dateObj.getDay();
                    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                    // Check for Holiday
                    const dateKey = `${month + 1}-${d}`;
                    const isHoliday = holidays[dateKey] !== undefined;

                    // COLOR PRIORITY:
                    // 1. Selected (Black on White)
                    // 2. Today (Orange)
                    // 3. Event OR Weekend (Red)
                    let textColor = 'white';
                    if (isSelected) textColor = 'black';
                    else if (isToday) textColor = '#FF9F0A';
                    else if (isHoliday || isWeekend) textColor = '#FF453A'; // RED for Events & Weekends

                    return (
                        <div 
                            key={i} 
                            onClick={() => handleDateClick(d)}
                            style={{
                                height: '36px', width: '36px', margin: '0 auto',
                                display:'flex', alignItems:'center', justifyContent:'center',
                                fontSize: '16px', 
                                fontWeight: (isToday || isSelected) ? '700' : '400',
                                background: isSelected ? 'white' : 'transparent', 
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
                <button onClick={() => changeMonth(-1)} style={{background:'none', border:'none', color:'#FF9F0A', cursor:'pointer'}}><FaChevronLeft/></button>
                <div style={{fontSize:'17px', fontWeight:'600', color:'white'}}>
                    {months[viewDate.getMonth()]} <span style={{color:'#888'}}>{viewDate.getFullYear()}</span>
                </div>
                <button onClick={() => changeMonth(1)} style={{background:'none', border:'none', color:'#FF9F0A', cursor:'pointer'}}><FaChevronRight/></button>
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

// UI Button
const Btn = ({ label, onClick, color = 'white', span, icon, bg = '#333333', align }) => {
    return (
        <button
            onPointerDown={(e) => { e.stopPropagation(); }} 
            onClick={onClick}
            style={{
                gridColumn: span ? `span ${span}` : 'span 1',
                height: '60px', borderRadius: '50px', border: 'none',
                background: bg, color: color, 
                fontSize: label === 'AC' ? '20px' : '28px', fontWeight: '300',
                cursor: 'pointer', display: 'flex', alignItems: 'center', 
                justifyContent: align === 'left' ? 'flex-start' : 'center',
                paddingLeft: align === 'left' ? '24px' : '0'
            }}
        >
            {icon || label}
        </button>
    );
};

export default FloatingCalculator;