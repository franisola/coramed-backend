import { Router } from "express";
import * as turnoController from "../controllers/turno.controller.js";
import { authRequired } from "../jwt/auth.service.js";

const router = Router();

// Obtener un turno específico
router.get("/:turnoId", authRequired, turnoController.getTurnoById);

// Crear un nuevo turno
router.post("/", authRequired, turnoController.createTurno);

// Actualizar el estado de un turno
router.put("/:turnoId/estado", authRequired, turnoController.updateTurnoEstado);

// Agregar resultados de estudios a un turno
router.put("/:turnoId/resultados", authRequired, turnoController.addResultadosEstudios);

// Eliminar un turno
router.delete("/:turnoId", authRequired, turnoController.deleteTurno);

export default router;