import User from "../models/user.model.js";
import Turno from "../models/turno.model.js";


// Obtener el perfil del usuario
export const getUserProfile = async (req, res, next) => {
    try {
        const userId = req.user.id; // ID del usuario autenticado

        // Buscar al usuario y poblar las referencias a informacion_medica y obra_social
        const user = await User.findById(userId)
            .populate("informacion_medica")
            .populate("obra_social")
            .select("-password"); // Excluir la contraseña

        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // Manejar casos donde informacion_medica u obra_social sean null
        const response = {
            ...user.toObject(),
            informacion_medica: user.informacion_medica || null,
            obra_social: user.obra_social || null,
        };

        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

// Actualizar el perfil del usuario
export const updateUserProfile = async (req, res, next) => {
    try {
        const userId = req.user.id; // ID del usuario autenticado
        const { nombre, apellido, fecha_nacimiento, genero, direccion, telefono } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // Actualizar los campos permitidos (excluyendo el email)
        user.nombre = nombre || user.nombre;
        user.apellido = apellido || user.apellido;
        user.fecha_nacimiento = fecha_nacimiento || user.fecha_nacimiento;
        user.genero = genero || user.genero;
        user.direccion = direccion || user.direccion;
        user.telefono = telefono || user.telefono;

        await user.save();

        res.status(200).json({ message: "Perfil actualizado exitosamente", user });
    } catch (error) {
        next(error);
    }
};

// Eliminar la cuenta del usuario
export const deleteUser = async (req, res, next) => {
    try {
        const userId = req.user.id; // ID del usuario autenticado

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        await User.findByIdAndDelete(userId);

        res.status(200).json({ message: "Cuenta eliminada exitosamente" });
    } catch (error) {
        next(error);
    }
};


// Obtener los turnos del usuario divididos en próximos y anteriores
export const getUserAppointments = async (req, res, next) => {
    try {
        const userId = req.user.id; // ID del usuario autenticado
        const fechaActual = new Date(); // Fecha actual

        // Buscar todos los turnos del usuario
        const turnos = await Turno.find({ paciente: userId })
            .populate("profesional", "nombre apellido especialidad") // Información del profesional
            .sort({ fecha: 1, hora: 1 }); // Ordenar por fecha y hora

        // Dividir los turnos en próximos y anteriores
        const turnosAnteriores = turnos.filter(
            (turno) => turno.fecha < fechaActual || turno.estado === "Completado"
        );

        const turnosProximos = turnos.filter(
            (turno) => turno.fecha >= fechaActual && turno.estado !== "Completado"
        );

        res.status(200).json({
            anteriores: turnosAnteriores,
            proximos: turnosProximos,
        });
    } catch (error) {
        next(error);
    }
};


// Obtener las notificaciones del usuario
export const getUserNotifications = async (req, res, next) => {
    try {
        const userId = req.user.id; // ID del usuario autenticado

        const notificaciones = await Notificacion.find({ usuario: userId })
            .sort({ createdAt: -1 }); // Ordenar por las más recientes

        res.status(200).json(notificaciones);
    } catch (error) {
        next(error);
    }
};