import bcrypt from 'bcryptjs';
import { createAccessToken } from '../jwt/jwt.js';

export const createUser = async (req, res, next) => {
	try{		
		return res.status(200).json({message: 'User created'});
	} catch (error) {
		next(error);
	}
};

export const loginUser = async (req, res, next) => {};


export const recoverPassword = async (req, res, next) => {};
