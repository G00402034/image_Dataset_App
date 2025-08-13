const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  src: { type: String, required: true },
  className: { type: String },
  timestamp: { type: Date },
  width: { type: Number },
  height: { type: Number }
}, { timestamps: true, _id: true });

const projectSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: { type: String },
  images: [imageSchema]
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema); 