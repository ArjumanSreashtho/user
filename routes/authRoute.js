const router = require("express").Router();
const passport = require("passport");

const { userImage } = require("../middleware/imageMiddleware");

const { requireLogin } = require("../middleware/userMiddleware");

const {
  register,
  login,
  userVerification,
  googleAuth,
  googleAuthCallback,
} = require("../controllers/authController");

router.post("/register", userImage, register);
router.post("/login", login);
router.get("/verification/:verificationCode", requireLogin, userVerification);
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["email", "profile"],
  })
);
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    console.log(req.user);
    res.redirect("/");
  }
);
exports.auth = router;
