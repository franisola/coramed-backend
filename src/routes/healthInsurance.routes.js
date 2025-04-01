import { Router } from "express";
import * as healthInsuranceController from "../controllers/healthInsurance.controller.js";
import { authRequired } from "../jwt/auth.service.js";
import { validateSchema } from "../middlewares/validator.middleware.js";
import {
    upsertHealthInsuranceSchema,
    deleteHealthInsuranceSchema,
} from "../schemas/healthInsurance.schema.js";

const router = Router();

/**
 * @route GET /health-insurance
 * @desc Get the user's health insurance
 * @access Private
 */
router.get("/", authRequired, healthInsuranceController.getHealthInsurance);

/**
 * @route PUT /health-insurance
 * @desc Create or update the user's health insurance
 * @access Private
 */
router.put(
    "/",
    authRequired,
    validateSchema(upsertHealthInsuranceSchema), // Valida req.body
    healthInsuranceController.upsertHealthInsurance
);

/**
 * @route DELETE /health-insurance
 * @desc Delete the user's health insurance
 * @access Private
 */
router.delete(
    "/",
    authRequired,
    validateSchema(deleteHealthInsuranceSchema), // Valida req.body (aunque no requiere datos)
    healthInsuranceController.deleteHealthInsurance
);

export default router;