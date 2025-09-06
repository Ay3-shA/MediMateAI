// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET || 'dev_secret_change_me';

module.exports = function (req, res, next) {
  const authHeader = req.header('Authorization') || req.header('x-auth-token');
  if (!authHeader) return res.status(401).json({ msg: 'No token, authorization denied' });

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    return next();
  } catch (err) {
    console.error('authMiddleware verify error:', err);
    return res.status(401).json({ msg: 'Token is not valid' });
  }
};
