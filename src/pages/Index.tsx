import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Plus, Upload, Search, Filter, Loader2, AlertCircle } from 'lucide-react';
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

const categories = ['GP', 'Dentist', 'Psych', 'Blood Test', 'Medication', 'Cardio', 'Other', 'Dermatology'];

export default function Index() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  // Fetch appointments
  const fetchAppointments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/appointments');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Fetched appointments:', data);
      if (Array.isArray(data)) {
        setAppointments(data);
      } else {
        console.error('API returned non-array data:', data);
        setAppointments([]);
        setError('Invalid data format from server');
      }
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      setAppointments([]);
      setError(error instanceof Error ? error.message : 'Failed to load appointments');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Handle file drop
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      await uploadFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const uploadFile = async (file: File) => {
    try {
      const form = new FormData();
      form.append('file', file);

      const response = await fetch('/api/files', {
        method: 'POST',
        body: form,
      });

      if (response.ok) {
        toast({
          title: 'File uploaded',
          description: `${file.name} has been uploaded successfully.`,
        });
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'Could not upload the file. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await uploadFile(e.target.files[0]);
    }
  };

  // Create appointment
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.date || !formData.category) {
      toast({
        title: 'Missing required fields',
        description: 'Date and category are required.',
        variant: 'destructive',
      });
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
        setShowForm(false);
        setFormData({
          date: '',
          category: '',
          title: '',
          notes: '',
          provider: '',
          location: '',
          cost: '',
        });
        toast({
          title: 'Appointment added',
          description: 'Your appointment has been recorded.',
        });
      } else {
        throw new Error('Failed to create appointment');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not add appointment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Filter appointments
  const filteredAppointments = Array.isArray(appointments) ? appointments.filter(a => {
    const matchesSearch = 
      a.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.provider?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory ? a.category === filterCategory : true;
    return matchesSearch && matchesCategory;
  }) : [];

  // Get category icon
  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, string> = {
      GP: '🩺',
      Dentist: '🦷',
      Psych: '🧠',
      'Blood Test': '🧪',
      Medication: '💊',
      Cardio: '❤️',
      Dermatology: '🔬',
      Other: '📋',
    };
    return iconMap[category] || '📋';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">MedLog</h1>
            </div>
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-teal-600 hover:bg-teal-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Appointment
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-teal-500"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* File Drop Zone */}
        <Card className="mb-6 border-dashed border-2 border-slate-300 bg-slate-50/50">
          <CardContent className="p-6 text-center cursor-pointer"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <Upload className="w-8 h-8 text-teal-600 mx-auto mb-2" />
            <p className="text-slate-600 mb-2">
              Drag & drop files here or click to upload
            </p>
            <input
              id="file-input"
              type="file"
              className="hidden"
              onChange={handleFileInput}
            />
            <Badge variant="secondary">Click or drag files to attach to appointments</Badge>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4 flex items-center space-x-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
              <Button variant="ghost" size="sm" onClick={fetchAppointments}>
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Appointments List */}
        <div className="h-[500px] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
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
              <Button 
                onClick={() => setShowForm(true)}
                variant="outline"
              >
                Add First Appointment
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAppointments.map(appointment => (
                <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-2xl">{getCategoryIcon(appointment.category)}</span>
                          <Badge>{appointment.category}</Badge>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">{appointment.title || appointment.category}</h3>
                        <p className="text-sm text-slate-500">{appointment.date}</p>
                        {appointment.provider && (
                          <p className="text-sm text-slate-600 mt-1">Provider: {appointment.provider}</p>
                        )}
                        {appointment.notes && (
                          <p className="text-sm text-slate-700 mt-2">{appointment.notes}</p>
                        )}
                        {appointment.location && (
                          <p className="text-xs text-slate-500 mt-1">Location: {appointment.location}</p>
                        )}
                        {appointment.cost && (
                          <p className="text-xs text-slate-500">Cost: {appointment.cost}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Add Appointment Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Add New Appointment</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Annual Checkup"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="provider">Provider</Label>
                  <Input
                    id="provider"
                    placeholder="Dr. Smith"
                    value={formData.provider}
                    onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="Fairfield Medical Centre"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="cost">Cost</Label>
                  <Input
                    id="cost"
                    placeholder="$149"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional details..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" className="flex-1 bg-teal-600 hover:bg-teal-700">
                    Save Appointment
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
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