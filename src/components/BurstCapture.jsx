import React, { useState } from "react";

const BurstCapture = ({ onBurstCapture, isBursting }) => {
  const [burstCount, setBurstCount] = useState(5);
  const [burstInterval, setBurstInterval] = useState(200);

  const handleBurst = async () => {
    if (isBursting) return;
    
    // Validate inputs
    if (burstCount < 1 || burstCount > 50) {
      alert('Burst count must be between 1 and 50');
      return;
    }
    
    if (burstInterval < 50 || burstInterval > 2000) {
      alert('Burst interval must be between 50ms and 2000ms');
      return;
    }
    
    // Warn user if burst count is high
    if (burstCount > 20) {
      const confirmed = window.confirm(
        `Are you sure you want to capture ${burstCount} images? This may take a while and could impact performance.`
      );
      if (!confirmed) return;
    }
    
    try {
      console.log(`Starting burst capture with ${burstCount} images and ${burstInterval}ms intervals`);
      await onBurstCapture(burstCount, burstInterval);
      console.log('Burst capture completed successfully');
    } catch (error) {
      console.error('Burst capture error:', error);
      alert('Burst capture failed. Please try again.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.controls}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Count:</label>
          <input
            type="number"
            value={burstCount}
            min={1}
            max={50}
            onChange={(e) => setBurstCount(Number(e.target.value))}
            style={styles.input}
            disabled={isBursting}
          />
        </div>
        
        <div style={styles.inputGroup}>
          <label style={styles.label}>Interval (ms):</label>
          <input
            type="number"
            value={burstInterval}
            min={50}
            max={2000}
            step={50}
            onChange={(e) => setBurstInterval(Number(e.target.value))}
            style={styles.input}
            disabled={isBursting}
          />
        </div>
      </div>
      
      <button 
        onClick={handleBurst} 
        disabled={isBursting}
        style={{
          ...styles.burstButton,
          ...(isBursting ? styles.burstingButton : {})
        }}
      >
        {isBursting ? (
          <>
            <div style={styles.spinner}></div>
            Bursting... ({burstCount})
          </>
        ) : (
          <>
            📸 Burst Capture ({burstCount})
          </>
        )}
      </button>
      
      {isBursting && (
        <div style={styles.progressInfo}>
          <span style={styles.progressText}>
            Capturing {burstCount} images with {burstInterval}ms intervals...
          </span>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  controls: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  label: {
    fontSize: '12px',
    color: '#6c757d',
    fontWeight: '500'
  },
  input: {
    padding: '6px 8px',
    border: '1px solid #dee2e6',
    borderRadius: '4px',
    fontSize: '12px',
    width: '80px'
  },
  burstButton: {
    padding: '8px 16px',
    backgroundColor: '#28a745',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s ease'
  },
  burstingButton: {
    backgroundColor: '#6c757d',
    cursor: 'not-allowed'
  },
  spinner: {
    width: '12px',
    height: '12px',
    border: '2px solid #ffffff',
    borderTop: '2px solid transparent',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  progressInfo: {
    padding: '8px 12px',
    backgroundColor: '#fff3cd',
    color: '#856404',
    borderRadius: '4px',
    border: '1px solid #ffeaa7',
    fontSize: '12px'
  },
  progressText: {
    fontWeight: '500'
  }
};

export default BurstCapture;