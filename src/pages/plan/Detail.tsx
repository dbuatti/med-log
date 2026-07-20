import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import NavBar from '@/components/NavBar';
import { ArrowLeft, CheckCircle2, Circle, Target, Lightbulb, HelpCircle } from 'lucide-react';

interface PlanItem {
  id: number;
  month_number: number;
  title: string;
  focus_area: string;
  sub_area: string;
  description: string;
  tips: string[];
  review_questions: string[];
  status: string;
  review_answers: Record<string, string> | null;
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

export default function PlanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<PlanItem | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showReview, setShowReview] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/plan')
      .then(r => r.ok ? r.json() : [])
      .then((data: PlanItem[]) => {
        const found = data.find(p => p.id === Number(id));
        if (found) {
          setItem(found);
          if (found.review_answers) setAnswers(found.review_answers);
        }
      })
      .catch(() => {});
  }, [id]);

  if (!item) return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <NavBar />
      <div className="max-w-4xl mx-auto px-4 py-12 text-center text-slate-500">Loading...</div>
    </div>
  );

  const isCurrent = item.status === 'current';
  const isCompleted = item.status === 'completed';
  const allAnswered = item.review_questions.every((_, i) => answers[`q${i}`]?.trim());

  const handleComplete = async () => {
    if (!allAnswered) return;
    setSubmitting(true);
    try {
      await fetch('/api/plan', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          status: 'completed',
          review_answers: answers,
        }),
      });
      navigate('/plan');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <NavBar />

      <main className="max-w-4xl mx-auto px-4 py-6">
        <button onClick={() => navigate('/plan')} className="flex items-center gap-1 text-sm text-slate-500 hover:text-teal-600 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to plan
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Badge className={`text-[10px] ${AREA_COLORS[item.focus_area] || 'bg-slate-100 text-slate-700'}`}>
              {item.focus_area}
            </Badge>
            <Badge variant="outline" className="text-[10px]">{item.sub_area}</Badge>
            <Badge className={`text-[10px] ${
              isCompleted ? 'bg-green-100 text-green-700' :
              isCurrent ? 'bg-teal-100 text-teal-700' :
              'bg-slate-100 text-slate-500'
            }`}>
              Month {item.month_number}/12
            </Badge>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{item.title}</h1>
          <p className="text-slate-600 mt-2">{item.description}</p>
        </div>

        {/* Tips */}
        {item.tips && item.tips.length > 0 && (
          <Card className="mb-6 border-amber-200 bg-amber-50/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-5 h-5 text-amber-600" />
                <h2 className="font-bold text-slate-900">Tips</h2>
              </div>
              <ul className="space-y-2">
                {item.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="text-amber-500 mt-0.5">→</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Status actions */}
        {isCurrent && !showReview && !isCompleted && (
          <Card className="mb-6 border-teal-200 bg-teal-50/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">Ready to graduate to the next month?</h3>
                  <p className="text-sm text-slate-500">Answer the review questions below to complete this focus.</p>
                </div>
                <Button onClick={() => setShowReview(true)} className="bg-teal-600 hover:bg-teal-700">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Start Review
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Review questions */}
        {(showReview || isCompleted) && (
          <Card className="mb-6 border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <HelpCircle className="w-5 h-5 text-slate-600" />
                <h2 className="font-bold text-slate-900">
                  {isCompleted ? 'Review Answers' : 'Review Questions'}
                </h2>
                {isCompleted && <Badge className="bg-green-100 text-green-700 text-[10px]">Completed</Badge>}
              </div>
              <div className="space-y-4">
                {item.review_questions.map((q, i) => (
                  <div key={i}>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{q}</label>
                    <Textarea
                      value={answers[`q${i}`] || ''}
                      onChange={e => setAnswers(prev => ({ ...prev, [`q${i}`]: e.target.value }))}
                      placeholder={isCompleted ? '' : 'Be honest — this is for you, not a report card...'}
                      disabled={isCompleted}
                      className="min-h-[80px]"
                    />
                  </div>
                ))}
              </div>
              {!isCompleted && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xs text-slate-400">
                    {allAnswered ? 'All questions answered — ready to graduate!' : `${item.review_questions.filter((_, i) => answers[`q${i}`]?.trim()).length}/${item.review_questions.length} answered`}
                  </p>
                  <Button
                    onClick={handleComplete}
                    disabled={!allAnswered || submitting}
                    className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    {submitting ? 'Saving...' : 'Complete & Move Forward'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          {item.month_number > 1 ? (
            <Button variant="outline" onClick={() => navigate(`/plan/${item.id - 1}`)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Month {item.month_number - 1}
            </Button>
          ) : <div />}
          {item.month_number < 12 ? (
            <Button variant="outline" onClick={() => navigate(`/plan/${item.id + 1}`)}>
              Month {item.month_number + 1}
              <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
            </Button>
          ) : <div />}
        </div>
      </main>
    </div>
  );
}
