import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middlware.js";
import { createPost, deletePost } from "../controllers/post.controller.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();

router.route("/createPost").post(upload.single("image"), verifyJWT, createPost);
router.route("/deletePost/:id").delete(verifyJWT, deletePost);

export default router;
