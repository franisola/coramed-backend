import { z } from 'zod';

// Esquema para registrar un nuevo usuario
export const registerUserSchema = z.object({
	nombreCompleto: z
		.string()
		.min(1, 'El nombre completo es obligatorio.')
		.regex(/^[a-zA-ZÀ-ÿ\s]+$/, {
			message: 'Solo se permiten letras y espacios.',
		})
		.refine((val) => val.trim().split(' ').length >= 2, {
			message: 'Ingresá al menos nombre y apellido.',
		}),
	email: z
		.string()
		.nonempty('El correo electrónico es obligatorio')
		.email('El correo electrónico debe ser válido')
		.trim(),
	password: z
		.string()
		.nonempty('La contraseña es obligatoria')
		.min(6, 'La contraseña debe tener al menos 6 caracteres')
		.max(100, 'La contraseña no puede tener más de 100 caracteres')
		.trim(),

	dni: z
		.string()
		.nonempty('El DNI es obligatorio')
		.regex(/^[0-9]{7,8}$/, 'El DNI debe contener entre 7 y 8 dígitos')
		.trim(),
	genero: z.enum(['Masculino', 'Femenino', 'Otro'], 'El género debe ser válido'),

	fechaNacimiento: z.undefined(),
	telefono: z.undefined(),
	direccion: z.undefined(),
});

// Esquema para iniciar sesión
export const loginUserSchema = z.object({
	email: z
		.string()
		.nonempty('El correo electrónico es obligatorio')
		.email('El correo electrónico debe ser válido')
		.trim(),
	password: z
		.string()
		.nonempty('La contraseña es obligatoria')
		.min(6, 'La contraseña debe tener al menos 6 caracteres')
		.max(100, 'La contraseña no puede tener más de 100 caracteres')
		.trim(),
});

export const recoverPasswordSchema = z.object({
	email: z
		.string()
		.nonempty('El correo electrónico es obligatorio')
		.email('El correo electrónico debe ser válido')
		.trim(),
});

export const verifyCodeSchema = z.object({
	email: z
		.string()
		.nonempty('El correo electrónico es obligatorio')
		.email('El correo electrónico debe ser válido')
		.trim(),
	code: z
		.string()
		.nonempty('El código de verificación es obligatorio')
		.length(6, 'El código debe tener 6 dígitos')
		.regex(/^\d+$/, 'El código debe ser numérico'),
});

export const resetPasswordSchema = z.object({
	email: z
		.string()
		.nonempty('El correo electrónico es obligatorio')
		.email('El correo electrónico debe ser válido')
		.trim(),
	password: z
		.string()
		.nonempty('La nueva contraseña es obligatoria')
		.min(6, 'La nueva contraseña debe tener al menos 6 caracteres')
		.max(100, 'La nueva contraseña no puede tener más de 100 caracteres')
		.trim(),
});

// Esquema para eliminar un usuario
export const deleteUserSchema = z.object({});
