// middlewares/validateDynamicUserUpdate.js

import { updatePersonalSchema, updatePasswordSchema } from "../schemas/user.schema.js";
import { validateSchema } from "./validator.middleware.js";

/**
 * Middleware dinámico que elige el esquema según los campos recibidos.
 */
export const validateDynamicUserUpdate = (req, res, next) => {
  const isPasswordChange = "password" in req.body || "confirmPassword" in req.body;
  const schema = isPasswordChange ? updatePasswordSchema : updatePersonalSchema;

  // Usamos el middleware genérico
  return validateSchema(schema)(req, res, next);
};
