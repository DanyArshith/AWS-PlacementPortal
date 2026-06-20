const Company = require('../models/Company');
const s3Service = require('../services/s3Service');

exports.createCompany = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (req.file) {
      const key = `${process.env.S3_PREFIX || 'placement'}/logos/${Date.now()}-${req.file.originalname}`;
      const url = await s3Service.uploadStream(req.file.buffer, key, req.file.mimetype);
      payload.logo = url;
    }
    const company = await Company.create(payload);
    res.json(company);
  } catch (err) { next(err); }
};

exports.getCompanies = async (req, res, next) => {
  try {
    const companies = await Company.find();
    res.json(companies);
  } catch (err) { next(err); }
};

exports.updateCompany = async (req, res, next) => {
  try {
    const company = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(company);
  } catch (err) { next(err); }
};

exports.deleteCompany = async (req, res, next) => {
  try {
    await Company.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};
