'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { EventForm } from '@/components/events/EventForm';
import { Event } from '@/lib/types';
import {
  Plus, Search, Eye, Edit, Trash2, MessageCircle,
  MapPin, Phone, Calendar, Clock, CreditCard,
} from 'lucide-react';
import { formatDate, formatTime, formatCurrency, getEventStatusColor, getPaymentStatusColor, generateWhatsAppLink } from '@/lib/utils';
import Link from 'next/link';

function EventsContent() {
  const { events, deleteEvent } = useApp();
  const searchParams = useSearchParams();
  const [showForm, setShowForm] = useState(false);
  const [editEvent, setEditEvent] = useState<Event | undefined>();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    if (searchParams.get('new') === 'true') setShowForm(true);
  }, [searchParams]);

  const filtered = events.filter(e => {
    const matchSearch = !search ||
      e.client?.name.toLowerCase().includes(search.toLowerCase()) ||
      e.event_name.toLowerCase().includes(search.toLowerCase()) ||
      e.event_venue.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || e.event_status === statusFilter;
    const matchPayment = !paymentFilter || e.payment_status === paymentFilter;
    const matchType = !typeFilter || e.event_name === typeFilter;
    return matchSearch && matchStatus && matchPayment && matchType;
  });

  const handleDelete = (id: string) => {
    deleteEvent(id);
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{filtered.length} events found</p>
        </div>
        <Button onClick={() => { setEditEvent(undefined); setShowForm(true); }} className="gap-2">
          <Plus className="w-4 h-4" />
          New Event
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Search events, clients..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'Upcoming', label: 'Upcoming' },
              { value: 'In Progress', label: 'In Progress' },
              { value: 'Completed', label: 'Completed' },
              { value: 'Cancelled', label: 'Cancelled' },
            ]}
          />
          <Select
            value={paymentFilter}
            onChange={e => setPaymentFilter(e.target.value)}
            options={[
              { value: '', label: 'All Payments' },
              { value: 'Paid', label: 'Paid' },
              { value: 'Partial Paid', label: 'Partial Paid' },
              { value: 'Pending', label: 'Pending' },
            ]}
          />
          <Select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            options={[
              { value: '', label: 'All Types' },
              { value: 'Baby Shower', label: 'Baby Shower' },
              { value: 'Birthday Decoration', label: 'Birthday Decoration' },
              { value: 'Welcome Baby', label: 'Welcome Baby' },
              { value: 'Mandap Muhurat', label: 'Mandap Muhurat' },
              { value: 'Wedding Decoration', label: 'Wedding Decoration' },
              { value: 'Shrimant Sanskar', label: 'Shrimant Sanskar' },
              { value: 'Custom Event', label: 'Custom Event' },
            ]}
          />
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map(event => (
          <div key={event.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{event.event_name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{event.client?.name}</p>
              </div>
              <div className="flex flex-col gap-1 items-end">
                <Badge className={getEventStatusColor(event.event_status)}>{event.event_status}</Badge>
                <Badge className={getPaymentStatusColor(event.payment_status)}>{event.payment_status}</Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm mb-4">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{formatDate(event.event_date)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{formatTime(event.event_time)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 col-span-2">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{event.event_venue}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{event.client?.mobile}</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(event.total_price)}</span>
              </div>
            </div>

            {event.remaining_balance > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2 mb-3">
                <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                  Balance Due: {formatCurrency(event.remaining_balance)}
                </p>
              </div>
            )}

            <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
              <a
                href={generateWhatsAppLink(event.client?.mobile || '', `Hi ${event.client?.name}, reminder for your ${event.event_name} on ${formatDate(event.event_date)}. - MK Brothers`)}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 transition-colors"
                title="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              {event.client?.google_map_link && (
                <a
                  href={event.client.google_map_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 transition-colors"
                  title="Map"
                >
                  <MapPin className="w-4 h-4" />
                </a>
              )}
              <div className="ml-auto flex gap-2">
                <Link href={`/events/${event.id}`}>
                  <button className="p-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" title="View">
                    <Eye className="w-4 h-4" />
                  </button>
                </Link>
                <button
                  onClick={() => { setEditEvent(event); setShowForm(true); }}
                  className="p-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-200 transition-colors"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirm(event.id)}
                  className="p-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">No events found</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Try adjusting your filters or create a new event</p>
          <Button onClick={() => setShowForm(true)} className="mt-4 gap-2">
            <Plus className="w-4 h-4" /> Create Event
          </Button>
        </div>
      )}

      {/* Event Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditEvent(undefined); }}
        title={editEvent ? 'Edit Event' : 'Create New Event'}
        size="xl"
      >
        <EventForm
          event={editEvent}
          onClose={() => { setShowForm(false); setEditEvent(undefined); }}
          onSave={() => { setShowForm(false); setEditEvent(undefined); }}
        />
      </Modal>

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Event?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">This action cannot be undone.</p>
            <div className="flex gap-3">
              <Button variant="destructive" onClick={() => handleDelete(deleteConfirm)} className="flex-1">Delete</Button>
              <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="flex-1">Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EventsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" /></div>}>
      <EventsContent />
    </Suspense>
  );
}
