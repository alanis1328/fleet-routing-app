import express from 'express';
import cors from 'cors';
import path from 'path';
import { passengerRouter } from './routes/passengers';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Servir la carpeta server como directorio estático web
app.use(express.static(path.join(__dirname, '../server')));

// Endpoints REST
app.use('/api/passengers', passengerRouter);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});