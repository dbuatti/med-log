import { Activity, Minus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import RangeBar from './RangeBar';
import TrendDots from './TrendDots';

interface LabTrend {
  name: string;
  unit: string;
  readings: { date: string; value: number; refLow?: number; refHigh?: number }[];
}

interface Condition {
  name: string;
  description: string;
  labNames: string[];
}

const CONDITIONS: Condition[] = [
  { name: 'Thrombocytopenia', description: 'Low platelet count — present since at least age 19 (Aug 2010: 132 L). Monitor for bleeding risk.', labNames: ['Platelets'] },
  { name: 'Neutropenia', description: 'Low neutrophils — increases infection risk. Linked to thrombocytopenia.', labNames: ['Neutrophils', 'WCC'] },
  { name: 'Lipid Panel', description: 'Total cholesterol rising 4.4→6.4 over 17 months. LDL 2.4→4.3.', labNames: ['Total Cholesterol', 'LDL', 'HDL', 'Triglycerides', 'Non-HDL', 'TC/HDL Ratio', 'LDL/HDL Ratio'] },
  { name: 'Iron Status', description: 'Ferritin levels — stores of iron in the body.', labNames: ['Ferritin'] },
  { name: 'Vitamin B12', description: 'Vitamin B12 and folate — nerve function and red blood cell production.', labNames: ['Vitamin B12', 'Active B12'] },
  { name: 'Thyroid', description: 'Thyroid stimulating hormone — regulates metabolism.', labNames: ['TSH'] },
  { name: 'Kidney Function', description: 'Glomerular filtration rate — kidney filtering capacity.', labNames: ['eGFR', 'Creatinine', 'Urea'] },
  { name: 'Liver Function', description: 'Liver enzymes — ALT, AST, ALP, GGT indicate liver health.', labNames: ['ALT', 'AST', 'Alk Phos', 'Gamma GT'] },
  { name: 'Metabolic', description: 'HbA1c and fasting glucose — diabetes risk markers.', labNames: ['HbA1c', 'HbA1c IFCC', 'Fasting Glucose'] },
  { name: 'Vitamins', description: 'Vitamin D levels — bone health and immune function.', labNames: ['Vitamin D', '25-OH Vit D'] },
  { name: 'Blood Count', description: 'Haemoglobin and red cell indices — oxygen carrying capacity.', labNames: ['Haemoglobin', 'RBC', 'HCT', 'MCV'] },
  { name: 'Vital Signs', description: 'Weight tracking over time.', labNames: ['Weight'] },
];

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

export default function ConditionsSection({ labs }: { labs: LabTrend[] }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-teal-600" />
        <h2 className="text-lg font-bold text-slate-900">Health Conditions</h2>
      </div>
      <div className="space-y-4">
        {CONDITIONS.map((cond) => {
          const matching = labs.filter(l => cond.labNames.includes(l.name));
          if (matching.length === 0) return null;

          return (
            <Card key={cond.name} className="border-slate-200 overflow-hidden">
              <CardContent className="p-4">
                <div className="mb-3">
                  <h3 className="text-sm font-bold text-slate-900">{cond.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{cond.description}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {matching.map((lab) => {
                    const latest = lab.readings[lab.readings.length - 1];
                    const trend = getTrend(lab.readings);
                    const status = getStatus(latest.value, latest.refLow, latest.refHigh);

                    return (
                      <div
                        key={lab.name}
                        className={`rounded-lg border p-3 ${
                          status === 'high' ? 'border-red-200 bg-red-50/60' :
                          status === 'low' ? 'border-amber-200 bg-amber-50/60' :
                          'border-slate-100 bg-slate-50/50'
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
                        <RangeBar value={latest.value} refLow={latest.refLow} refHigh={latest.refHigh} />
                        {lab.readings.length >= 2 && (
                          <TrendDots readings={lab.readings} refLow={latest.refLow} refHigh={latest.refHigh} />
                        )}
                        {lab.readings.length === 1 && (
                          <div className="text-[10px] text-slate-400 mt-1">Single reading</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
