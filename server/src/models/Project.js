const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: { type: String },
  images: [{ src: String, className: String, timestamp: Date, width: Number, height: Number }]
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema); 