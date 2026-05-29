const Permission = require("../models/Permission");

// CREATE
exports.createPermission = async (req, res) => {
  try {
    const permission = await Permission.create(req.body);

    res.json({
      message: "Permission created",
      permission,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET ALL
exports.getPermissions = async (req, res) => {
  try {
    const permissions = await Permission.find().sort({
      module: 1,
    });

    res.json(permissions);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
