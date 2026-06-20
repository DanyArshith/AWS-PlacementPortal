const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/student', require('./student'));
router.use('/jobs', require('./jobs'));
router.use('/admin', require('./admin'));
router.use('/company', require('./company'));

module.exports = router;
