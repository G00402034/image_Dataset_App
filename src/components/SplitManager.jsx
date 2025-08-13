import React, { useMemo, useState } from 'react';
import JSZip from 'jszip';

const SplitManager = ({ images, onExport }) => {
  const [trainPct, setTrainPct] = useState(70);
  const [valPct, setValPct] = useState(15);
  const [testPct, setTestPct] = useState(15);
  const [organizeByClass, setOrganizeByClass] = useState(true);

  const countsByClass = useMemo(() => {
    const map = new Map();
    images.forEach(img => {
      const key = img.className || 'unassigned';
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(img);
    });
    return map;
  }, [images]);

  const splitSets = useMemo(() => {
    const train = [], val = [], test = [];
    countsByClass.forEach((arr, klass) => {
      const shuffled = [...arr].sort(() => Math.random() - 0.5);
      const t = Math.floor((trainPct / 100) * shuffled.length);
      const v = Math.floor((valPct / 100) * shuffled.length);
      train.push(...shuffled.slice(0, t));
      val.push(...shuffled.slice(t, t + v));
      test.push(...shuffled.slice(t + v));
    });
    return { train, val, test };
  }, [countsByClass, trainPct, valPct, testPct]);

  const handleExport = async () => {
    const zip = new JSZip();
    const addSet = (setName, imgs) => {
      if (organizeByClass) {
        const groups = new Map();
        imgs.forEach(img => {
          const key = img.className || 'unassigned';
          if (!groups.has(key)) groups.set(key, []);
          groups.get(key).push(img);
        });
        groups.forEach((gimgs, gname) => {
          const folder = zip.folder(`${setName}/${gname}`);
          gimgs.forEach((img, idx) => {
            const base64 = img.src.replace(/^data:image\/\w+;base64,/, '');
            folder.file(`${setName}_${idx + 1}.jpg`, base64, { base64: true });
          });
        });
      } else {
        const folder = zip.folder(setName);
        imgs.forEach((img, idx) => {
          const base64 = img.src.replace(/^data:image\/\w+;base64,/, '');
          folder.file(`${setName}_${idx + 1}.jpg`, base64, { base64: true });
        });
      }
    };
    addSet('train', splitSets.train);
    addSet('val', splitSets.val);
    addSet('test', splitSets.test);
    // metadata
    zip.file('split_metadata.json', JSON.stringify({ trainPct, valPct, testPct, counts: Object.fromEntries(Array.from(countsByClass).map(([k, v]) => [k, v.length])) }, null, 2));
    const content = await zip.generateAsync({ type: 'uint8array' });
    const blob = new Blob([content], { type: 'application/zip' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'split_dataset.zip'; a.click(); URL.revokeObjectURL(url);
    if (onExport) onExport();
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h4 style={styles.title}>Train/Val/Test Split</h4>
      </div>
      <div style={styles.grid}>
        <div style={styles.col}>
          <label style={styles.label}>Train</label>
          <input type="number" min={0} max={100} value={trainPct} onChange={(e)=> setTrainPct(Number(e.target.value))} style={styles.input} />
        </div>
        <div style={styles.col}>
          <label style={styles.label}>Val</label>
          <input type="number" min={0} max={100} value={valPct} onChange={(e)=> setValPct(Number(e.target.value))} style={styles.input} />
        </div>
        <div style={styles.col}>
          <label style={styles.label}>Test</label>
          <input type="number" min={0} max={100} value={testPct} onChange={(e)=> setTestPct(Number(e.target.value))} style={styles.input} />
        </div>
      </div>
      <div style={styles.options}>
        <label style={styles.optionLabel}><input type="checkbox" checked={organizeByClass} onChange={(e)=> setOrganizeByClass(e.target.checked)} /> Organize by class</label>
      </div>
      <div style={styles.summary}>Train: {splitSets.train.length} • Val: {splitSets.val.length} • Test: {splitSets.test.length}</div>
      <button style={styles.exportBtn} onClick={handleExport}>Export Split ZIP</button>
    </div>
  );
};

const styles = {
  container: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 12 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 },
  col: { display: 'flex', flexDirection: 'column', gap: 4 },
  label: { fontSize: 12, color: '#374151' },
  input: { padding: '6px 8px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12 },
  options: { marginTop: 8 },
  optionLabel: { fontSize: 12, color: '#374151', display: 'flex', alignItems: 'center', gap: 6 },
  summary: { marginTop: 8, fontSize: 12, color: '#374151' },
  exportBtn: { marginTop: 8, padding: '8px 12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }
};

export default SplitManager;
