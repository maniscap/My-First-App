import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Zap, Camera, Loader2, RefreshCw,
  Image, Leaf, ScanSearch, Send, Info,
  RotateCcw, ChevronRight, Sparkles, AlertCircle,
} from 'lucide-react';
import { analyzeWithAIBrain } from '../../utils/AiBrain';

// ─────────────────────────────────────────────────────────────────────────────
// Scan mode config
// ─────────────────────────────────────────────────────────────────────────────
const SCAN_MODES = {
  plant: {
    label: 'Plant Scan',
    Icon: Leaf,
    color: '#22c55e',
    colorDim: 'rgba(34,197,94,0.18)',
    hint: 'Point at any plant, crop, or leaf. AI detects all plant features in the frame.',
    systemPrompt: `You are an expert botanist, agronomist, and plant pathologist.
Analyze the entire image and detect any plants, leaves, crops, or botanical features in the frame. Respond with EXACTLY this structure (use these exact section headers):

**🌿 Species Identification**
State the common name, scientific name, and plant family. If uncertain, say so.

**💚 Health Score**
Give a score like "78 / 100 — Moderate stress detected." One sentence max.

**🔬 Disease & Pest Detection**
List findings as bullet points. Each bullet: condition name — confidence (High/Medium/Low) — brief description.
If nothing detected, write "No issues detected."

**⚠️ Severity**
One word only: Critical | Moderate | Mild | Healthy — followed by one sentence explanation.

**✅ Immediate Actions**
Exactly 3 bullet points. Actionable steps the user should take today.

**🌱 Long-term Care**
Watering, sunlight, fertiliser, pruning — 3–4 bullet points.

Keep each section concise. Use plain English. No padding or filler sentences.`,
  },
  general: {
    label: 'General Scan',
    Icon: ScanSearch,
    color: '#38bdf8',
    colorDim: 'rgba(56,189,248,0.18)',
    hint: 'Point at any object, text, or scene. AI checks the entire frame for relevant items.',
    systemPrompt: `You are a highly capable visual AI assistant with encyclopedic knowledge.
Analyze the image and respond with EXACTLY this structure (use these exact section headers):

**🔍 What Is This?**
Clear, precise identification of the main subject. 2–3 sentences.

**📋 Key Details**
5–6 bullet points covering specs, ingredients, dimensions, model info, or notable attributes.

**🌐 Context & Background**
2–3 sentences of historical, scientific, cultural, or practical context.

**💡 Interesting Facts**
Exactly 3 bullet points. Surprising or lesser-known facts.

**🛠 Useful Tips**
3–4 bullet points. Actionable advice, warnings, or recommendations.

Keep each section tight. Be informative and engaging. No padding.`,
  },
  lens: {
    label: 'Lens Scan',
    Icon: ScanSearch,
    color: '#facc15',
    colorDim: 'rgba(250,204,21,0.18)',
    hint: 'Tap capture to scan the scene. Draw around the object only if you want a tighter crop.',
    systemPrompt: `You are a visual AI assistant that identifies and describes the most important object or scene in the image.
Analyze the entire captured frame and respond with EXACTLY this structure (use these exact section headers):

**🔎 Object Identification**
State the most likely object, product, or scene in 1-2 sentences.

**🧩 Key Features**
List 4 bullet points describing visible details, material, color, or use.

**📍 Context**
Explain where this object is commonly found or how it is used.

**✔️ Best Match**
If unsure, say so clearly. If confident, give one concise result.

If the user has drawn a circle or selection, prioritize that region; otherwise, analyze the whole frame. Keep the answer direct and practical with no extra padding.`,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Camera constraint ladder (4K → 1080p → any)
// ─────────────────────────────────────────────────────────────────────────────
const CAMERA_CONSTRAINTS = [
  { video: { facingMode: { ideal: 'environment' }, width: { ideal: 2560 }, height: { ideal: 1440 }, frameRate: { ideal: 30 } } },
  { video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: { ideal: 30 } } },
  { video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } } },
  { video: true },
];

// ─────────────────────────────────────────────────────────────────────────────
// Blob → base64 helper
// ─────────────────────────────────────────────────────────────────────────────
const blobToBase64 = (blob) =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onloadend = () => res(r.result);
    r.onerror   = rej;
    r.readAsDataURL(blob);
  });

// ─────────────────────────────────────────────────────────────────────────────
// Rich AI Response Renderer
// Parses **Section Header**, bullet lists, numbered lists, inline **bold**
// ─────────────────────────────────────────────────────────────────────────────
const renderInline = (text) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith('**') && p.endsWith('**')
      ? <strong key={i} style={{ color: '#f3f4f6', fontWeight: 700 }}>{p.slice(2, -2)}</strong>
      : p
  );
};

