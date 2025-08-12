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

const CameraCapture = ({ onCapture, roi, setRoi, lightingWarningsEnabled, setLightingWarningsEnabled, currentMLPreset, onApplyMLPreset, onClearMLPreset }) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [isBursting, setIsBursting] = useState(false);
  const [lastImage, setLastImage] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const [isDrawingROI, setIsDrawingROI] = useState(false);
  const [roiStart, setRoiStart] = useState(null);
  const [showAugmentationPreview, setShowAugmentationPreview] = useState(false);

  // Live preview state for ML augmentations
  const [livePreviewEnabled, setLivePreviewEnabled] = useState(false);
  const [livePreviewSettings, setLivePreviewSettings] = useState({
    brightness: 1.0,
    contrast: 0,
    saturation: 1.0,
    noise: 0,
    blur: 0,
    hue: 0,
    sharpen: 0
  });
  const [activeAugmentations, setActiveAugmentations] = useState([]);

  // Sync active augmentations from current preset when applied
  useEffect(() => {
    if (currentMLPreset && currentMLPreset.settings) {
      const presetSettings = currentMLPreset.settings;
      setLivePreviewSettings(prev => ({ ...prev, ...presetSettings }));
      const presetActive = Object.entries(presetSettings)
        .filter(([_, v]) => v !== 0 && v !== 1.0)
        .map(([k]) => k);
      setActiveAugmentations(presetActive);
    }
  }, [currentMLPreset]);

  // Initialize hotkeys
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
      exportDataset: () => console.log('Export dataset'),
      uploadToDrive: () => console.log('Upload to drive'),
      toggleLightingWarnings: () => setLightingWarningsEnabled(!lightingWarningsEnabled),
      showHelp: () => console.log('Show help')
    };

    initializeDefaultHotkeys(callbacks);
    hotkeyManager.initialize();

    return () => {
      hotkeyManager.destroy();
    };
  }, [lightingWarningsEnabled, setRoi]);

  // Live preview effect draws canvas overlay above video
  useEffect(() => {
    if (!livePreviewEnabled || !webcamRef.current || !canvasRef.current) return;

    let animationFrame;
    let lastUpdate = 0;
    const throttleMs = 100; // ~10 FPS for better performance

    const updatePreview = (timestamp) => {
      if (timestamp - lastUpdate < throttleMs) {
        animationFrame = requestAnimationFrame(updatePreview);
        return;
      }
      if (webcamRef.current && activeAugmentations.length > 0) {
        const video = webcamRef.current.video;
        if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
          applyLivePreview();
        }
      } else if (canvasRef.current) {
        // If no active augmentations, clear canvas
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      lastUpdate = timestamp;
      animationFrame = requestAnimationFrame(updatePreview);
    };

    updatePreview(0);

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [livePreviewEnabled, activeAugmentations, livePreviewSettings]);

  const applyLivePreview = () => {
    if (!webcamRef.current || !canvasRef.current) return;

    const video = webcamRef.current.video;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Match canvas to video element size on screen
    const rect = video.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Draw current video frame scaled to canvas
    ctx.drawImage(video, 0, 0, rect.width, rect.height);

    // Apply active augmentations to the pixel data
    if (activeAugmentations.length > 0) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      activeAugmentations.forEach(augId => {
        const setting = livePreviewSettings[augId];
        switch (augId) {
          case 'brightness':
            applyBrightnessToData(data, setting);
            break;
          case 'contrast':
            applyContrastToData(data, setting);
            break;
          case 'saturation':
            applySaturationToData(data, setting);
            break;
          case 'noise':
            applyNoiseToData(data, setting);
            break;
          case 'hue':
            applyHueToData(data, setting);
            break;
          default:
            break;
        }
      });
      ctx.putImageData(imageData, 0, 0);
    }
  };

  // Helper functions for live preview data manipulation
  const applyBrightnessToData = (data, factor) => {
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, Math.max(0, data[i] * factor));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] * factor));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] * factor));
    }
  };

  const applyContrastToData = (data, value) => {
    const factor = (259 * (value + 255)) / (255 * (259 - value));
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));
      data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128));
      data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128));
    }
  };

  const applySaturationToData = (data, factor) => {
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      data[i] = Math.min(255, Math.max(0, gray + factor * (r - gray)));
      data[i + 1] = Math.min(255, Math.max(0, gray + factor * (g - gray)));
      data[i + 2] = Math.min(255, Math.max(0, gray + factor * (b - gray)));
    }
  };

  const applyNoiseToData = (data, intensity) => {
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 2 * intensity * 255;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
    }
  };

  const applyHueToData = (data, shift) => {
    const shiftRad = (shift * Math.PI) / 180;
    const cosShift = Math.cos(shiftRad);
    const sinShift = Math.sin(shiftRad);
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i] / 255;
      const g = data[i + 1] / 255;
      const b = data[i + 2] / 255;
      const y = 0.299 * r + 0.587 * g + 0.114 * b;
      const u = -0.147 * r - 0.289 * g + 0.436 * b;
      const v = 0.615 * r - 0.515 * g - 0.100 * b;
      const uNew = u * cosShift - v * sinShift;
      const vNew = u * sinShift + v * cosShift;
      data[i] = Math.min(255, Math.max(0, (y + 1.140 * vNew) * 255));
      data[i + 1] = Math.min(255, Math.max(0, (y - 0.395 * uNew - 0.581 * vNew) * 255));
      data[i + 2] = Math.min(255, Math.max(0, (y + 2.032 * uNew) * 255));
    }
  };

  // Apply ML preset to an image
  const applyMLPresetToImage = async (imageSrc, preset) => {
    if (!preset || !preset.settings) return imageSrc;
    let processedImage = imageSrc;
    const settings = preset.settings;
    for (const [key, value] of Object.entries(settings)) {
      if (value !== 0 && value !== 1.0) {
        switch (key) {
          case 'brightness':
            processedImage = await adjustBrightness(processedImage, value);
            break;
          case 'contrast':
            processedImage = await adjustContrast(processedImage, value);
            break;
          case 'saturation':
            processedImage = await adjustSaturation(processedImage, value);
            break;
          case 'noise':
            processedImage = await addGaussianNoise(processedImage, value);
            break;
          case 'blur':
            processedImage = await applyBlur(processedImage, value);
            break;
          case 'hue':
            processedImage = await adjustHue(processedImage, value);
            break;
          case 'sharpen':
            processedImage = await applySharpen(processedImage, value);
            break;
          default:
            break;
        }
      }
    }
    return processedImage;
  };

  const captureFromSource = () => {
    if (!webcamRef.current) return null;
    // If live preview is enabled and canvas has content, capture from canvas to include overlay
    if (livePreviewEnabled && canvasRef.current && activeAugmentations.length > 0) {
      try {
        return canvasRef.current.toDataURL('image/jpeg');
      } catch (e) {
        // Fallback if canvas not ready
      }
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
  const handleLivePreviewToggle = () => {
    setLivePreviewEnabled(!livePreviewEnabled);
  };

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
    if (!lastImage) return;
    const augmented = await flipImage(lastImage, 'horizontal');
    setLastImage(augmented);
    onCapture(augmented);
  };
  
  const handleRotate = async (angle) => {
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
              <>
                📸 Capture Image
              </>
            )}
          </button>
          
          <BurstCapture onBurstCapture={handleBurstCapture} isBursting={isBursting} />
          
          <button
            onClick={handleLivePreviewToggle}
            style={{
              ...styles.previewButton,
              ...(livePreviewEnabled ? styles.activePreviewButton : {})
            }}
            title="Toggle live augmentation preview"
          >
            {livePreviewEnabled ? '👁️ Live Preview: ON' : '👁️ Live Preview: OFF'}
          </button>
          
          <button
            onClick={() => setRoi(null)}
            style={styles.clearRoiButton}
            title="Clear ROI"
          >
            🗑️ Clear ROI
          </button>
        </div>

        {/* ML Preset Status */}
        {currentMLPreset && (
          <div style={styles.presetStatus}>
            <span style={styles.presetLabel}>
              🎯 Active ML Preset: {currentMLPreset.name || currentMLPreset.id}
            </span>
            <button
              onClick={handleClearMLPreset}
              style={styles.clearPresetButton}
              title="Clear ML preset"
            >
              ✕
            </button>
          </div>
        )}
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
            onLivePreviewToggle={handleLivePreviewToggle}
            onLivePreviewSettingChange={handleLivePreviewSettingChange}
            livePreviewSettings={livePreviewSettings}
            activeAugmentations={activeAugmentations}
            onLivePreviewAugmentationToggle={handleLivePreviewAugmentationToggle}
          />
        </div>

        {lightingWarningsEnabled && (
          <div style={styles.toolsSection}>
            <LightingWarnings
              webcamRef={webcamRef}
              isEnabled={lightingWarningsEnabled}
              onWarningChange={(status) => {
                if (status.overall === 'critical') {
                  console.warn('Critical lighting conditions detected');
                }
              }}
            />
          </div>
        )}

        {showAugmentationPreview && (
          <div style={styles.toolsSection}>
            <AugmentationPreview
              webcamRef={webcamRef}
              isEnabled={showAugmentationPreview}
            />
          </div>
        )}
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
  }
};

export default CameraCapture;