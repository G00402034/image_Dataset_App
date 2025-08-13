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
  applySharpen
} from "../utils/imageUtils";

const AugmentationTools = ({
  onFlip,
  onRotate,
  onAdjustContrast,
  onAugment,
  onBurstWithAugmentation,
  isBursting,
  lastImage,
  livePreviewEnabled,
  onLivePreviewSettingChange,
  livePreviewSettings,
  activeAugmentations,
  onLivePreviewAugmentationToggle,
  previewFlipH,
  previewRotate,
  onChangePreviewTransform
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
    { id: 'brightness', name: 'Brightness', icon: '☀️', type: 'slider', min: 0.5, max: 1.5, step: 0.1 },
    { id: 'contrast', name: 'Contrast', icon: '🌓', type: 'slider', min: -50, max: 50, step: 5 },
    { id: 'saturation', name: 'Saturation', icon: '🎨', type: 'slider', min: 0.5, max: 1.5, step: 0.1 },
    { id: 'noise', name: 'Noise', icon: '📊', type: 'slider', min: 0, max: 0.3, step: 0.01 },
    { id: 'blur', name: 'Blur', icon: '🌫️', type: 'slider', min: 0, max: 5, step: 0.5 },
    { id: 'hue', name: 'Hue', icon: '🌈', type: 'slider', min: -30, max: 30, step: 5 },
    { id: 'sharpen', name: 'Sharpen', icon: '🔍', type: 'slider', min: 0, max: 1, step: 0.1 }
  ];

  const handleAugmentationToggle = (augId) => {
    setSelectedAugmentations(prev => prev.includes(augId) ? prev.filter(id => id !== augId) : [...prev, augId]);
  };

  const handleSettingChange = (augId, value) => {
    setAugmentationSettings(prev => ({ ...prev, [augId]: parseFloat(value) }));
  };

  const applySelectedAugmentations = async () => {
    if (selectedAugmentations.length === 0) return;
    let currentImage = null;
    for (const augId of selectedAugmentations) {
      const setting = augmentationSettings[augId];
      switch (augId) {
        case 'brightness': currentImage = await adjustBrightness(currentImage || lastImage, setting); break;
        case 'contrast': currentImage = await adjustContrast(currentImage || lastImage, setting); break;
        case 'saturation': currentImage = await adjustSaturation(currentImage || lastImage, setting); break;
        case 'noise': currentImage = await addGaussianNoise(currentImage || lastImage, setting); break;
        case 'blur': currentImage = await applyBlur(currentImage || lastImage, setting); break;
        case 'hue': currentImage = await adjustHue(currentImage || lastImage, setting); break;
        case 'sharpen': currentImage = await applySharpen(currentImage || lastImage, setting); break;
        default: break;
      }
    }
    if (currentImage) onAugment(currentImage);
  };

  return (
    <div style={styles.container}>
      <div style={styles.liveRow}>
        <span style={styles.liveLabel}>👁️ Live Preview (auto)</span>
      </div>

      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>Basic Transformations</h4>
        <div style={styles.basicTools}>
          <button onClick={() => onFlip()} style={styles.basicButton} title="Flip image horizontally">🔄 Flip</button>
          <button onClick={() => onRotate(90)} style={styles.basicButton} title="Rotate 90° clockwise">↻ 90°</button>
          <button onClick={() => onRotate(-90)} style={styles.basicButton} title="Rotate 90° counter-clockwise">↺ 90°</button>
        </div>
      </div>

      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>Advanced ML Augmentations</h4>
        <div style={styles.advancedTools}>
          {augmentationOptions.map(option => (
            <div key={option.id} style={styles.augmentationOption}>
              <div style={styles.optionHeader}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={livePreviewEnabled ? activeAugmentations.includes(option.id) : selectedAugmentations.includes(option.id)}
                    onChange={() => { if (livePreviewEnabled) onLivePreviewAugmentationToggle(option.id); else handleAugmentationToggle(option.id); }}
                    style={styles.checkbox}
                  />
                  <span style={styles.optionLabel}>{option.icon} {option.name}</span>
                </label>
              </div>
              {(livePreviewEnabled ? activeAugmentations.includes(option.id) : selectedAugmentations.includes(option.id)) && option.type === 'slider' && (
                <div style={styles.sliderContainer}>
                  <input
                    type="range"
                    min={option.min}
                    max={option.max}
                    step={option.step}
                    value={livePreviewEnabled ? livePreviewSettings[option.id] : augmentationSettings[option.id]}
                    onChange={(e) => { const value = parseFloat(e.target.value); if (livePreviewEnabled) onLivePreviewSettingChange(option.id, value); else handleSettingChange(option.id, value); }}
                    style={styles.slider}
                  />
                  <span style={styles.sliderValue}>{(livePreviewEnabled ? livePreviewSettings[option.id] : augmentationSettings[option.id])}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* No Apply button; advanced panel is live-only now */}
    </div>
  );
};

const styles = {
  container: { padding: 12, backgroundColor: '#f8f9fa', borderRadius: 8, border: '1px solid #e9ecef' },
  liveRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  liveLabel: { fontSize: 14, fontWeight: 600, color: '#1976d2' },
  section: { marginBottom: 16 },
  sectionTitle: { margin: '0 0 8px 0', color: '#495057', fontSize: 14, fontWeight: 500 },
  basicTools: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  basicButton: { padding: '8px 12px', backgroundColor: '#ffffff', border: '1px solid #dee2e6', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: 4 },
  advancedTools: { display: 'flex', flexDirection: 'column', gap: 8 },
  augmentationOption: { display: 'flex', flexDirection: 'column', gap: 4 },
  optionHeader: { display: 'flex', alignItems: 'center' },
  checkboxLabel: { display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12, color: '#495057' },
  checkbox: { margin: 0 },
  optionLabel: { fontWeight: 500 },
  sliderContainer: { display: 'flex', alignItems: 'center', gap: 8, marginLeft: 20 },
  slider: { flex: 1, height: 4, borderRadius: 2, background: '#dee2e6', outline: 'none', cursor: 'pointer' },
  sliderValue: { fontSize: 11, color: '#6c757d', minWidth: 30, textAlign: 'right' },
  actionButtons: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 },
  actionButton: { padding: '8px 12px', backgroundColor: '#007bff', color: '#ffffff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: 4 },
  disabledButton: { backgroundColor: '#6c757d', cursor: 'not-allowed' },
  transformRow: { display: 'flex', alignItems: 'center', gap: 8 },
  smallLabel: { fontSize: 12, color: '#374151', display: 'flex', alignItems: 'center', gap: 4 },
  rotateSelect: { marginLeft: 4, padding: '4px 6px', border: '1px solid #dee2e6', borderRadius: 6, fontSize: 12 }
};

export default AugmentationTools;