import React, { useState } from "react";

const ClassManager = ({
  classes = [],
  selectedClass,
  onSelectClass,
  onAddClass,
  onRenameClass,
  onDeleteClass,
}) => {
  const [newClassName, setNewClassName] = useState("");
  const [isAddingClass, setIsAddingClass] = useState(false);

  const handleAddClass = () => {
    if (newClassName.trim() && !classes.includes(newClassName.trim())) {
      onAddClass(newClassName.trim());
      setNewClassName("");
      setIsAddingClass(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddClass();
    } else if (e.key === 'Escape') {
      setIsAddingClass(false);
      setNewClassName("");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Class Manager</h2>
      
      <div style={styles.classList}>
        {classes.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🏷️</div>
            <p style={styles.emptyText}>No classes created yet</p>
            <p style={styles.emptySubtext}>Create your first class to get started</p>
          </div>
        ) : (
          classes.map((cls) => (
            <div key={cls} style={styles.classItem}>
              <button
                style={{
                  ...styles.classButton,
                  ...(cls === selectedClass ? styles.selectedClassButton : {})
                }}
                onClick={() => onSelectClass(cls)}
              >
                <span style={styles.className}>{cls}</span>
                {cls === selectedClass && (
                  <span style={styles.selectedIndicator}>✓</span>
                )}
              </button>
              
              <div style={styles.classActions}>
                <button
                  onClick={() => onRenameClass(cls)}
                  style={styles.actionButton}
                  title="Rename class"
                >
                  ✏️
                </button>
                <button
                  onClick={() => onDeleteClass(cls)}
                  style={{...styles.actionButton, ...styles.deleteButton}}
                  title="Delete class"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isAddingClass ? (
        <div style={styles.addClassForm}>
          <input
            type="text"
            value={newClassName}
            onChange={(e) => setNewClassName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter class name..."
            style={styles.classInput}
            autoFocus
          />
          <div style={styles.formActions}>
            <button
              onClick={handleAddClass}
              disabled={!newClassName.trim() || classes.includes(newClassName.trim())}
              style={styles.addButton}
            >
              Add
            </button>
            <button
              onClick={() => {
                setIsAddingClass(false);
                setNewClassName("");
              }}
              style={styles.cancelButton}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAddingClass(true)}
          style={styles.addClassButton}
        >
          <span style={styles.addIcon}>+</span>
          Add New Class
        </button>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '20px'
  },
  title: {
    margin: '0 0 20px 0',
    color: '#2c3e50',
    fontSize: '20px',
    fontWeight: '600'
  },
  classList: {
    marginBottom: '20px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#6c757d'
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '12px'
  },
  emptyText: {
    margin: '0 0 8px 0',
    fontSize: '16px',
    fontWeight: '500'
  },
  emptySubtext: {
    margin: 0,
    fontSize: '14px',
    color: '#adb5bd'
  },
  classItem: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '8px',
    gap: '8px'
  },
  classButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    backgroundColor: '#ffffff',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#495057',
    transition: 'all 0.2s ease',
    textAlign: 'left'
  },
  selectedClassButton: {
    backgroundColor: '#007bff',
    color: '#ffffff',
    borderColor: '#007bff',
    boxShadow: '0 2px 4px rgba(0,123,255,0.3)'
  },
  className: {
    fontWeight: '500'
  },
  selectedIndicator: {
    fontSize: '16px',
    fontWeight: 'bold'
  },
  classActions: {
    display: 'flex',
    gap: '4px'
  },
  actionButton: {
    padding: '8px',
    backgroundColor: '#f8f9fa',
    border: '1px solid #dee2e6',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    transition: 'all 0.2s ease'
  },
  deleteButton: {
    backgroundColor: '#fff5f5',
    borderColor: '#feb2b2',
    color: '#c53030'
  },
  addClassForm: {
    marginTop: '16px'
  },
  classInput: {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '12px',
    boxSizing: 'border-box'
  },
  formActions: {
    display: 'flex',
    gap: '8px'
  },
  addButton: {
    padding: '8px 16px',
    backgroundColor: '#007bff',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  cancelButton: {
    padding: '8px 16px',
    backgroundColor: '#6c757d',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  addClassButton: {
    width: '100%',
    padding: '12px 16px',
    backgroundColor: '#f8f9fa',
    border: '2px dashed #dee2e6',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#6c757d',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s ease'
  },
  addIcon: {
    fontSize: '18px',
    fontWeight: 'bold'
  }
};

export default ClassManager;