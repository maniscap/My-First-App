import React from 'react';

const LivingFarm = () => {
  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100%', 
      height: '100%', 
      zIndex: 0, 
      backgroundColor: '#000' 
    }}>
      {/* Using an iframe is a professional workaround for 403 Forbidden issues in 2026 */}
      <iframe 
        src="https://my.spline.design/interactivedandingboy-LoHI2YYFWDHzgcjBzMuBORSD/" 
        frameBorder="0" 
        width="100%" 
        height="100%"
        title="Danding Boy 3D"
        style={{ pointerEvents: 'none' }}
      />
    </div>
  );
};

export default LivingFarm;