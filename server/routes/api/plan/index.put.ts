import { defineHandler } from 'nitro';
import { sql } from '../../../utils/db';

export default defineHandler(async (event) => {
  const body = await readBody(event);
  const { id, status, review_answers } = body;

  if (!id) throw createError({ statusCode: 400, message: 'id is required' });

  if (status === 'current') {
    await sql`UPDATE health_plan SET status = 'upcoming' WHERE status = 'current'`;
    await sql`UPDATE health_plan SET status = 'current', started_at = NOW() WHERE id = ${id}`;
  } else if (status === 'completed') {
    if (!review_answers || Object.keys(review_answers).length === 0) {
      throw createError({ statusCode: 400, message: 'review_answers required to complete' });
    }
    await sql`UPDATE health_plan SET status = 'completed', completed_at = NOW(), review_answers = ${JSON.stringify(review_answers)}::jsonb WHERE id = ${id}`;

    const rows = await sql`SELECT month_number FROM health_plan WHERE id = ${id}`;
    if (rows.length > 0) {
      const nextMonth = rows[0].month_number + 1;
      await sql`UPDATE health_plan SET status = 'current', started_at = NOW() WHERE month_number = ${nextMonth}`;
    }
  }

  const rows = await sql`SELECT * FROM health_plan ORDER BY month_number ASC`;
  return rows;
});
