// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

module.exports = function (req, res, next) {
  const authHeader = req.header('Authorization') || req.header('x-auth-token');
  if (!authHeader) return res.status(401).json({ msg: 'No token, authorization denied' });

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // decoded includes userId, name, email (per controller token)
    req.user = decoded;
    return next();
  } catch (err) {
    console.error('authMiddleware verify error:', err?.message || err);
    return res.status(401).json({ msg: 'Token is not valid' });
  }
};
