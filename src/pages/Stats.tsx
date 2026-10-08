import { useState, useEffect, useCallback, useMemo } from 'react';
import NavBar from '@/components/NavBar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CurrentFocus from '@/components/stats/CurrentFocus';
import SearchSection from '@/components/stats/SearchSection';
import AlertsSection from '@/components/stats/AlertsSection';
import ConditionsSection from '@/components/stats/ConditionsSection';
import SleepSection from '@/components/stats/SleepSection';
import LabTrendsSection from '@/components/stats/LabTrendsSection';
import AppointmentSummary from '@/components/stats/AppointmentSummary';
import { buildLabTrends } from '@/utils/labParser';

interface Appointment {
  id: string;
  date: string;
  category: string;
  title: string;
  notes: string;
  provider: string;
}

export default function Stats() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/appointments');
      if (res.ok) setAppointments(await res.json());
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const labTrends = useMemo(() => buildLabTrends(appointments), [appointments]);

  const staticAlerts: { text: string; severity: 'high' | 'medium' }[] = [
    { text: 'Persistent thrombocytopenia — platelets 139→141 (Aug 2026 follow-up). Neutropenia resolved (neutrophils/WCC back to normal). Review in 3 months', severity: 'high' },
    { text: 'Cholesterol rising — total 4.4→6.4, LDL 2.4→4.3 over 17 months. Lifestyle review + consider statin if continues rising', severity: 'high' },
    { text: 'Sodium elevated (146, should be <145) — monitor hydration', severity: 'medium' },
    { text: 'Mitral valve regurgitation — contraindication for pseudoephedrine', severity: 'medium' },
    { text: 'HbA1c rising (4.8%→5.0%) — still normal range but monitor annually', severity: 'medium' },
    { text: 'Vitamin D dropping (85→62 nmol/L) — still adequate but trending down', severity: 'medium' },
    { text: 'Sleep apnea (AHI 9.6/hr, RDI 18.8/hr) — CPAP abandoned, weight gain may worsen. Reassess if fatigue worsens.', severity: 'medium' },
  ];

  const dynamicAlerts = useMemo(() => {
    const result: { text: string; severity: 'high' | 'medium' }[] = [];
    for (const lab of labTrends) {
      if (lab.readings.length < 2) continue;
      const latest = lab.readings[lab.readings.length - 1];
      const prev = lab.readings[lab.readings.length - 2];
      if (latest.refHigh !== undefined && latest.value > latest.refHigh) {
        const pctChange = ((latest.value - prev.value) / prev.value * 100).toFixed(0);
        result.push({
          text: `${lab.name} above range — ${latest.value} ${lab.unit} (target <${latest.refHigh}). ${prev.date}: ${prev.value} → ${latest.date}: ${latest.value} (+${pctChange}%)`,
          severity: Math.abs(Number(pctChange)) > 30 ? 'high' : 'medium',
        });
      }
      if (latest.refLow !== undefined && latest.value < latest.refLow) {
        result.push({
          text: `${lab.name} below range — ${latest.value} ${lab.unit} (should be >${latest.refLow})`,
          severity: 'medium',
        });
      }
      if (lab.readings.length >= 2) {
        const diff = latest.value - prev.value;
        const pct = (diff / prev.value) * 100;
        if (pct > 20) {
          result.push({
            text: `${lab.name} trending up — +${pct.toFixed(0)}% from ${prev.date} to ${latest.date}`,
            severity: 'high',
          });
        }
      }
    }
    return result;
  }, [labTrends]);

  const alerts = useMemo(() => [...staticAlerts, ...dynamicAlerts], [dynamicAlerts]);

  const filteredLabs = useMemo(() => {
    if (!searchTerm || searchTerm.length < 2) return labTrends;
    return labTrends.filter(l => l.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [labTrends, searchTerm]);

  const searchResults = useMemo(() => {
    if (!searchTerm || searchTerm.length < 2) return [];
    const term = searchTerm.toLowerCase();
    return appointments
      .filter(a => a.notes?.toLowerCase().includes(term))
      .map(a => {
        const notes = a.notes;
        const idx = notes.toLowerCase().indexOf(term);
        const start = Math.max(0, idx - 40);
        const end = Math.min(notes.length, idx + term.length + 40);
        const snippet = (start > 0 ? '...' : '') + notes.slice(start, end) + (end < notes.length ? '...' : '');
        return {
          id: a.id,
          date: a.date,
          title: a.title || a.category,
          snippet: snippet.replace(new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'), '<mark class="bg-yellow-200 px-0.5 rounded">$1</mark>'),
        };
      });
  }, [searchTerm, appointments]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <NavBar />

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Current Focus — always visible */}
        <CurrentFocus />

        {/* Search — always visible */}
        <SearchSection
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          results={searchResults}
        />

        {/* Tabs for long content */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full justify-start gap-0 bg-slate-100 p-1 rounded-lg">
            <TabsTrigger value="overview" className="flex-1 sm:flex-none rounded-md text-xs sm:text-sm">
              Overview
              {alerts.length > 0 && (
                <span className="ml-1.5 bg-amber-100 text-amber-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold">{alerts.length}</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="conditions" className="flex-1 sm:flex-none rounded-md text-xs sm:text-sm">Conditions</TabsTrigger>
            <TabsTrigger value="labs" className="flex-1 sm:flex-none rounded-md text-xs sm:text-sm">Lab Trends</TabsTrigger>
            <TabsTrigger value="sleep" className="flex-1 sm:flex-none rounded-md text-xs sm:text-sm">Sleep</TabsTrigger>
            <TabsTrigger value="summary" className="flex-1 sm:flex-none rounded-md text-xs sm:text-sm">Summary</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <AlertsSection alerts={alerts} />
          </TabsContent>

          <TabsContent value="conditions" className="mt-4">
            <ConditionsSection labs={filteredLabs} />
          </TabsContent>

          <TabsContent value="labs" className="mt-4">
            <LabTrendsSection labs={filteredLabs} appointmentCount={appointments.length} />
          </TabsContent>

          <TabsContent value="sleep" className="mt-4">
            <SleepSection />
          </TabsContent>

          <TabsContent value="summary" className="mt-4">
            <AppointmentSummary appointments={appointments} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
