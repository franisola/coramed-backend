import { Router } from "express";
import * as appointmentController from "../controllers/appointment.controller.js";
import { authRequired } from "../jwt/auth.service.js";

const router = Router();

/**
 * @route GET /:appointmentId
 * @desc Get a specific appointment
 * @access Private
 */
router.get("/:appointmentId", authRequired, appointmentController.getAppointmentById);

/**
 * @route POST /
 * @desc Create a new appointment
 * @access Private
 */
router.post("/", authRequired, appointmentController.createAppointment);

/**
 * @route PUT /:appointmentId/status
 * @desc Update the status of an appointment
 * @access Private
 */
router.put("/:appointmentId/status", authRequired, appointmentController.updateAppointmentStatus);

/**
 * @route PUT /:appointmentId/results
 * @desc Add study results to an appointment
 * @access Private
 */
router.put("/:appointmentId/results", authRequired, appointmentController.addStudyResults);

/**
 * @route DELETE /:appointmentId
 * @desc Delete an appointment
 * @access Private
 */
router.delete("/:appointmentId", authRequired, appointmentController.deleteAppointment);

export default router;