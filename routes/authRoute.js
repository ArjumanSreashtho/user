const router = require("express").Router();
const passport = require("passport");

const { userImage } = require("../middleware/imageMiddleware");

const {
  requireLogin,
  isAuthenticate,
  redirectHome,
} = require("../middleware/userMiddleware");

const {
  register,
  login,
  googleAuth,
  userVerification,
  userUpdatePassword,
} = require("../controllers/authController");

router.post("/register", userImage, register);
router.post("/login", login, requireLogin, isAuthenticate, redirectHome);
router.get("/verification/:verificationCode", requireLogin, userVerification);
router.post(
  "/password/update",
  requireLogin,
  isAuthenticate,
  userUpdatePassword
);
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["email", "profile"],
  })
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  googleAuth
);
exports.auth = router;
