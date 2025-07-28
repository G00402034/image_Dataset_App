import React, { useState } from 'react';
import { formatHotkey, isHotkeysEnabled, toggleHotkeys } from '../utils/hotkeyManager';

const HamburgerMenu = ({ 
  onShowHelp, 
  onToggleLightingWarnings, 
  lightingWarningsEnabled,
  onShowExport,
  onShowProjects
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hotkeysEnabled, setHotkeysEnabled] = useState(isHotkeysEnabled());

  const handleToggleHotkeys = () => {
    const newState = toggleHotkeys();
    setHotkeysEnabled(newState);
  };

  const menuItems = [
    {
      id: 'projects',
      icon: '📁',
      label: 'Project Management',
      action: () => {
        onShowProjects();
        setIsOpen(false);
      }
    },
    {
      id: 'export',
      icon: '📤',
      label: 'Export Dataset',
      action: () => {
        onShowExport();
        setIsOpen(false);
      }
    },
    {
      id: 'help',
      icon: '❓',
      label: 'Help & Shortcuts',
      action: () => {
        onShowHelp();
        setIsOpen(false);
      }
    },
    {
      id: 'lighting',
      icon: '💡',
      label: 'Toggle Lighting Warnings',
      action: () => {
        onToggleLightingWarnings();
        setIsOpen(false);
      },
      status: lightingWarningsEnabled ? 'Enabled' : 'Disabled'
    },
    {
      id: 'hotkeys',
      icon: '⌨️',
      label: 'Toggle Hotkeys',
      action: () => {
        handleToggleHotkeys();
        setIsOpen(false);
      },
      status: hotkeysEnabled ? 'Enabled' : 'Disabled'
    },
    {
      id: 'settings',
      icon: '⚙️',
      label: 'Settings',
      action: () => {
        // TODO: Implement settings modal
        console.log('Settings clicked');
        setIsOpen(false);
      }
    },
    {
      id: 'about',
      icon: 'ℹ️',
      label: 'About',
      action: () => {
        // TODO: Implement about modal
        console.log('About clicked');
        setIsOpen(false);
      }
    }
  ];

  return (
    <div style={styles.container}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={styles.hamburgerButton}
        title="Menu"
      >
        <div style={styles.hamburgerIcon}>
          <span style={styles.hamburgerLine}></span>
          <span style={styles.hamburgerLine}></span>
          <span style={styles.hamburgerLine}></span>
        </div>
      </button>

      {isOpen && (
        <>
          <div style={styles.overlay} onClick={() => setIsOpen(false)} />
          <div style={styles.menu}>
            <div style={styles.menuHeader}>
              <h3 style={styles.menuTitle}>Menu</h3>
              <button
                onClick={() => setIsOpen(false)}
                style={styles.closeButton}
              >
                ✕
              </button>
            </div>
            
            <div style={styles.menuItems}>
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={item.action}
                  style={styles.menuItem}
                >
                  <div style={styles.menuItemContent}>
                    <span style={styles.menuItemIcon}>{item.icon}</span>
                    <span style={styles.menuItemLabel}>{item.label}</span>
                  </div>
                  {item.status && (
                    <span style={{
                      ...styles.menuItemStatus,
                      backgroundColor: item.status === 'Enabled' ? '#28a745' : '#6c757d'
                    }}>
                      {item.status}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div style={styles.menuFooter}>
              <div style={styles.quickShortcuts}>
                <h4 style={styles.shortcutsTitle}>Quick Shortcuts</h4>
                <div style={styles.shortcutsList}>
                  <div style={styles.shortcutItem}>
                    <kbd style={styles.shortcutKey}>{formatHotkey('space')}</kbd>
                    <span style={styles.shortcutLabel}>Capture</span>
                  </div>
                  <div style={styles.shortcutItem}>
                    <kbd style={styles.shortcutKey}>{formatHotkey('f')}</kbd>
                    <span style={styles.shortcutLabel}>Flip</span>
                  </div>
                  <div style={styles.shortcutItem}>
                    <kbd style={styles.shortcutKey}>{formatHotkey('r')}</kbd>
                    <span style={styles.shortcutLabel}>Rotate</span>
                  </div>
                  <div style={styles.shortcutItem}>
                    <kbd style={styles.shortcutKey}>{formatHotkey('l')}</kbd>
                    <span style={styles.shortcutLabel}>Lighting</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const styles = {
  container: {
    position: 'relative'
  },
  hamburgerButton: {
    background: 'none',
    border: 'none',
    padding: '8px',
    cursor: 'pointer',
    borderRadius: '4px',
    transition: 'all 0.2s ease'
  },
  hamburgerIcon: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
    width: '20px',
    height: '16px',
    justifyContent: 'center'
  },
  hamburgerLine: {
    width: '100%',
    height: '2px',
    backgroundColor: '#495057',
    borderRadius: '1px',
    transition: 'all 0.2s ease'
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 999
  },
  menu: {
    position: 'absolute',
    top: '100%',
    right: 0,
    width: '280px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    border: '1px solid #e9ecef',
    zIndex: 1000,
    overflow: 'hidden'
  },
  menuHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #e9ecef',
    backgroundColor: '#f8f9fa'
  },
  menuTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '600',
    color: '#2c3e50'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    color: '#6c757d',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    transition: 'all 0.2s ease'
  },
  menuItems: {
    padding: '8px 0'
  },
  menuItem: {
    width: '100%',
    background: 'none',
    border: 'none',
    padding: '12px 20px',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'all 0.2s ease',
    textAlign: 'left'
  },
  menuItemContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  menuItemIcon: {
    fontSize: '16px',
    width: '20px',
    textAlign: 'center'
  },
  menuItemLabel: {
    fontSize: '14px',
    color: '#495057',
    fontWeight: '500'
  },
  menuItemStatus: {
    fontSize: '11px',
    color: '#ffffff',
    padding: '2px 8px',
    borderRadius: '10px',
    fontWeight: '500'
  },
  menuFooter: {
    borderTop: '1px solid #e9ecef',
    padding: '16px 20px',
    backgroundColor: '#f8f9fa'
  },
  quickShortcuts: {
    marginBottom: '12px'
  },
  shortcutsTitle: {
    margin: '0 0 8px 0',
    fontSize: '12px',
    color: '#6c757d',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  shortcutsList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '8px'
  },
  shortcutItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '11px'
  },
  shortcutKey: {
    backgroundColor: '#f8f9fa',
    border: '1px solid #dee2e6',
    borderRadius: '3px',
    padding: '2px 6px',
    fontSize: '10px',
    fontFamily: 'monospace',
    fontWeight: '600',
    color: '#495057',
    minWidth: '30px',
    textAlign: 'center'
  },
  shortcutLabel: {
    color: '#6c757d',
    fontSize: '10px'
  }
};

export default HamburgerMenu; 