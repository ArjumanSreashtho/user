const jwt = require("jsonwebtoken");

const keys = require("../config/keys");
const { User } = require("../models/userModel");

exports.requireLogin = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    const decoded = await jwt.verify(token, keys.JWT_KEY);
    req.profile = decoded;
  } catch (error) {
    return res.json({ error: error.message });
  }
  next();
};

exports.isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.profile._id).select("-hashPassword");
    if (user.role !== 1) {
      return res.status(400).json({ error: "Access denied." });
    }
  } catch (error) {
    res.json({ error: error.message });
  }
  next();
};

exports.isAuthenticate = async (req, res, next) => {
  const user = await User.findById(req.profile._id).select("-hashPassword");
  if (user.verify.success) {
    next();
  } else {
    return res.json({
      error:
        "User is not verified. Please check your email and insert the verification code.",
    });
  }
};

exports.redirectHome = (req, res) => {
  res.redirect(`${keys.DOMAIN}:${keys.PORT}`);
};
