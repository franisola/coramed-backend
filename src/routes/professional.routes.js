import { Router } from "express";
import {
    createProfessional,
    getSpecialties,
    getProfessionalsBySpecialty,
    getAvailableSchedules,
    updateProfessional,
    deleteProfessional,
    getProfessionalById,
} from "../controllers/profesional.controller.js";

const router = Router();

/**
 * @route POST /professionals
 * @desc Create a new professional
 * @access Public
 */
router.post("/", createProfessional);

/**
 * @route GET /professionals/specialties
 * @desc Get all unique specialties
 * @access Public
 */
router.get("/specialties", getSpecialties);

/**
 * @route GET /professionals/specialty/:especialidad
 * @desc Get professionals by specialty
 * @access Public
 */
router.get("/specialty/:especialidad", getProfessionalsBySpecialty);

/**
 * @route GET /professionals/:profesionalId/schedules
 * @desc Get available schedules for a professional on a specific date
 * @access Public
 */
router.get("/:profesionalId/schedules", getAvailableSchedules);

/**
 * @route GET /professionals/:profesionalId
 * @desc Get a professional by ID
 * @access Public
 */
router.get("/:profesionalId", getProfessionalById);

/**
 * @route PUT /professionals/:profesionalId
 * @desc Update a professional's information
 * @access Public
 */
router.put("/:profesionalId", updateProfessional);

/**
 * @route DELETE /professionals/:profesionalId
 * @desc Delete a professional
 * @access Public
 */
router.delete("/:profesionalId", deleteProfessional);

export default router;