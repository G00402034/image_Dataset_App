const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const { connectDB } = require('./db');
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const billingRoutes = require('./routes/billing');
const driveRoutes = require('./routes/drive');

dotenv.config();
const app = express();

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000').split(',');
app.use(cors({ origin: allowedOrigins, credentials: true }));

app.use(express.json({ limit: '10mb' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

connectDB();

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/drive', driveRoutes);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server listening on ${port}`)); 