'use client';

import { useState } from 'react';
import { useApp } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft, ChevronRight, Calendar, Clock, MapPin, X,
} from 'lucide-react';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isToday, getDay, isSameMonth, parseISO,
} from 'date-fns';
import { formatTime, getEventStatusColor, getPaymentStatusColor } from '@/lib/utils';
import Link from 'next/link';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const { events } = useApp();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDay = getDay(monthStart);

  const getEventsForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return events.filter(e => e.event_date === dateStr);
  };

  const getDayBg = (dayEvents: typeof events) => {
    if (dayEvents.length === 0) return '';
    if (dayEvents.some(e => e.event_status === 'Completed')) return 'has-completed';
    if (dayEvents.some(e => e.payment_status === 'Pending')) return 'has-pending';
    return 'has-upcoming';
  };

  const selectedEvents = selectedDate
    ? events.filter(e => e.event_date === selectedDate)
    : [];

  const monthStats = {
    total: events.filter(e => e.event_date.startsWith(format(currentDate, 'yyyy-MM'))).length,
    completed: events.filter(e => e.event_date.startsWith(format(currentDate, 'yyyy-MM')) && e.event_status === 'Completed').length,
    upcoming: events.filter(e => e.event_date.startsWith(format(currentDate, 'yyyy-MM')) && e.event_status === 'Upcoming').length,
    pendingPayment: events.filter(e => e.event_date.startsWith(format(currentDate, 'yyyy-MM')) && e.payment_status !== 'Paid').length,
  };

  return (
    <div className="space-y-6">
      {/* Month Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Events', value: monthStats.total, color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' },
          { label: 'Completed', value: monthStats.completed, color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' },
          { label: 'Upcoming', value: monthStats.upcoming, color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' },
          { label: 'Payment Pending', value: monthStats.pendingPayment, color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' },
        ].map(stat => (
          <div key={stat.label} className={`rounded-xl p-4 ${stat.color}`}>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm font-medium opacity-80">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1))}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1.5 text-sm rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 hover:bg-purple-200 transition-colors font-medium"
              >
                Today
              </button>
              <button
                onClick={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1))}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center text-xs font-semibold text-gray-400 dark:text-gray-500 py-2">{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startDay }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[80px]" />
            ))}
            {days.map(day => {
              const dayEvents = getEventsForDay(day);
              const dateStr = format(day, 'yyyy-MM-dd');
              const today = isToday(day);
              const selected = selectedDate === dateStr;

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(selected ? null : dateStr)}
                  className={`min-h-[80px] p-1.5 rounded-xl border-2 transition-all text-left ${
                    selected
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : today
                      ? 'border-purple-300 bg-purple-50 dark:bg-purple-900/10'
                      : 'border-transparent hover:border-gray-200 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <span className={`text-sm font-semibold block mb-1 w-7 h-7 flex items-center justify-center rounded-full ${
                    today ? 'bg-purple-600 text-white' : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {format(day, 'd')}
                  </span>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 2).map(event => (
                      <div
                        key={event.id}
                        className={`text-xs px-1 py-0.5 rounded truncate font-medium ${
                          event.event_status === 'Completed'
                            ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
                            : event.payment_status === 'Pending'
                            ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400'
                            : today
                            ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400'
                            : 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400'
                        }`}
                      >
                        {event.event_name.split(' ')[0]}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 px-1">+{dayEvents.length - 2} more</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            {[
              { color: 'bg-green-500', label: 'Completed' },
              { color: 'bg-yellow-500', label: 'Upcoming' },
              { color: 'bg-red-500', label: 'Payment Pending' },
              { color: 'bg-blue-500', label: "Today's Event" },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${item.color}`} />
                <span className="text-xs text-gray-500 dark:text-gray-400">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Day Events */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {selectedDate ? format(parseISO(selectedDate), 'dd MMMM yyyy') : 'Select a date'}
            </h3>
            {selectedDate && (
              <button onClick={() => setSelectedDate(null)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>

          {!selectedDate && (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Click on a date to view events</p>
            </div>
          )}

          {selectedDate && selectedEvents.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400">No events on this date</p>
            </div>
          )}

          <div className="space-y-3">
            {selectedEvents.map(event => (
              <div key={event.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm">{event.event_name}</h4>
                  <Badge className={getEventStatusColor(event.event_status)}>{event.event_status}</Badge>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{event.client?.name}</p>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <Clock className="w-3 h-3" />
                    {formatTime(event.event_time)}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{event.event_venue}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                  <Badge className={getPaymentStatusColor(event.payment_status)}>{event.payment_status}</Badge>
                  <Link href={`/events/${event.id}`} className="text-xs text-purple-600 hover:text-purple-700 font-medium">
                    View →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
