import passport from 'passport';

// Authenticate user with JWT
const authenticateToken = (req, res, next) => {
  console.log('authenticateToken called for:', req.method, req.path);
  console.log('Authorization header:', req.headers.authorization);
  
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      console.log('Auth error:', err);
      return res.status(500).json({ message: 'Authentication error', error: err.message });
    }
    
    if (!user) {
      console.log('No user found, info:', info);
      return res.status(401).json({ message: 'Access denied. Invalid token.' });
    }
    
    console.log('Auth successful for user:', { _id: user._id, role: user.role });
    req.user = user;
    next();
  })(req, res, next);
};

// Optional authentication - sets req.user if token is valid, but doesn't block if not
const optionalAuth = (req, res, next) => {
  console.log('optionalAuth called for:', req.method, req.path);
  console.log('Authorization header:', req.headers.authorization);
  
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      console.log('Optional auth error:', err);
    } else if (user) {
      console.log('Optional auth successful for user:', { _id: user._id, role: user.role });
      req.user = user;
    } else {
      console.log('No user in optional auth, info:', info);
      console.log('Request path:', req.path);
      console.log('Request params:', req.params);
      console.log('Authorization header format check:', req.headers.authorization ? 
        `Starts with Bearer: ${req.headers.authorization.startsWith('Bearer ')}` : 
        'No Authorization header');
    }
    next(); // Always continue, even if no user
  })(req, res, next);
};

// Check if user is admin
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Access denied. No user found.' });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
  
  next();
};

// Check if user is author or admin
const requireAuthor = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Access denied. No user found.' });
  }
  
  if (req.user.role !== 'author' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Author or Admin role required.' });
  }
  
  next();
};

// Check if user owns the resource or is admin
const requireOwnershipOrAdmin = (resourceField = 'author') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Access denied. No user found.' });
    }
    
    // Admin can access everything
    if (req.user.role === 'admin') {
      return next();
    }
    
    // Check if the resource exists and belongs to the user
    if (req.resource && req.resource[resourceField]) {
      if (req.resource[resourceField].toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied. You can only access your own resources.' });
      }
    }
    
    next();
  };
};

export {
  authenticateToken,
  optionalAuth,
  requireAdmin,
  requireAuthor,
  requireOwnershipOrAdmin
};
