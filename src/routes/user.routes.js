import { Router } from "express";

import * as userController from "../controllers/user.controller";


const router = Router();

//Autenticacion
router.post("/register", userController.createUser);
router.post("/login", userController.loginUser);
router.post("/recover-password", userController.recoverPassword);

//CRUD
router.get("/users/:id", getUserProfile);
router.put("/users/:id", updateUserProfile);
router.delete("/users/:id", deleteUser);

// Historial de turnos
router.get("/users/:id/turnos", getUserAppointments);

// Notificaciones
router.get("/users/:id/notificaciones", getUserNotifications);


export default router;