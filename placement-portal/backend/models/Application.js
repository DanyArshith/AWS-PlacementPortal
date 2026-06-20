const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  status: { type: String, enum: ['applied','shortlisted','rejected','accepted'], default: 'applied' },
  appliedAt: { type: Date, default: Date.now }
});

ApplicationSchema.index({ studentId: 1, jobId: 1 }, { unique: true });

module.exports = mongoose.model('Application', ApplicationSchema);
