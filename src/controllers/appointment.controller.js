import Appointment from "../models/appointment.model.js";

// Get a specific appointment
export const getAppointmentById = async (req, res, next) => {
    try {
        const { appointmentId } = req.params;

        const appointment = await Appointment.findById(appointmentId)
            .populate("profesional", "nombre apellido especialidad")
            .populate("paciente", "nombre apellido email");

        if (!appointment) {
            return res.status(404).json({ message: "Turno no encontrado" });
        }

        res.status(200).json(appointment);
    } catch (error) {
        next(error);
    }
};

// Create a new appointment
export const createAppointment = async (req, res, next) => {
    try {
        const { paciente, profesional, fecha, hora, motivo_consulta, notas_medicas } = req.body;

        // Validate if an appointment already exists at the same date and time with the same professional
        const existingAppointment = await Appointment.findOne({ profesional, fecha, hora });
        if (existingAppointment) {
            return res.status(400).json({ message: "Ya existe un turno en esta fecha y hora con este profesional" });
        }

        const newAppointment = new Appointment({
            paciente,
            profesional,
            fecha,
            hora,
            motivo_consulta,
            notas_medicas, // Optional field
        });

        await newAppointment.save();

        res.status(201).json({ message: "Turno creado exitosamente", appointment: newAppointment });
    } catch (error) {
        next(error);
    }
};

// Update the status of an appointment
export const updateAppointmentStatus = async (req, res, next) => {
    try {
        const { appointmentId } = req.params;
        const { estado } = req.body;

        if (!["Agendado", "Cancelado", "Completado"].includes(estado)) {
            return res.status(400).json({ message: "Estado inválido" });
        }

        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({ message: "Turno no encontrado" });
        }

        appointment.estado = estado;
        await appointment.save();

        res.status(200).json({ message: "Estado del turno actualizado", appointment });
    } catch (error) {
        next(error);
    }
};

// Add study results to an appointment
export const addStudyResults = async (req, res, next) => {
    try {
        const { appointmentId } = req.params;
        const { resultados_estudios } = req.body;

        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({ message: "Turno no encontrado" });
        }

        // Validate the number of studies
        if (appointment.resultados_estudios.length + resultados_estudios.length > 10) {
            return res.status(400).json({ message: "No puedes registrar más de 10 estudios por turno" });
        }

        appointment.resultados_estudios.push(...resultados_estudios);
        await appointment.save();

        res.status(200).json({ message: "Resultados de estudios agregados", appointment });
    } catch (error) {
        next(error);
    }
};

// Delete an appointment
export const deleteAppointment = async (req, res, next) => {
    try {
        const { appointmentId } = req.params;

        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({ message: "Turno no encontrado" });
        }

        await Appointment.findByIdAndDelete(appointmentId);

        res.status(200).json({ message: "Turno eliminado exitosamente" });
    } catch (error) {
        next(error);
    }
};