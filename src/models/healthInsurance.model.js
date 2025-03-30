import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const HealthInsuranceSchema = new mongoose.Schema(
    {
        nombre: {
            type: String,
            required: [true, "El nombre de la obra social es obligatorio"],
            trim: true,
            minlength: [3, "El nombre debe tener al menos 3 caracteres"],
            maxlength: [50, "El nombre no puede tener más de 50 caracteres"],
        },
        numero_socio: {
            type: String,
            default: "",
            trim: true,
            validate: {
                validator: function (v) {
                    return /^[0-9]*$/.test(v); // Solo números
                },
                message: "El número de socio debe contener solo números",
            },
            maxlength: [20, "El número de socio no puede tener más de 20 caracteres"],
        },
        numero_socio_visible: {
            type: String,
            default: "",
            trim: true,
            maxlength: [20, "El número de socio no puede tener más de 20 caracteres"],
        },
        plan: {
            type: String,
            default: "",
            trim: true,
            maxlength: [30, "El plan no puede tener más de 30 caracteres"],
        },
    },
    { timestamps: true } // Agrega createdAt y updatedAt automáticamente
);

// Middleware para cifrar el número de socio antes de guardar
HealthInsuranceSchema.pre("save", async function (next) {
    if (!this.isModified("numero_socio") || this.numero_socio === "") return next(); // Solo cifrar si el campo fue modificado y no está vacío
    const salt = await bcrypt.genSalt(10);
    this.numero_socio = await bcrypt.hash(this.numero_socio, salt);
    next();
});

export default mongoose.model("HealthInsurance", HealthInsuranceSchema);