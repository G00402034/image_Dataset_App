import React, { useEffect, useState } from 'react';

const QualityGates = ({ webcamRef }) => {
  const [blurWarning, setBlurWarning] = useState(false);
  const [exposureWarning, setExposureWarning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!webcamRef?.current?.video) return;
      const video = webcamRef.current.video;
      const canvas = document.createElement('canvas');
      const w = canvas.width = 160; const h = canvas.height = 120;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, w, h);
      const data = ctx.getImageData(0, 0, w, h).data;
      let sum = 0, sumSq = 0;
      for (let i = 0; i < data.length; i += 4) {
        const y = 0.299*data[i] + 0.587*data[i+1] + 0.114*data[i+2];
        sum += y; sumSq += y*y;
      }
      const n = data.length / 4;
      const mean = sum / n; const variance = sumSq / n - mean*mean;
      setExposureWarning(mean < 35 || mean > 220);
      setBlurWarning(variance < 400);
    }, 1000);
    return () => clearInterval(interval);
  }, [webcamRef]);

  return (
    <div style={styles.row}>
      <span style={{ ...styles.tag, ...(blurWarning ? styles.bad : styles.good) }}>Blur: {blurWarning ? 'Too blurry' : 'OK'}</span>
      <span style={{ ...styles.tag, ...(exposureWarning ? styles.bad : styles.good) }}>Exposure: {exposureWarning ? 'Too dark/bright' : 'OK'}</span>
    </div>
  );
};

const styles = {
  row: { display: 'flex', gap: 8, alignItems: 'center' },
  tag: { fontSize: 12, borderRadius: 999, padding: '4px 10px', border: '1px solid transparent' },
  good: { background: '#ecfdf5', color: '#065f46', borderColor: '#a7f3d0' },
  bad: { background: '#fffbeb', color: '#92400e', borderColor: '#fde68a' }
};

export default QualityGates;
