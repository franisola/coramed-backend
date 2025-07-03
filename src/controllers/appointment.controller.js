import Appointment from '../models/appointment.model.js';
import Professional from '../models/professional.model.js';
import User from '../models/user.model.js';
import Notification from '../models/notification.model.js';
import { calculateBaseSchedules } from '../utils/validationUtils.js';
import moment from 'moment';
import 'moment/locale/es.js';
moment.locale('es');

import { sendAppointmentEmail, sendEmail } from '../utils/sendEmail.js';

export const createAppointment = async (req, res, next) => {
	try {
		const { paciente, profesional, fecha, hora, motivo_consulta, notas_medicas } = req.body;

		const user = await User.findById(req.user.id);

		const professional = await Professional.findById(profesional);
		if (!professional) {
			const error = new Error('Profesional no encontrado');
			error.statusCode = 404;
			error.code = 'PROFESSIONAL_NOT_FOUND';
			return next(error);
		}

		let dayOfWeek = moment(fecha).format('dddd');
		dayOfWeek = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);

		if (!professional.dias_laborales.includes(dayOfWeek)) {
			const error = new Error(`El profesional no trabaja el día ${dayOfWeek}`);
			error.statusCode = 400;
			error.code = 'INVALID_WORKDAY';
			return next(error);
		}

		const baseSchedules = calculateBaseSchedules(professional.horarios_laborales);
		const isScheduleAvailable = baseSchedules.includes(hora);

		if (!isScheduleAvailable) {
			const error = new Error('Horario no disponible');
			error.statusCode = 400;
			error.code = 'SCHEDULE_NOT_AVAILABLE';
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
			error.code = 'APPOINTMENT_ALREADY_EXISTS';
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
		await newAppointment.populate([
			{ path: 'profesional', select: 'nombre apellido especialidad' },
			{ path: 'paciente', select: 'nombreCompleto email' },
		]);
		await sendAppointmentEmail({
			to: user.email,
			subject: 'Confirmación de turno',
			appointment: {
				paciente: user,
				fecha,
				hora,
			},
			action: 'confirmado',
		});

		await Notification.create({
			usuario: req.user.id,
			titulo: 'Nuevo turno confirmado',
			mensaje: `Tu turno fue confirmado para el ${moment(fecha).format(
				'DD/MM/YYYY'
			)} a las ${hora}.`,
			tipo: 'recordatorio',
			turno: newAppointment._id,
			
		});

		res.status(201).json({
			message: 'Turno creado exitosamente',
			appointment: newAppointment,
		});
	} catch (error) {
		error.statusCode = 500;
		error.code = 'CREATE_APPOINTMENT_FAILED';
		next(error);
	}
};

export const getAppointmentById = async (req, res, next) => {
	try {
		const { appointmentId } = req.params;

		const appointment = await Appointment.findById(appointmentId)
			.populate('profesional', 'nombre apellido especialidad')
			.populate('paciente', 'nombreCompleto email');

		if (!appointment) {
			const error = new Error('Turno no encontrado');
			error.statusCode = 404;
			error.code = 'APPOINTMENT_NOT_FOUND';
			return next(error);
		}

		res.status(200).json(appointment);
	} catch (error) {
		error.statusCode = 500;
		error.code = 'GET_APPOINTMENT_FAILED';
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

		res.status(200).json({ appointment: appointment || null });
	} catch (error) {
		error.statusCode = 500;
		error.code = 'GET_NEXT_APPOINTMENT_FAILED';
		next(error);
	}
};

export const updateAppointmentStatus = async (req, res, next) => {
	try {
		const { appointmentId } = req.params;
		const { estado } = req.body;
		const user = await User.findById(req.user.id);

		if (!['Agendado', 'Cancelado', 'Completado'].includes(estado)) {
			const error = new Error('Estado inválido');
			error.statusCode = 400;
			error.code = 'INVALID_STATUS';
			return next(error);
		}

		const appointment = await Appointment.findById(appointmentId);
		if (!appointment) {
			const error = new Error('Turno no encontrado');
			error.statusCode = 404;
			error.code = 'APPOINTMENT_NOT_FOUND';
			return next(error);
		}

		if (['Cancelado', 'Completado'].includes(appointment.estado)) {
			const error = new Error(
				`No se puede cambiar el estado de un turno ${appointment.estado.toLowerCase()}`
			);
			error.statusCode = 400;
			error.code = 'STATUS_NOT_CHANGEABLE';
			return next(error);
		}

		appointment.estado = estado;
		await appointment.save();

		if (estado === 'Cancelado') {
			await sendAppointmentEmail({
				to: user.email,
				subject: 'Cancelación de turno',
				appointment: {
					paciente: user,
					fecha: appointment.fecha,
					hora: appointment.hora,
				},
				action: 'cancelado',
			});

			await Notification.create({
				usuario: req.user.id,
				titulo: 'Tu turno fue cancelado',
				mensaje: `El turno previsto para el ${appointment.fecha.toLocaleDateString()} a las ${
					appointment.hora
				} fue cancelado.`,
				tipo: 'estado-turno',
				turno: appointment._id,
			});
		}

		const updated = await Appointment.findById(appointmentId)
			.populate('profesional', 'nombre apellido especialidad')
			.populate('paciente', 'nombreCompleto email');

		res.status(200).json(updated);
	} catch (error) {
		error.statusCode = 500;
		error.code = 'UPDATE_STATUS_FAILED';
		next(error);
	}
};

