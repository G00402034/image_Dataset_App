import React from "react";

const AugmentationTools = ({
  onFlip,
  onRotate,
  onAdjustContrast,
  onAugment,
}) => {
  return (
    <div>
      <h2>Augmentation Tools</h2>
      <button onClick={onFlip}>Flip</button>
      <button onClick={() => onRotate(90)}>Rotate 90°</button>
      <button onClick={() => onAdjustContrast(1.2)}>Increase Contrast</button>
      <button onClick={onAugment}>Augment</button>
    </div>
  );
};

export default AugmentationTools;