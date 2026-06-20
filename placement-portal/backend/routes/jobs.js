const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const jobController = require('../controllers/jobController');

router.get('/', jobController.getJobs);
router.get('/:id', jobController.getJobById);
router.post('/apply', auth.required, jobController.applyJob);
router.get('/applied', auth.required, jobController.getAppliedJobs);

module.exports = router;
