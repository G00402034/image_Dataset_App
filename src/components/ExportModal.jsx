import React, { useState } from 'react';
import { exportDataset } from '../utils/fileUtils';

const ExportModal = ({ 
  onClose, 
  images, 
  classes, 
  currentProject 
}) => {
  const [exportFormat, setExportFormat] = useState('zip');
  const [exportOptions, setExportOptions] = useState({
    includeMetadata: true,
    includeAugmented: true,
    organizeByClass: true,
    includeROI: true
  });
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingToDrive, setIsExportingToDrive] = useState(false);

  const handleExport = async () => {
    if (images.length === 0) {
      alert('No images to export!');
      return;
    }

    setIsExporting(true);
    try {
      const projectName = currentProject?.name || 'dataset';
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const baseName = `${projectName}_${timestamp}`;

      const result = await exportDataset(
        images,
        classes,
        exportFormat,
        {
          ...exportOptions,
          filename: baseName + (exportFormat === 'zip' ? '.zip' : '.csv'),
          format: exportFormat
        }
      );

      if (!result.success) throw new Error(result.message || 'Export failed');

      alert(`Dataset exported successfully as ${baseName}.${exportFormat}`);
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportToDrive = async () => {
    if (images.length === 0) {
      alert('No images to export!');
      return;
    }
    setIsExportingToDrive(true);
    try {
      const projectName = currentProject?.name || 'dataset';
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const baseName = `${projectName}_${timestamp}`;

      // Generate ZIP in-memory
      const res = await exportDataset(images, classes, 'zip', { filename: baseName + '.zip' });
      if (!res.success) throw new Error(res.message || 'ZIP generation failed');

      // Call backend stub: in future this will upload to Drive
      const apiBase = process.env.REACT_APP_API_BASE || 'http://localhost:4000/api';
      const response = await fetch(`${apiBase}/drive/export-zip`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ filename: baseName + '.zip' }) });
      if (!response.ok) throw new Error('Drive export not implemented yet');

      alert('Sent to Drive (stub). We will complete this in the next step.');
      onClose();
    } catch (e) {
      console.error(e);
      alert(e.message || 'Export to Drive failed');
    } finally {
      setIsExportingToDrive(false);
    }
  };

  const getDatasetStats = () => {
    const totalImages = images.length;
    const classCount = classes.length;
    const augmentedImages = images.filter(img => img.augmented).length;
    const roiImages = images.filter(img => img.roi).length;

    return {
      totalImages,
      classCount,
      augmentedImages,
      roiImages
    };
  };

  const stats = getDatasetStats();

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <h3>Export Dataset</h3>
          <button 
            onClick={onClose}
            style={styles.closeButton}
          >
            ✕
          </button>
        </div>

        <div style={styles.modalContent}>
          {/* Dataset Statistics */}
          <div style={styles.statsSection}>
            <h4 style={styles.sectionTitle}>Dataset Statistics</h4>
            <div style={styles.statsGrid}>
              <div style={styles.statItem}>
                <span style={styles.statLabel}>Total Images:</span>
                <span style={styles.statValue}>{stats.totalImages}</span>
              </div>
              <div style={styles.statItem}>
                <span style={styles.statLabel}>Classes:</span>
                <span style={styles.statValue}>{stats.classCount}</span>
              </div>
              <div style={styles.statItem}>
                <span style={styles.statLabel}>Augmented:</span>
                <span style={styles.statValue}>{stats.augmentedImages}</span>
              </div>
              <div style={styles.statItem}>
                <span style={styles.statLabel}>ROI Cropped:</span>
                <span style={styles.statValue}>{stats.roiImages}</span>
              </div>
            </div>
          </div>

          {/* Export Format */}
          <div style={styles.section}>
            <h4 style={styles.sectionTitle}>Export Format</h4>
            <div style={styles.formatOptions}>
              <label style={styles.radioLabel}>
                <input
                  type="radio"
                  value="zip"
                  checked={exportFormat === 'zip'}
                  onChange={(e) => setExportFormat(e.target.value)}
                  style={styles.radio}
                />
                <span style={styles.radioText}>
                  📦 ZIP Archive (Images + Metadata)
                </span>
              </label>
              <label style={styles.radioLabel}>
                <input
                  type="radio"
                  value="csv"
                  checked={exportFormat === 'csv'}
                  onChange={(e) => setExportFormat(e.target.value)}
                  style={styles.radio}
                />
                <span style={styles.radioText}>
                  📊 CSV Metadata Only
                </span>
              </label>
            </div>
          </div>

          {/* Export Options */}
          <div style={styles.section}>
            <h4 style={styles.sectionTitle}>Export Options</h4>
            <div style={styles.optionsGrid}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={exportOptions.includeMetadata}
                  onChange={(e) => setExportOptions(prev => ({
                    ...prev,
                    includeMetadata: e.target.checked
                  }))}
                  style={styles.checkbox}
                />
                <span style={styles.checkboxText}>Include metadata (class, timestamp, etc.)</span>
              </label>
              
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={exportOptions.includeAugmented}
                  onChange={(e) => setExportOptions(prev => ({
                    ...prev,
                    includeAugmented: e.target.checked
                  }))}
                  style={styles.checkbox}
                />
                <span style={styles.checkboxText}>Include augmented images</span>
              </label>
              
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={exportOptions.organizeByClass}
                  onChange={(e) => setExportOptions(prev => ({
                    ...prev,
                    organizeByClass: e.target.checked
                  }))}
                  style={styles.checkbox}
                />
                <span style={styles.checkboxText}>Organize by class folders</span>
              </label>
              
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={exportOptions.includeROI}
                  onChange={(e) => setExportOptions(prev => ({
                    ...prev,
                    includeROI: e.target.checked
                  }))}
                  style={styles.checkbox}
                />
                <span style={styles.checkboxText}>Include ROI information</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={styles.modalActions}>
            <button 
              onClick={onClose}
              style={styles.cancelButton}
              disabled={isExporting || isExportingToDrive}
            >
              Cancel
            </button>
            <button 
              onClick={handleExportToDrive}
              disabled={isExportingToDrive || stats.totalImages === 0}
              style={{
                ...styles.exportButton,
                backgroundColor: '#10b981',
                ...(isExportingToDrive || stats.totalImages === 0 ? styles.disabledButton : {})
              }}
            >
              {isExportingToDrive ? (
                <>
                  <div style={styles.spinner}></div>
                  Exporting to Drive...
                </>
              ) : (
                'Export to Drive'
              )}
            </button>
            <button 
              onClick={handleExport}
              disabled={isExporting || stats.totalImages === 0}
              style={{
                ...styles.exportButton,
                ...(isExporting || stats.totalImages === 0 ? styles.disabledButton : {})
              }}
            >
              {isExporting ? (
                <>
                  <div style={styles.spinner}></div>
                  Exporting...
                </>
              ) : (
                'Export Dataset'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  modalOverlay: {
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
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #e9ecef'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    color: '#6c757d',
    cursor: 'pointer'
  },
  modalContent: {
    padding: '20px',
    maxHeight: '60vh',
    overflowY: 'auto'
  },
  statsSection: {
    marginBottom: '24px',
    padding: '16px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px'
  },
  section: {
    marginBottom: '24px'
  },
  sectionTitle: {
    margin: '0 0 12px 0',
    color: '#495057',
    fontSize: '16px',
    fontWeight: '600'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '12px'
  },
  statItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  statLabel: {
    color: '#6c757d',
    fontSize: '14px'
  },
  statValue: {
    color: '#495057',
    fontSize: '14px',
    fontWeight: '600'
  },
  formatOptions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '6px',
    transition: 'background-color 0.2s ease'
  },
  radio: {
    margin: 0
  },
  radioText: {
    fontSize: '14px',
    color: '#495057'
  },
  optionsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#495057'
  },
  checkbox: {
    margin: 0
  },
  checkboxText: {
    fontSize: '14px'
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    paddingTop: '20px',
    borderTop: '1px solid #e9ecef'
  },
  cancelButton: {
    padding: '10px 20px',
    backgroundColor: '#6c757d',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer'
  },
  exportButton: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  disabledButton: {
    backgroundColor: '#6c757d',
    cursor: 'not-allowed'
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid #ffffff',
    borderTop: '2px solid transparent',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  }
};

export default ExportModal; 