import { Router } from "express";
import * as userController from "../controllers/user.controller.js";
import { authRequired } from "../jwt/auth.service.js";

const router = Router();

// Perfil del usuario (protegido)
router.get("/profile", authRequired, userController.getUserProfile);
router.put("/profile", authRequired, userController.updateUserProfile);
router.delete("/profile", authRequired, userController.deleteUser);

// Historial de turnos (protegido)
router.get("/profile/turnos", authRequired, userController.getUserAppointments);

// Notificaciones (protegido)
router.get("/profile/notificaciones", authRequired, userController.getUserNotifications);

export default router;