const express = require('express');
const Project = require('../models/Project');
const auth = require('../middleware/auth');
const router = express.Router();

router.use(auth);

router.get('/', async (req, res) => {
  const projects = await Project.find({ ownerId: req.user.sub }).sort({ updatedAt: -1 });
  res.json(projects);
});

router.post('/', async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ message: 'Name required' });
  const project = await Project.create({ ownerId: req.user.sub, name, description });
  res.status(201).json(project);
});

router.get('/:id', async (req, res) => {
  const p = await Project.findOne({ _id: req.params.id, ownerId: req.user.sub });
  if (!p) return res.status(404).json({ message: 'Not found' });
  res.json(p);
});

router.put('/:id', async (req, res) => {
  const updated = await Project.findOneAndUpdate({ _id: req.params.id, ownerId: req.user.sub }, req.body, { new: true });
  if (!updated) return res.status(404).json({ message: 'Not found' });
  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  await Project.deleteOne({ _id: req.params.id, ownerId: req.user.sub });
  res.status(204).end();
});

module.exports = router; 