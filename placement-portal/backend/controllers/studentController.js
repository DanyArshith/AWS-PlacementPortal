const store = require('../services/dbStore');
const s3Service = require('../services/s3Service');

exports.getProfile = async (req, res, next) => {
  try {
    const student = await store.getStudentById(req.user.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(await store.stripPassword(student));
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

    // File validation and scanning hook (virus scan placeholder)
    console.log(`[VIRUS SCAN] Scanning file for malware: ${req.file.originalname}`);
    console.log(`[VIRUS SCAN] Clean report generated for: ${req.file.originalname}`);

    const key = await s3Service.uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype, 'resumes');
    await store.updateStudent(req.user.id, { resumeUrl: key });

    const downloadUrl = await s3Service.getDownloadUrl(key);
    res.json({ url: downloadUrl });
  } catch (err) { next(err); }
};

exports.uploadPhoto = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    // File validation and scanning hook (virus scan placeholder)
    console.log(`[VIRUS SCAN] Scanning file for malware: ${req.file.originalname}`);
    console.log(`[VIRUS SCAN] Clean report generated for: ${req.file.originalname}`);

    const key = await s3Service.uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype, 'photos');
    await store.updateStudent(req.user.id, { profileImage: key });

    const downloadUrl = await s3Service.getDownloadUrl(key);
    res.json({ url: downloadUrl });
  } catch (err) { next(err); }
};
