import InfoMedica from "../models/infoMedica.model.js";
import User from "../models/user.model.js";

// Obtener la información médica del usuario
export const getMedicalInfo = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId).populate("informacion_medica");
        if (!user || !user.informacion_medica) {
            return res.status(404).json({ message: "Información médica no encontrada" });
        }

        res.status(200).json(user.informacion_medica);
    } catch (error) {
        next(error);
    }
};

// Crear o actualizar la información médica del usuario
export const upsertMedicalInfo = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { grupo_sanguineo, alergias, medicamentos, enfermedades, antecedentes } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        let infoMedica = user.informacion_medica
            ? await InfoMedica.findById(user.informacion_medica)
            : new InfoMedica();

        // Actualizar o asignar los campos
        infoMedica.grupo_sanguineo = grupo_sanguineo || infoMedica.grupo_sanguineo;
        infoMedica.alergias = alergias || infoMedica.alergias;
        infoMedica.medicamentos = medicamentos || infoMedica.medicamentos;
        infoMedica.enfermedades = enfermedades || infoMedica.enfermedades;
        infoMedica.antecedentes = antecedentes || infoMedica.antecedentes;

        await infoMedica.save();

        // Asociar la información médica al usuario si es nueva
        if (!user.informacion_medica) {
            user.informacion_medica = infoMedica._id;
            await user.save();
        }

        res.status(200).json({ message: "Información médica guardada exitosamente", infoMedica });
    } catch (error) {
        next(error);
    }
};

// Eliminar la información médica del usuario
export const deleteMedicalInfo = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user || !user.informacion_medica) {
            return res.status(404).json({ message: "Información médica no encontrada" });
        }

        await InfoMedica.findByIdAndDelete(user.informacion_medica);
        user.informacion_medica = null;
        await user.save();

        res.status(200).json({ message: "Información médica eliminada exitosamente" });
    } catch (error) {
        next(error);
    }
};