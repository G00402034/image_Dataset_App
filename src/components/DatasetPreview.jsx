import React, { useState } from "react";

const DatasetPreview = ({
  images = [],
  classes = [],
  onAssignClass,
  onDeleteImage,
}) => {
  const [filterClass, setFilterClass] = useState("all");

  const filteredImages = filterClass === "all" 
    ? images 
    : images.filter(img => img.className === filterClass);

  const getClassDistribution = () => {
    const distribution = {};
    classes.forEach(cls => {
      distribution[cls] = images.filter(img => img.className === cls).length;
    });
    return distribution;
  };

  const classDistribution = getClassDistribution();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Dataset Preview</h2>
        <div style={styles.controls}>
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="all">All Images ({images.length})</option>
            <option value="">Unassigned ({images.filter(img => !img.className).length})</option>
            {classes.map(cls => (
              <option key={cls} value={cls}>
                {cls} ({classDistribution[cls] || 0})
              </option>
            ))}
          </select>
        </div>
      </div>

      {images.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📸</div>
          <p style={styles.emptyText}>No images captured yet</p>
          <p style={styles.emptySubtext}>Start capturing images to see them here</p>
        </div>
      ) : filteredImages.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>🔍</div>
          <p style={styles.emptyText}>No images match the current filter</p>
          <p style={styles.emptySubtext}>Try selecting a different filter</p>
        </div>
      ) : (
        <div style={styles.imageGrid}>
          {filteredImages.map((img, idx) => {
            const originalIndex = images.indexOf(img);
            return (
              <div key={originalIndex} style={styles.imageCard} className="imageCard">
                <div style={styles.imageContainer}>
                  <img 
                    src={img.src} 
                    alt={`img-${originalIndex}`} 
                    style={styles.image}
                  />
                  <div style={styles.imageOverlay} className="imageOverlay">
                    <button
                      onClick={() => onDeleteImage(originalIndex)}
                      style={styles.deleteButton}
                      title="Delete image"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                
                <div style={styles.imageInfo}>
                  <div style={styles.classSelector}>
                    <label style={styles.classLabel}>Class:</label>
                    <select
                      value={img.className || ""}
                      onChange={e => onAssignClass(originalIndex, e.target.value)}
                      style={styles.classSelect}
                    >
                      <option value="">(none)</option>
                      {classes.map(cls => (
                        <option key={cls} value={cls}>{cls}</option>
                      ))}
                    </select>
                  </div>
                  
                  {img.className && (
                    <div style={styles.classBadge}>
                      {img.className}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary Stats */}
      {images.length > 0 && (
        <div style={styles.summary}>
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Total:</span>
            <span style={styles.summaryValue}>{images.length}</span>
          </div>
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Assigned:</span>
            <span style={styles.summaryValue}>
              {images.filter(img => img.className).length}
            </span>
          </div>
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Unassigned:</span>
            <span style={styles.summaryValue}>
              {images.filter(img => !img.className).length}
            </span>
          </div>
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
    fontSize: '20px',
    fontWeight: '600'
  },
  controls: {
    display: 'flex',
    gap: '8px'
  },
  filterSelect: {
    padding: '8px 12px',
    border: '1px solid #dee2e6',
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: '#ffffff'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#6c757d'
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '12px'
  },
  emptyText: {
    margin: '0 0 8px 0',
    fontSize: '16px',
    fontWeight: '500'
  },
  emptySubtext: {
    margin: 0,
    fontSize: '14px',
    color: '#adb5bd'
  },
  imageGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
    gap: '16px',
    marginBottom: '20px'
  },
  imageCard: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e9ecef',
    overflow: 'hidden',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    transition: 'all 0.2s ease'
  },
  imageContainer: {
    position: 'relative',
    aspectRatio: '1',
    backgroundColor: '#f8f9fa'
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block'
  },
  imageOverlay: {
    position: 'absolute',
    top: '4px',
    right: '4px',
    opacity: 0,
    transition: 'opacity 0.2s ease'
  },
  deleteButton: {
    padding: '4px 6px',
    backgroundColor: 'rgba(220, 53, 69, 0.9)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    backdropFilter: 'blur(4px)'
  },
  imageInfo: {
    padding: '8px'
  },
  classSelector: {
    marginBottom: '4px'
  },
  classLabel: {
    display: 'block',
    fontSize: '12px',
    color: '#6c757d',
    marginBottom: '2px'
  },
  classSelect: {
    width: '100%',
    padding: '4px 6px',
    border: '1px solid #dee2e6',
    borderRadius: '4px',
    fontSize: '12px',
    backgroundColor: '#ffffff'
  },
  classBadge: {
    display: 'inline-block',
    padding: '2px 6px',
    backgroundColor: '#007bff',
    color: '#ffffff',
    borderRadius: '12px',
    fontSize: '10px',
    fontWeight: '500'
  },
  summary: {
    display: 'flex',
    justifyContent: 'space-around',
    padding: '16px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #e9ecef'
  },
  summaryItem: {
    textAlign: 'center'
  },
  summaryLabel: {
    display: 'block',
    fontSize: '12px',
    color: '#6c757d',
    marginBottom: '2px'
  },
  summaryValue: {
    display: 'block',
    fontSize: '18px',
    fontWeight: '600',
    color: '#2c3e50'
  }
};

export default DatasetPreview;