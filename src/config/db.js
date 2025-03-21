import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Cargar las variables de entorno desde el archivo .env
dotenv.config();

const uri = process.env.MONGO_URI; // Leer la URI desde las variables de entorno

// Validar que la URI esté definida
if (!uri) {
  throw new Error('MONGO_URI no está definida en las variables de entorno');
}

// Opciones de configuración para Mongoose
const mongooseOptions = {
  autoIndex: process.env.NODE_ENV !== 'production', // Deshabilitar índices en producción para mejorar el rendimiento
  connectTimeoutMS: 10000, // Tiempo máximo para intentar conectarse (10 segundos)
  socketTimeoutMS: 45000, // Tiempo máximo para mantener la conexión inactiva
};

// Función para conectar a la base de datos
export const connectDB = async () => {
  try {
    // Conectar a MongoDB
    await mongoose.connect(uri, mongooseOptions);
    console.log('✅ Conexión exitosa a MongoDB');
  } catch (error) {
    console.error('❌ Error al conectar con MongoDB:', error.message);
    process.exit(1); // Salir del proceso si no se puede conectar
  }
};

// Manejo de eventos de conexión
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose está conectado a MongoDB');
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ Mongoose se ha desconectado de MongoDB');
});

mongoose.connection.on('error', (error) => {
  console.error('❌ Error en la conexión a MongoDB:', error.message);
});

// Reconexión automática en caso de desconexión
mongoose.connection.on('reconnectFailed', () => {
  console.error('❌ Fallo en la reconexión a MongoDB. Verifica tu configuración.');
  process.exit(1); // Salir del proceso si no se puede reconectar
});

export default connectDB;