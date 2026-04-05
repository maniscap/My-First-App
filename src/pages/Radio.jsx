import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import Hls from 'hls.js';
import { useNavigate } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  IoMdArrowBack, IoMdPause, IoMdPlay, IoMdSkipBackward, IoMdSkipForward, 
  IoMdSearch, IoMdArrowDown, IoMdRefresh,
  IoMdMusicalNote, IoMdHeart, IoMdHeartEmpty, IoMdTime,
  IoMdShare, IoMdClose, IoMdList, IoMdVolumeHigh, IoMdVolumeOff
} from 'react-icons/io';

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

// --- SMART DEFAULTS ---
const INDIAN_LANGUAGES = ['Assamese', 'Bengali', 'Gujarati', 'Hindi', 'Kannada', 'Malayalam', 'Marathi', 'Odia', 'Punjabi', 'Tamil', 'Telugu', 'Urdu'];

const getInitialState = () => {
    const savedLoc = localStorage.getItem('userLocation') || "";
    for (const st of Object.keys(STATE_LOCATIONS)) {
        if (savedLoc.includes(st)) return st;
    }
    return 'Maharashtra';
};

// --- PREMIUM HAPTIC ENGINE ---
const triggerHaptic = (type = 'light') => {
    try {
        if (!navigator.vibrate) return;
        if (type === 'light') navigator.vibrate(40);
        if (type === 'medium') navigator.vibrate(80);
        if (type === 'heavy') navigator.vibrate([60, 50, 60]);
    } catch(e) {}
};

