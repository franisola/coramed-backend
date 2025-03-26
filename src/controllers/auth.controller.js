import bcrypt from 'bcryptjs';



export const me = async (req, res, next) => {
	try {
		return res.status(200).json({message: 'User found'});
	} catch (error) {
		return res.status(500).json({message: 'Internal Server Error'});
		next(error);
	}
}

export const createUser = async (req, res, next) => {
	try{		
		return res.status(200).json({message: 'User created'});
	} catch (error) {
		next(error);
	}
};

export const loginUser = async (req, res, next) => {};


export const recoverPassword = async (req, res, next) => {};
