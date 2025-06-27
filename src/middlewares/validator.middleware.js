import { z } from 'zod';

/**
 * Middleware para validar datos de entrada usando un esquema de Zod.
 * @param {z.ZodSchema} schema - Esquema de Zod para validar los datos.
 * @param {String} [source="body"] - Fuente de los datos a validar: "body", "params", o "query".
 * @returns {Function} Middleware de Express.
 */
export const validateSchema =
	(schema, source = 'body') =>
	(req, res, next) => {
		try {
			schema.parse(req[source]);
			next();
		} catch (error) {
			if (error instanceof z.ZodError) {
				return res.status(400).json({
					success: false,
					message: 'Error de validación',
					errors: error.errors.map((errorDetail) => ({
						field: errorDetail.path.join('.'),
						message: errorDetail.message,
					})),
				});
			}
			next(error);
		}
	};
