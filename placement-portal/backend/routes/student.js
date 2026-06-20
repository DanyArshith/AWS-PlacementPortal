const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const studentController = require('../controllers/studentController');

router.get('/profile', auth.required, studentController.getProfile);
router.put('/profile', auth.required, studentController.updateProfile);
router.post('/upload-resume', auth.required, upload.single('resume'), studentController.uploadResume);
router.post('/upload-photo', auth.required, upload.single('photo'), studentController.uploadPhoto);

module.exports = router;
