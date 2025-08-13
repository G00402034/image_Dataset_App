import React, { useState, useMemo } from 'react';
import JSZip from 'jszip';

const SequenceCapture = ({ images }) => {
  const [seqLen, setSeqLen] = useState(5);
  const [stride, setStride] = useState(1);

  const sequences = useMemo(() => {
    const seqs = [];
    for (let i = 0; i + seqLen <= images.length; i += stride) {
      seqs.push(images.slice(i, i + seqLen));
    }
    return seqs;
  }, [images, seqLen, stride]);

  const exportSequences = async () => {
    const zip = new JSZip();
    const index = [];
    sequences.forEach((seq, sIdx) => {
      const folder = zip.folder(`seq_${sIdx + 1}`);
      const frameNames = [];
      seq.forEach((img, idx) => {
        const base64 = img.src.replace(/^data:image\/\w+;base64,/, '');
        const fname = `frame_${idx + 1}.jpg`;
        frameNames.push(fname);
        folder.file(fname, base64, { base64: true });
      });
      index.push({ sequence: `seq_${sIdx + 1}`, frames: frameNames });
    });
    zip.file('sequences_index.json', JSON.stringify(index, null, 2));
    const content = await zip.generateAsync({ type: 'uint8array' });
    const blob = new Blob([content], { type: 'application/zip' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'sequences.zip'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h4 style={styles.title}>Sequence Builder</h4>
      </div>
      <div style={styles.grid}>
        <div style={styles.col}><label style={styles.label}>Sequence length</label><input type="number" min={2} max={50} value={seqLen} onChange={(e)=> setSeqLen(Number(e.target.value))} style={styles.input} /></div>
        <div style={styles.col}><label style={styles.label}>Stride</label><input type="number" min={1} max={seqLen} value={stride} onChange={(e)=> setStride(Number(e.target.value))} style={styles.input} /></div>
      </div>
      <div style={styles.summary}>Sequences: {sequences.length}</div>
      <button style={styles.exportBtn} onClick={exportSequences} disabled={sequences.length === 0}>Export Sequences</button>
    </div>
  );
};

const styles = {
  container: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 12 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 },
  col: { display: 'flex', flexDirection: 'column', gap: 4 },
  label: { fontSize: 12, color: '#374151' },
  input: { padding: '6px 8px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12 },
  summary: { marginTop: 8, fontSize: 12, color: '#374151' },
  exportBtn: { marginTop: 8, padding: '8px 12px', background: '#111827', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }
};

export default SequenceCapture;
