// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const authHeader = req.header('Authorization') || req.header('x-auth-token');
  if (!authHeader) return res.status(401).json({ msg: 'No token, authorization denied' });

  let token;
  if (authHeader.startsWith('Bearer ')) token = authHeader.slice(7);
  else token = authHeader;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
