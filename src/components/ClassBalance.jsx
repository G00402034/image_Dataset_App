import React, { useMemo } from 'react';

const ClassBalance = ({ images, classes }) => {
  const distribution = useMemo(() => {
    const counts = {};
    classes.forEach(c => counts[c] = 0);
    let unassigned = 0;
    images.forEach(img => {
      if (img.className && counts.hasOwnProperty(img.className)) counts[img.className]++;
      else unassigned++;
    });
    return { counts, unassigned };
  }, [images, classes]);

  const values = Object.values(distribution.counts);
  const min = values.length ? Math.min(...values) : 0;
  const max = values.length ? Math.max(...values) : 0;
  const ratio = min > 0 ? (max / min) : (max > 0 ? Infinity : 1);
  const imbalanced = ratio > 3; // simple heuristic

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h4 style={styles.title}>Class Balance</h4>
        {imbalanced && (
          <span style={styles.alert}>⚠ Imbalance detected</span>
        )}
      </div>
      <div style={styles.bars}>
        {classes.map(cls => {
          const count = distribution.counts[cls] || 0;
          const pct = max > 0 ? Math.round((count / max) * 100) : 0;
          return (
            <div key={cls} style={styles.row}>
              <span style={styles.label}>{cls}</span>
              <div style={styles.barTrack}>
                <div style={{ ...styles.barFill, width: pct + '%'}} />
              </div>
              <span style={styles.count}>{count}</span>
            </div>
          );
        })}
      </div>
      <div style={styles.footer}>
        <span style={styles.meta}>Unassigned: {distribution.unassigned}</span>
        <span style={styles.meta}>Max/Min ratio: {ratio === Infinity ? '∞' : ratio.toFixed(2)}</span>
      </div>
    </div>
  );
};

const styles = {
  container: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 12 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text)' },
  alert: { fontSize: 12, color: '#b45309', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 999, padding: '2px 8px' },
  bars: { display: 'flex', flexDirection: 'column', gap: 6 },
  row: { display: 'flex', alignItems: 'center', gap: 8 },
  label: { width: 100, fontSize: 12, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  barTrack: { flex: 1, height: 8, background: '#e5e7eb', borderRadius: 999, overflow: 'hidden' },
  barFill: { height: '100%', background: '#2563eb' },
  count: { width: 32, textAlign: 'right', fontSize: 12, color: '#374151' },
  footer: { display: 'flex', justifyContent: 'space-between', marginTop: 8 },
  meta: { fontSize: 12, color: '#6b7280' }
};

export default ClassBalance;
