module.exports = (permission) => {
  return async (req, res, next) => {
    try {
      const user = req.user;

      // SUPER ADMIN
      if (user.role === "SUPER_ADMIN") {
        return next();
      }

      // USER DIRECT PERMISSIONS
      const userPermissions = user.permissions?.map((p) => p.name) || [];

      // CHECK
      if (!userPermissions.includes(permission)) {
        return res.status(403).json({
          message: "Access denied",
        });
      }

      next();
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  };
};
