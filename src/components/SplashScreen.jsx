import React, { useEffect } from 'react';

const SplashScreen = ({ onComplete }) => {
  
  // 1. Silent Image Preloader
  useEffect(() => {
    const imageUrls = [
      '/assets/agri-insights.png', 
      '/assets/service-hub.png',
      '/assets/business-zone.png',
      '/assets/farm-fresh.png',
      '/assets/crop-exp.png',
      '/assets/farm-radio.png'
    ];

    imageUrls.forEach((url) => {
      const img = new Image();
      img.src = url; 
    });
  }, []);

  // 2. The Updated 3-Second Timer
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 3000); // Changed from 6000 to 3000

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div 
      style={{ backgroundColor: '#0A0F0D' }} 
      className="flex flex-col min-h-screen w-full items-center justify-center m-0 p-6 relative overflow-hidden"
    >
      <style>
        {`
          .soil {
            width: 90px;
            height: 6px;
            background: linear-gradient(90deg, #5c3a21, #8B5A2B, #5c3a21);
            border-radius: 10px;
            position: relative;
            margin-top: 80px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.5);
          }
          
          .stem {
            position: absolute;
            bottom: 4px;
            left: 50%;
            transform: translateX(-50%);
            width: 6px;
            height: 0px;
            background: linear-gradient(to top, #22c55e, #4ade80); 
            border-radius: 5px;
            /* Sped up stem growth to 1 second */
            animation: growStem 1s cubic-bezier(0.25, 1, 0.5, 1) forwards;
          }
          
          .leaf {
            position: absolute;
            background: linear-gradient(135deg, #4ade80, #22c55e);
            opacity: 0;
            /* Sped up leaf growth and reduced the delay to 0.8s */
            animation: growLeaf 0.8s cubic-bezier(0.25, 1, 0.5, 1) 0.8s forwards; 
          }
          
          .leaf.left {
            bottom: 25px;
            right: 50%;
            border-radius: 0 20px 0 20px;
            transform-origin: bottom right;
            transform: rotate(-35deg) scale(0);
          }
          
          .leaf.right {
            bottom: 45px;
            left: 50%;
            border-radius: 20px 0 20px 0;
            transform-origin: bottom left;
            transform: rotate(35deg) scale(0);
          }

          /* Sped up the breathing delay so it starts earlier */
          .plant-container {
            animation: breathe 2s ease-in-out infinite 1.5s;
          }

          .progress-bar-container {
            width: 200px;
            height: 4px;
            background-color: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            overflow: hidden;
            margin-top: 2rem;
          }

          .progress-fill {
            height: 100%;
            width: 0%;
            background-color: #4ade80;
            box-shadow: 0 0 10px #4ade80;
            /* Changed progress bar fill to exactly 3 seconds */
            animation: fillProgress 3s linear forwards;
          }

          @keyframes growStem {
            0% { height: 0px; box-shadow: 0 0 0px rgba(74, 222, 128, 0); }
            100% { height: 80px; box-shadow: 0 0 15px rgba(74, 222, 128, 0.4); }
          }

          @keyframes growLeaf {
            0% { width: 0px; height: 0px; opacity: 0; transform: rotate(var(--rot)) scale(0); }
            100% { 
              width: 35px; 
              height: 35px; 
              opacity: 1; 
              transform: rotate(var(--rot)) scale(1);
              box-shadow: 0 0 15px rgba(74, 222, 128, 0.5);
            }
          }

          @keyframes breathe {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }

          @keyframes fillProgress {
            0% { width: 0%; }
            100% { width: 100%; }
          }
        `}
      </style>

      {/* The Visual Elements */}
      <div className="relative flex justify-center items-center w-full h-40 mb-8 plant-container">
        <div className="soil">
          <div className="stem">
            <div className="leaf left" style={{"--rot": "-35deg"}}></div>
            <div className="leaf right" style={{"--rot": "35deg"}}></div>
          </div>
        </div>
      </div>

      {/* The Text */}
      <h2 className="text-[#4ade80] tracking-[0.25em] text-xs md:text-sm font-bold uppercase animate-pulse text-center">
        Growing Your Data...
      </h2>

      {/* The 3-Second Progress Bar */}
      <div className="progress-bar-container">
        <div className="progress-fill"></div>
      </div>
    </div>
  );
};

export default SplashScreen;