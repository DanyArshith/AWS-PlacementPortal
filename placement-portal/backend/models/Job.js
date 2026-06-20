const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  title: { type: String, required: true },
  description: { type: String },
  salary: { type: String },
  location: { type: String },
  eligibility: { type: String },
  deadline: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Job', JobSchema);
