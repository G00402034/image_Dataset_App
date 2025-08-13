import React from 'react';

const Header = ({ currentProject, onShowProjects, onShowExport, onShowAuth, isAuthenticated, onToggleTheme, onStartCheckout, onLogout }) => {
  return (
    <header style={styles.header}>
      <div style={styles.leftGroup}>
        <div style={styles.brand} onClick={onShowProjects} title="Projects">
          <span style={styles.logo}>📷</span>
          <span style={styles.title}>Image Dataset Studio</span>
        </div>
        {currentProject && (
          <div style={styles.projectBadge} title="Current project">
            {currentProject.name}
          </div>
        )}
      </div>

      <div style={styles.actions}>
        <button style={styles.actionBtn} onClick={onShowProjects}>
          Projects
        </button>
        <button style={styles.actionBtn} onClick={onShowExport}>
          Export
        </button>
        {onToggleTheme && (
          <button style={styles.secondaryBtn} onClick={onToggleTheme}>
            Theme
          </button>
        )}
        {onStartCheckout && (
          <button style={styles.premiumBtn} onClick={onStartCheckout}>
            Go Premium
          </button>
        )}
        {!isAuthenticated ? (
          <button style={styles.primaryBtn} onClick={onShowAuth}>
            Sign in
          </button>
        ) : (
          <div style={styles.userGroup}>
            <div style={styles.userPill}>
              <span>Account</span>
            </div>
            {onLogout && (
              <button style={styles.logoutBtn} onClick={onLogout}>Log out</button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

const styles = {
  header: { height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', borderBottom: '1px solid #e9ecef', backgroundColor: '#ffffff', position: 'sticky', top: 0, zIndex: 100 },
  leftGroup: { display: 'flex', alignItems: 'center', gap: 12 },
  brand: { display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' },
  logo: { fontSize: 18 },
  title: { fontWeight: 700, color: '#1f2937', fontSize: 14 },
  projectBadge: { marginLeft: 8, padding: '4px 10px', borderRadius: 999, background: '#f3f4f6', color: '#374151', fontSize: 12, border: '1px solid #e5e7eb' },
  actions: { display: 'flex', alignItems: 'center', gap: 8 },
  actionBtn: { padding: '6px 10px', border: '1px solid #d1d5db', background: '#fff', borderRadius: 6, fontSize: 12, cursor: 'pointer' },
  secondaryBtn: { padding: '6px 10px', border: '1px solid #93c5fd', background: '#eff6ff', color: '#2563eb', borderRadius: 6, fontSize: 12, cursor: 'pointer' },
  primaryBtn: { padding: '6px 12px', border: 'none', background: '#2563eb', color: '#fff', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 600 },
  premiumBtn: { padding: '6px 10px', border: '1px solid #111827', background: '#111827', color: '#fff', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 600 },
  userGroup: { display: 'flex', alignItems: 'center', gap: 8 },
  userPill: { padding: '6px 10px', border: '1px solid #d1d5db', background: '#fff', borderRadius: 999, fontSize: 12 },
  logoutBtn: { padding: '6px 10px', border: '1px solid #ef4444', background: '#fee2e2', color: '#991b1b', borderRadius: 6, fontSize: 12, cursor: 'pointer' }
};

export default Header; 