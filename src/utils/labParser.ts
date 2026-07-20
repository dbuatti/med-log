// Parses blood test values from free-text appointment notes
// Looks for lines like: "Sodium         142    (135-145)   mmol/L      ✓"
// Or: "Cholesterol      4.4    (<5.6)      mmol/L"
// Or: "TSH              1.78   (0.50-4.00) mIU/L"

interface LabReading {
  name: string;
  value: number;
  unit: string;
  refLow?: number;
  refHigh?: number;
  refText?: string;
}

interface LabTrend {
  name: string;
  unit: string;
  readings: { date: string; value: number; refLow?: number; refHigh?: number }[];
}

// Known aliases — normalise different spellings to a canonical name
const ALIASES: Record<string, string> = {
  'cholesterol': 'Total Cholesterol',
  'total chol': 'Total Cholesterol',
  't chol': 'Total Cholesterol',
  'ldl-c': 'LDL',
  'ldl': 'LDL',
  'hdl-c': 'HDL',
  'hdl': 'HDL',
  'triglyceride': 'Triglycerides',
  'triglycerides': 'Triglycerides',
  'trig': 'Triglycerides',
  'non hdl-c': 'Non-HDL',
  'non-hdl-c': 'Non-HDL',
  'non hdl': 'Non-HDL',
  'tc/hdl-c': 'TC/HDL Ratio',
  'tc/hdl': 'TC/HDL Ratio',
  'ldl/hdl ratio': 'LDL/HDL Ratio',
  'tsh': 'TSH',
  '25-oh vit d': 'Vitamin D',
  'vitamin d': 'Vitamin D',
  'vit d': 'Vitamin D',
  'hbA1c (ngsp)': 'HbA1c',
  'hbA1c (ifcc)': 'HbA1c IFCC',
  'hbA1c': 'HbA1c',
  'hba1c': 'HbA1c',
  'hba1c (ngsp)': 'HbA1c',
  'hba1c (ifcc)': 'HbA1c IFCC',
  'haemoglobin': 'Haemoglobin',
  'hgb': 'Haemoglobin',
  'ferritin': 'Ferritin',
  's ferritin': 'Ferritin',
  'iron studies': 'Ferritin',
  'sodium': 'Sodium',
  'potassium': 'Potassium',
  'chloride': 'Chloride',
  'creatinine': 'Creatinine',
  'urea': 'Urea',
  'bicarbonate': 'Bicarbonate',
  'anion gap': 'Anion Gap',
  'total protein': 'Total Protein',
  'globulin': 'Globulin',
  'albumin': 'Albumin',
  'bilirubin total': 'Bilirubin',
  'bilirubin': 'Bilirubin',
  'alk. phos': 'Alk Phos',
  'alk phosphatase': 'Alk Phos',
  'gamma gt': 'Gamma GT',
  'alt': 'ALT',
  'ast': 'AST',
  'rbc': 'RBC',
  'hct': 'HCT',
  'mcv': 'MCV',
  'mch': 'MCH',
  'mchc': 'MCHC',
  'rdw': 'RDW',
  'wcc': 'WCC',
  'neutrophils': 'Neutrophils',
  'lymphocytes': 'Lymphocytes',
  'monocytes': 'Monocytes',
  'eosinophils': 'Eosinophils',
  'basophils': 'Basophils',
  'platelets': 'Platelets',
  'mpv': 'MPV',
  'vitamin b12': 'Vitamin B12',
  's total b12': 'Vitamin B12',
  'b12': 'Vitamin B12',
  'active vit. b12': 'Active B12',
  'active b12': 'Active B12',
  'active b12': 'Active B12',
  'egfr': 'eGFR',
};

function normaliseName(raw: string): string {
  const lower = raw.toLowerCase().trim();
  return ALIASES[lower] || raw.trim();
}

