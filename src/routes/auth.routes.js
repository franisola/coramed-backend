import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { authRequired, authNotRequired } from "../jwt/auth.service.js";

const router = Router();

/**
 * @route POST /auth/register
 * @desc Register a new user
 * @access Public
 */
router.post("/register", authNotRequired, authController.createUser);

/**
 * @route POST /auth/login
 * @desc Log in
 * @access Public
 */
router.post("/login", authNotRequired, authController.loginUser);

/**
 * @route POST /auth/recover-password
 * @desc Recover password
 * @access Public
 */
router.post("/recover-password", authNotRequired, authController.recoverPassword);

/**
 * @route POST /auth/reset-password
 * @desc Reset password
 * @access Public
 */
router.post("/reset-password", authNotRequired, authController.resetPassword);

/**
 * @route POST /auth/logout
 * @desc Log out
 * @access Private
 */
router.post("/logout", authRequired, authController.logoutUser);

/**
 * @route DELETE /auth/delete-account
 * @desc Delete user account
 * @access Private
 */
router.delete("/delete-account", authRequired, authController.deleteAccount);

export default router;