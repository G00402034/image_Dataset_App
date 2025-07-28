// Hotkey manager for keyboard shortcuts

class HotkeyManager {
  constructor() {
    this.hotkeys = new Map();
    this.isEnabled = true;
    this.listeners = new Set();
  }

  // Register a hotkey
  register(key, callback, description = '') {
    const normalizedKey = this.normalizeKey(key);
    this.hotkeys.set(normalizedKey, {
      callback,
      description,
      key: normalizedKey
    });
  }

  // Unregister a hotkey
  unregister(key) {
    const normalizedKey = this.normalizeKey(key);
    this.hotkeys.delete(normalizedKey);
  }

  // Enable/disable hotkeys
  setEnabled(enabled) {
    this.isEnabled = enabled;
  }

  // Normalize key combination
  normalizeKey(key) {
    return key.toLowerCase().replace(/\s+/g, '');
  }

  // Parse key event
  parseKeyEvent(event) {
    const parts = [];
    
    if (event.ctrlKey) parts.push('ctrl');
    if (event.metaKey) parts.push('meta');
    if (event.altKey) parts.push('alt');
    if (event.shiftKey) parts.push('shift');
    
    // Handle special keys
    const key = event.key.toLowerCase();
    let keyName = key;
    
    switch (key) {
      case ' ':
        keyName = 'space';
        break;
      case 'enter':
        keyName = 'enter';
        break;
      case 'escape':
        keyName = 'escape';
        break;
      case 'tab':
        keyName = 'tab';
        break;
      case 'backspace':
        keyName = 'backspace';
        break;
      case 'delete':
        keyName = 'delete';
        break;
      case 'arrowup':
        keyName = 'up';
        break;
      case 'arrowdown':
        keyName = 'down';
        break;
      case 'arrowleft':
        keyName = 'left';
        break;
      case 'arrowright':
        keyName = 'right';
        break;
      default:
        // For single character keys, use the character
        if (key.length === 1) {
          keyName = key;
        }
    }
    
    parts.push(keyName);
    return parts.join('+');
  }

  // Handle keydown event
  handleKeyDown = (event) => {
    if (!this.isEnabled) return;
    
    // Don't trigger hotkeys when typing in input fields
    if (event.target.tagName === 'INPUT' || 
        event.target.tagName === 'TEXTAREA' || 
        event.target.contentEditable === 'true') {
      return;
    }

    const keyCombo = this.parseKeyEvent(event);
    const hotkey = this.hotkeys.get(keyCombo);
    
    if (hotkey) {
      event.preventDefault();
      event.stopPropagation();
      
      try {
        hotkey.callback(event);
        this.notifyListeners('hotkeyTriggered', { key: keyCombo, description: hotkey.description });
      } catch (error) {
        console.error('Hotkey callback error:', error);
      }
    }
  };

  // Initialize event listeners
  initialize() {
    document.addEventListener('keydown', this.handleKeyDown);
  }

  // Cleanup event listeners
  destroy() {
    document.removeEventListener('keydown', this.handleKeyDown);
    this.hotkeys.clear();
    this.listeners.clear();
  }

  // Add event listener
  addListener(event, callback) {
    this.listeners.add({ event, callback });
  }

  // Remove event listener
  removeListener(event, callback) {
    this.listeners.forEach(listener => {
      if (listener.event === event && listener.callback === callback) {
        this.listeners.delete(listener);
      }
    });
  }

  // Notify listeners
  notifyListeners(event, data) {
    this.listeners.forEach(listener => {
      if (listener.event === event) {
        listener.callback(data);
      }
    });
  }

  // Get all registered hotkeys
  getHotkeys() {
    return Array.from(this.hotkeys.values());
  }

  // Get hotkey by key combination
  getHotkey(key) {
    const normalizedKey = this.normalizeKey(key);
    return this.hotkeys.get(normalizedKey);
  }

  // Check if a key combination is registered
  hasHotkey(key) {
    const normalizedKey = this.normalizeKey(key);
    return this.hotkeys.has(normalizedKey);
  }
}

// Create singleton instance
export const hotkeyManager = new HotkeyManager();

// Default hotkeys for the application
export const DEFAULT_HOTKEYS = {
  CAPTURE: 'space',
  BURST_CAPTURE: 'ctrl+space',
  FLIP_IMAGE: 'f',
  ROTATE_IMAGE: 'r',
  BRIGHTNESS_UP: 'ctrl+up',
  BRIGHTNESS_DOWN: 'ctrl+down',
  CONTRAST_UP: 'ctrl+shift+up',
  CONTRAST_DOWN: 'ctrl+shift+down',
  SATURATION_UP: 'ctrl+right',
  SATURATION_DOWN: 'ctrl+left',
  ADD_NOISE: 'n',
  APPLY_BLUR: 'b',
  SHARPEN: 's',
  RANDOM_AUGMENT: 'a',
  CLEAR_ROI: 'escape',
  RESET_ROI: 'ctrl+r',
  EXPORT_DATASET: 'ctrl+e',
  UPLOAD_TO_DRIVE: 'ctrl+u',
  TOGGLE_LIGHTING_WARNINGS: 'l',
  HELP: 'f1'
};

