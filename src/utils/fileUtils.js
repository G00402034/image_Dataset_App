// Utility functions for file operations (saving, loading, exporting)
import JSZip from 'jszip';

export function saveImageToDisk(imageBlob, filePath) {
  // TODO: Use Electron's IPC to save imageBlob to filePath
}

export function exportDatasetAsZip(dataset, zipFilePath) {
  // TODO: Use JSZip to create a zip and save via Electron
}

// Enhanced export functionality
export async function exportToCSV(images, classes) {
  try {
    // Create CSV content with image metadata
    const csvHeaders = ['filename', 'class', 'width', 'height', 'capture_date'];
    const csvRows = [csvHeaders.join(',')];
    
    images.forEach((img, idx) => {
      const filename = `image_${idx + 1}.jpg`;
      const className = img.className || 'unassigned';
      const captureDate = new Date().toISOString();
      
      // Extract image dimensions if available
      const imgElement = new Image();
      imgElement.src = img.src;
      const width = imgElement.width || 0;
      const height = imgElement.height || 0;
      
      const row = [
        filename,
        className,
        width,
        height,
        captureDate
      ].join(',');
      
      csvRows.push(row);
    });
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    
    if (window.electronAPI) {
      await window.electronAPI.saveFile('dataset_metadata.csv', blob);
      return { success: true, message: 'CSV exported successfully' };
    } else {
      // Fallback for web browser
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'dataset_metadata.csv';
      a.click();
      URL.revokeObjectURL(url);
      return { success: true, message: 'CSV downloaded successfully' };
    }
  } catch (error) {
    console.error('CSV export error:', error);
    return { success: false, message: 'Failed to export CSV' };
  }
}

export async function exportToZIP(images, classes, options = {}) {
  try {
    const zip = new JSZip();
    const { includeMetadata = true, organizeByClass = true } = options;
    
    // Create metadata file
    if (includeMetadata) {
      const metadata = {
        totalImages: images.length,
        classes: classes,
        exportDate: new Date().toISOString(),
        classDistribution: {}
      };
      
      // Calculate class distribution
      classes.forEach(cls => {
        metadata.classDistribution[cls] = images.filter(img => img.className === cls).length;
      });
      
      zip.file('metadata.json', JSON.stringify(metadata, null, 2));
    }
    
    // Add images to zip
    images.forEach((img, idx) => {
      const base64 = img.src.replace(/^data:image\/\w+;base64,/, "");
      const filename = `image_${idx + 1}.jpg`;
      
      if (organizeByClass && img.className) {
        // Create class folders
        const folder = zip.folder(img.className);
        folder.file(filename, base64, { base64: true });
      } else {
        // Put all images in root
        zip.file(filename, base64, { base64: true });
      }
    });
    
    const content = await zip.generateAsync({ 
      type: "uint8array",
      compression: "DEFLATE",
      compressionOptions: { level: 6 }
    });
    
    if (window.electronAPI) {
      await window.electronAPI.saveFile("dataset.zip", content);
      return { success: true, message: 'ZIP exported successfully' };
    } else {
      // Fallback for web browser
      const blob = new Blob([content], { type: 'application/zip' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'dataset.zip';
      a.click();
      URL.revokeObjectURL(url);
      return { success: true, message: 'ZIP downloaded successfully' };
    }
  } catch (error) {
    console.error('ZIP export error:', error);
    return { success: false, message: 'Failed to export ZIP' };
  }
}

export async function exportDataset(images, classes, format = 'zip', options = {}) {
  switch (format.toLowerCase()) {
    case 'csv':
      return await exportToCSV(images, classes);
    case 'zip':
      return await exportToZIP(images, classes, options);
    default:
      return { success: false, message: 'Unsupported export format' };
  }
}