'use client';

import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { EventForm } from '@/components/events/EventForm';
import { useState } from 'react';
import {
  ArrowLeft, Edit, MapPin, Phone, Calendar, Clock, CreditCard,
  MessageCircle, User, Package, CheckCircle, AlertCircle,
} from 'lucide-react';
import { formatDate, formatTime, formatCurrency, getEventStatusColor, getPaymentStatusColor, generateWhatsAppLink } from '@/lib/utils';
import Link from 'next/link';

export default function EventDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { events, eventInventory, payments } = useApp();
  const [showEdit, setShowEdit] = useState(false);

  const event = events.find(e => e.id === id);
  if (!event) return (
    <div className="text-center py-20">
      <p className="text-gray-500 dark:text-gray-400">Event not found</p>
      <Link href="/events"><Button className="mt-4">Back to Events</Button></Link>
    </div>
  );

  const eventPayments = payments.filter(p => p.event_id === event.id);
  const eventItems = eventInventory.filter(i => i.event_id === event.id);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back + Actions */}
      <div className="flex items-center justify-between">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </button>
        <div className="flex gap-2">
          <a
            href={generateWhatsAppLink(event.client?.mobile || '', `Hi ${event.client?.name}, your ${event.event_name} is on ${formatDate(event.event_date)} at ${formatTime(event.event_time)}. Venue: ${event.event_venue}. - MK Brothers Event Decoration`)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </a>
          <Button onClick={() => setShowEdit(true)} className="gap-2">
            <Edit className="w-4 h-4" />
            Edit Event
          </Button>
        </div>
      </div>

      {/* Event Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{event.event_name}</h1>
            {event.custom_event_name && <p className="text-purple-200">{event.custom_event_name}</p>}
            <p className="text-purple-200 mt-1">{event.client?.name}</p>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <Badge className={`${getEventStatusColor(event.event_status)} border-0`}>{event.event_status}</Badge>
            <Badge className={`${getPaymentStatusColor(event.payment_status)} border-0`}>{event.payment_status}</Badge>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div>
            <p className="text-purple-200 text-xs">Date</p>
            <p className="font-semibold">{formatDate(event.event_date)}</p>
          </div>
          <div>
            <p className="text-purple-200 text-xs">Time</p>
            <p className="font-semibold">{formatTime(event.event_time)}</p>
          </div>
          <div>
            <p className="text-purple-200 text-xs">Total Price</p>
            <p className="font-semibold">{formatCurrency(event.total_price)}</p>
          </div>
          <div>
            <p className="text-purple-200 text-xs">Balance Due</p>
            <p className="font-semibold text-yellow-300">{formatCurrency(event.remaining_balance)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Client Details */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-purple-600" />
            Client Details
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Name</p>
              <p className="font-medium text-gray-900 dark:text-white">{event.client?.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <a href={`tel:${event.client?.mobile}`} className="text-purple-600 hover:underline">{event.client?.mobile}</a>
            </div>
            {event.client?.alternate_mobile && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <a href={`tel:${event.client.alternate_mobile}`} className="text-purple-600 hover:underline">{event.client.alternate_mobile}</a>
              </div>
            )}
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
              <p className="text-sm text-gray-700 dark:text-gray-300">{event.client?.address}</p>
            </div>
            {event.client?.google_map_link && (
              <a
                href={event.client.google_map_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
              >
                <MapPin className="w-4 h-4" />
                Open in Google Maps
              </a>
            )}
          </div>
        </div>

        {/* Payment Details */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-purple-600" />
            Payment Details
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Total Price</span>
              <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(event.total_price)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Advance Received</span>
              <span className="font-semibold text-green-600">{formatCurrency(event.advance_received)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-100 dark:border-gray-700 pt-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Remaining Balance</span>
              <span className="font-bold text-red-600">{formatCurrency(event.remaining_balance)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Payment Method</span>
              <span className="text-sm text-gray-900 dark:text-white">{event.payment_method}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Payment Status</span>
              <Badge className={getPaymentStatusColor(event.payment_status)}>{event.payment_status}</Badge>
            </div>
          </div>

          {/* Payment History */}
          {eventPayments.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Payment History</p>
              {eventPayments.map(p => (
                <div key={p.id} className="flex justify-between text-sm py-1">
                  <span className="text-gray-600 dark:text-gray-400">{formatDate(p.payment_date)} • {p.payment_method}</span>
                  <span className="font-medium text-green-600">+{formatCurrency(p.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Venue */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-purple-600" />
            Event Venue
          </h2>
          <p className="text-gray-700 dark:text-gray-300">{event.event_venue}</p>
          {event.notes && (
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Notes</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{event.notes}</p>
            </div>
          )}
        </div>

        {/* Inventory */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Package className="w-4 h-4 text-purple-600" />
            Assigned Inventory
          </h2>
          {eventItems.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No inventory assigned</p>
          ) : (
            <div className="space-y-2">
              {eventItems.map(item => (
                <div key={item.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{item.inventory_item?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Qty: {item.quantity_used}</p>
                  </div>
                  <Badge className={
                    item.pickup_status === 'Fully Picked'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : item.pickup_status === 'Partially Picked'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  }>
                    {item.pickup_status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Edit Event" size="xl">
        <EventForm event={event} onClose={() => setShowEdit(false)} onSave={() => setShowEdit(false)} />
      </Modal>
    </div>
  );
}
