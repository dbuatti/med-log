import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL);

console.log('Creating appointments table...');
await sql`
  CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    category TEXT NOT NULL,
    title TEXT,
    notes TEXT,
    provider TEXT,
    location TEXT,
    cost DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )
`;
console.log('Appointments table ready');

console.log('Creating files table...');
await sql`
  CREATE TABLE IF NOT EXISTS files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename TEXT NOT NULL,
    content_type TEXT NOT NULL,
    file_data BYTEA,
    appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )
`;
console.log('Files table ready');

console.log('Creating tasks table...');
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
console.log('Tasks table ready');

console.log('Creating health_plan table...');
await sql`
  CREATE TABLE IF NOT EXISTS health_plan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_number INT NOT NULL,
    title TEXT NOT NULL,
    focus_area TEXT NOT NULL,
    sub_area TEXT NOT NULL,
    description TEXT NOT NULL,
    tips TEXT[] DEFAULT '{}',
    review_questions TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'current', 'completed')),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    review_answers JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )
`;
console.log('Health_plan table ready');

console.log('Database setup complete!');
