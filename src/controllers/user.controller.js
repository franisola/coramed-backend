import User from '../models/user.model.js';

import bcrypt from 'bcryptjs';
import { createAccessToken } from '../jwt/jwt.js';

export const createUser = async (req, res, next) => {
	try{
		console.log("hola");
		
		return res.status(200).json({message: 'User created'});
	} catch (error) {
		next(error);
	}
};

export const loginUser = async (req, res, next) => {};


export const recoverPassword = async (req, res, next) => {};
export const getUserProfile = async (req, res, next) => {};
export const updateUserProfile = async (req, res, next) => {};
export const deleteUser = async (req, res, next) => {};
export const getUserAppointments = async (req, res, next) => {};
export const getUserNotifications = async (req, res, next) => {};
