import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js'; // Modelo de usuario
import dotenv from 'dotenv';

dotenv.config();

const TOKEN_SECRET = process.env.TOKEN_SECRET; // Asegúrate de definir esto en tu archivo .env

// Crear un nuevo usuario (solo campos requeridos)
export const createUser = async (req, res, next) => {
    try {
        let { nombre, apellido, email, password } = req.body;

        // Normalizar el email a minúsculas
        email = email.toLowerCase();

        // Validar que los campos obligatorios estén presentes
        if (!nombre || !apellido || !email || !password) {
            return res.status(400).json({ message: 'Los campos nombre, apellido, email y contraseña son obligatorios.' });
        }

        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'El correo electrónico ya está registrado.' });
        }

        // Crear el usuario
        const newUser = new User({
            nombre,
            apellido,
            email,
            password, // Será cifrada automáticamente por el middleware en el modelo
        });

        await newUser.save();

        // Generar un token
        const token = jwt.sign({ id: newUser._id, email: newUser.email }, TOKEN_SECRET, { expiresIn: '1d' });

        // Configurar la cookie con el token
        res.cookie('token', token, {
            httpOnly: true, // La cookie no es accesible desde JavaScript
            secure: process.env.NODE_ENV === 'production', // Solo en HTTPS en producción
            sameSite: 'strict', // Evita ataques CSRF
            maxAge: 24 * 60 * 60 * 1000, // 1 día
        });

        return res.status(201).json({ message: 'Usuario creado exitosamente.' });
    } catch (error) {
        next(error);
    }
};

// Iniciar sesión
export const loginUser = async (req, res, next) => {
    try {
        let { email, password } = req.body;

        // Normalizar el email a minúsculas
        email = email.toLowerCase();

        // Validar que los campos obligatorios estén presentes
        if (!email || !password) {
            return res.status(400).json({ message: 'Los campos email y contraseña son obligatorios.' });
        }

        // Verificar si el usuario existe
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        // Verificar la contraseña
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Credenciales incorrectas.' });
        }

        // Generar un token
        const token = jwt.sign({ id: user._id, email: user.email }, TOKEN_SECRET, { expiresIn: '1d' });

        // Configurar la cookie con el token
        res.cookie('token', token, {
            httpOnly: true, // La cookie no es accesible desde JavaScript
            secure: process.env.NODE_ENV === 'production', // Solo en HTTPS en producción
            sameSite: 'strict', // Evita ataques CSRF
            maxAge: 24 * 60 * 60 * 1000, // 1 día
        });

        return res.status(200).json({ message: 'Inicio de sesión exitoso.' });
    } catch (error) {
        next(error);
    }
};

// Recuperar contraseña
export const recoverPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        // Validar que el correo esté presente
        if (!email) {
            return res.status(400).json({ message: 'El correo electrónico es obligatorio.' });
        }

        // Verificar si el usuario existe
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        // Aquí puedes implementar la lógica para enviar un correo de recuperación
        // Por ejemplo, generar un token de recuperación y enviarlo por correo
        // const recoveryToken = jwt.sign({ id: user._id }, TOKEN_SECRET, { expiresIn: '1h' });

        return res.status(200).json({ message: 'Se ha enviado un correo para recuperar la contraseña.' });
    } catch (error) {
        next(error);
    }
};

// Cerrar sesión
export const logoutUser = (req, res) => {
    res.clearCookie('token');
    return res.status(200).json({ message: 'Sesión cerrada exitosamente.' });
};