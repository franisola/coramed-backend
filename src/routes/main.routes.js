import { Router } from "express";
import userRoutes from "./user.routes.js";
import obraSocialRoutes from "./obraSocial.routes.js";
import infoMedicaRoutes from "./infoMedica.routes.js";
import authRoutes from "./auth.routes.js";
import turnoRoutes from "./turno.routes.js";

const router = Router();

// Rutas de autenticación
router.use("/auth", authRoutes);

// Rutas de usuario
router.use("/user", userRoutes);

// Rutas de obra social
router.use("/obra-social", obraSocialRoutes);

// Rutas de información médica
router.use("/info-medica", infoMedicaRoutes);

// Rutas de turnos
router.use("/turnos", turnoRoutes);

export default router;