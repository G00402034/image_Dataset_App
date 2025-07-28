import React, { useState, useRef, useEffect } from 'react';

const ROIOverlay = ({ webcamRef, onROIChange, isActive = true, roi, setRoi }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null);

  useEffect(() => {
    if (!isActive) {
      setRoi(null);
    }
  }, [isActive, setRoi]);

  const getMousePos = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const isNearHandle = (point, handleX, handleY) => {
    const handleSize = 12;
    return Math.abs(point.x - handleX) < handleSize && Math.abs(point.y - handleY) < handleSize;
  };

  const getHandleAtPoint = (point) => {
    if (!roi) return null;
    
    const { x, y, width, height } = roi;
    const handles = [
      { x: x, y: y, type: 'top-left' },
      { x: x + width, y: y, type: 'top-right' },
      { x: x, y: y + height, type: 'bottom-left' },
      { x: x + width, y: y + height, type: 'bottom-right' },
      { x: x + width/2, y: y, type: 'top-center' },
      { x: x + width/2, y: y + height, type: 'bottom-center' },
      { x: x, y: y + height/2, type: 'left-center' },
      { x: x + width, y: y + height/2, type: 'right-center' }
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
        setIsResizing(true);
        setResizeHandle(handle);
        setStartPoint(point);
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
    if (!isActive) return;
    
    const point = getMousePos(e);
    const rect = e.currentTarget.getBoundingClientRect();
    
    if (isResizing && roi && resizeHandle) {
      // Resize existing ROI
      const newRoi = { ...roi };
      const { handle } = resizeHandle;
      
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
        case 'top-center':
          newRoi.height = roi.y + roi.height - point.y;
          newRoi.y = point.y;
          break;
        case 'bottom-center':
          newRoi.height = point.y - roi.y;
          break;
        case 'left-center':
          newRoi.width = roi.x + roi.width - point.x;
          newRoi.x = point.x;
          break;
        case 'right-center':
          newRoi.width = point.x - roi.x;
          break;
      }
      
      // Ensure minimum size and bounds
      if (newRoi.width > 20 && newRoi.height > 20 &&
          newRoi.x >= 0 && newRoi.y >= 0 &&
          newRoi.x + newRoi.width <= rect.width &&
          newRoi.y + newRoi.height <= rect.height) {
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
      
      // Keep ROI within bounds
      newRoi.x = Math.max(0, Math.min(newRoi.x, rect.width - newRoi.width));
      newRoi.y = Math.max(0, Math.min(newRoi.y, rect.height - newRoi.height));
      
      setRoi(newRoi);
      onROIChange(newRoi);
    } else if (isDrawing && startPoint) {
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
    setIsResizing(false);
    setResizeHandle(null);
    setStartPoint(null);
  };

  const clearROI = () => {
    setRoi(null);
    onROIChange(null);
  };

  const resetROI = () => {
    const rect = webcamRef.current?.getBoundingClientRect();
    if (rect) {
      const newRoi = {
        x: rect.width * 0.1,
        y: rect.height * 0.1,
        width: rect.width * 0.8,
        height: rect.height * 0.8
      };
      setRoi(newRoi);
      onROIChange(newRoi);
    }
  };

  if (!isActive) return null;

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
      
      <div style={styles.overlayContainer}>
        <div
          style={styles.overlay}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {roi && (
            <>
              {/* Semi-transparent overlay */}
              <div style={styles.overlayMask} />
              
              {/* ROI border */}
              <div style={{
                ...styles.roiBorder,
                left: roi.x,
                top: roi.y,
                width: roi.width,
                height: roi.height
              }} />
              
              {/* Corner handles */}
              <div style={{
                ...styles.handle,
                ...styles.topLeftHandle,
                left: roi.x - 6,
                top: roi.y - 6
              }} />
              <div style={{
                ...styles.handle,
                ...styles.topRightHandle,
                left: roi.x + roi.width - 6,
                top: roi.y - 6
              }} />
              <div style={{
                ...styles.handle,
                ...styles.bottomLeftHandle,
                left: roi.x - 6,
                top: roi.y + roi.height - 6
              }} />
              <div style={{
                ...styles.handle,
                ...styles.bottomRightHandle,
                left: roi.x + roi.width - 6,
                top: roi.y + roi.height - 6
              }} />
              
              {/* Center handles */}
              <div style={{
                ...styles.handle,
                ...styles.centerHandle,
                left: roi.x + roi.width/2 - 6,
                top: roi.y - 6
              }} />
              <div style={{
                ...styles.handle,
                ...styles.centerHandle,
                left: roi.x + roi.width/2 - 6,
                top: roi.y + roi.height - 6
              }} />
              <div style={{
                ...styles.handle,
                ...styles.centerHandle,
                left: roi.x - 6,
                top: roi.y + roi.height/2 - 6
              }} />
              <div style={{
                ...styles.handle,
                ...styles.centerHandle,
                left: roi.x + roi.width - 6,
                top: roi.y + roi.height/2 - 6
              }} />
              
              {/* Center crosshair */}
              <div style={{
                ...styles.crosshair,
                left: roi.x + roi.width/2 - 10,
                top: roi.y + roi.height/2 - 1
              }} />
              <div style={{
                ...styles.crosshair,
                left: roi.x + roi.width/2 - 1,
                top: roi.y + roi.height/2 - 10,
                width: '2px',
                height: '20px'
              }} />
            </>
          )}
        </div>
      </div>
      
      <div style={styles.instructions}>
        <p style={styles.instructionText}>
          <strong>Draw:</strong> Click and drag to create a new ROI
        </p>
        <p style={styles.instructionText}>
          <strong>Move:</strong> Click and drag inside the ROI to move it
        </p>
        <p style={styles.instructionText}>
          <strong>Resize:</strong> Drag the corner or edge handles to resize
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
  overlayContainer: {
    position: 'relative',
    marginBottom: '12px'
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    cursor: 'crosshair',
    zIndex: 10
  },
  overlayMask: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    pointerEvents: 'none'
  },
  roiBorder: {
    position: 'absolute',
    border: '2px dashed #007bff',
    pointerEvents: 'none',
    zIndex: 11
  },
  handle: {
    position: 'absolute',
    width: '12px',
    height: '12px',
    backgroundColor: '#007bff',
    border: '2px solid #ffffff',
    borderRadius: '50%',
    cursor: 'pointer',
    zIndex: 12
  },
  topLeftHandle: {
    cursor: 'nw-resize'
  },
  topRightHandle: {
    cursor: 'ne-resize'
  },
  bottomLeftHandle: {
    cursor: 'sw-resize'
  },
  bottomRightHandle: {
    cursor: 'se-resize'
  },
  centerHandle: {
    cursor: 'ns-resize'
  },
  crosshair: {
    position: 'absolute',
    backgroundColor: '#007bff',
    width: '20px',
    height: '2px',
    pointerEvents: 'none',
    zIndex: 11
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

export default ROIOverlay; 