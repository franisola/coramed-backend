import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import * as auth from '../jwt/auth.service.js';

const router = Router();

// Autenticación
router.post('/register', authController.createUser);
router.post('/login', authController.loginUser);
router.post('/recover-password', authController.recoverPassword);

export default router;