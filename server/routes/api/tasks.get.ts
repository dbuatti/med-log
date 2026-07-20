import { defineHandler } from 'nitro';
import { sql } from '../../utils/db';

export default defineHandler(async () => {
  const tasks = await sql`
    SELECT t.*, a.date as appointment_date, a.title as appointment_title
    FROM tasks t
    LEFT JOIN appointments a ON t.appointment_id = a.id
    ORDER BY
      CASE t.status WHEN 'pending' THEN 0 WHEN 'completed' THEN 1 ELSE 2 END,
      t.due_date ASC NULLS LAST,
      CASE t.priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END
  `;
  return tasks;
});
