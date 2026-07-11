const { validationResult } = require('express-validator');
const store = require('../services/dbStore');

exports.createJob = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const payload = req.body;
    const company = await store.getCompanyById(payload.companyId);
    if (!company) {
      return res.status(400).json({ message: 'Invalid companyId' });
    }
    const job = await store.createJob(payload);
    res.status(201).json(job);
  } catch (err) { next(err); }
};

exports.updateJob = async (req, res, next) => {
  try {
    const job = await store.updateJob(req.params.id, req.body);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) { next(err); }
};

exports.deleteJob = async (req, res, next) => {
  try {
    const removed = await store.deleteJob(req.params.id);
    if (!removed) return res.status(404).json({ message: 'Job not found' });
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};

exports.getStudents = async (req, res, next) => {
  try {
    const students = await store.listStudents();
    res.json(students);
  } catch (err) { next(err); }
};

exports.getApplications = async (req, res, next) => {
  try {
    const rawApps = await store.listApplications();
    const apps = await Promise.all(
      rawApps.map(async (application) => {
        const student = await store.getStudentById(application.studentId);
        const job = await store.getJobById(application.jobId);
        const company = job ? await store.getCompanyById(job.companyId) : null;
        return {
          ...application,
          student: student ? await store.stripPassword(student) : null,
          job,
          company
        };
      })
    );
    res.json(apps);
  } catch (err) { next(err); }
};

exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ['applied', 'shortlisted', 'rejected', 'accepted'];
    if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status' });

    const updated = await store.updateApplicationStatus(req.params.id, status);
    if (!updated) return res.status(404).json({ message: 'Application not found' });
    res.json(updated);
  } catch (err) { next(err); }
};

exports.updateStudent = async (req, res, next) => {
  try {
    const student = await store.updateStudent(req.params.id, req.body);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) { next(err); }
};

exports.deleteStudent = async (req, res, next) => {
  try {
    const removed = await store.deleteStudent(req.params.id);
    if (!removed) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};
