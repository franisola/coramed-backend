import { z } from "zod";

// Esquema para crear o actualizar la información médica
export const upsertMedicalInfoSchema = z.object({
    grupo_sanguineo: z
        .enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"])
        .optional(),
    alergias: z
        .array(z.string().max(50, "Cada alergia debe tener un máximo de 50 caracteres"))
        .max(10, "No puedes tener más de 10 alergias registradas")
        .optional(),
    medicamentos: z
        .array(z.string().max(50, "Cada medicamento debe tener un máximo de 50 caracteres"))
        .optional(),
    enfermedades: z
        .array(z.string().max(50, "Cada enfermedad debe tener un máximo de 50 caracteres"))
        .optional(),
    antecedentes: z
        .array(z.string().max(50, "Cada antecedente debe tener un máximo de 50 caracteres"))
        .optional(),
});

// Esquema para eliminar la información médica
export const deleteMedicalInfoSchema = z.object({});