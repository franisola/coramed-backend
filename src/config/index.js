import app from './app.js';
import connectDB from './db.js';

const startServer = async () => {
  try {
    await connectDB(); // Conectar a la base de datos
    app.listen(3001, () => {
      console.log('Servidor corriendo en el puerto 3001');
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error.message);
    process.exit(1);
  }
};

startServer();