import React, { useState, useEffect } from 'react';

const ProjectsPage = ({ 
  projects, 
  currentProject, 
  onProjectChange, 
  onProjectCreate, 
  onProjectDelete,
  onBackToMain 
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [newProjectName, setNewProjectName] = useState('');

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      onProjectCreate(newProjectName.trim());
      setNewProjectName('');
      setShowCreateModal(false);
    }
  };

  const handleDeleteProject = (project) => {
    setProjectToDelete(project);
    setShowDeleteModal(true);
  };

  const confirmDeleteProject = () => {
    if (projectToDelete) {
      onProjectDelete(projectToDelete.id);
      setProjectToDelete(null);
      setShowDeleteModal(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button 
          onClick={onBackToMain}
          style={styles.backButton}
        >
          ← Back to Main
        </button>
        <h1 style={styles.title}>Project Management</h1>
      </div>

      <div style={styles.content}>
        <div style={styles.actions}>
          <button 
            onClick={() => setShowCreateModal(true)}
            style={styles.createButton}
          >
            ➕ Create New Project
          </button>
        </div>

        <div style={styles.projectsGrid}>
          {projects.map(project => (
            <div 
              key={project.id} 
              style={{
                ...styles.projectCard,
                ...(currentProject?.id === project.id ? styles.activeProject : {})
              }}
            >
              <div style={styles.projectHeader}>
                <h3 style={styles.projectTitle}>{project.name}</h3>
                {currentProject?.id === project.id && (
                  <span style={styles.activeBadge}>Active</span>
                )}
              </div>
              
              <div style={styles.projectStats}>
                <div style={styles.stat}>
                  <span style={styles.statLabel}>Images:</span>
                  <span style={styles.statValue}>{project.imageCount || 0}</span>
                </div>
                <div style={styles.stat}>
                  <span style={styles.statLabel}>Classes:</span>
                  <span style={styles.statValue}>{project.classCount || 0}</span>
                </div>
                <div style={styles.stat}>
                  <span style={styles.statLabel}>Created:</span>
                  <span style={styles.statValue}>
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div style={styles.projectActions}>
                {currentProject?.id !== project.id && (
                  <button 
                    onClick={() => onProjectChange(project)}
                    style={styles.switchButton}
                  >
                    Switch to Project
                  </button>
                )}
                {projects.length > 1 && (
                  <button 
                    onClick={() => handleDeleteProject(project)}
                    style={styles.deleteButton}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {projects.length === 0 && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📁</div>
            <h3 style={styles.emptyTitle}>No Projects Yet</h3>
            <p style={styles.emptyText}>
              Create your first project to start organizing your image datasets.
            </p>
            <button 
              onClick={() => setShowCreateModal(true)}
              style={styles.createButton}
            >
              Create First Project
            </button>
          </div>
        )}
      </div>

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
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Enter project name..."
                  style={styles.input}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateProject()}
                />
              </div>
              <div style={styles.modalActions}>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  style={styles.cancelButton}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateProject}
                  disabled={!newProjectName.trim()}
                  style={{
                    ...styles.confirmButton,
                    ...(!newProjectName.trim() ? styles.disabledButton : {})
                  }}
                >
                  Create Project
                </button>
              </div>
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
              <p style={styles.warningText}>
                Are you sure you want to delete "{projectToDelete.name}"? 
                This action cannot be undone and will permanently remove all images and classes in this project.
              </p>
              <div style={styles.modalActions}>
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  style={styles.cancelButton}
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDeleteProject}
                  style={styles.deleteConfirmButton}
                >
                  Delete Project
                </button>
              </div>
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
    maxWidth: '1200px',
    margin: '0 auto'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: '1px solid #e9ecef'
  },
  backButton: {
    padding: '10px 16px',
    backgroundColor: '#6c757d',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  title: {
    margin: 0,
    color: '#2c3e50',
    fontSize: '28px',
    fontWeight: '600'
  },
  content: {
    marginBottom: '30px'
  },
  actions: {
    marginBottom: '30px'
  },
  createButton: {
    padding: '12px 24px',
    backgroundColor: '#007bff',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  projectsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '20px'
  },
  projectCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '20px',
    border: '2px solid #e9ecef',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  activeProject: {
    borderColor: '#007bff',
    boxShadow: '0 4px 12px rgba(0,123,255,0.2)'
  },
  projectHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  projectTitle: {
    margin: 0,
    color: '#2c3e50',
    fontSize: '18px',
    fontWeight: '600'
  },
  activeBadge: {
    backgroundColor: '#28a745',
    color: '#ffffff',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500'
  },
  projectStats: {
    marginBottom: '16px'
  },
  stat: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px'
  },
  statLabel: {
    color: '#6c757d',
    fontSize: '14px'
  },
  statValue: {
    color: '#495057',
    fontSize: '14px',
    fontWeight: '500'
  },
  projectActions: {
    display: 'flex',
    gap: '8px'
  },
  switchButton: {
    padding: '8px 16px',
    backgroundColor: '#007bff',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    flex: 1
  },
  deleteButton: {
    padding: '8px 16px',
    backgroundColor: '#dc3545',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px'
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px'
  },
  emptyTitle: {
    margin: '0 0 12px 0',
    color: '#6c757d',
    fontSize: '20px',
    fontWeight: '500'
  },
  emptyText: {
    margin: '0 0 24px 0',
    color: '#6c757d',
    fontSize: '16px'
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
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    color: '#495057',
    fontSize: '14px',
    fontWeight: '500'
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #dee2e6',
    borderRadius: '6px',
    fontSize: '14px'
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end'
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
  confirmButton: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer'
  },
  deleteConfirmButton: {
    padding: '10px 20px',
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
  warningText: {
    color: '#dc3545',
    fontSize: '14px',
    lineHeight: '1.5',
    marginBottom: '20px'
  }
};

export default ProjectsPage; 