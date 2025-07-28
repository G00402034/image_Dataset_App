import React, { useState, useEffect } from 'react';

const ProjectManager = ({ 
  currentProject, 
  onProjectChange, 
  onProjectCreate, 
  onProjectDelete,
  userType = 'base' // 'base' or 'premium'
}) => {
  const [projects, setProjects] = useState([
    {
      id: 'default',
      name: 'Default Project',
      description: 'Your main dataset project',
      createdAt: new Date().toISOString(),
      imageCount: 0,
      classCount: 0
    }
  ]);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [newProject, setNewProject] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    // Load projects from localStorage
    const savedProjects = localStorage.getItem('imageDataset_projects');
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }
  }, []);

  useEffect(() => {
    // Save projects to localStorage
    localStorage.setItem('imageDataset_projects', JSON.stringify(projects));
  }, [projects]);

  const handleCreateProject = () => {
    if (!newProject.name.trim()) return;
    
    const project = {
      id: `project_${Date.now()}`,
      name: newProject.name,
      description: newProject.description,
      createdAt: new Date().toISOString(),
      imageCount: 0,
      classCount: 0
    };
    
    const updatedProjects = [...projects, project];
    setProjects(updatedProjects);
    onProjectCreate(project);
    setNewProject({ name: '', description: '' });
    setShowCreateModal(false);
  };

  const handleDeleteProject = (project) => {
    if (project.id === 'default') {
      alert('Cannot delete the default project');
      return;
    }
    
    setProjectToDelete(project);
    setShowDeleteModal(true);
  };

  const confirmDeleteProject = () => {
    if (!projectToDelete) return;
    
    const updatedProjects = projects.filter(p => p.id !== projectToDelete.id);
    setProjects(updatedProjects);
    
    if (currentProject?.id === projectToDelete.id) {
      onProjectChange(projects.find(p => p.id === 'default'));
    }
    
    setProjectToDelete(null);
    setShowDeleteModal(false);
  };

  const canCreateProject = userType === 'premium' || projects.length < 1;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Projects</h3>
        {canCreateProject && (
          <button
            onClick={() => setShowCreateModal(true)}
            style={styles.createButton}
            disabled={!canCreateProject}
          >
            ➕ New Project
          </button>
        )}
      </div>

      <div style={styles.projectList}>
        {projects.map((project) => (
          <div
            key={project.id}
            style={{
              ...styles.projectCard,
              ...(currentProject?.id === project.id ? styles.activeProject : {})
            }}
          >
            <div style={styles.projectInfo}>
              <h4 style={styles.projectName}>{project.name}</h4>
              <p style={styles.projectDescription}>{project.description}</p>
              <div style={styles.projectStats}>
                <span style={styles.stat}>📸 {project.imageCount} images</span>
                <span style={styles.stat}>🏷️ {project.classCount} classes</span>
              </div>
              <div style={styles.projectMeta}>
                <span style={styles.projectDate}>
                  Created: {new Date(project.createdAt).toLocaleDateString()}
                </span>
                {project.id === 'default' && (
                  <span style={styles.defaultBadge}>Default</span>
                )}
              </div>
            </div>
            
            <div style={styles.projectActions}>
              <button
                onClick={() => onProjectChange(project)}
                style={{
                  ...styles.actionButton,
                  ...(currentProject?.id === project.id ? styles.activeButton : {})
                }}
              >
                {currentProject?.id === project.id ? '✓ Active' : 'Switch'}
              </button>
              
              {project.id !== 'default' && (
                <button
                  onClick={() => handleDeleteProject(project)}
                  style={{
                    ...styles.actionButton,
                    ...styles.deleteButton
                  }}
                >
                  🗑️
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {userType === 'base' && projects.length >= 1 && (
        <div style={styles.upgradeNotice}>
          <div style={styles.upgradeContent}>
            <span style={styles.upgradeIcon}>⭐</span>
            <div style={styles.upgradeText}>
              <strong>Upgrade to Premium</strong>
              <p>Create unlimited projects and access advanced features</p>
            </div>
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3>Create New Project</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                style={styles.closeButton}
              >
                ✕
              </button>
            </div>
            
            <div style={styles.modalContent}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Project Name:</label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({
                    ...newProject,
                    name: e.target.value
                  })}
                  placeholder="Enter project name"
                  style={styles.input}
                />
              </div>
              
              <div style={styles.inputGroup}>
                <label style={styles.label}>Description:</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({
                    ...newProject,
                    description: e.target.value
                  })}
                  placeholder="Enter project description"
                  style={styles.textarea}
                  rows={3}
                />
              </div>
            </div>
            
            <div style={styles.modalFooter}>
              <button
                onClick={() => setShowCreateModal(false)}
                style={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!newProject.name.trim()}
                style={{
                  ...styles.createModalButton,
                  ...(!newProject.name.trim() ? styles.disabledButton : {})
                }}
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Project Modal */}
      {showDeleteModal && projectToDelete && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3>Delete Project</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={styles.closeButton}
              >
                ✕
              </button>
            </div>
            
            <div style={styles.modalContent}>
              <p style={styles.deleteWarning}>
                Are you sure you want to delete <strong>{projectToDelete.name}</strong>?
              </p>
              <p style={styles.deleteNote}>
                This action cannot be undone. All project data will be permanently lost.
              </p>
            </div>
            
            <div style={styles.modalFooter}>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteProject}
                style={{
                  ...styles.deleteModalButton
                }}
              >
                Delete Project
              </button>
            </div>
          </div>
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
    border: '1px solid #e9ecef'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  title: {
    margin: 0,
    color: '#2c3e50',
    fontSize: '18px',
    fontWeight: '600'
  },
  createButton: {
    padding: '8px 16px',
    backgroundColor: '#007bff',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  projectList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  projectCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    padding: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'all 0.2s ease'
  },
  activeProject: {
    borderColor: '#007bff',
    backgroundColor: '#f8f9ff'
  },
  projectInfo: {
    flex: 1
  },
  projectName: {
    margin: '0 0 4px 0',
    fontSize: '16px',
    fontWeight: '600',
    color: '#2c3e50'
  },
  projectDescription: {
    margin: '0 0 8px 0',
    fontSize: '12px',
    color: '#6c757d'
  },
  projectStats: {
    display: 'flex',
    gap: '12px',
    marginBottom: '8px'
  },
  stat: {
    fontSize: '11px',
    color: '#495057',
    fontWeight: '500'
  },
  projectMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  projectDate: {
    fontSize: '10px',
    color: '#6c757d'
  },
  defaultBadge: {
    fontSize: '10px',
    backgroundColor: '#28a745',
    color: '#ffffff',
    padding: '2px 6px',
    borderRadius: '10px',
    fontWeight: '500'
  },
  projectActions: {
    display: 'flex',
    gap: '8px'
  },
  actionButton: {
    padding: '6px 12px',
    backgroundColor: '#ffffff',
    border: '1px solid #dee2e6',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  activeButton: {
    backgroundColor: '#007bff',
    color: '#ffffff',
    borderColor: '#007bff'
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    color: '#ffffff',
    borderColor: '#dc3545'
  },
  upgradeNotice: {
    marginTop: '16px',
    padding: '12px',
    backgroundColor: '#fff3cd',
    border: '1px solid #ffeaa7',
    borderRadius: '6px'
  },
  upgradeContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  upgradeIcon: {
    fontSize: '20px'
  },
  upgradeText: {
    flex: 1
  },
  upgradeText: {
    flex: 1
  },
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
    maxWidth: '500px',
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
    padding: '20px'
  },
  inputGroup: {
    marginBottom: '16px'
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
  textarea: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #dee2e6',
    borderRadius: '6px',
    fontSize: '14px',
    boxSizing: 'border-box',
    resize: 'vertical'
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    padding: '20px',
    borderTop: '1px solid #e9ecef'
  },
  cancelButton: {
    padding: '8px 16px',
    backgroundColor: '#6c757d',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer'
  },
  createModalButton: {
    padding: '8px 16px',
    backgroundColor: '#007bff',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer'
  },
  deleteModalButton: {
    padding: '8px 16px',
    backgroundColor: '#dc3545',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer'
  },
  disabledButton: {
    backgroundColor: '#6c757d',
    cursor: 'not-allowed'
  },
  deleteWarning: {
    margin: '0 0 8px 0',
    fontSize: '14px',
    color: '#495057'
  },
  deleteNote: {
    margin: 0,
    fontSize: '12px',
    color: '#6c757d'
  }
};

export default ProjectManager; 