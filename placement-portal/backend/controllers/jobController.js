const Job = require('../models/Job');
const Application = require('../models/Application');

exports.getJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find().populate('companyId', 'companyName logo');
    res.json(jobs);
  } catch (err) { next(err); }
};

exports.getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate('companyId', 'companyName logo');
    if (!job) return res.status(404).json({ message: 'Not found' });
    res.json(job);
  } catch (err) { next(err); }
};

exports.applyJob = async (req, res, next) => {
  try {
    const { jobId } = req.body;
    const exists = await Application.findOne({ studentId: req.user.id, jobId });
    if (exists) return res.status(400).json({ message: 'Already applied' });
    const app = await Application.create({ studentId: req.user.id, jobId });
    res.json(app);
  } catch (err) { next(err); }
};

exports.getAppliedJobs = async (req, res, next) => {
  try {
    const apps = await Application.find({ studentId: req.user.id }).populate({ path: 'jobId', populate: { path: 'companyId', select: 'companyName' } });
    res.json(apps);
  } catch (err) { next(err); }
};
