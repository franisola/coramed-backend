import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js'; // Modelo de usuario
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

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
			return res
				.status(400)
				.json({
					message: 'Los campos nombre, apellido, email y contraseña son obligatorios.',
				});
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
		const token = jwt.sign({ id: newUser._id, email: newUser.email }, TOKEN_SECRET, {
			expiresIn: '1d',
		});

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
			return res
				.status(400)
				.json({ message: 'Los campos email y contraseña son obligatorios.' });
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
		const token = jwt.sign({ id: user._id, email: user.email }, TOKEN_SECRET, {
			expiresIn: '1d',
		});

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

export const recoverPassword = async (req, res, next) => {
	try {
		const { email } = req.body;

		// Validar que el correo esté presente
		if (!email) {
			return res.status(400).json({ message: 'El correo electrónico es obligatorio.' });
		}

		// Normalizar el email a minúsculas
		const normalizedEmail = email.toLowerCase();

		// Verificar si el usuario existe
		const user = await User.findOne({ email: normalizedEmail });
		if (!user) {
			return res.status(404).json({ message: 'Usuario no encontrado.' });
		}

		// Generar un token de recuperación
		const recoveryToken = jwt.sign({ id: user._id }, TOKEN_SECRET, { expiresIn: '1h' });

		// Configurar el transporte de correo (usando Gmail)
		const transporter = nodemailer.createTransport({
			service: 'gmail', // Usar Gmail como proveedor
			auth: {
				user: process.env.EMAIL_USER, // Tu correo de Gmail
				pass: process.env.EMAIL_PASS, // Contraseña o token de aplicación
			},
		});

		// Configurar el contenido del correo
		const mailOptions = {
			from: process.env.EMAIL_USER,
			to: normalizedEmail,
			subject: 'Recuperación de contraseña',
			html: `
                <p>Hola ${user.nombre},</p>
                <p>Hemos recibido una solicitud para restablecer tu contraseña. Haz clic en el siguiente enlace para continuar:</p>
				<p>${recoveryToken}</p>
                <a href="${process.env.CLIENT_URL}/reset-password/${recoveryToken}">Restablecer contraseña</a>
                <p>Este enlace es válido por 1 hora.</p>
            `,
		};

		// Enviar el correo
		await transporter.sendMail(mailOptions);

		return res
			.status(200)
			.json({ message: 'Se ha enviado un correo para recuperar la contraseña.' });
	} catch (error) {
		next(error);
	}
};

export const resetPassword = async (req, res, next) => {
	try {
		const { token, newPassword } = req.body;

		// Validar que el token y la nueva contraseña estén presentes
		if (!token || !newPassword) {
			return res
				.status(400)
				.json({ message: 'El token y la nueva contraseña son obligatorios.' });
		}

		// Verificar el token
		let decoded;
		try {
			decoded = jwt.verify(token, TOKEN_SECRET);
		} catch (error) {
			return res.status(400).json({ message: 'El token es inválido o ha expirado.' });
		}

		// Buscar al usuario por ID
		const user = await User.findById(decoded.id);
		if (!user) {
			return res.status(404).json({ message: 'Usuario no encontrado.' });
		}

		// Actualizar la contraseña
		user.password = newPassword; // Será cifrada automáticamente por el middleware en el modelo
		await user.save();

		return res.status(200).json({ message: 'Contraseña restablecida exitosamente.' });
	} catch (error) {
		next(error);
	}
};

// Cerrar sesión
export const logoutUser = (req, res) => {
	res.clearCookie('token');
	return res.status(200).json({ message: 'Sesión cerrada exitosamente.' });
};

// Controlador para eliminar la cuenta del usuario
export const deleteAccount = async (req, res, next) => {
	try {
		const userId = req.user.id; // El ID del usuario autenticado se obtiene del token

		// Verificar si el usuario existe
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ message: 'Usuario no encontrado' });
		}

		// Eliminar el usuario
		await User.findByIdAndDelete(userId);

		res.status(200).json({ message: 'Cuenta eliminada exitosamente' });
	} catch (error) {
		next(error);
	}
};
