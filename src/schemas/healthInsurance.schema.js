import { z } from "zod";

// Esquema para crear o actualizar la obra social (todo obligatorio)
export const upsertHealthInsuranceSchema = z.object({
    nombre: z.string()
        .nonempty("El nombre de la obra social es obligatorio")
        .min(3, "El nombre debe tener al menos 3 caracteres")
        .max(50, "El nombre no puede tener más de 50 caracteres")
        .trim(),
    numero_socio: z.string()
        .nonempty("El número de socio es obligatorio")
        .regex(/^[0-9]*$/, "El número de socio debe contener solo números")
        .max(20, "El número de socio no puede tener más de 20 caracteres")
        .trim(),
    plan: z.string()
        .nonempty("El plan es obligatorio")
        .max(30, "El plan no puede tener más de 30 caracteres")
        .trim(),
});

// Esquema para eliminar la obra social
export const deleteHealthInsuranceSchema = z.object({});