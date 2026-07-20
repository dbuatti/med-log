import { defineHandler } from 'nitro';
import { sql } from '../../../utils/db';
import { readBody, createError, getRouterParam } from 'nitro/h3';

export default defineHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  const body = await readBody(event);
  const { title, description, due_date, status, priority } = body;

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Task ID is required' });
  }

  const [task] = await sql`
    UPDATE tasks
    SET
      title = COALESCE(${title}, title),
      description = COALESCE(${description}, description),
      due_date = ${due_date !== undefined ? due_date : null},
      status = COALESCE(${status}, status),
      priority = COALESCE(${priority}, priority),
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;

  if (!task) {
    throw createError({ statusCode: 404, statusMessage: 'Task not found' });
  }

  return task;
});
