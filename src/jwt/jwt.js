import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Cargar las variables de entorno desde el archivo .env
dotenv.config();

const TOKEN_SECRET = process.env.TOKEN_SECRET; // Obtener el secreto desde las variables de entorno

// Validar que TOKEN_SECRET esté definido
if (!TOKEN_SECRET) {
    throw new Error('TOKEN_SECRET no está definido en las variables de entorno');
}

/**
 * Crea un token de acceso firmado con un tiempo de expiración de 1 día.
 * @param {Object} payload - Información que se incluirá en el token.
 * @returns {Promise<string>} - Token firmado.
 */
export function createAccessToken(payload) {
    return new Promise((resolve, reject) => {
        jwt.sign(
            payload,
            TOKEN_SECRET,
            { expiresIn: '1d' },
            (err, token) => {
                if (err) {
                    return reject(err);
                }
                resolve(token);
            }
        );
    });
}