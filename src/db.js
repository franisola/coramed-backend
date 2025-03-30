import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables from the .env file
dotenv.config();

const uri = process.env.MONGO_URI; // Read the URI from environment variables

// Validate that the URI is defined
if (!uri) {
  throw new Error('MONGO_URI no está definida en las variables de entorno'); // Error message in Spanish
}

// Mongoose configuration options
const mongooseOptions = {
  autoIndex: process.env.NODE_ENV !== 'production', // Disable indexes in production to improve performance
  connectTimeoutMS: 10000, // Maximum time to attempt connection (10 seconds)
  socketTimeoutMS: 45000, // Maximum time to keep the connection idle
};

// Function to connect to the database
export const connectDB = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(uri, mongooseOptions);
    console.log('✅ Conexión exitosa a MongoDB'); // Success message in Spanish
  } catch (error) {
    console.error('❌ Error al conectar con MongoDB:', error.message); // Error message in Spanish
    process.exit(1); // Exit the process if unable to connect
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose está conectado a MongoDB'); // Connection message in Spanish
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ Mongoose se ha desconectado de MongoDB'); // Disconnection warning in Spanish
});

mongoose.connection.on('error', (error) => {
  console.error('❌ Error en la conexión a MongoDB:', error.message); // Error message in Spanish
});

// Handle automatic reconnection failures
mongoose.connection.on('reconnectFailed', () => {
  console.error('❌ Fallo en la reconexión a MongoDB. Verifica tu configuración.'); // Reconnection failure message in Spanish
  process.exit(1); // Exit the process if reconnection fails
});

export default connectDB;