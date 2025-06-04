import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const TOKEN_SECRET = process.env.TOKEN_SECRET;

export const getSessionUser = async (req, res, next) => {
	try {
		const user = await User.findById(req.user.id).select('-password');

		if (!user) {
			const error = new Error('Usuario no encontrado');
			error.statusCode = 404;
			return next(error);
		}

		res.status(200).json({ user, logued: true });
	} catch (error) {
		next(error);
	}
};

export const createUser = async (req, res, next) => {
	try {
		const { dni, email, password, genero, nombreCompleto } = req.body;
		const normalizedEmail = email.toLowerCase();

        const existingUser = await User.findOne({ email: normalizedEmail });

        if (existingUser) {
            const error = new Error('Ya existe un usuario con este correo electrónico.');
			error.statusCode = 404;
			return next(error);
		}

		const newUser = new User({
			dni,
			email: normalizedEmail,
			password,
			genero,
			nombreCompleto,
		});

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

		return res.status(201).json({ message: 'Usuario creado exitosamente.' });
	} catch (error) {
		if (error.name === 'ValidationError') {
			error.statusCode = 400;
		}
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
			return next(error);
		}

		const isPasswordValid = await user.comparePassword(password);
		if (!isPasswordValid) {
			const error = new Error('Credenciales incorrectas.');
			error.statusCode = 401;
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

		return res.status(200).json({ message: 'Login exitoso.' });
	} catch (error) {
		next(error);
	}
};

export const recoverPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email.toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      const error = new Error("Usuario no encontrado.");
      error.statusCode = 404;
      return next(error);
    }

    const recoveryToken = jwt.sign({ id: user._id }, TOKEN_SECRET, {
      expiresIn: "1h",
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // ✅ Enlace deep link para mobile
    const mobileLink = coramed://reset-password/${recoveryToken};

    // ✅ Enlace web (puede redirigir a la app vía linking web si la app está instalada)
    const webLink = https://coramed.com/reset-password/${recoveryToken};

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: normalizedEmail,
      subject: "Recuperación de contraseña",
      html: `
  <p>Hola ${user.nombre || 'Usuario'},</p>
  <p>Hemos recibido una solicitud para restablecer tu contraseña. Haz clic en uno de los siguientes enlaces para continuar:</p>
  <p><strong>Desde tu celular:</strong><br>
  <a href="${mobileLink}">${mobileLink}</a></p>
  <p><strong>Desde un navegador:</strong><br>
  <a href="${webLink}">${webLink}</a></p>
  <p>Este enlace es válido por 1 hora.</p>
  <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>`
,
    };

    await transporter.sendMail(mailOptions);

    return res
      .status(200)
      .json({
        message: "Se ha enviado un correo para recuperar la contraseña.",
      });
  } catch (error) {
    error.statusCode = 500;
    error.message = "Error al enviar el correo de recuperación.";
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
	try {
		const { token, newPassword } = req.body;

		let decoded;
		try {
			decoded = jwt.verify(token, TOKEN_SECRET);
		} catch (error) {
			const err = new Error('El token es inválido o ha expirado.');
			err.statusCode = 400;
			return next(err);
		}

		const user = await User.findById(decoded.id);
		if (!user) {
			const error = new Error('Usuario no encontrado.');
			error.statusCode = 404;
			return next(error);
		}

		user.password = newPassword;
		await user.save();

		return res.status(200).json({ message: 'Contraseña restablecida exitosamente.' });
	} catch (error) {
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
			return next(error);
		}

		await User.findByIdAndDelete(userId);

		res.status(200).json({ message: 'Cuenta eliminada exitosamente.' });
	} catch (error) {
		next(error);
	}
};
