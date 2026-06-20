const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const companyController = require('../controllers/companyController');

router.post('/', auth.admin, upload.single('logo'), companyController.createCompany);
router.get('/', auth.admin, companyController.getCompanies);
router.put('/:id', auth.admin, companyController.updateCompany);
router.delete('/:id', auth.admin, companyController.deleteCompany);

module.exports = router;
