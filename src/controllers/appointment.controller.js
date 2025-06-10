import Appointment from '../models/appointment.model.js';
import Professional from '../models/professional.model.js';
import { calculateBaseSchedules } from '../utils/validationUtils.js';
import moment from 'moment';
import 'moment/locale/es.js';
moment.locale('es');

// Create a new appointment
export const createAppointment = async (req, res, next) => {
	try {
		const { paciente, profesional, fecha, hora, motivo_consulta, notas_medicas } = req.body;

		const professional = await Professional.findById(profesional);
		if (!professional) {
			const error = new Error('Profesional no encontrado');
			error.statusCode = 404;
			return next(error);
		}

		let dayOfWeek = moment(fecha).format('dddd');
		dayOfWeek = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);

		if (!professional.dias_laborales.includes(dayOfWeek)) {
			const error = new Error(`El profesional no trabaja el día ${dayOfWeek}`);
			error.statusCode = 400;
			return next(error);
		}

		const baseSchedules = calculateBaseSchedules(professional.horarios_laborales);
		const isScheduleAvailable = baseSchedules.includes(hora);

		if (!isScheduleAvailable) {
			const error = new Error('Horario no disponible');
			error.statusCode = 400;
			return next(error);
		}

		const existingAppointment = await Appointment.findOne({
			profesional,
			fecha,
			hora,
			estado: 'Agendado',
		});

		if (existingAppointment) {
			const error = new Error('Ya existe un turno en esta fecha y hora con este profesional');
			error.statusCode = 400;
			return next(error);
		}

		const newAppointment = new Appointment({
			paciente: req.user.id,
			profesional,
			especialidad: professional.especialidad,
			fecha,
			hora,
			motivo_consulta,
			notas_medicas,
		});

		await newAppointment.save();

		res.status(201).json({ message: 'Turno creado exitosamente', appointment: newAppointment });
	} catch (error) {
		next(error);
	}
};

// Get a specific appointment
export const getAppointmentById = async (req, res, next) => {
	try {
		const { appointmentId } = req.params;

		const appointment = await Appointment.findById(appointmentId)
			.populate('profesional', 'nombre apellido especialidad')
			.populate('paciente', 'nombreCompleto email');

		if (!appointment) {
			const error = new Error('Turno no encontrado');
			error.statusCode = 404;
			return next(error);
		}

		res.status(200).json(appointment);
	} catch (error) {
		next(error);
	}
};

export const getNextAppointment = async (req, res, next) => {
	try {
		const userId = req.user.id;
		const currentDate = new Date();

		const appointment = await Appointment.findOne({
			paciente: userId,
			estado: 'Agendado',
			fecha: { $gte: currentDate },
		})
			.sort({ fecha: 1, hora: 1 })
			.populate('profesional', 'nombre apellido especialidad');

		if (!appointment) {
			const error = new Error('No se encontro ningun turno proximo');
			error.statusCode = 404;
			return next(error);
		}

		res.status(200).json({ appointment });
	} catch (error) {
		next(error);
	}
};

// Update the status of an appointment
export const updateAppointmentStatus = async (req, res, next) => {
	try {
		const { appointmentId } = req.params;
		const { estado } = req.body;

		if (!['Agendado', 'Cancelado', 'Completado'].includes(estado)) {
			const error = new Error('Estado inválido');
			error.statusCode = 400;
			return next(error);
		}

		const appointment = await Appointment.findById(appointmentId);

		if (!appointment) {
			const error = new Error('Turno no encontrado');
			error.statusCode = 404;
			return next(error);
		}

		if (['Cancelado', 'Completado'].includes(appointment.estado)) {
			const error = new Error(
				`No se puede cambiar el estado de un turno ${appointment.estado.toLowerCase()}`
			);
			error.statusCode = 400;
			return next(error);
		}

		appointment.estado = estado;
		await appointment.save();

		const updated = await Appointment.findById(appointmentId)
			.populate('profesional', 'nombre apellido especialidad')
			.populate('paciente', 'nombreCompleto email');

		res.status(200).json(updated);
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
			const error = new Error('Turno no encontrado');
			error.statusCode = 404;
			return next(error);
		}

		if (appointment.resultados_estudios.length + resultados_estudios.length > 10) {
			const error = new Error('No puedes registrar más de 10 estudios por turno');
			error.statusCode = 400;
			return next(error);
		}

		appointment.resultados_estudios.push(...resultados_estudios);
		await appointment.save();

		res.status(200).json({ message: 'Resultados de estudios agregados', appointment });
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
			const error = new Error('Turno no encontrado');
			error.statusCode = 404;
			return next(error);
		}

		await Appointment.findByIdAndDelete(appointmentId);

		res.status(200).json({ message: 'Turno eliminado exitosamente' });
	} catch (error) {
		next(error);
	}
};

// Get the user's appointments, divided into upcoming and past
export const getUserAppointments = async (req, res, next) => {
	try {
		const userId = req.user.id;

		const appointments = await Appointment.find({ paciente: userId })
			.populate('profesional', 'nombre apellido especialidad')
			.sort({ fecha: 1, hora: 1 });

		const now = new Date();

		const pastAppointments = appointments.filter((appointment) => {
			const appointmentDateTime = new Date(
				`${appointment.fecha.toISOString().split('T')[0]}T${appointment.hora}`
			);
			return (
				appointment.estado === 'Completado' ||
				appointment.estado === 'Cancelado' ||
				appointmentDateTime < now
			);
		});

		const upcomingAppointments = appointments.filter((appointment) => {
			const appointmentDateTime = new Date(
				`${appointment.fecha.toISOString().split('T')[0]}T${appointment.hora}`
			);
			return appointment.estado === 'Agendado' && appointmentDateTime >= now;
		});

		res.status(200).json({
			anteriores: pastAppointments,
			proximos: upcomingAppointments,
		});
	} catch (error) {
		next(error);
	}
};
