const jwt = require('jsonwebtoken');

module.exports = function userAuth(req, res, next) {
  try {
    // Debug logging for troubleshooting
    console.log('--- userAuth Debug ---');
    console.log('Authorization header:', req.headers.authorization);
    console.log('Cookies:', req.cookies);

    // Check Authorization header first, then cookie
    let token = req.headers.authorization?.split(' ')[1];
    if (!token && req.cookies && req.cookies.user_token) {
      token = req.cookies.user_token;
    }
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ message: 'No token provided' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.log('Token verification error:', error.message);
    return res.status(401).json({ message: 'Invalid token' });
  }
}
