import React from 'react';

const MLPresets = ({ onApplyPreset }) => {
  const mlPresets = [
    {
      id: 'data_augmentation',
      name: 'Data Augmentation',
      description: 'Standard ML data augmentation for training',
      icon: '🔄',
      settings: {
        brightness: 1.1,
        contrast: 15,
        saturation: 1.2,
        noise: 0.05,
        blur: 0.5
      }
    },
    {
      id: 'robustness',
      name: 'Robustness Training',
      description: 'Enhance model robustness to lighting variations',
      icon: '🛡️',
      settings: {
        brightness: 0.8,
        contrast: 25,
        saturation: 0.9,
        noise: 0.1,
        blur: 1.0
      }
    },
    {
      id: 'low_light',
      name: 'Low Light Adaptation',
      description: 'Simulate low light conditions',
      icon: '🌙',
      settings: {
        brightness: 0.6,
        contrast: 30,
        saturation: 0.8,
        noise: 0.15,
        blur: 1.5
      }
    },
    {
      id: 'bright_light',
      name: 'Bright Light Adaptation',
      description: 'Simulate bright/overexposed conditions',
      icon: '☀️',
      settings: {
        brightness: 1.4,
        contrast: 20,
        saturation: 1.3,
        noise: 0.08,
        blur: 0.8
      }
    },
    {
      id: 'noise_tolerance',
      name: 'Noise Tolerance',
      description: 'Train model to handle noisy images',
      icon: '📊',
      settings: {
        brightness: 1.0,
        contrast: 10,
        saturation: 1.0,
        noise: 0.2,
        blur: 0.3
      }
    },
    {
      id: 'blur_tolerance',
      name: 'Blur Tolerance',
      description: 'Train model to handle motion blur',
      icon: '🌫️',
      settings: {
        brightness: 1.0,
        contrast: 5,
        saturation: 1.0,
        noise: 0.05,
        blur: 2.5
      }
    },
    {
      id: 'color_variation',
      name: 'Color Variation',
      description: 'Handle color temperature variations',
      icon: '🎨',
      settings: {
        brightness: 1.1,
        contrast: 15,
        saturation: 1.4,
        hue: 15,
        noise: 0.05
      }
    },
    {
      id: 'contrast_variation',
      name: 'Contrast Variation',
      description: 'Handle extreme contrast conditions',
      icon: '🌓',
      settings: {
        brightness: 1.0,
        contrast: 40,
        saturation: 0.9,
        noise: 0.1,
        blur: 0.5
      }
    },
    {
      id: 'saturation_variation',
      name: 'Saturation Variation',
      description: 'Handle different color saturation levels',
      icon: '🌈',
      settings: {
        brightness: 1.0,
        contrast: 10,
        saturation: 1.5,
        noise: 0.05,
        blur: 0.3
      }
    },
    {
      id: 'mixed_augmentation',
      name: 'Mixed Augmentation',
      description: 'Combination of multiple augmentations',
      icon: '🎲',
      settings: {
        brightness: 1.2,
        contrast: 20,
        saturation: 1.1,
        noise: 0.1,
        blur: 1.0,
        hue: 10
      }
    }
  ];

  const handlePresetClick = (preset) => {
    onApplyPreset(preset.settings);
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>ML Training Presets</h3>
      <p style={styles.description}>
        Practical augmentation presets for machine learning training
      </p>
      
      <div style={styles.presetsGrid}>
        {mlPresets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => handlePresetClick(preset)}
            style={styles.presetCard}
            title={preset.description}
          >
            <div style={styles.presetHeader}>
              <span style={styles.presetIcon}>{preset.icon}</span>
              <h4 style={styles.presetName}>{preset.name}</h4>
            </div>
            <p style={styles.presetDescription}>{preset.description}</p>
            <div style={styles.presetSettings}>
              {Object.entries(preset.settings).map(([key, value]) => (
                <span key={key} style={styles.settingTag}>
                  {key}: {typeof value === 'number' ? value.toFixed(1) : value}
                </span>
              ))}
            </div>
          </button>
        ))}
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
    margin: '0 0 8px 0',
    color: '#2c3e50',
    fontSize: '16px',
    fontWeight: '600'
  },
  description: {
    margin: '0 0 16px 0',
    fontSize: '12px',
    color: '#6c757d'
  },
  presetsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px'
  },
  presetCard: {
    background: '#ffffff',
    border: '1px solid #dee2e6',
    borderRadius: '6px',
    padding: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  presetHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  presetIcon: {
    fontSize: '16px'
  },
  presetName: {
    margin: 0,
    fontSize: '14px',
    fontWeight: '600',
    color: '#495057'
  },
  presetDescription: {
    margin: 0,
    fontSize: '11px',
    color: '#6c757d',
    lineHeight: '1.3'
  },
  presetSettings: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px'
  },
  settingTag: {
    fontSize: '10px',
    backgroundColor: '#e9ecef',
    color: '#495057',
    padding: '2px 6px',
    borderRadius: '10px',
    fontWeight: '500'
  }
};

export default MLPresets; 