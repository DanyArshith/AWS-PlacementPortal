require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

const MONGODB_URI = process.env.MONGODB_URI;
const USER = process.env.ADMIN_USERNAME;
const PASS = process.env.ADMIN_PASSWORD;

if (!MONGODB_URI) {
  console.error('MONGODB_URI required');
  process.exit(1);
}
if (!USER || !PASS) {
  console.error('Set ADMIN_USERNAME and ADMIN_PASSWORD in env');
  process.exit(1);
}

const run = async () => {
  await mongoose.connect(MONGODB_URI);
  const hash = await bcrypt.hash(PASS, 10);
  const existing = await Admin.findOne({ username: USER });
  if (existing) {
    existing.password = hash;
    await existing.save();
    console.log('Updated admin password');
  } else {
    await Admin.create({ username: USER, password: hash });
    console.log('Created admin user');
  }
  process.exit(0);
};

run().catch(err => { console.error(err); process.exit(1); });
