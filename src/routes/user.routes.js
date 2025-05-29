import { Router } from "express";
import * as userController from "../controllers/user.controller.js";
import { authRequired } from "../jwt/auth.service.js";
import { validateSchema } from "../middlewares/validator.middleware.js";
import { 
    updateUserProfileSchema, 
    deleteUserSchema 
} from "../schemas/user.schema.js";

const router = Router();

/**
 * @route GET /user/profile
 * @desc Get the user's profile
 * @access Private
 */
// router.get("/profile", authRequired, userController.getUserProfile);

/**
 * @route PUT /user/profile
 * @desc Update the user's profile
 * @access Private
 */
router.put(
    "/profile", 
    authRequired, 
    validateSchema(updateUserProfileSchema), // Valida req.body
    userController.updateUserProfile
);

/**
 * @route GET /user/profile/appointments
 * @desc Get the user's appointments (history and upcoming)
 * @access Private
 */
router.get("/profile/appointments", authRequired, userController.getUserAppointments);

/**
 * @route DELETE /user/profile
 * @desc Delete the user's account
 * @access Private
 */
router.delete(
    "/profile", 
    authRequired, 
    validateSchema(deleteUserSchema), // Valida req.body
    userController.deleteUser
);

export default router;