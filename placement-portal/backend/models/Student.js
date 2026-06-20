const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  phone: { type: String },
  branch: { type: String },
  cgpa: { type: Number },
  skills: [{ type: String }],
  resumeUrl: { type: String },
  profileImage: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Student', StudentSchema);
