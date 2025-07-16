import React, { useState } from "react";
import CameraCapture from "./CameraCapture";
import JSZip from "jszip";

const App = () => {
  const [images, setImages] = useState([]);

  const handleCapture = (imageSrc) => {
    setImages((prev) => [...prev, imageSrc]);
  };

  const handleExport = async () => {
    const zip = new JSZip();
    images.forEach((img, idx) => {
      const base64 = img.replace(/^data:image\/\w+;base64,/, "");
      zip.file(`image_${idx + 1}.jpg`, base64, { base64: true });
    });
    const content = await zip.generateAsync({ type: "uint8array" });
    if (window.electronAPI) {
      await window.electronAPI.saveFile("dataset.zip", content);
    }
  };

  return (
    <div>
      <h1>Image Dataset Collection Tool</h1>
      <CameraCapture onCapture={handleCapture} />
      <button onClick={handleExport} disabled={images.length === 0}>
        Export Dataset as ZIP
      </button>
      <div>
        <h4>Images Collected: {images.length}</h4>
      </div>
    </div>
  );
};

export default App;