import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
    {
        nombre: {
            type: String,
            trim: true,
            minlength: [2, "El nombre debe tener al menos 2 caracteres"],
            maxlength: [50, "El nombre no puede tener más de 50 caracteres"],
        },
        apellido: {
            type: String,
            trim: true,
            minlength: [2, "El apellido debe tener al menos 2 caracteres"],
            maxlength: [50, "El apellido no puede tener más de 50 caracteres"],
        },
        email: {
            type: String,
            required: [true, "El correo electrónico es obligatorio"],
            trim: true,
            unique: true,
            match: [/.+@.+\..+/, "Por favor, ingresa un correo electrónico válido"],
        },
        password: {
            type: String,
            required: [true, "La contraseña es obligatoria"],
            trim: true,
            minlength: [6, "La contraseña debe tener al menos 6 caracteres"],
        },
        fecha_nacimiento: {
            type: Date,
            validate: {
                validator: function (v) {
                    // Validate that the date is earlier than the current date
                    return v < new Date();
                },
                message: "La fecha de nacimiento debe ser anterior a la fecha actual",
            },
        },
        dni: {
            type: String,
            required: [true, "El DNI es obligatorio"],
            trim: true,
            unique: true,
            sparse: true,
            validate: {
                validator: function (v) {
                    return /^[0-9]{7,8}$/.test(v); // Only numbers, 7 or 8 digits
                },
                message: "El DNI debe contener entre 7 y 8 dígitos",
            },
        },
        genero: {
            type: String,
            required: [true, "El género es obligatorio"],
            enum: ["Masculino", "Femenino", "Otro"],
            default: "Otro",
        },
        direccion: {
            type: String,
            trim: true,
            maxlength: [100, "La dirección no puede tener más de 100 caracteres"],
        },
        telefono: {
            type: String,
            trim: true,
            validate: {
                validator: function (v) {
                    return /^[0-9]{10}$/.test(v); // Only numbers, 10 digits
                },
                message: "El teléfono debe contener 10 dígitos",
            },
        },
        informacion_medica: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "InfoMedica", // Relation with the InfoMedica model
        },
        obra_social: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ObraSocial", // Relation with the ObraSocial model
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt
        versionKey: false, // Removes the __v field
    }
);

// Middleware to hash the password before saving
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next(); // Only hash if the password was modified
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

export default mongoose.model("User", UserSchema);