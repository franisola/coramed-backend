import mongoose from 'mongoose';

const InfoMedicaSchema = new mongoose.Schema(
	{
		grupo_sanguineo: {
			type: String,
			enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], // Valores permitidos
			required: [true, 'El grupo sanguíneo es obligatorio'], // Mensaje de error personalizado
		},
		alergias: {
			type: [String],
			default: [],
			validate: {
				validator: function (v) {
					return v.length <= 10; // Máximo 10 alergias
				},
				message: 'No puedes tener más de 10 alergias registradas',
			},
		},
		medicamentos: {
			type: [String], // Arreglo de strings para múltiples medicamentos
			default: [],
		},
		enfermedades: {
			type: [String], // Arreglo de strings para múltiples enfermedades
			default: [],
		},
		antecedentes: {
			type: [String], // Arreglo de strings para múltiples antecedentes
			default: [],
		},
	},
	{ timestamps: true }
);

export default mongoose.model('InfoMedica', InfoMedicaSchema);
