const jwt = require('jsonwebtoken');

module.exports = function userAuth(req, res, next) {
  try {
    // Check Authorization header first, then cookie
    let token = req.headers.authorization?.split(' ')[1];
    if (!token && req.cookies && req.cookies.user_token) {
      token = req.cookies.user_token;
    }
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}
