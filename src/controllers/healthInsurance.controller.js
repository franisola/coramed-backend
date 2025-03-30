import ObraSocial from "../models/healthInsurance.model.js";
import User from "../models/user.model.js";

// Obtener la obra social del usuario
export const getHealthInsurance = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId).populate("obra_social");
        if (!user || !user.obra_social) {
            return res.status(404).json({ message: "Obra social no encontrada" });
        }

        res.status(200).json(user.obra_social);
    } catch (error) {
        next(error);
    }
};

// Crear o actualizar la obra social del usuario
export const upsertHealthInsurance = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { nombre, numero_socio, plan } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        let obraSocial = user.obra_social
            ? await ObraSocial.findById(user.obra_social)
            : new ObraSocial();

        // Actualizar o asignar los campos
        if (nombre) obraSocial.nombre = nombre;
        if (numero_socio) {
            obraSocial.numero_socio = numero_socio;
            obraSocial.numero_socio_visible = numero_socio; // Guardar la versión visible
        }
        if (plan) obraSocial.plan = plan;

        await obraSocial.save();

        // Asociar la obra social al usuario si es nueva
        if (!user.obra_social) {
            user.obra_social = obraSocial._id;
            await user.save();
        }

        res.status(200).json({ message: "Obra social guardada exitosamente", obraSocial });
    } catch (error) {
        next(error);
    }
};

// Eliminar la obra social del usuario
export const deleteHealthInsurance = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user || !user.obra_social) {
            return res.status(404).json({ message: "Obra social no encontrada" });
        }

        await ObraSocial.findByIdAndDelete(user.obra_social);
        user.obra_social = null;
        await user.save();

        res.status(200).json({ message: "Obra social eliminada exitosamente" });
    } catch (error) {
        next(error);
    }
};