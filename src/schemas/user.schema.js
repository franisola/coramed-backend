import { z } from "zod";

// Esquema para validar el perfil del usuario
export const updateUserProfileSchema = z.object({
    nombre: z.string()
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(50, "El nombre no puede tener más de 50 caracteres")
        .optional(),
    apellido: z.string()
        .min(2, "El apellido debe tener al menos 2 caracteres")
        .max(50, "El apellido no puede tener más de 50 caracteres")
        .optional(),
    fecha_nacimiento: z.string().refine((fecha) => {
        const inputDate = new Date(fecha);
        return inputDate < new Date();
    }, "La fecha de nacimiento debe ser anterior a la fecha actual").optional(),
    genero: z.enum(["Masculino", "Femenino", "Otro"]).optional(),
    direccion: z.string()
        .max(100, "La dirección no puede tener más de 100 caracteres")
        .optional(),
    telefono: z.string()
        .regex(/^[0-9]{10}$/, "El teléfono debe contener 10 dígitos")
        .optional(),
});


// Esquema para eliminar un usuario
export const deleteUserSchema = z.object({});