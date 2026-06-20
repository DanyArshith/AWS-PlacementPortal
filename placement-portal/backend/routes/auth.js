const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');
const rateLimiter = require('../middleware/rateLimiter');

// Rate limiter for auth endpoints: 15 requests per 15 minutes window
const authLimiter = rateLimiter(15 * 60 * 1000, 15);

router.post('/register', authLimiter, [
  body('name').isString().notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
], authController.register);

router.post('/login', authLimiter, [
  body('email').isEmail(),
  body('password').exists()
], authController.login);

router.post('/admin/login', authLimiter, [
  body('username').isString().notEmpty(),
  body('password').exists()
], authController.adminLogin);

module.exports = router;
