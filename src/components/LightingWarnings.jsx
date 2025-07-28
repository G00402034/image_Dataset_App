import React, { useState, useEffect, useRef } from 'react';

const LightingWarnings = ({ webcamRef, isEnabled = true, onWarningChange }) => {
  const [lightingStatus, setLightingStatus] = useState({
    overall: 'good',
    brightness: 0,
    contrast: 0,
    shadows: 0,
    highlights: 0,
    warnings: []
  });
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const canvasRef = useRef(null);
  const analysisIntervalRef = useRef(null);

  useEffect(() => {
    if (isEnabled && webcamRef?.current) {
      startAnalysis();
    } else {
      stopAnalysis();
    }

    return () => stopAnalysis();
  }, [isEnabled, webcamRef]);

  const startAnalysis = () => {
    if (analysisIntervalRef.current) return;
    
    analysisIntervalRef.current = setInterval(() => {
      analyzeLighting();
    }, 1000); // Analyze every second
  };

  const stopAnalysis = () => {
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
    }
  };

  const analyzeLighting = () => {
    if (!webcamRef?.current || !isEnabled) return;
    
    setIsAnalyzing(true);
    
    try {
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) return;

      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        // Set canvas size to match image
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw image to canvas
        ctx.drawImage(img, 0, 0);
        
        // Get image data for analysis
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        const analysis = performLightingAnalysis(data, canvas.width, canvas.height);
        setLightingStatus(analysis);
        
        if (onWarningChange) {
          onWarningChange(analysis);
        }
        
        setIsAnalyzing(false);
      };
      
      img.src = imageSrc;
    } catch (error) {
      console.error('Lighting analysis error:', error);
      setIsAnalyzing(false);
    }
  };

  const performLightingAnalysis = (data, width, height) => {
    let totalBrightness = 0;
    let totalContrast = 0;
    let darkPixels = 0;
    let brightPixels = 0;
    let totalPixels = data.length / 4;
    
    // Calculate brightness and identify dark/bright areas
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Calculate perceived brightness (luminance)
      const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
      totalBrightness += brightness;
      
      // Count dark and bright pixels
      if (brightness < 50) darkPixels++;
      if (brightness > 200) brightPixels++;
    }
    
    const avgBrightness = totalBrightness / totalPixels;
    const darkPercentage = (darkPixels / totalPixels) * 100;
    const brightPercentage = (brightPixels / totalPixels) * 100;
    
    // Calculate contrast (standard deviation of brightness)
    let variance = 0;
    for (let i = 0; i < data.length; i += 4) {
      const brightness = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      variance += Math.pow(brightness - avgBrightness, 2);
    }
    const contrast = Math.sqrt(variance / totalPixels);
    
    // Determine overall status and warnings
    const warnings = [];
    let overallStatus = 'good';
    
    if (avgBrightness < 80) {
      warnings.push('Low overall brightness');
      overallStatus = 'warning';
    } else if (avgBrightness > 180) {
      warnings.push('High overall brightness');
      overallStatus = 'warning';
    }
    
    if (darkPercentage > 30) {
      warnings.push('Too many dark areas');
      overallStatus = 'warning';
    }
    
    if (brightPercentage > 40) {
      warnings.push('Too many bright areas');
      overallStatus = 'warning';
    }
    
    if (contrast < 30) {
      warnings.push('Low contrast');
      overallStatus = 'warning';
    } else if (contrast > 80) {
      warnings.push('High contrast');
      overallStatus = 'warning';
    }
    
    if (warnings.length === 0) {
      overallStatus = 'good';
    } else if (warnings.length >= 3) {
      overallStatus = 'critical';
    }
    
    return {
      overall: overallStatus,
      brightness: Math.round(avgBrightness),
      contrast: Math.round(contrast),
      shadows: Math.round(darkPercentage),
      highlights: Math.round(brightPercentage),
      warnings
    };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'good': return '#28a745';
      case 'warning': return '#ffc107';
      case 'critical': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'good': return '✅';
      case 'warning': return '⚠️';
      case 'critical': return '🚨';
      default: return '❓';
    }
  };

  const getBrightnessColor = (brightness) => {
    if (brightness < 80) return '#dc3545';
    if (brightness > 180) return '#ffc107';
    return '#28a745';
  };

  const getContrastColor = (contrast) => {
    if (contrast < 30) return '#dc3545';
    if (contrast > 80) return '#ffc107';
    return '#28a745';
  };

  if (!isEnabled) {
    return (
      <div style={styles.container}>
        <div style={styles.disabledState}>
          <span style={styles.disabledIcon}>🔇</span>
          <span style={styles.disabledText}>Lighting warnings disabled</span>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Lighting Analysis</h3>
        <div style={{
          ...styles.statusIndicator,
          backgroundColor: getStatusColor(lightingStatus.overall)
        }}>
          {getStatusIcon(lightingStatus.overall)}
          <span style={styles.statusText}>
            {lightingStatus.overall.toUpperCase()}
          </span>
        </div>
      </div>

      <div style={styles.metrics}>
        <div style={styles.metric}>
          <span style={styles.metricLabel}>Brightness:</span>
          <span style={{
            ...styles.metricValue,
            color: getBrightnessColor(lightingStatus.brightness)
          }}>
            {lightingStatus.brightness}
          </span>
        </div>
        
        <div style={styles.metric}>
          <span style={styles.metricLabel}>Contrast:</span>
          <span style={{
            ...styles.metricValue,
            color: getContrastColor(lightingStatus.contrast)
          }}>
            {lightingStatus.contrast}
          </span>
        </div>
        
        <div style={styles.metric}>
          <span style={styles.metricLabel}>Shadows:</span>
          <span style={styles.metricValue}>
            {lightingStatus.shadows}%
          </span>
        </div>
        
        <div style={styles.metric}>
          <span style={styles.metricLabel}>Highlights:</span>
          <span style={styles.metricValue}>
            {lightingStatus.highlights}%
          </span>
        </div>
      </div>

      {lightingStatus.warnings.length > 0 && (
        <div style={styles.warnings}>
          <h4 style={styles.warningsTitle}>Warnings:</h4>
          {lightingStatus.warnings.map((warning, index) => (
            <div key={index} style={styles.warning}>
              <span style={styles.warningIcon}>⚠️</span>
              <span style={styles.warningText}>{warning}</span>
            </div>
          ))}
        </div>
      )}

      {lightingStatus.overall === 'good' && (
        <div style={styles.goodLighting}>
          <span style={styles.goodIcon}>✅</span>
          <span style={styles.goodText}>Good lighting conditions</span>
        </div>
      )}

      {isAnalyzing && (
        <div style={styles.analyzing}>
          <div style={styles.spinner}></div>
          <span style={styles.analyzingText}>Analyzing...</span>
        </div>
      )}

      <canvas ref={canvasRef} style={styles.hiddenCanvas} />
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
  statusIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '20px',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: '600'
  },
  statusText: {
    fontSize: '11px'
  },
  metrics: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    marginBottom: '16px'
  },
  metric: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    backgroundColor: '#ffffff',
    borderRadius: '6px',
    border: '1px solid #dee2e6'
  },
  metricLabel: {
    fontSize: '12px',
    color: '#6c757d',
    fontWeight: '500'
  },
  metricValue: {
    fontSize: '14px',
    fontWeight: '600'
  },
  warnings: {
    marginBottom: '16px'
  },
  warningsTitle: {
    margin: '0 0 8px 0',
    fontSize: '14px',
    color: '#495057',
    fontWeight: '500'
  },
  warning: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 8px',
    backgroundColor: '#fff3cd',
    color: '#856404',
    borderRadius: '4px',
    marginBottom: '4px',
    fontSize: '12px'
  },
  warningIcon: {
    fontSize: '12px'
  },
  warningText: {
    flex: 1
  },
  goodLighting: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    backgroundColor: '#d4edda',
    color: '#155724',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500'
  },
  goodIcon: {
    fontSize: '14px'
  },
  goodText: {
    flex: 1
  },
  analyzing: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
    borderRadius: '6px',
    fontSize: '12px'
  },
  spinner: {
    width: '12px',
    height: '12px',
    border: '2px solid #1976d2',
    borderTop: '2px solid transparent',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  analyzingText: {
    flex: 1
  },
  disabledState: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px',
    backgroundColor: '#f8f9fa',
    color: '#6c757d',
    borderRadius: '6px',
    fontSize: '12px'
  },
  disabledIcon: {
    fontSize: '14px'
  },
  disabledText: {
    flex: 1
  },
  hiddenCanvas: {
    display: 'none'
  }
};

export default LightingWarnings;
