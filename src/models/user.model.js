import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema(
	{
		nombre: {
			type: String,
			required: [true, 'El nombre es obligatorio'],
			trim: true,
			minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
			maxlength: [50, 'El nombre no puede tener más de 50 caracteres'],
		},
		apellido: {
			type: String,
			required: [true, 'El apellido es obligatorio'],
			trim: true,
			minlength: [2, 'El apellido debe tener al menos 2 caracteres'],
			maxlength: [50, 'El apellido no puede tener más de 50 caracteres'],
		},
		email: {
			type: String,
			required: [true, 'El correo electrónico es obligatorio'],
			trim: true,
			unique: true,
			match: [/.+@.+\..+/, 'Por favor, ingresa un correo electrónico válido'],
		},
		password: {
			type: String,
			required: [true, 'La contraseña es obligatoria'],
			trim: true,
			minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
		},
		// Campos opcionales que se pueden agregar posteriormente
		fecha_nacimiento: {
			type: Date,
		},
		dni: {
			type: String,
			trim: true,
			unique: true,
			validate: {
				validator: function (v) {
					return /^[0-9]{7,8}$/.test(v); // Solo números, 7 u 8 dígitos
				},
				message: 'El DNI debe contener entre 7 y 8 dígitos',
			},
		},
		genero: {
			type: String,
			enum: ['Masculino', 'Femenino', 'Otro'],
			default: 'Otro',
		},
		direccion: {
			type: String,
			trim: true,
			maxlength: [100, 'La dirección no puede tener más de 100 caracteres'],
		},
		telefono: {
			type: String,
			trim: true,
			validate: {
				validator: function (v) {
					return /^[0-9]{10}$/.test(v); // Solo números, 10 dígitos
				},
				message: 'El teléfono debe contener 10 dígitos',
			},
		},
		informacion_medica: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'InfoMedica', // Relación con el modelo InfoMedica
		},
		obra_social: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'ObraSocial', // Relación con el modelo ObraSocial
		},
	},
	{
		timestamps: true, // Agrega createdAt y updatedAt automáticamente
		versionKey: false, // Elimina el campo __v
	}
);

// Middleware para cifrar la contraseña antes de guardar
UserSchema.pre('save', async function (next) {
	if (!this.isModified('password')) return next(); // Solo cifrar si la contraseña fue modificada
	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
	next();
});

// Método para comparar contraseñas
UserSchema.methods.comparePassword = async function (password) {
	return await bcrypt.compare(password, this.password);
};

export default mongoose.model('User', UserSchema);