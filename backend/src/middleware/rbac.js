function requireRole(...allowedRoles) {
  return (req, res, next) => {
    const role = req.user && req.user.role;
    if (!role || !allowedRoles.includes(role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient privileges' });
    }
    return next();
  };
}

module.exports = { requireRole };
