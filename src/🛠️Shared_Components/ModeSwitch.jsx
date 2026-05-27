import React from 'react';
import { useUserMode } from '../UserModeContext';

function ModeSwitch() {
    const { isSellerMode, toggleUserMode } = useUserMode();

    return (
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', background:'#fff', padding:'15px 20px', borderRadius:'12px', marginBottom:'15px', boxShadow:'0 2px 10px rgba(0,0,0,0.05)'}}>
            <div>
                <div style={{fontWeight:'700', fontSize:'16px', color:'#333'}}>
                    {isSellerMode ? 'Seller Mode' : 'Consumer Mode'}
                </div>
                <div style={{fontSize:'12px', color:'#666'}}>
                    {isSellerMode ? 'Manage your shop & listings' : 'Manage your purchases & account'}
                </div>
            </div>
            <div onClick={toggleUserMode} style={{width:'50px', height:'28px', background: isSellerMode ? '#4CAF50' : '#2196F3', borderRadius:'30px', position:'relative', cursor:'pointer', transition:'0.3s'}}>
                <div style={{width:'24px', height:'24px', background:'white', borderRadius:'50%', position:'absolute', top:'2px', left: isSellerMode ? '24px' : '2px', transition:'0.3s', boxShadow:'0 2px 5px rgba(0,0,0,0.2)'}}></div>
            </div>
        </div>
    );
}

export default ModeSwitch;