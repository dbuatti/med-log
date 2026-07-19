import React from 'react';
import { Stethoscope, Brain, Heart, Pill, FileText, Calendar, User } from 'lucide-react';

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  GP: Stethoscope,
  Dentist: User,
  Psych: Brain,
  'Blood Test': Calendar,
  Medication: Pill,
  Cardio: Heart,
  Other: FileText,
};

export const CategoryIcon = ({ category }: { category: string }) => {
  const IconComponent = icons[category] || FileText;
  return <IconComponent className="w-6 h-6 text-teal-600" />;
};