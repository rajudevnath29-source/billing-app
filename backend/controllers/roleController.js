const Role = require("../models/Role");

// CREATE ROLE
exports.createRole = async (req, res) => {
  try {
    const role = await Role.create(req.body);

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
    const roles = await Role.find();

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

    role.name = req.body.name;
    role.permissions = req.body.permissions;

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
