const { getEffectivePermissionNames } = require("../utils/access");

module.exports = (permission) => {
  return async (req, res, next) => {
    try {
      const user = req.user;

      // SUPER ADMIN
      if (user.role === "SUPER_ADMIN") {
        return next();
      }

      const userPermissions = await getEffectivePermissionNames(user);

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
