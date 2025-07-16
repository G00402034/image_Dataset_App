import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import BurstCapture from "./BurstCapture";
import AugmentationTools from "./AugmentationTools";

const CameraCapture = ({ onCapture }) => {
  const webcamRef = useRef(null);
  const [isBursting, setIsBursting] = useState(false);
  const [lastImage, setLastImage] = useState(null);

  const handleSingleCapture = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setLastImage(imageSrc);
      onCapture(imageSrc);
    }
  };

  const handleBurstCapture = async () => {
    setIsBursting(true);
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setLastImage(imageSrc);
      onCapture(imageSrc);
    }
    setIsBursting(false);
  };

  // Augmentation handlers (stub)
  const handleFlip = () => { /* TODO: Implement flip logic */ };
  const handleRotate = (angle) => { /* TODO: Implement rotate logic */ };
  const handleAdjustContrast = (factor) => { /* TODO: Implement contrast logic */ };
  const handleAugment = () => { /* TODO: Implement augmentation logic */ };

  return (
    <div>
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width={400}
        height={300}
      />
      <button onClick={handleSingleCapture} disabled={isBursting}>
        Capture Image
      </button>
      <BurstCapture onBurstCapture={handleBurstCapture} isBursting={isBursting} />
      <AugmentationTools
        onFlip={handleFlip}
        onRotate={handleRotate}
        onAdjustContrast={handleAdjustContrast}
        onAugment={handleAugment}
      />
      {lastImage && (
        <div>
          <h4>Last Image Preview:</h4>
          <img src={lastImage} alt="Preview" style={{ maxWidth: "100%" }} />
        </div>
      )}
    </div>
  );
};

export default CameraCapture;