import React, { useState, useEffect } from 'react';

const CustomMLPresets = ({ onApplyPreset, onSavePreset }) => {
  const [customPresets, setCustomPresets] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPreset, setNewPreset] = useState({
    name: '',
    description: '',
    settings: {
      brightness: 1.0,
      contrast: 0,
      saturation: 1.0,
      noise: 0.1,
      blur: 2,
      hue: 0,
      sharpen: 0.5
    },
    selectedAugmentations: []
  });

  // Load custom presets from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('customMLPresets');
    if (saved) {
      setCustomPresets(JSON.parse(saved));
    }
  }, []);

  // Save custom presets to localStorage
  useEffect(() => {
    localStorage.setItem('customMLPresets', JSON.stringify(customPresets));
  }, [customPresets]);

  const handleCreatePreset = () => {
    if (newPreset.name.trim() && newPreset.selectedAugmentations.length > 0) {
      const preset = {
        ...newPreset,
        id: Date.now(),
        createdAt: new Date().toISOString()
      };
      setCustomPresets([...customPresets, preset]);
      setNewPreset({
        name: '',
        description: '',
        settings: {
          brightness: 1.0,
          contrast: 0,
          saturation: 1.0,
          noise: 0.1,
          blur: 2,
          hue: 0,
          sharpen: 0.5
        },
        selectedAugmentations: []
      });
      setShowCreateModal(false);
    }
  };

  const handleDeletePreset = (presetId) => {
    setCustomPresets(customPresets.filter(p => p.id !== presetId));
  };

  const handleSettingChange = (setting, value) => {
    setNewPreset(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [setting]: parseFloat(value)
      }
    }));
  };

  const handleAugmentationToggle = (augId) => {
    setNewPreset(prev => ({
      ...prev,
      selectedAugmentations: prev.selectedAugmentations.includes(augId)
        ? prev.selectedAugmentations.filter(id => id !== augId)
        : [...prev.selectedAugmentations, augId]
    }));
  };

  const augmentationOptions = [
    { id: 'brightness', name: 'Brightness', icon: '☀️', min: 0.5, max: 1.5, step: 0.1 },
    { id: 'contrast', name: 'Contrast', icon: '🌓', min: -50, max: 50, step: 5 },
    { id: 'saturation', name: 'Saturation', icon: '🎨', min: 0.5, max: 1.5, step: 0.1 },
    { id: 'noise', name: 'Noise', icon: '📊', min: 0, max: 0.3, step: 0.01 },
    { id: 'blur', name: 'Blur', icon: '🌫️', min: 0, max: 5, step: 0.5 },
    { id: 'hue', name: 'Hue', icon: '🌈', min: -30, max: 30, step: 5 },
    { id: 'sharpen', name: 'Sharpen', icon: '🔍', min: 0, max: 1, step: 0.1 }
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Custom ML Presets</h3>
        <button 
          onClick={() => setShowCreateModal(true)}
          style={styles.createButton}
        >
          ➕ Create Preset
        </button>
      </div>

      <div style={styles.presetsGrid}>
        {customPresets.map(preset => (
          <div key={preset.id} style={styles.presetCard}>
            <div style={styles.presetHeader}>
              <h4 style={styles.presetName}>{preset.name}</h4>
              <button 
                onClick={() => handleDeletePreset(preset.id)}
                style={styles.deleteButton}
                title="Delete preset"
              >
                🗑️
              </button>
            </div>
            
            <p style={styles.presetDescription}>{preset.description}</p>
            
            <div style={styles.presetStats}>
              <span style={styles.stat}>
                {preset.selectedAugmentations.length} augmentations
              </span>
              <span style={styles.stat}>
                {new Date(preset.createdAt).toLocaleDateString()}
              </span>
            </div>
            
            <button 
              onClick={() => {
                console.log('Custom preset clicked:', preset);
                onApplyPreset(preset);
              }}
              style={styles.applyButton}
            >
              Apply Preset
            </button>
          </div>
        ))}
      </div>

      {customPresets.length === 0 && (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>🎨</div>
          <h4 style={styles.emptyTitle}>No Custom Presets</h4>
          <p style={styles.emptyText}>
            Create your own ML training presets to save time and ensure consistency.
          </p>
        </div>
      )}

      {/* Create Preset Modal */}
      {showCreateModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3>Create Custom Preset</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                style={styles.closeButton}
              >
                ✕
              </button>
            </div>
            
            <div style={styles.modalContent}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Preset Name:</label>
                <input
                  type="text"
                  value={newPreset.name}
                  onChange={(e) => setNewPreset(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter preset name..."
                  style={styles.input}
                />
              </div>
              
              <div style={styles.inputGroup}>
                <label style={styles.label}>Description:</label>
                <textarea
                  value={newPreset.description}
                  onChange={(e) => setNewPreset(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this preset does..."
                  style={styles.textarea}
                  rows={3}
                />
              </div>
              
              <div style={styles.augmentationsSection}>
                <h4 style={styles.sectionTitle}>Select Augmentations</h4>
                <div style={styles.augmentationsGrid}>
                  {augmentationOptions.map(option => (
                    <div key={option.id} style={styles.augmentationOption}>
                      <label style={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={newPreset.selectedAugmentations.includes(option.id)}
                          onChange={() => handleAugmentationToggle(option.id)}
                          style={styles.checkbox}
                        />
                        <span style={styles.optionIcon}>{option.icon}</span>
                        <span style={styles.optionName}>{option.name}</span>
                      </label>
                      
                      {newPreset.selectedAugmentations.includes(option.id) && (
                        <div style={styles.sliderContainer}>
                          <input
                            type="range"
                            min={option.min}
                            max={option.max}
                            step={option.step}
                            value={newPreset.settings[option.id]}
                            onChange={(e) => handleSettingChange(option.id, e.target.value)}
                            style={styles.slider}
                          />
                          <span style={styles.sliderValue}>
                            {newPreset.settings[option.id]}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div style={styles.modalActions}>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  style={styles.cancelButton}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreatePreset}
                  disabled={!newPreset.name.trim() || newPreset.selectedAugmentations.length === 0}
                  style={{
                    ...styles.confirmButton,
                    ...(!newPreset.name.trim() || newPreset.selectedAugmentations.length === 0 ? styles.disabledButton : {})
                  }}
                >
                  Create Preset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
  createButton: {
    padding: '8px 16px',
    backgroundColor: '#007bff',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  presetsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '16px'
  },
  presetCard: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    padding: '16px',
    border: '1px solid #e9ecef',
    transition: 'all 0.2s ease'
  },
  presetHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  presetName: {
    margin: 0,
    color: '#2c3e50',
    fontSize: '14px',
    fontWeight: '600'
  },
  deleteButton: {
    background: 'none',
    border: 'none',
    fontSize: '14px',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    transition: 'all 0.2s ease'
  },
  presetDescription: {
    margin: '0 0 12px 0',
    color: '#6c757d',
    fontSize: '12px',
    lineHeight: '1.4'
  },
  presetStats: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '12px'
  },
  stat: {
    fontSize: '11px',
    color: '#6c757d'
  },
  applyButton: {
    width: '100%',
    padding: '8px 12px',
    backgroundColor: '#28a745',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px'
  },
  emptyIcon: {
    fontSize: '32px',
    marginBottom: '12px'
  },
  emptyTitle: {
    margin: '0 0 8px 0',
    color: '#6c757d',
    fontSize: '16px',
    fontWeight: '500'
  },
  emptyText: {
    margin: 0,
    color: '#6c757d',
    fontSize: '14px'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '80vh',
    overflow: 'hidden',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #e9ecef'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    color: '#6c757d',
    cursor: 'pointer'
  },
  modalContent: {
    padding: '20px',
    maxHeight: '60vh',
    overflowY: 'auto'
  },
  inputGroup: {
    marginBottom: '16px'
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    color: '#495057',
    fontSize: '14px',
    fontWeight: '500'
  },
  input: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #dee2e6',
    borderRadius: '6px',
    fontSize: '14px'
  },
  textarea: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #dee2e6',
    borderRadius: '6px',
    fontSize: '14px',
    resize: 'vertical'
  },
  augmentationsSection: {
    marginBottom: '20px'
  },
  sectionTitle: {
    margin: '0 0 12px 0',
    color: '#495057',
    fontSize: '14px',
    fontWeight: '600'
  },
  augmentationsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  augmentationOption: {
    padding: '12px',
    border: '1px solid #e9ecef',
    borderRadius: '6px',
    backgroundColor: '#f8f9fa'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#495057'
  },
  checkbox: {
    margin: 0
  },
  optionIcon: {
    fontSize: '16px'
  },
  optionName: {
    fontWeight: '500'
  },
  sliderContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '8px',
    marginLeft: '24px'
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
    fontSize: '12px',
    color: '#6c757d',
    minWidth: '30px',
    textAlign: 'right'
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    paddingTop: '20px',
    borderTop: '1px solid #e9ecef'
  },
  cancelButton: {
    padding: '8px 16px',
    backgroundColor: '#6c757d',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer'
  },
  confirmButton: {
    padding: '8px 16px',
    backgroundColor: '#007bff',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer'
  },
  disabledButton: {
    backgroundColor: '#6c757d',
    cursor: 'not-allowed'
  }
};

export default CustomMLPresets; 