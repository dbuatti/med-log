import { defineHandler } from 'nitro';
import { sql } from '../../../utils/db';
import { getRouterParam, createError } from 'nitro/h3';

export default defineHandler(async (event) => {
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Task ID is required' });
  }

  await sql`DELETE FROM tasks WHERE id = ${id}`;

  return { success: true };
});
