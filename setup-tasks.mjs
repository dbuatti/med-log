import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL);

await sql`
  CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    due_date DATE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )
`;
console.log('Tasks table created');

// Seed action items from the GP appointment
const gp = await sql`SELECT id FROM appointments WHERE date >= '2026-07-19' AND date <= '2026-07-21' AND category = 'GP' ORDER BY created_at DESC LIMIT 1`;
const aptId = gp[0]?.id;

const tasks = [
  { title: 'Follow-up blood test — platelets & neutrophils', due: '2026-08-20', priority: 'high', desc: 'Recheck platelets and neutrophils to monitor persistent neutropenia/thrombocytopenia' },
  { title: 'Collect family health history from parents', due: '2026-08-20', priority: 'medium', desc: 'Ask parents about: heart disease, high cholesterol, blood pressure, diabetes, cancer' },
  { title: 'Start gym — first visit', due: '2026-08-10', priority: 'medium', desc: 'Gym already joined but not yet visited. Just get in and do something.' },
  { title: 'Review Heart Foundation cholesterol-lowering diet', due: '2026-08-01', priority: 'medium', desc: 'Total cholesterol 6.4, LDL 4.3 — dietary changes needed. Check betterhealth.vic.gov.au and heartfoundation.org.au' },
  { title: 'Book Mental Health Plan appointment', due: '2026-08-10', priority: 'low', desc: 'Separate GP appointment for mental health care plan' },
  { title: 'Follow up on sleep apnoea', due: '2026-09-01', priority: 'low', desc: 'Mild apnoea diagnosed 2023, CPAP abandoned. Consider re-evaluation given fatigue and mitral valve link.' },
  { title: 'Get Lexapro script dispensed', due: null, priority: 'high', desc: 'Escitalopram 10mg, 1 daily, 28 tablets, 5 repeats. Script ID: 287895' },
];

for (const t of tasks) {
  await sql`
    INSERT INTO tasks (title, description, due_date, priority, appointment_id)
    VALUES (${t.title}, ${t.desc}, ${t.due}, ${t.priority}, ${aptId})
  `;
}
console.log(`Seeded ${tasks.length} tasks`);
