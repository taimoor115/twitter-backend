import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middlware.js";
import {
  commentOnPost,
  deleteComment,
  editComment,
} from "../controllers/comment.controller.js";
import { isAuthor } from "../middleware/isAuthor.middleware.js";
const router = Router();

router.route("/createComment/:postId").post(verifyJWT, commentOnPost);
router.route("/deleteComment/:id/:commentId").delete(verifyJWT, deleteComment);
router.route("/editComment/:commentId").patch(verifyJWT, isAuthor, editComment);

export default router;
