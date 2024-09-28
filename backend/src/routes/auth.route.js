import { Router } from "express";
import {
  loginValidation,
  userValidation,
} from "../middleware.js/validator.middleware.js";
import {
  forgotPassword,
  getMe,
  loginUser,
  logoutUser,
  refreshAccessToken,
  resetPassword,
  signUpUser,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middleware.js/auth.middlware.js";

const router = Router();

router.route("/signup").post(userValidation, signUpUser);
router.route("/login").post(loginValidation, loginUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refreshAccessToken").post(verifyJWT, refreshAccessToken);
router.route("/forgetPassword").post(forgotPassword);
router.route("/reset-password/:token").post(resetPassword);
router.route("/me").get(verifyJWT, getMe);

export default router;
