// Restricts access to the listed roles. Usage: authorize('admin')
const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    res.status(403);
    throw new Error(`Access denied. Requires role: ${roles.join(' or ')}`);
  }
  next();
};

module.exports = { authorize };
