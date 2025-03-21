import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Cargar las variables de entorno desde el archivo .env
dotenv.config();

const uri = process.env.MONGO_URI; // Leer la URI desde las variables de entorno

// Validar que la URI esté definida
if (!uri) {
  throw new Error('MONGO_URI no está definida en las variables de entorno');
}

// Función para conectar a la base de datos
export const connectDB = async () => {
  try {
    // Conectar a MongoDB
    await mongoose.connect(uri); // Sin opciones obsoletas
    console.log('Conexión exitosa a MongoDB');
  } catch (error) {
    console.error('Error al conectar con MongoDB:', error.message);
    process.exit(1); // Salir del proceso si no se puede conectar
  }
};

// Evento para manejar la desconexión
mongoose.connection.on('disconnected', () => {
  console.log('Desconectado de MongoDB');
});

// Evento para manejar errores en la conexión
mongoose.connection.on('error', (error) => {
  console.error('Error en la conexión a MongoDB:', error.message);
});

export default connectDB;