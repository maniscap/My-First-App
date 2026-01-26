import React, { useState, useEffect, useRef, useMemo } from 'react';
import Globe from 'react-globe.gl';
import axios from 'axios';
import Hls from 'hls.js';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  IoMdArrowBack, IoMdPause, IoMdPlay, IoMdSkipBackward, IoMdSkipForward, 
  IoMdSearch, IoMdFunnel, IoMdList, IoMdGlobe, IoMdArrowDown, IoMdRefresh,
  IoMdMusicalNote, IoMdHeart, IoMdHeartEmpty, IoMdVolumeHigh, IoMdVolumeOff,
  IoMdTime, IoMdShare, IoMdClose
} from 'react-icons/io';

// --- CONFIGURATION ---
const API_BASE = "https://de1.api.radio-browser.info/json/stations";
const DEFAULT_ICON = "https://cdn-icons-png.flaticon.com/512/9043/9043296.png"; 
const FARM_ICON = "https://cdn-icons-png.flaticon.com/512/3028/3028575.png";
const AIR_ICON = "https://upload.wikimedia.org/wikipedia/en/thumb/8/82/All_India_Radio_logo.svg/1200px-All_India_Radio_logo.svg.png";

// --- STATE CENTER POINTS ---
const STATE_COORDS = {
    'tamil nadu': { lat: 11.1271, lng: 78.6569 },
    'kerala': { lat: 10.8505, lng: 76.2711 },
    'karnataka': { lat: 15.3173, lng: 75.7139 },
    'maharashtra': { lat: 19.7515, lng: 75.7139 },
    'delhi': { lat: 28.7041, lng: 77.1025 },
    'gujarat': { lat: 22.2587, lng: 71.1924 },
    'rajasthan': { lat: 27.0238, lng: 74.2179 },
    'west bengal': { lat: 22.9868, lng: 87.8550 },
    'uttar pradesh': { lat: 26.8467, lng: 80.9462 },
    'punjab': { lat: 31.1471, lng: 75.3412 },
    'andhra pradesh': { lat: 15.9129, lng: 79.7400 },
    'telangana': { lat: 18.1124, lng: 79.0193 },
    'madhya pradesh': { lat: 22.9734, lng: 78.6569 },
    'bihar': { lat: 25.0961, lng: 85.3131 },
    'assam': { lat: 26.2006, lng: 92.9376 },
    'odisha': { lat: 20.9517, lng: 85.0985 },
    'default': { lat: 20.5937, lng: 78.9629 }
};

