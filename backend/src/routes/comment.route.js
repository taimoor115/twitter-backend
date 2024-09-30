import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middlware.js";
import {
  commentOnPost,
  deleteComment,
} from "../controllers/comment.controller.js";
const router = Router();

router.route("/createComment/:postId").post(verifyJWT, commentOnPost);
router.route("/deleteComment/:id/:commentId").delete(verifyJWT, deleteComment);

export default router;
