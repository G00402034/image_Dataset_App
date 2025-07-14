import React from "react";

const DatasetPreview = ({
  images = [],
  onDeleteImage,
  onReplaceImage,
  onExportDataset,
}) => {
  // TODO: Implement dataset preview and image management
  return (
    <div>
      <h2>Dataset Preview</h2>
      {/* Thumbnails, delete/replace options */}
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {images.map((img, idx) => (
          <div key={idx} style={{ margin: 4 }}>
            <img src={img.src} alt={`img-${idx}`} width={80} height={80} />
            <button onClick={() => onDeleteImage(idx)}>Delete</button>
            <button onClick={() => onReplaceImage(idx)}>Replace</button>
          </div>
        ))}
      </div>
      <button onClick={onExportDataset}>Export Dataset</button>
    </div>
  );
};

export default DatasetPreview;