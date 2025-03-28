import { Router } from "express";
import * as obraSocialController from "../controllers/obraSocial.controller.js";
import { authRequired } from "../jwt/auth.service.js";

const router = Router();

// Obtener la obra social del usuario
router.get("/", authRequired, obraSocialController.getHealthInsurance);

// Crear o actualizar la obra social del usuario
router.put("/", authRequired, obraSocialController.upsertHealthInsurance);

// Eliminar la obra social del usuario
router.delete("/", authRequired, obraSocialController.deleteHealthInsurance);

export default router;