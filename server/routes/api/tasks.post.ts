import { defineHandler } from 'nitro';
import { sql } from '../../utils/db';
import { readBody, createError } from 'nitro/h3';

export default defineHandler(async (event) => {
  const body = await readBody(event);
  const { title, description, due_date, priority, appointment_id } = body;

  if (!title) {
    throw createError({ statusCode: 400, statusMessage: 'Title is required' });
  }

  const [task] = await sql`
    INSERT INTO tasks (title, description, due_date, priority, appointment_id)
    VALUES (${title}, ${description || null}, ${due_date || null}, ${priority || 'medium'}, ${appointment_id || null})
    RETURNING *
  `;

  return task;
});
