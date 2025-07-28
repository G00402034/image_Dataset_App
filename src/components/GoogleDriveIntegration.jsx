import React, { useState, useEffect } from 'react';
import { googleDriveManager, getGoogleDriveStatus } from '../utils/googleDriveUtils';

const GoogleDriveIntegration = ({ images, classes, onUploadComplete }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadMessage, setUploadMessage] = useState('');
  const [clientId, setClientId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [datasetName, setDatasetName] = useState('ImageDataset');
  const [uploadOptions, setUploadOptions] = useState({
    organizeByClass: true,
    includeMetadata: true
  });

  useEffect(() => {
    // Check initial status
    const status = getGoogleDriveStatus();
    setIsConnected(status.isAuthenticated);
  }, []);

  const handleConnect = async () => {
    if (!clientId || !apiKey) {
      setUploadMessage('Please enter both Client ID and API Key');
      return;
    }

    setUploadMessage('Connecting to Google Drive...');
    const result = await googleDriveManager.initialize(clientId, apiKey);
    
    if (result.success) {
      setIsConnected(true);
      setUploadMessage('Connected to Google Drive successfully!');
    } else {
      setUploadMessage('Failed to connect: ' + result.message);
    }
  };

  const handleDisconnect = async () => {
    await googleDriveManager.signOut();
    setIsConnected(false);
    setUploadMessage('Disconnected from Google Drive');
  };

  const handleUpload = async () => {
    if (images.length === 0) {
      setUploadMessage('No images to upload');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadMessage('Uploading dataset to Google Drive...');

    try {
      const result = await googleDriveManager.uploadDataset(images, classes, {
        datasetName,
        ...uploadOptions
      });

      if (result.success) {
        setUploadMessage(`✅ Upload successful! ${result.uploadedFiles} files uploaded to "${result.folderName}"`);
        if (onUploadComplete) {
          onUploadComplete(result);
        }
      } else {
        setUploadMessage('❌ Upload failed: ' + result.message);
      }
    } catch (error) {
      setUploadMessage('❌ Upload error: ' + error.message);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const getGoogleDriveSetupInstructions = () => (
    <div style={styles.instructions}>
      <h4 style={styles.instructionsTitle}>Google Drive Setup Instructions</h4>
      <ol style={styles.instructionsList}>
        <li>Go to the <a href="https://console.developers.google.com/" target="_blank" rel="noopener noreferrer">Google Cloud Console</a></li>
        <li>Create a new project or select an existing one</li>
        <li>Enable the Google Drive API</li>
        <li>Create credentials (OAuth 2.0 Client ID)</li>
        <li>Add your domain to authorized origins</li>
        <li>Copy the Client ID and API Key below</li>
      </ol>
      <div style={styles.note}>
        <strong>Note:</strong> For Google Colab, you can use the default credentials that are automatically available.
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Google Drive Integration</h3>
      
      {!isConnected ? (
        <div style={styles.setupSection}>
          <h4 style={styles.sectionTitle}>Connect to Google Drive</h4>
          
          {getGoogleDriveSetupInstructions()}
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Client ID:</label>
            <input
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="Enter your Google OAuth Client ID"
              style={styles.input}
            />
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>API Key:</label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Google API Key"
              style={styles.input}
            />
          </div>
          
          <button
            onClick={handleConnect}
            disabled={!clientId || !apiKey}
            style={{
              ...styles.connectButton,
              ...(!clientId || !apiKey ? styles.disabledButton : {})
            }}
          >
            🔗 Connect to Google Drive
          </button>
        </div>
      ) : (
        <div style={styles.uploadSection}>
          <div style={styles.statusBar}>
            <span style={styles.statusIndicator}>✅ Connected to Google Drive</span>
            <button
              onClick={handleDisconnect}
              style={styles.disconnectButton}
            >
              Disconnect
            </button>
          </div>
          
          <div style={styles.uploadOptions}>
            <h4 style={styles.sectionTitle}>Upload Options</h4>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Dataset Name:</label>
              <input
                type="text"
                value={datasetName}
                onChange={(e) => setDatasetName(e.target.value)}
                placeholder="Enter dataset name"
                style={styles.input}
              />
            </div>
            
            <div style={styles.checkboxGroup}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={uploadOptions.organizeByClass}
                  onChange={(e) => setUploadOptions({
                    ...uploadOptions,
                    organizeByClass: e.target.checked
                  })}
                  style={styles.checkbox}
                />
                Organize images by class folders
              </label>
              
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={uploadOptions.includeMetadata}
                  onChange={(e) => setUploadOptions({
                    ...uploadOptions,
                    includeMetadata: e.target.checked
                  })}
                  style={styles.checkbox}
                />
                Include metadata.json file
              </label>
            </div>
            
            <div style={styles.uploadStats}>
              <div style={styles.statItem}>
                <span style={styles.statLabel}>Images:</span>
                <span style={styles.statValue}>{images.length}</span>
              </div>
              <div style={styles.statItem}>
                <span style={styles.statLabel}>Classes:</span>
                <span style={styles.statValue}>{classes.length}</span>
              </div>
              <div style={styles.statItem}>
                <span style={styles.statLabel}>Assigned:</span>
                <span style={styles.statValue}>
                  {images.filter(img => img.className).length}
                </span>
              </div>
            </div>
            
            <button
              onClick={handleUpload}
              disabled={isUploading || images.length === 0}
              style={{
                ...styles.uploadButton,
                ...(isUploading || images.length === 0 ? styles.disabledButton : {})
              }}
            >
              {isUploading ? (
                <>
                  <div style={styles.spinner}></div>
                  Uploading...
                </>
              ) : (
                <>
                  ☁️ Upload to Google Drive
                </>
              )}
            </button>
          </div>
        </div>
      )}
      
      {uploadMessage && (
        <div style={{
          ...styles.message,
          ...(uploadMessage.includes('✅') ? styles.successMessage : 
               uploadMessage.includes('❌') ? styles.errorMessage : 
               styles.infoMessage)
        }}>
          {uploadMessage}
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
    fontSize: '20px',
    fontWeight: '600'
  },
  setupSection: {
    marginBottom: '20px'
  },
  sectionTitle: {
    margin: '0 0 12px 0',
    color: '#495057',
    fontSize: '16px',
    fontWeight: '500'
  },
  instructions: {
    backgroundColor: '#ffffff',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #dee2e6',
    marginBottom: '20px'
  },
  instructionsTitle: {
    margin: '0 0 12px 0',
    color: '#495057',
    fontSize: '14px',
    fontWeight: '500'
  },
  instructionsList: {
    margin: '0 0 12px 0',
    paddingLeft: '20px',
    fontSize: '13px',
    color: '#6c757d'
  },
  note: {
    backgroundColor: '#fff3cd',
    color: '#856404',
    padding: '8px 12px',
    borderRadius: '4px',
    fontSize: '12px',
    border: '1px solid #ffeaa7'
  },
  inputGroup: {
    marginBottom: '12px'
  },
  label: {
    display: 'block',
    marginBottom: '4px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#495057'
  },
  input: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #dee2e6',
    borderRadius: '6px',
    fontSize: '14px',
    boxSizing: 'border-box'
  },
  connectButton: {
    padding: '12px 24px',
    backgroundColor: '#007bff',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease'
  },
  uploadSection: {
    marginBottom: '20px'
  },
  statusBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: '#d4edda',
    color: '#155724',
    borderRadius: '8px',
    marginBottom: '16px'
  },
  statusIndicator: {
    fontWeight: '500'
  },
  disconnectButton: {
    padding: '6px 12px',
    backgroundColor: '#dc3545',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer'
  },
  uploadOptions: {
    marginBottom: '16px'
  },
  checkboxGroup: {
    marginBottom: '16px'
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
  uploadStats: {
    display: 'flex',
    gap: '16px',
    marginBottom: '16px',
    padding: '12px',
    backgroundColor: '#ffffff',
    borderRadius: '6px',
    border: '1px solid #dee2e6'
  },
  statItem: {
    textAlign: 'center'
  },
  statLabel: {
    display: 'block',
    fontSize: '12px',
    color: '#6c757d',
    marginBottom: '2px'
  },
  statValue: {
    display: 'block',
    fontSize: '18px',
    fontWeight: '600',
    color: '#007bff'
  },
  uploadButton: {
    padding: '12px 24px',
    backgroundColor: '#28a745',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease'
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
  },
  message: {
    padding: '12px 16px',
    borderRadius: '6px',
    fontSize: '14px',
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
  },
  infoMessage: {
    backgroundColor: '#d1ecf1',
    color: '#0c5460',
    border: '1px solid #bee5eb'
  }
};

export default GoogleDriveIntegration; 