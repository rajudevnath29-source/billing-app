const User = require("../models/User");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const PERMISSIONS = require("../constants/permissions");

// ==========================
// REGISTER
// ==========================
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // CHECK USER
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    // ==========================
    // DEFAULT PERMISSIONS
    // ==========================
    let permissions = [];

    // SUPER ADMIN
    if (role === "SUPER_ADMIN") {
      permissions = [];
    }

    // EMPLOYEE DEFAULT
    else {
      permissions = [PERMISSIONS.DASHBOARD_ACCESS];
    }

    // CREATE USER
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      permissions,
    });

    res.status(201).json({
      message: "User registered successfully",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        profile_image: user.profile_image,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ==========================
// LOGIN
// ==========================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // CHECK USER
    const user = await User.findOne({ email }).populate("permissions");

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    // CHECK PASSWORD
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    // TOKEN
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );

    // RESPONSE
    res.json({
      message: "Login successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,

        permissions: user.permissions,

        profile_image: user.profile_image,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ==========================
// GET PROFILE
// ==========================
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("permissions").select("-password");

    res.json(user);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================
// UPDATE PROFILE IMAGE
// ==========================
exports.updateProfileImage = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("permissions");

    user.profile_image = req.file.filename;

    await user.save();

    res.json({
      message: "Profile updated",

      user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
