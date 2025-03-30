import mongoose from "mongoose";

const MedicalInfoSchema = new mongoose.Schema(
    {
        grupo_sanguineo: {
            type: String,
            enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], // Allowed values
            required: [true, "El grupo sanguíneo es obligatorio"], // Custom error message
        },
        alergias: {
            type: [String],
            default: [],
            validate: {
                validator: function (v) {
                    return v.length <= 10; // Maximum 10 allergies
                },
                message: "No puedes tener más de 10 alergias registradas",
            },
        },
        medicamentos: {
            type: [String], // Array of strings for multiple medications
            default: [], // Default: no medications
            validate: {
                validator: function (v) {
                    return v.every((medicamento) => medicamento.length <= 50); // Each medication must have a maximum of 50 characters
                },
                message: "Cada medicamento debe tener un máximo de 50 caracteres",
            },
        },
        enfermedades: {
            type: [String], // Array of strings for multiple diseases
            default: [], // Default: no diseases
            validate: {
                validator: function (v) {
                    return v.every((enfermedad) => enfermedad.length <= 50); // Each disease must have a maximum of 50 characters
                },
                message: "Cada enfermedad debe tener un máximo de 50 caracteres",
            },
        },
        antecedentes: {
            type: [String], // Array of strings for multiple medical histories
            default: [], // Default: no medical histories
            validate: {
                validator: function (v) {
                    return v.every((antecedente) => antecedente.length <= 50); // Each medical history must have a maximum of 50 characters
                },
                message: "Cada antecedente debe tener un máximo de 50 caracteres",
            },
        },
    },
    { timestamps: true } // Automatically adds createdAt and updatedAt
);

export default mongoose.model("MedicalInfo", MedicalInfoSchema, "medical_infos");