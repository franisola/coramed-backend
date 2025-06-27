import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';

dotenv.config();

const TOKEN_SECRET = process.env.TOKEN_SECRET;

// export const getSessionUser = async (req, res) => {
// 	const token = req.headers.authorization?.split(' ')[1];

// 	if (!token) {
// 		return res.status(401).json({ isAuthenticated: false });
// 	}

// 	try {
// 		const decoded = jwt.verify(token, TOKEN_SECRET);
// 		const user = await User.findById(decoded.id).select('-password');

// 		if (!user) {
// 			return res.status(200).json({ isAuthenticated: false });
// 		}

// 		return res.status(200).json({ isAuthenticated: true, user });
// 	} catch (err) {
// 		return res.status(401).json({ isAuthenticated: false });
// 	}
// };

export const getSessionUser = async (req, res) => {
	const token = req.headers.authorization?.split(' ')[1];

	if (!token) {
		return res.status(200).json({ isAuthenticated: false });
	}

	try {
		const decoded = jwt.verify(token, TOKEN_SECRET);

		const user = await User.findById(decoded.id).select('-password');

		if (!user) {
			return res.status(200).json({ isAuthenticated: false });
		}

		return res.status(200).json({ isAuthenticated: true, user });
	} catch (err) {
		return res.status(200).json({ isAuthenticated: false });
	}
};

export const createUser = async (req, res, next) => {
	try {
		const { dni, email, password, genero, nombreCompleto } = req.body;
		const normalizedEmail = email.toLowerCase();
		const existingUser = await User.findOne({ email: normalizedEmail });

		if (existingUser) {
			const error = new Error('Ya existe un usuario con este correo electrónico.');
			error.statusCode = 409;
			error.code = 'USER_ALREADY_EXISTS';
			return next(error);
		}

		const newUser = new User({ dni, email: normalizedEmail, password, genero, nombreCompleto });
		await newUser.save();

		const token = jwt.sign({ id: newUser._id, email: newUser.email }, TOKEN_SECRET, {
			expiresIn: '1d',
		});

		res.cookie('token', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: 24 * 60 * 60 * 1000,
		});

		res.status(201).json({ message: 'Usuario creado exitosamente.', token });
	} catch (error) {
		error.statusCode = 500;
		error.code = 'CREATE_USER_FAILED';
		next(error);
	}
};

export const loginUser = async (req, res, next) => {
	try {
		const { email, password } = req.body;
		const normalizedEmail = email.toLowerCase();
		const user = await User.findOne({ email: normalizedEmail });

		if (!user) {
			const error = new Error('Usuario no encontrado.');
			error.statusCode = 404;
			error.code = 'USER_NOT_FOUND';
			return next(error);
		}

		const isPasswordValid = await user.comparePassword(password);
		if (!isPasswordValid) {
			const error = new Error('Credenciales incorrectas.');
			error.statusCode = 401;
			error.code = 'INVALID_CREDENTIALS';
			return next(error);
		}

		const token = jwt.sign({ id: user._id, email: user.email }, TOKEN_SECRET, {
			expiresIn: '1d',
		});

		res.cookie('token', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: 24 * 60 * 60 * 1000,
		});

		res.status(200).json({ message: 'Login exitoso.', token });
	} catch (error) {
		error.statusCode = 500;
		error.code = 'LOGIN_FAILED';
		next(error);
	}
};

export const recoverPassword = async (req, res, next) => {
	try {
		const { email } = req.body;
		if (!email || typeof email !== 'string') {
			const error = new Error('Email inválido.');
			error.statusCode = 400;
			error.code = 'INVALID_EMAIL';
			return next(error);
		}
		const normalizedEmail = email.toLowerCase();
		const user = await User.findOne({ email: normalizedEmail });

		if (!user) {
			return res.status(200).json({
				message: 'Si el correo está registrado, se enviará un código de recuperación.',
			});
		}

		const recoveryCode = Math.floor(100000 + Math.random() * 900000).toString();
		const hashedCode = await bcrypt.hash(recoveryCode, 10);
		const expiration = new Date(Date.now() + 60 * 60 * 1000);

		user.recoveryCode = hashedCode;
		user.recoveryCodeExpires = expiration;
		user.recoveryCodeAttempts = 0;
		user.recoveryCodeBlockedUntil = undefined;
		user.codeVerified = false;

		await user.save();

		const transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				user: process.env.EMAIL_USER,
				pass: process.env.EMAIL_PASS,
			},
		});

		const mailOptions = {
			from: 'turnosmedicosapp@gmail.com',
			to: normalizedEmail,
			subject: 'Código para restablecer tu contraseña',
			html: `
				<p>Hola ${user.nombreCompleto || 'Usuario'},</p>
				<p>Tu código para restablecer la contraseña es:</p>
				<h2>${recoveryCode}</h2>
				<p>Este código es válido por 1 hora.</p>
				<p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
			`,
		};

		await transporter.sendMail(mailOptions);

		res.status(200).json({
			message: 'Si el correo está registrado, se enviará un código de recuperación.',
			success: true,
		});
	} catch (error) {
		error.statusCode = 500;
		error.code = 'RECOVERY_FAILED';
		next(error);
	}
};

