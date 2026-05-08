const roleMiddleware = (role) => {
  return (req, res, next) => {
    // Add a check to ensure req.user exists and compare case-insensitively
    if (!req.user || req.user.role.toLowerCase() !== role.toLowerCase()) {
      return res.status(403).json({ 
        message: `Access denied: Required role is ${role}, but you are ${req.user?.role}` 
      });
    }
    next();
  };
};

module.exports = roleMiddleware;