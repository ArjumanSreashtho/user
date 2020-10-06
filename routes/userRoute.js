const router = require("express").Router();

const { userImage } = require("../middleware/imageMiddleware");

const {
  getUsers,
  userProfile,
  userDelete,
  userUpdate,
  logout,
} = require("../controllers/userController");
const {
  requireLogin,
  isAuthenticate,
  isAdmin,
} = require("../middleware/userMiddleware");

router.get("/users", getUsers);
router.get("/users/me", requireLogin, isAuthenticate, userProfile);
router.delete("/users/:id", requireLogin, isAuthenticate, isAdmin, userDelete);
router.put(
  "/users/update",
  requireLogin,
  isAuthenticate,
  userImage,
  userUpdate
);
router.get("/users/logout", requireLogin, isAuthenticate, logout);

exports.user = router;
