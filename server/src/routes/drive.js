const express = require('express');
const { google } = require('googleapis');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const User = require('../models/User');
const router = express.Router();

function getOAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:4000/api/drive/oauth2callback';
  if (!clientId || !clientSecret) return null;
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

router.get('/auth-url', auth, async (req, res) => {
  const oauth2Client = getOAuthClient();
  if (!oauth2Client) return res.status(501).json({ message: 'Google OAuth not configured' });
  const scopes = ['https://www.googleapis.com/auth/drive.file'];
  const state = jwt.sign({ sub: req.user.sub }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '10m' });
  const url = oauth2Client.generateAuthUrl({ access_type: 'offline', scope: scopes, prompt: 'consent', state });
  res.json({ url });
});

router.get('/oauth2callback', async (req, res) => {
  try {
    const oauth2Client = getOAuthClient();
    if (!oauth2Client) return res.status(501).send('Google OAuth not configured');
    const code = req.query.code;
    const state = req.query.state;
    const payload = jwt.verify(state, process.env.JWT_SECRET || 'dev_secret');
    const userId = payload.sub;

    const { tokens } = await oauth2Client.getToken(code);
    const user = await User.findById(userId);
    if (!user) return res.status(404).send('User not found');
    if (tokens.refresh_token) user.googleDrive.refreshToken = tokens.refresh_token;
    await user.save();
    res.send('Google Drive linked. You can close this window.');
  } catch (e) {
    console.error(e);
    res.status(500).send('OAuth failed');
  }
});

router.get('/status', auth, async (req, res) => {
  const user = await User.findById(req.user.sub);
  res.json({ linked: !!(user && user.googleDrive && user.googleDrive.refreshToken) });
});

async function ensureFolder(drive, name) {
  const list = await drive.files.list({ q: `mimeType='application/vnd.google-apps.folder' and name='${name.replace(/'/g, "\\'")}' and trashed=false`, fields: 'files(id, name)', spaces: 'drive' });
  if (list.data.files && list.data.files.length) return list.data.files[0].id;
  const folder = await drive.files.create({ requestBody: { name, mimeType: 'application/vnd.google-apps.folder' }, fields: 'id' });
  return folder.data.id;
}

router.post('/export-zip', auth, async (req, res) => {
  try {
    const { filename, contentBase64, folderName } = req.body;
    if (!filename || !contentBase64) return res.status(400).json({ message: 'filename and contentBase64 required' });
    const user = await User.findById(req.user.sub);
    if (!user || !user.googleDrive || !user.googleDrive.refreshToken) {
      return res.status(401).json({ message: 'Google Drive not linked' });
    }

    const oauth2Client = getOAuthClient();
    oauth2Client.setCredentials({ refresh_token: user.googleDrive.refreshToken });
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    const buffer = Buffer.from(contentBase64, 'base64');

    let parents = undefined;
    if (folderName) {
      const folderId = await ensureFolder(drive, folderName);
      parents = [folderId];
    }

    const fileMetadata = { name: filename, ...(parents ? { parents } : {}) };
    const media = { mimeType: 'application/zip', body: require('stream').Readable.from(buffer) };
    const resp = await drive.files.create({ requestBody: fileMetadata, media, fields: 'id, name, webViewLink' });

    res.json({ success: true, fileId: resp.data.id, webViewLink: resp.data.webViewLink });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Drive upload failed' });
  }
});

module.exports = router; 