export const verifyCode = async (req, res, next) => {
	try {
		const { email, code } = req.body;

		if (!email || !code || typeof email !== 'string' || typeof code !== 'string') {
			const error = new Error('Datos inválidos.');
			error.statusCode = 400;
			error.code = 'INVALID_INPUT';
			return next(error);
		}

		const user = await User.findOne({ email: email.toLowerCase() });
		if (!user) {
			const error = new Error('Código inválido o expirado.');
			error.statusCode = 400;
			error.code = 'INVALID_CODE';
			return next(error);
		}

		const now = new Date();
		if (user.recoveryCodeBlockedUntil && user.recoveryCodeBlockedUntil > now) {
			const error = new Error('Demasiados intentos fallidos. Intenta nuevamente más tarde.');
			error.statusCode = 429;
			error.code = 'TOO_MANY_ATTEMPTS';
			return next(error);
		}

		if (!user.recoveryCode || !user.recoveryCodeExpires || user.recoveryCodeExpires < now) {
			const error = new Error('Código inválido o expirado.');
			error.statusCode = 400;
			error.code = 'CODE_EXPIRED';
			return next(error);
		}

		const isMatch = await bcrypt.compare(code, user.recoveryCode);
		if (!isMatch) {
			user.recoveryCodeAttempts = (user.recoveryCodeAttempts || 0) + 1;
			if (user.recoveryCodeAttempts >= 5) {
				user.recoveryCodeBlockedUntil = new Date(now.getTime() + 15 * 60 * 1000);
			}
			await user.save();
			const error = new Error('Código inválido o expirado.');
			error.statusCode = 400;
			error.code = 'INVALID_CODE';
			return next(error);
		}

		user.codeVerified = true;
		user.recoveryCodeAttempts = 0;
		await user.save();

		res.status(200).json({ message: 'Código verificado correctamente.', success: true });
	} catch (error) {
		error.statusCode = 500;
		error.code = 'VERIFY_CODE_FAILED';
		next(error);
	}
};
export const resetPassword = async (req, res, next) => {
	try {
		const { email, password } = req.body;
		if (!email || !password || typeof password !== 'string') {
			const error = new Error('Datos inválidos.');
			error.statusCode = 400;
			error.code = 'INVALID_INPUT';
			return next(error);
		}

		const user = await User.findOne({ email: email.toLowerCase() });
		if (!user) {
			const error = new Error('Acción no permitida.');
			error.statusCode = 400;
			error.code = 'USER_NOT_FOUND';
			return next(error);
		}

		if (!user.codeVerified) {
			const error = new Error('Primero debes verificar el código de recuperación.');
			error.statusCode = 401;
			error.code = 'CODE_NOT_VERIFIED';
			return next(error);
		}

		const isSamePassword = await user.comparePassword(password);
		if (isSamePassword) {
			const error = new Error('La nueva contraseña debe ser distinta a la anterior.');
			error.statusCode = 400;
			error.code = 'PASSWORD_SAME_AS_OLD';
			return next(error);
		}

		user.password = password;
		user.recoveryCode = undefined;
		user.recoveryCodeExpires = undefined;
		user.recoveryCodeAttempts = 0;
		user.recoveryCodeBlockedUntil = undefined;
		user.codeVerified = false;

		await user.save();

		res.status(200).json({ message: 'Contraseña restablecida exitosamente.', success: true });
	} catch (error) {
		error.statusCode = 500;
		error.code = 'RESET_PASSWORD_FAILED';
		next(error);
	}
};

export const logoutUser = (req, res) => {
	res.clearCookie('token');
	return res.status(200).json({ message: 'Sesión cerrada exitosamente.' });
};

export const deleteAccount = async (req, res, next) => {
	try {
		const userId = req.user.id;
		const user = await User.findById(userId);
		if (!user) {
			const error = new Error('Usuario no encontrado.');
			error.statusCode = 404;
			error.code = 'USER_NOT_FOUND';
			return next(error);
		}

		await User.findByIdAndDelete(userId);
		res.status(200).json({ message: 'Cuenta eliminada exitosamente.' });
	} catch (error) {
		error.statusCode = 500;
		error.code = 'DELETE_ACCOUNT_FAILED';
		next(error);
	}
};
