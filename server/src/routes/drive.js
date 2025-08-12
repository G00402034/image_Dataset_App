const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();

router.use(auth);

router.get('/status', async (req, res) => {
  // TODO: implement Google OAuth linking; store refresh token on user
  res.json({ linked: false });
});

router.post('/export-zip', async (req, res) => {
  // TODO: accept zip content or object reference and upload to Drive
  // Body: { filename, content: base64 or binary? }
  res.status(501).json({ message: 'Export to Drive is not implemented yet' });
});

module.exports = router; 