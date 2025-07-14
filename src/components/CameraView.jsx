import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';

const videoConstraints = {
  width: 640,
  height: 480,
  facingMode: "user"
};

const CameraView = ({ onCapture }) => {
  const webcamRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [isBursting, setIsBursting] = useState(false);
  const [burstCount, setBurstCount] = useState(10); // number of images to take
  const [burstInterval, setBurstInterval] = useState(200); // milliseconds between shots

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setPreview(imageSrc);
    if (onCapture) onCapture(imageSrc);
  };

  const burstCapture = async () => {
    setIsBursting(true);
    for (let i = 0; i < burstCount; i++) {
      capture();
      await new Promise((resolve) => setTimeout(resolve, burstInterval));
    }
    setIsBursting(false);
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={videoConstraints}
        style={{ border: '2px solid #444', borderRadius: '10px' }}
      />
      <br />
      <button onClick={capture} disabled={isBursting} style={{ margin: '10px' }}>
        Capture Image
      </button>
      <button onClick={burstCapture} disabled={isBursting} style={{ margin: '10px' }}>
        {isBursting ? 'Capturing...' : `Burst Capture (${burstCount})`}
      </button>

      <div style={{ marginTop: '10px' }}>
        <label>
          Burst Count:&nbsp;
          <input
            type="number"
            value={burstCount}
            onChange={(e) => setBurstCount(parseInt(e.target.value))}
            disabled={isBursting}
            min="1"
            max="100"
            style={{ width: '60px' }}
          />
        </label>
        &nbsp;&nbsp;
        <label>
          Interval (ms):&nbsp;
          <input
            type="number"
            value={burstInterval}
            onChange={(e) => setBurstInterval(parseInt(e.target.value))}
            disabled={isBursting}
            min="50"
            max="1000"
            step="50"
            style={{ width: '60px' }}
          />
        </label>
      </div>

      {preview && (
        <div style={{ marginTop: '15px' }}>
          <h4>Last Preview:</h4>
          <img src={preview} alt="Preview" style={{ maxWidth: '100%' }} />
        </div>
      )}
    </div>
  );
};

export default CameraView;
