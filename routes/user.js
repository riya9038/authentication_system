const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const passport = require("passport");

//router.get("/", passport.checkAuthentication, userController.profile);

router.get("/profile", passport.checkAuthentication, userController.profile);
router.post("/update/:id", passport.checkAuthentication, userController.update);
router.get("/signUp", userController.signUp);
router.get("/signIn", userController.signIn);
router.get("/signOut", userController.destroySession);
router.get("/reset", userController.reset);
router.post("/resetEmail", userController.resetEmail);
router.get("/resetPassword", userController.resetPassword);
router.post("/updatePassword", userController.updatePassword);
router.get("/destroy", userController.destroySession);

router.post("/create", userController.create);

router.post(
  "/createSession",
  passport.authenticate("local", { failureRedirect: "/user/signIn" }),
  userController.createSession
);
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/user/signIn" }),
  userController.profile
);

module.exports = router;
