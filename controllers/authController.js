const fs = require("fs");
const { promisify } = require("util");
const unlinkAsync = promisify(fs.unlink);

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { User } = require("../models/userModel");
const { sendEmail } = require("../utils/mailgun");
const keys = require("../config/keys");

exports.register = async (req, res, next) => {
  try {
    const { name, username, email, password, role } = req.body;
    const userImage = req.file ? req.file.path : undefined;
    const verificationCode = Math.floor(100000 + Math.random() * 900000);
    let valid = await User.findOne({ username });
    if (valid) {
      await unlinkAsync(req.file.path);
      return res.status(400).json({ error: "Username already exits." });
    }
    valid = await User.findOne({ email });
    if (valid) {
      await unlinkAsync(req.file.path);
      return res.status(400).json({ error: "Email already exits." });
    }
    const salt = await bcrypt.genSalt(keys.SALT_ROUNDS);
    const hashPassword = await bcrypt.hash(password, salt);
    let user = new User({
      name,
      username,
      email,
      hashPassword,
      role,
      userImage,
      verify: {
        success: false,
        code: verificationCode,
      },
    });
    user = await user.save();
    const verification = sendEmail(verificationCode, email);
    if (verification && verification.error) {
      return res.json({ error: verification.error });
    }
    sendTokenResponse(user, res, next);
  } catch (error) {
    await unlinkAsync(req.file.path);
    return res.json({ error: error.message });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    let validUser = await User.findOne({ username });
    if (!validUser) {
      return res.status(400).json({ error: "Invalid username or password." });
    }

    const checkPass = await bcrypt.compare(password, validUser.hashPassword);
    if (!checkPass) {
      return res.status(400).json({ error: "Invalid username or password" });
    }
    sendTokenResponse(validUser, res, next);
  } catch (error) {
    return res.json({ error: error.message });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("token");
  res.redirect(`${keys.DOMAIN}:${keys.PORT}`);
};

exports.userVerification = async (req, res) => {
  const user = await User.findById(req.profile._id);
  if (user.verify.code === req.params.verificationCode) {
    user.verify.success = true;
    await user.save();
    res.redirect(`${keys.DOMAIN}:${keys.PORT}`);
  } else {
    return res.status(400).json({ error: "Incorrect verification code" });
  }
};

exports.userUpdatePassword = async (req, res) => {
  try {
    const { password } = req.body;
    let user = await User.findById(req.profile._id);
    const salt = await bcrypt.genSalt(keys.SALT_ROUNDS);
    const hashPassword = await bcrypt.hash(password, salt);
    if (user.verify.code === "google") {
      return res.json({ error: "Google user can not change password" });
    }
    user.hashPassword = hashPassword;
    user = await user.save();
    res.send("User password has been updated");
  } catch (error) {
    return res.json({ error: error.message });
  }
};

exports.googleAuth = async function (req, res) {
  const token = await jwt.sign({ _id: req.user._id }, keys.JWT_KEY);
  res.cookie("token", token, { expire: new Date() + 2592000 });
  res.redirect("/");
};

const sendTokenResponse = (user, res, next) => {
  const token = user.generateToken();
  res.cookie("token", token, {
    expire: new Date() + 2592000,
    httpOnly: true,
  });
  next();
};
