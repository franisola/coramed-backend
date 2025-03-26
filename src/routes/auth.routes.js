import { Router } from 'express';
import * as userController from '../controllers/auth.controller.js';

const router = Router();

// Autenticación
router.post('/register', userController.createUser);
router.post('/login', userController.loginUser);
router.post('/recover-password', userController.recoverPassword);
