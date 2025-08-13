import React, { useEffect, useMemo, useState } from "react";
import { api } from "../utils/api";

const DatasetPreview = ({
  images: imagesProp,
  classes,
  onAssignClass,
  onDeleteImage,
  onBulkAssignClass,
  onBulkDelete,
  currentProject
}) => {
  const hasRealProject = !!(currentProject && currentProject._id);
  const projectId = currentProject?._id;

  const [filterClass, setFilterClass] = useState("all");
  const [selectedImages, setSelectedImages] = useState(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Server pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);
  const [total, setTotal] = useState(0);
  const [pageImages, setPageImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const filterParam = useMemo(() => {
    if (filterClass === 'all') return undefined;
    if (filterClass === 'unassigned') return 'unassigned';
    return filterClass;
  }, [filterClass]);

  const loadPage = async () => {
    if (!hasRealProject) return;
    try {
      setLoading(true);
      const res = await api.projects.images.list(projectId, { page, pageSize, className: filterParam });
      setTotal(res.total || 0);
      setPageImages(res.data || []);
      setSelectedImages(new Set());
    } catch (e) {
      console.error('Failed to load images page:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (hasRealProject) loadPage(); }, [hasRealProject, page, pageSize, filterParam, projectId]);

  const images = hasRealProject ? pageImages : (imagesProp || []);

  const locallyFiltered = useMemo(() => {
    if (hasRealProject) return images;
    if (!images) return [];
    if (filterClass === 'all') return images;
    if (filterClass === 'unassigned') return images.filter(img => !img.className);
    return images.filter(img => img.className === filterClass);
  }, [images, hasRealProject, filterClass]);

  const filteredImages = locallyFiltered;

  const handleImageSelect = (index) => {
    const newSelected = new Set(selectedImages);
    if (newSelected.has(index)) newSelected.delete(index); else newSelected.add(index);
    setSelectedImages(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedImages.size === filteredImages.length) setSelectedImages(new Set());
    else setSelectedImages(new Set(filteredImages.map((_, index) => index)));
  };

  const handleBulkAssign = (className) => {
    const selectedIndices = Array.from(selectedImages);
    if (hasRealProject) {
      Promise.all(selectedIndices.map((i) => api.projects.images.update(projectId, images[i]._id || images[i].id, { className })))
        .then(loadPage)
        .catch(console.error);
      setSelectedImages(new Set());
      setIsSelectionMode(false);
    } else {
      onBulkAssignClass(selectedIndices, className);
      setSelectedImages(new Set());
      setIsSelectionMode(false);
    }
  };

  const handleBulkDelete = () => {
    if (selectedImages.size === 0) return;
    if (window.confirm(`Delete ${selectedImages.size} selected images?`)) {
      const selectedIndices = Array.from(selectedImages);
      if (hasRealProject) {
        Promise.all(selectedIndices.map((i) => api.projects.images.delete(projectId, images[i]._id || images[i].id)))
          .then(loadPage)
          .catch(console.error);
        setSelectedImages(new Set());
        setIsSelectionMode(false);
      } else {
        onBulkDelete(selectedIndices);
        setSelectedImages(new Set());
        setIsSelectionMode(false);
      }
    }
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    if (isSelectionMode) setSelectedImages(new Set());
  };

  const getSelectedCount = () => selectedImages.size;

  const totalToShow = hasRealProject ? total : filteredImages.length;
  const canPrev = hasRealProject ? page > 1 : false;
  const canNext = hasRealProject ? page * pageSize < total : false;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Dataset Preview</h3>
        <div style={styles.controls}>
          <select
            value={filterClass}
            onChange={(e) => { setFilterClass(e.target.value); if (hasRealProject) setPage(1); }}
            style={styles.filterSelect}
          >
            <option value="all">All Images</option>
            <option value="unassigned">Unassigned</option>
            {classes.map((cls) => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>

          {hasRealProject && (
            <>
              <select value={pageSize} onChange={(e)=>{ setPageSize(Number(e.target.value)); setPage(1); }} style={styles.filterSelect}>
                {[12, 24, 30, 48, 60, 96].map(s=> (<option key={s} value={s}>{s}/page</option>))}
              </select>
              <button onClick={()=> setPage(p=> Math.max(1, p-1))} disabled={!canPrev} style={styles.selectionButton}>Prev</button>
              <button onClick={()=> setPage(p=> p+1)} disabled={!canNext} style={styles.selectionButton}>Next</button>
            </>
          )}
          
          <button onClick={toggleSelectionMode} style={{ ...styles.selectionButton, ...(isSelectionMode ? styles.activeSelectionButton : {}) }}>
            {isSelectionMode ? '✕ Cancel' : '☑️ Select'}
          </button>

          {isSelectionMode && (
            <>
              <button onClick={handleSelectAll} style={styles.selectionButton}>
                {selectedImages.size === filteredImages.length ? 'Deselect All' : 'Select All'}
              </button>
              <button onClick={handleBulkDelete} disabled={selectedImages.size === 0} style={styles.bulkDeleteButtonSmall}>🗑 Delete Selected</button>
            </>
          )}
        </div>
      </div>

      {loading ? (
        <div style={styles.emptyState}><div>Loading…</div></div>
      ) : images.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📸</div>
          <h4 style={styles.emptyTitle}>No images yet</h4>
          <p style={styles.emptyText}>Capture some images to get started with your dataset</p>
        </div>
      ) : (
        <div style={styles.imageGrid}>
          {filteredImages.map((img, idx) => {
            const originalIndex = idx;
            const isSelected = selectedImages.has(originalIndex);
            return (
              <div key={img._id || originalIndex} style={{ ...styles.imageCard, ...(isSelected ? styles.selectedImageCard : {}), ...(isSelectionMode ? styles.selectionModeCard : {}) }} className="imageCard">
                {isSelectionMode && (
                  <div style={styles.selectionCheckbox}>
                    <input type="checkbox" checked={isSelected} onChange={() => handleImageSelect(originalIndex)} style={styles.checkbox} />
                  </div>
                )}
                <div style={styles.imageContainer}>
                  <img src={img.src} alt={`img-${originalIndex}`} style={styles.image} onError={(e)=>{ e.currentTarget.style.display='none'; e.currentTarget.nextSibling.style.display='flex'; }} />
                  <div style={{ ...styles.imageError, display: 'none' }} className="imageError"><span>⚠️ Image failed to load</span></div>
                </div>
                <div style={styles.imageInfo}>
                  <div style={styles.imageMeta}>
                    <span style={styles.imageIndex}>#{(hasRealProject ? (page - 1) * pageSize + originalIndex + 1 : originalIndex + 1)}</span>
                    <span style={styles.imageSize}>{img.width || 'Unknown'} × {img.height || 'Unknown'}</span>
                  </div>
                  <select value={img.className || ""} onChange={async (e)=>{ if (hasRealProject) { await api.projects.images.update(projectId, img._id || img.id, { className: e.target.value }); loadPage(); } else { onAssignClass(originalIndex, e.target.value); } }} style={styles.classSelect}>
                    <option value="">Unassigned</option>
                    {classes.map((cls) => (<option key={cls} value={cls}>{cls}</option>))}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!hasRealProject && imagesProp?.length > 0 && (
        <div style={styles.summary}>
          <div style={styles.summaryStats}>
            <span style={styles.summaryStat}>📸 {imagesProp.length} total images</span>
            <span style={styles.summaryStat}>🏷️ {imagesProp.filter(img => img.className).length} assigned</span>
            <span style={styles.summaryStat}>📊 {classes.length} classes</span>
          </div>
          {filterClass !== "all" && (<div style={styles.filterInfo}>Showing {filteredImages.length} of {imagesProp.length} images</div>)}
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
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#dee2e6',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  activeSelectionButton: {
    backgroundColor: '#007bff',
    color: '#ffffff',
    borderWidth: '1px',
    borderStyle: 'solid',
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
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#e9ecef',
    borderRadius: '8px',
    overflow: 'hidden',
    transition: 'all 0.2s ease',
    position: 'relative'
  },
  selectedImageCard: {
    borderWidth: '1px',
    borderStyle: 'solid',
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
  },
  bulkDeleteButtonSmall: { padding: '6px 10px', backgroundColor: '#dc3545', color: '#ffffff', border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' },
};

export default DatasetPreview;