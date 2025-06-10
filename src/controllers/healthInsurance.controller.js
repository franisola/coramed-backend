import HealthInsurance from '../models/healthInsurance.model.js';
import User from '../models/user.model.js';

// Get the user's health insurance
export const getHealthInsurance = async (req, res, next) => {
	try {
		const user = await User.findById(userId).populate('obra_social');
		if (!user) {
			const error = new Error('Usuario no encontrado');
			error.statusCode = 404;
			return next(error);
		}

		res.status(200).json(user.obra_social || null);
	} catch (error) {
		next(error);
	}
};

// Create or update the user's health insurance
export const upsertHealthInsurance = async (req, res, next) => {
	try {
		const userId = req.user.id;
		const { nombre, numero_socio, plan } = req.body;

		const user = await User.findById(userId);
		if (!user) {
			const error = new Error('Usuario no encontrado');
			error.statusCode = 404;
			return next(error);
		}

		let healthInsurance = user.obra_social
			? await HealthInsurance.findById(user.obra_social)
			: new HealthInsurance();

		if (nombre) healthInsurance.nombre = nombre;
		if (numero_socio) {
			healthInsurance.numero_socio = numero_socio;
			healthInsurance.numero_socio_visible = numero_socio; // Save visible version
		}
		if (plan) healthInsurance.plan = plan;

		await healthInsurance.save();

		if (!user.obra_social) {
			user.obra_social = healthInsurance._id;
			await user.save();
		}

		res.status(200).json({ message: 'Obra social guardada exitosamente', healthInsurance });
	} catch (error) {
		next(error);
	}
};

// Delete the user's health insurance
export const deleteHealthInsurance = async (req, res, next) => {
	try {
		const userId = req.user.id;

		const user = await User.findById(userId);
		if (!user || !user.obra_social) {
			const error = new Error('Obra social no encontrada');
			error.statusCode = 404;
			return next(error);
		}

		await HealthInsurance.findByIdAndDelete(user.obra_social);
		user.obra_social = null;
		await user.save();

		res.status(200).json({ message: 'Obra social eliminada exitosamente' });
	} catch (error) {
		next(error);
	}
};
