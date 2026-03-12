import React from 'react';

const SplashScreen = () => {
  return (
    <div 
      style={{ backgroundColor: '#000000' }} 
      className="flex flex-col h-screen w-full items-center justify-center m-0 p-0 relative overflow-hidden"
    >
      {/* We inject the custom CSS animation directly here so you don't need extra files */}
      <style>
        {`
          /* The patch of soil */
          .soil {
            width: 80px;
            height: 4px;
            background-color: #8B5A2B; /* Dirt brown */
            border-radius: 5px;
            position: relative;
            margin-top: 60px;
          }
          
          /* The stem growing upward */
          .stem {
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 4px;
            height: 0px;
            background-color: #4ade80; /* Farmcap Green */
            border-radius: 5px;
            animation: growStem 1s ease-out forwards;
          }
          
          /* The leaves popping out */
          .leaf {
            position: absolute;
            background-color: #4ade80;
            opacity: 0;
            animation: growLeaf 0.8s ease-out 0.8s forwards; /* 0.8s delay so it waits for stem */
          }
          
          /* Left leaf styling */
          .leaf.left {
            bottom: 20px;
            right: 50%;
            border-radius: 0 15px 0 15px; /* Leaf shape */
            transform-origin: bottom right;
            transform: rotate(-25deg);
          }
          
          /* Right leaf styling */
          .leaf.right {
            bottom: 35px;
            left: 50%;
            border-radius: 15px 0 15px 0; /* Leaf shape */
            transform-origin: bottom left;
            transform: rotate(25deg);
          }

          /* Keyframes (The actual movement instructions) */
          @keyframes growStem {
            0% { height: 0px; }
            100% { height: 60px; }
          }
          @keyframes growLeaf {
            0% { width: 0px; height: 0px; opacity: 0; }
            100% { 
              width: 25px; 
              height: 25px; 
              opacity: 1; 
              box-shadow: 0 0 12px rgba(74, 222, 128, 0.6); /* Adds a high-tech glow! */
            }
          }
        `}
      </style>

      {/* The Visual Elements */}
      <div className="relative flex justify-center w-32 h-32 mb-4">
        <div className="soil">
          <div className="stem">
            <div className="leaf left"></div>
            <div className="leaf right"></div>
          </div>
        </div>
      </div>

      {/* The Text */}
      <h2 className="text-[#4ade80] tracking-[0.2em] text-sm font-semibold animate-pulse mt-8">
        GROWING YOUR DATA...
      </h2>
    </div>
  );
};

export default SplashScreen;