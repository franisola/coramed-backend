import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();
export default app;

// Middleware configuration
const allowedOrigins = [
    'http://localhost:3000', // Local development
    'https://backsalud-tp.up.railway.app', // Production
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
        credentials: true, // Allow cookies to be sent
    })
);

app.use(morgan('dev')); // Log HTTP requests
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: false })); // Parse URL-encoded request bodies
app.use(cookieParser()); // Parse cookies

// Routes
import routes from './routes/main.routes.js';
app.use('/api', routes); // Mount main routes under /api

// Error handling middleware
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const error = err.message || 'Error interno del servidor'; 
    return res.status(statusCode).json({
        success: false,
        error,
        statusCode,
    });
});