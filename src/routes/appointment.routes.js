import { Router } from "express";
import * as appointmentController from "../controllers/appointment.controller.js";
import { authRequired } from "../jwt/auth.service.js";
import { validateSchema } from "../middlewares/validator.middleware.js";
import {
    createAppointmentSchema,
    updateAppointmentStatusSchema,
    addStudyResultsSchema,
    deleteAppointmentSchema,
} from "../schemas/appointment.schema.js";

const router = Router();

/**
 * @route POST /
 * @desc Create a new appointment
 * @access Private
 */
router.post(
    "/",
    authRequired,
    validateSchema(createAppointmentSchema), // Valida req.body
    appointmentController.createAppointment
);

/**
 * @route GET /:appointmentId
 * @desc Get a specific appointment
 * @access Private
 */
router.get("/:appointmentId", authRequired, appointmentController.getAppointmentById);

/**
 * @route PUT /:appointmentId/status
 * @desc Update the status of an appointment
 * @access Private
 */
router.put(
    "/:appointmentId/status",
    authRequired,
    validateSchema(updateAppointmentStatusSchema), // Valida req.body
    appointmentController.updateAppointmentStatus
);

/**
 * @route PUT /:appointmentId/results
 * @desc Add study results to an appointment
 * @access Private
 */
router.put(
    "/:appointmentId/results",
    authRequired,
    validateSchema(addStudyResultsSchema), // Valida req.body
    appointmentController.addStudyResults
);

/**
 * @route DELETE /:appointmentId
 * @desc Delete an appointment
 * @access Private
 */
router.delete(
    "/:appointmentId",
    authRequired,
    validateSchema(deleteAppointmentSchema), // Valida req.body (aunque no requiere datos)
    appointmentController.deleteAppointment
);

export default router;