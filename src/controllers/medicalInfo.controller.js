import MedicalInfo from '../models/medicalInfo.model.js';
import User from '../models/user.model.js';

// Get the user's medical information
export const getMedicalInfo = async (req, res, next) => {
	try {
		const userId = req.user.id;

		const user = await User.findById(userId).populate('informacion_medica');
		if (!user || !user.informacion_medica) {
			return res.status(404).json({ message: 'Información médica no encontrada' });
		}

		res.status(200).json(user.informacion_medica);
	} catch (error) {
		next(error);
	}
};

const validateMaxLength = (array, fieldName, max = 50) => {
	if (!Array.isArray(array)) {
		return null; // Si no es un array, no hay nada que validar
	}
	return array.some((item) => item.length > max)
		? { message: `Cada ${fieldName} debe tener un máximo de ${max} caracteres` }
		: null;
};

export function mergeUnique(existing, incoming) {
	if (!Array.isArray(existing)) return incoming; // Si 'existing' no es un array, devuelve 'incoming'
	if (!Array.isArray(incoming)) return existing; // Si 'incoming' no es un array, devuelve 'existing'
	return [...new Set([...existing, ...incoming])]; // Combina ambos arrays eliminando duplicados
}

export const upsertMedicalInfo = async (req, res, next) => {
	try {
		const userId = req.user.id;
		const { grupo_sanguineo, alergias, medicamentos, enfermedades, antecedentes } = req.body;

		const user = await User.findById(userId).populate('informacion_medica');
		if (!user) {
			return res.status(404).json({ message: 'Usuario no encontrado' });
		}

		const validations = [
			[alergias, 'alergia'],
			[medicamentos, 'medicamento'],
			[enfermedades, 'enfermedad'],
			[antecedentes, 'antecedente'],
		];

		const errorMessages = validations
			.map(([arr, name]) => validateMaxLength(arr, name))
			.filter(Boolean);

		if (errorMessages.length > 0) {
			return res.status(400).json(errorMessages[0]);
		}

		// Actualizar o combinar los campos
		const medicalInfo = user.informacion_medica || new MedicalInfo();

		Object.assign(medicalInfo, {
			...(grupo_sanguineo && { grupo_sanguineo }),
			...(alergias && { alergias: mergeUnique(medicalInfo.alergias, alergias) }),
			...(medicamentos && {
				medicamentos: mergeUnique(medicalInfo.medicamentos, medicamentos),
			}),
			...(enfermedades && {
				enfermedades: mergeUnique(medicalInfo.enfermedades, enfermedades),
			}),
			...(antecedentes && {
				antecedentes: mergeUnique(medicalInfo.antecedentes, antecedentes),
			}),
		});

		await medicalInfo.save();

		// Asociar la información médica con el usuario si es nueva
		if (!user.informacion_medica) {
			user.informacion_medica = medicalInfo._id;
			await user.save();
		}

		res.status(200).json({ message: 'Información médica guardada exitosamente', medicalInfo });
	} catch (error) {
		next(error);
	}
};
// Delete the user's medical information
export const deleteMedicalInfo = async (req, res, next) => {
	try {
		const userId = req.user.id;

		const user = await User.findById(userId);
		if (!user || !user.informacion_medica) {
			return res.status(404).json({ message: 'Información médica no encontrada' });
		}

		await MedicalInfo.findByIdAndDelete(user.informacion_medica);
		user.informacion_medica = null;
		await user.save();

		res.status(200).json({ message: 'Información médica eliminada exitosamente' });
	} catch (error) {
		next(error);
	}
};
