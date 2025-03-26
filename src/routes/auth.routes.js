import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import * as auth from '../jwt/auth.service.js';

const router = Router();

// Autenticación
router.post('/register', auth.authNotRequired, authController.createUser);
router.post('/login', auth.authNotRequired, authController.loginUser);
router.post('/recover-password', auth.authNotRequired, authController.recoverPassword);
router.post('/reset-password', auth.authNotRequired, authController.resetPassword);
// Cerrar sesión
router.post('/logout', auth.authRequired, authController.logoutUser);

export default router;