import React from "react";

const AugmentationTools = ({
  onFlip,
  onRotate,
  onAdjustContrast,
  onAugment,
}) => {
  // TODO: Implement augmentation options (flip, rotate, etc.)
  return (
    <div>
      <h2>Augmentation Tools</h2>
      <button onClick={onFlip}>Flip</button>
      <button onClick={onRotate}>Rotate</button>
      <button onClick={onAdjustContrast}>Adjust Contrast</button>
      <button onClick={onAugment}>Augment</button>
    </div>
  );
};

export default AugmentationTools;