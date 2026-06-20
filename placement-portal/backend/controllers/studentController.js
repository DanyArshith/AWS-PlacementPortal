const store = require('../services/dbStore');

exports.getProfile = async (req, res, next) => {
  try {
    const student = await store.getStudentById(req.user.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(store.stripPassword(student));
  } catch (err) { next(err); }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const updates = req.body;
    const student = await store.updateStudent(req.user.id, updates);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) { next(err); }
};

exports.uploadResume = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const url = `mock://resumes/${req.user.id}/${req.file.originalname}`;
    await store.updateStudent(req.user.id, { resumeUrl: url });
    res.json({ url });
  } catch (err) { next(err); }
};

exports.uploadPhoto = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const url = `mock://photos/${req.user.id}/${req.file.originalname}`;
    await store.updateStudent(req.user.id, { profileImage: url });
    res.json({ url });
  } catch (err) { next(err); }
};
