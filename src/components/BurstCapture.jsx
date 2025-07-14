import React from "react";

const BurstCapture = ({ burstMode, setBurstMode, onCapture }) => {
  // TODO: Implement burst capture logic
  return (
    <div>
      <button onClick={() => setBurstMode(true)}>Start Burst Capture</button>
      {/* Show burst status, progress, etc. */}
    </div>
  );
};

export default BurstCapture;