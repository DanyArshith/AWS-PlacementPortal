const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const auth = require('../middleware/auth');
const jobController = require('../controllers/jobController');

router.get('/', jobController.getJobs);
router.get('/applied', auth.required, jobController.getAppliedJobs);
router.get('/:id', jobController.getJobById);
router.post('/apply', auth.required, [
  body('jobId').isString().notEmpty().withMessage('jobId is required')
], jobController.applyJob);

module.exports = router;
