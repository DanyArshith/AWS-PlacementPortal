const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminController = require('../controllers/adminController');

router.post('/job', auth.admin, adminController.createJob);
router.put('/job/:id', auth.admin, adminController.updateJob);
router.delete('/job/:id', auth.admin, adminController.deleteJob);
router.get('/students', auth.admin, adminController.getStudents);
router.get('/applications', auth.admin, adminController.getApplications);

module.exports = router;
