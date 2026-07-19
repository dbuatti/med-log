import { defineHandler } from 'nitro';
import { sql } from '../../utils/db';

export default defineHandler(async () => {
  const appointments = await sql`
    SELECT * FROM appointments 
    ORDER BY date DESC, created_at DESC
  `;
  return appointments;
});