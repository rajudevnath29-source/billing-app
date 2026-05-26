const roleMiddleware = (roles) => {
  return (req, res, next) => {
    try {
      // req.user comes from authMiddleware
      const userRole = req.user.role;

      if (!roles.includes(userRole)) {
        return res.status(403).json({
          message: "Access denied: insufficient permissions"
        });
      }

      next();

    } catch (error) {
      return res.status(500).json({
        message: "Role check failed",
        error: error.message
      });
    }
  };
};

module.exports = roleMiddleware;