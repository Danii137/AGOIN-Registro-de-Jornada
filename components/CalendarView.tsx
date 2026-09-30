import React, { useState } from 'react';
import type { LogEntry } from '../types';
import DayCell from './DayCell';
import { SPANISH_HOLIDAYS_2025 } from '../constants';

interface CalendarViewProps {
  logData: LogEntry[];
  selectedDate: { month: number; year: number };
  showBreakFields: boolean;
  onToggleDay: (day: number) => void;
  onTimeChange: (day: number, field: 'entry' | 'stop' | 'comeback' | 'exit', value: string) => void;
  onTickChange: (day: number, field: 'entry' | 'stop' | 'comeback' | 'exit', isChecked: boolean) => void;
  onExtraHoursChange: (day: number, value: string) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ logData, selectedDate, showBreakFields, onToggleDay, onTimeChange, onTickChange, onExtraHoursChange }) => {
  const { year, month } = selectedDate;
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  const handleExpand = (day: number) => {
    setExpandedDay(expandedDay === day ? null : day);
  };

  const getCalendarCells = () => {
    const cells = [];
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    const firstDayOfMonth = new Date(Date.UTC(year, month, 1)).getUTCDay();
    const startDayIndex = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    // Previous month's days for desktop grid
    for (let i = startDayIndex; i > 0; i--) {
        const day = daysInPrevMonth - i + 1;
        cells.push({ key: `prev-${day}`, day: day, isCurrentMonth: false, date: new Date(Date.UTC(year, month - 1, day)) });
    }
    
    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
        cells.push({ key: `current-${day}`, day: day, isCurrentMonth: true, date: new Date(Date.UTC(year, month, day)) });
    }

    // Next month's days for desktop grid
    const totalCells = cells.length;
    const remainingCells = (7 - (totalCells % 7)) % 7;
    for (let i = 1; i <= remainingCells; i++) {
        cells.push({ key: `next-${i}`, day: i, isCurrentMonth: false, date: new Date(Date.UTC(year, month + 1, i)) });
    }

    return cells;
  };

  const calendarCells = getCalendarCells();
  const weekDayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  return (
    <div className="bg-agoin-dark rounded-lg no-print overflow-hidden">
      {/* Desktop Grid View */}
      <div className="hidden md:block">
        <div className="grid grid-cols-7 text-center font-semibold text-agoin-teal border-b border-gray-700">
          {weekDayNames.map(day => <div key={day} className="py-2 text-sm">{day}</div>)}
        </div>
        <div className="grid grid-cols-7">
          {calendarCells.map(cell => {
            if (!cell.isCurrentMonth) {
              return (
                <div key={cell.key} className="border border-gray-700/50 bg-agoin-darker min-h-[180px] p-2 text-gray-600">
                  <span className="font-bold text-sm">{cell.day}</span>
                </div>
              );
            }
            
            const entry = logData.find(e => e.day === cell.day);
            if (!entry) return <div key={cell.key} className="border border-gray-700/50 min-h-[180px]"></div>;

            const date = cell.date;
            const dayOfWeek = date.getUTCDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            const dateString = date.toISOString().split('T')[0];
            const isHoliday = SPANISH_HOLIDAYS_2025.includes(dateString);

            return (
              <DayCell
                key={cell.key}
                entry={entry}
                selectedDate={selectedDate}
                isWeekend={isWeekend}
                isHoliday={isHoliday}
                showBreakFields={showBreakFields}
                isExpanded={true} // Always expanded on desktop
                onToggle={onToggleDay}
                onTimeChange={onTimeChange}
                onTickChange={onTickChange}
                onExtraHoursChange={onExtraHoursChange}
                onExpand={() => {}} // No expand action on desktop
              />
            );
          })}
        </div>
      </div>
      
      {/* Mobile List View */}
      <div className="md:hidden">
        {logData.map(entry => {
           const date = new Date(Date.UTC(year, month, entry.day));
           const dayOfWeek = date.getUTCDay();
           const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
           const dateString = date.toISOString().split('T')[0];
           const isHoliday = SPANISH_HOLIDAYS_2025.includes(dateString);

           return (
            <DayCell
                key={entry.day}
                entry={entry}
                selectedDate={selectedDate}
                isWeekend={isWeekend}
                isHoliday={isHoliday}
                showBreakFields={showBreakFields}
                isExpanded={expandedDay === entry.day}
                onToggle={onToggleDay}
                onTimeChange={onTimeChange}
                onTickChange={onTickChange}
                onExtraHoursChange={onExtraHoursChange}
                onExpand={handleExpand}
            />
           )
        })}
      </div>
    </div>
  );
};

export default CalendarView;
