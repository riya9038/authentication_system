const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
// router.get("/", homeController.home);
router.get("/", userController.signUp);
router.use("/user", require("./user"));

module.exports = router;
