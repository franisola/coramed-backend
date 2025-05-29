import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { authRequired, authNotRequired } from '../jwt/auth.service.js';
import { validateSchema } from '../middlewares/validator.middleware.js';
import {
	registerUserSchema,
	loginUserSchema,
	recoverPasswordSchema,
	resetPasswordSchema,
	deleteUserSchema,
} from '../schemas/auth.schema.js';

const router = Router();

/**
 * @route POST /auth/register
 * @desc Register a new user
 * @access Public
 */
router.post(
	'/register',
	authNotRequired,
	validateSchema(registerUserSchema),
	authController.createUser
);

/**
 * @route POST /auth/login
 * @desc Log in
 * @access Public
 */
router.post('/login', authNotRequired, validateSchema(loginUserSchema), authController.loginUser);

/**
 * @route POST /auth/recover-password
 * @desc Recover password
 * @access Public
 */
router.post(
	'/recover-password',
	authNotRequired,
	validateSchema(recoverPasswordSchema),
	authController.recoverPassword
);

/**
 * @route POST /auth/reset-password
 * @desc Reset password
 * @access Public
 */
router.post(
	'/reset-password',
	authNotRequired,
	validateSchema(resetPasswordSchema),
	authController.resetPassword
);

/**
 * @route POST /auth/logout
 * @desc Log out
 * @access Private
 */
router.post('/logout', authRequired, authController.logoutUser);

/**
 * @route DELETE /auth/delete-account
 * @desc Delete user account
 * @access Private
 */
router.delete(
	'/delete-account',
	authRequired,
	validateSchema(deleteUserSchema),
	authController.deleteAccount
);

router.get('/me', authRequired, authController.getSessionUser);

export default router;
