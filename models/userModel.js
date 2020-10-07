const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const keys = require("../config/keys");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    hashPassword: {
      type: String,
    },
    role: {
      type: Number,
      default: 0,
    },
    userImage: {
      type: String,
    },
    verify: {
      success: {
        type: Boolean,
        default: false,
      },
      code: {
        type: String,
      },
    },
  },
  { timestamps: true }
);

userSchema.methods.generateToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    keys.JWT_KEY
  );
};

exports.User = mongoose.model("User", userSchema);
