const Job = require('../models/Job');
const Student = require('../models/Student');
const Application = require('../models/Application');

exports.createJob = async (req, res, next) => {
  try {
    const payload = req.body;
    const job = await Job.create(payload);
    res.json(job);
  } catch (err) { next(err); }
};

exports.updateJob = async (req, res, next) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(job);
  } catch (err) { next(err); }
};

exports.deleteJob = async (req, res, next) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};

exports.getStudents = async (req, res, next) => {
  try {
    const students = await Student.find().select('-password');
    res.json(students);
  } catch (err) { next(err); }
};

exports.getApplications = async (req, res, next) => {
  try {
    const apps = await Application.find().populate('studentId jobId');
    res.json(apps);
  } catch (err) { next(err); }
};
