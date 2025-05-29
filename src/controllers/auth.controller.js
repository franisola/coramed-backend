import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js'; // User model
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const TOKEN_SECRET = process.env.TOKEN_SECRET; // Ensure this is defined in your .env file

export const getSessionUser = async (req, res, next) => {
	try {
		const user = await User.findById(req.user.id).select('-password');

		if (!user) {
			return res.status(404).json({ message: 'Usuario no encontrado', logued: false });
		}

		res.status(200).json( { user: user, logued: true });
	} catch (error) {
		next(error);
	}
};



// Create a new user
export const createUser = async (req, res, next) => {
	try {
		const { dni, email, password, genero, nombreCompleto } = req.body;

		// Normalize the email to lowercase
		const normalizedEmail = email.toLowerCase();

		// Create the user
		const newUser = new User({
			dni,
			email: normalizedEmail,
			password, // Will be hashed automatically by the middleware in the model
			genero,
			nombreCompleto,
		});

		await newUser.save();

		// Generate a token
		const token = jwt.sign({ id: newUser._id, email: newUser.email }, TOKEN_SECRET, {
			expiresIn: '1d',
		});

		// Set the cookie with the token
		res.cookie('token', token, {
			httpOnly: true, // The cookie is not accessible from JavaScript
			secure: process.env.NODE_ENV === 'production', // Only in HTTPS in production
			sameSite: 'strict', // Prevent CSRF attacks
			maxAge: 24 * 60 * 60 * 1000, // 1 day
		});

		return res.status(201).json({ user: user, message: 'Usuario creado exitosamente.' });
	} catch (error) {
		// Handle model errors
		if (error.name === 'ValidationError') {
			return res.status(400).json({ message: error.message });
		}
		next(error);
	}
};

// Log in
export const loginUser = async (req, res, next) => {
	try {
		const { email, password } = req.body;

		// Normalizar el email a minúsculas
		const normalizedEmail = email.toLowerCase();

		// Buscar usuario por email
		const user = await User.findOne({ email: normalizedEmail });
		if (!user) {
			return res.status(404).json({ message: 'Usuario no encontrado.' });
		}

		// Verificar contraseña
		const isPasswordValid = await user.comparePassword(password);
		if (!isPasswordValid) {
			return res.status(401).json({ message: 'Credenciales incorrectas.' });
		}

		// Generar token JWT
		const token = jwt.sign({ id: user._id, email: user.email }, TOKEN_SECRET, {
			expiresIn: '1d',
		});

		// Setear cookie con el token
		res.cookie('token', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: 24 * 60 * 60 * 1000, // 1 día
		});
		return res.status(200).json({ user: user, message: 'Login exitoso.' });
	} catch (error) {
		next(error);
	}
};

// Recover password
export const recoverPassword = async (req, res, next) => {
	try {
		const { email } = req.body;

		// Normalize the email to lowercase
		const normalizedEmail = email.toLowerCase();

		// Check if the user exists
		const user = await User.findOne({ email: normalizedEmail });
		if (!user) {
			return res.status(404).json({ message: 'Usuario no encontrado.' });
		}

		// Generate a recovery token
		const recoveryToken = jwt.sign({ id: user._id }, TOKEN_SECRET, { expiresIn: '1h' });

		// Configure the email transport (using Gmail)
		const transporter = nodemailer.createTransport({
			service: 'gmail', // Use Gmail as the provider
			auth: {
				user: process.env.EMAIL_USER, // Your Gmail email
				pass: process.env.EMAIL_PASS, // Password or app token
			},
		});

		// Configure the email content
		const mailOptions = {
			from: process.env.EMAIL_USER,
			to: normalizedEmail,
			subject: 'Recuperación de contraseña',
			html: `
                <p>Hola ${user.nombre || 'Usuario'},</p>
                <p>Hemos recibido una solicitud para restablecer tu contraseña. Haz clic en el siguiente enlace para continuar:</p>
                <p>${recoveryToken}</p>
				<a href="${process.env.CLIENT_URL}/reset-password/${recoveryToken}">Restablecer contraseña</a>
                <p>Este enlace es válido por 1 hora.</p>
            `,
		};

		// Send the email
		await transporter.sendMail(mailOptions);

		return res
			.status(200)
			.json({ message: 'Se ha enviado un correo para recuperar la contraseña.' });
	} catch (error) {
		next(error);
	}
};

// Reset password
export const resetPassword = async (req, res, next) => {
	try {
		const { token, newPassword } = req.body;

		// Verify the token
		let decoded;
		try {
			decoded = jwt.verify(token, TOKEN_SECRET);
		} catch (error) {
			return res.status(400).json({ message: 'El token es inválido o ha expirado.' });
		}

		// Find the user by ID
		const user = await User.findById(decoded.id);
		if (!user) {
			return res.status(404).json({ message: 'Usuario no encontrado.' });
		}

		// Update the password
		user.password = newPassword; // Will be hashed automatically by the middleware in the model
		await user.save();

		return res.status(200).json({ message: 'Contraseña restablecida exitosamente.' });
	} catch (error) {
		next(error);
	}
};

// Log out
export const logoutUser = (req, res) => {
	res.clearCookie('token');
	return res.status(200).json({ message: 'Sesión cerrada exitosamente.' });
};

// Delete user account
export const deleteAccount = async (req, res, next) => {
	try {
		const userId = req.user.id; // The authenticated user's ID is obtained from the token

		// Check if the user exists
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ message: 'Usuario no encontrado' });
		}

		// Delete the user
		await User.findByIdAndDelete(userId);

		res.status(200).json({ message: 'Cuenta eliminada exitosamente.' });
	} catch (error) {
		next(error);
	}
};
