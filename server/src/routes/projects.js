const express = require('express');
const Project = require('../models/Project');
const auth = require('../middleware/auth');
const router = express.Router();

router.use(auth);

// List projects
router.get('/', async (req, res) => {
  const projects = await Project.find({ ownerId: req.user.sub }).sort({ updatedAt: -1 });
  res.json(projects);
});

// Create project
router.post('/', async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ message: 'Name required' });
  const project = await Project.create({ ownerId: req.user.sub, name, description });
  res.status(201).json(project);
});

// Duplicate project
router.post('/:id/duplicate', async (req, res) => {
  const { name, includeImages = false } = req.body;
  const source = await Project.findOne({ _id: req.params.id, ownerId: req.user.sub });
  if (!source) return res.status(404).json({ message: 'Not found' });
  if (!name) return res.status(400).json({ message: 'Name required' });
  const newProj = new Project({ ownerId: req.user.sub, name, description: source.description });
  if (includeImages) {
    newProj.images = source.images.map(img => ({ src: img.src, className: img.className, timestamp: img.timestamp, width: img.width, height: img.height }));
  }
  await newProj.save();
  res.status(201).json(newProj);
});

// Get project
router.get('/:id', async (req, res) => {
  const p = await Project.findOne({ _id: req.params.id, ownerId: req.user.sub });
  if (!p) return res.status(404).json({ message: 'Not found' });
  res.json(p);
});

// Update project
router.put('/:id', async (req, res) => {
  const updated = await Project.findOneAndUpdate({ _id: req.params.id, ownerId: req.user.sub }, req.body, { new: true });
  if (!updated) return res.status(404).json({ message: 'Not found' });
  res.json(updated);
});

// Delete project
router.delete('/:id', async (req, res) => {
  await Project.deleteOne({ _id: req.params.id, ownerId: req.user.sub });
  res.status(204).end();
});

// Add image to project
router.post('/:id/images', async (req, res) => {
  const { src, className, timestamp, width, height } = req.body;
  if (!src) return res.status(400).json({ message: 'src required' });
  const p = await Project.findOne({ _id: req.params.id, ownerId: req.user.sub });
  if (!p) return res.status(404).json({ message: 'Not found' });
  p.images.push({ src, className: className || null, timestamp: timestamp ? new Date(timestamp) : new Date(), width, height });
  await p.save();
  res.status(201).json(p.images[p.images.length - 1]);
});

// List images with pagination
router.get('/:id/images', async (req, res) => {
  const { page = 1, pageSize = 30, className } = req.query;
  const p = await Project.findOne({ _id: req.params.id, ownerId: req.user.sub });
  if (!p) return res.status(404).json({ message: 'Not found' });
  let imgs = p.images;
  if (className) imgs = imgs.filter(i => (className === 'unassigned' ? !i.className : i.className === className));
  const total = imgs.length;
  const start = (Number(page) - 1) * Number(pageSize);
  const end = start + Number(pageSize);
  const data = imgs.slice(start, end);
  res.json({ total, page: Number(page), pageSize: Number(pageSize), data });
});

// Update image class
router.put('/:id/images/:imageId', async (req, res) => {
  const { className } = req.body;
  const p = await Project.findOne({ _id: req.params.id, ownerId: req.user.sub });
  if (!p) return res.status(404).json({ message: 'Not found' });
  const img = p.images.id(req.params.imageId);
  if (!img) return res.status(404).json({ message: 'Image not found' });
  img.className = className || null;
  await p.save();
  res.json(img);
});

// Delete image
router.delete('/:id/images/:imageId', async (req, res) => {
  const p = await Project.findOne({ _id: req.params.id, ownerId: req.user.sub });
  if (!p) return res.status(404).json({ message: 'Not found' });
  const img = p.images.id(req.params.imageId);
  if (!img) return res.status(404).json({ message: 'Image not found' });
  img.remove();
  await p.save();
  res.status(204).end();
});

// Delete ALL images (optionally filtered)
router.delete('/:id/images', async (req, res) => {
  const { className } = req.query;
  const p = await Project.findOne({ _id: req.params.id, ownerId: req.user.sub });
  if (!p) return res.status(404).json({ message: 'Not found' });
  const before = p.images.length;
  if (!className || className === 'all') {
    p.images = [];
  } else if (className === 'unassigned') {
    p.images = p.images.filter(img => img.className); // keep only assigned
  } else {
    p.images = p.images.filter(img => img.className !== className);
  }
  await p.save();
  res.json({ success: true, removed: before - p.images.length });
});

module.exports = router; 