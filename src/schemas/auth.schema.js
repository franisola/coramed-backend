import { z } from "zod";

// Esquema para registrar un nuevo usuario
export const registerUserSchema = z.object({
    nombre: z.string()
        .nonempty("El nombre es obligatorio")
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(50, "El nombre no puede tener más de 50 caracteres")
        .trim(),
    apellido: z.string()
        .nonempty("El apellido es obligatorio")
        .min(2, "El apellido debe tener al menos 2 caracteres")
        .max(50, "El apellido no puede tener más de 50 caracteres")
        .trim(),
    email: z.string()
        .nonempty("El correo electrónico es obligatorio")
        .email("El correo electrónico debe ser válido")
        .trim(),
    password: z.string()
        .nonempty("La contraseña es obligatoria")
        .min(6, "La contraseña debe tener al menos 6 caracteres")
        .max(100, "La contraseña no puede tener más de 100 caracteres")
        .trim(),
    fecha_nacimiento: z.string().refine((fecha) => {
        const inputDate = new Date(fecha);
        return inputDate < new Date();
    }, "La fecha de nacimiento debe ser anterior a la fecha actual"),
    dni: z.string()
        .nonempty("El DNI es obligatorio")
        .regex(/^[0-9]{7,8}$/, "El DNI debe contener entre 7 y 8 dígitos")
        .trim(),
    genero: z.enum(["Masculino", "Femenino", "Otro"], "El género debe ser válido"),
    direccion: z.string()
        .max(100, "La dirección no puede tener más de 100 caracteres")
        .optional(), // Mover .optional() al final
    telefono: z.string()
        .regex(/^[0-9]{10}$/, "El teléfono debe contener 10 dígitos")
        .optional(), // Mover .optional() al final
});

// Esquema para iniciar sesión
export const loginUserSchema = z.object({
    email: z.string()
        .nonempty("El correo electrónico es obligatorio")
        .email("El correo electrónico debe ser válido")
        .trim(),
    password: z.string()
        .nonempty("La contraseña es obligatoria")
        .min(6, "La contraseña debe tener al menos 6 caracteres")
        .max(100, "La contraseña no puede tener más de 100 caracteres")
        .trim(),
});

// Esquema para recuperar contraseña
export const recoverPasswordSchema = z.object({
    email: z.string()
        .nonempty("El correo electrónico es obligatorio")
        .email("El correo electrónico debe ser válido")
        .trim(),
});

// Esquema para restablecer contraseña
export const resetPasswordSchema = z.object({
    token: z.string()
        .nonempty("El token es obligatorio"),
    newPassword: z.string()
        .nonempty("La nueva contraseña es obligatoria")
        .min(6, "La nueva contraseña debe tener al menos 6 caracteres")
        .max(100, "La nueva contraseña no puede tener más de 100 caracteres")
        .trim(),
});

// Esquema para eliminar un usuario
export const deleteUserSchema = z.object({});