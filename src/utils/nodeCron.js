import cron from 'node-cron';
import Appointment from '../models/appointment.model.js';
import Notification from '../models/notification.model.js';
import { sendAppointmentEmail } from './sendEmail.js'; // Asegurate que el path sea correcto
import moment from 'moment';

cron.schedule('0 * * * *', async () => {
	try {
		const ahora = moment();
		const dentroDe24Horas = moment().add(24, 'hours');

		const turnos = await Appointment.find({
			fecha: { $gte: ahora.toDate(), $lte: dentroDe24Horas.toDate() },
			estado: 'Agendado',
		}).populate('paciente');

		let totalNuevas = 0;

		for (const turno of turnos) {
			const yaExiste = await Notification.exists({
				turno: turno._id,
				tipo: 'Recordatorio',
			});

			if (!yaExiste) {
				// Crear notificación
				await Notification.create({
					usuario: turno.paciente._id,
					titulo: 'Recordatorio de turno',
					mensaje: `Tenés un turno agendado para el ${moment(turno.fecha).format('DD/MM/YYYY')} a las ${turno.hora}.`,
					tipo: 'Recordatorio',
					turno: turno._id,
				});

				// Enviar email si tiene dirección
				if (turno.paciente.email) {
					await sendAppointmentEmail({
						to: turno.paciente.email,
						subject: 'Recordatorio de turno médico',
						appointment: turno,
						action: 'recordado',
					});
				}

				totalNuevas++;
			}
		}

		console.log(`[CRON] Recordatorios creados y correos enviados: ${totalNuevas}`);
	} catch (error) {
		console.error('[CRON] Error al procesar recordatorios:', error.message);
	}
});
