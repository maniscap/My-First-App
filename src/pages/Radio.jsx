import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import Hls from 'hls.js';
import { useNavigate } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  IoMdArrowBack, IoMdPause, IoMdPlay, IoMdSkipBackward, IoMdSkipForward, 
  IoMdSearch, IoMdFunnel, IoMdArrowDown, IoMdRefresh,
  IoMdMusicalNote, IoMdHeart, IoMdHeartEmpty, IoMdVolumeHigh, IoMdVolumeOff,
  IoMdTime, IoMdShare, IoMdClose, IoMdGlobe, IoMdList
} from 'react-icons/io';

// --- CONFIGURATION ---
const API_BASE = "https://de1.api.radio-browser.info/json/stations";
const DEFAULT_ICON = "https://cdn-icons-png.flaticon.com/512/9043/9043296.png"; 
const AIR_ICON = "https://upload.wikimedia.org/wikipedia/en/thumb/8/82/All_India_Radio_logo.svg/1200px-All_India_Radio_logo.svg.png";
const FARM_ICON = "https://cdn-icons-png.flaticon.com/512/3028/3028575.png";
const STUDIO_BG = "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=1920&auto=format&fit=crop";

// --- SMART LOCATION FALLBACKS ---
const STATE_LOCATIONS = {
    "Tamil Nadu": { lat: 11.1271, lng: 78.6569 },
    "Kerala": { lat: 10.8505, lng: 76.2711 },
    "Karnataka": { lat: 15.3173, lng: 75.7139 },
    "Andhra Pradesh": { lat: 15.9129, lng: 79.7400 },
    "Telangana": { lat: 18.1124, lng: 79.0193 },
    "Maharashtra": { lat: 19.7515, lng: 75.7139 },
    "Delhi": { lat: 28.7041, lng: 77.1025 },
    "West Bengal": { lat: 22.9868, lng: 87.8550 },
    "Uttar Pradesh": { lat: 26.8467, lng: 80.9462 },
    "Gujarat": { lat: 22.2587, lng: 71.1924 },
    "Rajasthan": { lat: 27.0238, lng: 74.2179 },
    "Punjab": { lat: 31.1471, lng: 75.3412 },
    "Haryana": { lat: 29.0588, lng: 76.0856 },
    "Bihar": { lat: 25.0961, lng: 85.3131 },
    "Madhya Pradesh": { lat: 22.9734, lng: 78.6569 },
    "Odisha": { lat: 20.9517, lng: 85.0985 },
    "Assam": { lat: 26.2006, lng: 92.9376 },
    "Jammu and Kashmir": { lat: 33.7782, lng: 76.5762 }
};

// --- GLOBAL SINGLETONS ---
window.globalAudio = window.globalAudio || new Audio();
const globalAudio = window.globalAudio;
let globalHls = null;
let globalCurrentStation = null;

