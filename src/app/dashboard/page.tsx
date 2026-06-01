'use client';

import { useApp } from '@/lib/store';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { MiniCalendar } from '@/components/dashboard/MiniCalendar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar, CheckCircle, Clock, CreditCard, Package, Sparkles,
  MapPin, Phone, MessageCircle, ArrowRight, AlertCircle,
} from 'lucide-react';
import { formatDate, formatTime, formatCurrency, getEventStatusColor, getPaymentStatusColor, generateWhatsAppLink } from '@/lib/utils';
import Link from 'next/link';
import { format } from 'date-fns';

export default function DashboardPage() {
  const { events, reminders, payments } = useApp();

  const today = format(new Date(), 'yyyy-MM-dd');
  const currentMonth = format(new Date(), 'yyyy-MM');

  const todaysEvents = events.filter(e => e.event_date === today);
  const upcomingEvents = events.filter(e => e.event_status === 'Upcoming' && e.event_date > today);
  const completedEvents = events.filter(e => e.event_status === 'Completed');
  const pendingPayments = events.filter(e => e.payment_status !== 'Paid' && e.event_status !== 'Cancelled');
  const thisMonthEvents = events.filter(e => e.event_date.startsWith(currentMonth));
  const pickupPending = events.filter(e => e.event_status === 'Completed' && e.payment_status !== 'Paid');

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = events.reduce((sum, e) => sum + e.remaining_balance, 0);

  const activeReminders = reminders.filter(r => !r.is_sent).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatsCard
          title="Events This Month"
          value={thisMonthEvents.length}
          icon={Calendar}
          color="purple"
          subtitle="Total bookings"
        />
        <StatsCard
          title="Today's Events"
          value={todaysEvents.length}
          icon={Clock}
          color="blue"
          subtitle={format(new Date(), 'dd MMM')}
        />
        <StatsCard
          title="Upcoming"
          value={upcomingEvents.length}
          icon={Sparkles}
          color="yellow"
          subtitle="Scheduled events"
        />
        <StatsCard
          title="Pending Payments"
          value={pendingPayments.length}
          icon={CreditCard}
          color="red"
          subtitle={formatCurrency(pendingAmount)}
        />
        <StatsCard
          title="Completed"
          value={completedEvents.length}
          icon={CheckCircle}
          color="green"
          subtitle="This month"
        />
        <StatsCard
          title="Pickup Pending"
          value={pickupPending.length}
          icon={Package}
          color="orange"
          subtitle="Items to collect"
        />
      </div>

      {/* Revenue Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-200 text-sm font-medium">Total Revenue Collected</p>
            <p className="text-4xl font-bold mt-1">{formatCurrency(totalRevenue)}</p>
            <p className="text-purple-200 text-sm mt-1">Pending: {formatCurrency(pendingAmount)}</p>
          </div>
          <div className="text-right">
            <p className="text-purple-200 text-sm">Total Events</p>
            <p className="text-3xl font-bold">{events.length}</p>
            <Link href="/reports" className="text-purple-200 text-sm hover:text-white flex items-center gap-1 justify-end mt-1">
              View Reports <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Events */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Today's Events</h2>
            <Link href="/events" className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {todaysEvents.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No events scheduled for today</p>
            </div>
          ) : (
            todaysEvents.map(event => (
              <div key={event.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{event.event_name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{event.client?.name}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getEventStatusColor(event.event_status)}>{event.event_status}</Badge>
                    <Badge className={getPaymentStatusColor(event.payment_status)}>{event.payment_status}</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    {formatTime(event.event_time)}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{event.event_venue}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Phone className="w-4 h-4" />
                    {event.client?.mobile}
                  </div>
                  <div className="flex items-center gap-2 font-medium text-red-600 dark:text-red-400">
                    <CreditCard className="w-4 h-4" />
                    {formatCurrency(event.remaining_balance)} due
                  </div>
                </div>
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <a
                    href={generateWhatsAppLink(event.client?.mobile || '', `Hi ${event.client?.name}, your ${event.event_name} is scheduled today at ${formatTime(event.event_time)}. - MK Brothers Event Decoration`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    WhatsApp
                  </a>
                  {event.client?.google_map_link && (
                    <a
                      href={event.client.google_map_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-600 transition-colors"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      Map
                    </a>
                  )}
                  <Link
                    href={`/events/${event.id}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg text-xs font-medium hover:bg-purple-200 transition-colors ml-auto"
                  >
                    View Details <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))
          )}

          {/* Upcoming Events */}
          <div className="flex items-center justify-between mt-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Upcoming Events</h2>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {upcomingEvents.slice(0, 5).map((event, idx) => (
              <div key={event.id} className={`flex items-center justify-between p-4 ${idx !== 0 ? 'border-t border-gray-100 dark:border-gray-700' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{event.event_name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{event.client?.name} • {formatDate(event.event_date)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={getPaymentStatusColor(event.payment_status)}>{event.payment_status}</Badge>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatCurrency(event.total_price)}</p>
                </div>
              </div>
            ))}
            {upcomingEvents.length === 0 && (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">No upcoming events</div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <MiniCalendar />

          {/* Reminders */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Active Reminders</h3>
              <Link href="/reminders" className="text-xs text-purple-600 hover:text-purple-700">View All</Link>
            </div>
            {activeReminders.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No pending reminders</p>
            ) : (
              <div className="space-y-3">
                {activeReminders.map(reminder => (
                  <div key={reminder.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-900 dark:text-white">{reminder.reminder_type}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{reminder.event?.client?.name} • {formatDate(reminder.reminder_date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link href="/events?new=true">
                <Button className="w-full justify-start gap-2 mb-2">
                  <Sparkles className="w-4 h-4" />
                  Create New Event
                </Button>
              </Link>
              <Link href="/payments">
                <Button variant="outline" className="w-full justify-start gap-2 mb-2">
                  <CreditCard className="w-4 h-4" />
                  Record Payment
                </Button>
              </Link>
              <Link href="/inventory">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Package className="w-4 h-4" />
                  Manage Inventory
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
