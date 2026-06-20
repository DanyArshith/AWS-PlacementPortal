const { validationResult } = require('express-validator');
const store = require('../services/dbStore');

const applySearchAndPagination = async (jobs, search, page = 1, limit = 10) => {
  let filtered = jobs;
  if (search) {
    const term = search.toLowerCase();
    filtered = filtered.filter((job) =>
      (job.title || '').toLowerCase().includes(term) ||
      (job.description || '').toLowerCase().includes(term) ||
      (job.location || '').toLowerCase().includes(term)
    );
  }

  const total = filtered.length;
  const start = (page - 1) * limit;
  const data = await Promise.all(
    filtered.slice(start, start + limit).map(async (job) => ({
      ...job,
      company: await store.getCompanyById(job.companyId)
    }))
  );

  return { data, meta: { total, page, limit } };
};

exports.getJobs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '10', 10);
    const search = req.query.search || '';
    const jobs = await store.listJobs();
    const result = await applySearchAndPagination(jobs, search, page, limit);
    res.json(result);
  } catch (err) { next(err); }
};

exports.getJobById = async (req, res, next) => {
  try {
    const job = await store.getJobById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Not found' });
    res.json({ ...job, company: await store.getCompanyById(job.companyId) });
  } catch (err) { next(err); }
};

exports.applyJob = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { jobId } = req.body;
    const job = await store.getJobById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const exists = await store.findApplication(req.user.id, jobId);
    if (exists) return res.status(400).json({ message: 'Already applied' });
    const app = await store.createApplication({ studentId: req.user.id, jobId });
    res.json(app);
  } catch (err) { next(err); }
};

exports.getAppliedJobs = async (req, res, next) => {
  try {
    const rawApps = await store.findApplicationsByStudent(req.user.id);
    const apps = await Promise.all(
      rawApps.map(async (application) => {
        const job = await store.getJobById(application.jobId);
        const company = job ? await store.getCompanyById(job.companyId) : null;
        return {
          ...application,
          job,
          company
        };
      })
    );
    res.json(apps);
  } catch (err) { next(err); }
};
