import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();
export default app;

// Midlewares
const allowedOrigins = [
	'http://localhost:3000', // Origen para desarrollo local
	'https://backsalud-tp.up.railway.app/', // Origen para producción (reemplaza con tu dominio real)
  ];
  
  app.use(cors({
	origin: (origin, callback) => {
	  // Permitir solicitudes sin origen (por ejemplo, Postman) o desde orígenes permitidos
	  if (!origin || allowedOrigins.includes(origin)) {
		callback(null, true);
	  } else {
		callback(new Error('No permitido por CORS'));
	  }
	},
	credentials: true, // Permitir envío de cookies
  }));

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