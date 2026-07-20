import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, ChevronRight } from 'lucide-react';

interface PlanItem {
  id: number;
  month_number: number;
  title: string;
  focus_area: string;
  sub_area: string;
  description: string;
  status: string;
}

export default function CurrentFocus() {
  const [plan, setPlan] = useState<PlanItem[]>([]);

  useEffect(() => {
    fetch('/api/plan').then(r => r.ok ? r.json() : []).then(setPlan).catch(() => {});
  }, []);

  const current = plan.find(p => p.status === 'current');
  if (!current) return null;

  const completed = plan.filter(p => p.status === 'completed').length;
  const total = plan.length;

  return (
    <Link to={`/plan/${current.id}`} className="block group">
      <Card className="border-teal-200 bg-gradient-to-br from-teal-50 to-white hover:shadow-md transition-all">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-teal-600" />
                <span className="text-xs font-semibold text-teal-700 uppercase tracking-wider">Current Focus</span>
                <Badge className="bg-teal-100 text-teal-700 text-[10px]">Month {current.month_number}/12</Badge>
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors">{current.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-[10px]">{current.focus_area}</Badge>
                <Badge variant="outline" className="text-[10px]">{current.sub_area}</Badge>
              </div>
              <p className="text-sm text-slate-600 mt-2 line-clamp-2">{current.description}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-teal-500 transition-colors mt-1" />
          </div>
          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
              <span>{completed} of {total} completed</span>
              <span>{Math.round((completed / total) * 100)}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: `${(completed / total) * 100}%` }} />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
