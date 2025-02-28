import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

interface CalendarProps {
  onDateSelect: (date: Date) => void;
}

export default function Calendar({ onDateSelect }: CalendarProps) {
  const today = new Date();
  const start = startOfMonth(today);
  const end = endOfMonth(today);
  const days = eachDayOfInterval({ start, end });

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="text-center mb-4">
        <h2 className="text-xl font-semibold">{format(today, 'MMMM yyyy')}</h2>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-gray-500 text-sm py-2">
            {day}
          </div>
        ))}
        {days.map((day) => (
          <button
            key={day.toISOString()}
            onClick={() => onDateSelect(day)}
            className="p-2 text-center hover:bg-indigo-50 rounded"
          >
            {format(day, 'd')}
          </button>
        ))}
      </div>
    </div>
  );
}