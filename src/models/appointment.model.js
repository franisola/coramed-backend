import mongoose from "mongoose";

const AppointmentSchema = new mongoose.Schema(
    {
        paciente: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // Relation with the User model
            required: [true, "El paciente es obligatorio"],
        },
        profesional: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Professional", // Relation with the Professional model
            required: [true, "El profesional es obligatorio"],
        },
        especialidad: {
            type: String,
            required: [true, "La especialidad es obligatoria"],
            trim: true,
            maxlength: [100, "La especialidad no puede tener más de 100 caracteres"],
        },
        fecha: {
            type: Date,
            required: [true, "La fecha es obligatoria"],
            validate: {
                validator: function (v) {
                    return v > new Date(); // Validate that the date is in the future
                },
                message: "La fecha debe ser en el futuro",
            },
        },
        hora: {
            type: String,
            required: [true, "La hora es obligatoria"],
            validate: {
                validator: function (v) {
                    return /^\d{2}:\d{2}$/.test(v); // Format HH:mm
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
            minlength: [10, "El motivo de consulta debe tener al menos 10 caracteres"],
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
                    nombre: { 
                        type: String, 
                        required: [true, "El nombre del estudio es obligatorio"], 
                        trim: true,
                        maxlength: [100, "El nombre del estudio no puede tener más de 100 caracteres"],
                    },
                    imagenes: [
                        {
                            type: String,
                            required: [true, "La imagen del estudio es obligatoria"],
                            trim: true,
                            validate: {
                                validator: function (v) {
                                    return /^https?:\/\/.+\.(jpg|jpeg|png|gif|bmp|pdf)$/.test(v); // Validate URL for image or PDF
                                },
                                message: "La imagen debe ser una URL válida que termine en .jpg, .jpeg, .png, .gif, .bmp o .pdf",
                            },
                        },
                    ],
                    fecha_carga: { 
                        type: Date, 
                        default: Date.now, 
                        validate: {
                            validator: function (v) {
                                return v <= new Date(); // Validate that the upload date is not in the future
                            },
                            message: "La fecha de carga no puede ser una fecha futura",
                        },
                    },
                },
            ],
            default: [],
            validate: {
                validator: function (v) {
                    return v.length <= 10; // Maximum 10 studies per appointment
                },
                message: "No puedes registrar más de 10 estudios por turno",
            },
        },
        notificacion_enviada: {
            type: Boolean,
            default: false, // Indicates whether a reminder notification was sent
        },
    },
    { timestamps: true } // Automatically adds createdAt and updatedAt
);

export default mongoose.model("Appointment", AppointmentSchema);