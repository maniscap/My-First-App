import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Permanent+Marker&family=Caveat+Brush&display=swap');

.door-container {
    position: fixed;
    inset: 0;
    z-index: 99999;
    display: flex;
    perspective: 2500px;
    background: transparent;
    pointer-events: none;
    overflow: hidden;
}

/* ── MURAL PANELS (Indian Paddy Fields) ── */
.door {
    width: 50vw;
    height: 100vh;
    /* Beautiful mural of Indian paddy fields and farmers! */
    background-image: url('/indian_farm_mural.png');
    background-size: 200% 100%;
    position: relative;
    transform-style: preserve-3d;
    pointer-events: all;
    /* Soft shadow to inset the mural into the wood frame */
    box-shadow: inset 0 0 60px rgba(0,0,0,0.8);
    z-index: 10;
}

/* Darken slightly so text is readable over the bright sky/fields */
.door::before {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.2);
    z-index: 1;
}

.door-left {
    transform-origin: left center;
    background-position: left center;
    border-right: 2px solid #000;
}
.door-right {
    transform-origin: right center;
    background-position: right center;
    border-left: 2px solid #000;
}

/* ── SIMPLE 3D WOODEN OUTER FRAMES ── */
.barn-frame {
    position: absolute;
    /* Warm, realistic brown wood */
    background-color: #5c3210;
    background-image: url('/farm_wood.png');
    background-size: cover;
    background-blend-mode: hard-light;
    
    border: 2px solid #1c130d;
    /* 3D Lighting Bevels */
    border-top: 2px solid rgba(255,255,255,0.1);
    border-left: 2px solid rgba(255,255,255,0.1);
    border-bottom: 2px solid rgba(0,0,0,0.9);
    border-right: 2px solid rgba(0,0,0,0.9);
    
    /* Massive 3D shadow over the mural */
    box-shadow: 10px 10px 25px rgba(0,0,0,0.9);
    z-index: 5;
}

/* Simple outer border framing the beautiful mural */
.frame-top { top: 0; left: 0; right: 0; height: 12vh; }
.frame-bottom { bottom: 0; left: 0; right: 0; height: 12vh; }
.frame-edge-out { top: 0; bottom: 0; width: 8vw; }
.frame-edge-in { top: 0; bottom: 0; width: 4vw; }

.door-left .frame-edge-out { left: 0; }
.door-left .frame-edge-in { right: 0; }
.door-right .frame-edge-out { right: 0; }
.door-right .frame-edge-in { left: 0; }

