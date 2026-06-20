const { validationResult } = require('express-validator');
const store = require('../services/dbStore');

exports.createCompany = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const payload = { ...req.body };
    if (req.file) {
      payload.logo = `mock://logos/${req.file.originalname}`;
    }
    const company = await store.createCompany(payload);
    res.status(201).json(company);
  } catch (err) { next(err); }
};

exports.getCompanies = async (req, res, next) => {
  try {
    const companies = await store.listCompanies();
    res.json(companies);
  } catch (err) { next(err); }
};

exports.updateCompany = async (req, res, next) => {
  try {
    const company = await store.updateCompany(req.params.id, req.body);
    if (!company) return res.status(404).json({ message: 'Company not found' });
    res.json(company);
  } catch (err) { next(err); }
};

exports.deleteCompany = async (req, res, next) => {
  try {
    const removed = await store.deleteCompany(req.params.id);
    if (!removed) return res.status(404).json({ message: 'Company not found' });
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};
