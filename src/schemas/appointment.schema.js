import { z } from 'zod';

// Esquema para crear un turno
export const createAppointmentSchema = z.object({
	// paciente: z.string().nonempty("El ID del paciente es obligatorio"),
	profesional: z.string().nonempty('El ID del profesional es obligatorio'),
	especialidad: z
		.string()
		.nonempty('La especialidad es obligatoria')
		.max(100, 'La especialidad no puede tener más de 100 caracteres')
		.trim(),

	fecha: z.string().refine((fecha) => {
		const inputDate = new Date(fecha);
		const tomorrow = new Date();
		tomorrow.setHours(0, 0, 0, 0);
		tomorrow.setDate(tomorrow.getDate() + 1);
		const inputYMD = inputDate.toISOString().slice(0, 10);
		const tomorrowYMD = tomorrow.toISOString().slice(0, 10);

		return inputYMD >= tomorrowYMD;
	}, 'La fecha del turno debe ser a partir de mañana a las 00:00 horas'),
	hora: z
		.string()
		.nonempty('La hora es obligatoria')
		.regex(/^\d{2}:\d{2}$/, 'El formato de hora debe ser HH:mm'),
	motivo_consulta: z
		.string()
		.nonempty('El motivo de consulta es obligatorio')
		.min(10, 'El motivo de consulta debe tener al menos 10 caracteres')
		.max(500, 'El motivo de consulta no puede tener más de 500 caracteres')
		.trim(),
});

// Esquema para actualizar el estado de un turno
export const updateAppointmentStatusSchema = z.object({
	estado: z.enum(['Agendado', 'Cancelado', 'Completado'], {
		required_error: 'El estado es obligatorio',
	}),
});

// Esquema para agregar resultados de estudios a un turno
export const addStudyResultsSchema = z.object({
	notas_medicas: z
		.string()
		.max(1000, 'Las notas médicas no pueden tener más de 1000 caracteres')
		.trim()
		.optional(),
	resultados_estudios: z
		.array(
			z.object({
				nombre: z
					.string()
					.nonempty('El nombre del estudio es obligatorio')
					.max(100, 'El nombre del estudio no puede tener más de 100 caracteres'),
				pdf: z
					.string()
					.url('El archivo debe ser una URL válida')
					.refine(
						(val) => {
							// Permitir que termine en .pdf o tenga query params tras .pdf
							if (/\.pdf(\?.*)?$/.test(val)) return true;
							// Permitir links de Google Drive
							if (val.includes('drive.google.com')) return true;
							// Permitir links de Dropbox con .pdf y query params
							if (/dropbox.com/.test(val) && /\.pdf(\?.*)?$/.test(val)) return true;
							return false;
						},
						{
							message:
								'El archivo debe ser un PDF (.pdf) o un link válido de Google Drive o Dropbox',
						}
					),
				fecha_carga: z.string().refine((fecha) => new Date(fecha) <= new Date(), {
					message: 'La fecha de carga no puede ser una fecha futura',
				}),
			})
		)
		.max(10, 'No puedes registrar más de 10 estudios por turno'),

	motivo_consulta: z.undefined(),
	profesional: z.undefined(),
	paciente: z.undefined(),
	estado: z.undefined(),
	fecha: z.undefined(),
	hora: z.undefined(),
	_id: z.undefined(),
	createdAt: z.undefined(),
	updatedAt: z.undefined(),
	__v: z.undefined(),
});

// Esquema para eliminar un turno
export const deleteAppointmentSchema = z.object({});
