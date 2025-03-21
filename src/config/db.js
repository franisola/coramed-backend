import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';

// Cargar las variables de entorno desde el archivo .env
dotenv.config();

const uri = process.env.MONGO_URI; // Leer la URI desde las variables de entorno



// Validar que MONGO_URI esté definido
if (!uri) {
  throw new Error('MONGO_URI no está definido en las variables de entorno');
}

// Crear un cliente de MongoDB con opciones
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

export const connectDB = async () => {
	try {
	  // Conectar el cliente al servidor
	  await client.connect();
	  // Enviar un ping para confirmar la conexión
	  await client.db("admin").command({ ping: 1 });
	  console.log("Pinged your deployment. You successfully connected to MongoDB!");
	} catch (error) {
	  console.error("Error al conectar con MongoDB:", error.message);
	  throw error;
	} finally {
	  // Asegurarse de cerrar el cliente al finalizar/error
	  await client.close();
	}
  };