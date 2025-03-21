import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import { createAccessToken } from '../jwt/jwt.js';

export const createUser = async (req, res, next) => {
	const { nombre, apellido, email, password, telefono, rol, fecha_nacimiento } = req.body;

	try {
		const passwordHashed = await bcrypt.hash(password, 10);
		const newUser = await User.create({
			nombre,
			apellido,
			email,
			password: passwordHashed,
			telefono,
			rol,
			fecha_nacimiento,
		});

		const userSaved = await newUser.save();
		const token = await createAccessToken({
			id: userSaved._id,
			email: userSaved.email,
			role: userSaved.role,
		});

		const { password: hashedPassword, ...user } = userSaved._doc;

		const expires = new Date(Date.now() + 24 * 3600000);

		res.cookie('token', token, {
			expires,
			sameSite: 'None',
			secure: true,
		});
		res.status(200).json(user);
	} catch (error) {
		next(error);
	}
};

export const loginUser = async (req, res, next) => {
	const { email, password } = req.body;

	try {
		const user = await User.findOne({ email });



		if (!user) {
			return res.status(400).json('Usuario no encontrado');
		}

		const isMatch = await bcrypt.compare(password, user.password);

		if (!isMatch) {
			return res.status(400).json('Contraseña incorrecta');
		}

		const token = await createAccessToken({
			id: user._id,
			email: user.email,
			role: user.role,
		});

		const { password: hashedPassword, ...userData } = user._doc;

		const expires = new Date(Date.now() + 24 * 3600000);

		res.cookie('token', token, {
			expires,
			sameSite: 'None',
			secure: true,
		});

		return res.status(200).json(userData);
	} catch (error) {
		next(error);
	}
};

export const recoverPassword = async (req, res, next) => {};

export const getUserProfile = async (req, res, next) => {
	const { id } = req.params;

	try {
		const userFound = await User.findById(id);

		if (!userFound) next({ message: 'Usuario no encontrado', statusCode: 400 });

		let user = { user: userFound };

		return res.json(user);
	} catch (error) {
		next(error);
	}
};

export const updateUserProfile = async (req, res, next) => {};
export const deleteUser = async (req, res, next) => {};
export const getUserAppointments = async (req, res, next) => {};
export const getUserNotifications = async (req, res, next) => {};
