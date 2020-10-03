const jwt = require("jsonwebtoken");

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
