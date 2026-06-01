import { useState } from 'react';
import { useApp } from '../store';
import { Card } from '../components/ui';
import { formatDate, waLink } from '../utils';
import { Bell, CheckCircle, MessageCircle, Calendar, AlertCircle, Clock } from 'lucide-react';
import { Reminder } from '../types';

const TYPE_COLORS: Record<string, string> = {
  '3 Days Before Event': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  '1 Day Before Event': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  'Event Day Morning': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  'Remaining Payment Reminder': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  'Overdue Payment Reminder': 'bg-red-200 text-red-900 dark:bg-red-900/50 dark:text-red-300',
  'Decoration Material Pickup Reminder': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  'Equipment Return Reminder': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
};

function getMsg(r: Reminder): string {
  const n = r.event?.client?.name, ev = r.event?.event_name, d = formatDate(r.event?.event_date || '');
  switch (r.reminder_type) {
    case '3 Days Before Event': return `Hi ${n}, your ${ev} is in 3 days on ${d}. Please confirm all arrangements. - MK Brothers`;
    case '1 Day Before Event': return `Hi ${n}, your ${ev} is tomorrow! We'll be there to set up. - MK Brothers`;
    case 'Event Day Morning': return `Good morning ${n}! Today is your ${ev}. Our team is on the way. - MK Brothers`;
    case 'Remaining Payment Reminder': return `Hi ${n}, your remaining payment for ${ev} is due. Please clear at your earliest. - MK Brothers`;
    case 'Overdue Payment Reminder': return `Hi ${n}, your payment for ${ev} is overdue. Please contact us immediately. - MK Brothers`;
    default: return `Hi ${n}, reminder from MK Brothers regarding your ${ev}.`;
  }
}

export function Reminders() {
  const { reminders, events } = useApp();
  const [filter, setFilter] = useState<'all'|'pending'|'sent'>('all');
  const today = new Date().toISOString().split('T')[0];

  const filtered = reminders.filter(r =>
    filter === 'pending' ? !r.is_sent : filter === 'sent' ? r.is_sent : true
  );
  const pending = reminders.filter(r => !r.is_sent);
  const sent = reminders.filter(r => r.is_sent);
  const overdue = reminders.filter(r => !r.is_sent && r.reminder_date < today);

  const autoReminders = events.filter(e => e.event_status === 'Upcoming').flatMap(ev => {
    const diff = Math.ceil((new Date(ev.event_date).getTime() - Date.now()) / 86400000);
    const types: string[] = [];
    if (diff === 3) types.push('3 Days Before Event');
    if (diff === 1) types.push('1 Day Before Event');
    if (diff === 0) types.push('Event Day Morning');
    if (ev.remaining_balance > 0) types.push('Remaining Payment Reminder');
    return types.map(t => ({
      id:`auto-${ev.id}-${t}`, event_id:ev.id, event:ev,
      reminder_type:t, reminder_date:ev.event_date,
      is_sent:false, created_at:new Date().toISOString(),
    }));
  });

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        {[
          { icon:Bell, label:'Total', val:reminders.length, cls:'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' },
          { icon:Clock, label:'Pending', val:pending.length, cls:'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' },
          { icon:AlertCircle, label:'Overdue', val:overdue.length, cls:'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' },
          { icon:CheckCircle, label:'Sent', val:sent.length, cls:'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' },
        ].map(s => (
          <Card key={s.label} className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${s.cls}`}>
              <s.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{s.val}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Auto-generated */}
      {autoReminders.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <h3 className="font-semibold text-sm text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
            <Bell className="w-4 h-4" />Auto-Generated Reminders
          </h3>
          <div className="space-y-2">
            {autoReminders.map(r => (
              <div key={r.id} className="flex items-center justify-between gap-3 bg-white dark:bg-gray-800 rounded-xl px-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{r.reminder_type}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">{r.event?.client?.name} · {r.event?.event_name}</p>
                </div>
                <a
                  href={waLink(r.event?.client?.mobile||'', getMsg(r as Reminder))}
                  target="_blank" rel="noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600 transition-colors flex-shrink-0"
                >
                  <MessageCircle className="w-3 h-3" />Send
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['all','pending','sent'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors capitalize ${
              filter===f
                ? 'bg-purple-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {f} ({f==='pending'?pending.length:f==='sent'?sent.length:reminders.length})
          </button>
        ))}
      </div>

      {/* Reminders List */}
      <div className="space-y-2 sm:space-y-3">
        {filtered.map(r => (
          <Card key={r.id} className={`p-3 sm:p-5 ${r.is_sent ? 'opacity-60' : ''}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5 sm:gap-3 min-w-0 flex-1">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${r.is_sent ? 'bg-green-100 dark:bg-green-900/30' : 'bg-orange-100 dark:bg-orange-900/30'}`}>
                  {r.is_sent
                    ? <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    : <Bell className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  }
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] sm:text-xs font-semibold ${TYPE_COLORS[r.reminder_type] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                      {r.reminder_type}
                    </span>
                    {!r.is_sent && r.reminder_date < today && (
                      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                        Overdue
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                    {r.event?.client?.name} — {r.event?.event_name}
                  </p>
                  <div className="flex items-center gap-2 sm:gap-3 mt-0.5">
                    <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />{formatDate(r.reminder_date)}
                    </span>
                    <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">
                      {r.event?.client?.mobile}
                    </span>
                  </div>
                </div>
              </div>
              {!r.is_sent && (
                <a
                  href={waLink(r.event?.client?.mobile||'', getMsg(r))}
                  target="_blank" rel="noreferrer"
                  className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600 transition-colors flex-shrink-0"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">WhatsApp</span>
                </a>
              )}
            </div>
          </Card>
        ))}
        {filtered.length === 0 && (
          <Card className="p-10 text-center">
            <Bell className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No reminders found</p>
          </Card>
        )}
      </div>
    </div>
  );
}
