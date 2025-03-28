import { Router } from "express";
import * as infoMedicaController from "../controllers/infoMedica.controller.js";
import { authRequired } from "../jwt/auth.service.js";

const router = Router();

// Obtener la información médica del usuario
router.get("/", authRequired, infoMedicaController.getMedicalInfo);

// Crear o actualizar la información médica del usuario
router.put("/", authRequired, infoMedicaController.upsertMedicalInfo);

// Eliminar la información médica del usuario
router.delete("/", authRequired, infoMedicaController.deleteMedicalInfo);

export default router;