'use client';

import { useState } from 'react';
import { useApp } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, CheckCircle, MessageCircle, Calendar, AlertCircle, Clock } from 'lucide-react';
import { formatDate, generateWhatsAppLink } from '@/lib/utils';
import { Reminder } from '@/lib/types';

const reminderTypeColors: Record<string, string> = {
  '3 Days Before Event': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  '1 Day Before Event': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  'Event Day Morning': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  'Remaining Payment Reminder': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  'Overdue Payment Reminder': 'bg-red-200 text-red-900 dark:bg-red-900/50 dark:text-red-300',
  'Decoration Material Pickup Reminder': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  'Equipment Return Reminder': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
};

export default function RemindersPage() {
  const { reminders, events } = useApp();
  const [filter, setFilter] = useState<'all' | 'pending' | 'sent'>('all');

  const filtered = reminders.filter(r => {
    if (filter === 'pending') return !r.is_sent;
    if (filter === 'sent') return r.is_sent;
    return true;
  });

  const pending = reminders.filter(r => !r.is_sent);
  const sent = reminders.filter(r => r.is_sent);
  const today = new Date().toISOString().split('T')[0];
  const overdue = reminders.filter(r => !r.is_sent && r.reminder_date < today);

  const getWhatsAppMessage = (reminder: Reminder): string => {
    const event = reminder.event;
    const client = event?.client;
    switch (reminder.reminder_type) {
      case '3 Days Before Event':
        return `Hi ${client?.name}, your ${event?.event_name} is in 3 days on ${formatDate(event?.event_date || '')}. Please confirm all arrangements. - MK Brothers Event Decoration`;
      case '1 Day Before Event':
        return `Hi ${client?.name}, your ${event?.event_name} is tomorrow! We'll be there to set up. - MK Brothers Event Decoration`;
      case 'Event Day Morning':
        return `Good morning ${client?.name}! Today is your ${event?.event_name}. Our team is on the way. - MK Brothers Event Decoration`;
      case 'Remaining Payment Reminder':
        return `Hi ${client?.name}, this is a reminder that your remaining payment for ${event?.event_name} is due. Please clear at your earliest convenience. - MK Brothers`;
      case 'Overdue Payment Reminder':
        return `Hi ${client?.name}, your payment for ${event?.event_name} is overdue. Please contact us immediately. - MK Brothers Event Decoration`;
      default:
        return `Hi ${client?.name}, reminder from MK Brothers Event Decoration regarding your ${event?.event_name}.`;
    }
  };

  // Auto-generate reminders for upcoming events
  const autoReminders = events
    .filter(e => e.event_status === 'Upcoming')
    .flatMap(event => {
      const eventDate = new Date(event.event_date);
      const now = new Date();
      const daysUntil = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const suggestions = [];

      if (daysUntil === 3) suggestions.push('3 Days Before Event');
      if (daysUntil === 1) suggestions.push('1 Day Before Event');
      if (daysUntil === 0) suggestions.push('Event Day Morning');
      if (event.remaining_balance > 0) suggestions.push('Remaining Payment Reminder');

      return suggestions.map(type => ({
        id: `auto-${event.id}-${type}`,
        event_id: event.id,
        event,
        reminder_type: type,
        reminder_date: event.event_date,
        is_sent: false,
        created_at: new Date().toISOString(),
        isAuto: true,
      }));
    });

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Bell className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="text-sm text-gray-500 dark:text-gray-400">Total</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{reminders.length}</p>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <span className="text-sm text-orange-700 dark:text-orange-400">Pending</span>
          </div>
          <p className="text-2xl font-bold text-orange-800 dark:text-orange-300">{pending.length}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <span className="text-sm text-red-700 dark:text-red-400">Overdue</span>
          </div>
          <p className="text-2xl font-bold text-red-800 dark:text-red-300">{overdue.length}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-sm text-green-700 dark:text-green-400">Sent</span>
          </div>
          <p className="text-2xl font-bold text-green-800 dark:text-green-300">{sent.length}</p>
        </div>
      </div>

      {/* Auto-generated Reminders */}
      {autoReminders.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5">
          <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Auto-Generated Reminders (Today)
          </h3>
          <div className="space-y-2">
            {autoReminders.map(r => (
              <div key={r.id} className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{r.reminder_type}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{r.event?.client?.name} • {r.event?.event_name}</p>
                </div>
                <a
                  href={generateWhatsAppLink(r.event?.client?.mobile || '', getWhatsAppMessage(r as Reminder))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Send WhatsApp
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['all', 'pending', 'sent'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              filter === f
                ? 'bg-purple-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {f} {f === 'pending' ? `(${pending.length})` : f === 'sent' ? `(${sent.length})` : `(${reminders.length})`}
          </button>
        ))}
      </div>

      {/* Reminders List */}
      <div className="space-y-3">
        {filtered.map(reminder => (
          <div key={reminder.id} className={`bg-white dark:bg-gray-800 rounded-xl border ${reminder.is_sent ? 'border-gray-200 dark:border-gray-700 opacity-60' : 'border-gray-200 dark:border-gray-700'} p-5`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${reminder.is_sent ? 'bg-green-100 dark:bg-green-900/30' : 'bg-orange-100 dark:bg-orange-900/30'}`}>
                  {reminder.is_sent
                    ? <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    : <Bell className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  }
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={reminderTypeColors[reminder.reminder_type] || 'bg-gray-100 text-gray-800'}>
                      {reminder.reminder_type}
                    </Badge>
                    {!reminder.is_sent && reminder.reminder_date < today && (
                      <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Overdue</Badge>
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {reminder.event?.client?.name} — {reminder.event?.event_name}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(reminder.reminder_date)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {reminder.event?.client?.mobile}
                    </span>
                  </div>
                </div>
              </div>

              {!reminder.is_sent && (
                <a
                  href={generateWhatsAppLink(reminder.event?.client?.mobile || '', getWhatsAppMessage(reminder))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors flex-shrink-0"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </a>
              )}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No reminders found</p>
          </div>
        )}
      </div>
    </div>
  );
}
