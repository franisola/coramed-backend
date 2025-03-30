import { Router } from "express";
import userRoutes from "./user.routes.js";
import healthInsuranceRoutes from "./healthInsurance.routes.js";
import medicalInfoRoutes from "./medicalInfo.routes.js";
import authRoutes from "./auth.routes.js";
import appointmentRoutes from "./appointment.routes.js";
import professionalRoutes from "./professional.routes.js"; 

const router = Router();

/**
 * @route /auth
 * @desc Authentication routes
 */
router.use("/auth", authRoutes);

/**
 * @route /user
 * @desc User routes
 */
router.use("/user", userRoutes);

/**
 * @route /health-insurance
 * @desc Health insurance routes
 */
router.use("/health-insurance", healthInsuranceRoutes);

/**
 * @route /medical-info
 * @desc Medical information routes
 */
router.use("/medical-info", medicalInfoRoutes);

/**
 * @route /appointments
 * @desc Appointment routes
 */
router.use("/appointments", appointmentRoutes);

/**
 * @route /professionals
 * @desc Professional routes
 */
router.use("/professionals", professionalRoutes);

export default router;