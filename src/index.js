import app from './app.js';
import connectDB from './db.js';

const PORT = process.env.PORT || 3000; // Usa el puerto proporcionado por Railway o 3000 como predeterminado

const startServer = async () => {
  try {
    await connectDB(); // Conectar a la base de datos
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error.message);
    process.exit(1);
  }
};

startServer();