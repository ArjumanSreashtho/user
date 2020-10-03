const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const { User } = require("../models/userModel");
const keys = require("../config/keys");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

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
        const user = await User.findOne({ email });
        if (user) {
          cb(null, user);
        } else {
          const newUser = await new User({
            name,
            username,
            email,
            userImage,
          }).save();
          cb(null, newUser);
        }
      } catch (error) {
        return error;
      }
    }
  )
);
