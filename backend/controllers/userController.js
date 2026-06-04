const User = require("../models/User");

const buildUserAccessPayload = (user) => {
  if (user.role === "SUPER_ADMIN") {
    return {
      ...user.toObject(),
      permissions: [],
      directPermissions: [],
      rolePermissions: [],
    };
  }

  return {
    ...user.toObject(),
    directPermissions: user.permissions || [],
  };
};

// GET USERS
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .populate("permissions")
      .select("-password");
    const result = users.map(buildUserAccessPayload);

    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET SINGLE USER
exports.getSingleUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("permissions")
      .select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(buildUserAccessPayload(user));
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// UPDATE USER
// exports.updateUser = async (req, res) => {
//   try {
//     const { name, email } = req.body;

//     const user = await User.findById(req.params.id);

//     if (!user) {
//       return res.status(404).json({
//         message: "User not found",
//       });
//     }

//     user.name = name;
//     user.email = email;

//     await user.save();

//     res.json({
//       message: "User updated successfully",
//       user,
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: error.message,
//     });
//   }
// };
exports.updateUser = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      permissions:
        req.body.role === "SUPER_ADMIN" ? [] : req.body.permissions || [],
    };

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: payload },
      { new: true },
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// UPDATE USER ACCESS
exports.updateUserAccess = async (req, res) => {
  try {
    const { roles, permissions } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.roles = roles || [];

    user.permissions = permissions || [];

    await user.save();

    res.json({
      message: "User access updated",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// DELETE USER
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    await user.deleteOne();

    res.json({
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
