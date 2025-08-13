import React, { useEffect, useRef, useState } from 'react';

const LightingStatus = ({ webcamRef }) => {
  const [status, setStatus] = useState('OK');
  const [metrics, setMetrics] = useState({ mean: 0, clipPct: 0, stdev: 0 });
  const samplesRef = useRef([]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!webcamRef?.current?.video) return;
      const video = webcamRef.current.video;
      const canvas = document.createElement('canvas');
      const w = canvas.width = 120; const h = canvas.height = 90;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, w, h);
      const data = ctx.getImageData(0, 0, w, h).data;
      let sum = 0; let clipped = 0; let sumSq = 0;
      for (let i = 0; i < data.length; i += 4) {
        const y = 0.299*data[i] + 0.587*data[i+1] + 0.114*data[i+2];
        sum += y; sumSq += y*y;
        if (y < 2 || y > 253) clipped++;
      }
      const n = data.length / 4;
      const mean = sum / n;
      const clipPct = clipped / n;
      const variance = Math.max(0, sumSq / n - mean*mean);
      const stdev = Math.sqrt(variance);
      let s = 'OK';
      if (mean < 60) s = 'Low';
      else if (mean > 195) s = 'High';
      if (clipPct > 0.30) s = 'Clipped';
      // smooth samples
      samplesRef.current.push(s);
      if (samplesRef.current.length > 5) samplesRef.current.shift();
      const consensus = samplesRef.current.sort((a,b)=> a.localeCompare(b))[0];
      setStatus(consensus);
      setMetrics({ mean: Math.round(mean), clipPct: Math.round(clipPct*100), stdev: Math.round(stdev) });
    }, 1000);
    return () => clearInterval(interval);
  }, [webcamRef]);

  const styleMap = {
    OK: { background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' },
    Low: { background: '#fffbeb', color: '#92400e', border: '1px solid #fde68a' },
    High: { background: '#fffbeb', color: '#92400e', border: '1px solid #fde68a' },
    Clipped: { background: '#fee2e2', color: '#991b1b', border: '1px solid #ef4444' }
  };

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, borderRadius: 999, padding: '4px 10px', ...styleMap[status] }}>
      <span>Lighting: {status}</span>
      <span style={{ opacity: 0.8 }}>• Avg {metrics.mean}</span>
      <span style={{ opacity: 0.8 }}>• Clip {metrics.clipPct}%</span>
      <span style={{ opacity: 0.8 }}>• σ {metrics.stdev}</span>
    </span>
  );
};

export default LightingStatus;
