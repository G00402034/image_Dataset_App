import React, { useState } from "react";

const DatasetPreview = ({
  images,
  classes,
  onAssignClass,
  onDeleteImage,
  onBulkAssignClass,
  onBulkDelete
}) => {
  const [filterClass, setFilterClass] = useState("all");
  const [selectedImages, setSelectedImages] = useState(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const filteredImages = images.filter((img) => {
    if (filterClass === "all") return true;
    if (filterClass === "unassigned") return !img.className;
    return img.className === filterClass;
  });

  const handleImageSelect = (index) => {
    const newSelected = new Set(selectedImages);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedImages(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedImages.size === filteredImages.length) {
      setSelectedImages(new Set());
    } else {
      const allIndices = filteredImages.map((_, index) => 
        images.indexOf(filteredImages[index])
      );
      setSelectedImages(new Set(allIndices));
    }
  };

  const handleBulkAssign = (className) => {
    const selectedIndices = Array.from(selectedImages);
    onBulkAssignClass(selectedIndices, className);
    setSelectedImages(new Set());
    setIsSelectionMode(false);
  };

  const handleBulkDelete = () => {
    if (selectedImages.size === 0) return;
    
    if (window.confirm(`Delete ${selectedImages.size} selected images?`)) {
      const selectedIndices = Array.from(selectedImages);
      onBulkDelete(selectedIndices);
      setSelectedImages(new Set());
      setIsSelectionMode(false);
    }
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    if (isSelectionMode) {
      setSelectedImages(new Set());
    }
  };

  const getSelectedCount = () => selectedImages.size;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Dataset Preview</h3>
        <div style={styles.controls}>
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="all">All Images</option>
            <option value="unassigned">Unassigned</option>
            {classes.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
          
          <button
            onClick={toggleSelectionMode}
            style={{
              ...styles.selectionButton,
              ...(isSelectionMode ? styles.activeSelectionButton : {})
            }}
          >
            {isSelectionMode ? '✕ Cancel' : '☑️ Select'}
          </button>
        </div>
      </div>

      {isSelectionMode && (
        <div style={styles.bulkActions}>
          <div style={styles.bulkInfo}>
            <span style={styles.selectedCount}>
              {getSelectedCount()} selected
            </span>
            <button
              onClick={handleSelectAll}
              style={styles.selectAllButton}
            >
              {selectedImages.size === filteredImages.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          
          <div style={styles.bulkControls}>
            <select
              onChange={(e) => handleBulkAssign(e.target.value)}
              style={styles.bulkAssignSelect}
              defaultValue=""
            >
              <option value="" disabled>Assign to class...</option>
              {classes.map((cls) => (
                <option key={cls} value={cls}>
                  Assign to {cls}
                </option>
              ))}
            </select>
            
            <button
              onClick={handleBulkDelete}
              disabled={selectedImages.size === 0}
              style={{
                ...styles.bulkDeleteButton,
                ...(selectedImages.size === 0 ? styles.disabledButton : {})
              }}
            >
              🗑️ Delete Selected
            </button>
          </div>
        </div>
      )}

      {images.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📸</div>
          <h4 style={styles.emptyTitle}>No images yet</h4>
          <p style={styles.emptyText}>
            Capture some images to get started with your dataset
          </p>
        </div>
      ) : filteredImages.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>🔍</div>
          <h4 style={styles.emptyTitle}>No images match filter</h4>
          <p style={styles.emptyText}>
            Try changing the filter or capture more images
          </p>
        </div>
      ) : (
        <div style={styles.imageGrid}>
          {filteredImages.map((img, idx) => {
            const originalIndex = images.indexOf(img);
            const isSelected = selectedImages.has(originalIndex);
            
            return (
              <div
                key={originalIndex}
                style={{
                  ...styles.imageCard,
                  ...(isSelected ? styles.selectedImageCard : {}),
                  ...(isSelectionMode ? styles.selectionModeCard : {})
                }}
                className="imageCard"
              >
                {isSelectionMode && (
                  <div style={styles.selectionCheckbox}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleImageSelect(originalIndex)}
                      style={styles.checkbox}
                    />
                  </div>
                )}
                
                <div style={styles.imageContainer}>
                  <img 
                    src={img.src} 
                    alt={`img-${originalIndex}`} 
                    style={styles.image}
                    onError={(e) => {
                      console.error('Image failed to load:', img.src);
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                    onLoad={(e) => {
                      // Update image dimensions if not set
                      if (!img.width || !img.height) {
                        console.log('Image loaded with dimensions:', e.target.naturalWidth, 'x', e.target.naturalHeight);
                      }
                    }}
                  />
                  <div 
                    style={{
                      ...styles.imageError,
                      display: 'none'
                    }}
                    className="imageError"
                  >
                    <span>⚠️ Image failed to load</span>
                  </div>
                  <div style={styles.imageOverlay} className="imageOverlay">
                    {!isSelectionMode && (
                      <button
                        onClick={() => onDeleteImage(originalIndex)}
                        style={styles.deleteButton}
                        title="Delete image"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
                
                <div style={styles.imageInfo}>
                  <div style={styles.imageMeta}>
                    <span style={styles.imageIndex}>#{originalIndex + 1}</span>
                    <span style={styles.imageSize}>
                      {img.width || 'Unknown'} × {img.height || 'Unknown'}
                    </span>
                  </div>
                  
                  <select
                    value={img.className || ""}
                    onChange={(e) => onAssignClass(originalIndex, e.target.value)}
                    style={styles.classSelect}
                  >
                    <option value="">Unassigned</option>
                    {classes.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {images.length > 0 && (
        <div style={styles.summary}>
          <div style={styles.summaryStats}>
            <span style={styles.summaryStat}>
              📸 {images.length} total images
            </span>
            <span style={styles.summaryStat}>
              🏷️ {images.filter(img => img.className).length} assigned
            </span>
            <span style={styles.summaryStat}>
              📊 {classes.length} classes
            </span>
          </div>
          
          {filterClass !== "all" && (
            <div style={styles.filterInfo}>
              Showing {filteredImages.length} of {images.length} images
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '20px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '12px'
  },
  title: {
    margin: 0,
    color: '#2c3e50',
    fontSize: '18px',
    fontWeight: '600'
  },
  controls: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  },
  filterSelect: {
    padding: '6px 12px',
    border: '1px solid #dee2e6',
    borderRadius: '4px',
    fontSize: '14px',
    backgroundColor: '#ffffff'
  },
  selectionButton: {
    padding: '6px 12px',
    backgroundColor: '#ffffff',
    border: '1px solid #dee2e6',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  activeSelectionButton: {
    backgroundColor: '#007bff',
    color: '#ffffff',
    borderColor: '#007bff'
  },
  bulkActions: {
    backgroundColor: '#f8f9fa',
    border: '1px solid #e9ecef',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '20px'
  },
  bulkInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  selectedCount: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#007bff'
  },
  selectAllButton: {
    padding: '4px 8px',
    backgroundColor: '#ffffff',
    border: '1px solid #dee2e6',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer'
  },
  bulkControls: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  bulkAssignSelect: {
    padding: '6px 12px',
    border: '1px solid #dee2e6',
    borderRadius: '4px',
    fontSize: '14px',
    backgroundColor: '#ffffff'
  },
  bulkDeleteButton: {
    padding: '6px 12px',
    backgroundColor: '#dc3545',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer'
  },
  disabledButton: {
    backgroundColor: '#6c757d',
    cursor: 'not-allowed'
  },
  imageGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '20px'
  },
  imageCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e9ecef',
    borderRadius: '8px',
    overflow: 'hidden',
    transition: 'all 0.2s ease',
    position: 'relative'
  },
  selectedImageCard: {
    borderColor: '#007bff',
    backgroundColor: '#f8f9ff',
    boxShadow: '0 0 0 2px rgba(0, 123, 255, 0.25)'
  },
  selectionModeCard: {
    cursor: 'pointer'
  },
  selectionCheckbox: {
    position: 'absolute',
    top: '8px',
    left: '8px',
    zIndex: 10
  },
  checkbox: {
    width: '16px',
    height: '16px',
    cursor: 'pointer'
  },
  imageContainer: {
    position: 'relative',
    aspectRatio: '4/3',
    overflow: 'hidden'
  },
  imageError: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    color: '#6c757d',
    fontSize: '12px',
    fontWeight: '500'
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block'
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
    transition: 'opacity 0.2s ease'
  },
  deleteButton: {
    background: 'none',
    border: 'none',
    color: '#ffffff',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '50%',
    backgroundColor: 'rgba(220, 53, 69, 0.8)',
    transition: 'all 0.2s ease'
  },
  imageInfo: {
    padding: '12px'
  },
  imageMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  imageIndex: {
    fontSize: '12px',
    color: '#6c757d',
    fontWeight: '500'
  },
  imageSize: {
    fontSize: '11px',
    color: '#6c757d'
  },
  classSelect: {
    width: '100%',
    padding: '6px 8px',
    border: '1px solid #dee2e6',
    borderRadius: '4px',
    fontSize: '12px',
    backgroundColor: '#ffffff'
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#6c757d'
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px'
  },
  emptyTitle: {
    margin: '0 0 8px 0',
    fontSize: '18px',
    fontWeight: '600',
    color: '#495057'
  },
  emptyText: {
    margin: 0,
    fontSize: '14px'
  },
  summary: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #e9ecef'
  },
  summaryStats: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap'
  },
  summaryStat: {
    fontSize: '14px',
    color: '#495057',
    fontWeight: '500'
  },
  filterInfo: {
    fontSize: '12px',
    color: '#6c757d'
  }
};

export default DatasetPreview;