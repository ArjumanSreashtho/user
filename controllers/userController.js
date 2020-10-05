const fs = require("fs");
const { promisify } = require("util");
const unlinkAsync = promisify(fs.unlink);

const { User } = require("../models/userModel");

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-hashPassword");
    if (users.length === 0) {
      return res.send("No user found");
    }
    res.json({ users: users });
  } catch (error) {
    res.json({ error: error.message });
  }
};

exports.userProfile = async (req, res) => {
  try {
    const user = await User.findById(req.profile._id).select("-hashPassword");
    res.json(user);
  } catch (error) {
    res.json({ error: error.message });
  }
};

exports.userDelete = async (req, res) => {
  try {
    let response = await User.findById(req.params.id);
    if (!response) {
      return res.send("User not found.");
    }
    await User.deleteOne({ _id: req.params.id });
    res.send(`User has been deleted.`);
  } catch (error) {
    res.json({ error: error.message });
  }
};

exports.userUpdate = async (req, res) => {
  try {
    const user = await User.findById(req.profile._id);

    if (user.verify.code === "google") {
      return res.json({
        error:
          "Google user can not change anything. If user update google profile it will be updated automatically.",
      });
    }

    if (req.body.email) {
      return res.json({ error: "Sorry!! You can not change email address" });
    }

    user.name = req.body.name ? req.body.name : user.name;
    user.username = req.body.username ? req.body.username : user.username;
    user.role = req.body.role ? req.body.role : user.role;
    if (req.file) {
      if (user.userImage) {
        await unlinkAsync(user.userImage);
      }
      user.userImage = req.file.path;
    }
    await user.save();
    res.send("User has been updated");
  } catch (error) {
    await unlinkAsync(req.file.path);
    res.json({ error: error.message });
  }
};
