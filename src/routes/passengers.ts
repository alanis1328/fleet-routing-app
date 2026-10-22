import { Router, Request, Response } from 'express';
import { pool } from '../config/db';

export const passengerRouter = Router();

const PHONE_REGEX = /^(\+?56)?(\s?)(9\d{8}|\d{8,9})$/;

// GET /api/passengers
passengerRouter.get('/', async (_req: Request, res: Response) => {
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
    console.error('Error al consultar pasajeros:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/passengers
passengerRouter.post('/', async (req: Request, res: Response) => {
  const { first_name, last_name, guardian_name, guardian_phone, address, latitude, longitude } = req.body;

  if (!first_name || !last_name || !address || latitude === undefined || longitude === undefined) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const cleanPhone = (guardian_phone || '').trim();
  if (cleanPhone && !PHONE_REGEX.test(cleanPhone)) {
    return res.status(400).json({ error: 'Número de teléfono no válido' });
  }

  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return res.status(400).json({ error: 'Coordenadas no válidas' });
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
      lng,
      lat
    ];

    const { rows } = await pool.query(query, values);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error al insertar pasajero:', error);
    res.status(500).json({ error: 'Error al registrar pasajero' });
  }
});

// PUT /api/passengers/:id
passengerRouter.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { first_name, last_name, guardian_name, guardian_phone, address, latitude, longitude } = req.body;

  const cleanPhone = (guardian_phone || '').trim();
  if (cleanPhone && !PHONE_REGEX.test(cleanPhone)) {
    return res.status(400).json({ error: 'Número de teléfono no válido' });
  }

  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return res.status(400).json({ error: 'Coordenadas no válidas' });
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
    const values = [
      first_name.trim(),
      last_name.trim(),
      guardian_name.trim(),
      cleanPhone,
      address.trim(),
      lng,
      lat,
      id
    ];
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

// DELETE /api/passengers/:id
passengerRouter.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM passengers WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Pasajero no encontrado' });
    }
    res.json({ message: 'Pasajero eliminado' });
  } catch (error) {
    console.error('Error al eliminar pasajero:', error);
    res.status(500).json({ error: 'Error al eliminar pasajero' });
  }
});