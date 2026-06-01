import { useApp } from '../store';
import { Card } from '../components/ui';
import { formatDate, formatTime, formatCurrency, statusColor, payColor, waLink } from '../utils';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, getDay } from 'date-fns';
import { useState } from 'react';
import {
  Calendar, CheckCircle, Clock, CreditCard, Package, Sparkles,
  MapPin, Phone, MessageCircle, ArrowRight, AlertCircle,
  ChevronLeft, ChevronRight,
} from 'lucide-react';

function StatCard({ title, value, sub, icon: Icon, color }: {
  title: string; value: string | number; sub?: string; icon: React.ElementType; color: string;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{value}</p>
          {sub && <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 truncate">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ml-2 ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </Card>
  );
}

function MiniCal() {
  const [cur, setCur] = useState(new Date());
  const { events, setActivePage } = useApp();
  const days = eachDayOfInterval({ start: startOfMonth(cur), end: endOfMonth(cur) });
  const startDay = getDay(startOfMonth(cur));
  const getEvts = (d: Date) => events.filter(e => e.event_date === format(d, 'yyyy-MM-dd'));

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm text-gray-900 dark:text-white">{format(cur, 'MMMM yyyy')}</h3>
        <div className="flex gap-1">
          <button onClick={() => setCur(d => new Date(d.getFullYear(), d.getMonth() - 1))}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400">
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setCur(d => new Date(d.getFullYear(), d.getMonth() + 1))}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400">
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {['S','M','T','W','T','F','S'].map((d, i) => (
          <div key={i} className="text-center text-[10px] font-medium text-gray-400 py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {Array.from({ length: startDay }).map((_, i) => <div key={i} />)}
        {days.map(day => {
          const evts = getEvts(day);
          const today = isToday(day);
          const dotColor = evts.some(e => e.payment_status === 'Pending') ? 'bg-red-500'
            : evts.some(e => e.event_status === 'Completed') ? 'bg-green-500' : 'bg-yellow-500';
          return (
            <button key={day.toISOString()} onClick={() => setActivePage('calendar')}
              className={`flex flex-col items-center py-1 rounded-lg transition-colors ${today ? 'bg-purple-600' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
              <span className={`text-[11px] font-medium ${today ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                {format(day, 'd')}
              </span>
              {evts.length > 0 && (
                <div className={`w-1 h-1 rounded-full mt-0.5 ${today ? 'bg-white' : dotColor}`} />
              )}
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
        {[['bg-green-500','Done'],['bg-yellow-500','Soon'],['bg-red-500','Due']].map(([c,l]) => (
          <div key={l} className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${c}`} />
            <span className="text-[10px] text-gray-500 dark:text-gray-400">{l}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function Dashboard() {
  const { events, reminders, payments, setActivePage } = useApp();
  const today = format(new Date(), 'yyyy-MM-dd');

  const todayEvts = events.filter(e => e.event_date === today);
  const upcoming = events.filter(e => e.event_status === 'Upcoming' && e.event_date > today);
  const completed = events.filter(e => e.event_status === 'Completed');
  const totalRev = payments.reduce((s, p) => s + p.amount, 0);
  const totalPending = events.reduce((s, e) => s + e.remaining_balance, 0);
  const activeReminders = reminders.filter(r => !r.is_sent).slice(0, 4);

  return (
    <div className="space-y-4">
      {/* Stats — 2 cols on mobile, 3 on sm, 6 on lg */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard title="Today" value={todayEvts.length} sub={format(new Date(), 'dd MMM')} icon={Clock}
          color="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400" />
        <StatCard title="Upcoming" value={upcoming.length} sub="Scheduled" icon={Sparkles}
          color="bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400" />
        <StatCard title="Completed" value={completed.length} sub="Events done" icon={CheckCircle}
          color="bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400" />
      </div>

      {/* Revenue Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-4 sm:p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-200 text-xs sm:text-sm font-medium">Total Revenue Collected</p>
            <p className="text-2xl sm:text-4xl font-bold mt-1">{formatCurrency(totalRev)}</p>
            <p className="text-purple-200 text-xs sm:text-sm mt-1">Pending: {formatCurrency(totalPending)}</p>
          </div>
          <div className="text-right">
            <p className="text-purple-200 text-xs sm:text-sm">Total Events</p>
            <p className="text-2xl sm:text-3xl font-bold">{events.length}</p>
            <button onClick={() => setActivePage('reports')}
              className="text-purple-200 text-xs hover:text-white flex items-center gap-1 justify-end mt-1">
              Reports <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main grid — single col on mobile, 3 col on lg */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Today + Upcoming */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Today's Events</h2>
            <button onClick={() => setActivePage('events')}
              className="text-xs text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {todayEvts.length === 0 ? (
            <Card className="p-8 text-center">
              <Calendar className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">No events today</p>
            </Card>
          ) : todayEvts.map(ev => (
            <Card key={ev.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{ev.event_name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{ev.client?.name}</p>
                </div>
                <div className="flex flex-col gap-1 items-end ml-2 flex-shrink-0">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusColor(ev.event_status)}`}>{ev.event_status}</span>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${payColor(ev.payment_status)}`}>{ev.payment_status}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400 mb-3">
                <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 flex-shrink-0" />{formatTime(ev.event_time)}</div>
                <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 flex-shrink-0" />{ev.client?.mobile}</div>
                <div className="flex items-center gap-1.5 col-span-2"><MapPin className="w-3.5 h-3.5 flex-shrink-0" /><span className="truncate">{ev.event_venue}</span></div>
                {ev.remaining_balance > 0 && (
                  <div className="flex items-center gap-1.5 col-span-2 text-red-600 dark:text-red-400 font-semibold">
                    <CreditCard className="w-3.5 h-3.5 flex-shrink-0" />{formatCurrency(ev.remaining_balance)} due
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                <a href={waLink(ev.client?.mobile || '', `Hi ${ev.client?.name}, your ${ev.event_name} is today at ${formatTime(ev.event_time)}. - MK Brothers`)}
                  target="_blank" rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600 flex-1 justify-center">
                  <MessageCircle className="w-3.5 h-3.5" />WhatsApp
                </a>
                {ev.client?.google_map_link && (
                  <a href={ev.client.google_map_link} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2 bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-600 flex-1 justify-center">
                    <MapPin className="w-3.5 h-3.5" />Map
                  </a>
                )}
              </div>
            </Card>
          ))}

          {/* Upcoming */}
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Upcoming Events</h2>
          </div>
          <Card>
            {upcoming.slice(0, 5).map((ev, i) => (
              <div key={ev.id} className={`flex items-center justify-between p-3 sm:p-4 ${i > 0 ? 'border-t border-gray-100 dark:border-gray-700' : ''}`}>
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{ev.event_name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{ev.client?.name} · {formatDate(ev.event_date)}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${payColor(ev.payment_status)}`}>{ev.payment_status}</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{formatCurrency(ev.total_price)}</p>
                </div>
              </div>
            ))}
            {upcoming.length === 0 && (
              <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">No upcoming events</div>
            )}
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <MiniCal />

          {/* Reminders */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Reminders</h3>
              <button onClick={() => setActivePage('reminders')} className="text-xs text-purple-600 dark:text-purple-400 hover:underline">View All</button>
            </div>
            {activeReminders.length === 0
              ? <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-3">No pending reminders</p>
              : <div className="space-y-2.5">
                  {activeReminders.map(r => (
                    <div key={r.id} className="flex items-start gap-2.5">
                      <div className="w-7 h-7 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-900 dark:text-white leading-tight">{r.reminder_type}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">{r.event?.client?.name} · {formatDate(r.reminder_date)}</p>
                      </div>
                    </div>
                  ))}
                </div>
            }
          </Card>

          {/* Quick Actions */}
          <Card className="p-4">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button onClick={() => setActivePage('events')}
                className="w-full flex items-center gap-2 px-3 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
                <Sparkles className="w-4 h-4" />Create New Event
              </button>
              <button onClick={() => setActivePage('payments')}
                className="w-full flex items-center gap-2 px-3 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <CreditCard className="w-4 h-4" />Record Payment
              </button>
              <button onClick={() => setActivePage('inventory')}
                className="w-full flex items-center gap-2 px-3 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <Package className="w-4 h-4" />Manage Inventory
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
