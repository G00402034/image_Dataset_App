import React, { useState } from 'react';
import { exportDataset } from '../utils/fileUtils';

const ExportPanel = ({ images, classes, onExportComplete }) => {
  const [exportFormat, setExportFormat] = useState('zip');
  const [exportOptions, setExportOptions] = useState({
    includeMetadata: true,
    organizeByClass: true,
    compressionLevel: 6
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState('');

  const handleExport = async () => {
    setIsExporting(true);
    setExportMessage('');
    
    try {
      const result = await exportDataset(images, classes, exportFormat, exportOptions);
      setExportMessage(result.message);
      
      if (result.success && onExportComplete) {
        onExportComplete(result);
      }
    } catch (error) {
      setExportMessage('Export failed: ' + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  const getClassDistribution = () => {
    const distribution = {};
    classes.forEach(cls => {
      distribution[cls] = images.filter(img => img.className === cls).length;
    });
    return distribution;
  };

  const totalImages = images.length;
  const classDistribution = getClassDistribution();

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Export Dataset</h2>
      
      {/* Export Statistics */}
      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{totalImages}</div>
          <div style={styles.statLabel}>Total Images</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{classes.length}</div>
          <div style={styles.statLabel}>Classes</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>
            {images.filter(img => img.className).length}
          </div>
          <div style={styles.statLabel}>Assigned</div>
        </div>
      </div>

      {/* Class Distribution */}
      {classes.length > 0 && (
        <div style={styles.distributionContainer}>
          <h4 style={styles.subtitle}>Class Distribution</h4>
          <div style={styles.distributionGrid}>
            {classes.map(cls => (
              <div key={cls} style={styles.distributionItem}>
                <span style={styles.className}>{cls}</span>
                <span style={styles.classCount}>{classDistribution[cls]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Export Options */}
      <div style={styles.optionsContainer}>
        <h4 style={styles.subtitle}>Export Options</h4>
        
        <div style={styles.optionGroup}>
          <label style={styles.label}>Format:</label>
          <div style={styles.radioGroup}>
            <label style={styles.radioLabel}>
              <input
                type="radio"
                value="zip"
                checked={exportFormat === 'zip'}
                onChange={(e) => setExportFormat(e.target.value)}
                style={styles.radio}
              />
              ZIP Archive
            </label>
            <label style={styles.radioLabel}>
              <input
                type="radio"
                value="csv"
                checked={exportFormat === 'csv'}
                onChange={(e) => setExportFormat(e.target.value)}
                style={styles.radio}
              />
              CSV Metadata
            </label>
          </div>
        </div>

        {exportFormat === 'zip' && (
          <div style={styles.optionGroup}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={exportOptions.includeMetadata}
                onChange={(e) => setExportOptions({
                  ...exportOptions,
                  includeMetadata: e.target.checked
                })}
                style={styles.checkbox}
              />
              Include metadata.json
            </label>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={exportOptions.organizeByClass}
                onChange={(e) => setExportOptions({
                  ...exportOptions,
                  organizeByClass: e.target.checked
                })}
                style={styles.checkbox}
              />
              Organize by class folders
            </label>
          </div>
        )}
      </div>

      {/* Export Button */}
      <div style={styles.buttonContainer}>
        <button
          onClick={handleExport}
          disabled={isExporting || totalImages === 0}
          style={{
            ...styles.exportButton,
            ...(isExporting ? styles.exportButtonDisabled : {}),
            ...(totalImages === 0 ? styles.exportButtonDisabled : {})
          }}
        >
          {isExporting ? (
            <>
              <div style={styles.spinner}></div>
              Exporting...
            </>
          ) : (
            `Export ${exportFormat.toUpperCase()} (${totalImages} images)`
          )}
        </button>
      </div>

      {/* Export Message */}
      {exportMessage && (
        <div style={{
          ...styles.message,
          ...(exportMessage.includes('successfully') ? styles.successMessage : styles.errorMessage)
        }}>
          {exportMessage}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
    border: '1px solid #e9ecef',
    marginBottom: '20px'
  },
  title: {
    margin: '0 0 20px 0',
    color: '#2c3e50',
    fontSize: '24px',
    fontWeight: '600'
  },
  subtitle: {
    margin: '0 0 12px 0',
    color: '#495057',
    fontSize: '16px',
    fontWeight: '500'
  },
  statsContainer: {
    display: 'flex',
    gap: '16px',
    marginBottom: '24px'
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: '16px',
    borderRadius: '8px',
    textAlign: 'center',
    border: '1px solid #dee2e6',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },
  statNumber: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#007bff',
    marginBottom: '4px'
  },
  statLabel: {
    fontSize: '14px',
    color: '#6c757d',
    fontWeight: '500'
  },
  distributionContainer: {
    marginBottom: '24px'
  },
  distributionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '8px'
  },
  distributionItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    backgroundColor: '#ffffff',
    borderRadius: '6px',
    border: '1px solid #dee2e6'
  },
  className: {
    fontWeight: '500',
    color: '#495057'
  },
  classCount: {
    backgroundColor: '#007bff',
    color: '#ffffff',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600'
  },
  optionsContainer: {
    marginBottom: '24px'
  },
  optionGroup: {
    marginBottom: '16px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '500',
    color: '#495057'
  },
  radioGroup: {
    display: 'flex',
    gap: '20px'
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#495057'
  },
  radio: {
    margin: 0
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#495057',
    marginBottom: '8px'
  },
  checkbox: {
    margin: 0
  },
  buttonContainer: {
    textAlign: 'center'
  },
  exportButton: {
    backgroundColor: '#007bff',
    color: '#ffffff',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    margin: '0 auto',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(0,123,255,0.3)'
  },
  exportButtonDisabled: {
    backgroundColor: '#6c757d',
    cursor: 'not-allowed',
    boxShadow: 'none'
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid #ffffff',
    borderTop: '2px solid transparent',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  message: {
    marginTop: '16px',
    padding: '12px',
    borderRadius: '6px',
    textAlign: 'center',
    fontWeight: '500'
  },
  successMessage: {
    backgroundColor: '#d4edda',
    color: '#155724',
    border: '1px solid #c3e6cb'
  },
  errorMessage: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    border: '1px solid #f5c6cb'
  }
};

export default ExportPanel; 