import React, { useState, useEffect, useRef } from 'react';
import {
  adjustBrightness,
  adjustContrast,
  adjustSaturation,
  addGaussianNoise,
  applyBlur,
  adjustHue,
  applySharpen
} from '../utils/imageUtils';

const AugmentationPreview = ({ webcamRef, isEnabled = false }) => {
  const [previewImage, setPreviewImage] = useState(null);
  const [augmentationSettings, setAugmentationSettings] = useState({
    brightness: 1.0,
    contrast: 0,
    saturation: 1.0,
    noise: 0.1,
    blur: 2,
    hue: 0,
    sharpen: 0.5
  });
  const [selectedAugmentations, setSelectedAugmentations] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const previewCanvasRef = useRef(null);
  const intervalRef = useRef(null);

  const augmentationOptions = [
    { id: 'brightness', name: 'Brightness', icon: '☀️', min: 0.5, max: 1.5, step: 0.1 },
    { id: 'contrast', name: 'Contrast', icon: '🌓', min: -50, max: 50, step: 5 },
    { id: 'saturation', name: 'Saturation', icon: '🎨', min: 0.5, max: 1.5, step: 0.1 },
    { id: 'noise', name: 'Noise', icon: '📊', min: 0, max: 0.3, step: 0.01 },
    { id: 'blur', name: 'Blur', icon: '🌫️', min: 0, max: 5, step: 0.5 },
    { id: 'hue', name: 'Hue', icon: '🌈', min: -30, max: 30, step: 5 },
    { id: 'sharpen', name: 'Sharpen', icon: '🔍', min: 0, max: 1, step: 0.1 }
  ];

  // Start/stop preview capture
  useEffect(() => {
    if (isEnabled && webcamRef.current) {
      startPreview();
    } else {
      stopPreview();
    }

    return () => stopPreview();
  }, [isEnabled, webcamRef]);

  const startPreview = () => {
    if (intervalRef.current) return;
    
    intervalRef.current = setInterval(() => {
      if (webcamRef.current && selectedAugmentations.length > 0) {
        captureAndProcess();
      }
    }, 100); // Update every 100ms for smooth preview
  };

  const stopPreview = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const captureAndProcess = async () => {
    if (!webcamRef.current || isProcessing) return;
    
    setIsProcessing(true);
    try {
      const screenshot = webcamRef.current.getScreenshot();
      if (screenshot) {
        let processedImage = screenshot;
        
        // Apply selected augmentations in sequence
        for (const augId of selectedAugmentations) {
          const setting = augmentationSettings[augId];
          
          switch (augId) {
            case 'brightness':
              processedImage = await adjustBrightness(processedImage, setting);
              break;
            case 'contrast':
              processedImage = await adjustContrast(processedImage, setting);
              break;
            case 'saturation':
              processedImage = await adjustSaturation(processedImage, setting);
              break;
            case 'noise':
              processedImage = await addGaussianNoise(processedImage, setting);
              break;
            case 'blur':
              processedImage = await applyBlur(processedImage, setting);
              break;
            case 'hue':
              processedImage = await adjustHue(processedImage, setting);
              break;
            case 'sharpen':
              processedImage = await applySharpen(processedImage, setting);
              break;
          }
        }
        
        setPreviewImage(processedImage);
      }
    } catch (error) {
      console.error('Preview processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAugmentationToggle = (augId) => {
    setSelectedAugmentations(prev => 
      prev.includes(augId) 
        ? prev.filter(id => id !== augId)
        : [...prev, augId]
    );
  };

  const handleSettingChange = (augId, value) => {
    setAugmentationSettings(prev => ({
      ...prev,
      [augId]: parseFloat(value)
    }));
  };

  const getCurrentSettings = () => {
    return {
      selectedAugmentations,
      augmentationSettings
    };
  };

  if (!isEnabled) return null;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Real-Time Augmentation Preview</h3>
        <div style={styles.status}>
          {isProcessing ? '🔄 Processing...' : '✅ Live'}
        </div>
      </div>

      <div style={styles.content}>
        {/* Preview Display */}
        <div style={styles.previewSection}>
          <h4 style={styles.sectionTitle}>Preview</h4>
          <div style={styles.previewContainer}>
            {previewImage ? (
              <img 
                src={previewImage} 
                alt="Augmentation Preview" 
                style={styles.previewImage}
              />
            ) : (
              <div style={styles.noPreview}>
                <span>Select augmentations to see preview</span>
              </div>
            )}
          </div>
        </div>

        {/* Augmentation Controls */}
        <div style={styles.controlsSection}>
          <h4 style={styles.sectionTitle}>Augmentations</h4>
          <div style={styles.augmentationsGrid}>
            {augmentationOptions.map(option => (
              <div key={option.id} style={styles.augmentationOption}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={selectedAugmentations.includes(option.id)}
                    onChange={() => handleAugmentationToggle(option.id)}
                    style={styles.checkbox}
                  />
                  <span style={styles.optionIcon}>{option.icon}</span>
                  <span style={styles.optionName}>{option.name}</span>
                </label>
                
                {selectedAugmentations.includes(option.id) && (
                  <div style={styles.sliderContainer}>
                    <input
                      type="range"
                      min={option.min}
                      max={option.max}
                      step={option.step}
                      value={augmentationSettings[option.id]}
                      onChange={(e) => handleSettingChange(option.id, e.target.value)}
                      style={styles.slider}
                    />
                    <span style={styles.sliderValue}>
                      {augmentationSettings[option.id]}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Settings Export */}
      <div style={styles.exportSection}>
        <button 
          onClick={() => {
            const settings = getCurrentSettings();
            console.log('Current augmentation settings:', settings);
            // This could be passed to parent component
          }}
          style={styles.exportButton}
        >
          📋 Copy Settings
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '16px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #e9ecef'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  title: {
    margin: 0,
    color: '#2c3e50',
    fontSize: '16px',
    fontWeight: '600'
  },
  status: {
    fontSize: '12px',
    color: '#6c757d',
    fontWeight: '500'
  },
  content: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    marginBottom: '16px'
  },
  previewSection: {
    marginBottom: '16px'
  },
  sectionTitle: {
    margin: '0 0 12px 0',
    color: '#495057',
    fontSize: '14px',
    fontWeight: '600'
  },
  previewContainer: {
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #e9ecef',
    backgroundColor: '#ffffff',
    aspectRatio: '4/3',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  previewImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  noPreview: {
    color: '#6c757d',
    fontSize: '14px',
    textAlign: 'center'
  },
  controlsSection: {
    marginBottom: '16px'
  },
  augmentationsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    maxHeight: '300px',
    overflowY: 'auto'
  },
  augmentationOption: {
    padding: '8px',
    border: '1px solid #e9ecef',
    borderRadius: '6px',
    backgroundColor: '#ffffff'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    fontSize: '12px',
    color: '#495057'
  },
  checkbox: {
    margin: 0
  },
  optionIcon: {
    fontSize: '14px'
  },
  optionName: {
    fontWeight: '500'
  },
  sliderContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '8px',
    marginLeft: '20px'
  },
  slider: {
    flex: 1,
    height: '4px',
    borderRadius: '2px',
    background: '#dee2e6',
    outline: 'none',
    cursor: 'pointer'
  },
  sliderValue: {
    fontSize: '11px',
    color: '#6c757d',
    minWidth: '25px',
    textAlign: 'right'
  },
  exportSection: {
    display: 'flex',
    justifyContent: 'center'
  },
  exportButton: {
    padding: '8px 16px',
    backgroundColor: '#007bff',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  }
};

export default AugmentationPreview; 