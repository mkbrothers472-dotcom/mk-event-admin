'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, getDay } from 'date-fns';
import { useApp } from '@/lib/store';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function MiniCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { events } = useApp();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDay = getDay(monthStart);

  const getEventsForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return events.filter(e => e.event_date === dateStr);
  };

  const getDotColor = (dayEvents: typeof events) => {
    if (dayEvents.some(e => e.payment_status === 'Pending')) return 'bg-red-500';
    if (dayEvents.some(e => e.event_status === 'Completed')) return 'bg-green-500';
    return 'bg-yellow-500';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          {format(currentDate, 'MMMM yyyy')}
        </h3>
        <div className="flex gap-1">
          <button
            onClick={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1))}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
          <button
            onClick={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1))}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {days.map(day => {
          const dayEvents = getEventsForDay(day);
          const today = isToday(day);
          return (
            <Link
              key={day.toISOString()}
              href={`/calendar?date=${format(day, 'yyyy-MM-dd')}`}
              className={cn(
                'relative flex flex-col items-center justify-center rounded-lg p-1 min-h-[36px] transition-colors hover:bg-gray-50 dark:hover:bg-gray-700',
                today && 'bg-purple-600 hover:bg-purple-700 text-white rounded-lg',
                !isSameMonth(day, currentDate) && 'opacity-30'
              )}
            >
              <span className={cn(
                'text-xs font-medium',
                today ? 'text-white' : 'text-gray-700 dark:text-gray-300'
              )}>
                {format(day, 'd')}
              </span>
              {dayEvents.length > 0 && (
                <div className="flex gap-0.5 mt-0.5">
                  <div className={cn('w-1.5 h-1.5 rounded-full', today ? 'bg-white' : getDotColor(dayEvents))} />
                  {dayEvents.length > 1 && (
                    <div className={cn('w-1.5 h-1.5 rounded-full', today ? 'bg-white/70' : 'bg-gray-400')} />
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-3 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-xs text-gray-500 dark:text-gray-400">Completed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-yellow-500" />
          <span className="text-xs text-gray-500 dark:text-gray-400">Upcoming</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-xs text-gray-500 dark:text-gray-400">Payment Due</span>
        </div>
      </div>
    </div>
  );
}