const AIResponse = ({ text, accentColor }) => {
  if (!text) return null;
  const lines    = text.split('\n');
  const elements = [];
  let bullets    = [];
  let keyIdx     = 0;

  const flushBullets = () => {
    if (!bullets.length) return;
    elements.push(
      <ul key={`ul${keyIdx++}`} style={RS.ul}>
        {bullets.map((item, j) => (
          <li key={j} style={RS.li}>
            <span style={{ ...RS.liDot, background: accentColor }} />
            <span style={RS.liText}>{renderInline(item)}</span>
          </li>
        ))}
      </ul>
    );
    bullets = [];
  };

  lines.forEach((raw, idx) => {
    const line = raw.trim();
    if (!line) { flushBullets(); return; }

    // Section header: **emoji Title**
    if (/^\*\*[^*]+\*\*$/.test(line)) {
      flushBullets();
      const title = line.replace(/\*\*/g, '');
      elements.push(
        <div key={`h${idx}`} style={RS.sectionWrap}>
          <div style={{ ...RS.sectionBar, background: accentColor }} />
          <span style={RS.sectionTitle}>{title}</span>
        </div>
      );
      return;
    }

    // Bullet
    if (/^[-•]\s+/.test(line)) {
      bullets.push(line.replace(/^[-•]\s+/, ''));
      return;
    }

    // Numbered
    if (/^\d+\.\s/.test(line)) {
      flushBullets();
      const num  = line.match(/^(\d+)\./)[1];
      const body = line.replace(/^\d+\.\s/, '');
      elements.push(
        <div key={`n${idx}`} style={RS.numRow}>
          <span style={{ ...RS.numBadge, background: accentColor }}>{num}</span>
          <span style={RS.numText}>{renderInline(body)}</span>
        </div>
      );
      return;
    }

    // Paragraph
    flushBullets();
    elements.push(<p key={`p${idx}`} style={RS.para}>{renderInline(line)}</p>);
  });

  flushBullets();
  return <div style={RS.root}>{elements}</div>;
};