// Initialize default hotkeys
export function initializeDefaultHotkeys(callbacks) {
  // Capture hotkeys
  hotkeyManager.register(DEFAULT_HOTKEYS.CAPTURE, callbacks.capture, 'Capture image');
  hotkeyManager.register(DEFAULT_HOTKEYS.BURST_CAPTURE, callbacks.burstCapture, 'Burst capture');
  
  // Augmentation hotkeys
  hotkeyManager.register(DEFAULT_HOTKEYS.FLIP_IMAGE, callbacks.flipImage, 'Flip image');
  hotkeyManager.register(DEFAULT_HOTKEYS.ROTATE_IMAGE, callbacks.rotateImage, 'Rotate image');
  hotkeyManager.register(DEFAULT_HOTKEYS.BRIGHTNESS_UP, callbacks.brightnessUp, 'Increase brightness');
  hotkeyManager.register(DEFAULT_HOTKEYS.BRIGHTNESS_DOWN, callbacks.brightnessDown, 'Decrease brightness');
  hotkeyManager.register(DEFAULT_HOTKEYS.CONTRAST_UP, callbacks.contrastUp, 'Increase contrast');
  hotkeyManager.register(DEFAULT_HOTKEYS.CONTRAST_DOWN, callbacks.contrastDown, 'Decrease contrast');
  hotkeyManager.register(DEFAULT_HOTKEYS.SATURATION_UP, callbacks.saturationUp, 'Increase saturation');
  hotkeyManager.register(DEFAULT_HOTKEYS.SATURATION_DOWN, callbacks.saturationDown, 'Decrease saturation');
  hotkeyManager.register(DEFAULT_HOTKEYS.ADD_NOISE, callbacks.addNoise, 'Add noise');
  hotkeyManager.register(DEFAULT_HOTKEYS.APPLY_BLUR, callbacks.applyBlur, 'Apply blur');
  hotkeyManager.register(DEFAULT_HOTKEYS.SHARPEN, callbacks.sharpen, 'Sharpen image');
  hotkeyManager.register(DEFAULT_HOTKEYS.RANDOM_AUGMENT, callbacks.randomAugment, 'Random augmentation');
  
  // ROI hotkeys
  hotkeyManager.register(DEFAULT_HOTKEYS.CLEAR_ROI, callbacks.clearROI, 'Clear ROI');
  hotkeyManager.register(DEFAULT_HOTKEYS.RESET_ROI, callbacks.resetROI, 'Reset ROI');
  
  // Export hotkeys
  hotkeyManager.register(DEFAULT_HOTKEYS.EXPORT_DATASET, callbacks.exportDataset, 'Export dataset');
  hotkeyManager.register(DEFAULT_HOTKEYS.UPLOAD_TO_DRIVE, callbacks.uploadToDrive, 'Upload to Google Drive');
  
  // Utility hotkeys
  hotkeyManager.register(DEFAULT_HOTKEYS.TOGGLE_LIGHTING_WARNINGS, callbacks.toggleLightingWarnings, 'Toggle lighting warnings');
  hotkeyManager.register(DEFAULT_HOTKEYS.HELP, callbacks.showHelp, 'Show help');
}

// Helper function to format hotkey for display
export function formatHotkey(key) {
  return key
    .split('+')
    .map(part => {
      switch (part) {
        case 'ctrl': return 'Ctrl';
        case 'meta': return '⌘';
        case 'alt': return 'Alt';
        case 'shift': return 'Shift';
        case 'space': return 'Space';
        case 'enter': return 'Enter';
        case 'escape': return 'Esc';
        case 'tab': return 'Tab';
        case 'backspace': return 'Backspace';
        case 'delete': return 'Delete';
        case 'up': return '↑';
        case 'down': return '↓';
        case 'left': return '←';
        case 'right': return '→';
        default: return part.toUpperCase();
      }
    })
    .join(' + ');
}

// Helper function to check if hotkeys are enabled
export function isHotkeysEnabled() {
  return hotkeyManager.isEnabled;
}

// Helper function to toggle hotkeys
export function toggleHotkeys() {
  hotkeyManager.setEnabled(!hotkeyManager.isEnabled);
  return hotkeyManager.isEnabled;
}
