import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X, Zap, Camera, Loader2, RefreshCw } from 'lucide-react';

// IMPORT YOUR AI BRAIN HERE:
// import { analyzeWithAIBrain } from '../../utils/AiBrain'; 

const SmartLens = () => {
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const [error, setError] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);

    // --- 1. Camera Initialization ---
    useEffect(() => {
        const startCamera = async () => {
            try {
                // Prefer the rear camera ('environment') for scanning
                const constraints = {
                    video: {
                        facingMode: { exact: "environment" }
                    }
                };
                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                setIsLoadingCamera(false); // Camera started successfully
            } catch (err) {
                console.error("Error accessing rear camera:", err);
                // If rear camera fails (e.g., on a laptop), try any camera
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    streamRef.current = stream;
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                } catch (finalErr) {
                    console.error("Error accessing any camera:", finalErr);
                    setError("Could not access the camera. Please check permissions in your browser settings.");
                }
            }
        };

        startCamera();

        // --- 2. Cleanup on component unmount ---
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const handleCapture = async () => {
        if (!videoRef.current) return;

        // 1. Create a <canvas> element.
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        
        // 2. Draw the current video frame onto the canvas.
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        
        // 3. Get the base64 data URL
        const base64Image = canvas.toDataURL('image/jpeg', 0.8);

        setCapturedImage(base64Image);
        setIsAnalyzing(true);
        setAnalysisResult(null);

        try {
            // 4. Send to AIBrain.js
            // Example: Using your AIBrain utility directly
            // const result = await analyzeWithAIBrain("Identify this plant and detect any diseases. Provide brief recommendations.", base64Image);
            // setAnalysisResult(result);

            // NOTE: Simulated delay to show the scanning UI until you uncomment the real AIBrain call above!
            setTimeout(() => {
                setAnalysisResult("🌾 AI Brain Analysis Complete:\n\nThis appears to be a healthy plant leaf. No visible signs of pests or nutrient deficiencies detected. Keep up the good watering schedule!");
                setIsAnalyzing(false);
            }, 3000);

        } catch (err) {
            console.error("AI Brain Analysis Error:", err);
            setError("Failed to analyze the image with AI Brain.");
            setIsAnalyzing(false);
        }
    };

    const handleRetake = () => {
        setCapturedImage(null);
        setAnalysisResult(null);
        setError(null);
    };

    // New function for handling file input
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCapturedImage(reader.result);
                setIsAnalyzing(true); // Simulate analysis start
                setAnalysisResult(null);
                // Simulate AI analysis for uploaded image
                setTimeout(() => {
                    setAnalysisResult("🖼️ AI Brain Analysis Complete for uploaded image:\n\nThis image appears to show a healthy plant. No visible signs of pests or nutrient deficiencies detected. Good job!");
                    setIsAnalyzing(false);
                }, 3000);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div style={styles.container}>
            {isLoadingCamera && ( // Show loading spinner while camera initializes
                <div style={styles.cameraLoadingOverlay}>
                    <Loader2 className="animate-spin" size={50} color="#4ade80" />
                    <p style={styles.cameraLoadingText}>Starting Camera...</p>
                </div>
            )}
            {!isLoadingCamera && !error && ( // Only show video if camera loaded and no error
                <video ref={videoRef} autoPlay playsInline muted style={styles.video} />
            )}

            {/* Captured Image Freeze Frame (always on top of video/loading) */}
            {capturedImage && (
                <img src={capturedImage} alt="Captured" style={styles.capturedPreview} />
            )}

            {/* --- UI OVERLAYS --- */}
            <div style={{ ...styles.overlay, opacity: analysisResult ? 0 : 1, transition: 'opacity 0.3s' }}>

                {/* Header */}
                <div style={styles.header}>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => navigate(-1)} // Go back to the previous page
                        style={styles.controlButton}
                    >
                        <X size={24} color="white" />
                    </motion.button>
                    <div style={styles.headerTitle}>Smart Scanner</div>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        style={styles.controlButton}
                    >
                        <Zap size={22} color="white" />
                    </motion.button>
                </div>

                {/* Center Viewfinder */}
                {!isAnalyzing && !isLoadingCamera && ( // Only show viewfinder if not analyzing and camera loaded
                    <div style={styles.viewfinder}>
                        <div style={styles.viewfinderText}>
                            Position a crop or any object inside the frame
                        </div>
                    </div>
                )}

                {/* AI Scanning Animation Overlay */}
                {isAnalyzing && (
                    <div style={styles.scanningOverlay}>
                        <motion.div 
                            animate={{ y: ['-50px', '50px', '-50px'] }}
                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                            style={styles.laserLine}
                        />
                        <Loader2 className="animate-spin" size={40} color="#4ade80" style={{marginTop: '20px'}} />
                        <p style={styles.scanningText}>AI Brain is analyzing...</p>
                    </div>
                )}

                {/* Footer / Capture Button */}
                {!isAnalyzing && !isLoadingCamera && ( // Only show footer if not analyzing and camera loaded
                    <div style={styles.footer}>
                        {/* Hidden file input */}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                            id="image-upload-input"
                        />
                        {/* Upload Image Button */}
                        <motion.label
                            htmlFor="image-upload-input"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={styles.uploadButton}
                        >
                            <Camera size={24} color="white" /> {/* Reusing Camera icon for upload */}
                        </motion.label>

                        {/* Capture Button */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleCapture}
                            style={styles.captureButton}
                        >
                            <Camera size={32} color="black" />
                        </motion.button>
                    </div>
                )}

            </div>

            {/* Results Bottom Sheet */}
            {analysisResult && (
                <motion.div 
                    initial={{ y: '100%' }} 
                    animate={{ y: 0 }} 
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    style={styles.resultSheet}
                >
                    <h3 style={styles.resultTitle}>Analysis Results</h3>
                    <p style={styles.resultText}>{analysisResult}</p>
                    <button onClick={handleRetake} style={styles.retakeButton}>
                        <RefreshCw size={18} /> Scan Another
                    </button>
                </motion.div>
            )}

            {/* Error Message */}
            {error && (
                <div style={styles.errorOverlay}>
                    <div style={styles.errorBox}>
                        <p>{error}</p>
                        <button onClick={() => navigate(-1)} style={styles.errorButton}>Go Back</button>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#000',
        overflow: 'hidden',
    },
    video: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    capturedPreview: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        zIndex: 1,
    },
    cameraLoadingOverlay: { // New style for camera loading
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.8)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 3,
    },
    cameraLoadingText: { // New style for camera loading text
        color: '#4ade80',
        fontSize: '18px',
        fontWeight: 'bold',
        marginTop: '15px',
        textShadow: '0 2px 4px rgba(0,0,0,0.8)',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 25%, transparent 75%, rgba(0,0,0,0.8) 100%)',
        zIndex: 2,
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px',
        paddingTop: 'calc(20px + env(safe-area-inset-top))',
    },
    controlButton: {
        background: 'rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '50%',
        width: '44px',
        height: '44px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        backdropFilter: 'blur(10px)',
    },
    headerTitle: {
        color: 'white',
        fontSize: '18px',
        fontWeight: '600',
        textShadow: '0 2px 4px rgba(0,0,0,0.5)',
    },
    viewfinder: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        padding: '20px',
    },
    viewfinderText: {
        color: 'white',
        background: 'rgba(0,0,0,0.4)',
        padding: '8px 16px',
        borderRadius: '12px',
        textAlign: 'center',
        fontSize: '14px',
        marginTop: 'auto',
        marginBottom: '120px',
        textShadow: '0 1px 2px rgba(0,0,0,0.3)',
    },
    scanningOverlay: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    laserLine: {
        width: '80%',
        height: '3px',
        background: 'linear-gradient(90deg, transparent, #4ade80, transparent)',
        boxShadow: '0 0 15px 3px rgba(74, 222, 128, 0.5)',
        position: 'absolute',
        top: '50%',
    },
    scanningText: {
        color: '#4ade80',
        fontSize: '16px',
        fontWeight: 'bold',
        marginTop: '15px',
        textShadow: '0 2px 4px rgba(0,0,0,0.8)',
    },
    footer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '30px',
        paddingBottom: 'calc(30px + env(safe-area-inset-bottom))',
    },
    captureButton: {
        width: '70px',
        height: '70px',
        borderRadius: '50%',
        background: 'white',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 0 0 4px rgba(255,255,255,0.3), 0 5px 20px rgba(0,0,0,0.3)',
    },
    uploadButton: { // New style for upload button
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.2)',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 0 0 4px rgba(255,255,255,0.1), 0 5px 20px rgba(0,0,0,0.2)',
        color: 'white',
    },
    resultSheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        background: '#ffffff',
        borderTopLeftRadius: '30px',
        borderTopRightRadius: '30px',
        padding: '30px 20px',
        paddingBottom: 'calc(30px + env(safe-area-inset-bottom))',
        boxSizing: 'border-box',
        zIndex: 5,
        boxShadow: '0 -10px 40px rgba(0,0,0,0.3)',
        display: 'flex',
        flexDirection: 'column',
    },
    resultTitle: {
        margin: '0 0 15px 0',
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    resultText: {
        margin: '0 0 25px 0',
        fontSize: '15px',
        lineHeight: '1.6',
        color: '#4a4a4a',
        whiteSpace: 'pre-wrap',
    },
    retakeButton: {
        background: '#10b981',
        color: '#ffffff',
        border: 'none',
        padding: '16px',
        borderRadius: '16px',
        fontSize: '16px',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        cursor: 'pointer',
    },
    errorOverlay: {
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', zIndex: 10,
    },
    errorBox: {
        background: '#1C1C1E', color: 'white', padding: '30px',
        borderRadius: '20px', textAlign: 'center', maxWidth: '80%',
    },
    errorButton: {
        marginTop: '20px', background: '#2E7D32', color: 'white',
        border: 'none', padding: '10px 20px', borderRadius: '12px',
        cursor: 'pointer', fontWeight: 'bold',
    }
};

export default SmartLens;