import { useMemo } from 'react';
import { Activity, Minus } from 'lucide-react';
import RangeBar from './RangeBar';
import TrendDots from './TrendDots';

interface LabTrend {
  name: string;
  unit: string;
  readings: { date: string; value: number; refLow?: number; refHigh?: number }[];
}

const LAB_GROUPS: Record<string, string[]> = {
  'Blood Count': ['Haemoglobin', 'RBC', 'HCT', 'MCV', 'MCH', 'MCHC', 'RDW', 'Platelets', 'MPV', 'WCC', 'Neutrophils', 'Lymphocytes', 'Monocytes', 'Eosinophils', 'Basophils'],
  'Iron & B12': ['Ferritin', 'Vitamin B12', 'Active B12', 'RBC Folate', 'S Folate'],
  'Kidney & Electrolytes': ['Sodium', 'Potassium', 'Chloride', 'Bicarbonate', 'Anion Gap', 'Urea', 'Creatinine', 'eGFR'],
  'Liver': ['Total Protein', 'Albumin', 'Globulin', 'Bilirubin', 'Alk Phos', 'Gamma GT', 'ALT', 'AST'],
  'Lipids': ['Total Cholesterol', 'Triglycerides', 'HDL', 'LDL', 'Non-HDL', 'TC/HDL Ratio', 'LDL/HDL Ratio'],
  'Metabolic': ['HbA1c', 'HbA1c IFCC', 'Fasting Glucose', 'Uric Acid'],
  'Thyroid': ['TSH'],
  'Vitamins': ['Vitamin D', '25-OH Vit D'],
  'Other': [],
};

function getGroup(name: string): string {
  for (const [group, members] of Object.entries(LAB_GROUPS)) {
    if (members.includes(name)) return group;
  }
  return 'Other';
}

function getStatus(val: number, refLow?: number, refHigh?: number): 'high' | 'low' | 'normal' {
  if (refLow !== undefined && val < refLow) return 'low';
  if (refHigh !== undefined && val > refHigh) return 'high';
  return 'normal';
}

function getTrend(readings: LabTrend['readings']): 'up' | 'down' | 'stable' | null {
  if (readings.length < 2) return null;
  const diff = readings[readings.length - 1].value - readings[readings.length - 2].value;
  if (Math.abs(diff) < 0.01) return 'stable';
  return diff > 0 ? 'up' : 'down';
}

const badUp = new Set(['Total Cholesterol', 'LDL', 'Non-HDL', 'Weight', 'Sodium', 'Triglycerides', 'HbA1c']);
const badDown = new Set(['HDL', 'Platelets', 'Neutrophils', 'WCC', 'Haemoglobin', 'Ferritin', 'Vitamin D', 'B12']);

function TrendIcon({ trend, name }: { trend: 'up' | 'down' | 'stable' | null; name: string }) {
  if (!trend) return null;
  const isBad = (trend === 'up' && badUp.has(name)) || (trend === 'down' && badDown.has(name));
  if (trend === 'up') return <svg className={`w-3.5 h-3.5 ${isBad ? 'text-red-500' : 'text-green-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>;
  if (trend === 'down') return <svg className={`w-3.5 h-3.5 ${isBad ? 'text-red-500' : 'text-green-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" /></svg>;
  return <Minus className="w-3.5 h-3.5 text-slate-400" />;
}

interface Props {
  labs: LabTrend[];
  appointmentCount: number;
}

export default function LabTrendsSection({ labs, appointmentCount }: Props) {
  const grouped = useMemo(() => {
    const groups: Record<string, LabTrend[]> = {};
    for (const lab of labs) {
      const group = getGroup(lab.name);
      if (!groups[group]) groups[group] = [];
      groups[group].push(lab);
    }
    const order = ['Blood Count', 'Iron & B12', 'Kidney & Electrolytes', 'Liver', 'Lipids', 'Metabolic', 'Thyroid', 'Vitamins', 'Other'];
    return order.filter(g => groups[g]?.length).map(g => ({ group: g, labs: groups[g] }));
  }, [labs]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-teal-600" />
          <h2 className="text-lg font-bold text-slate-900">Lab Trends</h2>
        </div>
        <span className="text-xs text-slate-400">{labs.length} markers · {appointmentCount} appointments</span>
      </div>
      {labs.length === 0 ? (
        <p className="text-sm text-slate-500">No lab values found</p>
      ) : (
        <div className="space-y-6">
          {grouped.map(({ group, labs: groupLabs }) => (
            <div key={group}>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{group}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {groupLabs.map((lab) => {
                  const latest = lab.readings[lab.readings.length - 1];
                  const trend = getTrend(lab.readings);
                  const status = getStatus(latest.value, latest.refLow, latest.refHigh);
                  const hasRange = latest.refLow !== undefined || latest.refHigh !== undefined;

                  return (
                    <div
                      key={lab.name}
                      className={`relative rounded-lg border p-3 transition-all hover:shadow-sm ${
                        status === 'high' ? 'border-red-200 bg-red-50/60' :
                        status === 'low' ? 'border-amber-200 bg-amber-50/60' :
                        'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-slate-700">{lab.name}</span>
                        <div className="flex items-center gap-1">
                          <TrendIcon trend={trend} name={lab.name} />
                          {status !== 'normal' && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                              status === 'high' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {status === 'high' ? 'HIGH' : 'LOW'}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-baseline gap-1.5">
                        <span className={`text-xl font-bold ${
                          status === 'high' ? 'text-red-700' :
                          status === 'low' ? 'text-amber-700' :
                          'text-slate-900'
                        }`}>{latest.value}</span>
                        <span className="text-[10px] text-slate-400">{lab.unit}</span>
                      </div>
                      {hasRange && (
                        <RangeBar value={latest.value} refLow={latest.refLow} refHigh={latest.refHigh} />
                      )}
                      {lab.readings.length >= 2 && (
                        <TrendDots readings={lab.readings} refLow={latest.refLow} refHigh={latest.refHigh} />
                      )}
                      {lab.readings.length === 1 && (
                        <div className="text-[10px] text-slate-400 mt-1.5">Single reading</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
