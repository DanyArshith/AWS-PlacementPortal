const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const store = require('../services/dbStore');

const signToken = (payload) => jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password } = req.body;
    const exists = await store.getStudentByEmail(email);
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const student = await store.createStudent({ name, email, password: hash });

    const token = signToken({ id: student.id, role: 'student' });
    res.status(201).json({ token, user: student });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    const student = await store.getStudentByEmail(email);
    if (!student) return res.status(401).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, student.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken({ id: student.id, role: 'student' });
    res.json({ token, user: await store.stripPassword(student) });
  } catch (err) { next(err); }
};

exports.adminLogin = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { username, password } = req.body;
    const admin = await store.getAdminByUsername(username);
    if (!admin) return res.status(401).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken({ id: admin.id, role: 'admin' });
    res.json({ token, user: { id: admin.id, username: admin.username, role: admin.role } });
  } catch (err) { next(err); }
};

exports.logout = async (req, res) => {
  res.json({ message: 'Logged out' });
};
