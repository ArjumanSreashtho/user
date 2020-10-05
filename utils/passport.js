const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const { User } = require("../models/userModel");
const keys = require("../config/keys");
const { check } = require("express-validator");

passport.use(
  new GoogleStrategy(
    {
      clientID: keys.GOOGLE_CLIENT_ID,
      clientSecret: keys.GOOGLE_CLIENT_SECRET,
      callbackURL: `${keys.DOMAIN}:${keys.PORT}/api/google/callback`,
    },
    async (accessToken, refreshToken, profile, cb) => {
      const name = profile._json.name;
      const username = profile._json.name;
      const email = profile._json.email;
      const userImage = profile._json.picture;
      try {
        let userChange = false;
        const user = await User.findOne({ email });
        if (user) {
          if (name !== user.name) {
            user.name = name;
            userChange = true;
          }
          if (username !== user.username) {
            user.username = username;
            userChange = true;
          }
          if (userImage !== user.userImage) {
            user.userImage = userImage;
            userChange = true;
          }
          if (userChange) {
            await user.save();
          }
          return cb(null, user);
        } else {
          const newUser = await new User({
            name,
            username,
            email,
            userImage,
            verify: {
              success: true,
              code: "google",
            },
          }).save();
          return cb(null, newUser);
        }
      } catch (error) {
        return error;
      }
    }
  )
);
