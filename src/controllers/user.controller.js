import User from "../models/user.model.js";
import Appointment from "../models/appointment.model.js";

// Get the user's profile
export const getUserProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};

// Update the user's profile
export const updateUserProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { nombre, apellido, fecha_nacimiento, genero, direccion, telefono } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

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

// Get the user's appointments, divided into upcoming and past
export const getUserAppointments = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const currentDate = new Date();

        const appointments = await Appointment.find({ paciente: userId })
            .populate("profesional", "nombre apellido especialidad")
            .sort({ fecha: 1, hora: 1 });

        const pastAppointments = appointments.filter(
            (appointment) => appointment.fecha < currentDate || appointment.estado === "Completado"
        );

        const upcomingAppointments = appointments.filter(
            (appointment) => appointment.fecha >= currentDate && appointment.estado !== "Completado"
        );

        res.status(200).json({
            anteriores: pastAppointments,
            proximos: upcomingAppointments,
        });
    } catch (error) {
        next(error);
    }
};

// Delete the user's account
export const deleteUser = async (req, res, next) => {
    try {
        const userId = req.user.id;

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