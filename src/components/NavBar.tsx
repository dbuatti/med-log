import { Link, useLocation } from 'react-router-dom';
import { Calendar, CheckSquare, Activity, Target } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', label: 'Appointments', icon: Calendar },
  { to: '/actionables', label: 'Actionables', icon: CheckSquare },
  { to: '/stats', label: 'Insights', icon: Activity },
  { to: '/plan', label: 'Plan', icon: Target },
];

export default function NavBar({ rightSlot }: { rightSlot?: React.ReactNode }) {
  const location = useLocation();

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
              const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-teal-50 text-teal-700'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              );
            })}
          </nav>
          {rightSlot && <div className="flex items-center gap-2">{rightSlot}</div>}
        </div>
      </div>
    </header>
  );
}
