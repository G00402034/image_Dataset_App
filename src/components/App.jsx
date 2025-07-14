import React from "react";
import CameraCapture from "./CameraCapture";
import ClassManager from "./ClassManager";
import DatasetPreview from "./DatasetPreview";
import AugmentationTools from "./AugmentationTools";

const App = () => (
  <div>
    <h1>Image Dataset Collection Tool</h1>
    <ClassManager />
    <CameraCapture />
    <DatasetPreview />
    <AugmentationTools />
  </div>
);

export default App;