const Radio = () => {
  const navigate = useNavigate();
  const timerRef = useRef(null);

  // --- STATE ---
  const [allStations, setAllStations] = useState([]);
  const [filteredStations, setFilteredStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const [favorites, setFavorites] = useState(() => {
      const saved = localStorage.getItem('radio_favorites');
      return saved ? JSON.parse(saved) : [];
  });
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showTimerMenu, setShowTimerMenu] = useState(false);
  const [sleepTimer, setSleepTimer] = useState(null);
  
  const [langOpen, setLangOpen] = useState(false);
  const [stateOpen, setStateOpen] = useState(false);

  // --- PLAYER STATE ---
  const [selectedStation, setSelectedStation] = useState(globalCurrentStation);
  const [isPlaying, setIsPlaying] = useState(!globalAudio.paused); 
  const [filters, setFilters] = useState({ search: '', state: 'All', language: 'All', favoritesOnly: false });

  // --- PLAY/PAUSE LOGIC ---
  const togglePlay = (e) => {
    if (e) {
        e.stopPropagation();
        e.preventDefault();
    }
    
    if (isPlaying) {
        setIsPlaying(false);
        globalAudio.pause();
    } else {
        setIsPlaying(true);
        const playPromise = globalAudio.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.error("Playback failed:", error);
                setIsPlaying(false); 
                toast.error("Stream connection failed");
            });
        }
    }
  };

  // --- SYNC ENGINE ---
  useEffect(() => {
      if (globalCurrentStation) {
          setSelectedStation(globalCurrentStation);
          setIsPlaying(!globalAudio.paused);
      }

      const onPlay = () => setIsPlaying(true);
      const onPause = () => setIsPlaying(false);
      
      globalAudio.addEventListener('play', onPlay);
      globalAudio.addEventListener('pause', onPause);
      
      return () => {
          globalAudio.removeEventListener('play', onPlay);
          globalAudio.removeEventListener('pause', onPause);
      };
  }, [isPlayerExpanded]); 

  // --- FETCH DATA (SMART LOCATION FIX) ---
  useEffect(() => {
    const fetchMassiveData = async () => {
      setLoading(true);
      try {
        const reqs = [
            axios.get(`${API_BASE}/search?countrycode=IN&limit=3000&hidebroken=true`), 
            axios.get(`${API_BASE}/search?name=Akashvani&hidebroken=true`), 
            axios.get(`${API_BASE}/search?name=All%20India%20Radio&hidebroken=true`),
            axios.get(`${API_BASE}/search?tag=kisan&hidebroken=true`)
        ];
        
        const res = await Promise.all(reqs);
        const rawList = res.flatMap(r => r.data || []);
        const processedMap = new Map();
        
        rawList.forEach(s => {
           if (!s.url_resolved && !s.url) return;
           const name = (s.name || "Unknown").trim();
           let rawState = (s.state || "").trim();
           if (!rawState && name.toLowerCase().includes('chennai')) rawState = "Tamil Nadu";

           let normalizedState = rawState;
           // Normalization fixes
           if (rawState.toLowerCase().includes('andhra')) normalizedState = 'Andhra Pradesh';
           else if (rawState.toLowerCase().includes('tamil')) normalizedState = 'Tamil Nadu';
           else if (rawState.toLowerCase().includes('bengal')) normalizedState = 'West Bengal';
           else if (rawState.toLowerCase().includes('delhi')) normalizedState = 'Delhi';

           // --- COORDINATE INTELLIGENCE ---
           let lat = parseFloat(s.geo_lat);
           let lng = parseFloat(s.geo_long);

           // If API has no coordinates (0,0 or null), use Smart State Fallback
           if (!lat || !lng || (Math.abs(lat) < 1 && Math.abs(lng) < 1)) {
               if (normalizedState && STATE_LOCATIONS[normalizedState]) {
                   // Place in correct state with slight random jitter (0.5 deg) so they don't stack perfectly
                   lat = STATE_LOCATIONS[normalizedState].lat + (Math.random() * 0.5 - 0.25);
                   lng = STATE_LOCATIONS[normalizedState].lng + (Math.random() * 0.5 - 0.25);
               } else {
                   // Fallback for unknown states (Central India)
                   lat = 22 + (Math.random() * 5 - 2.5);
                   lng = 79 + (Math.random() * 5 - 2.5);
               }
           }
           // --------------------------------

           let type = 'Private';
           let icon = s.favicon;
           const nameLower = name.toLowerCase();
           if (nameLower.includes('air ') || nameLower.includes('akashvani')) {
               type = 'Govt';
               if (!icon || icon.length < 5) icon = AIR_ICON; 
           } else if(nameLower.includes('kisan')) {
               type = 'Farm';
               if (!icon || icon.length < 5) icon = FARM_ICON;
           } else {
               if (!icon || icon.length < 5 || icon.includes('http:')) icon = DEFAULT_ICON;
           }

           if (!processedMap.has(s.stationuuid)) {
               processedMap.set(s.stationuuid, { 
                   ...s, name, state: rawState, normalizedState, uniqueId: s.stationuuid, 
                   lat: lat, lng: lng, type, icon 
               });
           }
        });

        const finalStations = Array.from(processedMap.values());
        finalStations.sort((a, b) => (a.type === 'Govt' ? -1 : 1));
        setAllStations(finalStations);
        setFilteredStations(finalStations);
        setLoading(false);
      } catch (err) { console.error(err); setLoading(false); }
    };
    fetchMassiveData();
  }, []);

  // --- FILTERING ---
  useEffect(() => {
    let result = allStations;
    if (filters.search && filters.search.length > 0) {
        const q = filters.search.toLowerCase();
        result = result.filter(s => 
            s.name.toLowerCase().includes(q) || 
            (s.normalizedState && s.normalizedState.toLowerCase().includes(q))
        );
        if (filters.search.length >= 2) {
            setSuggestions(result.slice(0, 5)); 
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    } else {
        setShowSuggestions(false);
    }
    if (filters.favoritesOnly) result = result.filter(s => favorites.includes(s.uniqueId));
    if (filters.state !== 'All') result = result.filter(s => s.normalizedState === filters.state);
    if (filters.language !== 'All') result = result.filter(s => s.language && s.language.toLowerCase().includes(filters.language.toLowerCase()));
    
    setFilteredStations(result);
  }, [filters, allStations, favorites]);

  // --- PLAY ENGINE ---
  const playStation = async (station) => {
    if (!station) return;
    globalCurrentStation = station;
    setSelectedStation(station);
    
    globalAudio.pause();
    globalAudio.currentTime = 0;
    if (globalHls) { globalHls.destroy(); globalHls = null; }
    
    setShowSuggestions(false);
    setFilters({...filters, search: ''});
    setIsPlaying(false); 
    
    const url = station.url_resolved || station.url;
    globalAudio.volume = isMuted ? 0 : volume;

    const isHls = url.includes('.m3u8') || station.type === 'Govt';

    if (Hls.isSupported() && isHls) {
        globalHls = new Hls({ enableWorker: true, lowLatencyMode: true });
        globalHls.loadSource(url);
        globalHls.attachMedia(globalAudio);
        globalHls.on(Hls.Events.MANIFEST_PARSED, () => {
            globalAudio.play().catch(e => console.log("Auto-play prevented"));
            setIsPlaying(true);
        });
    } else {
        globalAudio.src = url;
        globalAudio.load();
        globalAudio.play().catch(e => console.log("Stream load error"));
        setIsPlaying(true);
    }
  };

  const playNext = (e) => {
      e && e.stopPropagation();
      const idx = filteredStations.findIndex(s => s.uniqueId === selectedStation?.uniqueId);
      if(idx !== -1) playStation(filteredStations[(idx + 1) % filteredStations.length]);
  };

  const playPrev = (e) => {
      e && e.stopPropagation();
      const idx = filteredStations.findIndex(s => s.uniqueId === selectedStation?.uniqueId);
      if(idx !== -1) playStation(filteredStations[(idx - 1 + filteredStations.length) % filteredStations.length]);
  };

  const miniPlayerSwipeHandlers = useSwipeable({
    onSwipedLeft: () => playNext(),
    onSwipedRight: () => playPrev(),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
    delta: 10, 
  });

  const handleVolumeChange = (e) => {
      const val = parseFloat(e.target.value);
      setVolume(val);
      if(val > 0) setIsMuted(false);
      globalAudio.volume = val;
  };

  const toggleFavorite = (e, station) => {
      e && e.stopPropagation();
      let newFavs;
      if (favorites.includes(station.uniqueId)) {
          newFavs = favorites.filter(id => id !== station.uniqueId);
          toast.info("Removed from Favorites", { theme: "dark", autoClose: 1000 });
      } else {
          newFavs = [...favorites, station.uniqueId];
          toast.success("Added to Favorites", { theme: "dark", autoClose: 1000 });
      }
      setFavorites(newFavs);
      localStorage.setItem('radio_favorites', JSON.stringify(newFavs));
  };

  const setTimer = (minutes) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setSleepTimer(minutes);
      setShowTimerMenu(false);
      if (minutes) {
          timerRef.current = setTimeout(() => {
              globalAudio.pause();
              setSleepTimer(null);
              toast.info("Sleep Timer: Radio Stopped", { theme: "dark" });
          }, minutes * 60 * 1000);
          toast.success(`Timer set for ${minutes} mins`, { theme: "dark", autoClose: 2000 });
      }
  };

  const shareStation = () => {
      if (selectedStation) {
          const text = `Listening to ${selectedStation.name} on RadioX!`;
          if (navigator.share) {
              navigator.share({ title: 'RadioX', text: text, url: window.location.href });
          } else {
              navigator.clipboard.writeText(text);
              toast.success("Station copied!", { theme: "dark", autoClose: 1000 });
          }
      }
  };

  // --- PASSING STATE TO GLOBE ---
  const goToGlobe = () => {
      navigate('/globe', { 
          state: { 
              stations: allStations,
              activeStation: selectedStation // Pass active station for focus
          } 
      });
  };

  const uniqueStatesList = useMemo(() => ['All', ...new Set(allStations.map(s => s.normalizedState).filter(Boolean))].sort(), [allStations]);
  const uniqueLangList = useMemo(() => ['All', ...new Set(allStations.map(s => s.language ? s.language.split(',')[0].trim() : "").filter(Boolean))].sort(), [allStations]);

  const CustomDropdown = ({ label, options, current, isOpen, setIsOpen, onSelect }) => (
    <div style={{position:'relative', flex:1}}>
        <button onClick={() => setIsOpen(!isOpen)} style={styles.dropdownBtn}>
            <span style={{opacity:0.7, fontSize:10}}>{label}</span>
            <div style={{fontWeight:'600'}}>{current}</div>
            <IoMdArrowDown style={{marginLeft:'auto', transform: isOpen ? 'rotate(180deg)' : 'none', transition:'0.2s'}}/>
        </button>
        {isOpen && (
            <div style={styles.dropdownList}>
                {options.map(opt => (
                    <div key={opt} onClick={() => { onSelect(opt); setIsOpen(false); }} style={styles.dropdownItem}>
                        {opt}
                    </div>
                ))}
            </div>
        )}
    </div>
  );

  return (
    <div style={styles.page}>
      <ToastContainer limit={1} position="top-center" />
      
      {/* HEADER */}
      <div style={styles.glassHeader}>
        <div style={styles.headerTop}>
            <button onClick={() => navigate('/dashboard')} style={styles.glassBtn}><IoMdArrowBack size={22}/></button>
            <div style={{textAlign:'center'}}>
                <div style={styles.logoText}>RADIO<span style={{color:'#4ade80'}}>X</span></div>
                <div style={styles.subText}>{filteredStations.length} Signals Active</div>
            </div>
            <div style={{display:'flex', gap:10}}>
                <button onClick={() => setFilters({...filters, favoritesOnly: !filters.favoritesOnly})} style={{...styles.glassBtn, background: filters.favoritesOnly ? '#ef4444' : 'rgba(255,255,255,0.08)'}}>
                    {filters.favoritesOnly ? <IoMdHeart size={20} color="#fff"/> : <IoMdHeartEmpty size={20}/>}
                </button>
                <button onClick={goToGlobe} style={{...styles.glassBtn, background: '#4ade80', color: '#000'}}>
                    <IoMdGlobe size={22}/>
                </button>
            </div>
        </div>

        {/* SEARCH */}
        <div style={{position: 'relative'}}>
            <div style={styles.searchContainer}>
                <div style={styles.glassInputWrapper}>
                    <IoMdSearch size={18} color="rgba(255,255,255,0.6)"/>
                    <input placeholder="Search Station, City or State..." value={filters.search} onChange={(e) => setFilters({...filters, search: e.target.value})} style={styles.glassInput}/>
                    {filters.search.length > 0 && <IoMdClose style={{cursor:'pointer'}} onClick={()=>setFilters({...filters, search:''})} />}
                </div>
                <button onClick={() => setShowFilters(!showFilters)} style={{...styles.glassBtn, background: showFilters ? '#4ade80' : 'rgba(255,255,255,0.1)', color: showFilters ? '#000' : '#fff'}}>
                    <IoMdFunnel size={18}/>
                </button>
            </div>
            {showSuggestions && suggestions.length > 0 && (
                <div style={styles.suggestionsBox}>
                    {suggestions.map((s, i) => (
                        <div key={i} style={styles.suggestionItem} onClick={() => playStation(s)}>
                            <img src={s.icon} onError={(e)=>e.target.src=DEFAULT_ICON} style={{width:30, height:30, borderRadius:4, marginRight:10}} />
                            <div style={{overflow:'hidden'}}>
                                <div style={{fontWeight:'600', fontSize:13}}>{s.name}</div>
                                <div style={{fontSize:10, color:'#a1a1aa'}}>{s.normalizedState}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {showFilters && (
            <div style={styles.glassPanel}>
                <CustomDropdown label="Language" options={uniqueLangList} current={filters.language} isOpen={langOpen} setIsOpen={(v)=>{setLangOpen(v); setStateOpen(false)}} onSelect={(val)=>setFilters({...filters, language: val})} />
                <div style={{width:1, background:'rgba(255,255,255,0.1)'}}></div>
                <CustomDropdown label="State" options={uniqueStatesList} current={filters.state} isOpen={stateOpen} setIsOpen={(v)=>{setStateOpen(v); setLangOpen(false)}} onSelect={(val)=>setFilters({...filters, state: val})} />
            </div>
        )}
      </div>

      {/* GRID (FIXED: SCROLL & SMALL CARDS) */}
      <div style={styles.mainArea} onClick={() => { setLangOpen(false); setStateOpen(false); setShowSuggestions(false); }}>
        {loading ? (
            <div style={styles.loader}>
                <IoMdRefresh className="spin" size={40} color="#4ade80"/>
                <div style={{marginTop:10, fontSize:12, letterSpacing:1}}>CALIBRATING...</div>
            </div>
        ) : (
            <div style={styles.glassGrid}>
                {filteredStations.length === 0 ? (
                    <div style={styles.emptyState}>
                        <IoMdMusicalNote size={50} color="rgba(255,255,255,0.2)"/>
                        <p>No signals found.</p>
                        <button onClick={()=>setFilters({search:'', state:'All', language:'All', favoritesOnly: false})} style={styles.resetBtn}>Reset Filters</button>
                    </div>
                ) : (
                    filteredStations.map(s => (
                        <div key={s.uniqueId} onClick={() => playStation(s)} style={styles.glassCard}>
                            <div style={{position:'relative'}}>
                                <img src={s.icon} onError={(e)=>{e.target.onerror=null; e.target.src=DEFAULT_ICON}} style={styles.cardImg} alt=""/>
                                {s.uniqueId === selectedStation?.uniqueId && isPlaying && <div style={styles.playingOverlay}><IoMdPlay/></div>}
                                <button onClick={(e) => toggleFavorite(e, s)} style={{...styles.gridFavBtn, color: favorites.includes(s.uniqueId) ? '#ef4444' : '#fff'}}>
                                    {favorites.includes(s.uniqueId) ? <IoMdHeart size={14}/> : <IoMdHeartEmpty size={14}/>}
                                </button>
                            </div>
                            <div style={styles.cardText}>
                                <div style={styles.cardTitle}>{s.name}</div>
                                <div style={styles.cardSub}>{s.normalizedState}</div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        )}
      </div>

      {/* MINI PLAYER */}
      {selectedStation && !isPlayerExpanded && (
        <div {...miniPlayerSwipeHandlers} style={styles.miniGlassPlayer} onClick={() => setIsPlayerExpanded(true)}>
            <div style={styles.miniProgressBarContainer}>
                <div style={{...styles.miniProgressBar, width: isPlaying ? '100%' : '0%'}}></div>
            </div>
            
            <img src={selectedStation.icon} onError={(e)=>e.target.src=DEFAULT_ICON} style={styles.miniArt} />
            
            <div style={styles.miniInfo}>
                <div style={styles.miniTitle}>{selectedStation.name}</div>
                <div style={styles.miniStatus}>
                     <span style={{color: '#4ade80'}}>●</span> {isPlaying ? 'LIVE' : 'PAUSED'}
                </div>
            </div>
            
            <div style={styles.miniControls}>
                <button onClick={playPrev} style={styles.miniBtn}><IoMdSkipBackward size={22}/></button>
                <button onClick={(e) => togglePlay(e)} style={styles.neonPlayBtnSmall}>
                    {isPlaying ? <IoMdPause /> : <IoMdPlay style={{marginLeft:2}}/>}
                </button>
                <button onClick={playNext} style={styles.miniBtn}><IoMdSkipForward size={22}/></button>
            </div>
        </div>
      )}

      {/* FULL PLAYER */}
      <div style={{...styles.fullPlayer, top: isPlayerExpanded ? '0' : '100%'}}>
          
          <div style={{...styles.bgImage, backgroundImage: `url(${STUDIO_BG})`}}></div>
          <div style={styles.overlayGradient}></div>
          
          <div style={styles.fullHeader}>
              <button onClick={() => setIsPlayerExpanded(false)} style={styles.glassBtnCircle}><IoMdArrowDown size={24}/></button>
              <div style={styles.nowPlayingText}>ON AIR NOW</div>
              <button onClick={() => setIsPlayerExpanded(false)} style={styles.glassBtnCircle}><IoMdList size={22}/></button>
          </div>

          <div style={styles.turntableArea}>
              <div key={selectedStation?.uniqueId} style={styles.perspectiveContainer}>
                  <div style={{...styles.toneArm, transform: isPlaying ? 'rotate(25deg)' : 'rotate(0deg)'}}>
                     <div style={styles.toneArmBase}></div>
                     <div style={styles.toneArmRod}></div>
                     <div style={styles.toneArmHead}></div>
                  </div>

                  <div style={{
                      ...styles.vinylFloating,
                      animationPlayState: isPlaying ? 'running' : 'paused'
                  }}>
                      <div style={styles.vinylGrooves}></div>
                      <div style={styles.vinylLabelContainer}>
                          <img src={selectedStation?.icon} onError={(e)=>e.target.src=DEFAULT_ICON} style={styles.vinylLabelImg} />
                      </div>
                      <div style={styles.vinylShineReal}></div>
                  </div>
              </div>
          </div>

          <div style={styles.fullInfo}>
              <div key={selectedStation?.uniqueId + "_text"} style={styles.textAnimContainer}>
                <h1 style={styles.fullTitle}>{selectedStation?.name}</h1>
                <div style={styles.fullMeta}>
                    <span style={styles.tagBadgeGlass}>{selectedStation?.normalizedState || 'Internet Radio'}</span>
                </div>
              </div>
          </div>

          <div style={styles.glassControlPanel}>
             <div style={styles.actionBar}>
                <button onClick={(e) => toggleFavorite(e, selectedStation)} style={styles.actionBtn}>
                    {favorites.includes(selectedStation?.uniqueId) ? <IoMdHeart color="#ef4444" size={24}/> : <IoMdHeartEmpty size={24}/>}
                    <span style={styles.actionLabel}>Like</span>
                </button>

                <div style={{position:'relative'}}>
                    <button onClick={() => setShowTimerMenu(!showTimerMenu)} style={styles.actionBtn}>
                        <IoMdTime size={24} color={sleepTimer ? '#4ade80' : '#fff'}/>
                        <span style={styles.actionLabel}>{sleepTimer ? `${sleepTimer}m` : 'Timer'}</span>
                    </button>
                    {showTimerMenu && (
                        <div style={styles.timerMenu}>
                            <div style={styles.timerHeader}>Sleep Timer <IoMdClose onClick={()=>setShowTimerMenu(false)}/></div>
                            <div style={styles.timerGrid}>
                                <button onClick={()=>setTimer(15)} style={styles.timerOpt}>15m</button>
                                <button onClick={()=>setTimer(30)} style={styles.timerOpt}>30m</button>
                                <button onClick={()=>setTimer(60)} style={styles.timerOpt}>60m</button>
                                <button onClick={()=>setTimer(null)} style={{...styles.timerOpt, color:'#ef4444'}}>Off</button>
                            </div>
                        </div>
                    )}
                </div>

                <button onClick={shareStation} style={styles.actionBtn}>
                    <IoMdShare size={24}/>
                    <span style={styles.actionLabel}>Share</span>
                </button>
             </div>

             <div style={styles.mainControls}>
                 <button onClick={playPrev} style={styles.controlBtnSecondary}><IoMdSkipBackward size={28}/></button>
                 
                 <button onClick={(e) => togglePlay(e)} style={styles.playBtnGlass}>
                     {isPlaying ? <IoMdPause size={36} color="#000"/> : <IoMdPlay size={36} color="#000" style={{marginLeft:4}}/>}
                 </button>
                 
                 <button onClick={playNext} style={styles.controlBtnSecondary}><IoMdSkipForward size={28}/></button>
             </div>
             
             <div style={styles.bottomVolume}>
                  <IoMdVolumeOff size={18} style={{opacity:0.6}}/>
                  <input type="range" min="0" max="1" step="0.05" value={isMuted ? 0 : volume} onChange={handleVolumeChange} style={styles.volumeSlider}/>
                  <IoMdVolumeHigh size={18} style={{opacity:0.6}}/>
             </div>
          </div>
      </div>
    </div>
  );
};

// --- STYLES ---
const styles = {
  page: { position: 'fixed', inset: 0, background: '#09090b', color: '#fff', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', sans-serif" },
  glassHeader: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, background: 'linear-gradient(180deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)', padding: '20px', display: 'flex', flexDirection: 'column', gap: 15 },
  headerTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logoText: { fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px' },
  subText: { fontSize: '11px', color: '#a1a1aa', fontWeight: '500' },
  glassBtn: { width: 40, height: 40, borderRadius: '12px', border: 'none', background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.2s' },
  
  searchContainer: { display: 'flex', gap: 10 },
  glassInputWrapper: { flex: 1, background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', borderRadius: '12px', display: 'flex', alignItems: 'center', padding: '0 12px', border: '1px solid rgba(255,255,255,0.05)' },
  glassInput: { background: 'transparent', border: 'none', color: '#fff', padding: '12px 10px', width: '100%', outline: 'none', fontSize: '14px' },
  suggestionsBox: { position:'absolute', top:'100%', left:0, right:50, background:'#18181b', borderRadius:12, border:'1px solid #333', marginTop:5, zIndex:300, boxShadow:'0 10px 40px rgba(0,0,0,0.8)' },
  suggestionItem: { display:'flex', alignItems:'center', padding:10, borderBottom:'1px solid rgba(255,255,255,0.05)', cursor:'pointer' },
  glassPanel: { background: 'rgba(30,30,30,0.9)', backdropFilter: 'blur(25px)', padding: 5, borderRadius: 12, display: 'flex', gap: 5, border: '1px solid rgba(255,255,255,0.1)', position: 'relative', zIndex: 100 },
  dropdownBtn: { background: 'transparent', border: 'none', width: '100%', textAlign: 'left', padding: '8px 12px', color: '#fff', display: 'flex', flexDirection: 'column', cursor: 'pointer' },
  dropdownList: { position: 'absolute', top: '110%', left: 0, right: 0, background: '#18181b', borderRadius: 12, border: '1px solid #333', maxHeight: '300px', overflowY: 'auto', zIndex: 200, padding: 5, boxShadow: '0 10px 40px rgba(0,0,0,0.8)' },
  dropdownItem: { padding: '10px', fontSize: 13, color: '#d4d4d8', borderRadius: 8, cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.03)' },

  mainArea: { flex: 1, position: 'relative', overflow: 'hidden' }, 
  glassGrid: { 
      position: 'absolute', inset: 0, 
      padding: '130px 15px 120px 15px', 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', 
      gap: 15, 
      overflowY: 'auto' 
  },
  emptyState: { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', color:'#52525b', gap:10 },
  resetBtn: { padding: '8px 16px', borderRadius: 8, background: '#4ade80', border:'none', fontWeight:'600', cursor:'pointer' },
  glassCard: { background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)', backdropFilter: 'blur(10px)', borderRadius: '16px', padding: 12, border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, cursor: 'pointer', position:'relative' },
  cardImg: { width: 50, height: 50, borderRadius: '50%', objectFit: 'cover', background: '#000', border:'2px solid rgba(255,255,255,0.1)' },
  gridFavBtn: { position: 'absolute', top: 5, right: 5, background: 'rgba(0,0,0,0.5)', borderRadius:'50%', width:24, height:24, border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' },
  cardText: { textAlign: 'center' },
  cardTitle: { fontSize: 12, fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80px' }, // Compact text
  cardSub: { fontSize: 10, color: '#71717a' },
  playingOverlay: { position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', width: 50, height: 50, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4ade80' },

  miniGlassPlayer: { 
      position: 'absolute', bottom: 25, left: 20, right: 20, height: 80, 
      background: 'rgba(30,30,30,0.6)', backdropFilter: 'blur(25px)', 
      borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', 
      display: 'flex', alignItems: 'center', padding: '0 15px', gap: 15, 
      boxShadow: '0 20px 50px rgba(0,0,0,0.5)', zIndex: 50, cursor: 'pointer',
      overflow: 'hidden'
  },
  miniProgressBarContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'rgba(255,255,255,0.1)' },
  miniProgressBar: { height: '100%', background: '#4ade80' },
  miniArt: { width: 50, height: 50, borderRadius: '12px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' },
  miniInfo: { flex: 1, overflow: 'hidden' },
  miniTitle: { fontSize: 14, fontWeight: '700', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  miniStatus: { fontSize: 10, color: '#d4d4d8', letterSpacing: 0.5, marginTop: 2 },
  miniControls: { display: 'flex', alignItems: 'center', gap: 8, position: 'relative', zIndex: 60 }, 
  miniBtn: { background:'transparent', border:'none', color:'#fff', display:'flex', cursor:'pointer', padding: 6, opacity: 0.8 }, 
  neonPlayBtnSmall: { width: 40, height: 40, borderRadius: '50%', border: 'none', background: '#fff', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 0 15px rgba(255,255,255,0.2)' },

  fullPlayer: { position: 'fixed', inset: 0, zIndex: 100, background: '#000', display: 'flex', flexDirection: 'column', transition: 'top 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)', overflow: 'hidden' },
  bgImage: { position: 'absolute', inset: 0, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.8)' },
  overlayGradient: { position: 'absolute', inset: 0, background: 'linear-gradient(to top, #000 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.2) 100%)' },
  
  fullHeader: { position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '40px 25px 10px 25px' },
  glassBtnCircle: { width: 50, height: 50, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.2s' },
  nowPlayingText: { fontSize: 11, letterSpacing: 2, fontWeight: '700', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' },

  turntableArea: { flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  perspectiveContainer: { 
      perspective: '1200px', transformStyle: 'preserve-3d', 
      width: '100%', height: '100%', display:'flex', alignItems:'center', justifyContent:'center',
      animation: 'slideUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)' 
  },
  vinylFloating: { 
      width: '280px', height: '280px', borderRadius: '50%', 
      background: 'radial-gradient(circle at 30% 30%, #333 0%, #000 100%)',
      boxShadow: '0 40px 100px rgba(0,0,0,0.7), inset 0 0 0 2px #444',
      transform: 'rotateX(20deg) rotateY(0deg)',
      position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'spinFloating 15s linear infinite'
  },
  vinylGrooves: { position: 'absolute', inset: 8, borderRadius: '50%', background: 'repeating-radial-gradient(#111, #111 2px, #1a1a1a 3px)', opacity: 0.8 },
  vinylLabelContainer: { width: '110px', height: '110px', borderRadius: '50%', overflow: 'hidden', zIndex: 5, border: '4px solid #111' },
  vinylLabelImg: { width: '100%', height: '100%', objectFit: 'cover' },
  vinylShineReal: { position: 'absolute', inset: 0, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 45%, rgba(255,255,255,0.05) 100%)', pointerEvents: 'none' },

  toneArm: { position: 'absolute', top: 20, right: 30, width: 100, height: 200, pointerEvents: 'none', zIndex: 20, transformOrigin: 'top right', transition: 'transform 0.8s ease-in-out' },
  toneArmBase: { position: 'absolute', top: 0, right: 0, width: 40, height: 40, borderRadius: '50%', background: '#d4d4d8', border: '4px solid #52525b', boxShadow: '0 10px 20px rgba(0,0,0,0.5)' },
  toneArmRod: { position: 'absolute', top: 20, right: 20, width: 6, height: 160, background: '#e4e4e7', borderRadius: 3, transform: 'rotate(-15deg)', transformOrigin: 'top' },
  toneArmHead: { position: 'absolute', bottom: 10, left: 10, width: 25, height: 40, background: '#27272a', borderRadius: 6, transform: 'rotate(15deg)', boxShadow: '0 5px 15px rgba(0,0,0,0.5)' },

  fullInfo: { position: 'relative', zIndex: 10, textAlign: 'center', marginBottom: 20, padding: '0 30px' },
  textAnimContainer: { animation: 'fadeIn 0.8s ease-out' },
  fullTitle: { fontSize: 22, fontWeight: '700', lineHeight: 1.3, textShadow: '0 2px 10px rgba(0,0,0,0.5)', marginBottom:10, maxHeight: 60, overflow: 'hidden' },
  tagBadgeGlass: { background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', padding: '5px 12px', borderRadius: '30px', fontSize: 11, fontWeight: '600', backdropFilter: 'blur(10px)', color: '#ddd' },

  glassControlPanel: {
      position: 'relative', zIndex: 50,
      background: 'rgba(255,255,255,0.05)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(255,255,255,0.1)',
      borderTopLeftRadius: '30px', borderTopRightRadius: '30px',
      padding: '25px 20px 80px 20px', 
      display: 'flex', flexDirection: 'column', gap: 25,
      boxShadow: '0 -10px 40px rgba(0,0,0,0.5)'
  },
  actionBar: { display: 'flex', justifyContent: 'space-around', width: '100%', padding: '0 10px' },
  actionBtn: { background: 'transparent', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: '#fff', cursor: 'pointer', opacity: 0.9, transition: '0.2s' },
  actionLabel: { fontSize: 10, opacity: 0.6, fontWeight: '500' },
  
  mainControls: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 35, position: 'relative', zIndex: 200 },
  controlBtnSecondary: { background: 'transparent', width: 50, height: 50, borderRadius: '50%', border: 'none', color: '#fff', cursor: 'pointer', display:'flex', alignItems:'center', justifyContent:'center', opacity: 0.9 },
  playBtnGlass: { width: 80, height: 80, borderRadius: '50%', border: 'none', background: '#4ade80', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px rgba(74, 222, 128, 0.3)', cursor: 'pointer', transform: 'scale(1)', transition: 'transform 0.1s' },

  bottomVolume: { display: 'flex', alignItems: 'center', gap: 15, padding: '0 20px', opacity: 0.8 },
  volumeSlider: { width: '100%', accentColor: '#fff', height: 4, cursor: 'pointer', opacity: 0.7 },

  timerMenu: { position: 'absolute', bottom: '130%', left: '50%', transform: 'translateX(-50%)', background: '#18181b', padding: 15, borderRadius: 16, width: 200, border: '1px solid #333', boxShadow:'0 10px 30px rgba(0,0,0,0.8)', zIndex: 60 },
  timerHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 12, fontWeight: '700', color: '#a1a1aa' },
  timerGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 },
  timerOpt: { background: '#27272a', border: 'none', color: '#fff', padding: 10, borderRadius: 8, fontSize: 12, cursor: 'pointer', fontWeight:'600' },
  loader: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' },
};

const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @keyframes spinFloating { 
      0% { transform: rotateX(20deg) rotate(0deg); } 
      100% { transform: rotateX(20deg) rotate(360deg); } 
  }
  @keyframes slideUp {
      0% { transform: translateY(100px) scale(0.8); opacity: 0; }
      100% { transform: translateY(0) scale(1); opacity: 1; }
  }
  @keyframes fadeIn {
      0% { opacity: 0; transform: translateY(10px); }
      100% { opacity: 1; transform: translateY(0); }
  }
  .spin { animation: spin 1s linear infinite; }
  @keyframes spin { 100% { transform: rotate(360deg); } }
`;
document.head.appendChild(styleSheet);

export default Radio;