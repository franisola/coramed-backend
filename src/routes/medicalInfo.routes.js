import { Router } from "express";
import * as medicalInfoController from "../controllers/medicalInfo.controller.js";
import { authRequired } from "../jwt/auth.service.js";

const router = Router();

/**
 * @route GET /medical-info
 * @desc Get the user's medical information
 * @access Private
 */
router.get("/", authRequired, medicalInfoController.getMedicalInfo);

/**
 * @route PUT /medical-info
 * @desc Create or update the user's medical information
 * @access Private
 */
router.put("/", authRequired, medicalInfoController.upsertMedicalInfo);

/**
 * @route DELETE /medical-info
 * @desc Delete the user's medical information
 * @access Private
 */
router.delete("/", authRequired, medicalInfoController.deleteMedicalInfo);

export default router;