import { Router } from "express";
import {
  changePassword,
  followUnfollowUser,
  getSuggestedUser,
  getUserProfile,
} from "../controllers/user.contoller.js";
import { verifyJWT } from "../middleware.js/auth.middlware.js";
const router = Router();

router.route("/getProfile/:username").get(verifyJWT, getUserProfile);
router.route("/follow/:id").post(verifyJWT, followUnfollowUser);
router.route("/getSuggestedUser").get(verifyJWT, getSuggestedUser);
router.route("/changedPassword").post(verifyJWT, changePassword);
export default router;
