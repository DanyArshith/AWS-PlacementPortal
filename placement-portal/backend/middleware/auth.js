const jwt = require('jsonwebtoken');

exports.required = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' });
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch (err) { return res.status(401).json({ message: 'Invalid token' }); }
};

exports.admin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' });
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch (err) { return res.status(401).json({ message: 'Invalid token' }); }
};
