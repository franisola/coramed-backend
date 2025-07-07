import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
	{
		usuario: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		titulo: {
			type: String,
			required: true,
			trim: true,
		},
		mensaje: {
			type: String,
			required: true,
			trim: true,
		},
		leida: {
			type: Boolean,
			default: false,
		},
		tipo: {
			type: String,
			enum: [
				'Turno_Agendado',
				'Turno_Cancelado',
				'Resultados_Subidos',
				'Recordatorio',
				'Otro',
			],
			default: 'otro',
		},
		turno: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Appointment',
			default: null, // si aplica
		},
	},
	{
		timestamps: true, // createdAt y updatedAt
		versionKey: false,
	}
);

export default mongoose.model('Notification', NotificationSchema);
