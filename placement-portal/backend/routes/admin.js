const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminController = require('../controllers/adminController');

const { body } = require('express-validator');

router.post('/job', auth.admin, [
	body('companyId').isString().notEmpty(),
	body('title').isString().notEmpty()
], adminController.createJob);

router.put('/job/:id', auth.admin, adminController.updateJob);
router.delete('/job/:id', auth.admin, adminController.deleteJob);
router.get('/students', auth.admin, adminController.getStudents);
router.get('/applications', auth.admin, adminController.getApplications);
router.put('/application/:id/status', auth.admin, adminController.updateApplicationStatus);
router.put('/student/:id', auth.admin, adminController.updateStudent);
router.delete('/student/:id', auth.admin, adminController.deleteStudent);

module.exports = router;
