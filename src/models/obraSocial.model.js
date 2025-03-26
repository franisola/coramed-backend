import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const ObraSocialSchema = new mongoose.Schema(
	{
		nombre: {
			type: String,
			required: [true, 'El nombre de la obra social es obligatorio'],
			trim: true,
			minlength: [3, 'El nombre debe tener al menos 3 caracteres'],
			maxlength: [50, 'El nombre no puede tener más de 50 caracteres'],
		},
		numero_socio: {
			type: String,
			default: '',
			trim: true,
			validate: {
				validator: function (v) {
					return /^[0-9]*$/.test(v); // Solo números
				},
				message: 'El número de socio debe contener solo números',
			},
		},
		plan: {
			type: String,
			default: '',
			trim: true,
			maxlength: [30, 'El plan no puede tener más de 30 caracteres'],
		},
	},
	{ timestamps: true }
);

ObraSocialSchema.pre('save', async function (next) {
	if (!this.isModified('numero_socio')) return next(); // Solo cifrar si el campo fue modificado
	const salt = await bcrypt.genSalt(10);
	this.numero_socio = await bcrypt.hash(this.numero_socio, salt);
	next();
});

const ObraSocial = mongoose.model('ObraSocial', ObraSocialSchema);

export default ObraSocial;
