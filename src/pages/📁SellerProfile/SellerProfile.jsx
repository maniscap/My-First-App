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

const profileHeader = { textAlign:'center', marginBottom:'30px', paddingBottom:'20px', borderBottom:'1px solid #eee' };
const avatarLargeContainer = { width:'110px', height:'110px', borderRadius:'50%', background:'white', margin:'0 auto 15px', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', border:'4px solid #FF9800', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' };
const avatarImg = { width:'100%', height:'100%', objectFit:'cover' };
const uploadBtn = { color:'#2196F3', fontSize:'14px', fontWeight:'bold', cursor:'pointer', marginTop:'10px', display:'inline-block' };

const formGroup = { marginBottom:'25px', position: 'relative' }; 
const formRow = { display:'flex', gap:'15px' };
const label = { display:'block', fontSize:'12px', fontWeight:'600', color:'#888', marginBottom:'5px', textTransform:'uppercase' }; 
const ajioInput = { width:'100%', padding: '12px 0', borderRadius: '0', border: 'none', borderBottom: '1px solid #ddd', fontSize: '15px', boxSizing: 'border-box', background: '#fff', color: '#333', outline:'none' }; 

const gpsBox = { background:'linear-gradient(135deg, #1976D2, #2196F3)', padding: '20px', borderRadius: '12px', marginBottom: '30px', boxShadow: '0 4px 15px rgba(33, 150, 243, 0.4)', display:'flex', flexDirection: 'column', color: 'white' };
const gpsToolHeader = { fontSize: '18px', fontWeight: '800', marginBottom: '10px', display: 'flex', alignItems: 'center' };
const gpsStatus = (status) => ({ fontSize: '14px', color: status === 'Missing' ? '#FFC107' : '#E0E0E0', marginTop: '5px', fontWeight: '600' });
const actionBtn = { background:'#FFC107', color:'#333', border:'none', padding:'12px 18px', borderRadius:'8px', cursor:'pointer', fontWeight:'bold', fontSize:'14px', flexShrink: 0, marginTop: '15px', transition: 'background 0.2s ease' };
const blackSaveBtn = { width:'100%', background:'#000', color:'white', border:'none', padding:'16px', borderRadius:'12px', fontSize:'16px', fontWeight:'bold', cursor:'pointer', marginTop:'20px', marginBottom: '80px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' };

// RATING HELPERS
const renderRatingBreakdown = () => {
    const breakdown = { '5': 25, '4': 15, '3': 20, '2': 10, '1': 30 }; 
    const keys = ['5', '4', '3', '2', '1'];
    return (
        <div style={{width: '100%'}}>
            {keys.map(star => (
                <div key={star} style={{display: 'flex', alignItems: 'center', margin: '6px 0'}}>
                    <span style={{fontSize: '13px', color: '#333', width: '20px', fontWeight: '600'}}>{star}★</span>
                    <div style={{flexGrow: 1, height: '8px', background: '#F0F0F0', borderRadius: '4px', margin: '0 10px'}}>
                        <div style={{width: `${breakdown[star] || 0}%`, height: '100%', background: '#4CAF50', borderRadius: '4px'}}></div>
                    </div>
                    <span style={{fontSize: '13px', color: '#666', width: '40px', textAlign: 'right'}}>{breakdown[star] || 0}%</span>
                </div>
            ))}
        </div>
    );
};

const renderCategoryRating = (title, score, maxScore = 5) => (
    <div style={{ marginBottom: '15px' }}>
        <div style={{ fontSize: '14px', color: '#333', fontWeight: '600', marginBottom: '4px' }}>{title}</div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '16px', color: '#333', fontWeight: 'bold', width: '30px' }}>{score.toFixed(1)}</span>
            <div style={{ flexGrow: 1, height: '8px', background: '#F0F0F0', borderRadius: '4px', margin: '0 10px' }}>
                <div style={{width: `${(score / maxScore) * 100}%`, height: '100%', background: '#FFC107', borderRadius: '4px'}}></div>
            </div>
        </div>
    </div>
);

