import { defineHandler } from 'nitro';
import { sql } from '../../../utils/db';
import { readBody, createError, getRouterParam } from 'nitro/h3';

export default defineHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  const body = await readBody(event);
  const { title, notes, provider, location, cost, category, date } = body;

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Appointment ID is required' });
  }

  const [appointment] = await sql`
    UPDATE appointments
    SET
      title = COALESCE(${title}, title),
      notes = COALESCE(${notes}, notes),
      provider = COALESCE(${provider}, provider),
      location = COALESCE(${location}, location),
      cost = COALESCE(${cost}, cost),
      category = COALESCE(${category}, category),
      date = COALESCE(${date}, date),
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;

  if (!appointment) {
    throw createError({ statusCode: 404, statusMessage: 'Appointment not found' });
  }

  return appointment;
});
