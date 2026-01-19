import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LocationSheet = ({ onLocationSelect, onClose, savedAddresses = [] }) => {
  const navigate = useNavigate();
  const [isGpsLoading, setIsGpsLoading] = useState(false);

  // Fallback Mock Data
  const addressesToDisplay = savedAddresses.length > 0 ? savedAddresses : [
    { id: 1, type: 'Home', address: 'Sathyadeva mens pg, Sholinganallur, Chennai, Tamil Nadu' },
    { id: 2, type: 'Work', address: 'Tech Park, OMR Road, Chennai, Tamil Nadu' },
  ];

  const handleEnableLocation = () => {
    if (!navigator.geolocation) { alert("GPS not supported"); return; }
    setIsGpsLoading(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
        const data = await response.json();
        const village = data.locality || data.city || "";
        const district = data.principalSubdivision || "";
        const fullLoc = `${village}, ${district}`;
        onLocationSelect("Current Location", fullLoc, latitude, longitude);
      } catch (error) { 
        alert("Location fetched, but address lookup failed."); 
      }
      setIsGpsLoading(false);
    }, (error) => { 
        console.error(error);
        alert("Please enable location permissions in your browser settings."); 
        setIsGpsLoading(false); 
    });
  };

  return (
    <div style={backdropStyle}>
      
      {/* Click backdrop to close */}
      <div style={{flex:1, width:'100%'}} onClick={onClose}></div>

      {/* Wrapper for Floating X and Sheet */}
      <div style={{width:'100%', display:'flex', flexDirection:'column', alignItems:'center'}}>
        
        {/* --- FLOATING 'X' CLOSE BUTTON --- */}
        <button onClick={onClose} style={closeBtnStyle}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <div style={sheetStyle}>
           
           {/* --- 1. DEVICE LOCATION CARD --- */}
           <div style={gpsCard}>
             <div style={{display:'flex', alignItems:'center', gap:'12px', width:'100%'}}>
                 <div style={pinIconContainer}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#EF4F5F" stroke="#EF4F5F" strokeWidth="1"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3" fill="white" stroke="none"></circle></svg>
                 </div>
                 
                 <div style={{flex:1, paddingRight:'5px'}}>
                    <div style={{fontSize:'15px', fontWeight:'700', color:'#1C1C1C', marginBottom:'3px'}}>Device location not enabled</div>
                    <div style={{fontSize:'12px', color:'#9C9C9C', lineHeight:'1.3'}}>Enable your device location  for a better and convenient experience</div>
                 </div>

                 <button onClick={handleEnableLocation} style={enableBtn}>
                     {isGpsLoading ? "..." : "Enable"}
                 </button>
             </div>
           </div>

           {/* --- 2. SAVED ADDRESSES HEADER --- */}
           <div style={sectionHeader}>
              <div style={{fontSize:'15px', fontWeight:'700', color:'#1C1C1C'}}>Select a saved address</div>
              <div onClick={() => navigate('/user-location')} style={{fontSize:'13px', fontWeight:'600', color:'#EF4F5F', cursor:'pointer'}}>See all</div>
           </div>

           {/* --- 3. ADDRESS LIST --- */}
           <div style={listContainer}>
              {addressesToDisplay.map(addr => (
                  <div key={addr.id} style={addressRow} onClick={() => onLocationSelect(addr.type, addr.address, null, null)}>
                      <div style={homeIconBox}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                      </div>
                      
                      <div style={{flex:1, minWidth: 0, paddingRight:'5px'}}> 
                         <div style={{fontSize:'15px', fontWeight:'700', color:'#1C1C1C', marginBottom:'3px'}}>{addr.type}</div>
                         <div style={{fontSize:'12px', color:'#9C9C9C', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
                           {addr.address}
                         </div>
                      </div>
                  </div>
              ))}
           </div>

           {/* --- 4. SEARCH BAR (Updated Color) --- */}
           <div style={searchRow} onClick={() => navigate('/user-location')}>
             <div style={{width:'40px', display:'flex', justifyContent:'center'}}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4F5F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
             </div>
             {/* CHANGED COLOR TO LIGHT GREY HERE */}
             <span style={searchPlaceholder}>Search location manually</span>
           </div>

        </div>
      </div>
    </div>
  );
};

// --- STYLES ---

const backdropStyle = { 
  position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
  zIndex: 9999, 
  background: 'rgba(0,0,0,0.7)', 
  backdropFilter: 'blur(2px)', 
  display: 'flex', flexDirection: 'column', alignItems:'center', justifyContent: 'flex-end' 
};

const closeBtnStyle = {
  background: '#333333', 
  border: 'none',
  width: '36px', height: '36px',
  borderRadius: '50%',
  cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  marginBottom: '12px', 
  boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
  zIndex: 10000
};

const sheetStyle = { 
  background: 'white', 
  borderTopLeftRadius: '20px', borderTopRightRadius: '20px', 
  padding: '24px 20px 30px 20px', 
  width: '100%', 
  animation: 'slideUp 0.3s cubic-bezier(0.25, 1, 0.5, 1)', 
  maxHeight: '55vh', // UPDATED: Slightly taller (was 50vh)
  display: 'flex', flexDirection: 'column',
  boxShadow: '0 -10px 40px rgba(0,0,0,0.2)',
  boxSizing: 'border-box'
};

const gpsCard = { 
  background: 'white', 
  borderRadius: '12px', 
  padding: '12px 12px 12px 0', 
  display: 'flex', alignItems: 'center', 
  boxShadow: '0 2px 10px rgba(0,0,0,0.08)', 
  border: '1px solid #F0F0F0',
  marginBottom: '25px',
  cursor: 'pointer'
};

const pinIconContainer = {
  width: '50px', 
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};

const enableBtn = { 
  background: '#EF4F5F', 
  color: 'white', 
  border: 'none', 
  padding: '8px 16px', 
  borderRadius: '6px', 
  fontWeight: '700', 
  fontSize: '13px', 
  cursor: 'pointer',
  whiteSpace: 'nowrap'
};

const sectionHeader = { 
  display:'flex', justifyContent:'space-between', alignItems:'center', 
  marginBottom:'15px',
  padding: '0 5px'
};

const listContainer = { 
  display:'flex', flexDirection:'column', gap:'0px', 
  overflowY:'auto', flex:1, marginBottom:'5px' 
};

const addressRow = { 
  display: 'flex', alignItems: 'center', gap: '5px', 
  cursor: 'pointer', padding:'12px 0', 
  borderBottom: '1px solid #F4F4F4' 
};

const homeIconBox = { 
  width:'40px', height:'40px', 
  display:'flex', alignItems: 'center', justifyContent: 'center',
  color: '#4F4F4F'
};

const searchRow = { 
  display: 'flex', alignItems: 'center', gap:'5px', 
  padding: '15px 0 5px 0', 
  cursor: 'pointer',
  marginTop: '5px'
};

// UPDATED: Color changed to light grey
const searchPlaceholder = { fontSize: '15px', color:'#9C9C9C', fontWeight:'500' };

export default LocationSheet;