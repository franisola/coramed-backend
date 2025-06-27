// middlewares/error.middleware.js
export const errorHandler = (err, req, res, next) => {
	const status = err.statusCode || 500;
	const message = err.message || "Error del servidor";

	// Manejo especial para errores de Zod (validación)
	if (err.errors && Array.isArray(err.errors)) {
		return res.status(status).json({
			success: false,
			message,
			errors: err.errors, // ya está formateado desde validateSchema
		});
	}

	// Errores personalizados y otros
	res.status(status).json({
		success: false,
		message,
		code: err.code || null,
		statusCode: status,
	});
};
