import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const TOKEN_SECRET = process.env.TOKEN_SECRET; // Asegúrate de definir esto en tu archivo .env

if (!TOKEN_SECRET) {
	throw new Error('TOKEN_SECRET no está definido en las variables de entorno');
}

// Función para crear un token de acceso
export async function createAccessToken(payload) {
	try {
		const token = jwt.sign(payload, TOKEN_SECRET, { expiresIn: '1d' });
		return token;
	} catch (error) {
		throw new Error('Error al generar el token de acceso');
	}
}

// Función para obtener el token desde cookies o encabezados
const getTokenFromRequest = (req) => {
	const tokenFromCookie = req.cookies?.token;
	const tokenFromHeader = req.headers.authorization?.split(' ')[1];
	return tokenFromCookie || tokenFromHeader;
};

// Middleware para rutas donde no se requiere autenticación
export const authNotRequired = (req, res, next) => {
	const token = getTokenFromRequest(req);

	if (token) {
		return res.status(401).json({ message: 'Ya estás autenticado' });
	}

	next();
};

// Middleware para rutas protegidas (requieren autenticación)
export const authRequired = async (req, res, next) => {
	const token = getTokenFromRequest(req);

	if (!token) {
		return res.status(401).json({ message: 'No se proporcionó un token, acceso denegado' });
	}

	try {
		const decoded = jwt.verify(token, TOKEN_SECRET);
		req.user = decoded; // Agregar los datos del usuario al objeto `req`
		next();
	} catch (error) {
		return res.status(403).json({ message: 'El token no es válido o ha expirado' });
	}
};
