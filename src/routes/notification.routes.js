import { Router } from 'express';
import {
	getNotifications,
	markAsRead,
	deleteNotification,
	deleteAllNotifications,
} from '../controllers/notification.controller.js';
import { authRequired } from '../jwt/auth.service.js';

const router = Router();

// 🔐 Todas las rutas requieren autenticación

// GET /notifications → obtener todas
router.get('/', authRequired, getNotifications);

// PATCH /notifications/:id/read → marcar una como leída
router.patch('/:id/read', authRequired, markAsRead);

// DELETE /notifications/:id → eliminar una
router.delete('/:id', authRequired, deleteNotification);

// DELETE /notifications → eliminar todas
router.delete('/', authRequired, deleteAllNotifications);

export default router;
