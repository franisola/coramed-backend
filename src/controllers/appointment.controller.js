import Appointment from "../models/appointment.model.js";
import Professional from "../models/professional.model.js";
import {calculateBaseSchedules} from "../utils/validationUtils.js";
import moment from "moment";
import "moment/locale/es.js"; // Importa el idioma español
moment.locale("es"); // Configura el idioma a español


// Create a new appointment
export const createAppointment = async (req, res, next) => {
    try {
        const { paciente, profesional, fecha, hora, motivo_consulta, notas_medicas } = req.body;

        const now = new Date(); // Fecha y hora actual

        // Validar que la fecha proporcionada sea futura o actual
        if (new Date(fecha) < now) {
            return res.status(400).json({ message: "La fecha del turno debe ser futura o actual" });
        }

        // Buscar al profesional por ID
        const professional = await Professional.findById(profesional);
        if (!professional) {
            return res.status(404).json({ message: "Profesional no encontrado" });
        }

        // Validar que el día de la semana sea laboral para el profesional
        let dayOfWeek = moment(fecha).format("dddd");
        dayOfWeek = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);

        if (!professional.dias_laborales.includes(dayOfWeek)) {
            return res.status(400).json({ message: `El profesional no trabaja el día ${dayOfWeek}` });
        }

        // Calcular los horarios base del profesional
        const baseSchedules = calculateBaseSchedules(professional.horarios_laborales);
        const isScheduleAvailable = baseSchedules.includes(hora);

        // Validar si el horario está dentro del rango del profesional
        if (!isScheduleAvailable) {
            return res.status(400).json({ message: "Horario no disponible" });
        }

        // Validar si ya existe un turno en la misma fecha y hora con el mismo profesional
        const existingAppointment = await Appointment.findOne({
            profesional,
            fecha,
            hora,
            estado: "Agendado" // Solo considerar turnos que están "Agendados"
        });

        if (existingAppointment) {
            return res.status(400).json({ message: "Ya existe un turno en esta fecha y hora con este profesional" });
        }

        // Crear el nuevo turno
        const newAppointment = new Appointment({
            paciente,
            profesional,
            especialidad: professional.especialidad,
            fecha,
            hora,
            motivo_consulta,
            notas_medicas // Campo opcional
        });

        await newAppointment.save();

        res.status(201).json({ message: "Turno creado exitosamente", appointment: newAppointment });
    } catch (error) {
        next(error);
    }
};

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

// Update the status of an appointment
export const updateAppointmentStatus = async (req, res, next) => {
    try {
        const { appointmentId } = req.params;
        const { estado } = req.body;

        // Validar que el estado sea válido
        if (!["Agendado", "Cancelado", "Completado"].includes(estado)) {
            return res.status(400).json({ message: "Estado inválido" });
        }

        // Buscar el turno por ID
        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({ message: "Turno no encontrado" });
        }

        // Validar que el estado actual no sea "Cancelado" o "Completado"
        if (["Cancelado", "Completado"].includes(appointment.estado)) {
            return res.status(400).json({ message: `No se puede cambiar el estado de un turno ${appointment.estado.toLowerCase()}` });
        }

        // Actualizar el estado del turno
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