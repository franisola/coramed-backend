import Professional from "../models/professional.model.js";
import Appointment from "../models/appointment.model.js";
import {calculateBaseSchedules} from "../utils/validationUtils.js";
import moment from "moment";
import "moment/locale/es.js"; // Importa el idioma español

moment.locale("es"); // Configura el idioma a español


// Create a new professional
export const createProfessional = async (req, res, next) => {
	try {
		const { nombre, apellido, especialidad, dias_laborales, horarios_laborales } = req.body;

		const newProfessional = new Professional({ nombre, apellido, especialidad, dias_laborales, horarios_laborales });
		await newProfessional.save();

		res.status(201).json({ message: "Profesional creado exitosamente", profesional: newProfessional });
	} catch (error) {
		error.statusCode = 500;
		error.code = "CREATE_PROFESSIONAL_FAILED";
		next(error);
	}
};

export const getProfessionalById = async (req, res, next) => {
	try {
		const { profesionalId } = req.params;
		const professional = await Professional.findById(profesionalId);

		if (!professional) {
			const error = new Error("Profesional no encontrado");
			error.statusCode = 404;
			error.code = "PROFESSIONAL_NOT_FOUND";
			return next(error);
		}

		res.status(200).json(professional);
	} catch (error) {
		error.statusCode = 500;
		error.code = "GET_PROFESSIONAL_FAILED";
		next(error);
	}
};

// Get all specialties
export const getSpecialties = async (req, res, next) => {
    try {
        // Use `distinct` to get a unique list of specialties
        const specialties = await Professional.distinct("especialidad");

        res.status(200).json(specialties);
    } catch (error) {
        error.statusCode = 500;
		error.code = "GET_SPECIALTIES_FAILED";
		next(error);
    }
};

// Get professionals by specialty
export const getProfessionalsBySpecialty = async (req, res, next) => {
	try {
		const { especialidad } = req.params;
		const decodedEspecialidad = decodeURIComponent(especialidad);
		const professionals = await Professional.find({ especialidad: decodedEspecialidad });

		if (professionals.length === 0) {
			const error = new Error("No se encontraron profesionales para esta especialidad");
			error.statusCode = 404;
			error.code = "PROFESSIONALS_NOT_FOUND";
			return next(error);
		}

		res.status(200).json(professionals);
	} catch (error) {
		error.statusCode = 500;
		error.code = "GET_PROFESSIONALS_BY_SPECIALTY_FAILED";
		next(error);
	}
};


// Get available schedules for a professional on a specific date
export const getAvailableSchedules = async (req, res, next) => {
	try {
		const { profesionalId } = req.params;
		const { fecha } = req.query;

		if (!fecha) {
			const error = new Error("La fecha es obligatoria para obtener los horarios disponibles");
			error.statusCode = 400;
			error.code = "DATE_REQUIRED";
			return next(error);
		}

		if (!moment(fecha, "YYYY-MM-DD", true).isValid()) {
			const error = new Error("El formato de la fecha debe ser YYYY-MM-DD");
			error.statusCode = 400;
			error.code = "INVALID_DATE_FORMAT";
			return next(error);
		}

		const professional = await Professional.findById(profesionalId, "dias_laborales horarios_laborales");
		if (!professional) {
			const error = new Error("Profesional no encontrado");
			error.statusCode = 404;
			error.code = "PROFESSIONAL_NOT_FOUND";
			return next(error);
		}

		let dayOfWeek = moment(fecha).format("dddd");
		dayOfWeek = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);

		if (!professional.dias_laborales.includes(dayOfWeek)) {
			const error = new Error(`El profesional no trabaja el día ${dayOfWeek}`);
			error.statusCode = 400;
			error.code = "DAY_NOT_AVAILABLE";
			return next(error);
		}

		const baseSchedules = calculateBaseSchedules(professional.horarios_laborales);

		const appointments = await Appointment.find({
			profesional: profesionalId,
			fecha,
			estado: "Agendado",
		});

		const occupiedSchedules = appointments.map((a) => a.hora);
		const availableSchedules = baseSchedules.filter((h) => !occupiedSchedules.includes(h));

		res.status(200).json(availableSchedules);
	} catch (error) {
		error.statusCode = 500;
		error.code = "GET_AVAILABLE_SCHEDULES_FAILED";
		next(error);
	}
};

// Update a professional
export const updateProfessional = async (req, res, next) => {
    try {
        const { profesionalId } = req.params;
        const { nombre, apellido, especialidad, dias_laborales, horarios_laborales } = req.body;

        const professional = await Professional.findById(profesionalId);
        if (!professional) {
            return res.status(404).json({ message: "Profesional no encontrado" });
        }

        professional.nombre = nombre || professional.nombre;
        professional.apellido = apellido || professional.apellido;
        professional.especialidad = especialidad || professional.especialidad;
        professional.dias_laborales = dias_laborales || professional.dias_laborales;
        professional.horarios_laborales = horarios_laborales || professional.horarios_laborales;

        await professional.save();

        res.status(200).json({ message: "Profesional actualizado exitosamente", profesional: professional });
    } catch (error) {
        next(error);
    }
};

// Delete a professional
export const deleteProfessional = async (req, res, next) => {
    try {
        const { profesionalId } = req.params;

        const professional = await Professional.findById(profesionalId);
        if (!professional) {
            return res.status(404).json({ message: "Profesional no encontrado" });
        }

        await Professional.findByIdAndDelete(profesionalId);

        res.status(200).json({ message: "Profesional eliminado exitosamente" });
    } catch (error) {
        next(error);
    }
};

