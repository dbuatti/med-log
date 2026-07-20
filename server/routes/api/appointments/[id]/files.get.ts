import { defineHandler } from 'nitro';
import { sql } from '../../../../utils/db';
import { getRouterParam, createError } from 'nitro/h3';

export default defineHandler(async (event) => {
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Appointment ID is required' });
  }

  try {
    const files = await sql`
      SELECT id, filename, content_type, created_at
      FROM files
      WHERE appointment_id = ${id}
      ORDER BY created_at DESC
    `;

    return files || [];
  } catch (error: any) {
    console.error('Error fetching files:', error.message);
    return [];
  }
});
