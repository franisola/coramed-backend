import { Router } from "express";
import * as healthInsuranceController from "../controllers/healthInsurance.controller.js";
import { authRequired } from "../jwt/auth.service.js";

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
router.put("/", authRequired, healthInsuranceController.upsertHealthInsurance);

/**
 * @route DELETE /health-insurance
 * @desc Delete the user's health insurance
 * @access Private
 */
router.delete("/", authRequired, healthInsuranceController.deleteHealthInsurance);

export default router;