import { z } from 'zod';

export const updateUserProfileSchema = z
	.object({
		nombreCompleto: z
			.string()
			.min(1, 'El nombre completo es obligatorio.')
			.regex(/^[a-zA-ZÀ-ÿ\s]+$/, {
				message: 'Solo se permiten letras y espacios.',
			})
			.refine((val) => val.trim().split(' ').length >= 2, {
				message: 'Ingresá al menos nombre y apellido.',
			})
			.optional(), // 🔄 Ahora es opcional

		dni: z
			.string()
			.regex(/^\d{7,8}$/, 'El DNI debe contener entre 7 y 8 dígitos.')
			.optional(),

		fecha_nacimiento: z
			.string()
			.optional()
			.refine(
				(fecha) => {
					if (!fecha) return true;
					const inputDate = new Date(fecha);
					return !isNaN(inputDate.getTime()) && inputDate < new Date();
				},
				{
					message: 'La fecha de nacimiento debe ser anterior a la fecha actual.',
				}
			),

		genero: z
			.enum(['Masculino', 'Femenino', 'Otro'], {
				errorMap: () => ({ message: 'El género debe ser válido.' }),
			})
			.optional(),

		direccion: z
			.string()
			.min(5, 'La dirección debe tener al menos 5 caracteres.')
			.max(100, 'La dirección no puede tener más de 100 caracteres.')
			.optional(),

		telefono: z
			.string()
			.regex(/^\d{10}$/, 'El teléfono debe contener 10 dígitos.')
			.optional(),

		password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.').optional(),

		confirmPassword: z.string().optional(),
	})
	.superRefine((data, ctx) => {
		if (data.password || data.confirmPassword) {
			if (!data.password || !data.confirmPassword) {
				ctx.addIssue({
					path: ['confirmPassword'],
					code: z.ZodIssueCode.custom,
					message: 'Debes completar ambos campos de contraseña.',
				});
			} else if (data.password !== data.confirmPassword) {
				ctx.addIssue({
					path: ['confirmPassword'],
					code: z.ZodIssueCode.custom,
					message: 'Las contraseñas no coinciden.',
				});
			}
		}
	});

// Esquema para eliminar un usuario
export const deleteUserSchema = z.object({});
