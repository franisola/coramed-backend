import { Router } from "express";

import * as userController from "../controllers/user.controller.js";

const router = Router();

//Autenticacion
router.post("/register", userController.createUser);
router.post("/login", userController.loginUser);
router.post("/recover-password", userController.recoverPassword);

//CRUD
router.get("/users/:id", userController.getUserProfile);
router.put("/users/:id", userController.updateUserProfile);
router.delete("/users/:id", userController.deleteUser);

// Historial de turnos
router.get("/users/:id/turnos", userController.getUserAppointments);

// Notificaciones
router.get("/users/:id/notificaciones", userController.getUserNotifications);


export default router;