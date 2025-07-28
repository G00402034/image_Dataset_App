import React, { useState } from 'react';
import { hotkeyManager, formatHotkey, isHotkeysEnabled, toggleHotkeys } from '../utils/hotkeyManager';

const HotkeyHelp = ({ isVisible, onClose }) => {
  const [isHotkeysEnabled, setIsHotkeysEnabled] = useState(hotkeyManager.isEnabled);

  const handleToggleHotkeys = () => {
    const newState = toggleHotkeys();
    setIsHotkeysEnabled(newState);
  };

  const hotkeyCategories = [
    {
      title: 'Capture',
      hotkeys: [
        { key: 'space', description: 'Capture image' },
        { key: 'ctrl+space', description: 'Burst capture' }
      ]
    },
    {
      title: 'Augmentation',
      hotkeys: [
        { key: 'f', description: 'Flip image' },
        { key: 'r', description: 'Rotate image' },
        { key: 'ctrl+up', description: 'Increase brightness' },
        { key: 'ctrl+down', description: 'Decrease brightness' },
        { key: 'ctrl+shift+up', description: 'Increase contrast' },
        { key: 'ctrl+shift+down', description: 'Decrease contrast' },
        { key: 'ctrl+right', description: 'Increase saturation' },
        { key: 'ctrl+left', description: 'Decrease saturation' },
        { key: 'n', description: 'Add noise' },
        { key: 'b', description: 'Apply blur' },
        { key: 's', description: 'Sharpen image' },
        { key: 'a', description: 'Random augmentation' }
      ]
    },
    {
      title: 'ROI Selection',
      hotkeys: [
        { key: 'escape', description: 'Clear ROI' },
        { key: 'ctrl+r', description: 'Reset ROI' }
      ]
    },
    {
      title: 'Export',
      hotkeys: [
        { key: 'ctrl+e', description: 'Export dataset' },
        { key: 'ctrl+u', description: 'Upload to Google Drive' }
      ]
    },
    {
      title: 'Utilities',
      hotkeys: [
        { key: 'l', description: 'Toggle lighting warnings' },
        { key: 'f1', description: 'Show this help' }
      ]
    }
  ];

  if (!isVisible) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>Keyboard Shortcuts</h2>
          <button onClick={onClose} style={styles.closeButton}>
            ✕
          </button>
        </div>

        <div style={styles.toggleSection}>
          <label style={styles.toggleLabel}>
            <input
              type="checkbox"
              checked={isHotkeysEnabled}
              onChange={handleToggleHotkeys}
              style={styles.toggle}
            />
            Enable Hotkeys
          </label>
          <span style={{
            ...styles.statusIndicator,
            backgroundColor: isHotkeysEnabled ? '#28a745' : '#6c757d'
          }}>
            {isHotkeysEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>

        <div style={styles.content}>
          {hotkeyCategories.map((category, index) => (
            <div key={index} style={styles.category}>
              <h3 style={styles.categoryTitle}>{category.title}</h3>
              <div style={styles.hotkeyList}>
                {category.hotkeys.map((hotkey, hotkeyIndex) => (
                  <div key={hotkeyIndex} style={styles.hotkeyItem}>
                    <kbd style={styles.hotkeyKey}>
                      {formatHotkey(hotkey.key)}
                    </kbd>
                    <span style={styles.hotkeyDescription}>
                      {hotkey.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            <strong>Tip:</strong> Hotkeys are disabled when typing in input fields
          </p>
          <button onClick={onClose} style={styles.closeModalButton}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
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
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #e9ecef'
  },
  title: {
    margin: 0,
    color: '#2c3e50',
    fontSize: '20px',
    fontWeight: '600'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    color: '#6c757d',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    transition: 'all 0.2s ease'
  },
  toggleSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    backgroundColor: '#f8f9fa',
    borderBottom: '1px solid #e9ecef'
  },
  toggleLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#495057'
  },
  toggle: {
    margin: 0
  },
  statusIndicator: {
    padding: '4px 12px',
    borderRadius: '12px',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: '600'
  },
  content: {
    padding: '24px',
    maxHeight: '50vh',
    overflowY: 'auto'
  },
  category: {
    marginBottom: '24px'
  },
  categoryTitle: {
    margin: '0 0 12px 0',
    color: '#2c3e50',
    fontSize: '16px',
    fontWeight: '600',
    borderBottom: '2px solid #007bff',
    paddingBottom: '4px'
  },
  hotkeyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  hotkeyItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 0'
  },
  hotkeyKey: {
    backgroundColor: '#f8f9fa',
    border: '1px solid #dee2e6',
    borderRadius: '4px',
    padding: '4px 8px',
    fontSize: '12px',
    fontFamily: 'monospace',
    fontWeight: '600',
    color: '#495057',
    minWidth: '80px',
    textAlign: 'center'
  },
  hotkeyDescription: {
    fontSize: '14px',
    color: '#495057',
    flex: 1
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    borderTop: '1px solid #e9ecef',
    backgroundColor: '#f8f9fa'
  },
  footerText: {
    margin: 0,
    fontSize: '12px',
    color: '#6c757d'
  },
  closeModalButton: {
    padding: '8px 16px',
    backgroundColor: '#007bff',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  }
};

export default HotkeyHelp; 