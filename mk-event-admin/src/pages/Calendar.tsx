import { useState } from 'react';
import { useApp } from '../store';
import { Card } from '../components/ui';
import { formatTime, statusColor, payColor } from '../utils';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, getDay, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin, X } from 'lucide-react';

export function CalendarPage() {
  const [cur, setCur] = useState(new Date());
  const [selDate, setSelDate] = useState<string | null>(null);
  const { events } = useApp();

  const days = eachDayOfInterval({ start: startOfMonth(cur), end: endOfMonth(cur) });
  const startDay = getDay(startOfMonth(cur));
  const month = format(cur, 'yyyy-MM');

  const getEvts = (d: Date) => events.filter(e => e.event_date === format(d, 'yyyy-MM-dd'));
  const selEvts = selDate ? events.filter(e => e.event_date === selDate) : [];

  const stats = {
    total: events.filter(e => e.event_date.startsWith(month)).length,
    completed: events.filter(e => e.event_date.startsWith(month) && e.event_status === 'Completed').length,
    upcoming: events.filter(e => e.event_date.startsWith(month) && e.event_status === 'Upcoming').length,
    pending: events.filter(e => e.event_date.startsWith(month) && e.payment_status !== 'Paid').length,
  };

  return (
    <div className="space-y-6">
      {/* Month Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        {[
          { label: 'Total Events', val: stats.total, cls: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' },
          { label: 'Completed', val: stats.completed, cls: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
          { label: 'Upcoming', val: stats.upcoming, cls: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' },
          { label: 'Payment Pending', val: stats.pending, cls: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl p-3 sm:p-4 ${s.cls}`}>
            <p className="text-2xl font-bold">{s.val}</p>
            <p className="text-xs font-medium opacity-80 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Calendar */}
        <Card className="lg:col-span-2 p-3 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">{format(cur, 'MMMM yyyy')}</h2>
            <div className="flex gap-1 sm:gap-2">
              <button onClick={() => setCur(d => new Date(d.getFullYear(), d.getMonth() - 1))} className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => setCur(new Date())} className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50 font-medium">Today</button>
              <button onClick={() => setCur(d => new Date(d.getFullYear(), d.getMonth() + 1))} className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>

          <div className="grid grid-cols-7 mb-1 sm:mb-2">
            {['S','M','T','W','T','F','S'].map((d, i) => (
              <div key={i} className="text-center text-[10px] sm:text-xs font-semibold text-gray-400 dark:text-gray-500 py-1 sm:py-2">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
            {Array.from({ length: startDay }).map((_, i) => <div key={i} className="min-h-[52px] sm:min-h-[80px]" />)}
            {days.map(day => {
              const evts = getEvts(day);
              const ds = format(day, 'yyyy-MM-dd');
              const today = isToday(day);
              const sel = selDate === ds;
              return (
                <button key={ds} onClick={() => setSelDate(sel ? null : ds)}
                  className={`min-h-[52px] sm:min-h-[80px] p-1 rounded-xl border-2 text-left transition-all ${sel ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : today ? 'border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/10' : 'border-transparent hover:border-gray-200 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
                  <span className={`text-xs sm:text-sm font-semibold w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full mb-0.5 ${today ? 'bg-purple-600 text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                    {format(day, 'd')}
                  </span>
                  <div className="space-y-0.5">
                    {evts.slice(0, 1).map(ev => (
                      <div key={ev.id} className={`text-[9px] sm:text-[10px] px-0.5 sm:px-1 py-0.5 rounded truncate font-medium ${
                        ev.event_status === 'Completed' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
                        : ev.payment_status === 'Pending' ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400'
                        : today ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400'
                        : 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400'
                      }`}>{ev.event_name.split(' ')[0]}</div>
                    ))}
                    {evts.length > 1 && <div className="text-[9px] text-gray-400 dark:text-gray-500 px-0.5">+{evts.length - 1}</div>}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-4 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            {[['bg-green-500','Completed'],['bg-yellow-500','Upcoming'],['bg-red-500','Pay Pending'],['bg-blue-500',"Today"]].map(([c,l]) => (
              <div key={l} className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-full ${c}`} />
                <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">{l}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Side panel — shows below calendar on mobile */}
        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
              {selDate ? format(parseISO(selDate), 'dd MMM yyyy') : 'Select a date'}
            </h3>
            {selDate && (
              <button onClick={() => setSelDate(null)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {!selDate && (
            <div className="text-center py-8">
              <Calendar className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-xs text-gray-500 dark:text-gray-400">Tap a date to view events</p>
            </div>
          )}
          {selDate && selEvts.length === 0 && (
            <div className="text-center py-8">
              <Calendar className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-xs text-gray-500 dark:text-gray-400">No events on this date</p>
            </div>
          )}
          <div className="space-y-2 sm:space-y-3">
            {selEvts.map(ev => (
              <div key={ev.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-3">
                <div className="flex items-start justify-between mb-1.5">
                  <h4 className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm">{ev.event_name}</h4>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusColor(ev.event_status)}`}>{ev.event_status}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">{ev.client?.name}</p>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                    <Clock className="w-3 h-3" />{formatTime(ev.event_time)}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                    <MapPin className="w-3 h-3" /><span className="truncate">{ev.event_venue}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${payColor(ev.payment_status)}`}>{ev.payment_status}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
