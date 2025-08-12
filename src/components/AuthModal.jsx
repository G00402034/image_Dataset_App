import React, { useState } from 'react';
import { api } from '../utils/api';

const AuthModal = ({ onClose, onAuth }) => {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const res = mode === 'login' ? 
        await api.auth.login(form.email, form.password) :
        await api.auth.register(form.email, form.password, form.name);
      onAuth(res.user, res.token);
      onClose();
    } catch (e) {
      setError(e.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h3 style={{ margin: 0 }}>{mode === 'login' ? 'Sign in' : 'Create account'}</h3>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>
        <div style={styles.body}>
          {mode === 'register' && (
            <div style={styles.field}> 
              <label style={styles.label}>Name</label>
              <input style={styles.input} value={form.name} onChange={(e)=>setForm({...form, name: e.target.value})} />
            </div>
          )}
          <div style={styles.field}> 
            <label style={styles.label}>Email</label>
            <input style={styles.input} value={form.email} onChange={(e)=>setForm({...form, email: e.target.value})} />
          </div>
          <div style={styles.field}> 
            <label style={styles.label}>Password</label>
            <input type="password" style={styles.input} value={form.password} onChange={(e)=>setForm({...form, password: e.target.value})} />
          </div>
          {error && <div style={styles.error}>{error}</div>}
          <button onClick={handleSubmit} disabled={loading} style={styles.primaryBtn}>
            {loading ? 'Please wait…' : (mode === 'login' ? 'Sign in' : 'Create account')}
          </button>
          <button onClick={()=>setMode(mode==='login'?'register':'login')} style={styles.switchBtn}>
            {mode === 'login' ? 'Create an account' : 'Have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
  },
  modal: { background: '#fff', borderRadius: 12, width: 360, maxWidth: '90%', boxShadow: '0 10px 30px rgba(0,0,0,0.25)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottom: '1px solid #eee' },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 },
  body: { padding: 16, display: 'flex', flexDirection: 'column', gap: 10 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 12, color: '#6b7280' },
  input: { padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 14 },
  error: { color: '#b91c1c', background: '#fee2e2', border: '1px solid #fecaca', padding: 8, borderRadius: 6, fontSize: 12 },
  primaryBtn: { padding: '10px 12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 },
  switchBtn: { padding: '8px 10px', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer', fontSize: 12 }
};

export default AuthModal; 