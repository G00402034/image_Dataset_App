import React, { useState } from "react";

const BurstCapture = ({ onBurstCapture, isBursting }) => {
  const [burstCount, setBurstCount] = useState(5);
  const [burstInterval, setBurstInterval] = useState(200);

  const handleBurst = async () => {
    if (isBursting) return;
    for (let i = 0; i < burstCount; i++) {
      await onBurstCapture();
      await new Promise((resolve) => setTimeout(resolve, burstInterval));
    }
  };

  return (
    <div>
      <label>
        Burst Count:
        <input
          type="number"
          value={burstCount}
          min={1}
          max={100}
          onChange={(e) => setBurstCount(Number(e.target.value))}
        />
      </label>
      <label>
        Interval (ms):
        <input
          type="number"
          value={burstInterval}
          min={50}
          max={1000}
          step={50}
          onChange={(e) => setBurstInterval(Number(e.target.value))}
        />
      </label>
      <button onClick={handleBurst} disabled={isBursting}>
        {isBursting ? "Bursting..." : "Start Burst Capture"}
      </button>
    </div>
  );
};

export default BurstCapture;