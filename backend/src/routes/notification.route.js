import { Router } from "express";
import {
  deleteNotifications,
  getNotifications,
} from "../controllers/notification.controller.js";
import { verifyJWT } from "../middleware.js/auth.middlware.js";

const router = Router();

router.route("/getNotifications").get(verifyJWT, getNotifications);
router.route("/deleteNotifications").delete(verifyJWT, deleteNotifications);

export default router;
