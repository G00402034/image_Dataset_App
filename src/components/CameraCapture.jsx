import React from "react";
import BurstCapture from "./BurstCapture";
import ROISelector from "./ROISelector";

const CameraCapture = ({
  onCapture,
  selectedClass,
  roi,
  setRoi,
  burstMode,
  setBurstMode,
}) => {
  // TODO: Implement webcam feed and capture logic
  return (
    <div>
      <h2>Camera Capture</h2>
      {/* Webcam preview here */}
      <ROISelector roi={roi} setRoi={setRoi} />
      <BurstCapture burstMode={burstMode} setBurstMode={setBurstMode} onCapture={onCapture} />
      {/* Capture button, etc. */}
    </div>
  );
};

export default CameraCapture;