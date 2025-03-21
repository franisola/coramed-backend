import User from '../models/user.model.js';

import bcrypt from 'bcryptjs';
import { createAccessToken } from '../jwt/jwt.js';

export const createUser = async (req, res, next) => {
	const { nombre, apellido, email, password, telefono, rol, fecha_nacimiento } = req.body;
  
	try {
	  // Crear el usuario en la base de datos
	  const newUser = await User.create({
		nombre,
		apellido,
		email,
		password, // El middleware en el modelo se encargará de encriptar esta contraseña
		telefono,
		rol,
		fecha_nacimiento,
	  });
  
	  // Generar un token de acceso para el usuario
	  const token = await createAccessToken({
		id: newUser._id,
		email: newUser.email,
		role: newUser.rol,
	  });
  
	  // Excluir la contraseña del usuario en la respuesta
	  const { password: hashedPassword, ...userData } = newUser._doc;
  
	  // Configurar la cookie con el token
	  const expires = new Date(Date.now() + 24 * 3600000); // 1 día
	  res.cookie('token', token, {
		expires,
		sameSite: 'None',
		secure: true,
	  });
  
	  // Responder con los datos del usuario
	  return res.status(201).json({
		success: true,
		user: userData,
	  });
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
