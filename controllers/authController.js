const fs = require("fs");
const { promisify } = require("util");
const unlinkAsync = promisify(fs.unlink);
const passport = require("passport");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { User } = require("../models/userModel");
const { sendEmail } = require("../utils/mailgun");
const keys = require("../config/keys");

exports.register = async (req, res) => {
  try {
    const { name, username, email, password, role } = req.body;
    const userImage = req.file.path;
    const verificationCode = Math.floor(100000 + Math.random() * 900000);
    let valid = await User.findOne({ username });
    if (valid) {
      await unlinkAsync(req.file.path);
      return res.status(400).json({ error: "Username already exits." });
    }
    // valid = await User.findOne({ email });
    // if (valid) {
    //   await unlinkAsync(req.file.path);
    //   return res.status(400).json({ error: "Email already exits." });
    // }
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
    const token = await jwt.sign(
      { _id: user._id, username: username },
      keys.JWT_KEY
    );
    const verification = sendEmail(verificationCode, email);
    if (verification && verification.error) {
      return res.json({ error: verification.error });
    }
    res.cookie("token", token, { expire: new Date() + 2592000 });
    res.send(true);
  } catch (error) {
    await unlinkAsync(req.file.path);
    return res.json({ error: error.message });
  }
};

exports.login = async (req, res) => {
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

    const token = await jwt.sign(
      { _id: validUser._id, username: username },
      keys.JWT_KEY
    );
    res.cookie("token", token, { expire: new Date() + 2592000 });
    res.send(true);
  } catch (error) {
    return res.json({ error: error.message });
  }
};

exports.userVerification = async (req, res) => {
  // console.log(req.profile._id);
  const user = await User.findById(req.profile._id);
  // console.log(req.params.verificationCode);
  console.log(req.params.verificationCode, user.verify.code);
  if (user.verify.code === Number(req.params.verificationCode)) {
    user.verify.success = true;
    await user.save();
    console.log("oauiefhioauhf", user.verify.success);
    res.redirect(`${keys.DOMAIN}:${keys.PORT}`);
  } else {
    return res.status(400).json({ error: "Incorrect verification code" });
  }
};

// exports.googleAuth = passport.authenticate("google", {
//   scope: ["email", "profile"],
// });

// exports.googleAuthCallback = (req, res) => {
//   passport.authenticate("google", { failureRedirect: "/login" }),
//     function (req, res) {
//       // Successful authentication, redirect home.
//       res.redirect("/");
//     };
// };
