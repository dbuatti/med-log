import { Moon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const FINDINGS = [
  { label: 'Supine-dependent', detail: 'AHI worse on back (15.2/hr supine vs 5.1/hr side). Positional therapy may help.', primary: true },
  { label: 'Elevated RERA burden', detail: '8.0/hr respiratory effort-related arousals drive RDI to moderate range.' },
  { label: 'Bradycardia during sleep', detail: 'Min HR 35.4 bpm. Likely vagal tone in deep sleep; mention to cardiologist.' },
  { label: 'CPAP previously abandoned', detail: 'Reassess if daytime fatigue worsens. Weight gain since study may worsen AHI.' },
];

const METRICS = [
  { value: '9.6', label: 'AHI /hr', severity: 'Mild' },
  { value: '18.8', label: 'RDI /hr', severity: 'Moderate' },
  { value: '91%', label: 'Lowest SpO2', severity: 'Borderline' },
  { value: '6.6', label: 'PLM /hr', severity: 'Elevated' },
];

export default function SleepSection() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Moon className="w-5 h-5 text-indigo-600" />
        <h2 className="text-lg font-bold text-slate-900">Sleep Health</h2>
      </div>
      <Card className="border-slate-200 overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Polysomnography</h3>
              <p className="text-xs text-slate-500 mt-0.5">Sleep Doctors · 14 Jun 2023</p>
            </div>
            <Badge className="bg-indigo-100 text-indigo-700">Sleep Study</Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {METRICS.map((m) => (
              <div key={m.label} className="text-center p-2 rounded-lg bg-slate-50">
                <div className="text-xl font-bold text-slate-900">{m.value}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wide">{m.label}</div>
                <div className="text-[10px] font-medium text-amber-600 mt-0.5">{m.severity}</div>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-sm">
            {FINDINGS.map((f) => (
              <div key={f.label} className={`flex items-start gap-2 p-2 rounded-lg border ${
                f.primary ? 'bg-indigo-50/60 border-indigo-100' : 'bg-slate-50 border-slate-100'
              }`}>
                <span className={f.primary ? 'text-indigo-500 mt-0.5' : 'text-slate-400 mt-0.5'}>→</span>
                <div>
                  <span className="font-medium text-slate-800">{f.label}</span>
                  <span className="text-slate-600"> — {f.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
