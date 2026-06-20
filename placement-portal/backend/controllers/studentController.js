const Student = require('../models/Student');
const s3Service = require('../services/s3Service');

exports.getProfile = async (req, res, next) => {
  try {
    const student = await Student.findById(req.user.id).select('-password');
    res.json(student);
  } catch (err) { next(err); }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const updates = req.body;
    const student = await Student.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password');
    res.json(student);
  } catch (err) { next(err); }
};

exports.uploadResume = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const key = `${process.env.S3_PREFIX || 'placement'}/resumes/${req.user.id}-${Date.now()}.pdf`;
    const url = await s3Service.uploadStream(req.file.buffer, key, req.file.mimetype);
    await Student.findByIdAndUpdate(req.user.id, { resumeUrl: url });
    res.json({ url });
  } catch (err) { next(err); }
};

exports.uploadPhoto = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const key = `${process.env.S3_PREFIX || 'placement'}/photos/${req.user.id}-${Date.now()}`;
    const url = await s3Service.uploadStream(req.file.buffer, key, req.file.mimetype);
    await Student.findByIdAndUpdate(req.user.id, { profileImage: url });
    res.json({ url });
  } catch (err) { next(err); }
};
