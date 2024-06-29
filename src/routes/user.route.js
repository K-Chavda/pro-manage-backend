const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const verifyToken = require("../middlewares/verifyToken");

router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.patch("/update", verifyToken, userController.updateUserDetails);
router.post("/add", verifyToken, userController.addUser);
router.get("/get", verifyToken, userController.getUsers);
router.get("/details/", verifyToken, userController.getUsersById);

module.exports = router;
