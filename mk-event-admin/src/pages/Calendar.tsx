import { useState } from 'react';
import { useApp } from '../store';
import { Card } from '../components/ui';
import { formatTime, statusColor, payColor, formatCurrency } from '../utils';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, getDay, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin, X, Camera, CreditCard, Phone } from 'lucide-react';
import { Event } from '../types';

// ── Event card in side panel with photo ───────────────────────────────────
function CalEventCard({ ev }: { ev: Event }) {
  // Use cover_photo_url from event data — instant, no extra API call
  const photo = (ev as any).cover_photo_url || null;

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      {/* Photo */}
      <div className="relative h-32 bg-gray-100 dark:bg-gray-700">
        {photo ? (
          <img src={photo} alt={ev.event_name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Camera className="w-8 h-8 text-gray-300 dark:text-gray-600" />
          </div>
        )}
        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        {/* Status badge */}
        <span className={`absolute top-2 right-2 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusColor(ev.event_status)}`}>
          {ev.event_status}
        </span>
        {/* Event name on image */}
        <div className="absolute bottom-0 left-0 right-0 px-3 py-2">
          <p className="font-bold text-white text-sm leading-tight truncate">{ev.event_name}</p>
          <p className="text-white/80 text-xs truncate">{ev.client?.name}</p>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 space-y-1.5">
        {/* Time pill */}
        <div className="inline-flex items-center gap-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full px-3 py-1">
          <Clock className="w-3 h-3" />
          <span className="text-xs font-semibold">{formatTime(ev.event_time)}</span>
        </div>

        <div className="flex items-start gap-1.5 text-xs text-gray-600 dark:text-gray-400">
          <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span className="truncate">{ev.event_venue}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
          <Phone className="w-3 h-3 flex-shrink-0" />
          <span>{ev.client?.mobile}</span>
        </div>

        {/* Payment row */}
        <div className="flex items-center justify-between pt-1.5 border-t border-gray-100 dark:border-gray-700">
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${payColor(ev.payment_status)}`}>
            {ev.payment_status}
          </span>
          <div className="flex items-center gap-1 text-xs font-semibold text-gray-900 dark:text-white">
            <CreditCard className="w-3 h-3 text-gray-400" />
            {formatCurrency(ev.total_price)}
          </div>
        </div>

        {ev.remaining_balance > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg px-2.5 py-1.5">
            <p className="text-[11px] font-medium text-red-600 dark:text-red-400">
              Due: {formatCurrency(ev.remaining_balance)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

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
    total:     events.filter(e => e.event_date.startsWith(month)).length,
    completed: events.filter(e => e.event_date.startsWith(month) && e.event_status === 'Completed').length,
    upcoming:  events.filter(e => e.event_date.startsWith(month) && e.event_status === 'Upcoming').length,
    pending:   events.filter(e => e.event_date.startsWith(month) && e.payment_status !== 'Paid').length,
  };

  return (
    <div className="space-y-4">
      {/* Month Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        {[
          { label: 'Total Events',    val: stats.total,     cls: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' },
          { label: 'Completed',       val: stats.completed, cls: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
          { label: 'Upcoming',        val: stats.upcoming,  cls: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' },
          { label: 'Payment Pending', val: stats.pending,   cls: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl p-3 sm:p-4 ${s.cls}`}>
            <p className="text-2xl font-bold">{s.val}</p>
            <p className="text-xs font-medium opacity-80 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ── Calendar grid ── */}
        <Card className="lg:col-span-2 p-3 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">{format(cur, 'MMMM yyyy')}</h2>
            <div className="flex gap-1 sm:gap-2">
              <button onClick={() => setCur(d => new Date(d.getFullYear(), d.getMonth() - 1))}
                className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setCur(new Date())}
                className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 hover:bg-purple-200 font-medium">
                Today
              </button>
              <button onClick={() => setCur(d => new Date(d.getFullYear(), d.getMonth() + 1))}
                className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1 sm:mb-2">
            {['S','M','T','W','T','F','S'].map((d, i) => (
              <div key={i} className="text-center text-[10px] sm:text-xs font-semibold text-gray-400 dark:text-gray-500 py-1 sm:py-2">{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
            {Array.from({ length: startDay }).map((_, i) => <div key={i} className="min-h-[52px] sm:min-h-[80px]" />)}
            {days.map(day => {
              const evts = getEvts(day);
              const ds   = format(day, 'yyyy-MM-dd');
              const today = isToday(day);
              const sel   = selDate === ds;
              return (
                <button key={ds} onClick={() => setSelDate(sel ? null : ds)}
                  className={`min-h-[52px] sm:min-h-[80px] p-1 rounded-xl border-2 text-left transition-all ${
                    sel    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : today ? 'border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/10'
                    :         'border-transparent hover:border-gray-200 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}>
                  <span className={`text-xs sm:text-sm font-semibold w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full mb-0.5 ${
                    today ? 'bg-purple-600 text-white' : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {format(day, 'd')}
                  </span>
                  <div className="space-y-0.5">
                    {evts.slice(0, 1).map(ev => (
                      <div key={ev.id} className={`text-[9px] sm:text-[10px] px-0.5 sm:px-1 py-0.5 rounded truncate font-medium ${
                        ev.event_status === 'Completed'   ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
                        : ev.payment_status === 'Pending' ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400'
                        : today                            ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400'
                        :                                   'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400'
                      }`}>{ev.event_name.split(' ')[0]}</div>
                    ))}
                    {evts.length > 1 && (
                      <div className="text-[9px] text-gray-400 dark:text-gray-500 px-0.5">+{evts.length - 1}</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-2 sm:gap-4 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            {[['bg-green-500','Completed'],['bg-yellow-500','Upcoming'],['bg-red-500','Pay Pending'],['bg-blue-500','Today']].map(([c,l]) => (
              <div key={l} className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-full ${c}`} />
                <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">{l}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* ── Side panel ── */}
        <Card className="p-4 sm:p-5 overflow-y-auto max-h-[600px]">
          <div className="flex items-center justify-between mb-4">
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
            <div className="text-center py-10">
              <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tap a date</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">to view events & photos</p>
            </div>
          )}

          {selDate && selEvts.length === 0 && (
            <div className="text-center py-10">
              <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400">No events on this date</p>
            </div>
          )}

          {/* Event cards with photos */}
          <div className="space-y-3">
            {selEvts.map(ev => (
              <CalEventCard key={ev.id} ev={ev} />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
