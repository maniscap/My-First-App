import React, { 
  useState, 
  useEffect 
} from 'react';
import { createPortal } from 'react-dom';
import { 
  useNavigate 
} from 'react-router-dom';
import { 
  MapPin, 
  Home, 
  Briefcase, 
  Bookmark, 
  X, 
  Navigation, 
  Clock, 
  ChevronRight, 
  Search, 
  Zap, 
  Loader2, 
  Map, 
  Share2 
} from 'lucide-react';
import axios from 'axios';

const LocationSheet = ({ 
  onLocationSelect, 
  onClose 
}) => {
  const navigate = useNavigate();
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);

  // --- 1. DATA SYNCHRONIZATION ---
  useEffect(() => {
    // We only need saved addresses now as Recent Searches is removed
    const saved = localStorage.getItem('my_saved_addresses');
    
    if (saved) { 
      try { 
        const parsedData = JSON.parse(saved);
        setSavedAddresses(parsedData); 
      } catch (error) { 
        console.error("Failed to parse addresses from storage", error);
        setSavedAddresses([]); 
      } 
    }
  }, []);

  // --- 2. CORE GPS LOGIC ---
  const handleEnableLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsGpsLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          const res = await axios.post('/api/UserLocation', { action: 'reverseGeocode', lat: latitude, lng: longitude });
          const data = res.data;
          
          let fullDisplay = "Current Location";
          if (data.addresses && data.addresses.length > 0) {
              const addr = data.addresses[0].address;
              const locationLabel = addr.streetName || addr.municipalitySubdivision || addr.municipality || "Unknown Area";
              const subLabel = addr.municipality || addr.countrySubdivision || "";
              fullDisplay = `${locationLabel}${subLabel && locationLabel !== subLabel ? `, ${subLabel}` : ''}`;
          }
          
          if (!data.addresses || data.addresses.length === 0) {
              throw new Error("No results from TomTom");
          }
          
          onLocationSelect(
            "Current Location", 
            fullDisplay, 
            latitude, 
            longitude
          );
          
        } catch (err) { 
          console.warn("TomTom failed/limit reached in Sheet. Falling back to OpenStreetMap...", err);
          try {
              const osmRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
              const osmData = await osmRes.json();
              const addr = osmData.address || {};
              const locationLabel = addr.village || addr.suburb || addr.town || addr.city || "Unknown Area";
              const subLabel = addr.county || addr.state_district || "";
              const fullDisplay = `${locationLabel}${subLabel && locationLabel !== subLabel ? `, ${subLabel}` : ''}`;
              
              onLocationSelect(
                "Current Location", 
                fullDisplay, 
                latitude, 
                longitude
              );
          } catch (osmError) {
              alert("GPS coordinates found, but failed to fetch address name."); 
          }
        } finally { 
          setIsGpsLoading(false); 
        }
      }, 
      (error) => { 
        setIsGpsLoading(false); 
        alert("Location access denied. Please enable GPS in your browser settings."); 
      }, 
      { 
        enableHighAccuracy: true, 
        timeout: 8000, 
        maximumAge: 0 
      }
    );
  };

  // --- 3. UI HELPERS ---
  const getAddressIcon = (type) => {
    if (type === 'Home') {
      return <Home size={20} />;
    } else if (type === 'Work') {
      return <Briefcase size={20} />;
    } else {
      return <Bookmark size={20} />;
    }
  };

  const handleShareAddress = async (addr) => {
    const shareMessage = `Address Shared: ${addr.address}`;
    
    if (navigator.share) {
      try { 
        await navigator.share({ 
          title: 'Location Information', 
          text: shareMessage, 
          url: window.location.href 
        }); 
      } catch (err) { 
        console.error("Sharing failed", err); 
      }
    } else {
      // Fallback if Web Share API is not available
      const encodedMsg = encodeURIComponent(shareMessage);
      window.open(`https://wa.me/?text=${encodedMsg}`, '_blank');
    }
  };

  // --- 4. RENDER COMPONENT ---
  const sheetContent = (
    <div style={styles.backdropStyle}>
      
      {/* Click on background overlay to close */}
      <div 
        style={styles.clickableOverlay} 
        onClick={onClose}
      ></div>
      
      <div style={styles.containerWrapper}>
        
        {/* Rounded X Close Button floating above sheet */}
        <button 
          onClick={onClose} 
          style={styles.closeBtnStyle}
        >
          <X 
            size={24} 
            color="white" 
            strokeWidth={2.5} 
          />
        </button>

        <div style={styles.sheetStyle}>
           
           {/* Visual Drag Handle for Sheet */}
           <div style={styles.sheetHandle}></div>

           {/* SECTION: GPS ENABLE CARD */}
           <div style={styles.gpsCard}>
             <div style={styles.gpsFlex}>
                 <div style={styles.pinIconContainer}>
                    <Navigation 
                      size={24} 
                      color="#3B82F6" 
                      fill="#3B82F6" 
                    />
                 </div>
                 
                 <div style={styles.gpsTextContent}>
                    <div style={styles.gpsTitle}>
                      Device location is off
                    </div>
                    <div style={styles.gpsSub}>
                      Enable location to see nearby spots and track delivery accurately
                    </div>
                 </div>
                 
                 <button 
                   onClick={handleEnableLocation} 
                   style={styles.enableBtn}
                   disabled={isGpsLoading}
                 >
                   {isGpsLoading ? (
                     <Loader2 
                       size={18} 
                       className="animate-spin" 
                     />
                   ) : (
                     "Enable"
                   )}
                 </button>
             </div>
           </div>

           {/* SECTION: SCROLLABLE SAVED ADDRESSES */}
           <div 
             style={styles.scrollableWrapper} 
             className="sheet-content"
           >
             {savedAddresses.length > 0 ? (
               <div style={styles.savedSection}>
                 
                 <div style={styles.sectionHeader}>
                    <div style={styles.sectionLabelSmall}>
                      SAVED ADDRESSES
                    </div>
                    <div 
                      onClick={() => navigate('/user-location')} 
                      style={styles.seeAllBtn}
                    >
                      See all
                    </div>
                 </div>
                 
                 <div style={styles.listContainer}>
                    {savedAddresses.map((addr, index) => (
                        <div 
                          key={addr.id || index} 
                          style={styles.addressRow} 
                          onClick={() => onLocationSelect(
                            addr.type, 
                            addr.address, 
                            addr.lat, 
                            addr.lng
                          )}
                        >
                            <div style={styles.iconBox}>
                              {getAddressIcon(addr.type)}
                            </div>
                            
                            <div style={styles.addressInfo}> 
                               <div style={styles.addrTypeTitle}>
                                 {addr.type}
                               </div>
                               <div style={styles.addrFullText}>
                                 {addr.address}
                               </div>
                            </div>
                            
                            <div 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                handleShareAddress(addr); 
                              }} 
                              style={styles.shareSheetBtn}
                            >
                              <Share2 
                                size={18} 
                                color="#A0A0A0" 
                              />
                            </div>
                        </div>
                    ))}
                 </div>

               </div>
             ) : (
               <div style={styles.emptyState}>
                 <div style={styles.emptyIconBox}>
                    <Map size={32} color="#E5E5E5" />
                 </div>
                 <div style={styles.emptyText}>
                    You haven't saved any addresses yet. 
                    Add one to see it here!
                 </div>
               </div>
             )}
           </div>

           {/* SECTION: STATIC BOTTOM SEARCH ACTION */}
           <div 
             style={styles.searchRow} 
             onClick={() => navigate('/user-location')}
           >
             <div style={styles.searchIconBox}>
                <Search 
                  size={22} 
                  color="#3B82F6" 
                  strokeWidth={2.5} 
                />
             </div>
             
             <div style={styles.searchPlaceholderText}>
               Search location manually
             </div>
             
             <ChevronRight 
               size={22} 
               color="#D1D1D1" 
             />
           </div>

           {/* Final spacing to prevent content hiding behind home bars */}
           <div style={styles.bottomSafetyPad}></div>
        </div>
      </div>
    </div>
  );

  return createPortal(sheetContent, document.body);
};