function SellerProfile({ profileData, setProfileData, saveData, isSaving, setBaseLocation, setActiveView, handlePhotoUpload, NotificationBar }) {
    const { businessAddress } = profileData; 

    const handleBusinessAddressChange = (key, value) => {
        setProfileData(prev => ({
            ...prev,
            businessAddress: { ...prev.businessAddress, [key]: value }
        }));
    };

    return (
        <div style={pageStyle}>
            <NotificationBar />
            <div style={subPageCard}>
                <button onClick={() => setActiveView('menu')} style={backBtn}>⬅ Back to Menu</button>
                <h2 style={sectionTitle}>🏪 Seller Profile Management</h2>
                
                <div style={profileHeader}>
                    <div style={avatarLargeContainer}>
                        <img src={profileData.photo || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} style={avatarImg} alt="Seller Photo" />
                    </div>
                    <label style={uploadBtn}>
                        📷 Edit Profile Picture
                        <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{display:'none'}} />
                    </label>
                </div>
                
                <div style={formGroup}><label style={label}>Shop / Business Name (Public)</label><input type="text" placeholder="e.g. Raju Tractors & Services" value={profileData.sellerName} onChange={e=>setProfileData({...profileData, sellerName:e.target.value})} style={ajioInput} /></div>
                <div style={formGroup}><label style={label}>Seller Name (Owner)</label><input type="text" placeholder="e.g. Arjun Reddy" value={profileData.name} onChange={e=>setProfileData({...profileData, name:e.target.value})} style={ajioInput} /></div>
                
                <hr style={{margin:'25px 0', borderColor:'#eee'}}/>
                <h3 style={subSectionTitle}>Contact & Public Location</h3>
                
                <div style={formGroup}><label style={label}>Primary Phone (Used for Listings)</label><input type="tel" placeholder="e.g. 919876543210" value={profileData.phone} onChange={e=>setProfileData({...profileData, phone:e.target.value})} style={ajioInput} /></div>
                <div style={formGroup}><label style={label}>Alternate Mobile Number (Optional)</label><input type="tel" placeholder="Optional Backup Number" value={profileData.alternatePhone} onChange={e=>setProfileData({...profileData, alternatePhone:e.target.value})} style={ajioInput} /></div>

                <h3 style={subSectionTitle}>Home Base Address (For Directions/Filtering)</h3>
                
                <div style={gpsBox}>
                     <div style={gpsToolHeader}><span style={{marginRight: '8px'}}>🛰️</span> GPS Tool</div>
                    <p style={gpsStatus(businessAddress.lat ? 'Active' : 'Missing')}>
                         Status: {businessAddress.lat ? `Active: ${businessAddress.lat.toFixed(4)}, ${businessAddress.lng.toFixed(4)}` : 'Missing'}
                     </p>
                    <button onClick={() => setBaseLocation('businessAddress')} style={actionBtn}>Get Current GPS & Pre-fill</button>
                </div>

                <div style={formRow}>
                    <div style={{...formGroup, flex:1}}><label style={label}>Pincode</label><input type="text" value={businessAddress.pincode} onChange={e=>handleBusinessAddressChange('pincode', e.target.value)} style={ajioInput} /></div>
                    <div style={{...formGroup, flex:1}}><label style={label}>City</label><input type="text" value={businessAddress.city} onChange={e=>handleBusinessAddressChange('city', e.target.value)} style={ajioInput} /></div>
                </div>

                <div style={formGroup}><label style={label}>State</label><input type="text" value={businessAddress.state} onChange={e=>handleBusinessAddressChange('state', e.target.value)} style={ajioInput} /></div>
                <div style={formGroup}><label style={label}>Locality / Area / Street</label><input type="text" value={businessAddress.locality} onChange={e=>handleBusinessAddressChange('locality', e.target.value)} style={ajioInput} /></div>
                <div style={formGroup}><label style={label}>Flat no / Building Name</label><input type="text" value={businessAddress.building} onChange={e=>handleBusinessAddressChange('building', e.target.value)} style={ajioInput} /></div>
                <div style={formGroup}><label style={label}>Landmark (optional)</label><input type="text" value={businessAddress.landmark} onChange={e=>handleBusinessAddressChange('landmark', e.target.value)} style={ajioInput} /></div>
                
                <hr style={{margin:'25px 0', borderColor:'#eee'}}/>
                <h3 style={subSectionTitle}>Track Record & Bio</h3>

                <div style={{ border: '1px solid #eee', borderRadius:'10px', marginBottom:'20px', background:'#f9f9f9', padding:'15px' }}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #ddd', paddingBottom:'10px', marginBottom:'15px'}}>
                        <div style={{textAlign:'left'}}><div style={{fontSize:'45px', color:'#FFC107', fontWeight:'900', lineHeight:1}}>{profileData.rating.toFixed(1)}</div><div style={{fontSize:'12px', color:'#666'}}>Overall Rating</div></div>
                        <div style={{textAlign:'right'}}><div style={{fontSize:'35px', color:'#2196F3', fontWeight:'900', lineHeight:1}}>{profileData.ordersCompleted}+</div><div style={{fontSize:'12px', color:'#666'}}>Total Orders Completed</div></div>
                    </div>

                    <h4 style={{margin:'0 0 10px 0', color:'#333', fontSize:'15px', fontWeight:'700'}}>User Rating Breakdown</h4>
                    {renderRatingBreakdown()}
                    <hr style={{margin:'20px 0'}}/>
                    <h4 style={{margin:'0 0 10px 0', color:'#333', fontSize:'15px', fontWeight:'700'}}>Service Quality ({profileData.serviceRating.toFixed(1)})</h4>
                    <p style={{fontSize:'11px', color:'#999', marginBottom:'10px'}}>Service Orders: {profileData.serviceOrders}</p>
                    {profileData.serviceMetrics.map((metric, index) => <div key={'s'+index}>{renderCategoryRating(metric.title, metric.score)}</div>)}
                    <hr style={{margin:'20px 0'}}/>
                    <h4 style={{margin:'0 0 10px 0', color:'#333', fontSize:'15px', fontWeight:'700'}}>Product Quality ({profileData.productRating.toFixed(1)})</h4>
                    <p style={{fontSize:'11px', color:'#999', marginBottom:'10px'}}>Product Orders: {profileData.productOrders}</p>
                    {profileData.productMetrics.map((metric, index) => <div key={'p'+index}>{renderCategoryRating(metric.title, metric.score)}</div>)}
                </div>
                
                <div style={formGroup}><label style={label}>Seller Bio</label><textarea value={profileData.bio} onChange={e=>setProfileData({...profileData, bio:e.target.value})} style={{...ajioInput, minHeight:'100px'}} placeholder="Describe your experience..."></textarea></div>
                <button onClick={() => saveData()} style={blackSaveBtn} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Seller Details'}</button>
            </div>
        </div>
    );
}

export default SellerProfile;