const Radio = () => {
  const navigate = useNavigate();
  const globeEl = useRef();
  const audioRef = useRef(new Audio());
  const hlsRef = useRef(null);
  const timerRef = useRef(null);

  // --- STATE ---
  const [allStations, setAllStations] = useState([]);
  const [filteredStations, setFilteredStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'
  const [showFilters, setShowFilters] = useState(false);
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);
  
  // --- SEARCH & SUGGESTIONS ---
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // --- SETTINGS ---
  const [favorites, setFavorites] = useState(() => {
      const saved = localStorage.getItem('radio_favorites');
      return saved ? JSON.parse(saved) : [];
  });
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showTimerMenu, setShowTimerMenu] = useState(false);
  const [sleepTimer, setSleepTimer] = useState(null);
  
  // --- VISUALS ---
  const [showDots, setShowDots] = useState(true); 
  const [langOpen, setLangOpen] = useState(false);
  const [stateOpen, setStateOpen] = useState(false);

  // --- PLAYER ---
  const [selectedStation, setSelectedStation] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playStatus, setPlayStatus] = useState('idle'); 

  // --- FILTERS ---
  const [filters, setFilters] = useState({ search: '', state: 'All', language: 'All', favoritesOnly: false });

  // --- HELPERS ---
  const normalizeState = (rawState) => {
      if (!rawState) return "";
      const s = rawState.toLowerCase().replace(/[^a-z\s]/g, '').trim();
      if (s.includes('andhra') || s.includes('pradesh')) return 'Andhra Pradesh';
      if (s.includes('tamil')) return 'Tamil Nadu';
      if (s.includes('karnataka') || s.includes('bengaluru')) return 'Karnataka';
      if (s.includes('kerala')) return 'Kerala';
      if (s.includes('maharashtra') || s.includes('mumbai')) return 'Maharashtra';
      if (s.includes('delhi')) return 'Delhi';
      if (s.includes('telangana')) return 'Telangana';
      if (s.includes('west bengal') || s.includes('kolkata')) return 'West Bengal';
      if (s.includes('gujarat')) return 'Gujarat';
      if (s.includes('rajasthan')) return 'Rajasthan';
      if (s.includes('uttar')) return 'Uttar Pradesh';
      if (s.includes('punjab')) return 'Punjab';
      return rawState.trim(); 
  };

  const uniqueStates = useMemo(() => {
    const states = allStations.map(s => s.normalizedState).filter(s => s && s.length > 0);
    return ['All', ...new Set(states)].sort();
  }, [allStations]);

  const uniqueLanguages = useMemo(() => {
    const langs = allStations.map(s => s.language ? s.language.split(',')[0].trim() : "").filter(s => s.length > 0);
    return ['All', ...new Set(langs)].sort();
  }, [allStations]);

  // ==========================================================
  // 1. DATA ENGINE
  // ==========================================================
  useEffect(() => {
    const fetchMassiveData = async () => {
      setLoading(true);
      try {
        const reqs = [
            axios.get(`${API_BASE}/search?countrycode=IN&limit=3000&hidebroken=true`), 
            axios.get(`${API_BASE}/search?name=Akashvani&hidebroken=true`), 
            axios.get(`${API_BASE}/search?name=All%20India%20Radio&hidebroken=true`), 
            axios.get(`${API_BASE}/search?name=Fm%20Rainbow&hidebroken=true`), 
            axios.get(`${API_BASE}/search?name=Vividh%20Bharati&hidebroken=true`), 
            axios.get(`${API_BASE}/search?tag=kisan&hidebroken=true`), 
            axios.get(`${API_BASE}/search?tag=agriculture&hidebroken=true`)
        ];
        
        const res = await Promise.all(reqs);
        const rawList = res.flatMap(r => r.data || []);
        const processedMap = new Map();
        
        rawList.forEach(s => {
           if (!s.url_resolved && !s.url) return;
           
           const name = (s.name || "Unknown").trim();
           let rawState = (s.state || "").trim();
           
           if (!rawState && name.toLowerCase().includes('kurnool')) rawState = "Andhra Pradesh";
           if (!rawState && name.toLowerCase().includes('vijayawada')) rawState = "Andhra Pradesh";
           if (!rawState && name.toLowerCase().includes('visakhapatnam')) rawState = "Andhra Pradesh";
           if (!rawState && name.toLowerCase().includes('chennai')) rawState = "Tamil Nadu";

           const normalizedState = normalizeState(rawState);
           const tags = (s.tags || "").toLowerCase();
           
           let type = 'Private';
           let icon = s.favicon;

           const nameLower = name.toLowerCase();
           if (nameLower.includes('air ') || nameLower.includes('akashvani') || nameLower.includes('rainbow') || nameLower.includes('vividh')) {
               type = 'Govt';
               if (!icon || icon.length < 5) icon = AIR_ICON; 
           }
           else if (tags.includes('agriculture') || tags.includes('kisan') || tags.includes('rural') || nameLower.includes('kisan')) {
               type = 'Farm';
               if (!icon || icon.length < 5) icon = FARM_ICON;
           }
           else {
               if (!icon || icon.length < 5 || icon.includes('http:')) icon = DEFAULT_ICON;
           }

           let lat = s.geo_lat ? parseFloat(s.geo_lat) : null;
           let lng = s.geo_long ? parseFloat(s.geo_long) : null;

           if (!lat || !lng) {
               const center = STATE_COORDS[normalizedState.toLowerCase()] || STATE_COORDS['default'];
               lat = center.lat + (Math.random() - 0.5) * 1.5; 
               lng = center.lng + (Math.random() - 0.5) * 1.5;
           }

           if (!processedMap.has(s.stationuuid)) {
               processedMap.set(s.stationuuid, { 
                   ...s, 
                   name, 
                   state: rawState, 
                   normalizedState, 
                   uniqueId: s.stationuuid, 
                   lat, lng, 
                   type, icon, 
                   isLive: s.lastcheckok === 1 
               });
           }
        });

        const finalStations = Array.from(processedMap.values());
        finalStations.sort((a, b) => (a.type === 'Govt' ? -1 : 1));

        setAllStations(finalStations);
        setFilteredStations(finalStations);
        setLoading(false);

        if (globeEl.current) {
            globeEl.current.pointOfView({ lat: 22, lng: 78, altitude: 2.0 }, 1000); 
            const controls = globeEl.current.controls();
            controls.rotateSpeed = 1.5;
            controls.zoomSpeed = 1.2;
        }
      } catch (err) { console.error(err); setLoading(false); }
    };
    fetchMassiveData();
  }, []);

  // 2. SEARCH & FILTER ENGINE
  useEffect(() => {
    let result = allStations;
    
    if (filters.search && filters.search.length > 0) {
        const q = filters.search.toLowerCase();
        result = result.filter(s => 
            s.name.toLowerCase().includes(q) || 
            (s.normalizedState && s.normalizedState.toLowerCase().includes(q)) ||
            (s.tags && s.tags.includes(q))
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

    if (filters.favoritesOnly) {
        result = result.filter(s => favorites.includes(s.uniqueId));
    }

    if (filters.state !== 'All') {
        result = result.filter(s => s.normalizedState === filters.state);
    }
    if (filters.language !== 'All') {
        result = result.filter(s => s.language && s.language.toLowerCase().includes(filters.language.toLowerCase()));
    }
    
    setFilteredStations(result);
  }, [filters, allStations, favorites]);

  // ==========================================================
  // 3. AUDIO ENGINE (FIXED ERROR HANDLING)
  // ==========================================================
  const playStation = async (station) => {
    if (!station) return;
    const audio = audioRef.current;
    
    // UI Cleanup
    setShowSuggestions(false);
    setFilters({...filters, search: ''});
    
    // Reset Player
    audio.pause();
    if (hlsRef.current) { 
        hlsRef.current.destroy(); 
        hlsRef.current = null; 
    }
    
    // Set State
    setSelectedStation(station);
    setIsPlaying(false);
    setPlayStatus('buffering');
    
    if(!isPlayerExpanded) setIsPlayerExpanded(true);

    const url = station.url_resolved || station.url;
    
    const onPlay = () => { 
        setIsPlaying(true); 
        setPlayStatus('playing'); 
    };

    const handleError = (e) => {
        console.error("Audio Error:", e);
        setPlayStatus('error'); 
        setIsPlaying(false);
        toast.error(`Station Offline: ${station.name}`, {
            position: "bottom-center",
            autoClose: 2000,
            hideProgressBar: true,
            theme: "dark"
        });
    };

    audio.onerror = null;
    audio.oncanplay = null;
    audio.volume = isMuted ? 0 : volume;

    const isHls = url.includes('.m3u8') || station.type === 'Govt';

    if (Hls.isSupported() && isHls) {
        const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(url);
        hls.attachMedia(audio);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
            const playPromise = audio.play();
            if (playPromise !== undefined) playPromise.then(onPlay).catch(handleError);
        });
        hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) { hls.destroy(); handleError("HLS Fatal Error"); }
        });
        hlsRef.current = hls;
    } else {
        audio.src = url;
        audio.load();
        const playPromise = audio.play();
        if (playPromise !== undefined) playPromise.then(onPlay).catch(handleError);
        audio.onerror = handleError;
    }
  };

  const togglePlay = (e) => {
    e && e.stopPropagation();
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); } 
    else { 
        const playPromise = audioRef.current.play(); 
        if(playPromise !== undefined) playPromise.then(() => setIsPlaying(true)).catch(e => console.log("Play interrupted"));
    }
  };

  const playNext = () => {
      const idx = filteredStations.findIndex(s => s.uniqueId === selectedStation?.uniqueId);
      if(idx !== -1) playStation(filteredStations[(idx + 1) % filteredStations.length]);
  };

  const playPrev = () => {
      const idx = filteredStations.findIndex(s => s.uniqueId === selectedStation?.uniqueId);
      if(idx !== -1) playStation(filteredStations[(idx - 1 + filteredStations.length) % filteredStations.length]);
  };

  const handleVolumeChange = (e) => {
      const val = parseFloat(e.target.value);
      setVolume(val);
      if(val > 0) setIsMuted(false);
      if(audioRef.current) audioRef.current.volume = val;
  };

  const toggleMute = () => {
      if(isMuted) {
          setIsMuted(false);
          if(audioRef.current) audioRef.current.volume = volume;
      } else {
          setIsMuted(true);
          if(audioRef.current) audioRef.current.volume = 0;
      }
  };

  const toggleFavorite = (e, station) => {
      e && e.stopPropagation();
      let newFavs;
      if (favorites.includes(station.uniqueId)) {
          newFavs = favorites.filter(id => id !== station.uniqueId);
      } else {
          newFavs = [...favorites, station.uniqueId];
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
              if (audioRef.current) {
                  audioRef.current.pause();
                  setIsPlaying(false);
                  setSleepTimer(null);
                  toast.info("Sleep Timer: Radio Stopped", { theme: "dark" });
              }
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

  // --- COMPONENTS ---
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
                    <div 
                        key={opt} 
                        onClick={() => { 
                            onSelect(opt); 
                            setIsOpen(false); 
                        }} 
                        style={styles.dropdownItem}
                    >
                        {opt}
                    </div>
                ))}
            </div>
        )}
    </div>
  );

  return (
    <div style={styles.page}>
      <ToastContainer limit={1} />
      
      {/* HEADER */}
      <div style={styles.glassHeader}>
        <div style={styles.headerTop}>
            <button onClick={() => navigate('/dashboard')} style={styles.glassBtn}><IoMdArrowBack size={22}/></button>
            <div style={{textAlign:'center'}}>
                <div style={styles.logoText}>RADIO<span style={{color:'#4ade80'}}>X</span></div>
                <div style={styles.subText}>{filteredStations.length} Signals Active</div>
            </div>
            
            <div style={{display:'flex', gap:10}}>
                <button 
                    onClick={() => setFilters({...filters, favoritesOnly: !filters.favoritesOnly})} 
                    style={{...styles.glassBtn, background: filters.favoritesOnly ? '#ef4444' : 'rgba(255,255,255,0.08)'}}
                >
                    {filters.favoritesOnly ? <IoMdHeart size={20} color="#fff"/> : <IoMdHeartEmpty size={20}/>}
                </button>

                <button onClick={() => setViewMode(prev => prev === 'map' ? 'list' : 'map')} style={styles.glassBtn}>
                    {viewMode === 'map' ? <IoMdList size={22}/> : <IoMdGlobe size={22}/>}
                </button>
            </div>
        </div>

        {/* SEARCH BAR WITH SUGGESTIONS */}
        <div style={{position: 'relative'}}>
            <div style={styles.searchContainer}>
                <div style={styles.glassInputWrapper}>
                    <IoMdSearch size={18} color="rgba(255,255,255,0.6)"/>
                    <input 
                        placeholder="Search Station, City or State..." 
                        value={filters.search}
                        onChange={(e) => setFilters({...filters, search: e.target.value})}
                        style={styles.glassInput}
                    />
                    {filters.search.length > 0 && 
                        <IoMdClose 
                            style={{cursor:'pointer'}} 
                            onClick={()=>setFilters({...filters, search:''})}
                        />
                    }
                </div>
                <button onClick={() => setShowFilters(!showFilters)} style={{...styles.glassBtn, background: showFilters ? '#4ade80' : 'rgba(255,255,255,0.1)', color: showFilters ? '#000' : '#fff'}}>
                    <IoMdFunnel size={18}/>
                </button>
            </div>

            {/* SUGGESTIONS DROPDOWN */}
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
                <CustomDropdown label="Language" options={uniqueLanguages} current={filters.language} isOpen={langOpen} setIsOpen={(v)=>{setLangOpen(v); setStateOpen(false)}} onSelect={(val)=>setFilters({...filters, language: val})} />
                <div style={{width:1, background:'rgba(255,255,255,0.1)'}}></div>
                <CustomDropdown label="State" options={uniqueStates} current={filters.state} isOpen={stateOpen} setIsOpen={(v)=>{setStateOpen(v); setLangOpen(false)}} onSelect={(val)=>setFilters({...filters, state: val})} />
            </div>
        )}
      </div>

      {/* MAIN CONTENT */}
      <div style={styles.mainArea} onClick={() => { setLangOpen(false); setStateOpen(false); setShowSuggestions(false); }}>
        {loading ? (
            <div style={styles.loader}>
                <IoMdRefresh className="spin" size={40} color="#4ade80"/>
                <div style={{marginTop:10, fontSize:12, letterSpacing:1}}>CALIBRATING...</div>
            </div>
        ) : (
            <>
                {filteredStations.length === 0 ? (
                    <div style={styles.emptyState}>
                        <IoMdMusicalNote size={50} color="rgba(255,255,255,0.2)"/>
                        <p>No signals found matching "{filters.search}"</p>
                        <button onClick={()=>setFilters({search:'', state:'All', language:'All', favoritesOnly: false})} style={styles.resetBtn}>Reset Filters</button>
                    </div>
                ) : viewMode === 'map' ? (
                    <Globe
                        ref={globeEl}
                        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
                        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
                        
                        onZoom={({ altitude }) => {
                            if (altitude < 0.35 && showDots) setShowDots(false); 
                            else if (altitude >= 0.35 && !showDots) setShowDots(true);
                        }}

                        pointsData={showDots ? filteredStations : []}
                        pointLat="lat" pointLng="lng"
                        pointColor={d => d.uniqueId === selectedStation?.uniqueId ? '#4ade80' : (d.isLive ? '#60a5fa' : '#ef4444')}
                        pointAltitude={0.02} pointRadius={0.4}
                        onPointClick={playStation}

                        htmlElementsData={!showDots ? filteredStations : (selectedStation ? [selectedStation] : [])}
                        htmlLat="lat" htmlLng="lng" htmlAltitude={0.05}
                        htmlElement={(d) => {
                            const isSel = selectedStation?.uniqueId === d.uniqueId;
                            const el = document.createElement('div');
                            el.className = isSel ? 'map-marker-pulse' : 'map-marker-icon';
                            el.style.backgroundImage = `url(${d.icon})`;
                            el.onerror = () => { el.style.backgroundImage = `url(${DEFAULT_ICON})`; };
                            el.onclick = (e) => { e.stopPropagation(); playStation(d); };
                            return el;
                        }}
                        
                        atmosphereColor="#4ade80" atmosphereAltitude={0.15}
                    />
                ) : (
                    // GRID LAYOUT (SHOWN WHEN VIEWMODE IS NOT 'MAP')
                    <div style={styles.glassGrid}>
                        {filteredStations.map(s => (
                            <div key={s.uniqueId} onClick={() => playStation(s)} style={styles.glassCard}>
                                <div style={{position:'relative'}}>
                                    <img src={s.icon} onError={(e)=>{e.target.onerror=null; e.target.src=DEFAULT_ICON}} style={styles.cardImg} alt=""/>
                                    {s.uniqueId === selectedStation?.uniqueId && isPlaying && <div style={styles.playingOverlay}><IoMdPlay/></div>}
                                    
                                    <button 
                                        onClick={(e) => toggleFavorite(e, s)} 
                                        style={{...styles.gridFavBtn, color: favorites.includes(s.uniqueId) ? '#ef4444' : '#fff'}}
                                    >
                                        {favorites.includes(s.uniqueId) ? <IoMdHeart size={14}/> : <IoMdHeartEmpty size={14}/>}
                                    </button>
                                </div>
                                <div style={styles.cardText}>
                                    <div style={styles.cardTitle}>{s.name}</div>
                                    <div style={styles.cardSub}>{s.normalizedState}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </>
        )}
      </div>

      {/* MINI PLAYER */}
      {selectedStation && !isPlayerExpanded && (
        <div style={styles.miniGlassPlayer} onClick={() => setIsPlayerExpanded(true)}>
            <img src={selectedStation.icon} onError={(e)=>e.target.src=DEFAULT_ICON} style={styles.miniArt} />
            
            <div style={styles.miniInfo}>
                <div style={styles.miniTitle}>{selectedStation.name}</div>
                <div style={styles.miniStatus}>
                    {playStatus === 'playing' ? 'Live' : playStatus === 'error' ? 'Offline' : 'Loading...'}
                </div>
            </div>

            <div style={styles.miniControls}>
                <button onClick={(e)=>{e.stopPropagation(); playPrev()}} style={styles.miniBtn}><IoMdSkipBackward size={20}/></button>
                <button onClick={(e)=>{e.stopPropagation(); togglePlay()}} style={styles.neonPlayBtnSmall}>
                    {isPlaying ? <IoMdPause /> : <IoMdPlay style={{marginLeft:2}}/>}
                </button>
                <button onClick={(e)=>{e.stopPropagation(); playNext()}} style={styles.miniBtn}><IoMdSkipForward size={20}/></button>
            </div>
        </div>
      )}

      {/* FULL PLAYER */}
      <div style={{...styles.fullPlayer, top: isPlayerExpanded ? '0' : '100%'}}>
          <div style={{...styles.blurBg, backgroundImage: `url(${selectedStation?.icon || DEFAULT_ICON})`}}></div>
          <div style={styles.overlay}></div>
          <div style={styles.fullHeader}>
              <button onClick={() => setIsPlayerExpanded(false)} style={styles.glassBtn}><IoMdArrowDown size={24}/></button>
              <div style={styles.nowPlayingText}>NOW TUNED IN</div>
              <button onClick={shareStation} style={styles.glassBtn}><IoMdShare size={20}/></button>
          </div>

          <div style={styles.turntableArea}>
              <div style={{...styles.vinylDisc, animationPlayState: isPlaying ? 'running' : 'paused'}}>
                  <div style={styles.grooves}></div>
                  <div style={styles.shine}></div>
                  <div style={styles.labelContainer}>
                      <img src={selectedStation?.icon} onError={(e)=>e.target.src=DEFAULT_ICON} style={styles.vinylLabel} />
                  </div>
                  <div style={styles.spindle}></div>
              </div>
              <div style={{...styles.tonearm, transform: isPlaying ? 'rotate(25deg)' : 'rotate(-10deg)'}}>
                  <div style={styles.counterweight}></div>
                  <div style={styles.armShaft}></div>
                  <div style={styles.headshell}></div>
              </div>
          </div>

          <div style={styles.fullInfo}>
              <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginBottom:10}}>
                <h1 style={styles.fullTitle}>{selectedStation?.name}</h1>
                <button 
                    onClick={(e) => toggleFavorite(e, selectedStation)} 
                    style={{background:'transparent', border:'none', cursor:'pointer', color: favorites.includes(selectedStation?.uniqueId) ? '#ef4444' : '#fff'}}
                >
                    {favorites.includes(selectedStation?.uniqueId) ? <IoMdHeart size={28}/> : <IoMdHeartEmpty size={28}/>}
                </button>
              </div>
              
              <div style={styles.fullMeta}>
                  <span style={styles.tagBadge}>{selectedStation?.normalizedState || 'Internet Radio'}</span>
                  {selectedStation?.language && <span style={styles.tagBadge}>{selectedStation?.language}</span>}
              </div>
          </div>

          <div style={styles.auxControls}>
             <div style={styles.volumeContainer}>
                <button onClick={toggleMute} style={styles.iconBtn}>{isMuted ? <IoMdVolumeOff size={20}/> : <IoMdVolumeHigh size={20}/>}</button>
                <input 
                    type="range" min="0" max="1" step="0.05" 
                    value={isMuted ? 0 : volume} 
                    onChange={handleVolumeChange} 
                    style={styles.volumeSlider}
                />
             </div>
             
             <div style={{position:'relative'}}>
                <button onClick={() => setShowTimerMenu(!showTimerMenu)} style={{...styles.iconBtn, color: sleepTimer ? '#4ade80' : '#fff'}}>
                    <IoMdTime size={22}/>
                    {sleepTimer && <span style={styles.timerBadge}>{sleepTimer}m</span>}
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
          </div>

          <div style={styles.fullControls}>
              <button onClick={playPrev} style={styles.glassControlBtn}><IoMdSkipBackward size={26}/></button>
              <button onClick={togglePlay} style={styles.neonPlayBtnLarge}>
                  {isPlaying ? <IoMdPause size={35} color="#000"/> : <IoMdPlay size={35} color="#000" style={{marginLeft:4}}/>}
              </button>
              <button onClick={playNext} style={styles.glassControlBtn}><IoMdSkipForward size={26}/></button>
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
  
  // SUGGESTIONS
  suggestionsBox: { position:'absolute', top:'100%', left:0, right:50, background:'#18181b', borderRadius:12, border:'1px solid #333', marginTop:5, zIndex:300, boxShadow:'0 10px 40px rgba(0,0,0,0.8)' },
  suggestionItem: { display:'flex', alignItems:'center', padding:10, borderBottom:'1px solid rgba(255,255,255,0.05)', cursor:'pointer' },

  glassPanel: { background: 'rgba(30,30,30,0.9)', backdropFilter: 'blur(25px)', padding: 5, borderRadius: 12, display: 'flex', gap: 5, border: '1px solid rgba(255,255,255,0.1)', position: 'relative', zIndex: 100 },
  dropdownBtn: { background: 'transparent', border: 'none', width: '100%', textAlign: 'left', padding: '8px 12px', color: '#fff', display: 'flex', flexDirection: 'column', cursor: 'pointer' },
  dropdownList: { position: 'absolute', top: '110%', left: 0, right: 0, background: '#18181b', borderRadius: 12, border: '1px solid #333', maxHeight: '300px', overflowY: 'auto', zIndex: 200, padding: 5, boxShadow: '0 10px 40px rgba(0,0,0,0.8)' },
  dropdownItem: { padding: '10px', fontSize: 13, color: '#d4d4d8', borderRadius: 8, cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.03)' },

  mainArea: { flex: 1, position: 'relative', overflow: 'hidden' },
  emptyState: { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', color:'#52525b', gap:10 },
  resetBtn: { padding: '8px 16px', borderRadius: 8, background: '#4ade80', border:'none', fontWeight:'600', cursor:'pointer' },

  // GRID
  glassGrid: { padding: '130px 15px 120px 15px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 15, overflowY: 'auto', height: '100%' },
  glassCard: { background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)', backdropFilter: 'blur(10px)', borderRadius: '16px', padding: 12, border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, cursor: 'pointer', position:'relative' },
  cardImg: { width: 50, height: 50, borderRadius: '50%', objectFit: 'cover', background: '#000', border:'2px solid rgba(255,255,255,0.1)' },
  gridFavBtn: { position: 'absolute', top: 5, right: 5, background: 'rgba(0,0,0,0.5)', borderRadius:'50%', width:24, height:24, border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' },
  cardText: { textAlign: 'center' },
  cardTitle: { fontSize: 12, fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '90px' },
  cardSub: { fontSize: 10, color: '#71717a' },
  playingOverlay: { position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', width: 50, height: 50, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4ade80' },

  miniGlassPlayer: { 
      position: 'absolute', 
      bottom: 20, 
      left: 15, right: 15, height: 75, 
      background: 'rgba(20,20,20,0.85)', backdropFilter: 'blur(25px)', 
      borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', 
      display: 'flex', alignItems: 'center', padding: '0 15px', gap: 15, 
      boxShadow: '0 20px 40px rgba(0,0,0,0.6)', zIndex: 50 
  },
  miniArt: { width: 45, height: 45, borderRadius: '12px', objectFit: 'cover' },
  miniInfo: { flex: 1, overflow: 'hidden' },
  miniTitle: { fontSize: 14, fontWeight: '700' },
  miniStatus: { fontSize: 11, color: '#4ade80' },
  miniControls: { display: 'flex', alignItems: 'center', gap: 12 }, 
  miniBtn: { background:'transparent', border:'none', color:'#fff', display:'flex', cursor:'pointer' }, 
  neonPlayBtnSmall: { width: 45, height: 45, borderRadius: '50%', border: 'none', background: '#fff', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },

  fullPlayer: { position: 'fixed', inset: 0, zIndex: 100, background: '#000', display: 'flex', flexDirection: 'column', transition: 'top 0.4s cubic-bezier(0.16, 1, 0.3, 1)', overflow: 'hidden' },
  blurBg: { position: 'absolute', inset: -50, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(60px)', opacity: 0.3, transition: 'background-image 0.5s' },
  overlay: { position: 'absolute', inset: 0, background: 'linear-gradient(to top, #09090b 10%, rgba(9,9,11,0.5) 100%)' },
  fullHeader: { position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 25px' },
  nowPlayingText: { fontSize: 11, letterSpacing: 3, fontWeight: '600', opacity: 0.8 },

  turntableArea: { flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, perspective: '1000px' },
  vinylDisc: { width: '280px', height: '280px', borderRadius: '50%', background: '#111', boxShadow: '0 30px 60px rgba(0,0,0,0.8), inset 0 0 0 2px #222', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', animation: 'spin 5s linear infinite', transition: 'box-shadow 0.3s' },
  grooves: { position: 'absolute', inset: 5, borderRadius: '50%', background: 'repeating-radial-gradient(#18181b, #18181b 3px, #27272a 4px)', opacity: 0.8 },
  shine: { position: 'absolute', inset: 0, borderRadius: '50%', background: 'linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%)', pointerEvents: 'none' },
  labelContainer: { zIndex: 5, padding: 4, background: '#000', borderRadius: '50%' },
  vinylLabel: { width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover' },
  spindle: { position: 'absolute', width: 12, height: 12, background: '#e4e4e7', borderRadius: '50%', zIndex: 10, boxShadow: 'inset 0 -2px 5px rgba(0,0,0,0.5)' },
  tonearm: { position: 'absolute', top: -30, right: 20, width: 20, height: 260, zIndex: 20, transformOrigin: 'top center', transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' },
  armShaft: { width: 6, height: '100%', background: 'linear-gradient(90deg, #d4d4d8, #a1a1aa)', margin: '0 auto', borderRadius: 4 },
  counterweight: { width: 34, height: 40, background: '#3f3f46', position: 'absolute', top: 0, left: -7, borderRadius: 4, boxShadow: '0 5px 10px rgba(0,0,0,0.5)' },
  headshell: { width: 24, height: 45, background: '#18181b', position: 'absolute', bottom: 0, left: -3, borderRadius: 4, transform: 'rotate(25deg)' },

  fullInfo: { position: 'relative', zIndex: 10, textAlign: 'center', marginBottom: 20, padding: '0 30px' },
  fullTitle: { fontSize: 22, fontWeight: '800', lineHeight: 1.3 },
  fullMeta: { display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginTop: 10 },
  tagBadge: { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.05)', padding: '6px 14px', borderRadius: '100px', fontSize: 11, fontWeight: '600' },

  auxControls: { position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 30px', marginBottom: 30 },
  volumeContainer: { display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.1)', padding: '8px 15px', borderRadius: 20 },
  volumeSlider: { width: 80, accentColor: '#4ade80', height: 4 },
  iconBtn: { background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 },
  timerBadge: { fontSize: 10, background: '#4ade80', color: '#000', padding: '2px 5px', borderRadius: 4, fontWeight: '700' },
  
  timerMenu: { position: 'absolute', bottom: '120%', right: 0, background: '#18181b', padding: 15, borderRadius: 12, width: 200, border: '1px solid #333' },
  timerHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 12, fontWeight: '700', color: '#a1a1aa' },
  timerGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 },
  timerOpt: { background: '#27272a', border: 'none', color: '#fff', padding: 8, borderRadius: 6, fontSize: 12, cursor: 'pointer' },

  fullControls: { position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 35, marginBottom: 50 },
  glassControlBtn: { background: 'rgba(255,255,255,0.1)', width: 60, height: 60, borderRadius: '50%', border: 'none', color: '#fff', cursor: 'pointer', display:'flex', alignItems:'center', justifyContent:'center' },
  neonPlayBtnLarge: { width: 85, height: 85, borderRadius: '50%', border: 'none', background: '#4ade80', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(74, 222, 128, 0.3)', cursor: 'pointer', transform: 'scale(1)', transition: 'transform 0.1s' },
  loader: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }
};

const styleSheet = document.createElement("style");
styleSheet.innerText = `
  .map-marker-pulse { 
      transform: translate(-50%, -50%); 
      width: 40px; height: 40px; 
      border-radius: 50%; 
      background-size: cover; 
      border: 2px solid #fff;
      box-shadow: 0 0 20px #4ade80;
      animation: pulse 2s infinite;
      cursor: pointer;
  }
  .map-marker-icon {
      transform: translate(-50%, -50%);
      width: 24px; height: 24px;
      border-radius: 50%;
      background-size: cover;
      border: 1.5px solid rgba(255,255,255,0.8);
      cursor: pointer;
      transition: all 0.2s;
  }
  .map-marker-icon:hover {
      width: 32px; height: 32px;
      z-index: 100;
      border-color: #4ade80;
  }
  @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.7); } 70% { box-shadow: 0 0 0 15px rgba(74, 222, 128, 0); } 100% { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0); } }
  .spin { animation: spin 1s linear infinite; }
  @keyframes spin { 100% { transform: rotate(360deg); } }
`;
document.head.appendChild(styleSheet);

export default Radio;