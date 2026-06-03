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
const AIR_ICON = "https://cdn-icons-png.flaticon.com/512/4813/4813083.png";
const FARM_ICON = "https://cdn-icons-png.flaticon.com/512/3028/3028575.png";
const RADIO_BG = "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?q=80&w=2070&auto=format&fit=crop";

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

const getSavedFilters = () => {
    try {
        const saved = JSON.parse(localStorage.getItem('radio_filters'));
        if (saved && saved.state && saved.language) {
            return { search: '', state: saved.state, language: saved.language };
        }
    } catch (e) {}
    return { search: '', state: getInitialState(), language: 'Hindi' };
};

const getSavedStation = () => {
    try {
        const saved = JSON.parse(localStorage.getItem('radio_selected_station'));
        return saved || null;
    } catch (e) {
        return null;
    }
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

// --- TIME FORMATTER FOR COUNTDOWN ---
const formatTime = (totalSeconds) => {
    if (totalSeconds == null) return '';
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
};

const Radio = () => {
  const navigate = useNavigate();

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
  const [timerEndTime, setTimerEndTime] = useState(null);
  const [remainingTime, setRemainingTime] = useState(null);
  const [customTimerMins, setCustomTimerMins] = useState('');
  const [activeSelect, setActiveSelect] = useState(null);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isMuted, setIsMuted] = useState(() => {
      const saved = localStorage.getItem('radio_muted');
      return saved !== null ? JSON.parse(saved) : globalAudio.muted;
  });
  const [volume, setVolume] = useState(() => {
      const saved = localStorage.getItem('radio_volume');
      return saved ? parseFloat(saved) : 0.75;
  });

  const [viewMode, setViewMode] = useState('all'); // 'all', 'favorites', 'recents'
  const [filters, setFilters] = useState(getSavedFilters());

  const stationsRef = useRef([]);

  useEffect(() => {
      const savedStation = getSavedStation();
      if (savedStation) {
          globalCurrentStation = savedStation;
          setSelectedStation(savedStation);
      }
  }, []);

  useEffect(() => {
    const onPopState = (e) => {
      const view = e.state?.radioView;
      
      // Always reset sub-menus/overlays when navigating back
      setShowTimerMenu(false);
      setActiveSelect(null);
      setShowSuggestions(false);

      if (view === 'player') {
        setIsPlayerExpanded(true);
        setHasFetched(true);
      } else if (view === 'list') {
        setIsPlayerExpanded(false);
        setHasFetched(true);
      } else {
        // Base state: Calibrate
        setIsPlayerExpanded(false);
        setHasFetched(false);
      }
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

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
  const [selectedStation, setSelectedStation] = useState(getSavedStation() || globalCurrentStation);
  const [isPlaying, setIsPlaying] = useState(!globalAudio.paused);

  // --- BACK NAVIGATION LOGIC ---
  const handleBack = () => {
    if (hasFetched) {
      window.history.back();
    } else {
      navigate('/Consumer_HomePage');
    }
  };

  const handleFullPlayerBack = () => {
    // Trigger the hardware back behavior seamlessly
    window.history.back();
  };

  const openFullPlayer = () => {
    if (!isPlayerExpanded) {
      window.history.pushState({ radioView: 'player' }, '');
      setIsPlayerExpanded(true);
    }
  };

  // --- PLAY/PAUSE LOGIC ---
  const togglePlay = (e) => {
    if (e) {
        e.stopPropagation();
        e.preventDefault();
    }

    if (!selectedStation) {
        const nextStation = filteredStations[0] || allStations[0];
        if (nextStation) {
            playStation(nextStation);
        }
        return;
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
          // 1. DYNAMIC DISCOVERY: Fetch active servers to avoid ISP DNS blocks
          let API_ENDPOINTS = [];
          try {
              const serverRes = await axios.get("https://all.api.radio-browser.info/json/servers");
              if (serverRes.data && serverRes.data.length > 0) {
                  API_ENDPOINTS = serverRes.data.map(server => `https://${server.name}/json/stations`);
                  // Shuffle array to distribute load randomly
                  API_ENDPOINTS = API_ENDPOINTS.sort(() => 0.5 - Math.random());
              }
          } catch (e) {
              console.warn("Could not fetch dynamic servers. ISP might be blocking DNS.");
          }

          // 2. HARDCODED FALLBACKS
          API_ENDPOINTS.push(
              "https://de1.api.radio-browser.info/json/stations",
              "https://at1.api.radio-browser.info/json/stations",
              "https://nl1.api.radio-browser.info/json/stations"
          );
          API_ENDPOINTS = [...new Set(API_ENDPOINTS)]; // Remove duplicates

          const fetchFromEndpoint = async (endpoint, useProxy = false) => {
              const postData = async (payload) => {
                  try {
                      if (useProxy) {
                          // AllOrigins Proxy: Convert JSON payload back to query string for GET
                          const query = new URLSearchParams(payload).toString();
                          const targetUrl = `${endpoint}/search?${query}`;
                          const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
                          const response = await axios.get(proxyUrl);
                          
                          if (response.data && response.data.contents) {
                              return { data: JSON.parse(response.data.contents) };
                          }
                          return { data: [] };
                      } else {
                          // Direct Connection: Using POST bypasses Service Worker GET interceptor bugs
                          const response = await axios.post(`${endpoint}/search`, payload);
                          return { data: response.data };
                      }
                  } catch (e) {
                      console.warn(`Fetch failed for ${endpoint}:`, e);
                      return { data: [] };
                  }
              };

              const reqs = [
                  // 1. Fetch ALL top channels in the selected STATE (ignoring language constraint)
                  postData({ countrycode: 'IN', hidebroken: 'true', lastcheckok: '1', state: filters.state, limit: '200', order: 'clickcount', reverse: 'true' }),
                  // 2. Fetch ALL top channels for the selected LANGUAGE (ignoring state constraint)
                  postData({ countrycode: 'IN', hidebroken: 'true', lastcheckok: '1', language: filters.language.toLowerCase(), limit: '200', order: 'clickcount', reverse: 'true' }),
                  // 3. Specific Government and Farming channels
                  postData({ countrycode: 'IN', hidebroken: 'true', lastcheckok: '1', state: filters.state, name: 'Akashvani' }),
                  postData({ countrycode: 'IN', hidebroken: 'true', lastcheckok: '1', state: filters.state, name: 'All India Radio' }),
                  postData({ countrycode: 'IN', hidebroken: 'true', lastcheckok: '1', tag: 'kisan' })
              ];
              
              const results = await Promise.all(reqs);
              
              // Validates if at least one sub-query returned stations
              const totalCount = results.reduce((acc, r) => acc + (r.data?.length || 0), 0);
              if (totalCount === 0) throw new Error(`No valid data from ${endpoint}`);
              
              return results;
          };

          // 3. SEQUENTIAL EXECUTION: Try endpoints one by one
        let res = null;
        for (const ep of API_ENDPOINTS) {
            try {
                res = await fetchFromEndpoint(ep);
                  if (res) break; 
            } catch (err) {
                console.warn(`Endpoint ${ep} failed, trying next...`);
            }
        }
          
          // 4. ULTIMATE PROXY FALLBACK: If ISP completely blocks radio-browser.info
          if (!res) {
              console.warn("All direct endpoints failed. Attempting via CORS proxy...");
              try {
                  // Use the primary endpoint but route it perfectly through the AllOrigins proxy
                  res = await fetchFromEndpoint("https://de1.api.radio-browser.info/json/stations", true);
              } catch (err) {
                  console.error("Proxy fallback also failed.", err);
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

        if (window.history.state?.radioView !== 'list') {
            window.history.pushState({ radioView: 'list' }, '');
        }
        
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

  // --- SLEEP TIMER LIVE COUNTDOWN ENGINE ---
  useEffect(() => {
      if (!timerEndTime) return;
      const interval = setInterval(() => {
          const now = Date.now();
          const diff = Math.ceil((timerEndTime - now) / 1000);
          if (diff <= 0) {
              clearInterval(interval);
              setTimerEndTime(null);
              setRemainingTime(null);
              globalAudio.pause();
              setIsPlaying(false);
              toast.info("Sleep Timer: Radio Stopped", { theme: "dark" });
          } else {
              setRemainingTime(diff);
          }
      }, 1000);
      
      setRemainingTime(Math.ceil((timerEndTime - Date.now()) / 1000));
      return () => clearInterval(interval);
  }, [timerEndTime]);

  const setTimer = (minutes) => {
      setShowTimerMenu(false);
      if (minutes && minutes > 0) {
          setTimerEndTime(Date.now() + minutes * 60 * 1000);
          setRemainingTime(minutes * 60);
          setCustomTimerMins('');
          toast.success(`Timer set for ${minutes} mins`, { theme: "dark", autoClose: 2000 });
      } else {
          setTimerEndTime(null);
          setRemainingTime(null);
          toast.info("Sleep Timer Off", { theme: "dark", autoClose: 1000 });
      }
  };

  const shareStation = () => {
      if (selectedStation) {
          const url = selectedStation.url_resolved || selectedStation.url || window.location.href;
          const text = `Listening to ${selectedStation.name} on FarmCap Radio! ${url}`;
          if (navigator.share) {
              navigator.share({ title: 'FarmCap Radio', text: text, url });
          } else {
              navigator.clipboard.writeText(text);
              toast.success("Station info copied!", { theme: "dark", autoClose: 1400 });
          }
      }
  };

  const uniqueStatesList = useMemo(() => Object.keys(STATE_LOCATIONS).sort(), []);
  const uniqueLangList = INDIAN_LANGUAGES;
  
  useEffect(() => {
      localStorage.setItem('radio_filters', JSON.stringify({ state: filters.state, language: filters.language }));
  }, [filters.state, filters.language]);

  useEffect(() => {
      localStorage.setItem('radio_selected_station', JSON.stringify(selectedStation || {}));
  }, [selectedStation]);

  useEffect(() => {
      localStorage.setItem('radio_muted', JSON.stringify(isMuted));
      globalAudio.muted = isMuted;
  }, [isMuted]);

  useEffect(() => {
      localStorage.setItem('radio_volume', volume.toString());
      globalAudio.volume = volume;
  }, [volume]);

  const activeColor = getStationColor(selectedStation?.name);
  const isTimerUrgent = remainingTime > 0 && remainingTime <= 60;

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
                <div style={styles.subText}>{hasFetched ? `${filteredStations.length} / ${allStations.length} active stations` : 'Awaiting Calibration...'}</div>
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

        <div style={styles.viewModeRow}>
            <button onClick={() => setViewMode('all')} style={{...styles.viewModeBtn, background: viewMode === 'all' ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.08)'}}>All</button>
            <button onClick={() => setViewMode('favorites')} style={{...styles.viewModeBtn, background: viewMode === 'favorites' ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.08)'}}>Favorites</button>
            <button onClick={() => setViewMode('recents')} style={{...styles.viewModeBtn, background: viewMode === 'recents' ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.08)'}}>Recents</button>
        </div>

        <div style={styles.headerBadgeRow}>
            {selectedStation && <span style={styles.badge}>{selectedStation.type || 'Live'} station</span>}
            {hasFetched && <span style={styles.badge}>{filteredStations.length} stations shown</span>}
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
                            <IoMdMusicalNote size={28} color="#fff" />
                        </div>
                        <h2 style={styles.tunerTitle}>Calibrate Signal</h2>
                        <p style={styles.tunerDesc}>Select region and language to scan frequencies</p>
                    </div>

                    <div style={styles.tunerField}>
                        <label style={styles.glassLabel}>🗣️ Language</label>
                        <div onClick={() => setActiveSelect('language')} style={styles.tunerSelect}>
                            <span style={styles.glassValueSmall}>{filters.language}</span>
                            <IoMdArrowDown size={18} color="rgba(255,255,255,0.7)" />
                        </div>
                    </div>

                    <div style={styles.tunerField}>
                        <label style={styles.glassLabel}>🌐 State / Region</label>
                        <div onClick={() => setActiveSelect('state')} style={styles.tunerSelect}>
                            <span style={styles.glassValueSmall}>{filters.state}</span>
                            <IoMdArrowDown size={18} color="rgba(255,255,255,0.7)" />
                        </div>
                    </div>

                    <button onClick={fetchDynamicData} disabled={loading} style={styles.scanBtn}>
                        {loading ? <IoMdRefresh className="spin" size={18} /> : <IoMdSearch size={18} />}
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
        <div {...miniPlayerSwipeHandlers} style={styles.miniGlassPlayer} onClick={openFullPlayer}>
            <div style={styles.miniProgressBarContainer}>
                <div style={{...styles.miniProgressBar, width: isPlaying ? '100%' : '0%'}}></div>
            </div>
            
            <img src={selectedStation.icon} onError={(e)=>e.target.src=DEFAULT_ICON} style={styles.miniArt} />
            
            <div style={styles.miniInfo}>
                <div style={styles.miniTitle}>{selectedStation.name}</div>
                <div style={{...styles.miniStatus, display:'flex', alignItems:'center'}}>
                     {isPlaying ? <><MiniEqualizer /> <span style={{color: '#fff', marginLeft:'5px', fontWeight:'700', textShadow: '0 0 8px rgba(255,255,255,0.5)'}}>{isBuffering ? 'TUNING...' : 'LIVE'}</span></> : <><span style={{color: '#ef4444', marginRight:'5px'}}>●</span> PAUSED</>}
                </div>
            </div>
            
            <div style={styles.miniControls}>
                <button onClick={playPrev} style={styles.miniBtn}><IoMdSkipBackward size={20}/></button>
                <button onClick={(e) => togglePlay(e)} style={{...styles.neonPlayBtnSmall, color: '#000', borderColor: 'rgba(255,255,255,0.3)', background: '#fff', boxShadow: '0 4px 15px rgba(255,255,255,0.2)'}}>
                    {isPlaying ? <IoMdPause color="#000" /> : <IoMdPlay color="#000" style={{marginLeft:2}}/>}
                </button>
                <button onClick={playNext} style={styles.miniBtn}><IoMdSkipForward size={20}/></button>
            </div>
        </div>
      )}

      {/* FULL PLAYER */}
      <div style={{...styles.fullPlayer, top: isPlayerExpanded ? '0' : '100%'}}>
          
          <div style={styles.fullPlayerSafeArea}>
              {/* TOP HEADER (FLOATING) */}
              <div style={styles.fullHeader}>
                  <button onClick={handleFullPlayerBack} style={styles.glassCircleBtn}><IoMdArrowBack size={24} color="#fff"/></button>
                  <div style={styles.nowPlayingText}>🧢 FARMCAP Radio</div>
                  <button onClick={toggleMute} style={styles.glassCircleBtn}>
                      {isMuted ? <IoMdVolumeOff size={22} color="#ef4444"/> : <IoMdVolumeHigh size={22} color="#fff"/>}
                  </button>
              </div>

              {/* MUSIC PLAYER TURNTABLE */}
              <div style={styles.discWrapper}>
                  {/* DYNAMIC GLOW AURA */}
                  <div style={{...styles.recordAura, background: `radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)`, opacity: isPlaying ? 1 : 0, transform: isPlaying ? 'scale(1.1)' : 'scale(0.8)'}}></div>
                  
                  {/* APPLE STYLE SONIC WAVES */}
                  {isPlaying && (
                      <>
                          <div className="sonic-wave" style={{animationDelay: '0s'}}></div>
                          <div className="sonic-wave" style={{animationDelay: '0.8s'}}></div>
                          <div className="sonic-wave" style={{animationDelay: '1.6s'}}></div>
                      </>
                  )}

                  {/* 3D TONEARM */}
                  <div style={{...styles.toneArm, transform: isPlaying ? 'rotate(18deg)' : 'rotate(0deg)'}}>
                      <div style={styles.toneArmBase}></div>
                      <div style={styles.toneArmRod}></div>
                      <div style={styles.toneArmHead}></div>
                      <div style={styles.toneArmNeedle}></div>
                  </div>

                  <div style={{
                      ...styles.recordWrapper,
                      transform: isPlaying ? 'scale(1)' : 'scale(0.95)'
                  }}>
                      <div style={{
                          ...styles.recordDisc,
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
              </div>

              {/* BOTTOM CONTROLS (FLOATING) */}
              <div style={styles.bottomControlsWrapper}>
                  
                  {/* Top Row: Info & Favorite */}
                  <div style={styles.playerInfoArea}>
                      <div style={{flex: 1, overflow: 'hidden'}}>
                          <div style={styles.playerTitleContainer}>
                              <h1 className={selectedStation?.name?.length > 15 ? 'marquee-text' : ''} style={styles.playerTitle}>{selectedStation?.name}</h1>
                          </div>
                          <p style={styles.playerSub}>{selectedStation?.normalizedState || 'Internet Radio'}</p>
                      </div>
                      <button onClick={(e) => toggleFavorite(e, selectedStation)} style={styles.glassCircleBtn}>
                          {favorites.includes(selectedStation?.uniqueId) ? <IoMdHeart color="#ef4444" size={22}/> : <IoMdHeartEmpty color="#fff" size={22}/>}
                      </button>
                  </div>

                  {/* Middle Row: Live Progress */}
                  <div style={styles.liveProgressArea}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span className={isBuffering ? "pulse-text" : ""} style={{...styles.liveTimeText, color: isPlaying ? '#fff' : 'rgba(255,255,255,0.5)'}}>{isBuffering ? 'TUNING' : 'LIVE'}</span>
                          <div style={{flex: 1, ...styles.liveTrack}}>
                              <div style={{...styles.liveTrackFill, background: '#fff', animationPlayState: isPlaying ? 'running' : 'paused', boxShadow: `0 0 12px rgba(255,255,255,0.6)`}}></div>
                          </div>
                      </div>
                  </div>

                  {/* Playback Controls Row */}
                  <div style={styles.mainControlsArea}>
                      <button onClick={playPrev} style={styles.glassCircleBtn}><IoMdSkipBackward size={22}/></button>
                      <button onClick={(e) => togglePlay(e)} style={styles.playBtnGlass}>
                          {isPlaying ? <IoMdPause size={28} color="#fff"/> : <IoMdPlay size={28} color="#fff" style={{marginLeft:4}}/>}
                      </button>
                      <button onClick={playNext} style={styles.glassCircleBtn}><IoMdSkipForward size={22}/></button>
                  </div>

                  <div style={styles.playerMetaRow}>
                      <div style={{display:'flex', gap:10, flexWrap:'wrap', alignItems:'center'}}>
                          <span style={styles.badge}>{selectedStation?.type || 'Live'}</span>
                          <span style={styles.badge}>{selectedStation?.bitrate ? `${selectedStation.bitrate} kbps` : 'Live Stream'}</span>
                      </div>
                      <button onClick={shareStation} style={styles.glassPillBtn}>
                          <IoMdShare size={16} style={{marginRight: 8}} /> Share
                      </button>
                  </div>

                  <div style={styles.volumeRow}>
                      <IoMdVolumeOff size={18} color="rgba(255,255,255,0.7)" />
                      <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} style={styles.volumeSlider} />
                      <IoMdVolumeHigh size={18} color="rgba(255,255,255,0.7)" />
                  </div>

                  {/* Added Row: Sleep Timer */}
                  <div style={{display:'flex', justifyContent:'center', marginTop:'5px', position:'relative'}}>
                       <button onClick={() => setShowTimerMenu(!showTimerMenu)} className={isTimerUrgent ? "timer-urgent-anim" : ""} style={{...styles.glassPillBtn, color: isTimerUrgent ? '#fff' : (remainingTime ? '#000' : '#fff'), background: isTimerUrgent ? '#ef4444' : (remainingTime ? '#fff' : 'transparent'), borderColor: isTimerUrgent ? '#f87171' : 'rgba(255, 255, 255, 0.3)', boxShadow: isTimerUrgent ? '0 0 20px rgba(239, 68, 68, 0.8), inset 0 2px 5px rgba(255,255,255,0.4)' : styles.glassPillBtn.boxShadow}}>
                           <IoMdTime size={18}/>
                           <span style={{fontSize:'13px', marginLeft:'6px', fontWeight:'900', fontFamily: remainingTime ? 'monospace' : 'inherit', letterSpacing: remainingTime ? '1.5px' : 'normal'}}>
                               {remainingTime ? formatTime(remainingTime) : 'Sleep Timer'}
                           </span>
                       </button>
                       {showTimerMenu && (
                           <div style={styles.timerMenu}>
                               <div style={styles.timerHeader}>Sleep Timer <IoMdClose size={20} style={{cursor:'pointer', color:'rgba(255,255,255,0.5)'}} onClick={()=>setShowTimerMenu(false)}/></div>
                               <div style={styles.timerGrid}>
                                     <button onClick={()=>setTimer(15)} style={styles.timerOpt} className="timer-opt-hover">15m</button>
                                     <button onClick={()=>setTimer(30)} style={styles.timerOpt} className="timer-opt-hover">30m</button>
                                     <div style={{display:'flex', gap:10, gridColumn:'1 / -1'}}>
                                         <input 
                                             type="number" 
                                             placeholder="Custom mins" 
                                             value={customTimerMins} 
                                             onChange={e => setCustomTimerMins(e.target.value)} 
                                             style={{...styles.timerOpt, background: 'rgba(255,255,255,0.05)', flex:1, outline:'none', border:'1px solid rgba(255,255,255,0.1)', color:'#fff'}}
                                         />
                                         <button onClick={() => setTimer(parseInt(customTimerMins))} disabled={!customTimerMins || isNaN(customTimerMins) || parseInt(customTimerMins) <= 0} style={{...styles.timerOpt, background:'#4ade80', color:'#000', opacity: (!customTimerMins || isNaN(customTimerMins) || parseInt(customTimerMins) <= 0) ? 0.5 : 1}} className="timer-opt-hover">Set</button>
                                     </div>
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
  page: { position: 'fixed', inset: 0, background: `linear-gradient(to bottom, rgba(9,9,11,0.6), rgba(9,9,11,0.9)), url('${RADIO_BG}')`, backgroundSize: 'cover', backgroundPosition: 'center', color: '#fff', display: 'flex', justifyContent: 'center', fontFamily: "'Inter', sans-serif" },
  mobileWrapper: { width: '100%', maxWidth: '480px', height: '100%', position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 0 40px rgba(0,0,0,0.8)', background: 'transparent' },
  glassHeader: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, background: 'linear-gradient(180deg, rgba(9,9,11,0.95) 0%, rgba(9,9,11,0) 100%)', padding: '20px', display: 'flex', flexDirection: 'column', gap: 15 },
  headerTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logoText: { fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px', color: '#fff' },
  subText: { fontSize: '11px', color: '#71717a', fontWeight: '500' },
  glassBtn: { width: 40, height: 40, borderRadius: '12px', background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.2s' },
  
  searchContainer: { display: 'flex', gap: 10 },
  glassInputWrapper: { flex: 1, background: 'transparent', backdropFilter: 'blur(12px) saturate(120%) brightness(110%)', WebkitBackdropFilter: 'blur(12px) saturate(120%) brightness(110%)', borderRadius: '24px', display: 'flex', alignItems: 'center', padding: '4px 15px', border: '1px solid rgba(255, 255, 255, 0.1)', borderTop: '1px solid rgba(255, 255, 255, 0.3)', borderLeft: '1px solid rgba(255, 255, 255, 0.2)', boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.3), 0 4px 15px rgba(0,0,0,0.15)', boxSizing: 'border-box' },
  glassInput: { background: 'transparent', border: 'none', color: '#fff', padding: '12px 10px', width: '100%', outline: 'none', fontSize: '14px' },
  suggestionsBox: { position:'absolute', top:'100%', left:0, right:0, maxHeight:'50vh', overflowY:'auto', background: 'transparent', backdropFilter: 'blur(12px) saturate(120%) brightness(110%)', WebkitBackdropFilter: 'blur(12px) saturate(120%) brightness(110%)', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.1)', borderTop: '1px solid rgba(255, 255, 255, 0.3)', borderLeft: '1px solid rgba(255, 255, 255, 0.2)', marginTop: '10px', zIndex:300, boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.3), 0 8px 32px rgba(0, 0, 0, 0.15)', boxSizing: 'border-box', padding: '10px' },
  suggestionItem: { display:'flex', alignItems:'center', padding: '12px 15px', borderRadius: '16px', marginBottom: '5px', cursor:'pointer', color:'#fff', border: '1px solid rgba(255,255,255,0.05)' },

  // NEW TUNER STYLES
  tunerWrapper: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '20px', boxSizing: 'border-box' },
  tunerCard: { width: '100%', maxWidth: '360px', display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.5s ease-out' },
  tunerHeader: { textAlign: 'center', marginBottom: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  tunerIconBox: { width: '50px', height: '50px', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255, 255, 255, 0.3)', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)', marginBottom: '15px' },
  tunerTitle: { margin: '0 0 5px 0', fontSize: '24px', fontWeight: '700', color: '#fff' },
  tunerDesc: { margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
  tunerField: { display: 'flex', flexDirection: 'column', gap: '8px' },
  glassLabel: { fontSize: '13px', opacity: 0.8, display: 'flex', gap: '6px', alignItems: 'center', fontWeight: '600', color: '#fff', marginLeft: '5px' },
  glassValueSmall: { fontSize: '16px', fontWeight: '700', color: '#fff' },
  tunerSelect: { background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderTop: '1px solid rgba(255,255,255,0.2)', borderLeft: '1px solid rgba(255,255,255,0.15)', padding: '14px 18px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' },
  scanBtn: { background: '#fff', color: '#000', border: 'none', padding: '15px', borderRadius: '20px', fontSize: '14px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 6px 20px rgba(255, 255, 255, 0.2)', transition: 'all 0.2s', marginTop: '10px' },

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
  playingOverlay: { position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 65, height: 65, borderRadius: '20px', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.4)', boxShadow: 'inset 0 0 15px rgba(255, 255, 255, 0.2)' },

  miniGlassPlayer: { position: 'absolute', bottom: 20, left: 20, right: 20, height: 75, background: 'transparent', backdropFilter: 'blur(12px) saturate(120%) brightness(110%)', WebkitBackdropFilter: 'blur(12px) saturate(120%) brightness(110%)', borderRadius: '32px', border: '1px solid rgba(255, 255, 255, 0.1)', borderTop: '1px solid rgba(255, 255, 255, 0.3)', borderLeft: '1px solid rgba(255, 255, 255, 0.2)', boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.3), 0 8px 32px rgba(0, 0, 0, 0.15)', display: 'flex', alignItems: 'center', padding: '0 15px', gap: 12, zIndex: 50, cursor: 'pointer', overflow: 'hidden', boxSizing: 'border-box' },
  miniProgressBarContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'rgba(255,255,255,0.1)' },
  miniProgressBar: { height: '100%', background: '#fff', boxShadow: '0 0 8px rgba(255,255,255,0.5)' },
  miniArt: { width: 44, height: 44, borderRadius: '10px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' },
  miniInfo: { flex: 1, overflow: 'hidden' },
  miniTitle: { fontSize: 13, fontWeight: '700', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  miniStatus: { fontSize: 10, color: '#d4d4d8', letterSpacing: 0.5, marginTop: 2 },
  miniControls: { display: 'flex', alignItems: 'center', gap: 8, position: 'relative', zIndex: 60 }, 
  miniBtn: { background:'transparent', border:'none', color:'#fff', display:'flex', cursor:'pointer', padding: 6, opacity: 0.8 }, 
  neonPlayBtnSmall: { width: 40, height: 40, borderRadius: '50%', background: 'rgba(74, 222, 128, 0.2)', border: '1px solid rgba(74, 222, 128, 0.4)', color: '#4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 5px 15px rgba(74, 222, 128, 0.15)', backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)' },

  fullPlayer: { position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 100, background: `linear-gradient(to bottom, rgba(9,9,11,0.7), rgba(9,9,11,0.98)), url('${RADIO_BG}')`, backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', flexDirection: 'column', transition: 'top 0.4s cubic-bezier(0.32, 0.72, 0, 1)', overflow: 'hidden', borderTopLeftRadius: '32px', borderTopRightRadius: '32px', boxShadow: '0 -20px 50px rgba(0,0,0,0.6)', height: '100%' },
  
  fullPlayerSafeArea: { flex: 1, padding: '20px 25px 30px 25px', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 10, boxSizing: 'border-box' },

  fullHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
  nowPlayingText: { flex: 1, textAlign: 'center', fontSize: 15, letterSpacing: 1.5, fontWeight: '800', color: '#fff', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },

  discWrapper: { flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 0', minHeight: 0 },
  
  // NEW PREMIUM GLASS CONTROLS
  glassCircleBtn: { width: '44px', height: '44px', borderRadius: '50%', background: 'transparent', backdropFilter: 'blur(12px) saturate(120%) brightness(110%)', WebkitBackdropFilter: 'blur(12px) saturate(120%) brightness(110%)', border: '1px solid rgba(255, 255, 255, 0.1)', borderTop: '1px solid rgba(255, 255, 255, 0.3)', borderLeft: '1px solid rgba(255, 255, 255, 0.2)', boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.3), 0 8px 32px rgba(0, 0, 0, 0.15)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' },
  glassPillBtn: { padding: '10px 20px', borderRadius: '30px', background: 'transparent', backdropFilter: 'blur(12px) saturate(120%) brightness(110%)', WebkitBackdropFilter: 'blur(12px) saturate(120%) brightness(110%)', border: '1px solid rgba(255, 255, 255, 0.1)', borderTop: '1px solid rgba(255, 255, 255, 0.3)', borderLeft: '1px solid rgba(255, 255, 255, 0.2)', boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.3), 0 8px 32px rgba(0, 0, 0, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' },
  bottomControlsWrapper: { display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '380px', margin: '0 auto' },
  
  // NEW TONEARM & AURA
  recordAura: { position: 'absolute', width: 'min(70vw, 280px)', height: 'min(70vw, 280px)', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%)', transition: 'all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)', zIndex: 1, animation: 'pulseLive 3s infinite alternate' },
  toneArm: { position: 'absolute', top: '10px', right: '10%', width: '60px', height: '180px', pointerEvents: 'none', zIndex: 10, transformOrigin: 'top right', transition: 'transform 0.6s cubic-bezier(0.32, 0.72, 0, 1)' },
  toneArmBase: { position: 'absolute', top: 0, right: 0, width: '40px', height: '40px', borderRadius: '50%', background: 'radial-gradient(circle at 30% 30%, #e4e4e7, #52525b)', border: '2px solid #27272a', boxShadow: '0 10px 20px rgba(0,0,0,0.6)' },
  toneArmRod: { position: 'absolute', top: '20px', right: '18px', width: '6px', height: '130px', background: 'linear-gradient(to right, #e4e4e7, #a1a1aa)', borderRadius: '3px', transform: 'rotate(-12deg)', transformOrigin: 'top', boxShadow: '2px 5px 10px rgba(0,0,0,0.5)' },
  toneArmHead: { position: 'absolute', bottom: '26px', left: '18px', width: '18px', height: '35px', background: 'linear-gradient(to bottom, #3f3f46, #18181b)', borderRadius: '4px', transform: 'rotate(15deg)', boxShadow: '0 5px 10px rgba(0,0,0,0.6)' },
  toneArmNeedle: { position: 'absolute', bottom: '22px', left: '22px', width: '2px', height: '6px', background: '#silver', transform: 'rotate(15deg)' },

  recordWrapper: { width: 'min(55vw, 220px)', height: 'min(55vw, 220px)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', transition: 'transform 0.5s cubic-bezier(0.32, 0.72, 0, 1)' },
  recordDisc: { width: '100%', height: '100%', borderRadius: '50%', background: '#111', boxShadow: '0 20px 50px rgba(0,0,0,0.6), inset 0 0 0 6px #222', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', animation: 'spin 12s linear infinite' },
  recordGrooves: { position: 'absolute', inset: '10px', borderRadius: '50%', background: 'repeating-radial-gradient(#111, #111 3px, #1a1a1a 4px, #1a1a1a 5px)', opacity: 0.8 },
  recordShine: { position: 'absolute', inset: 0, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.05) 100%)', pointerEvents: 'none' },
  recordCenter: { width: '100px', height: '100px', borderRadius: '50%', border: '2px solid #333', overflow: 'hidden', position: 'relative', zIndex: 2, background: '#fff' },
  recordImg: { width: '100%', height: '100%', objectFit: 'cover' },
  recordCenterHole: { position: 'absolute', top: '50%', left: '50%', width: '14px', height: '14px', background: '#000', borderRadius: '50%', transform: 'translate(-50%, -50%)', border: '2px solid rgba(255,255,255,0.2)' },

  playerInfoArea: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0', gap: '15px' },
  playerTitleContainer: { width: '100%', overflow: 'hidden', whiteSpace: 'nowrap', position: 'relative' },
  playerTitle: { fontSize: 22, fontWeight: '800', color: '#fff', margin: '0 0 6px 0', display: 'inline-block', textShadow: '0 2px 5px rgba(0,0,0,0.4)' },
  playerSub: { fontSize: 13, color: 'rgba(255,255,255,0.9)', margin: 0, fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase', textShadow: '0 1px 3px rgba(0,0,0,0.4)' },

  liveProgressArea: { width: '100%' },
  liveTimeText: { fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  liveTrack: { height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2, overflow: 'hidden' },
  liveTrackFill: { height: '100%', borderRadius: 2 },

  mainControlsArea: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '25px', padding: '0' },
  playerMetaRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' },
  volumeRow: { display: 'flex', alignItems: 'center', gap: '12px', marginTop: '10px', padding: '0 8px' },
  volumeSlider: { flex: 1, accentColor: '#4ade80', cursor: 'pointer', width: '100%' },
  viewModeRow: { display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '14px' },
  viewModeBtn: { padding: '10px 16px', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' },
  headerBadgeRow: { display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', marginTop: '10px' },
  badge: { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '999px', padding: '8px 14px', fontSize: '12px', fontWeight: '700', letterSpacing: '0.4px', color: '#e5e7eb' },
  playBtnGlass: { width: '64px', height: '64px', borderRadius: '50%', background: 'transparent', backdropFilter: 'blur(12px) saturate(120%) brightness(110%)', WebkitBackdropFilter: 'blur(12px) saturate(120%) brightness(110%)', border: '1px solid rgba(255, 255, 255, 0.1)', borderTop: '1px solid rgba(255, 255, 255, 0.3)', borderLeft: '1px solid rgba(255, 255, 255, 0.2)', boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.3), 0 8px 32px rgba(0, 0, 0, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transform: 'scale(1)', transition: 'all 0.2s' },
  
  timerMenu: { position: 'absolute', bottom: '130%', left: '50%', transform: 'translateX(-50%)', background: 'transparent', backdropFilter: 'blur(12px) saturate(120%) brightness(110%)', WebkitBackdropFilter: 'blur(12px) saturate(120%) brightness(110%)', padding: '20px', borderRadius: '24px', width: '240px', border: '1px solid rgba(255, 255, 255, 0.1)', borderTop: '1px solid rgba(255, 255, 255, 0.3)', borderLeft: '1px solid rgba(255, 255, 255, 0.2)', boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.3), 0 8px 32px rgba(0, 0, 0, 0.15)', zIndex: 60, boxSizing: 'border-box' },
  timerHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 14, fontWeight: '800', color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.3)' },
  timerGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  timerOpt: { background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: 12, borderRadius: 12, fontSize: 14, cursor: 'pointer', fontWeight:'600', transition: '0.2s' },
  loader: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' },

  // BOTTOM SHEET MODAL STYLES
  modalOverlay: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' },
  modalContent: { background: 'transparent', backdropFilter: 'blur(12px) saturate(120%) brightness(110%)', WebkitBackdropFilter: 'blur(12px) saturate(120%) brightness(110%)', width: '100%', maxWidth: '480px', maxHeight: '75vh', borderTopLeftRadius: '36px', borderTopRightRadius: '36px', borderTop: '1px solid rgba(255, 255, 255, 0.3)', borderLeft: '1px solid rgba(255, 255, 255, 0.2)', borderRight: '1px solid rgba(255, 255, 255, 0.2)', display: 'flex', flexDirection: 'column', boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.3), 0 -8px 32px rgba(0, 0, 0, 0.15)', animation: 'slideUpSheet 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)', boxSizing: 'border-box' },
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
  .eq-bar { width: 4px; background: #fff; border-radius: 2px; animation: eq 1s ease-in-out infinite; box-shadow: 0 0 6px rgba(255,255,255,0.6); }
  @keyframes eq { 0%, 100% { height: 4px; } 50% { height: 14px; } }
  .sonic-wave {
      position: absolute;
      top: 50%;
      left: 50%;
      width: min(55vw, 220px);
      height: min(55vw, 220px);
      border-radius: 50%;
      border: 2px solid rgba(255, 255, 255, 0.5);
      transform: translate(-50%, -50%) scale(1);
      animation: soundRipple 2.4s cubic-bezier(0.2, 0.8, 0.2, 1) infinite;
      pointer-events: none;
      z-index: 0;
      box-shadow: 0 0 15px rgba(255,255,255,0.2), inset 0 0 15px rgba(255,255,255,0.2);
      will-change: transform, opacity;
  }
  @keyframes soundRipple {
      0% { transform: translate(-50%, -50%) scale(0.95); opacity: 1; }
      100% { transform: translate(-50%, -50%) scale(1.6); opacity: 0; }
  }
  .timer-urgent-anim {
      animation: timerUrgentVibrate 1s infinite;
  }
  @keyframes timerUrgentVibrate {
      0% { transform: scale(1); filter: brightness(1); }
      10% { transform: scale(1.05) translateX(-2px) rotate(-2deg); filter: brightness(1.2); }
      20% { transform: scale(1.05) translateX(2px) rotate(2deg); filter: brightness(1.2); }
      30% { transform: scale(1.05) translateX(-2px) rotate(-2deg); filter: brightness(1.2); }
      40% { transform: scale(1.05) translateX(2px) rotate(2deg); filter: brightness(1.2); }
      50% { transform: scale(1); filter: brightness(1); }
      100% { transform: scale(1); filter: brightness(1); }
  }
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