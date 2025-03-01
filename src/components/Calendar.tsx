import React, { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  getDay,
} from "date-fns";

interface CalendarProps {
  onDateSelect: (date: Date) => void;
}

export default function Calendar({ onDateSelect }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const start = startOfMonth(currentMonth);
  const end = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start, end });

  // Get the day of the week for the first day of the month (0 = Sunday, 6 = Saturday)
  const startDayOfWeek = getDay(start);

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      {/* Month Header */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={goToPreviousMonth}
          className="text-gray-500 hover:text-indigo-600"
        >
          {"<"}
        </button>
        <h2 className="text-xl font-semibold">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <button
          onClick={goToNextMonth}
          className="text-gray-500 hover:text-indigo-600"
        >
          {">"}
        </button>
      </div>

      {/* Days of the Week */}
      <div className="grid grid-cols-7 gap-1 text-center text-gray-500 text-sm py-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Add empty placeholders for days before the first day of the month */}
        {Array.from({ length: startDayOfWeek }).map((_, index) => (
          <div key={`empty-${index}`} className="p-2"></div>
        ))}

        {/* Render the days of the month */}
        {days.map((day) => (
          <button
            key={day.toISOString()}
            onClick={() => onDateSelect(day)}
            className="p-2 text-center hover:bg-indigo-50 rounded"
          >
            {format(day, "d")}
          </button>
        ))}
      </div>
    </div>
  );
}
