import mongoose from "mongoose";

// Professional schema
const ProfessionalSchema = new mongoose.Schema(
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
            enum: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"],
            validate: {
                validator: function (dias) {
                    return dias.length > 0;
                },
                message: "Debe haber al menos un día laboral",
            },
        },
        horarios_laborales: {
            type: [
                {
                    inicio: {
                        type: String,
                        required: [true, "El horario de inicio es obligatorio"],
                        validate: {
                            validator: function (v) {
                                return /^\d{2}:\d{2}$/.test(v); // Format HH:mm
                            },
                            message: "El formato del horario de inicio debe ser HH:mm",
                        },
                    },
                    fin: {
                        type: String,
                        required: [true, "El horario de fin es obligatorio"],
                        validate: {
                            validator: function (v) {
                                return /^\d{2}:\d{2}$/.test(v); // Format HH:mm
                            },
                            message: "El formato del horario de fin debe ser HH:mm",
                        },
                    },
                },
            ],
            required: [true, "Los horarios laborales son obligatorios"],
            validate: {
                validator: function (horarios) {
                    return horarios.every(({ inicio, fin }) => {
                        const [horaInicio, minutoInicio] = inicio.split(":").map(Number);
                        const [horaFin, minutoFin] = fin.split(":").map(Number);
                        return horaInicio < horaFin || (horaInicio === horaFin && minutoInicio < minutoFin);
                    });
                },
                message: "El horario de inicio debe ser menor que el horario de fin",
            },
        },
    },
    { timestamps: true } // Automatically adds createdAt and updatedAt
);

export default mongoose.model("Professional", ProfessionalSchema);