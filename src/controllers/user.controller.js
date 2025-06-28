import User from '../models/user.model.js';

// Get the user's profile
export const getUserProfile = async (req, res, next) => {
	try {
		const userId = req.user.id;

		const user = await User.findById(userId).select('-password');

		if (!user) {
			const error = new Error('Usuario no encontrado');
			error.statusCode = 404;
			error.code = 'USER_NOT_FOUND';
			return next(error);
		}

		res.status(200).json(user);
	} catch (error) {
		error.statusCode = 500;
		error.code = 'GET_USER_PROFILE_FAILED';
		next(error);
	}
};


// Update the user's profile
export const updateUserProfile = async (req, res, next) => {
	try {
		const userId = req.user.id;
		const { nombreCompleto, dni, fechaNacimiento, genero, direccion, telefono, password } = req.body;

		const user = await User.findById(userId);
		if (!user) {
			const error = new Error('Usuario no encontrado');
			error.statusCode = 404;
			error.code = 'USER_NOT_FOUND';
			return next(error);
		}

		if (nombreCompleto) user.nombreCompleto = nombreCompleto.trim();
		if (dni) user.dni = dni;
		if (fechaNacimiento) user.fechaNacimiento = new Date(fechaNacimiento);
		if (genero) user.genero = genero;
		if (direccion) user.direccion = direccion;
		if (telefono) user.telefono = telefono;
		if (password) user.password = password;

		await user.save();

		res.status(200).json({ message: 'Perfil actualizado exitosamente', user });
	} catch (error) {
		error.statusCode = 500;
		error.code = 'UPDATE_USER_PROFILE_FAILED';
		next(error);
	}
};

// Delete the user's account
export const deleteUser = async (req, res, next) => {
	try {
		const userId = req.user.id;

		const user = await User.findById(userId);
		if (!user) {
			const error = new Error('Usuario no encontrado');
			error.statusCode = 404;
			error.code = 'USER_NOT_FOUND';
			return next(error);
		}

		await User.findByIdAndDelete(userId);

		res.status(200).json({ message: 'Cuenta eliminada exitosamente' });
	} catch (error) {
		error.statusCode = 500;
		error.code = 'DELETE_USER_FAILED';
		next(error);
	}
};
