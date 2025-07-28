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

const CameraCapture = ({ onCapture, roi, setRoi, lightingWarningsEnabled, setLightingWarningsEnabled }) => {
  const webcamRef = useRef(null);
  const [isBursting, setIsBursting] = useState(false);
  const [lastImage, setLastImage] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const [isDrawingROI, setIsDrawingROI] = useState(false);
  const [roiStart, setRoiStart] = useState(null);
  const [showAugmentationPreview, setShowAugmentationPreview] = useState(false);

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

  const handleSingleCapture = async () => {
    if (webcamRef.current) {
      setIsCapturing(true);
      const imageSrc = webcamRef.current.getScreenshot();
      
      // Apply ROI if selected
      const finalImage = roi ? await cropImageWithROI(imageSrc, roi) : imageSrc;
      
      setLastImage(finalImage);
      onCapture(finalImage);
      setIsCapturing(false);
    }
  };

  const handleBurstCapture = async (count = 5, interval = 200) => {
    setIsBursting(true);
    
    for (let i = 0; i < count; i++) {
      if (webcamRef.current) {
        const imageSrc = webcamRef.current.getScreenshot();
        const finalImage = roi ? await cropImageWithROI(imageSrc, roi) : imageSrc;
        setLastImage(finalImage);
        onCapture(finalImage);
      }
      
      // Wait for interval between captures (except for the last one)
      if (i < count - 1) {
        await new Promise((resolve) => setTimeout(resolve, interval));
      }
    }
    
    setIsBursting(false);
  };

  // Crop image based on ROI
  const cropImageWithROI = (imageSrc, roiData) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size to ROI dimensions
        canvas.width = roiData.width;
        canvas.height = roiData.height;
        
        // Draw cropped region
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
    const imageSrc = webcamRef.current.getScreenshot();
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
      }
    }
    
    setLastImage(augmentedImage);
    onCapture(augmentedImage);
    setIsBursting(false);
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
    
    if (newRoi.width > 20 && newRoi.height > 20) {
      setRoi(newRoi);
    }
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
    // Import and use random augmentation
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
                <div style={{
                  ...styles.roiHandle,
                  left: roi.x - 4,
                  top: roi.y - 4
                }} />
                <div style={{
                  ...styles.roiHandle,
                  left: roi.x + roi.width - 4,
                  top: roi.y - 4
                }} />
                <div style={{
                  ...styles.roiHandle,
                  left: roi.x - 4,
                  top: roi.y + roi.height - 4
                }} />
                <div style={{
                  ...styles.roiHandle,
                  left: roi.x + roi.width - 4,
                  top: roi.y + roi.height - 4
                }} />
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
            onClick={() => setShowAugmentationPreview(!showAugmentationPreview)}
            style={styles.previewButton}
            title="Toggle augmentation preview"
          >
            {showAugmentationPreview ? '👁️ Hide Preview' : '👁️ Show Preview'}
          </button>
          
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
    padding: '20px'
  },
  title: {
    margin: '0 0 20px 0',
    color: '#2c3e50',
    fontSize: '20px',
    fontWeight: '600'
  },
  cameraSection: {
    marginBottom: '24px'
  },
  webcamContainer: {
    position: 'relative',
    marginBottom: '16px',
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
    marginBottom: '24px'
  },
  toolsSection: {
    marginBottom: '20px'
  },
  sectionTitle: {
    margin: '0 0 12px 0',
    color: '#495057',
    fontSize: '16px',
    fontWeight: '500'
  },
  previewSection: {
    marginBottom: '24px'
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