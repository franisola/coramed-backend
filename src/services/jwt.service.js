import jwt from 'jsonwebtoken';
import { TOKEN_SECRET } from '../config.js';

// Generar un token de acceso
export const createAccessToken = (payload) => {
	return new Promise((resolve, reject) => {
		jwt.sign(
			payload,
			TOKEN_SECRET,
			{ expiresIn: '1d' }, // Token válido por 1 día
			(err, token) => {
				if (err) reject(err);
				resolve(token);
			}
		);
	});
};

// Verificar un token
export const verifyToken = (token) => {
	return new Promise((resolve, reject) => {
		jwt.verify(token, TOKEN_SECRET, (err, decoded) => {
			if (err) reject(err);
			resolve(decoded);
		});
	});
};

// Decodificar un token (sin verificar)
export const decodeToken = (token) => {
	return jwt.decode(token);
};
