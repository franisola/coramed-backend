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

        // Validar alergias
        if (alergias && alergias.some((alergia) => alergia.length > 50)) {
            return res.status(400).json({ message: "Cada alergia debe tener un máximo de 50 caracteres" });
        }

        // Validar medicamentos
        if (medicamentos && medicamentos.some((med) => med.length > 50)) {
            return res.status(400).json({ message: "Cada medicamento debe tener un máximo de 50 caracteres" });
        }

        // Validar enfermedades
        if (enfermedades && enfermedades.some((enf) => enf.length > 50)) {
            return res.status(400).json({ message: "Cada enfermedad debe tener un máximo de 50 caracteres" });
        }

        // Validar antecedentes
        if (antecedentes && antecedentes.some((ant) => ant.length > 50)) {
            return res.status(400).json({ message: "Cada antecedente debe tener un máximo de 50 caracteres" });
        }

        // Actualizar o combinar los campos
        if (grupo_sanguineo) medicalInfo.grupo_sanguineo = grupo_sanguineo;

        if (alergias) {
            medicalInfo.alergias = Array.isArray(medicalInfo.alergias)
                ? [...new Set([...medicalInfo.alergias, ...alergias])] // Combina y elimina duplicados
                : alergias;
        }

        if (medicamentos) {
            medicalInfo.medicamentos = Array.isArray(medicalInfo.medicamentos)
                ? [...new Set([...medicalInfo.medicamentos, ...medicamentos])] // Combina y elimina duplicados
                : medicamentos;
        }

        if (enfermedades) {
            medicalInfo.enfermedades = Array.isArray(medicalInfo.enfermedades)
                ? [...new Set([...medicalInfo.enfermedades, ...enfermedades])] // Combina y elimina duplicados
                : enfermedades;
        }

        if (antecedentes) {
            medicalInfo.antecedentes = Array.isArray(medicalInfo.antecedentes)
                ? [...new Set([...medicalInfo.antecedentes, ...antecedentes])] // Combina y elimina duplicados
                : antecedentes;
        }

        await medicalInfo.save();

        // Asociar la información médica con el usuario si es nueva
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