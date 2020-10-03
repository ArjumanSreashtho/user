const router = require("express").Router();

const {
  getUsers,
  userProfile,
  userDelete,
} = require("../controllers/userController");
const { requireLogin, isAdmin } = require("../middleware/userMiddleware");

router.get("/users", getUsers);
router.get("/users/me", requireLogin, userProfile);
router.delete("/users/:id", requireLogin, isAdmin, userDelete);

exports.user = router;
