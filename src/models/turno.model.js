import mongoose from "mongoose";

const TurnoSchema = new mongoose.Schema(
    {
        paciente: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // Relación con el modelo User
            required: [true, "El paciente es obligatorio"],
        },
        profesional: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Profesional", // Relación con el modelo Profesional
            required: [true, "El profesional es obligatorio"],
        },
        fecha: {
            type: Date,
            required: [true, "La fecha es obligatoria"],
            validate: {
                validator: function (v) {
                    return v > new Date(); // Validar que la fecha sea futura
                },
                message: "La fecha debe ser en el futuro",
            },
        },
        hora: {
            type: String,
            required: [true, "La hora es obligatoria"],
            validate: {
                validator: function (v) {
                    return /^\d{2}:\d{2}$/.test(v); // Formato HH:mm
                },
                message: "El formato de hora debe ser HH:mm",
            },
        },
        estado: {
            type: String,
            enum: ["Agendado", "Cancelado", "Completado"],
            default: "Agendado",
        },
        motivo_consulta: {
            type: String,
            required: [true, "El motivo de consulta es obligatorio"],
            trim: true,
            maxlength: [500, "El motivo de consulta no puede tener más de 500 caracteres"],
        },
        notas_medicas: {
            type: String,
            trim: true,
            maxlength: [1000, "Las notas médicas no pueden tener más de 1000 caracteres"],
        },
        resultados_estudios: {
            type: [
                {
                    nombre: { type: String, required: true }, // Nombre del estudio
                    imagen: { type: String, required: true }, // URL o ruta del archivo
                    fecha_carga: { type: Date, default: Date.now }, // Fecha de carga
                },
            ],
            default: [],
        },
        notificacion_enviada: {
            type: Boolean,
            default: false, // Indica si se envió una notificación recordatoria
        },
    },
    { timestamps: true } // Agrega createdAt y updatedAt automáticamente
);

export default mongoose.model("Turno", TurnoSchema);