export function parseLabResults(notes: string): LabReading[] {
  const results: LabReading[] = [];
  const lines = notes.split('\n');

  // Match lines like: "Sodium         142    (135-145)   mmol/L"
  // or: "Cholesterol      4.4    (<5.6)      mmol/L"
  // or: "eGFR           >90    (>59)"
  // or: "HbA1c (NGSP)     4.8%  (4.0-5.9)"
  // or: "WCC              3.8 L  (4.0-11.0)" — values can have L/H suffix
  const lineRegex = /^([A-Za-z][A-Za-z0-9\s\-\/().]+?)\s{2,}([><]?\d+\.?\d*%?)\s*[LH]?\s+\(([^)]+)\)\s*([^\s✓⚠]?[^\s✓⚠]*(?:\s+[^\s✓⚠]+)?)?\s*[✓⚠]?.*$/;

  for (const line of lines) {
    const trimmed = line.replace(/^[✓⚠]\s*/, '').trim();
    const match = trimmed.match(lineRegex);
    if (!match) continue;

    const [, rawName, rawValue, refRange, rawUnit] = match;

    // Skip section headers and non-data lines
    if (/^(Coll|Lab|Tests|Reported|Requested|Collected|Clinical|Pathology|Status|Page|Name|Addressee|Referred|Laboratory|Your Ref|Lab Ref)/i.test(rawName)) continue;
    if (rawName.length > 40) continue;

    const value = parseFloat(rawValue?.replace('>', '')?.replace('<', '')?.replace('%', ''));
    if (isNaN(value)) continue;

    // Parse reference range
    let refLow: number | undefined;
    let refHigh: number | undefined;
    const ref = refRange.trim();

    if (ref.startsWith('>')) {
      refLow = parseFloat(ref.slice(1));
    } else if (ref.startsWith('<')) {
      refHigh = parseFloat(ref.slice(1));
    } else if (ref.includes('-')) {
      const [low, high] = ref.split('-').map(s => parseFloat(s.trim()));
      if (!isNaN(low)) refLow = low;
      if (!isNaN(high)) refHigh = high;
    }

    const unit = (rawUnit || '').replace(/[✓⚠]/g, '').trim();

    results.push({
      name: normaliseName(rawName),
      value,
      unit,
      refLow,
      refHigh,
      refText: ref,
    });
  }

  return results;
}

export function parseWeight(notes: string): number | null {
  // Look for "Weight 70.90" or "~75 kg"
  const match = notes.match(/(?:Weight|weight)[:\s]+~?(\d+\.?\d*)\s*(?:kg)?/i);
  if (match) return parseFloat(match[1]);
  const match2 = notes.match(/~(\d+\.?\d*)\s*kg/i);
  if (match2) return parseFloat(match2[1]);
  return null;
}

export function buildLabTrends(appointments: { date: string; notes: string }[]): LabTrend[] {
  const trendMap: Record<string, LabTrend> = {};

  for (const apt of appointments) {
    if (!apt.notes) continue;

    const dateStr = new Date(apt.date).toLocaleDateString('en-AU', { month: 'short', year: 'numeric' });

    // Parse structured lab results
    const readings = parseLabResults(apt.notes);
    for (const r of readings) {
      const key = r.name;
      if (!trendMap[key]) {
        trendMap[key] = { name: r.name, unit: r.unit, readings: [] };
      }
      // Avoid duplicates for same date
      if (!trendMap[key].readings.some(rd => rd.date === dateStr)) {
        trendMap[key].readings.push({
          date: dateStr,
          value: r.value,
          refLow: r.refLow,
          refHigh: r.refHigh,
        });
      }
      // Update unit if empty
      if (!trendMap[key].unit && r.unit) trendMap[key].unit = r.unit;
    }

    // Parse weight separately
    const weight = parseWeight(apt.notes);
    if (weight) {
      if (!trendMap['Weight']) {
        trendMap['Weight'] = { name: 'Weight', unit: 'kg', readings: [] };
      }
      if (!trendMap['Weight'].readings.some(rd => rd.date === dateStr)) {
        trendMap['Weight'].readings.push({ date: dateStr, value: weight });
      }
    }
  }

  // Sort all readings chronologically (oldest first)
  for (const key of Object.keys(trendMap)) {
    trendMap[key].readings.sort((a, b) => {
      const dateA = new Date(a.date.replace(' ', ' 1 '));
      const dateB = new Date(b.date.replace(' ', ' 1 '));
      return dateA.getTime() - dateB.getTime();
    });
  }

  return Object.values(trendMap).sort((a, b) => a.name.localeCompare(b.name));
}
