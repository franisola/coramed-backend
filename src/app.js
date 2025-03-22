import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();
export default app;

// Midlewares
const allowedOrigins = [
	'http://localhost:3000', // Desarrollo local
	'https://backsalud-tp.up.railway.app', // Producción
];

app.use(
	cors({
		origin: (origin, callback) => {
			if (!origin || allowedOrigins.includes(origin)) {
				callback(null, true);
			} else {
				callback(new Error('No permitido por CORS'));
			}
		},
		credentials: true, // Permitir envío de cookies
	})
);

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Routes
import usersRoute from './routes/user.routes.js';

app.use(usersRoute);

app.use((err, req, res, next) => {
	const statusCode = err.statusCode || 500;
	const error = err || 'Internal Server Error';
	return res.status(statusCode).json({
		success: false,
		error,
		statusCode,
	});
});