const RS = {
  root:        { display: 'flex', flexDirection: 'column', gap: 4 },
  sectionWrap: { display: 'flex', alignItems: 'center', gap: 9, marginTop: 20, marginBottom: 6 },
  sectionBar:  { width: 3, height: 18, borderRadius: 2, flexShrink: 0 },
  sectionTitle:{ color: '#f9fafb', fontSize: 15, fontWeight: 700, letterSpacing: '0.01em' },
  para:        { color: '#c4c9d4', fontSize: 14, lineHeight: 1.72, margin: '2px 0' },
  ul:          { margin: '4px 0 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 },
  li:          { display: 'flex', alignItems: 'flex-start', gap: 10 },
  liDot:       { width: 6, height: 6, borderRadius: '50%', flexShrink: 0, marginTop: 8 },
  liText:      { color: '#c4c9d4', fontSize: 14, lineHeight: 1.65 },
  numRow:      { display: 'flex', alignItems: 'flex-start', gap: 10, margin: '3px 0' },
  numBadge:    { minWidth: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#000', flexShrink: 0, marginTop: 1 },
  numText:     { color: '#c4c9d4', fontSize: 14, lineHeight: 1.65 },
};

// ─────────────────────────────────────────────────────────────────────────────
// Main SmartLens Component
// ─────────────────────────────────────────────────────────────────────────────
const SmartLens = () => {
  const navigate      = useNavigate();
  const videoRef      = useRef(null);
  const viewfinderRef = useRef(null);
  const streamRef     = useRef(null);
  const isMounted     = useRef(true);
  const reqIdRef          = useRef(0);
  const chatEndRef        = useRef(null);

  // Camera
  const [isLoadingCamera, setIsLoadingCamera] = useState(true);
  const [cameraError, setCameraError]         = useState(null);
  const [isFlashOn, setIsFlashOn]             = useState(false);

  // Scan
  const [scanMode, setScanMode]           = useState('plant');
  const [capturedImage, setCapturedImage] = useState(null);
  const [selectionPath, setSelectionPath] = useState([]);
  const [isDrawing, setIsDrawing]         = useState(false);

  // Confirmation
  const [confirmMode, setConfirmMode] = useState(false);
  const [confirmMsg, setConfirmMsg]   = useState('');

  // Analysis
  const [isAnalyzing, setIsAnalyzing]       = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisError, setAnalysisError]   = useState(null);

  // Follow-up chat
  const [chatHistory, setChatHistory]               = useState([]);
  const [followUpText, setFollowUpText]             = useState('');
  const [isFollowUpLoading, setIsFollowUpLoading]   = useState(false);

  const mode = SCAN_MODES[scanMode];
  const lensHint = scanMode === 'lens'
    ? 'Draw a closed loop around the object to auto-capture and analyse instantly.'
    : mode.hint;

  useEffect(() => {
    if (scanMode !== 'lens') {
      setSelectionPath([]);
      setIsDrawing(false);
    }
  }, [scanMode]);


  const normalizePoint = (clientX, clientY) => {
    const rect = viewfinderRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return {
      x: Math.max(0, Math.min(clientX - rect.left, rect.width)),
      y: Math.max(0, Math.min(clientY - rect.top, rect.height)),
    };
  };


  const handleLensPointerDown = (event) => {
    if (scanMode !== 'lens' || isLoadingCamera || cameraError) return;
    const point = normalizePoint(event.clientX, event.clientY);
    if (!point) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setSelectionPath([point]);
    setIsDrawing(true);
    event.preventDefault();
  };

  const handleLensPointerMove = (event) => {
    if (!isDrawing) return;
    const point = normalizePoint(event.clientX, event.clientY);
    if (!point) return;
    setSelectionPath(prev => {
      const last = prev[prev.length - 1];
      if (!last || Math.hypot(point.x - last.x, point.y - last.y) > 4) {
        return [...prev, point];
      }
      return prev;
    });
    event.preventDefault();
  };

  const isPathClosed = (path) => {
    if (!path || path.length < 8) return false;
    const first = path[0];
    const last  = path[path.length - 1];
    const rect  = viewfinderRef.current?.getBoundingClientRect();
    const threshold = rect ? Math.max(rect.width, rect.height) * 0.08 : 28;
    return Math.hypot(first.x - last.x, first.y - last.y) < threshold;
  };

  const autoCaptureLens = async (path) => {
    if (isAnalyzing || !path || !path.length) return;
    const base64 = await captureFromCanvas();
    if (!base64) return;
    setCapturedImage(base64);
    setConfirmMode(false);
    setConfirmMsg('');
    await analyzeCapturedImage(base64);
  };

  const handleLensPointerEnd = (event) => {
    if (!isDrawing) return;
    const point = normalizePoint(event.clientX, event.clientY);
    let nextPath = selectionPath;
    if (point) {
      const last = selectionPath[selectionPath.length - 1];
      if (!last || Math.hypot(point.x - last.x, point.y - last.y) > 4) {
        nextPath = [...selectionPath, point];
      }
    }
    setSelectionPath(nextPath);
    setIsDrawing(false);

    if (scanMode === 'lens' && isPathClosed(nextPath)) {
      setSelectionPath(prev => {
        const first = prev[0];
        if (!first) return prev;
        return [...prev, first];
      });
      autoCaptureLens(nextPath);
    }

    event.preventDefault();
  };

  // ── Camera helpers ─────────────────────────────────────────────────────────
  const stopCamera = useCallback(() => {
    [streamRef.current, videoRef.current?.srcObject].forEach(src => {
      src?.getTracks?.().forEach(t => { t.enabled = false; t.stop(); });
    });
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const startCamera = useCallback(async () => {
    stopCamera();
    reqIdRef.current += 1;
    const id = reqIdRef.current;
    setIsLoadingCamera(true);
    setCameraError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      if (isMounted.current && id === reqIdRef.current) {
        setCameraError('Camera API not supported. Use HTTPS or a modern browser.');
        setIsLoadingCamera(false);
      }
      return;
    }

    for (const constraints of CAMERA_CONSTRAINTS) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (!isMounted.current || id !== reqIdRef.current) {
          stream.getTracks().forEach(t => { t.enabled = false; t.stop(); });
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play?.().catch(() => {});
        }
        enableCameraEnhancements(stream);
        setIsLoadingCamera(false);
        return;
      } catch (err) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          if (isMounted.current && id === reqIdRef.current) {
            setCameraError('Camera access denied. Tap the lock icon in your URL bar, allow camera access, then tap Retry.');
            setIsLoadingCamera(false);
          }
          return;
        }
        if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          if (isMounted.current && id === reqIdRef.current) {
            setCameraError('No camera found on this device.');
            setIsLoadingCamera(false);
          }
          return;
        }
        // soft error — try next constraint set
      }
    }

    if (isMounted.current && id === reqIdRef.current) {
      setCameraError('Camera unavailable — it may be in use by another app.');
      setIsLoadingCamera(false);
    }
  }, [stopCamera]);

  useEffect(() => {
    isMounted.current = true;
    startCamera();
    return () => {
      isMounted.current = false;
      reqIdRef.current += 1;
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatHistory.length) {
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
    }
  }, [chatHistory]);

  // ── Flash ──────────────────────────────────────────────────────────────────
  const toggleFlash = async () => {
    const track = streamRef.current?.getVideoTracks?.()?.[0];
    if (!track) return;
    const next = !isFlashOn;
    try {
      await track.applyConstraints({ advanced: [{ torch: next }] });
      setIsFlashOn(next);
    } catch {
      try { await track.applyConstraints({ torch: next }); setIsFlashOn(next); }
      catch { alert('Flashlight not supported on this device.'); }
    }
  };

  const enableCameraEnhancements = async (stream) => {
    const track = stream?.getVideoTracks?.()?.[0];
    if (!track?.applyConstraints) return;
    try {
      const caps = track.getCapabilities?.() || {};
      const advanced = [];
      if (caps.focusMode?.includes?.('continuous')) advanced.push({ focusMode: 'continuous' });
      if (caps.exposureMode?.includes?.('continuous')) advanced.push({ exposureMode: 'continuous' });
      if (caps.whiteBalanceMode?.includes?.('continuous')) advanced.push({ whiteBalanceMode: 'continuous' });
      if (typeof caps.zoom === 'number' && caps.zoom > 1) {
        const zoom = Math.min(caps.zoom, 2);
        advanced.push({ zoom });
      }
      if (advanced.length) await track.applyConstraints({ advanced });
    } catch (err) {
      console.warn('[SmartLens] Camera enhancement constraints unavailable:', err);
    }
  };

  // ── HIGH-QUALITY Capture ───────────────────────────────────────────────────
  // 1st: ImageCapture API (native hardware shutter — sharpest result)
  // 2nd: Canvas drawImage fallback at full video resolution, JPEG 0.97
  const captureFromCanvas = async () => {
    const v = videoRef.current;
    if (!v?.videoWidth || !v?.videoHeight) return null;
    const width  = v.videoWidth;
    const height = v.videoHeight;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.filter = 'contrast(1.08) saturate(1.12) brightness(1.02)';
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(v, 0, 0, width, height);
    ctx.filter = 'none';

    if (scanMode === 'lens' && selectionPath.length > 2) {
      const rect = viewfinderRef.current?.getBoundingClientRect();
      if (rect?.width && rect?.height) {
        const scaleX = width / rect.width;
        const scaleY = height / rect.height;
        const scaledPoints = selectionPath.map(p => ({ x: p.x * scaleX, y: p.y * scaleY }));
        const minX = Math.max(0, Math.min(...scaledPoints.map(p => p.x)));
        const minY = Math.max(0, Math.min(...scaledPoints.map(p => p.y)));
        const maxX = Math.min(width, Math.max(...scaledPoints.map(p => p.x)));
        const maxY = Math.min(height, Math.max(...scaledPoints.map(p => p.y)));
        const cropWidth = Math.max(64, Math.ceil(maxX - minX));
        const cropHeight = Math.max(64, Math.ceil(maxY - minY));
        const cropCanvas = document.createElement('canvas');
        cropCanvas.width = cropWidth;
        cropCanvas.height = cropHeight;
        const cropCtx = cropCanvas.getContext('2d');
        if (!cropCtx) return canvas.toDataURL('image/jpeg', 0.97);
        cropCtx.drawImage(canvas, minX, minY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
        return cropCanvas.toDataURL('image/png');
      }
    }

    return canvas.toDataURL('image/jpeg', 0.97);
  };

  const handleCapture = async () => {
    const track = streamRef.current?.getVideoTracks?.()?.[0];
    let base64  = null;

    if (scanMode === 'lens') {
      base64 = await captureFromCanvas();
    } else if (track && typeof window.ImageCapture !== 'undefined') {
      try {
        const ic   = new window.ImageCapture(track);
        const blob = await ic.takePhoto({ fillLightMode: isFlashOn ? 'flash' : 'off' });
        base64     = await blobToBase64(blob);
      } catch (e) {
        console.warn('[SmartLens] ImageCapture failed, using canvas:', e);
        base64 = await captureFromCanvas();
      }
    } else {
      base64 = await captureFromCanvas();
    }

    if (!base64) return;
    setCapturedImage(base64);
    setConfirmMsg('');

    if (scanMode === 'lens') {
      setConfirmMode(false);
      await analyzeCapturedImage(base64);
    } else {
      setConfirmMode(true);
    }
  };

  // ── Gallery upload → confirmation ──────────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const r = new FileReader();
    r.onloadend = () => {
      setCapturedImage(r.result);
      setConfirmMode(true);
      setConfirmMsg('');
    };
    r.readAsDataURL(file);
    e.target.value = '';
  };

  // ── Retake from confirmation ───────────────────────────────────────────────
  const handleRetake = () => {
    setCapturedImage(null);
    setConfirmMode(false);
    setConfirmMsg('');
    setSelectionPath([]);
    setIsDrawing(false);
  };

  // ── Confirm → analyse ──────────────────────────────────────────────────────
  const analyzeCapturedImage = async (base64) => {
    if (!base64) return;
    setConfirmMode(false);
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setAnalysisError(null);
    setChatHistory([]);

    const cfg    = SCAN_MODES[scanMode];
    const prompt = cfg.systemPrompt;

    try {
      const result = await analyzeWithAIBrain(prompt, base64);
      if (isMounted.current) setAnalysisResult(result);
    } catch (err) {
      console.error('[SmartLens] Analysis error:', err);
      if (isMounted.current) setAnalysisError('AI analysis failed. Please check your connection and try again.');
    } finally {
      if (isMounted.current) setIsAnalyzing(false);
    }
  };

  const handleConfirmAnalyze = async () => {
    if (!capturedImage) return;
    if (scanMode === 'lens') {
      return analyzeCapturedImage(capturedImage);
    }

    setConfirmMode(false);
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setAnalysisError(null);
    setChatHistory([]);

    const cfg    = SCAN_MODES[scanMode];
    const prompt = confirmMsg.trim()
      ? `${cfg.systemPrompt}\n\nAdditional context from the user: "${confirmMsg.trim()}"`
      : cfg.systemPrompt;

    try {
      const result = await analyzeWithAIBrain(prompt, capturedImage);
      if (isMounted.current) setAnalysisResult(result);
    } catch (err) {
      console.error('[SmartLens] Analysis error:', err);
      if (isMounted.current) setAnalysisError('AI analysis failed. Please check your connection and try again.');
    } finally {
      if (isMounted.current) setIsAnalyzing(false);
    }
  };

  // ── Follow-up Q&A ──────────────────────────────────────────────────────────
  const handleFollowUp = async () => {
    const q = followUpText.trim();
    if (!q || isFollowUpLoading || !capturedImage) return;
    setFollowUpText('');
    setChatHistory(prev => [...prev, { role: 'user', text: q }]);
    setIsFollowUpLoading(true);
    try {
      const ctx =
        `You previously analyzed an image and provided this result:\n"""\n${analysisResult}\n"""\n\n` +
        `The user now asks: "${q}"\n\nAnswer accurately and concisely, grounded in the image and prior analysis.`;
      const ans = await analyzeWithAIBrain(ctx, capturedImage);
      if (isMounted.current) setChatHistory(p => [...p, { role: 'ai', text: ans }]);
    } catch {
      if (isMounted.current) setChatHistory(p => [...p, { role: 'ai', text: 'Sorry, I could not process that. Please try again.' }]);
    } finally {
      if (isMounted.current) setIsFollowUpLoading(false);
    }
  };

  // ── Full reset ─────────────────────────────────────────────────────────────
  const handleScanAnother = () => {
    setCapturedImage(null);
    setConfirmMode(false);
    setConfirmMsg('');
    setAnalysisResult(null);
    setAnalysisError(null);
    setChatHistory([]);
    setSelectionPath([]);
    setIsDrawing(false);
  };

  const showCameraUI = !confirmMode && !isAnalyzing && !analysisResult && !analysisError;

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div style={S.container}>

      {/* Camera loading */}
      {isLoadingCamera && !cameraError && !capturedImage && (
        <div style={S.centeredOverlay}>
          <Loader2 size={48} color={mode.color} style={S.spin} />
          <p style={{ ...S.loadingText, color: mode.color }}>Starting Camera…</p>
        </div>
      )}

      {/* Live video */}
      <video
        ref={videoRef} autoPlay playsInline muted
        style={{ ...S.video, display: (isLoadingCamera || cameraError || (capturedImage && scanMode !== 'lens')) ? 'none' : 'block' }}
      />

      {/* Frozen frame (during confirm / analysis / result) */}
      {capturedImage && scanMode !== 'lens' && (
        <img src={capturedImage} alt="Captured" style={S.frozenFrame} />
      )}

      {/* Scanning animation */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div key="scan"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={S.scanOverlay}>
            <motion.div
              animate={{ y: ['-44vh', '44vh'] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: 'linear' }}
              style={{ ...S.laser, background: `linear-gradient(90deg,transparent,${mode.color},transparent)`, boxShadow: `0 0 24px 8px ${mode.colorDim}` }}
            />
            <div style={S.scanContent}>
              <Sparkles size={36} color={mode.color} />
              <p style={{ ...S.scanTitle, color: mode.color }}>AI is analysing…</p>
              <p style={S.scanSub}>Generating your report</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ CAMERA UI ═══ */}
      {showCameraUI && (
        <div style={S.uiOverlay}>
          {/* Header */}
          <div style={S.header}>
            <CtrlBtn onClick={() => navigate(-1)}>
              <X size={20} color="white" />
            </CtrlBtn>
            <span style={S.headerTitle}>Smart Lens</span>
            <CtrlBtn
              onClick={toggleFlash}
              extraStyle={{ background: isFlashOn ? 'rgba(255,220,0,0.9)' : 'rgba(0,0,0,0.42)' }}>
              <Zap size={20} color={isFlashOn ? '#000' : '#fff'} />
            </CtrlBtn>
          </div>

          {/* Mode toggle */}
          {!isLoadingCamera && !cameraError && (
            <div style={S.modeRow}>
              <div style={S.modePill}>
                {Object.entries(SCAN_MODES).map(([key, cfg]) => {
                  const Icon = cfg.Icon;
                  const on   = scanMode === key;
                  return (
                    <motion.button key={key} whileTap={{ scale: 0.94 }} onClick={() => setScanMode(key)}
                      style={{ ...S.modeBtn, background: on ? cfg.color : 'transparent', color: on ? '#000' : 'rgba(255,255,255,0.6)' }}>
                      <Icon size={15} /><span>{cfg.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Viewfinder */}
          {!isLoadingCamera && !cameraError && (
            <div style={S.viewfinder} ref={viewfinderRef}
              onPointerDown={handleLensPointerDown}
              onPointerMove={handleLensPointerMove}
              onPointerUp={handleLensPointerEnd}
              onPointerLeave={handleLensPointerEnd}>
              <motion.div
                animate={{ x: ['-8%', '8%', '-8%'], opacity: [0.18, 0.45, 0.18] }}
                transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
                style={S.shimmerOverlay}
              />
              {scanMode === 'lens' && selectionPath.length > 1 && (
                <svg style={S.selectionSvg} preserveAspectRatio="none">
                  <path d={selectionPath.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')}
                    fill="none"
                    stroke="rgba(255,255,255,0.95)"
                    strokeWidth="8"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                </svg>
              )}
              <p style={S.hintBadge}>{lensHint}</p>
            </div>
          )}

          {/* Footer */}
          {!isLoadingCamera && !cameraError && (
            <div style={S.footer}>
              <div style={S.footerRow}>
                <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} id="gallery-input" />
                <CtrlBtn as="label" htmlFor="gallery-input">
                  <Image size={22} color="white" />
                </CtrlBtn>
                <motion.button whileTap={{ scale: 0.91 }} onClick={handleCapture}
                  style={{
                    ...S.captureBtn,
                    boxShadow: `0 0 0 7px ${mode.colorDim},0 10px 30px rgba(0,0,0,0.45)`,
                  }}>
                  <div style={{ ...S.captureCore, background: mode.color }} />
                </motion.button>
                {/* Spacer to keep capture button centred */}
                <div style={{ width: 44 }} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ CONFIRMATION SHEET ═══ */}
      <AnimatePresence>
        {confirmMode && (
          <motion.div key="confirm"
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', bounce: 0.2, duration: 0.48 }}
            style={S.confirmSheet}>
            <div style={S.dragHandle} />
            <p style={S.confirmHeading}>Review your photo</p>

            {/* Image preview */}
            <div style={S.previewWrap}>
              <img src={capturedImage} alt="Preview" style={S.previewImg} />
              <div style={{ ...S.previewBadge, background: 'rgba(0,0,0,0.55)', borderColor: mode.color }}>
                {React.createElement(mode.Icon, { size: 13, color: mode.color })}
                <span style={{ color: mode.color, fontSize: 12, fontWeight: 700 }}>{mode.label}</span>
              </div>
            </div>

            {/* Optional message */}
            <div style={S.confirmMsgWrap}>
              <p style={S.confirmMsgLabel}>
                Add a message&nbsp;<span style={S.optionalTag}>optional</span>
              </p>
              <input
                type="text"
                placeholder={`e.g. "What disease is this?" or "Is this edible?"`}
                value={confirmMsg}
                onChange={e => setConfirmMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleConfirmAnalyze()}
                style={S.confirmInput}
              />
            </div>

            {/* Buttons */}
            <div style={S.confirmBtns}>
              <motion.button whileTap={{ scale: 0.95 }} onClick={handleRetake} style={S.retakeBtn}>
                <RotateCcw size={16} color="#9ca3af" /><span>Retake</span>
              </motion.button>
              <motion.button whileTap={{ scale: 0.95 }} onClick={handleConfirmAnalyze}
                style={{ ...S.analyzeBtn, background: mode.color }}>
                <Sparkles size={16} color="#000" />
                <span>Analyse</span>
                <ChevronRight size={16} color="#000" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ RESULT SHEET ═══ */}
      <AnimatePresence>
        {(analysisResult || analysisError) && !isAnalyzing && (
          <motion.div key="result"
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', bounce: 0.14, duration: 0.55 }}
            style={S.resultSheet}>
            <div style={S.dragHandle} />

            {/* Header */}
            <div style={S.sheetHeader}>
              <div>
                <div style={S.modeBadge}>
                  {React.createElement(mode.Icon, { size: 14, color: mode.color })}
                  <span style={{ color: mode.color, fontSize: 12, fontWeight: 700, marginLeft: 5 }}>
                    {mode.label} · AI Analysis
                  </span>
                </div>
                <h3 style={S.sheetTitle}>{analysisError ? 'Analysis Failed' : 'Results'}</h3>
              </div>
              <motion.button whileTap={{ scale: 0.9 }} onClick={handleScanAnother} style={S.newScanBtn}>
                <RefreshCw size={15} color="white" />
                <span style={{ color: 'white', fontSize: 13, fontWeight: 600 }}>New Scan</span>
              </motion.button>
            </div>

            {/* Scrollable body */}
            <div style={S.scrollBody}>

              {/* Scanned image thumbnail */}
              {capturedImage && (
                <div style={S.thumbRow}>
                  <img src={capturedImage} alt="scanned" style={S.thumb} />
                  <div style={S.thumbMeta}>
                    <span style={{ color: '#9ca3af', fontSize: 12, fontWeight: 500 }}>Scanned image</span>
                    <span style={{ color: '#374151', fontSize: 11 }}>{mode.label} · AI-generated</span>
                  </div>
                </div>
              )}

              {/* Error */}
              {analysisError && (
                <div style={S.errorCard}>
                  <AlertCircle size={20} color="#f87171" style={{ flexShrink: 0 }} />
                  <div>
                    <p style={{ color: '#f87171', fontWeight: 700, fontSize: 14, margin: '0 0 4px' }}>Analysis Error</p>
                    <p style={{ color: '#9ca3af', fontSize: 13, margin: 0 }}>{analysisError}</p>
                    <motion.button whileTap={{ scale: 0.95 }}
                      onClick={() => { setAnalysisError(null); handleConfirmAnalyze(); }}
                      style={S.retryBtn}>Retry</motion.button>
                  </div>
                </div>
              )}

              {/* AI result — rich rendered */}
              {analysisResult && (
                <div style={S.aiCard}>
                  <AIResponse text={analysisResult} accentColor={mode.color} />
                </div>
              )}

              {/* Disclaimer */}
              <div style={S.disclaimer}>
                <Info size={13} color="#374151" style={{ flexShrink: 0, marginTop: 1 }} />
                <p style={S.disclaimerText}>
                  <strong style={{ color: '#4b5563' }}>AI-generated content.</strong> May not be fully accurate. For informational purposes only. The app and its developers accept no responsibility for any decisions made based on this output.{' '}
                  <strong style={{ color: '#4b5563' }}>Use at your own risk.</strong>
                </p>
              </div>

              {/* Follow-up Q&A */}
              {analysisResult && (
                <div style={S.chatSection}>
                  <div style={S.chatDivider}>
                    <div style={S.divLine} />
                    <span style={S.divLabel}>Ask a follow-up</span>
                    <div style={S.divLine} />
                  </div>

                  {chatHistory.map((msg, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      style={{
                        ...S.bubble,
                        alignSelf:               msg.role === 'user' ? 'flex-end'  : 'flex-start',
                        background:              msg.role === 'user' ? mode.color   : '#1a1a22',
                        borderBottomRightRadius: msg.role === 'user' ? 4 : 18,
                        borderBottomLeftRadius:  msg.role === 'ai'   ? 4 : 18,
                      }}>
                      {msg.role === 'ai'
                        ? <AIResponse text={msg.text} accentColor={mode.color} />
                        : <p style={{ ...RS.para, color: '#000', margin: 0 }}>{msg.text}</p>
                      }
                    </motion.div>
                  ))}

                  {isFollowUpLoading && (
                    <div style={{ ...S.bubble, alignSelf: 'flex-start', background: '#1a1a22', padding: '12px 16px' }}>
                      <Loader2 size={18} color={mode.color} style={S.spin} />
                    </div>
                  )}
                  <div ref={chatEndRef} style={{ height: 6 }} />
                </div>
              )}
            </div>

            {/* Chat input */}
            {analysisResult && (
              <div style={S.chatBar}>
                <input
                  type="text"
                  placeholder="Ask anything about this image…"
                  value={followUpText}
                  onChange={e => setFollowUpText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleFollowUp()}
                  style={S.chatInput}
                />
                <motion.button whileTap={{ scale: 0.9 }} onClick={handleFollowUp}
                  disabled={!followUpText.trim() || isFollowUpLoading}
                  style={{ ...S.chatSend, background: followUpText.trim() ? mode.color : '#1e1e26', cursor: followUpText.trim() ? 'pointer' : 'default' }}>
                  <Send size={17} color={followUpText.trim() ? '#000' : '#444'} />
                </motion.button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ CAMERA ERROR ═══ */}
      {cameraError && !capturedImage && (
        <div style={S.errOverlay}>
          <div style={S.errBox}>
            <div style={S.errIcon}><Camera size={28} color="#ef4444" /></div>
            <p style={S.errTitle}>Camera Unavailable</p>
            <p style={S.errMsg}>{cameraError}</p>
            <div style={S.errBtnRow}>
              <motion.button whileTap={{ scale: 0.95 }}
                onClick={() => { setCameraError(null); startCamera(); }} style={S.errPrimary}>
                Retry
              </motion.button>
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate(-1)} style={S.errSecondary}>
                Go Back
              </motion.button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}@keyframes shimmer-slide{0%{transform:translateX(-120%)}100%{transform:translateX(120%)}}`}</style>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Reusable control button
// ─────────────────────────────────────────────────────────────────────────────
const CtrlBtn = ({ children, onClick, extraStyle = {}, as: Tag = 'button', ...rest }) => (
  <motion.div whileTap={{ scale: 0.87 }} style={{ display: 'contents' }}>
    <Tag onClick={onClick} style={{ ...S.ctrlBtn, ...extraStyle }} {...rest}>
      {children}
    </Tag>
  </motion.div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const S = {
  container: {
    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
    background: '#08080a', overflow: 'hidden',
    fontFamily: "'DM Sans',-apple-system,BlinkMacSystemFont,sans-serif",
  },
  video:       { width: '100%', height: '100%', objectFit: 'cover', filter: 'contrast(1.05) saturate(1.08) brightness(1.02)' },
  frozenFrame: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1 },
  spin:        { animation: 'spin 1s linear infinite' },

  centeredOverlay: {
    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
    background: '#08080a', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: 16, zIndex: 10,
  },
  loadingText: { fontSize: 16, fontWeight: 600, letterSpacing: '0.05em', margin: 0 },

  // scan animation
  scanOverlay: {
    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
    background: 'rgba(0,0,0,0.62)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', overflow: 'hidden', zIndex: 3,
  },
  laser:       { position: 'absolute', width: '90%', height: 2, borderRadius: 1 },
  scanContent: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, zIndex: 1 },
  scanTitle:   { fontSize: 18, fontWeight: 700, margin: 0 },
  scanSub:     { color: 'rgba(255,255,255,0.42)', fontSize: 13, margin: 0 },

  // camera UI overlay
  uiOverlay: {
    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
    display: 'flex', flexDirection: 'column',
    background: 'linear-gradient(to bottom,rgba(0,0,0,0.66) 0%,transparent 28%,transparent 65%,rgba(0,0,0,0.88) 100%)',
    zIndex: 2,
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '16px 20px', paddingTop: 'calc(16px + env(safe-area-inset-top))',
  },
  headerTitle: { color: 'white', fontSize: 17, fontWeight: 700, letterSpacing: '0.02em' },
  ctrlBtn: {
    width: 44, height: 44, borderRadius: '50%', background: 'rgba(0,0,0,0.42)',
    border: '1px solid rgba(255,255,255,0.16)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', backdropFilter: 'blur(14px)', flexShrink: 0, outline: 'none',
  },
  modeRow:  { display: 'flex', justifyContent: 'center', paddingTop: 8 },
  modePill: {
    display: 'flex', background: 'rgba(0,0,0,0.52)', backdropFilter: 'blur(18px)',
    borderRadius: 50, padding: 4, border: '1px solid rgba(255,255,255,0.1)', gap: 2,
  },
  modeBtn: {
    display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px',
    borderRadius: 50, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600,
    transition: 'all 0.18s ease', outline: 'none',
  },
  viewfinder: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
    position: 'relative', margin: '16px 16px', touchAction: 'none', minHeight: 250,
  },
  bracket: { position: 'absolute', width: 28, height: 28, borderStyle: 'solid', borderWidth: 0, borderRadius: 2 },
  hintBadge: {
    position: 'absolute', bottom: -22, color: 'rgba(255,255,255,0.78)', fontSize: 13,
    textAlign: 'center', background: 'rgba(0,0,0,0.38)', padding: '5px 14px',
    borderRadius: 20, backdropFilter: 'blur(10px)', margin: 0,
  },
  shimmerOverlay: {
    position: 'absolute', inset: 0,
    pointerEvents: 'none', zIndex: 1, opacity: 0.22,
    background: 'linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.28) 22%, rgba(255,255,255,0.08) 40%, rgba(255,255,255,0) 58%, rgba(255,255,255,0.18) 100%)',
    filter: 'blur(1px)',
    mixBlendMode: 'screen',
  },
  detectionBox: {
    position: 'absolute', border: '2px solid rgba(255,255,255,0.9)', borderRadius: 18,
    overflow: 'hidden', pointerEvents: 'none', zIndex: 3,
  },
  detectionShimmer: {
    position: 'absolute', inset: 0,
    pointerEvents: 'none',
    background: 'linear-gradient(120deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.28) 40%, rgba(255,255,255,0) 80%)',
    transform: 'translateX(-120%)',
    animation: 'shimmer-slide 1.6s infinite ease-in-out',
  },
  detectionLabel: {
    position: 'absolute', top: 8, left: 8, padding: '4px 10px', borderRadius: 14,
    color: '#000', fontSize: 11, fontWeight: 700, zIndex: 4,
  },
  selectionOverlay: {
    position: 'absolute', borderRadius: '50%', border: '2px solid white',
    boxShadow: '0 0 0 4px rgba(255,255,255,0.12), inset 0 0 0 2px rgba(255,255,255,0.25)',
    pointerEvents: 'none',
  },
  selectionSvg: {
    position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1,
    overflow: 'visible', pointerEvents: 'none',
  },
  footer: { padding: '14px 16px', paddingBottom: 'calc(28px + env(safe-area-inset-bottom))' },
  footerRow: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 28 },
  captureBtn: {
    width: 74, height: 74, borderRadius: '50%', background: 'white',
    border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', outline: 'none',
  },
  captureCore: { width: 62, height: 62, borderRadius: '50%' },

  // confirmation sheet
  confirmSheet: {
    position: 'absolute', bottom: 0, left: 0, width: '100%', boxSizing: 'border-box',
    background: '#111116', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: '0 20px calc(28px + env(safe-area-inset-bottom))',
    zIndex: 6, boxShadow: '0 -12px 50px rgba(0,0,0,0.75)',
  },
  dragHandle: { width: 38, height: 4, background: 'rgba(255,255,255,0.18)', borderRadius: 2, margin: '12px auto 0', display: 'block' },
  confirmHeading: { color: 'white', fontSize: 18, fontWeight: 700, margin: '14px 0 14px', textAlign: 'center' },
  previewWrap: { width: '100%', borderRadius: 18, overflow: 'hidden', position: 'relative', maxHeight: 220, marginBottom: 16 },
  previewImg:  { width: '100%', height: 220, objectFit: 'cover', display: 'block' },
  previewBadge: {
    position: 'absolute', top: 12, right: 12, display: 'flex', alignItems: 'center', gap: 5,
    borderRadius: 20, padding: '5px 12px', border: '1px solid', backdropFilter: 'blur(10px)',
  },
  confirmMsgWrap: { marginBottom: 16 },
  confirmMsgLabel: { color: '#9ca3af', fontSize: 13, fontWeight: 600, margin: '0 0 8px' },
  optionalTag: { color: '#4b5563', fontSize: 11, fontWeight: 400, fontStyle: 'italic' },
  confirmInput: {
    width: '100%', boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.13)',
    borderRadius: 14, padding: '13px 16px', color: 'white', fontSize: 15,
    outline: 'none', WebkitAppearance: 'none',
  },
  confirmBtns: { display: 'flex', gap: 12 },
  retakeBtn: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 16, padding: '15px 0', color: '#9ca3af', fontSize: 15,
    fontWeight: 600, cursor: 'pointer', outline: 'none',
  },
  analyzeBtn: {
    flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
    border: 'none', borderRadius: 16, padding: '15px 0',
    fontSize: 15, fontWeight: 700, color: '#000', cursor: 'pointer', outline: 'none',
  },

  // result sheet
  resultSheet: {
    position: 'absolute', bottom: 0, left: 0, width: '100%', boxSizing: 'border-box',
    background: '#0e0e14', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    maxHeight: '90vh', display: 'flex', flexDirection: 'column',
    zIndex: 5, boxShadow: '0 -10px 50px rgba(0,0,0,0.65)',
  },
  sheetHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '14px 20px 8px', flexShrink: 0 },
  modeBadge:   { display: 'flex', alignItems: 'center', marginBottom: 4 },
  sheetTitle:  { color: 'white', fontSize: 20, fontWeight: 700, margin: 0 },
  newScanBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 20, padding: '7px 14px', cursor: 'pointer', outline: 'none',
  },
  scrollBody: { flex: 1, overflowY: 'auto', padding: '4px 18px 8px', WebkitOverflowScrolling: 'touch' },

  thumbRow: {
    display: 'flex', alignItems: 'center', gap: 12,
    background: '#17171f', borderRadius: 14, padding: '10px 14px',
    marginBottom: 14, border: '1px solid rgba(255,255,255,0.06)',
  },
  thumb:     { width: 52, height: 52, objectFit: 'cover', borderRadius: 10, flexShrink: 0 },
  thumbMeta: { display: 'flex', flexDirection: 'column', gap: 3 },

  aiCard: {
    background: '#14141c', borderRadius: 18, padding: '4px 18px 18px',
    marginBottom: 12, border: '1px solid rgba(255,255,255,0.05)',
  },
  errorCard: {
    display: 'flex', gap: 12, alignItems: 'flex-start',
    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
    borderRadius: 14, padding: '14px 16px', marginBottom: 12,
  },
  retryBtn: {
    marginTop: 10, background: '#ef4444', color: 'white', border: 'none',
    borderRadius: 10, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', outline: 'none',
  },
  disclaimer: {
    display: 'flex', gap: 8, alignItems: 'flex-start',
    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: 12, padding: '10px 14px', marginBottom: 16,
  },
  disclaimerText: { color: '#374151', fontSize: 11.5, lineHeight: 1.55, margin: 0 },

  chatSection: { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 6 },
  chatDivider: { display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0 8px' },
  divLine:     { flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' },
  divLabel:    { color: '#374151', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' },

  bubble: { maxWidth: '86%', padding: '12px 15px', borderRadius: 18, wordBreak: 'break-word' },

  chatBar: {
    display: 'flex', gap: 10, alignItems: 'center',
    padding: '10px 16px', paddingBottom: 'calc(10px + env(safe-area-inset-bottom))',
    borderTop: '1px solid rgba(255,255,255,0.06)', background: '#0e0e14', flexShrink: 0,
  },
  chatInput: {
    flex: 1, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 24, padding: '11px 18px', color: 'white', fontSize: 14,
    outline: 'none', WebkitAppearance: 'none',
  },
  chatSend: {
    width: 44, height: 44, borderRadius: '50%', border: 'none',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, outline: 'none', transition: 'background 0.18s',
  },

  // error overlay
  errOverlay: {
    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
    background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10,
  },
  errBox: {
    background: '#12121a', borderRadius: 24, padding: '32px 28px', textAlign: 'center',
    maxWidth: '84%', display: 'flex', flexDirection: 'column', alignItems: 'center',
    border: '1px solid rgba(255,255,255,0.07)',
  },
  errIcon:    { width: 58, height: 58, borderRadius: '50%', background: 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  errTitle:   { color: 'white', fontSize: 18, fontWeight: 700, margin: '0 0 10px' },
  errMsg:     { color: '#9ca3af', fontSize: 14, lineHeight: 1.55, margin: '0 0 24px' },
  errBtnRow:  { display: 'flex', gap: 12 },
  errPrimary: { background: '#22c55e', color: '#000', border: 'none', padding: '12px 26px', borderRadius: 14, fontWeight: 700, cursor: 'pointer', fontSize: 15, outline: 'none' },
  errSecondary: { background: 'rgba(255,255,255,0.08)', color: 'white', border: '1px solid rgba(255,255,255,0.14)', padding: '12px 26px', borderRadius: 14, fontWeight: 600, cursor: 'pointer', fontSize: 15, outline: 'none' },
};

export default SmartLens;