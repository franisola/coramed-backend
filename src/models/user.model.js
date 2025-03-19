import mongoose from "mongoose";


const UserSchema = new mongoose.Schema(
    {
        nombre: {
            type: String,
            required: true, 
            trim: true
        },
        apellido: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            trim: true,
            unique: true
        },
        password: {
            type: String,
            required: true,
            trim: true
        },
        fecha_nacimiento: {
            type: Date,
            required: true,
            trim: true
        },
        rol: {
            type: String,
            required: true,
            trim: true
        },
        telefono: {
            type: Number,
            required: true,
            trim: true
        },
    }, 
    {
        versionKey: false
    }
);

export default mongoose.model('User', UserSchema);