import React, { useState } from "react";
import {
  flipImage,
  rotateImage,
  adjustContrast,
  adjustBrightness,
  adjustSaturation,
  addGaussianNoise,
  applyBlur,
  adjustHue,
  applySharpen,
  randomAugmentation
} from "../utils/imageUtils";

const AugmentationTools = ({
  onFlip,
  onRotate,
  onAdjustContrast,
  onAugment,
  onBurstWithAugmentation,
  isBursting,
  lastImage
}) => {
  const [selectedAugmentations, setSelectedAugmentations] = useState([]);
  const [augmentationSettings, setAugmentationSettings] = useState({
    brightness: 1.0,
    contrast: 0,
    saturation: 1.0,
    noise: 0.1,
    blur: 2,
    hue: 0,
    sharpen: 0.5
  });

  const augmentationOptions = [
    { id: 'flip', name: 'Flip', icon: '🔄', handler: () => onFlip() },
    { id: 'rotate', name: 'Rotate', icon: '🔄', handler: () => onRotate(90) },
    { id: 'brightness', name: 'Brightness', icon: '☀️', type: 'slider', min: 0.5, max: 1.5, step: 0.1 },
    { id: 'contrast', name: 'Contrast', icon: '🌓', type: 'slider', min: -50, max: 50, step: 5 },
    { id: 'saturation', name: 'Saturation', icon: '🎨', type: 'slider', min: 0.5, max: 1.5, step: 0.1 },
    { id: 'noise', name: 'Noise', icon: '📊', type: 'slider', min: 0, max: 0.3, step: 0.01 },
    { id: 'blur', name: 'Blur', icon: '🌫️', type: 'slider', min: 0, max: 5, step: 0.5 },
    { id: 'hue', name: 'Hue', icon: '🌈', type: 'slider', min: -30, max: 30, step: 5 },
    { id: 'sharpen', name: 'Sharpen', icon: '🔍', type: 'slider', min: 0, max: 1, step: 0.1 }
  ];

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

  const applySelectedAugmentations = async () => {
    if (selectedAugmentations.length === 0) return;
    
    // Apply selected augmentations in sequence
    let currentImage = null;
    for (const augId of selectedAugmentations) {
      const setting = augmentationSettings[augId];
      
      switch (augId) {
        case 'brightness':
          currentImage = await adjustBrightness(currentImage || lastImage, setting);
          break;
        case 'contrast':
          currentImage = await adjustContrast(currentImage || lastImage, setting);
          break;
        case 'saturation':
          currentImage = await adjustSaturation(currentImage || lastImage, setting);
          break;
        case 'noise':
          currentImage = await addGaussianNoise(currentImage || lastImage, setting);
          break;
        case 'blur':
          currentImage = await applyBlur(currentImage || lastImage, setting);
          break;
        case 'hue':
          currentImage = await adjustHue(currentImage || lastImage, setting);
          break;
        case 'sharpen':
          currentImage = await applySharpen(currentImage || lastImage, setting);
          break;
      }
    }
    
    if (currentImage) {
      onAugment(currentImage);
    }
  };

  const handleRandomAugmentation = async () => {
    const augmented = await randomAugmentation(lastImage);
    onAugment(augmented);
  };

  const handleBurstWithAugmentation = () => {
    if (onBurstWithAugmentation) {
      onBurstWithAugmentation(selectedAugmentations, augmentationSettings);
    }
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>ML Augmentation Tools</h3>
      
      {/* Basic Augmentations */}
      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>Basic Transformations</h4>
        <div style={styles.basicTools}>
          <button 
            onClick={() => onFlip()} 
            style={styles.basicButton}
            title="Flip image horizontally"
          >
            🔄 Flip
          </button>
          
          <button 
            onClick={() => onRotate(90)} 
            style={styles.basicButton}
            title="Rotate 90° clockwise"
          >
            🔄 Rotate 90°
          </button>
          
          <button 
            onClick={() => onRotate(-90)} 
            style={styles.basicButton}
            title="Rotate 90° counter-clockwise"
          >
            🔄 Rotate -90°
          </button>
        </div>
      </div>

      {/* Advanced Augmentations */}
      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>Advanced ML Augmentations</h4>
        <div style={styles.advancedTools}>
          {augmentationOptions.slice(2).map(option => (
            <div key={option.id} style={styles.augmentationOption}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={selectedAugmentations.includes(option.id)}
                  onChange={() => handleAugmentationToggle(option.id)}
                  style={styles.checkbox}
                />
                <span style={styles.optionLabel}>
                  {option.icon} {option.name}
                </span>
              </label>
              
              {selectedAugmentations.includes(option.id) && option.type === 'slider' && (
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

      {/* Action Buttons */}
      <div style={styles.actionButtons}>
        <button 
          onClick={applySelectedAugmentations}
          disabled={selectedAugmentations.length === 0}
          style={{
            ...styles.actionButton,
            ...(selectedAugmentations.length === 0 ? styles.disabledButton : {})
          }}
        >
          🎯 Apply Selected ({selectedAugmentations.length})
        </button>
        
        <button 
          onClick={handleRandomAugmentation}
          style={styles.actionButton}
        >
          🎲 Random Augmentation
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
  title: {
    margin: '0 0 16px 0',
    color: '#2c3e50',
    fontSize: '16px',
    fontWeight: '600'
  },
  section: {
    marginBottom: '20px'
  },
  sectionTitle: {
    margin: '0 0 12px 0',
    color: '#495057',
    fontSize: '14px',
    fontWeight: '500'
  },
  basicTools: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  basicButton: {
    padding: '8px 12px',
    backgroundColor: '#ffffff',
    border: '1px solid #dee2e6',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  advancedTools: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  augmentationOption: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
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
  optionLabel: {
    fontWeight: '500'
  },
  sliderContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
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
    minWidth: '30px',
    textAlign: 'right'
  },
  actionButtons: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '16px'
  },
  actionButton: {
    padding: '8px 12px',
    backgroundColor: '#007bff',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },

  disabledButton: {
    backgroundColor: '#6c757d',
    cursor: 'not-allowed'
  }
};

export default AugmentationTools;