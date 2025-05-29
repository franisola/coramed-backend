import { Router } from "express";
import userRoutes from "./user.routes.js";
import healthInsuranceRoutes from "./healthInsurance.routes.js";
import medicalInfoRoutes from "./medicalInfo.routes.js";
import authRoutes from "./auth.routes.js";
import appointmentRoutes from "./appointment.routes.js";
import professionalRoutes from "./professional.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/health-insurance", healthInsuranceRoutes);
router.use("/medical-info", medicalInfoRoutes);
router.use("/appointments", appointmentRoutes);
router.use("/professionals", professionalRoutes);

export default router;
