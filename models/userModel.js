const mongoose = require("mongoose");

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

exports.User = mongoose.model("User", userSchema);
