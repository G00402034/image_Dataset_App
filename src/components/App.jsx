import React, { useState } from "react";
import CameraCapture from "./CameraCapture";
import JSZip from "jszip";
import ClassManager from "./ClassManager";
import DatasetPreview from "./DatasetPreview";
import ExportPanel from "./ExportPanel";
import GoogleDriveIntegration from "./GoogleDriveIntegration";

const App = () => {
  const [images, setImages] = useState([]); // {src, className}
  const [classes, setClasses] = useState([]); // ["cat", "dog", ...]
  const [selectedClass, setSelectedClass] = useState("");

  // Image capture with class assignment
  const handleCapture = (imageSrc) => {
    setImages((prev) => [...prev, { src: imageSrc, className: selectedClass }]);
  };

  // Class management handlers
  const handleAddClass = (newClass) => {
    if (newClass && !classes.includes(newClass)) {
      setClasses([...classes, newClass]);
      setSelectedClass(newClass);
    }
  };
  const handleSelectClass = (cls) => setSelectedClass(cls);
  const handleRenameClass = (oldName) => {
    const newName = prompt("Rename class:", oldName);
    if (newName && newName !== oldName && !classes.includes(newName)) {
      setClasses(classes.map((c) => (c === oldName ? newName : c)));
      setImages(images.map((img) => img.className === oldName ? { ...img, className: newName } : img));
      if (selectedClass === oldName) setSelectedClass(newName);
    }
  };
  const handleDeleteClass = (cls) => {
    if (window.confirm(`Delete class '${cls}'? Images will be unassigned.`)) {
      setClasses(classes.filter((c) => c !== cls));
      setImages(images.map((img) => img.className === cls ? { ...img, className: "" } : img));
      if (selectedClass === cls) setSelectedClass("");
    }
  };

  // Assign class to image (from preview)
  const handleAssignClassToImage = (idx, className) => {
    setImages(images.map((img, i) => i === idx ? { ...img, className } : img));
  };

  // Delete image
  const handleDeleteImage = (idx) => {
    setImages(images.filter((_, i) => i !== idx));
  };

  // Export completion handler
  const handleExportComplete = (result) => {
    console.log('Export completed:', result);
  };

  // Google Drive upload completion handler
  const handleGoogleDriveUploadComplete = (result) => {
    console.log('Google Drive upload completed:', result);
  };

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <h1 style={styles.title}>Image Dataset Collection Tool</h1>
        <div style={styles.headerStats}>
          <span style={styles.stat}>📸 {images.length} Images</span>
          <span style={styles.stat}>🏷️ {classes.length} Classes</span>
          <span style={styles.stat}>✅ {images.filter(img => img.className).length} Assigned</span>
        </div>
      </header>

      <div style={styles.mainContent}>
        <div style={styles.leftPanel}>
          <div style={styles.section}>
            <ClassManager
              classes={classes}
              selectedClass={selectedClass}
              onSelectClass={handleSelectClass}
              onAddClass={handleAddClass}
              onRenameClass={handleRenameClass}
              onDeleteClass={handleDeleteClass}
            />
          </div>
          
          <div style={styles.section}>
            <CameraCapture onCapture={handleCapture} />
          </div>
        </div>

        <div style={styles.rightPanel}>
          <div style={styles.section}>
            <ExportPanel 
              images={images}
              classes={classes}
              onExportComplete={handleExportComplete}
            />
          </div>
          
          <div style={styles.section}>
            <GoogleDriveIntegration
              images={images}
              classes={classes}
              onUploadComplete={handleGoogleDriveUploadComplete}
            />
          </div>
          
          <div style={styles.section}>
            <DatasetPreview
              images={images}
              classes={classes}
              onAssignClass={handleAssignClassToImage}
              onDeleteImage={handleDeleteImage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  app: {
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  },
  header: {
    backgroundColor: '#ffffff',
    padding: '20px 32px',
    borderBottom: '1px solid #e9ecef',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },
  title: {
    margin: '0 0 12px 0',
    color: '#2c3e50',
    fontSize: '32px',
    fontWeight: '700',
    textAlign: 'center'
  },
  headerStats: {
    display: 'flex',
    justifyContent: 'center',
    gap: '24px',
    flexWrap: 'wrap'
  },
  stat: {
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  mainContent: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '32px',
    padding: '32px',
    maxWidth: '1400px',
    margin: '0 auto'
  },
  leftPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  rightPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e9ecef',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
  }
};

export default App;