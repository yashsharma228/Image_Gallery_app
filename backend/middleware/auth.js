const jwt = require('jsonwebtoken');

const getTokenFromRequest = (req, cookieName) => {
  const cookieToken = req.cookies?.[cookieName];
  if (cookieToken) {
    return cookieToken;
  }

  const customHeaderToken = req.headers['x-auth-token'] || req.headers['x-access-token'];
  if (typeof customHeaderToken === 'string' && customHeaderToken.trim()) {
    return customHeaderToken.trim();
  }

  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || typeof authHeader !== 'string') {
    return null;
  }

  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return null;
  }

  return token;
};

const adminAuth = (req, res, next) => {
  try {
    const token = getTokenFromRequest(req, 'admin_token');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
    req.adminId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const userAuth = (req, res, next) => {
  try {
    const token = getTokenFromRequest(req, 'user_token');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = { adminAuth, userAuth, getTokenFromRequest };
