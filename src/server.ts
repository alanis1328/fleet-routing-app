import express from 'express';
import cors from 'cors';
import path from 'path';
import { pool } from './db';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Expresión regular: Valida números de teléfono (ej: +56912345678, 912345678)
const PHONE_REGEX = /^(\+?56)?(\s?)(9\d{8}|\d{8,9})$/;

// 1. Obtener todos los pasajeros activos
app.get('/api/passengers', async (_req, res) => {
  try {
    const query = `
      SELECT 
        id, 
        first_name, 
        last_name, 
        guardian_name, 
        guardian_phone, 
        address, 
        ST_X(location::geometry) AS longitude,
        ST_Y(location::geometry) AS latitude,
        active
      FROM passengers
      WHERE active = true
      ORDER BY created_at ASC;
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error al consultar la base de datos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 2. Guardar un nuevo pasajero con validaciones estrictas
app.post('/api/passengers', async (req, res) => {
  const { first_name, last_name, guardian_name, guardian_phone, address, latitude, longitude } = req.body;

  if (!first_name || !last_name || !address || latitude === undefined || longitude === undefined) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  // Validación de teléfono
  const cleanPhone = (guardian_phone || '').trim();
  if (cleanPhone && !PHONE_REGEX.test(cleanPhone)) {
    return res.status(400).json({ error: 'El teléfono debe contener solo dígitos válidos (ej: +56912345678).' });
  }

  // Validación de coordenadas geográficas válidas
  const latNum = parseFloat(latitude);
  const lngNum = parseFloat(longitude);
  if (isNaN(latNum) || isNaN(lngNum) || latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
    return res.status(400).json({ error: 'Las coordenadas ingresadas no son válidas.' });
  }

  try {
    const query = `
      INSERT INTO passengers (
        first_name, last_name, guardian_name, guardian_phone, address, location
      )
      VALUES (
        $1, $2, $3, $4, $5, ST_SetSRID(ST_MakePoint($6, $7), 4326)
      )
      RETURNING 
        id, first_name, last_name, guardian_name, guardian_phone, address,
        ST_X(location::geometry) AS longitude,
        ST_Y(location::geometry) AS latitude,
        active;
    `;
    const values = [
      first_name.trim(),
      last_name.trim(),
      (guardian_name || 'No especificado').trim(),
      cleanPhone || 'Sin teléfono',
      address.trim(),
      lngNum,
      latNum
    ];

    const { rows } = await pool.query(query, values);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error al insertar pasajero:', error);
    res.status(500).json({ error: 'Error al registrar pasajero' });
  }
});

// 3. Modificar datos de un pasajero
app.put('/api/passengers/:id', async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, guardian_name, guardian_phone, address, latitude, longitude } = req.body;

  const cleanPhone = (guardian_phone || '').trim();
  if (cleanPhone && !PHONE_REGEX.test(cleanPhone)) {
    return res.status(400).json({ error: 'El teléfono debe contener solo números válidos.' });
  }

  const latNum = parseFloat(latitude);
  const lngNum = parseFloat(longitude);
  if (isNaN(latNum) || isNaN(lngNum) || latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
    return res.status(400).json({ error: 'Las coordenadas ingresadas no son válidas.' });
  }

  try {
    const query = `
      UPDATE passengers
      SET 
        first_name = $1,
        last_name = $2,
        guardian_name = $3,
        guardian_phone = $4,
        address = $5,
        location = ST_SetSRID(ST_MakePoint($6, $7), 4326)
      WHERE id = $8
      RETURNING 
        id, first_name, last_name, guardian_name, guardian_phone, address,
        ST_X(location::geometry) AS longitude,
        ST_Y(location::geometry) AS latitude,
        active;
    `;
    const values = [first_name.trim(), last_name.trim(), guardian_name.trim(), cleanPhone, address.trim(), lngNum, latNum, id];
    const { rows } = await pool.query(query, values);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Pasajero no encontrado' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error al actualizar pasajero:', error);
    res.status(500).json({ error: 'Error al actualizar pasajero' });
  }
});

// 4. Eliminar pasajero
app.delete('/api/passengers/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM passengers WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Pasajero no encontrado' });
    }
    res.json({ message: 'Pasajero eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar pasajero:', error);
    res.status(500).json({ error: 'Error al eliminar pasajero' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});