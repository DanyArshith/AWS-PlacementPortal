const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  description: { type: String },
  website: { type: String },
  logo: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Company', CompanySchema);
