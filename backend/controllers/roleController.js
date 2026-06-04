const Role = require("../models/Role");
const Permission = require("../models/Permission");
const { isRolePermission } = require("../utils/access");

const sanitizeRolePayload = async (body) => {
  const permissions = Array.isArray(body.permissions) ? body.permissions : [];
  const allowedPermissions = await Permission.find({
    _id: { $in: permissions },
  }).select("_id name");

  return {
    name: String(body.name || "")
      .trim()
      .toUpperCase(),
    permissions: allowedPermissions
      .filter((permission) => isRolePermission(permission.name))
      .map((permission) => permission._id),
  };
};

// CREATE ROLE
exports.createRole = async (req, res) => {
  try {
    const payload = await sanitizeRolePayload(req.body);

    if (!payload.name) {
      return res.status(400).json({
        message: "Role name is required",
      });
    }

    const role = await Role.create(payload);

    res.json({
      message: "Role created",
      role,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET ROLES
exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.find().populate("permissions");

    res.json(roles);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// UPDATE ROLE
exports.updateRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);

    if (!role) {
      return res.status(404).json({
        message: "Role not found",
      });
    }

    const payload = await sanitizeRolePayload(req.body);

    role.name = payload.name;
    role.permissions = payload.permissions;

    await role.save();

    res.json({
      message: "Role updated",
      role,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
