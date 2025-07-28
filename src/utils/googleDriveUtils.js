// Google Drive integration utilities for saving datasets

class GoogleDriveManager {
  constructor() {
    this.isInitialized = false;
    this.accessToken = null;
    this.clientId = null;
    this.apiKey = null;
  }

  // Initialize Google Drive API
  async initialize(clientId, apiKey) {
    this.clientId = clientId;
    this.apiKey = apiKey;
    
    try {
      // Load Google API client
      await this.loadGoogleAPI();
      await this.authenticate();
      this.isInitialized = true;
      return { success: true, message: 'Google Drive initialized successfully' };
    } catch (error) {
      console.error('Google Drive initialization error:', error);
      return { success: false, message: 'Failed to initialize Google Drive' };
    }
  }

  // Load Google API client
  loadGoogleAPI() {
    return new Promise((resolve, reject) => {
      if (window.gapi) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        window.gapi.load('client:auth2', () => {
          window.gapi.client.init({
            apiKey: this.apiKey,
            clientId: this.clientId,
            scope: 'https://www.googleapis.com/auth/drive.file'
          }).then(() => {
            resolve();
          }).catch(reject);
        });
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // Authenticate with Google
  async authenticate() {
    if (!window.gapi) {
      throw new Error('Google API not loaded');
    }

    const authInstance = window.gapi.auth2.getAuthInstance();
    if (!authInstance.isSignedIn.get()) {
      await authInstance.signIn();
    }
    
    this.accessToken = authInstance.currentUser.get().getAuthResponse().access_token;
  }

  // Create a folder in Google Drive
  async createFolder(folderName, parentId = null) {
    if (!this.isInitialized) {
      throw new Error('Google Drive not initialized');
    }

    const folderMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder'
    };

    if (parentId) {
      folderMetadata.parents = [parentId];
    }

    const response = await window.gapi.client.drive.files.create({
      resource: folderMetadata,
      fields: 'id,name'
    });

    return response.result;
  }

  // Upload a file to Google Drive
  async uploadFile(fileName, fileContent, mimeType, parentId = null) {
    if (!this.isInitialized) {
      throw new Error('Google Drive not initialized');
    }

    const fileMetadata = {
      name: fileName,
      mimeType: mimeType
    };

    if (parentId) {
      fileMetadata.parents = [parentId];
    }

    const response = await window.gapi.client.drive.files.create({
      resource: fileMetadata,
      media: {
        mimeType: mimeType,
        body: fileContent
      },
      fields: 'id,name,webViewLink'
    });

    return response.result;
  }

  // Upload dataset to Google Drive
  async uploadDataset(images, classes, options = {}) {
    try {
      const {
        datasetName = 'ImageDataset',
        organizeByClass = true,
        includeMetadata = true,
        parentFolderId = null
      } = options;

      // Create main dataset folder
      const datasetFolder = await this.createFolder(datasetName, parentFolderId);
      
      // Create metadata file
      if (includeMetadata) {
        const metadata = {
          totalImages: images.length,
          classes: classes,
          exportDate: new Date().toISOString(),
          classDistribution: {}
        };

        classes.forEach(cls => {
          metadata.classDistribution[cls] = images.filter(img => img.className === cls).length;
        });

        const metadataBlob = new Blob([JSON.stringify(metadata, null, 2)], {
          type: 'application/json'
        });

        await this.uploadFile(
          'metadata.json',
          metadataBlob,
          'application/json',
          datasetFolder.id
        );
      }

      // Upload images
      const uploadPromises = images.map(async (img, idx) => {
        const base64 = img.src.replace(/^data:image\/\w+;base64,/, "");
        const fileName = `image_${idx + 1}.jpg`;
        
        if (organizeByClass && img.className) {
          // Create class folder if it doesn't exist
          let classFolder;
          try {
            classFolder = await this.createFolder(img.className, datasetFolder.id);
          } catch (error) {
            // Folder might already exist, try to find it
            const response = await window.gapi.client.drive.files.list({
              q: `name='${img.className}' and '${datasetFolder.id}' in parents and mimeType='application/vnd.google-apps.folder'`,
              fields: 'files(id,name)'
            });
            classFolder = response.result.files[0];
          }

          // Convert base64 to blob
          const byteCharacters = atob(base64);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const imageBlob = new Blob([byteArray], { type: 'image/jpeg' });

          return this.uploadFile(fileName, imageBlob, 'image/jpeg', classFolder.id);
        } else {
          // Upload to root folder
          const byteCharacters = atob(base64);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const imageBlob = new Blob([byteArray], { type: 'image/jpeg' });

          return this.uploadFile(fileName, imageBlob, 'image/jpeg', datasetFolder.id);
        }
      });

      const uploadedFiles = await Promise.all(uploadPromises);

      return {
        success: true,
        message: `Dataset uploaded successfully to Google Drive`,
        folderId: datasetFolder.id,
        folderName: datasetFolder.name,
        uploadedFiles: uploadedFiles.length
      };

    } catch (error) {
      console.error('Google Drive upload error:', error);
      return {
        success: false,
        message: 'Failed to upload dataset to Google Drive'
      };
    }
  }

  // Get shareable link for a file/folder
  async getShareableLink(fileId) {
    try {
      const response = await window.gapi.client.drive.files.get({
        fileId: fileId,
        fields: 'webViewLink'
      });
      return response.result.webViewLink;
    } catch (error) {
      console.error('Error getting shareable link:', error);
      return null;
    }
  }

  // List files in a folder
  async listFiles(folderId) {
    try {
      const response = await window.gapi.client.drive.files.list({
        q: `'${folderId}' in parents`,
        fields: 'files(id,name,mimeType,size,createdTime)'
      });
      return response.result.files;
    } catch (error) {
      console.error('Error listing files:', error);
      return [];
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return this.isInitialized && this.accessToken !== null;
  }

  // Sign out
  async signOut() {
    if (window.gapi && window.gapi.auth2) {
      const authInstance = window.gapi.auth2.getAuthInstance();
      await authInstance.signOut();
      this.accessToken = null;
      this.isInitialized = false;
    }
  }
}

// Export singleton instance
export const googleDriveManager = new GoogleDriveManager();

// Helper function to check if Google Drive is available
export function isGoogleDriveAvailable() {
  return typeof window !== 'undefined' && window.gapi !== undefined;
}

// Helper function to get Google Drive authentication status
export function getGoogleDriveStatus() {
  return {
    isAvailable: isGoogleDriveAvailable(),
    isInitialized: googleDriveManager.isInitialized,
    isAuthenticated: googleDriveManager.isAuthenticated()
  };
} 