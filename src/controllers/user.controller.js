import User from '../models/user.model.js';




export const getUserProfile = async (req, res, next) => {

	const { id } = req.params;
	try {
		return res.status(200).json("hola");
	} catch (error) {
		next(error);
	}
};
export const updateUserProfile = async (req, res, next) => {};
export const deleteUser = async (req, res, next) => {};
export const getUserAppointments = async (req, res, next) => {};
export const getUserNotifications = async (req, res, next) => {};