export const addStudyResults = async (req, res, next) => {
	try {
		const { appointmentId } = req.params;
		const { notas_medicas, resultados_estudios } = req.body;
		const user = await User.findById(req.user.id);

		const appointment = await Appointment.findById(appointmentId);
		if (!appointment) {
			const error = new Error('Turno no encontrado');
			error.statusCode = 404;
			error.code = 'APPOINTMENT_NOT_FOUND';
			return next(error);
		}

		const cantidadActual = appointment.resultados_estudios.length;
		const cantidadNueva = resultados_estudios.length;
		const cantidadTotal = cantidadActual + cantidadNueva;

		if (cantidadTotal > 10) {
			const error = new Error(
				`No puedes registrar más de 10 estudios por turno (ya hay ${cantidadActual})`
			);
			error.statusCode = 400;
			error.code = 'TOO_MANY_STUDIES';
			return next(error);
		}

		if (cantidadNueva > 0) appointment.resultados_estudios.push(...resultados_estudios);
		if (notas_medicas) appointment.notas_medicas = notas_medicas;

		await appointment.save();
		const fechaLegible = moment(appointment.fecha).format('dddd D [de] MMMM [de] YYYY');

		await sendEmail(
			user.email,
			'Resultados médicos disponibles',
			`<p>Hola ${user.nombreCompleto},</p>
	<p>Tu profesional ha subido resultados médicos a tu turno del <strong>${fechaLegible}</strong>.</p>
	<p>Podés consultarlos en la app.</p>`
		);

		const titulo = 'Resultados médicos disponibles';
		const mensaje = `Tu profesional subió nuevos estudios al turno del ${fechaLegible}.`;

		await Notification.create({
			usuario: appointment.paciente,
			titulo,
			mensaje,
			tipo: 'resultados-estudios',
			turno: appointment._id,
		});

		const updated = await Appointment.findById(appointmentId)
			.populate('profesional', 'nombre apellido especialidad')
			.populate('paciente', 'nombre apellido email');

		res.status(200).json(updated);
	} catch (error) {
		error.statusCode = 500;
		error.code = 'ADD_STUDY_FAILED';
		next(error);
	}
};

export const deleteAppointment = async (req, res, next) => {
	try {
		const { appointmentId } = req.params;
		const appointment = await Appointment.findById(appointmentId);

		if (!appointment) {
			const error = new Error('Turno no encontrado');
			error.statusCode = 404;
			error.code = 'APPOINTMENT_NOT_FOUND';
			return next(error);
		}

		await Appointment.findByIdAndDelete(appointmentId);

		res.status(200).json({ message: 'Turno eliminado exitosamente' });
	} catch (error) {
		error.statusCode = 500;
		error.code = 'DELETE_APPOINTMENT_FAILED';
		next(error);
	}
};

export const getUserAppointments = async (req, res, next) => {
	try {
		const userId = req.user.id;
		const appointments = await Appointment.find({ paciente: userId })
			.populate('profesional', 'nombre apellido especialidad')
			.sort({ fecha: 1, hora: 1 });

		const now = new Date();

		const pastAppointments = appointments.filter((appointment) => {
			const dateTime = new Date(
				`${appointment.fecha.toISOString().split('T')[0]}T${appointment.hora}`
			);
			return appointment.estado !== 'Agendado' || dateTime < now;
		});

		const upcomingAppointments = appointments.filter((appointment) => {
			const dateTime = new Date(
				`${appointment.fecha.toISOString().split('T')[0]}T${appointment.hora}`
			);
			return appointment.estado === 'Agendado' && dateTime >= now;
		});

		res.status(200).json({
			anteriores: pastAppointments,
			proximos: upcomingAppointments,
		});
	} catch (error) {
		error.statusCode = 500;
		error.code = 'GET_USER_APPOINTMENTS_FAILED';
		next(error);
	}
};
