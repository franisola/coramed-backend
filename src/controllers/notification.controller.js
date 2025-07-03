import Notification from '../models/notification.model.js';

// Obtener todas las notificaciones del usuario actual
export const getNotifications = async (req, res, next) => {
	try {
		const notifications = await Notification.find({ usuario: req.user.id })
			.sort({ createdAt: -1 })
			.populate({
				path: 'turno',
				populate: {
					path: 'profesional',
					select: 'nombre apellido especialidad', // Selecciona los campos que necesitas
				},
			});

		res.status(200).json(notifications);
	} catch (error) {
		error.statusCode = 500;
		error.code = 'FETCH_NOTIFICATIONS_FAILED';
		next(error);
	}
};

// Marcar una notificación como leída
export const markAsRead = async (req, res, next) => {
	try {
		const { id } = req.params;

		const notification = await Notification.findOneAndUpdate(
			{ _id: id, usuario: req.user.id },
			{ leida: true },
			{ new: true }
		);

		if (!notification) {
			const error = new Error('Notificación no encontrada');
			error.statusCode = 404;
			error.code = 'NOTIFICATION_NOT_FOUND';
			return next(error);
		}

		res.status(200).json(notification);
	} catch (error) {
		error.statusCode = 500;
		error.code = 'MARK_AS_READ_FAILED';
		next(error);
	}
};

// Eliminar una notificación
export const deleteNotification = async (req, res, next) => {
	try {
		const { id } = req.params;

		const notification = await Notification.findOneAndDelete({
			_id: id,
			usuario: req.user.id,
		});

		if (!notification) {
			const error = new Error('Notificación no encontrada');
			error.statusCode = 404;
			error.code = 'NOTIFICATION_NOT_FOUND';
			return next(error);
		}

		res.status(200).json({ message: 'Notificación eliminada' });
	} catch (error) {
		error.statusCode = 500;
		error.code = 'DELETE_NOTIFICATION_FAILED';
		next(error);
	}
};

// Eliminar todas las notificaciones del usuario actual
export const deleteAllNotifications = async (req, res, next) => {
	try {
		await Notification.deleteMany({ usuario: req.user.id });
		res.status(200).json({ message: 'Todas las notificaciones eliminadas' });
	} catch (error) {
		error.statusCode = 500;
		error.code = 'DELETE_ALL_NOTIFICATIONS_FAILED';
		next(error);
	}
};
