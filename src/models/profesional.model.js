import mongoose from "mongoose";

const ProfesionalSchema = new mongoose.Schema(
    {
        nombre: {
            type: String,
            required: [true, "El nombre es obligatorio"],
            trim: true,
            minlength: [2, "El nombre debe tener al menos 2 caracteres"],
            maxlength: [50, "El nombre no puede tener más de 50 caracteres"],
        },
        apellido: {
            type: String,
            required: [true, "El apellido es obligatorio"],
            trim: true,
            minlength: [2, "El apellido debe tener al menos 2 caracteres"],
            maxlength: [50, "El apellido no puede tener más de 50 caracteres"],
        },
        especialidad: {
            type: String,
            required: [true, "La especialidad es obligatoria"],
            trim: true,
        },
        dias_laborales: {
            type: [String],
            required: [true, "Los días laborales son obligatorios"],
            enum: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
        },
        horarios_laborales: {
            type: [
                {
                    inicio: {
                        type: String,
                        required: [true, "El horario de inicio es obligatorio"],
                        validate: {
                            validator: function (v) {
                                return /^\d{2}:\d{2}$/.test(v); // Formato HH:mm
                            },
                            message: "El formato del horario de inicio debe ser HH:mm",
                        },
                    },
                    fin: {
                        type: String,
                        required: [true, "El horario de fin es obligatorio"],
                        validate: {
                            validator: function (v) {
                                return /^\d{2}:\d{2}$/.test(v); // Formato HH:mm
                            },
                            message: "El formato del horario de fin debe ser HH:mm",
                        },
                    },
                },
            ],
            required: [true, "Los horarios laborales son obligatorios"],
        },
    },
    { timestamps: true }
);

export default mongoose.model("Profesional", ProfesionalSchema);