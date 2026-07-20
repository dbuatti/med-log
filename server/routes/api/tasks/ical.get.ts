import { defineHandler } from 'nitro';
import { sql } from '../../../utils/db';

export default defineHandler(async () => {
  const tasks = await sql`
    SELECT t.*, a.date as appointment_date, a.title as appointment_title
    FROM tasks t
    LEFT JOIN appointments a ON t.appointment_id = a.id
    WHERE t.due_date IS NOT NULL AND t.status != 'completed'
    ORDER BY t.due_date ASC
  `;

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MedLog//Actionables//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  for (const task of tasks) {
    const due = new Date(task.due_date);
    const dtstart = due.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const uid = `${task.id}@medlog`;
    const summary = task.title;
    const description = [
      task.description || '',
      task.priority ? `Priority: ${task.priority}` : '',
      task.appointment_title ? `Related: ${task.appointment_title}` : '',
    ].filter(Boolean).join('\\n');

    lines.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTART;VALUE=DATE:${dtstart}`,
      `SUMMARY:${summary.replace(/,/g, '\\,')}`,
      `DESCRIPTION:${description.replace(/,/g, '\\,')}`,
      'END:VEVENT',
    );
  }

  lines.push('END:VCALENDAR');

  const ics = lines.join('\r\n');

  return new Response(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="medlog-actionables.ics"',
    },
  });
});
