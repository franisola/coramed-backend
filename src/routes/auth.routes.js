import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { authRequired, authNotRequired } from "../jwt/auth.service.js";

const router = Router();

// Crear un nuevo usuario
router.post("/register", authNotRequired, authController.createUser);

// Iniciar sesión
router.post("/login", authNotRequired, authController.loginUser);

// Recuperar contraseña
router.post("/recover-password", authNotRequired, authController.recoverPassword);

// Restablecer contraseña
router.post("/reset-password", authNotRequired, authController.resetPassword);

// Cerrar sesión (requiere autenticación)
router.post("/logout", authRequired, authController.logoutUser);

// Eliminar la cuenta del usuario (requiere autenticación)
router.delete("/delete-account", authRequired, authController.deleteAccount);

export default router;