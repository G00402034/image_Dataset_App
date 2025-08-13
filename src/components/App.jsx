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
import api, { setToken as setApiToken } from "../utils/api";
import ClassBalance from "./ClassBalance";
import SplitManager from "./SplitManager";
import SequenceCapture from "./SequenceCapture";
import QualityGates from "./QualityGates";
import VersionSnapshots from "./VersionSnapshots";
import LightingStatus from "./LightingStatus";

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
  const [userType, setUserType] = useState('free');
  const [currentPage, setCurrentPage] = useState('main');
  const [showExportModal, setShowExportModal] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // ML Preset state
  const [currentMLPreset, setCurrentMLPreset] = useState(null);
  const [webcamRefState, setWebcamRefState] = useState(null);

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

  useEffect(() => {
    // Handle premium success callback by path check (basic)
    if (window.location.pathname.includes('premium-success')) {
      api.billing.upgradeDev().then(()=>{
        setUserType('premium');
        alert('Premium activated');
        window.history.replaceState({}, '', '/');
      }).catch(()=>{
        window.history.replaceState({}, '', '/');
      });
    }
  }, []);

  const handleAuth = (user, token) => {
    setCurrentUser(user);
    setUserType(user?.role || 'free');
    if (user) localStorage.setItem('auth_user', JSON.stringify(user));
    if (!user) localStorage.removeItem('auth_user');
    if (!token) localStorage.removeItem('auth_token');
  };

  const handleCapture = async (imageSrc) => {
    const newImage = {
      id: Date.now(),
      src: imageSrc,
      className: selectedClass,
      timestamp: new Date().toISOString(),
      width: 640,
      height: 480
    };
    setImages(prev => [...prev, newImage]);

    // Save to MongoDB if logged in and project is not the default placeholder
    if (currentUser && (currentProject?._id || currentProject?.id !== 'default')) {
      try {
        const projectId = currentProject._id || currentProject.id;
        await api.projects.images.add(projectId, {
          src: imageSrc,
          className: selectedClass,
          timestamp: new Date().toISOString(),
          width: 640,
          height: 480
        });
      } catch (e) {
        console.error('Failed to save image to project:', e);
      }
    }
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
    setCurrentPage('main');
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

  const startCheckout = async () => {
    try {
      const successUrl = window.location.origin + '/premium-success';
      const cancelUrl = window.location.href;
      // NOTE: Replace with your real Price ID
      const priceId = process.env.REACT_APP_STRIPE_PRICE_ID || 'price_test_123';
      const { url } = await api.billing.createCheckoutSession(priceId, successUrl, cancelUrl);
      window.location.href = url;
    } catch (e) {
      alert(e.message || 'Checkout failed');
    }
  };

  const handleLogout = () => {
    setApiToken(null);
    setCurrentUser(null);
    setUserType('free');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
  };

  if (currentPage === 'projects') {
    return (
      <ProjectsPage
        currentProject={currentProject}
        onProjectChange={handleProjectChange}
        onBackToMain={() => setCurrentPage('main')}
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
        onStartCheckout={userType === 'free' ? startCheckout : undefined}
        onLogout={currentUser ? handleLogout : undefined}
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

      <div style={styles.mainGrid} className="mainContent">
        {/* Left: tools */}
        <div style={styles.leftColumn}>
          <div style={styles.card}>
            <ClassManager
              classes={classes}
              selectedClass={selectedClass}
              onAddClass={handleAddClass}
              onDeleteClass={handleDeleteClass}
              onSelectClass={setSelectedClass}
            />
          </div>
          <div style={styles.card}><ClassBalance images={images} classes={classes} /></div>
          <div style={styles.card}>
            <div style={{ marginBottom: 8, fontWeight: 600, fontSize: 14 }}>Custom Presets</div>
            <CustomMLPresets 
              onApplyPreset={(preset) => setCurrentMLPreset(preset)}
              onSavePreset={(preset) => console.log('Saved preset:', preset)}
            />
          </div>
          <div style={styles.card}><SplitManager images={images} /></div>
          <div style={styles.card}><SequenceCapture images={images} /></div>
          <div style={styles.card}><VersionSnapshots images={images} classes={classes} /></div>
        </div>

        {/* Center: camera */}
        <div style={styles.centerColumn}>
          <div style={styles.card}>
            <CameraCapture
              onCapture={handleCapture}
              roi={roi}
              setRoi={setRoi}
              lightingWarningsEnabled={lightingWarningsEnabled}
              setLightingWarningsEnabled={setLightingWarningsEnabled}
              currentMLPreset={currentMLPreset}
              onApplyMLPreset={setCurrentMLPreset}
              onClearMLPreset={() => setCurrentMLPreset(null)}
              onWebcamRef={(ref) => setWebcamRefState(ref)}
            />
          </div>
        </div>

        {/* Right: preview */}
        <div style={styles.rightColumn}>
          <div style={styles.card}>
            <DatasetPreview
              images={images}
              classes={classes}
              onAssignClass={handleAssignClass}
              onDeleteImage={handleDeleteImage}
              onBulkAssignClass={handleBulkAssignClass}
              onBulkDelete={handleBulkDelete}
              currentProject={currentProject}
            />
          </div>
        </div>
      </div>

      {/* Bottom warnings bar */}
      <div style={styles.bottomBar}>
        <div style={styles.bottomContent}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <QualityGates webcamRef={webcamRefState} />
            <LightingStatus webcamRef={webcamRefState} />
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', backgroundColor: 'var(--bg)', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  mainGrid: { display: 'grid', gridTemplateColumns: '320px 1fr 420px', gap: 16, padding: 16, minHeight: 'calc(100vh - 56px - 64px)' },
  leftColumn: { display: 'flex', flexDirection: 'column', gap: 12 },
  centerColumn: { display: 'flex', flexDirection: 'column', gap: 12 },
  rightColumn: { display: 'flex', flexDirection: 'column', gap: 12 },
  card: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 12 },
  premiumBtn: { padding: '8px 12px', background: '#111827', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' },
  bottomBar: { position: 'fixed', left: 0, right: 0, bottom: 0, background: 'var(--surface)', borderTop: '1px solid var(--border)' },
  bottomContent: { maxWidth: 1400, margin: '0 auto', padding: 8 }
};

export default App;