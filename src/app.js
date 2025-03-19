import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();
export default app;

// Midlewares
// app.use(cors(
//     {
//         origin: 'http://localhost:5173',
//         credentials: true,
//     }
// ));

// app.use(morgan('dev'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());


// Routes
import usersRoute from './routes/users.routes.js';


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