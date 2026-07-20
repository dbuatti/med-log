import { Card, CardContent } from '@/components/ui/card';

interface Appointment {
  category: string;
  date: string;
}

export default function AppointmentSummary({ appointments }: { appointments: Appointment[] }) {
  const categoryCount = appointments.reduce((acc, a) => {
    acc[a.category] = (acc[a.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const earliest = appointments.length > 0
    ? new Date(appointments[appointments.length - 1].date).toLocaleDateString('en-AU', { month: 'short', year: 'numeric' })
    : '—';

  return (
    <div>
      <h2 className="text-lg font-bold text-slate-900 mb-3">Appointment Summary</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(categoryCount).sort(([, a], [, b]) => b - a).map(([cat, count]) => (
          <Card key={cat}>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-slate-900">{count}</p>
              <p className="text-xs text-slate-500">{cat}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="text-xs text-slate-400 mt-2">
        {appointments.length} total appointments · Earliest: {earliest}
      </p>
    </div>
  );
}