// --- DYNAMIC COLOR GENERATOR ---
const getStationColor = (name) => {
    if (!name) return '#4ade80';
    const colors = ['#4ade80', '#60a5fa', '#c084fc', '#fbbf24', '#f87171', '#34d399', '#2dd4bf', '#ff9800'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
};

// --- GLOBAL SINGLETONS ---
window.globalAudio = window.globalAudio || new Audio();
const globalAudio = window.globalAudio;
let globalHls = null;
let globalCurrentStation = null;

// --- PROFESSIONAL EQ ANIMATION WIDGET ---
const MiniEqualizer = () => (
    <div style={{display:'flex', alignItems:'flex-end', gap:'3px', height:'14px', margin:'0 4px'}}>
        <div className="eq-bar" style={{animationDuration:'0.7s'}}></div>
        <div className="eq-bar" style={{animationDuration:'0.5s'}}></div>
        <div className="eq-bar" style={{animationDuration:'0.9s'}}></div>
        <div className="eq-bar" style={{animationDuration:'0.6s'}}></div>
    </div>
);

const Radio = () => {
  const navigate = useNavigate();
  const timerRef = useRef(null);

  // --- STATE ---
  const [allStations, setAllStations] = useState([]);
  const [filteredStations, setFilteredStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const [recentStations, setRecentStations] = useState(() => {
      const saved = localStorage.getItem('radio_recents');
      return saved ? JSON.parse(saved) : [];
  });
  const [favorites, setFavorites] = useState(() => {
      const saved = localStorage.getItem('radio_favorites');
      return saved ? JSON.parse(saved) : [];
  });
  const [showTimerMenu, setShowTimerMenu] = useState(false);
  const [sleepTimer, setSleepTimer] = useState(null);
  const [activeSelect, setActiveSelect] = useState(null);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isMuted, setIsMuted] = useState(globalAudio.muted);
  
  const [viewMode, setViewMode] = useState('all'); // 'all', 'favorites', 'recents'
  
  const stationsRef = useRef([]);

  // FORCE CACHE BUST: Unregister stuck Service Workers holding onto the old code
  useEffect(() => {
      if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistrations().then((registrations) => {
              for (let registration of registrations) {
                  registration.unregister();
              }
          });
      }
  }, []);

  useEffect(() => {
      stationsRef.current = filteredStations;
  }, [filteredStations]);

  // --- PLAYER STATE ---
  const [selectedStation, setSelectedStation] = useState(globalCurrentStation);
  const [isPlaying, setIsPlaying] = useState(!globalAudio.paused); 
  const [filters, setFilters] = useState({ search: '', state: getInitialState(), language: 'Hindi' });

  // --- BACK NAVIGATION LOGIC ---
  const handleBack = () => {
    if (activeSelect) {
      setActiveSelect(null);
    } else if (showSuggestions || filters.search) {
      setShowSuggestions(false);
      setFilters({ ...filters, search: '' });
    } else if (viewMode !== 'all') {
      setViewMode('all');
    } else if (hasFetched) {
      setHasFetched(false);
      setAllStations([]);
    } else {
      navigate('/dashboard');
    }
  };

  const handleFullPlayerBack = () => {
    if (showTimerMenu) {
      setShowTimerMenu(false);
    } else {
      setIsPlayerExpanded(false);
    }
  };

  // --- PLAY/PAUSE LOGIC ---
  const togglePlay = (e) => {
    if (e) {
        e.stopPropagation();
        e.preventDefault();
    }
    
    if (isPlaying) {
        setIsPlaying(false);
        globalAudio.pause();
        triggerHaptic('light');
    } else {
        setIsPlaying(true);
        const playPromise = globalAudio.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                if (error.name !== 'AbortError') {
                    console.error("Playback failed:", error);
                    setIsPlaying(false); 
                    toast.error("Stream connection failed");
                }
            });
        }
        triggerHaptic('medium');
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
      const onPlaying = () => {
          setIsBuffering(false);
          if (window.radioTuningTimeout) {
              clearTimeout(window.radioTuningTimeout);
              window.radioTuningTimeout = null;
          }
      };
      const onWaiting = () => setIsBuffering(true);
      
      globalAudio.addEventListener('play', onPlay);
      globalAudio.addEventListener('pause', onPause);
      globalAudio.addEventListener('playing', onPlaying);
      globalAudio.addEventListener('waiting', onWaiting);
      
      return () => {
          globalAudio.removeEventListener('play', onPlay);
          globalAudio.removeEventListener('pause', onPause);
          globalAudio.removeEventListener('playing', onPlaying);
          globalAudio.removeEventListener('waiting', onWaiting);
      };
  }, [isPlayerExpanded]); 

  // --- MEDIASESSION API (LOCK SCREEN CONTROLS) ---
  useEffect(() => {
      if ('mediaSession' in navigator && selectedStation) {
          navigator.mediaSession.metadata = new window.MediaMetadata({
              title: selectedStation.name,
              artist: selectedStation.normalizedState || 'FarmCap Radio',
              album: 'Live Airwaves',
              artwork: [
                  { src: selectedStation.icon || DEFAULT_ICON, sizes: '96x96', type: 'image/png' },
                  { src: selectedStation.icon || DEFAULT_ICON, sizes: '512x512', type: 'image/png' }
              ]
          });
          navigator.mediaSession.setActionHandler('play', () => {
              globalAudio.play(); setIsPlaying(true);
          });
          navigator.mediaSession.setActionHandler('pause', () => {
              globalAudio.pause(); setIsPlaying(false);
          });
          navigator.mediaSession.setActionHandler('previoustrack', () => playPrev());
          navigator.mediaSession.setActionHandler('nexttrack', () => playNext());
      }
  }, [selectedStation]);

  // --- MANUAL EXPLICIT FETCH LOGIC ---
  const fetchDynamicData = async () => {
      setLoading(true);
      try {
        // The 3 most reliable main servers
        const API_ENDPOINTS = [
            "https://de1.api.radio-browser.info/json/stations",
            "https://at1.api.radio-browser.info/json/stations",
            "https://nl1.api.radio-browser.info/json/stations"
        ];

          const fetchFromEndpoint = async (endpoint) => {
              const buildPayload = (extraParams) => {
                  const params = new URLSearchParams();
                  params.append('countrycode', 'IN');
                  params.append('hidebroken', 'true');
                  params.append('lastcheckok', '1');
                  if (window.location.protocol === 'https:') {
                      params.append('is_https', '1');
                  }
                  params.append('state', filters.state);
                  params.append('language', filters.language.toLowerCase());
                  
                  Object.entries(extraParams).forEach(([k, v]) => params.append(k, v));
                  return params;
              };

              const postData = async (payload) => {
                  try {
                      // Using POST bypasses Service Worker interceptors that break on GET requests
                      const response = await axios.post(`${endpoint}/search`, payload);
                      return { data: response.data };
                  } catch (e) {
                      console.warn(`Fetch failed for ${endpoint}:`, e);
                      return { data: [] };
                  }
              };

              const reqs = [
                  postData(buildPayload({ order: 'clickcount', reverse: 'true', limit: '100' })),
                  postData(buildPayload({ name: 'Akashvani' })),
                  postData(buildPayload({ name: 'All India Radio' })),
                  postData(buildPayload({ tag: 'kisan' }))
              ];
              
              const results = await Promise.all(reqs);
              
              // Validates if at least one sub-query returned stations
              const totalCount = results.reduce((acc, r) => acc + (r.data?.length || 0), 0);
              if (totalCount === 0) throw new Error(`No valid data from ${endpoint}`);
              
              return results;
          };

        // SEQUENTIAL FALLBACK: Try endpoints one by one instead of all at once
        let res = null;
        for (const ep of API_ENDPOINTS) {
            try {
                res = await fetchFromEndpoint(ep);
                if (res) break; // Success! Stop trying other endpoints
            } catch (err) {
                console.warn(`Endpoint ${ep} failed, trying next...`);
            }
        }

        if (!res) {
            throw new Error("All radio endpoints failed to respond");
        }

        // Safe flatMap alternative for older phones
        const rawList = res.reduce((acc, r) => acc.concat(r.data || []), []);
        const processedMap = new Map();
        
        rawList.forEach(s => {
           // STRICT ONLINE CHECK - Front-end filter to drop any offline streams
           if ((!s.url_resolved && !s.url) || s.lastcheckok !== 1) return;
           
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

           // If API has no coordinates, use Smart State Fallback
           if (!lat || !lng || (Math.abs(lat) < 1 && Math.abs(lng) < 1)) {
               if (normalizedState && STATE_LOCATIONS[normalizedState]) {
                   lat = STATE_LOCATIONS[normalizedState].lat + (Math.random() * 0.5 - 0.25);
                   lng = STATE_LOCATIONS[normalizedState].lng + (Math.random() * 0.5 - 0.25);
               } else {
                   lat = 22 + (Math.random() * 5 - 2.5);
                   lng = 79 + (Math.random() * 5 - 2.5);
               }
           }

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
        setHasFetched(true);
        setLoading(false);
      } catch (err) { 
        console.error(err); 
        setLoading(false);
        toast.error("Failed to connect to airwaves.");
      }
  };

  // --- LOCAL FILTERING (Search & Favorites) ---
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
    
    if (viewMode === 'favorites') {
        result = result.filter(s => favorites.includes(s.uniqueId));
    } else if (viewMode === 'recents') {
        result = recentStations;
    }
    
    setFilteredStations(result);
  }, [filters.search, viewMode, allStations, favorites, recentStations]);

  // --- PLAY ENGINE ---
  const playStation = async (station) => {
    if (!station) return;
    globalCurrentStation = station;
    setSelectedStation(station);
    
    globalAudio.pause();
    globalAudio.removeAttribute('src'); // Flush the old buffer properly
    if (globalHls) { globalHls.destroy(); globalHls = null; }
    
    setShowSuggestions(false);
    setFilters({...filters, search: ''});
    setIsPlaying(false); 
    setIsBuffering(true);

    // Save to Recently Played
    const newRecents = [station, ...recentStations.filter(s => s.uniqueId !== station.uniqueId)].slice(0, 15);
    setRecentStations(newRecents);
    localStorage.setItem('radio_recents', JSON.stringify(newRecents));
    
    const url = station.url_resolved || station.url;

    const handleStreamFailure = () => {
        setIsBuffering(false);
        if (window.radioTuningTimeout) {
            clearTimeout(window.radioTuningTimeout);
            window.radioTuningTimeout = null;
        }
        
        // Remove the broken station from the list so it doesn't show up again
        setAllStations(prev => prev.filter(s => s.uniqueId !== station.uniqueId));
        
        const currentList = stationsRef.current.filter(s => s.uniqueId !== station.uniqueId);
        
        if (currentList.length > 0) {
            toast.error("Weak signal. Auto-tuning next...", { theme: 'dark', autoClose: 2000, toastId: 'tuning-error' });
            
            // Find what was next in the original list
            const originalIdx = stationsRef.current.findIndex(s => s.uniqueId === station.uniqueId);
            const nextIdx = originalIdx !== -1 ? originalIdx % currentList.length : 0;
            const nextStationToPlay = currentList[nextIdx];

            setTimeout(() => playStation(nextStationToPlay), 300);
        } else {
            toast.error("All stations offline.", { theme: 'dark' });
            setIsPlaying(false);
            globalAudio.pause();
        }
    };

    if (window.radioTuningTimeout) clearTimeout(window.radioTuningTimeout);
    window.radioTuningTimeout = setTimeout(() => {
        handleStreamFailure();
    }, 8000); // Reduce timeout to 8 seconds for a snappier experience

    // FIX: Only use HLS for actual .m3u8 streams. Forcing Govt stations to HLS caused parsing errors and massive delays.
    const isHls = url.includes('.m3u8');

    if (Hls.isSupported() && isHls) {
        globalHls = new Hls({ 
            enableWorker: true, 
            lowLatencyMode: true,
            liveSyncDurationCount: 2,
            liveMaxLatencyDurationCount: 3,
            maxBufferLength: 3, // Aggressively reduced buffer to start audio almost instantly
            maxMaxBufferLength: 5
        });
        globalHls.loadSource(url);
        globalHls.attachMedia(globalAudio);
        globalHls.on(Hls.Events.MANIFEST_PARSED, () => {
            globalAudio.play().catch(e => {
                if (e.name !== 'AbortError') {
                    console.error("Auto-play prevented", e);
                    handleStreamFailure();
                }
            });
        });
        globalHls.on(Hls.Events.ERROR, function (event, data) {
            if (data.fatal) {
                handleStreamFailure();
            }
        });
    } else {
        globalAudio.src = url;
        globalAudio.preload = "auto";
        const playPromise = globalAudio.play();
        if (playPromise !== undefined) {
            playPromise.catch(e => {
                if (e.name !== 'AbortError') {
                    console.error("Stream load error", e);
                    handleStreamFailure();
                }
            });
        }
    }
  };

  const playNext = (e) => {
      e && e.stopPropagation();
      const currentList = stationsRef.current.length > 0 ? stationsRef.current : filteredStations;
      const idx = currentList.findIndex(s => s.uniqueId === selectedStation?.uniqueId);
      if(idx !== -1) playStation(currentList[(idx + 1) % currentList.length]);
      triggerHaptic('light');
  };

  const playPrev = (e) => {
      e && e.stopPropagation();
      const currentList = stationsRef.current.length > 0 ? stationsRef.current : filteredStations;
      const idx = currentList.findIndex(s => s.uniqueId === selectedStation?.uniqueId);
      if(idx !== -1) playStation(currentList[(idx - 1 + currentList.length) % currentList.length]);
      triggerHaptic('light');
  };

  const miniPlayerSwipeHandlers = useSwipeable({
    onSwipedLeft: () => playNext(),
    onSwipedRight: () => playPrev(),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
    delta: 10, 
  });

  const toggleMute = (e) => {
      e && e.stopPropagation();
      const nextMuted = !isMuted;
      setIsMuted(nextMuted);
      globalAudio.muted = nextMuted;
      triggerHaptic('light');
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
      triggerHaptic('heavy');
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
          const text = `Listening to ${selectedStation.name} on FarmCap Radio!`;
          if (navigator.share) {
              navigator.share({ title: 'FarmCap Radio', text: text, url: window.location.href });
          } else {
              navigator.clipboard.writeText(text);
              toast.success("Station copied!", { theme: "dark", autoClose: 1000 });
          }
      }
  };

  const uniqueStatesList = useMemo(() => Object.keys(STATE_LOCATIONS).sort(), []);
  const uniqueLangList = INDIAN_LANGUAGES;
  
  const activeColor = getStationColor(selectedStation?.name);

  return (
    <div style={styles.page}>
      <ToastContainer limit={1} position="top-center" />
      
      <div style={styles.mobileWrapper}>
      {/* HEADER */}
      <div style={styles.glassHeader}>
        <div style={styles.headerTop}>
            <button onClick={handleBack} style={styles.glassBtn}><IoMdArrowBack size={22}/></button>
            <div style={{textAlign:'center'}}>
                <div style={styles.logoText}>FARMCAP <span style={{color:'#4ade80'}}>Radio</span></div>
                <div style={styles.subText}>{hasFetched ? `${filteredStations.length} Signals Active` : 'Awaiting Calibration...'}</div>
            </div>
            <div style={{display:'flex', gap:10}}>
                {hasFetched && (
                    <button onClick={fetchDynamicData} disabled={loading} style={{...styles.glassBtn, opacity: loading ? 0.5 : 1}} title="Refresh Signals">
                        <IoMdRefresh size={20} color="#fff" className={loading ? "spin" : ""}/>
                    </button>
                )}
                <button onClick={() => setViewMode(viewMode === 'recents' ? 'all' : 'recents')} style={{...styles.glassBtn, background: viewMode === 'recents' ? '#3b82f6' : 'rgba(255,255,255,0.1)'}} title="Recently Played">
                    <IoMdTime size={20} color="#fff"/>
                </button>
                <button onClick={() => setViewMode(viewMode === 'favorites' ? 'all' : 'favorites')} style={{...styles.glassBtn, background: viewMode === 'favorites' ? '#ef4444' : 'rgba(255,255,255,0.1)'}} title="Favorites">
                    {viewMode === 'favorites' ? <IoMdHeart size={20} color="#fff"/> : <IoMdHeartEmpty size={20} color="#fff"/>}
                </button>
            </div>
        </div>

        {/* SEARCH (ONLY SHOW IF FETCHED) */}
        {hasFetched && (
          <div style={{position: 'relative', marginTop: 10}}>
            <div style={styles.searchContainer}>
                <div style={styles.glassInputWrapper}>
                    <IoMdSearch size={18} color="rgba(255,255,255,0.6)"/>
                    <input placeholder="Search Station, City or State..." value={filters.search} onChange={(e) => setFilters({...filters, search: e.target.value})} style={styles.glassInput} className="glass-input"/>
                    {filters.search.length > 0 && <IoMdClose color="#fff" style={{cursor:'pointer'}} onClick={()=>setFilters({...filters, search:''})} />}
                </div>
            </div>
            {showSuggestions && suggestions.length > 0 && (
                <div style={styles.suggestionsBox}>
                    {suggestions.map((s, i) => (
                        <div key={i} style={styles.suggestionItem} className="dropdown-item-hover" onClick={() => playStation(s)}>
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
        )}
      </div>

      {/* GRID (FIXED: SCROLL & SMALL CARDS) */}
      <div style={styles.mainArea} onClick={() => { setShowSuggestions(false); }}>
        {!hasFetched ? (
            <div style={styles.tunerWrapper}>
                <div style={styles.tunerCard}>
                    <div style={styles.tunerHeader}>
                        <div style={styles.tunerIconBox}>
                            <IoMdMusicalNote size={32} color="#4ade80" />
                        </div>
                        <h2 style={styles.tunerTitle}>Calibrate Signal</h2>
                        <p style={styles.tunerDesc}>Select region and language to scan frequencies</p>
                    </div>

                    <div style={styles.tunerField}>
                        <label style={styles.tunerLabel}>Language</label>
                        <div onClick={() => setActiveSelect('language')} style={styles.tunerSelect}>
                            <span>{filters.language}</span>
                            <IoMdArrowDown size={18} color="rgba(255,255,255,0.5)" />
                        </div>
                    </div>

                    <div style={styles.tunerField}>
                        <label style={styles.tunerLabel}>State / Region</label>
                        <div onClick={() => setActiveSelect('state')} style={styles.tunerSelect}>
                            <span>{filters.state}</span>
                            <IoMdArrowDown size={18} color="rgba(255,255,255,0.5)" />
                        </div>
                    </div>

                    <button onClick={fetchDynamicData} disabled={loading} style={styles.scanBtn}>
                        {loading ? <IoMdRefresh className="spin" size={20} /> : <IoMdSearch size={20} />}
                        {loading ? 'SCANNING AIRWAVES...' : 'FETCH STATIONS'}
                    </button>
                </div>
            </div>
        ) : (
            <div style={styles.glassGrid}>
                {filteredStations.length === 0 ? (
                    <div style={styles.emptyState}>
                        <IoMdMusicalNote size={50} color="rgba(255,255,255,0.2)"/>
                        <p>No signals found.</p>
                        <button onClick={()=>{setFilters({search:'', state:getInitialState(), language:'Hindi'}); setViewMode('all');}} style={styles.resetBtn}>Reset Filters</button>
                    </div>
                ) : (
                    filteredStations.map(s => (
                        <div key={s.uniqueId} onClick={() => playStation(s)} style={styles.glassCard} className="glass-card-hover">
                            <div style={{position:'relative'}}>
                                <img src={s.icon} onError={(e)=>{e.target.onerror=null; e.target.src=DEFAULT_ICON}} style={styles.cardImg} alt=""/>
                                {s.uniqueId === selectedStation?.uniqueId && isPlaying && <div style={styles.playingOverlay}><MiniEqualizer/></div>}
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
                <div style={{...styles.miniStatus, display:'flex', alignItems:'center'}}>
                     {isPlaying ? <><MiniEqualizer /> <span style={{color: activeColor, marginLeft:'5px', fontWeight:'700'}}>{isBuffering ? 'TUNING...' : 'LIVE'}</span></> : <><span style={{color: '#ef4444', marginRight:'5px'}}>●</span> PAUSED</>}
                </div>
            </div>
            
            <div style={styles.miniControls}>
                <button onClick={playPrev} style={styles.miniBtn}><IoMdSkipBackward size={22}/></button>
                <button onClick={(e) => togglePlay(e)} style={{...styles.neonPlayBtnSmall, color: activeColor, borderColor: `${activeColor}66`, background: `${activeColor}22`, boxShadow: `0 5px 15px ${activeColor}33`}}>
                    {isPlaying ? <IoMdPause color={activeColor} /> : <IoMdPlay color={activeColor} style={{marginLeft:2}}/>}
                </button>
                <button onClick={playNext} style={styles.miniBtn}><IoMdSkipForward size={22}/></button>
            </div>
        </div>
      )}

      {/* FULL PLAYER */}
      <div style={{...styles.fullPlayer, top: isPlayerExpanded ? '0' : '100%'}}>
          
          <div style={{...styles.bgImage, backgroundImage: `url(${selectedStation?.icon || STUDIO_BG})`}}></div>
          <div style={styles.overlayGradient}></div>
          
          <div style={styles.fullPlayerSafeArea}>
              <div style={styles.fullHeader}>
                  <div style={styles.glassCapsuleHeader}>
                      <button onClick={handleFullPlayerBack} style={styles.transparentBtn}><IoMdArrowBack size={24} color="#fff"/></button>
                      <div style={styles.nowPlayingText}>🧢 FARMCAP Radio</div>
                      <button onClick={toggleMute} style={styles.transparentBtn}>
                          {isMuted ? <IoMdVolumeOff size={22} color="#ef4444"/> : <IoMdVolumeHigh size={22} color="#fff"/>}
                      </button>
                  </div>
              </div>

              {/* MUSIC PLAYER TURNTABLE */}
              <div style={styles.discWrapper}>
                  {/* DYNAMIC GLOW AURA */}
                  <div style={{...styles.recordAura, background: `radial-gradient(circle, ${activeColor}66 0%, transparent 70%)`, opacity: isPlaying ? 1 : 0, transform: isPlaying ? 'scale(1.1)' : 'scale(0.8)'}}></div>
                  
                  {/* 3D TONEARM */}
                  <div style={{...styles.toneArm, transform: isPlaying ? 'rotate(18deg)' : 'rotate(0deg)'}}>
                      <div style={styles.toneArmBase}></div>
                      <div style={styles.toneArmRod}></div>
                      <div style={styles.toneArmHead}></div>
                      <div style={styles.toneArmNeedle}></div>
                  </div>

                  <div style={{
                      ...styles.recordDisc,
                      transform: isPlaying ? 'scale(1)' : 'scale(0.95)',
                      animationPlayState: isPlaying ? 'running' : 'paused'
                  }}>
                      <div style={styles.recordGrooves}></div>
                      <div style={styles.recordShine}></div>
                      <div style={styles.recordCenter}>
                          <img src={selectedStation?.icon} onError={(e)=>e.target.src=DEFAULT_ICON} style={styles.recordImg} alt="Artwork" />
                          <div style={styles.recordCenterHole}></div>
                      </div>
                  </div>
              </div>

              {/* SMALL CENTRAL CONTROL CARD (Horizontal & Compact) */}
              <div style={{...styles.smallControlCard, boxShadow: `0 30px 60px rgba(0,0,0,0.8), 0 0 30px ${activeColor}33, inset 0 1px 1px rgba(255,255,255,0.2)`}}>
                  
                  {/* Top Row: Info & Playback Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                      <div style={{flex: 1, overflow: 'hidden', paddingRight: '15px', position: 'relative'}}>
                          <div style={styles.playerTitleContainer}>
                              <h1 className={selectedStation?.name?.length > 15 ? 'marquee-text' : ''} style={styles.playerTitle}>{selectedStation?.name}</h1>
                          </div>
                          <p style={styles.playerSub}>{selectedStation?.normalizedState || 'Internet Radio'}</p>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <button onClick={playPrev} style={styles.controlBtnSecondary}><IoMdSkipBackward size={26}/></button>
                          <button onClick={(e) => togglePlay(e)} style={styles.playBtnGlass}>
                              {isPlaying ? <IoMdPause size={26} color="#000"/> : <IoMdPlay size={26} color="#000" style={{marginLeft:4}}/>}
                          </button>
                          <button onClick={playNext} style={styles.controlBtnSecondary}><IoMdSkipForward size={26}/></button>
                      </div>
                  </div>

                  {/* Middle Row: Live Progress & Favorite */}
                  <div style={styles.liveProgressArea}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span className={isBuffering ? "pulse-text" : ""} style={{...styles.liveTimeText, color: isPlaying ? activeColor : 'rgba(255,255,255,0.5)'}}>{isBuffering ? 'TUNING' : 'LIVE'}</span>
                          <div style={{flex: 1, ...styles.liveTrack}}>
                              <div style={{...styles.liveTrackFill, background: activeColor, animationPlayState: isPlaying ? 'running' : 'paused'}}></div>
                          </div>
                          <button onClick={(e) => toggleFavorite(e, selectedStation)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                              {favorites.includes(selectedStation?.uniqueId) ? <IoMdHeart color={activeColor} size={22}/> : <IoMdHeartEmpty color="rgba(255,255,255,0.7)" size={22}/>}
                          </button>
                      </div>
                  </div>

                  {/* Added Row: Sleep Timer inside the card */}
                  <div style={{display:'flex', justifyContent:'center', marginTop:'5px', position:'relative'}}>
                       <button onClick={() => setShowTimerMenu(!showTimerMenu)} style={{...styles.transparentBtn, color: sleepTimer ? activeColor : '#fff', background: 'rgba(255,255,255,0.15)', padding: '8px 20px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.3)', boxShadow: '0 5px 15px rgba(0,0,0,0.1)'}}>
                           <IoMdTime size={18}/>
                           <span style={{fontSize:'12px', marginLeft:'8px', fontWeight:'bold'}}>{sleepTimer ? `${sleepTimer}m` : 'Sleep Timer'}</span>
                       </button>
                       {showTimerMenu && (
                           <div style={styles.timerMenu}>
                               <div style={styles.timerHeader}>Sleep Timer <IoMdClose size={20} style={{cursor:'pointer', color:'rgba(255,255,255,0.5)'}} onClick={()=>setShowTimerMenu(false)}/></div>
                               <div style={styles.timerGrid}>
                                     <button onClick={()=>setTimer(15)} style={styles.timerOpt} className="timer-opt-hover">15m</button>
                                     <button onClick={()=>setTimer(30)} style={styles.timerOpt} className="timer-opt-hover">30m</button>
                                     <button onClick={()=>setTimer(60)} style={styles.timerOpt} className="timer-opt-hover">60m</button>
                                     <button onClick={()=>setTimer(null)} style={{...styles.timerOpt, color:'#ef4444', background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)'}} className="timer-opt-hover">Off</button>
                               </div>
                           </div>
                       )}
                  </div>
              </div>
          </div>
      </div>

      {/* PREMIUM APPLE 17 BOTTOM SHEET MODAL */}
      {activeSelect && (
          <div style={styles.modalOverlay} onClick={() => setActiveSelect(null)}>
              <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                  <div style={styles.modalHeader}>
                      <h3 style={styles.modalTitle}>
                          Select {activeSelect === 'language' ? 'Language' : 'State'}
                      </h3>
                      <button onClick={() => setActiveSelect(null)} style={styles.closeModalBtn}>
                          <IoMdClose size={20} color="#fff" />
                      </button>
                  </div>
                  <div style={styles.modalList}>
                      {(activeSelect === 'language' ? uniqueLangList : uniqueStatesList).map(item => (
                          <div key={item} 
                               style={{
                                   ...styles.modalItem,
                                   background: filters[activeSelect] === item ? 'rgba(74, 222, 128, 0.15)' : 'transparent',
                                   borderColor: filters[activeSelect] === item ? 'rgba(74, 222, 128, 0.4)' : 'rgba(255,255,255,0.05)',
                               }}
                               onClick={() => { setFilters({...filters, [activeSelect]: item}); setActiveSelect(null); }}>
                              <span style={{fontWeight: filters[activeSelect] === item ? '700' : '500', color: filters[activeSelect] === item ? '#4ade80' : '#fff'}}>{item}</span>
                              {filters[activeSelect] === item && <IoMdPlay size={14} color="#4ade80" />}
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}
      
      </div>
    </div>
  );
};

// --- STYLES ---
const styles = {
  page: { position: 'fixed', inset: 0, background: 'radial-gradient(circle at 15% 50%, rgba(74, 222, 128, 0.12), transparent 35%), radial-gradient(circle at 85% 30%, rgba(33, 150, 243, 0.12), transparent 35%), #09090b', color: '#fff', display: 'flex', justifyContent: 'center', fontFamily: "'Inter', sans-serif" },
  mobileWrapper: { width: '100%', maxWidth: '480px', height: '100%', position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 0 40px rgba(0,0,0,0.8)', background: 'transparent' },
  glassHeader: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, background: 'linear-gradient(180deg, rgba(9,9,11,0.95) 0%, rgba(9,9,11,0) 100%)', padding: '20px', display: 'flex', flexDirection: 'column', gap: 15 },
  headerTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logoText: { fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px', color: '#fff' },
  subText: { fontSize: '11px', color: '#71717a', fontWeight: '500' },
  glassBtn: { width: 40, height: 40, borderRadius: '12px', background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.2s' },
  
  searchContainer: { display: 'flex', gap: 10 },
  glassInputWrapper: { flex: 1, background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRadius: '14px', display: 'flex', alignItems: 'center', padding: '0 12px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' },
  glassInput: { background: 'transparent', border: 'none', color: '#fff', padding: '12px 10px', width: '100%', outline: 'none', fontSize: '14px' },
  suggestionsBox: { position:'absolute', top:'100%', left:0, right:0, maxHeight:'50vh', overflowY:'auto', background:'rgba(24, 24, 27, 0.85)', backdropFilter:'blur(30px) saturate(180%)', WebkitBackdropFilter:'blur(30px) saturate(180%)', borderRadius:14, border:'1px solid rgba(255,255,255,0.1)', borderTop:'1px solid rgba(255,255,255,0.2)', marginTop:5, zIndex:300, boxShadow:'0 20px 40px rgba(0,0,0,0.8)' },
  suggestionItem: { display:'flex', alignItems:'center', padding:10, borderBottom:'1px solid rgba(255,255,255,0.05)', cursor:'pointer', color:'#fff' },

  // NEW TUNER STYLES
  tunerWrapper: { display: 'flex', alignItems: 'flex-start', justifyContent: 'center', height: '100%', padding: '120px 20px 0 20px', boxSizing: 'border-box' },
  tunerCard: { width: '100%', maxWidth: '340px', background: 'rgba(15, 15, 20, 0.65)', backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)', borderRadius: '32px', padding: '30px 25px', border: '1px solid rgba(255,255,255,0.1)', borderTop: '1px solid rgba(255,255,255,0.3)', borderLeft: '1px solid rgba(255,255,255,0.2)', boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.3), 0 20px 40px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: '15px', animation: 'fadeIn 0.5s ease-out' },
  tunerHeader: { textAlign: 'center', marginBottom: '5px' },
  radarContainer: { position: 'relative', display: 'flex', justifyContent: 'center', margin: '0 auto 15px auto', width: '60px', height: '60px', zIndex: 1 },
  tunerIconBox: { width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(74, 222, 128, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(74, 222, 128, 0.3)', boxShadow: '0 8px 20px rgba(74, 222, 128, 0.15)', position: 'relative', zIndex: 2 },
  tunerTitle: { margin: '0 0 5px 0', fontSize: '22px', fontWeight: '800', color: '#fff', letterSpacing: '-0.5px' },
  tunerDesc: { margin: 0, fontSize: '12px', color: '#71717a', fontWeight: '500' },
  tunerField: { display: 'flex', flexDirection: 'column', gap: '8px' },
  tunerLabel: { fontSize: '11px', color: '#4ade80', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginLeft: '5px' },
  tunerSelect: { background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderTop: '1px solid rgba(255,255,255,0.2)', borderLeft: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '15px 20px', borderRadius: '16px', fontSize: '15px', fontWeight: '600', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.3), 0 4px 10px rgba(0,0,0,0.2)' },
  scanBtn: { background: '#4ade80', border: 'none', color: '#000', padding: '16px', borderRadius: '16px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 10px 25px rgba(74, 222, 128, 0.3)', transition: 'all 0.2s', letterSpacing: '0.5px' },

  mainArea: { flex: 1, position: 'relative', overflow: 'hidden' }, 
  glassGrid: { 
      position: 'absolute', inset: 0, 
      padding: '180px 15px 120px 15px', 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', 
      alignContent: 'start',
      gap: 20, 
      overflowY: 'auto' 
  },
  emptyState: { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', color:'#52525b', gap:10 },
  resetBtn: { padding: '8px 16px', borderRadius: 8, background: '#4ade80', color:'#000', border:'none', fontWeight:'600', cursor:'pointer' },
  glassCard: { background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.03) 100%)', backdropFilter: 'blur(25px) saturate(200%)', WebkitBackdropFilter: 'blur(25px) saturate(200%)', borderRadius: '32px', padding: '20px 15px', border: '1px solid rgba(255, 255, 255, 0.1)', borderTop: '1.5px solid rgba(255, 255, 255, 0.4)', borderLeft: '1.5px solid rgba(255, 255, 255, 0.3)', boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.4), inset 0 -1px 2px rgba(0,0,0,0.2), 0 15px 35px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, cursor: 'pointer', position:'relative', transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)' },
  cardImg: { width: 65, height: 65, borderRadius: '20px', objectFit: 'cover', background: '#000', border: '1px solid rgba(255,255,255,0.4)', boxShadow: '0 10px 20px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.3)' },
  gridFavBtn: { position: 'absolute', top: -5, right: -10, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', borderRadius: '50%', width: 28, height: 28, border: '1px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' },
  cardText: { textAlign: 'center' },
  cardTitle: { fontSize: 13, fontWeight: '800', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '85px', letterSpacing: '0.3px' },
  cardSub: { fontSize: 11, color: '#a1a1aa', fontWeight: '600' },
  playingOverlay: { position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 65, height: 65, borderRadius: '20px', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4ade80', border: '1px solid rgba(74, 222, 128, 0.5)', boxShadow: 'inset 0 0 15px rgba(74, 222, 128, 0.3)' },

  miniGlassPlayer: { position: 'absolute', bottom: 25, left: 20, right: 20, height: 85, background: 'rgba(15, 15, 20, 0.85)', backdropFilter: 'blur(30px) saturate(180%)', WebkitBackdropFilter: 'blur(30px) saturate(180%)', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.1)', borderTop: '1px solid rgba(255,255,255,0.3)', borderLeft: '1px solid rgba(255,255,255,0.2)', boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.3), 0 15px 40px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', padding: '0 15px', gap: 15, zIndex: 50, cursor: 'pointer', overflow: 'hidden' },
  miniProgressBarContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'rgba(255,255,255,0.1)' },
  miniProgressBar: { height: '100%', background: '#4ade80' },
  miniArt: { width: 50, height: 50, borderRadius: '12px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' },
  miniInfo: { flex: 1, overflow: 'hidden' },
  miniTitle: { fontSize: 14, fontWeight: '700', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  miniStatus: { fontSize: 10, color: '#d4d4d8', letterSpacing: 0.5, marginTop: 2 },
  miniControls: { display: 'flex', alignItems: 'center', gap: 8, position: 'relative', zIndex: 60 }, 
  miniBtn: { background:'transparent', border:'none', color:'#fff', display:'flex', cursor:'pointer', padding: 6, opacity: 0.8 }, 
  neonPlayBtnSmall: { width: 44, height: 44, borderRadius: '50%', background: 'rgba(74, 222, 128, 0.2)', border: '1px solid rgba(74, 222, 128, 0.4)', color: '#4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 5px 15px rgba(74, 222, 128, 0.15)', backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)' },

  fullPlayer: { position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 100, background: '#000', display: 'flex', flexDirection: 'column', transition: 'top 0.4s cubic-bezier(0.32, 0.72, 0, 1)', overflow: 'hidden', borderTopLeftRadius: '32px', borderTopRightRadius: '32px', boxShadow: '0 -20px 50px rgba(0,0,0,0.6)', height: '100%' },
  bgImage: { position: 'absolute', inset: -100, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(60px) saturate(250%) brightness(0.7)', transition: 'background-image 0.8s ease' },
  overlayGradient: { position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.5) 100%)' },
  
  fullPlayerSafeArea: { flex: 1, padding: '20px 25px 30px 25px', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 10, boxSizing: 'border-box' },

  fullHeader: { display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '15px' },
  glassCapsuleHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(30, 30, 30, 0.6)', backdropFilter: 'blur(25px) saturate(200%)', WebkitBackdropFilter: 'blur(25px) saturate(200%)', border: '1px solid rgba(255, 255, 255, 0.15)', borderTop: '1px solid rgba(255, 255, 255, 0.3)', borderRadius: '40px', padding: '12px 25px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)', width: '100%', maxWidth: '380px' },
  transparentBtn: { background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  nowPlayingText: { flex: 1, textAlign: 'center', fontSize: 15, letterSpacing: 1.5, fontWeight: '800', color: '#fff', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },

  discWrapper: { flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 0', minHeight: 0 },
  
  // NEW TONEARM & AURA
  recordAura: { position: 'absolute', width: 'min(70vw, 280px)', height: 'min(70vw, 280px)', borderRadius: '50%', background: 'radial-gradient(circle, rgba(74, 222, 128, 0.4) 0%, transparent 70%)', transition: 'all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)', zIndex: 1, animation: 'pulseLive 3s infinite alternate' },
  toneArm: { position: 'absolute', top: '10px', right: '10%', width: '60px', height: '180px', pointerEvents: 'none', zIndex: 10, transformOrigin: 'top right', transition: 'transform 0.6s cubic-bezier(0.32, 0.72, 0, 1)' },
  toneArmBase: { position: 'absolute', top: 0, right: 0, width: '40px', height: '40px', borderRadius: '50%', background: 'radial-gradient(circle at 30% 30%, #e4e4e7, #52525b)', border: '2px solid #27272a', boxShadow: '0 10px 20px rgba(0,0,0,0.6)' },
  toneArmRod: { position: 'absolute', top: '20px', right: '18px', width: '6px', height: '130px', background: 'linear-gradient(to right, #e4e4e7, #a1a1aa)', borderRadius: '3px', transform: 'rotate(-12deg)', transformOrigin: 'top', boxShadow: '2px 5px 10px rgba(0,0,0,0.5)' },
  toneArmHead: { position: 'absolute', bottom: '26px', left: '18px', width: '18px', height: '35px', background: 'linear-gradient(to bottom, #3f3f46, #18181b)', borderRadius: '4px', transform: 'rotate(15deg)', boxShadow: '0 5px 10px rgba(0,0,0,0.6)' },
  toneArmNeedle: { position: 'absolute', bottom: '22px', left: '22px', width: '2px', height: '6px', background: '#silver', transform: 'rotate(15deg)' },

  recordDisc: { width: 'min(55vw, 220px)', height: 'min(55vw, 220px)', borderRadius: '50%', background: '#111', boxShadow: '0 20px 50px rgba(0,0,0,0.6), inset 0 0 0 6px #222', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', animation: 'spin 12s linear infinite', transition: 'transform 0.5s cubic-bezier(0.32, 0.72, 0, 1)' },
  recordGrooves: { position: 'absolute', inset: '10px', borderRadius: '50%', background: 'repeating-radial-gradient(#111, #111 3px, #1a1a1a 4px, #1a1a1a 5px)', opacity: 0.8 },
  recordShine: { position: 'absolute', inset: 0, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.05) 100%)', pointerEvents: 'none' },
  recordCenter: { width: '100px', height: '100px', borderRadius: '50%', border: '2px solid #333', overflow: 'hidden', position: 'relative', zIndex: 2, background: '#fff' },
  recordImg: { width: '100%', height: '100%', objectFit: 'cover' },
  recordCenterHole: { position: 'absolute', top: '50%', left: '50%', width: '14px', height: '14px', background: '#000', borderRadius: '50%', transform: 'translate(-50%, -50%)', border: '2px solid rgba(255,255,255,0.2)' },

  smallControlCard: { background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.08) 0%, rgba(0, 0, 0, 0.15) 100%)', backdropFilter: 'blur(50px) saturate(250%)', WebkitBackdropFilter: 'blur(50px) saturate(250%)', borderRadius: '28px', padding: '15px 25px', display: 'flex', flexDirection: 'column', gap: '15px', border: '1px solid rgba(255,255,255,0.1)', borderTop: '1.5px solid rgba(255,255,255,0.5)', borderLeft: '1.5px solid rgba(255,255,255,0.4)', boxShadow: '0 30px 60px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.5), inset 0 -1px 1px rgba(255,255,255,0.1)', width: '100%', maxWidth: '380px', boxSizing: 'border-box', margin: '0 auto' },

  playerInfoArea: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0' },
  playerTitleContainer: { width: '100%', overflow: 'hidden', whiteSpace: 'nowrap', position: 'relative' },
  playerTitle: { fontSize: 22, fontWeight: '800', color: '#fff', margin: '0 0 6px 0', display: 'inline-block', textShadow: '0 2px 5px rgba(0,0,0,0.4)' },
  playerSub: { fontSize: 13, color: 'rgba(255,255,255,0.9)', margin: 0, fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase', textShadow: '0 1px 3px rgba(0,0,0,0.4)' },

  mainControlsArea: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '40px', padding: '0' },
  controlBtnSecondary: { background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', display:'flex', alignItems:'center', justifyContent:'center', width: 50, height: 50, borderRadius: '50%', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', transition: 'all 0.2s' },
  playBtnGlass: { width: 75, height: 75, borderRadius: '50%', background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(15px)', WebkitBackdropFilter: 'blur(15px)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transform: 'scale(1)', transition: 'all 0.2s', border: '1px solid rgba(255, 255, 255, 0.3)', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' },
  
  timerMenu: { position: 'absolute', bottom: '130%', left: '50%', transform: 'translateX(-50%)', background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(40px) saturate(200%)', WebkitBackdropFilter: 'blur(40px) saturate(200%)', padding: 15, borderRadius: 20, width: 220, border: '1px solid rgba(255,255,255,0.3)', boxShadow:'0 20px 40px rgba(0,0,0,0.4)', zIndex: 60 },
  timerHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 14, fontWeight: '800', color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.3)' },
  timerGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  timerOpt: { background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: 12, borderRadius: 12, fontSize: 14, cursor: 'pointer', fontWeight:'600', transition: '0.2s' },
  loader: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' },

  // BOTTOM SHEET MODAL STYLES
  modalOverlay: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' },
  modalContent: { background: 'rgba(20, 20, 25, 0.85)', backdropFilter: 'blur(30px) saturate(180%)', WebkitBackdropFilter: 'blur(30px) saturate(180%)', width: '100%', maxWidth: '480px', maxHeight: '75vh', borderTopLeftRadius: '32px', borderTopRightRadius: '32px', borderTop: '1px solid rgba(255,255,255,0.2)', borderLeft: '1px solid rgba(255,255,255,0.1)', borderRight: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', boxShadow: '0 -10px 40px rgba(0,0,0,0.5)', animation: 'slideUpSheet 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)' },
  modalHeader: { padding: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' },
  modalTitle: { margin: 0, fontSize: '18px', fontWeight: '700', color: '#fff' },
  closeModalBtn: { background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  modalList: { padding: '15px 25px 25px 25px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' },
  modalItem: { padding: '16px 20px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)', transition: '0.2s', fontSize: '15px' },
};

const styleSheet = document.createElement("style");
styleSheet.innerText = `
  .glass-input::placeholder { color: rgba(255,255,255,0.5); }
  @keyframes slideUpSheet {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
  }
  @keyframes slideUp {
      0% { transform: translateY(100px) scale(0.8); opacity: 0; }
      100% { transform: translateY(0) scale(1); opacity: 1; }
  }
  @keyframes fadeIn {
      0% { opacity: 0; transform: translateY(10px); }
      100% { opacity: 1; transform: translateY(0); }
  }
  .eq-bar { width: 4px; background: #4ade80; border-radius: 2px; animation: eq 1s ease-in-out infinite; }
  @keyframes eq { 0%, 100% { height: 4px; } 50% { height: 14px; } }
  .glass-card-hover { transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); }
  .glass-card-hover:hover { transform: translateY(-8px) scale(1.02); box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.6), inset 0 -1px 2px rgba(0,0,0,0.2), 0 20px 40px rgba(0,0,0,0.6) !important; border-top: 1.5px solid rgba(255, 255, 255, 0.6) !important; border-left: 1.5px solid rgba(255, 255, 255, 0.4) !important; }
  .dropdown-item-hover { transition: background 0.2s, color 0.2s; }
  .dropdown-item-hover:hover { background: rgba(255,255,255,0.1); color: #fff !important; }
  .spin { animation: spin 1s linear infinite; }
  @keyframes spin { 100% { transform: rotate(360deg); } }
  @keyframes pulseLive { 0% { opacity: 0.8; } 50% { opacity: 0.3; } 100% { opacity: 0.8; } }
  .marquee-text { animation: marquee 12s linear infinite; padding-right: 50px; }
  @keyframes marquee { 0% { transform: translateX(0%); } 100% { transform: translateX(-100%); } }
  .pulse-text { animation: pulseText 1s infinite alternate; }
  @keyframes pulseText { 0% { opacity: 1; } 100% { opacity: 0.3; } }
`;
document.head.appendChild(styleSheet);

export default Radio;