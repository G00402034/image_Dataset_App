import React, { useState, useEffect } from "react";
import CameraCapture from "./CameraCapture";
import ClassManager from "./ClassManager";
import DatasetPreview from "./DatasetPreview";
import GoogleDriveIntegration from "./GoogleDriveIntegration";
import ProjectsPage from "./ProjectsPage";
import ExportModal from "./ExportModal";
import HamburgerMenu from "./HamburgerMenu";
import MLPresets from "./MLPresets";
import CustomMLPresets from "./CustomMLPresets";
import HotkeyHelp from "./HotkeyHelp";
import { exportDataset } from "../utils/fileUtils";
import { googleDriveManager } from "../utils/googleDriveUtils";

const App = () => {
  const [images, setImages] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [roi, setRoi] = useState(null);
  const [lightingWarningsEnabled, setLightingWarningsEnabled] = useState(true);
  const [showHotkeyHelp, setShowHotkeyHelp] = useState(false);
  const [currentProject, setCurrentProject] = useState({
    id: 'default',
    name: 'Default Project',
    description: 'Your main dataset project',
    createdAt: new Date().toISOString(),
    imageCount: 0,
    classCount: 0
  });
  const [userType, setUserType] = useState('base'); // 'base' or 'premium'
  const [currentPage, setCurrentPage] = useState('main'); // 'main' or 'projects'
  const [showExportModal, setShowExportModal] = useState(false);

  // Load data from localStorage
  useEffect(() => {
    const savedImages = localStorage.getItem('imageDataset_images');
    const savedClasses = localStorage.getItem('imageDataset_classes');
    const savedProject = localStorage.getItem('imageDataset_currentProject');
    
    if (savedImages) setImages(JSON.parse(savedImages));
    if (savedClasses) setClasses(JSON.parse(savedClasses));
    if (savedProject) setCurrentProject(JSON.parse(savedProject));
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('imageDataset_images', JSON.stringify(images));
    localStorage.setItem('imageDataset_classes', JSON.stringify(classes));
    localStorage.setItem('imageDataset_currentProject', JSON.stringify(currentProject));
  }, [images, classes, currentProject]);

  const handleCapture = (imageSrc) => {
    const newImage = {
      id: Date.now(),
      src: imageSrc,
      className: selectedClass,
      timestamp: new Date().toISOString(),
      width: 640, // Default values, will be updated with actual dimensions
      height: 480
    };
    setImages([...images, newImage]);
  };

  const handleAddClass = (newClass) => {
    if (newClass && !classes.includes(newClass)) {
      setClasses([...classes, newClass]);
    }
  };

  const handleDeleteClass = (classToDelete) => {
    setClasses(classes.filter(cls => cls !== classToDelete));
    // Remove class from all images
    setImages(images.map(img => 
      img.className === classToDelete ? { ...img, className: null } : img
    ));
  };

  const handleAssignClass = (imageIndex, className) => {
    const updatedImages = [...images];
    updatedImages[imageIndex] = {
      ...updatedImages[imageIndex],
      className: className || null
    };
    setImages(updatedImages);
  };

  const handleBulkAssignClass = (imageIndices, className) => {
    const updatedImages = [...images];
    imageIndices.forEach(index => {
      updatedImages[index] = {
        ...updatedImages[index],
        className: className || null
      };
    });
    setImages(updatedImages);
  };

  const handleDeleteImage = (imageIndex) => {
    setImages(images.filter((_, index) => index !== imageIndex));
  };

  const handleBulkDelete = (imageIndices) => {
    setImages(images.filter((_, index) => !imageIndices.includes(index)));
  };

  const handleExportComplete = (result) => {
    console.log('Export completed:', result);
  };

  const handleGoogleDriveUploadComplete = (result) => {
    console.log('Google Drive upload completed:', result);
  };

  const handleROIChange = (newRoi) => {
    setRoi(newRoi);
  };

  const handleToggleLightingWarnings = () => {
    const newState = !lightingWarningsEnabled;
    setLightingWarningsEnabled(newState);
    console.log('Lighting warnings toggled:', newState);
  };

  const handleShowHelp = () => {
    setShowHotkeyHelp(true);
  };

  const handleProjectChange = (project) => {
    setCurrentProject(project);
  };

  const handleProjectCreate = (project) => {
    setCurrentProject(project);
  };

  const handleProjectDelete = (project) => {
    // Handle project deletion if needed
    console.log('Project deleted:', project);
  };

  const handleApplyMLPreset = (presetSettings) => {
    // Apply ML preset settings to augmentation tools
    console.log('Applying ML preset:', presetSettings);
    // Show a notification to the user
    alert(`ML preset applied! Settings: ${Object.entries(presetSettings).map(([k, v]) => `${k}: ${v}`).join(', ')}`);
  };

  const handleApplyCustomPreset = (preset) => {
    // Apply custom preset settings
    console.log('Applying custom preset:', preset);
    // Show a notification to the user
    alert(`Custom preset "${preset.name}" applied! ${preset.selectedAugmentations.length} augmentations selected.`);
  };

  const handleShowExport = () => {
    setShowExportModal(true);
  };

  const handleShowProjects = () => {
    setCurrentPage('projects');
  };

  const handleBackToMain = () => {
    setCurrentPage('main');
  };

  return (
    <div style={styles.app}>
      {currentPage === 'main' ? (
        <>
          <header style={styles.header}>
            <div style={styles.headerContent}>
              <h1 style={styles.title}>Image Dataset Creator</h1>
              <div style={styles.headerControls}>
                <div style={styles.projectInfo}>
                  <span style={styles.projectName}>{currentProject.name}</span>
                  <span style={styles.projectStats}>
                    📸 {images.length} • 🏷️ {classes.length}
                  </span>
                </div>
                <HamburgerMenu
                  onShowHelp={handleShowHelp}
                  onToggleLightingWarnings={handleToggleLightingWarnings}
                  lightingWarningsEnabled={lightingWarningsEnabled}
                  onShowExport={handleShowExport}
                  onShowProjects={handleShowProjects}
                />
              </div>
            </div>
          </header>

          <div style={styles.mainContent}>
            <div style={styles.leftPanel}>
              <div style={styles.section}>
                            <CameraCapture 
              onCapture={handleCapture} 
              roi={roi}
              setRoi={setRoi}
              lightingWarningsEnabled={lightingWarningsEnabled}
              setLightingWarningsEnabled={setLightingWarningsEnabled}
            />
              </div>
            </div>

            <div style={styles.rightPanel}>
              <div style={styles.section}>
                <ClassManager
                  classes={classes}
                  onAddClass={handleAddClass}
                  onDeleteClass={handleDeleteClass}
                  selectedClass={selectedClass}
                  onSelectClass={setSelectedClass}
                />
              </div>

              <div style={styles.section}>
                <MLPresets onApplyPreset={handleApplyMLPreset} />
              </div>

              <div style={styles.section}>
                <CustomMLPresets 
                  onApplyPreset={handleApplyCustomPreset}
                  onSavePreset={(preset) => console.log('Save preset:', preset)}
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
                  onAssignClass={handleAssignClass}
                  onDeleteImage={handleDeleteImage}
                  onBulkAssignClass={handleBulkAssignClass}
                  onBulkDelete={handleBulkDelete}
                />
              </div>
            </div>
          </div>
        </>
      ) : (
        <ProjectsPage
          projects={[currentProject]} // For now, just the current project
          currentProject={currentProject}
          onProjectChange={handleProjectChange}
          onProjectCreate={handleProjectCreate}
          onProjectDelete={handleProjectDelete}
          onBackToMain={handleBackToMain}
        />
      )}

      <HotkeyHelp
        isVisible={showHotkeyHelp}
        onClose={() => setShowHotkeyHelp(false)}
      />

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        images={images}
        classes={classes}
        currentProject={currentProject}
      />
    </div>
  );
};

const styles = {
  app: {
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e9ecef',
    padding: '16px 0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },
  headerContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    margin: 0,
    color: '#2c3e50',
    fontSize: '24px',
    fontWeight: '700'
  },
  headerControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  projectInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '4px'
  },
  projectName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#495057'
  },
  projectStats: {
    fontSize: '12px',
    color: '#6c757d'
  },
  mainContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '20px',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
    minHeight: 'calc(100vh - 100px)'
  },
  leftPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  rightPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e9ecef',
    overflow: 'hidden'
  }
};

export default App;