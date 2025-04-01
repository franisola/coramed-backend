import { z } from "zod";

/**
 * Middleware para validar datos de entrada usando un esquema de Zod.
 * @param {z.ZodSchema} schema - Esquema de Zod para validar los datos.
 * @param {String} [source="body"] - Fuente de los datos a validar: "body", "params", o "query".
 * @returns {Function} Middleware de Express.
 */
export const validateSchema = (schema, source = "body") => (req, res, next) => {
    try {
        // Validar los datos de la fuente especificada (body, params, query)
        schema.parse(req[source]);
        next();
    } catch (error) {
        if (error instanceof z.ZodError) {
            // Formatear los errores de Zod para una respuesta clara
            return res.status(400).json({
                message: "Error de validación",
                errors: error.errors.map((errorDetail) => ({
                    field: errorDetail.path.join("."), // Soporte para rutas anidadas
                    error: errorDetail.message,
                })),
            });
        }

        // Pasar otros errores al middleware de manejo de errores
        next(error);
    }
};