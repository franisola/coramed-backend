import mongoose from 'mongoose';
const mongodb = 'mongodb://127.0.0.1/TPOAPI';

export const connectDB = async () => {
	try {
		await mongoose.connect(mongodb);
		console.log('Database connected');
	} catch (error) {
		console.log(error);
	}
};
