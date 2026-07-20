import { defineHandler } from 'nitro';
import { sql } from '../../../utils/db';

export default defineHandler(async () => {
  const rows = await sql`SELECT * FROM health_plan ORDER BY month_number ASC`;
  return rows;
});
