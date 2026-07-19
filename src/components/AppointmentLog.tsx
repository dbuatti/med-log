import React from 'react';
import { Card } from '@/components/ui/card';
import { CategoryIcon } from './CategoryIcon';

const AppointmentLog = ({ appointments }) => {
  return (
    <div className='space-y-4'>
      {appointments.map(appointment => (
        <Card key={appointment.id} className='max-w-md mx-auto shadow-md'>
          <div className='p-4'>
            <h3 className='text-lg font-bold mb-2'>{appointment.date}</h3>
            <CategoryIcon category={appointment.category} />
            <h4 className='text-gray-700'>{appointment.title}</h4>
            <p className='text-gray-600'>{appointment.notes || 'No notes'}</p>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default AppointmentLog;