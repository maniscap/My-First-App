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
          const apiRes = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          
          const data = await apiRes.json();
          
          // Construct location label
          const locationLabel = data.locality || data.city || "Unknown Area";
          const subLabel = data.principalSubdivision || "";
          const fullDisplay = `${locationLabel}, ${subLabel}`;
          
          onLocationSelect(
            "Current Location", 
            fullDisplay, 
            latitude, 
            longitude
          );
          
        } catch (err) { 
          console.error("Reverse Geocoding Error:", err);
          alert("GPS coordinates found, but failed to fetch address name."); 
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
                      color="#F84464" 
                      fill="#F84464" 
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
                  color="#F84464" 
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
    background: '#1C1C1C', 
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
    background: '#FAFAFA', 
    borderRadius: '24px', 
    padding: '18px', 
    display: 'flex', 
    alignItems: 'center', 
    border: '1.5px solid #F5F5F5', 
    marginBottom: '20px', 
    flexShrink: 0 
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
    background: '#FFF0F2', 
    borderRadius: '14px' 
  },
  gpsTextContent: { 
    flex: 1 
  },
  gpsTitle: { 
    fontSize: '16px', 
    fontWeight: '800', 
    color: '#1C1C1C',
    lineHeight: '1.2'
  },
  gpsSub: { 
    fontSize: '12px', 
    color: '#888', 
    marginTop: '4px',
    lineHeight: '1.4'
  },
  enableBtn: { 
    background: '#F84464', 
    color: 'white', 
    border: 'none', 
    padding: '12px 20px', 
    borderRadius: '12px', 
    fontWeight: '900',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(248, 68, 100, 0.2)'
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
    color: '#BBBBBB', 
    letterSpacing: '1.2px' 
  },
  seeAllBtn: { 
    fontSize: '13px', 
    fontWeight: '800', 
    color: '#F84464',
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
    borderBottom: '1px solid #F9F9F9' 
  },
  iconBox: { 
    width: '44px', 
    height: '44px', 
    borderRadius: '14px', 
    background: '#F8F8F8', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    color: '#555555' 
  },
  addressInfo: { 
    flex: 1, 
    minWidth: 0 
  },
  addrTypeTitle: { 
    fontSize: '16px', 
    fontWeight: '800', 
    color: '#1C1C1C' 
  },
  addrFullText: { 
    fontSize: '13px', 
    color: '#777777', 
    whiteSpace: 'nowrap', 
    overflow: 'hidden', 
    textOverflow: 'ellipsis',
    marginTop: '4px'
  },
  shareSheetBtn: { 
    padding: '10px',
    borderRadius: '10px',
    background: '#F9F9F9'
  },
  searchRow: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '16px', 
    padding: '22px', 
    background: '#FAFAFA', 
    borderRadius: '26px', 
    border: '1px solid #EEEEEE', 
    cursor: 'pointer', 
    flexShrink: 0,
    boxShadow: '0 4px 10px rgba(0,0,0,0.02)'
  },
  searchIconBox: { 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  searchPlaceholderText: { 
    flex: 1, 
    fontSize: '16px', 
    color: '#999999', 
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
    background: '#FBFBFB', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  emptyText: { 
    fontSize: '14px', 
    fontWeight: '700', 
    color: '#CCCCCC', 
    textAlign: 'center',
    maxWidth: '220px',
    lineHeight: '1.5'
  },
  bottomSafetyPad: { 
    height: '15px' 
  }
};

export default LocationSheet;