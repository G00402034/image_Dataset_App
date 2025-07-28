import React, { useState, useRef, useEffect } from 'react';

const ROISelector = ({ onROIChange, isActive = true }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [roi, setRoi] = useState(null);
  const [startPoint, setStartPoint] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    // Set canvas size to match display size
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw ROI if exists
    if (roi) {
      drawROI(ctx, roi);
    }
  }, [roi]);

  const drawROI = (ctx, roiData) => {
    const { x, y, width, height } = roiData;
    
    // Draw semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Clear the ROI area
    ctx.clearRect(x, y, width, height);
    
    // Draw ROI border
    ctx.strokeStyle = '#007bff';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(x, y, width, height);
    
    // Draw corner handles
    const handleSize = 8;
    ctx.fillStyle = '#007bff';
    ctx.setLineDash([]);
    
    // Top-left
    ctx.fillRect(x - handleSize/2, y - handleSize/2, handleSize, handleSize);
    // Top-right
    ctx.fillRect(x + width - handleSize/2, y - handleSize/2, handleSize, handleSize);
    // Bottom-left
    ctx.fillRect(x - handleSize/2, y + height - handleSize/2, handleSize, handleSize);
    // Bottom-right
    ctx.fillRect(x + width - handleSize/2, y + height - handleSize/2, handleSize, handleSize);
    
    // Draw center crosshair
    ctx.strokeStyle = '#007bff';
    ctx.lineWidth = 1;
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    ctx.beginPath();
    ctx.moveTo(centerX - 10, centerY);
    ctx.lineTo(centerX + 10, centerY);
    ctx.moveTo(centerX, centerY - 10);
    ctx.lineTo(centerX, centerY + 10);
    ctx.stroke();
  };

  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const isNearHandle = (point, handleX, handleY) => {
    const handleSize = 8;
    return Math.abs(point.x - handleX) < handleSize && Math.abs(point.y - handleY) < handleSize;
  };

  const getHandleAtPoint = (point) => {
    if (!roi) return null;
    
    const { x, y, width, height } = roi;
    const handles = [
      { x: x, y: y, type: 'top-left' },
      { x: x + width, y: y, type: 'top-right' },
      { x: x, y: y + height, type: 'bottom-left' },
      { x: x + width, y: y + height, type: 'bottom-right' }
    ];
    
    for (const handle of handles) {
      if (isNearHandle(point, handle.x, handle.y)) {
        return handle.type;
      }
    }
    
    return null;
  };

  const isInsideROI = (point) => {
    if (!roi) return false;
    return point.x >= roi.x && point.x <= roi.x + roi.width &&
           point.y >= roi.y && point.y <= roi.y + roi.height;
  };

  const handleMouseDown = (e) => {
    if (!isActive) return;
    
    const point = getMousePos(e);
    
    if (roi) {
      const handle = getHandleAtPoint(point);
      if (handle) {
        // Resize ROI
        setIsDrawing(true);
        setStartPoint({ ...point, handle });
        return;
      }
      
      if (isInsideROI(point)) {
        // Move ROI
        setIsDragging(true);
        setDragOffset({
          x: point.x - roi.x,
          y: point.y - roi.y
        });
        return;
      }
    }
    
    // Start drawing new ROI
    setIsDrawing(true);
    setStartPoint(point);
    setRoi(null);
  };

  const handleMouseMove = (e) => {
    if (!isActive || !isDrawing) return;
    
    const point = getMousePos(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (startPoint && startPoint.handle) {
      // Resize existing ROI
      const newRoi = { ...roi };
      const { handle } = startPoint;
      
      switch (handle) {
        case 'top-left':
          newRoi.width = roi.x + roi.width - point.x;
          newRoi.height = roi.y + roi.height - point.y;
          newRoi.x = point.x;
          newRoi.y = point.y;
          break;
        case 'top-right':
          newRoi.width = point.x - roi.x;
          newRoi.height = roi.y + roi.height - point.y;
          newRoi.y = point.y;
          break;
        case 'bottom-left':
          newRoi.width = roi.x + roi.width - point.x;
          newRoi.height = point.y - roi.y;
          newRoi.x = point.x;
          break;
        case 'bottom-right':
          newRoi.width = point.x - roi.x;
          newRoi.height = point.y - roi.y;
          break;
      }
      
      // Ensure minimum size
      if (newRoi.width > 20 && newRoi.height > 20) {
        setRoi(newRoi);
        onROIChange(newRoi);
      }
    } else if (isDragging && roi) {
      // Move ROI
      const newRoi = {
        ...roi,
        x: point.x - dragOffset.x,
        y: point.y - dragOffset.y
      };
      
      // Keep ROI within canvas bounds
      newRoi.x = Math.max(0, Math.min(newRoi.x, canvas.width - newRoi.width));
      newRoi.y = Math.max(0, Math.min(newRoi.y, canvas.height - newRoi.height));
      
      setRoi(newRoi);
      onROIChange(newRoi);
    } else if (startPoint && !startPoint.handle) {
      // Draw new ROI
      const newRoi = {
        x: Math.min(startPoint.x, point.x),
        y: Math.min(startPoint.y, point.y),
        width: Math.abs(point.x - startPoint.x),
        height: Math.abs(point.y - startPoint.y)
      };
      
      // Only draw if ROI is large enough
      if (newRoi.width > 20 && newRoi.height > 20) {
        setRoi(newRoi);
        onROIChange(newRoi);
      }
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setIsDragging(false);
    setStartPoint(null);
  };

  const clearROI = () => {
    setRoi(null);
    onROIChange(null);
  };

  const resetROI = () => {
    if (roi) {
      const canvas = canvasRef.current;
      const newRoi = {
        x: canvas.width * 0.1,
        y: canvas.height * 0.1,
        width: canvas.width * 0.8,
        height: canvas.height * 0.8
      };
      setRoi(newRoi);
      onROIChange(newRoi);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.controls}>
        <button
          onClick={clearROI}
          style={styles.controlButton}
          title="Clear ROI"
        >
          🗑️ Clear
        </button>
        <button
          onClick={resetROI}
          style={styles.controlButton}
          title="Reset to default ROI"
        >
          🔄 Reset
        </button>
        {roi && (
          <div style={styles.roiInfo}>
            <span>ROI: {Math.round(roi.width)}×{Math.round(roi.height)}</span>
          </div>
        )}
      </div>
      
      <div style={styles.canvasContainer}>
        <canvas
          ref={canvasRef}
          style={styles.canvas}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
        {!isActive && (
          <div style={styles.disabledOverlay}>
            <span>ROI Selector Disabled</span>
          </div>
        )}
      </div>
      
      <div style={styles.instructions}>
        <p style={styles.instructionText}>
          <strong>Draw:</strong> Click and drag to create a new ROI
        </p>
        <p style={styles.instructionText}>
          <strong>Move:</strong> Click and drag inside the ROI to move it
        </p>
        <p style={styles.instructionText}>
          <strong>Resize:</strong> Drag the corner handles to resize
        </p>
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
  controls: {
    display: 'flex',
    gap: '8px',
    marginBottom: '12px',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  controlButton: {
    padding: '6px 12px',
    backgroundColor: '#ffffff',
    border: '1px solid #dee2e6',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  roiInfo: {
    fontSize: '12px',
    color: '#6c757d',
    fontWeight: '500'
  },
  canvasContainer: {
    position: 'relative',
    marginBottom: '12px'
  },
  canvas: {
    width: '100%',
    height: '200px',
    border: '1px solid #dee2e6',
    borderRadius: '4px',
    cursor: 'crosshair'
  },
  disabledOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '500'
  },
  instructions: {
    fontSize: '12px',
    color: '#6c757d'
  },
  instructionText: {
    margin: '4px 0',
    fontSize: '11px'
  }
};

export default ROISelector;