import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Calendar, Plus, Search, Filter, Loader2, AlertCircle, ArrowUpDown, Paperclip, FileImage, FileText, StickyNote } from 'lucide-react';
import NavBar from '@/components/NavBar';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

interface Appointment {
  id: string;
  date: string;
  category: string;
  title: string;
  notes: string;
  provider: string;
  location: string;
  cost: string;
  created_at: string;
}

interface FileRecord {
  id: string;
  filename: string;
  content_type: string;
  created_at: string;
}

const categories = ['GP', 'Dentist', 'Psych', 'Blood Test', 'Medication', 'Cardio', 'Other', 'Dermatology'];

type SortOption = 'date_asc' | 'date_desc' | 'created_desc';

export default function Index() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date_desc');
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appointmentFiles, setAppointmentFiles] = useState<Record<string, FileRecord[]>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const [dragOverAppointment, setDragOverAppointment] = useState<string | null>(null);
  const [notesAppointment, setNotesAppointment] = useState<Appointment | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [globalDragOver, setGlobalDragOver] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    date: '',
    category: '',
    title: '',
    notes: '',
    provider: '',
    location: '',
    cost: '',
  });

  const fetchAppointments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/appointments');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setAppointments(data);
        const filesMap: Record<string, FileRecord[]> = {};
        await Promise.all(
          data.map(async (apt: Appointment) => {
            try {
              const res = await fetch(`/api/appointments/${apt.id}/files`);
              if (res.ok) {
                filesMap[apt.id] = await res.json();
              }
            } catch {
              // ignore
            }
          })
        );
        setAppointmentFiles(filesMap);
      } else {
        setAppointments([]);
        setError('Invalid data format from server');
      }
    } catch (error) {
      setAppointments([]);
      setError(error instanceof Error ? error.message : 'Failed to load appointments');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const uploadFile = async (file: File, appointmentId: string) => {
    setUploading(appointmentId);
    try {
      let uploadFile = file;
      let uploadName = file.name;

      const form = new FormData();
      form.append('file', uploadFile);
      form.append('appointmentId', appointmentId);

      const response = await fetch('/api/files', {
        method: 'POST',
        body: form,
      });

      if (response.ok) {
        const newFile = await response.json();
        setAppointmentFiles(prev => ({
          ...prev,
          [appointmentId]: [newFile, ...(prev[appointmentId] || [])],
        }));
        toast({ title: 'File attached', description: `${uploadName} attached successfully.` });
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      toast({ title: 'Upload failed', description: 'Could not upload the file. Please try again.', variant: 'destructive' });
    } finally {
      setUploading(null);
    }
  };

  const handleCardDrop = async (e: React.DragEvent, appointmentId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverAppointment(null);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await uploadFile(e.dataTransfer.files[0], appointmentId);
    }
  };

  const handleCardDragOver = (e: React.DragEvent, appointmentId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverAppointment(appointmentId);
  };

  const handleCardDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverAppointment(null);
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>, appointmentId: string) => {
    if (e.target.files && e.target.files.length > 0) {
      await uploadFile(e.target.files[0], appointmentId);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.date || !formData.category) {
      toast({ title: 'Missing required fields', description: 'Date and category are required.', variant: 'destructive' });
      return;
    }

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newAppointment = await response.json();
        setAppointments(prev => [newAppointment, ...prev]);

        // Upload pending files to the new appointment
        if (pendingFiles.length > 0) {
          for (const file of pendingFiles) {
            await uploadFile(file, newAppointment.id);
          }
          setPendingFiles([]);
        }

        setShowForm(false);
        setFormData({ date: '', category: '', title: '', notes: '', provider: '', location: '', cost: '' });
        toast({ title: 'Appointment added', description: 'Your appointment has been recorded.' });
      } else {
        throw new Error('Failed to create appointment');
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Could not add appointment. Please try again.', variant: 'destructive' });
    }
  };

  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, string> = {
      GP: '🩺', Dentist: '🦷', Psych: '🧠', 'Blood Test': '🧪',
      Medication: '💊', Cardio: '❤️', Dermatology: '🔬', Other: '📋',
    };
    return iconMap[category] || '📋';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
    });
  };

  const truncateNotes = (notes: string, maxLines = 3) => {
    const lines = notes.split('\n');
    if (lines.length <= maxLines && notes.length <= 200) return null;
    return lines.slice(0, maxLines).join('\n') + '...';
  };

  const sortedAppointments = Array.isArray(appointments)
    ? [...appointments].sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        const createdA = new Date(a.created_at);
        const createdB = new Date(b.created_at);
        switch (sortBy) {
          case 'date_asc': return dateA.getTime() - dateB.getTime();
          case 'date_desc': return dateB.getTime() - dateA.getTime();
          case 'created_desc': return createdB.getTime() - createdA.getTime();
          default: return 0;
        }
      })
    : [];

  const filteredAppointments = sortedAppointments.filter(a => {
    const matchesSearch =
      a.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.provider?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory ? a.category === filterCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div
      className={`min-h-screen bg-gradient-to-b from-slate-50 to-white ${globalDragOver ? 'ring-4 ring-teal-500 ring-inset' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setGlobalDragOver(true); }}
      onDragLeave={(e) => { e.preventDefault(); setGlobalDragOver(false); }}
      onDrop={(e) => {
        e.preventDefault();
        setGlobalDragOver(false);
        if (e.dataTransfer.files?.length) {
          const files = Array.from(e.dataTransfer.files);
          setPendingFiles(files);
          setShowForm(true);
        }
      }}
    >
      <NavBar
        rightSlot={
          <Button onClick={() => setShowForm(true)} className="bg-teal-600 hover:bg-teal-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Appointment
          </Button>
        }
      />

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <Input placeholder="Search appointments..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-teal-500">
              <option value="">All Categories</option>
              {categories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
            </select>
          </div>
          <div className="relative">
            <ArrowUpDown className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <select value={sortBy} onChange={e => setSortBy(e.target.value as SortOption)} className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-teal-500">
              <option value="date_asc">Date (Oldest First)</option>
              <option value="date_desc">Date (Newest First)</option>
              <option value="created_desc">Recently Added</option>
            </select>
          </div>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4 flex items-center space-x-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
              <Button variant="ghost" size="sm" onClick={fetchAppointments}>Retry</Button>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
              <span className="ml-2 text-slate-600">Loading appointments...</span>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">No appointments found</h3>
              <p className="text-slate-500 mb-4">
                {searchTerm || filterCategory ? 'Try adjusting your search or filter' : 'Add your first appointment to get started'}
              </p>
              <Button onClick={() => setShowForm(true)} variant="outline">Add First Appointment</Button>
            </div>
          ) : (
            filteredAppointments.map(appointment => {
              const files = appointmentFiles[appointment.id] || [];
              const isDragOver = dragOverAppointment === appointment.id;
              const isUploading = uploading === appointment.id;
              const truncated = appointment.notes ? truncateNotes(appointment.notes) : null;

              return (
                <Card
                  key={appointment.id}
                  className={`hover:shadow-md transition-all ${isDragOver ? 'ring-2 ring-teal-500 bg-teal-50/50' : ''}`}
                  onDrop={(e) => handleCardDrop(e, appointment.id)}
                  onDragOver={(e) => handleCardDragOver(e, appointment.id)}
                  onDragLeave={handleCardDragLeave}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-2xl">{getCategoryIcon(appointment.category)}</span>
                          <Badge>{appointment.category}</Badge>
                          {files.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              <Paperclip className="w-3 h-3 mr-1" />
                              {files.length}
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          {appointment.title || appointment.category}
                        </h3>
                        <p className="text-sm text-slate-500">{formatDate(appointment.date)}</p>
                        {appointment.provider && (
                          <p className="text-sm text-slate-600 mt-1">Provider: {appointment.provider}</p>
                        )}

                        {/* Notes - truncated on card, click to expand */}
                        {appointment.notes && (
                          <div className="mt-2">
                            {truncated ? (
                              <>
                                <p className="text-sm text-slate-700 whitespace-pre-wrap line-clamp-3">{truncated}</p>
                                <button
                                  onClick={() => setNotesAppointment(appointment)}
                                  className="text-sm text-teal-600 hover:text-teal-800 hover:underline mt-1 flex items-center space-x-1"
                                >
                                  <StickyNote className="w-3 h-3" />
                                  <span>View full notes</span>
                                </button>
                              </>
                            ) : (
                              <p className="text-sm text-slate-700 whitespace-pre-wrap">{appointment.notes}</p>
                            )}
                          </div>
                        )}

                        {appointment.location && (
                          <p className="text-xs text-slate-500 mt-1">Location: {appointment.location}</p>
                        )}
                        {appointment.cost && (
                          <p className="text-xs text-slate-500">Cost: {appointment.cost}</p>
                        )}

                        {/* Image previews */}
                        {files.some(f => f.content_type?.startsWith('image/')) && (
                          <div className="flex gap-2 mt-3 flex-wrap">
                            {files.filter(f => f.content_type?.startsWith('image/')).map(file => (
                              <button key={file.id} onClick={() => setLightboxImage(`/api/files/${file.id}`)}>
                                <img
                                  src={`/api/files/${file.id}`}
                                  alt={file.filename}
                                  className="w-20 h-20 object-cover rounded-lg border border-slate-200 hover:border-teal-400 transition-colors cursor-pointer"
                                />
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Non-image file links */}
                        {files.filter(f => !f.content_type?.startsWith('image/')).length > 0 && (
                          <div className="mt-3 space-y-1">
                            {files.filter(f => !f.content_type?.startsWith('image/')).map(file => (
                              <a
                                key={file.id}
                                href={`/api/files/${file.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-2 text-sm text-teal-700 hover:text-teal-900 hover:underline"
                              >
                                <FileText className="w-4 h-4" />
                                <span>{file.filename}</span>
                              </a>
                            ))}
                          </div>
                        )}

                        {/* Drop zone / upload button */}
                        <div className="mt-3">
                          <label className={`flex items-center space-x-2 text-xs text-slate-400 hover:text-teal-600 cursor-pointer transition-colors ${isUploading ? 'pointer-events-none opacity-50' : ''}`}>
                            {isUploading ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Paperclip className="w-3 h-3" />
                            )}
                            <span>{isUploading ? 'Uploading...' : 'Attach file (drag & drop or click)'}</span>
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*,.pdf"
                              onChange={(e) => handleFileInput(e, appointment.id)}
                              disabled={isUploading}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </main>

      {/* Notes side panel */}
      <Sheet open={!!notesAppointment} onOpenChange={(open) => !open && setNotesAppointment(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="pr-8">
              {notesAppointment?.title || notesAppointment?.category || 'Notes'}
            </SheetTitle>
            <p className="text-sm text-slate-500">
              {notesAppointment && formatDate(notesAppointment.date)}
            </p>
          </SheetHeader>
          <div className="mt-6 whitespace-pre-wrap text-sm text-slate-700 leading-relaxed">
            {notesAppointment?.notes}
          </div>
          {/* Show files in side panel too */}
          {notesAppointment && appointmentFiles[notesAppointment.id]?.length > 0 && (
            <div className="mt-6 border-t pt-4">
              <h4 className="text-sm font-medium text-slate-900 mb-3">Attachments</h4>
              <div className="space-y-2">
                {appointmentFiles[notesAppointment.id].map(file => (
                  file.content_type?.startsWith('image/') ? (
                    <button key={file.id} onClick={() => setLightboxImage(`/api/files/${file.id}`)} className="block w-full">
                      <img
                        src={`/api/files/${file.id}`}
                        alt={file.filename}
                        className="max-w-full rounded-lg border border-slate-200 cursor-pointer hover:border-teal-400 transition-colors"
                      />
                    </button>
                  ) : (
                    <a
                      key={file.id}
                      href={`/api/files/${file.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-sm text-teal-700 hover:text-teal-900 hover:underline"
                    >
                      <FileText className="w-4 h-4" />
                      <span>{file.filename}</span>
                    </a>
                  )
                ))}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Add New Appointment</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="date">Date *</Label>
                  <Input id="date" type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <select id="category" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500" required>
                    <option value="">Select category</option>
                    {categories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" placeholder="e.g., Annual Checkup" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="provider">Provider</Label>
                  <Input id="provider" placeholder="Dr. Smith" value={formData.provider} onChange={e => setFormData({ ...formData, provider: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" placeholder="Fairfield Medical Centre" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="cost">Cost</Label>
                  <Input id="cost" placeholder="$149" value={formData.cost} onChange={e => setFormData({ ...formData, cost: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" placeholder="Additional details..." value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} rows={3} />
                </div>
                {pendingFiles.length > 0 && (
                  <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-teal-800 mb-2">
                      {pendingFiles.length} file{pendingFiles.length > 1 ? 's' : ''} will be attached:
                    </p>
                    <div className="space-y-1">
                      {pendingFiles.map((file, i) => (
                        <div key={i} className="flex items-center justify-between text-sm text-teal-700">
                          <span className="flex items-center space-x-2">
                            {file.type?.startsWith('image/') ? <FileImage className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                            <span>{file.name}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setPendingFiles(prev => prev.filter((_, idx) => idx !== i))}
                            className="text-teal-500 hover:text-red-500 ml-2"
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex space-x-2">
                  <Button type="submit" className="flex-1 bg-teal-600 hover:bg-teal-700">Save Appointment</Button>
                  <Button type="button" variant="outline" onClick={() => { setShowForm(false); setPendingFiles([]); }}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      <Toaster />

      {/* Image lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] cursor-pointer"
          onClick={() => setLightboxImage(null)}
        >
          <img
            src={lightboxImage}
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white text-3xl"
            onClick={() => setLightboxImage(null)}
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
}
