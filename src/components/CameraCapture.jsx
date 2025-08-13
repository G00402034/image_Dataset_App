import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import BurstCapture from "./BurstCapture";
import AugmentationTools from "./AugmentationTools";
import LightingWarnings from "./LightingWarnings";
import AugmentationPreview from "./AugmentationPreview";
import {
  flipImage,
  rotateImage,
  adjustContrast,
  adjustBrightness,
  adjustSaturation,
  addGaussianNoise,
  applyBlur,
  adjustHue,
  applySharpen
} from "../utils/imageUtils";
import { hotkeyManager, initializeDefaultHotkeys } from "../utils/hotkeyManager";

const CameraCapture = ({ onCapture, roi, setRoi, lightingWarningsEnabled, setLightingWarningsEnabled, currentMLPreset, onApplyMLPreset, onClearMLPreset, onWebcamRef }) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [isBursting, setIsBursting] = useState(false);
  const [lastImage, setLastImage] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const [isDrawingROI, setIsDrawingROI] = useState(false);
  const [roiStart, setRoiStart] = useState(null);
  const [showAugmentationPreview, setShowAugmentationPreview] = useState(false);

  // Live preview state
  const [livePreviewEnabled, setLivePreviewEnabled] = useState(false);
  const [livePreviewSettings, setLivePreviewSettings] = useState({ brightness: 1.0, contrast: 0, saturation: 1.0, noise: 0, blur: 0, hue: 0, sharpen: 0 });
  const [activeAugmentations, setActiveAugmentations] = useState([]);
  const [augmentationRanges, setAugmentationRanges] = useState({ brightness: { min: 0.9, max: 1.1 }, contrast: { min: -10, max: 10 }, saturation: { min: 0.9, max: 1.1 }, noise: { min: 0.0, max: 0.1 }, blur: { min: 0, max: 1.0 }, hue: { min: -10, max: 10 }, sharpen: { min: 0.0, max: 0.5 } });
  const [previewFlipH, setPreviewFlipH] = useState(false);
  const [previewRotate, setPreviewRotate] = useState(0);

  // Auto-enable live preview when any augmentation or transform is active
  useEffect(() => {
    const anyActive = activeAugmentations.length > 0 || previewFlipH || previewRotate;
    setLivePreviewEnabled(anyActive);
  }, [activeAugmentations, previewFlipH, previewRotate]);

  // Sync active augmentations from current preset when applied
  useEffect(() => {
    if (currentMLPreset && currentMLPreset.settings) {
      const presetSettings = currentMLPreset.settings;
      setLivePreviewSettings(prev => ({ ...prev, ...presetSettings }));
      const presetActive = Object.entries(presetSettings).filter(([_, v]) => v !== 0 && v !== 1.0).map(([k]) => k);
      setActiveAugmentations(presetActive);
    }
  }, [currentMLPreset]);

  useEffect(() => {
    const callbacks = {
      capture: handleSingleCapture,
      burstCapture: handleBurstCapture,
      flipImage: handleFlip,
      rotateImage: () => handleRotate(90),
      brightnessUp: () => handleBrightness(1.1),
      brightnessDown: () => handleBrightness(0.9),
      contrastUp: () => handleContrast(10),
      contrastDown: () => handleContrast(-10),
      saturationUp: () => handleSaturation(1.1),
      saturationDown: () => handleSaturation(0.9),
      addNoise: () => handleNoise(0.1),
      applyBlur: () => handleBlur(2),
      sharpen: () => handleSharpen(0.5),
      randomAugment: handleRandomAugmentation,
      clearROI: () => setRoi(null),
      resetROI: handleResetROI,
      exportDataset: () => {},
      uploadToDrive: () => {},
      toggleLightingWarnings: () => setLightingWarningsEnabled(!lightingWarningsEnabled),
      showHelp: () => {}
    };
    initializeDefaultHotkeys(callbacks); hotkeyManager.initialize();
    return () => { hotkeyManager.destroy(); };
  }, [lightingWarningsEnabled, setRoi]);

  // Live preview loop
  useEffect(() => {
    if (!livePreviewEnabled || !webcamRef.current || !canvasRef.current) return;
    let animationFrame; let lastUpdate = 0; const throttleMs = 100;
    const updatePreview = (timestamp) => {
      if (timestamp - lastUpdate < throttleMs) { animationFrame = requestAnimationFrame(updatePreview); return; }
      if (webcamRef.current) { const video = webcamRef.current.video; if (video && video.readyState === video.HAVE_ENOUGH_DATA) { applyLivePreview(); } }
      lastUpdate = timestamp; animationFrame = requestAnimationFrame(updatePreview);
    };
    updatePreview(0);
    return () => { if (animationFrame) cancelAnimationFrame(animationFrame); };
  }, [livePreviewEnabled, activeAugmentations, livePreviewSettings, previewFlipH, previewRotate]);

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  const applyLivePreview = () => {
    if (!webcamRef.current || !canvasRef.current) return;
    const video = webcamRef.current.video; const canvas = canvasRef.current; const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const rect = video.getBoundingClientRect(); canvas.width = rect.width; canvas.height = rect.height;
    ctx.save();
    // Build CSS-like filter chain for fast live preview of core effects
    const filterParts = [];
    if (activeAugmentations.includes('brightness')) filterParts.push(`brightness(${clamp(livePreviewSettings.brightness ?? 1, 0.2, 3)})`);
    if (activeAugmentations.includes('contrast')) filterParts.push(`contrast(${clamp((livePreviewSettings.contrast ?? 0) + 100, 0, 200)}%)`);
    if (activeAugmentations.includes('saturation')) filterParts.push(`saturate(${clamp(livePreviewSettings.saturation ?? 1, 0, 3)})`);
    if (activeAugmentations.includes('hue')) filterParts.push(`hue-rotate(${clamp(livePreviewSettings.hue ?? 0, -180, 180)}deg)`);
    if (activeAugmentations.includes('blur')) filterParts.push(`blur(${clamp(livePreviewSettings.blur ?? 0, 0, 6)}px)`);
    ctx.filter = filterParts.join(' ');
    if (previewFlipH) { ctx.translate(rect.width, 0); ctx.scale(-1, 1); }
    if (previewRotate) { ctx.translate(rect.width / 2, rect.height / 2); ctx.rotate((previewRotate * Math.PI) / 180); ctx.drawImage(video, -rect.width / 2, -rect.height / 2, rect.width, rect.height); }
    else { ctx.drawImage(video, 0, 0, rect.width, rect.height); }
    ctx.restore();
    // Pixel ops for effects not supported by ctx.filter (noise, sharpen)
    if (activeAugmentations.includes('noise') || activeAugmentations.includes('sharpen')) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      if (activeAugmentations.includes('noise')) {
        applyNoiseToData(data, clamp(livePreviewSettings.noise ?? 0, 0, 0.5));
      }
      if (activeAugmentations.includes('sharpen')) {
        const intensity = clamp(livePreviewSettings.sharpen ?? 0, 0, 1);
        if (intensity > 0) applySharpenConvolution(imageData, canvas.width, canvas.height, intensity);
      }
      ctx.putImageData(imageData, 0, 0);
    }
  };

  const applyNoiseToData = (data, intensity) => { for (let i = 0; i < data.length; i += 4) { const noise = (Math.random() - 0.5) * 2 * intensity * 255; data[i] = Math.min(255, Math.max(0, data[i] + noise)); data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise)); data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise)); } };

  const applySharpenConvolution = (imageData, width, height, intensity) => {
    // Simple unsharp-like kernel scaled by intensity
    const s = 0.5 * intensity; // 0..0.5
    const kernel = [
      0, -s, 0,
      -s, 1 + 4 * s, -s,
      0, -s, 0
    ];
    const src = imageData.data;
    const out = new Uint8ClampedArray(src.length);
    const w = width, h = height;
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        let r = 0, g = 0, b = 0;
        let ki = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * w + (x + kx)) * 4;
            const kval = kernel[ki++];
            r += src[idx] * kval; g += src[idx + 1] * kval; b += src[idx + 2] * kval;
          }
        }
        const di = (y * w + x) * 4;
        out[di] = Math.max(0, Math.min(255, r));
        out[di + 1] = Math.max(0, Math.min(255, g));
        out[di + 2] = Math.max(0, Math.min(255, b));
        out[di + 3] = src[di + 3];
      }
    }
    // Copy borders unchanged
    for (let x = 0; x < w; x++) {
      const top = x * 4, bot = ((h - 1) * w + x) * 4;
      out[top] = src[top]; out[top + 1] = src[top + 1]; out[top + 2] = src[top + 2]; out[top + 3] = src[top + 3];
      out[bot] = src[bot]; out[bot + 1] = src[bot + 1]; out[bot + 2] = src[bot + 2]; out[bot + 3] = src[bot + 3];
    }
    for (let y = 0; y < h; y++) {
      const li = (y * w) * 4, ri = (y * w + (w - 1)) * 4;
      out[li] = src[li]; out[li + 1] = src[li + 1]; out[li + 2] = src[li + 2]; out[li + 3] = src[li + 3];
      out[ri] = src[ri]; out[ri + 1] = src[ri + 1]; out[ri + 2] = src[ri + 2]; out[ri + 3] = src[ri + 3];
    }
    imageData.data.set(out);
  };

  // Apply preset to image
  const applyMLPresetToImage = async (imageSrc, preset) => {
    if (!preset || !preset.settings) return imageSrc; let processedImage = imageSrc; const settings = preset.settings;
    for (const [key, value] of Object.entries(settings)) { if (value !== 0 && value !== 1.0) { switch (key) {
      case 'brightness': processedImage = await adjustBrightness(processedImage, value); break;
      case 'contrast': processedImage = await adjustContrast(processedImage, value); break;
      case 'saturation': processedImage = await adjustSaturation(processedImage, value); break;
      case 'noise': processedImage = await addGaussianNoise(processedImage, value); break;
      case 'blur': processedImage = await applyBlur(processedImage, value); break;
      case 'hue': processedImage = await adjustHue(processedImage, value); break;
      case 'sharpen': processedImage = await applySharpen(processedImage, value); break;
      default: break; } } }
    return processedImage; };

  const captureFromSource = () => {
    if (!webcamRef.current) return null;
    if (livePreviewEnabled && (activeAugmentations.length > 0 || previewFlipH || previewRotate)) {
      try { return canvasRef.current?.toDataURL('image/jpeg'); } catch { /* ignore */ }
    }
    return webcamRef.current.getScreenshot();
  };

  const handleSingleCapture = async () => {
    if (webcamRef.current) {
      setIsCapturing(true);
      let imageSrc = captureFromSource();
      if (!imageSrc) {
        console.error('Failed to capture screenshot');
        setIsCapturing(false);
        return;
      }
      // Apply ROI if selected
      let finalImage = roi ? await cropImageWithROI(imageSrc, roi) : imageSrc;
      // Apply ML preset if one is selected
      if (currentMLPreset) {
        finalImage = await applyMLPresetToImage(finalImage, currentMLPreset);
      }
      setLastImage(finalImage);
      onCapture(finalImage);
      setIsCapturing(false);
    }
  };

  const handleBurstCapture = async (count = 5, interval = 200) => {
    if (isBursting) return;
    setIsBursting(true);
    try {
      for (let i = 0; i < count; i++) {
        let imageSrc = captureFromSource();
        if (!imageSrc) throw new Error('Failed to capture screenshot');
        let finalImage = roi ? await cropImageWithROI(imageSrc, roi) : imageSrc;
        if (currentMLPreset) {
          finalImage = await applyMLPresetToImage(finalImage, currentMLPreset);
        }
        setLastImage(finalImage);
        onCapture(finalImage);
        if (i < count - 1) await new Promise((r) => setTimeout(r, interval));
      }
    } catch (error) {
      console.error('Burst capture failed:', error);
      alert(`Burst capture failed: ${error.message}`);
    } finally {
      setIsBursting(false);
    }
  };

  // Crop image based on ROI
  const cropImageWithROI = (imageSrc, roiData) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = roiData.width;
        canvas.height = roiData.height;
        ctx.drawImage(
          img,
          roiData.x, roiData.y, roiData.width, roiData.height,
          0, 0, roiData.width, roiData.height
        );
        resolve(canvas.toDataURL('image/jpeg'));
      };
      img.src = imageSrc;
    });
  };

  // Enhanced burst capture with augmentation
  const handleBurstWithAugmentation = async (selectedAugmentations, augmentationSettings) => {
    if (!webcamRef.current) return;
    setIsBursting(true);
    const imageSrc = captureFromSource();
    const croppedImage = roi ? await cropImageWithROI(imageSrc, roi) : imageSrc;
    setLastImage(croppedImage);
    // Apply augmentations to the captured image
    let augmentedImage = croppedImage;
    for (const augId of selectedAugmentations) {
      const setting = augmentationSettings[augId];
      switch (augId) {
        case 'brightness':
          augmentedImage = await adjustBrightness(augmentedImage, setting);
          break;
        case 'contrast':
          augmentedImage = await adjustContrast(augmentedImage, setting);
          break;
        case 'saturation':
          augmentedImage = await adjustSaturation(augmentedImage, setting);
          break;
        case 'noise':
          augmentedImage = await addGaussianNoise(augmentedImage, setting);
          break;
        case 'blur':
          augmentedImage = await applyBlur(augmentedImage, setting);
          break;
        case 'hue':
          augmentedImage = await adjustHue(augmentedImage, setting);
          break;
        case 'sharpen':
          augmentedImage = await applySharpen(augmentedImage, setting);
          break;
        default:
          break;
      }
    }
    if (currentMLPreset) {
      augmentedImage = await applyMLPresetToImage(augmentedImage, currentMLPreset);
    }
    setLastImage(augmentedImage);
    onCapture(augmentedImage);
    setIsBursting(false);
  };

  // Live preview handlers
  const handleLivePreviewSettingChange = (augId, value) => {
    setLivePreviewSettings(prev => ({
      ...prev,
      [augId]: parseFloat(value)
    }));
  };

  const handleLivePreviewAugmentationToggle = (augId) => {
    setActiveAugmentations(prev => 
      prev.includes(augId) 
        ? prev.filter(id => id !== augId)
        : [...prev, augId]
    );
  };

  // ML Preset handlers
  const handleApplyMLPreset = (preset) => {
    if (onApplyMLPreset) onApplyMLPreset(preset);
  };

  const handleClearMLPreset = () => {
    if (onClearMLPreset) onClearMLPreset();
  };

  // ROI handlers for direct camera overlay
  const handleROIMouseDown = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setIsDrawingROI(true);
    setRoiStart({ x, y });
    setRoi(null);
  };

  const handleROIMouseMove = (e) => {
    if (!isDrawingROI || !roiStart) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newRoi = {
      x: Math.min(roiStart.x, x),
      y: Math.min(roiStart.y, y),
      width: Math.abs(x - roiStart.x),
      height: Math.abs(y - roiStart.y)
    };
    if (newRoi.width > 20 && newRoi.height > 20) setRoi(newRoi);
  };

  const handleROIMouseUp = () => {
    setIsDrawingROI(false);
    setRoiStart(null);
  };

  const handleResetROI = () => {
    if (webcamRef.current) {
      const rect = webcamRef.current.video?.getBoundingClientRect();
      if (rect) {
        const newRoi = {
          x: rect.width * 0.1,
          y: rect.height * 0.1,
          width: rect.width * 0.8,
          height: rect.height * 0.8
        };
        setRoi(newRoi);
      }
    }
  };

  // Augmentation handlers
  const handleFlip = async () => {
    // Update live preview transform
    setPreviewFlipH((v) => !v);
    // Persist into last image if present
    if (!lastImage) return;
    const augmented = await flipImage(lastImage, 'horizontal');
    setLastImage(augmented);
    onCapture(augmented);
  };
  
  const handleRotate = async (angle) => {
    // Update live preview rotation
    setPreviewRotate((r) => {
      const next = ((r || 0) + angle) % 360; return next < 0 ? next + 360 : next;
    });
    // Persist into last image if present
    if (!lastImage) return;
    const augmented = await rotateImage(lastImage, angle);
    setLastImage(augmented);
    onCapture(augmented);
  };
  
  const handleBrightness = async (factor) => {
    if (!lastImage) return;
    const augmented = await adjustBrightness(lastImage, factor);
    setLastImage(augmented);
    onCapture(augmented);
  };

  const handleContrast = async (value) => {
    if (!lastImage) return;
    const augmented = await adjustContrast(lastImage, value);
    setLastImage(augmented);
    onCapture(augmented);
  };

  const handleSaturation = async (factor) => {
    if (!lastImage) return;
    const augmented = await adjustSaturation(lastImage, factor);
    setLastImage(augmented);
    onCapture(augmented);
  };

  const handleNoise = async (intensity) => {
    if (!lastImage) return;
    const augmented = await addGaussianNoise(lastImage, intensity);
    setLastImage(augmented);
    onCapture(augmented);
  };

  const handleBlur = async (radius) => {
    if (!lastImage) return;
    const augmented = await applyBlur(lastImage, radius);
    setLastImage(augmented);
    onCapture(augmented);
  };

  const handleSharpen = async (intensity) => {
    if (!lastImage) return;
    const augmented = await applySharpen(lastImage, intensity);
    setLastImage(augmented);
    onCapture(augmented);
  };
  
  const handleAdjustContrast = async (factor) => {
    if (!lastImage) return;
    const value = (factor - 1) * 255;
    const augmented = await adjustContrast(lastImage, value);
    setLastImage(augmented);
    onCapture(augmented);
  };
  
  const handleAugment = (augmentedImage) => {
    setLastImage(augmentedImage);
    onCapture(augmentedImage);
  };

  const handleRandomAugmentation = async () => {
    if (!lastImage) return;
    const { randomAugmentation } = await import('../utils/imageUtils');
    const augmented = await randomAugmentation(lastImage);
    setLastImage(augmented);
    onCapture(augmented);
  };

  const randomBetween = (min, max) => min + Math.random() * (max - min);

  // Apply random augmentation values within configured ranges
  const applyRandomInRanges = async () => {
    if (!lastImage) return;
    let augmented = lastImage;
    const newActive = new Set(activeAugmentations);
    const newPreviewSettings = { ...livePreviewSettings };

    const safeNumber = (v, fallback) => (Number.isFinite(v) ? v : fallback);

    for (const [key, range] of Object.entries(augmentationRanges)) {
      if (!range || typeof range.min !== 'number' || typeof range.max !== 'number') continue;
      let value = randomBetween(range.min, range.max);
      switch (key) {
        case 'brightness':
          value = clamp(value, 0.2, 3.0);
          augmented = await adjustBrightness(augmented, value);
          newPreviewSettings.brightness = value; newActive.add('brightness');
          break;
        case 'contrast': {
          // expect -255..255 in imageUtils contrast
          const contrastValue = clamp(value, -100, 100);
          augmented = await adjustContrast(augmented, contrastValue);
          newPreviewSettings.contrast = contrastValue; newActive.add('contrast');
          break;
        }
        case 'saturation':
          value = clamp(value, 0, 3.0);
          augmented = await adjustSaturation(augmented, value);
          newPreviewSettings.saturation = value; newActive.add('saturation');
          break;
        case 'noise':
          value = clamp(value, 0, 0.5);
          augmented = await addGaussianNoise(augmented, value);
          newPreviewSettings.noise = value; newActive.add('noise');
          break;
        case 'blur': {
          // keep blur radius small and integer to avoid performance and array length issues
          const radius = Math.round(clamp(value, 0, 6));
          if (radius > 0) {
            augmented = await applyBlur(augmented, radius);
            newPreviewSettings.blur = radius; newActive.add('blur');
          } else {
            newPreviewSettings.blur = 0; newActive.delete('blur');
          }
          break;
        }
        case 'hue': {
          const hueShift = clamp(value, -180, 180);
          augmented = await adjustHue(augmented, hueShift);
          newPreviewSettings.hue = hueShift; newActive.add('hue');
          break;
        }
        case 'sharpen': {
          const intensity = clamp(value, 0, 1);
          if (intensity > 0) {
            augmented = await applySharpen(augmented, intensity);
            newPreviewSettings.sharpen = intensity; newActive.add('sharpen');
          } else {
            newPreviewSettings.sharpen = 0; newActive.delete('sharpen');
          }
          break;
        }
        default:
          break;
      }
    }

    setLastImage(augmented);
    onCapture(augmented);
    setLivePreviewSettings(newPreviewSettings);
    setActiveAugmentations(Array.from(newActive));
  };

  useEffect(() => {
    if (onWebcamRef) onWebcamRef(webcamRef);
  }, [onWebcamRef]);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Camera Capture</h2>
      
      <div style={styles.cameraSection}>
        <div style={styles.webcamContainer}>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            style={styles.webcam}
          />
          {/* Canvas overlay for live preview */}
          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: livePreviewEnabled ? 'block' : 'none',
              pointerEvents: 'none',
              zIndex: 9
            }}
          />
          {/* ROI overlay */}
          <div 
            style={styles.roiOverlay}
            onMouseDown={handleROIMouseDown}
            onMouseMove={handleROIMouseMove}
            onMouseUp={handleROIMouseUp}
            onMouseLeave={handleROIMouseUp}
          >
            {roi && (
              <>
                <div style={styles.roiMask} />
                <div style={{
                  ...styles.roiBorder,
                  left: roi.x,
                  top: roi.y,
                  width: roi.width,
                  height: roi.height
                }} />
                <div style={{...styles.roiHandle, left: roi.x - 4, top: roi.y - 4}} />
                <div style={{...styles.roiHandle, left: roi.x + roi.width - 4, top: roi.y - 4}} />
                <div style={{...styles.roiHandle, left: roi.x - 4, top: roi.y + roi.height - 4}} />
                <div style={{...styles.roiHandle, left: roi.x + roi.width - 4, top: roi.y + roi.height - 4}} />
              </>
            )}
          </div>
        </div>
        
        <div style={styles.controls}>
          <button 
            onClick={handleSingleCapture} 
            disabled={isBursting || isCapturing}
            style={{
              ...styles.captureButton,
              ...(isCapturing ? styles.capturingButton : {})
            }}
          >
            {isCapturing ? (
              <>
                <div style={styles.spinner}></div>
                Capturing...
              </>
            ) : (
              <>📸 Capture Image</>
            )}
          </button>
          
          <BurstCapture onBurstCapture={handleBurstCapture} isBursting={isBursting} />
          
          <button
            onClick={() => setRoi(null)}
            style={styles.clearRoiButton}
            title="Clear ROI"
          >
            🗑️ Clear ROI
          </button>
        </div>
      </div>

      <div style={styles.toolsGrid}>
        <div style={styles.toolsSection}>
          <AugmentationTools
            onFlip={handleFlip}
            onRotate={handleRotate}
            onAdjustContrast={handleAdjustContrast}
            onAugment={handleAugment}
            onBurstWithAugmentation={handleBurstWithAugmentation}
            isBursting={isBursting}
            lastImage={lastImage}
            livePreviewEnabled={livePreviewEnabled}
            onLivePreviewSettingChange={handleLivePreviewSettingChange}
            livePreviewSettings={livePreviewSettings}
            activeAugmentations={activeAugmentations}
            onLivePreviewAugmentationToggle={handleLivePreviewAugmentationToggle}
            previewFlipH={previewFlipH}
            previewRotate={previewRotate}
            onChangePreviewTransform={({ flipH, rotate }) => { if (typeof flipH === 'boolean') setPreviewFlipH(flipH); if (typeof rotate === 'number') setPreviewRotate(rotate); }}
          />
        </div>
      </div>

      {/* Augmentation ranges */}
      <div style={styles.rangesCard}>
        <h4 style={styles.sectionTitle}>Augmentation Ranges</h4>
        <div style={styles.rangesGrid}>
          {Object.keys(augmentationRanges).map((key) => (
            <div key={key} style={styles.rangeRow}>
              <label style={styles.rangeLabel}>{key}</label>
              <input type="number" step="0.1" value={augmentationRanges[key].min} onChange={(e)=> setAugmentationRanges(prev=> ({...prev, [key]: { ...prev[key], min: parseFloat(e.target.value)}}))} style={styles.rangeInput} />
              <span>to</span>
              <input type="number" step="0.1" value={augmentationRanges[key].max} onChange={(e)=> setAugmentationRanges(prev=> ({...prev, [key]: { ...prev[key], max: parseFloat(e.target.value)}}))} style={styles.rangeInput} />
            </div>
          ))}
        </div>
        <button onClick={applyRandomInRanges} style={styles.actionButton} disabled={!lastImage}>🎲 Randomize within ranges</button>
      </div>

      {lastImage && (
        <div style={styles.previewSection}>
          <h3 style={styles.sectionTitle}>Last Captured Image</h3>
          <div style={styles.previewContainer}>
            <img src={lastImage} alt="Preview" style={styles.previewImage} />
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '16px'
  },
  title: {
    margin: '0 0 16px 0',
    color: '#2c3e50',
    fontSize: '20px',
    fontWeight: '600'
  },
  cameraSection: {
    marginBottom: '20px'
  },
  webcamContainer: {
    position: 'relative',
    marginBottom: '12px',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '2px solid #e9ecef',
    backgroundColor: '#000'
  },
  webcam: {
    width: '100%',
    height: 'auto',
    display: 'block'
  },
  roiOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    cursor: 'crosshair',
    zIndex: 10
  },
  roiMask: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    pointerEvents: 'none'
  },
  roiBorder: {
    position: 'absolute',
    border: '2px dashed #007bff',
    pointerEvents: 'none',
    zIndex: 11
  },
  roiHandle: {
    position: 'absolute',
    width: '8px',
    height: '8px',
    backgroundColor: '#007bff',
          border: '2px solid #ffffff',
    borderRadius: '50%',
    pointerEvents: 'none',
    zIndex: 12
  },
  controls: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap'
  },
  captureButton: {
    padding: '12px 24px',
    backgroundColor: '#007bff',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease'
  },
  capturingButton: {
    backgroundColor: '#6c757d',
    cursor: 'not-allowed'
  },
  clearRoiButton: {
    padding: '8px 16px',
    backgroundColor: '#6c757d',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  previewButton: {
    padding: '8px 16px',
    backgroundColor: '#17a2b8',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  activePreviewButton: {
    backgroundColor: '#28a745',
    fontWeight: '600'
  },
  presetStatus: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    backgroundColor: '#d4edda',
    color: '#155724',
    borderRadius: '6px',
    border: '1px solid #c3e6cb',
    marginTop: '12px'
  },
  presetLabel: {
    fontWeight: '500',
    fontSize: '14px'
  },
  clearPresetButton: {
    background: 'none',
    border: 'none',
    color: '#155724',
    fontSize: '16px',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '4px',
    transition: 'all 0.2s ease'
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid #ffffff',
    borderTop: '2px solid transparent',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  toolsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '16px',
    marginBottom: '20px'
  },
  toolsSection: {
    marginBottom: '16px'
  },
  sectionTitle: {
    margin: '0 0 12px 0',
    color: '#495057',
    fontSize: '16px',
    fontWeight: '500'
  },
  previewSection: {
    marginBottom: '20px'
  },
  previewContainer: {
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #e9ecef',
    backgroundColor: '#f8f9fa'
  },
  previewImage: {
    width: '100%',
    height: 'auto',
    display: 'block'
  },
  rangesCard: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 12, marginBottom: 16 },
  rangesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8 },
  rangeRow: { display: 'grid', gridTemplateColumns: '80px 1fr auto 1fr', alignItems: 'center', gap: 6 },
  rangeLabel: { fontSize: 12, color: '#495057', textTransform: 'capitalize' },
  rangeInput: { width: '100%', padding: '6px 8px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12 },
  actionButton: { padding: '8px 12px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', marginTop: 8 }
};

export default CameraCapture;