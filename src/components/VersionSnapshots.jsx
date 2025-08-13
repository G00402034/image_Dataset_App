import React, { useEffect, useState } from 'react';

const STORAGE_KEY = 'dataset_snapshots';

const VersionSnapshots = ({ images, classes }) => {
  const [snapshots, setSnapshots] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setSnapshots(JSON.parse(saved));
  }, []);

  const persist = (next) => { setSnapshots(next); localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); };

  const createSnapshot = () => {
    const snap = {
      id: Date.now(),
      name: `Snapshot ${new Date().toLocaleString()}`,
      images,
      classes,
      createdAt: new Date().toISOString(),
      stats: {
        total: images.length,
        assigned: images.filter(i=> i.className).length,
        classes: classes.length
      }
    };
    persist([snap, ...snapshots]);
  };

  const restoreSnapshot = (snap) => {
    if (!window.confirm(`Restore "${snap.name}"? This will overwrite current images/classes in local storage.`)) return;
    localStorage.setItem('imageDataset_images', JSON.stringify(snap.images));
    localStorage.setItem('imageDataset_classes', JSON.stringify(snap.classes));
    alert('Snapshot restored. Reload the app to apply.');
  };

  const deleteSnapshot = (id) => {
    if (!window.confirm('Delete this snapshot?')) return;
    const next = snapshots.filter(s => s.id !== id);
    persist(next);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h4 style={styles.title}>Snapshots</h4>
        <button style={styles.btn} onClick={createSnapshot}>Create Snapshot</button>
      </div>
      <div style={styles.list}>
        {snapshots.map(snap => (
          <div key={snap.id} style={styles.item}>
            <div style={styles.meta}>
              <div style={styles.name}>{snap.name}</div>
              <div style={styles.date}>{new Date(snap.createdAt).toLocaleString()}</div>
              <div style={styles.stats}>📸 {snap.stats.total} • 🏷️ {snap.stats.assigned} • 📊 {snap.stats.classes}</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={styles.restoreBtn} onClick={()=> restoreSnapshot(snap)}>Restore</button>
              <button style={styles.deleteBtn} onClick={()=> deleteSnapshot(snap.id)}>Delete</button>
            </div>
          </div>
        ))}
        {snapshots.length === 0 && <div style={styles.empty}>No snapshots yet.</div>}
      </div>
    </div>
  );
};

const styles = {
  container: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 12 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text)' },
  btn: { padding: '6px 10px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 },
  list: { marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 },
  item: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 6, padding: 8 },
  meta: { display: 'flex', flexDirection: 'column' },
  name: { fontSize: 13, color: '#111827', fontWeight: 600 },
  date: { fontSize: 12, color: '#6b7280' },
  stats: { fontSize: 12, color: '#374151' },
  restoreBtn: { padding: '6px 10px', background: '#111827', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 },
  empty: { fontSize: 12, color: '#6b7280' },
  deleteBtn: { padding: '6px 10px', background: '#fee2e2', color: '#991b1b', border: '1px solid #ef4444', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }
};

export default VersionSnapshots;
