# Image Dataset Collection Tool

A modern, feature-rich application for collecting and organizing image datasets with real-time camera capture, class management, and export capabilities.

## ✨ Features

### 📸 Image Capture
- **Real-time camera capture** with webcam integration
- **Burst capture mode** for rapid image collection with configurable count and intervals
- **Live ML augmentation preview** - see effects in real-time before capturing
- **Image augmentation tools** including flip, rotate, brightness, contrast, saturation, noise, blur, hue, and sharpen
- **Live preview** of captured images

### 🎨 ML Augmentation Tools
- **Live Preview Mode**: Apply effects in real-time to the camera feed
- **Real-time Effects**: Brightness, contrast, saturation, noise, hue adjustments
- **Batch Processing**: Apply multiple augmentations to captured images
- **Random Augmentation**: Generate random combinations of effects
- **Performance Optimized**: Throttled rendering for smooth live preview

### 🏷️ Class Management
- **Create and manage classes** for organizing your dataset
- **Rename and delete classes** with confirmation dialogs
- **Visual class selection** with clear indicators
- **Empty state guidance** for new users

### 📊 Dataset Preview
- **Grid view** of all captured images
- **Filter by class** or view unassigned images
- **Class assignment** with dropdown selectors
- **Image deletion** with hover controls
- **Summary statistics** showing total, assigned, and unassigned counts

### 📦 Export Functionality
- **ZIP Archive Export**
  - Organize images by class folders
  - Include metadata.json with dataset statistics
  - Configurable compression options
  - Class distribution tracking

- **CSV Metadata Export**
  - Export image metadata as CSV
  - Includes filename, class, dimensions, and capture date
  - Compatible with data analysis tools

### 🎨 Modern UI
- **Responsive design** that works on desktop and mobile
- **Smooth animations** and hover effects
- **Modern color scheme** with consistent styling
- **Accessibility features** with proper focus states
- **Loading states** and progress indicators

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd image_Dataset_App

# Install dependencies
npm install

# Start the development server
npm start
```

### Building for Production
```bash
# Build the application
npm run build

# For Electron desktop app
npm run electron
```

## 📁 Project Structure

```
src/
├── components/
│   ├── App.jsx              # Main application component
│   ├── CameraCapture.jsx    # Camera capture interface with live preview
│   ├── ClassManager.jsx     # Class management interface
│   ├── DatasetPreview.jsx   # Dataset preview and management
│   ├── ExportPanel.jsx      # Export functionality
│   ├── BurstCapture.jsx     # Enhanced burst capture controls
│   ├── AugmentationTools.jsx # ML augmentation tools with live preview
│   └── LightingWarnings.jsx # Real-time lighting analysis
├── utils/
│   ├── fileUtils.js         # Export and file utilities
│   ├── imageUtils.js        # Image processing utilities
│   └── storageUtils.js      # Local storage utilities
└── index.js                 # Application entry point
```

## 🔧 Configuration

### Export Options
- **ZIP Format**: Organize by class folders, include metadata
- **CSV Format**: Export image metadata for analysis
- **Compression**: Configurable compression levels for ZIP files

### Camera Settings
- **Burst Mode**: Configurable count (1-50) and interval (50-2000ms)
- **Live Preview**: Real-time ML augmentation effects
- **Augmentation**: Advanced image processing tools
- **Preview**: Live preview of captured images

## 🎯 Usage Guide

### 1. Setting Up Classes
1. Click "Add New Class" in the Class Manager
2. Enter a class name (e.g., "cat", "dog", "bird")
3. The class will appear in the list and can be selected for capture

### 2. Capturing Images
1. Select a class from the Class Manager
2. Use the camera interface to capture images
3. Images are automatically assigned to the selected class
4. Use burst capture for rapid collection

### 3. Using Live ML Augmentation Preview
1. Enable "Live Preview Mode" in the Augmentation Tools
2. Select augmentation effects (brightness, contrast, saturation, etc.)
3. Adjust settings with real-time sliders
4. See effects applied to the live camera feed
5. Capture images with the applied effects

### 4. Burst Capture
1. Set the desired count (1-50 images)
2. Configure interval between captures (50-2000ms)
3. Click "Burst Capture" to start
4. Monitor progress with real-time feedback

### 5. Managing Your Dataset
1. View all images in the Dataset Preview
2. Filter by class or view unassigned images
3. Reassign classes using the dropdown selectors
4. Delete unwanted images with the trash button

### 6. Exporting Your Dataset
1. Use the Export Panel to configure export options
2. Choose between ZIP or CSV format
3. Configure organization and metadata options
4. Click export to download your dataset

## 🛠️ Technical Details

### Live Preview System
- **Canvas-based rendering** for real-time effects
- **Throttled updates** (~30 FPS) for optimal performance
- **Direct pixel manipulation** for immediate feedback
- **Memory efficient** processing pipeline

### Burst Capture Enhancements
- **Robust error handling** with user feedback
- **Input validation** for count and interval settings
- **Progress tracking** with visual indicators
- **Async/await pattern** for reliable timing

### Export Formats

#### ZIP Archive
- Images organized by class folders
- Optional metadata.json with statistics
- Configurable compression
- Cross-platform compatibility

#### CSV Metadata
- Filename, class, dimensions, capture date
- Compatible with spreadsheet applications
- Easy integration with ML pipelines

### Browser Compatibility
- Modern browsers with WebRTC support
- Chrome, Firefox, Safari, Edge
- Mobile browser support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with React and modern web technologies
- Camera integration via react-webcam
- Image processing with Canvas API
- Export functionality with JSZip 