// --- 5. EXPANDED STYLES OBJECT (Line Count Boost) ---
const styles = {
  backdropStyle: { 
    position: 'fixed', 
    top: 0, 
    left: 0, 
    width: '100%', 
    height: '100%', 
    zIndex: 99999, 
    background: 'rgba(0,0,0,0.7)', 
    backdropFilter: 'blur(5px)', 
    display: 'flex', 
    flexDirection: 'column', 
    justifyContent: 'flex-end' 
  },
  clickableOverlay: { 
    flex: 1, 
    width: '100%', 
    cursor: 'default' 
  },
  containerWrapper: { 
    width: '100%', 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center' 
  },
  closeBtnStyle: { 
    background: '#111827', 
    border: 'none', 
    width: '48px', 
    height: '48px', 
    borderRadius: '50%', 
    cursor: 'pointer', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: '20px',
    boxShadow: '0 6px 20px rgba(0,0,0,0.35)'
  },
  sheetStyle: { 
    background: 'white', 
    borderTopLeftRadius: '36px', 
    borderTopRightRadius: '36px', 
    padding: '10px 24px 20px 24px', 
    width: '100%', 
    height: '70vh', // FORCED HEIGHT 70%
    maxHeight: '70vh', 
    display: 'flex', 
    flexDirection: 'column', 
    boxSizing: 'border-box', 
    boxShadow: '0 -15px 50px rgba(0,0,0,0.15)',
    overflow: 'hidden'
  },
  sheetHandle: { 
    width: '45px', 
    height: '5px', 
    background: '#EAEAEA', 
    borderRadius: '10px', 
    margin: '10px auto 20px auto',
    flexShrink: 0
  },
  gpsCard: { 
    background: 'white', 
    borderRadius: '24px', 
    padding: '18px', 
    display: 'flex', 
    alignItems: 'center', 
    border: '1px solid #E5E7EB', 
    marginBottom: '20px', 
    flexShrink: 0,
    boxShadow: '0 8px 30px rgba(0,0,0,0.04)'
  },
  gpsFlex: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '18px', 
    width: '100%' 
  },
  pinIconContainer: { 
    width: '48px', 
    height: '48px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    background: '#EFF6FF', 
    borderRadius: '14px' 
  },
  gpsTextContent: { 
    flex: 1 
  },
  gpsTitle: { 
    fontSize: '16px', 
    fontWeight: '800', 
    color: '#111827',
    lineHeight: '1.2'
  },
  gpsSub: { 
    fontSize: '12px', 
    color: '#6B7280', 
    marginTop: '4px',
    lineHeight: '1.4'
  },
  enableBtn: { 
    background: '#3B82F6', 
    color: 'white', 
    border: 'none', 
    padding: '12px 20px', 
    borderRadius: '12px', 
    fontWeight: '900',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)'
  },
  scrollableWrapper: { 
    flex: 1, 
    overflowY: 'auto', 
    marginBottom: '15px',
    paddingRight: '2px' 
  },
  savedSection: { 
    display: 'flex', 
    flexDirection: 'column' 
  },
  sectionHeader: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: '16px' 
  },
  sectionLabelSmall: { 
    fontSize: '12px', 
    fontWeight: '900', 
    color: '#9CA3AF', 
    letterSpacing: '1.2px' 
  },
  seeAllBtn: { 
    fontSize: '13px', 
    fontWeight: '800', 
    color: '#3B82F6',
    cursor: 'pointer'
  },
  listContainer: { 
    display: 'flex', 
    flexDirection: 'column' 
  },
  addressRow: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '16px', 
    cursor: 'pointer', 
    padding: '18px 0', 
    borderBottom: '1px solid #E5E7EB' 
  },
  iconBox: { 
    width: '44px', 
    height: '44px', 
    borderRadius: '14px', 
    background: '#F3F4F6', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    color: '#4B5563' 
  },
  addressInfo: { 
    flex: 1, 
    minWidth: 0 
  },
  addrTypeTitle: { 
    fontSize: '16px', 
    fontWeight: '800', 
    color: '#111827' 
  },
  addrFullText: { 
    fontSize: '13px', 
    color: '#6B7280', 
    whiteSpace: 'nowrap', 
    overflow: 'hidden', 
    textOverflow: 'ellipsis',
    marginTop: '4px'
  },
  shareSheetBtn: { 
    padding: '10px',
    borderRadius: '10px',
    background: '#F3F4F6'
  },
  searchRow: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '16px', 
    padding: '22px', 
    background: 'white', 
    borderRadius: '24px', 
    border: '1px solid #E5E7EB', 
    cursor: 'pointer', 
    flexShrink: 0,
    boxShadow: '0 8px 30px rgba(0,0,0,0.04)'
  },
  searchIconBox: { 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  searchPlaceholderText: { 
    flex: 1, 
    fontSize: '16px', 
    color: '#6B7280', 
    fontWeight: '600' 
  },
  emptyState: { 
    padding: '50px 0', 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: '14px' 
  },
  emptyIconBox: { 
    width: '64px', 
    height: '64px', 
    borderRadius: '22px', 
    background: '#F3F4F6', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  emptyText: { 
    fontSize: '14px', 
    fontWeight: '700', 
    color: '#9CA3AF', 
    textAlign: 'center',
    maxWidth: '220px',
    lineHeight: '1.5'
  },
  bottomSafetyPad: { 
    height: '15px' 
  }
};

export default LocationSheet;