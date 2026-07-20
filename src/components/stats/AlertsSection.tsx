import { AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Alert {
  text: string;
  severity: 'high' | 'medium';
}

export default function AlertsSection({ alerts }: { alerts: Alert[] }) {
  if (alerts.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-5 h-5 text-amber-500" />
        <h2 className="text-lg font-bold text-slate-900">Flagged Items</h2>
        <Badge className="bg-amber-100 text-amber-700">{alerts.length}</Badge>
      </div>
      <div className="space-y-2">
        {alerts.map((a, i) => (
          <div key={i} className={`p-3 rounded-lg border text-sm ${
            a.severity === 'high' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}>
            {a.text}
          </div>
        ))}
      </div>
    </div>
  );
}
