const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const companyController = require('../controllers/companyController');

router.post('/', auth.admin, upload.single('logo'), [
  body('companyName').isString().notEmpty().withMessage('companyName is required')
], companyController.createCompany);
router.get('/', auth.admin, companyController.getCompanies);
router.put('/:id', auth.admin, companyController.updateCompany);
router.delete('/:id', auth.admin, companyController.deleteCompany);

module.exports = router;