/* ── HEAVY IRON HARDWARE ── */
.iron-hinge {
    position: absolute;
    width: 25vw;
    height: 5vh;
    background: linear-gradient(to bottom, #111, #000);
    border-top: 1px solid #333;
    box-shadow: 4px 8px 15px rgba(0,0,0,1);
    display: flex;
    align-items: center;
    padding-left: 3vw;
    z-index: 20;
}
.door-left .iron-hinge { left: 0; border-radius: 0 5vh 5vh 0; }
.door-right .iron-hinge { right: 0; flex-direction: row-reverse; padding-left: 0; padding-right: 3vw; border-radius: 5vh 0 0 5vh; }
.hinge-top { top: 20vh; }
.hinge-bottom { bottom: 20vh; }

.iron-bolt {
    width: 2.5vh; height: 2.5vh;
    background: radial-gradient(circle at 30% 30%, #444, #000);
    border-radius: 50%;
    margin-right: 4vw;
    box-shadow: inset 1px 1px 3px rgba(255,255,255,0.4), 2px 2px 6px rgba(0,0,0,1);
}
.door-right .iron-bolt { margin-right: 0; margin-left: 4vw; }

.iron-handle {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 3vw; height: 35vh;
    background: linear-gradient(to right, #111, #222 20%, #000 80%);
    border-left: 1px solid #444;
    border-radius: 1.5vw;
    box-shadow: 10px 15px 25px rgba(0,0,0,0.9), inset -2px -2px 5px rgba(0,0,0,0.9);
    z-index: 30;
}
.door-left .iron-handle { right: 7vw; }
.door-right .iron-handle { left: 7vw; }

/* ── PAINTED TEXT OVER MURAL ── */
.painted-text-container {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 50;
    pointer-events: none;
    text-align: center;
    mix-blend-mode: hard-light; 
    opacity: 0.95;
}

.text-title {
    font-family: 'Caveat Brush', cursive;
    color: #fef08a; /* Bright yellow paint */
    font-size: clamp(50px, 8vw, 130px);
    transform: rotate(-2deg);
    text-shadow: 2px 3px 6px rgba(0,0,0,0.7);
    margin-bottom: 2vh;
}

.text-sub {
    font-family: 'Caveat Brush', cursive;
    color: #ffffff; /* White Paint */
    font-size: clamp(28px, 4vw, 70px);
    transform: rotate(1deg);
    text-shadow: 2px 3px 6px rgba(0,0,0,0.7);
}

.text-mode {
    font-family: 'Caveat Brush', cursive;
    color: #fef08a; /* Bright yellow paint */
    font-size: clamp(45px, 7vw, 110px);
    transform: rotate(2deg);
    text-shadow: 2px 3px 6px rgba(0,0,0,0.7);
}

.text-welcome {
    font-family: 'Caveat Brush', cursive;
    color: #ffffff; /* White Paint */
    font-size: clamp(28px, 4vw, 70px);
    transform: rotate(-1deg);
    text-shadow: 2px 3px 6px rgba(0,0,0,0.7);
    margin-bottom: 1vh;
}
`;

export default function BrandedTransition3D({ isVisible, targetMode }) {
    const isSeller = targetMode === 'seller';
    
    // Slow, dramatic cinematic heavy swing
    const swingEase = [0.4, 0, 0.2, 1]; 

    return (
        <>
            {/* PRELOAD IMAGES TO PREVENT MOBILE LAG ON CLICK */}
            <div style={{ display: 'none' }}>
                <img src="/indian_farm_mural.png" alt="preload" />
                <img src="/farm_wood.png" alt="preload" />
            </div>
            
            <style>{STYLES}</style>
            <AnimatePresence>
                {isVisible && (
                    <div className="door-container">
                        
                        {/* ── LEFT DOOR ── */}
                        <motion.div 
                            className="door door-left"
                            initial={{ rotateY: 0 }}
                            animate={{ rotateY: 105 }}
                            transition={{ delay: 1.5, duration: 1.5, ease: swingEase }}
                        >
                            {/* Simple 3D Wood Frames Bordering the Mural */}
                            <div className="barn-frame frame-top" />
                            <div className="barn-frame frame-bottom" />
                            <div className="barn-frame frame-edge-out" />
                            <div className="barn-frame frame-edge-in" />

                            {/* Heavy Iron Hardware */}
                            <div className="iron-hinge hinge-top">
                                <div className="iron-bolt" />
                                <div className="iron-bolt" />
                            </div>
                            <div className="iron-hinge hinge-bottom">
                                <div className="iron-bolt" />
                                <div className="iron-bolt" />
                            </div>
                            <div className="iron-handle" />

                            {/* Painted Text */}
                            <div className="painted-text-container">
                                <div className="text-title">FARMCAP</div>
                                <div className="text-sub">Growing Smarter, Together</div>
                            </div>
                        </motion.div>

                        {/* ── RIGHT DOOR ── */}
                        <motion.div 
                            className="door door-right"
                            initial={{ rotateY: 0 }}
                            animate={{ rotateY: -105 }}
                            transition={{ delay: 1.5, duration: 1.5, ease: swingEase }}
                        >
                            {/* Simple 3D Wood Frames Bordering the Mural */}
                            <div className="barn-frame frame-top" />
                            <div className="barn-frame frame-bottom" />
                            <div className="barn-frame frame-edge-out" />
                            <div className="barn-frame frame-edge-in" />

                            {/* Heavy Iron Hardware */}
                            <div className="iron-hinge hinge-top">
                                <div className="iron-bolt" />
                                <div className="iron-bolt" />
                            </div>
                            <div className="iron-hinge hinge-bottom">
                                <div className="iron-bolt" />
                                <div className="iron-bolt" />
                            </div>
                            <div className="iron-handle" />

                            {/* Painted Text */}
                            <div className="painted-text-container">
                                <div className="text-welcome">Welcome To</div>
                                <div className="text-mode">
                                    {isSeller ? 'SELLER MODE' : 'CONSUMER MODE'}
                                </div>
                            </div>
                        </motion.div>

                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
