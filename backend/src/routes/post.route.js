import { Router } from "express";
import { verifyJWT } from "../middleware.js/auth.middlware.js";
import { createPost, deletePost } from "../controllers/post.controller.js";
import { upload } from "../middleware.js/multer.middleware.js";

const router = Router();

router.route("/createPost").post(upload.single("image"), verifyJWT, createPost);
router.route("/deletePost/:id").delete(verifyJWT, deletePost);

export default router;
