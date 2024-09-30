import { Router } from "express";
import {
  loginValidation,
  userValidation,
} from "../middleware/validator.middleware.js";
import {
  forgotPassword,
  getMe,
  loginUser,
  logoutUser,
  refreshAccessToken,
  resetPassword,
  signUpUser,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middleware/auth.middlware.js";

const router = Router();


/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication API
 */

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     tags: [Auth]
 *     summary: Sign up a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               fullName:
 *                 type: string
 *               password:
 *                 type: string
 *               email:
 *                 type: string
 *             required:
 *               - username
 *               - fullName
 *               - password
 *               - email
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Invalid input
 */
router.route("/signup").post(userValidation, signUpUser);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Log in a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - username
 *               - password
 *     responses:
 *       200:
 *         description: Logged in successfully
 *       401:
 *         description: Unauthorized
 */
router.route("/login").post(loginValidation, loginUser);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Log out a user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       401:
 *         description: Unauthorized
 */
router.route("/logout").post(verifyJWT, logoutUser);

/**
 * @swagger
 * /auth/refreshAccessToken:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Access token refreshed successfully
 *       401:
 *         description: Unauthorized
 */
router.route("/refreshAccessToken").post(verifyJWT, refreshAccessToken);

/**
 * @swagger
 * /auth/forgetPassword:
 *   post:
 *     tags: [Auth]
 *     summary: Request password reset
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *             required:
 *               - email
 *     responses:
 *       200:
 *         description: Password reset email sent
 *       400:
 *         description: Invalid email
 */
router.route("/forgetPassword").post(forgotPassword);

/**
 * @swagger
 * /auth/reset-password/{token}:
 *   post:
 *     tags: [Auth]
 *     summary: Reset password
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         description: Password reset token
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *             required:
 *               - password
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid token or password
 */
router.route("/reset-password/:token").post(resetPassword);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get logged-in user's info
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.route("/me").get(verifyJWT, getMe);

export default router;
