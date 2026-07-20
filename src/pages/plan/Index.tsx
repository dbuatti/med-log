import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import NavBar from '@/components/NavBar';
import { CheckCircle2, Circle, ArrowRight, Target } from 'lucide-react';

interface PlanItem {
  id: number;
  month_number: number;
  title: string;
  focus_area: string;
  sub_area: string;
  description: string;
  status: string;
}

const AREA_COLORS: Record<string, string> = {
  Awareness: 'bg-slate-100 text-slate-700',
  Nutrition: 'bg-green-100 text-green-700',
  Exercise: 'bg-blue-100 text-blue-700',
  Sleep: 'bg-indigo-100 text-indigo-700',
  'Mental Health': 'bg-purple-100 text-purple-700',
  Social: 'bg-pink-100 text-pink-700',
  Integration: 'bg-amber-100 text-amber-700',
  Medical: 'bg-red-100 text-red-700',
  Maintenance: 'bg-teal-100 text-teal-700',
};

export default function PlanPage() {
  const [plan, setPlan] = useState<PlanItem[]>([]);

  useEffect(() => {
    fetch('/api/plan').then(r => r.ok ? r.json() : []).then(setPlan).catch(() => {});
  }, []);

  const completed = plan.filter(p => p.status === 'completed').length;
  const current = plan.find(p => p.status === 'current');

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <NavBar />

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">12-Month Health Plan</h1>
          <p className="text-sm text-slate-500 mt-1">One focus at a time. No rushing. No skipping.</p>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>{completed} of 12 completed</span>
              <span>{Math.round((completed / 12) * 100)}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: `${(completed / 12) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200" />

          <div className="space-y-4">
            {plan.map((item) => {
              const isCompleted = item.status === 'completed';
              const isCurrent = item.status === 'current';
              const isLocked = item.status === 'upcoming' && !isCurrent;

              return (
                <Link
                  key={item.id}
                  to={`/plan/${item.id}`}
                  className="block relative"
                >
                  {/* Timeline dot */}
                  <div className="absolute left-6 -translate-x-1/2 z-10">
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 bg-white rounded-full" />
                    ) : isCurrent ? (
                      <Target className="w-5 h-5 text-teal-600 bg-white rounded-full" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300 bg-white rounded-full" />
                    )}
                  </div>

                  <Card className={`ml-12 transition-all ${
                    isCurrent ? 'border-teal-300 shadow-sm hover:shadow-md' :
                    isCompleted ? 'border-green-200 opacity-75 hover:opacity-100' :
                    'border-slate-100 opacity-50 hover:opacity-75'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={`text-[10px] ${AREA_COLORS[item.focus_area] || 'bg-slate-100 text-slate-700'}`}>
                              {item.focus_area}
                            </Badge>
                            <span className="text-[10px] text-slate-400">Month {item.month_number}</span>
                          </div>
                          <h3 className={`font-bold ${isCurrent ? 'text-teal-700' : 'text-slate-900'}`}>
                            {item.title}
                          </h3>
                          <p className="text-sm text-slate-500 mt-1 line-clamp-2">{item.description}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 mt-1 flex-shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
