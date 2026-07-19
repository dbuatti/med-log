import { defineHandler } from 'nitro';
import { sql } from '../../utils/db';
import { readBody, createError } from 'nitro/h3';

export default defineHandler(async (event) => {
  const body = await readBody(event);
  const { date, category, title, notes, provider, location, cost } = body;

  if (!date || !category) {
    throw createError({ statusCode: 400, statusMessage: 'Date and category are required' });
  }

  const [appointment] = await sql`
    INSERT INTO appointments (date, category, title, notes, provider, location, cost)
    VALUES (${date}, ${category}, ${title}, ${notes}, ${provider}, ${location}, ${cost})
    RETURNING *
  `;

  return appointment;
});