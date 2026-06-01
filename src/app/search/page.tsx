'use client';

import { useState } from 'react';
import { useApp } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { Search, Calendar, CreditCard, MapPin, Phone, Clock } from 'lucide-react';
import { formatDate, formatTime, formatCurrency, getEventStatusColor, getPaymentStatusColor } from '@/lib/utils';
import Link from 'next/link';

export default function SearchPage() {
  const { events } = useApp();
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [eventType, setEventType] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [eventStatus, setEventStatus] = useState('');

  const filtered = events.filter(e => {
    const matchSearch = !search ||
      e.client?.name.toLowerCase().includes(search.toLowerCase()) ||
      e.event_name.toLowerCase().includes(search.toLowerCase()) ||
      e.event_venue.toLowerCase().includes(search.toLowerCase()) ||
      e.client?.mobile.includes(search);
    const matchDateFrom = !dateFrom || e.event_date >= dateFrom;
    const matchDateTo = !dateTo || e.event_date <= dateTo;
    const matchType = !eventType || e.event_name === eventType;
    const matchPayment = !paymentStatus || e.payment_status === paymentStatus;
    const matchStatus = !eventStatus || e.event_status === eventStatus;
    return matchSearch && matchDateFrom && matchDateTo && matchType && matchPayment && matchStatus;
  });

  const clearFilters = () => {
    setSearch('');
    setDateFrom('');
    setDateTo('');
    setEventType('');
    setPaymentStatus('');
    setEventStatus('');
  };

  const hasFilters = search || dateFrom || dateTo || eventType || paymentStatus || eventStatus;

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-base focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white dark:focus:bg-gray-600 transition-colors"
            placeholder="Search by client name, event type, venue, mobile..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">From Date</label>
            <input
              type="date"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">To Date</label>
            <input
              type="date"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
            />
          </div>
          <Select
            value={eventType}
            onChange={e => setEventType(e.target.value)}
            options={[
              { value: '', label: 'All Event Types' },
              { value: 'Baby Shower', label: 'Baby Shower' },
              { value: 'Birthday Decoration', label: 'Birthday Decoration' },
              { value: 'Welcome Baby', label: 'Welcome Baby' },
              { value: 'Mandap Muhurat', label: 'Mandap Muhurat' },
              { value: 'Wedding Decoration', label: 'Wedding Decoration' },
              { value: 'Shrimant Sanskar', label: 'Shrimant Sanskar' },
              { value: 'Custom Event', label: 'Custom Event' },
            ]}
          />
          <Select
            value={paymentStatus}
            onChange={e => setPaymentStatus(e.target.value)}
            options={[
              { value: '', label: 'All Payment Status' },
              { value: 'Paid', label: 'Paid' },
              { value: 'Partial Paid', label: 'Partial Paid' },
              { value: 'Pending', label: 'Pending' },
            ]}
          />
          <Select
            value={eventStatus}
            onChange={e => setEventStatus(e.target.value)}
            options={[
              { value: '', label: 'All Event Status' },
              { value: 'Upcoming', label: 'Upcoming' },
              { value: 'In Progress', label: 'In Progress' },
              { value: 'Completed', label: 'Completed' },
              { value: 'Cancelled', label: 'Cancelled' },
            ]}
          />
        </div>

        {hasFilters && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold text-gray-900 dark:text-white">{filtered.length}</span> results found
            </p>
            <button onClick={clearFilters} className="text-sm text-purple-600 hover:text-purple-700 font-medium">
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      {!hasFilters && (
        <div className="text-center py-16">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">Start searching</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Use the search bar and filters above to find events</p>
        </div>
      )}

      {hasFilters && filtered.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">No results found</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Try different search terms or filters</p>
        </div>
      )}

      {hasFilters && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map(event => (
            <Link key={event.id} href={`/events/${event.id}`}>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md hover:border-purple-300 dark:hover:border-purple-700 transition-all cursor-pointer">
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(event.event_date)}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Clock className="w-3.5 h-3.5" />
                    {formatTime(event.event_time)}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="truncate">{event.event_venue}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Phone className="w-3.5 h-3.5" />
                    {event.client?.mobile}
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Total: <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(event.total_price)}</span></span>
                  {event.remaining_balance > 0 && (
                    <span className="text-sm text-red-600 dark:text-red-400 font-medium">Due: {formatCurrency(event.remaining_balance)}</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
