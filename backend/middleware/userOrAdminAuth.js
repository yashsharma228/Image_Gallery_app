const jwt = require('jsonwebtoken');

// Middleware to allow either user or admin authentication
module.exports = function userOrAdminAuth(req, res, next) {
  try {
    let token = req.headers.authorization?.split(' ')[1];
    if (!token && req.cookies && req.cookies.user_token) {
      token = req.cookies.user_token;
    }
    if (!token && req.cookies && req.cookies.admin_token) {
      token = req.cookies.admin_token;
    }
    if (!token) {
      return res.status(401).json({ message: 'Authentication required. Please sign in.' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.userId) {
      req.userId = decoded.userId;
    } else if (decoded.role === 'admin' && decoded.id) {
      req.adminId = decoded.id;
    } else {
      return res.status(401).json({ message: 'Invalid token type.' });
    }
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Session expired. Please sign in again.' });
  }
}
