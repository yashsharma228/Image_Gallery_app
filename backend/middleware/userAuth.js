const jwt = require('jsonwebtoken');

module.exports = function userAuth(req, res, next) {
  try {
    // Check Authorization header first
    let token = req.headers.authorization?.split(' ')[1];
    
    // Fallback to cookie if header not present
    if (!token && req.cookies && req.cookies.user_token) {
      token = req.cookies.user_token;
    }

    if (!token) {
      console.log('❌ Auth Error: No token found in headers or cookies');
      return res.status(401).json({ message: 'Authentication required. Please sign in.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Support both userId and id in token payload for better compatibility
    const userId = decoded.userId || decoded.id;
    
    if (!userId) {
      console.log('❌ Auth Error: Token payload missing userId or id');
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    req.userId = userId;
    next();
  } catch (error) {
    console.log('❌ Auth Error: JWT verification failed:', error.message);
    return res.status(401).json({ message: 'Session expired. Please sign in again.' });
  }
}
