import app from './app.js';
import connectDB from './db.js';

const PORT = process.env.PORT || 3000; // Use the port provided by Railway or default to 3000

const startServer = async () => {
  try {
    await connectDB(); // Connect to the database
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en el puerto ${PORT}`); // Success message in Spanish
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error.message); // Error message in Spanish
    process.exit(1); // Exit the process if the server fails to start
  }
};

startServer();