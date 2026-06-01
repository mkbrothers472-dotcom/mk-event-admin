'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useApp } from '@/lib/store';
import { Event, Client, EventType, EventStatus, PaymentMethod, PaymentStatus } from '@/lib/types';
import { MapPin, Phone, User, Calendar, Clock, DollarSign, Save, X } from 'lucide-react';

interface EventFormProps {
  event?: Event;
  onClose: () => void;
  onSave: () => void;
}

const eventTypes: EventType[] = [
  'Baby Shower', 'Birthday Decoration', 'Welcome Baby',
  'Mandap Muhurat', 'Wedding Decoration', 'Shrimant Sanskar', 'Custom Event',
];

export function EventForm({ event, onClose, onSave }: EventFormProps) {
  const { clients, addEvent, updateEvent, addClient } = useApp();

  const [clientMode, setClientMode] = useState<'existing' | 'new'>(event ? 'existing' : 'new');
  const [selectedClientId, setSelectedClientId] = useState(event?.client_id || '');

  const [clientData, setClientData] = useState({
    name: event?.client?.name || '',
    mobile: event?.client?.mobile || '',
    alternate_mobile: event?.client?.alternate_mobile || '',
    address: event?.client?.address || '',
    google_map_link: event?.client?.google_map_link || '',
  });

  const [formData, setFormData] = useState({
    event_name: event?.event_name || 'Baby Shower' as EventType,
    custom_event_name: event?.custom_event_name || '',
    event_venue: event?.event_venue || '',
    event_date: event?.event_date || '',
    event_time: event?.event_time || '',
    event_status: event?.event_status || 'Upcoming' as EventStatus,
    total_price: event?.total_price?.toString() || '',
    advance_received: event?.advance_received?.toString() || '',
    payment_method: event?.payment_method || 'Cash' as PaymentMethod,
    payment_status: event?.payment_status || 'Pending' as PaymentStatus,
    notes: event?.notes || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (clientMode === 'new') {
      if (!clientData.name.trim()) errs.name = 'Client name is required';
      if (!clientData.mobile.trim()) errs.mobile = 'Mobile number is required';
      if (!/^\d{10}$/.test(clientData.mobile)) errs.mobile = 'Enter valid 10-digit mobile';
      if (!clientData.address.trim()) errs.address = 'Address is required';
    } else {
      if (!selectedClientId) errs.client = 'Please select a client';
    }
    if (!formData.event_venue.trim()) errs.event_venue = 'Venue is required';
    if (!formData.event_date) errs.event_date = 'Event date is required';
    if (!formData.event_time) errs.event_time = 'Event time is required';
    if (!formData.total_price || isNaN(Number(formData.total_price))) errs.total_price = 'Valid price required';
    if (formData.event_name === 'Custom Event' && !formData.custom_event_name.trim()) {
      errs.custom_event_name = 'Custom event name is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    let clientId = selectedClientId;
    let clientObj: Client | undefined;

    if (clientMode === 'new') {
      const newClient: Client = {
        id: Date.now().toString(),
        name: clientData.name,
        mobile: clientData.mobile,
        alternate_mobile: clientData.alternate_mobile || undefined,
        address: clientData.address,
        google_map_link: clientData.google_map_link || undefined,
        created_at: new Date().toISOString(),
      };
      addClient(newClient);
      clientId = newClient.id;
      clientObj = newClient;
    } else {
      clientObj = clients.find(c => c.id === selectedClientId);
    }

    const total = Number(formData.total_price);
    const advance = Number(formData.advance_received) || 0;

    const eventObj: Event = {
      id: event?.id || Date.now().toString(),
      client_id: clientId,
      client: clientObj,
      event_name: formData.event_name,
      custom_event_name: formData.custom_event_name || undefined,
      event_venue: formData.event_venue,
      event_date: formData.event_date,
      event_time: formData.event_time,
      event_status: formData.event_status,
      total_price: total,
      advance_received: advance,
      remaining_balance: total - advance,
      payment_method: formData.payment_method,
      payment_status: formData.payment_status,
      notes: formData.notes || undefined,
      created_at: event?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (event) {
      updateEvent(eventObj);
    } else {
      addEvent(eventObj);
    }
    onSave();
  };

  return (
    <div className="space-y-6">
      {/* Client Section */}
      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <User className="w-4 h-4 text-purple-600" />
          Client Details
        </h3>

        {!event && (
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setClientMode('new')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${clientMode === 'new' ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            >
              New Client
            </button>
            <button
              onClick={() => setClientMode('existing')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${clientMode === 'existing' ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            >
              Existing Client
            </button>
          </div>
        )}

        {clientMode === 'existing' ? (
          <Select
            label="Select Client"
            value={selectedClientId}
            onChange={e => setSelectedClientId(e.target.value)}
            options={[
              { value: '', label: '-- Select Client --' },
              ...clients.map(c => ({ value: c.id, label: `${c.name} (${c.mobile})` })),
            ]}
            error={errors.client}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Client Name *"
              placeholder="Enter client name"
              value={clientData.name}
              onChange={e => setClientData(p => ({ ...p, name: e.target.value }))}
              error={errors.name}
            />
            <Input
              label="Mobile Number *"
              placeholder="10-digit mobile"
              value={clientData.mobile}
              onChange={e => setClientData(p => ({ ...p, mobile: e.target.value }))}
              error={errors.mobile}
            />
            <Input
              label="Alternate Number"
              placeholder="Alternate mobile"
              value={clientData.alternate_mobile}
              onChange={e => setClientData(p => ({ ...p, alternate_mobile: e.target.value }))}
            />
            <Input
              label="Address *"
              placeholder="Full address"
              value={clientData.address}
              onChange={e => setClientData(p => ({ ...p, address: e.target.value }))}
              error={errors.address}
            />
            <div className="md:col-span-2">
              <Input
                label="Google Map Link"
                placeholder="https://maps.google.com/..."
                value={clientData.google_map_link}
                onChange={e => setClientData(p => ({ ...p, google_map_link: e.target.value }))}
              />
            </div>
          </div>
        )}
      </div>

      {/* Event Details */}
      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-purple-600" />
          Event Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Event Type *"
            value={formData.event_name}
            onChange={e => setFormData(p => ({ ...p, event_name: e.target.value as EventType }))}
            options={eventTypes.map(t => ({ value: t, label: t }))}
          />
          {formData.event_name === 'Custom Event' && (
            <Input
              label="Custom Event Name *"
              placeholder="Enter event name"
              value={formData.custom_event_name}
              onChange={e => setFormData(p => ({ ...p, custom_event_name: e.target.value }))}
              error={errors.custom_event_name}
            />
          )}
          <Input
            label="Event Venue *"
            placeholder="Venue name and address"
            value={formData.event_venue}
            onChange={e => setFormData(p => ({ ...p, event_venue: e.target.value }))}
            error={errors.event_venue}
          />
          <Input
            label="Event Date *"
            type="date"
            value={formData.event_date}
            onChange={e => setFormData(p => ({ ...p, event_date: e.target.value }))}
            error={errors.event_date}
          />
          <Input
            label="Event Time *"
            type="time"
            value={formData.event_time}
            onChange={e => setFormData(p => ({ ...p, event_time: e.target.value }))}
            error={errors.event_time}
          />
          <Select
            label="Event Status"
            value={formData.event_status}
            onChange={e => setFormData(p => ({ ...p, event_status: e.target.value as EventStatus }))}
            options={[
              { value: 'Upcoming', label: 'Upcoming' },
              { value: 'In Progress', label: 'In Progress' },
              { value: 'Completed', label: 'Completed' },
              { value: 'Cancelled', label: 'Cancelled' },
            ]}
          />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
          <textarea
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            rows={3}
            placeholder="Additional notes about the event..."
            value={formData.notes}
            onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
          />
        </div>
      </div>

      {/* Financial Details */}
      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-purple-600" />
          Financial Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Total Price (₹) *"
            type="number"
            placeholder="0"
            value={formData.total_price}
            onChange={e => setFormData(p => ({ ...p, total_price: e.target.value }))}
            error={errors.total_price}
          />
          <Input
            label="Advance Received (₹)"
            type="number"
            placeholder="0"
            value={formData.advance_received}
            onChange={e => setFormData(p => ({ ...p, advance_received: e.target.value }))}
          />
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">Remaining Balance</p>
            <p className="text-xl font-bold text-red-600 dark:text-red-400">
              ₹{Math.max(0, (Number(formData.total_price) || 0) - (Number(formData.advance_received) || 0)).toLocaleString('en-IN')}
            </p>
          </div>
          <Select
            label="Payment Method"
            value={formData.payment_method}
            onChange={e => setFormData(p => ({ ...p, payment_method: e.target.value as PaymentMethod }))}
            options={[
              { value: 'Cash', label: 'Cash' },
              { value: 'UPI', label: 'UPI' },
              { value: 'Bank Transfer', label: 'Bank Transfer' },
              { value: 'Cheque', label: 'Cheque' },
            ]}
          />
          <Select
            label="Payment Status"
            value={formData.payment_status}
            onChange={e => setFormData(p => ({ ...p, payment_status: e.target.value as PaymentStatus }))}
            options={[
              { value: 'Paid', label: 'Paid' },
              { value: 'Partial Paid', label: 'Partial Paid' },
              { value: 'Pending', label: 'Pending' },
            ]}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
        <Button onClick={handleSubmit} className="flex-1 gap-2">
          <Save className="w-4 h-4" />
          {event ? 'Update Event' : 'Create Event'}
        </Button>
        <Button variant="outline" onClick={onClose} className="gap-2">
          <X className="w-4 h-4" />
          Cancel
        </Button>
      </div>
    </div>
  );
}
