import React from 'react';

// --- STYLING HELPERS ---
const pageStyle = { 
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
    background: '#f8f8f8', overflowY: 'auto', WebkitOverflowScrolling: 'touch', 
    zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'flex-start' 
};
const subPageCard = { 
    width: '100%', maxWidth: '480px', background: '#fff', padding: '25px', 
    paddingBottom: '150px', minHeight: '100%', boxSizing:'border-box', 
    boxShadow:'0 0 15px rgba(0,0,0,0.05)', position: 'relative', zIndex: 2001 
};
const backBtn = { background:'none', border:'none', fontSize:'16px', color:'#2E7D32', cursor:'pointer', marginBottom:'25px', padding:0, fontWeight:'700', marginTop: '10px' };
const sectionTitle = { margin:'0 0 25px 0', color:'#333', fontSize:'24px', fontWeight:'800' };
const subSectionTitle = { margin:'20px 0 15px 0', color:'#444', fontSize:'17px', borderLeft:'4px solid #FFC107', paddingLeft:'12px', fontWeight:'700' }; 
const formGroup = { marginBottom:'25px', position: 'relative' }; 
const formRow = { display:'flex', gap:'15px' };
const label = { display:'block', fontSize:'12px', fontWeight:'600', color:'#888', marginBottom:'5px', textTransform:'uppercase' }; 
const ajioInput = { width:'100%', padding: '12px 0', borderRadius: '0', border: 'none', borderBottom: '1px solid #ddd', fontSize: '15px', boxSizing: 'border-box', background: '#fff', color: '#333', outline:'none' }; 

const gpsBox = { background:'linear-gradient(135deg, #1976D2, #2196F3)', padding: '20px', borderRadius: '12px', marginBottom: '30px', boxShadow: '0 4px 15px rgba(33, 150, 243, 0.4)', display:'flex', flexDirection: 'column', color: 'white' };
const gpsToolHeader = { fontSize: '18px', fontWeight: '800', marginBottom: '10px', display: 'flex', alignItems: 'center' };
const gpsStatus = (status) => ({ fontSize: '14px', color: status === 'Missing' ? '#FFC107' : '#E0E0E0', marginTop: '5px', fontWeight: '600' });
const actionBtn = { background:'#FFC107', color:'#333', border:'none', padding:'12px 18px', borderRadius:'8px', cursor:'pointer', fontWeight:'bold', fontSize:'14px', flexShrink: 0, marginTop: '15px', transition: 'background 0.2s ease' };
const mainSaveBtn = { width:'100%', background:'#2E7D32', color:'white', border:'none', padding:'16px', borderRadius:'12px', fontSize:'17px', fontWeight:'bold', cursor:'pointer', marginTop:'20px', marginBottom: '80px', boxShadow: '0 4px 15px rgba(46, 125, 50, 0.3)' };

function ConsumerProfile({ profileData, setProfileData, saveData, isSaving, setBaseLocation, setActiveView, NotificationBar }) {
    const { homeAddress } = profileData; 

    const handleHomeAddressChange = (key, value) => {
        setProfileData(prev => ({
            ...prev,
            homeAddress: { ...prev.homeAddress, [key]: value }
        }));
    };

    return (
        <div style={pageStyle}>
            <NotificationBar />
            <div style={subPageCard}>
                <button onClick={() => setActiveView('menu')} style={backBtn}>⬅ Back to Menu</button>
                <h2 style={sectionTitle}>👤 Personal Details</h2>
                
                <div style={formGroup}>
                    <label style={label}>Account Name</label>
                    <input type="text" value={profileData.name} onChange={e=>setProfileData({...profileData, name:e.target.value})} style={ajioInput} />
                </div>
                
                <div style={formGroup}>
                    <label style={label}>Primary Phone Number</label>
                    <input type="tel" placeholder="e.g. 919876543210" value={profileData.phone} onChange={e=>setProfileData({...profileData, phone:e.target.value})} style={ajioInput} />
                </div>

                <hr style={{margin:'25px 0', borderColor:'#eee'}}/>
                <h3 style={subSectionTitle}>🏠 Primary Home Address</h3>

                <div style={gpsBox}>
                     <div style={gpsToolHeader}>
                         <span style={{marginRight: '8px'}}>🛰️</span> GPS Tool
                     </div>
                    <p style={gpsStatus(homeAddress.lat ? 'Active' : 'Missing')}>
                         Status: {homeAddress.lat ? `Active: ${homeAddress.lat.toFixed(4)}, ${homeAddress.lng.toFixed(4)}` : 'Missing'}
                     </p>
                    <button onClick={() => setBaseLocation('homeAddress')} style={actionBtn}>Get Current GPS & Pre-fill</button>
                </div>

                <div style={formRow}>
                    <div style={{...formGroup, flex:1}}>
                        <label style={label}>Pincode</label>
                        <input type="text" value={homeAddress.pincode} onChange={e=>handleHomeAddressChange('pincode', e.target.value)} style={ajioInput} />
                    </div>
                    <div style={{...formGroup, flex:1}}>
                        <label style={label}>City</label>
                        <input type="text" value={homeAddress.city} onChange={e=>handleHomeAddressChange('city', e.target.value)} style={ajioInput} />
                    </div>
                </div>

                <div style={formGroup}><label style={label}>State</label><input type="text" value={homeAddress.state} onChange={e=>handleHomeAddressChange('state', e.target.value)} style={ajioInput} /></div>
                <div style={formGroup}><label style={label}>Locality / Area / Street</label><input type="text" value={homeAddress.locality} onChange={e=>handleHomeAddressChange('locality', e.target.value)} style={ajioInput} /></div>
                <div style={formGroup}><label style={label}>Flat no / Building Name</label><input type="text" value={homeAddress.building} onChange={e=>handleHomeAddressChange('building', e.target.value)} style={ajioInput} /></div>
                <div style={formGroup}><label style={label}>Landmark (optional)</label><input type="text" value={homeAddress.landmark} onChange={e=>handleHomeAddressChange('landmark', e.target.value)} style={ajioInput} /></div>

                <button onClick={() => saveData()} style={mainSaveBtn} disabled={isSaving}>
                    {isSaving ? 'Saving...' : '💾 Save Personal Profile'}
                </button>
            </div>
        </div>
    );
}

export default ConsumerProfile;