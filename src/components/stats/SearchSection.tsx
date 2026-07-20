import { Search, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';

interface SearchResult {
  id: string;
  date: string;
  title: string;
  snippet: string;
}

interface Props {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  results: SearchResult[];
}

export default function SearchSection({ searchTerm, onSearchChange, results }: Props) {
  return (
    <>
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search notes, lab values, medications..."
          value={searchTerm}
          onChange={e => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      {results.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-3">Search Results ({results.length})</h2>
          <div className="space-y-2">
            {results.map(r => (
              <Link key={r.id} to="/" className="block">
                <Card className="hover:border-teal-300 transition-colors">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span className="text-xs text-slate-500">{new Date(r.date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs font-medium text-slate-700">{r.title}</span>
                    </div>
                    <p className="text-sm text-slate-600" dangerouslySetInnerHTML={{ __html: r.snippet }} />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
