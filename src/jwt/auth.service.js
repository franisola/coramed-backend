import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const TOKEN_SECRET = process.env.TOKEN_SECRET;
if (!TOKEN_SECRET) {
    throw new Error('TOKEN_SECRET no está definido en las variables de entorno');
}

const TOKEN_COOKIE_NAME = 'token';

export function createAccessToken(payload) {
    return jwt.sign(payload, TOKEN_SECRET, { expiresIn: '1d' });
}

const getTokenFromRequest = (req) => {
    return req.cookies?.[TOKEN_COOKIE_NAME] || req.headers.authorization?.split(' ')[1];
};

export const authNotRequired = (req, res, next) => {
    const token = getTokenFromRequest(req);
    if (token) {
        return res.status(401).json({ message: 'Ya tienes una sesión activa.' });
    }
    next();
};

export const authRequired = (req, res, next) => {
    const token = getTokenFromRequest(req);
    if (!token) {
        return res.status(401).json({ message: 'Acceso denegado.' });
    }
    try {
        const decoded = jwt.verify(token, TOKEN_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(403).json({ message: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.' });
        }
        return res.status(403).json({ message: 'Token inválido.' });
    }
};
