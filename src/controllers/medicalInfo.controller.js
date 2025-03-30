import MedicalInfo from "../models/medicalInfo.model.js";
import User from "../models/user.model.js";

// Get the user's medical information
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

// Create or update the user's medical information
export const upsertMedicalInfo = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { grupo_sanguineo, alergias, medicamentos, enfermedades, antecedentes } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        let medicalInfo = user.informacion_medica
            ? await MedicalInfo.findById(user.informacion_medica)
            : new MedicalInfo();

        // Validate the number of allergies
        if (alergias && alergias.length > 10) {
            return res.status(400).json({ message: "No puedes tener más de 10 alergias registradas" });
        }

        // Validate the number of medications
        if (medicamentos && medicamentos.some((med) => med.length > 50)) {
            return res.status(400).json({ message: "Cada medicamento debe tener un máximo de 50 caracteres" });
        }

        // Validate the number of diseases
        if (enfermedades && enfermedades.some((enf) => enf.length > 50)) {
            return res.status(400).json({ message: "Cada enfermedad debe tener un máximo de 50 caracteres" });
        }

        // Validate the number of medical histories
        if (antecedentes && antecedentes.some((ant) => ant.length > 50)) {
            return res.status(400).json({ message: "Cada antecedente debe tener un máximo de 50 caracteres" });
        }

        // Update or assign the fields
        if (grupo_sanguineo) medicalInfo.grupo_sanguineo = grupo_sanguineo;
        if (alergias) medicalInfo.alergias = alergias;
        if (medicamentos) medicalInfo.medicamentos = medicamentos;
        if (enfermedades) medicalInfo.enfermedades = enfermedades;
        if (antecedentes) medicalInfo.antecedentes = antecedentes;

        await medicalInfo.save();

        // Associate the medical information with the user if it's new
        if (!user.informacion_medica) {
            user.informacion_medica = medicalInfo._id;
            await user.save();
        }

        res.status(200).json({ message: "Información médica guardada exitosamente", medicalInfo });
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
            return res.status(404).json({ message: "Información médica no encontrada" });
        }

        await MedicalInfo.findByIdAndDelete(user.informacion_medica);
        user.informacion_medica = null;
        await user.save();

        res.status(200).json({ message: "Información médica eliminada exitosamente" });
    } catch (error) {
        next(error);
    }
};