import React, { useState, useEffect } from "react";
import CameraCapture from "./CameraCapture";
import ClassManager from "./ClassManager";
import DatasetPreview from "./DatasetPreview";
import GoogleDriveIntegration from "./GoogleDriveIntegration";
import ProjectsPage from "./ProjectsPage";
import ExportModal from "./ExportModal";
import HamburgerMenu from "./HamburgerMenu";
// import MLPresets from "./MLPresets";
import CustomMLPresets from "./CustomMLPresets";
import HotkeyHelp from "./HotkeyHelp";
import Header from "./Header";
import AuthModal from "./AuthModal";
import { exportDataset } from "../utils/fileUtils";
import { googleDriveManager } from "../utils/googleDriveUtils";
import { setToken as setApiToken } from "../utils/api";

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
  const [userType, setUserType] = useState('base');
  const [currentPage, setCurrentPage] = useState('main');
  const [showExportModal, setShowExportModal] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // ML Preset state
  const [currentMLPreset, setCurrentMLPreset] = useState(null);

  useEffect(() => {
    const savedImages = localStorage.getItem('imageDataset_images');
    const savedClasses = localStorage.getItem('imageDataset_classes');
    const savedProject = localStorage.getItem('imageDataset_currentProject');
    const savedUser = localStorage.getItem('auth_user');
    const savedToken = localStorage.getItem('auth_token');
    if (savedImages) setImages(JSON.parse(savedImages));
    if (savedClasses) setClasses(JSON.parse(savedClasses));
    if (savedProject) setCurrentProject(JSON.parse(savedProject));
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
    if (savedToken) setApiToken(savedToken);
  }, []);

  useEffect(() => {
    localStorage.setItem('imageDataset_images', JSON.stringify(images));
    localStorage.setItem('imageDataset_classes', JSON.stringify(classes));
    localStorage.setItem('imageDataset_currentProject', JSON.stringify(currentProject));
  }, [images, classes, currentProject]);

  const handleAuth = (user, token) => {
    setCurrentUser(user);
    if (user) localStorage.setItem('auth_user', JSON.stringify(user));
    if (!user) localStorage.removeItem('auth_user');
    if (!token) localStorage.removeItem('auth_token');
  };

  const handleCapture = (imageSrc) => {
    const newImage = {
      id: Date.now(),
      src: imageSrc,
      className: selectedClass,
      timestamp: new Date().toISOString(),
      width: 640,
      height: 480
    };
    setImages(prev => [...prev, newImage]);
  };

  const handleAddClass = (newClass) => {
    if (newClass && !classes.includes(newClass)) {
      setClasses([...classes, newClass]);
    }
  };

  const handleDeleteClass = (classToDelete) => {
    setClasses(classes.filter(cls => cls !== classToDelete));
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

  const handleApplyMLPreset = (preset) => {
    setCurrentMLPreset(preset);
  };

  const handleClearMLPreset = () => {
    setCurrentMLPreset(null);
  };

  const handleProjectChange = (project) => {
    setCurrentProject(project);
  };

  const handleUserTypeChange = (type) => {
    setUserType(type);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleShowHotkeyHelp = () => {
    setShowHotkeyHelp(!showHotkeyHelp);
  };

  const handleShowExportModal = () => {
    setShowExportModal(!showExportModal);
  };

  if (currentPage === 'projects') {
    return (
      <ProjectsPage
        currentProject={currentProject}
        onProjectChange={handleProjectChange}
        onPageChange={handlePageChange}
        userType={userType}
        onUserTypeChange={handleUserTypeChange}
      />
    );
  }

  return (
    <div style={styles.container}>
      <Header
        currentProject={currentProject}
        onShowProjects={() => setCurrentPage('projects')}
        onShowExport={() => setShowExportModal(true)}
        onShowAuth={() => setAuthModalOpen(true)}
        isAuthenticated={!!currentUser}
      />

      {showHotkeyHelp && (
        <HotkeyHelp onClose={() => setShowHotkeyHelp(false)} />
      )}

      {showExportModal && (
        <ExportModal
          onClose={() => setShowExportModal(false)}
          images={images}
          classes={classes}
          currentProject={currentProject}
        />
      )}

      {authModalOpen && (
        <AuthModal
          onClose={() => setAuthModalOpen(false)}
          onAuth={handleAuth}
        />
      )}

      <div style={styles.mainContent} className="mainContent">
        <div style={styles.leftPanel}>
          <ClassManager
            classes={classes}
            selectedClass={selectedClass}
            onAddClass={handleAddClass}
            onDeleteClass={handleDeleteClass}
            onSelectClass={setSelectedClass}
          />
        </div>

        <div style={styles.centerPanel}>
          <div style={styles.customPresetsSection}>
            <CustomMLPresets 
              onApplyPreset={handleApplyMLPreset}
              onSavePreset={(preset) => console.log('Saved preset:', preset)}
            />
          </div>
          <CameraCapture
            onCapture={handleCapture}
            roi={roi}
            setRoi={setRoi}
            lightingWarningsEnabled={lightingWarningsEnabled}
            setLightingWarningsEnabled={setLightingWarningsEnabled}
            currentMLPreset={currentMLPreset}
            onApplyMLPreset={handleApplyMLPreset}
            onClearMLPreset={handleClearMLPreset}
          />
        </div>

        <div style={styles.rightPanel}>
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
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: 'var(--bg)',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  mainContent: {
    display: 'grid',
    gridTemplateColumns: '240px 1fr 320px',
    gap: '16px',
    padding: '16px',
    minHeight: 'calc(100vh - 56px)'
  },
  leftPanel: { display: 'flex', flexDirection: 'column', gap: '16px' },
  centerPanel: { display: 'flex', flexDirection: 'column', gap: '16px' },
  rightPanel: { display: 'flex', flexDirection: 'column' },
  customPresetsSection: {
    backgroundColor: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '8px'
  }
};

export default App;