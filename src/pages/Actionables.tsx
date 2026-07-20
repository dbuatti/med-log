import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, Circle, CalendarClock, Clock, AlertTriangle, Plus, Trash2, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import NavBar from '@/components/NavBar';

interface Task {
  id: string;
  title: string;
  description: string;
  due_date: string | null;
  status: string;
  priority: string;
  appointment_id: string | null;
  appointment_date: string | null;
  appointment_title: string | null;
  created_at: string;
}

export default function Actionables() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'medium',
  });

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/tasks');
      if (res.ok) setTasks(await res.json());
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    try {
      const url = editingTask ? `/api/tasks/${editingTask.id}` : '/api/tasks';
      const method = editingTask ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await fetchTasks();
        setShowForm(false);
        setEditingTask(null);
        setFormData({ title: '', description: '', due_date: '', priority: 'medium' });
        toast({ title: editingTask ? 'Task updated' : 'Task created' });
      }
    } catch {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  const toggleStatus = async (task: Task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    await fetch(`/api/tasks/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchTasks();
  };

  const deleteTask = async (id: string) => {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    fetchTasks();
  };

  const startEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      due_date: task.due_date || '',
      priority: task.priority,
    });
    setShowForm(true);
  };

  const openForm = () => {
    setEditingTask(null);
    setFormData({ title: '', description: '', due_date: '', priority: 'medium' });
    setShowForm(true);
  };

  const getDaysUntil = (dateStr: string) => {
    const due = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const pending = tasks.filter(t => t.status === 'pending');
  const completed = tasks.filter(t => t.status === 'completed');

  const timeSensitive = pending.filter(t => t.due_date);
  const noDate = pending.filter(t => !t.due_date);

  const overdue = timeSensitive.filter(t => getDaysUntil(t.due_date!) < 0);
  const dueSoon = timeSensitive.filter(t => { const d = getDaysUntil(t.due_date!); return d >= 0 && d <= 7; });
  const upcoming = timeSensitive.filter(t => getDaysUntil(t.due_date!) > 7);

  const getPriorityBadge = (priority: string) => {
    if (priority === 'high') return <Badge className="bg-red-100 text-red-700 border-red-200">High</Badge>;
    if (priority === 'medium') return <Badge className="bg-amber-100 text-amber-700 border-amber-200">Medium</Badge>;
    return <Badge className="bg-slate-100 text-slate-600 border-slate-200">Low</Badge>;
  };

  const renderTask = (task: Task, showDate = true) => {
    const days = task.due_date ? getDaysUntil(task.due_date) : null;
    const isOverdue = days !== null && days < 0 && task.status === 'pending';
    const isDueSoon = days !== null && days >= 0 && days <= 3 && task.status === 'pending';

    return (
      <div
        key={task.id}
        className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
          task.status === 'completed'
            ? 'bg-slate-50 border-slate-200 opacity-60'
            : isOverdue
            ? 'bg-red-50 border-red-300'
            : isDueSoon
            ? 'bg-amber-50 border-amber-300'
            : 'bg-white border-slate-200 hover:border-teal-300'
        }`}
      >
        <button onClick={() => toggleStatus(task)} className="mt-0.5 shrink-0">
          {task.status === 'completed' ? (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          ) : (
            <Circle className="w-5 h-5 text-slate-300 hover:text-teal-500" />
          )}
        </button>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${task.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-900'}`}>
            {task.title}
          </p>
          {task.description && (
            <p className="text-xs text-slate-500 mt-1">{task.description}</p>
          )}
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {task.due_date && showDate && (
              <span className={`text-xs font-medium flex items-center gap-1 ${
                isOverdue ? 'text-red-600' : isDueSoon ? 'text-amber-600' : 'text-slate-500'
              }`}>
                {isOverdue ? <AlertTriangle className="w-3 h-3" /> : <CalendarClock className="w-3 h-3" />}
                {isOverdue ? `${Math.abs(days)}d overdue` : days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days}d`}
                <span className="text-slate-400">·</span>
                {formatDate(task.due_date!)}
              </span>
            )}
            {getPriorityBadge(task.priority)}
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          <button onClick={() => startEdit(task)} className="text-slate-400 hover:text-teal-600 p-1">
            <span className="text-xs">Edit</span>
          </button>
          <button onClick={() => deleteTask(task.id)} className="text-slate-400 hover:text-red-500 p-1">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <NavBar
        rightSlot={
          <>
            {timeSensitive.length > 0 && (
              <a href="/api/tasks/ical" className="inline-flex items-center px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white hover:bg-slate-50 text-slate-700">
                <Download className="w-4 h-4 mr-2" /> Export .ics
              </a>
            )}
            <Button onClick={openForm} className="bg-teal-600 hover:bg-teal-700">
              <Plus className="w-4 h-4 mr-2" /> Add Task
            </Button>
          </>
        }
      />

      <main className="max-w-4xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="text-center py-12 text-slate-500">Loading tasks...</div>
        ) : (
          <div className="space-y-8">
            {/* OVERDUE — big red alert */}
            {overdue.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <h2 className="text-lg font-bold text-red-700">Overdue</h2>
                  <Badge className="bg-red-100 text-red-700">{overdue.length}</Badge>
                </div>
                <div className="space-y-2">
                  {overdue.map(t => renderTask(t))}
                </div>
              </div>
            )}

            {/* DUE SOON — amber alert */}
            {dueSoon.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-5 h-5 text-amber-500" />
                  <h2 className="text-lg font-bold text-amber-700">Due Soon</h2>
                  <Badge className="bg-amber-100 text-amber-700">{dueSoon.length}</Badge>
                </div>
                <div className="space-y-2">
                  {dueSoon.map(t => renderTask(t))}
                </div>
              </div>
            )}

            {/* UPCOMING — with dates */}
            {upcoming.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CalendarClock className="w-5 h-5 text-blue-500" />
                  <h2 className="text-lg font-bold text-slate-700">Upcoming</h2>
                </div>
                <div className="space-y-2">
                  {upcoming.map(t => renderTask(t))}
                </div>
              </div>
            )}

            {/* NO DATE — general tasks */}
            {noDate.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-lg font-bold text-slate-700">To Do</h2>
                  <Badge variant="outline">{noDate.length}</Badge>
                </div>
                <div className="space-y-2">
                  {noDate.map(t => renderTask(t, false))}
                </div>
              </div>
            )}

            {/* COMPLETED */}
            {completed.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <h2 className="text-lg font-medium text-slate-500">Completed</h2>
                </div>
                <div className="space-y-2">
                  {completed.map(t => renderTask(t))}
                </div>
              </div>
            )}

            {tasks.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-500 mb-4">No tasks yet</p>
                <Button onClick={openForm} variant="outline">Add First Task</Button>
              </div>
            )}
          </div>
        )}
      </main>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">{editingTask ? 'Edit Task' : 'New Task'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Title *</Label>
                  <Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={2} />
                </div>
                <div>
                  <Label>Due date</Label>
                  <Input type="date" value={formData.due_date} onChange={e => setFormData({ ...formData, due_date: e.target.value })} />
                </div>
                <div>
                  <Label>Priority</Label>
                  <select value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" className="flex-1 bg-teal-600 hover:bg-teal-700">{editingTask ? 'Save' : 'Add Task'}</Button>
                  <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingTask(null); }}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      <Toaster />
    </div>
  );
}
