import React from 'react';
import { Card, Typography } from 'shadcn/ui';
import { CategoryIcon } from './CategoryIcon';

const AppointmentLog = ({ appointments }) => {
  return (
    <div className='space-y-4'>
      {appointments.map(appointment => (
        <Card key={appointment.id} className='max-w-md mx-auto shadow-md'>
          <div className='p-4'>
            <Typography variant='h6' className='text-lg font-bold mb-2'>{appointment.date}</Typography>
            <CategoryIcon category={appointment.category} />
            <Typography variant='body1' className='text-gray-700'>{appointment.title}</Typography>
            <Typography variant='body2' className='text-gray-600'>{appointment.notes || 'No notes'}</Typography>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default AppointmentLog;